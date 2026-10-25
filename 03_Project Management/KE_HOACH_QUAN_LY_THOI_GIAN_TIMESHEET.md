# KẾ HOẠCH NÂNG CẤP HỆ THỐNG: QUẢN LÝ THỜI GIAN LÀM VIỆC CHI TIẾT (TIMESHEET 30 PHÚT) VÀ BẢO MẬT PHÂN QUYỀN 2 CẤP

> **Dự án:** Quản Lý Dự Án & Tiến Độ Google Apps Script WebApp  
> **Phiên bản kiến trúc:** v4.5 (Bổ sung Cơ chế Copy - Paste Đa năng, Điền hàng loạt & Tương thích I18N Toàn diện)  
> **Trạng thái:** Bản kế hoạch thiết kế hệ thống chi tiết (Chờ duyệt triển khai)  
> **Phạm vi:** Bổ sung Tab Quản lý thời gian, Bổ sung Phase dự án, Chèn cột Mã dự án, Chuẩn hóa mã ngắn, Quản lý nhân sự theo Danh mục tiêu chuẩn, Phân quyền 2 cấp, Tự động chèn thứ tự thời gian, Bảo vệ ghi đè an toàn (Overwrite Protection), Quản trị rủi ro mở rộng (30 - 40 nhân sự), Đa ngôn ngữ I18N và Cơ chế Copy - Paste thông minh siêu tốc.

---

## I. MỤC TIÊU VÀ NGUYÊN TẮC THIẾT KẾ TRIỆT ĐỂ

### 1. Mục tiêu cốt lõi
1. **Quản lý thời gian chính xác đến từng block 30 phút:**  
   Loại bỏ tình trạng báo cáo chung chung cuối ngày; từng nhân sự ghi nhận trực tiếp công việc thao tác từ 08:00 đến 17:00, có định danh 2 hàng nghỉ trưa (12:00 - 13:00) và các slot dự trù tăng ca sáng sớm / tăng ca tối linh hoạt.
2. **Chuẩn hóa chuỗi 4 mã danh mục tiêu chuẩn (Dự Án - Category - Phase - Công Việc):**  
   - Giữa cột **Khung giờ** và cột **Mã Category** được chèn thêm cột **Mã Dự Án** (chỉ hiển thị mã ngắn như `JJK01`, `HAG01`...).
   - Cột **Mã Category** được chuẩn hóa **chỉ thể hiện ký tự viết tắt** (như `GE`, `DE`, `PC`, `M3`, `RP`, `MTG`...).
   - Bổ sung cột **Phase Dự Án** (Giai đoạn) chỉ thể hiện ký tự mã phase (như `BD`, `DD`, `IS`...).
   - Cột **Mã Công Việc** (Discipline) thể hiện ký tự mã công việc (như `AR`, `STR`, `MP`, `ELE`, `PCP`, `PCL`...).
   - Chuỗi 4 mã tinh gọn: `[Mã Dự Án] -> [Mã Category] -> [Phase] -> [Mã Công Việc]` tạo thành cấu trúc phân loại công việc chuẩn xác tuyệt đối, tiết kiệm diện tích hiển thị, thao tác cực nhanh.
3. **Cơ chế Sao Chép - Dán (Copy - Paste) Đa Năng & Điền Nhanh Hàng Loạt (Bulk Fill):**  
   - Hỗ trợ đầy đủ phím tắt bàn phím chuẩn `Ctrl+C` / `Ctrl+V` giữa các dòng trong bảng.
   - Hỗ trợ dán trực tiếp dữ liệu nhiều dòng từ bảng tính Excel / Google Sheets bên ngoài vào lưới 30 phút (tự động phân tích và tự động bỏ qua 2 hàng nghỉ trưa).
   - Cung cấp nút điền nhanh cho cả buổi sáng (`08:30 - 12:00`), cả buổi chiều (`13:00 - 17:00`) và nút **Sao chép dữ liệu từ Hôm Qua** chỉ với 1 click, giúp giảm tới 90% thời gian thao tác cho nhân viên.
4. **Cơ chế tự động sắp xếp & chèn dữ liệu theo dòng thời gian chuẩn (Chronological Auto-Insertion):**  
   - Khi nhân sự quên nhập ngày trong quá khứ và nhập bù (ví dụ: đã nhập ngày 11 và ngày 13, sau đó mới nhập ngày 12), hệ thống **tự động xác định vị trí và chèn dữ liệu ngày 12 vào giữa ngày 11 và ngày 13** trên Google Sheet của nhân viên đó.
   - Tuyệt đối không append bừa bãi xuống cuối bảng tính, đảm bảo dòng thời gian trong Google Sheet luôn liên tục, chuẩn xác theo thứ tự tăng dần của ngày tháng.
5. **Cơ chế bảo vệ chống ghi đè vô ý (Safe Edit & Overwrite Protocol):**  
   - Nếu nhân sự mở lại một ngày **đã từng nhập dữ liệu trước đó**:  
     👉 **Nút [ 💾 Lưu Thời Gian ] lập tức bị vô hiệu hóa (disabled / bấm không có tác dụng)** để triệt để loại bỏ rủi ro vô tình bấm nhầm làm hỏng dữ liệu cũ.  
     👉 Bảng thời gian hiển thị ở chế độ **Khóa an toàn (View/Locked)** kèm thông báo: *"Dữ liệu ngày này đã được lưu trước đó"*.  
     👉 Nhân viên **bắt buộc phải bấm nút [ ✏️ Chỉnh Sửa Dữ Liệu ]** thì hệ thống mới mở khóa các ô và chuyển nút Lưu thành **[ 🔄 Cập Nhật & Ghi Đè (Overwrite) ]** để ghi đè toàn bộ dữ liệu mới vào Google Sheet một cách an toàn và có kiểm soát.
6. **Phân quyền bảo mật 2 cấp tuyệt đối:**  
   - Nhân viên phải đăng nhập đúng tài khoản Google được cấp phép trước bởi Admin.
   - **Cấp 1 (Admin/Toàn quyền):** Can thiệp toàn diện mọi tab, chọn mã nhân viên bất kỳ để kiểm tra/nhập hộ/chỉnh sửa, cấu hình phân quyền và link Sheet.
   - **Cấp 2 (Nhân viên thông thường):** Chỉ được thấy và thao tác duy nhất tại Tab Quản lý thời gian. Ô Mã số nhân viên bị **khóa cứng (ReadOnly)** theo tài khoản đăng nhập của chính họ, triệt để ngăn chặn việc can thiệp vào giờ công của người khác.
7. **Kiến trúc lưu trữ độc lập (Mỗi nhân viên 1 Google Sheet riêng):**  
   Mỗi mã nhân viên sở hữu một đường dẫn Google Sheet độc lập. Việc này giúp phân tách quyền sở hữu dữ liệu, tránh xung đột ghi đồng thời (Concurrency lock), bảo mật quyền riêng tư về khối lượng công việc và dễ dàng tích hợp chia sẻ cho từng cá nhân kiểm tra.
8. **Đảm bảo 100% tương thích Đa ngôn ngữ (I18N: 🇻🇳 Tiếng Việt - 🇺🇸 English - 🇯🇵 日本語):**  
   Mọi thành phần mới bổ sung (tiêu đề tab, thanh công cụ, các nút bấm, tính năng copy-paste, tiêu đề cột bảng thời gian, hàng nghỉ trưa, ca tăng ca, các thông báo lỗi/thành công, tooltip gợi ý và modal xác nhận ghi đè) đều được tích hợp đầy đủ vào hệ thống từ điển I18N. Chuyển đổi ngôn ngữ diễn ra tức thì không cần tải lại trang và không làm mất dữ liệu đang nhập dở.

---

## II. BỔ SUNG & CHUẨN HÓA DANH MỤC TIÊU CHUẨN (TAXONOMY & NHÂN SỰ)

Để hệ thống vận hành đồng bộ và không phát sinh lỗi dữ liệu phân tán, thông tin nhân sự và quyền truy cập được tích hợp trực tiếp vào **Danh mục tiêu chuẩn (Sheet TAXONOMY)** với phân loại đặc thù hoặc đồng bộ chuẩn hóa với **Sheet USERS**.

### 1. Bảng đặc tả trường dữ liệu Nhân sự trong Danh mục tiêu chuẩn
Mỗi nhân viên được quản lý bằng một bản ghi chuẩn với đầy đủ các thuộc tính:

| Tên trường dữ liệu | Kiểu dữ liệu | Ý nghĩa & Quy chuẩn | Ví dụ dữ liệu thực tế |
| :--- | :--- | :--- | :--- |
| **Mã Nhân Viên (Code)** | Chuỗi ký tự | Định danh duy nhất, viết hoa, không dấu, không khoảng trắng | `NV001`, `EMP_08`, `BIM_AR_02` |
| **Tên Nhân Viên (Name)** | Chuỗi ký tự | Họ và tên đầy đủ của nhân sự | `Nguyễn Văn A`, `Trần Thị B` |
| **Cấp Bậc (Rank / Level)** | Dropdown | Cấp độ chuyên môn/vị trí công việc | `Leader`, `Senior`, `Junior`, `Intern` |
| **Email Đăng Nhập** | Email chuẩn | Tài khoản Gmail/Google Workspace để xác thực phiên làm việc | `nguyenvana@gmail.com` |
| **Phân Quyền Hệ Thống** | Lựa chọn | Cấp độ hạn chế giao diện và chức năng | `Cấp 1` (Admin), `Cấp 2` (Nhập thời gian) |
| **Link Google Sheet Cá Nhân** | URL hợp lệ | Đường dẫn tới bảng tính Google Sheets lưu trữ timesheet của riêng nhân viên này | `https://docs.google.com/spreadsheets/d/1AbC.../edit` |
| **Trạng Thái (Status)** | Lựa chọn | Cho phép hay tạm ngưng quyền truy cập | `Active` (Đang hoạt động), `Inactive` (Đã nghỉ/Khóa) |

