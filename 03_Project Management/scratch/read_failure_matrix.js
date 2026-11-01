const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const idx = code.indexOf('withFailureHandler');
if (idx !== -1) {
  const mIdx = code.indexOf('loadBatchComparisonMatrix');
  const fhIdx = code.indexOf('withFailureHandler', mIdx);
  console.log(code.substring(fhIdx - 100, fhIdx + 300));
}

