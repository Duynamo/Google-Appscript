const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
const html = fs.readFileSync(indexHtmlPath, 'utf8');

// Find I18N definition
const viIdx = html.indexOf('const I18N = {');
console.log('I18N index:', viIdx);

const enIdx = html.indexOf('  en: {', viIdx);
console.log('en index:', enIdx);

const jaIdx = html.indexOf('  ja: {', enIdx);
console.log('ja index:', jaIdx);

// Look around end of en:
const enEndIdx = html.indexOf('  },', enIdx);
console.log('en end index:', enEndIdx);
console.log('Snippet at end of en:', JSON.stringify(html.substring(enEndIdx - 100, enEndIdx + 20)));

// Look around end of ja:
const jaEndIdx = html.indexOf('  }\n};', jaIdx) !== -1 ? html.indexOf('  }\n};', jaIdx) : html.indexOf('  }\r\n};', jaIdx);
console.log('ja end index:', jaEndIdx);
if (jaEndIdx !== -1) {
  console.log('Snippet at end of ja:', JSON.stringify(html.substring(jaEndIdx - 100, jaEndIdx + 20)));
} else {
  const nextClosing = html.indexOf('  }', jaIdx);
  console.log('next closing in ja:', nextClosing);
  console.log('Snippet:', JSON.stringify(html.substring(nextClosing - 100, nextClosing + 20)));
}

