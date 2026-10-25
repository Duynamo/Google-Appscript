# KẾ HOẠCH NÂNG CẤP HỆ THỐNG: QUẢN LÝ THỜI GIAN LÀM VIỆC CHI TIẾT (TIMESHEET 30 PHÚT) VÀ BẢO MẬT PHÂN QUYỀN 2 CẤP

> **Dự án:** Quản Lý Dự Án & Tiến Độ Google Apps Script WebApp  
> **Phiên bản kiến trúc:** v4.1 (Cập nhật chuẩn hóa bộ 4 mã: Dự Án - Category - Phase - Công Việc)  
> **Trạng thái:** Bản kế hoạch thiết kế hệ thống chi tiết (Chờ duyệt triển khai)  
> **Phạm vi:** Bổ sung Tab Quản lý thời gian, Bổ sung Phase dự án, Chèn cột Mã dự án, Chuẩn hóa hiển thị ký tự mã ngắn, Quản lý nhân sự theo Danh mục tiêu chuẩn, Phân quyền Đăng nhập 2 cấp, và Cơ chế lưu trữ riêng biệt trên Google Sheets cho từng nhân viên.

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
   - Chuỗi 4 mã tinh gọn: `[Mã Dự Án] -> [Mã Category] -> [Phase] -> [Mã Công Việc]` tạo thành cấu trúc phân loại công việc chuẩn xác tuyệt đối, tiết kiệm tối đa diện tích hiển thị trên bảng, thao tác siêu nhanh.
3. **Phân quyền bảo mật 2 cấp tuyệt đối:**  
   - Nhân viên phải đăng nhập đúng tài khoản Google được cấp phép trước bởi Admin.
   - **Cấp 1 (Admin/Toàn quyền):** Can thiệp toàn diện mọi tab, chọn mã nhân viên bất kỳ để kiểm tra/nhập hộ/chỉnh sửa, cấu hình phân quyền và link Sheet.
   - **Cấp 2 (Nhân viên thông thường):** Chỉ được thấy và thao tác duy nhất tại Tab Quản lý thời gian. Ô Mã số nhân viên bị **khóa cứng (ReadOnly)** theo tài khoản đăng nhập của chính họ, triệt để ngăn chặn việc can thiệp vào giờ công của người khác.
4. **Kiến trúc lưu trữ độc lập (Mỗi nhân viên 1 Google Sheet riêng):**  
   Mỗi mã nhân viên sở hữu một đường dẫn Google Sheet độc lập. Việc này giúp phân tách quyền sở hữu dữ liệu, tránh xung đột ghi đồng thời (Concurrency lock), bảo mật quyền riêng tư về khối lượng công việc và dễ dàng tích hợp chia sẻ cho từng cá nhân kiểm tra.

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

