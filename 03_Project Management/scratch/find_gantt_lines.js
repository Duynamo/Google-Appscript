const fs = require('fs');
const content = fs.readFileSync('03_Project Management/Index.html', 'utf8');

const startIdx = content.indexOf('function initGantt');
const renderIdx = content.indexOf('function renderGantt');
const lines = content.split('\n');

let startLine = 0;
let endLine = 0;

lines.forEach((l, i) => {
  if (l.includes('function initGantt') || l.includes('// ── GANTT') || l.includes('/* ── GANTT')) {
    console.log(`Landmark at line ${i+1}: ${l.trim().substring(0, 80)}`);
  }
});

