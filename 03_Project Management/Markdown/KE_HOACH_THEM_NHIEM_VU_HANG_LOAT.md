# KẾ HOẠCH PHÁT TRIỂN TÍNH NĂNG: THÊM NHANH HÀNG LOẠT NHIỆM VỤ (BULK TASK CREATION)
**Dự án:** Quản Lý Dự Án Web App v3.0 (Google Apps Script)  
**Vị trí:** `c:\Users\Laptop\OneDrive\Desktop\Hello World\Google-Appscript\03_Project Management`  
**Ngày lập kế hoạch:** 21/10/2026  
**Trạng thái:** Bản đề xuất chi tiết (Ready for Review & Implementation)

---

## 1. TỔNG QUAN BÀI TOÁN & MỤC TIÊU NGHIỆP VỤ

### 1.1. Hiện trạng & Khó khăn của Quản lý Dự án (PM)
* **Vấn đề cốt lõi:** Khi một dự án mới được khởi tạo (ví dụ: dự án `JJK01_社会福祉法人十字会 工房ヴィレッジ新築工事` trên màn hình "Chi tiết dự án"), PM thường đã có sẵn danh sách cấu trúc phân chia công việc (WBS - Work Breakdown Structure) gồm 15 đến 50+ đầu việc (khảo sát, thiết kế sơ bộ, kết cấu, MEP, render 3D, bóc tách khối lượng, kiểm tra, nộp hồ sơ,...).
* **Hạn chế của luồng hiện tại:**
  * Người dùng phải bấm nút `+ Thêm nhiệm vụ` -> Gõ tên -> Chọn dự án -> Chọn người -> Chọn ngày -> Lưu -> Chờ backend Apps Script xử lý (1-2s) -> Mở lại modal -> Lặp lại quy trình từ 20 đến 50 lần.
  * Việc này tiêu tốn từ **15 đến 30 phút** thao tác lặp đi lặp lại rất mệt mỏi, dễ nản và dễ dẫn đến sai sót.

### 1.2. Mục tiêu giải pháp
* Cung cấp tính năng **"Thêm nhanh hàng loạt" (Bulk Add Tasks)** tích hợp trực tiếp ngay tại màn hình **Thêm nhiệm vụ** (`m-qtk`) và màn hình **Chi tiết dự án** (`m-pd`).
* Cho phép PM **Sao chép & Dán (Copy - Paste)** danh sách công việc từ bất kỳ nguồn nào:
  * File Excel / Google Sheets
  * Ghi chú Word / Notepad / Email / Zalo / Slack
  * Danh sách checklist gạch đầu dòng hoặc đánh số thứ tự
* Cho phép **áp dụng cấu hình chung (Batch Preset)** cho toàn bộ danh sách chỉ với 1 click (Người thực hiện mặc định, Deadline mặc định, Độ ưu tiên mặc định).
* Cung cấp **Bảng xem trước thông minh (Live Preview Grid)** để kiểm tra, chỉnh sửa hoặc xóa nhanh từng dòng trước khi lưu.
* **Thời gian hoàn thành:** Giảm thời gian tạo 30 công việc từ 20 phút xuống **dưới 30 giây**!

---

## 2. THIẾT KẾ TRẢI NGHIỆM NGƯỜI DÙNG & GIAO DIỆN (UX/UI)

### 2.1. Vị trí kích hoạt tính năng
1. **Ngay trong Modal "Thêm Nhiệm Vụ" (`m-qtk`):**
   * Bổ sung thanh chuyển đổi chế độ (**Segmented Tab Switcher**):
     * `[ 📝 Tạo đơn lẻ ]` | `[ ⚡ Tạo hàng loạt (Nhanh) ]`
   * Giữ nguyên 100% trải nghiệm cũ cho người dùng khi chỉ muốn tạo 1 việc duy nhất.
2. **Tại màn hình "Chi tiết dự án" (`m-pd`):**
   * Giữ nút `+ Thêm nhiệm vụ` màu xanh lá như hiện tại. Khi mở lên từ dự án nào, mặc định dự án đó sẽ được chọn sẵn và khóa lại để tránh chọn nhầm.
   * Có thể bổ sung thêm nút phụ nhỏ `⚡ Thêm hàng loạt` ngay cạnh nút `+ Thêm nhiệm vụ` để mở thẳng vào Tab Hàng loạt.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Thêm Nhiệm Vụ                                                     ✕   │
