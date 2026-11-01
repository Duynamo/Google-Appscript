const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'Index.html');
const lines = fs.readFileSync(srcPath, 'utf8').split('\n');

for (let i = 8300; i < 8700; i++) {
  if (lines[i].includes('// ══') || lines[i].includes('TIMESHEET') || lines[i].includes('timesheet')) {
    console.log(`Line ${i+1}: ${lines[i].trim()}`);
  }
}

