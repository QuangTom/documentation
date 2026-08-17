# Cập nhật yêu cầu phân tích dữ liệu
**Ngày cập nhật:** 14/08/2026

## 1. Điều kiện
### 1.1. Điều kiện so sánh
- Nếu chưa có mục tiêu CT04: Không hiển thị nhận định.

- Nếu tỷ lệ TTCP < bình quân cả nước: Thấp hơn bình quân cả nước.

- Nếu tỷ lệ TTCP > mục tiêu CT04: Đã vượt mục tiêu.

- Nếu tỷ lệ TTCP <= mục tiêu CT04 và mục tiêu CT04 - tỷ lệ TTCP <= 2%: Sắp đạt mục tiêu.

- Các trường hợp còn lại: Chưa đạt mục tiêu.

### 1.2. Query 
- Lấy dữ liệu kế hoạch vốn
SELECT
    t.*,

    -- Kế hoạch vốn (đơn vị: tỷ đồng)
    ROUND(t.khvThuTuong / 1000, 2) AS khvThuTuong,
    ROUND(t.khvUbndTong / 1000, 2) AS khvUbndTong,
    ROUND(t.khvUbndTrongNam / 1000, 2) AS khvUbndTrongNam,
    ROUND(t.khvUbndNamTruocChuyenSang / 1000, 2) AS khvUbndNamTruocChuyenSang,

    -- Giải ngân (đơn vị: tỷ đồng)
    ROUND(t.giaiNganTongCong / 1000, 2) AS giaiNganTongCong,
    ROUND(t.giaiNganThanhToan / 1000, 2) AS giaiNganThanhToan,
    ROUND(t.giaiNganTamUng / 1000, 2) AS giaiNganTamUng,

    -- Tỷ lệ (%)
    ROUND(t.tyLeThuTuong * 100, 2) AS tyLeThuTuong,
    ROUND(t.tyLeUbnd * 100, 2) AS tyLeUbnd

FROM khobac_giangantheonguonvon t
WHERE t.updatetime = '{{getMaxTimeNguonVon.data[0].max_time}}';

- Lấy dữ liệu theo ban quản lý dự án
SELECT
    t.*,

    -- Kế hoạch vốn (đơn vị: tỷ đồng)
    ROUND(t.khvThuTuong / 1000, 2) AS khvThuTuong,
    ROUND(t.khvUbndTong / 1000, 2) AS khvUbndTong,
    ROUND(t.khvUbndTrongNam / 1000, 2) AS khvUbndTrongNam,
    ROUND(t.khvUbndNamTruocChuyenSang / 1000, 2) AS khvUbndNamTruocChuyenSang,

    -- Giải ngân (đơn vị: tỷ đồng)
    ROUND(t.giaiNganTongCong / 1000, 2) AS giaiNganTongCong,
    ROUND(t.giaiNganThanhToan / 1000, 2) AS giaiNganThanhToan,
    ROUND(t.giaiNganTamUng / 1000, 2) AS giaiNganTamUng,

    -- Tỷ lệ (%)
    ROUND(t.tyLeThuTuong * 100, 2) AS tyLeThuTuong,
    ROUND(t.tyLeUbnd * 100, 2) AS tyLeUbnd

FROM khobac_giangantheonguonvon t
WHERE t.updatetime = '{{getMaxTimeNguonVon.data[0].max_time}}';

### 1.3.
- Đối với tỷ lệ giải ngân theo nhóm quản lý dự án:
  + Cần cảnh báo các nhóm có tỷ lệ tăng thấp hơn mức trung bình của nhóm đó từ trước đến nay hoặc bao nhiêu ngày nhưng không thay đổi.
  + 
