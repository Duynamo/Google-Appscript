const fs = require('fs');
const path = require('path');

// Test the modular directory by requiring run_full_compatibility_suite logic
// but reading .gs from 03_Project Management_Modular
const modDir = path.join(__dirname, '..', '..', '03_Project Management_Modular');
const gsFiles = ['Code.gs', 'Timesheetapi.gs', 'Taxonomyapi.gs', 'Projectsapi.gs', 'Taskapi.gs', 'Userapi.gs', 'SeederData.gs', 'Helpers.gs'];

console.log('--- KIỂM TRA TOÀN VẸN CÁC FILE BACKEND .GS TRONG THƯ MỤC MODULAR ---');
gsFiles.forEach(f => {
  const fp = path.join(modDir, f);
  assert(fs.existsSync(fp), `Missing .gs file: ${f}`);
  const content = fs.readFileSync(fp, 'utf8');
  console.log(`✅ [PASS] ${f}: ${content.split('\n').length} dòng, ${(content.length / 1024).toFixed(1)} KB`);
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Now execute run_full_compatibility_suite.js to confirm all 20 cases still pass
const suitePath = path.join(__dirname, 'run_full_compatibility_suite.js');
const { execSync } = require('child_process');
const output = execSync(`node "${suitePath}"`, { encoding: 'utf8' });
console.log('\n--- KẾT QUẢ RUN FULL COMPATIBILITY SUITE ---');
console.log(output);

