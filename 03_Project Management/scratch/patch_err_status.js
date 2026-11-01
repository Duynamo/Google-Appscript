const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'Index.html');
let html = fs.readFileSync(p, 'utf8');

const target = "if (statusEl) statusEl.textContent = '❌ Lỗi tải';";
if (html.includes(target)) {
  html = html.replace(target, "if (statusEl) statusEl.textContent = t('ts_mat_status_err');");
  fs.writeFileSync(p, html, 'utf8');
  console.log('Successfully updated statusEl error text to t()');
} else {
  console.log('Target not found');
}

