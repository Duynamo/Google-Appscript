const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('--- Updating Timesheet Multilingual (i18n) Support ---');

// 1. ADD I18N KEYS TO VI, EN, JA
const extraKeysVI = `    ts_btn_reload: "🔄 Tải lại",
    ts_btn_filter: "Lọc",
    ts_opt_select_pj: "-- Chọn dự án cần xem --",
    ts_kpi_lifetime_hours: "Tổng Giờ Vòng Đời (Lifetime)",
    ts_kpi_actual_hours: "Tổng Giờ Thực Làm",
    ts_kpi_lifetime_sub: "Gồm cả năm cũ đã chốt sổ",
    ts_kpi_scope_sub: "Phạm vi đã chọn",
    ts_kpi_current_year: "Năm Hiện Hành ({year})",
    ts_kpi_standard_hours: "Giờ tiêu chuẩn: {hours}h",
    ts_kpi_ot: "Tăng Ca (OT)",
    ts_kpi_ot_rate: "Tỷ lệ OT: {rate}%",
    ts_kpi_engineers: "Kỹ Sư Tham Gia",
    ts_kpi_engineers_sub: "Số nhân sự có đóng góp",
    ts_budget_control: "🎯 Kiểm Soát Ngân Sách Giờ Công:",
    ts_budget_plan: "Dự toán:",
    ts_budget_actual: "Thực tế:",
    ts_budget_used: "ĐÃ DÙNG {pct}%",
    ts_budget_over: "VƯỢT BUDGET +{variance}h (+{pct}%)",
    ts_historical_title: "📜 Lũy Kế Snapshot Các Niên Độ Quá Khứ (Đã Chốt Sổ):",
    ts_historical_year: "Năm {year}:",
    ts_historical_closed: "Đã chốt sổ",
    ts_historical_running: "Đang chạy",
    ts_col_staff_code: "Mã NV",
    ts_col_staff_name: "Họ Tên",
    ts_col_hours: "Số Giờ",
    ts_col_ratio: "Tỷ Trọng",
    ts_col_disc_code: "Mã",
    ts_col_disc_name: "Tên Tác Nghiệp",
    ts_count_engineers: "{count} kỹ sư",
    ts_count_disciplines: "{count} tác nghiệp",
    ts_empty_project_data: "Không có dữ liệu thời gian cho dự án này",
    ts_empty_disc_data: "Không có dữ liệu tác nghiệp",
    ts_select_project_hint: "Chọn dự án để xem dữ liệu",
    ts_stf_select: "Nhân viên:",
    ts_stf_from: "Từ ngày:",
    ts_stf_to: "Đến ngày:",
    ts_stf_btn_this_month: "Tháng này",
    ts_stf_btn_last_month: "Tháng trước",
    ts_stf_btn_all: "📅 Toàn bộ thời gian",
    ts_stf_btn_view: "🔍 Xem Bóc Tách",
    ts_stf_total_hours: "Tổng Giờ Làm:",
    ts_stf_official_hours: "Giờ Chuẩn:",
    ts_stf_ot_hours: "Tăng Ca (OT):",
    ts_stf_active_days: "Số Ngày Làm:",
    ts_stf_days_unit: "{count} ngày",
    ts_stf_pjs_count: "Số Dự Án:",
    ts_stf_pjs_unit: "{count} dự án",
    ts_stf_tree_header: "🌳 Cây Bóc Tách Công Việc Của [{staff}]:",
    ts_stf_empty_hint: "Vui lòng bấm [🔍 Xem Bóc Tách] để hiển thị cây công việc",
    ts_stf_no_data: "Không phát sinh giờ làm việc trong khoảng thời gian này",
    ts_no_note: "Không có ghi chú",
    ts_mat_month: "Tháng đối chiếu:",
    ts_mat_prev_month: "◀ Tháng trước",
    ts_mat_next_month: "Tháng sau ▶",
    ts_mat_all_months: "📅 Tất cả các tháng",
    ts_mat_hide_zero: "Ẩn dự án 0 giờ (Hide Zero Columns)",
    ts_mat_status_ready: "Sẵn sàng",
    ts_mat_status_loading: "⏳ Đang tổng hợp ma trận...",
    ts_mat_status_done: "✅ Đã tải xong",
    ts_mat_status_all_done: "✅ Toàn bộ thời gian",
    ts_mat_status_err: "❌ Lỗi tải",
    ts_mat_hint: "Mẹo: Cuộn ngang/dọc tự do, cột Tên & dòng Tiêu đề luôn ghim cố định (Sticky Freeze). Click vào ô bất kỳ để mở Popup bóc tách chi tiết!",
    ts_mat_loading: "Đang nạp ma trận...",
    ts_mat_col_total: "TỔNG (h)",
    ts_mat_grand_total: "TỔNG CỘNG",
    ts_mat_all_projects: "Toàn bộ dự án",
    ts_mat_drilldown_title: "Chi Tiết Thời Gian: {staff} × {project}",
    ts_mat_drilldown_sub: "Bóc tách tác nghiệp và nhật ký cho dự án [{project}]",
    ts_mat_drilldown_default_title: "Chi Tiết Thời Gian Làm Việc",
    ts_mat_drilldown_default_sub: "Bóc tách tác nghiệp và nhật ký theo từng slot",
    ts_drill_col_date: "Ngày",
    ts_drill_col_slot: "Khung Giờ",
    ts_drill_col_hours: "Số Giờ",
    ts_drill_col_type: "Loại Ca",
    ts_drill_col_disc: "Tác Nghiệp",
    ts_drill_col_note: "Ghi Chú Công Việc",
    ts_drill_type_standard: "Chuẩn",
    ts_drill_type_ot: "OT",
    ts_drill_no_records: "Không có bản ghi chi tiết",
    ts_placeholder_note: "Ghi chú công việc...",
    ts_clear_row: "Xóa dòng",
    ts_morning_ot: "TĂNG CA SÁNG",
    ts_evening_ot: "TĂNG CA TỐI",
    ts_lunch_break: "Nghỉ trưa",
    ts_badge_hidden: "(Ẩn)",
    ts_badge_shown: "(Hiện)",
    ts_status_ready: "Đã sẵn sàng",`;

