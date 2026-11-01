const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

// Test task verification
const suiteCode = fs.readFileSync(path.join(root, 'scratch', 'run_full_compatibility_suite.js'), 'utf8');

// Let's create sandbox with memorySheets
const memorySheets = {
  USERS: { rows: [] },
  PROJECTS: { rows: [] },
  TAXONOMY: { rows: [] },
  TASKS: { rows: [] },
  TIMESHEET_2026: { rows: [] },
  TIMESHEET_DAILY_ROLLUP: { rows: [] }
};

function createMockSheet(name) {
  if (!memorySheets[name]) memorySheets[name] = { rows: [] };
  const obj = memorySheets[name];
  return {
    getName: () => name,
    getLastRow: () => obj.rows.length,
    getLastColumn: () => (obj.rows[0] ? obj.rows[0].length : 0),
    getDataRange: () => ({
      getValues: () => obj.rows.map(r => [...r]),
      clearContent: () => { obj.rows = []; }
    }),
    getRange: (r, c, nr, nc) => ({
      getValue: () => (obj.rows[r - 1] && obj.rows[r - 1][c - 1] !== undefined) ? obj.rows[r - 1][c - 1] : "",
      setValue: (val) => {
        while (obj.rows.length < r) obj.rows.push([]);
        while (obj.rows[r - 1].length < c) obj.rows[r - 1].push("");
        obj.rows[r - 1][c - 1] = val;
      },
      setValues: (matrix) => {
        for (let i = 0; i < matrix.length; i++) {
          const rowIdx = r - 1 + i;
          while (obj.rows.length <= rowIdx) obj.rows.push([]);
          for (let j = 0; j < matrix[i].length; j++) {
            const colIdx = c - 1 + j;
            while (obj.rows[rowIdx].length <= colIdx) obj.rows[rowIdx].push("");
            obj.rows[rowIdx][colIdx] = matrix[i][j];
          }
        }
      },
      getValues: () => {
        const res = [];
        for (let i = 0; i < nr; i++) {
          const rowIdx = r - 1 + i;
          const row = [];
          for (let j = 0; j < nc; j++) {
            const colIdx = c - 1 + j;
            row.push((obj.rows[rowIdx] && obj.rows[rowIdx][colIdx] !== undefined) ? obj.rows[rowIdx][colIdx] : "");
          }
          res.push(row);
        }
        return res;
      },
      clearContent: () => {
        for (let i = 0; i < nr; i++) {
          const rowIdx = r - 1 + i;
          if (obj.rows[rowIdx]) {
            for (let j = 0; j < nc; j++) {
              obj.rows[rowIdx][c - 1 + j] = "";
            }
          }
        }
      },
      setFontWeight: () => ({ setBackground: () => ({ setFontColor: () => {} }) })
    }),
    appendRow: (row) => {
      obj.rows.push([...row]);
    },
    deleteRow: (idx) => {
      if (idx >= 1 && idx <= obj.rows.length) {
        obj.rows.splice(idx - 1, 1);
      }
    }
  };
}

const mockSpreadsheet = {
  getSheetByName: (name) => createMockSheet(name),
  insertSheet: (name) => createMockSheet(name)
};

const mockSandbox = {
  console: console,
  Logger: { log: () => {} },
  SpreadsheetApp: {
    getActiveSpreadsheet: () => mockSpreadsheet,
    flush: () => {}
  },
  LockService: {
    getScriptLock: () => ({
      tryLock: () => true,
      releaseLock: () => {}
    })
  },
  Utilities: {
    formatDate: (d, tz, fmt) => {
      if (!(d instanceof Date)) d = new Date(d);
      const pad = n => String(n).padStart(2, '0');
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      if (fmt === "yyyyMMdd") return `${y}${m}${day}`;
      if (fmt === "yyyy-MM-dd") return `${y}-${m}-${day}`;
      if (fmt === "dd/MM/yyyy") return `${day}/${m}/${y}`;
      return `${y}-${m}-${day} 08:00:00`;
    }
  },
  CONFIG: {
    SHEET_USERS: "USERS",
    SHEET_PROJECTS: "PROJECTS",
    SHEET_TAXONOMY: "TAXONOMY",
    SHEET_TASKS: "TASKS",
    ROLES: ["Admin", "Manager", "Member"]
  },
  TIMESHEET_CONFIG: {
    ROLLUP_SHEET_NAME: "TIMESHEET_DAILY_ROLLUP",
    HEADERS_DETAIL: new Array(18).fill("H"),
    HEADERS_ROLLUP: new Array(12).fill("H")
  },
  getCurrentUser: () => ({
    email: "duyvultv@gmail.com",
    name: "Vũ Đình Duy",
    role: "Admin",
    registered: true
  }),
  ensureYearTimesheetSheet: (yr) => createMockSheet(`TIMESHEET_${yr}`),
  ensureDailyRollupSheet: () => createMockSheet("TIMESHEET_DAILY_ROLLUP"),
  getTimesheetYearSheetName: (yr) => `TIMESHEET_${yr}`
};

const seederCode = fs.readFileSync(path.join(root, 'SeederData.gs'), 'utf8');
const ctx = vm.createContext(mockSandbox);
vm.runInContext(seederCode, ctx);

const res = ctx.seedActualProjectsFromGreenTables();
console.log("Seeder status:", res.success, res.message);

// Verify TASKS
const tasks = memorySheets.TASKS.rows.slice(1);
console.log("Total seeded tasks in TASKS sheet:", tasks.length);

const p1Tasks = tasks.filter(t => t[1] === "MUR01");
const p2Tasks = tasks.filter(t => t[1] === "JJK01");
const p3Tasks = tasks.filter(t => t[1] === "AMA01");
const p4Tasks = tasks.filter(t => t[1] === "TES01");

console.log(`- MUR01 tasks: ${p1Tasks.length} (Kỳ vọng: 15)`);
console.log(`- JJK01 tasks: ${p2Tasks.length} (Kỳ vọng: 31)`);
console.log(`- AMA01 tasks: ${p3Tasks.length} (Kỳ vọng: 10)`);
console.log(`- TES01 tasks: ${p4Tasks.length} (Kỳ vọng: 12)`);

// Verify TIMESHEET_2026 Task_ID
const tsRows = memorySheets.TIMESHEET_2026.rows;
const slotsWithoutTask = tsRows.slice(1).filter(r => !r[11] || r[11] === "");
console.log("Slots without Task_ID in TIMESHEET_2026:", slotsWithoutTask.length, "(Kỳ vọng: 0)");

// Verify PROJECTS members
const pjs = memorySheets.PROJECTS.rows.slice(1);
pjs.forEach(p => {
  const mems = JSON.parse(p[10]);
  console.log(`Project [${p[0]}] members:`, mems.map(m => `${m.name} (${m.role})`).join(', '));
});
