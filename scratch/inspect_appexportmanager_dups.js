const fs = require('fs');
const content = fs.readFileSync('03_Project Management_Modular/JS_App.html', 'utf8');
const lines = content.split('\n');
console.log('Line 4580 to 4590:');
console.log(lines.slice(4575, 4590).join('\n'));
console.log('Line 6020 to 6030:');
console.log(lines.slice(6020, 6035).join('\n'));
console.log('Line 7525 to 7535:');
console.log(lines.slice(7525, 7540).join('\n'));
console.log('Line 8968 to 8978:');
console.log(lines.slice(8968, 8980).join('\n'));
console.log('End of file (last 30 lines):');
console.log(lines.slice(lines.length - 30).join('\n'));

