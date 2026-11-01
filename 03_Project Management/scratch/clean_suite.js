const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const suitePath = path.join(root, 'scratch', 'run_full_compatibility_suite.js');
let suite = fs.readFileSync(suitePath, 'utf8');

// Replace the messed up TC15-18 region
const targetStart = '// TC15: Khóa bảo toàn 712.0 giờ công Nhật Bản';
const targetEnd = '// ─────────────────────────────────────────────────────────────────────────────\r\n// SUMMARY';
const targetEndLF = '// ─────────────────────────────────────────────────────────────────────────────\n// SUMMARY';

const cleanRegion = `// TC15: Khóa bảo toàn 712.0 giờ công Nhật Bản
const totalSlots = memorySheets.TIMESHEET_2026.rows.slice(1).length;
const totalHours = totalSlots * 0.5;
const murHours = memorySheets.TIMESHEET_2026.rows.filter(r => r[7] === "MUR01").length * 0.5;
const jjkHours = memorySheets.TIMESHEET_2026.rows.filter(r => r[7] === "JJK01").length * 0.5;
const amaHours = memorySheets.TIMESHEET_2026.rows.filter(r => r[7] === "AMA01").length * 0.5;
const tesHours = memorySheets.TIMESHEET_2026.rows.filter(r => r[7] === "TES01").length * 0.5;
assert("TC15", "Khóa bảo toàn 712.0 giờ công Nhật Bản (MUR: 240h, JJK: 344h, AMA: 16h, TES: 112h)",
  totalHours === 712.0 && murHours === 240.0 && jjkHours === 344.0 && amaHours === 16.0 && tesHours === 112.0,
  \`Total: \${totalHours}h (MUR: \${murHours}h, JJK: \${jjkHours}h, AMA: \${amaHours}h, TES: \${tesHours}h)\`
);

// TC16: Xác thực Bảng TASKS nạp đủ 68 nhiệm vụ chuẩn WBS 4 dự án
const allTasks = memorySheets.TASKS.rows.slice(1);
const murTasks = allTasks.filter(t => t[1] === "MUR01");
const jjkTasks = allTasks.filter(t => t[1] === "JJK01");
const amaTasks = allTasks.filter(t => t[1] === "AMA01");
const tesTasks = allTasks.filter(t => t[1] === "TES01");
assert("TC16", "Đồng bộ 68 Nhiệm Vụ (TASKS) chuẩn: MUR(15), JJK(31), AMA(10), TES(12)",
  allTasks.length === 68 && murTasks.length === 15 && jjkTasks.length === 31 && amaTasks.length === 10 && tesTasks.length === 12,
  \`Tổng Tasks: \${allTasks.length} | MUR: \${murTasks.length}, JJK: \${jjkTasks.length}, AMA: \${amaTasks.length}, TES: \${tesTasks.length}\`
);

// TC17: Liên kết 2 chiều giữa TIMESHEET_2026 (Task_ID) và Bảng TASKS
const tsRowsAll = memorySheets.TIMESHEET_2026.rows.slice(1);
const slotsWithoutTask = tsRowsAll.filter(r => !r[11] || r[11] === "");
assert("TC17", "Toàn vẹn liên kết 2 chiều: 100% (1,424 slots) đều có Task_ID trỏ về TASKS",
  tsRowsAll.length === 1424 && slotsWithoutTask.length === 0,
  \`Slots thiếu Task_ID: \${slotsWithoutTask.length} / \${tsRowsAll.length}\`
);

// TC18: Khử lỗi avatar '? undefined' thành viên dự án
const pjRows = memorySheets.PROJECTS.rows.slice(1);
const invalidMemberPj = pjRows.filter(p => {
  try {
    const mems = JSON.parse(p[10]);
    return !Array.isArray(mems) || mems.length === 0 || mems.some(m => !m.name || m.name === "undefined");
  } catch(e) {
    return true;
  }
});
assert("TC18", "Cấu trúc Thành viên Dự án chuẩn (Ngăn ngừa lỗi avatar '? undefined')",
  invalidMemberPj.length === 0,
  \`Dự án thành viên lỗi: \${invalidMemberPj.length}\`
);

`;

const sIdx = suite.indexOf(targetStart);
let eIdx = suite.indexOf(targetEnd);
if (eIdx === -1) eIdx = suite.indexOf(targetEndLF);

if (sIdx !== -1 && eIdx !== -1) {
  suite = suite.substring(0, sIdx) + cleanRegion + suite.substring(eIdx);
  // Also update total test count to 18
  suite = suite.replace(/\$\{passCount\}\/15/g, '${passCount}/18');
  suite = suite.replace(/passCount\/15/g, 'passCount/18');
  fs.writeFileSync(suitePath, suite, 'utf8');
  console.log('✅ Cleaned up TC15-TC18 in run_full_compatibility_suite.js');
} else {
  console.error('❌ Failed to locate target bounds', { sIdx, eIdx });
}

