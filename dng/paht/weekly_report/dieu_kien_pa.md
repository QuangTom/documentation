# Cập nhật yêu cầu phân tích dữ liệu phản ánh hiện trường

**Ngày cập nhật:** 15/07/2026

## 1. Vấn đề nổi cộm chi tiết trong lĩnh vực được phản ánh nhiều nhất

**Mục tiêu:** 

- Xác định các vấn đề cụ thể đang được người dân phản ánh nhiều nhất trong lĩnh vực có số lượng phản ánh cao nhất. 
- Xác định các vấn đề nổi bật trong thời gian ngắn. Chẳng hạn các phản ánh tắc đường do sự kiện Ironman phản ánh liên tục trong vòng 3 ngày

**Ví dụ:**

- Lĩnh vực: Môi trường
- Vấn đề nổi cộm: Đổ rác bừa bãi, tập kết rác sai quy định,...

**Phạm vi dữ liệu:**
Lấy toàn bộ phản ánh **(Trừ phản ánh chưa xử lý)** trong **1 tuần gần nhất**.

**Điều kiện:**

- Mỗi phản ánh chỉ được gán với 1 vấn đề (sub-category tag) duy nhất

---

## 2. Phản ánh tồn đọng kéo dài, lặp lại nhiều lần

**Mục tiêu:** 

- Phát hiện các vụ việc tồn đọng chưa được cơ quan chức năng xử lý triệt để, dẫn đến việc người dân tiếp tục phản ánh nhiều lần về cùng một đối tượng hoặc cùng một vị trí (Lấy thông tin từ nội dung phản ánh).

**Điều kiện:**

- Chỉ lấy các phản ánh **đang xử lý** và phát sinh trong **1 tuần gần nhất**.
- Các phản ánh trước đó **đã được xử lý**.
- Nội dung hoặc nhóm vấn đề đã xuất hiện **từ 4 lần trở lên** kể từ đầu năm đến thời điểm hiện tại, nên lấy theo vị trí phản ánh

**Yêu cầu:**

- Hiển thị **toàn bộ** danh sách các vấn đề chưa được xử lý triệt để.

**Ví dụ:**
Đầu năm, Ông A phản ánh về vấn đề xưởng cưa tạo tiếng ồn => Cơ quan chức năng đã xử lý và đóng phản ánh => Sau đó 1 thời gian, tình hình tiếng ồn lại tiếp diễn và ông A phản ánh tiếp. Tiếp tục như thế cho đến lần thứ 3 ông A tạo phản ánh thì được tính là phản ánh tồn đọng kéo dài, lặp lại nhiều lần, không được xử lý dứt điểm.

---

## 3. Phản ánh trễ hạn nghiêm trọng

**Mục tiêu:** 

- Cảnh báo các phản ánh có thời gian xử lý vượt quá ngưỡng cho phép. Thống kê theo đơn vị hành chính để thấy rõ tồn ở đơn vị nào.

**Điều kiện:**

- Chỉ lấy các phản ánh **quá hạn đang xử lý** tính đến thời điểm báo cáo.

**Yêu cầu:**

- Hiển thị số lượng chi tiết bao nhiêu phản ánh **trễ hạn** và bao nhiêu phản ánh **quá hạn chưa xử lý/ đang xử lý**

---

## 4. Phản ánh liên quan đến đạo đức công vụ

**Mục tiêu:** Phát hiện sớm các vấn đề nhạy cảm liên quan đến chất lượng phục vụ người dân.

**Điều kiện:**

- Chỉ lấy (1) các phản ánh **đã xử lý** có ngày xử lý trong **tuần báo cáo** hoặc (2) các phản ánh đang xử lý trên toàn bộ thời gian.
- Phân tích và tổng hợp các vấn đề nổi cộm thuộc nhóm:
  - Đạo đức công vụ:
    - Phản ánh liên quan đến thái độ, hành vi, trách nhiệm, chuẩn mực ứng xử của cán bộ, công chức, viên chức trong quá trình thực thi công vụ. Trọng tâm là con người thực hiện công vụ.
    - Cán bộ gây khó dễ; nhũng nhiễu; vòi vĩnh; thái độ thiếu lịch sự; không tiếp dân; đùn đẩy trách nhiệm; làm việc thiếu trách nhiệm; quát mắng người dân.

**Yêu cầu:**

