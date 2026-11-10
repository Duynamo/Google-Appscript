const fs = require('fs');
const content = fs.readFileSync('03_Project Management/Taxonomyapi.gs', 'utf8');
const rx = /\{\s*id:\s*"DISC_[^"]+",\s*type:\s*"DISCIPLINE",\s*code:\s*"([^"]+)",\s*name_vi:\s*"([^"]+)",\s*name_en:\s*"([^"]+)",\s*name_jp:\s*"([^"]+)"/g;
let match;
const dict = {};
while ((match = rx.exec(content)) !== null) {
  dict[match[1]] = { vi: match[2], en: match[3], ja: match[4] };
}
console.log('Total disciplines found:', Object.keys(dict).length);
fs.writeFileSync('scratch/all_disciplines.json', JSON.stringify(dict, null, 2), 'utf8');
console.log('Saved to scratch/all_disciplines.json');

