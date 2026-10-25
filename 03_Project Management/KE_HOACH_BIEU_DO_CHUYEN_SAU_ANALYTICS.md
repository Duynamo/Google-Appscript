# KẾ HOẠCH CHI TIẾT: TAB BIỂU ĐỒ CHUYÊN SÂU & PHÂN TÍCH ĐÓNG GÓP THÀNH VIÊN (ADVANCED ANALYTICS)

> **Dự án:** Quản Lý Dự Án - Google Apps Script (Project Manager WebApp)  
> **Phiên bản cập nhật:** v3.3 - Advanced Analytics & Member Contribution Dashboard  
> **Ngày lập kế hoạch:** 24/10/2026  
> **Mục tiêu chính:** Phân tích chuyên sâu mức độ đóng góp của thành viên, khối lượng công việc, tỷ lệ hoàn thành đúng hạn, và ma trận tham gia dự án đa chiều theo khung thời gian linh hoạt.

---

## 1. TỔNG QUAN YÊU CẦU & BÀI TOÁN QUẢN TRỊ

### 1.1. Bối cảnh & Nhu cầu thực tế
Hiện tại, trang **Tổng quan** chỉ cung cấp các chỉ số vĩ mô của toàn hệ thống (Tổng DA, Tổng NV, biểu đồ trạng thái chung). Khi người quản lý (Admin / PM / Manager) muốn đi sâu vào **năng lực nhân sự** và **hiệu quả thực thi**, hệ thống còn thiếu các góc nhìn:
1. **Đo lường mức độ đóng góp (Contribution & Workload):** Trong một dự án cụ thể hoặc trên toàn bộ dự án, ai là người gánh vác khối lượng công việc lớn nhất? Ai có tỷ lệ hoàn thành đúng hạn cao nhất? Ai đang gặp rủi ro quá hạn nhiều nhất?
2. **Theo dõi sự phân bổ của nhân viên (Cross-Project Participation):** Trong một khung thời gian cụ thể (ví dụ: Tháng này, Quý này), một nhân sự cụ thể đã tham gia vào những dự án nào? Dự án nào chiếm tỷ trọng lớn nhất? Họ có bị quá tải do phải phân tán nguồn lực qua quá nhiều dự án cùng lúc (context switching) hay không?

### 1.2. Ba trụ cột bộ lọc bắt buộc (Triple Filter System)
Tab Biểu đồ chuyên sâu sẽ được trang bị thanh công cụ 3 chiều:
1. **Khung thời gian (Date Range):**
   - Từ ngày (`an-from`) - Đến ngày (`an-to`).
   - Nút bấm chọn nhanh (Presets): `Tất cả`, `Hôm nay`, `Tuần này`, `Tháng này`, `Quý này`, `Năm nay`.
2. **Bộ lọc Dự án (Project Scope Filter):**
   - Lựa chọn: `Tất cả dự án` hoặc chọn đích danh 1 dự án cụ thể (`DA001`, `DA002`,...).
3. **Bộ lọc Nhân viên (Member / Staff Filter):**
   - Lựa chọn: `Tất cả nhân viên` (chế độ so sánh tổng thể) hoặc chọn đích danh 1 nhân viên (chế độ hồ sơ chuyên sâu cá nhân - Individual Deep-Dive).

---

## 2. ĐỀ XUẤT CÁC LOẠI BIỂU ĐỒ PHÙ HỢP CHO TỪNG MỤC ĐÍCH

Để đáp ứng chính xác 2 mục đích cốt lõi của người dùng, chúng tôi đề xuất hệ thống biểu đồ sử dụng thư viện **Chart.js 4.4.1** (đã tích hợp sẵn trong ứng dụng) kết hợp các biểu đồ tương tác hiện đại:

