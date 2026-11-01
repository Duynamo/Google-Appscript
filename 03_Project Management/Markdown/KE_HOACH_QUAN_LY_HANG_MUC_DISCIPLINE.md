# KẾ HOẠCH CHI TIẾT: HỆ THỐNG QUẢN TRỊ DANH MỤC TIÊU CHUẨN & MÃ HÓA CÔNG VIỆC 4 CẤP ĐỘ
### (MASTER TAXONOMY & WORK BREAKDOWN STANDARDIZATION)

> **Dự án:** Quản Lý Dự Án - Google Apps Script (Project Manager WebApp)  
> **Phiên bản cập nhật:** v3.4 - Enterprise Master Data & Code Taxonomy  
> **Ngày lập kế hoạch:** 24/10/2026  
> **Căn cứ thiết kế:** Chuẩn hóa theo tài liệu quản trị thực tế của công ty (`シート管理` - Quản lý Sheet chuẩn).

---

## 1. MỤC TIÊU & BÀI TOÁN QUẢN TRỊ TOÀN DIỆN

### 1.1. Hiện trạng & Cấp độ quản lý mong muốn
Theo mô hình quản trị thực tế của bạn, một công việc kỹ thuật/BIM/xây dựng không chỉ có 1 trường viết tắt đơn thuần, mà được cấu thành từ **hệ thống phân loại đa tầng (Multi-tier Hierarchy)**:
1. **Category (Nhóm công việc vĩ mô):** Định nghĩa bản chất đầu việc (`GE`, `DE`, `PC`, `M3`, `RP`, `MTG`).
2. **Phase dự án (Giai đoạn thực hiện):** Định nghĩa mốc vòng đời dự án (`BD`, `DD`, `IS`).
3. **Chi tiết công việc (Bộ môn chuyên môn / Discipline):** Định nghĩa chuyên ngành kỹ thuật trực tiếp thực hiện (`AR`, `STR`, `MP`, `ELE`, `PCP`, `PCL`).
4. **Mã dự án (Project Code):** Chuẩn hóa nhận diện công trình theo Năm + Ký hiệu + Tên chi tiết (`2026 HAG01 花見川終末処理場`, `2026 JJK01 十字会`).

### 1.2. Mục tiêu đạt được
* **Quản trị tập trung (Master Data Management):** Xây dựng một Tab chuyên biệt trên WebApp mang tên **"Danh Mục Tiêu Chuẩn" (Master Taxonomy / 基準管理)** cho phép Admin/PM quản lý cả 4 khối quy chuẩn trên.
* **Tự động hóa đặt tên nhiệm vụ (Auto-generated Code & Name):** Khi tạo task, nhân viên chỉ cần chọn từ các dropdown tương ứng $\rightarrow$ Hệ thống tự động ghép mã tiền tố chuẩn xác 100% (ví dụ: `[M3-BD-AR] Dựng hình kiến trúc Tầng 1`), loại bỏ hoàn toàn việc gõ tay tùy tiện.
* **Đột phá về Khả năng Phân tích (Analytics Power):** Tab Biểu đồ chuyên sâu có thể phân tích đa chiều:
  - Tỷ lệ thời gian công ty dành cho `Dựng hình 3D (M3)` vs `Xử lý Point Cloud (PC)` vs `Họp hành (MTG)`.
  - Tiến độ theo từng Giai đoạn: Cơ sở (`BD`) vs Chi tiết (`DD`) vs Nghiệm thu (`IS`).
  - Khối lượng gánh vác của từng nhân sự theo chuyên môn: Kiến trúc (`AR`), Kết cấu (`STR`), Thiết bị (`MP`), Điện (`ELE`).

---

## 2. HỆ THỐNG DANH MỤC 4 CẤP ĐỘ THEO CHUẨN DOANH NGHIỆP

Dưới đây là bảng quy chuẩn được số hóa chính xác từ tài liệu `シート管理` của bạn:

