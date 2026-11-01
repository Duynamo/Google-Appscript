# BÁO CÁO PHÂN TÍCH & KHẮC PHỤC TRIỆT ĐỂ LỖI ĐỔI MÃ NHÂN VIÊN

> **Thời điểm hoàn thành:** 01/11/2026  
> **Tài khoản quản trị viên:** `duyvultv@gmail.com`  
> **Đối tượng kiểm thử thực tế:** Nhân sự Vũ Đình Duy (`AB6FD093` ➔ `AB6FD893`)

---

## 1. MÔ TẢ HIỆN TƯỢNG VÀ NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE)

### 1.1. Hiện tượng người dùng gặp phải
Khi Quản trị viên mở modal **✏️ Sửa Danh mục tiêu chuẩn** (Tab **5. Nhân viên**), thay đổi Mã nhân viên từ `AB6FD093` thành `AB6FD893` và nhấn nút **💾 Lưu**:
- Giao diện hiển thị thông báo toast: *"Đã lưu thành công"*.
- Tuy nhiên, sau khi đóng modal và bảng tải lại, mã nhân viên trên hệ thống vẫn giữ nguyên mã cũ `AB6FD093`, không có bất kỳ thay đổi nào được ghi nhận.

---

### 1.2. Phân tích nguyên nhân kỹ thuật chi tiết

Qua truy vết luồng xử lý từ Client (`Index.html`) đến Server (`Taxonomyapi.gs`, `Userapi.gs`), chúng tôi phát hiện **3 lỗ hổng mắt xích nghiêm trọng**:

1. **Lỗ hổng 1: Hàm `syncEmployeeToUsersSheet` bỏ quên hoàn toàn Cột 1 (Mã nhân viên / ID)**
   - Trong `Taxonomyapi.gs`:
     ```javascript
     if (foundIndex !== -1) {
       shUsers.getRange(foundIndex, 3).setValue(emp.name);
       shUsers.getRange(foundIndex, 4).setValue(roleToSet);
       shUsers.getRange(foundIndex, 5).setValue(emp.status);
       shUsers.getRange(foundIndex, 7).setValue(emp.rank || "");
       if (emp.sheetUrl) shUsers.getRange(foundIndex, 8).setValue(emp.sheetUrl);
     }
     ```
   - Câu lệnh `shUsers.getRange(foundIndex, 1).setValue(emp.id);` **hoàn toàn bị thiếu**! Do đó, dù hàm báo thành công thì Cột 1 của bảng `USERS` trên Google Sheets không bao giờ được cập nhật giá trị mới.

2. **Lỗ hổng 2: `saveTaxonomyItem` không kiểm tra việc đổi mã để kích hoạt Cascade Update**
   - Khi nhận payload `type === "EMPLOYEE"`, hàm chỉ gọi `syncEmployeeToUsersSheet` đơn lẻ mà không so sánh `oldStaffCode !== newStaffCode`.
   - Hệ quả: Không hề kích hoạt `cascadeUpdateStaffCode`, khiến các bảng nhật ký thời gian (`TIMESHEET_YYYY`), tổng hợp ngày (`TIMESHEET_DAILY_ROLLUP`), dự án (`PROJECTS`) bị ngắt kết nối với mã nhân sự mới.

3. **Lỗ hổng 3: Bảng `TAXONOMY` không được đồng bộ và bị xung đột nguồn dữ liệu**
   - Khi `type === "EMPLOYEE"`, hàm `saveTaxonomyItem` thoát sớm (`return`) mà không ghi nhận thay đổi vào bảng `TAXONOMY` nếu ở đó đã có dòng lưu nhân sự.
   - Khi hàm `getTaxonomyDataInternal()` tải lại, danh sách nhân viên ưu tiên đọc `TAXONOMY` trước, dẫn đến việc lấy lại mã cũ `AB6FD093`.

---

## 2. GIẢI PHÁP VÀ CÁC THAY ĐỔI ĐÃ TRIỂN KHAI

### 2.1. Cập nhật `Taxonomyapi.gs`
1. **Sửa `syncEmployeeToUsersSheet(emp)`:**
   - Bổ sung lệnh ghi đè Cột 1: `shUsers.getRange(foundIndex, 1).setValue(emp.id);`.
   - Hỗ trợ đối soát tìm kiếm nhân sự đa chiều theo `email`, `oldId`, và `id`.
