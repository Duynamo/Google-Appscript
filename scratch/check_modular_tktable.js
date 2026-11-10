const fs = require('fs');
const content = fs.readFileSync('03_Project Management_Modular/JS_App.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('renderPgTkGroups') || l.includes('filterPgTk') || (l.includes('tk.name') || l.includes('task.name'))) {
    console.log((idx+1) + ': ' + l.trim().slice(0, 120));
  }
});