```
+---------------------------------------------------------------------------------------------------+
|                                 BỘ LỌC CHUYÊN SÂU 3 CHIỀU                                         |
| 📅 Khoảng thời gian: [Từ: 01/10/2026] [Đến: 31/10/2026] [Tháng này▾] | 📁 [Tất cả DA▾] | 👤 [Tất cả NV▾] |
+---------------------------------------------------------------------------------------------------+
|  MỤC ĐÍCH 1: MỨC ĐỘ ĐÓNG GÓP & HIỆU SUẤT                      MỤC ĐÍCH 2: THAM GIA ĐA DỰ ÁN       |
|  [Biểu đồ 1: Thanh ngang xếp chồng khối lượng & trạng thái]   [Biểu đồ 4: Donut tỷ trọng DA của NV]|
|  [Biểu đồ 2: Radar đa chiều năng lực đóng góp]                [Biểu đồ 5: Cột chồng theo thời gian]|
|  [Biểu đồ 3: Cột nhóm So sánh Hoàn thành vs Quá hạn]          [Biểu đồ 6: Ma trận tải công việc]   |
+---------------------------------------------------------------------------------------------------+
|  BẢNG DỮ LIỆU TỔNG HỢP CHI TIẾT (DRILL-DOWN TABLE VỚI TIẾN ĐỘ & NHIỆM VỤ CỤ THỂ)                  |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.1. MỤC ĐÍCH 1: ĐO LƯỜNG MỨC ĐỘ ĐÓNG GÓP CỦA THÀNH VIÊN
*(Áp dụng khi xem Trong 1 dự án HOẶC Toàn dự án)*

#### 📊 Biểu đồ 1: Stacked Horizontal Bar Chart (Thanh ngang xếp chồng Khối lượng & Trạng thái)
* **Loại biểu đồ:** Bar Chart (hướng ngang `indexAxis: 'y'`), chế độ `stacked: true`.
* **Trục tung (Y):** Danh sách các thành viên (A, B, C...).
* **Trục hoành (X):** Số lượng nhiệm vụ được phân công trong khoảng thời gian.
* **Các dải màu xếp chồng:**
  - 🟢 **Xanh lá (`#22c55e`):** Đã hoàn thành (Done).
  - 🔵 **Xanh dương (`#4f6ef7`):** Đang thực hiện (In Progress).
  - 🟡 **Vàng cam (`#f59e0b`):** Chờ thực hiện (Pending).
  - 🔴 **Đỏ (`#ef4444`):** Đang bị quá hạn (Overdue).
* **Tại sao tối ưu nhất cho mục đích này?**
  - **Trực quan hóa tức thì:** Trục ngang cho phép hiển thị tên nhân viên dài mà không bị che khuất.
  - Nhìn vào độ dài của thanh là thấy ngay **ai gánh việc nhiều nhất** (Tổng task).
  - Nhìn vào tỷ lệ màu xanh lá là thấy ngay **mức độ đóng góp thực tế** (Task đã hoàn thành).
  - Cảnh báo ngay rủi ro nếu thanh màu đỏ chiếm tỷ lệ lớn ở một nhân sự nào đó.

#### 🕸️ Biểu đồ 2: Radar Chart (Biểu đồ Mạng Nhện - Đa Chiều Năng Lực & Đóng Góp)
* **Loại biểu đồ:** Radar Chart (Biểu đồ mạng nhện đa trục).
* **Các trục đánh giá (5 khía cạnh vàng):**
  1. **Khối lượng gánh vác (Workload Volume):** Tỷ lệ % số task phụ trách trên tổng số task của dự án/đội nhóm.
  2. **Tỷ lệ hoàn thành (Completion Rate):** % task đã xong trên tổng task được giao.
  3. **Độ tin cậy thời gian (On-time Delivery Rate):** % task hoàn thành đúng hạn (không bị trễ deadline).
  4. **Gánh vác việc khó (High-Priority Ratio):** % task có độ ưu tiên "Khẩn cấp" hoặc "Cao" mà người đó xử lý.
  5. **Tốc độ xử lý (Activity Velocity):** Số lượt cập nhật / tiến độ trung bình đạt được trong kỳ.
* **Tại sao tối ưu nhất cho mục đích này?**
  - Giúp tránh việc chỉ đánh giá nhân sự qua số lượng task (vì 1 task khó khẩn cấp tốn công hơn 10 task dễ).
  - Cho phép so sánh song song 2-3 nhân viên trên cùng một khung radar để tìm ra cá nhân xuất sắc nhất hoặc cân đối lại tài nguyên.

