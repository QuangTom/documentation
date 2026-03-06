
---

## 1. Tầm nhìn: Ai Orchestration mở rộng qua các Sub Agent

Ai Orchestration là trung tâm điều phối, đảm nhiệm các vai trò chung:

| Vai trò | Mô tả                                                 | Ví dụ trong ứng dụng |
|--------|-------------------------------------------------------|------------------------|
| **Điều hướng** | Gợi ý hoặc thực hiện chuyển màn hình / luồng sử dụng  | "Mở màn hình tạo sự cố", "Đi tới chi tiết sự cố #123", "Vào Dashboard" |
| **Thống kê dữ liệu** | Tổng hợp, phân tích số liệu từ hệ thống               | Thống kê theo trạng thái/đơn vị/thời gian; báo cáo nhanh theo câu hỏi tự nhiên |
| **Đưa ra nhận xét** | Phân tích và đưa ra nhận xét, gợi ý                   | Nhận xét xu hướng, gợi ý ưu tiên xử lý, cảnh báo bất thường |
| **Thực hiện hành vi** | Trong Dịch vụ công: tạo sự cố, tiếp nhận, xử lý vv... |
 

**Mở rộng bằng Sub Agent:** Thay vì một AI "ôm" toàn bộ, **Ai Orchestration** nhận request từ app, xác định sub-agent (dashboard, dịch vụ công, …) rồi **chuyển tiếp** sang đúng **Sub Agent** tương ứng. Mỗi sub agent có thể:

- Có **phạm vi rõ ràng** (ví dụ chỉ Dashboard, hoặc chỉ Dịch vụ công / Public Services).
- Có **bộ Tool riêng** (get_dashboard_stats, get_alarm_list, create_alarm, …) và prompt tối ưu cho miền đó.
- Có thể **mở rộng thêm** mà không phá Ai Orchestration: thêm sub agent mới (ví dụ AI Thông báo, AI Bản đồ) bằng cách đăng ký với Ai Orchestration.

**Ví dụ Sub Agent:**

| Sub Agent | Miền chức năng | Ví dụ khả năng |
|----------------|----------------|----------------|
| **AI Dashboard** | Trang tổng quan, báo cáo, menu | Thống kê nhanh, nhận xét xu hướng dashboard, gợi ý màn hình cần mở |
| **AI Dịch vụ công (Public Services)** | Sự cố, chỉ đạo, xử lý | Điều hướng list/detail/tạo sự cố; thống kê sự cố; tạo/cập nhật/gán xử lý sự cố; nhận xét ưu tiên |
| *(mở rộng sau)* | AI Thông báo, AI Bản đồ, … | Theo nhu cầu từng miền |

---

## 2. Kiến trúc: Mobile → Backend → Ai Orchestration → Sub agent → Tool (Hierarchical multi-agent)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MOBILE (Flutter)                                                       │
│  - Gửi: user message / intent / context (screen, user id, ...)            │
│  - Nhận: structured response (action, payload, text, data)               │
│  - Map action → route hoặc cập nhật UI theo response                     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND                                                                │
│  - Endpoint chat: nhận request → gọi sang AI Orchestration (internal)   │
│  - Nhận response từ AI Orchestration → trả về Mobile (cùng contract)    │
│  - Không chứa logic routing / LLM / agent                                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ Internal (HTTP / gRPC)
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  AI ORCHESTRATION SERVICE                                                    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ LangGraph Runtime                                                       │ │
│  │ - Orchestration graph (Router → Agent → Tool → Analysis → Final)        │ │
│  │ - State machine, multi-step workflow, tool-calling loop                 │ │
│  │ - Điều phối sub-agent (Dashboard, Dịch vụ công, …)                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│  ┌────────────────────────────────┴──────────────────────────────────────┐ │
│  │ Checkpointer (Redis / DB)                                               │ │
│  │ - Persist state theo session_id                                         │ │
│  │ - Resume long-running flow, giữ context khi user quay lại               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ LangSmith (Observability)                                               │ │
│  │ - Trace graph execution, token usage, tool calls, error node            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ AI Dashboard    │    │ AI Dịch vụ công  │    │ Sub Agent  │
│ (chuyên biệt)   │    │ (Public Services)│    │ khác (mở rộng)  │
│ - Tool: stats,  │    │ - Tool: alarm_*, │    │ - Tool riêng    │
│   menu, report  │    │   assign_*, ...  │    │   theo miền     │
└────────┬────────┘    └────────┬─────────┘    └────────┬────────┘
         │                      │                       │
         └──────────────────────┼───────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  TOOL LAYER – thin adapter gọi use case/API (Backend hoặc service chung) │
