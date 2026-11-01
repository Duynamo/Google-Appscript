const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'Index.html');
const srcHtml = fs.readFileSync(srcFile, 'utf8');

const optIdx = srcHtml.indexOf('// ── Optimistic UI helpers ──');
console.log(srcHtml.substring(optIdx, optIdx + 1200));

