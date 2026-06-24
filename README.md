# Documentation — Thủ tục

Kho tài liệu kỹ thuật và nghiệp vụ cho dự án **Thủ tục**, gồm yêu cầu phân tích phản ánh hiện trường (PAHT) tại Đà Nẵng và các báo cáo nghiên cứu kiến trúc hệ thống IOC.

---

## Cấu trúc thư mục

```
documentation/
│
├── dng/                                    # Tài liệu theo địa phương — Đà Nẵng
│   └── paht/                               # Phản ánh hiện trường
│       ├── dieu_kien_pa.md                 # Điều kiện lọc & logic phân tích
│       └── chi_tiet_pa.md                  # Khung trình bày nội dung báo cáo
│
└── research_report/                        # Báo cáo nghiên cứu kiến trúc
    ├── bao_cao_kien_truc_va_modular_hoa.md   # Hiện trạng & đề xuất modular hóa
    └── hierarchical_multi_agent.md             # Kiến trúc AI Orchestration đa tầng
```

---

## dng/paht — Phản ánh hiện trường

Hai tệp trong thư mục này bổ sung cho nhau:

| Tệp | Vai trò | Câu hỏi trả lời |
|-----|---------|-----------------|
| [`dieu_kien_pa.md`](dng/paht/dieu_kien_pa.md) | **Điều kiện nghiệp vụ** | Lấy dữ liệu nào? Theo điều kiện gì? Ngưỡng cảnh báo ra sao? |
| [`chi_tiet_pa.md`](dng/paht/chi_tiet_pa.md) | **Khung trình bày** | Báo cáo viết theo cấu trúc nào? Hiển thị những gì? |

### Các loại phân tích

| # | Nội dung phân tích | `dieu_kien_pa.md` | `chi_tiet_pa.md` |
|---|-------------------|:-----------------:|:----------------:|
| 1 | Vấn đề nổi cộm trong lĩnh vực được phản ánh nhiều nhất | ✓ | ✓ |
| 2 | Phản ánh tồn đọng kéo dài, lặp lại nhiều lần | ✓ | ✓ |
| 3 | Phản ánh trễ hạn nghiêm trọng | ✓ | ✓ |
| 4 | Phản ánh liên quan thủ tục hành chính & đạo đức công vụ | ✓ | — |
| 5 | Đơn vị có số lượng phản ánh tăng bất thường | ✓ | ✓ |
| 6 | Đơn vị có tỷ lệ phản ánh trễ hạn rất cao | ✓ | ✓ |

### Chi tiết từng tệp

#### `dieu_kien_pa.md` — Điều kiện phân tích

- Định nghĩa **mục tiêu**, **phạm vi dữ liệu**, **điều kiện lọc** và **ngưỡng cảnh báo** cho 6 loại phân tích.
- Quy định chung: loại trừ đơn vị TTGTĐT Đà Nẵng, bỏ qua lĩnh vực Ý kiến doanh nghiệp, bảng tối đa 4 cột.
- Hướng dẫn viết **Summary** ngắn gọn (≤ 20 chữ), phong cách báo cáo điều hành.
- Cập nhật lần cuối: **16/06/2026**

#### `chi_tiet_pa.md` — Cấu trúc nội dung báo cáo

- Mỗi phân tích tuân theo khung: **Tổng quan → Vấn đề → Nguyên nhân → Đề xuất hướng xử lý**.
- Mô tả cụ thể nội dung cần hiển thị và mẫu bảng thống kê cho từng loại phân tích.
- Cập nhật lần cuối: **05/06/2026**

---

## research_report — Báo cáo nghiên cứu

Tài liệu kỹ thuật về kiến trúc ứng dụng IOC (Flutter) và hướng tích hợp AI.

| Tệp | Nội dung chính |
|-----|----------------|
| [`bao_cao_kien_truc_va_modular_hoa.md`](research_report/bao_cao_kien_truc_va_modular_hoa.md) | Phân tích hiện trạng kiến trúc: rò rỉ tầng core/domain, DI phình to, `main.dart` gánh quá nhiều trách nhiệm. Đề xuất modular hóa theo feature package. |
| [`hierarchical_multi_agent.md`](research_report/hierarchical_multi_agent.md) | Thiết kế **AI Orchestration** phân tầng: Mobile → Backend → Orchestrator → Sub Agent → Tool. Mô tả vai trò điều hướng, thống kê, nhận xét và thực hiện hành vi theo từng miền (Dashboard, Dịch vụ công, …). |

---

## Quy ước

- Định dạng tài liệu: **Markdown** (`.md`).
- Tên thư mục và tệp dùng **snake_case**, chữ thường.
- Tài liệu nghiệp vụ cần ghi **ngày cập nhật** ở đầu tệp.
- Thêm tài liệu mới theo nhóm chủ đề; nếu chủ đề mới, tạo thư mục con cùng cấp với `dng/` hoặc `research_report/`.