├────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────┬──────────────────────────────────────┐  │
│  │   📝 Thêm từng nhiệm vụ   │   ⚡ Thêm nhanh hàng loạt (Khuyên dùng) │  │
│  └───────────────────────────┴──────────────────────────────────────┘  │
│                                                                        │
│  [ Cấu hình mặc định áp dụng chung ]                                    │
│  Dự án: [ JJK01_社会福祉法人十字会 工房ヴィレッジ新築工事 ▼ ]          │
│  Người thực hiện: [ Nguyễn Văn A ▼ ]   Độ ưu tiên: [ Trung bình ▼ ]     │
│  Ngày bắt đầu: [ 21/10/2026 ]          Deadline: [ 30/10/2026 ]        │
│                                                                        │
│  [ Dán danh sách công việc (Mỗi dòng 1 việc) ]                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. Khảo sát hiện trạng mặt bằng                                  │  │
│  │ 2. Lập bản vẽ sơ bộ kiến trúc                                    │  │
│  │ 3. Thiết kế kết cấu móng và dầm                                 │  │
│  │ 4. Thiết kế hệ thống MEP                                         │  │
│  │ 5. Phối cảnh 3D nội ngoại thất                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  💡 Hỗ trợ: Dán trực tiếp từ Excel (Cột Tên | Người | Hạn chót)        │
│                                                                        │
│  [ Danh sách xem trước (5 công việc đã nhận diện) ]                    │
│  ┌──┬─────────────────────────────┬──────────────┬────────────┬────┐  │
│  │# │ Tên công việc               │ Phụ trách    │ Deadline   │Xóa │  │
│  ├──┼─────────────────────────────┼──────────────┼────────────┼────┤  │
│  │1 │ Khảo sát hiện trạng mặt bằng│ Nguyễn Văn A │ 30/10/2026 │ 🗑 │  │
│  │2 │ Lập bản vẽ sơ bộ kiến trúc  │ Nguyễn Văn A │ 30/10/2026 │ 🗑 │  │
│  │3 │ Thiết kế kết cấu móng và dầm│ Trần Thị B   │ 05/11/2026 │ 🗑 │  │
│  └──┴─────────────────────────────┴──────────────┴────────────┴────┘  │
│                                                                        │
│  [ Nút: + Thêm dòng trống ]                                            │
├────────────────────────────────────────────────────────────────────────┤
│  [ Hủy bỏ ]                                  [ 🚀 Tạo ngay 5 nhiệm vụ ]│
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Chi tiết các thành phần giao diện

#### A. Khối Cấu hình chung (Batch Presets)
* **Dự án (Project Selector):** Chọn dự án mục tiêu (tự động điền nếu mở từ màn hình chi tiết dự án).
* **Người thực hiện mặc định (Default Assignee):** Sử dụng combo chọn thành viên đã có trong hệ thống (`as-combo`). Tất cả các task mới tạo sẽ được gán cho người này nếu không chỉ định riêng.
* **Thời hạn hoàn thành mặc định (Default Deadline):** Cho phép đặt 1 ngày deadline chung cho cả đợt công việc (hoặc để trống nếu chưa có hạn).
* **Độ ưu tiên mặc định (Default Priority):** `Thấp`, `Trung bình` (mặc định), `Cao`, `Khẩn cấp`.
* **Trạng thái mặc định (Default Status):** Mặc định là `Chờ thực hiện`.

#### B. Khối Nhập liệu thông minh (Smart Input Area)
* Một ô `textarea` lớn với placeholder hướng dẫn rõ ràng.
* **Bộ lọc thông minh (Smart Cleaning Filter):**
  * Tự động nhận diện và gọt bỏ số thứ tự đầu dòng: `1.`, `2)`, `1 -`, `Task 1:`, `•`, `-`, `*`, `[ ]`.
  * Tự động loại bỏ các dòng trống hoặc khoảng trắng thừa.