const extraKeysEN = `    ts_subtab_entry: "Detailed Timesheet (30m)",
    ts_subtab_project: "Project Actual Report",
    ts_subtab_staff: "Staff Work Breakdown",
    ts_subtab_matrix: "Batch Comparison Matrix",
    ts_lbl_select_pj: "Project:",
    ts_lbl_scope: "Scope:",
    ts_scope_all: "🌐 Full Lifecycle (3 - 5 Years)",
    ts_scope_current: "📅 Current Year Only (Real-time)",
    ts_scope_custom: "📆 Custom Date Range...",
    ts_btn_export_jp: "Export Acceptance File (JP Format)",
    ts_tbl_staff_contrib: "👥 Staff Contribution",
    ts_tbl_disc_breakdown: "📐 Discipline Breakdown",
    ts_btn_reload: "🔄 Reload",
    ts_btn_filter: "Filter",
    ts_opt_select_pj: "-- Select Project --",
    ts_kpi_lifetime_hours: "Lifetime Hours",
    ts_kpi_actual_hours: "Total Actual Hours",
    ts_kpi_lifetime_sub: "Including closed past years",
    ts_kpi_scope_sub: "Selected range",
    ts_kpi_current_year: "Current Year ({year})",
    ts_kpi_standard_hours: "Standard hours: {hours}h",
    ts_kpi_ot: "Overtime (OT)",
    ts_kpi_ot_rate: "OT rate: {rate}%",
    ts_kpi_engineers: "Engineers Involved",
    ts_kpi_engineers_sub: "Contributors count",
    ts_budget_control: "🎯 Work Budget Control:",
    ts_budget_plan: "Budget:",
    ts_budget_actual: "Actual:",
    ts_budget_used: "USED {pct}%",
    ts_budget_over: "OVER BUDGET +{variance}h (+{pct}%)",
    ts_historical_title: "📜 Historical Snapshot by Past Fiscal Years (Closed):",
    ts_historical_year: "Year {year}:",
    ts_historical_closed: "Closed",
    ts_historical_running: "Running",
    ts_col_staff_code: "Staff ID",
    ts_col_staff_name: "Full Name",
    ts_col_hours: "Hours",
    ts_col_ratio: "Ratio",
    ts_col_disc_code: "Code",
    ts_col_disc_name: "Discipline Name",
    ts_count_engineers: "{count} engineers",
    ts_count_disciplines: "{count} disciplines",
    ts_empty_project_data: "No timesheet data for this project",
    ts_empty_disc_data: "No discipline data",
    ts_select_project_hint: "Select a project to view data",
    ts_stf_select: "Staff:",
    ts_stf_from: "From:",
    ts_stf_to: "To:",
    ts_stf_btn_this_month: "This Month",
    ts_stf_btn_last_month: "Last Month",
    ts_stf_btn_all: "📅 All Time",
    ts_stf_btn_view: "🔍 View Breakdown",
    ts_stf_total_hours: "Total Hours:",
    ts_stf_official_hours: "Standard Hours:",
    ts_stf_ot_hours: "Overtime (OT):",
    ts_stf_active_days: "Active Days:",
    ts_stf_days_unit: "{count} days",
    ts_stf_pjs_count: "Projects Count:",
    ts_stf_pjs_unit: "{count} projects",
    ts_stf_tree_header: "🌳 Work Breakdown Tree of [{staff}]:",
    ts_stf_empty_hint: "Click [🔍 View Breakdown] to display tree",
    ts_stf_no_data: "No logged hours in this period",
    ts_no_note: "No note",
    ts_mat_month: "Comparison Month:",
    ts_mat_prev_month: "◀ Prev Month",
    ts_mat_next_month: "Next Month ▶",
    ts_mat_all_months: "📅 All Months",
    ts_mat_hide_zero: "Hide 0h projects (Hide Zero Columns)",
    ts_mat_status_ready: "Ready",
    ts_mat_status_loading: "⏳ Calculating matrix...",
    ts_mat_status_done: "✅ Loaded",
    ts_mat_status_all_done: "✅ All Time Loaded",
    ts_mat_status_err: "❌ Failed",
    ts_mat_hint: "Tip: Scroll freely, Name & Headers are sticky frozen. Click any cell to inspect details!",
    ts_mat_loading: "Loading matrix...",
    ts_mat_col_total: "TOTAL (h)",
    ts_mat_grand_total: "GRAND TOTAL",
    ts_mat_all_projects: "All Projects",
    ts_mat_drilldown_title: "Timesheet Detail: {staff} × {project}",
    ts_mat_drilldown_sub: "Breakdown and work logs for project [{project}]",
    ts_mat_drilldown_default_title: "Working Time Details",
    ts_mat_drilldown_default_sub: "Slot-by-slot task and work log breakdown",
    ts_drill_col_date: "Date",
    ts_drill_col_slot: "Time Slot",
    ts_drill_col_hours: "Hours",
    ts_drill_col_type: "Type",
    ts_drill_col_disc: "Discipline",
    ts_drill_col_note: "Work Note",
    ts_drill_type_standard: "Standard",
    ts_drill_type_ot: "OT",
    ts_drill_no_records: "No detailed records",
    ts_placeholder_note: "Work note...",
    ts_clear_row: "Clear row",
    ts_morning_ot: "MORNING OVERTIME",
    ts_evening_ot: "EVENING OVERTIME",
    ts_lunch_break: "Lunch break",
    ts_badge_hidden: "(Hidden)",
    ts_badge_shown: "(Shown)",
    ts_status_ready: "Ready",`;