```
========================================================================================================================
 TAB: QUẢN LÝ THỜI GIAN LÀM VIỆC CHI TIẾT
========================================================================================================================

 [Thanh điều khiển đầu trang]
 ┌─────────────────┐  ┌──────────────────────┐  ┌───────────────────────────────────────────────┐
 │ 📅 Chọn ngày:    │  │ 👤 Nhân viên:        │  │ 🔗 Bảng tính Google Sheet lưu trữ:            │
 │ [ 2026-10-25 ]  │  │ [NV001 - Nguyễn Văn A▼│  │ [📊 Mở Google Sheet cá nhân của NV001 ↗]      │
 │ (Hôm nay | Lùi) │  │ Cấp bậc: Senior BIM  │  │ ID: 1AbC...xYz | Cập nhật lần cuối: 10:15     │
 └─────────────────┘  └──────────────────────┘  └───────────────────────────────────────────────┘
                                                ┌───────────────────────────────────────────────┐
                                                │ [ 🔄 Tải Lại Ngày Này ]    [ 💾 LƯU THỜI GIAN ]│
                                                └───────────────────────────────────────────────┘

 ------------------------------------------------------------------------------------------------------------------------
 [BẢNG KHUNG GIỜ CHI TIẾT 30 PHÚT TRONG NGÀY]
 ------------------------------------------------------------------------------------------------------------------------
 | STT | Khung Giờ     | Mã Dự Án    | Mã Category | Phase       | Mã Công Việc | Ghi Chú Chi Tiết Công Việc             |
 |=====|===============|=============|=============|=============|==============|========================================|
 | [+] | -- TĂNG CA SÁNG (Dự trù mở rộng: 06:00 - 08:00) -- [Bấm vào đây để bung các khung giờ sớm]                     |
 |-----|---------------|-------------|-------------|-------------|--------------|----------------------------------------|
 | 01  | 08:00 - 08:30 | [ HAG01  ▼] | [ GE   ▼]   | [ BD   ▼]   | [ MTG   ▼]   | Họp giao ban đầu giờ sáng              |
 | 02  | 08:30 - 09:00 | [ HAG01  ▼] | [ PC   ▼]   | [ BD   ▼]   | [ PCP   ▼]   | Lọc nhiễu tầng 1 khu xử lý nước        |
 | 03  | 09:00 - 09:30 | [ HAG01  ▼] | [ PC   ▼]   | [ BD   ▼]   | [ PCL   ▼]   | Phân chia layer hệ đường ống           |
 | 04  | 09:30 - 10:00 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ AR    ▼]   | Dựng sàn và tường trục A-C             |
 | 05  | 10:00 - 10:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ AR    ▼]   | Dựng vách kỹ thuật và cửa sổ           |
 | 06  | 10:30 - 11:00 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ STR   ▼]   | Mô hình hóa dầm cột khu bể xử lý       |
 | 07  | 11:00 - 11:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ STR   ▼]   | Hoàn thiện liên kết dầm phụ            |
 | 08  | 11:30 - 12:00 | [ HAG01  ▼] | [ RP   ▼]   | [ IS   ▼]   | [ RP    ▼]   | Lưu file, upload dữ liệu lên NAS       |
 |-----|---------------|-------------|-------------|-------------|--------------|----------------------------------------|
 | --  | 12:00 - 12:30 | [  (KHÓA) ] | [  (KHÓA) ] | [  (KHÓA) ] | [  (KHÓA)  ] | ☕ [ NGHỈ TRƯA / LUNCH BREAK ]         |
 | --  | 12:30 - 13:00 | [  (KHÓA) ] | [  (KHÓA) ] | [  (KHÓA) ] | [  (KHÓA)  ] | ☕ [ NGHỈ TRƯA / LUNCH BREAK ]         |
 |-----|---------------|-------------|-------------|-------------|--------------|----------------------------------------|
 | 09  | 13:00 - 13:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ MP    ▼]   | Dựng bồn lắng và cụm bơm số 1          |
 | 10  | 13:30 - 14:00 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ MP    ▼]   | Nối tuyến ống công nghệ chính          |
 | 11  | 14:00 - 14:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ MP    ▼]   | Đặt van điều khiển và khớp nối         |
 | 12  | 14:30 - 15:00 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ ELE   ▼]   | Đi thang máng cáp trục điện chính      |
 | 13  | 15:00 - 15:30 | [ JJK01  ▼] | [ M3   ▼]   | [ DD   ▼]   | [ ELE   ▼]   | Bố trí tủ điện điều khiển trung tâm    |
 | 14  | 15:30 - 16:00 | [ TOOL01 ▼] | [ DE   ▼]   | [ BD   ▼]   | [ TOOL  ▼]   | Viết script kiểm tra va chạm mô hình   |
 | 15  | 16:00 - 16:30 | [ JJK01  ▼] | [ RP   ▼]   | [ IS   ▼]   | [ IS    ▼]   | Chụp ảnh mô hình làm báo cáo nghiệm thu|
 | 16  | 16:30 - 17:00 | [ CHUNG  ▼] | [ GE   ▼]   | [ --   ▼]   | [ GEN   ▼]   | Viết báo cáo cuối ngày, dọn dẹp máy trạm|
 |-----|---------------|-------------|-------------|-------------|--------------|----------------------------------------|
 | [+] | -- TĂNG CA TỐI (Dự trù mở rộng: 17:00 - 22:00) -- [Bấm vào đây để bung các khung giờ tăng ca]                   |
 ------------------------------------------------------------------------------------------------------------------------
 [Thống kê nhanh trong ngày]: Ca chính thức: 8.0 giờ | Tăng ca sáng: 0.0 giờ | Tăng ca tối: 0.0 giờ
========================================================================================================================
```

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
4. **Nút Thao tác:**
   - **Nút [ 💾 Lưu Thời Gian ]:** Nút hành động chính nổi bật, có hiển thị trạng thái đang xử lý (Spinner) và thông báo thành công hoặc lỗi.
   - **Nút [ 🔄 Tải Lại Dữ Liệu ]:** Nạp lại dữ liệu nguyên bản từ Sheet nếu người dùng muốn hủy các thao tác vừa nhập tạm thời trên màn hình.

