const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (f.endsWith('.gs') || f.endsWith('.html')) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    if (content.includes('onExportProjectReportClick')) {
      console.log(`Found in ${f}`);
    }
  }
});

