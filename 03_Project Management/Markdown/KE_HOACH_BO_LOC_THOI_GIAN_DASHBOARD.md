# KẾ HOẠCH CHI TIẾT: TÍNH NĂNG BỘ LỌC THỜI GIAN TRÊN TRANG TỔNG QUAN (DASHBOARD)

> **Dự án:** Quản Lý Dự Án - Google Apps Script (Project Manager WebApp)  
> **Phiên bản cập nhật:** v3.2 - Dashboard Date Range Filter  
> **Ngày lập kế hoạch:** 24/10/2026  
> **Tài liệu tham khảo UI:** Thanh công cụ khoảng thời gian của Sơ đồ Gantt (`Từ: [date]` - `Đến: [date]`)

---

## 1. MỤC TIÊU & BỐI CẢNH DỰ ÁN

### 1.1. Hiện trạng
- Trang **Tổng Quan (Dashboard)** hiện tại đang thống kê toàn bộ dự án (`S.projects`) và toàn bộ nhiệm vụ (`S.tasks`) kể từ khi bắt đầu mà chưa có bộ lọc thời gian.
- Trên topbar chỉ có bộ lọc theo từng dự án cụ thể (`Lọc theo dự án...`).
- Người quản lý (Admin / PM) khi muốn xem báo cáo hiệu suất hoặc khối lượng công việc theo **tháng này**, **quý này**, hoặc một khoảng thời gian báo cáo tùy chọn (`Từ ngày ... Đến ngày ...`) thì chưa thể lọc trực tiếp trên Dashboard, buộc phải mở tab Gantt hoặc tải sheet báo cáo thủ công.

### 1.2. Mục tiêu đặt ra
1. **Bổ sung thanh lọc thời gian trực quan ngay trên Dashboard**, có phong cách thiết kế tương đồng và đồng bộ với thanh công cụ Gantt (`Từ: [date]` - `Đến: [date]`) như ảnh người dùng cung cấp.
2. **Cung cấp các nút bấm nhanh (Quick Presets):** `Tất cả`, `Hôm nay`, `Tuần này`, `Tháng này`, `Quý này`, `Năm nay` để thao tác 1-click nhanh chóng.
3. **Phản hồi tức thì (0ms - Memory-First):** Lọc trực tiếp trên tập dữ liệu đã có trong bộ nhớ `S`, không gọi mạng Apps Script khi đổi ngày, đảm bảo mượt mà 100% không giật lag.
4. **Cập nhật đồng bộ toàn bộ Dashboard:**
   - 4 thẻ thống kê KPI (`srow`: Tổng DA, Tổng NV, NV đang làm, NV quá hạn).
   - Thẻ Việc khẩn cấp / Quá hạn (`ptk-grid`).
   - Cả 6 biểu đồ phân tích (`c-st`, `c-pg`, `c-pri`, `c-sf`, `c-tr`, `c-cmp`).
   - Badge hiển thị số lượng bản ghi thỏa mãn điều kiện lọc.
5. **Đa ngôn ngữ hoàn hảo (i18n):** Tương thích đầy đủ với cơ chế chuyển đổi 3 ngôn ngữ: Tiếng Việt (VI), Tiếng Anh (EN), Tiếng Nhật (JA).

---

## 2. THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX)

### 2.1. Vị trí hiển thị
Thanh lọc thời gian sẽ được đặt ở đầu `d-body` của trang Tổng quan (ngay phía trên 4 thẻ thống kê KPI `srow`):

