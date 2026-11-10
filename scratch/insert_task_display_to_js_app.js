const fs = require('fs');
let jsApp = fs.readFileSync('03_Project Management_Modular/JS_App.html', 'utf8');

// Read CODE_INJECTION from scratch/apply_task_name_standard.js
const applyScript = fs.readFileSync('scratch/apply_task_name_standard.js', 'utf8');
const startCode = applyScript.indexOf('const CODE_INJECTION = `') + 'const CODE_INJECTION = `'.length;
const endCode = applyScript.indexOf('`;\n\nconst NEW_ON_TASK_TAXONOMY_CHANGE');
const codeInjection = applyScript.slice(startCode, endCode);

// Find insertion point in JS_App.html: after _displayNameSingle
const target = `  function _displayNameSingle(v) {
    if (!v) return '';
    const m = (S.members || []).find(x =>
      (x.email && x.email.toLowerCase() === v.toLowerCase()) ||
      (x.name && x.name.toLowerCase() === v.toLowerCase())
    );
    if (m) return m.name;
    if (v.includes('@')) return v.split('@')[0];
    return v;
  }`;

// Handle CRLF in target
const targetCRLF = target.replace(/\n/g, '\r\n');

if (jsApp.includes(targetCRLF)) {
  jsApp = jsApp.replace(targetCRLF, targetCRLF + '\r\n' + codeInjection.replace(/\n/g, '\r\n'));
  console.log('Successfully inserted into JS_App.html (CRLF mode)');
} else if (jsApp.includes(target)) {
  jsApp = jsApp.replace(target, target + '\n' + codeInjection);
  console.log('Successfully inserted into JS_App.html (LF mode)');
} else {
  console.error('Target not found in JS_App.html!');
}

fs.writeFileSync('03_Project Management_Modular/JS_App.html', jsApp, 'utf8');
console.log('JS_App.html updated!');