const extraKeysJA = `    ts_subtab_entry: "詳細工数入力 (30分)",
    ts_subtab_project: "プロジェクト別実績報告",
    ts_subtab_staff: "担当者別詳細分析",
    ts_subtab_matrix: "一括突合マトリクス",
    ts_lbl_select_pj: "プロジェクト:",
    ts_lbl_scope: "集計範囲:",
    ts_scope_all: "🌐 全期間 (3〜5年)",
    ts_scope_current: "📅 当該年のみ (リアルタイム)",
    ts_scope_custom: "📆 期間指定...",
    ts_btn_export_jp: "検収ファイル出力 (日本形式)",
    ts_tbl_staff_contrib: "👥 担当者別稼働工数",
    ts_tbl_disc_breakdown: "📐 業務・作業別工数配分",
    ts_btn_reload: "🔄 再読み込み",
    ts_btn_filter: "絞り込み",
    ts_opt_select_pj: "-- プロジェクトを選択 --",
    ts_kpi_lifetime_hours: "累計総工数 (全期間)",
    ts_kpi_actual_hours: "実績総工数",
    ts_kpi_lifetime_sub: "過去年度締め切り分を含む",
    ts_kpi_scope_sub: "指定された集計範囲",
    ts_kpi_current_year: "当該年度 ({year})",
    ts_kpi_standard_hours: "定時時間: {hours}h",
    ts_kpi_ot: "残業時間 (OT)",
    ts_kpi_ot_rate: "残業比率: {rate}%",
    ts_kpi_engineers: "参加エンジニア",
    ts_kpi_engineers_sub: "稼働スタッフ数",
    ts_budget_control: "🎯 工数予算管理:",
    ts_budget_plan: "予算:",
    ts_budget_actual: "実績:",
    ts_budget_used: "消化率 {pct}%",
    ts_budget_over: "予算超過 +{variance}h (+{pct}%)",
    ts_historical_title: "📜 過去年度確定スナップショット (決算済み):",
    ts_historical_year: "{year}年度:",
    ts_historical_closed: "締め切り済み",
    ts_historical_running: "進行中",
    ts_col_staff_code: "社員番号",
    ts_col_staff_name: "氏名",
    ts_col_hours: "工数 (h)",
    ts_col_ratio: "構成比",
    ts_col_disc_code: "コード",
    ts_col_disc_name: "業務項目名",
    ts_count_engineers: "{count} 名",
    ts_count_disciplines: "{count} 業務項目",
    ts_empty_project_data: "このプロジェクトの工数データはありません",
    ts_empty_disc_data: "業務項目データはありません",
    ts_select_project_hint: "プロジェクトを選択してください",
    ts_stf_select: "担当者:",
    ts_stf_from: "開始日:",
    ts_stf_to: "終了日:",
    ts_stf_btn_this_month: "今月",
    ts_stf_btn_last_month: "先月",
    ts_stf_btn_all: "📅 全期間",
    ts_stf_btn_view: "🔍 詳細分析表示",
    ts_stf_total_hours: "総稼働時間:",
    ts_stf_official_hours: "定時時間:",
    ts_stf_ot_hours: "残業時間 (OT):",
    ts_stf_active_days: "稼働日数:",
    ts_stf_days_unit: "{count} 日",
    ts_stf_pjs_count: "対象プロジェクト:",
    ts_stf_pjs_unit: "{count} 件",
    ts_stf_tree_header: "🌳 業務ブレークダウン [{staff}]:",
    ts_stf_empty_hint: "「🔍 詳細分析表示」をクリックして業務ツリーを展開してください",
    ts_stf_no_data: "指定期間内に稼働実績はありません",
    ts_no_note: "メモなし",
    ts_mat_month: "対象月:",
    ts_mat_prev_month: "◀ 前月",
    ts_mat_next_month: "翌月 ▶",
    ts_mat_all_months: "📅 全月表示",
    ts_mat_hide_zero: "0時間プロジェクトを非表示",
    ts_mat_status_ready: "準備完了",
    ts_mat_status_loading: "⏳ マトリクス集計中...",
    ts_mat_status_done: "✅ 読み込み完了",
    ts_mat_status_all_done: "✅ 全期間表示完了",
    ts_mat_status_err: "❌ 読み込み失敗",
    ts_mat_hint: "ヒント: 縦横スクロール可能、社員名とヘッダーは固定表示。任意のセルをクリックすると詳細内訳が開きます。",
    ts_mat_loading: "マトリクスを読み込み中...",
    ts_mat_col_total: "合計 (h)",
    ts_mat_grand_total: "総合計",
    ts_mat_all_projects: "全プロジェクト",
    ts_mat_drilldown_title: "工数詳細内訳: {staff} × {project}",
    ts_mat_drilldown_sub: "案件 [{project}] の作業項目・ログ詳細",
    ts_mat_drilldown_default_title: "勤務工数詳細",
    ts_mat_drilldown_default_sub: "枠ごとの作業項目および業務ログ詳細",
    ts_drill_col_date: "日付",
    ts_drill_col_slot: "時間枠",
    ts_drill_col_hours: "工数 (h)",
    ts_drill_col_type: "区分",
    ts_drill_col_disc: "業務項目",
    ts_drill_col_note: "業務内容・メモ",
    ts_drill_type_standard: "定時",
    ts_drill_type_ot: "残業",
    ts_drill_no_records: "詳細レコードはありません",
    ts_placeholder_note: "業務内容・メモ...",
    ts_clear_row: "行をクリア",
    ts_morning_ot: "早朝残業",
    ts_evening_ot: "夜間残業",
    ts_lunch_break: "昼休憩",
    ts_badge_hidden: "(非表示)",
    ts_badge_shown: "(表示中)",
    ts_status_ready: "準備完了",`;

// Insert into I18N.vi
const viTarget = `    ts_tbl_disc_breakdown: "📐 Phân Bổ Theo Tác Nghiệp",`;
if (html.includes(viTarget)) {
  html = html.replace(viTarget, extraKeysVI);
  console.log('✅ Added extra keys to I18N.vi');
} else {
  console.warn('⚠️ Could not find viTarget in I18N.vi');
}

// Insert into I18N.en
const enTarget = `    ts_stat_slots: "Slots Logged",`;
if (html.includes(enTarget)) {
  html = html.replace(enTarget, `    ts_stat_slots: "Slots Logged",\n${extraKeysEN}`);
  console.log('✅ Added extra keys to I18N.en');
} else {
  console.warn('⚠️ Could not find enTarget in I18N.en');
}

// Insert into I18N.ja
const jaTarget = `    ts_stat_slots: "入力済み枠数",`;
if (html.includes(jaTarget)) {
  html = html.replace(jaTarget, `    ts_stat_slots: "入力済み枠数",\n${extraKeysJA}`);
  console.log('✅ Added extra keys to I18N.ja');
} else {
  console.warn('⚠️ Could not find jaTarget in I18N.ja');
}

// 2. UPDATE HTML OF PAGE-TIMESHEET
// Pane 2 Controls
html = html.replace(
  `<label style="font-weight:700;font-size:12px;color:var(--tx)">Dự án:</label>`,
  `<label style="font-weight:700;font-size:12px;color:var(--tx)" data-i18n="ts_lbl_select_pj">Dự án:</label>`
);

html = html.replace(
  `<label style="font-weight:700;font-size:12px;color:var(--tx)">Phạm vi:</label>`,
  `<label style="font-weight:700;font-size:12px;color:var(--tx)" data-i18n="ts_lbl_scope">Phạm vi:</label>`
);

html = html.replace(
  `<option value="all">🌐 Toàn bộ vòng đời (3 - 5 năm)</option>`,
  `<option value="all" data-i18n="ts_scope_all">🌐 Toàn bộ vòng đời (3 - 5 năm)</option>`
);
html = html.replace(
  `<option value="current">📅 Chỉ năm hiện hành (Real-time)</option>`,
  `<option value="current" data-i18n="ts_scope_current">📅 Chỉ năm hiện hành (Real-time)</option>`
);
html = html.replace(
  `<option value="custom">📆 Khoảng ngày tùy chọn...</option>`,
  `<option value="custom" data-i18n="ts_scope_custom">📆 Khoảng ngày tùy chọn...</option>`
);

html = html.replace(
  `<button type="button" class="ts-btn ts-btn-sec" onclick="loadProjectActualTimeReport()">Lọc</button>`,
  `<button type="button" class="ts-btn ts-btn-sec" onclick="loadProjectActualTimeReport()" data-i18n="ts_btn_filter">Lọc</button>`
);

html = html.replace(
  `<button type="button" class="ts-btn ts-btn-sec" onclick="loadProjectActualTimeReport()">🔄 Tải lại</button>`,
  `<button type="button" class="ts-btn ts-btn-sec" onclick="loadProjectActualTimeReport()"><span data-i18n="ts_btn_reload">🔄 Tải lại</span></button>`
);

html = html.replace(
  `<span>Xuất File Nghiệm Thu (Format Nhật)</span>`,
  `<span data-i18n="ts_btn_export_jp">Xuất File Nghiệm Thu (Format Nhật)</span>`
);

