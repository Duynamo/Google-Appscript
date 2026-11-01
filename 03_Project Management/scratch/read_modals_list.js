const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'Index.html');
const lines = fs.readFileSync(srcPath, 'utf8').split('\n');

for (let i = 1310; i < 2070; i++) {
  if (lines[i].includes('<!-- ══ MODAL') || lines[i].includes('<!-- ══ SLIDE') || lines[i].includes('class="ov"')) {
    console.log(`Line ${i+1}: ${lines[i].trim()}`);
  }
}

