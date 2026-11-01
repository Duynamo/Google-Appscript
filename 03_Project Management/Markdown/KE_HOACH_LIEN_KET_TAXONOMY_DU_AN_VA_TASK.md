# KẾ HOẠCH NÂNG CẤP LIÊN KẾT DANH MỤC TIÊU CHUẨN & QUY CHUẨN ĐẶT TÊN DỰ ÁN DẠNG [NĂM]-[STT]-[TÊN]

> **Dự án:** Quản Lý Dự Án & Tiến Độ Google Apps Script WebApp
> **Phiên bản:** v3.7
> **Trạng thái:** Kế hoạch cập nhật theo yêu cầu chuẩn hóa định dạng (Chờ duyệt, chưa sửa code)

---

## I. MỤC TIÊU VÀ BỐI CẢNH YÊU CẦU

Dựa trên yêu cầu chuẩn xác và thực tế từ bạn:

1. **Quy chuẩn định dạng Tên/Mã dự án:**
   - Trường thông tin dự án sẽ có định dạng chuẩn cấu trúc:👉 **`[Năm]-[Số Thứ Tự]-[Tên / Mã]`**Ví dụ:
     - `2026-01-HAG01_花見川終末処理場` (hoặc `2026-01-花見川終末処理場`)
     - `2026-02-JJK01_十字会` (hoặc `2026-02-十字会`)
     - `2026-03-Addin Revit Auto Joint`
2. **Cơ chế nhập Số Thứ Tự (STT):**
   - **Số thứ tự phải được nhập trực tiếp** bởi người dùng (ví dụ: người dùng gõ `01`, `02`... hoặc gõ `1`, `2` hệ thống tự động chuẩn hóa dạng `01`, `02`).
   - Kết hợp Năm (ví dụ `2026`) + STT (ví dụ `01`) + Nội dung (`xxxxx`) thành tên chuẩn.
3. **Lợi ích vượt trội của cấu trúc `2026-01-xxxxx`:**
   - **Tự động sắp xếp chuẩn tuyệt đối:** Mọi màn hình danh sách dự án (Trang Dự án, Trang Nhiệm vụ, Gantt, Dashboard) khi sắp xếp theo tên sẽ tự động xếp thẳng hàng thứ tự từ `2026-01`, `2026-02` đến `2026-10`, `2026-20` mà không cần cấu hình phức tạp.
   - **Dễ tra cứu và nhận diện:** Nhìn vào mã dự án là biết ngay: Dự án thuộc năm nào, dự án thứ mấy trong năm, và tên công trình là gì.
4. **Bộ dropdown ký tự tiêu chuẩn trong Màn hình Sửa nhiệm vụ chi tiết (`#task-panel`):**
   - Đưa bộ 3 dropdown (`Category`, `Phase`, `Discipline`) và badge xem trước mã `[CAT-PHASE-DISC]` vào panel sửa chi tiết để tránh nhập bừa, đồng bộ hoàn toàn với popup tạo nhanh.

---

## II. THIẾT KẾ GIAO DIỆN & LUỒNG TƯƠNG TÁC MODAL THÊM DỰ ÁN (`#m-pj`)

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 MODAL THÊM DỰ ÁN (ĐỊNH DẠNG 2026-01-xxxxx)             │
  ├────────────────────────────────────────────────────────────────────────┤
  │                                                                        │
  │  [Năm]         [Số thứ tự STT]   [Chọn từ Danh mục tiêu chuẩn]         │
  │  ┌───────────┐ ┌───────────────┐ ┌───────────────────────────────────┐ │
  │  │ 2026      │ │ 01            │ │ [HAG01] 花見川終末処理場           ▼ │
  │  └───────────┘ └───────────────┘ └───────────────────────────────────┘ │
  │                                                                        │
  │  Tên Dự Án (Tự động ghép thời gian thực - Có thể tinh chỉnh thêm):     │
  │  ┌───────────────────────────────────────────────────────────────────┐ │
  │  │ 2026-01-HAG01_花見川終末処理場                                     │ │
  │  └───────────────────────────────────────────────────────────────────┘ │
  │                                                                        │
  │  Mô tả dự án:                                                          │
  │  ┌───────────────────────────────────────────────────────────────────┐ │
  │  │ 花見川終末処理場 (Tự động nạp từ danh mục chi tiết)               │ │
  │  └───────────────────────────────────────────────────────────────────┘ │
  │                                                                        │
  │  [Ngày Bắt Đầu]     [Ngày Kết Thúc]                                    │
  │  [Manager]           [Trạng Thái]                                       │
  │                                                                        │
  │                              [ Hủy ]   [ 💾 Lưu Dự Án ]                │
  └────────────────────────────────────────────────────────────────────────┘