```
+-------------------------------------------------------------------------------------------------------+
|                                HỆ THỐNG PHÂN LOẠI CÔNG VIỆC CHUẨN                                     |
+-------------------------------------------------------------------------------------------------------+
| [ CẤP 1: CATEGORY ]  --->  [ CẤP 2: PHASE DỰ ÁN ]  --->  [ CẤP 3: CHI TIẾT CÔNG VIỆC (DISCIPLINE) ]  |
|  GE  : Đầu việc chung       BD : Thiết kế cơ sở           AR  : Dựng hình kiến trúc                   |
|  DE  : Mục phát triển       DD : Thiết kế chi tiết        STR : Dựng hình kết cấu                     |
|  PC  : Xử lý Point cloud    IS : Nghiệm thu               MP  : Dựng hình thiết bị                    |
|  M3  : Dựng mô hình 3D                                    ELE : Dựng hình hệ điện                     |
|  RP  : Tạo báo cáo                                        PCP : Point cloud processing                |
|  MTG : Họp hành                                           PCL : Point cloud layering                  |
+-------------------------------------------------------------------------------------------------------+
| [ CẤP 4: QUY CHUẨN MÃ DỰ ÁN ]                                                                         |
|  Năm [ 2026 ]  +  Ký hiệu [ HAG01 ]  +  Chi tiết [ 花見川終末処理場 ]  ==> Mã DA: [ 2026_HAG01 ]     |
|  Năm [ 2026 ]  +  Ký hiệu [ JJK01 ]  +  Chi tiết [ 十字会 ]            ==> Mã DA: [ 2026_JJK01 ]     |
+-------------------------------------------------------------------------------------------------------+
```

---

### 2.1. CẤP 1: CATEGORY (HẠNG MỤC CÔNG VIỆC LỚN)
| Mã viết tắt | Tên phân loại (Tiếng Việt) | Giải thích phạm vi | Màu đại diện |
| :---: | :--- | :--- | :---: |
| **GE** | **General** | Bao gồm tất cả các đầu việc chung, quản lý, điều phối | `#64748b` (Xám) |
| **DE** | **Develop** | Bao gồm các hạng mục nghiên cứu, phát triển công cụ, tool, script | `#8b5cf6` (Tím) |
| **PC** | **Point Cloud** | Bao gồm tất cả các hạng mục liên quan đến dữ liệu quét 3D laser | `#06b6d4` (Xanh ngọc) |
| **M3** | **3D Modeling** | Bao gồm tất cả các hạng mục dựng mô hình BIM/3D | `#4f6ef7` (Xanh dương) |
| **RP** | **Report** | Bao gồm tất cả các hạng mục lập hồ sơ, tạo báo cáo, nghiệm thu | `#f59e0b` (Vàng hổ phách) |
| **MTG**| **Meeting** | Bao gồm tất cả các cuộc họp trao đổi kỹ thuật, tiến độ nội bộ & khách hàng | `#ec4899` (Hồng) |

---

### 2.2. CẤP 2: PHASE DỰ ÁN (GIAI ĐOẠN THỰC HIỆN)
| Mã viết tắt | Tên giai đoạn | Ý nghĩa chuyên môn | Ghi chú |
| :---: | :--- | :--- | :--- |
| **BD** | **Basic Design** | Thiết kế cơ sở / Ý tưởng ban đầu | Giai đoạn dựng phác thảo & chốt phương án |
| **DD** | **Detail Design** | Thiết kế chi tiết / Bản vẽ thi công kỹ thuật | Giai đoạn dựng mô hình chính xác & chi tiết |
| **IS** | **Inspection** | Nghiệm thu / Đánh giá kiểm tra chất lượng | Rà soát va chạm (clash check) & nghiệm thu |

---