#### 📈 Biểu đồ 3: Grouped Bar Chart (Cột Nhóm So Sánh Hiệu Suất & Rủi Ro)
* **Loại biểu đồ:** Bar Chart (Cột dọc nhóm đôi).
* **Trục hoành (X):** Các thành viên.
* **Cột kép so sánh:**
  - Cột 1 (Xanh lá): Tỷ lệ hoàn thành đúng hạn (%).
  - Cột 2 (Đỏ): Tỷ lệ quá hạn (%).
* **Đường trung bình (Trendline):** Đường chấm thể hiện tỷ lệ hoàn thành trung bình của cả đội (Team Benchmark) để xem ai đang vượt chuẩn và ai đang dưới chuẩn.

---

### 2.2. MỤC ĐÍCH 2: THEO DÕI THÀNH VIÊN ĐÃ THAM GIA CÁC DỰ ÁN NÀO
*(Áp dụng khi chọn 1 nhân viên cụ thể HOẶC phân tích ma trận luân chuyển dự án)*

#### 🍩 Biểu đồ 4: Donut Chart / Polar Area (Tỷ trọng Tham Gia Dự Án của Nhân Viên)
* **Loại biểu đồ:** Doughnut Chart với phần khuyết ở giữa hiển thị tổng số dự án (VD: `4 Dự án`).
* **Các phần tử (Slices):** Mỗi dự án là một lát cắt màu sắc riêng biệt (có nhãn tên dự án rõ ràng).
* **Giá trị hiển thị:**
  - Tùy chọn xem theo: **Số lượng nhiệm vụ** HOẶC **Thời lượng ước tính / Số ngày công**.
  - Tỷ lệ % đóng góp cho từng dự án (VD: 55% Dự án A, 30% Dự án B, 15% Dự án C).
* **Tại sao tối ưu nhất cho mục đích này?**
  - Cho người quản lý câu trả lời ngay lập tức: **"Nhân viên X đang dành bao nhiêu % công sức cho từng dự án trong tháng này?"**.
  - Phát hiện ngay tình trạng "chân trong chân ngoài" hoặc dàn trải quá mức dẫn đến giảm chất lượng công việc.

#### 📊 Biểu đồ 5: Stacked Bar Chart theo Thời Gian (Dòng Chảy Dự Án Theo Tuần/Tháng)
* **Loại biểu đồ:** Bar Chart xếp chồng theo trục thời gian (Time-series Stacked Bar).
* **Trục hoành (X):** Các mốc thời gian (Tuần 1, Tuần 2, Tuần 3, Tuần 4 hoặc Tháng 8, Tháng 9, Tháng 10).
* **Trục tung (Y):** Số lượng task hoàn thành của nhân viên đó.
* **Các dải màu:** Mỗi màu tương ứng với một Dự án mà nhân viên đó đóng góp trong khoảng thời gian đó.
* **Tại sao tối ưu nhất cho mục đích này?**
  - Thấy được diễn biến lịch sử: Ví dụ đầu tháng nhân viên tập trung làm Dự án 1, giữa tháng chuyển dịch sang làm Dự án 2, và cuối tháng bàn giao Dự án 3.

#### 🗺️ Biểu đồ 6: Workload Heatmap / Gantt Mini Matrix (Ma Trận Phân Bổ Nhiệm Vụ)
* **Loại hiển thị:** Bảng ma trận nhiệt (Grid Heatmap) hoặc Timeline bar mini.
* **Cột:** Danh sách các Dự án tham gia.
* **Hàng:** Các mốc thời gian hoặc danh sách trạng thái task.
* **Ô lưới:** Thể hiện số lượng task hoạt động trong khoảng thời gian chỉ định, ô càng đậm màu thể hiện mức độ tập trung càng cao.

---

## 3. THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX)

### 3.1. Vị trí trên thanh Sidebar
Thêm một mục menu mới trên Sidebar điều hướng:
* **Icon:** `📊`
* **Tiêu đề:** `Biểu đồ chuyên sâu` (hoặc `Phân tích chuyên sâu`)
* **Key i18n:** `nav_analytics`
* **Vị trí:** Đặt ngay dưới tab `Sơ đồ Gantt` và phía trên tab `Dự án`.

