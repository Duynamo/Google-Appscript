const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
const html = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('Has ts_subtab_entry in EN:', html.includes('ts_subtab_entry: "Detailed Timesheet (30m)"'));
console.log('Has ts_subtab_entry in JA:', html.includes('ts_subtab_entry: "詳細工数入力 (30分)"'));
console.log('Has ts_kpi_lifetime_hours in JA:', html.includes('ts_kpi_lifetime_hours: "累計総工数 (全期間)"'));