#### B. Khung bảng chi tiết và thứ tự các cột chuẩn
Mỗi hàng khung giờ được bố trí theo đúng trật tự logic:

1. **Cột 1: Khung Giờ (Time Slot):**
   - Hiển thị nhãn thời gian rõ ràng, ví dụ `08:00 - 08:30`.
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

#### C. Phân chia khung thời gian chuẩn và cơ chế nghỉ trưa
- **Khung thời gian chuẩn từ 08:00 đến 17:00:** Gồm đúng 16 slot thời gian, mỗi slot kéo dài 30 phút.
- **Hàng nghỉ trưa (12:00 - 13:00):** Gồm 2 hàng:
  - `12:00 - 12:30`: Nghỉ trưa
  - `12:30 - 13:00`: Nghỉ trưa
  - **Quy tắc hiển thị:** 2 hàng này được định dạng màu xám nhạt (Muted background), hiển thị nhãn "Nghỉ trưa / Lunch Break", mặc định khóa không cho chọn Dự án / Category / Phase / Công việc để tránh tính trùng thời gian làm việc thực tế. Hệ thống vẫn cho phép quản lý mở khóa nếu phát sinh ca trực trưa đặc biệt.

#### D. Khu vực dự trù Tăng ca sáng & Tăng ca tối (Overtime Slots)
- **Tăng ca sáng (Early Overtime):** Khung giờ từ `06:00` đến `08:00` (Gồm 4 slot: `06:00 - 06:30`, `06:30 - 07:00`, `07:00 - 07:30`, `07:30 - 08:00`). Thiết kế dạng khối thu gọn/bung ra (Collapsible Accordion), mặc định ẩn để giao diện gọn gàng, chỉ mở ra khi nhân viên có làm việc trước giờ chuẩn.
- **Tăng ca tối (Evening Overtime):** Khung giờ từ `17:00` đến `22:00` (Gồm tối đa 10 slot: `17:00 - 17:30`, `17:30 - 18:00`, ..., `21:30 - 22:00`). Có nút bấm `+ Thêm khung giờ tăng ca tối` giúp nhân viên kích hoạt slot khi phát sinh làm thêm giờ.
- **Tiện ích sao chép nhanh (UX Booster):** Cung cấp nút sao chép toàn bộ bộ mã (Dự án, Category, Phase, Công việc) từ hàng trên xuống hàng dưới chỉ với 1 click, giúp nhân viên không phải chọn lại dropdown khi làm cùng 1 công việc liên tục trong nhiều khung giờ.

---

## V. KIẾN TRÚC LƯU TRỮ GOOGLE SHEET RIÊNG BIỆT CHO MỖI NHÂN VIÊN

Để đáp ứng yêu cầu: *"Tất cả giá trị thời gian thi công sẽ được lưu trên google sheet, mỗi mã nhân viên 1 link google sheet"*, giải pháp quy định cấu trúc tổ chức và lưu trữ như sau:

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
| **A: Log_ID** | Khóa chính duy nhất cho từng slot | `20261025_NV001_0800` | Ghép từ: Ngày + Mã NV + Giờ bắt đầu |
| **B: Work_Date** | Ngày làm việc | `2026-10-25` | Định dạng chuẩn YYYY-MM-DD |
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
| **P: Updated_At** | Dấu vết thời gian ghi nhận | `2026-10-25 10:15:30` | Chống gian lận thời gian ghi |
| **Q: Updated_By** | Email tài khoản đã thực hiện lưu | `nguyenvana@gmail.com` | Xác thực người ghi |

### 3. Cơ chế Khởi tạo bảng tính mới (Auto-provisioning)
Khi Admin thêm một nhân viên mới vào Danh mục tiêu chuẩn:
- **Cách 1 (Tự động hóa):** Hệ thống sao chép (Duplicate) từ một Bảng tính Mẫu chuẩn (Template Sheet có sẵn cấu trúc cột, định dạng màu sắc và bảng tổng hợp Pivot Table), tự động đổi tên file theo mã nhân viên, tự động cấp quyền chia sẻ cho email nhân viên và lưu URL mới vào ô Link Google Sheet trong Danh mục tiêu chuẩn.
- **Cách 2 (Thủ công linh hoạt):** Admin có thể tạo sẵn bảng tính hoặc copy link bảng tính đã có của nhân viên dán trực tiếp vào Danh mục tiêu chuẩn.

