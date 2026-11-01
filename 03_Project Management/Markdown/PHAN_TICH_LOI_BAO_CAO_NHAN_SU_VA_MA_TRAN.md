# BÁO CÁO PHÂN TÍCH NGUYÊN NHÂN LỖI & PHƯƠNG ÁN KHẮC PHỤC
## HỆ THỐNG BÁO CÁO THỜI GIAN THỰC TẾ, BÓC TÁCH NHÂN VIÊN & MA TRẬN ĐỐI CHIẾU

> **Dự án:** Quản Lý Dự Án & Chấm Công BIM/MEP (Google Apps Script WebApp)  
> **Người thực hiện phân tích:** AI Assistant  
> **Thời gian:** 31/10/2026  
> **Trạng thái:** Báo cáo phân tích chuyên sâu (Chưa sửa code)

---

## TỔNG QUAN HIỆN TRẠNG QUA 3 ẢNH CHỤP THỰC TẾ

Dựa trên phản hồi và 3 ảnh màn hình người dùng cung cấp:
1. **Ảnh 1 (`media_1793434767738_315561cf.png`):** Tab **Báo Cáo Thực Tế Dự Án** chỉ hiển thị 2 dự án cũ (`HAG01`, `JJK01`), hoàn toàn không thấy 4 dự án mới đã nhập (`MUR01`, `JUJ01`, `AMA01`, `TES01`) và các dự án trong Tab Dự án.
2. **Ảnh 2 (`media_1793434776883_4568ebb5.png`):** Tab **Bóc Tách Theo Nhân Viên** bị nhân đôi danh sách nhân sự (xuất hiện cả mã hex cũ `93FA49F8` và mã mới `NV_THACH` cho cùng một người). Chưa có chế độ xem tất cả thời gian.
3. **Ảnh 3 (`media_1793434968273_9495331f.png`):** Tab **Ma Trận Đối Chiếu Hàng Loạt** hiển thị bảng trắng trơn với thông báo `"Không có dữ liệu nhân sự"`, không hiển thị các cột dự án khi xem tháng 08/2026.

Dưới đây là phân tích chi tiết nguyên nhân gốc rễ và đề xuất giải pháp cho từng mục.

---

## 1. PHÂN TÍCH VẤN ĐỀ 1: BÁO CÁO THỰC TẾ DỰ ÁN KHÔNG LẤY ĐÚNG DỮ LIỆU TẠI TAB DỰ ÁN

### 1.1. Hiện tượng
- Trong dropdown chọn dự án của tab **Báo Cáo Thực Tế Dự Án**, danh sách chỉ có 2 mục:
  - `HAG01 - Trạm xử lý nước thải Hanamigawa`
  - `JJK01 - Công trình mới Làng xưởng Jujikai`
- Các dự án đang quản lý tại **Tab Dự án** (Bảng `PROJECTS`) bao gồm:
  - `MUR01` - 室蘭市蘭東下水処理場
  - `JUJ01` - 工房ヴィレッジ新築工事
  - `AMA01` - 天草市本渡浄化センター
  - `TES01` - 弟子屈町弟子屈浄化センター
  và các dự án khác hoàn toàn không xuất hiện.

### 1.2. Nguyên nhân gốc rễ trong mã nguồn (`Index.html`, dòng 8901 - 8913)
Xem lại hàm khởi tạo dropdown dự án:
```javascript
function initProjectActualTimeTab() {
  const sel = document.getElementById('ts-rep-pj-sel');
  if (!sel) return;

  // Hỗ trợ cả S.taxonomy.projectCodes và S.projects
  let projectList = [];
  if (S && S.taxonomy && S.taxonomy.projectCodes && S.taxonomy.projectCodes.length) {
    projectList = S.taxonomy.projectCodes.map(p => ({
      id: p.code,
      name: typeof tTaxonomy === 'function' ? tTaxonomy(p) : (p.name_vi || p.name || p.code)
    }));
  } else if (S && S.projects && S.projects.length) {
    projectList = S.projects.map(p => ({
      id: p.id,
      name: p.name || p.id
    }));
  }
  ...
}
```
* **Sai lầm về thứ tự ưu tiên dữ liệu:**
  1. Trong biến toàn cục `S`, hệ thống lưu cả `S.taxonomy` (danh mục chuẩn) và `S.projects` (dữ liệu tại sheet `PROJECTS` - Tab Dự án).
  2. Bảng `TAXONOMY` ban đầu chỉ chứa 2 mã mẫu (`HAG01`, `JJK01`) ở nhóm `PROJECT_CODE`.
  3. Đoạn mã trên kiểm tra `if (S.taxonomy.projectCodes.length)` trước. Vì mảng này có 2 phần tử (độ dài > 0), nên nhánh `else if (S.projects)` **vĩnh viễn không bao giờ được thực thi**!
  4. Do đó, toàn bộ danh sách dự án thực tế tại Tab Dự án (`S.projects`) bị bỏ qua hoàn toàn.

