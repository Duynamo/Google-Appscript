const fs = require('fs');
const path = require('path');

const suitePath = path.join(__dirname, 'run_full_compatibility_suite.js');
let content = fs.readFileSync(suitePath, 'utf8');

const target = `  ensureDailyRollupSheet: () => createMockSheet("TIMESHEET_DAILY_ROLLUP"),
  getTimesheetYearSheetName: (yr) => \`TIMESHEET_\${yr}\`
};`;

const replacement = `  ensureDailyRollupSheet: () => createMockSheet("TIMESHEET_DAILY_ROLLUP"),
  getTimesheetYearSheetName: (yr) => \`TIMESHEET_\${yr}\`,
  getSheetData: (sheetName) => createMockSheet(sheetName).getDataRange().getValues(),
  getPermissionMatrixInternal: () => [],
  createNewStaffSpreadsheet: () => ({ success: true, sheetUrl: "https://sheet.url/mock" })
};`;

content = content.replace(target, replacement);
fs.writeFileSync(suitePath, content, 'utf8');
console.log('✅ Updated mockSandbox in run_full_compatibility_suite.js');

