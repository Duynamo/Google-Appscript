const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');
const lines = content.split('\n');

const jsLines = lines.slice(2068, 9910);
console.log('JS block line count:', jsLines.length);

const sections = [];
jsLines.forEach((l, idx) => {
  const lineNum = 2069 + idx;
  const trimmed = l.trim();
  if (trimmed.startsWith('// ──') || trimmed.startsWith('/* ──') || trimmed.startsWith('// ===') || trimmed.startsWith('function ') || (trimmed.startsWith('const ') && trimmed.includes('= {'))) {
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.includes('I18N =') || trimmed.includes('PTITLES') || trimmed.includes('STATUS_I18N')) {
      sections.push({ line: lineNum, text: trimmed });
    }
  }
});

console.log('--- JS Sections / Milestones ---');
sections.forEach(s => console.log(`Line ${s.line}: ${s.text}`));

