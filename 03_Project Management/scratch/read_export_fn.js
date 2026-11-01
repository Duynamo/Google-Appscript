const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const eIdx = code.indexOf('function exportJapaneseTimesheetXlsx');
if (eIdx !== -1) {
  console.log(code.substring(eIdx, eIdx + 1200));
} else {
  console.log('function exportJapaneseTimesheetXlsx not found');
}