```html
<div class="sni" data-p="analytics" onclick="goPage('analytics',this)">
  <span class="ic">📊</span>
  <span data-i18n="nav_analytics">Biểu đồ chuyên sâu</span>
</div>
```

### 3.2. Bố cục trang `#page-analytics`

```
+----------------------------------------------------------------------------------------------------+
| TOPBAR: Biểu đồ chuyên sâu - Phân tích hiệu suất & mức độ đóng góp                                 |
+----------------------------------------------------------------------------------------------------+
| ══ THANH CÔNG CỤ BỘ LỌC CHUYÊN SÂU (STICKY TOOLBAR) ══════════════════════════════════════════════ |
|                                                                                                    |
| 📅 Khoảng thời gian:                                                                               |
|    Từ: [ 2026-10-01 📅 ]   Đến: [ 2026-10-31 📅 ]                                                  |
|    [Tất cả] [Hôm nay] [Tuần này] [*Tháng này*] [Quý này] [Năm nay]                                  |
|                                                                                                    |
| 📁 Dự án:                    👤 Nhân viên:                                🔄 [Làm mới]             |
|    [ Tất cả dự án       ▾ ]     [ Tất cả nhân viên (hoặc chọn 1 NV) ▾ ]    📊 [Xuất báo cáo]        |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
| ══ 4 THẺ CHỈ SỐ NHANH CỦA BỘ LỌC (KPI SUMMARY CARDS) ══════════════════════════════════════════════ |
| +-----------------+  +-----------------+  +-----------------+  +-----------------+                 |
| | 👥 NHÂN SỰ      |  | 📁 DỰ ÁN LIÊN   |  | 📋 TỔNG TASK    |  | 🎯 TỶ LỆ HOÀN   |                 |
| |    HOẠT ĐỘNG    |  |    QUAN         |  |    ĐÃ GIAO      |  |    THÀNH ĐÚNG HẠN|                |
| |    8 thành viên |  |    5 dự án      |  |    64 nhiệm vụ  |  |    87.5%        |                 |
| +-----------------+  +-----------------+  +-----------------+  +-----------------+                 |
+----------------------------------------------------------------------------------------------------+
| ══ KHUNG BIỂU ĐỒ 2 CỘT TƯƠNG TÁC (CHART GRID) ════════════════════════════════════════════════════ |
|                                                                                                    |
| [ CỘT TRÁI - ĐÓNG GÓP & HIỆU SUẤT ]              [ CỘT PHẢI - THAM GIA DỰ ÁN ]                    |
| +---------------------------------------------+  +-----------------------------------------------+ |
| | 📊 Khối lượng & Tiến độ theo thành viên    |  | 🍩 Tỷ trọng tham gia các dự án                | |
| |    (Stacked Horizontal Bar)                 |  |    (Doughnut / Polar Chart)                   | |
| |    [Canvas: an-chart-contribution]          |  |    [Canvas: an-chart-pj-share]                | |
| +---------------------------------------------+  +-----------------------------------------------+ |
|                                                                                                    |
| +---------------------------------------------+  +-----------------------------------------------+ |
| | 🕸️ Đánh giá đa chiều năng lực đóng góp      |  | 📈 Tiến độ đóng góp theo thời gian             | |
| |    (Radar Chart)                            |  |    (Time-series Stacked Bar)                  | |
| |    [Canvas: an-chart-radar]                 |  |    [Canvas: an-chart-trend]                   | |
| +---------------------------------------------+  +-----------------------------------------------+ |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
| ══ BẢNG TỔNG KẾT CHI TIẾT & DRILL-DOWN (MEMBER PERFORMANCE TABLE) ═════════════════════════════════ |
| [Tìm kiếm NV...]                                                        [Bộ lọc xếp hạng: Cao -> Thấp]|
| -------------------------------------------------------------------------------------------------- |
| Thành viên      | Dự án tham gia      | Tổng task | Đã xong | Đang làm | Quá hạn | Tỷ lệ HT | Xếp loại |
| -------------------------------------------------------------------------------------------------- |
| Nguyễn Văn A    | DA001, DA002 (2 DA) | 18 task   | 14 task | 3 task   | 1 task  | 77.8%    | ⭐ Tích cực|
| Trần Thị B      | DA001 (1 DA)        | 12 task   | 11 task | 1 task   | 0 task  | 91.7%    | 🏆 Xuất sắc|
| Lê Văn C        | DA002, DA003 (2 DA) | 8 task    | 4 task  | 2 task   | 2 task  | 50.0%    | ⚠️ Cần hỗ trợ|
+----------------------------------------------------------------------------------------------------+
```

