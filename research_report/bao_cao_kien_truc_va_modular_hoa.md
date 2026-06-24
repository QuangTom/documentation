
---

## 1. Hiện trạng vấn đề (có dẫn chứng)

### 1.1. Rò rỉ tầng: Core phụ thuộc App / Features

**Vấn đề:** Layer `core` đang import trực tiếp `ioc_app` (app, features, injection_container), vi phạm nguyên tắc core độc lập.

**Dẫn chứng:**

| File trong core | Import ra ngoài | Trích dẫn |
|-----------------|-----------------|-----------|
| `core/network/network_request.dart` | `injection_container`, `SigninBloc`, `main.dart`, `features/common` | `import 'package:ioc_app/injection_container.dart';`; `import '../../features/authentication/signin/.../signin_bloc.dart';`; `import '../../main.dart';`; dùng `navKey.currentContext` và `context.goNamed(RouterSigninEnum.ROUTER_SIGNIN.name)` khi xử lý 401 |
| `core/network/api_url.dart` | `injection_container` | `import 'package:ioc_app/injection_container.dart';` |
| `core/functions/trans.dart` | App l10n | `import 'package:ioc_app/app_localizations.dart';` |

**Kết luận:** Không thể chuyển nguyên `lib/core` sang `packages/core` vì core đang phụ thuộc app và hầu hết features (router import từng page; network dùng SigninBloc và navigator từ main).

---

### 1.2. Rò rỉ tầng: Domain phụ thuộc Data

**Vấn đề:** Use case trong domain đôi khi phụ thuộc repository định nghĩa ở **data** thay vì interface ở **domain**, khiến domain không độc lập với data.

**Dẫn chứng:**

- `lib/features/public_services/domain/usercases/alarm_get_detail_usecase.dart`:
  - `import 'package:ioc_app/features/public_services/data/repositories/alarm_repository.dart';`
- Một số feature đặt repository interface trong `domain/repository` (profile_management, signin, employees), một số đặt trong `data/repositories` (task_handling_management, messaging, public_services) → **không thống nhất**, và khi use case import từ data thì domain phụ thuộc data.

---

### 1.3. injection_container phình to, khó quản lý

**Vấn đề:** Một file DI duy nhất vừa đăng ký core, common, vừa gọi ~20+ `dependencyInjections*` của từng feature → khó bảo trì khi thêm feature mới.

**Dẫn chứng:**

- `lib/injection_container.dart`: **118 dòng**; import **24+ dependency_injection_* / feature** (app_access_history, signin, community_camera, dashboard, digital_map, directive_process, employees, firebase, home, log_history, notification, profile_management, public_services, task_handling_management, _map, document_management, feedback, hotline, media_information, messaging, profile, common).
- Nội dung: đăng ký core (NetworkRequest, NetworkInfo, InputConverter, CancelToken), common (UserProvider, ThemeProvider, FontSizeProvider, LowcoderProvider, DownloadService), external (PackageInfo, SharedPreferences, http.Client, InternetConnectionChecker, FlutterLocalNotificationsPlugin), rồi lần lượt gọi từng `dependencyInjections*` → mọi thay đổi DI đều đụng vào một file.

---

### 1.4. main.dart gán quá nhiều trách nhiệm (god file)

**Vấn đề:** `main.dart` vừa bootstrap (init DI, Prefs, notification), vừa khai báo global key (navKey, messKey, homeGlobalKey), vừa chứa MyApp với cấu hình theme/localization/router và logic lifecycle (LowcoderService, Mapbox, config app) → dễ trở thành điểm nghẽn khi mở rộng.

**Dẫn chứng:**

