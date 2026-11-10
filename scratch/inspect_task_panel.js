const fs = require('fs');
const content = fs.readFileSync('03_Project Management/Index.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('id="task-panel"') || l.includes("id='task-panel'")) {
    console.log(lines.slice(idx, idx + 35).join('\n'));
  }
});

