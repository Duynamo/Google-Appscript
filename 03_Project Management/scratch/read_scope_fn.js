const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const idx = code.indexOf('function updateProjectScopeDropdownI18n');
console.log(code.substring(idx, idx + 800));

