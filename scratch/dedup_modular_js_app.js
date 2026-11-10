const fs = require('fs');
const idxContent = fs.readFileSync('03_Project Management/Index.html', 'utf8');

// Extract AppExportManager from Index.html
const startMarker = '// ═══════════════════════════════════════════════════════════\r\n//  APP EXPORT MANAGER (PDF & EXCEL MULTI-FORMAT REPORTING)';
const endMarker = 'window.openExportReportModal = openExportReportModal;';

let expStart = idxContent.indexOf('//  APP EXPORT MANAGER (PDF & EXCEL MULTI-FORMAT REPORTING)');
if (expStart === -1) {
  console.error('Start marker not found in Index.html');
  process.exit(1);
}
// rewind to previous line
expStart = idxContent.lastIndexOf('// ═══', expStart);

let expEnd = idxContent.indexOf(endMarker, expStart);
if (expEnd === -1) {
  console.error('End marker not found in Index.html');
  process.exit(1);
}
expEnd += endMarker.length;

const exportManagerCode = idxContent.slice(expStart, expEnd);
console.log('Extracted ExportManager from Index.html, length:', exportManagerCode.length);

// Now in JS_App.html:
let jsApp = fs.readFileSync('03_Project Management_Modular/JS_App.html', 'utf8');

let jsAppExpStart = jsApp.indexOf('//  APP EXPORT MANAGER (PDF & EXCEL MULTI-FORMAT REPORTING)');
if (jsAppExpStart === -1) {
  console.error('Start marker not found in JS_App.html');
  process.exit(1);
}
jsAppExpStart = jsApp.lastIndexOf('// ═══', jsAppExpStart);

// The base part of JS_App.html before any ExportManager
const jsAppBase = jsApp.slice(0, jsAppExpStart).trim();

// Assemble clean JS_App.html
const cleanJsApp = jsAppBase + '\n\n' + exportManagerCode + '\n\n</script>\n';
fs.writeFileSync('03_Project Management_Modular/JS_App.html', cleanJsApp, 'utf8');
console.log('JS_App.html cleaned and unified with Index.html! New length:', cleanJsApp.length);

