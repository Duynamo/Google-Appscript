const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir);

let totalLines = 0;
let totalNonEmptyLines = 0;
const details = [];

files.forEach(f => {
  const fullPath = path.join(dir, f);
  const stat = fs.statSync(fullPath);
  if (stat.isFile() && !f.endsWith('.md')) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    const lineCount = lines.length;
    const nonEmptyCount = lines.filter(l => l.trim().length > 0).length;
    totalLines += lineCount;
    totalNonEmptyLines += nonEmptyCount;
    details.push({ file: f, lines: lineCount, nonEmpty: nonEmptyCount, size: stat.size });
  }
});

details.sort((a, b) => b.lines - a.lines);

console.log('Production Files in 03_Project Management (excluding .md):');
details.forEach(d => {
  console.log(`  - ${d.file}: ${d.lines.toLocaleString()} dòng (Thực tế không rỗng: ${d.nonEmpty.toLocaleString()} dòng, ${(d.size/1024).toFixed(1)} KB)`);
});
console.log(`\nTỔNG CỘNG: ${totalLines.toLocaleString()} dòng code (${totalNonEmptyLines.toLocaleString()} dòng thực tế có nội dung)`);