---

## 4. LOGIC XỬ LÝ DỮ LIỆU & CÔNG THỨC TÍNH TOÁN (DATA FORMULAS)

### 4.1. Thuật toán Lọc Dữ Liệu 3 Chiều
Giả sử người dùng chọn:
- Khoảng thời gian: `[F_Start, F_End]`
- Dự án: `P_Id` (`'all'` hoặc mã dự án cụ thể)
- Nhân viên: `M_Email` (`'all'` hoặc danh sách email được chọn)

Quy trình lọc tập nhiệm vụ thỏa mãn:
```javascript
function getFilteredAnalyticsTasks(fStart, fEnd, projectId, selectedMembers) {
  return S.tasks.filter(task => {
    // 1. Lọc theo Dự án
    if (projectId && projectId !== 'all' && task.projectId !== projectId) {
      return false;
    }
    
    // 2. Lọc theo Nhân viên phụ trách (hỗ trợ nhiều người phụ trách cách nhau bằng dấu phẩy)
    if (selectedMembers && selectedMembers.length > 0 && !selectedMembers.includes('all')) {
      if (!task.assignee) return false;
      const assignees = String(task.assignee).split(',').map(s => s.trim().toLowerCase());
      const hasMatch = selectedMembers.some(m => assignees.includes(m.toLowerCase()));
      if (!hasMatch) return false;
    }
    
    // 3. Lọc theo Khoảng thời gian (Interval Overlap)
    if (fStart || fEnd) {
      const tStart = task.startDate ? parseLocalDate(task.startDate) : null;
      const tEnd = task.deadline ? parseLocalDate(task.deadline) : null;
      
      if (tStart && tEnd) {
        if (fEnd && tStart > fEnd) return false;
        if (fStart && tEnd < fStart) return false;
      } else if (tEnd) {
        if (fStart && tEnd < fStart) return false;
        if (fEnd && tEnd > fEnd) return false;
      } else if (tStart) {
        if (fStart && tStart < fStart) return false;
        if (fEnd && tStart > fEnd) return false;
      }
    }
    
    return true;
  });
}
```

### 4.2. Các công thức đo lường mức độ đóng góp (Contribution Metrics)

1. **Khối lượng đảm nhận (Task Share):**
   $$\text{Task Share (\%)} = \frac{\text{Số task của thành viên}}{\text{Tổng số task toàn bộ}} \times 100\%$$

2. **Tỷ lệ hoàn thành (Completion Rate):**
   $$\text{Completion Rate (\%)} = \frac{\text{Số task trạng thái 'Đã hoàn thành'}}{\text{Tổng số task của thành viên}} \times 100\%$$

3. **Chỉ số đúng hạn (On-Time Delivery Rate):**
   $$\text{On-Time Rate (\%)} = \frac{\text{Số task hoàn thành TRƯỚC hoặc ĐÚNG deadline}}{\text{Số task đã hoàn thành}} \times 100\%$$

4. **Chỉ số phân tán dự án (Project Distribution Index):**
   - Đếm số lượng dự án duy nhất (`unique projects`) mà thành viên có ít nhất 1 task trong kỳ:
   $$\text{Active Projects Count} = \text{Count}(\text{Unique}(task.projectId))$$
   - Cảnh báo phân tán: Nếu $\text{Active Projects} \ge 3$ trong 1 tháng $\rightarrow$ Gắn nhãn `⚠️ Nguy cơ phân tán nguồn lực`.

