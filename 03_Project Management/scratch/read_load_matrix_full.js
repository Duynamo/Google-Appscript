const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const mIdx = code.indexOf('function loadBatchComparisonMatrix');
const endIdx = code.indexOf('function renderBatchComparisonMatrix');
console.log(code.substring(mIdx, endIdx));