---

## III. MÔ HÌNH PHÂN QUYỀN & BẢO MẬT ĐĂNG NHẬP (AUTHENTICATION & AUTHORIZATION)

```
                            ┌──────────────────────────────────────────────┐
                            │      NGƯỜI DÙNG TRUY CẬP ỨNG DỤNG WEBAPP     │
                            └──────────────────────┬───────────────────────┘
                                                   │
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │    LẤY EMAIL TỪ PHIÊN ĐĂNG NHẬP GOOGLE       │
                            │        (Session.getActiveUser)               │
                            └──────────────────────┬───────────────────────┘
                                                   │
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │ ĐỐI SOÁT VỚI DANH MỤC TIÊU CHUẨN (NHÂN SỰ)  │
                            └───────┬──────────────────────────────┬───────┘
                                    │                              │
                     [Không tìm thấy / Inactive]           [Tìm thấy & Active]
                                    │                              │
                                    ▼                              ▼
                 ┌──────────────────────────────┐   ┌──────────────────────────────┐
                 │       TỪ CHỐI TRUY CẬP       │   │    KIỂM TRA CẤP PHÂN QUYỀN   │
                 │ Khóa màn hình + Thông báo:   │   └───────┬──────────────┬───────┘
                 │ "Email chưa được Admin cấp"  │           │              │
                 └──────────────────────────────┘           │              │
                                           [Phân quyền Cấp 1]      [Phân quyền Cấp 2]
                                                   │                      │
                                                   ▼                      ▼
                            ┌──────────────────────────────┐ ┌──────────────────────────────┐
                            │     TOÀN QUYỀN QUẢN TRỊ      │ │   CHỈ NHẬP THỜI GIAN RIÊNG   │
                            │ • Xem/sửa tất cả các Tab     │ │ • Ẩn toàn bộ các tab khác    │
                            │ • Tab Timesheet: Tự do chọn  │ │ • Chỉ mở Tab Quản lý thời gian│
                            │   bất kỳ Mã nhân viên        │ │ • Ô Mã NV bị KHÓA CỨNG       │
                            │ • Cấu hình phân quyền & Link │ │   (Gán cứng theo Email này)  │
                            │ • Mở trực tiếp Sheet của NV  │ │ • Chỉ ghi vào Sheet của mình │
                            └──────────────────────────────┘ └──────────────────────────────┘
```

### 1. Phân quyền Cấp 1 (Toàn quyền can thiệp dữ liệu - Administrator)
- Có quyền truy cập đầy đủ tất cả các tab nghiệp vụ: Dashboard, Dự án, Nhiệm vụ, Gantt, Báo cáo, Danh mục tiêu chuẩn, Người dùng và Tab Quản lý thời gian.
- Tại Tab Quản lý thời gian:
  - Dropdown **Mã số nhân viên** ở trạng thái mở: Admin có thể chọn xem, kiểm tra, nhập bù hoặc sửa dữ liệu thời gian cho bất kỳ nhân viên nào trong công ty.
  - Hiển thị trực tiếp đường link Google Sheet tương ứng với nhân viên đang được chọn kèm nút mở nhanh bảng tính trên tab mới.
  - Có quyền quản lý, cập nhật hoặc tạo mới link Google Sheet cho từng nhân sự.

### 2. Phân quyền Cấp 2 (Nhân viên thông thường - Regular User)
- **Kiểm soát giao diện triệt để:** Ngay khi ứng dụng tải xong, toàn bộ thanh menu điều hướng và các tab quản trị (Dự án, Nhiệm vụ, Gantt, Phân tích, Danh mục) đều bị ẩn hoàn toàn; giao diện chỉ hiển thị duy nhất màn hình **Quản lý thời gian**.
- **Khóa cứng danh tính (Identity Lock):**
  - Dropdown **Mã số nhân viên** tự động chọn đúng mã nhân sự của tài khoản đang đăng nhập.
  - Ô chọn này được thiết lập thuộc tính **Vô hiệu hóa / Khóa chỉnh sửa (Disabled/ReadOnly)** kèm biểu tượng ổ khóa bảo mật. Người dùng không thể click thay đổi sang nhân viên khác.
  - Thông tin Tên nhân viên và Cấp bậc tự động hiển thị tương ứng dưới dạng nhãn thông tin.
- **Bảo mật phía máy chủ (Server-side Validation):**  
  Khi gửi lệnh lưu dữ liệu về hệ thống, máy chủ Google Apps Script sẽ kiểm tra lại Email phiên làm việc thực tế. Nếu phát hiện yêu cầu lưu dữ liệu vào Mã nhân viên khác với Email đã xác thực, hệ thống sẽ lập tức từ chối và ghi log cảnh báo bảo mật.

---

## IV. THIẾT KẾ BẢNG NHẬP THỜI GIAN THAO TÁC CÔNG VIỆC (TIMESHEET MATRIX)

### 1. Phác thảo giao diện tổng thể (UI Wireframe)

#### TRẠNG THÁI A: NGÀY MỚI CHƯA CÓ DỮ LIỆU TRÊN GOOGLE SHEET (KÈM THANH CÔNG CỤ COPY-PASTE)
```
========================================================================================================================
 TAB: QUẢN LÝ THỜI GIAN LÀM VIỆC CHI TIẾT  [Trạng thái: 🟢 Nhập mới ngày 12/10/2026]
========================================================================================================================

 [Thanh điều khiển đầu trang]
 ┌─────────────────┐  ┌──────────────────────┐  ┌───────────────────────────────────────────────┐
 │ 📅 Chọn ngày:    │  │ 👤 Nhân viên:        │  │ 🔗 Bảng tính Google Sheet lưu trữ:            │
 │ [ 2026-10-12 ]  │  │ [NV001 - Nguyễn Văn A▼│  │ [📊 Mở Google Sheet cá nhân của NV001 ↗]      │
 │ (Hôm nay | Lùi) │  │ Cấp bậc: Senior BIM  │  │ ID: 1AbC...xYz | Trạng thái: Chưa có dữ liệu  │
 └─────────────────┘  └──────────────────────┘  └───────────────────────────────────────────────┘

 [Thanh phím tắt & Công cụ nhập liệu nhanh (Bulk Actions & Clipboard Tools)]:
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ 📋 [Sao Chép Từ Hôm Qua] │ 🌅 [Điền Cả Buổi Sáng] │ 🌇 [Điền Cả Buổi Chiều] │ 💡 Mẹo: Hỗ trợ Ctrl+C / Ctrl+V & Excel│
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                ┌───────────────────────────────────────────────┐
                                                │ [ 🔄 Tải Lại Ngày Này ]    [ 💾 LƯU THỜI GIAN ]│
                                                │ (Nút Lưu SÁNG, cho phép bấm lưu mới ngày 12)   │
                                                └───────────────────────────────────────────────┘

 ------------------------------------------------------------------------------------------------------------------------
 [BẢNG KHUNG GIỜ CHI TIẾT 30 PHÚT TRONG NGÀY]
 ------------------------------------------------------------------------------------------------------------------------
 | STT | Khung Giờ     | Mã Dự Án    | Mã Category | Phase       | Mã Công Việc | Ghi Chú Chi Tiết Công Việc       | Thao tác  |
 |=====|===============|=============|=============|=============|==============|==================================|===========|
 | [+] | -- TĂNG CA SÁNG (Dự trù mở rộng: 06:00 - 08:00) -- [Bấm vào đây để bung các khung giờ sớm]                               |
 |-----|---------------|-------------|-------------|-------------|--------------|----------------------------------|-----------|
 | 01  | 08:00 - 08:30 | [ HAG01  ▼] | [ GE   ▼]   | [ BD   ▼]   | [ MTG   ▼]   | Họp giao ban đầu giờ sáng        | [⬇️ Sao chép]|
 | 02  | 08:30 - 09:00 | [ HAG01  ▼] | [ PC   ▼]   | [ BD   ▼]   | [ PCP   ▼]   | Lọc nhiễu tầng 1 khu xử lý nước  | [⬇️ Sao chép]|
 | 03  | 09:00 - 09:30 | [ HAG01  ▼] | [ PC   ▼]   | [ BD   ▼]   | [ PCL   ▼]   | Phân chia layer hệ đường ống     | [⬇️ Sao chép]|
 | 04  | 09:30 - 10:00 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ AR    ▼]   | Dựng sàn và tường trục A-C       | [⬇️ Sao chép]|
 | 05  | 10:00 - 10:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ AR    ▼]   | Dựng vách kỹ thuật và cửa sổ     | [⬇️ Sao chép]|
 | 06  | 10:30 - 11:00 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ STR   ▼]   | Mô hình hóa dầm cột khu bể xử lý | [⬇️ Sao chép]|
 | 07  | 11:00 - 11:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ STR   ▼]   | Hoàn thiện liên kết dầm phụ      | [⬇️ Sao chép]|
 | 08  | 11:30 - 12:00 | [ HAG01  ▼] | [ RP   ▼]   | [ IS   ▼]   | [ RP    ▼]   | Lưu file, upload dữ liệu lên NAS | [⬇️ Sao chép]|
 |-----|---------------|-------------|-------------|-------------|--------------|----------------------------------|-----------|
 | --  | 12:00 - 12:30 | [  (KHÓA) ] | [  (KHÓA) ] | [  (KHÓA) ] | [  (KHÓA)  ] | ☕ [ NGHỈ TRƯA / LUNCH BREAK ]   | [  KHÓA ]  |
 | --  | 12:30 - 13:00 | [  (KHÓA) ] | [  (KHÓA) ] | [  (KHÓA) ] | [  (KHÓA)  ] | ☕ [ NGHỈ TRƯA / LUNCH BREAK ]   | [  KHÓA ]  |
 |-----|---------------|-------------|-------------|-------------|--------------|----------------------------------|-----------|
 | 09  | 13:00 - 13:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ MP    ▼]   | Dựng bồn lắng và cụm bơm số 1    | [⬇️ Sao chép]|
 | 10  | 13:30 - 14:00 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ MP    ▼]   | Nối tuyến ống công nghệ chính    | [⬇️ Sao chép]|
 | 11  | 14:00 - 14:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ MP    ▼]   | Đặt van điều khiển và khớp nối   | [⬇️ Sao chép]|
 | 12  | 14:30 - 15:00 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ ELE   ▼]   | Đi thang máng cáp trục điện chính| [⬇️ Sao chép]|
 | 13  | 15:00 - 15:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ ELE   ▼]   | Bố trí tủ điện điều khiển trung  | [⬇️ Sao chép]|
 | 14  | 15:30 - 16:00 | [ TOOL01 ▼] | [ DE   ▼]   | [ BD   ▼]   | [ TOOL  ▼]   | Viết script kiểm tra va chạm     | [⬇️ Sao chép]|
 | 15  | 16:00 - 16:30 | [ JJK01  ▼] | [ RP   ▼]   | [ IS   ▼]   | [ IS    ▼]   | Chụp ảnh mô hình làm báo cáo     | [⬇️ Sao chép]|
 | 16  | 16:30 - 17:00 | [ CHUNG  ▼] | [ GE   ▼]   | [ --   ▼]   | [ GEN   ▼]   | Viết báo cáo cuối ngày, dọn máy  | [⬇️ Sao chép]|
 |-----|---------------|-------------|-------------|-------------|--------------|----------------------------------|-----------|
 | [+] | -- TĂNG CA TỐI (Dự trù mở rộng: 17:00 - 22:00) -- [Bấm vào đây để bung các khung giờ tăng ca]                             |
 ------------------------------------------------------------------------------------------------------------------------
 [Thống kê nhanh trong ngày]: Ca chính thức: 8.0 giờ | Tăng ca sáng: 0.0 giờ | Tăng ca tối: 0.0 giờ
========================================================================================================================
```

