const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'Index.html');
const lines = fs.readFileSync(srcPath, 'utf8').split('\n');

for (let i = 8400; i < 8430; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

