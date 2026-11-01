const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const mIdx = code.indexOf('id="ts-pane-matrix"');
console.log(code.substring(mIdx, mIdx + 2000));