5. **Điểm đóng góp tổng hợp (Contribution Score - thang điểm 100):**
   $$\text{Score} = (W_1 \times \text{TaskCountNorm}) + (W_2 \times \text{CompletionRate}) + (W_3 \times \text{OnTimeRate}) + (W_4 \times \text{PriorityWeight})$$
   *(Trong đó các trọng số $W_1=0.3, W_2=0.3, W_3=0.2, W_4=0.2$ giúp phân hạng A, B, C một cách khách quan).*

---

## 5. THIẾT KẾ CÁC TRẠNG THÁI TƯƠNG TÁC (INTERACTIVE MODES)

Hệ thống sẽ tự động chuyển đổi giao diện thông minh tùy theo cách người dùng chọn bộ lọc:

### Kịch bản A: Xem Toàn bộ nhân viên (Chế độ So sánh đồng đội - Team Benchmark Mode)
* **Bộ lọc:** Dự án = `Tất cả` (hoặc 1 DA), Nhân viên = `Tất cả nhân viên`.
* **Biểu đồ hiển thị:**
  - **Biểu đồ 1:** Thanh ngang so sánh tổng khối lượng công việc và tiến độ của tất cả các thành viên.
  - **Biểu đồ 2:** Cột nhóm so sánh tỷ lệ hoàn thành đúng hạn vs trễ hạn giữa các thành viên.
  - **Biểu đồ 3:** Biểu đồ mạng nhện so sánh Top 3 nhân sự đóng góp nhiều nhất.
  - **Bảng tổng hợp:** Liệt kê toàn bộ nhân viên kèm xếp hạng đóng góp từ cao xuống thấp.

### Kịch bản B: Chọn 1 Nhân viên cụ thể (Chế độ Hồ sơ cá nhân - Member Deep-Dive Mode)
* **Bộ lọc:** Nhân viên = `Nguyễn Văn A` (chỉ 1 người duy nhất), Dự án = `Tất cả` (hoặc 1 DA).
* **Biểu đồ hiển thị tự động chuyển sang:**
  - **Biểu đồ 1 (Donut):** Phân bổ thời gian và số task qua các Dự án mà Nguyễn Văn A tham gia (VD: 60% Dự án X, 40% Dự án Y).
  - **Biểu đồ 2 (Tiến độ thời gian):** Lịch sử hoàn thành công việc của Nguyễn Văn A qua các tuần trong tháng.
  - **Biểu đồ 3 (Radar cá nhân):** Đánh giá 5 năng lực của riêng Nguyễn Văn A so với chuẩn trung bình của công ty.
  - **Bảng tổng hợp:** Liệt kê chi tiết từng Dự án của Nguyễn Văn A, số task trong mỗi dự án, và danh sách các task cần hoàn thành sắp tới.

### Kịch bản C: Chọn Nhiều Hơn 1 Thành Viên (Chế độ So sánh Trực Diện - Multi-Member Comparison Mode) ⭐
* **Cách thức chọn:** Người dùng mở dropdown danh sách nhân viên và **tick chọn từ 2 thành viên trở lên** (VD: Nguyễn Văn A, Trần Thị B, Lê Văn C). Nút dropdown sẽ cập nhật nhãn: `👤 Đang so sánh: 3 thành viên`.
* **Biểu đồ hiển thị tự động tối ưu hóa sang dạng đối chiếu:**
  1. **Biểu đồ Radar So Sánh Đa Giác (Multi-polygon Head-to-Head Radar):**
     - Vẽ chồng các lớp đa giác của từng thành viên với các màu sắc nhận diện riêng biệt (VD: Thành viên A viền xanh dương `#4f6ef7`, Thành viên B viền cam `#f97316`, Thành viên C viền tím `#8b5cf6`).
     - So sánh trực tiếp 5 chiều: Ai gánh nhiều task hơn? Ai hoàn thành đúng hạn tốt hơn? Ai chịu trách nhiệm giải quyết nhiều task khẩn cấp hơn?
  2. **Biểu đồ Thanh Ngang Đối Chiếu Khối Lượng & Trạng Thái (Filtered Stacked Bar):**
     - Chỉ gom đúng các thành viên được tick chọn đặt cạnh nhau để so sánh tỷ lệ `Đã xong / Đang làm / Quá hạn`.
  3. **Biểu đồ So Sánh Phân Bổ Dự Án (Cross-Project Workload Grouped Bar):**
     - **Trục hoành (X):** Các Dự án liên quan.
     - **Cột nhóm:** Mỗi dự án hiển thị các cột đại diện cho từng thành viên được chọn, cho biết: Trong Dự án X, Thành viên A làm mấy task so với Thành viên B và C? Ai đóng vai trò chủ chốt trong từng dự án cụ thể.
  4. **Bảng Đối Đầu & Xếp Hạng Trực Tiếp (Comparison Table):**
     - Chỉ hiển thị các thành viên được chọn, làm nổi bật người dẫn đầu từng chỉ số (Huy hiệu 🥇 🥈 🥉) giúp người quản lý cân nhắc phân bổ khối lượng công việc công bằng và chuẩn xác.

