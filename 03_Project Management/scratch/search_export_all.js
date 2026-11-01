const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

let idx = 0;
while ((idx = code.indexOf('exportJapaneseProjectReportClick', idx)) !== -1) {
  console.log('Found at:', idx);
  console.log(code.substring(idx - 50, idx + 200));
  idx += 30;
}