- Hiển thị danh sách chi tiết các phản ánh liên quan đến đạo đức công vụ.
- Không lấy các phản ánh thuộc nhóm Thủ tục hành chính:
  - Phản ánh liên quan đến quy trình, thủ tục, hồ sơ, thời gian giải quyết hoặc việc thực hiện dịch vụ công của cơ quan nhà nước. Trọng tâm là quy trình giải quyết công việc.
  - Ví dụ: Hồ sơ giải quyết chậm; yêu cầu bổ sung giấy tờ nhiều lần; thủ tục rườm rà; không hướng dẫn đầy đủ; hệ thống dịch vụ công lỗi; không trả kết quả đúng hẹn.

---

## 5. Đơn vị có số lượng phản ánh tăng bất thường

**Mục tiêu:** Phát hiện các đơn vị có xu hướng phát sinh phản ánh đột biến.

**Điều kiện:**

- Thống kê số lượng phản ánh theo tuần.
- So sánh với các tuần trước để xác định mức tăng trưởng.

**Ngưỡng cảnh báo:**

- Xác định ngưỡng % dựa trên số phản ánh trung bình từng đơn vị theo lịch sử Ví dụ: trung bình 1 đơn vị 100 phản ánh/ tuần và biến động 5% thì ngưỡng cảnh báo có thể là 20%, nhưng 1 đơn vị ít ~ 10 phản ánh/ tuần và biến động 30% thì ngưỡng cảnh báo có thể là 100%

**Lưu ý:**

- Bỏ qua các trường hợp có tỷ lệ tăng cao nhưng số lượng phản ánh thực tế quá nhỏ, không có ý nghĩa thống kê.

---

## 6. Đơn vị có tỷ lệ phản ánh trễ hạn rất cao

**Mục tiêu:** Xác định các đơn vị có dấu hiệu chậm xử lý phản ánh kéo dài.

**Phạm vi dữ liệu:**

- Từ đầu năm đến thời điểm hiện tại.
- Lấy những phản ánh **trễ hạn** và **quá hạn**
- Trong tuần báo cáo, nếu đơn vị phát sinh ít nhất 01 phản ánh quá hạn thì đưa vào danh sách cảnh báo. **Không lấy phản ánh chưa xử lý**

**Ngưỡng cảnh báo:**

- Lớn hơn ngưỡng 80%

**Lưu ý:**

- Bỏ qua các đơn vị có tổng số lượng phản ánh quá nhỏ để tránh sai lệch kết quả đánh giá.

---

## Ghi Chú

- Không tính Trung tâm Thông tin và Giám sát, Điều hành Thông mình Đà Nẵng là 1 đơn vị xử lý
- Không tính các phản ánh thuộc Lĩnh vực Ý kiến danh nghiệp vào
- Không tính các các phản ánh chưa xử lý.
- Các bảng chỉ nên có tối đa 4 cột.
- **Summary** cần ngắn gọn, tối đa 20 chữ. Sử dụng phong cách báo cáo điều hành, tập trung vào vấn đề nổi cộm.
  Ví dụ:
  - **Đầu vào:**  
  Tháng 5/2026, lĩnh vực Môi trường dẫn đầu với 738 phản ánh (26,2% tổng số); rác thải là vấn đề được phản ánh nhiều nhất với 478 lượt  
  **Summary:** Rác thải là vấn đề nổi cộm trong lĩnh vực môi trường tháng 5/2026
  - **Đầu vào:**  
  Trong 6 tháng gần nhất, có 1.994 phản ánh còn mở đang trễ hạn xử lý; lĩnh vực Công vụ – Công chức dẫn đầu số phản ánh trễ từ đầu năm với 141 trường hợp  
  **Summary:** Công vụ – Công chức là lĩnh vực có nhiều phản ánh trễ hạn xử lý nhất từ đầu năm
  - **Đầu vào:**  
  Phát hiện 53 nhóm vấn đề tái diễn tại cùng địa điểm từ đầu năm (mỗi nhóm lặp ≥ 3 lần) còn phản ánh chưa xử lý trong tháng 5; rác thải tại Phường Thanh Khê dẫn đầu với 23 phản ánh chưa xử lý  
  **Summary:** Nhiều vấn đề tái diễn chưa được xử lý dứt điểm, nổi bật là rác thải tại Phường Thanh Khê
  - **Đầu vào:**  
  Tháng 5/2026, có 79 phản ánh về thủ tục hành chính và đạo đức công vụ chưa xử lý; Sở Nông nghiệp và Môi trường là đơn vị có số phản ánh nhóm này cao nhất  
  **Summary:** Thủ tục hành chính và đạo đức công vụ còn nhiều phản ánh chưa xử lý, tập trung tại Sở Nông nghiệp và Môi trường

