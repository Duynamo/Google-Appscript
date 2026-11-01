const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const seederPath = path.join(root, 'SeederData.gs');
let seeder = fs.readFileSync(seederPath, 'utf8');

const targetStart = 'function seedActualProjectsFromGreenTables() {\r\n  const lock = LockService.getScriptLock();';
const targetStartLF = 'function seedActualProjectsFromGreenTables() {\n  const lock = LockService.getScriptLock();';

const replacement = `function seedActualProjectsFromGreenTables() {
  const now = new Date();
  const nowStr = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
  const lock = LockService.getScriptLock();`;

let startIdx = seeder.indexOf(targetStart);
let isCRLF = true;
if (startIdx === -1) {
  startIdx = seeder.indexOf(targetStartLF);
  isCRLF = false;
}

if (startIdx !== -1) {
  const matchLen = isCRLF ? targetStart.length : targetStartLF.length;
  seeder = seeder.substring(0, startIdx) + replacement + seeder.substring(startIdx + matchLen);
  // remove the later declaration of const nowStr
  seeder = seeder.replace(
    'const nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");',
    '// nowStr already initialized at top'
  );
  fs.writeFileSync(seederPath, seeder, 'utf8');
  console.log('✅ Moved nowStr initialization to top of seedActualProjectsFromGreenTables');
} else {
  console.error('❌ Could not locate start of seedActualProjectsFromGreenTables');
}