* **Hỗ trợ Copy - Paste từ Excel / Google Sheets (Tab-Delimited):**
  * Nếu PM copy từ bảng Excel gồm nhiều cột, hệ thống tự động bóc tách theo thứ tự:
    * Cột 1: **Tên nhiệm vụ** (Bắt buộc).
    * Cột 2 (nếu có): **Người thực hiện** (Tự khớp với tên/email thành viên).
    * Cột 3 (nếu có): **Deadline** (Tự nhận dạng định dạng `dd/MM/yyyy` hoặc `yyyy-MM-dd`).
    * Cột 4 (nếu có): **Độ ưu tiên**.
  * Nếu chỉ dán danh sách thuần (chỉ có Tên công việc), các cột còn lại tự động lấy theo **Cấu hình chung**.

#### C. Bảng xem trước và chỉnh sửa trực tiếp (Live Preview Grid)
* Hiển thị bảng dạng bảng rút gọn:
  * Cột 1: STT (`#`).
  * Cột 2: **Tên nhiệm vụ** (input text, cho phép sửa trực tiếp nếu gõ sai hoặc muốn bổ sung chi tiết).
  * Cột 3: **Người thực hiện** (select hoặc input kế thừa từ preset).
  * Cột 4: **Deadline** (input date kế thừa từ preset).
  * Cột 5: **Độ ưu tiên** (select kế thừa từ preset).
  * Cột 6: **Hành động** (Nút icon thùng rác 🗑️ để loại bỏ ngay những dòng không muốn tạo).
* Nút `+ Thêm dòng`: Cho phép gõ thêm dòng mới ngay trên bảng mà không cần quay lại textarea.
* Badge đếm số lượng: Cập nhật động theo thời gian thực: `⚡ Đã phát hiện X nhiệm vụ hợp lệ`.

#### D. Trạng thái Xử lý & Phản hồi (Feedback & Loading State)
* Khi bấm `🚀 Tạo ngay X nhiệm vụ`:
  * Nút bấm chuyển sang trạng thái: `⏳ Đang tạo X nhiệm vụ...` và bị vô hiệu hóa (disabled) để tránh bấm đúp.
  * Hiển thị thanh tiến trình nhỏ (progress bar) hoặc thông báo toast: `"Đang lưu dữ liệu vào hệ thống..."`.
* Sau khi hoàn tất:
  * Đóng modal ngay lập tức.
  * Hiển thị thông báo thành công: `"Đã tạo thành công X nhiệm vụ vào dự án!"`.
  * Giao diện cập nhật tức thì (Local State Sync), các con số thống kê ("Tổng nhiệm vụ", "Đang thực hiện", "Tiến độ") trên màn hình "Chi tiết dự án" tự động nhảy số chính xác mà **không cần tải lại cả trang**.

---

## 3. THIẾT KẾ KIẾN TRÚC KỸ THUẬT & TỐI ƯU HÓA BACKEND

### 3.1. Điểm nghẽn hiệu năng trong Google Apps Script (GAS)
* **Nếu gọi `addTask` theo vòng lặp ở client:**
  * Giả sử tạo 25 task: Client sẽ gửi 25 request `google.script.run.addTask()`.
  * Mỗi request trong Google Apps Script mất trung bình 1.5 - 2 giây (gồm chi phí khởi tạo context, mở Spreadsheet, gọi `appendRow`, tính toán, flush cache).
  * Tổng thời gian: 25 × 1.5s = **37.5 giây**! Rất dễ bị ngắt kết nối mạng (Socket Hang Up / Connection Failed) như mã lỗi người dùng vừa gặp trong lịch sử hội thoại.
* **Giải pháp tối ưu: Xử lý ghi một lần (Batch / Bulk Write)**
  * Gom toàn bộ 25 tasks vào một mảng dữ liệu duy nhất gửi lên backend trong **1 request duy nhất**.
  * Sử dụng phương thức `sheet.getRange(startRow, 1, numRows, numCols).setValues(dataMatrix)` thay vì `appendRow`.
  * Thời gian ghi 25-50 dòng bằng `setValues()` chỉ mất khoảng **0.3 giây**!
  * Tổng thời gian API hoàn tất chỉ mất **dưới 1.5 giây**.

