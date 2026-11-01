const fs = require('fs');
const path = require('path');
const vm = require('vm');

const seederPath = path.join(__dirname, '..', 'SeederData.gs');
const code = fs.readFileSync(seederPath, 'utf8');

console.log("Checking SeederData.gs syntax...");
// 1. Static syntax check via vm.Script
try {
  new vm.Script(code);
  console.log("✅ [PASS] SeederData.gs syntax is 100% valid!");
} catch (e) {
  console.error("❌ [FAIL] Syntax error in SeederData.gs:", e);
  process.exit(1);
}

// 2. Simulate running seedActualProjectsFromGreenTables in mock GAS environment
const memorySheets = {
  USERS: { rows: [["ID","Email","Họ Tên","Vai Trò","Trạng Thái","Ngày Tạo","Ghi Chú","Link Bảng Tính","Chức Vụ"]] },
  PROJECTS: { rows: [["ID","Tên Dự Án","Mô Tả","Manager Email","Ngày Bắt Đầu","Ngày Kết Thúc","Trạng Thái","Tiến Độ %","Ngày Tạo","Tạo Bởi","Thành Viên","Ngân Sách (Giờ)"]] },
  TIMESHEET_2026: { rows: [["Log_ID","Work_Date","Time_Slot","Start_Time","End_Time","Duration_Hours","Slot_Type","Project_Code","Category_Code","Phase_Code","Discipline_Code","Work_Note","Work_Status","Staff_Code","Staff_Name","Staff_Rank","Updated_At","Updated_By"]] },
  TIMESHEET_DAILY_ROLLUP: { rows: [["Rollup_ID","Work_Date","Staff_Code","Staff_Name","Project_Code","Discipline_Code","Official_Hours","OT_Hours","Total_Hours","Work_Notes","Updated_At"]] }
};

function createMockSheet(name) {
  if (!memorySheets[name]) {
    memorySheets[name] = { rows: [["Header"]] };
  }
  const obj = memorySheets[name];
  return {
    getName: () => name,
    getLastRow: () => obj.rows.length,
    getLastColumn: () => (obj.rows[0] ? obj.rows[0].length : 1),
    getDataRange: () => ({
      getValues: () => obj.rows,
      clearContent: () => { obj.rows = []; }
    }),
    getRange: (r, c, nr, nc) => ({
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
            row.push(obj.rows[rowIdx] ? obj.rows[rowIdx][colIdx] : "");
          }
          res.push(row);
        }
        return res;
      },
      setFontWeight: function() { return this; },
      setBackground: function() { return this; },
      setFontColor: function() { return this; },
      clearContent: function() {
        for (let i = 0; i < nr; i++) {
          const rowIdx = r - 1 + i;
          if (obj.rows[rowIdx]) {
            for (let j = 0; j < nc; j++) {
              const colIdx = c - 1 + j;
              if (colIdx < obj.rows[rowIdx].length) {
                obj.rows[rowIdx][colIdx] = "";
              }
            }
          }
        }
        return this;
      }
    }),
    appendRow: (row) => {
      obj.rows.push(row);
    },
    deleteRow: (idx) => {
      obj.rows.splice(idx - 1, 1);
    }
  };
}

const sandbox = {
  CONFIG: { SHEET_USERS: "USERS", SHEET_PROJECTS: "PROJECTS" },
  TIMESHEET_CONFIG: {
    HEADERS_DETAIL: new Array(18).fill("H"),
    HEADERS_ROLLUP: new Array(12).fill("H")
  },
  Logger: { log: console.log },
  LockService: {
    getScriptLock: () => ({
      tryLock: () => true,
      releaseLock: () => {}
    })
  },
  SpreadsheetApp: {
    getActiveSpreadsheet: () => ({
      getSheetByName: (n) => createMockSheet(n),
      insertSheet: (n) => createMockSheet(n)
    }),
    flush: () => {}
  },
  Utilities: {
    formatDate: (d, tz, fmt) => "2026-10-31 15:00:00"
  },
  initSheets: () => {},
  initTimesheetCentralSheets: () => {},
  ensureYearTimesheetSheet: () => createMockSheet("TIMESHEET_2026"),
  ensureDailyRollupSheet: () => createMockSheet("TIMESHEET_DAILY_ROLLUP"),
  invalidateCache: () => {}
};

vm.createContext(sandbox);
vm.runInContext(code, sandbox);

console.log("\nExecuting seedActualProjectsFromGreenTables() in mock sandbox...");
const result = sandbox.seedActualProjectsFromGreenTables();

console.log("Result:", result);

// Verify totals
const tsRows = memorySheets.TIMESHEET_2026.rows.slice(1);
const rollupRows = memorySheets.TIMESHEET_DAILY_ROLLUP.rows.slice(1);

console.log(`\nVerifying Data Integrity:`);
console.log(`- Total slots in TIMESHEET_2026: ${tsRows.length} (Expected: 1424)`);
const totalHours = tsRows.reduce((sum, r) => sum + (Number(r[5]) || 0), 0);
console.log(`- Total hours logged: ${totalHours}h (Expected: 712.0h)`);

// Check breakdown by project
const pjs = ["MUR01", "JUJ01", "AMA01", "TES01"];
pjs.forEach(p => {
  const pRows = tsRows.filter(r => r[7] === p);
  const pHours = pRows.reduce((sum, r) => sum + (Number(r[5]) || 0), 0);
  console.log(`  * Dự án ${p}: ${pRows.length} slots = ${pHours}h`);
});

// Check Phase breakdown:
const bdRows = tsRows.filter(r => r[9] === "BD");
const ddRows = tsRows.filter(r => r[9] === "DD");
console.log(`- Phase BD: ${bdRows.length * 0.5}h (Expected: 632.0h)`);
console.log(`- Phase DD: ${ddRows.length * 0.5}h (Expected: 80.0h)`);

if (tsRows.length === 1424 && totalHours === 712.0 && bdRows.length * 0.5 === 632.0 && ddRows.length * 0.5 === 80.0) {
  console.log("\n🎉 ALL CHECKS PASSED 100%! Data seeding logic is verified and flawless!");
} else {
  console.error("❌ Discrepancy detected!");
  process.exit(1);
}