---

#### TRẠNG THÁI B: NGÀY ĐÃ TỒN TẠI DỮ LIỆU (BẢO VỆ CHỐNG GHI ĐÈ NHẦM)
```
========================================================================================================================
 TAB: QUẢN LÝ THỜI GIAN LÀM VIỆC CHI TIẾT  [Trạng thái: 🟡 ĐÃ CÓ DỮ LIỆU - CHẾ ĐỘ XEM AN TOÀN]
========================================================================================================================

 [Thanh cảnh báo bảo vệ dữ liệu]:
 ⚠️ Dữ liệu ngày 12/10/2026 đã được lưu trước đó. Nút [Lưu] thông thường đã bị khóa để bảo vệ dữ liệu.
 Để chỉnh sửa hoặc thay thế dữ liệu này, vui lòng bấm vào nút [ ✏️ Chỉnh Sửa Dữ Liệu ].

 [Thanh điều khiển đầu trang]
 ┌─────────────────┐  ┌──────────────────────┐  ┌───────────────────────────────────────────────┐
 │ 📅 Chọn ngày:    │  │ 👤 Nhân viên:        │  │ 🔗 Bảng tính Google Sheet lưu trữ:            │
 │ [ 2026-10-12 ]  │  │ [NV001 - Nguyễn Văn A▼│  │ [📊 Mở Google Sheet cá nhân của NV001 ↗]      │
 │ (Hôm nay | Lùi) │  │ Cấp bậc: Senior BIM  │  │ ID: 1AbC...xYz | Cập nhật lúc: 11/10 17:05     │
 └─────────────────┘  └──────────────────────┘  └───────────────────────────────────────────────┘
                                                ┌───────────────────────────────────────────────┐
                                                │ [ 💾 LƯU THỜI GIAN ] (BỊ VÔ HIỆU HÓA - KHÔNG  │
                                                │  CÓ TÁC DỤNG KHI CLICK ĐỂ TRÁNH LỖI DATA)     │
                                                │                                               │
                                                │ 👉 [ ✏️ BẬT CHẾ ĐỘ CHỈNH SỬA ]                │
                                                │    (Bấm nút này để kích hoạt Overwrite)       │
                                                └───────────────────────────────────────────────┘

 Khi người dùng bấm [ ✏️ BẬT CHẾ ĐỘ CHỈNH SỬA ], giao diện chuyển sang:
                                                ┌───────────────────────────────────────────────┐
                                                │ [ ❌ Hủy Bỏ ]   [ 🔄 CẬP NHẬT & GHI ĐÈ ]     │
                                                │                 (OVERWRITE VÀO GOOGLE SHEET)  │
                                                └───────────────────────────────────────────────┘
========================================================================================================================
```

---

### 2. Chi tiết các thành phần nhập liệu theo cấu trúc chuẩn hóa

#### A. Thanh điều khiển phía trên (Header Controls)
1. **Ô Chọn Ngày tháng năm:**
   - Trường chọn ngày trực quan (HTML5 Datepicker).
   - Nút chọn nhanh: "Hôm nay", "Hôm qua", "Lùi 1 ngày", "Tiến 1 ngày".
   - Khi thay đổi ngày, hệ thống tự động tải dữ liệu của ngày đó từ Google Sheet cá nhân lên bảng để nhân viên kiểm tra hoặc chỉnh sửa.
2. **Khu vực Thông tin Nhân viên:**
   - Dropdown **Mã số nhân viên**: Hiển thị danh sách từ Danh mục tiêu chuẩn. Với tài khoản Cấp 2, ô này bị khóa cứng (ReadOnly/Disabled).
   - Nhãn thông tin hiển thị tự động: **Họ tên nhân viên** và **Cấp bậc** (Ví dụ: `Senior BIM Modeler`).
3. **Ô Hiển thị Link Google Sheet cá nhân:**
   - Hiển thị trực tiếp đường dẫn Google Sheet tương ứng với nhân viên đang chọn.
   - Nút bấm nhanh có biểu tượng Google Sheets kèm liên kết ngoài (Target: `_blank`) để người dùng hoặc quản lý click vào mở ngay bảng tính trên tab mới.
4. **Cơ chế Nút bấm thông minh (Smart Button States):**
   - **Khi ngày chưa có dữ liệu:** Nút `[ 💾 Lưu Thời Gian ]` sáng rõ và cho phép lưu bình thường.
   - **Khi ngày đã có dữ liệu:**
     - Nút `[ 💾 Lưu Thời Gian ]` **bị khóa mờ (Disabled)**, nếu click vào sẽ không có bất kỳ phản hồi ghi dữ liệu nào (hiển thị tooltip nhắc nhở).
     - Hiển thị nút **`[ ✏️ Bật Chế Độ Chỉnh Sửa ]`**.
     - Khi bấm vào nút Chỉnh sửa: Hệ thống mở khóa các ô và thay thế bằng nút **`[ 🔄 Cập Nhật & Ghi Đè (Overwrite) ]`**.

#### B. Khung bảng chi tiết và thứ tự các cột chuẩn
Mỗi hàng khung giờ được bố trí theo đúng trật tự logic:

1. **Cột 1: Khung Giờ (Time Slot):** Hiển thị nhãn thời gian rõ ràng, ví dụ `08:00 - 08:30`.
2. **Cột 2: Mã Dự Án (Project Code) - NẰM GIỮA CỘT KHUNG GIỜ VÀ MÃ CATEGORY:**
   - Dropdown **chỉ thể hiện ký tự mã dự án** (Ví dụ: `JJK01`, `HAG01`, `AMK01`, `TOOL01`...).
   - Dữ liệu nạp từ Danh mục tiêu chuẩn nhóm loại `PROJECT_CODE` (hoặc danh sách dự án đang thực hiện trong hệ thống).
3. **Cột 3: Mã Category (Category Code):**
   - Dropdown **chỉ thể hiện ký tự viết tắt** (Ví dụ: `GE`, `DE`, `PC`, `M3`, `RP`, `MTG`...).
   - Không hiển thị kèm tên dài dòng để giữ cột gọn gàng, nhân viên thao tác nhanh và bảng tính luôn cân đối.
4. **Cột 4: Phase Dự Án (Giai đoạn):**
   - Dropdown **chỉ thể hiện ký tự mã phase** (Ví dụ: `BD` - Basic Design, `DD` - Detail Design, `IS` - Inspection...).
   - Dữ liệu nạp từ Danh mục tiêu chuẩn nhóm loại `PHASE`.
