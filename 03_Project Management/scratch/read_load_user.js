const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const idx = html.indexOf('function loadPgUsr');
console.log(html.substring(idx, idx + 1200));

