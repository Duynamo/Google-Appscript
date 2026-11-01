const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'Index.html');
const lines = fs.readFileSync(srcPath, 'utf8').split('\n');

console.log('=== Lines 538 - 570 ===');
for (let i = 537; i < 570; i++) console.log(`${i+1}: ${lines[i]}`);

console.log('\n=== Lines 615 - 640 ===');
for (let i = 614; i < 640; i++) console.log(`${i+1}: ${lines[i]}`);

console.log('\n=== Lines 855 - 925 ===');
for (let i = 854; i < 925; i++) console.log(`${i+1}: ${lines[i]}`);

console.log('\n=== Lines 1290 - 1320 ===');
for (let i = 1289; i < 1320; i++) console.log(`${i+1}: ${lines[i]}`);

console.log('\n=== Lines 2050 - 2075 ===');
for (let i = 2049; i < 2075; i++) console.log(`${i+1}: ${lines[i]}`);