---

## VI. LUỒNG XỬ LÝ DỮ LIỆU & ĐỒNG BỘ 2 CHIỀU (WORKFLOW SPECIFICATION)

```
[ NGƯỜI DÙNG ]                [ GIAO DIỆN WEBAPP ]             [ GOOGLE APPS SCRIPT ]          [ GOOGLE SHEET RIÊNG ]
      │                                │                                 │                               │
      │ 1. Truy cập WebApp             │                                 │                               │
      ├───────────────────────────────>│ 2. Khởi tạo & Lấy thông tin user │                               │
      │                                ├────────────────────────────────>│ 3. Kiểm tra Email đăng nhập   │
      │                                │                                 ├─────────┐                     │
      │                                │                                 │ [Đối soát với Taxonomy]       │
      │                                │                                 │ Phân cấp: Cấp 1 hoặc Cấp 2    │
      │                                │                                 │ Lấy Link Sheet cá nhân        │
      │                                │ 4. Trả về thông tin phân quyền  │<────────┘                     │
      │                                │<────────────────────────────────┤                               │
      │                                │                                 │                               │
      │                                │ 5. Render Giao diện:            │                               │
      │                                │    - Nếu Cấp 2: Khóa Mã NV,     │                               │
      │                                │      ẩn các tab khác            │                               │
      │                                │    - Gắn Link Google Sheet      │                               │
      │                                │                                 │                               │
      │ 6. Chọn Ngày làm việc          │                                 │                               │
      ├───────────────────────────────>│ 7. Gửi yêu cầu nạp dữ liệu ngày │                               │
      │                                ├────────────────────────────────>│ 8. Mở Sheet cá nhân theo URL  │
      │                                │                                 ├──────────────────────────────>│
      │                                │                                 │ 9. Đọc các dòng của ngày này  │
      │                                │                                 │<──────────────────────────────┤
      │                                │ 10. Đổ dữ liệu lên các slot     │                               │
      │                                │     (Dự Án, Cat, Phase, Task)   │                               │
      │                                │<────────────────────────────────┤                               │
      │                                │                                 │                               │
      │ 11. Nhập Mã Dự Án, Cat, Phase, │                                 │                               │
      │     Mã Công việc, Ghi chú      │                                 │                               │
      │ 12. Bấm [ 💾 LƯU THỜI GIAN ]   │                                 │                               │
      ├───────────────────────────────>│ 13. Validate dữ liệu tại client │                               │
      │                                ├────────────────────────────────>│ 14. Kiểm tra quyền bảo mật    │
      │                                │                                 │     (Kiểm tra Email = Mã NV)  │
      │                                │                                 │ 15. Ghi đè/cập nhật dữ liệu   │
      │                                │                                 ├──────────────────────────────>│
      │                                │                                 │ 16. Phản hồi kết quả lưu thành công
      │                                │ 17. Hiển thị Toast thông báo    │<──────────────────────────────┤
      │                                │<────────────────────────────────┤                               │
      │                                │                                 │                               │
```

### 1. Luồng Tải dữ liệu khi mở tab hoặc đổi ngày
1. Người dùng chọn ngày cần xem/nhập (mặc định là ngày hôm nay).
2. Giao diện gửi yêu cầu cùng mã nhân viên tương ứng về Backend Apps Script.
3. Backend lấy Link Google Sheet từ Danh mục tiêu chuẩn ứng với mã nhân viên đó.
4. Mở file Google Sheet bằng ID trích xuất từ link, truy vấn các hàng trong tab `DAILY_LOG` có `Work_Date` trùng với ngày đã chọn.
5. Nếu đã có dữ liệu trước đó: Tự động điền đầy đủ Mã Dự Án, Mã Category, Phase, Mã Công Việc và Ghi chú vào đúng từng dòng khung giờ trên màn hình.
6. Nếu chưa có dữ liệu: Giữ nguyên các hàng trống để người dùng nhập mới, riêng 2 hàng nghỉ trưa luôn giữ trạng thái mặc định.

### 2. Luồng Lưu dữ liệu (Save Timesheet)
1. Khi người dùng click nút `[ 💾 LƯU THỜI GIAN ]`:
   - Giao diện quét toàn bộ các hàng khung giờ (gồm cả ca chuẩn và các ca OT có nhập dữ liệu).
   - Kiểm tra điều kiện hợp lệ: Nếu một hàng đã chọn Mã Dự án / Category thì bắt buộc phải chọn Phase, Mã công việc hoặc ghi chú; loại trừ các hàng hoàn toàn không phát sinh công việc.
