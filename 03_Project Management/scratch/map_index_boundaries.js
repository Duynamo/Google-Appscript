const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'Index.html');
const content = fs.readFileSync(srcPath, 'utf8');
const lines = content.split('\n');

console.log('Total lines in Index.html:', lines.length);

// 1. CSS block
const cssStart = lines.findIndex(l => l.includes('<style>'));
const cssEnd = lines.findIndex(l => l.includes('</style>'));
console.log(`CSS block: lines ${cssStart + 1} to ${cssEnd + 1} (${cssEnd - cssStart + 1} lines)`);

// 2. HTML Markup landmark searches
function findLine(str, startFrom = 0) {
  for (let i = startFrom; i < lines.length; i++) {
    if (lines[i].includes(str)) return i + 1;
  }
  return -1;
}

console.log('--- HTML Landmarks ---');
console.log('Body start:', findLine('<body'));
console.log('Sidebar start:', findLine('<aside class="sb"'));
console.log('Main start:', findLine('<main class="main">'));
console.log('Topbar start:', findLine('<header class="tb">'));
console.log('Page Dashboard:', findLine('id="page-dashboard"'));
console.log('Page Gantt:', findLine('id="page-gantt"'));
console.log('Page Analytics:', findLine('id="page-analytics"'));
console.log('Page Projects:', findLine('id="page-projects"'));
console.log('Page Tasks:', findLine('id="page-tasks"'));
console.log('Page Timesheet:', findLine('id="page-timesheet"'));
console.log('Page Users:', findLine('id="page-users"'));
console.log('Page Taxonomy:', findLine('id="page-taxonomy"'));
console.log('Page Log:', findLine('id="page-log"'));
console.log('Modals start:', findLine('id="m-project"'));
console.log('Script start:', findLine('<script>'));

// 3. JS Landmarks
const scriptStart = findLine('<script>');
console.log('\n--- JS Landmarks ---');
console.log('I18N start:', findLine('const I18N = {', scriptStart));
console.log('STATUS_I18N start:', findLine('const STATUS_I18N = {', scriptStart));
console.log('S state start:', findLine('const S = {', scriptStart));
console.log('initApp start:', findLine('function initApp()', scriptStart));
console.log('Gantt JS start:', findLine('function initGanttDates()', scriptStart));
console.log('Gantt JS end / Projects JS start:', findLine('function loadPgPj()', scriptStart));
console.log('Timesheet JS start:', findLine('// ── BATCH LEGACY TASK STANDARDIZATION TOOL ──', scriptStart));
console.log('Timesheet JS actual start:', findLine('// ── Multi-level Clipboard Copy/Paste Engine', scriptStart));
console.log('Timesheet subtab 2 start:', findLine('// ── 1. SUB-TAB 2: PROJECT ACTUAL TIME REPORT ──', scriptStart));
console.log('Script end:', lines.length - 1);