2. **Nâng cấp `saveTaxonomyItem(payload)` cho `EMPLOYEE`:**
   - Tự động trích xuất mã nhân sự cũ `oldStaffCode` từ `payload.id` (`EMP_...`) và đối soát bảng `USERS`.
   - Nếu phát hiện `oldStaffCode && newStaffCode && oldStaffCode !== newStaffCode`: Tự động gọi `cascadeUpdateStaffCode(oldStaffCode, newStaffCode, email, nameVI)`.
   - Cập nhật đồng bộ dòng tương ứng trong bảng `TAXONOMY` (nếu tồn tại) để đổi cả `ID` thành `EMP_${newStaffCode}` và `Code` thành `newStaffCode`.
   - Xóa bộ nhớ cache `USERS`, `TAXONOMY`, `TIMESHEET_2026`, `TIMESHEET_DAILY_ROLLUP` ngay lập tức.
3. **Chuẩn hóa `getTaxonomyDataInternal()`:**
   - Thiết lập bảng `USERS` làm **Nguồn Sự Thật Duy Nhất (Single Source of Truth)** cho nhân sự.
   - Loại bỏ hoàn toàn nguy cơ lọt mã màu rác (`#6366f1`) hoặc bản ghi trùng lặp từ bảng `TAXONOMY`.

### 2.2. Nâng cấp `Userapi.gs` (`cascadeUpdateStaffCode`)
- Chuyển đổi phương thức ghi từ từng ô (`setValue` trong vòng lặp) sang **ghi hàng loạt nguyên tử (Atomic Batch Write - `setValues`)**:
  - `TIMESHEET_YYYY`: Cập nhật toàn bộ Cột 14 (`Staff_Code`) và Cột 15 (`Staff_Name`) chỉ trong 1 thao tác ghi.
  - `TIMESHEET_DAILY_ROLLUP`: Cập nhật Cột 3 (`Staff_Code`), Cột 4 (`Staff_Name`) và tự động tính toán lại Khóa tổng hợp `Rollup_ID` (Cột 1) theo format chuẩn `YYYYMMDD_Staff_Project_Disc`.
  - `PROJECTS`: Cập nhật trường JSON danh sách thành viên trong dự án nếu có chứa mã nhân sự cũ.
  - `USERS`: Cập nhật Cột 1 (`ID`), Cột 3 (`Name`) và Cột 2 (`Email`).

### 2.3. Cải tiến giao diện người dùng (`Index.html`)
- Trong hàm `submitTaxonomyItem()`: Khi lưu thành công nhân sự, ngay lập tức cập nhật `S.members` và `S.user` trong bộ nhớ Client (Optimistic UI) giúp giao diện cập nhật ngay lập tức mà không cần chờ tải lại toàn bộ trang.

---

## 3. KẾT QUẢ KIỂM THỬ THỰC TẾ

### 3.1. Kiểm thử kịch bản trực tiếp (Targeted Test Case)
Chạy kịch bản đổi mã nhân sự Vũ Đình Duy: `AB6FD093` ➔ `AB6FD893` và ngược lại:
```
👉 TRẠNG THÁI TRƯỚC KHI ĐỔI MÃ:
   USERS Row 1 ID: AB6FD093
   TAXONOMY Row 1 Code: AB6FD093
   TIMESHEET_2026 Staff_Code: AB6FD093
   ROLLUP Staff_Code & ID: AB6FD093 | 20260701_AB6FD093_MUR01_MD01
   PROJECTS Members: [{"id":"AB6FD093","email":"duyvultv@gmail.com","name":"Vũ Đình Duy","role":"Admin"}]

🚀 GỌI saveTaxonomyItem VỚI MÃ MỚI: AB6FD893...
Kết quả: {"success":true,"message":"Đã đổi mã nhân viên từ [AB6FD093] sang [AB6FD893] và đồng bộ toàn hệ thống!"}

👉 TRẠNG THÁI SAU KHI ĐỔI MÃ:
   USERS Row 1 ID: AB6FD893 | Name: Vũ Đình Duy | Email: duyvultv@gmail.com
   TAXONOMY Row 1 ID & Code: EMP_AB6FD893 | AB6FD893
   TIMESHEET_2026 Staff_Code: AB6FD893
   ROLLUP Staff_Code & ID: AB6FD893 | 20260701_AB6FD893_MUR01_MD01
   PROJECTS Members: [{"id":"AB6FD893","email":"duyvultv@gmail.com","name":"Vũ Đình Duy","role":"Admin"}]
   Taxonomy UI employees object: {"id":"EMP_AB6FD893","type":"EMPLOYEE","code":"AB6FD893",...}

🎉 HOÀN TOÀN THÀNH CÔNG!
```

