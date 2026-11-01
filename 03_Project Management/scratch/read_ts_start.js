const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'Index.html');
const lines = fs.readFileSync(srcPath, 'utf8').split('\n');

for (let i = 7900; i < lines.length; i++) {
  if (lines[i].includes('// ──') || lines[i].includes('function renderTimesheet') || lines[i].includes('function initTimesheet')) {
    console.log(`Line ${i+1}: ${lines[i].trim()}`);
  }
}