```

### 1. Bố trí các trường nhập liệu trong Modal `#m-pj`:

1. **Năm (`#mpj-year`):**
   - Input số (hoặc dropdown), mặc định hiển thị năm hiện tại (ví dụ: `2026`).
2. **Số Thứ Tự (`#mpj-order-str`):**
   - **Người dùng trực tiếp nhập** số thứ tự (ví dụ gõ: `01`, `02`, `03`... hoặc `1`, `2`).
   - Khi người dùng rời ô input (blur) hoặc gõ `1`, hệ thống tự động chuẩn hóa thành `01` (2 chữ số) để đảm bảo định dạng đẹp và sắp xếp chuẩn.
3. **Mã tiêu chuẩn (`#mpj-tax-sel`):**
   - Dropdown nạp từ `S.taxonomy.projectCodes`:
     - `-- Tự nhập nội dung xxxxx --`
     - `[HAG01] 花見川終末処理場`
     - `[JJK01] 十字会`
     - `[AMK01] 天草本渡浄化センター`
     - `[HRP02] 広津化センター送風機設備工事`
     - `[SKM01] 新・小松原浄化センター`
4. **Tên Dự Án (`#mpj-nm`):**
   - Khi người dùng nhập Năm, STT, hoặc chọn Mã tiêu chuẩn, ô Tên dự án **tự động sinh trong thời gian thực**:
     `Tên = [Năm]-[STT]-[Mã_Tên tiếng Nhật]`Ví dụ: `2026-01-HAG01_花見川終末処理場`
   - Nếu là dự án ngoài danh mục, người dùng gõ nội dung vào thì tên ghép thành:Ví dụ: `2026-02-Triển khai tool Revit`
   - Người dùng vẫn có thể click vào ô `#mpj-nm` để chỉnh sửa/bổ sung hậu tố (ví dụ: thêm `- Giai đoạn 1`).
5. **Mô tả (`#mpj-ds`):**
   - Tự động điền chi tiết từ Danh mục tiêu chuẩn.

---

## III. THIẾT KẾ PANEL CHỈNH SỬA NHIỆM VỤ CHI TIẾT (`#task-panel`)

### 1. Bổ sung khối chọn ký tự tiêu chuẩn

Đặt ngay trên trường `Tên nhiệm vụ *` (`#tp-nm`):

- **Category (Nhóm lớn):** `GE`, `DE`, `PC`, `M3`, `RP`, `MTG`...
- **Phase (Giai đoạn):** `BD` (Cơ sở), `DD` (Chi tiết), `IS` (Nghiệm thu)...
- **Discipline (Chi tiết công việc):** `AR`, `STR`, `MP`, `ELE`, `PCP`, `PCL`...
- **Huy hiệu xem trước:** Hiển thị trực quan mã tiền tố chuẩn `[M3-BD-AR]` hoặc `[CHƯA GÁN MÃ]` nếu là task cũ chưa phân loại.

### 2. Logic đồng bộ 2 chiều:

- Mở task cũ có sẵn `[M3-BD-AR]`: Tự động nhận diện và gán đúng 3 dropdown.
- Người dùng chọn dropdown: Tự động đổi tiền tố trong ô Tên nhiệm vụ mà **giữ nguyên 100% nội dung tên gốc** phía sau (VD: `Triển khai logic` ➔ `[DE-BD-AR] Triển khai logic`).
- Tránh hoàn toàn việc thành viên gõ tự do hoặc gõ sai quy tắc tiền tố.

---

## IV. BẢO ĐẢM TÍNH TOÀN VẸN & TƯƠNG THÍCH ĐA NGÔN NGỮ

1. **Bảo toàn dữ liệu cũ:**
   - Dữ liệu dự án cũ trong Google Sheets vẫn hiển thị bình thường.
   - Không làm gãy cấu trúc sheet `PROJECTS` hay `TASKS`.
2. **Sắp xếp tự nhiên (Natural Sorting):**
   - Vì tên dự án tuân theo chuẩn `2026-01-xxxxx`, `2026-02-xxxxx` nên thuật toán sắp xếp của hệ thống sẽ tự động hiển thị dự án theo đúng thứ tự STT tăng dần cực kỳ trực quan và gọn gàng.
3. **Đa ngôn ngữ (`vi`, `en`, `ja`):**
   - Bổ sung đầy đủ các nhãn ngôn ngữ cho:
     - Năm dự án (`pj_year_lbl`)
     - Số thứ tự dự án (`pj_seq_lbl`)
     - Chọn mã tiêu chuẩn (`tax_select_pj_code`)
     - Ký tự phân loại nhiệm vụ (`tax_prefix_badge`)