---

## 6. BỔ SUNG ĐA NGÔN NGỮ (I18N) CHO TAB BIỂU ĐỒ CHUYÊN SÂU

Cần bổ sung các từ khóa mới vào từ điển đa ngôn ngữ (`Index.html`) cho cả 3 thứ tiếng:

| Mã từ khóa (Key) | Tiếng Việt (`vi`) | Tiếng Anh (`en`) | Tiếng Nhật (`ja`) |
| :--- | :--- | :--- | :--- |
| `nav_analytics` | `Biểu đồ chuyên sâu` | `Advanced Analytics` | `高度な分析` |
| `an_title` | `Biểu đồ & Phân tích chuyên sâu` | `In-depth Analytics & Reports` | `高度な分析とレポート` |
| `an_sub` | `Đo lường mức độ đóng góp và sự tham gia dự án` | `Measure member contribution & project participation` | `メンバーの貢献度とプロジェクト参加状況の分析` |
| `an_filter_range` | `Khung thời gian:` | `Time Range:` | `期間指定:` |
| `an_filter_project` | `Bộ lọc dự án:` | `Project Scope:` | `プロジェクト指定:` |
| `an_filter_member` | `Thành viên phụ trách:` | `Assigned Member:` | `担当メンバー:` |
| `an_all_projects` | `Tất cả dự án` | `All Projects` | `すべてのプロジェクト` |
| `an_all_members` | `Tất cả nhân viên` | `All Members` | `すべてのメンバー` |
| `an_kpi_active_members`| `Nhân sự tham gia` | `Active Members` | `稼働メンバー` |
| `an_kpi_linked_projects`| `Dự án liên quan` | `Linked Projects` | `関連プロジェクト` |
| `an_kpi_total_tasks` | `Tổng nhiệm vụ` | `Total Tasks` | `総タスク数` |
| `an_kpi_ontime_rate` | `Tỷ lệ đúng hạn` | `On-time Delivery Rate` | `期日遵守率` |
| `an_chart_workload` | `Khối lượng & Tiến độ theo thành viên` | `Workload & Progress by Member` | `メンバー別の業務量と進捗` |
| `an_chart_radar` | `Đánh giá đa chiều năng lực đóng góp` | `Multi-dimensional Contribution Radar` | `多角的貢献度レーダー` |
| `an_chart_pj_share` | `Tỷ trọng tham gia các dự án` | `Project Participation Share` | `プロジェクト参加比率` |
| `an_chart_trend` | `Tiến độ đóng góp theo thời gian` | `Contribution Trend over Time` | `期間別の貢献推移` |
| `an_tbl_member` | `Thành viên` | `Member` | `メンバー` |
| `an_tbl_projects` | `Dự án tham gia` | `Participating Projects` | `参加プロジェクト` |
| `an_tbl_tasks` | `Số task` | `Task Count` | `タスク数` |
| `an_tbl_done` | `Đã xong` | `Completed` | `完了` |
| `an_tbl_progress` | `Đang làm` | `In Progress` | `進行中` |
| `an_tbl_overdue` | `Quá hạn` | `Overdue` | `遅延` |
| `an_tbl_rate` | `Tỷ lệ hoàn thành` | `Completion Rate` | `完了率` |
| `an_tbl_ranking` | `Đánh giá đóng góp` | `Contribution Evaluation` | `貢献度評価` |
| `an_comparing_members`| `Đang so sánh: {n} thành viên` | `Comparing: {n} members` | `比較中: {n} 名` |
| `an_export_btn` | `Xuất báo cáo` | `Export Report` | `レポート出力` |

