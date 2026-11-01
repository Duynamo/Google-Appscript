const fs = require('fs');
const content = fs.readFileSync('03_Project Management/Timesheetapi.gs', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('openById') || l.includes('openByUrl')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});

