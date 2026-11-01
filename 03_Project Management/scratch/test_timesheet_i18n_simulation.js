const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════════════════');
console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐA NGÔN NGỮ (TIMESHEET MULTILINGUAL I18N TEST SUITE)');
console.log('════════════════════════════════════════════════════════════════════════════');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
const html = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Extract I18N dictionary from Index.html
const startIdx = html.indexOf('const I18N = {');
const endIdx = html.indexOf('};\r\n\r\nconst STATUS_I18N', startIdx) !== -1 
  ? html.indexOf('};\r\n\r\nconst STATUS_I18N', startIdx) + 2
  : html.indexOf('};\n\nconst STATUS_I18N', startIdx) + 2;

if (startIdx === -1 || endIdx <= startIdx) {
  throw new Error('Could not extract I18N from Index.html');
}
const i18nCode = html.substring(startIdx + 'const I18N = '.length, endIdx);
let I18N;
eval('I18N = ' + i18nCode);

console.log('✅ I18N extracted successfully. Locales present:', Object.keys(I18N));

// Helper t()
function t(key, params, lang) {
  const curLang = lang || 'vi';
  const dict = I18N[curLang] || I18N.vi;
  let text = dict[key] !== undefined ? dict[key] : (I18N.vi[key] || key);
  if (params && typeof params === 'object') {
    Object.keys(params).forEach(k => {
      text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
    });
  }
  return text;
}

// 2. Check essential Timesheet keys across vi, en, ja
const requiredKeys = [
  'ts_subtab_entry', 'ts_subtab_project', 'ts_subtab_staff', 'ts_subtab_matrix',
  'ts_lbl_select_pj', 'ts_lbl_scope', 'ts_scope_all', 'ts_scope_current', 'ts_scope_custom',
  'ts_btn_export_jp', 'ts_tbl_staff_contrib', 'ts_tbl_disc_breakdown', 'ts_btn_reload', 'ts_btn_filter',
  'ts_opt_select_pj', 'ts_kpi_lifetime_hours', 'ts_kpi_actual_hours', 'ts_kpi_lifetime_sub', 'ts_kpi_scope_sub',
  'ts_kpi_current_year', 'ts_kpi_standard_hours', 'ts_kpi_ot', 'ts_kpi_ot_rate', 'ts_kpi_engineers', 'ts_kpi_engineers_sub',
  'ts_budget_control', 'ts_budget_plan', 'ts_budget_actual', 'ts_budget_used', 'ts_budget_over',
  'ts_historical_title', 'ts_historical_year', 'ts_historical_closed', 'ts_historical_running',
  'ts_col_staff_code', 'ts_col_staff_name', 'ts_col_hours', 'ts_col_ratio', 'ts_col_disc_code', 'ts_col_disc_name',
  'ts_count_engineers', 'ts_count_disciplines', 'ts_empty_project_data', 'ts_empty_disc_data',
  'ts_stf_select', 'ts_stf_from', 'ts_stf_to', 'ts_stf_btn_this_month', 'ts_stf_btn_last_month', 'ts_stf_btn_all', 'ts_stf_btn_view',
  'ts_stf_total_hours', 'ts_stf_official_hours', 'ts_stf_ot_hours', 'ts_stf_active_days', 'ts_stf_days_unit', 'ts_stf_pjs_count', 'ts_stf_pjs_unit',
  'ts_stf_tree_header', 'ts_stf_empty_hint', 'ts_stf_no_data', 'ts_no_note',
  'ts_mat_month', 'ts_mat_prev_month', 'ts_mat_next_month', 'ts_mat_all_months', 'ts_mat_hide_zero',
  'ts_mat_status_ready', 'ts_mat_status_loading', 'ts_mat_status_done', 'ts_mat_status_all_done', 'ts_mat_status_err',
  'ts_mat_hint', 'ts_mat_col_total', 'ts_mat_grand_total', 'ts_mat_all_projects',
  'ts_mat_drilldown_title', 'ts_mat_drilldown_sub', 'ts_drill_col_date', 'ts_drill_col_slot', 'ts_drill_col_hours',
  'ts_drill_col_type', 'ts_drill_col_disc', 'ts_drill_col_note', 'ts_drill_type_standard', 'ts_drill_type_ot', 'ts_drill_no_records'
];

let missingVI = [];
let missingEN = [];
let missingJA = [];

requiredKeys.forEach(k => {
  if (!I18N.vi[k]) missingVI.push(k);
  if (!I18N.en[k]) missingEN.push(k);
  if (!I18N.ja[k]) missingJA.push(k);
});

console.log('--- TEST 1: Dictionary Completeness ---');
assert.strictEqual(missingVI.length, 0, 'Missing keys in VI: ' + missingVI.join(', '));
console.log('✅ VI Dictionary contains 100% of required Timesheet keys (' + requiredKeys.length + '/' + requiredKeys.length + ')');

assert.strictEqual(missingEN.length, 0, 'Missing keys in EN: ' + missingEN.join(', '));
console.log('✅ EN Dictionary contains 100% of required Timesheet keys (' + requiredKeys.length + '/' + requiredKeys.length + ')');

assert.strictEqual(missingJA.length, 0, 'Missing keys in JA: ' + missingJA.join(', '));
console.log('✅ JA Dictionary contains 100% of required Timesheet keys (' + requiredKeys.length + '/' + requiredKeys.length + ')');

