# KẾ HOẠCH PHÁT TRIỂN TÍNH NĂNG: ĐA NGÔN NGỮ GIAO DIỆN (I18N) & THIẾT LẬP NGÔN NGỮ MẶC ĐỊNH
**Dự án:** Quản Lý Dự Án Web App v3.0 (Google Apps Script)  
**Vị trí:** `c:\Users\Laptop\OneDrive\Desktop\Hello World\Google-Appscript\03_Project Management`  
**Ngôn ngữ hỗ trợ:** 🇻🇳 Tiếng Việt (`vi`), 🇺🇸 Tiếng Anh (`en`), 🇯🇵 Tiếng Nhật (`ja`)  
**Ngày lập kế hoạch:** 24/10/2026  
**Trạng thái:** Bản kế hoạch chi tiết (Ready for Review & Implementation)

---

## 1. TỔNG QUAN & MỤC TIÊU BÀI TOÁN

### 1.1. Hiện trạng
* Ứng dụng **Quản Lý Dự Án v3.0** hiện đang sử dụng 100% giao diện tiếng Việt cứng (hardcoded HTML & JavaScript strings) trong file [Index.html](file:///c:/Users/Laptop/OneDrive/Desktop/Hello%20World/Google-Appscript/03_Project%20Management/Index.html).
* Dữ liệu trong Google Sheets ([Code.gs](file:///c:/Users/Laptop/OneDrive/Desktop/Hello%20World/Google-Appscript/03_Project%20Management/Code.gs), [Projectsapi.gs](file:///c:/Users/Laptop/OneDrive/Desktop/Hello%20World/Google-Appscript/03_Project%20Management/Projectsapi.gs), [Taskapi.gs](file:///c:/Users/Laptop/OneDrive/Desktop/Hello%20World/Google-Appscript/03_Project%20Management/Taskapi.gs), [Userapi.gs](file:///c:/Users/Laptop/OneDrive/Desktop/Hello%20World/Google-Appscript/03_Project%20Management/Userapi.gs)) cũng đang lưu trữ các trạng thái, độ ưu tiên, vai trò bằng tiếng Việt chuẩn (ví dụ: `Đang thực hiện`, `Hoàn thành`, `Khẩn cấp`, `Admin`,...).
* Nhiều dự án xây dựng và công nghệ hiện nay có sự phối hợp giữa kỹ sư/quản lý Việt Nam, khách hàng/đối tác Nhật Bản (như dự án `JJK01_社会福祉法人十字会 工房ヴィレッジ新築工事`), và các chuyên gia quốc tế (sử dụng tiếng Anh).
* Người dùng gặp rào cản ngôn ngữ khi sử dụng chung một hệ sinh thái quản lý dự án.

### 1.2. Mục tiêu giải pháp
1. **Hỗ trợ 3 ngôn ngữ hoàn chỉnh:**
   * 🇻🇳 **Tiếng Việt (`vi`)**: Bản ngữ gốc của hệ thống.
   * 🇺🇸 **English (`en`)**: Tiêu chuẩn quốc tế cho dự án công nghệ / đa quốc gia.
   * 🇯🇵 **日本語 (`ja`)**: Phù hợp cho các dự án hợp tác với doanh nghiệp, nhà thầu Nhật Bản.
2. **Chuyển đổi tức thì (Instant Switching):** Chuyển đổi giao diện ngay lập tức mà **không cần reload lại trang**, không làm mất dữ liệu người dùng đang nhập dở trên form/modal.
3. **Cơ chế thiết lập ngôn ngữ mặc định (Default Language):**
   * **Cấp độ người dùng (User-level Preference):** Ghi nhớ ngôn ngữ ưu tiên của từng người vào `localStorage` (hoặc tài khoản) và tự động áp dụng trong mọi phiên đăng nhập kế tiếp.
   * **Cấp độ hệ thống (System-wide Default):** Quản trị viên (Admin) có quyền thiết lập ngôn ngữ mặc định chung cho toàn bộ Web App khi người dùng mới truy cập lần đầu.
4. **Đảm bảo 100% tính toàn vẹn dữ liệu (Data Integrity & Backward Compatibility):**
   * Cơ sở dữ liệu Google Sheets vẫn duy trì định dạng chuẩn (canonical value) không bị đảo lộn.
   * Các công thức, bộ lọc, trigger gửi mail tự động chạy ngầm ở backend vẫn hoạt động bình thường mà không bị ảnh hưởng bởi ngôn ngữ hiển thị trên giao diện của người dùng.

---

## 2. THIẾT KẾ TRẢI NGHIỆM NGƯỜI DÙNG & GIAO DIỆN (UX/UI)

### 2.1. Vị trí nút chuyển đổi ngôn ngữ trên Topbar
Nút chuyển đổi ngôn ngữ được đặt tại thanh điều hướng trên cùng (**Topbar**), ngay cạnh nút chuông thông báo 🔔 và nút làm mới 🔄:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [PM] Quản Lý Dự Án   │ 🔽 [Lọc DA...] │ 🔍 [Tìm kiếm...] │ [+ Tạo mới ▾] │ 🌐 [ 🇻🇳 VI ▾ ] │ 🔔 │ 🔄 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Khi bấm vào nút `🌐 [ 🇻🇳 VI ▾ ]`, mở dropdown menu trực quan và hiện đại:

```
┌──────────────────────────────────────────────┐
│  🌐 Chọn ngôn ngữ / Language / 言語          │
├──────────────────────────────────────────────┤
│  ✔  🇻🇳  Tiếng Việt             (Mặc định)    │
│     🇺🇸  English                              │
│     🇯🇵  日本語                                │
├──────────────────────────────────────────────┤
│  ⚙️ [ ] Đặt làm ngôn ngữ mặc định của tôi    │
│  👑 [🛠 Cài đặt mặc định hệ thống (Admin)]    │
└──────────────────────────────────────────────┘
```

### 2.2. Modal cấu hình Ngôn ngữ mặc định hệ thống (Dành cho Admin)
Trong màn hình quản trị hoặc menu cấu hình, Admin có thể lựa chọn:
* **Ngôn ngữ mặc định khi khởi tạo:** `[ Tiếng Việt | English | 日本語 ]`
* **Cơ chế nhận diện:** Tự động phát hiện theo ngôn ngữ trình duyệt (`navigator.language`) nếu người dùng chưa từng chọn ngôn ngữ.

---

## 3. KIẾN TRÚC KỸ THUẬT & GIẢI PHÁP THỰC THI (TECHNICAL ARCHITECTURE)

### 3.1. Mô hình kiến trúc i18n cho Single-Page App (Google Apps Script)

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Index.html)                     │
│                                                                        │
│  ┌───────────────────────┐         ┌────────────────────────────────┐  │
│  │ I18N DICTIONARY       │         │ I18N ENGINE (Core)             │  │
│  │  - vi: { ... }        │ ──────> │  - t(key, params)              │  │
│  │  - en: { ... }        │         │  - setLanguage(lang)           │  │
│  │  - ja: { ... }        │         │  - applyTranslations()         │  │
│  └───────────────────────┘         └────────────────┬───────────────┘  │
│                                                     │                  │
│       ┌─────────────────────────────────────────────┴────────────┐     │
│       ▼                                                          ▼     │
│ ┌───────────────────────────┐                    ┌───────────────────┐ │
│ │ Static DOM Elements       │                    │ Dynamic Data / JS │ │
│ │ data-i18n="nav_dashboard" │                    │ Status Mapper     │ │
│ │ data-i18n-ph="search_ph"  │                    │ Priority Mapper   │ │
│ │ data-i18n-title="..."     │                    │ Date & Charts     │ │
│ └───────────────────────────┘                    └───────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Backend sync (Get/Set Default)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Google Apps Script)                   │
│  - ScriptProperties: Cấu hình ngôn ngữ mặc định hệ thống               │
│  - UserProperties / USERS Sheet: Cấu hình ngôn ngữ theo tài khoản      │
│  - Giữ nguyên canonical values ("Đang thực hiện", "Hoàn thành")       │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Cấu trúc từ điển dịch thuật (`i18n_dict`)
Tách từ điển thành các nhóm chức năng rõ ràng, dễ bảo trì và mở rộng:

```javascript
const I18N = {
  vi: {
    // Điều hướng (Sidebar & Topbar)
    nav_dashboard: "Tổng quan",
    nav_gantt: "Sơ đồ Gantt",
    nav_projects: "Dự án",
    nav_tasks: "Nhiệm vụ",
    nav_users: "Người dùng",
    nav_log: "Nhật ký",
    logout: "Đăng xuất",
    welcome: "Chào mừng trở lại",
    search_placeholder: "Tìm kiếm...",
    create_new: "+ Tạo mới",
    add_project: "Thêm dự án",
    add_task: "Thêm nhiệm vụ",
    add_user: "Thêm nhân viên",
    filter_all_projects: "Tất cả dự án",
    filter_by_project: "Lọc theo dự án...",
    
    // Trạng thái công việc (Task Status)
    st_pending: "Chờ thực hiện",
    st_in_progress: "Đang thực hiện",
    st_review: "Chờ duyệt",
    st_completed: "Hoàn thành",
    st_paused: "Tạm dừng",
    st_cancelled: "Hủy",
    st_overdue: "Quá hạn",
    
    // Độ ưu tiên (Task Priority)
    pr_low: "Thấp",
    pr_medium: "Trung bình",
    pr_high: "Cao",
    pr_urgent: "Khẩn cấp",
    
    // Trạng thái dự án (Project Status)
    pj_planning: "Lên kế hoạch",
    pj_in_progress: "Đang thực hiện",
    pj_completed: "Hoàn thành",
    pj_paused: "Tạm dừng",
    pj_cancelled: "Hủy",
    
    // Vai trò (Roles)
    role_admin: "Quản trị viên",
    role_manager: "Quản lý dự án",
    role_member: "Thành viên",
    role_viewer: "Người xem",
    
    // Các nút thao tác (Buttons & Actions)
    btn_save: "Lưu",
    btn_cancel: "Hủy",
    btn_edit: "Sửa",
    btn_delete: "Xóa",
    btn_confirm: "Xác nhận",
    btn_close: "Đóng",
    btn_filter: "Lọc",
    btn_export: "Xuất dữ liệu",
    btn_bulk_add: "Thêm hàng loạt",
    btn_duplicate: "Tạo bản sao",
    btn_set_default_lang: "Đặt làm ngôn ngữ mặc định",
    btn_system_default_lang: "Cài đặt mặc định hệ thống",
    
    // Thông báo & Toast (Notifications & Alerts)
    msg_saved_success: "Lưu dữ liệu thành công!",
    msg_delete_success: "Đã xóa thành công!",
    msg_delete_confirm: "Bạn có chắc chắn muốn xóa không? Thao tác này không thể hoàn tác.",
    msg_lang_changed: "Đã chuyển đổi sang Tiếng Việt",
    msg_default_lang_saved: "Đã lưu Tiếng Việt làm ngôn ngữ mặc định",
    
    // Thẻ Dashboard & Thống kê
    dash_total_projects: "Tổng Dự Án",
    dash_total_tasks: "Tổng Nhiệm Vụ",
    dash_completed_tasks: "Đã Hoàn Thành",
    dash_overdue_tasks: "Việc Quá Hạn",
    dash_progress_overview: "Tổng quan tiến độ",
    dash_recent_activity: "Hoạt động gần đây"
  },

  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_gantt: "Gantt Chart",
    nav_projects: "Projects",
    nav_tasks: "Tasks",
    nav_users: "Users",
    nav_log: "Activity Log",
    logout: "Log Out",
    welcome: "Welcome back",
    search_placeholder: "Search...",
    create_new: "+ Create ▾",
    add_project: "New Project",
    add_task: "New Task",
    add_user: "New User",
    filter_all_projects: "All Projects",
    filter_by_project: "Filter by project...",
    
    // Task Status
    st_pending: "To Do",
    st_in_progress: "In Progress",
    st_review: "Under Review",
    st_completed: "Completed",
    st_paused: "On Hold",
    st_cancelled: "Cancelled",
    st_overdue: "Overdue",
    
    // Task Priority
    pr_low: "Low",
    pr_medium: "Medium",
    pr_high: "High",
    pr_urgent: "Urgent",
    
    // Project Status
    pj_planning: "Planning",
    pj_in_progress: "In Progress",
    pj_completed: "Completed",
    pj_paused: "On Hold",
    pj_cancelled: "Cancelled",
    
    // Roles
    role_admin: "Admin",
    role_manager: "Manager",
    role_member: "Member",
    role_viewer: "Viewer",
    
    // Buttons & Actions
    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_edit: "Edit",
    btn_delete: "Delete",
    btn_confirm: "Confirm",
    btn_close: "Close",
    btn_filter: "Filter",
    btn_export: "Export",
    btn_bulk_add: "Bulk Add",
    btn_duplicate: "Duplicate",
    btn_set_default_lang: "Set as my default language",
    btn_system_default_lang: "System Default Settings",
    
    // Notifications & Toast
    msg_saved_success: "Saved successfully!",
    msg_delete_success: "Deleted successfully!",
    msg_delete_confirm: "Are you sure you want to delete this? This action cannot be undone.",
    msg_lang_changed: "Language changed to English",
    msg_default_lang_saved: "English set as default language",
    
    // Dashboard & Stats
    dash_total_projects: "Total Projects",
    dash_total_tasks: "Total Tasks",
    dash_completed_tasks: "Completed Tasks",
    dash_overdue_tasks: "Overdue Tasks",
    dash_progress_overview: "Progress Overview",
    dash_recent_activity: "Recent Activity"
  },

  ja: {
    // Navigation
    nav_dashboard: "ダッシュボード",
    nav_gantt: "ガントチャート",
    nav_projects: "プロジェクト",
    nav_tasks: "タスク一覧",
    nav_users: "ユーザー管理",
    nav_log: "操作ログ",
    logout: "ログアウト",
    welcome: "おかえりなさい",
    search_placeholder: "検索...",
    create_new: "+ 新規作成 ▾",
    add_project: "プロジェクト追加",
    add_task: "タスク追加",
    add_user: "メンバー追加",
    filter_all_projects: "すべてのプロジェクト",
    filter_by_project: "プロジェクトで絞り込み...",
    
    // Task Status
    st_pending: "未着手",
    st_in_progress: "進行中",
    st_review: "確認待ち",
    st_completed: "完了",
    st_paused: "保留",
    st_cancelled: "中止",
    st_overdue: "期限超過",
    
    // Task Priority
    pr_low: "低",
    pr_medium: "中",
    pr_high: "高",
    pr_urgent: "至急",
    
    // Project Status
    pj_planning: "計画中",
    pj_in_progress: "進行中",
    pj_completed: "完了",
    pj_paused: "保留",
    pj_cancelled: "中止",
    
    // Roles
    role_admin: "管理者 (Admin)",
    role_manager: "責任者 (Manager)",
    role_member: "担当者 (Member)",
    role_viewer: "閲覧者 (Viewer)",
    
    // Buttons & Actions
    btn_save: "保存",
    btn_cancel: "キャンセル",
    btn_edit: "編集",
    btn_delete: "削除",
    btn_confirm: "確認",
    btn_close: "閉じる",
    btn_filter: "フィルター",
    btn_export: "エクスポート",
    btn_bulk_add: "一括追加",
    btn_duplicate: "複製する",
    btn_set_default_lang: "デフォルト言語に設定",
    btn_system_default_lang: "システム既定言語設定",
    
    // Notifications & Toast
    msg_saved_success: "正常に保存されました！",
    msg_delete_success: "正常に削除されました！",
    msg_delete_confirm: "本当に削除しますか？この操作は取り消せません。",
    msg_lang_changed: "言語を日本語に変更しました",
    msg_default_lang_saved: "日本語をデフォルト言語に設定しました",
    
    // Dashboard & Stats
    dash_total_projects: "総プロジェクト数",
    dash_total_tasks: "総タスク数",
    dash_completed_tasks: "完了タスク",
    dash_overdue_tasks: "期限切れタスク",
    dash_progress_overview: "進捗サマリー",
    dash_recent_activity: "最近のアクティビティ"
  }
};
```

---

## 4. CHI TIẾT CÁC CƠ CHẾ KỸ THUẬT QUAN TRỌNG

### 4.1. Bộ máy Dịch Lõi (I18N Core Engine)
Tạo đối tượng `i18n` quản lý trạng thái:

```javascript
const i18n = {
  currentLang: 'vi',
  defaultLang: 'vi',
  
  // Khởi tạo ngôn ngữ ban đầu theo thứ tự ưu tiên
  init(systemDefaultLang) {
    const savedUserLang = localStorage.getItem('pm_user_lang');
    const systemLang = systemDefaultLang || 'vi';
    
    if (savedUserLang && ['vi','en','ja'].includes(savedUserLang)) {
      this.currentLang = savedUserLang;
    } else if (['vi','en','ja'].includes(systemLang)) {
      this.currentLang = systemLang;
    } else {
      // Tự động phát hiện theo trình duyệt nếu không có cấu hình
      const navLang = (navigator.language || '').slice(0, 2);
      this.currentLang = ['vi','en','ja'].includes(navLang) ? navLang : 'vi';
    }
    this.apply();
  },
  
  // Hàm lấy chuỗi dịch thuật
  t(key, params = {}) {
    const dict = I18N[this.currentLang] || I18N['vi'];
    let text = dict[key] || I18N['vi'][key] || key;
    // Thay thế các biến động nếu có ví dụ: t('hello_user', { name: 'Duy' })
    Object.keys(params).forEach(k => {
      text = text.replace(new RegExp(`{${k}}`, 'g'), params[k]);
    });
    return text;
  },
  
  // Chuyển ngôn ngữ tức thì
  setLanguage(lang, setAsDefault = false) {
    if (!['vi','en','ja'].includes(lang)) return;
    this.currentLang = lang;
    if (setAsDefault) {
      localStorage.setItem('pm_user_lang', lang);
      // Gọi backend lưu vào User Profile nếu cần thiết
      google.script.run.setUserLanguagePreference(lang);
    }
    this.apply();
    _refreshUI(); // Vẽ lại các bảng, gantt, dashboard
    toast(this.t('msg_lang_changed'), 'info');
  },
  
  // Quét DOM và cập nhật tất cả thẻ có data-i18n
  apply() {
    document.documentElement.lang = this.currentLang;
    
    // Dịch nội dung text
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.innerHTML = this.t(key);
    });
    
    // Dịch placeholder của ô input
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (key) el.placeholder = this.t(key);
    });
    
    // Dịch tooltip/title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.title = this.t(key);
    });
    
    // Cập nhật nhãn trên nút chọn ngôn ngữ Topbar
    const langLabels = { vi: '🇻🇳 VI', en: '🇺🇸 EN', ja: '🇯🇵 JA' };
    const curBtn = document.getElementById('cur-lang-badge');
    if (curBtn) curBtn.textContent = langLabels[this.currentLang] || '🌐';
  }
};
```

### 4.2. Cơ chế Ánh xạ Hai Chiều: Trạng thái, Độ ưu tiên, Vai trò (Bidirectional Mapping)
Để đảm bảo **không bao giờ làm hỏng dữ liệu trong Google Sheets**:

* **Từ CSDL -> UI:** Khi nhận chuỗi tiếng Việt (`"Đang thực hiện"`), UI dịch sang ngôn ngữ đang chọn:
  * VI: `Đang thực hiện`
  * EN: `In Progress`
  * JA: `進行中`
* **Từ UI -> CSDL:** Khi người dùng mở modal/form và submit dữ liệu:
  * Select box lưu giá trị `value="Đang thực hiện"` (tiếng Việt chuẩn).
  * Nhãn hiển thị cho người dùng thấy là `In Progress` hoặc `進行中`.
  * Khi gửi payload về Google Apps Script backend, giá trị luôn là chuẩn hệ thống.

```javascript
// Bộ mapper trạng thái
const STATUS_MAP = {
  "Chờ thực hiện": { vi: "Chờ thực hiện", en: "To Do", ja: "未着手" },
  "Đang thực hiện": { vi: "Đang thực hiện", en: "In Progress", ja: "進行中" },
  "Chờ duyệt": { vi: "Chờ duyệt", en: "Under Review", ja: "確認待ち" },
  "Hoàn thành": { vi: "Hoàn thành", en: "Completed", ja: "完了" },
  "Tạm dừng": { vi: "Tạm dừng", en: "On Hold", ja: "保留" },
  "Hủy": { vi: "Hủy", en: "Cancelled", ja: "中止" },
  "Quá hạn": { vi: "Quá hạn", en: "Overdue", ja: "期限超過" }
};

function formatStatus(canonicalStatus) {
  const item = STATUS_MAP[canonicalStatus];
  if (!item) return canonicalStatus;
  return item[i18n.currentLang] || item['vi'] || canonicalStatus;
}
```

Tương tự cho **Độ ưu tiên (Priority)**:
* `Thấp` ➔ `Low` ➔ `低`
* `Trung bình` ➔ `Medium` ➔ `中`
* `Cao` ➔ `High` ➔ `高`
* `Khẩn cấp` ➔ `Urgent` ➔ `至急`

Và **Vai trò (Role)**:
* `Admin` ➔ `Admin` ➔ `管理者`
* `Manager` ➔ `Manager` ➔ `責任者`
* `Member` ➔ `Member` ➔ `担当者`
* `Viewer` ➔ `Viewer` ➔ `閲覧者`

### 4.3. Định dạng Ngày tháng theo Quốc gia (Localized Date Formatting)
Tùy biến hiển thị ngày tháng phù hợp thói quen từng nước:
* **Tiếng Việt (`vi`):** `dd/MM/yyyy` (ví dụ: `24/10/2026`)
* **Tiếng Anh (`en`):** `dd/MM/yyyy` hoặc `MM/dd/yyyy`
* **Tiếng Nhật (`ja`):** `yyyy/MM/dd` hoặc `2026年10月24日`

### 4.4. Cập nhật Biểu đồ Chart.js & Sơ đồ Gantt
* Khi đổi ngôn ngữ, hàm `renderDash()` và `renderGantt()` sẽ được gọi lại với nhãn (labels) lấy từ `i18n.t(...)`.
* Biểu đồ tròn (Doughnut chart) và biểu đồ cột (Bar chart) sẽ đổi chú giải (legend) và nhãn trục sang tiếng Anh hoặc tiếng Nhật tương ứng.

---

## 5. THIẾT KẾ CƠ CHẾ THIẾT LẬP NGÔN NGỮ MẶC ĐỊNH (DEFAULT SETTINGS)

### 5.1. Hai cấp độ thiết lập
1. **Ngôn ngữ mặc định cá nhân (User Preference):**
   * Lưu trong `localStorage.getItem('pm_user_lang')`.
   * Thêm hàm API lưu vào `PropertiesService.getUserProperties().setProperty('lang', lang)`.
   * Mỗi khi mở máy (kể cả máy tính khác nhau nếu lưu vào User Profile/Sheet), hệ thống tự nạp ngôn ngữ này.
2. **Ngôn ngữ mặc định hệ thống (System Default - Admin only):**
   * Lưu trong `PropertiesService.getScriptProperties().setProperty('SYS_DEFAULT_LANG', lang)`.
   * Trả về trong hàm `getInitData()` để truyền xuống frontend ngay trong lần request đầu tiên:
     ```javascript
     // Code.gs
     function getInitData() {
       ...
       const sysLang = PropertiesService.getScriptProperties().getProperty('SYS_DEFAULT_LANG') || 'vi';
       return {
         success: true,
         systemDefaultLang: sysLang,
         user: ...,
         ...
       };
     }
     ```
   * Admin có menu cấu hình chọn: `Tiếng Việt | English | 日本語`.

### 5.2. Thứ tự ưu tiên giải quyết (Priority Fallback Chain)
Khi một người dùng mở trang web:
1. **Ưu tiên 1:** Ngôn ngữ đã lưu tại trình duyệt này (`localStorage.getItem('pm_user_lang')`).
2. **Ưu tiên 2:** Ngôn ngữ cá nhân đã lưu trong tài khoản Google (`user.preferredLang` nếu có).
3. **Ưu tiên 3:** Ngôn ngữ mặc định hệ thống do Admin quy định (`initData.systemDefaultLang`).
4. **Ưu tiên 4:** Ngôn ngữ trình duyệt thiết bị (`navigator.language`).
5. **Ưu tiên 5 (Fallback an toàn):** `vi` (Tiếng Việt).

---

## 6. DANH SÁCH CÁC PHẦN CẦN CHUYỂN NGỮ (I18N SCOPE)

### 6.1. Giao diện Cố định (Static UI - 6 Trang)
1. **Sidebar Navigation:** Logo, Tiêu đề dự án, Menu 6 trang, Nút Đăng xuất, Bản quyền footer.
2. **Topbar:** Tiêu đề trang (`Tổng quan`, `Dự án`,...), câu chào mừng, Tìm kiếm, Nút Thêm mới, Bộ lọc dự án.
3. **Trang Dashboard:**
   * 4 Thẻ KPI: Tổng dự án, Tổng việc, Việc hoàn thành, Việc quá hạn.
   * Biểu đồ phân bổ trạng thái công việc.
   * Danh sách hoạt động gần đây.
   * Danh sách việc khẩn cấp / quá hạn cần xử lý ngay.
4. **Trang Sơ đồ Gantt:**
   * Bộ lọc thời gian (Theo tuần, tháng, quý).
   * Cột hiển thị: Tên nhiệm vụ, Người phụ trách, Thời gian, Tiến độ.
5. **Trang Quản lý Dự án (Projects):**
   * Bảng danh sách dự án, Thanh tìm kiếm, Phân trang.
   * Các cột: Mã DA, Tên dự án, Quản lý, Ngày bắt đầu, Kết thúc, Tiến độ, Trạng thái.
6. **Trang Quản lý Nhiệm vụ (Tasks):**
   * Tab chuyển đổi: Kanban View & List View.
   * 6 Cột Kanban: Chờ thực hiện, Đang thực hiện, Chờ duyệt, Hoàn thành, Tạm dừng, Hủy.
   * Bộ lọc theo nhân viên, độ ưu tiên, deadline.
7. **Trang Người dùng (Users - Admin):**
   * Danh sách nhân viên, Vai trò, Trạng thái hoạt động, Ngày tạo, Nút thao tác.
8. **Trang Nhật ký hoạt động (Activity Log):**
   * Bảng lịch sử thao tác, Lọc theo thời gian, Tìm kiếm hành động.

### 6.2. Các Hộp thoại Modal & Form nhập liệu (9 Modals)
1. **`m-qtk` (Thêm / Sửa nhiệm vụ):**
   * Tiêu đề modal: Thêm nhiệm vụ / Cập nhật nhiệm vụ.
   * Tab: Tạo đơn lẻ vs Tạo nhanh hàng loạt (Bulk Add).
   * Các nhãn trường: Tên việc, Dự án, Người thực hiện, Độ ưu tiên, Ngày bắt đầu, Deadline, Tiến độ, Mô tả, Mục tiêu, Link kết quả, Kết quả đầu ra.
   * Bảng xem trước Thêm hàng loạt (Live Preview Grid headers).
2. **`m-pj` (Thêm / Sửa dự án):**
   * Tên dự án, Mô tả, Quản lý dự án, Ngày bắt đầu, Ngày kết thúc, Trạng thái.
3. **`m-pd` (Chi tiết dự án):**
   * Thống kê dự án, Danh sách thành viên, Danh sách việc thuộc dự án.
4. **`m-dup-pj` (Tạo bản sao dự án):**
   * Nhập tên mới, Tùy chọn sao chép nhiệm vụ và thành viên.
5. **`m-mem` (Quản lý thành viên dự án):**
   * Danh sách thành viên, Phân quyền trong dự án, Thêm thành viên mới.
6. **`m-usr` (Thêm / Sửa người dùng):**
   * Họ tên, Email/Mã nội bộ, Vai trò, Trạng thái, Ghi chú.
7. **`m-ntf` (Thêm thông báo hệ thống):**
   * Tiêu đề, Nội dung, Đối tượng nhận.
8. **`m-tp` (Drawer/Panel Chi tiết nhiệm vụ):**
   * Lịch sử nhắc việc, Báo cáo kết quả, Cập nhật tiến độ, Gửi tin nhắn nhắc nhở.
9. **Modal Cài đặt ngôn ngữ mặc định (Mới):**
   * Chọn ngôn ngữ mặc định của người dùng và hệ thống.

### 6.3. Thông báo Hệ thống, Xác nhận & Lỗi (Toasts & Alerts)
* Toàn bộ các thông báo dạng `toast("Đã thêm thành công", "success")`, `alert(...)`, `confirm(...)` được chuyển sang gọi qua `i18n.t(...)`.

---

## 7. KẾ HOẠCH TRIỂN KHAI THEO CÁC GIAI ĐOẠN (ROADMAP)

### Giai đoạn 1: Chuẩn bị Cấu trúc & Xây dựng Engine Dịch thuật
* **Nhiệm vụ:**
  1. Xây dựng file từ điển `I18N` hoàn chỉnh với đủ 3 ngôn ngữ `vi`, `en`, `ja`.
  2. Tạo đối tượng `i18n` với các phương thức `t()`, `setLanguage()`, `apply()`, `init()`.
  3. Tạo các hàm mapper trạng thái `formatStatus()`, `formatPriority()`, `formatRole()`.
* **Vị trí file:** Nhúng module i18n vào đầu phần `<script>` của [Index.html](file:///c:/Users/Laptop/OneDrive/Desktop/Hello%20World/Google-Appscript/03_Project%20Management/Index.html) hoặc tách thành `i18n.html` rồi dùng `<?= include('i18n') ?>`.

### Giai đoạn 2: Thiết kế & Tích hợp UI Chuyển đổi Ngôn ngữ
* **Nhiệm vụ:**
  1. Thêm nút chuyển đổi ngôn ngữ dropdown vào Topbar của [Index.html](file:///c:/Users/Laptop/OneDrive/Desktop/Hello%20World/Google-Appscript/03_Project%20Management/Index.html).
  2. Thêm cờ hiển thị (`🇻🇳`, `🇺🇸`, `🇯🇵`), dấu tick chọn ngôn ngữ đang kích hoạt.
  3. Thêm nút bấm "Đặt làm ngôn ngữ mặc định của tôi" (Set as default).
  4. Tạo modal phụ hoặc popup cho Admin thiết lập "Ngôn ngữ mặc định hệ thống".

### Giai đoạn 3: Quốc tế hóa (i18n) Toàn bộ HTML Tĩnh
* **Nhiệm vụ:**
  1. Rà soát Sidebar, Topbar, 6 trang chính, và 9 modal.
  2. Gắn các thuộc tính:
     * `data-i18n="key"` cho các thẻ text, label, button, header.
     * `data-i18n-ph="key"` cho các ô `<input>` placeholder.
     * `data-i18n-title="key"` cho các biểu tượng tooltip.

### Giai đoạn 4: Quốc tế hóa Logic JavaScript & Render Động
* **Nhiệm vụ:**
  1. Sửa hàm render thẻ thống kê Dashboard (`renderDash`).
  2. Sửa hàm render danh sách Dự án (`renderProjects`).
  3. Sửa hàm render danh sách & Kanban Công việc (`renderTasks`, `renderKanban`).
  4. Sửa hàm render Sơ đồ Gantt (`renderGantt`).
  5. Sửa bảng Thêm hàng loạt (`renderBulkPreviewTable`).
  6. Sửa các chuỗi thông báo động trong `toast()`, `confirm()`.

### Giai đoạn 5: Nâng cấp Backend Google Apps Script
* **Nhiệm vụ:**
  1. Bổ sung hàm backend trong [Code.gs](file:///c:/Users/Laptop/OneDrive/Desktop/Hello%20World/Google-Appscript/03_Project%20Management/Code.gs):
     * `getSystemDefaultLanguage()`
     * `setSystemDefaultLanguage(lang)` (Chỉ Admin mới có quyền gọi)
     * `setUserLanguagePreference(lang)`
  2. Cập nhật `getInitData()` để trả về `systemDefaultLang` và `userLang` cho frontend.

### Giai đoạn 6: Kiểm thử & Đánh giá Chất lượng (QA/QC)
* **Nhiệm vụ:**
  1. Kiểm thử chuyển đổi qua lại giữa cả 3 ngôn ngữ: `vi` ⇄ `en` ⇄ `ja`.
  2. Kiểm tra giao diện tiếng Nhật (kanji, katakana) có bị vỡ layout, tràn chữ hoặc mất dòng hay không.
  3. Kiểm tra tính năng lưu ngôn ngữ mặc định: Tắt trình duyệt, mở lại xem có giữ đúng ngôn ngữ đã chọn không.
  4. Kiểm tra tài khoản người dùng mới: Xem có nhận đúng ngôn ngữ mặc định hệ thống không.
  5. Kiểm tra dữ liệu thêm mới: Thêm dự án/nhiệm vụ bằng giao diện tiếng Nhật/tiếng Anh xem trong Google Sheet có lưu đúng chuẩn hệ thống không.

---

## 8. ĐÁNH GIÁ RỦI RO & PHƯƠNG ÁN DỰ PHÒNG

| Rủi ro tiềm ẩn | Mức độ | Phương án phòng ngừa & Xử lý |
| :--- | :---: | :--- |
| **Vỡ layout do độ dài từ ngữ** (Tiếng Nhật/Anh dài hoặc ngắn hơn Tiếng Việt) | Trung bình | Thiết kế CSS linh hoạt với `min-width`, `flex-wrap: wrap`, `text-overflow: ellipsis`, tránh đặt chiều rộng cố định (`width: 120px`) cho các nút bấm và nhãn. |
| **Lỗi lệch dữ liệu CSDL** (Lưu từ "Completed" hoặc "完了" vào Sheet thay vì "Hoàn thành") | Cao | **Bắt buộc dùng Mapper:** Mọi thẻ `<select>` đều giữ nguyên `value` là chuẩn tiếng Việt, chỉ thay đổi nhãn hiển thị bên trong `<option>`. Backend kiểm tra tính hợp lệ trước khi ghi Sheet. |
| **Quên dịch một số thông báo động** (Missing keys) | Thấp | Trong hàm `t(key)`, nếu không tìm thấy key trong ngôn ngữ hiện tại, tự động fallback về tiếng Việt (gốc). Ghi log cảnh báo trên DevTools console để bổ sung kịp thời. |
| **Hiệu năng chậm khi chuyển ngôn ngữ** | Thấp | Vì từ điển được tải sẵn ở bộ nhớ frontend (RAM của trình duyệt), việc chuyển đổi diễn ra trong vài mili-giây mà không cần gọi API về Google server. |

---

## 9. KẾT LUẬN & ĐỀ XUẤT BƯỚC TIẾP THEO
* Bản kế hoạch này đã bao quát toàn diện từ kiến trúc logic, giao diện UX/UI, từ điển 3 thứ tiếng cho tới cơ chế phân cấp thiết lập mặc định (Cá nhân & Hệ thống).
* **Đề xuất thực hiện:**
  1. Người dùng xem xét và phê duyệt bản kế hoạch này.
  2. Tiến hành triển khai theo 6 giai đoạn nêu trên để đưa tính năng Đa ngôn ngữ vào hoạt động ổn định và chuyên nghiệp nhất.
