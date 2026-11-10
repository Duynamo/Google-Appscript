const fs = require('fs');

function checkFile(filePath) {
  console.log('Checking:', filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let index = 0;
  while ((match = scriptRegex.exec(content)) !== null) {
    index++;
    const attrs = match[1];
    const code = match[2];
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      console.log('Script ' + index + ' external: ' + srcMatch[1]);
      continue;
    }
    console.log('Script ' + index + ' inline code length: ' + code.length);
    try {
      new Function(code);
      console.log('Script ' + index + ' syntax: OK');
    } catch (err) {
      console.error('Script ' + index + ' syntax ERROR:', err.message);
    }
  }
}

checkFile('03_Project Management/Index.html');
console.log('--- Checking Modular ---');
const modFiles = fs.readdirSync('03_Project Management_Modular');
modFiles.filter(f => f.endsWith('.html')).forEach(f => {
  checkFile('03_Project Management_Modular/' + f);
});
