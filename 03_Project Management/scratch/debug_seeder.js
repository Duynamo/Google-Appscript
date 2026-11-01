const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

// Read sandbox setup from run_full_compatibility_suite.js
const suite = fs.readFileSync(path.join(root, 'scratch', 'run_full_compatibility_suite.js'), 'utf8');

// Extract mockSandbox and VM runner
const seederCode = fs.readFileSync(path.join(root, 'SeederData.gs'), 'utf8');

// Let's create an isolated VM and execute seedActualProjectsFromGreenTables with Logger
let logs = [];
const customSandbox = {
  console: console,
  Logger: { log: (...args) => logs.push(args.join(' ')) },
  SpreadsheetApp: {
    getActiveSpreadsheet: () => ({
      getSheetByName: (name) => ({
        getLastRow: () => 1,
        getLastColumn: () => 12,
        getDataRange: () => ({
          getValues: () => [["ID","Tên"]],
          clearContent: () => {}
        }),
        getRange: () => ({
          getValues: () => [["ID","Tên"]],
          setValues: () => {},
          clearContent: () => {},
          setFontWeight: () => ({ setBackground: () => ({ setFontColor: () => {} }) }),
          setValue: () => {}
        }),
        appendRow: () => {}
      }),
      insertSheet: (name) => ({
        appendRow: () => {},
        getRange: () => ({
          setFontWeight: () => ({ setBackground: () => ({ setFontColor: () => {} }) })
        })
      })
    }),
    flush: () => {}
  },
  LockService: {
    getScriptLock: () => ({
      tryLock: () => true,
      releaseLock: () => {}
    })
  },
  Utilities: {
    formatDate: () => "2026-10-31"
  },
  CONFIG: {
    SHEET_USERS: "USERS",
    SHEET_PROJECTS: "PROJECTS",
    SHEET_TAXONOMY: "TAXONOMY",
    SHEET_TASKS: "TASKS"
  },
  TIMESHEET_CONFIG: {
    ROLLUP_SHEET_NAME: "TIMESHEET_DAILY_ROLLUP",
    HEADERS_ROLLUP: new Array(12).fill("H")
  },
  ensureYearTimesheetSheet: () => ({
    getLastRow: () => 1,
    getRange: () => ({ setValues: () => {} })
  }),
  ensureDailyRollupSheet: () => ({
    getLastRow: () => 1,
    getRange: () => ({ setValues: () => {} })
  })
};

const ctx = vm.createContext(customSandbox);
vm.runInContext(seederCode, ctx);

const res = ctx.seedActualProjectsFromGreenTables();
console.log("Seeder Result:", res);
console.log("Logs:", logs);