// Pane 2 Tables
html = html.replace(
  `<span style="font-weight:700;font-size:13px;color:var(--tx)">👥 Đóng Góp Theo Nhân Sự</span>`,
  `<span style="font-weight:700;font-size:13px;color:var(--tx)" data-i18n="ts_tbl_staff_contrib">👥 Đóng Góp Theo Nhân Sự</span>`
);

html = html.replace(
  `                      <th>Mã NV</th>\n                      <th>Họ Tên</th>\n                      <th style="text-align:right">Số Giờ</th>\n                      <th style="width:110px;text-align:right">Tỷ Trọng</th>`,
  `                      <th data-i18n="ts_col_staff_code">Mã NV</th>\n                      <th data-i18n="ts_col_staff_name">Họ Tên</th>\n                      <th style="text-align:right" data-i18n="ts_col_hours">Số Giờ</th>\n                      <th style="width:110px;text-align:right" data-i18n="ts_col_ratio">Tỷ Trọng</th>`
);

html = html.replace(
  `<span style="font-weight:700;font-size:13px;color:var(--tx)">📐 Phân Bổ Theo Tác Nghiệp (Discipline)</span>`,
  `<span style="font-weight:700;font-size:13px;color:var(--tx)" data-i18n="ts_tbl_disc_breakdown">📐 Phân Bổ Theo Tác Nghiệp (Discipline)</span>`
);

html = html.replace(
  `                      <th>Mã</th>\n                      <th>Tên Tác Nghiệp</th>\n                      <th style="text-align:right">Số Giờ</th>\n                      <th style="width:110px;text-align:right">Tỷ Trọng</th>`,
  `                      <th data-i18n="ts_col_disc_code">Mã</th>\n                      <th data-i18n="ts_col_disc_name">Tên Tác Nghiệp</th>\n                      <th style="text-align:right" data-i18n="ts_col_hours">Số Giờ</th>\n                      <th style="width:110px;text-align:right" data-i18n="ts_col_ratio">Tỷ Trọng</th>`
);

// Pane 3 (Staff Work Breakdown)
html = html.replace(
  `<label style="font-weight:700;font-size:12px;color:var(--tx)">Nhân viên:</label>`,
  `<label style="font-weight:700;font-size:12px;color:var(--tx)" data-i18n="ts_stf_select">Nhân viên:</label>`
);

html = html.replace(
  `<label style="font-weight:700;font-size:12px;color:var(--tx)">Từ ngày:</label>`,
  `<label style="font-weight:700;font-size:12px;color:var(--tx)" data-i18n="ts_stf_from">Từ ngày:</label>`
);

html = html.replace(
  `<label style="font-weight:700;font-size:12px;color:var(--tx)">Đến ngày:</label>`,
  `<label style="font-weight:700;font-size:12px;color:var(--tx)" data-i18n="ts_stf_to">Đến ngày:</label>`
);

html = html.replace(
  `<button type="button" class="ts-btn ts-btn-sec" onclick="setStaffQuickRange('this_month')">Tháng này</button>`,
  `<button type="button" class="ts-btn ts-btn-sec" onclick="setStaffQuickRange('this_month')" data-i18n="ts_stf_btn_this_month">Tháng này</button>`
);

html = html.replace(
  `<button type="button" class="ts-btn ts-btn-sec" onclick="setStaffQuickRange('last_month')">Tháng trước</button>`,
  `<button type="button" class="ts-btn ts-btn-sec" onclick="setStaffQuickRange('last_month')" data-i18n="ts_stf_btn_last_month">Tháng trước</button>`
);

html = html.replace(
  `<button type="button" class="ts-btn ts-btn-sec" id="btn-staff-all" onclick="setStaffQuickRange('all')">📅 Toàn bộ thời gian</button>`,
  `<button type="button" class="ts-btn ts-btn-sec" id="btn-staff-all" onclick="setStaffQuickRange('all')" data-i18n="ts_stf_btn_all">📅 Toàn bộ thời gian</button>`
);

html = html.replace(
  `<button type="button" class="ts-btn ts-btn-pri" onclick="loadStaffWorkBreakdown()">🔍 Xem Bóc Tách</button>`,
  `<button type="button" class="ts-btn ts-btn-pri" onclick="loadStaffWorkBreakdown()" data-i18n="ts_stf_btn_view">🔍 Xem Bóc Tách</button>`
);

html = html.replace(
  `<div style="text-align:center;padding:30px;color:var(--t3)">Vui lòng bấm [🔍 Xem Bóc Tách] để hiển thị cây công việc</div>`,
  `<div style="text-align:center;padding:30px;color:var(--t3)" data-i18n="ts_stf_empty_hint">Vui lòng bấm [🔍 Xem Bóc Tách] để hiển thị cây công việc</div>`
);

// Pane 4 (Matrix)
html = html.replace(
  `<label style="font-weight:700;font-size:12px;color:var(--tx)">Tháng đối chiếu:</label>`,
  `<label style="font-weight:700;font-size:12px;color:var(--tx)" data-i18n="ts_mat_month">Tháng đối chiếu:</label>`
);

html = html.replace(
  `<button type="button" class="ts-btn" onclick="stepMatrixMonth(-1)">◀ Tháng trước</button>`,
  `<button type="button" class="ts-btn" onclick="stepMatrixMonth(-1)" data-i18n="ts_mat_prev_month">◀ Tháng trước</button>`
);

html = html.replace(
  `<button type="button" class="ts-btn" onclick="stepMatrixMonth(1)">Tháng sau ▶</button>`,
  `<button type="button" class="ts-btn" onclick="stepMatrixMonth(1)" data-i18n="ts_mat_next_month">Tháng sau ▶</button>`
);

html = html.replace(
  `<button type="button" class="ts-btn ts-btn-sec" id="btn-mat-all" onclick="loadBatchComparisonMatrix(true)">📅 Tất cả các tháng</button>`,
  `<button type="button" class="ts-btn ts-btn-sec" id="btn-mat-all" onclick="loadBatchComparisonMatrix(true)" data-i18n="ts_mat_all_months">📅 Tất cả các tháng</button>`
);

html = html.replace(
  `<span>Ẩn dự án 0 giờ (Hide Zero Columns)</span>`,
  `<span data-i18n="ts_mat_hide_zero">Ẩn dự án 0 giờ (Hide Zero Columns)</span>`
);

html = html.replace(
  `<button type="button" class="ts-btn ts-btn-sec" onclick="loadBatchComparisonMatrix()">🔄 Tải lại</button>`,
  `<button type="button" class="ts-btn ts-btn-sec" onclick="loadBatchComparisonMatrix()"><span data-i18n="ts_btn_reload">🔄 Tải lại</span></button>`
);

html = html.replace(
  `<span id="ts-mat-status" style="font-size:11px;color:var(--t2)">Sẵn sàng</span>`,
  `<span id="ts-mat-status" style="font-size:11px;color:var(--t2)" data-i18n="ts_mat_status_ready">Sẵn sàng</span>`
);