│  - Dashboard: get_dashboard_stats, get_menu, ...                          │
│  - Dịch vụ công: get_alarm_list, create_alarm, assign_process, ...        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Luồng điển hình:**

1. User nhập/yêu cầu: "Cho tôi thống kê sự cố tháng này theo đơn vị."
2. Mobile gửi lên **Backend** (kèm context: user_id, token, có thể screen hiện tại).
3. Backend gọi **Ai Orchestration** (internal); Ai Orchestration phân loại → thuộc miền **Dịch vụ công** → chuyển sang **AI Dịch vụ công**.
4. AI Dịch vụ công gọi Tool `get_statistics` với tham số (month, groupBy: agency); Tool gọi use case/API (ở Backend hoặc service chung), trả dữ liệu.
5. AI Dịch vụ công tổng hợp text + bảng/số liệu, có thể thêm nhận xét; Ai Orchestration đóng gói response thống nhất → trả về **Backend**.
6. **Backend** trả về mobile: `{ type: "statistics", data: {...}, summary: "..." }`.
7. Mobile hiển thị và có thể không đổi màn hình hoặc mở màn hình báo cáo tùy thiết kế.

**Luồng "thực hiện hành vi":**

1. User: "Tạo sự cố mới ưu tiên cao tại đơn vị X."
2. Mobile gửi intent + context lên **Backend**.
3. Backend gọi **Ai Orchestration** → Ai Orchestration chuyển sang AI Dịch vụ công; AI Dịch vụ công gọi Tool `create_alarm` (priority: high, agency: X, …); Tool gọi use case/API tạo sự cố (ở Backend hoặc service chung).
4. Ai Orchestration trả response về Backend; **Backend** trả kết quả về mobile: thành công / lỗi + message.
5. Mobile nhận và có thể điều hướng tới chi tiết sự cố vừa tạo (route trong payload hoặc mobile map từ payload).

---