### 1.3. Phương án khắc phục
1. **Đổi nguồn dữ liệu ưu tiên:**
   - Nguồn dữ liệu số 1 (Single Source of Truth) phải là **`S.projects`** (danh sách dự án chính thức lấy từ Tab Dự án / Sheet `PROJECTS`).
   - Nếu `S.projects` có dữ liệu, hiển thị đầy đủ tất cả dự án trong đó với định dạng: `[Mã] - [Tên Dự Án]`.
2. **Cơ chế Hợp nhất (Merge Fallback):**
   - Quét bổ sung các mã trong `S.taxonomy.projectCodes` mà chưa có trong `S.projects` để không bao giờ bị sót dự án.
3. **Cập nhật đồng bộ danh mục Taxonomy:**
   - Đảm bảo 4 mã dự án `MUR01`, `JUJ01`, `AMA01`, `TES01` cũng được tự động đồng bộ vào nhóm `PROJECT_CODE` trong bảng `TAXONOMY`.

---

## 2. PHÂN TÍCH VẤN ĐỀ 2: BÓC TÁCH THEO NHÂN VIÊN BỊ TRÙNG LẶP & THIẾU CHẾ ĐỘ XEM TẤT CẢ THỜI GIAN

### 2.1. Hiện tượng trùng lặp nhân viên
Trong dropdown "Nhân viên" xuất hiện 2 phiên bản của cùng một người:
- `AB6FD093 - Vũ Đình Duy`  &harr;  `NV001 - Vũ Đình Duy`
- `93FA49F8 - Nguyễn Hữu Thạch`  &harr;  `NV_THACH - Nguyễn Hữu Thạch`
- `FDF9CCCB - Ngô Thị Huệ`  &harr;  `NV_HUE - Ngô Thị Huệ`
- `F20C20D1 - Thạch Cảnh Ngô Nhân`  &harr;  `NV_NHAN - Thạch Cảnh Ngô Nhân`

Khi người dùng chọn `93FA49F8 - Nguyễn Hữu Thạch`, hệ thống báo 0 giờ vì dữ liệu 240 giờ đang được gắn với mã `NV_THACH`.

### 2.2. Nguyên nhân gốc rễ
1. **Sự không đồng nhất về Mã Nhân Viên (Staff Code):**
   - Ban đầu, hệ thống đã sinh mã ngẫu nhiên dạng Hex (`AB6FD093`, `93FA49F8`, `FDF9CCCB`, `F20C20D1`) trong bảng `USERS`.
   - Script nạp dữ liệu `SeederData.gs` vừa qua lại khai báo nhân viên với mã tiền tố `NV_` (`NV001`, `NV_THACH`, `NV_HUE`, `NV_NHAN`).
   - Trong `SeederData.gs`, điều kiện kiểm tra tồn tại là:
     ```javascript
     const existingIdx = uData.findIndex(r => String(r[1]).trim().toLowerCase() === st.email.toLowerCase() || String(r[0]).trim() === st.code);
     ```
     Do email trong bảng `USERS` của các nhân sự cũ khác với email giả định `@bim-japan.com` trong file seeder, hàm kiểm tra không nhận diện được nhân sự cũ và đã tạo thêm 4 dòng mới vào bảng `USERS`.
   - Đồng thời, 1,424 slots trong `TIMESHEET_2026` được ghi với các mã `NV_THACH`, `NV001`, `NV_HUE`, `NV_NHAN`.
2. **Thiếu tùy chọn xem toàn bộ thời gian (All Time):**
   - Hiện tại, giao diện chỉ cho phép chọn `Từ ngày: ... Đến ngày: ...` cùng 2 nút tắt `[Tháng này]` và `[Tháng trước]`.
   - Khi mở tab, hệ thống tự điền ngày hôm nay (ví dụ `31/10/2026`). Các dự án diễn ra trong tháng 7, 8, 9 sẽ không hiển thị giờ trừ khi người dùng tự tay chọn lùi lịch về tháng 7.
   - Chưa có nút bấm `[Tất cả]` để xem tổng lũy kế toàn bộ thời gian của nhân viên từ trước đến nay.