5. **Cột 5: Mã Công Việc (Discipline Code):**
   - Dropdown **chỉ thể hiện ký tự mã công việc** (Ví dụ: `AR` - Kiến trúc, `STR` - Kết cấu, `MP` - Thiết bị, `ELE` - Hệ điện, `PCP` - Point cloud processing, `PCL` - Point cloud layering...).
   - Dữ liệu nạp từ Danh mục tiêu chuẩn nhóm loại `DISCIPLINE`.
6. **Cột 6: Ghi Chú Chi Tiết Công Việc (Work Note):**
   - Ô nhập văn bản tự do để nhân viên mô tả cụ thể thao tác đã thực hiện trong 30 phút đó.
7. **Cột 7: Nút Thao Tác Nhanh (Action Button):**
   - Nút `[ ⬇️ Sao chép ]` giúp nhân bản tức thì dữ liệu hàng hiện tại xuống hàng bên dưới.

#### C. Phân chia khung thời gian chuẩn và cơ chế nghỉ trưa
- **Khung thời gian chuẩn từ 08:00 đến 17:00:** Gồm đúng 16 slot thời gian, mỗi slot kéo dài 30 phút.
- **Hàng nghỉ trưa (12:00 - 13:00):** Gồm 2 hàng (`12:00 - 12:30` và `12:30 - 13:00`), định dạng nền xám nhạt với nhãn đa ngữ "Nghỉ trưa / Lunch Break / 昼休み", mặc định khóa không cho chọn Dự án / Category / Phase / Công việc để tránh tính trùng thời gian làm việc thực tế.

#### D. Khu vực dự trù Tăng ca sáng & Tăng ca tối (Overtime Slots)
- **Tăng ca sáng (Early Overtime):** Khung giờ từ `06:00` đến `08:00` (Gồm 4 slot: `06:00 - 06:30`, `06:30 - 07:00`, `07:00 - 07:30`, `07:30 - 08:00`), thiết kế dạng khối thu gọn/bung ra, chỉ mở khi nhân viên có làm việc trước giờ chuẩn.
- **Tăng ca tối (Evening Overtime):** Khung giờ từ `17:00` đến `22:00` (Gồm tối đa 10 slot: `17:00 - 17:30`, `17:30 - 18:00`, ..., `21:30 - 22:00`), có nút bấm `+ Thêm khung giờ tăng ca tối` giúp nhân viên kích hoạt slot khi phát sinh làm thêm giờ.

---

### 3. CƠ CHẾ SAO CHÉP - DÁN (COPY - PASTE) & ĐIỀN NHANH ĐA NĂNG (TIẾT KIỆM 90% THỜI GIAN)

Để giải phóng nhân viên khỏi việc phải click chọn lặp đi lặp lại dropdown từng dòng 30 phút, hệ thống tích hợp 4 cấp độ Copy-Paste linh hoạt:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               4 CẤP ĐỘ SAO CHÉP - DÁN (COPY-PASTE) TRONG TAB TIMESHEET                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  1. PHÍM TẮT BÀN PHÍM    │ Bấm Ctrl+C trên một hàng ➔ Bấm Ctrl+V vào hàng khác        │
│  2. COPY TỪ EXCEL / SHEET│ Copy bảng từ Excel ➔ Paste trực tiếp vào lưới WebApp       │
│  3. ĐIỀN CẢ BUỔI         │ 1 click điền toàn bộ buổi sáng (08:30-12:00) hoặc chiều    │
│  4. COPY TỪ HÔM QUA      │ 1 click nhân bản toàn bộ cấu trúc công việc ngày hôm trước │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### A. Cấp độ 1: Phím tắt bàn phím chuẩn `Ctrl+C` và `Ctrl+V` (Row-to-Row Keyboard Copy)
- **Quy trình Copy (`Ctrl+C` / `Cmd+C`):**
  - Khi người dùng đang focus ở bất kỳ ô nào trên hàng (hoặc click vào số thứ tự hàng): Bấm tổ hợp `Ctrl+C`.
  - Hàng đó chớp sáng viền xanh kèm thông báo nhanh: *"Đã sao chép bộ mã hàng [08:00 - 08:30] vào bộ nhớ tạm!"*.
  - Bộ nhớ tạm lưu trữ đầy đủ 5 trường: `[Mã Dự Án, Mã Category, Phase, Mã Công Việc, Ghi Chú]`.
- **Quy trình Paste (`Ctrl+V` / `Cmd+V`):**
  - Người dùng di chuyển chuột hoặc bấm phím mũi tên xuống hàng cần dán ➔ Bấm `Ctrl+V`.
  - Toàn bộ dropdown và ô ghi chú của hàng đích lập tức được gán giá trị tương ứng.
  - **Dán nhiều hàng liên tiếp (Multi-Row Paste):** Người dùng có thể giữ phím `Shift` và click chọn nhiều hàng (Ví dụ chọn từ hàng 02 đến hàng 06) ➔ Bấm `Ctrl+V`: Hệ thống tự động đổ dữ liệu vào toàn bộ các hàng đã chọn trong 1 lần dán (tự động bỏ qua 2 hàng nghỉ trưa).

#### B. Cấp độ 2: Dán trực tiếp từ bảng tính Excel / Google Sheets bên ngoài (External Clipboard Parsing)
- **Hành vi thực tế:**  
  Nhiều kỹ sư có thói quen soạn sẵn tiến độ công việc trong ngày trên file Excel hoặc Google Sheet cá nhân theo dạng các cột:  
  `[Mã Dự Án]    [Mã Category]    [Phase]    [Mã Công Việc]    [Ghi Chú]`  
  Ví dụ copy từ Excel 3 dòng:
  ```
  HAG01    PC    BD    PCP    Lọc nhiễu dữ liệu pointcloud tầng 1
  HAG01    PC    BD    PCL    Chia layer hệ thống đường ống
  JJK01    M3    DD    AR     Dựng sàn và tường trục A-C
  ```
- **Xử lý dán thông minh (Smart Clipboard Parser):**
  - Khi nhân viên click vào hàng `08:30` và bấm `Ctrl+V`:
  - WebApp tự động bóc tách chuỗi ký tự theo ký tự ngăn cách Tab (`\t`) hoặc dấu phẩy (CSV).
  - Tự động nhận diện và nạp chuẩn xác từng cột vào Dropdown tương ứng.
  - Tự động nhảy dòng: 3 dòng trong clipboard từ Excel sẽ tự động trải đều vào 3 khung giờ liên tiếp (`08:30 - 09:00`, `09:00 - 09:30`, `09:30 - 10:00`).
  - Nếu số dòng dán vượt qua giờ nghỉ trưa, hệ thống **tự động nhảy cóc qua 2 hàng nghỉ trưa 12:00 - 13:00** để dán tiếp vào buổi chiều lúc `13:00`.

#### C. Cấp độ 3: Các nút điền nhanh hàng loạt (Bulk Fill Actions)
- **Nút [ 🌅 Điền Cả Buổi Sáng ]:**  
  Nhân viên chỉ cần nhập thông tin ở slot đầu tiên (ví dụ `08:00` hoặc `08:30`), sau đó bấm nút này ➔ Hệ thống tự động sao chép nguyên vẹn bộ mã và ghi chú đó cho toàn bộ các slot còn lại của ca sáng từ `08:30 đến 12:00`.
- **Nút [ 🌇 Điền Cả Buổi Chiều ]:**  
  Nhân viên nhập slot `13:00` và bấm nút này ➔ Tự động phủ đầy toàn bộ ca chiều từ `13:00 đến 17:00`.
- **Nút [ ⬇️ Sao chép ] tại từng dòng:**  
  Nằm ở cột cuối cùng của mỗi hàng, chỉ cần click chuột là nhân bản tức thì dữ liệu sang hàng ngay kế tiếp.

#### D. Cấp độ 4: Nút "Sao Chép Toàn Bộ Dữ Liệu Từ Hôm Qua" (Copy from Yesterday)
- Nút bấm **`[ 📋 Sao Chép Từ Hôm Qua ]`** được bố trí nổi bật trên thanh công cụ đầu trang.
- **Tình huống sử dụng:** Kỹ sư tiếp tục thực hiện dự án dang dở của ngày hôm trước với cấu trúc ca làm việc gần như tương tự.
- **Cách hoạt động:**  
  Khi bấm nút: WebApp tự động kết nối đến Google Sheet cá nhân, tải toàn bộ cấu trúc công việc của ngày làm việc gần nhất và nạp đầy đủ vào các khung giờ của ngày hôm nay. Nhân viên chỉ cần kiểm tra lại, chỉnh sửa vài dòng khác biệt (nếu có) và bấm Lưu. Thao tác hoàn tất chỉ trong 10 giây!

---

## V. KIẾN TRÚC LƯU TRỮ GOOGLE SHEET RIÊNG BIỆT CHO MỖI NHÂN VIÊN

### 1. Cấu trúc Quản lý và Đặt tên Google Sheet cá nhân
- **Thư mục lưu trữ tập trung:** Toàn bộ bảng tính của nhân viên được lưu trong một Thư mục chung trên Google Drive của tổ chức (Ví dụ: `[HỆ THỐNG] DỮ LIỆU TIMESHEET NHÂN VIÊN`).
- **Quy chuẩn đặt tên bảng tính:**  
  👉 **`TIMESHEET_[MÃ_NHÂN_VIÊN]_[HỌ_VÀ_TÊN]`**  
  Ví dụ:  
  - `TIMESHEET_NV001_Nguyen_Van_A`
  - `TIMESHEET_NV002_Tran_Thi_B`