### 3.2. Thiết kế API Backend mới trong `Taskapi.gs`
Hàm backend mới: `addBulkTasks(payload)`

```javascript
/**
 * Thêm hàng loạt nhiệm vụ vào một dự án
 * @param {Object} payload { projectId: string, tasks: Array<Object> }
 * @returns {Object} { success: boolean, message: string, tasks: Array<Object> }
 */
function addBulkTasks(payload) {
  // 1. Kiểm tra xác thực & Phân quyền
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_tasks")) {
    return { success: false, error: "Bạn không có quyền tạo nhiệm vụ." };
  }
  if (!payload || !payload.projectId || !Array.isArray(payload.tasks) || payload.tasks.length === 0) {
    return { success: false, error: "Danh sách nhiệm vụ trống hoặc không hợp lệ." };
  }

  // 2. Kiểm tra dự án tồn tại & Quyền hạn của Manager
  const project = getSheetData(CONFIG.SHEET_PROJECTS).find(p => p[0] === payload.projectId);
  if (!project) return { success: false, error: "Dự án không tồn tại." };
  if (user.role === "Manager" && project[3] !== user.email) {
    return { success: false, error: "Bạn không có quyền quản lý dự án này." };
  }

  // 3. Chuẩn bị dữ liệu ghi
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_TASKS);
  const existing = getSheetData(CONFIG.SHEET_TASKS).filter(t => t[1] === payload.projectId);
  let maxOrder = existing.reduce((m, t) => Math.max(m, Number(t[19]) || 0), 0);

  const now = new Date();
  const tz = "Asia/Ho_Chi_Minh";
  const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);

  const rowsToAdd = [];
  const clientTasks = [];
  const emailsToSend = [];

  payload.tasks.forEach((item) => {
    if (!item.name || !item.name.trim()) return; // Bỏ qua task không có tên

    const id = generateId();
    maxOrder++;
    const startD = item.startDate ? new Date(item.startDate) : now;
    const deadD = item.deadline ? new Date(item.deadline) : "";
    const priority = item.priority || "Trung bình";
    const status = item.status || "Chờ thực hiện";
    const assignee = item.assignee || "";

    // Dòng dữ liệu chuẩn bị ghi vào Sheet TASKS (20 cột)
    rowsToAdd.push([
      id, payload.projectId, project[1], item.name.trim(), item.desc || "",
      assignee, priority, status,
      startD, deadD, 0, "", now, user.email, now,
      "", "", "", "[]", maxOrder
    ]);

    // Gom dữ liệu trả về cho client cập nhật Local State
    clientTasks.push({
      id, projectId: payload.projectId, projectName: project[1],
      name: item.name.trim(), desc: item.desc || "", assignee, priority, status,
      startDate: startD ? Utilities.formatDate(startD, tz, "dd/MM/yyyy") : "",
      startRaw: startD ? Utilities.formatDate(startD, tz, "yyyy-MM-dd") : "",
      deadline: deadD ? Utilities.formatDate(deadD, tz, "dd/MM/yyyy") : "",
      deadlineRaw: deadD ? Utilities.formatDate(deadD, tz, "yyyy-MM-dd") : "",
      progress: 0, note: "",
      created: Utilities.formatDate(now, tz, "dd/MM/yyyy HH:mm"),
      createdBy: user.email,
      updatedAt: Utilities.formatDate(now, tz, "dd/MM/yyyy HH:mm"),
      target: "", linkResults: "", outputResult: "", reminders: [],
      sortOrder: maxOrder,
      isOverdue: deadD && (deadD < todayMid) && status !== "Hoàn thành" && status !== "Hủy"
    });

    // Thu thập email cần gửi thông báo
    if (assignee) {
      emailsToSend.push({ assignee, taskName: item.name.trim(), deadline: deadD });
    }
  });

  if (rowsToAdd.length === 0) {
    return { success: false, error: "Không có nhiệm vụ hợp lệ nào để thêm." };
  }

  // 4. Ghi toàn bộ dữ liệu 1 lần duy nhất bằng setValues()
  const startRow = sh.getLastRow() + 1;
  sh.getRange(startRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
  SpreadsheetApp.flush();

  // 5. Cập nhật Cache & Tiến độ dự án 1 lần
  invalidateCache([CONFIG.SHEET_TASKS, CONFIG.SHEET_PROJECTS]);
  updateProjectProgress(payload.projectId);

  // 6. Gửi email thông báo (gửi gọn gàng)
  try {
    sendBulkAssignmentEmails(emailsToSend, project[1], user.email);
  } catch(e) {}

  // 7. Ghi Log hệ thống
  writeLog("ADD_BULK_TASKS", `Thêm nhanh ${rowsToAdd.length} task vào DA: "${project[1]}"`);

  return {
    success: true,
    message: `Đã tạo thành công ${rowsToAdd.length} nhiệm vụ!`,
    tasks: clientTasks
  };
}
```