html = html.replace(
  `<span>Mẹo: Cuộn ngang/dọc tự do, cột Tên & dòng Tiêu đề luôn ghim cố định (Sticky Freeze). Click vào ô bất kỳ để mở <b>Popup bóc tách chi tiết</b>!</span>`,
  `<span data-i18n="ts_mat_hint">Mẹo: Cuộn ngang/dọc tự do, cột Tên & dòng Tiêu đề luôn ghim cố định (Sticky Freeze). Click vào ô bất kỳ để mở Popup bóc tách chi tiết!</span>`
);

// Modal Drilldown
html = html.replace(
  `<h3 id="m-ts-drill-title" style="margin:0;font-size:16px;color:var(--tx)">Chi Tiết Thời Gian Làm Việc</h3>`,
  `<h3 id="m-ts-drill-title" style="margin:0;font-size:16px;color:var(--tx)" data-i18n="ts_mat_drilldown_default_title">Chi Tiết Thời Gian Làm Việc</h3>`
);

html = html.replace(
  `<div id="m-ts-drill-sub" style="font-size:12px;color:var(--t2);margin-top:2px">Bóc tách tác nghiệp và nhật ký theo từng slot</div>`,
  `<div id="m-ts-drill-sub" style="font-size:12px;color:var(--t2);margin-top:2px" data-i18n="ts_mat_drilldown_default_sub">Bóc tách tác nghiệp và nhật ký theo từng slot</div>`
);

html = html.replace(
  `              <th style="width:90px">Ngày</th>\n              <th style="width:105px">Khung Giờ</th>\n              <th style="width:65px;text-align:right">Số Giờ</th>\n              <th style="width:75px">Loại Ca</th>\n              <th style="width:100px">Tác Nghiệp</th>\n              <th>Ghi Chú Công Việc</th>`,
  `              <th style="width:90px" data-i18n="ts_drill_col_date">Ngày</th>\n              <th style="width:105px" data-i18n="ts_drill_col_slot">Khung Giờ</th>\n              <th style="width:65px;text-align:right" data-i18n="ts_drill_col_hours">Số Giờ</th>\n              <th style="width:75px" data-i18n="ts_drill_col_type">Loại Ca</th>\n              <th style="width:100px" data-i18n="ts_drill_col_disc">Tác Nghiệp</th>\n              <th data-i18n="ts_drill_col_note">Ghi Chú Công Việc</th>`
);

html = html.replace(
  `<button type="button" class="btn bs" onclick="closeModal('m-ts-drilldown')">Đóng</button>`,
  `<button type="button" class="btn bs" onclick="closeModal('m-ts-drilldown')" data-i18n="btn_close">Đóng</button>`
);

console.log('✅ HTML markup updated with data-i18n');

// 3. UPDATE setLanguage TO RE-RENDER TIMESHEET TABS
const oldSetLangTimesheet = `  } else if (curPage === 'timesheet') {
    if (typeof renderTimesheetGrid === 'function') renderTimesheetGrid();
  }`;

const newSetLangTimesheet = `  } else if (curPage === 'timesheet') {
    if (typeof _tsActiveSubTab !== 'undefined') {
      if (_tsActiveSubTab === 'ENTRY' && typeof renderTimesheetGrid === 'function') {
        renderTimesheetGrid();
      } else if (_tsActiveSubTab === 'PROJECT') {
        if (typeof updateProjectScopeDropdownI18n === 'function') updateProjectScopeDropdownI18n();
        if (typeof loadProjectActualTimeReport === 'function') loadProjectActualTimeReport();
      } else if (_tsActiveSubTab === 'STAFF') {
        if (typeof loadStaffWorkBreakdown === 'function') loadStaffWorkBreakdown();
      } else if (_tsActiveSubTab === 'MATRIX') {
        if (typeof loadBatchComparisonMatrix === 'function') loadBatchComparisonMatrix();
      }
    } else if (typeof renderTimesheetGrid === 'function') {
      renderTimesheetGrid();
    }
  }`;

if (html.includes(oldSetLangTimesheet)) {
  html = html.replace(oldSetLangTimesheet, newSetLangTimesheet);
  console.log('✅ setLanguage timesheet branch updated');
} else {
  console.warn('⚠️ Could not find oldSetLangTimesheet in setLanguage');
}

// 4. UPDATE JS RENDER FUNCTIONS
// Helper updateProjectScopeDropdownI18n
const scopeHelperFunc = `
function updateProjectScopeDropdownI18n() {
  const scopeSel = document.getElementById('ts-rep-scope-sel');
  if (!scopeSel) return;
  const curVal = scopeSel.value || 'all';
  scopeSel.innerHTML = \`
    <option value="all">\${t('ts_scope_all')}</option>
    <option value="current">\${t('ts_scope_current')}</option>
    <option value="custom">\${t('ts_scope_custom')}</option>
  \`;
  scopeSel.value = curVal;
}
`;

html = html.replace(
  `function initProjectActualTimeTab() {`,
  `${scopeHelperFunc}\nfunction initProjectActualTimeTab() {`
);

// In initProjectActualTimeTab: add updateProjectScopeDropdownI18n() and localized opt_select_pj
html = html.replace(
  `let opts = '<option value="">-- Chọn dự án cần xem --</option>';`,
  `updateProjectScopeDropdownI18n();\n  let opts = '<option value="">' + t('ts_opt_select_pj') + '</option>';`
);