- **Phân quyền truy cập trên Google Drive:**
  - Tài khoản Admin/Hệ thống: Quyền Quản trị viên (Owner/Editor).
  - Email nhân viên tương ứng: Quyền Chỉnh sửa (Editor) hoặc Xem (Viewer - nếu chỉ muốn họ thao tác qua WebApp để tránh tự ý xóa công thức).

### 2. Cấu trúc các cột dữ liệu trong Bảng tính cá nhân (`DAILY_LOG`)
Mỗi bảng tính cá nhân có 1 trang tính chính mang tên **`DAILY_LOG`** ghi nhận từng slot 30 phút theo thời gian thực với đầy đủ chuỗi 4 mã tiêu chuẩn:

| Tên Cột | Ý nghĩa kỹ thuật | Định dạng dữ liệu mẫu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **A: Log_ID** | Khóa chính duy nhất cho từng slot | `20261012_NV001_0800` | Ghép từ: Ngày + Mã NV + Giờ bắt đầu |
| **B: Work_Date** | Ngày làm việc | `2026-10-12` | Định dạng chuẩn YYYY-MM-DD |
| **C: Time_Slot** | Nhãn khung thời gian | `08:00 - 08:30` | Chuỗi ký tự hiển thị |
| **D: Start_Time** | Thời điểm bắt đầu | `08:00` | Giờ : Phút |
| **E: End_Time** | Thời điểm kết thúc | `08:30` | Giờ : Phút |
| **F: Duration_Minutes** | Thời lượng tính bằng phút | `30` | Số nguyên |
| **G: Slot_Type** | Loại khung giờ | `Official` / `Lunch` / `OT_Morning` / `OT_Evening` | Phục vụ báo cáo tính lương/tăng ca |
| **H: Project_Code** | Mã Dự án (Chỉ mã) | `JJK01`, `HAG01` | Lấy từ Taxonomy nhóm PROJECT_CODE |
| **I: Category_Code** | Mã Category (Chỉ mã) | `M3`, `GE`, `PC` | Lấy từ Taxonomy nhóm CATEGORY |
| **J: Phase_Code** | Phase Dự án (Chỉ mã) | `BD`, `DD`, `IS` | Lấy từ Taxonomy nhóm PHASE |
| **K: Discipline_Code** | Mã Công việc (Chỉ mã) | `AR`, `STR`, `MP` | Lấy từ Taxonomy nhóm DISCIPLINE |
| **L: Work_Note** | Ghi chú công việc | `Dựng mô hình sàn và tường trục A-C` | Nhân viên nhập tự do |
| **M: Staff_Code** | Mã nhân viên | `NV001` | Đồng bộ định danh |
| **N: Staff_Name** | Tên nhân viên | `Nguyễn Văn A` | Đồng bộ định danh |
| **O: Staff_Rank** | Cấp bậc | `Senior BIM Modeler` | Đồng bộ định danh |
| **P: Updated_At** | Dấu vết thời gian ghi nhận | `2026-10-12 10:15:30` | Chống gian lận thời gian ghi |
| **Q: Updated_By** | Email tài khoản đã thực hiện lưu | `nguyenvana@gmail.com` | Xác thực người ghi |

---

## VI. CƠ CHẾ GHI ĐÈ THÔNG MINH & SẮP XẾP CHÈN DÒNG THỜI GIAN TỰ ĐỘNG

```
                             [ NGƯỜI DÙNG CHỌN NGÀY & GỬI LỆNH LƯU ]
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │ KIỂM TRA TRẠNG THÁI NGÀY ĐANG NHẬP   │
                             └──────────────────┬───────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
          [NGÀY CHƯA CÓ TRÊN SHEET]                          [NGÀY ĐÃ TỒN TẠI TRÊN SHEET]
                       │                                                 │
                       │                                                 ▼
                       │                                   ┌───────────────────────────┐
                       │                                   │ KHÓA NÚT LƯU THÔNG THƯỜNG │
                       │                                   │ Bấm Lưu không có tác dụng │
                       │                                   └─────────────┬─────────────┘
                       │                                                 │
                       │                                     [Bấm nút Chỉnh Sửa]
                       │                                                 │
                       │                                                 ▼
                       │                                   ┌───────────────────────────┐
                       │                                   │ KÍCH HOẠT NÚT OVERWRITE   │
                       │                                   │ Xóa khối dữ liệu cũ ngày đó│
                       │                                   └─────────────┬─────────────┘
                       │                                                 │
                       └────────────────────────┬────────────────────────┘
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │  THUẬT TOÁN CHÈN THỨ TỰ THỜI GIAN    │
                             │ (Ví dụ: Ngày 12 chèn giữa 11 và 13)  │
                             └──────────────────┬───────────────────┘
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │ 1. Tìm vị trí dòng đầu tiên của ngày │
                             │    lớn hơn (Ngày 13)                 │
                             │ 2. Chèn các dòng của Ngày 12 vào     │
                             │    ngay trước dòng Ngày 13           │
                             │ 3. Tự động kiểm tra sắp xếp chuẩn    │
                             │    (Sort: Work_Date ASC, Start ASC)  │
                             └──────────────────────────────────────┘
```

### 1. Cơ chế Chèn tự động theo trình tự thời gian (Ví dụ ngày 11 - 12 - 13)
- **Tình huống thực tế:** Nhân viên đã nhập ngày `2026-10-11` và ngày `2026-10-13`, nhưng quên nhập ngày `2026-10-12`. Khi nhân viên quay lại chọn ngày 12 và bấm Lưu:
- **Nguyên tắc xử lý của hệ thống:**
  1. Hệ thống đọc toàn bộ danh sách các ngày đã có trong trang tính `DAILY_LOG`.
  2. Xác định vị trí hàng đầu tiên có `Work_Date` lớn hơn ngày đang lưu (ở đây là các hàng của ngày `2026-10-13`).
  3. Hệ thống thực hiện chèn (Insert rows) toàn bộ các slot của ngày `2026-10-12` vào **ngay phía trên ngày 13 và ngay phía dưới ngày 11**.
  4. Thực hiện lệnh tự động chuẩn hóa vị trí (Auto-sort) theo 2 tiêu chí ưu tiên:  
     - **Ưu tiên 1:** Cột `Work_Date` (Tăng dần từ ngày cũ đến ngày mới).  
     - **Ưu tiên 2:** Cột `Start_Time` (Tăng dần từ ca sáng sớm đến ca tối).
- **Kết quả:** Bảng tính Google Sheet cá nhân luôn giữ đúng thứ tự ngày tháng tự nhiên `11 -> 12 -> 13`, loại bỏ 100% tình trạng ngày 12 bị nhảy tít xuống cuối bảng sau ngày 13.

---

### 2. Cơ chế Bảo vệ Chống Ghi Đè Nhầm 2 Bước (Safe Edit & Overwrite Protocol)
- **Vấn đề cần triệt tiêu:** Tránh trường hợp mở lại ngày cũ rồi vô tình bấm nhầm nút [Lưu] làm hỏng hoặc xóa mất dữ liệu đã có.
- **Quy trình kiểm soát 2 bước:**
  - **Bước 1: Chế độ Xem An Toàn (Default View/Locked Mode):**
    - Khi chọn một ngày đã có dữ liệu trong Sheet: Bảng khung giờ ở trạng thái **Khóa chỉnh sửa**.
    - **Nút [ 💾 Lưu Thời Gian ] bị VÔ HIỆU HÓA HOÀN TOÀN (Disabled):** Click chuột vào nút Lưu hoàn toàn không có tác dụng.
    - Hiển thị dải băng cảnh báo màu vàng: `[ ⚠️ Ngày này đã có dữ liệu. Nút Lưu đã bị khóa để bảo vệ dữ liệu ]`.
  - **Bước 2: Mở Khóa & Ghi Đè Có Chủ Đích (Deliberate Overwrite Action):**
    - Người dùng bắt buộc phải click vào nút **`[ ✏️ Bật Chế Độ Chỉnh Sửa ]`**.
    - Hệ thống mở khóa các ô và thay thế bằng nút **`[ 🔄 Cập Nhật & Ghi Đè (Overwrite) ]`** màu cam cảnh báo.
    - Click nút Ghi Đè ➔ Hiển thị hộp thoại xác nhận modal ➔ Xác nhận "Đồng ý" ➔ Hệ thống xóa dữ liệu cũ ngày đó và ghi đè khối dữ liệu mới vào đúng vị trí dòng thời gian trên Sheet.

---

## VII. XỬ LÝ CÁC TÌNH HUỐNG BIÊN & GIẢI PHÁP DỰ PHÒNG TRIỆT ĐỂ (EDGE CASES)