### 2.3. CẤP 3: CHI TIẾT CÔNG VIỆC (DISCIPLINE / BỘ MÔN CHUYÊN SÂU)
| Mã viết tắt | Tên bộ môn chuyên sâu | Giải thích công việc | Thuộc nhóm Category gợi ý |
| :---: | :--- | :--- | :---: |
| **AR** | **Dựng hình kiến trúc** | Architecture modeling: Tường, sàn, mái, cửa, bố cục | `M3` |
| **STR** | **Dựng hình kết cấu** | Structure modeling: Móng, cột, dầm, sàn kết cấu, thép | `M3` |
| **MP** | **Dựng hình thiết bị** | Mechanical & Piping: Thiết bị cơ khí, bồn bể, đường ống công nghệ | `M3` |
| **ELE** | **Dựng hình hệ điện** | Electrical: Máng cáp, tủ điện, thiết bị chiếu sáng, điện nhẹ | `M3` |
| **PCP** | **Point cloud processing** | Xử lý dữ liệu point cloud: Làm sạch nhiễu, ghép trạm scan, định tọa độ | `PC` |
| **PCL** | **Point cloud layering** | Chia layer point cloud: Tách đối tượng kiến trúc, kết cấu, MEP theo tầng | `PC` |

---

### 2.4. CẤP 4: QUY CHUẨN MÃ DỰ ÁN (PROJECT CODE SCHEMA)
Công thức chuẩn hóa mã dự án: `[Năm]_[Ký_Hiệu]` đi kèm `Chi tiết tên gốc công trình (tiếng Nhật/Việt)`:

| Năm (`Year`) | Ký hiệu (`Code`) | Mã chuẩn hệ thống | Chi tiết tên gốc (`Project Detail`) |
| :---: | :---: | :---: | :--- |
| `2026` | `HAG01` | **2026_HAG01** | 花見川終末処理場 (Trạm xử lý nước thải Hanamigawa) |
| `2026` | `JJK01` | **2026_JJK01** | 十字会 (Công trình Hội Chữ thập đỏ / Jyujikai) |

---

## 3. CÔNG THỨC GHÉP MÃ TỰ ĐỘNG CHO TÊN NHIỆM VỤ (AUTO-PREFIX FORMULA)

Khi toàn bộ 4 cấp độ được kết hợp, tên của mỗi task sẽ được chuẩn hóa tuyệt đối:

$$\text{Mã Tiền Tố (Task Prefix)} = \mathbf{[\,Category - Phase - Discipline\,]}$$
$$\text{Tên Đầy Đủ} = \mathbf{[\,Category - Phase - Discipline\,] \text{ } - \text{ } \text{Nội dung công việc}}$$

### Các ví dụ thực tế chuẩn chỉ:
1. Nhiệm vụ dựng kiến trúc cơ sở cho dự án Hanamigawa:
   - Dự án: `2026_HAG01 (花見川終末処理場)`
   - Tên task chuẩn: `[M3-BD-AR] Dựng hình kiến trúc khối nhà điều hành`
2. Nhiệm vụ nghiệm thu đường ống thiết bị:
   - Tên task chuẩn: `[M3-IS-MP] Nghiệm thu va chạm đường ống bơm áp lực`
3. Nhiệm vụ chia layer dữ liệu quét 3D:
   - Tên task chuẩn: `[PC-PCL] Chia layer point cloud khu vực xử lý bùn`
4. Nhiệm vụ họp tiến độ định kỳ:
   - Tên task chuẩn: `[GE-MTG] Họp kỹ thuật tuần với khách hàng Nhật Bản`

---

## 4. THIẾT KẾ GIAO DIỆN TAB MỚI: "DANH MỤC TIÊU CHUẨN" (`#page-taxonomy`)

### 4.1. Vị trí trên Sidebar điều hướng
Thêm mục menu mới trên Sidebar (dành cho Admin / Manager):
* **Icon:** `📐`
* **Tiêu đề:** `Danh mục tiêu chuẩn` (Key i18n: `nav_taxonomy`)
* **Vị trí:** Đặt giữa mục `Người dùng` và `Nhật ký`.

```html
<div class="sni" id="ni-taxonomy" data-p="taxonomy" onclick="goPage('taxonomy',this)">
  <span class="ic">📐</span>
  <span data-i18n="nav_taxonomy">Danh mục tiêu chuẩn</span>
</div>
```

---