2. Gửi gói dữ liệu về máy chủ:
   - Backend xác thực Email đăng nhập có khớp với Mã nhân viên đang lưu hay không (Nếu là Cấp 2).
   - Sử dụng cơ chế ghi theo khối (Batch Operation) vào Google Sheet cá nhân:
     - Xóa các bản ghi cũ của chính ngày đó (nếu có cập nhật lại).
     - Ghi các bản ghi mới vào bảng tính kèm theo Dấu thời gian (`Updated_At`) và Email thực hiện (`Updated_By`).
3. Phản hồi thông báo trực quan trên giao diện: Bật thông báo xanh "Đã lưu thành công dữ liệu ngày DD/MM/YYYY vào Google Sheet cá nhân", đồng thời cập nhật thời gian lưu gần nhất trên thanh tiêu đề.

---

## VII. XỬ LÝ CÁC TÌNH HUỐNG BIÊN & GIẢI PHÁP DỰ PHÒNG TRIỆT ĐỂ (EDGE CASES)

| Tình huống phát sinh | Rủi ro kỹ thuật | Giải pháp xử lý triệt để |
| :--- | :--- | :--- |
| **Nhân viên cố tình thay đổi mã nhân viên qua F12 Console** | Nhân viên Cấp 2 can thiệp ghi dữ liệu cho người khác | **Kiểm tra 2 lớp:** Backend luôn so sánh `Session.getActiveUser().getEmail()` với email của mã nhân viên trong Danh mục tiêu chuẩn. Nếu không khớp và không phải Admin Cấp 1, lập tức chặn đứng và từ chối ghi. |
| **Link Google Sheet cá nhân bị xóa hoặc sai quyền chia sẻ** | Lỗi sập ứng dụng khi bấm lưu thời gian | Hệ thống kiểm tra trước khi ghi: Nếu link Sheet không hợp lệ hoặc không có quyền truy cập, trả về thông báo lỗi rõ ràng: *"Không thể kết nối đến Google Sheet của nhân sự này. Vui lòng liên hệ Admin để kiểm tra quyền truy cập file."* |
| **Trùng lặp dữ liệu khi bấm nút Lưu nhiều lần liên tục** | Dữ liệu bị ghi đè nhiều dòng rác trên Sheet | Trên giao diện: Vô hiệu hóa (Disable) nút Lưu ngay khi click, hiển thị biểu tượng xoay (Loading). Trên Backend: Sử dụng mã định danh duy nhất cho từng slot (`Log_ID = Ngày_MãNV_GiờBắtĐầu`) để ghi đè chuẩn xác, không bị nhân đôi dòng. |
| **Mất kết nối mạng giữa chừng khi đang nhập liệu** | Mất toàn bộ nội dung ghi chú đã gõ trong ngày | Tự động lưu tạm dữ liệu vào bộ nhớ cục bộ trình duyệt (`localStorage`) sau mỗi thao tác. Khi có mạng trở lại hoặc tải lại trang, hệ thống tự động phục hồi dữ liệu chưa kịp lưu. |
| **Nhu cầu nhập bù cho các ngày quá khứ** | Nhân viên quên nhập muốn nhập lại ngày hôm trước | Cho phép chọn lùi ngày trên Datepicker. Bảng tính luôn ghi nhận cột `Updated_At` thực tế để Admin đối chiếu tính trung thực về thời điểm nhập liệu của nhân sự. |

---

## VIII. KẾ HOẠCH TRIỂN KHAI THEO TỪNG GIAI ĐOẠN (ROADMAP)

### Giai đoạn 1: Chuẩn hóa Dữ liệu & Danh mục Tiêu chuẩn
- Bổ sung cấu trúc dữ liệu Nhân sự vào hệ thống: Mã số nhân viên, Tên nhân viên, Cấp bậc, Email, Phân quyền (Cấp 1 / Cấp 2), Link Google Sheet cá nhân.
- Chuẩn hóa các bộ mã ngắn trong Danh mục tiêu chuẩn:
  - Nhóm `PROJECT_CODE`: Mã dự án dạng ký tự ngắn (`JJK01`, `HAG01`, `AMK01`...).
  - Nhóm `CATEGORY`: Mã nhóm việc dạng ký tự ngắn (`GE`, `DE`, `PC`, `M3`, `RP`, `MTG`...).
  - Nhóm `PHASE`: Mã giai đoạn dạng ký tự ngắn (`BD`, `DD`, `IS`...).
  - Nhóm `DISCIPLINE`: Mã nghiệp vụ dạng ký tự ngắn (`AR`, `STR`, `MP`, `ELE`, `PCP`, `PCL`...).

