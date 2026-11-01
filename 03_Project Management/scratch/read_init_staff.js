const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const sIdx = code.indexOf('function initStaffWorkBreakdownTab');
console.log(code.substring(sIdx, sIdx + 1200));