### 4.2. Bố cục 4 Thẻ Quản Trị Độc Lập (4-Card Sub-Tabs Layout)

Trang `#page-taxonomy` được chia thành **4 khối thẻ trực quan (Card Layout)** tương ứng đúng 4 cấp độ quản trị:

```
+----------------------------------------------------------------------------------------------------+
| TOPBAR: Danh Mục Tiêu Chuẩn - Quy Định Mã Hóa Dự Án & Đầu Việc                                     |
+----------------------------------------------------------------------------------------------------+
| ══ CÁC TAB CHUYỂN ĐỔI NHANH (SUB-NAV TABS) ═══════════════════════════════════════════════════════ |
|  [ 🏷️ 1. Category (Nhóm lớn) ]   [ ⏱️ 2. Phase (Giai đoạn) ]                                       |
|  [ 📐 3. Chi tiết công việc ]     [ 📁 4. Mã dự án ]             [⚡ Nạp lại dữ liệu gốc từ Sheet]  |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
| ══ NỘI DUNG THẺ 1: CATEGORY (NHÓM CÔNG VIỆC VĨ MÔ) ═══════════════════════════════════════════════ |
| [+ Thêm Category Mới]                                                    [🔍 Tìm kiếm Category...] |
| -------------------------------------------------------------------------------------------------- |
| Mã viết tắt | Tên phân loại  | Giải thích phạm vi công việc               | Màu Badge | Thao tác   |
| -------------------------------------------------------------------------------------------------- |
| GE          | General        | Bao gồm tất cả các đầu việc chung          | 🔘 #64748b| ✏️ Sửa  🗑️ |
| DE          | Develop        | Bao gồm các hạng mục phát triển tool/script| 🟣 #8b5cf6| ✏️ Sửa  🗑️ |
| PC          | Point Cloud    | Bao gồm tất cả hạng mục xử lý point cloud  | 🩵 #06b6d4| ✏️ Sửa  🗑️ |
| M3          | 3D Modeling    | Bao gồm tất cả hạng mục dựng mô hình 3D    | 🔵 #4f6ef7| ✏️ Sửa  🗑️ |
| RP          | Report         | Bao gồm tất cả các hạng mục tạo báo cáo    | 🟡 #f59e0b| ✏️ Sửa  🗑️ |
| MTG         | Meeting        | Bao gồm tất cả các hạng mục họp hành       | 🌸 #ec4899| ✏️ Sửa  🗑️ |
| -------------------------------------------------------------------------------------------------- |
|                                                                                                    |
| ══ NỘI DUNG THẺ 2: PHASE DỰ ÁN (GIAI ĐOẠN THỰC HIỆN) ══════════════════════════════════════════════ |
| [+ Thêm Phase Mới]                                                                                 |
| -------------------------------------------------------------------------------------------------- |
| Mã viết tắt | Tên Phase          | Giải thích ý nghĩa                                  | Thao tác   |
| -------------------------------------------------------------------------------------------------- |
| BD          | Basic Design       | Thiết kế cơ sở                                      | ✏️ Sửa  🗑️ |
| DD          | Detail Design      | Thiết kế chi tiết                                   | ✏️ Sửa  🗑️ |
| IS          | Inspection         | Nghiệm thu                                          | ✏️ Sửa  🗑️ |
| -------------------------------------------------------------------------------------------------- |
|                                                                                                    |
| ══ NỘI DUNG THẺ 3: CHI TIẾT CÔNG VIỆC (DISCIPLINE / BỘ MÔN CHUYÊN SÂU) ════════════════════════════ |
| [+ Thêm Bộ Môn Mới]                                                                                |
| -------------------------------------------------------------------------------------------------- |
| Mã viết tắt | Tên Bộ Môn Chuyên Sâu     | Giải thích chi tiết                        | Thao tác   |
| -------------------------------------------------------------------------------------------------- |
| AR          | Dựng hình kiến trúc       | Dựng tường, sàn, mái, cửa, hoàn thiện       | ✏️ Sửa  🗑️ |
| STR         | Dựng hình kết cấu         | Dựng móng, dầm, cột, thép kết cấu           | ✏️ Sửa  🗑️ |
| MP          | Dựng hình thiết bị         | Dựng hệ thống máy móc, thiết bị, đường ống  | ✏️ Sửa  🗑️ |
| ELE         | Dựng hình hệ điện         | Dựng tủ điện, thang máng cáp, chiếu sáng   | ✏️ Sửa  🗑️ |
| PCP         | Point cloud processing    | Xử lý dữ liệu point cloud: làm sạch, ghép trạm| ✏️ Sửa  🗑️ |
| PCL         | Point cloud layering      | Chia layer point cloud                      | ✏️ Sửa  🗑️ |
| -------------------------------------------------------------------------------------------------- |
|                                                                                                    |
| ══ NỘI DUNG THẺ 4: QUY CHUẨN MÃ DỰ ÁN (PROJECT CODE REGISTRY) ═════════════════════════════════════ |
| [+ Thêm Mã Dự Án Mới]                                                                              |
| -------------------------------------------------------------------------------------------------- |
| Năm  | Ký hiệu | Mã hiển thị chuẩn | Chi tiết tên gốc (Nhật/Việt)             | Thao tác   |
| -------------------------------------------------------------------------------------------------- |
| 2026 | HAG01   | 2026_HAG01        | 花見川終末処理場                         | ✏️ Sửa  🗑️ |
| 2026 | JJK01   | 2026_JJK01        | 十字会                                   | ✏️ Sửa  🗑️ |
+----------------------------------------------------------------------------------------------------+
```

