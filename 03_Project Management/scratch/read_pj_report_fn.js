const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const pIdx = code.indexOf('function loadProjectActualTimeReport');
console.log(code.substring(pIdx, pIdx + 1500));

