const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const idx = code.indexOf('Nghiệm Thu');
if (idx !== -1) {
  console.log(code.substring(idx - 100, idx + 200));
}

