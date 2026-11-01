const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// Đọc SeederData.gs để trích xuất logic
const seederCode = fs.readFileSync(path.join(root, 'SeederData.gs'), 'utf8');

console.log("SeederCode length:", seederCode.length);
