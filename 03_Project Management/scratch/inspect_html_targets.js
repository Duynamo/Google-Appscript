const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
const html = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Check Pane 2 HTML around project label
const p2Idx = html.indexOf('id="ts-pane-project"');
console.log('ts-pane-project found at:', p2Idx);
if (p2Idx !== -1) {
  console.log('Snippet in ts-pane-project:');
  console.log(html.substring(p2Idx, p2Idx + 1500));
}

// 2. Check Table 1 & Table 2 headers in ts-pane-project
const t1Idx = html.indexOf('ts-rep-tbody-members');
if (t1Idx !== -1) {
  console.log('Snippet around Table 1:');
  console.log(html.substring(t1Idx - 500, t1Idx + 200));
}

// 3. Check setLanguage timesheet block
const slIdx = html.indexOf('setLanguage(');
if (slIdx !== -1) {
  const tsBranchIdx = html.indexOf('timesheet', slIdx);
  console.log('Snippet around timesheet in setLanguage:');
  console.log(html.substring(tsBranchIdx - 50, tsBranchIdx + 250));
}

