const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'Index.html');
const lines = fs.readFileSync(srcPath, 'utf8').split('\n');

for (let i = 855; i < 1025; i++) {
  if (lines[i].includes('<!-- ══') || lines[i].includes('id="page-')) {
    console.log(`Line ${i+1}: ${lines[i].trim()}`);
  }
}