```
+-----------------------------------------------------------------------------------------+
| [TOPBAR] Tổng Quan - Chào mừng trở lại | [Lọc theo dự án] | [Tìm kiếm] | [Ngôn ngữ]   |
+-----------------------------------------------------------------------------------------+
| [DASHBOARD DATE TOOLBAR]                                                                |
| 📅 Khoảng thời gian:  Từ: [ 10/01/2026 📅 ]  Đến: [ 10/31/2026 📅 ]  [↺ Đặt lại]        |
| [Tất cả] [Hôm nay] [Tuần này] [Tháng này] [Quý này] [Năm nay]  | 📊 Hiển thị: 8 DA · 32 NV|
+-----------------------------------------------------------------------------------------+
| [THẺ KPI 1: TỔNG DỰ ÁN] [THẺ KPI 2: TỔNG NHIỆM VỤ] [THẺ KPI 3: ĐANG LÀM] [THẺ KPI 4: QUÁ HẠN] |
+-----------------------------------------------------------------------------------------+
| [Hoạt động gần đây]                             | [Việc Khẩn Cấp / Quá Hạn]             |
+-----------------------------------------------------------------------------------------+
| [Biểu đồ Trạng thái]  | [Biểu đồ Tiến độ DA]   | [Biểu đồ Độ ưu tiên]                  |
+-----------------------------------------------------------------------------------------+
| [Hiệu quả nhân viên]  | [Xu hướng hoàn thành]  | [So sánh dự án]                       |
+-----------------------------------------------------------------------------------------+
```

### 2.2. Chi tiết các phần tử trên thanh lọc
1. **Nhãn & Date Input:**
   - Nhãn `Từ:` đi kèm input `<input type="date" id="dash-from">`.
   - Nhãn `Đến:` đi kèm input `<input type="date" id="dash-to">`.
   - Styling: Bo góc `var(--r2)`, border mỏng `var(--bdr)`, padding chuẩn mực `6px 10px`, font chữ 12px sắc nét, tích hợp icon lịch gốc của trình duyệt.
2. **Nhóm nút chọn nhanh (Quick Presets):**
   - Nút bấm dạng pill badge (viên thuốc) nhỏ gọn, hiện đại:
     - `Tất cả` (`preset = 'all'`)
     - `Hôm nay` (`preset = 'today'`)
     - `Tuần này` (`preset = 'week'`)
     - `Tháng này` (`preset = 'month'`) - *Mặc định hoặc chọn sẵn*
     - `Quý này` (`preset = 'quarter'`)
     - `Năm nay` (`preset = 'year'`)
   - Nút đang được chọn sẽ có class `.active` với màu nền nổi bật `var(--p)` và chữ trắng.
3. **Nút Reset / Xem:**
   - Nút `↺` để đưa về trạng thái xem `Tất cả`.
4. **Badge thông tin kết quả (Filtered Info Badge):**
   - Hiển thị tóm tắt: `Hiển thị 8/11 DA · 32/45 Nhiệm vụ` (hoặc ngôn ngữ tương ứng EN/JA) giúp người dùng biết ngay mình đang xem bao nhiêu phần dữ liệu.

---

## 3. THIẾT KẾ LOGIC LỌC DỮ LIỆU (ALGORITHMS & FORMULAS)

### 3.1. Nguyên tắc giao thoa khoảng thời gian (Interval Overlap)
Để phản ánh chính xác nhất tiến độ công việc trong khoảng thời gian được lọc `[FilterStart, FilterEnd]`:

#### A. Đối với Nhiệm Vụ (Task)
Một nhiệm vụ được tính là **thuộc khoảng thời gian lọc** nếu:
1. **Có cả ngày bắt đầu và deadline:**
   Khoảng thời gian của task `[task.startDate, task.deadline]` giao thoa với khoảng lọc `[FilterStart, FilterEnd]`:
   $$\text{taskStart} \le \text{FilterEnd} \quad \text{VÀ} \quad \text{taskEnd} \ge \text{FilterStart}$$
2. **Chỉ có deadline (không có ngày bắt đầu):**
   $$\text{FilterStart} \le \text{task.deadline} \le \text{FilterEnd}$$
3. **Chỉ có ngày bắt đầu (không có deadline):**
   $$\text{FilterStart} \le \text{task.startDate} \le \text{FilterEnd}$$
4. **Không có cả 2 ngày:**
   - Nếu đang lọc ở chế độ `Tất cả`: Giữ lại.
   - Nếu đang lọc theo khoảng thời gian cụ thể: Bỏ qua (hoặc chỉ gom vào mục chờ xếp lịch).

