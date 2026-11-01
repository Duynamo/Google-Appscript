const fs = require('fs');
const path = require('path');

const modDir = path.join(__dirname, '..', '..', '03_Project Management_Modular');
const files = [
  'Index.html',
  'App_Styles.html',
  'JS_I18n.html',
  'Page_Projects_Tasks.html',
  'Page_Gantt.html',
  'Page_Timesheet.html',
  'JS_Timesheet.html',
  'Page_Taxonomy_Log.html',
  'JS_App.html'
];

files.forEach(f => {
  const content = fs.readFileSync(path.join(modDir, f), 'utf8');
  const openCount = (content.match(/<div[\s>]/gi) || []).length;
  const closeCount = (content.match(/<\/div>/gi) || []).length;
  console.log(`${f}: open=${openCount}, close=${closeCount}, diff=${openCount - closeCount}`);
});