// In renderProjectActualTimeReport: translate KPI cards, budget bar, historical, tables
const oldRenderPjReportRegex = /function renderProjectActualTimeReport\(data\) \{[\s\S]*?\/\/ ── 2\. SUB-TAB 3: STAFF WORK BREAKDOWN ──/;

const newRenderPjReport = `function renderProjectActualTimeReport(data) {
  // 1. KPI Cards
  const kpiContainer = document.getElementById('ts-rep-kpi-container');
  if (kpiContainer) {
    const isLifetime = (data.scope === 'all');
    kpiContainer.innerHTML = \`
      <div class="ts-kpi-card" style="border-left:4px solid var(--p)">
        <div class="ts-kpi-lbl">\${isLifetime ? t('ts_kpi_lifetime_hours') : t('ts_kpi_actual_hours')}</div>
        <div class="ts-kpi-val" style="color:var(--p)">\${Number(data.totalLifetimeHours || 0).toLocaleString()}h</div>
        <div class="ts-kpi-sub">\${isLifetime ? t('ts_kpi_lifetime_sub') : t('ts_kpi_scope_sub')}</div>
      </div>
      <div class="ts-kpi-card" style="border-left:4px solid #10b981">
        <div class="ts-kpi-lbl">\${t('ts_kpi_current_year', { year: '2026' })}</div>
        <div class="ts-kpi-val" style="color:#10b981">\${Number(data.currentYearHours || 0).toLocaleString()}h</div>
        <div class="ts-kpi-sub">\${t('ts_kpi_standard_hours', { hours: data.officialHours || 0 })}</div>
      </div>
      <div class="ts-kpi-card" style="border-left:4px solid #f59e0b">
        <div class="ts-kpi-lbl">\${t('ts_kpi_ot')}</div>
        <div class="ts-kpi-val" style="color:#f59e0b">\${Number(data.otHours || 0).toLocaleString()}h</div>
        <div class="ts-kpi-sub">\${t('ts_kpi_ot_rate', { rate: data.currentYearHours > 0 ? ((data.otHours / data.currentYearHours) * 100).toFixed(1) : 0 })}</div>
      </div>
      <div class="ts-kpi-card" style="border-left:4px solid #6366f1">
        <div class="ts-kpi-lbl">\${t('ts_kpi_engineers')}</div>
        <div class="ts-kpi-val" style="color:#6366f1">\${(data.members || []).length}</div>
        <div class="ts-kpi-sub">\${t('ts_kpi_engineers_sub')}</div>
      </div>
    \`;
  }

  // 2. Budget Variance & Progress Alert
  const budgetWrap = document.getElementById('ts-rep-budget-bar-wrap');
  if (budgetWrap) {
    if (data.budgetHours && data.budgetHours > 0) {
      budgetWrap.style.display = 'block';
      const pct = data.budgetUsagePercent || 0;
      const isOver = data.isOverBudget;
      const barColor = isOver ? '#ef4444' : (pct > 80 ? '#f59e0b' : '#10b981');
      const badgeClass = isOver ? 'an-badge an-badge-warn' : 'an-badge an-badge-green';
      const badgeText = isOver
        ? '⚠️ ' + t('ts_budget_over', { variance: data.varianceHours, pct: (pct - 100).toFixed(1) })
        : '✅ ' + t('ts_budget_used', { pct });

      budgetWrap.innerHTML = \`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div>
            <span style="font-weight:700;font-size:13px;color:var(--tx)">\${t('ts_budget_control')}</span>
            <span style="font-size:12px;color:var(--t2);margin-left:6px">\${t('ts_budget_plan')} <b>\${data.budgetHours}h</b> | \${t('ts_budget_actual')} <b>\${data.totalLifetimeHours}h</b></span>
          </div>
          <div>
            <span class="\${badgeClass}" style="font-weight:700">\${badgeText}</span>
          </div>
        </div>
        <div style="height:10px;background:#e2e8f0;border-radius:5px;overflow:hidden">
          <div style="height:100%;width:\${Math.min(pct, 100)}%;background:\${barColor};transition:.3s"></div>
        </div>
      \`;
    } else {
      budgetWrap.style.display = 'none';
    }
  }

  // 3. Historical Snapshot Wrap (for 3-5 Year Multi-Year Projects)
  const histWrap = document.getElementById('ts-rep-historical-wrap');
  if (histWrap) {
    const histYears = Object.keys(data.historicalByYear || {});
    if (histYears.length > 0) {
      histWrap.style.display = 'block';
      let histHtml = \`
        <div style="background:#f8fafc;border:1px solid var(--bdr);border-radius:var(--r2);padding:12px 14px">
          <div style="font-weight:700;font-size:12px;color:var(--tx);margin-bottom:8px">\${t('ts_historical_title')}</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
      \`;
      histYears.forEach(yr => {
        histHtml += \`
          <div style="background:#fff;border:1px solid var(--bdr);border-radius:6px;padding:6px 12px;font-size:12px">
            <span style="font-weight:700;color:var(--tx)">\${t('ts_historical_year', { year: yr })}</span>
            <span style="font-weight:800;color:var(--p);margin-left:4px">\${data.historicalByYear[yr]}h</span>
            <span class="badge bg-bl" style="font-size:10px;margin-left:4px">\${t('ts_historical_closed')}</span>
          </div>
        \`;
      });
      histHtml += \`
            <div style="background:#fff;border:1px solid var(--bdr);border-radius:6px;padding:6px 12px;font-size:12px">
              <span style="font-weight:700;color:var(--tx)">\${t('ts_historical_year', { year: '2026' })}</span>
              <span style="font-weight:800;color:#10b981;margin-left:4px">\${data.currentYearHours}h</span>
              <span class="badge bg-gr" style="font-size:10px;margin-left:4px">\${t('ts_historical_running')}</span>
            </div>
          </div>
        </div>
      \`;
      histWrap.innerHTML = histHtml;
    } else {
      histWrap.style.display = 'none';
    }
  }

  // 4. Staff Contribution Table
  const tbMembers = document.getElementById('ts-rep-tbody-members');
  const countMembers = document.getElementById('ts-rep-member-count');
  if (countMembers) countMembers.textContent = t('ts_count_engineers', { count: (data.members || []).length });

  if (tbMembers) {
    if (!data.members || !data.members.length) {
      tbMembers.innerHTML = \`<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--t3)">\${t('ts_empty_project_data')}</td></tr>\`;
    } else {
      tbMembers.innerHTML = data.members.map((m, idx) => \`
        <tr>
          <td style="text-align:center;font-size:11px;color:var(--t3)">\${idx + 1}</td>
          <td style="font-weight:700;color:var(--tx)">\${m.code}</td>
          <td>\${m.name}</td>
          <td style="text-align:right;font-weight:700;color:var(--p)">\${m.hours}h</td>
          <td style="text-align:right">
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:6px">
              <span style="font-size:11px;font-weight:600;min-width:36px">\${m.percentage}%</span>
              <div style="width:50px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden">
                <div style="width:\${Math.min(m.percentage, 100)}%;height:100%;background:var(--p)"></div>
              </div>
            </div>
          </td>
        </tr>
      \`).join('');
    }
  }

  // 5. Discipline Breakdown Table (Hỗ trợ đa ngôn ngữ Nhật / Anh / Việt)
  const tbDisc = document.getElementById('ts-rep-tbody-disciplines');
  const countDisc = document.getElementById('ts-rep-disc-count');
  if (countDisc) countDisc.textContent = t('ts_count_disciplines', { count: (data.disciplines || []).length });

  if (tbDisc) {
    if (!data.disciplines || !data.disciplines.length) {
      tbDisc.innerHTML = \`<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--t3)">\${t('ts_empty_disc_data')}</td></tr>\`;
    } else {
      tbDisc.innerHTML = data.disciplines.map((d, idx) => {
        const discTax = ((S.taxonomy && S.taxonomy.disciplines) || []).find(x => x.code === d.code);
        const discName = discTax ? (typeof tTaxonomy === 'function' ? tTaxonomy(discTax) : (discTax.name_vi || discTax.name || '')) : (d.name || d.code);
        return \`
          <tr>
            <td style="text-align:center;font-size:11px;color:var(--t3)">\${idx + 1}</td>
            <td style="font-weight:700;color:var(--tx)"><span class="badge bg-bl">\${d.code}</span></td>
            <td>\${discName}</td>
            <td style="text-align:right;font-weight:700;color:#0f766e">\${d.hours}h</td>
            <td style="text-align:right">
              <div style="display:flex;align-items:center;justify-content:flex-end;gap:6px">
                <span style="font-size:11px;font-weight:600;min-width:36px">\${d.percentage}%</span>
                <div style="width:50px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden">
                  <div style="width:\${Math.min(d.percentage, 100)}%;height:100%;background:#0f766e"></div>
                </div>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }
  }
}

// ── 2. SUB-TAB 3: STAFF WORK BREAKDOWN ──`;

if (oldRenderPjReportRegex.test(html)) {
  html = html.replace(oldRenderPjReportRegex, newRenderPjReport);
  console.log('✅ renderProjectActualTimeReport updated with i18n and tTaxonomy');
} else {
  console.warn('⚠️ Could not find oldRenderPjReportRegex');
}

// In renderStaffWorkBreakdown: translate KPI chips, tree header, discipline name, note
const oldRenderStaffBreakdownRegex = /function renderStaffWorkBreakdown\(data\) \{[\s\S]*?\/\/ ── 3\. SUB-TAB 4: BATCH COMPARISON MATRIX/;

const newRenderStaffBreakdown = `function renderStaffWorkBreakdown(data) {
  // 1. KPI Chips
  const kpiContainer = document.getElementById('ts-stf-kpi-container');
  if (kpiContainer) {
    kpiContainer.innerHTML = \`
      <div class="ts-stat-chip" style="background:#eef2ff">
        <span style="font-weight:600">\${t('ts_stf_total_hours')}</span> <span class="ts-stat-num" style="color:var(--p);font-size:15px">\${data.totalHours || 0}h</span>
      </div>
      <div class="ts-stat-chip">
        <span style="font-weight:600">\${t('ts_stf_official_hours')}</span> <span class="ts-stat-num">\${data.officialHours || 0}h</span>
      </div>
      <div class="ts-stat-chip">
        <span style="font-weight:600">\${t('ts_stf_ot_hours')}</span> <span class="ts-stat-num" style="color:#ea580c">\${data.otHours || 0}h</span>
      </div>
      <div class="ts-stat-chip">
        <span style="font-weight:600">\${t('ts_stf_active_days')}</span> <span class="ts-stat-num">\${t('ts_stf_days_unit', { count: data.activeDays || 0 })}</span>
      </div>
      <div class="ts-stat-chip">
        <span style="font-weight:600">\${t('ts_stf_pjs_count')}</span> <span class="ts-stat-num">\${t('ts_stf_pjs_unit', { count: (data.projects || []).length })}</span>
      </div>
    \`;
  }

  // 2. Hierarchical Tree Breakdown
  const treeContainer = document.getElementById('ts-stf-tree-container');
  if (!treeContainer) return;

  if (!data.projects || !data.projects.length) {
    treeContainer.innerHTML = \`<div style="text-align:center;padding:30px;color:var(--t3)">\${t('ts_stf_no_data')}</div>\`;
    return;
  }

  let treeHtml = \`<div style="font-weight:700;font-size:13px;color:var(--tx);margin-bottom:12px">\${t('ts_stf_tree_header', { staff: data.staffCode + ' - ' + data.staffName })}</div>\`;

  data.projects.forEach((p, pIdx) => {
    treeHtml += \`
      <div style="margin-bottom:10px;border:1px solid var(--bdr);border-radius:6px;overflow:hidden">
        <div class="ts-tree-pj-hdr" onclick="toggleTreeSection('ts-tree-pj-body-\${pIdx}')">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:14px">📁</span>
            <span style="font-weight:700;color:var(--tx);font-size:13px">\${p.projectCode}</span>
            <span class="badge bg-bl" style="font-size:10px">\${p.percentage}%</span>
          </div>
          <div style="font-weight:800;color:var(--p);font-size:13px">\${p.totalHours}h ▾</div>
        </div>
        <div id="ts-tree-pj-body-\${pIdx}" style="padding:6px 0;background:#fff">
    \`;

    (p.disciplines || []).forEach(d => {
      const discTax = ((S.taxonomy && S.taxonomy.disciplines) || []).find(x => x.code === d.code);
      const discName = discTax ? (typeof tTaxonomy === 'function' ? tTaxonomy(discTax) : (discTax.name_vi || discTax.name || '')) : (d.name || d.code);
      treeHtml += \`
        <div class="ts-tree-disc-row">
          <div style="display:flex;align-items:center;gap:6px">
            <span class="badge bg-gr" style="font-size:10px">\${d.code}</span>
            <span style="font-weight:600;color:var(--tx)">\${discName}</span>
          </div>
          <div style="font-weight:700;color:#0f766e">\${d.hours}h (\${d.percentage}%)</div>
        </div>
      \`;

      if (d.logs && d.logs.length) {
        treeHtml += \`<div class="ts-tree-notes">\`;
        d.logs.slice(0, 5).forEach(l => {
          treeHtml += \`<div>• <b>\${l.date}</b> (\${l.timeSlot}): \${l.note || t('ts_no_note')}</div>\`;
        });
        treeHtml += \`</div>\`;
      }
    });

    treeHtml += \`
        </div>
      </div>
    \`;
  });

  treeContainer.innerHTML = treeHtml;
}

function toggleTreeSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
  }
}

// ── 3. SUB-TAB 4: BATCH COMPARISON MATRIX`;

if (oldRenderStaffBreakdownRegex.test(html)) {
  html = html.replace(oldRenderStaffBreakdownRegex, newRenderStaffBreakdown);
  console.log('✅ renderStaffWorkBreakdown updated with i18n and tTaxonomy');
} else {
  console.warn('⚠️ Could not find oldRenderStaffBreakdownRegex');
}

// In loadBatchComparisonMatrix & renderBatchComparisonMatrix: update status text, headers, totals
const oldRenderMatrixRegex = /function renderBatchComparisonMatrix\(data\) \{[\s\S]*?\/\/ ── 4\. DRILLDOWN DETAIL MODAL ON CELL CLICK ──/;

const newRenderMatrix = `function renderBatchComparisonMatrix(data) {
  const thead = document.getElementById('ts-mat-thead');
  const tbody = document.getElementById('ts-mat-tbody');
  const tfoot = document.getElementById('ts-mat-tfoot');
  if (!thead || !tbody || !tfoot) return;

  const projects = data.projectColumns || [];
  const rows = data.rows || [];
  const colTotals = data.columnTotals || {};
  const grandTotal = data.grandTotalHours || 0;

  // 1. Build Thead
  let thHtml = '<tr>';
  thHtml += '<th class="sticky-col-idx">#</th>';
  thHtml += \`<th class="sticky-col-code">\${t('ts_col_staff_code')}</th>\`;
  thHtml += \`<th class="sticky-col-name">\${t('ts_col_staff_name')}</th>\`;
  projects.forEach(p => {
    thHtml += \`<th style="text-align:right;min-width:75px">\${p}</th>\`;
  });
  thHtml += \`<th style="text-align:right;min-width:90px;background:#eef2ff;color:var(--p)">\${t('ts_mat_col_total')}</th>\`;
  thHtml += '</tr>';
  thead.innerHTML = thHtml;

  // 2. Build Tbody
  if (!rows.length) {
    const colSpan = Math.max(projects.length + 4, 5);
    const msg = data.isAllTime
      ? t('ts_stf_no_data')
      : t('ts_empty_project_data');
    tbody.innerHTML = \`<tr><td colspan="\${colSpan}" style="text-align:center;padding:35px 20px;color:var(--t2);font-size:13px">\${msg}</td></tr>\`;
    tfoot.innerHTML = '';
    return;
  }

  let tbHtml = '';
  rows.forEach((s, idx) => {
    tbHtml += '<tr>';
    tbHtml += \`<td class="sticky-col-idx">\${idx + 1}</td>\`;
    tbHtml += \`<td class="sticky-col-code">\${s.staffCode}</td>\`;
    tbHtml += \`<td class="sticky-col-name">\${s.staffName}</td>\`;

    projects.forEach(p => {
      const hrs = (s.projectHours && s.projectHours[p]) || 0;
      if (hrs > 0) {
        tbHtml += \`<td class="ts-matrix-cell has-val" onclick="openTsDrilldownModal('\${s.staffCode}', '\${s.staffName.replace(/'/g, "\\\\'")}', '\${p}')" title="\${t('ts_mat_hint')}">\${hrs.toFixed(1)}</td>\`;
      } else {
        tbHtml += \`<td class="ts-matrix-cell" style="color:#cbd5e1">-</td>\`;
      }
    });

    tbHtml += \`<td class="ts-matrix-cell" style="font-weight:800;color:var(--p);background:#f8fafc">\${s.totalHours.toFixed(1)}</td>\`;
    tbHtml += '</tr>';
  });
  tbody.innerHTML = tbHtml;

  // 3. Build Tfoot (Summary Row)
  let tfHtml = '<tr>';
  tfHtml += '<td class="sticky-col-idx">∑</td>';
  tfHtml += \`<td class="sticky-col-code">\${t('ts_mat_grand_total')}</td>\`;
  tfHtml += \`<td class="sticky-col-name">\${t('ts_mat_all_projects')}</td>\`;
  projects.forEach(p => {
    const tot = colTotals[p] || 0;
    tfHtml += \`<td style="text-align:right;font-weight:800;color:#0f766e">\${tot.toFixed(1)}</td>\`;
  });
  tfHtml += \`<td style="text-align:right;font-weight:900;color:var(--p);font-size:13px;background:#e0e7ff">\${grandTotal.toFixed(1)}</td>\`;
  tfHtml += '</tr>';
  tfoot.innerHTML = tfHtml;
}

// ── 4. DRILLDOWN DETAIL MODAL ON CELL CLICK ──`;

if (oldRenderMatrixRegex.test(html)) {
  html = html.replace(oldRenderMatrixRegex, newRenderMatrix);
  console.log('✅ renderBatchComparisonMatrix updated with i18n');
} else {
  console.warn('⚠️ Could not find oldRenderMatrixRegex');
}

// In openTsDrilldownModal: translate title, sub, type badges, discipline name
const oldModalRegex = /function openTsDrilldownModal\(staffCode, staffName, projectCode\) \{[\s\S]*?window\.switchTsSubTab = switchTsSubTab;/;

const newModal = `function openTsDrilldownModal(staffCode, staffName, projectCode) {
  const mTitle = document.getElementById('m-ts-drill-title');
  const mSub = document.getElementById('m-ts-drill-sub');
  const tb = document.getElementById('m-ts-drill-tbody');

  if (mTitle) mTitle.textContent = t('ts_mat_drilldown_title', { staff: \`\${staffCode} (\${staffName})\`, project: projectCode });
  if (mSub) mSub.textContent = t('ts_mat_drilldown_sub', { project: projectCode });
  if (tb) tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:25px"><div class="ldg"><div class="spn"></div></div></td></tr>';

  openModal('m-ts-drilldown');

  const mInp = document.getElementById('ts-mat-month');
  const ym = mInp ? mInp.value : '';
  let startDate = '', endDate = '';
  if (ym) {
    const parts = ym.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    startDate = \`\${ym}-01\`;
    const lastDay = new Date(y, m, 0).getDate();
    endDate = \`\${ym}-\${String(lastDay).padStart(2, '0')}\`;
  }

  google.script.run
    .withSuccessHandler(res => {
      if (res && res.success && res.slots) {
        if (!res.slots.length) {
          tb.innerHTML = \`<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--t3)">\${t('ts_drill_no_records')}</td></tr>\`;
        } else {
          tb.innerHTML = res.slots.map(s => {
            const discTax = ((S.taxonomy && S.taxonomy.disciplines) || []).find(x => x.code === s.disciplineCode);
            const discName = discTax ? (typeof tTaxonomy === 'function' ? tTaxonomy(discTax) : (discTax.name_vi || discTax.name || '')) : s.disciplineCode;
            const typeLabel = s.isOT ? t('ts_drill_type_ot') : t('ts_drill_type_standard');
            return \`
              <tr>
                <td style="font-weight:600">\${s.date}</td>
                <td><span class="ts-time-badge">\${s.timeSlot}</span></td>
                <td style="text-align:right;font-weight:700;color:var(--p)">\${s.durHours}h</td>
                <td><span class="badge \${s.isOT ? 'bg-re' : 'bg-bl'}">\${typeLabel}</span></td>
                <td><span class="badge bg-gr" title="\${discName}">\${s.disciplineCode} - \${discName}</span></td>
                <td style="font-size:11px;color:var(--tx)">\${s.note || '-'}</td>
              </tr>
            \`;
          }).join('');
        }
      } else {
        tb.innerHTML = \`<tr><td colspan="6" style="text-align:center;padding:20px;color:#ef4444">\${(res && res.error) || 'Lỗi tải dữ liệu'}</td></tr>\`;
      }
    })
    .withFailureHandler(err => {
      tb.innerHTML = \`<tr><td colspan="6" style="text-align:center;padding:20px;color:#ef4444">\${err.message || 'Lỗi máy chủ'}</td></tr>\`;
    })
    .getTimesheetCellDrilldown(staffCode, projectCode, startDate, endDate);
}

window.updateProjectScopeDropdownI18n = updateProjectScopeDropdownI18n;
window.switchTsSubTab = switchTsSubTab;`;

if (oldModalRegex.test(html)) {
  html = html.replace(oldModalRegex, newModal);
  console.log('✅ openTsDrilldownModal updated with i18n and tTaxonomy');
} else {
  console.warn('⚠️ Could not find oldModalRegex');
}

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('🎉 Index.html Timesheet i18n successfully updated!');
