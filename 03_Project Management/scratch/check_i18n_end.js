const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
const html = fs.readFileSync(indexHtmlPath, 'utf8');

const start = html.indexOf('const I18N = {');
const end = html.indexOf('const STATE', start);
console.log('Start:', start, 'End:', end);
console.log('End snippet:', JSON.stringify(html.substring(end - 30, end + 30)));