- `lib/main.dart`:
  - Global: `navKey`, `messKey`, `homeGlobalKey`, `logError`, `myInterceptor`, `firebaseMessagingBackgroundHandler`.
  - `main()`: WidgetsBinding, BackButtonInterceptor, `di.init()`, `_requestNotificationPermission()`, PrefsService, PrefsSecureService, Bloc.observer, runApp.
  - `MyApp`: static flags (enableHintText, showDialogUpdate, mochaAuthenticated, requireUpdateVersion), `setLocale`, `mochaSdkFlt`, LowcoderService, MapboxOptions, handleConfigApp, precacheImage, PrefsService language, BackButtonInterceptor, FlutterNewBadger; `didChangeAppLifecycleState` (start/stop LowcoderService); `changeLanguage`; `build` với SystemChrome, MainProvider, LayoutBuilder, OrientationBuilder, MaterialApp.router (locale, theme, localizationsDelegates, localeResolutionCallback, navKey, routerConfig, scaffoldMessengerKey, trans(APP_NAME)).

---

### 1.5. Common phình to và phụ thuộc App / Features

**Vấn đề:** `lib/features/common` vừa lớn (~284 file .dart) vừa import `injection_container`, `main.dart` và một số feature khác → không tách được thành package shared_ui nếu không refactor.

**Dẫn chứng:**

- **Common → injection_container:** có ít nhất 8 file, ví dụ: `main_provider.dart`, `location_picker_vtmaps_page*.dart`, `upload_multi_file_bloc.dart`, `image_uint8.dart`, `rocketchat_service.dart`, `user_provider.dart`, `generate_zip_file_for_download_bloc.dart`.
- **Common → main.dart:** nhiều widget/dialog dùng navigatorKey hoặc context global (map_utils, confirm_dialog, input_validate_custom_widget, input_multiple_line_widget, check_permission, date_range_picker_input_widget, language_widget, input_validate_widget, date_picker_input_widget) theo đánh giá trong [danh_gia_chuyen_core_va_common_sang_packages.md](./danh_gia_chuyen_core_va_common_sang_packages.md).
- **Common → feature khác:** document_management (upload_multi_file_repository), community_camera, digital_map, _map, public_services (custom_tab_indicator).

## 2. Các mục tiêu

1. **Tách lớp rõ ràng:** Core không phụ thuộc app/features; domain không phụ thuộc data/presentation; common/shared_ui không phụ thuộc feature cụ thể hay app.
2. **Modular hóa nội bộ:** Chuyển `lib/core` → `packages/core`, `lib/features/common` → `packages/shared_ui`, từng feature → `packages/feature_*` trong app root, để dễ bảo trì và tái sử dụng.
3. **DI và bootstrap gọn:** injection_container chỉ đăng ký và gọi `registerFeatureX(GetIt)`; main.dart chỉ bootstrap (init, runApp), router và cấu hình app tách ra app.dart / app_router.
4. **Chuẩn hóa:** Repository interface trong domain; UseCase chỉ phụ thuộc interface; sửa usercases → usecases; thống nhất model/entity và Result/Either nếu áp dụng.

---

## 3. Lợi ích của việc chuyển từ kiến trúc hiện tại sang modular monolith

Chuyển từ cấu trúc mono-repo “phẳng” (toàn bộ code trong một `lib/`) sang **modular monolith** (một app + các package nội bộ `packages/core`, `packages/shared_ui`, `packages/feature_*`) mang lại các lợi ích sau:

### 3.1. Ranh giới rõ ràng, giảm phụ thuộc chéo

- **Hiện tại:** Core/common import app và features → thay đổi một feature dễ vỡ build ở core/common, khó biết ảnh hưởng đến đâu.
- **Sau khi modular:** Mỗi package có `pubspec.yaml` và dependency tường minh. Core không depend on app/features; feature chỉ depend on core/shared_ui. Thay đổi trong một package chỉ ảnh hưởng package đó và các package phụ thuộc nó → **dễ kiểm soát và review**.

### 3.2. Bảo trì và mở rộng dễ hơn

- **Thêm feature mới:** Chỉ cần tạo `packages/feature_*`, đăng ký `registerFeatureX(GetIt)` trong injection_container, thêm route trong app_router; không phải đụng vào core/common hay sửa nhiều file rải rác.
- **Sửa lỗi / refactor:** Phạm vi thay đổi bị giới hạn trong từng package; test và build từng package (nếu cần) giúp phát hiện lỗi sớm.
- **Onboarding:** Dev mới dễ nắm vì cấu trúc theo package (core / shared_ui / feature_*), thay vì đi lạc trong một `lib/` rất lớn.