| Tình huống phát sinh | Rủi ro kỹ thuật | Giải pháp xử lý triệt để |
| :--- | :--- | :--- |
| **Nhân viên mở lại ngày cũ và vô tình click nút Lưu** | Mất dữ liệu hoặc ghi đè rác lên ngày cũ | **Khóa nút Lưu:** Nút Lưu bị vô hiệu hóa hoàn toàn khi ngày đã có dữ liệu; bắt buộc phải bấm nút Chỉnh sửa ➔ Hộp thoại xác nhận ➔ Nút Overwrite riêng biệt. |
| **Nhập bù ngày cách đây 1 tuần (ví dụ hôm nay ngày 20, nhập bù ngày 12)** | Dữ liệu bị đẩy xuống cuối cùng sau ngày 20 gây lỗi báo cáo tuần/tháng | **Thuật toán Chèn thông minh:** Hệ thống định vị đúng vị trí giữa ngày 11 và ngày 13 để chèn, sau đó tự động sắp xếp theo ngày và giờ bắt đầu. |
| **Paste dữ liệu từ Excel có chứa hàng nghỉ trưa** | Dữ liệu bị dán đè vào 2 hàng nghỉ trưa làm hỏng cấu trúc | **Bộ lọc dán thông minh (Paste Interceptor):** Khi dán từ Excel, hệ thống nhận diện vị trí và tự động nhảy cóc qua 2 hàng 12:00 - 13:00, tiếp tục dán vào hàng 13:00 chiều. |
| **Nhân viên cố tình thay đổi mã nhân viên qua F12 Console** | Nhân viên Cấp 2 can thiệp ghi dữ liệu cho người khác | **Kiểm tra 2 lớp:** Backend luôn so sánh `Session.getActiveUser().getEmail()` với email của mã nhân viên trong Danh mục tiêu chuẩn. Nếu không khớp và không phải Admin Cấp 1, lập tức chặn đứng và từ chối ghi. |
| **Link Google Sheet cá nhân bị xóa hoặc sai quyền chia sẻ** | Lỗi sập ứng dụng khi bấm lưu thời gian | Hệ thống kiểm tra trước khi ghi: Nếu link Sheet không hợp lệ hoặc không có quyền truy cập, trả về thông báo lỗi rõ ràng: *"Không thể kết nối đến Google Sheet của nhân sự này. Vui lòng liên hệ Admin để kiểm tra quyền truy cập file."* |
| **Trùng lặp dữ liệu khi bấm nút Lưu nhiều lần liên tục** | Dữ liệu bị ghi đè nhiều dòng rác trên Sheet | Trên giao diện: Vô hiệu hóa (Disable) nút Lưu ngay khi click, hiển thị biểu tượng xoay (Loading). Trên Backend: Sử dụng mã định danh duy nhất cho từng slot (`Log_ID = Ngày_MãNV_GiờBắtĐầu`) để ghi đè chuẩn xác, không bị nhân đôi dòng. |
| **Mất kết nối mạng giữa chừng khi đang nhập liệu** | Mất toàn bộ nội dung ghi chú đã gõ trong ngày | Tự động lưu tạm dữ liệu vào bộ nhớ cục bộ trình duyệt (`localStorage`) sau mỗi thao tác. Khi có mạng trở lại hoặc tải lại trang, hệ thống tự động phục hồi dữ liệu chưa kịp lưu. |

---

## VIII. BẢNG PHÂN TÍCH CHUYÊN SÂU TẤT CẢ RỦI RO & GIẢI PHÁP TRIỆT ĐỂ (QUY MÔ 30 - 40 NHÂN SỰ)

Khi mở rộng quy mô vận hành thực tế cho **30 - 40 nhân sự cùng sử dụng đồng thời hàng ngày**, hệ thống Google Apps Script và Google Sheets sẽ đối mặt với các rào cản kỹ thuật đặc thù. Dưới đây là phân tích chuyên sâu 5 nhóm rủi ro và các giải pháp hóa giải triệt để:

```
                            ┌──────────────────────────────────────────────┐
                            │    BẢN ĐỒ RỦI RO VẬN HÀNH (30 - 40 NHÂN SỰ)  │
                            └──────────────────────┬───────────────────────┘
                                                   │
         ┌───────────────────┬─────────────────────┼─────────────────────┬───────────────────┐
         ▼                   ▼                     ▼                     ▼                   ▼
   [NHÓM 1: QUOTA     [NHÓM 2: XUNG ĐỘT    [NHÓM 3: BẢO MẬT     [NHÓM 4: GIAN LẬN   [NHÓM 5: TỔNG HỢP
    & HIỆU NĂNG GAS]   TOÀN VẸN DỮ LIỆU]    & PHÂN QUYỀN]        & TUÂN THỦ GIỜ]     40 BẢNG TÍNH]
```

### 1. NHÓM 1: RỦI RO VỀ QUOTA, HIỆU NĂNG & NGHẼN CỔ CHAI GOOGLE APPS SCRIPT
- **Quá tải đồng thời vào giờ tan ca (16:55 - 17:05):**  
  *Giải pháp:* Mỗi người ghi vào 1 file Google Sheet riêng giúp triệt tiêu nghẽn cell-lock. Phía Client áp dụng cơ chế thử lại lũy tiến kèm độ trễ ngẫu nhiên (`Exponential Backoff with Jitter`: 1.5s, 3s, 5s). Backend nén toàn bộ dữ liệu ngày thành mảng và ghi 1 lần duy nhất bằng `setValues()` trong 800ms.
- **Thời gian kết nối file Google Sheet:**  
  *Giải pháp:* Trích xuất sẵn Spreadsheet ID và lưu vào bộ nhớ cache (`CacheService`), áp dụng cơ chế nạp trước (prefetch) khi người dùng đổi ngày.
- **Hạn ngạch thực thi hàng ngày:**  
  *Giải pháp:* 40 người x 3-4 lần lưu = ~160 lần/ngày, chỉ chiếm **< 1%** quota Google Workspace (`20,000 - 50,000 calls/ngày`), hoàn toàn không lo quá tải.

### 2. NHÓM 2: RỦI RO TOÀN VẸN DỮ LIỆU & XUNG ĐỘT ĐA PHIÊN
- **Mở nhiều tab hoặc mở cả trên PC lẫn Điện thoại:**  
  *Giải pháp:* Khóa lạc quan (Optimistic Concurrency Lock) so khớp dấu thời gian `Last_Updated_At`. Nếu phát hiện dữ liệu vừa bị thay đổi từ thiết bị khác, cảnh báo yêu cầu tải lại trước khi ghi đè.
- **Lệch múi giờ giữa Nhật Bản (GMT+9) và Việt Nam (GMT+7):**  
  *Giải pháp:* Khóa cứng múi giờ công ty trên máy chủ bằng `Utilities.formatDate(d, "Asia/Ho_Chi_Minh", "yyyy-MM-dd")` (hoặc `Asia/Tokyo`). Định dạng chuẩn quốc tế `YYYY-MM-DD` chống lệch ngày.
- **Chèn dòng ngày 12 làm hỏng công thức tổng hợp:**  
  *Giải pháp:* Trang tính `DAILY_LOG` chỉ chứa dữ liệu thô (Raw Data Only), không cài công thức lồng vào từng dòng. Toàn bộ công thức tính tổng đặt ở tab riêng biệt và tham chiếu mở `DAILY_LOG!A2:Q`.

### 3. NHÓM 3: RỦI RO BẢO MẬT & PHÂN QUYỀN TRUY CẬP
- **Can thiệp F12 DevTools để đổi Mã nhân viên:**  
  *Giải pháp:* Nguyên lý Zero Trust phía Máy chủ: Backend tự động lấy Email từ Google Session thực tế (`Session.getActiveUser().getEmail()`) và ép ghi vào đúng mã nhân viên của tài khoản đó. Mọi nỗ lực can thiệp F12 đều vô hiệu.
- **Nhân viên mở trực tiếp Google Sheet cá nhân để xóa/sửa tay:**  
  *Giải pháp:* Khóa bảo vệ dòng 1 (A1:Q1) bằng `Sheet Protection`. Ứng dụng WebApp chạy dưới quyền Quản trị viên (`Execute as: Me`), nhân viên chỉ có quyền Xem (Viewer) trên Drive để kiểm tra, mọi thao tác ghi/sửa bắt buộc qua WebApp.
- **Nhân sự nghỉ việc (Offboarding):**  
  *Giải pháp:* Admin chỉ cần chuyển trạng thái nhân viên sang `Inactive` trong Sheet TAXONOMY, WebApp lập tức chặn đứng phiên đăng nhập của email đó, bảo toàn toàn bộ lịch sử dữ liệu cũ.

### 4. NHÓM 4: RỦI RO GIAN LẬN THỜI GIAN & TUÂN THỦ NGHIỆP VỤ
- **Nhập đối phó lùi ngày quá xa trong quá khứ:**  
  *Giải pháp:* Cột `Updated_At` luôn ghi nhận thời gian thực tế của server khi bấm nút Lưu. Khóa ngày quá hạn: Chỉ cho phép tự do nhập/sửa trong vòng 48 giờ (Hôm nay & Hôm qua). Muốn nhập ngày cũ hơn phải có Admin phê duyệt.
- **Nhập thiếu slot hoặc ghi chú sơ sài đối phó:**  
  *Giải pháp:* Đã chọn Mã việc thì bắt buộc Ghi chú phải có tối thiểu 6 ký tự có nghĩa. Đổi màu viền đỏ các ô bị thiếu để nhắc nhở trước khi lưu.
- **Rớt mạng Wi-Fi hoặc vô tình tắt tab trình duyệt:**  
  *Giải pháp:* Tự động lưu nháp cục bộ (`localStorage`) mỗi 5 giây. Mở lại tab sẽ hiển thị hộp thoại khôi phục dữ liệu ngay lập tức.