[//]: # ()
[//]: # (## 3. Kiến trúc sau khi mở rộng &#40;AI Orchestration Service&#41;)

[//]: # ()
[//]: # (Khi triển khai đầy đủ, **AI Orchestration** là một service chứa nhiều lớp bên trong: LangGraph runtime, RAG, Skill Registry, cơ chế mở rộng capability và observability.)

[//]: # ()
[//]: # (```)

[//]: # (┌─────────────────────────────────────────────────────────────────────────┐)

[//]: # (│  MOBILE &#40;Flutter&#41;                                                       │)

[//]: # (└────────────────────────────────┬────────────────────────────────────────┘)

[//]: # (                                 │)

[//]: # (                                 ▼)

[//]: # (┌─────────────────────────────────────────────────────────────────────────┐)

[//]: # (│  BACKEND                                                                │)

[//]: # (│  - API gateway, auth, nghiệp vụ                                         │)

[//]: # (│  - Endpoint chat → gọi AI Orchestration                                 │)

[//]: # (└────────────────────────────────┬────────────────────────────────────────┘)

[//]: # (                                 │ Internal)

[//]: # (                                 ▼)

[//]: # (┌──────────────────────────────────────────────────────────────────────────────┐)

[//]: # (│  AI ORCHESTRATION SERVICE                                                     │)

[//]: # (│                                                                              │)

[//]: # (│  ┌────────────────────────────────────────────────────────────────────────┐  │)

[//]: # (│  │ LangGraph Runtime                                                      │  │)

[//]: # (│  │ - Orchestration graph                                                  │  │)

[//]: # (│  │ - State machine                                                        │  │)

[//]: # (│  │ - Multi-step workflow                                                  │  │)

[//]: # (│  │ - Tool calling loop                                                    │  │)

[//]: # (│  │ - Clarification loop                                                   │  │)

[//]: # (│  │ - Routing node                                                         │  │)

[//]: # (│  │                                                                        │  │)

[//]: # (│  │ + Checkpointer &#40;Redis / DB&#41;                                            │  │)

[//]: # (│  │   - Persist state per session                                          │  │)

[//]: # (│  │   - Resume long-running flow                                           │  │)

[//]: # (│  └────────────────────────────────────────────────────────────────────────┘  │)

[//]: # (│                                                                              │)

[//]: # (│  + RAG Engine                                                                │  │)

[//]: # (│    - Embedding model                                                         │  │)

[//]: # (│    - Vector DB                                                               │  │)

[//]: # (│    - Retriever                                                               │  │)

[//]: # (│    - Context injection                                                       │  │)

[//]: # (│                                                                              │)

[//]: # (│  + Agent Skill Registry                                                      │  │)

[//]: # (│    - Dashboard skills                                                        │  │)

[//]: # (│    - Public Service skills                                                   │  │)

[//]: # (│    - Reporting skills                                                        │  │)

[//]: # (│                                                                              │)

[//]: # (│  + Extend Agent Capability Layer                                             │  │)

[//]: # (│    - Plugin mechanism                                                        │  │)

[//]: # (│    - Dynamic tool loading                                                    │  │)

[//]: # (│                                                                              │)

[//]: # (│  + LangSmith &#40;Observability&#41;                                                 │  │)

[//]: # (│    - Trace graph execution                                                   │  │)

[//]: # (│    - Token usage                                                             │  │)

[//]: # (│    - Tool calls                                                              │  │)

[//]: # (│    - Error node                                                              │  │)

[//]: # (│                                                                              │)

[//]: # (└────────────────────────────────┬─────────────────────────────────────────────┘)

[//]: # (                                 │)

[//]: # (                                 ▼)

[//]: # (┌──────────────────────────────────────────────────────────────────────────┐)

[//]: # (│ TOOL LAYER &#40;Thin adapters gọi API Backend / Service nội bộ&#41;              │)

[//]: # (└──────────────────────────────────────────────────────────────────────────┘)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 4. Vai trò từng thành phần trong AI Orchestration)

[//]: # ()
[//]: # (### 4.1. LangGraph = Runtime orchestration engine)

[//]: # ()
[//]: # (- Nằm trong **AI Orchestration Service**.)

[//]: # (- **Chức năng:** Định nghĩa và chạy graph: **Router Node** → **Agent Node** → **Tool Node** → **Clarification Node** &#40;nếu cần&#41; → **Final Response Node**. Quản lý state xuyên suốt multi-turn, điều phối sub-agent.)

[//]: # (- **Tóm lại:** LangGraph = bộ não điều phối workflow &#40;state machine, multi-step, tool-calling loop, clarification loop&#41;.)

[//]: # ()
[//]: # (### 4.2. Checkpointer = Persistence cho LangGraph)

[//]: # ()
[//]: # (- Gắn vào runtime: `graph.compile&#40;checkpointer=RedisCheckpointer&#40;&#41;&#41;`.)

[//]: # (- **Chức năng:** Lưu state theo `session_id`; resume khi mobile reconnect; giữ context khi user quay lại.)

[//]: # (- Trong GovApp &#40;chat là entry point, multi-turn, có thể ngắt giữa chừng&#41; → **gần như bắt buộc**.)

[//]: # ()
[//]: # (### 4.3. RAG Engine)

[//]: # ()
[//]: # (- **Không** đặt ở Backend; đặt **trong AI Orchestration** vì:)

[//]: # (  - Agent quyết định có retrieve hay không.)

[//]: # (  - Agent quyết định top-k / reformulate query.)

[//]: # (  - Flow: User → Intent → nếu câu hỏi knowledge → RAG retrieve → inject context → LLM.)

[//]: # (- **Áp dụng cho:** Văn bản pháp luật, quy định nội bộ, FAQ ngành.)

[//]: # ()
[//]: # (### 4.4. Agent Skill Registry)

[//]: # ()
[//]: # (- **Skill** = tập hợp capability logic cụ thể cho một miền, có thể gồm nhiều tool + orchestration logic.)

[//]: # (- **Ví dụ:**)

[//]: # (  - **Public Service Agent Skills:** create_alarm, assign_process, get_alarm_list, summarize_case.)

[//]: # (  - **Dashboard Agent Skills:** get_dashboard_stats, explain_stat_trend, generate_summary_report.)

[//]: # (- **Skill ≠ Tool trực tiếp:** Skill = orchestration logic + kết hợp tool &#40;có thể nhiều bước / điều kiện&#41;.)

[//]: # ()
[//]: # (### 4.5. Extend Agent Capability Layer)

[//]: # ()
[//]: # (- Cơ chế **mở rộng tương lai** &#40;thêm AI tài chính, AI pháp chế, chatbot nội bộ, …&#41;.)

[//]: # (- Thiết kế theo pattern:)

[//]: # (  - **AgentCapability** gồm: `name`, `skill_set`, `tool_set`, `rag_index` &#40;tùy chọn&#41;, `graph_subflow`.)

[//]: # (  - Khi thêm capability mới: **không sửa core orchestration**, chỉ **đăng ký capability** mới &#40;plugin mechanism, dynamic tool loading&#41;.)

[//]: # ()
[//]: # (### 4.6. LangSmith &#40;Observability & Evaluation&#41;)

[//]: # ()
[//]: # (- **Không** tham gia runtime logic.)

[//]: # (- **Dùng để:** Trace execution graph; xem state từng node; xem tool call; so sánh prompt version; token tracking; regression testing.)

[//]: # (- **Quan trọng khi:** Orchestration phức tạp, multi-agent, RAG tuning.)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 5. Luồng đầy đủ có các thành phần mới)

[//]: # ()
[//]: # (```)

[//]: # (Mobile)

[//]: # (  ↓)

[//]: # (Backend)

[//]: # (  ↓)

[//]: # (AI Orchestration)

[//]: # (  ↓)

[//]: # (LangGraph runtime)

[//]: # (  ↓)

[//]: # (Checkpointer load state &#40;theo session_id&#41;)

[//]: # (  ↓)

[//]: # (Router node)

[//]: # (  ↓)

[//]: # (Agent node)

[//]: # (  ↓)

[//]: # ([Nếu câu hỏi knowledge] → RAG retrieve → inject context)

[//]: # (  ↓)

[//]: # (Tool call)

[//]: # (  ↓)

[//]: # (Skill execution)

[//]: # (  ↓)

[//]: # (Finalize response)

[//]: # (  ↓)

[//]: # (Persist state &#40;Checkpointer&#41;)

[//]: # (  ↓)

[//]: # (Send response → Backend → Mobile)

[//]: # (```)

[//]: # ()
[//]: # (**Song song:** LangSmith nhận trace từ LangGraph &#40;mỗi run&#41; để quan sát execution, token, lỗi.)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 6. Cấu trúc AI Orchestration Service &#40;production-grade&#41;)

[//]: # ()
[//]: # (Chia **AI Orchestration Service** thành các lớp rõ ràng:)

[//]: # ()
[//]: # (| Lớp | Nội dung |)

[//]: # (|-----|----------|)

[//]: # (| **Graph Layer &#40;LangGraph&#41;** | Định nghĩa và chạy graph: router, agent, tool, clarification, finalize. Không chứa business logic. |)

[//]: # (| **Skill Layer** | Domain orchestration logic: kết hợp tool, điều kiện, multi-step theo nghiệp vụ &#40;Dashboard, Public Service, …&#41;. |)

[//]: # (| **Tool Adapter Layer** | Thin adapter gọi API Backend / service nội bộ. Không biết LLM, không chứa nghiệp vụ. |)

[//]: # (| **RAG Layer** | Embedding, Vector DB, Retriever, context injection. Agent quyết định khi nào gọi. |)

[//]: # (| **Capability Registry** | Đăng ký capability &#40;skill_set, tool_set, graph_subflow&#41;. Mở rộng bằng cách đăng ký mới. |)

[//]: # (| **Checkpointer** | Persist state theo session &#40;Redis/DB&#41;; resume, context khi user quay lại. |)

[//]: # (| **Observability &#40;LangSmith&#41;** | Trace, token, tool calls, error node; evaluation, regression. |)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 7. Nguyên tắc clean architecture)

[//]: # ()
[//]: # (| Thành phần | Nguyên tắc |)

[//]: # (|------------|------------|)

[//]: # (| **Backend** | Không biết gì về LLM. Chỉ expose endpoint chat, gọi AI Orchestration &#40;internal&#41;, trả response theo contract. |)

[//]: # (| **Tool layer** | Không biết gì về LLM. Chỉ nhận input chuẩn, gọi use case/API, trả output. |)

[//]: # (| **LangGraph** | Không chứa business logic. Chỉ điều phối node, state, edge; logic nghiệp vụ nằm ở Skill / use case. |)

[//]: # (| **Skill layer** | Mới là nơi chứa **domain orchestration logic** &#40;kết hợp tool, điều kiện theo nghiệp vụ&#41;. |)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 8. Mức độ trưởng thành hệ thống)

[//]: # ()
[//]: # (| Level | Có gì |)

[//]: # (|-------|--------|)

[//]: # (| **Basic** | LLM + Tool |)

[//]: # (| **Intermediate** | + LangGraph |)

[//]: # (| **Production** | + Checkpointer + RAG |)

[//]: # (| **Mature** | + Skill system + Capability registry |)

[//]: # (| **Enterprise** | + LangSmith + Evaluation + Drift detection |)

[//]: # ()
[//]: # (Hệ thống GovApp đang hướng tới **level 3–4** &#40;Production → Mature&#41;.)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 9. Khuyến nghị tối ưu cho GovApp)

[//]: # ()
[//]: # (| Thành phần | Khuyến nghị |)

[//]: # (|------------|-------------|)

[//]: # (| **LangGraph** | Bắt buộc &#40;orchestration, multi-step, tool loop, clarification&#41;. |)

[//]: # (| **Checkpointer** | Redis &#40;latency, TTL, phù hợp session&#41;. |)

[//]: # (| **RAG** | Chỉ cho knowledge &#40;văn bản pháp luật, quy định, FAQ&#41;; không RAG cho toàn bộ chat. |)

[//]: # (| **Skill registry** | Có &#40;tách Skill theo miền: Dashboard, Public Service, Reporting&#41;. |)

[//]: # (| **LangSmith** | Dev + Staging &#40;trace, so sánh prompt, token&#41;; Production tùy chính sách &#40;có thể tắt hoặc sampling&#41;. |)

[//]: # (| **Extend capability** | Thiết kế ngay từ đầu &#40;AgentCapability pattern, plugin mechanism&#41; để thêm agent mới không sửa core. |)

[//]: # ()
[//]: # (---)

## 3. Gợi ý triển khai từng bước

1. **Định nghĩa contract Mobile–BE**
   - API: endpoint nhận message/context, trả structured response (action type, payload, text, data).
   - Chuẩn hóa action (navigate, show_statistics, show_insight, action_done, error).

2. **Xây Ai Orchestration (service riêng biệt với Backend)**
   - Ai Orchestration là service độc lập: nhận request từ Backend (internal) → phân loại intent / miền (dashboard, dịch vụ công, …) — có thể dùng LLM nhẹ hoặc rule/keyword.
   - Đăng ký danh sách **Sub Agent** (Dashboard, Dịch vụ công, …); mỗi khi thêm miền mới thì thêm một Sub Agent và đăng ký với Ai Orchestration, không sửa logic core.

3. **Xây từng Sub Agent + Tool layer**
   - Mỗi Sub Agent: LLM + bộ Tool (function-calling) riêng cho miền đó; system prompt mô tả phạm vi và Tool.
   - Ví dụ AI Dịch vụ công: Tool create_alarm, update_alarm, assign_process, get_alarm_list, get_statistics, …
   - Tool = thin adapter gọi use case/API hiện có (có thể nằm ở Backend hoặc service chung); Ai Orchestration/Agent gọi Tool qua network nếu Tool chạy trên Backend.

4. **Mobile: feature Chat AI + map action**
   - Feature chat gọi API BE, nhận response thống nhất.
   - Map `action` + `payload` → GoRouter (điều hướng) hoặc cập nhật UI (thống kê, nhận xét); nếu BE báo "đã thực hiện" thì refresh hoặc navigate theo payload. Cấu hình initial route = Chat nếu mở app vào thẳng chat.

---

## 4. Tóm tắt

| Nội dung | Kết luận |
|----------|----------|
| **Tầm nhìn** | Ai Orchestration làm trung tâm, mở rộng qua các Sub Agent (Dashboard, Dịch vụ công, …). |
| **Kiến trúc** | **Mobile → Backend → Ai Orchestration → Sub Agent → Tool**. Backend và Ai Orchestration hoạt động riêng biệt (service tách). Không tích hợp AI trực tiếp trên mobile. |
| **Ai Orchestration** | Điều phối: phân loại intent/miền, chuyển tiếp sang đúng Sub Agent, trả response thống nhất. |
| **Sub Agent** | Mỗi AI gắn một miền cụ thể (Dashboard, Dịch vụ công, …), có bộ Tool và prompt riêng; thêm miền = thêm Sub Agent, không phá Ai Orchestration. |
| **Mobile** | Gửi message/context, nhận response có cấu trúc; map action → route hoặc UI. **Mở app vào Chat:** thêm feature Chat AI + initial route = Chat, không cần thay kiến trúc. |
| **Triển khai** | Contract API → Ai Orchestration (router) → từng Sub Agent + Tool layer → Client mobile + map action. |
| **Mở rộng (AI Orchestration Service)** | LangGraph (runtime), Checkpointer (Redis), RAG (knowledge), Skill Registry, Extend Capability, LangSmith (observability). |
| **Mức trưởng thành** | Hướng tới Production–Mature (level 3–4): + Checkpointer + RAG; + Skill + Capability registry. |

Tài liệu này có thể dùng làm cơ sở để thiết kế API BE, AI Orchestration Service (LangGraph, RAG, Skill, Checkpointer), danh sách Sub Agent và Tool, cùng cập nhật app (feature chat/assistant, màn hình thống kê/nhận xét do AI trả về, mở app vào thẳng Chat AI).