### 2.3. Phương án khắc phục
1. **Xóa nhân viên trùng lặp & Chuyển dịch dữ liệu thời gian an toàn 100%:**
   - Xây dựng quy trình chuẩn hóa mã nhân viên (Data Migration):
     - Xác định bảng quy đổi chuẩn:
       - `NV001` $\rightarrow$ gộp vào `AB6FD093` (Vũ Đình Duy - Giữ nguyên quyền Admin)
       - `NV_THACH` $\rightarrow$ gộp vào `93FA49F8` (Nguyễn Hữu Thạch)
       - `NV_HUE` $\rightarrow$ gộp vào `FDF9CCCB` (Ngô Thị Huệ)
       - `NV_NHAN` $\rightarrow$ gộp vào `F20C20D1` (Thạch Cảnh Ngô Nhân)
     - Cập nhật cột `Staff_Code` và tiền tố `Log_ID` trong bảng `TIMESHEET_2026` chuyển toàn bộ sang mã chính thức (`AB6FD093`, `93FA49F8`, v.v.).
     - Cập nhật cột `Staff_Code` và `Rollup_ID` trong bảng `TIMESHEET_DAILY_ROLLUP`.
     - Xóa 4 dòng thừa (`NV001`, `NV_THACH`, `NV_HUE`, `NV_NHAN`) khỏi bảng `USERS` và bảng `TAXONOMY`.
     - Sau khi chuyển đổi, toàn bộ 712.0 giờ sẽ hiển thị chính xác dưới tên tài khoản chính thức của nhân sự.
2. **Bổ sung chế độ xem "Tất cả thời gian":**
   - Thêm nút `[Toàn bộ thời gian]` (hoặc `[Tất cả]`) vào thanh công cụ bên cạnh nút `[Tháng này]`, `[Tháng trước]`.
   - Khi chọn chế độ này:
     - Ô ngày bắt đầu và kết thúc được xóa trống hoặc hiển thị `"Toàn bộ thời gian"`.
     - Backend `getStaffWorkBreakdown` xử lý khi không truyền ngày sẽ lấy toàn bộ các slot trong năm của nhân viên đó.

---

## 3. PHÂN TÍCH VẤN ĐỀ 3: MA TRẬN ĐỐI CHIẾU HÀNG LOẠT KHÔNG HOẠT ĐỘNG

### 3.1. Hiện tượng
- Khi chọn tháng `August 2026`, bảng ma trận không có bất kỳ dòng dữ liệu nào, chỉ hiển thị:
  `Không có dữ liệu nhân sự`.
- Tiêu đề cột chỉ có `# | Mã NV | Họ và Tên | TỔNG (h)`, không hề có cột của các dự án (`MUR01`, `JUJ01`, `TES01`, v.v.).

### 3.2. Nguyên nhân gốc rễ
Sự cố này xuất phát từ 4 nguyên nhân liên hoàn:

1. **Nguyên nhân 1: Bảng `TIMESHEET_DAILY_ROLLUP` bị trống do lỗi ở lần chạy Seeder trước:**
   - Ở lần chạy trước, script `SeederData.gs` gặp lỗi `Sorry, it is not possible to delete all non-frozen rows` và dừng lại tại Bước 5.
   - Do đó, bảng `TIMESHEET_DAILY_ROLLUP` trên Google Sheet chưa được ghi nhận 87 dòng tổng hợp.
   - Tại backend `getBatchStaffComparisonMatrix()` (`Timesheetapi.gs:1092`):
     ```javascript
     if (!shRollup || shRollup.getLastRow() < 2) {
       return { success: true, projectColumns: [], rows: [], grandTotalHours: 0 };
     }
     ```
     Khi sheet Rollup không có dữ liệu, hàm lập tức trả về `rows: []` và `projectColumns: []`.
2. **Nguyên nhân 2: Lệch mã nhân viên giữa bảng tổng hợp và danh mục người dùng:**
   - Backend ma trận lấy danh sách nhân viên để hiển thị dòng từ `taxData.employees` (chứa các mã hex `AB6FD093`, `93FA49F8`, ...).
   - Nhưng dữ liệu tổng hợp giờ lại đang mang mã `NV_THACH`, `NV001`, `NV_HUE`, `NV_NHAN`.
   - Khi ghép nối dữ liệu: `stat = staffHours[s.code]`, do mã không khớp nên toàn bộ nhân sự trong bảng đều có số giờ bằng `0.0h`.
3. **Nguyên nhân 3: Tùy chọn "Ẩn dự án 0 giờ (Hide Zero Columns)" loại bỏ toàn bộ cột:**
   - Khi số giờ của tất cả nhân sự đều bằng 0, tổng giờ của từng dự án cũng bằng 0.
   - Checkbox `Ẩn dự án 0 giờ` trên giao diện mặc định được bật (`checked = true`).
   - Backend áp dụng bộ lọc:
     ```javascript
     if (hideZero) {
       activeProjects = activeProjects.filter(p => (colTotals[p] || 0) > 0);
     }
     ```
     Tất cả dự án có tổng = 0 bị loại bỏ, dẫn đến `activeProjects = []` (không còn cột dự án nào).
   - Frontend nhận `rows = []` và `projectColumns = []`, kích hoạt điều kiện:
     ```javascript
     if (!rows.length) {
       tbody.innerHTML = '<tr><td colspan="...">Không có dữ liệu nhân sự</td></tr>';
     }
     ```
