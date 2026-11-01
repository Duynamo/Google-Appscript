const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const rIdx = code.indexOf('function renderProjectActualTimeReport');
console.log(code.substring(rIdx, rIdx + 3000));