// 3. Test tTaxonomy translation
console.log('\n--- TEST 2: tTaxonomy Discipline Translation (JP / EN / VI) ---');
function tTaxonomy(item, lang) {
  if (!item) return "";
  const curLang = lang || 'vi';
  let text = "";
  if (curLang === 'ja') text = item.name_jp || item.name_en || item.name_vi || item.name || item.code || "";
  else if (curLang === 'en') text = item.name_en || item.name_vi || item.name_jp || item.name || item.code || "";
  else text = item.name_vi || item.name_en || item.name || item.code || "";

  if (text && item.code) {
    const rx = new RegExp('^' + item.code + '[_\\-\\s:]+', 'i');
    text = text.replace(rx, '').trim();
  }
  return text;
}

const mockDiscipline = {
  code: 'MD01',
  name_vi: 'Dựng hình Kết cấu / Thân',
  name_en: 'Structural / Body Modeling',
  name_jp: '躯体モデル作成'
};

assert.strictEqual(tTaxonomy(mockDiscipline, 'ja'), '躯体モデル作成');
console.log('✅ Japanese translation for MD01:', tTaxonomy(mockDiscipline, 'ja'));
assert.strictEqual(tTaxonomy(mockDiscipline, 'en'), 'Structural / Body Modeling');
console.log('✅ English translation for MD01:', tTaxonomy(mockDiscipline, 'en'));
assert.strictEqual(tTaxonomy(mockDiscipline, 'vi'), 'Dựng hình Kết cấu / Thân');
console.log('✅ Vietnamese translation for MD01:', tTaxonomy(mockDiscipline, 'vi'));

// 4. Test KPI Cards & Budget Bar in Japanese
console.log('\n--- TEST 3: Japanese KPI & Budget Formatting Simulation ---');
const lifetimeLabelJA = t('ts_kpi_lifetime_hours', {}, 'ja');
console.log('KPI Lifetime Hours (JA):', lifetimeLabelJA);
assert.strictEqual(lifetimeLabelJA, '累計総工数 (全期間)');

const currentYearJA = t('ts_kpi_current_year', { year: '2026' }, 'ja');
console.log('KPI Current Year (JA):', currentYearJA);
assert.strictEqual(currentYearJA, '当該年度 (2026)');

const otRateJA = t('ts_kpi_ot_rate', { rate: '12.5' }, 'ja');
console.log('KPI OT Rate (JA):', otRateJA);
assert.strictEqual(otRateJA, '残業比率: 12.5%');

const budgetControlJA = t('ts_budget_control', {}, 'ja');
console.log('Budget Control (JA):', budgetControlJA);
assert.strictEqual(budgetControlJA, '🎯 工数予算管理:');

const budgetUsedJA = t('ts_budget_used', { pct: 69.8 }, 'ja');
console.log('Budget Used (JA):', budgetUsedJA);
assert.strictEqual(budgetUsedJA, '消化率 69.8%');

const countEngJA = t('ts_count_engineers', { count: 3 }, 'ja');
console.log('Count Engineers (JA):', countEngJA);
assert.strictEqual(countEngJA, '3 名');

// 5. Test Staff Breakdown Tree in Japanese
console.log('\n--- TEST 4: Staff Breakdown Tree Simulation (JA) ---');
const treeHdrJA = t('ts_stf_tree_header', { staff: 'V01007 - Vũ Đình Duy' }, 'ja');
console.log('Tree Header (JA):', treeHdrJA);
assert.strictEqual(treeHdrJA, '🌳 業務ブレークダウン [V01007 - Vũ Đình Duy]:');

const officialHoursJA = t('ts_stf_official_hours', {}, 'ja');
console.log('Official Hours Chip (JA):', officialHoursJA);
assert.strictEqual(officialHoursJA, '定時時間:');

const daysUnitJA = t('ts_stf_days_unit', { count: 38 }, 'ja');
console.log('Days Unit (JA):', daysUnitJA);
assert.strictEqual(daysUnitJA, '38 日');

// 6. Test Batch Comparison Matrix in Japanese
console.log('\n--- TEST 5: Batch Comparison Matrix Headers & Tfoot (JA) ---');
const colCodeJA = t('ts_col_staff_code', {}, 'ja');
console.log('Matrix Staff Code (JA):', colCodeJA);
assert.strictEqual(colCodeJA, '社員番号');

const colNameJA = t('ts_col_staff_name', {}, 'ja');
console.log('Matrix Staff Name (JA):', colNameJA);
assert.strictEqual(colNameJA, '氏名');

const grandTotalJA = t('ts_mat_grand_total', {}, 'ja');
console.log('Matrix Grand Total (JA):', grandTotalJA);
assert.strictEqual(grandTotalJA, '総合計');

const allPjsJA = t('ts_mat_all_projects', {}, 'ja');
console.log('Matrix All Projects (JA):', allPjsJA);
assert.strictEqual(allPjsJA, '全プロジェクト');

const drillTitleJA = t('ts_mat_drilldown_title', { staff: 'V01007 (Vũ Đình Duy)', project: '2026_01_MUR01' }, 'ja');
console.log('Drilldown Title (JA):', drillTitleJA);
assert.strictEqual(drillTitleJA, '工数詳細内訳: V01007 (Vũ Đình Duy) × 2026_01_MUR01');

console.log('\n════════════════════════════════════════════════════════════════════════════');
console.log('🎯 TẤT CẢ CÁC BÀI TEST ĐA NGÔN NGỮ (VI / EN / JA) CHO QUẢN LÝ THỜI GIAN ĐỀU PASS 100%!');
console.log('════════════════════════════════════════════════════════════════════════════');