### 5. NHÓM 5: RỦI RO QUẢN TRỊ & TỔNG HỢP DỮ LIỆU TỪ 40 BẢNG TÍNH RIÊNG BIỆT
- **Phân tán 40 file khiến Admin không thể tổng hợp báo cáo toàn công ty:**  
  *Giải pháp:* Đường ống Dữ liệu Tổng hợp Ban đêm (Nightly Batch Job) tự động chạy lúc 01:00 sáng hàng ngày, quét 40 file và gom các dòng mới vào 1 bảng tính trung tâm: **`MASTER_TIMESHEET_CONSOLIDATED`**. Tab Báo cáo Quản trị (Admin Analytics) tại WebApp giúp xem biểu đồ tổng hợp và xuất Excel toàn công ty chỉ với 1 click.

---

## IX. NGUYÊN TẮC ĐẢM BẢO TƯƠNG THÍCH ĐA NGÔN NGỮ (I18N: VI - EN - JA) TRÊN MỌI THÀNH PHẦN MỚI

Nhằm phục vụ môi trường làm việc hợp tác giữa kỹ sư Việt Nam, đối tác/khách hàng Nhật Bản và chuyên gia quốc tế, toàn bộ tính năng và thành phần giao diện mới bổ sung trong đợt cập nhật này bắt buộc phải tuân thủ triệt để các nguyên tắc đa ngôn ngữ (I18N) sau:

### 1. Nguyên tắc "Mã Chuẩn Bất Biến (Canonical Code) - Nhãn Hiển Thị Bản Địa Hóa (Localized Label)"
- **Mã kỹ thuật chuẩn (Canonical Technical Codes):**  
  Các mã danh mục cốt lõi gồm: Mã Dự Án (`JJK01`, `HAG01`), Mã Category (`GE`, `M3`, `PC`), Phase (`BD`, `DD`, `IS`), Mã Công Việc (`AR`, `STR`, `MP`), Mã Nhân Viên (`NV001`), Định dạng ngày (`YYYY-MM-DD`) và Khung giờ (`08:00 - 08:30`) là **dữ liệu kỹ thuật bất biến**, giữ nguyên giá trị đồng nhất ở mọi ngôn ngữ và được lưu trữ nguyên bản vào Google Sheet.
- **Nhãn hiển thị (UI Labels, Tooltips, Placeholders, Notifications):**  
  100% các thành phần chữ hiển thị tới mắt người dùng (tiêu đề, tên nút, thông báo trạng thái, hộp thoại xác nhận) đều được ánh xạ qua hàm biên dịch `t(key)` từ Từ điển Đa ngôn ngữ I18N.

### 2. Bảng Tra Cứu Từ Điển I18N (Translation Matrix) Cho Tab Quản Lý Thời Gian & Copy-Paste

| Khóa Từ Điển (I18N Key) | 🇻🇳 Tiếng Việt (`vi`) | 🇺🇸 English (`en`) | 🇯🇵 日本語 (`ja`) | Vị trí áp dụng trên giao diện |
| :--- | :--- | :--- | :--- | :--- |
| `nav_timesheet` | Quản lý thời gian | Time Tracking | 時間管理 | Menu điều hướng / Tab bar |
| `ts_title` | Quản lý thời gian làm việc chi tiết | Detailed Work Time Tracking | 詳細作業時間管理 | Tiêu đề chính của màn hình |
| `ts_select_date` | Chọn ngày làm việc | Select Work Date | 作業日を選択 | Nhãn bộ chọn ngày |
| `ts_btn_today` | Hôm nay | Today | 今日 | Nút chọn nhanh ngày hôm nay |
| `ts_btn_yesterday` | Hôm qua | Yesterday | 昨日 | Nút chọn nhanh ngày hôm qua |
| `ts_btn_prev_day` | Lùi 1 ngày | Prev Day | 前日 | Nút lùi ngày |
| `ts_btn_next_day` | Tiến 1 ngày | Next Day | 翌日 | Nút tiến ngày |
| `ts_staff_label` | Nhân viên | Employee | 担当者 | Nhãn thông tin nhân viên |
| `ts_rank_label` | Cấp bậc | Level / Rank | 役職・レベル | Nhãn cấp bậc nhân sự |
| `ts_sheet_link_btn` | 📊 Mở Google Sheet cá nhân | 📊 Open Personal Sheet | 📊 個人シートを開く | Nút liên kết Google Sheet |
| `ts_btn_copy_yesterday`| 📋 Sao Chép Từ Hôm Qua | 📋 Copy from Yesterday | 📋 前日からコピー | Nút sao chép nguyên trạng ngày hôm trước |
| `ts_btn_bulk_morning` | 🌅 Điền Cả Buổi Sáng | 🌅 Fill Entire Morning | 🌅 午前中に一括適用 | Nút điền nhanh slot 08:30 - 12:00 |
| `ts_btn_bulk_afternoon`| 🌇 Điền Cả Buổi Chiều | 🌇 Fill Entire Afternoon | 🌇 午後に一括適用 | Nút điền nhanh slot 13:00 - 17:00 |
| `ts_btn_save` | 💾 Lưu Thời Gian | 💾 Save Timesheet | 💾 時間を保存 | Nút lưu dữ liệu khi chưa có dữ liệu |
| `ts_btn_reload` | 🔄 Tải Lại Ngày Này | 🔄 Reload Date | 🔄 データを再読込 | Nút tải lại dữ liệu từ Sheet |
| `ts_btn_edit_mode` | ✏️ Bật Chế Độ Chỉnh Sửa | ✏️ Enable Edit Mode | ✏️ 編集モード切替 | Nút mở khóa khi ngày đã có dữ liệu |
| `ts_btn_overwrite` | 🔄 Cập Nhật & Ghi Đè | 🔄 Update & Overwrite | 🔄 上書き更新 | Nút ghi đè khi đã mở khóa sửa |
| `ts_btn_cancel_edit`| ❌ Hủy Bỏ Sửa | ❌ Cancel Edit | ❌ 編集キャンセル | Nút hủy bỏ trạng thái sửa |
| `ts_th_no` | STT | No. | 番号 | Tiêu đề cột Số thứ tự |
| `ts_th_slot` | Khung Giờ | Time Slot | 時間枠 | Tiêu đề cột Khung thời gian |
| `ts_th_project` | Mã Dự Án | Project Code | プロジェクト | Tiêu đề cột Mã dự án |
| `ts_th_category` | Mã Category | Category | カテゴリ | Tiêu đề cột Mã nhóm việc |
| `ts_th_phase` | Phase Dự Án | Project Phase | フェーズ | Tiêu đề cột Giai đoạn |
| `ts_th_discipline` | Mã Công Việc | Discipline / Task | 業務分類 | Tiêu đề cột Mã nghiệp vụ |
| `ts_th_notes` | Ghi Chú Chi Tiết | Work Notes | 業務詳細・備考 | Tiêu đề cột Ghi chú |
| `ts_th_actions` | Thao tác | Action | 操作 | Tiêu đề cột Thao tác nhanh |
| `ts_lunch_break` | ☕ Nghỉ trưa | ☕ Lunch Break | ☕ 昼休み | Nội dung cố định 2 hàng nghỉ trưa |
| `ts_early_ot_title` | -- TĂNG CA SÁNG (06:00 - 08:00) -- | -- MORNING OVERTIME (06:00 - 08:00) -- | -- 早朝残業 (06:00 - 08:00) -- | Tiêu đề khối ca sáng |
| `ts_evening_ot_title`| -- TĂNG CA TỐI (17:00 - 22:00) -- | -- EVENING OVERTIME (17:00 - 22:00) -- | -- 夜間残業 (17:00 - 22:00) -- | Tiêu đề khối ca tối |
| `ts_btn_add_evening_ot`| + Thêm khung giờ tăng ca tối | + Add Evening OT Slot | + 残業枠を追加 | Nút bung thêm slot tăng ca tối |
| `ts_tooltip_copy_down`| Sao chép bộ mã xuống dòng dưới | Copy code set to row below | 下の行にコードをコピー | Tooltip nút copy nhanh từng dòng |
| `ts_warn_existing_data`| ⚠️ Dữ liệu ngày này đã được lưu trước đó. Nút Lưu đã bị khóa để bảo vệ dữ liệu. | ⚠️ Data for this date already exists. Save button is locked to protect data. | ⚠️ この日のデータは既に保存されています。保護のため保存ボタンはロックされています。 | Dải băng cảnh báo an toàn |
| `ts_confirm_overwrite`| Bạn có chắc chắn muốn ghi đè toàn bộ dữ liệu ngày này không? | Are you sure you want to overwrite all data for this date? | この日のデータをすべて上書き更新してもよろしいですか？ | Hộp thoại xác nhận ghi đè |
| `ts_toast_save_success`| Đã lưu thành công dữ liệu vào Google Sheet cá nhân! | Successfully saved timesheet to personal sheet! | 個人シートへの保存が正常に完了しました！ | Thông báo Toast thành công |
| `ts_toast_copy_row` | Đã sao chép dữ liệu hàng vào bộ nhớ tạm! | Row data copied to clipboard! | 行データをクリップボードにコピーしました！ | Thông báo Toast copy dòng |
| `ts_toast_paste_success`| Đã dán dữ liệu thành công! | Data pasted successfully! | データの貼り付けが完了しました！ | Thông báo Toast paste thành công |
| `ts_toast_paste_excel`| Đã phân tích và dán {count} dòng từ bảng tính ngoài! | Parsed and pasted {count} rows from external sheet! | 外部シートから{count}行を貼り付けました！ | Thông báo Toast dán từ Excel |
| `ts_toast_err_conn` | Không thể kết nối đến Google Sheet của nhân sự này. | Cannot connect to personal Google Sheet for this staff. | 対象担当者のGoogleシートに接続できませんでした。 | Thông báo Toast lỗi kết nối Sheet |
| `ts_toast_err_auth` | Email của bạn chưa được cấp phép truy cập hệ thống. | Your email is not authorized to access this system. | このメールアドレスはシステム利用権限がありません。 | Màn hình/Toast từ chối truy cập |
| `ts_toast_note_len` | Vui lòng nhập nội dung ghi chú tối thiểu 6 ký tự. | Please enter work note of at least 6 characters. | 業務詳細には6文字以上入力してください。 | Cảnh báo tính hợp lệ ghi chú |