---

## 7. KẾ HOẠCH TRIỂN KHAI MÃ NGUỒN TỪNG BƯỚC (IMPLEMENTATION ROADMAP)

### Bước 1: Bổ sung Sidebar Menu & Khung HTML
- Thêm item `Biểu đồ chuyên sâu` vào `#sb .sb-nav` trong `Index.html`.
- Tạo cấu trúc DOM `<div class="page" id="page-analytics">` gồm:
  - Thanh toolbar bộ lọc: `#an-from`, `#an-to`, nút presets, select `#an-pj-sel`, dropdown checklist `#an-mem-drop`.
  - Khung 4 thẻ chỉ số KPI nhanh.
  - Grid 4 khung vẽ canvas: `#an-chart-workload`, `#an-chart-radar`, `#an-chart-pj-share`, `#an-chart-trend`.
  - Bảng tổng kết dữ liệu chi tiết `#an-table-wrap`.

### Bước 2: Viết CSS giao diện hiện đại & tương thích
- Thiết kế CSS cho tab Analytics kế thừa biến màu của hệ thống (`--p`, `--g`, `--w`, `--d`, `--card`, `--bdr`).
- Responsive: Grid chuyển từ 2 cột sang 1 cột linh hoạt trên màn hình dưới 1024px.
- Styling bảng tổng kết có thanh tiến độ mini và badge xếp hạng bắt mắt.

### Bước 3: Cài đặt logic Javascript & Tích hợp Chart.js
- Lưu trữ state:
  ```javascript
  S.analyticsFilter = {
    from: '',
    to: '',
    preset: 'month',
    projectId: 'all',
    selectedMembers: ['all']
  };
  ```
- Quản lý vòng đời biểu đồ: Khai báo biến `let anCharts = {}` để lưu instance Chart.js; hủy `destroy()` trước khi render lại nhằm tránh đè canvas và rò rỉ bộ nhớ.
- Cài đặt các hàm chính:
  - `initAnalyticsPage()`: Khởi tạo dữ liệu ban đầu khi người dùng click vào tab.
  - `setAnalyticsPreset(preset)`: Đổi nhanh khoảng ngày theo tuần/tháng/quý/năm.
  - `renderAnalyticsCharts(filteredTasks)`: Xử lý thống kê và vẽ 4 biểu đồ.
  - `renderAnalyticsTable(filteredTasks)`: Hiển thị bảng số liệu chi tiết.

### Bước 4: Tích hợp Đa ngôn ngữ & Kiểm thử
- Cập nhật các hàm `applyTranslations()` để dịch tức thì toàn bộ nhãn và tiêu đề biểu đồ khi người dùng đổi ngôn ngữ (VI / EN / JA).
- Kiểm tra tính toán trên các tập dữ liệu thực tế (dự án có nhiều task, nhân viên tham gia nhiều dự án cùng lúc).
- Chạy kiểm tra cú pháp bằng Node.js script để đảm bảo không có lỗi runtime.

---

## 8. KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG
Kế hoạch trên giải quyết trọn vẹn và chuyên sâu 2 câu hỏi cốt lõi của ban quản lý:
1. **Ai đóng góp nhiều nhất, ai làm hiệu quả nhất trong từng dự án hoặc toàn công ty?** $\rightarrow$ Trả lời bằng **Stacked Bar Chart** và **Radar Chart**.
2. **Một nhân sự đang tham gia những dự án nào trong khoảng thời gian chỉ định?** $\rightarrow$ Trả lời bằng **Donut Project Share Chart** và **Time-series Contribution Trend**.

Toàn bộ giải pháp hoạt động dựa trên dữ liệu sẵn có trong bộ nhớ `S` (Memory-First 0ms), không làm tăng tải lên Google Spreadsheet, và hoàn toàn độc lập nên không gây ảnh hưởng đến các tính năng hiện có.
