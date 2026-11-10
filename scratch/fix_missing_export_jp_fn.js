const fs = require('fs');
let idx = fs.readFileSync('03_Project Management/Index.html', 'utf8');

const fnCode = `function exportJapaneseProjectReportClick() {
  const pjSel = document.getElementById('ts-rep-pj-sel');
  const projectCode = pjSel ? pjSel.value : '';
  if (!projectCode) {
    if (typeof toast === 'function') toast(t('ts_err_select_project') || 'Vui lòng chọn dự án trước khi xuất file nghiệm thu.', 'warning');
    return;
  }
  const scopeSel = document.getElementById('ts-rep-scope-sel');
  const scope = scopeSel ? scopeSel.value : 'all';
  const fromDate = (document.getElementById('ts-rep-from')?.value || '').trim();
  const toDate = (document.getElementById('ts-rep-to')?.value || '').trim();

  if (typeof toast === 'function') toast(t('ts_exporting_jp') || 'Đang khởi tạo file nghiệm thu chuẩn Nhật...', 'info');
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    google.script.run
      .withSuccessHandler(res => {
        if (res && res.success && res.url) {
          if (typeof toast === 'function') toast(res.message || 'Xuất file thành công! Đang mở...', 'success');
          window.open(res.url, '_blank');
        } else {
          if (typeof toast === 'function') toast((res && res.error) || 'Lỗi xuất file nghiệm thu', 'error');
        }
      })
      .withFailureHandler(err => {
        if (typeof toast === 'function') toast(err.message || 'Lỗi kết nối máy chủ', 'error');
      })
      .exportJapaneseProjectReport(projectCode, scope, fromDate, toDate);
  }
}
`;

const target = 'window.exportJapaneseProjectReportClick = exportJapaneseProjectReportClick;';
if (!idx.includes('function exportJapaneseProjectReportClick()')) {
  idx = idx.replace(target, () => fnCode + '\n' + target);
  fs.writeFileSync('03_Project Management/Index.html', idx, 'utf8');
  console.log('Inserted function exportJapaneseProjectReportClick in Index.html!');
} else {
  console.log('Already present in Index.html');
}