### Giai đoạn 2: Tạo Bảng tính Google Sheet Mẫu & Cấp phát Thư mục
- Thiết kế tệp Google Sheet Mẫu (`Template_Timesheet_Standard`) chuẩn hóa các cột từ A đến Q (bao gồm cột Mã dự án, Category, Phase, Discipline), kẻ bảng sẵn, định dạng màu sắc trang nhã, tích hợp sẵn sheet tổng hợp tuần/tháng.
- Thiết lập thư mục lưu trữ tập trung trên Google Drive và cấp quyền truy cập.
- Tạo bảng tính riêng cho từng nhân viên hiện có và điền liên kết vào Danh mục tiêu chuẩn.

### Giai đoạn 3: Phát triển Backend API & Kiểm soát Truy cập
- Xây dựng module kiểm tra phiên đăng nhập và định tuyến giao diện theo Phân quyền Cấp 1 vs Cấp 2.
- Xây dựng module đọc dữ liệu ngày từ Google Sheet cá nhân dựa theo URL trong danh mục.
- Xây dựng module ghi nhận và cập nhật dữ liệu slot 30 phút theo lô (Batch Write) đảm bảo tốc độ và tính toàn vẹn.

### Giai đoạn 4: Thiết kế Giao diện Tab "Quản lý thời gian"
- Bổ sung Tab "Quản lý thời gian" vào thanh điều hướng.
- Xây dựng thanh công cụ: Bộ chọn ngày, Thông tin nhân viên, Huy hiệu liên kết Google Sheet, Nút Lưu.
- Xây dựng lưới bảng khung giờ chi tiết: 16 slot chuẩn (08:00 - 17:00), 2 hàng nghỉ trưa cố định, 2 khối tăng ca sáng và tăng ca tối mở rộng linh hoạt.
- Tích hợp bộ 4 dropdown mã ngắn: **Mã Dự Án** (chèn giữa Khung giờ và Category), **Mã Category** (chỉ ký tự), **Phase Dự Án**, **Mã Công Việc**, và **Ô ghi chú chi tiết**.

### Giai đoạn 5: Kiểm thử Toàn diện & Bàn giao Vận hành
- Thử nghiệm đăng nhập bằng tài khoản Cấp 1: Kiểm tra khả năng chọn nhiều nhân viên, mở link Sheet, xem và sửa dữ liệu.
- Thử nghiệm đăng nhập bằng tài khoản Cấp 2: Kiểm tra việc tự động ẩn các tab khác, khóa cứng mã nhân viên, kiểm tra bảo mật phía server.
- Thử nghiệm lưu dữ liệu trên nhiều thiết bị và kiểm tra tính nhất quán dữ liệu ghi trên Google Sheet.
- Hướng dẫn nhân sự quy trình nhập thời gian định kỳ hàng ngày.

---

## IX. ĐÁNH GIÁ TÁC ĐỘNG & HIỆU QUẢ SAU NÂNG CẤP
1. **Đối với Ban Quản lý / Admin:**  
   - Kiểm soát triệt để 100% thời gian thực tế của nhân sự đến từng 30 phút mà không cần đốc thúc thủ công.
   - Dễ dàng phân tích đa chiều: Dự án nào (`JJK01`), Nhóm việc nào (`M3`), Giai đoạn nào (`DD`), Chuyên môn nào (`AR`) tiêu tốn bao nhiêu giờ công.
   - Dữ liệu tách bạch trên từng Google Sheet giúp mở rộng không giới hạn mà không lo chạm ngưỡng giới hạn dung lượng hoặc nghẽn mạng trên 1 file đơn lẻ.
2. **Đối với Nhân viên:**  
   - Giao diện siêu gọn gàng: Các cột dropdown chỉ thể hiện ký tự mã (`JJK01`, `M3`, `DD`, `AR`) giúp thao tác nhanh trong tích tắc.
   - Minh bạch hóa công sức lao động, ghi nhận chính xác thời gian tăng ca sáng/tối phục vụ đánh giá năng suất và quyền lợi công bằng.
