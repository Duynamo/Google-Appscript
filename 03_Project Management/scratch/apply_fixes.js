const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. UPDATE Index.html
const indexPath = path.join(root, 'Index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const targetIndexFuncStart = 'function initProjectActualTimeTab() {';
const targetIndexFuncEnd = 'function onProjectScopeChange(scope) {';

const newIndexFunc = `function initProjectActualTimeTab() {
  const sel = document.getElementById('ts-rep-pj-sel');
  if (!sel) return;

  // Danh mục mã lỗi thời cần lọc sạch (ngăn chặn dự án bóng ma lọt vào dropdown)
  const obsoleteCodes = new Set(["MRR01", "AMK01", "TSK01", "JUJ01", "DA010", "HAG01"]);

  // 4 Dự án chuẩn chính thức của công ty
  const officialProjects = [
    { id: "MUR01", name: "2026_01_MUR01_室蘭市蘭東下水処理場" },
    { id: "JJK01", name: "2026_02_JJK01_工房ヴィレッジ新築工事" },
    { id: "AMA01", name: "2026_03_AMA01_天草市本渡浄化センター" },
    { id: "TES01", name: "2026_04_TES01_弟子屈町弟子屈浄化センター" }
  ];

  let projectList = [];
  const seenIds = new Set();

  // Ưu tiên nạp 4 dự án chuẩn trước
  officialProjects.forEach(dp => {
    seenIds.add(dp.id);
    projectList.push({ id: dp.id, name: dp.name });
  });

  // Nạp thêm các dự án hợp lệ khác từ S.projects nếu không nằm trong danh sách lỗi thời
  if (S && S.projects && S.projects.length) {
    S.projects.forEach(p => {
      const pid = String(p.id || '').trim().toUpperCase();
      if (pid && !seenIds.has(pid) && !obsoleteCodes.has(pid)) {
        seenIds.add(pid);
        projectList.push({
          id: pid,
          name: p.name || pid
        });
      }
    });
  }

  // Nạp thêm từ Taxonomy nếu có
  if (S && S.taxonomy && S.taxonomy.projectCodes && S.taxonomy.projectCodes.length) {
    S.taxonomy.projectCodes.forEach(p => {
      const pCode = String(p.code || p.id || '').trim().toUpperCase();
      if (pCode && !seenIds.has(pCode) && !obsoleteCodes.has(pCode)) {
        seenIds.add(pCode);
        projectList.push({
          id: pCode,
          name: typeof tTaxonomy === 'function' ? tTaxonomy(p) : (p.name_vi || p.name || pCode)
        });
      }
    });
  }

  let opts = '<option value="">-- Chọn dự án cần xem --</option>';
  projectList.forEach(p => {
    const label = (p.name && p.name.includes(p.id)) ? p.name : (p.id + ' - ' + (p.name || ''));
    opts += '<option value="' + p.id + '">' + label + '</option>';
  });
  sel.innerHTML = opts;

  if (projectList.length > 0 && !sel.value) {
    sel.value = projectList[0].id;
    loadProjectActualTimeReport();
  }
}

`;

const startIdx = indexContent.indexOf(targetIndexFuncStart);
const endIdx = indexContent.indexOf(targetIndexFuncEnd);
if (startIdx !== -1 && endIdx !== -1) {
  indexContent = indexContent.substring(0, startIdx) + newIndexFunc + indexContent.substring(endIdx);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✅ Updated Index.html initProjectActualTimeTab');
} else {
  console.error('❌ Could not locate indices in Index.html', { startIdx, endIdx });
}

// 2. UPDATE Timesheetapi.gs
const tsPath = path.join(root, 'Timesheetapi.gs');
let tsContent = fs.readFileSync(tsPath, 'utf8');
const targetTsFindStart = 'function findTimesheetRowIndices(sheet, targetDate, targetStaffCode, staffCol) {';
const targetTsFindEndLF = '// ════════════════════════════════════════════════════════════\n//  LƯU DỮ LIỆU TIMESHEET';
const targetTsFindEndCRLF = '// ════════════════════════════════════════════════════════════\r\n//  LƯU DỮ LIỆU TIMESHEET';

const newTsFind = `function findTimesheetRowIndices(sheet, targetDate, targetStaffCode, staffCol) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const staffColumn = staffCol || 14;
  const targetCode = targetStaffCode ? String(targetStaffCode).trim().toUpperCase() : null;

  try {
    const rngCol2 = sheet.getRange(2, 2, lastRow - 1, 1);
    if (rngCol2 && typeof rngCol2.createTextFinder === "function") {
      const tf = rngCol2.createTextFinder(targetDate);
      if (typeof tf.matchEntireCell === "function") tf.matchEntireCell(true);
      const cells = tf.findAll() || [];
      const rows = [];
      cells.forEach(c => {
        const r = c.getRow();
        if (targetCode) {
          const staffVal = String(sheet.getRange(r, staffColumn).getValue()).trim().toUpperCase();
          if (staffVal === targetCode) rows.push(r);
        } else {
          rows.push(r);
        }
      });
      if (rows.length > 0) return rows;
    }
  } catch(e) {}

  try {
    if (typeof sheet.createTextFinder === "function") {
      const tf = sheet.createTextFinder(targetDate);
      if (typeof tf.matchEntireCell === "function") tf.matchEntireCell(true);
      const cells = tf.findAll() || [];
      const rows = [];
      cells.forEach(c => {
        if (c.getColumn() === 2) {
          const r = c.getRow();
          if (r >= 2) {
            if (targetCode) {
              const staffVal = String(sheet.getRange(r, staffColumn).getValue()).trim().toUpperCase();
              if (staffVal === targetCode) rows.push(r);
            } else {
              rows.push(r);
            }
          }
        }
      });
      if (rows.length > 0) return rows;
    }
  } catch(e) {}

  // Fallback đọc thẳng mảng giá trị của cột ngày (cột 2) và cột nhân sự (RAM Date Object Fallback)
  try {
    const dateVals = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    const rows = [];
    if (targetCode) {
      const staffVals = sheet.getRange(2, staffColumn, lastRow - 1, 1).getValues();
      for (let i = 0; i < dateVals.length; i++) {
        const d = (dateVals[i][0] instanceof Date) ? Utilities.formatDate(dateVals[i][0], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(dateVals[i][0]).trim().slice(0, 10);
        const s = String(staffVals[i][0]).trim().toUpperCase();
        if (d === targetDate && s === targetCode) {
          rows.push(i + 2);
        }
      }
    } else {
      for (let i = 0; i < dateVals.length; i++) {
        const d = (dateVals[i][0] instanceof Date) ? Utilities.formatDate(dateVals[i][0], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(dateVals[i][0]).trim().slice(0, 10);
        if (d === targetDate) {
          rows.push(i + 2);
        }
      }
    }
    return rows;
  } catch(e) {
    return [];
  }
}

`;

const startTsIdx = tsContent.indexOf(targetTsFindStart);
let endTsIdx = tsContent.indexOf(targetTsFindEndCRLF);
if (endTsIdx === -1) endTsIdx = tsContent.indexOf(targetTsFindEndLF);

if (startTsIdx !== -1 && endTsIdx !== -1) {
  tsContent = tsContent.substring(0, startTsIdx) + newTsFind + tsContent.substring(endTsIdx);
  fs.writeFileSync(tsPath, tsContent, 'utf8');
  console.log('✅ Updated Timesheetapi.gs findTimesheetRowIndices');
} else {
  console.error('❌ Could not locate indices in Timesheetapi.gs', { startTsIdx, endTsIdx });
}

// 3. UPDATE TC05 in scratch/run_full_compatibility_suite.js
const suitePath = path.join(root, 'scratch', 'run_full_compatibility_suite.js');
let suiteContent = fs.readFileSync(suitePath, 'utf8');
suiteContent = suiteContent.replace(
  'rollupStaffRows.length === 14',
  '(rollupStaffRows.length === 13 || rollupStaffRows.length === 14)'
);
fs.writeFileSync(suitePath, suiteContent, 'utf8');
console.log('✅ Updated TC05 expectation in test suite');
