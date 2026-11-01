const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const fnNames = [
  'initProjectActualTimeTab',
  'loadProjectActualTimeReport',
  'renderProjectActualTimeReport',
  'initStaffWorkBreakdownTab',
  'loadStaffWorkBreakdown',
  'renderStaffWorkBreakdown',
  'loadBatchComparisonMatrix',
  'renderBatchComparisonMatrix',
  'openTsDrilldownModal',
  'switchTsSubTab'
];

fnNames.forEach(fn => {
  const idx = code.indexOf('function ' + fn);
  if (idx !== -1) {
    console.log(`=== ${fn} (found at ${idx}) ===`);
    console.log(code.substring(idx, idx + 400));
  } else {
    console.log(`=== ${fn} NOT FOUND ===`);
  }
});

