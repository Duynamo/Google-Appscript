const fs = require('fs');
const content = fs.readFileSync('03_Project Management_Modular/Page_Gantt.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('t.name') || l.includes('gantt-tk-nm') || l.includes('gantt-bar') || l.includes('deadline-flag')) {
    console.log((idx+1) + ': ' + l.trim().slice(0, 120));
  }
});

