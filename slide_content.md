Báo cáo tổng quan: Luồng cấu hình Lowcoder → MCP IOC Lookup Dashboard
Dự án: gpt-utils
Phạm vi: admin/ → api/ → ioc-lookup-dashboard-mcp-server/
Ngày khảo sát: 23/06/2026

1. Mục đích
Hệ thống cho phép quản trị viên cấu hình các truy vấn dữ liệu từ ứng dụng Lowcoder, sau đó AI agent có thể tra cứu và thực thi các truy vấn đó thông qua MCP server IOC Lookup Dashboard — phục vụ các câu hỏi dạng dashboard, báo cáo, thống kê.

Ba thành phần đóng vai trò bổ sung cho nhau:

Thành phần	Vai trò
Admin
Giao diện cấu hình cho người vận hành
API
Lưu trữ, kiểm tra và đồng bộ cấu hình
MCP Server
Cung cấp công cụ tra cứu cho AI agent
2. Luồng hoạt động tổng thể
Quy trình vận hành gồm bốn bước chính:

Cấu hình hạ tầng → Mô tả & gán query → Đồng bộ catalog → Agent sử dụng
Bước 1 — Thiết lập hạ tầng
Quản trị viên thiết lập:

Kết nối Lowcoder — nguồn ứng dụng và truy vấn
Cơ sở dữ liệu thực thi — nơi chạy truy vấn SQL
Máy chủ MCP — đăng ký IOC Lookup Dashboard
Liên kết giữa MCP server và kết nối Lowcoder tương ứng
Bước 2 — Cấu hình truy vấn
Với từng ứng dụng Lowcoder, quản trị viên:

Chọn truy vấn cần expose cho AI
Gán mô tả (giúp agent chọn đúng query)
Gán domain (nhóm chủ đề, ví dụ: kinh tế, dân số…)
Gán máy chủ MCP được phép sử dụng
Tuỳ chọn: cấu hình tham số, chạy phân tích AI tự động điền mô tả
Bước 3 — Đồng bộ catalog
Khi lưu cấu hình, hệ thống tự động đồng bộ snapshot catalog sang cơ sở dữ liệu thực thi của kết nối Lowcoder (bảng mirror). Quản trị viên cũng có thể đồng bộ lại thủ công nếu cần.

MCP server không đọc trực tiếp cấu hình admin hay cơ sở dữ liệu nội bộ API — chỉ đọc bảng mirror đã đồng bộ.

Bước 4 — Agent sử dụng
Khi người dùng đặt câu hỏi, orchestrator gọi MCP server theo chuỗi ba bước:

Liệt kê domain — xác định chủ đề phù hợp
Liệt kê query trong domain — chọn truy vấn đúng
Thực thi query — lấy dữ liệu trả lời người dùng
Nếu thiếu tham số, agent sẽ hỏi lại người dùng rồi gọi lại.

3. Sơ đồ tổng quan
┌─────────────┐     REST API      ┌─────────────┐    Đồng bộ mirror    ┌──────────────┐
│    Admin    │ ────────────────► │     API     │ ──────────────────► │  MySQL/PG    │
│  (cấu hình) │                   │ (lưu + sync)│                       │  (catalog)   │
└─────────────┘                   └─────────────┘                       └──────┬───────┘
                                                                               │ đọc
                                                                               ▼
┌─────────────┐    gọi tool MCP   ┌─────────────────────────────────────────────┐
│  AI Agent   │ ◄──────────────── │  IOC Lookup Dashboard MCP Server              │
│ (qua Orch.) │                   │  list_domains → list_queries → execute      │
└─────────────┘                   └─────────────────────────────────────────────┘
4. Trách nhiệm từng tầng
Admin — Lớp giao diện
Quản lý kết nối Lowcoder và máy chủ MCP
Cấu hình truy vấn theo từng ứng dụng (mô tả, domain, gán MCP)
Quản lý allowlist theo góc nhìn MCP server
Nút đồng bộ lại catalog khi cần
Đối tượng sử dụng: Quản trị viên, vận hành hệ thống.