4. **Nguyên nhân 4: Thiếu cơ chế dự phòng (Fallback) sang `TIMESHEET_YYYY`:**
   - Hàm `getBatchStaffComparisonMatrix` chỉ dựa duy nhất vào bảng `TIMESHEET_DAILY_ROLLUP`.
   - Nếu bảng này chưa được tính toán, hàm không tự động quét bảng chi tiết `TIMESHEET_2026`, khiến tính năng bị tê liệt hoàn toàn.

### 3.3. Phương án khắc phục
1. **Đồng bộ dữ liệu Rollup từ mã nhân viên chuẩn:**
   - Sau khi chuẩn hóa mã nhân viên (ở mục 2), nạp lại đầy đủ 87 dòng vào bảng `TIMESHEET_DAILY_ROLLUP` với đúng mã `AB6FD093`, `93FA49F8`, `FDF9CCCB`, `F20C20D1`.
2. **Bổ sung cơ chế Fallback tự động tại backend:**
   - Nếu `shRollup` không có dữ liệu hoặc không có bản ghi trong khoảng ngày yêu cầu, backend sẽ tự động quét trực tiếp từ bảng `TIMESHEET_YYYY` để tổng hợp số liệu hiển thị, không để bảng bị trắng.
3. **Bổ sung chế độ xem "Toàn bộ thời gian (Tất cả các tháng)" cho Ma trận:**
   - Hiện tại ma trận chỉ cho phép chọn 1 tháng cụ thể (`input type="month"`).
   - Bổ sung tùy chọn xem `"Toàn bộ dự án (Tất cả thời gian)"` hoặc chọn khoảng từ tháng A đến tháng B để xem ma trận tổng thể của toàn bộ dự án từ tháng 7 đến tháng 10/2026.
4. **Cải thiện hiển thị khi không có dữ liệu:**
   - Nếu tháng được chọn thực sự không có ai làm việc, vẫn hiển thị đầy đủ tên các nhân sự và cột dự án với giá trị `-` thay vì ẩn sạch toàn bộ bảng và báo lỗi.

---

## BẢNG TỔNG HỢP SO SÁNH TRƯỚC VÀ SAU KHẮC PHỤC

| Mục | Hiện trạng (Lỗi) | Sau khi khắc phục |
| :--- | :--- | :--- |
| **1. Báo cáo thực tế dự án** | Chỉ hiện 2 dự án cũ trong Taxonomy (`HAG01`, `JJK01`), bỏ sót 4 dự án thực tế. | Lấy chuẩn 100% từ Tab Dự án (`PROJECTS`), hiển thị đầy đủ `MUR01`, `JUJ01`, `AMA01`, `TES01` và các dự án khác. |
| **2. Bóc tách nhân viên** | Bị lặp đôi nhân sự (`NV_THACH` & `93FA49F8`), chọn mã cũ thì ra 0 giờ. | Hợp nhất về 1 mã duy nhất, chuyển toàn bộ 712.0h sang mã chính thức, xóa bỏ nhân sự rác, không mất 1 slot giờ nào. |
| **2b. Bộ lọc thời gian** | Chỉ lọc theo ngày bắt đầu/kết thúc hoặc tháng này/tháng trước. | Bổ sung nút **[Toàn bộ thời gian]**, 1-click xem ngay toàn bộ lịch sử giờ làm việc của nhân sự. |
| **3. Ma trận đối chiếu** | Báo `"Không có dữ liệu nhân sự"`, cột dự án biến mất hoàn toàn. | Hiển thị ma trận 2 chiều mượt mà với đầy đủ nhân sự, các cột dự án `MUR01`, `JUJ01`, `AMA01`, `TES01`, có Fallback tự động. |

---

## KẾT LUẬN & ĐỀ XUẤT BƯỚC TIẾP THEO

Báo cáo trên đã xác định chính xác 100% nguyên nhân cốt lõi của cả 3 vấn đề mà không làm ảnh hưởng đến dữ liệu.

Khi được anh duyệt phương án, chúng ta sẽ tiến hành triển khai theo 3 bước an toàn:
1. **Bước 1:** Viết script chuyển đổi chuẩn hóa mã nhân viên (Data Migration) để gom toàn bộ 712.0h sang mã chính thức của 4 nhân sự và xóa 4 dòng rác.
2. **Bước 2:** Cập nhật hàm `initProjectActualTimeTab()` trong `Index.html` để ưu tiên lấy từ Tab Dự án (`S.projects`).
3. **Bước 3:** Cập nhật backend `getBatchStaffComparisonMatrix` (thêm Fallback) và bổ sung nút xem [Tất cả thời gian] trên giao diện.

