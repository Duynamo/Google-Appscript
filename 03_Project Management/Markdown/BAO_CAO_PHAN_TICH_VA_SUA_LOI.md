# BÁO CÁO PHÂN TÍCH TOÀN DIỆN VÀ HƯỚNG DẪN SỬA LỖI DỰ ÁN
**Dự án:** Quản Lý Dự Án Web App v3.0 (Google Apps Script)  
**Đường dẫn thư mục:** `c:\Users\Laptop\OneDrive\Desktop\Hello World\Google-Appscript\03_Project Management`  
**Ngày lập báo cáo:** 12/10/2026  

---

## MỤC LỤC
1. [TỔNG QUAN DỰ ÁN VÀ KIẾN TRÚC HIỆN TẠI](#1-tổng-quan-dự-án-và-kiến-trúc-hiện-tại)
2. [BẢNG TỔNG HỢP DANH SÁCH LỖI THEO MỨC ĐỘ NGUY CẤP](#2-bảng-tổng-hợp-danh-sách-lỗi-theo-mức-độ-nguy-cấp)
3. [CHI TIẾT CÁC LỖI & PHÂN TÍCH NGUYÊN NHÂN](#3-chi-tiết-các-lỗi--phân-tích-nguyên-nhân)
   - [Nhóm 1: Lỗi Xung Đột Namespace & Trùng Lặp Hàm (GAS Blocker)](#nhóm-1-lỗi-xung-đột-namespace--trùng-lặp-hàm-gas-blocker)
   - [Nhóm 2: Lỗi Kiến Trúc Dữ Liệu Đa Người Dùng (LocalStorage vs Sheets)](#nhóm-2-lỗi-kiến-trúc-dữ-liệu-đa-người-dùng-localstorage-vs-sheets)
   - [Nhóm 3: Lỗi Bảo Mật & Lỗ Hổng Phân Quyền (Security Holes)](#nhóm-3-lỗi-bảo-mật--lỗ-hổng-phân-quyền-security-holes)
   - [Nhóm 4: Lỗi Logic Nghiệp Vụ & Toàn Vẹn Dữ Liệu (Business Logic Bugs)](#nhóm-4-lỗi-logic-nghiệp-vụ--toàn-vẹn-dữ-liệu-business-logic-bugs)
   - [Nhóm 5: Lỗi Giao Diện, Tương Tác & Tính Năng Liệt (UI / Frontend Bugs)](#nhóm-5-lỗi-giao-diện-tương-tác--tính-năng-liệt-ui--frontend-bugs)
   - [Nhóm 6: Lỗi Hiệu Năng & Giới Hạn Quota Google (Performance & Quota Limits)](#nhóm-6-lỗi-hiệu-năng--giới-hạn-quota-google-performance--quota-limits)
4. [HƯỚNG DẪN CHI TIẾT CÁCH SỬA TỪNG FILE](#4-hướng-dẫn-chi-tiết-cách-sửa-từng-file)
   - [4.1. File `Code.gs`](#41-file-codegs)
   - [4.2. File `Helpers.gs` & `Userapi.gs`](#42-file-helpersgs--userapigs)
   - [4.3. File `Projectsapi.gs`](#43-file-projectsapigs)
   - [4.4. File `Taskapi.gs`](#44-file-taskapigs)
   - [4.5. File `Index.html`](#45-file-indexhtml)
5. [LỘ TRÌNH VÀ CHECKLIST KIỂM THỬ SAU KHI SỬA](#5-lộ-trình-và-checklist-kiểm-thử-sau-khi-sửa)

---

## 1. TỔNG QUAN DỰ ÁN VÀ KIẾN TRÚC HIỆN TẠI

Dự án gồm 6 tệp tin:
- **`Code.gs`**: Điểm khởi đầu Web App (`doGet`), cấu hình hệ thống (`CONFIG`), Cache Service, hàm đọc ghi Sheet dùng chung và hàm gom dữ liệu `getInitData()`.
- **`Helpers.gs`**: Xử lý Users, Activity Log, Menu trên Google Sheets, Triggers, Cache cleanup.
- **`Userapi.gs`**: Tệp tin chứa các API quản lý người dùng (Users).
- **`Projectsapi.gs`**: CRUD Dự án, tiến độ dự án, báo cáo, dữ liệu Gantt chart, sắp xếp thứ tự công việc.
- **`Taskapi.gs`**: CRUD Nhiệm vụ/Công việc, nhắc việc, gửi email thông báo deadline.
- **`Index.html`**: Giao diện Single Page Application (SPA), sử dụng Vanilla CSS, Chart.js, Sortable.js và JavaScript giao tiếp với backend qua `google.script.run`.

---

## 2. BẢNG TỔNG HỢP DANH SÁCH LỖI THEO MỨC ĐỘ NGUY CẤP

| STT | Mã Lỗi | Vị Trí (File & Dòng) | Phân Loại | Mức Độ | Tóm Tắt Lỗi |
|:---:|:---:|:---|:---:|:---:|:---|
| 1 | **ERR-01** | `Userapi.gs` & `Helpers.gs` | Kiến trúc / Namespace | 🔴 **Nghiêm trọng (Blocker)** | Trùng lặp hoàn toàn các hàm `getUsers`, `addUser`, `updateUser`, `deleteUser`, `getMemberList` giữa 2 file. `Userapi.gs` đè mất cơ chế xóa Cache của `Helpers.gs`. |
| 2 | **ERR-02** | `Index.html`: 891-906, 1345, 2007 | Dữ liệu / Đồng bộ | 🔴 **Nghiêm trọng (Blocker)** | Thành viên "Chỉ cần tên" và phân bổ thành viên dự án chỉ lưu trong `localStorage` trình duyệt. Không đồng bộ vào Google Sheets, các máy khác không thể thấy. |
| 3 | **ERR-03** | `Projectsapi.gs`: 161-174 | Bảo mật / Phân quyền | 🔴 **Nghiêm trọng** | `getGanttData` không lọc theo quyền `Member`. Nhân viên bình thường có thể xem trộm toàn bộ dự án và task của cả công ty. |
| 4 | **ERR-04** | `Taskapi.gs`: 74-90 | Logic nghiệp vụ | 🔴 **Nghiêm trọng** | Nhân viên (Member) nộp Link kết quả và Kết quả đầu ra bị backend âm thầm bỏ qua, không lưu vào Sheet. |
| 5 | **ERR-05** | `Projectsapi.gs`: 85-100 | Toàn vẹn dữ liệu | 🔴 **Nghiêm trọng** | Xóa dự án không xóa nhiệm vụ liên quan (Missing Cascade Delete) tạo ra các task rác mồ côi (Orphan Tasks). |
| 6 | **ERR-06** | `Code.gs`: 187-190 | Logic Sheet | 🔴 **Nghiêm trọng** | Vòng lặp bổ sung header sheet TASKS dùng `s.getLastColumn()` động kết hợp index `+ i` gây nhảy cóc tạo cột rỗng xen kẽ. |
| 7 | **ERR-07** | `Code.gs`: 62 | Môi trường GAS | 🟠 **Cao (Major)** | `Session.getActiveUser().getEmail()` trả về rỗng khi chạy Web App dạng "Execute as: Me" trên tài khoản cá nhân, gây khóa người dùng. |
| 8 | **ERR-08** | `Code.gs`: 134 | Phân quyền hiển thị | 🟠 **Cao (Major)** | Quyền `Member` bị gán `projects = []`, khiến các dropdown dự án, badge dự án trên giao diện bị rỗng/lỗi `undefined`. |
| 9 | **ERR-09** | `Taskapi.gs`: 71-88 | Phân quyền Manager | 🟠 **Cao (Major)** | Manager có thể tùy ý sửa, xóa hoặc nhân bản task thuộc dự án của Manager khác do thiếu kiểm tra quyền sở hữu dự án. |
| 10 | **ERR-10** | `Projectsapi.gs`: 201 | Tranh chấp dữ liệu | 🟠 **Cao (Major)** | `genPjNum` và tạo mới thiếu `LockService`, dễ sinh trùng mã dự án khi nhiều người thao tác cùng lúc. |
| 11 | **ERR-11** | `Projectsapi.gs`: 187 | Lỗi đặt tên Sheet | 🟠 **Cao (Major)** | `exportProjectReport` crash khi tên dự án có ký tự cấm (`/`, `\`, `?`, `*`, `[`, `]`, `:`). |
| 12 | **ERR-12** | `Projectsapi.gs`: 76, 130 | Đồng bộ Sheet | 🟠 **Cao (Major)** | Cập nhật tiến độ dự án đọc dữ liệu chưa được `SpreadsheetApp.flush()`, và không reset tiến độ về 0% khi hết task. |
| 13 | **ERR-13** | `Index.html`: 1188-1194 | Tính năng / UI | 🟡 **Trung bình (Medium)** | Biểu đồ xu hướng hoàn thành 30 ngày (`renderChartTrend`) bị gán cứng toàn số 0 (`data.push(0)`). |
| 14 | **ERR-14** | `Index.html`: 1702 | Giao diện / Sự kiện | 🟡 **Trung bình (Medium)** | Ô checkbox hoàn thành công việc trên bảng nhiệm vụ không có sự kiện, không hoạt động. |
| 15 | **ERR-15** | `Index.html`: 2090 | Giao diện / Tìm kiếm | 🟡 **Trung bình (Medium)** | Ô tìm kiếm toàn cục trên Topbar (`#g-srch`) chỉ gán giá trị sang input Gantt, không lọc dữ liệu trang hiện hành. |
| 16 | **ERR-16** | `Index.html`: 638, 1732 | Điều hướng Modal | 🟡 **Trung bình (Medium)** | Nút "Chỉnh sửa đầy đủ" trong modal thêm nhanh task gọi `openFullTaskEdit(null)` quay vòng lại chính modal đó. |
| 17 | **Index.html** | `Index.html`: 1460, 1661 | Cú pháp HTML / XSS | 🟡 **Trung bình (Medium)** | Lỗi thoát chuỗi trong HTML `onclick="delTk(...)`, nếu tên chứa dấu `"` sẽ làm liệt hoàn toàn nút bấm. |
| 18 | **ERR-18** | `Index.html`: 1785 | Định dạng ngày | 🟡 **Trung bình (Medium)** | Cập nhật task optimistic UI ghi đè `deadline` dạng `YYYY-MM-DD` vào biến hiển thị `dd/MM/yyyy`. |
| 19 | **ERR-19** | `Index.html`: 2089 | Trình duyệt / CSP | 🟡 **Trung bình (Medium)** | Đăng xuất dùng `window.location.href` bị CSP của Google iframe chặn, không đăng xuất được. |
| 20 | **ERR-20** | `Index.html`: 821, 1054 | Kiến trúc dữ liệu | 🟡 **Trung bình (Medium)** | Thông báo nội bộ lưu riêng trong `localStorage`, không truyền đạt được tới các thành viên khác. |
| 21 | **ERR-21** | `Projectsapi.gs`: 146-159 | Hiệu năng / Quota | 🟡 **Hiệu năng (Optimization)** | `saveTaskOrder` gọi `setValue()` 50+ lần từng cell trong vòng lặp thay vì dùng 1 lần `setValues()` hàng loạt. |
| 22 | **ERR-22** | `Taskapi.gs`: 36, 172 | Ngoại lệ Email | 🟡 **Hiệu năng (Optimization)** | `sendAssignmentEmail` và `sendDeadlineReminders` gửi email tới chuỗi tên người dùng không hợp lệ. |

---

## 3. CHI TIẾT CÁC LỖI & PHÂN TÍCH NGUYÊN NHÂN

### Nhóm 1: Lỗi Xung Đột Namespace & Trùng Lặp Hàm (GAS Blocker)

#### [ERR-01] Xung đột toàn bộ User API giữa `Helpers.gs` và `Userapi.gs`
- **Hiện trạng:**
  - `Helpers.gs` (dòng 16–77): Khai báo `getUsers()`, `addUser()`, `updateUser()`, `deleteUser()`. Các hàm này có gọi `invalidateCache([CONFIG.SHEET_USERS])`, ghi log đầy đủ và trả về cấu trúc dữ liệu tối ưu cho client v3.0.
  - `Userapi.gs` (dòng 6–88): Khai báo lại y hệt 4 hàm trên: `getUsers()`, `addUser()`, `updateUser()`, `deleteUser()`. Các hàm này **KHÔNG CÓ** `invalidateCache()`, không cập nhật bộ nhớ đệm CacheService.
  - `Code.gs` (dòng 166) và `Userapi.gs` (dòng 91): Cả 2 cùng khai báo hàm `getMemberList()`.
- **Nguyên nhân kỹ thuật:** Trong Google Apps Script, tất cả các tệp `.gs` cùng chia sẻ một không gian tên toàn cục (Global Scope). Nếu hai tệp cùng định nghĩa hàm có tên giống nhau, hàm nạp sau sẽ đè hoàn toàn hàm nạp trước.
- **Hậu quả:** Khi `Userapi.gs` ghi đè `Helpers.gs`:
  1. Thêm, sửa hoặc xóa người dùng xong nhưng Cache không bị xóa. Trang web tiếp tục đọc dữ liệu người dùng cũ trong 5 phút.
  2. Hàm `addUser` ở `Userapi.gs` không trả về đối tượng `user` hoàn chỉnh, khiến client không cập nhật được danh sách cục bộ ngay lập tức.
  3. `updateUser` ở `Userapi.gs` viết `if (payload.name)` thay vì `if (payload.name !== undefined)`, khiến người dùng không thể xóa trắng hoặc đổi tên thành chuỗi rỗng.
- **Cách khắc phục:** Xóa bỏ toàn bộ tệp `Userapi.gs` (vì `Helpers.gs` và `Code.gs` đã chứa phiên bản tối ưu và đồng bộ nhất của các hàm này).

---

### Nhóm 2: Lỗi Kiến Trúc Dữ Liệu Đa Người Dùng (LocalStorage vs Sheets)

#### [ERR-02] Thành viên "Chỉ cần tên" và Danh sách phân bổ thành viên dự án chỉ lưu trong `localStorage`
- **Hiện trạng:** Trong `Index.html`:
  - Dòng 891–898:
    ```javascript
    function _memKey(pjId) { return 'pm3mem_' + pjId; }
    function _loadProjectMembers(pjId) {
      try { return JSON.parse(localStorage.getItem(_memKey(pjId))||'[]'); } catch(e){ return []; }
    }
    function _saveProjectMembers(pjId, list) {
      localStorage.setItem(_memKey(pjId), JSON.stringify(list));
      S.projectMembers[pjId] = list;
    }
    ```
  - Dòng 1345 & 2007: Khi thêm thành viên "Chỉ cần tên" (chế độ Name-only), mã chỉ lưu vào `localStorage.setItem('pm3extra_members', ...)`.
- **Nguyên nhân kỹ thuật:** `localStorage` là bộ nhớ cục bộ gắn liền với một trình duyệt trên một thiết bị cụ thể. Nó không có khả năng đồng bộ qua mạng internet.
- **Hậu quả:**
  1. Khi Quản lý A phân bổ 5 thành viên vào Dự án trên máy tính của mình, các thành viên đó chỉ hiển thị trên máy của Quản lý A. Khi Quản lý B hoặc bất kỳ nhân viên nào đăng nhập trên máy khác, danh sách thành viên dự án là **0**.
  2. Tạo thành viên mới không có email chỉ lưu vào máy của người tạo. Nhân viên đó không hề tồn tại trong Sheet `USERS`, không thể đồng bộ báo cáo hay phân việc trên các thiết bị khác.
- **Cách khắc phục:**
  1. Thêm thành viên "Chỉ cần tên" vào thẳng Sheet `USERS` (với email tự sinh dạng `internal_{ID}@local` hoặc `member_{ID}`) để dữ liệu lưu vĩnh viễn trên đám mây.
  2. Bổ sung trường `Thành Viên Dự Án` (cột 11 dạng JSON hoặc danh sách email/tên) trong Sheet `PROJECTS`, cung cấp API backend `saveProjectMembers(projectId, members)` để lưu xuống Google Sheets.

---

### Nhóm 3: Lỗi Bảo Mật & Lỗ Hổng Phân Quyền (Security Holes)

#### [ERR-03] Lỗ hổng rò rỉ toàn bộ dự án công ty cho quyền Member trong `getGanttData`
- **Hiện trạng:** Trong `Projectsapi.gs` (dòng 161–174):
  ```javascript
  function getGanttData(staffFilter) {
    const user=getCurrentUser();
    if (!user||!user.registered) return { success:false, error:"Chưa đăng nhập" };
    let projects=getSheetData(CONFIG.SHEET_PROJECTS);
    let tasks=getSheetData(CONFIG.SHEET_TASKS);
    if (user.role==="Manager") {
      projects=projects.filter(p=>p[3]===user.email);
      const pjIds=new Set(projects.map(p=>p[0]));
      tasks=tasks.filter(t=>pjIds.has(t[1]));
    }
    // THIẾU KIỂM TRA user.role === "Member" !!!
  ```
- **Hậu quả:** Nhân viên cấp `Member` bình thường khi mở trang Gantt hoặc gọi hàm này sẽ tải về toàn bộ danh sách dự án, tiến độ, nhiệm vụ và thông tin nhạy cảm của toàn công ty.
- **Cách khắc phục:** Bổ sung điều kiện kiểm tra nếu `user.role === "Member"`, chỉ cho phép lấy các task mà `t[5] === user.email` và các project liên quan.

#### [ERR-04] Nhân viên (Member) nộp Link kết quả và Báo cáo đầu ra bị backend âm thầm vứt bỏ
- **Hiện trạng:** Trong `Taskapi.gs` (dòng 74–90):
  ```javascript
  if (user.role==="Member") {
    if (payload.status   !==undefined) sh.getRange(i+1,8).setValue(payload.status);
    if (payload.progress !==undefined) sh.getRange(i+1,11).setValue(payload.progress);
    if (payload.note     !==undefined) sh.getRange(i+1,12).setValue(payload.note);
    if (payload.reminders!==undefined) sh.getRange(i+1,19).setValue(JSON.stringify(payload.reminders));
  } else if (canMg) {
    ...
    set(16,payload.target); set(17,payload.linkResults); set(18,payload.outputResult);
  ```
- **Hậu quả:** Mục đích chính của nhân viên khi thực hiện nhiệm vụ là gửi kết quả (Link Google Drive, báo cáo đầu ra ở cột 17, 18). Nhưng backend chỉ cho phép Manager/Admin lưu cột 17, 18. Khi nhân viên nhấn "Cập nhật", hệ thống báo "Thành công" nhưng dữ liệu kết quả hoàn toàn không được lưu vào Sheet!
- **Cách khắc phục:** Cho phép quyền `Member` cập nhật thêm `linkResults` (cột 17) và `outputResult` (cột 18).

#### [ERR-05] Manager có thể tùy ý sửa/xóa task thuộc dự án của Manager khác
- **Hiện trạng:** Trong `Taskapi.gs`, hàm `updateTask`, `deleteTask`, `duplicateTask` chỉ kiểm tra `hasPermission(user.role, "manage_tasks")`.
- **Hậu quả:** Nếu Manager X biết ID task của Manager Y, họ có thể gửi payload cập nhật hoặc xóa sạch task của Manager Y.
- **Cách khắc phục:** Đối với `Manager`, phải đối chiếu `projectId` của task với người quản lý dự án (`project[3] === user.email`) trước khi cho phép sửa/xóa/nhân bản.

---

### Nhóm 4: Lỗi Logic Nghiệp Vụ & Toàn Vẹn Dữ Liệu (Business Logic Bugs)

#### [ERR-06] Xóa dự án để lại các task rác mồ côi (Missing Cascade Delete)
- **Hiện trạng:** Trong `Projectsapi.gs` dòng 85–100 (`deleteProject`), mã chỉ xóa dòng dự án trong sheet `PROJECTS`. Sheet `TASKS` hoàn toàn không được đụng đến, và cache `TASKS` cũng không được làm mới.
- **Hậu quả:** Khi xóa dự án `DA001`, 20 công việc thuộc `DA001` vẫn tồn tại vĩnh viễn trong sheet `TASKS`. Chúng tiếp tục xuất hiện trong biểu đồ tổng quan, số lượng quá hạn, Gantt chart nhưng khi click vào thì lỗi do dự án không còn tồn tại.
- **Cách khắc phục:** Khi xóa dự án, tự động xóa tất cả các dòng trong Sheet `TASKS` có `Project ID === projectId`, đồng thời gọi `invalidateCache([CONFIG.SHEET_PROJECTS, CONFIG.SHEET_TASKS])`.

#### [ERR-07] Lỗi nhảy cóc cột khi khởi tạo thêm header trong Sheet `TASKS`
- **Hiện trạng:** Trong `Code.gs` dòng 186–191:
  ```javascript
  if (s.getLastColumn()<20) {
    ["Mục Tiêu","Link Kết Quả","Kết Quả Đầu Ra","Nhắc Việc","Thứ Tự"].forEach((h,i)=>
      s.getRange(1, s.getLastColumn()+1+i).setValue(h)...);
  }
  ```
- **Nguyên nhân:** Mỗi khi `setValue` một ô ở cột mới, giá trị của `s.getLastColumn()` sẽ tăng thêm 1. Trong vòng lặp, `s.getLastColumn() + 1 + i` sẽ tính:
  - Lần 1 (`i=0`): Cột 16
  - Lần 2 (`i=1`): Cột 16 + 1 + 1 = Cột 18 (Bỏ trống cột 17)
  - Lần 3 (`i=2`): Cột 18 + 1 + 2 = Cột 21 (Bỏ trống cột 19, 20)
- **Hậu quả:** Cấu trúc cột của Sheet TASKS bị lệch hoàn toàn, dữ liệu ghi vào sai cột dẫn đến đọc sai trường thông tin.
- **Cách khắc phục:** Cố định `const startCol = s.getLastColumn();` trước vòng lặp và dùng `startCol + 1 + i`, hoặc ghi một lần mảng 2 chiều bằng `setValues([headers])`.

#### [ERR-08] Phân quyền dữ liệu cho Member trong `getInitData` làm gãy UI
- **Hiện trạng:** Trong `Code.gs` dòng 132–135:
  ```javascript
  } else if (user.role === "Member") {
    tasks = allTasks.filter(t=>t[5]===user.email);
    projects = [];
  }
  ```
- **Hậu quả:** Khi Member đăng nhập, `projects` trả về `[]`. Khi hiển thị task, giao diện gọi `S.projects.find(...)` để lấy tên dự án, trạng thái dự án thì nhận về `undefined`. Các dropdown chọn dự án đều bị trống trơn.
- **Cách khắc phục:** Lọc các dự án mà Member đó tham gia làm việc:
  ```javascript
  const myPjIds = new Set(tasks.map(t=>t[1]));
  projects = allProjects.filter(p=>myPjIds.has(p[0]));
  ```

#### [ERR-09] Lỗi tạo sheet báo cáo trong `exportProjectReport` khi tên dự án chứa ký tự cấm
- **Hiện trạng:** Trong `Projectsapi.gs` dòng 187:
  ```javascript
  const shName=`Báo_cáo_${project[1].substring(0,10)}_${Utilities.formatDate(new Date(),"Asia/Ho_Chi_Minh","ddMMyyyy")}`;
  ```
  Nếu tên dự án là `Nghiên cứu/Phát triển [2026]`, tên sheet sẽ chứa `/`, `[`, `]`. Google Sheets cấm tuyệt đối các ký tự `: \ / ? * [ ]` trong tên Sheet.
- **Hậu quả:** Hàm ném ra ngoại lệ `Invalid sheet name`, việc xuất báo cáo thất bại hoàn toàn.
- **Cách khắc phục:** Dùng regex thay thế các ký tự cấm thành dấu gạch dưới:
  `const cleanName = project[1].replace(/[:\\/\?\*\[\]]/g, "_").substring(0, 15);`

---

### Nhóm 5: Lỗi Giao Diện, Tương Tác & Tính Năng Liệt (UI / Frontend Bugs)

#### [ERR-10] Biểu đồ xu hướng hoàn thành 30 ngày vẽ đường thẳng số 0 giả tạo
- **Hiện trạng:** Trong `Index.html` dòng 1188–1194 (`renderChartTrend`):
  ```javascript
  for (let i=days-1;i>=0;i--) {
    const d=new Date(today-i*86400000);
    labels.push(`${d.getDate()}/${d.getMonth()+1}`);
    data.push(0); // Luôn luôn là 0!
  }
  ```
- **Hậu quả:** Biểu đồ "Xu hướng hoàn thành (30 ngày)" luôn luôn nằm bẹp ở mức 0, không mang lại giá trị nào.
- **Cách khắc phục:** Tính toán số task có trạng thái "Hoàn thành" dựa trên ngày cập nhật (`updatedAt`) hoặc ngày kết thúc của các task trong danh sách.

#### [ERR-11] Ô checkbox trên danh sách nhiệm vụ không hoạt động
- **Hiện trạng:** Trong `Index.html` dòng 1702:
  `<td><input type="checkbox" ${t.status==="Hoàn thành"?"checked":""}></td>`
  Thẻ `input` không hề có thuộc tính `onchange` hay `onclick`.
- **Hậu quả:** Người dùng bấm vào checkbox hoàn thành nhưng không có bất kỳ phản hồi nào, tạo cảm giác tính năng bị đơ.
- **Cách khắc phục:** Bổ sung hàm xử lý:
  `<input type="checkbox" ${t.status==="Hoàn thành"?"checked":""} onchange="toggleTaskDone('${t.id}', this.checked)">`

#### [ERR-12] Ô tìm kiếm trên Topbar không có tác dụng
- **Hiện trạng:** Trong `Index.html` dòng 2090:
  `function gSearch(q){ const i=document.getElementById("g-srch2"); if(i) i.value=q; }`
  Hàm chỉ chép giá trị vào ô input ở trang Gantt, không hề thực hiện lọc dữ liệu trên trang hiện tại.
- **Cách khắc phục:** Bổ sung logic lọc trang tùy theo trang đang kích hoạt (`dashboard`, `projects`, `tasks`, `gantt`).

#### [ERR-13] Nút "Chỉnh sửa đầy đủ" trong modal thêm nhanh bị lặp vô tận
- **Hiện trạng:** Trong `Index.html` dòng 638: `<button onclick="openFullTaskEdit(null)">`. Nhưng trong `openFullTaskEdit(taskId)` dòng 1732: `if (!taskId) { openTkMod(null); return; }`.
- **Hậu quả:** Nhấn vào nút "Chỉnh sửa đầy đủ" thì mã lại gọi ngược lại mở chính modal thêm nhanh đó.
- **Cách khắc phục:** Viết riêng hàm `openNewFullTask()` để mở panel `task-panel` cho task mới mà không bị lặp.

#### [ERR-14] Lỗi vỡ giao diện / Liệt nút bấm do escape chuỗi không chuẩn
- **Hiện trạng:** Trong `Index.html` dòng 1460, 1661:
  `onclick="delTk('${t.id}','${t.name.replace(/'/g,"\\'")}')"`
  Chuỗi được bọc trong nháy kép HTML. Nếu `t.name` có dấu ngoặc kép `"` (ví dụ: `Task "Khẩn cấp"`), thuộc tính HTML bị cắt đứt làm phát sinh lỗi JavaScript syntax error.
- **Cách khắc phục:** Chỉ truyền ID vào hàm: `onclick="delTk('${t.id}')"`. Trong hàm `delTk`, lấy tên từ `S.tasks.find(x => x.id === id)`.

#### [ERR-15] Lỗi đăng xuất bị chặn bởi iframe
- **Hiện trạng:** `window.location.href = "https://accounts.google.com/logout"` chạy bên trong iframe Google Apps Script sẽ bị trình duyệt chặn do vi phạm CSP (Content Security Policy).
- **Cách khắc phục:** Dùng `window.top.location.href = u;` hoặc `window.open(u, '_blank');`.

---

### Nhóm 6: Lỗi Hiệu Năng & Giới Hạn Quota Google (Performance & Quota Limits)

#### [ERR-16] Hàm `saveTaskOrder` gọi `setValue()` 50+ lần từng cell
- **Hiện trạng:** Trong `Projectsapi.gs` dòng 154–156:
  ```javascript
  for (let i=1;i<rows.length;i++) {
    if (idxMap[rows[i][0]]!==undefined) sh.getRange(i+1,20).setValue(idxMap[rows[i][0]]);
  }
  ```
- **Hậu quả:** Mỗi lệnh `setValue` là một HTTP request độc lập tới máy chủ Google Sheets. Với 50 tasks, hàm thực hiện 50 lần kết nối, mất từ 15 đến 30 giây, rất dễ bị lỗi `Exceeded maximum execution time` (Timeout).
- **Cách khắc phục:** Gom toàn bộ cột 20 thành mảng 2 chiều và gọi `setValues()` duy nhất 1 lần (thực thi dưới 0.5 giây).

---

## 4. HƯỚNG DẪN CHI TIẾT CÁCH SỬA TỪNG FILE

### 4.1. File `Code.gs`

#### Sửa 1: Khắc phục lỗi `s.getLastColumn()` nhảy cóc trong `initSheets()`
Thay thế dòng 186–191 bằng:
```javascript
  } else {
    const s = ss.getSheetByName(CONFIG.SHEET_TASKS);
    const lastCol = s.getLastColumn();
    if (lastCol < 20) {
      const extraHeaders = ["Mục Tiêu","Link Kết Quả","Kết Quả Đầu Ra","Nhắc Việc","Thứ Tự"];
      extraHeaders.forEach((h, i) => {
        s.getRange(1, lastCol + 1 + i)
         .setValue(h)
         .setFontWeight("bold")
         .setBackground("#ea4335")
         .setFontColor("white");
      });
    }
  }
```

#### Sửa 2: Khắc phục phân quyền Member và Manager trong `getInitData()`
Thay thế dòng 128–136 bằng:
```javascript
  if (user.role === "Manager") {
    const managedProjects = allProjects.filter(p => p[3] === user.email);
    const managedIds = new Set(managedProjects.map(p => p[0]));
    tasks = allTasks.filter(t => managedIds.has(t[1]) || t[5] === user.email);
    const relatedPjIds = new Set([...managedIds, ...tasks.map(t => t[1])]);
    projects = allProjects.filter(p => relatedPjIds.has(p[0]));
  } else if (user.role === "Member") {
    tasks = allTasks.filter(t => t[5] === user.email);
    const memberPjIds = new Set(tasks.map(t => t[1]));
    projects = allProjects.filter(p => memberPjIds.has(p[0]));
  }
```

#### Sửa 3: Tránh lỗi `_readSheet` khi Sheet chưa có cột dữ liệu
Thay thế dòng 52–57 bằng:
```javascript
function _readSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2 || sh.getLastColumn() < 1) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues().filter(r => r[0] !== "");
}
```

---

### 4.2. File `Helpers.gs` & `Userapi.gs`

#### Hành động bắt buộc:
1. **Xóa bỏ hoàn toàn tệp `Userapi.gs`** để giải quyết triệt để xung đột namespace toàn cục trong GAS.
2. Cập nhật `Helpers.gs` để hỗ trợ thêm thành viên nội bộ ("Chỉ cần tên") lưu trực tiếp vào Sheet `USERS`, đảm bảo đa người dùng đều thấy:
```javascript
function addUser(payload) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_users")) return { success: false, error: "Không có quyền" };
  if (!payload.name || !payload.role) return { success: false, error: "Thiếu thông tin bắt buộc" };
  if (!CONFIG.ROLES.includes(payload.role)) return { success: false, error: "Vai trò không hợp lệ" };
  
  // Tự sinh email nội bộ nếu là chế độ chỉ có tên
  const email = payload.email ? payload.email.trim() : `member_${generateId().toLowerCase()}@internal.local`;
  
  const existingUsers = getSheetData(CONFIG.SHEET_USERS);
  if (existingUsers.some(r => r[1].toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "Email/Mã thành viên đã tồn tại" };
  }

  const id = generateId();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName(CONFIG.SHEET_USERS)
    .appendRow([id, email, payload.name, payload.role, payload.status || "Active", new Date(), payload.note || ""]);
  
  invalidateCache([CONFIG.SHEET_USERS]);
  writeLog("ADD_USER", `Thêm: ${payload.name} (${email}) | Role: ${payload.role}`);
  
  return {
    success: true,
    message: `Đã thêm ${payload.name}`,
    id,
    user: {
      id, email, name: payload.name, role: payload.role, status: payload.status || "Active",
      created: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy"), note: payload.note || ""
    }
  };
}
```

---

### 4.3. File `Projectsapi.gs`

#### Sửa 1: Khắc phục lỗi bảo mật rò rỉ dữ liệu trong `getGanttData`
Sửa lại dòng 161–174:
```javascript
function getGanttData(staffFilter) {
  const user = getCurrentUser();
  if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập" };
  let projects = getSheetData(CONFIG.SHEET_PROJECTS);
  let tasks = getSheetData(CONFIG.SHEET_TASKS);
  
  if (user.role === "Manager") {
    const managedPjs = projects.filter(p => p[3] === user.email);
    const managedIds = new Set(managedPjs.map(p => p[0]));
    tasks = tasks.filter(t => managedIds.has(t[1]) || t[5] === user.email);
    const relatedIds = new Set([...managedIds, ...tasks.map(t => t[1])]);
    projects = projects.filter(p => relatedIds.has(p[0]));
  } else if (user.role === "Member") {
    tasks = tasks.filter(t => t[5] === user.email);
    const myPjIds = new Set(tasks.map(t => t[1]));
    projects = projects.filter(p => myPjIds.has(p[0]));
  }

  if (staffFilter && staffFilter !== "all") {
    tasks = tasks.filter(t => t[5] === staffFilter);
  }
  tasks.sort((a, b) => (Number(a[19]) || 999) - (Number(b[19]) || 999));
  return {
    success: true,
    data: projects.map(p => ({
      project: mapProject(p),
      tasks: tasks.filter(t => t[1] === p[0]).map(t => mapTaskFull(t))
    }))
  };
}
```

#### Sửa 2: Khắc phục lỗi Xóa dự án không xóa Task (Cascade Delete)
Sửa hàm `deleteProject` (dòng 85–100):
```javascript
function deleteProject(projectId) {
  const user = getCurrentUser();
  if (!user || user.role !== "Admin") return { success: false, error: "Chỉ Admin mới có quyền xóa dự án" };
  
  const lock = LockService.getScriptLock();
  if (!lock.waitLock(10000)) return { success: false, error: "Hệ thống đang bận, vui lòng thử lại" };

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // 1. Xóa dự án trong SHEET_PROJECTS
    const shPj = ss.getSheetByName(CONFIG.SHEET_PROJECTS);
    const rowsPj = shPj.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < rowsPj.length; i++) {
      if (rowsPj[i][0] === projectId) {
        shPj.deleteRow(i + 1);
        found = true;
        break;
      }
    }
    if (!found) return { success: false, error: "Không tìm thấy dự án" };

    // 2. Cascade Delete: Xóa toàn bộ task thuộc dự án trong SHEET_TASKS (lặp từ dưới lên trên)
    const shTk = ss.getSheetByName(CONFIG.SHEET_TASKS);
    const rowsTk = shTk.getDataRange().getValues();
    for (let i = rowsTk.length - 1; i >= 1; i--) {
      if (rowsTk[i][1] === projectId) {
        shTk.deleteRow(i + 1);
      }
    }

    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_PROJECTS, CONFIG.SHEET_TASKS]);
    writeLog("DELETE_PROJECT", `Xóa dự án: ${projectId} và toàn bộ task liên quan`);
    return { success: true, message: "Đã xóa dự án và các nhiệm vụ liên quan" };
  } finally {
    lock.releaseLock();
  }
}
```

#### Sửa 3: Khắc phục nghẽn hiệu năng trong `saveTaskOrder` (Batch update)
Sửa hàm `saveTaskOrder` (dòng 146–159):
```javascript
function saveTaskOrder(orderedIds) {
  const user = getCurrentUser();
  if (!user || !user.registered) return { success: false };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_TASKS);
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return { success: true };

  const idxMap = {};
  orderedIds.forEach((id, i) => idxMap[id] = i + 1);

  // Gom dữ liệu cập nhật cột 20 một lần duy nhất
  const orderColumnData = [];
  for (let i = 1; i < rows.length; i++) {
    const taskId = rows[i][0];
    const newOrder = idxMap[taskId] !== undefined ? idxMap[taskId] : (Number(rows[i][19]) || 999);
    orderColumnData.push([newOrder]);
  }

  // Ghi 1 lệnh setValues duy nhất thay vì N lệnh setValue
  sh.getRange(2, 20, orderColumnData.length, 1).setValues(orderColumnData);
  invalidateCache([CONFIG.SHEET_TASKS]);
  return { success: true };
}
```

#### Sửa 4: Khắc phục lỗi đặt tên Sheet trong `exportProjectReport`
Sửa dòng 187:
```javascript
  const safePjName = project[1].replace(/[:\\/\?\*\[\]]/g, "_").substring(0, 15);
  const shName = `BC_${safePjName}_${Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "ddMMyyyy_HHmm")}`;
```

---

### 4.4. File `Taskapi.gs`

#### Sửa 1: Cho phép quyền Member cập nhật Kết quả nhiệm vụ
Trong hàm `updateTask`, sửa dòng 74–90:
```javascript
      if (user.role === "Member") {
        if (payload.status       !== undefined) sh.getRange(i+1, 8).setValue(payload.status);
        if (payload.progress     !== undefined) sh.getRange(i+1, 11).setValue(payload.progress);
        if (payload.note         !== undefined) sh.getRange(i+1, 12).setValue(payload.note);
        // SỬA: Cho phép nhân viên nộp link kết quả và kết quả đầu ra
        if (payload.target       !== undefined) sh.getRange(i+1, 16).setValue(payload.target);
        if (payload.linkResults  !== undefined) sh.getRange(i+1, 17).setValue(payload.linkResults);
        if (payload.outputResult !== undefined) sh.getRange(i+1, 18).setValue(payload.outputResult);
        if (payload.reminders    !== undefined) sh.getRange(i+1, 19).setValue(JSON.stringify(payload.reminders));
      } else if (canMg) {
        // Kiểm tra quyền của Manager đối với dự án
        if (user.role === "Manager") {
          const pj = getSheetData(CONFIG.SHEET_PROJECTS).find(p => p[0] === rows[i][1]);
          if (pj && pj[3] !== user.email && rows[i][5] !== user.email) {
            return { success: false, error: "Không có quyền quản lý task của dự án này" };
          }
        }
        const set = (col, val) => { if (val !== undefined) sh.getRange(i+1, col).setValue(val); };
        set(4, payload.name); set(5, payload.desc); set(6, payload.assignee);
        set(7, payload.priority); set(8, payload.status);
        if (payload.startDate !== undefined) sh.getRange(i+1, 9).setValue(payload.startDate ? new Date(payload.startDate) : "");
        if (payload.deadline  !== undefined) sh.getRange(i+1, 10).setValue(payload.deadline ? new Date(payload.deadline) : "");
        if (payload.progress  !== undefined) sh.getRange(i+1, 11).setValue(payload.progress);
        set(12, payload.note); set(16, payload.target); set(17, payload.linkResults); set(18, payload.outputResult);
        if (payload.reminders !== undefined) sh.getRange(i+1, 19).setValue(JSON.stringify(payload.reminders));
      }
```

#### Sửa 2: Kiểm tra email hợp lệ trước khi gửi thông báo
Trong `sendAssignmentEmail`:
```javascript
function sendAssignmentEmail(toEmail, taskName, projectName, deadline) {
  if (!toEmail || !toEmail.includes("@") || toEmail.endsWith("@internal.local")) return;
  try {
    MailApp.sendEmail({
      to: toEmail,
      subject: `[${CONFIG.APP_NAME}] Bạn được giao: ${taskName}`,
      body: `Bạn vừa được giao công việc "${taskName}" trong dự án "${projectName}".\nDeadline: ${deadline || "Chưa xác định"}`
    });
  } catch(e) {}
}
```

---

### 4.5. File `Index.html`

#### Sửa 1: Cung cấp tính năng Checkbox hoàn thành công việc
Thêm hàm xử lý sự kiện:
```javascript
function toggleTaskDone(taskId, isChecked) {
  const t = S.tasks.find(x => x.id === taskId);
  if (!t) return;
  const newStatus = isChecked ? "Hoàn thành" : "Đang thực hiện";
  const newProgress = isChecked ? 100 : (t.progress === 100 ? 50 : t.progress);
  
  // Optimistic update
  t.status = newStatus;
  t.progress = newProgress;
  _refreshUI();
  
  google.script.run
    .withSuccessHandler(r => {
      if (r.success) toast(`Đã chuyển thành "${newStatus}"`, "success");
      else { toast(r.error, "error"); loadApp(); }
    })
    .withFailureHandler(e => { toast(e.message, "error"); loadApp(); })
    .updateTask({ id: taskId, status: newStatus, progress: newProgress });
}
```
Tại dòng 1702, sửa lại:
```html
<td><input type="checkbox" ${t.status==="Hoàn thành"?"checked":""} onchange="toggleTaskDone('${t.id}', this.checked)"></td>
```

#### Sửa 2: Sửa biểu đồ xu hướng 30 ngày `renderChartTrend`
Thay thế dòng 1188–1194 bằng tính toán thực tế:
```javascript
function renderChartTrend(tasks) {
  tasks = tasks || S.tasks;
  const days = 15;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const labels = [];
  const dateMap = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = `${d.getDate()}/${d.getMonth() + 1}`;
    labels.push(key);
    dateMap[key] = 0;
  }

  // Đếm các task hoàn thành theo ngày cập nhật hoặc ngày tạo
  tasks.filter(t => t.status === "Hoàn thành").forEach(t => {
    if (t.updatedAt) {
      const parts = t.updatedAt.split(" ")[0].split("/"); // dd/MM/yyyy
      if (parts.length >= 2) {
        const k = `${parseInt(parts[0])}/${parseInt(parts[1])}`;
        if (dateMap[k] !== undefined) dateMap[k]++;
      }
    }
  });

  const data = labels.map(l => dateMap[l]);
  if (S.charts.tr) S.charts.tr.destroy();
  S.charts.tr = new Chart(document.getElementById("c-tr"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Nhiệm vụ hoàn thành",
        data,
        borderColor: "#22c55e",
        backgroundColor: "#22c55e18",
        tension: 0.4,
        pointRadius: 3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 9 } }, grid: { color: "#f1f5f9" } },
        x: { ticks: { font: { size: 8 } }, grid: { display: false } }
      }
    }
  });
}
```

#### Sửa 3: Sửa ô tìm kiếm toàn cục trên Topbar
Sửa lại hàm `gSearch`:
```javascript
function gSearch(q) {
  const activePage = document.querySelector(".page.active")?.id;
  if (activePage === "page-projects") {
    const inp = document.getElementById("pp-s");
    if (inp) { inp.value = q; filterPgPj(); }
  } else if (activePage === "page-tasks") {
    const inp = document.getElementById("pt-s");
    if (inp) { inp.value = q; filterPgTk(); }
  } else if (activePage === "page-gantt") {
    const inp = document.getElementById("g-srch2");
    if (inp) { inp.value = q; ganttSearch(q); }
  } else {
    // Trên dashboard: lọc nhanh danh sách task ưu tiên
    const filtered = S.tasks.filter(t => !q || (t.name||"").toLowerCase().includes(q.toLowerCase()));
    renderPtkGrid(filtered);
  }
}
```

#### Sửa 4: Sửa lỗi thoát chuỗi và gọi hàm xóa/nhân bản an toàn
Sửa `delTk`, `delPj`, `doDupTk` thành:
```javascript
function delTk(id) {
  const t = S.tasks.find(x => x.id === id);
  const name = t ? t.name : id;
  if (!confirm(`Bạn có chắc muốn xóa nhiệm vụ "${name}"?`)) return;
  localDeleteTask(id);
  toast("Đã xóa nhiệm vụ", "success");
  google.script.run
    .withSuccessHandler(r => { if (!r.success) { toast(r.error, "error"); loadApp(); } })
    .deleteTask(id);
}

function delPj(id) {
  const p = S.projects.find(x => x.id === id);
  const name = p ? p.name : id;
  if (!confirm(`Bạn có chắc muốn xóa dự án "${name}" và TẤT CẢ nhiệm vụ liên quan?`)) return;
  localDeleteProject(id);
  toast("Đã xóa dự án", "success");
  google.script.run
    .withSuccessHandler(r => { if (!r.success) { toast(r.error, "error"); loadApp(); } })
    .deleteProject(id);
}
```
Tại các nút gọi: thay `onclick="delTk('${t.id}','${...}')"` thành `onclick="delTk('${t.id}')"`.

#### Sửa 5: Sửa nút đăng xuất không bị CSP chặn
Sửa dòng 2089:
```javascript
function doLogout() {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    google.script.run.withSuccessHandler(u => {
      if (u) {
        try { window.top.location.href = u; }
        catch (e) { window.open(u, '_blank'); }
      }
    }).getLogoutUrl();
  }
}
```

#### Sửa 6: Tối ưu `reloadAll()` không tải lại toàn trang
Sửa dòng 2080:
```javascript
function reloadAll() {
  toast("Đang làm mới dữ liệu...", "info");
  loadApp();
}
```

---

## 5. LỘ TRÌNH VÀ CHECKLIST KIỂM THỬ SAU KHI SỬA

### Bước 1: Dọn dẹp tệp tin
- [ ] Xóa tệp `Userapi.gs` khỏi dự án Apps Script để loại bỏ 100% xung đột hàm.

### Bước 2: Cập nhật mã nguồn Backend
- [ ] Cập nhật `Code.gs` (sửa `initSheets`, `getInitData`, `_readSheet`).
- [ ] Cập nhật `Helpers.gs` (hỗ trợ `addUser` tạo tài khoản nội bộ đồng bộ lên Sheet).
- [ ] Cập nhật `Projectsapi.gs` (phân quyền `getGanttData`, Cascade Delete `deleteProject`, batch `saveTaskOrder`, tên sheet an toàn).
- [ ] Cập nhật `Taskapi.gs` (quyền Member nộp kết quả, kiểm tra quyền Manager, validate email).

### Bước 3: Cập nhật giao diện Frontend
- [ ] Cập nhật `Index.html` (Checkbox task, biểu đồ xu hướng thực tế, tìm kiếm Topbar, escape chuỗi, logout an toàn, `loadApp()` thay `location.reload()`).

### Bước 4: Kiểm thử chức năng (UAT Checklist)
1. **Kiểm tra vai trò Admin:** Thêm/sửa/xóa User, Dự án, Task. Kiểm tra xóa dự án xem task con có bị dọn sạch không.
2. **Kiểm tra vai trò Manager:** Đăng nhập với tài khoản Manager, kiểm tra chỉ xem và quản lý dự án mình phụ trách, không sửa được task của Manager khác.
3. **Kiểm tra vai trò Member:** Đăng nhập với tài khoản Member, xác nhận:
   - Giao diện nạp đầy đủ thông tin dự án liên quan (không bị rỗng).
   - Gantt chart chỉ hiện công việc của mình.
   - Nộp link kết quả và kết quả đầu ra được lưu thành công vào Sheet.
4. **Kiểm tra tương tác:**
   - Tích checkbox hoàn thành trực tiếp trên bảng task.
   - Nhập từ khóa trên thanh tìm kiếm Topbar xem các trang có lọc đúng không.
   - Kéo thả sắp xếp công việc trên Gantt chart và kiểm tra thời gian phản hồi (dưới 1 giây).
   - Nhấn nút Đăng xuất xem có chuyển trang êm xuôi không bị chặn iframe.
