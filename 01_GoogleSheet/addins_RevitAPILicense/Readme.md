# YÊU CẦU TẠO SINH MÃ NGUỒN: GOOGLE APPS SCRIPT CHO HỆ THỐNG LICENSE

Bạn là một chuyên gia lập trình Google Apps Script. Hãy viết mã nguồn `Code.gs` để biến file Google Sheets thành một Web App (API) xử lý xác thực bản quyền với các yêu cầu sau:

## 1. Cấu trúc Database (Google Sheets)
Sheet tên là "Sheet1" có dòng 1 là tiêu đề với 7 cột:
*   **Cột A (No):** Số thứ tự.
*   **Cột B (Tên):** Tên người dùng.
*   **Cột C (Gmail):** Email liên hệ.
*   **Cột D (LicenseKey):** Mã bản quyền (Dữ liệu quan trọng để dò tìm).
*   **Cột E (Device_1):** Lưu MAC Address của máy 1 (trống nếu chưa dùng).
*   **Cột F (Device_2):** Lưu MAC Address của máy 2 (trống nếu chưa dùng).
*   **Cột G (IsActive):** Trạng thái khóa/mở (TRUE/FALSE).

## 2. Logic xử lý của hàm doPost(e)
Web App nhận một HTTP POST request chứa 2 tham số: `key` và `macAddress`.
Thực hiện đọc toàn bộ dữ liệu từ dòng 2 trở đi. Dò tìm tham số `key` trong Cột D.
*   Nếu không tìm thấy `key` -> Trả về JSON: `{"status": "invalid_key", "message": "Mã bản quyền không tồn tại"}`.
*   Nếu tìm thấy `key`, tiếp tục kiểm tra Cột G (IsActive):
    *   Nếu Cột G == FALSE -> Trả về JSON: `{"status": "locked", "message": "Key đã bị khóa"}`.
    *   Nếu Cột G == TRUE, tiếp tục so sánh `macAddress` với Cột E và Cột F:
        1. Nếu `macAddress` đã nằm sẵn ở Cột E hoặc Cột F -> Trả về `{"status": "success", "message": "Xác thực thành công"}`.
        2. Nếu `macAddress` chưa có mặt, kiểm tra xem Cột E hoặc Cột F có đang trống không. Ghi `macAddress` vào ô trống đầu tiên tìm thấy và trả về `{"status": "success", "message": "Đăng ký thiết bị thành công"}`.
        3. Nếu Cột E và Cột F đều đã chứa giá trị khác -> Trả về `{"status": "limit_reached", "message": "Đã đạt giới hạn 2 thiết bị"}`.

Yêu cầu code sử dụng try/catch để bắt lỗi, trả về đúng định dạng ContentService.MimeType.JSON và có comment giải thích rõ ràng.