API — Lớp trung tâm
Lưu cấu hình bền vững (định nghĩa query, allowlist, liên kết MCP)
Đọc metadata truy vấn từ MongoDB Lowcoder
Kiểm tra tính hợp lệ trước khi lưu (mô tả, domain, loại query hỗ trợ)
Đồng bộ catalog mirror sang CSDL thực thi
Cung cấp thông tin kết nối runtime cho orchestrator khi gọi MCP
Đối tượng sử dụng: Admin UI, orchestrator, các dịch vụ nội bộ.

IOC Lookup Dashboard MCP Server — Lớc thực thi
Đọc catalog đã mirror
Expose 3 công cụ tra cứu cho AI agent
Thực thi truy vấn SQL hoặc GraphQL
Xử lý tham số, template và transformer Lowcoder
Đối tượng sử dụng: AI agent thông qua orchestrator.

5. Dữ liệu và ranh giới trách nhiệm
Nội dung	Nơi lưu chính	Ai đọc lúc runtime
Cấu hình admin (mô tả, domain, gán MCP)
Cơ sở dữ liệu API
API (ghi), MCP (không đọc)
Định nghĩa query gốc (DSL Lowcoder)
MongoDB Lowcoder
API (khi sync)
Catalog mirror (template + metadata)
MySQL/Postgres của kết nối
MCP server
Nguyên tắc thiết kế: Tách biệt đường ghi (admin → API → mirror) và đường đọc (MCP → mirror). Giúp MCP server độc lập, nhẹ và không phụ thuộc API lúc trả lời câu hỏi.

6. Đánh giá mức hoàn thiện
Hạng mục	Đánh giá
Giao diện cấu hình (Admin)
✅ Đầy đủ
Lưu trữ & kiểm tra cấu hình (API)
✅ Đầy đủ
Đồng bộ catalog tự động & thủ công
✅ Đầy đủ
Công cụ tra cứu cho agent (MCP)
✅ Đầy đủ
Hỗ trợ SQL và GraphQL
✅ Có
Kiểm thử end-to-end tự động
⚠️ Còn hạn chế
Kết luận: Chức năng đã sẵn sàng cho vận hành. Luồng cấu hình → đồng bộ → sử dụng được triển khai xuyên suốt ba module.

7. Lưu ý vận hành
Kết nối Lowcoder phải gán CSDL thực thi — nếu không, đồng bộ mirror sẽ không chạy và MCP không có dữ liệu tra cứu.
Mỗi query gán cho MCP cần có mô tả và domain — đây là điều kiện bắt buộc để agent chọn đúng truy vấn.
Chỉ query được hỗ trợ mới vào mirror — loại truy vấn không tương thích sẽ bị bỏ qua khi đồng bộ, không làm hỏng toàn bộ catalog.
Khi catalog lệch hoặc sau thay đổi lớn — dùng chức năng đồng bộ lại trong admin.
Một MCP server có thể gắn nhiều kết nối Lowcoder — khi thực thi cần chỉ rõ kết nối phù hợp.
8. Quy trình vận hành đề xuất
Thứ tự	Hành động	Người thực hiện
1
Tạo kết nối Lowcoder + CSDL thực thi
Quản trị viên
2
Đăng ký MCP server IOC Lookup Dashboard
Quản trị viên
3
Gán kết nối Lowcoder cho MCP server
Quản trị viên
4
Cấu hình query: mô tả, domain, gán MCP
Quản trị viên
5
Kiểm tra đồng bộ catalog (tự động hoặc resync)
Quản trị viên
6
Thử câu hỏi qua agent / công cụ debug
Vận hành / QA
7
Đưa vào sử dụng production
Vận hành
9. Kết luận
Hệ thống gpt-utils triển khai mô hình cấu hình tập trung tại admin, xử lý tại API, thực thi phân tán tại MCP server. Quản trị viên chỉ cần làm việc trên giao diện admin; AI agent tương tác qua ba công cụ tra cứu chuẩn hoá mà không cần biết chi tiết Lowcoder hay cấu trúc cơ sở dữ liệu.

Kiến trúc này phù hợp cho mở rộng: thêm domain, thêm query, hoặc gắn thêm MCP server mới mà không thay đổi luồng cốt lõi.

