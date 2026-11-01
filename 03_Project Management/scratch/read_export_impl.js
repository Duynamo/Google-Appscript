const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

console.log(code.substring(479429 - 1500, 479429 + 300));