---

## 5. THIẾT KẾ CẤU TRÚC LƯU TRỮ GOOGLE SHEETS

Hệ thống sẽ tự động liên kết với một Sheet mới hoặc đọc trực tiếp từ Sheet cấu hình:
* **Tên Sheet:** `MASTER_TAXONOMY` (hoặc đồng bộ với sheet `シート管理` hiện có).
* **Cấu trúc lưu trữ linh hoạt:**
  - Cột A: `Type` (`CATEGORY` | `PHASE` | `DISCIPLINE` | `PROJECT_CODE`)
  - Cột B: `Code` (Mã viết tắt: `GE`, `BD`, `AR`, `HAG01`...)
  - Cột C: `Name` (Tên gọi: `Basic Design`, `Dựng hình kiến trúc`...)
  - Cột D: `Description` (Giải thích chi tiết)
  - Cột E: `Extra1` (Màu sắc cho Category / Năm cho Project)
  - Cột F: `Extra2` (Tên tiếng Nhật / Khách hàng)
  - Cột G: `Status` (`Active` / `Inactive`)

---

## 6. QUY TRÌNH TỰ ĐỘNG HÓA KHI TẠO TASK (SMART TASK CREATION)

### 6.1. Giao diện Modal Tạo Task được nâng cấp:
Thay vì bắt nhân viên tự nghĩ ra tên task:
1. **Dropdown 1:** Chọn `Category` (VD: `[M3] 3D Modeling`)
2. **Dropdown 2:** Chọn `Phase` (VD: `[BD] Thiết kế cơ sở`)
3. **Dropdown 3:** Chọn `Chi tiết công việc` (VD: `[AR] Dựng hình kiến trúc`)
4. **Ô nhập nội dung:** Nhân viên chỉ gõ phần mô tả chi tiết: `Khối nhà điều hành Tầng 1`.
5. **👉 Khung xem trước tức thì (Live Code Preview):**
   ```
   Tên task sẽ hiển thị: [M3-BD-AR] Khối nhà điều hành Tầng 1
   ```

---

## 7. NÂNG CẤP TAB BIỂU ĐỒ CHUYÊN SÂU (ADVANCED ANALYTICS)

Khi dữ liệu đã được cấu trúc 3 tầng chuẩn chỉnh, Tab Biểu đồ chuyên sâu sẽ có sức mạnh phân tích vượt bậc:

