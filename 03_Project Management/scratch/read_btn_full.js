const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const idx = code.indexOf('data-i18n="ts_btn_export_jp"');
console.log(code.substring(idx - 200, idx + 100));

