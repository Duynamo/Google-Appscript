const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
const html = fs.readFileSync(indexHtmlPath, 'utf8');

const startIdx = html.indexOf('id="page-timesheet"');
const nextIdx = html.indexOf('class="page"', startIdx + 30);
const timesheetHtml = html.substring(startIdx, nextIdx !== -1 ? nextIdx : startIdx + 25000);

console.log('Timesheet html length:', timesheetHtml.length);

// Look for Table 1 and Table 2 in Pane 2
console.log('--- Table 1 in Pane 2 ---');
const t1 = timesheetHtml.indexOf('Đóng Góp Theo Nhân Sự');
if (t1 !== -1) {
  console.log(timesheetHtml.substring(t1 - 100, t1 + 800));
} else {
  console.log('Not found');
}

console.log('--- Table 2 in Pane 2 ---');
const t2 = timesheetHtml.indexOf('Phân Bổ Theo Tác Nghiệp');
if (t2 !== -1) {
  console.log(timesheetHtml.substring(t2 - 100, t2 + 800));
} else {
  console.log('Not found');
}

console.log('--- Pane 3 Header & Chips ---');
const p3 = timesheetHtml.indexOf('id="ts-pane-staff"');
if (p3 !== -1) {
  console.log(timesheetHtml.substring(p3, p3 + 1200));
} else {
  console.log('Not found');
}

console.log('--- Pane 4 Header ---');
const p4 = timesheetHtml.indexOf('id="ts-pane-matrix"');
if (p4 !== -1) {
  console.log(timesheetHtml.substring(p4, p4 + 1400));
} else {
  console.log('Not found');
}