### 3. Tương thích Đa ngôn ngữ từ Danh mục tiêu chuẩn (Taxonomy Multi-language Data)
- **Tận dụng trường `extra2` có sẵn trong Sheet TAXONOMY:** Chứa tên tiếng Nhật chuẩn (`3Dモデリング`, `点群処理`, `基本設計`, `建築モデリング`).
- **Hiển thị Tooltip song ngữ thông minh:** Khi rê chuột vào các mã ngắn (`M3`, `BD`, `AR`), hệ thống hiển thị Tooltip giải nghĩa song ngữ giúp kỹ sư Việt Nam và đối tác Nhật Bản hiểu ngay công việc mà không cần nhớ thuộc lòng bảng mã.

### 4. Cơ chế Chuyển đổi Ngôn ngữ tức thì không Reload (Zero-Reload Switching)
- Khi bấm chọn cờ ngôn ngữ trên Topbar (`🇻🇳 VI` ➔ `🇯🇵 JA` hoặc `🇺🇸 EN`): Toàn bộ nhãn, tiêu đề bảng, thông báo chuyển đổi trong 0.1 giây mà không reload trang web, bảo toàn 100% dữ liệu đang nhập dở trên lưới thời gian.

---

## X. KẾ HOẠCH TRIỂN KHAI THEO TỪNG GIAI ĐOẠN (ROADMAP)

### Giai đoạn 1: Chuẩn hóa Dữ liệu & Danh mục Tiêu chuẩn
- Bổ sung cấu trúc dữ liệu Nhân sự vào hệ thống: Mã số nhân viên, Tên nhân viên, Cấp bậc, Email, Phân quyền (Cấp 1 / Cấp 2), Link Google Sheet cá nhân.
- Chuẩn hóa các bộ mã ngắn trong Danh mục tiêu chuẩn:
  - Nhóm `PROJECT_CODE`: Mã dự án dạng ký tự ngắn (`JJK01`, `HAG01`, `AMK01`...).
  - Nhóm `CATEGORY`: Mã nhóm việc dạng ký tự ngắn (`GE`, `DE`, `PC`, `M3`, `RP`, `MTG`...).
  - Nhóm `PHASE`: Mã giai đoạn dạng ký tự ngắn (`BD`, `DD`, `IS`...).
  - Nhóm `DISCIPLINE`: Mã nghiệp vụ dạng ký tự ngắn (`AR`, `STR`, `MP`, `ELE`, `PCP`, `PCL`...).
- Bổ sung trường diễn giải tiếng Nhật (`extra2`) và tiếng Anh trong Taxonomy cho các mã mới.

### Giai đoạn 2: Tạo Bảng tính Google Sheet Mẫu & Cấp phát Thư mục
- Thiết kế tệp Google Sheet Mẫu (`Template_Timesheet_Standard`) chuẩn hóa các cột từ A đến Q, kẻ bảng sẵn, định dạng trang nhã, bảo vệ dòng Header A1:Q1.
- Thiết lập thư mục lưu trữ tập trung trên Google Drive cho 30 - 40 nhân viên.
- Nhân bản bảng tính riêng cho từng nhân viên và cập nhật liên kết vào Danh mục tiêu chuẩn.

### Giai đoạn 3: Phát triển Backend API & Kiểm soát Truy cập
- Xây dựng module kiểm tra phiên đăng nhập và định tuyến giao diện theo Phân quyền Cấp 1 vs Cấp 2 (Zero-Trust Server Validation).
- Xây dựng module đọc dữ liệu ngày từ Google Sheet cá nhân.
- Xây dựng thuật toán kiểm tra trạng thái ngày (Đã có dữ liệu hay chưa).
- Xây dựng thuật toán ghi đè an toàn và tự động chèn đúng vị trí dòng thời gian (Chronological Insert & Auto-sort).
- Thiết lập cơ chế thử lại lũy tiến (Exponential Backoff) chống nghẽn quota giờ cao điểm.

### Giai đoạn 4: Thiết kế Giao diện Tab "Quản lý thời gian", Cơ chế Copy-Paste & Đa ngôn ngữ (I18N)
- Bổ sung Tab "Quản lý thời gian" vào thanh điều hướng.
- Xây dựng thanh công cụ: Bộ chọn ngày, Thông tin nhân viên, Huy hiệu liên kết Google Sheet.
- Thiết lập logic nút bấm thông minh: Nút Lưu thường, Nút Chỉnh sửa và Nút Ghi đè Overwrite.
- Xây dựng lưới bảng khung giờ chi tiết: 16 slot chuẩn (08:00 - 17:00), 2 hàng nghỉ trưa cố định, 2 khối tăng ca sáng và tăng ca tối mở rộng linh hoạt.
- Tích hợp bộ 4 dropdown mã ngắn: **Mã Dự Án** (chèn giữa Khung giờ và Category), **Mã Category** (chỉ ký tự), **Phase Dự Án**, **Mã Công Việc**, và **Ô ghi chú chi tiết**.
- **Xây dựng module Copy - Paste 4 cấp độ:** Phím tắt `Ctrl+C / Ctrl+V`, Dán trực tiếp từ bảng tính Excel / Google Sheet ngoài (Clipboard Parser), Các nút điền nhanh cả buổi và Nút sao chép từ ngày hôm qua.
- Tích hợp toàn bộ bộ nhãn I18N (Tiếng Việt, Tiếng Anh, Tiếng Nhật) cho tất cả các thành phần mới, hỗ trợ chuyển đổi ngôn ngữ tức thời không reload trang.
- Tích hợp cơ chế tự động lưu nháp (`localStorage`) chống mất dữ liệu khi rớt mạng.

### Giai đoạn 5: Kiểm thử Tải (Load Testing 30-40 Users) & Bàn giao Vận hành
- Thử nghiệm tải đồng thời: Giả lập nhiều tài khoản cùng bấm Lưu vào cùng một thời điểm để kiểm tra cơ chế thử lại và độ trễ phản hồi.
- Thử nghiệm tính năng Copy-Paste: Copy dữ liệu từ bảng tính Excel ngoài dán vào lưới WebApp xem có tự động phân tích cột và nhảy cóc qua giờ nghỉ trưa không.
- Thử nghiệm chuyển đổi qua lại giữa 3 ngôn ngữ (VI, EN, JA) trên Tab Quản lý thời gian khi đang có dữ liệu nhập dở.
- Thử nghiệm kịch bản nhập bù ngày: Nhập ngày 11, ngày 13, sau đó nhập ngày 12 ➔ Kiểm tra Google Sheet xem ngày 12 có tự động nằm giữa ngày 11 và 13 không.
- Thử nghiệm kịch bản ghi đè: Mở lại ngày 11 ➔ Kiểm tra xem nút Lưu thường có bị khóa không ➔ Bấm nút Chỉnh sửa ➔ Sửa nội dung ➔ Bấm Overwrite ➔ Kiểm tra dữ liệu trên Sheet.
- Thử nghiệm phân quyền Cấp 1 vs Cấp 2, kiểm tra bảo mật phía server khi can thiệp F12.
- Hướng dẫn 30 - 40 nhân sự quy trình nhập thời gian định kỳ hàng ngày.

---

## XI. ĐÁNH GIÁ TÁC ĐỘNG & HIỆU QUẢ SAU NÂNG CẤP
1. **Đối với Ban Quản lý / Admin:**  
   - Kiểm soát triệt để 100% thời gian thực tế của 30 - 40 nhân sự đến từng block 30 phút mà không cần đốc thúc thủ công.
   - Báo cáo đa chiều tức thì: Nắm bắt ngay dự án nào tiêu tốn bao nhiêu giờ công, giai đoạn nào đang bị chậm tiến độ.
   - Hợp tác quốc tế hoàn hảo: Dễ dàng chia sẻ báo cáo hoặc xuất dữ liệu cho đối tác Nhật Bản và quốc tế với ngôn ngữ tương ứng.
   - Loại bỏ hoàn toàn tình trạng mất dữ liệu do xung đột đồng thời hoặc bấm nhầm.
2. **Đối với Nhân viên:**  
   - **Tối ưu hóa thời gian nhập liệu đến 90%:** Nhờ tính năng Copy-Paste từ Excel, phím tắt `Ctrl+C / Ctrl+V`, nút Điền cả buổi sáng/chiều và nút Sao chép từ Hôm Qua, nhân viên chỉ mất **vài chục giây** là hoàn tất ghi nhận cả ngày làm việc.
   - Giao diện thân thiện bằng chính ngôn ngữ mẹ đẻ (Tiếng Việt hoặc Tiếng Nhật).
   - Không lo mất việc khi rớt mạng nhờ tính năng tự động lưu nháp.
   - Minh bạch tuyệt đối, ghi nhận chính xác công sức và giờ làm thêm của từng cá nhân.