#### B. Đối với Dự Án (Project)
Một dự án được tính là **thuộc khoảng thời gian lọc** nếu:
1. Dự án có khoảng thời gian `[project.startDate, project.endDate]` giao thoa với `[FilterStart, FilterEnd]`.
2. **HOẶC** dự án có chứa ít nhất một nhiệm vụ thỏa mãn điều kiện lọc thời gian ở trên.

### 3.2. Tính toán các mốc thời gian nhanh (Quick Presets)
- **Hôm nay (Today):** `from = to = Today` (00:00:00 đến 23:59:59).
- **Tuần này (This Week):** Từ Thứ 2 đầu tuần đến Chủ Nhật cuối tuần hiện tại.
- **Tháng này (This Month):** Từ ngày 1 của tháng hiện tại đến ngày cuối cùng của tháng hiện tại.
- **Quý này (This Quarter):**
  - Q1: 01/01 - 31/03
  - Q2: 01/04 - 30/06
  - Q3: 01/07 - 30/09
  - Q4: 01/10 - 31/12
- **Năm nay (This Year):** Từ 01/01 đến 31/12 của năm hiện tại.
- **Tất cả (All):** `from = null, to = null`.

---

## 4. THIẾT KẾ KIẾN TRÚC CODE & STATE MANAGEMENT

### 4.1. Bổ sung State trong biến toàn cục `S`
```javascript
const S = {
  // ... các state hiện có ...
  dashFilter: {
    preset: 'all',  // 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
    from: '',       // 'YYYY-MM-DD'
    to: '',         // 'YYYY-MM-DD'
  }
};
```

### 4.2. Các hàm xử lý nghiệp vụ chính
1. `initDashDateFilter()`:
   - Khởi tạo giá trị mặc định cho ô `dash-from` và `dash-to`.
   - Đọc tùy chọn đã lưu từ `localStorage` (nếu người dùng muốn nhớ bộ lọc lần trước).
2. `setDashPreset(preset)`:
   - Tính toán ngày `from` và `to` tương ứng với preset được click.
   - Gán giá trị vào `dash-from` và `dash-to`.
   - Đổi trạng thái class `.active` của các nút preset.
   - Gọi `applyDashFilter()`.
3. `onDashDateChange()`:
   - Kích hoạt khi người dùng thay đổi ngày thủ công trên date input.
   - Đặt `S.dashFilter.preset = 'custom'`.
   - Bỏ class `.active` ở các nút preset.
   - Gọi `applyDashFilter()`.
4. `getFilteredDashData()`:
   - Nhận vào toàn bộ `S.projects` và `S.tasks` (kết hợp cả bộ lọc dự án `pjFilter` trên topbar nếu có).
   - Áp dụng công thức giao thoa thời gian để trả về `{ filteredProjects, filteredTasks }`.
5. `applyDashFilter()`:
   - Lấy dữ liệu đã lọc từ `getFilteredDashData()`.
   - Tính toán lại tóm tắt summary:
     ```javascript
     const sm = _computeSummaryFromList(filteredProjects, filteredTasks);
     ```
   - Gọi lại các hàm render giao diện với dữ liệu đã lọc:
     ```javascript
     renderStats(sm);
     renderPtkGrid(filteredTasks);
     renderCharts(sm.taskByStatus, filteredTasks);
     updateDashFilterBadge(filteredProjects.length, filteredTasks.length);
     ```

---

## 5. BỔ SUNG ĐA NGÔN NGỮ (I18N)

Bổ sung các từ khóa mới vào từ điển `I18N` trong `Index.html`:

