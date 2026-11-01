const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');
const lines = content.split('\n');

console.log('Total lines in Index.html:', lines.length);

const structure = [];
let inStyle = false;
let inScript = false;
let styleStart = 0;
let scriptStart = 0;

lines.forEach((l, idx) => {
  const lineNum = idx + 1;
  const trimmed = l.trim();
  
  if (trimmed.startsWith('<style')) {
    inStyle = true;
    styleStart = lineNum;
  } else if (trimmed.endsWith('</style>')) {
    structure.push({ type: 'CSS Style Block', start: styleStart, end: lineNum, lines: lineNum - styleStart + 1 });
    inStyle = false;
  }
  
  if (trimmed.startsWith('<script') && !trimmed.includes('src=')) {
    inScript = true;
    scriptStart = lineNum;
  } else if (trimmed.endsWith('</script>')) {
    structure.push({ type: 'JS Script Block', start: scriptStart, end: lineNum, lines: lineNum - scriptStart + 1 });
    inScript = false;
  }
  
  if (trimmed.includes('<!-- PAGE:') || trimmed.includes('<!-- MODAL') || trimmed.includes('<!-- HEADER') || trimmed.includes('<!-- SIDEBAR') || trimmed.includes('// ──') || trimmed.includes('/* ──')) {
    structure.push({ type: 'Marker', line: lineNum, text: trimmed });
  }
});

console.log('--- Structure Summary ---');
structure.forEach(s => {
  if (s.type === 'CSS Style Block' || s.type === 'JS Script Block') {
    console.log(`[${s.type}] Lines ${s.start} - ${s.end} (${s.lines.toLocaleString()} lines)`);
  } else if (s.type === 'Marker') {
    console.log(`  Line ${s.line}: ${s.text}`);
  }
});