### 3.3. Tái sử dụng và đồng bộ nhiều app (nếu sau này cần)

- **Core** và **shared_ui** là các package độc lập; nếu sau này có thêm app thứ hai (ví dụ app nội bộ, app white-label), có thể thêm vào cùng repo và cùng depend on `packages/core`, `packages/shared_ui` mà không copy-paste code.
- Không cần chuyển sang microservice hay nhiều repo; **một codebase, một app chính, packages nội bộ** vẫn đủ cho hầu hết trường hợp mobile.

### 3.4. Hỗ trợ AI viết chức năng mới nhanh hơn

- Khi dùng AI (Copilot, Cursor, ChatGPT, …) để viết **một chức năng mới dựa trên chức năng có sẵn**, kiến trúc modular giúp AI và developer làm việc nhanh hơn:
  - **Phạm vi rõ:** Chỉ cần mở/trích dẫn đúng package feature gốc (ví dụ `packages/feature_messaging`) làm mẫu → prompt gọn, ít nhiễu từ code feature khác.
  - **Copy & adapt dễ:** Cấu trúc feature thống nhất (data/domain/presentation/di) → AI dễ sinh feature mới theo đúng pattern, chỉ thay tên domain và API.
  - **Ít conflict:** Feature mới nằm package riêng → ít đụng file chung, merge và review nhanh hơn so với cùng một `lib/features/` khổng lồ.

### 3.7. Tóm tắt lợi ích

| Lợi ích | Mô tả ngắn |
|---------|------------|
| Ranh giới rõ | Phụ thuộc tường minh qua pubspec; ít import chéo, dễ review. |
| Bảo trì / mở rộng | Thêm feature = thêm package + đăng ký DI/router; sửa lỗi giới hạn phạm vi. |
| Tái sử dụng | Core và shared_ui dùng chung cho nhiều app trong cùng repo (nếu cần). |
| Hỗ trợ AI | Viết chức năng mới dựa trên feature có sẵn nhanh hơn: phạm vi rõ, copy/adapt dễ, ít conflict. |

---

## 4. Nhiệm vụ cần nâng cấp

### 4.1. Nhiệm vụ liên quan Core/ Common / Domain / Data
- **Tách phụ thuộc app trong các thành phần**  