### 3.2. Bộ kiểm thử toàn diện (Comprehensive Test Suite - 19/19 Test Cases)
```
════════════════════════════════════════════════════════════════════════════
🎯 KẾT QUẢ KIỂM THỬ TOÀN BỘ HỆ THỐNG: 19/19 TEST CASES ĐẠT CHUẨN (100%)
════════════════════════════════════════════════════════════════════════════
✅ TC01: Xác thực Admin Email chính thức duyvultv@gmail.com & xóa mã ma 9210007
✅ TC02: Tính đồng nhất Dự Án (PROJECTS & TAXONOMY chỉ lưu đúng 4 dự án chuẩn)
✅ TC03: Khử trùng lặp Dropdown Báo Cáo trong Index.html
✅ TC04: Cascade Update Dự Án: Sửa mã/tên lan truyền sang PROJECTS, TAXONOMY, TIMESHEET, ROLLUP
✅ TC05: Cascade Update Mã Nhân Sự: Sửa mã lan truyền sang USERS, TIMESHEET, ROLLUP
✅ TC06: Quản lý liên kết tác nghiệp
✅ TC07: Chặn mã màu lọt vào Email trong Taxonomyapi.gs & Index.html
✅ TC08: Ngăn chặn Zombie User: Xóa trong Taxonomy tự động set Inactive trong USERS
✅ TC09: Xóa dự án triệt để không để lại dự án ma trong TAXONOMY
✅ TC10: Chống nhân bản dòng Chấm công (Idempotency)
✅ TC11: Xác thực hàm tìm kiếm dòng findTimesheetRowIndices với Date Object
✅ TC12: Toàn vẹn khóa tổng hợp Rollup_ID (Định dạng YYYYMMDD_Staff_Project_Disc)
✅ TC13: Tính tương thích Đa ngôn ngữ (Name_VI, Name_EN, Name_JP)
✅ TC14: Tính Idempotent tuyệt đối của Seeder: Chạy 3 lần liên tiếp không đẻ rác
✅ TC15: Khóa bảo toàn 712.0 giờ công Nhật Bản (MUR: 240h, JJK: 344h, AMA: 16h, TES: 112h)
✅ TC16: Đồng bộ 68 Nhiệm Vụ (TASKS) chuẩn: MUR(15), JJK(31), AMA(10), TES(12)
✅ TC17: Toàn vẹn liên kết 2 chiều: 100% (1,424 slots) đều có Task_ID trỏ về TASKS
✅ TC18: Cấu trúc Thành viên Dự án chuẩn (Ngăn ngừa lỗi avatar '? undefined')
✅ TC19: Đổi mã nhân viên qua modal Danh mục tiêu chuẩn lan truyền 100% sang USERS, TAXONOMY, TIMESHEET
════════════════════════════════════════════════════════════════════════════
```

---

## 4. KẾT LUẬN
Hệ thống hiện tại đã hỗ trợ đổi mã nhân viên an toàn tuyệt đối từ cả hai nơi:
1. **Modal Sửa Danh mục tiêu chuẩn (Tab 5. Nhân viên)**.
2. **Trang Quản lý người dùng (`updateUser` / `cascadeUpdateStaffCode`)**.

Mọi thay đổi mã nhân viên sẽ được tự động đồng bộ lan truyền hai chiều và cập nhật tức thì trên giao diện mà không để lại bất kỳ dữ liệu rác hay tình trạng không tương thích nào.

