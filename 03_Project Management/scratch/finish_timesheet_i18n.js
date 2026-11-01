const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('--- Applying Remaining Timesheet Multilingual Fixes ---');

// 1. Table 1 headers in Pane 2
// <th>Mã NV</th> ... <th>Họ Tên</th> ... <th>Số Giờ</th> ... <th>Tỷ Trọng</th>
const t1Regex = /(<table[\s\S]*?<thead[\s\S]*?<tr>[\s\S]*?<th style="width:36px;text-align:center">#<\/th>)\s*<th>Mã NV<\/th>\s*<th>Họ Tên<\/th>\s*<th style="text-align:right">Số Giờ<\/th>\s*<th style="width:110px;text-align:right">Tỷ Trọng<\/th>/;
if (t1Regex.test(html)) {
  html = html.replace(t1Regex, `$1
                      <th data-i18n="ts_col_staff_code">Mã NV</th>
                      <th data-i18n="ts_col_staff_name">Họ Tên</th>
                      <th style="text-align:right" data-i18n="ts_col_hours">Số Giờ</th>
                      <th style="width:110px;text-align:right" data-i18n="ts_col_ratio">Tỷ Trọng</th>`);
  console.log('✅ Table 1 (Staff Contributions) headers updated with data-i18n');
} else {
  console.warn('⚠️ Could not match Table 1 headers regex');
}

// 2. Table 2 headers in Pane 2
// <th>Mã</th> ... <th>Tên Tác Nghiệp</th> ... <th>Số Giờ</th> ... <th>Tỷ Trọng</th>
const t2Regex = /(<tbody id="ts-rep-tbody-disciplines"[\s\S]*?<\/tbody>[\s\S]*?<thead[\s\S]*?<tr>[\s\S]*?<th style="width:36px;text-align:center">#<\/th>|<tr>\s*<th style="width:36px;text-align:center">#<\/th>)\s*<th>Mã<\/th>\s*<th>Tên Tác Nghiệp<\/th>\s*<th style="text-align:right">Số Giờ<\/th>\s*<th style="width:110px;text-align:right">Tỷ Trọng<\/th>/;
if (t2Regex.test(html)) {
  html = html.replace(t2Regex, `$1
                      <th data-i18n="ts_col_disc_code">Mã</th>
                      <th data-i18n="ts_col_disc_name">Tên Tác Nghiệp</th>
                      <th style="text-align:right" data-i18n="ts_col_hours">Số Giờ</th>
                      <th style="width:110px;text-align:right" data-i18n="ts_col_ratio">Tỷ Trọng</th>`);
  console.log('✅ Table 2 (Discipline Breakdown) headers updated with data-i18n');
} else {
  console.warn('⚠️ Could not match Table 2 headers regex');
}

// 3. Drilldown modal table headers
const drillRegex = /<th style="width:90px">Ngày<\/th>\s*<th style="width:105px">Khung Giờ<\/th>\s*<th style="width:65px;text-align:right">Số Giờ<\/th>\s*<th style="width:75px">Loại Ca<\/th>\s*<th style="width:100px">Tác Nghiệp<\/th>\s*<th>Ghi Chú Công Việc<\/th>/;
if (drillRegex.test(html)) {
  html = html.replace(drillRegex, `<th style="width:90px" data-i18n="ts_drill_col_date">Ngày</th>
              <th style="width:105px" data-i18n="ts_drill_col_slot">Khung Giờ</th>
              <th style="width:65px;text-align:right" data-i18n="ts_drill_col_hours">Số Giờ</th>
              <th style="width:75px" data-i18n="ts_drill_col_type">Loại Ca</th>
              <th style="width:100px" data-i18n="ts_drill_col_disc">Tác Nghiệp</th>
              <th data-i18n="ts_drill_col_note">Ghi Chú Công Việc</th>`);
  console.log('✅ Drilldown modal table headers updated with data-i18n');
} else {
  console.warn('⚠️ Could not match Drilldown modal table headers regex');
}

// 4. setLanguage timesheet branch
const setLangRegex = /\} else if \(curPage === 'timesheet'\) \{\s*if \(typeof renderTimesheetGrid === 'function'\) renderTimesheetGrid\(\);\s*\}/;
if (setLangRegex.test(html)) {
  html = html.replace(setLangRegex, `} else if (curPage === 'timesheet') {
    if (typeof _tsActiveSubTab !== 'undefined') {
      if (_tsActiveSubTab === 'ENTRY' && typeof renderTimesheetGrid === 'function') {
        renderTimesheetGrid();
      } else if (_tsActiveSubTab === 'PROJECT') {
        if (typeof updateProjectScopeDropdownI18n === 'function') updateProjectScopeDropdownI18n();
        if (typeof initProjectActualTimeTab === 'function') initProjectActualTimeTab();
        else if (typeof loadProjectActualTimeReport === 'function') loadProjectActualTimeReport();
      } else if (_tsActiveSubTab === 'STAFF') {
        if (typeof initStaffWorkBreakdownTab === 'function') initStaffWorkBreakdownTab();
        else if (typeof loadStaffWorkBreakdown === 'function') loadStaffWorkBreakdown();
      } else if (_tsActiveSubTab === 'MATRIX') {
        if (typeof loadBatchComparisonMatrix === 'function') loadBatchComparisonMatrix();
      }
    } else if (typeof renderTimesheetGrid === 'function') {
      renderTimesheetGrid();
    }
  }`);
  console.log('✅ setLanguage timesheet branch updated');
} else {
  console.warn('⚠️ Could not match setLanguage timesheet branch regex');
}

// 5. loadBatchComparisonMatrix status text
const matStatusRegex = /if \(isAllTime\) \{\s*if \(mInp\) mInp\.value = '';\s*if \(statusEl\) statusEl\.textContent = '⏳ Đang tổng hợp ma trận toàn bộ thời gian\.\.\.';\s*\} else \{\s*([\s\S]*?)\s*if \(statusEl\) statusEl\.textContent = '⏳ Đang tổng hợp ma trận\.\.\.';\s*\}/;
if (matStatusRegex.test(html)) {
  html = html.replace(matStatusRegex, `if (isAllTime) {
    if (mInp) mInp.value = '';
    if (statusEl) statusEl.textContent = t('ts_mat_status_loading');
  } else {
    $1
    if (statusEl) statusEl.textContent = t('ts_mat_status_loading');
  }`);
  console.log('✅ loadBatchComparisonMatrix loading status updated to t()');
} else {
  console.warn('⚠️ Could not match loadBatchComparisonMatrix loading status');
}

// 6. loadBatchComparisonMatrix success status text
const matSuccessRegex = /if \(statusEl\) statusEl\.textContent = isAllTime \? '✅ Toàn bộ thời gian' : '✅ Đã tải xong';/;
if (matSuccessRegex.test(html)) {
  html = html.replace(matSuccessRegex, `if (statusEl) statusEl.textContent = isAllTime ? t('ts_mat_status_all_done') : t('ts_mat_status_done');`);
  console.log('✅ loadBatchComparisonMatrix success status updated to t()');
} else {
  console.warn('⚠️ Could not match loadBatchComparisonMatrix success status');
}

// 7. loadBatchComparisonMatrix failure status text
const matFailRegex = /if \(statusEl\) statusEl\.textContent = '❌ Lỗi tải ma trận';/;
if (matFailRegex.test(html)) {
  html = html.replace(matFailRegex, `if (statusEl) statusEl.textContent = t('ts_mat_status_err');`);
  console.log('✅ loadBatchComparisonMatrix failure status updated to t()');
} else {
  console.warn('⚠️ Could not match loadBatchComparisonMatrix failure status');
}

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Done.');

