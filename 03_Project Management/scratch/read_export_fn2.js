const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const idx = code.indexOf('function exportJapaneseProjectReportClick');
if (idx !== -1) {
  console.log(code.substring(idx, idx + 1000));
}

