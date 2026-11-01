const fs = require('fs');
const content = fs.readFileSync('03_Project Management/Index.html', 'utf8');
const lines = content.split('\n');

console.log('Lines 4950 - 5050:');
for (let i = 4950; i < 5350 && i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith('function ') || l.startsWith('// ──') || l.startsWith('/* ──')) {
    console.log(`Line ${i+1}: ${l.trim().substring(0, 80)}`);
  }
}

