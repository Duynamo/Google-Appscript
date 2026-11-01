const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

const target = '    ts_tbl_staff_contrib: "👥 Đóng Góp Theo Nhân Sự",';
console.log('Has ts_tbl_staff_contrib in VI:', html.includes(target));

if (html.includes(target)) {
  html = html.replace(
    target,
    `    ts_tbl_staff_contrib: "👥 Đóng Góp Theo Nhân Sự",\r\n    ts_tbl_disc_breakdown: "📐 Phân Bổ Theo Tác Nghiệp (Discipline)",`
  );
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
  console.log('✅ Added ts_tbl_disc_breakdown to I18N.vi');
}

