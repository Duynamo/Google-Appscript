const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const suitePath = path.join(root, 'scratch', 'run_full_compatibility_suite.js');
let suite = fs.readFileSync(suitePath, 'utf8');

const targetEndTest = 'assert("TC15", "Khóa bảo toàn 712.0 giờ công Nhật Bản (MUR: 240h, JJK: 344h, AMA: 16h, TES: 112h)",';

const newTests = `// TC16: Xác thực Bảng TASKS nạp đủ 68 nhiệm vụ chuẩn WBS 4 dự án
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

// Find where TC15 finishes
const tc15Idx = suite.indexOf(targetEndTest);
const nextLineIdx = suite.indexOf('\n', suite.indexOf('\n', tc15Idx) + 1);

suite = suite.substring(0, nextLineIdx + 1) + '\n' + newTests + suite.substring(nextLineIdx + 1);
fs.writeFileSync(suitePath, suite, 'utf8');
console.log('✅ Added TC16, TC17, TC18 to run_full_compatibility_suite.js');

