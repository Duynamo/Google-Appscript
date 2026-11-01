const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const qIdx = code.indexOf('function setStaffQuickRange');
console.log(code.substring(qIdx, qIdx + 1000));