| Key | Tiếng Việt (`vi`) | Tiếng Anh (`en`) | Tiếng Nhật (`ja`) |
| :--- | :--- | :--- | :--- |
| `dash_filter_title` | `Khoảng thời gian:` | `Date Range:` | `期間指定:` |
| `dash_filter_from` | `Từ:` | `From:` | `開始:` |
| `dash_filter_to` | `Đến:` | `To:` | `終了:` |
| `dash_preset_all` | `Tất cả` | `All` | `すべて` |
| `dash_preset_today` | `Hôm nay` | `Today` | `今日` |
| `dash_preset_week` | `Tuần này` | `This Week` | `今週` |
| `dash_preset_month` | `Tháng này` | `This Month` | `今月` |
| `dash_preset_quarter`| `Quý này` | `This Quarter` | `今四半期` |
| `dash_preset_year` | `Năm nay` | `This Year` | `今年` |
| `dash_filter_badge` | `Hiển thị {pj} DA · {tk} Nhiệm vụ` | `Showing {pj} Projects · {tk} Tasks` | `表示中: {pj} PJ · {tk} タスク` |
| `dash_filter_reset` | `Đặt lại` | `Reset` | `リセット` |

---

## 6. LỘ TRÌNH THỰC HIỆN TỪNG BƯỚC (STEP-BY-STEP IMPLEMENTATION)

### Bước 1: Cập nhật cấu trúc HTML & CSS trên Dashboard
- Chèn khối `<div class="dash-filter-bar">` vào đầu `#d-body` trong `#page-dashboard`.
- Thêm CSS cho `.dash-filter-bar`, `.dash-preset-btn`, `.dash-filter-badge` với màu sắc bo góc, responsive (tự xuống hàng đẹp mắt trên màn hình nhỏ).

### Bước 2: Bổ sung từ điển `I18N`
- Thêm các khóa dịch thuật cho `vi`, `en`, `ja` vào đối tượng `I18N`.

### Bước 3: Cài đặt logic lọc ngày & hàm tính toán
- Viết các hàm: `initDashDateFilter()`, `setDashPreset()`, `onDashDateChange()`, `getFilteredDashData()`, `applyDashFilter()`.
- Tách hàm `_computeSummaryFromList(projects, tasks)` để tính toán chỉ số thống kê từ danh sách bất kỳ (thay vì cố định đọc từ toàn bộ `S.tasks`).

### Bước 4: Đồng bộ tương tác
- Tích hợp bộ lọc thời gian Dashboard với bộ lọc theo dự án ở topbar (`#pj-filter-sel`). Khi người dùng chọn 1 dự án trên topbar VÀ chọn khoảng thời gian, Dashboard sẽ lọc chính xác giao của 2 điều kiện.
- Gắn sự kiện `initDashDateFilter()` vào hàm khởi động `loadApp()`.
- Cập nhật lại thanh lọc thời gian khi chuyển đổi ngôn ngữ (`applyTranslations()`).

### Bước 5: Kiểm thử toàn diện & Đảm bảo an toàn
- Kiểm thử hiển thị trên 3 ngôn ngữ: VI, EN, JA.
- Kiểm thử các mốc nhanh: Hôm nay, Tuần này, Tháng này, Quý này, Năm nay, Tất cả.
- Kiểm thử nhập ngày tùy biến (Custom Date Range).
- Kiểm tra lại toàn bộ file bằng Node.js `vm.Script` đảm bảo không có lỗi cú pháp.

---

## 7. TIÊU CHÍ HOÀN THÀNH (ACCEPTANCE CRITERIA)
- [ ] Có thanh công cụ lọc thời gian tại tab Tổng Quan đúng giao diện như ảnh mẫu.
- [ ] Chuyển đổi qua lại giữa các nút chọn nhanh mượt mà (0ms).
- [ ] Thay đổi khoảng ngày lập tức cập nhật lại 4 thẻ KPI số liệu và 6 biểu đồ đồ thị.
- [ ] Hỗ trợ chuyển đổi ngôn ngữ mượt mà giữa Tiếng Việt, Tiếng Anh, Tiếng Nhật.
- [ ] Giữ nguyên tính toàn vẹn của mã nguồn, không ảnh hưởng đến bất kỳ tab nào khác (Gantt, Dự án, Nhiệm vụ, Người dùng, Nhật ký).