[//]: # (- **Tách router khỏi core:** Di chuyển toàn bộ cấu hình GoRouter + route builder từ `core/utils/router` sang app &#40;ví dụ `lib/app_router.dart`&#41;. Core không còn import bất kỳ page/feature nào.)

[//]: # (- **Tách phụ thuộc app trong core:**  )

[//]: # (  - **trans/l10n:** Định nghĩa interface &#40;ví dụ `LocaleStrings`: `String? translate&#40;String key&#41;`&#41;, app implement bằng AppLocalizations và inject vào core; refactor `trans&#40;&#41;` dùng interface/callback.  )

[//]: # (  - **network:** Định nghĩa `AuthFailureHandler` &#40;hoặc tương đương&#41;; app implement &#40;gọi SigninBloc, navigator&#41;; inject vào `NetworkRequestImpl`; xóa import signin, main, injection_container khỏi core/network.  )

[//]: # (  - **DI:** Core không gọi GetIt; app đăng ký implementation &#40;NetworkRequest, ApiUrl, handle_color, ...&#41; từ bên ngoài.)

[//]: # (- **Kiểm tra:** Trong `lib/core` không còn `import ... ioc_app/...` &#40;trừ callback do app inject&#41; và không import `features/...`.)

[//]: # ()
[//]: # (### 4.2. Nhiệm vụ liên quan Domain / Data)

[//]: # ()
[//]: # (- Đưa **repository interface** về `domain/` cho mọi feature; UseCase chỉ phụ thuộc interface domain; data layer implement interface đó.)

[//]: # (- Chuẩn hóa **model/response:** domain dùng entity thuần &#40;và Result/Either nếu áp dụng&#41;; data map từ API response sang entity.)

[//]: # ()
[//]: # (### 4.3. Nhiệm vụ liên quan Common / Shared UI)

[//]: # ()
[//]: # (- **Giảm phụ thuộc app:** Thay mọi `injection_container` trong common bằng dependency inject qua constructor/callback; thay dùng main &#40;navigatorKey, context global&#41; bằng callback/interface do app cung cấp.)

[//]: # (- **Tách phụ thuộc feature:** Đưa repository interface dùng chung &#40;ví dụ upload_multi_file&#41; vào core hoặc shared_ui; implementation ở feature; common chỉ import interface. Widget chỉ dùng entity từ feature thì cân nhắc đưa entity base vào core/shared_ui hoặc tách widget sang feature.)

### 4.2. Nhiệm vụ liên quan DI và App

- **Chuẩn hóa DI theo module:** Mỗi package/feature có hàm `registerFeatureX(GetIt it)`; `injection_container.dart` ở app root chỉ gọi các register, không chứa logic đăng ký chi tiết từng feature.
- **Tách main.dart:** Giữ main() gọn (binding, init DI, Prefs, notification, Bloc.observer, runApp). Đưa MaterialApp/router, theme, localization, global keys (nếu vẫn cần) sang `app.dart` / `app_router.dart`.
---

## 5. Giải pháp và Đề xuất

### 5.1. Giải pháp cho Core (để có thể tách package)

1. **Router:** Tạo `lib/app_router.dart` (hoặc tương đương), di chuyển toàn bộ `core/utils/router` (bao gồm module router import page) sang app. Cập nhật import từ core/router sang app_router. Sau bước này core không import feature/page.
2. **L10n:** Tạo interface `LocaleStrings` (ví dụ `String? translate(String key)`); app implement bằng AppLocalizations và set callback/zone toàn cục hoặc inject vào từng chỗ cần; refactor `trans()` gọi qua interface/callback.
3. **Network auth:** Tạo interface `AuthFailureHandler` (ví dụ `void onAuthFailure(BuildContext? context)`); app implement (logout, navigate to signin); inject vào `NetworkRequestImpl`; xóa import signin, main, injection_container khỏi network_request và api_url.
4. **Core không gọi GetIt:** Mọi chỗ trong core dùng singleton (handle_color, api_url, ...) nhận dependency qua constructor hoặc setter do app inject; app là nơi duy nhất gọi GetIt và đăng ký.

### 5.2. Giải pháp cho Common (để có thể tách package shared_ui)

1. **DI:** Không import `injection_container` trong shared_ui; nhận UserProvider, ThemeProvider, DownloadService, ... qua constructor hoặc callback do app inject.
2. **Navigator/context:** Thay global key từ main bằng interface/callback (ví dụ “navigate to login”, “show dialog”) do app cung cấp khi khởi tạo widget/service.
3. **Feature cụ thể:** Repository interface dùng chung đưa vào core hoặc shared_ui; implementation ở feature; shared_ui chỉ depend on interface. Entity dùng chung có thể đưa vào core/entity hoặc shared_ui tùy mức độ dùng chung.

### 5.3. Giải pháp cho Domain / Data

1. **Repository interface:** Luôn đặt trong `domain/repository` (hoặc `domain/repositories`); UseCase chỉ import từ domain.
2. **Data layer:** Chỉ implement interface và map response API → entity; không export type thay thế entity cho domain.
3. **Chuẩn hóa:** Dùng entity thuần trong domain; nếu dùng Result/Either thì thống nhất trong toàn bộ domain layer.

### 5.4. Đề xuất lộ trình thực hiện (modular hóa)

- **Phase 1 – Chuẩn bị core (trong lib):** Tách router lên app; tách trans, network auth, DI ra khỏi core; kiểm tra core không còn import app/features.
- **Phase 2 – Tách package core:** Tạo `packages/core`, chuyển toàn bộ `lib/core` sang `packages/core/lib`; app thêm dependency `core: path: packages/core`; đổi import; xóa `lib/core`.
- **Phase 3 – Chuẩn bị common (trong lib):** Giảm phụ thuộc injection_container và main; tách phụ thuộc feature (interface chung lên core/shared_ui).
- **Phase 4 – Tách package shared_ui:** Tạo `packages/shared_ui`, dependency `core`; chuyển `lib/features/common` (đã refactor) sang `packages/shared_ui/lib`; app thêm dependency; đổi import; xóa `lib/features/common`.
- **Phase 5 – Chuẩn hóa DI theo module:** Mỗi package có `registerFeatureX(GetIt it)`; injection_container chỉ gọi các register.
- **Phase 6 – Tách từng feature (tùy chọn):** Theo mẫu feature mẫu, tạo `packages/feature_*` và migrate dần; dọn dẹp import chéo.

### 5.5. Cấu trúc đề xuất

- Packages nằm **trong app root** 
- App root: `lib/main.dart`, `app.dart`, `app_router.dart`, `injection_container.dart`.
- `packages/core`, `packages/shared_ui`, `packages/feature_*` với pubspec dependency `path: packages/...`.

#### Cấu trúc thư mục đề xuất

```
appname/
│
├── pubspec.yaml
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── app_router.dart
│   └── injection_container.dart
│
├── packages/
│   ├── core/
│   │   ├── pubspec.yaml
│   │   └── lib/
│   │       └── core.dart
│   │
│   ├── shared_ui/
│   │   ├── pubspec.yaml
│   │   └── lib/
│   │
│   ├── feature_auth/
│   │   ├── pubspec.yaml
│   │   └── lib/
│   │
│   └── feature_messaging/
│       ├── pubspec.yaml
│       └── lib/
│
└── analysis_options.yaml
```

#### Phụ thuộc trong `pubspec.yaml` của app

```yaml
dependencies:
  core:
    path: packages/core
  shared_ui:
    path: packages/shared_ui
  feature_auth:
    path: packages/feature_auth
  feature_messaging:
    path: packages/feature_messaging
```

## 6. Tóm tắt

| Hạng mục | Hiện trạng (dẫn chứng) | Mục tiêu | Nhiệm vụ nâng cấp | Giải pháp/Đề xuất |
|----------|------------------------|----------|--------------------|--------------------|
| Core | Import app/features (router, network, trans, handle_color, exceptions, …) | Core độc lập, có thể tách package | Tách router, trans, network auth, DI ra khỏi core | Router lên app; L10n/Network qua interface; Core không gọi GetIt |
| Domain/Data | UseCase import repo từ data; repo interface đặt không thống nhất | Domain chỉ phụ thuộc interface domain | Interface repo trong domain; UseCase chỉ dùng interface | Chuẩn hóa domain/repository; data chỉ implement |
| injection_container | 1 file, 118 dòng, 24+ feature DI | DI theo module, dễ mở rộng | Mỗi feature/module có register; container chỉ gọi | registerFeatureX(GetIt); container gọi từng register |
| main.dart | Global key, init, MyApp, theme, router, lifecycle, Lowcoder, Mapbox | main chỉ bootstrap | Tách MaterialApp/router/theme ra app.dart; giảm global | app.dart / app_router.dart; callback thay global key ở common |
| Common | ~284 file; import injection_container, main, một số feature | shared_ui có thể tách package | Bỏ DI/main trực tiếp; tách phụ thuộc feature | Inject qua constructor; interface chung lên core/shared_ui |
| Naming | usercases (sai) | usecases, cấu trúc thống nhất | Sửa tên thư mục và import | usecases; quy ước domain/repository |

Tài liệu này dùng làm cơ sở để lên kế hoạch refactor và modular hóa theo từng phase, ưu tiên Phase 1–2 để core có thể tách package trước khi xử lý common và features.