---

## 4. THIẾT KẾ LOGIC PHÍA CLIENT (`Index.html`)

### 4.1. Bộ phân tích văn bản thông minh (Textarea Parser)
Khi người dùng gõ hoặc dán nội dung vào ô `textarea`, một hàm phân tích `parseBulkTaskInput()` sẽ chạy để chuyển văn bản thô thành danh sách đối tượng:
1. Tách chuỗi theo dấu xuống dòng `\n`.
2. Duyệt từng dòng:
   * Bỏ qua dòng trống.
   * Xóa các mẫu số thứ tự và ký tự đầu dòng bằng regex: `/^(\d+[\.\)\-:]\s*|[-*•]\s*|\[\s*\]\s*)/i`.
   * Kiểm tra xem dòng có ký tự phân tách phím Tab `\t` (do copy từ Excel) hoặc dấu gạch đứng `|` không:
     * Nếu có: Tách thành các trường `[Tên, Phụ trách, Deadline, Ưu tiên]`.
     * Nếu không có: Toàn bộ dòng là `Tên công việc`.
   * Gán các giá trị mặc định từ thanh Batch Presets cho các trường còn thiếu.
3. Cập nhật vào mảng dữ liệu nháp `_bulkDraftList` và render ra bảng xem trước.

### 4.2. Đồng bộ Local State & UI tức thì
Khi backend trả về `{ success: true, tasks: [...] }`:
1. Thêm toàn bộ các task mới vào biến trạng thái ứng dụng `S.tasks.push(...r.tasks)`.
2. Gọi hàm tính toán lại thống kê dự án `updatePdStats(_pdPjId)`.
3. Render lại danh sách nhiệm vụ trong modal "Chi tiết dự án" `renderPdTasks(_pdPjId)` hoặc giao diện chính `_refreshUI()`.
4. Người dùng thấy ngay kết quả trên màn hình trong chớp mắt mà không có hiện tượng giật lag hay trắng màn hình.

---

## 5. BẢNG PHÂN CÔNG THAY ĐỔI THEO TỪNG TỆP TIN

| Tệp tin | Vị trí thay đổi | Nội dung cụ thể |
|:---|:---|:---|
| **`Taskapi.gs`** | Cuối file | • Thêm hàm `addBulkTasks(payload)` xử lý ghi dữ liệu mảng (setValues).<br>• Thêm hàm phụ trợ `sendBulkAssignmentEmails()` gửi thông báo tập trung. |
| **`Index.html`** | Vùng CSS `<style>` | • Thêm CSS cho Tab Switcher (`.bulk-tabs`, `.bulk-tab`).<br>• Thêm CSS cho ô dán văn bản (`.bulk-textarea`) và Bảng xem trước (`.bulk-preview-tbl`, `.bulk-row`). |
| **`Index.html`** | Modal `m-qtk` (dòng 657) | • Bổ sung cấu trúc 2 Tab: Tab 1 "Thêm đơn lẻ" (giữ nguyên form hiện tại) và Tab 2 "Thêm hàng loạt".<br>• Bổ sung thanh Presets và vùng nhập liệu hàng loạt. |
| **`Index.html`** | Màn hình `m-pd` (dòng 566) | • Bổ sung nút bấm nhanh hoặc truyền tham số mở trực tiếp Tab Hàng loạt khi gọi từ dự án. |
| **`Index.html`** | Phần `<script>` CRUD | • Thêm các hàm JavaScript điều khiển:<br>&nbsp;&nbsp;+ `switchTaskModalTab(tabName)`<br>&nbsp;&nbsp;+ `handleBulkInput()`<br>&nbsp;&nbsp;+ `renderBulkPreview()`<br>&nbsp;&nbsp;+ `removeBulkItem(index)`<br>&nbsp;&nbsp;+ `addEmptyBulkRow()`<br>&nbsp;&nbsp;+ `saveBulkTasks()`<br>&nbsp;&nbsp;+ `localAddBulkTasks(newTasks)` |