1. **Biểu đồ Cơ cấu Nhóm việc (Category Share):**
   * Cho thấy tổng giờ công của công ty đang chia ra bao nhiêu % cho `M3` (Dựng hình), bao nhiêu % cho `PC` (Point cloud), bao nhiêu % cho `MTG` (Họp hành).
2. **Biểu đồ Tiến độ theo Giai đoạn (Phase Timeline):**
   * Xem dự án đang dồn việc ở giai đoạn nào: Cơ sở (`BD`), Chi tiết (`DD`), hay Nghiệm thu (`IS`).
3. **Biểu đồ Năng lực Bộ môn theo Nhân viên (Discipline Workload):**
   * Nhìn thấy ngay: Nhân viên nào đang phụ trách nhiều task `AR` nhất, nhân viên nào là trụ cột mảng `MP` (Thiết bị) hoặc `ELE` (Điện).

---

## 8. BỔ SUNG ĐA NGÔN NGỮ (I18N: VI, EN, JA)

| Key | Tiếng Việt (`vi`) | Tiếng Anh (`en`) | Tiếng Nhật (`ja`) |
| :--- | :--- | :--- | :--- |
| `nav_taxonomy` | `Danh mục tiêu chuẩn` | `Standard Taxonomy` | `基準管理・区分設定` |
| `tax_page_title` | `Danh Mục Tiêu Chuẩn` | `Standard Taxonomy Master` | `標準コード・区分管理` |
| `tax_tab_cat` | `Category (Nhóm lớn)` | `Category Master` | `大分類（カテゴリ）` |
| `tax_tab_phase` | `Phase dự án` | `Project Phase` | `業務フェーズ` |
| `tax_tab_disc` | `Chi tiết công việc` | `Work Discipline` | `工種・専門分野` |
| `tax_tab_pjcode` | `Mã dự án` | `Project Code Registry` | `プロジェクトコード` |
| `tax_col_code` | `Mã viết tắt` | `Short Code` | `略称コード` |
| `tax_col_name` | `Tên phân loại` | `Classification Name` | `区分・工種名` |
| `tax_col_desc` | `Giải thích phạm vi` | `Description` | `作業内容・説明` |
| `tax_btn_add` | `+ Thêm mới` | `+ Add New` | `+ 新規登録` |
| `tax_btn_reload_sheet`| `⚡ Nạp từ Sheet mẫu`| `⚡ Sync from Sheet` | `⚡ 基準シートから同期` |

---

## 9. LỘ TRÌNH TRIỂN KHAI TỪNG BƯỚC

### Giai đoạn 1: Backend Google Apps Script (`TaxonomyAPI.gs` & `Code.gs`)
- Tạo bảng `MASTER_TAXONOMY` (hoặc nạp đồng bộ trực tiếp từ sheet `シート管理` của bạn).
- Viết API: `getTaxonomyData()`, `saveTaxonomyItem()`, `deleteTaxonomyItem()`, `syncFromTemplateSheet()`.
- Nạp dữ liệu taxonomy vào hàm khởi động `getInitData()` để đảm bảo 0ms local memory.

### Giai đoạn 2: Frontend Giao diện Quản lý (`Index.html`)
- Thêm menu `📐 Danh mục tiêu chuẩn` vào Sidebar `#sb`.
- Tạo cấu trúc trang `#page-taxonomy` với 4 thẻ con chuyển đổi mượt mà.
- Thiết kế modal Thêm/Sửa cho từng nhóm danh mục.

### Giai đoạn 3: Nâng cấp Form Tạo Task & Bộ lọc Biểu đồ
- Tích hợp 3 dropdown liên hoàn `Category` $\rightarrow$ `Phase` $\rightarrow$ `Discipline` vào form tạo task.
- Tự động sinh mã `[M3-BD-AR]` chèn vào tên task.
- Bổ sung bộ lọc theo `Category` và `Discipline` trong tab Biểu đồ chuyên sâu.

### Giai đoạn 4: Kiểm thử an toàn & Bàn giao
- Kiểm tra cú pháp bằng Node.js script.
- Đảm bảo 100% không ảnh hưởng đến dữ liệu cũ.
