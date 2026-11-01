const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
const html = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('HTML length:', html.length);

// Check I18N.vi, en, ja
console.log('Has ts_kpi_lifetime_hours in VI:', html.includes('ts_kpi_lifetime_hours: "Tổng Giờ Vòng Đời (Lifetime)"'));
console.log('Has ts_kpi_lifetime_hours in EN:', html.includes('ts_kpi_lifetime_hours: "Lifetime Hours"'));
console.log('Has ts_kpi_lifetime_hours in JA:', html.includes('ts_kpi_lifetime_hours: "累計総工数 (全期間)"'));

// Check data-i18n tags
console.log('Has data-i18n="ts_subtab_entry":', html.includes('data-i18n="ts_subtab_entry"'));
console.log('Has data-i18n="ts_subtab_project":', html.includes('data-i18n="ts_subtab_project"'));
console.log('Has data-i18n="ts_subtab_staff":', html.includes('data-i18n="ts_subtab_staff"'));
console.log('Has data-i18n="ts_subtab_matrix":', html.includes('data-i18n="ts_subtab_matrix"'));
console.log('Has data-i18n="ts_lbl_select_pj":', html.includes('data-i18n="ts_lbl_select_pj"'));
console.log('Has data-i18n="ts_lbl_scope":', html.includes('data-i18n="ts_lbl_scope"'));
console.log('Has data-i18n="ts_btn_export_jp":', html.includes('data-i18n="ts_btn_export_jp"'));
console.log('Has data-i18n="ts_btn_reload":', html.includes('data-i18n="ts_btn_reload"'));
console.log('Has data-i18n="ts_col_staff_code" in Table 1:', html.includes('<th data-i18n="ts_col_staff_code">Mã NV</th>'));
console.log('Has data-i18n="ts_col_disc_code" in Table 2:', html.includes('<th data-i18n="ts_col_disc_code">Mã</th>'));
console.log('Has data-i18n="ts_drill_col_date" in modal:', html.includes('data-i18n="ts_drill_col_date"'));

// Check setLanguage update
console.log('Has _tsActiveSubTab in setLanguage:', html.includes('_tsActiveSubTab === \'ENTRY\''));

// Check JS render functions
console.log('Has updateProjectScopeDropdownI18n:', html.includes('function updateProjectScopeDropdownI18n()'));
console.log('renderProjectActualTimeReport uses tTaxonomy:', html.includes('tTaxonomy(discTax)'));
console.log('renderStaffWorkBreakdown uses tTaxonomy:', html.includes('t(\'ts_stf_total_hours\')'));
console.log('renderBatchComparisonMatrix uses t:', html.includes('t(\'ts_col_staff_code\')'));
console.log('openTsDrilldownModal uses tTaxonomy:', html.includes('t(\'ts_mat_drilldown_title\''));