---

## 6. KỊCH BẢN KIỂM THỬ (TEST CASES) & TIÊU CHÍ NGHIỆM THU

### 6.1. Danh sách kịch bản kiểm thử (Test Cases)
1. **TC-01: Dán danh sách văn bản thuần túy (Plain Text)**
   * Dán 10 dòng công việc từ Notepad (chỉ có tên).
   * *Kỳ vọng:* Hệ thống tạo đúng 10 task, toàn bộ kế thừa người thực hiện và deadline từ phần cấu hình chung.
2. **TC-02: Dán danh sách có số thứ tự đầu dòng**
   * Dán danh sách dạng:
     ```
     1. Khảo sát công trình
     2) Thiết kế bản vẽ
     - Kiểm tra khối lượng
     • Nghiệm thu
     ```
   * *Kỳ vọng:* Hệ thống tự động lọc sạch các ký tự `1.`, `2)`, `-`, `•`, chỉ lưu lại tên công việc sạch sẽ.
3. **TC-03: Dán dữ liệu từ bảng tính Excel / Google Sheets**
   * Copy 3 cột từ Excel (Tên, Người phụ trách, Hạn chót) và dán vào ô nhập.
   * *Kỳ vọng:* Bảng xem trước tự động phân loại đúng cột Tên, Người phụ trách và Deadline cho từng dòng.
4. **TC-04: Thao tác trực tiếp trên Bảng xem trước (Live Preview)**
   * Sửa tên 1 dòng, đổi deadline 1 dòng, xóa 1 dòng bằng nút 🗑️, thêm 1 dòng trống mới.
   * *Kỳ vọng:* Dữ liệu lưu đúng chính xác theo bảng xem trước sau khi chỉnh sửa.
5. **TC-05: Kiểm tra hiệu năng & Tốc độ lưu**
   * Tạo cùng lúc 30-50 nhiệm vụ.
   * *Kỳ vọng:* Thời gian từ lúc bấm "Tạo ngay" đến khi hoàn tất hiển thị trên màn hình dưới 2 giây. Không xảy ra lỗi timeout.
6. **TC-06: Kiểm tra cập nhật số liệu màn hình "Chi tiết dự án"**
   * Mở modal chi tiết dự án (như ảnh người dùng gửi), tạo nhanh 5 nhiệm vụ.
   * *Kỳ vọng:* Card "Tổng nhiệm vụ" tăng từ 0 lên 5 ngay lập tức; danh sách bên phải hiển thị đầy đủ 5 nhiệm vụ mà không cần đóng/mở lại modal.
7. **TC-07: Kiểm tra phân quyền**
   * Đăng nhập tài khoản Member: không thể tạo task trong dự án không được phân công. Manager chỉ được tạo trong dự án mình quản lý.

---

## 7. BƯỚC TIẾP THEO

Sau khi bạn duyệt qua bản kế hoạch này:
1. Tôi sẽ tiến hành triển khai hàm `addBulkTasks` trong `Taskapi.gs`.
2. Cập nhật giao diện Tab và Bảng nhập liệu trong `Index.html`.
3. Kiểm tra tính tương thích và vận hành trơn tru với các tính năng hiện có.

*Xin mời bạn cho ý kiến đóng góp hoặc xác nhận để bắt đầu thực hiện!*
