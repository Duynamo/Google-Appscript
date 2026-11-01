const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const sIdx = code.indexOf('function loadStaffWorkBreakdown');
console.log('=== loadStaffWorkBreakdown ===');
console.log(code.substring(sIdx, sIdx + 1200));

const mIdx = code.indexOf('function loadBatchComparisonMatrix');
console.log('=== loadBatchComparisonMatrix ===');
console.log(code.substring(mIdx, mIdx + 1500));

