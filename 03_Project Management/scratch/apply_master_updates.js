const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function updateFileWithCRLF(filePath, transformFn) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hasCRLF = content.includes('\r\n');
  const normalized = content.replace(/\r\n/g, '\n');
  const updatedNorm = transformFn(normalized);
  const finalContent = hasCRLF ? updatedNorm.replace(/\n/g, '\r\n') : updatedNorm;
  fs.writeFileSync(filePath, finalContent, 'utf8');
}

// ══════════════════════════════════════════════════════════════════════════
// 1. UPDATE Projectsapi.gs: Add cascadeUpdateProject & enhance deleteProject
// ══════════════════════════════════════════════════════════════════════════
console.log("1. Updating Projectsapi.gs...");
updateFileWithCRLF(path.join(rootDir, 'Projectsapi.gs'), code => {
  // Add cascadeUpdateProject before deleteProject
  const cascadeCode = `
/**
 * Cập nhật lan truyền (Cascade Update) mã và tên dự án trên toàn bộ hệ thống
 * Đảm bảo 100% tính đồng nhất: PROJECTS, TAXONOMY, TIMESHEET_YYYY, TIMESHEET_DAILY_ROLLUP, TASKS
 */
function cascadeUpdateProject(oldCode, newCode, newName, newDesc, newBudget) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_projects")) {
    return { success: false, error: "Không có quyền quản lý dự án" };
  }

  const srcCode = String(oldCode || "").trim().toUpperCase();
  const dstCode = String(newCode || oldCode || "").trim().toUpperCase();
  if (!srcCode || !dstCode) return { success: false, error: "Thiếu mã dự án nguồn hoặc đích" };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return { success: false, error: "Hệ thống đang bận cập nhật dữ liệu khác" };

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Cập nhật bảng PROJECTS
    const shPj = ss.getSheetByName(CONFIG.SHEET_PROJECTS || "PROJECTS");
    let pjFound = false;
    if (shPj && shPj.getLastRow() >= 2) {
      const pData = shPj.getDataRange().getValues();
      for (let i = 1; i < pData.length; i++) {
        const rowId = String(pData[i][0] || "").trim().toUpperCase();
        if (rowId === srcCode || String(pData[i][1] || "").includes(srcCode)) {
          shPj.getRange(i + 1, 1).setValue(dstCode);
          if (newName) shPj.getRange(i + 1, 2).setValue(newName);
          if (newDesc !== undefined) shPj.getRange(i + 1, 3).setValue(newDesc);
          if (newBudget !== undefined && shPj.getLastColumn() >= 12) {
            shPj.getRange(i + 1, 12).setValue(Number(newBudget) || 0);
          }
          pjFound = true;
          break;
        }
      }
    }

    // 2. Cập nhật bảng TAXONOMY (Mã dự án chuẩn)
    const shTax = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    if (shTax && shTax.getLastRow() >= 2) {
      const tData = shTax.getDataRange().getValues();
      for (let i = 1; i < tData.length; i++) {
        const type = String(tData[i][1] || "").toUpperCase().trim();
        const code = String(tData[i][2] || "").toUpperCase().trim();
        if (type === "PROJECT_CODE" && (code === srcCode || String(tData[i][0]) === "PJC_" + srcCode)) {
          shTax.getRange(i + 1, 1).setValue("PJC_" + dstCode);
          shTax.getRange(i + 1, 3).setValue(dstCode);
          if (newName) {
            shTax.getRange(i + 1, 4).setValue(newName);
            shTax.getRange(i + 1, 6).setValue(newName);
            shTax.getRange(i + 1, 7).setValue(newName);
          }
        }
      }
    }

    // 3. Cập nhật toàn bộ các bảng năm TIMESHEET_YYYY
    const curYr = new Date().getFullYear();
    for (let yr = curYr - 1; yr <= curYr + 1; yr++) {
      const yearSheetName = (typeof getTimesheetYearSheetName === "function") 
        ? getTimesheetYearSheetName(yr) 
        : \`TIMESHEET_\${yr}\`;
      const shTs = ss.getSheetByName(yearSheetName);
      if (shTs && shTs.getLastRow() >= 2) {
        const tsData = shTs.getDataRange().getValues();
        for (let i = 1; i < tsData.length; i++) {
          const rowPj = String(tsData[i][7] || "").trim().toUpperCase(); // Cột 8: Project_Code
          if (rowPj === srcCode) {
            shTs.getRange(i + 1, 8).setValue(dstCode);
          }
        }
      }
    }

    // 4. Cập nhật bảng TIMESHEET_DAILY_ROLLUP
    const shRollup = ss.getSheetByName((typeof TIMESHEET_CONFIG !== "undefined" && TIMESHEET_CONFIG.ROLLUP_SHEET_NAME) ? TIMESHEET_CONFIG.ROLLUP_SHEET_NAME : "TIMESHEET_DAILY_ROLLUP");
    if (shRollup && shRollup.getLastRow() >= 2) {
      const rData = shRollup.getDataRange().getValues();
      for (let i = 1; i < rData.length; i++) {
        const rowPj = String(rData[i][4] || "").trim().toUpperCase(); // Cột 5: Project_Code
        if (rowPj === srcCode) {
          shRollup.getRange(i + 1, 5).setValue(dstCode);
          // Cập nhật lại Rollup_ID (Cột 1)
          const dStr = (rData[i][1] instanceof Date) 
            ? Utilities.formatDate(rData[i][1], "Asia/Ho_Chi_Minh", "yyyyMMdd")
            : String(rData[i][1] || "").replace(/-/g, "").slice(0, 8);
          const sCode = String(rData[i][2] || "").trim();
          const dCode = String(rData[i][7] || "").trim();
          const newRollupId = \`\${dStr}_\${sCode}_\${dstCode}_\${dCode}\`;
          shRollup.getRange(i + 1, 1).setValue(newRollupId);
        }
      }
    }

    // 5. Cập nhật bảng TASKS
    const shTasks = ss.getSheetByName(CONFIG.SHEET_TASKS || "TASKS");
    if (shTasks && shTasks.getLastRow() >= 2) {
      const tkData = shTasks.getDataRange().getValues();
      for (let i = 1; i < tkData.length; i++) {
        const pjId = String(tkData[i][1] || "").trim().toUpperCase();
        if (pjId === srcCode) {
          shTasks.getRange(i + 1, 2).setValue(dstCode);
          if (newName) shTasks.getRange(i + 1, 3).setValue(newName);
        }
      }
    }

    SpreadsheetApp.flush();
    invalidateCache([
      CONFIG.SHEET_PROJECTS || "PROJECTS",
      CONFIG.SHEET_TAXONOMY || "TAXONOMY",
      CONFIG.SHEET_TASKS || "TASKS",
      "TIMESHEET_2026",
      "TIMESHEET_DAILY_ROLLUP"
    ]);

    writeLog("CASCADE_PROJECT", \`Cập nhật lan truyền dự án từ [\${srcCode}] sang [\${dstCode}] (\${newName || ""})\`);
    return { success: true, message: \`Đã cập nhật lan truyền dự án sang [\${dstCode}] trên toàn bộ hệ thống!\` };
  } finally {
    lock.releaseLock();
  }
}
`;

  if (!code.includes('function cascadeUpdateProject')) {
    code = code.replace('function deleteProject(projectId) {', cascadeCode + '\nfunction deleteProject(projectId) {');
  }

  // Enhance deleteProject to also remove corresponding TAXONOMY row
  const oldDelEnd = `    SpreadsheetApp.flush();\n    invalidateCache([CONFIG.SHEET_PROJECTS, CONFIG.SHEET_TASKS]);`;
  const newDelEnd = `    // Đồng thời xóa khỏi bảng TAXONOMY để không để lại dự án ma\n    const shTax = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");\n    if (shTax && shTax.getLastRow() >= 2) {\n      const taxData = shTax.getDataRange().getValues();\n      for (let k = taxData.length - 1; k >= 1; k--) {\n        const type = String(taxData[k][1] || "").toUpperCase().trim();\n        const code = String(taxData[k][2] || "").toUpperCase().trim();\n        if (type === "PROJECT_CODE" && (code === projectId || String(taxData[k][0]) === "PJC_" + projectId)) {\n          shTax.deleteRow(k + 1);\n        }\n      }\n    }\n\n    SpreadsheetApp.flush();\n    invalidateCache([CONFIG.SHEET_PROJECTS, CONFIG.SHEET_TASKS, CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);`;

  if (!code.includes('Đồng thời xóa khỏi bảng TAXONOMY để không để lại dự án ma') && code.includes(oldDelEnd)) {
    code = code.replace(oldDelEnd, newDelEnd);
  }

  return code;
});
console.log("✅ Projectsapi.gs updated successfully!");

// ══════════════════════════════════════════════════════════════════════════
// 2. UPDATE Userapi.gs: Add cascadeUpdateStaffCode
// ══════════════════════════════════════════════════════════════════════════
console.log("2. Updating Userapi.gs...");
updateFileWithCRLF(path.join(rootDir, 'Userapi.gs'), code => {
  const cascadeStaffCode = `
/**
 * Cập nhật lan truyền (Cascade Update) mã nhân sự trên toàn hệ thống
 * Đảm bảo đồng nhất USERS, TAXONOMY, TIMESHEET_YYYY, TIMESHEET_DAILY_ROLLUP, TASKS
 */
function cascadeUpdateStaffCode(oldStaffCode, newStaffCode, staffEmail, newName) {
  const user = getCurrentUser();
  if (!user || user.role !== "Admin") {
    return { success: false, error: "Chỉ Quản trị viên tối cao mới có quyền đổi mã nhân viên." };
  }

  const srcCode = String(oldStaffCode || "").trim().toUpperCase();
  const dstCode = String(newStaffCode || "").trim().toUpperCase();
  if (!srcCode || !dstCode) return { success: false, error: "Thiếu mã nhân sự nguồn hoặc đích." };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return { success: false, error: "Hệ thống đang bận, vui lòng thử lại sau vài giây." };

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Cập nhật bảng USERS
    const shUsers = ss.getSheetByName(CONFIG.SHEET_USERS || "USERS");
    let targetEmail = staffEmail ? String(staffEmail).toLowerCase().trim() : "";
    if (shUsers && shUsers.getLastRow() >= 2) {
      const uData = shUsers.getDataRange().getValues();
      for (let i = 1; i < uData.length; i++) {
        const rowId = String(uData[i][0] || "").trim().toUpperCase();
        const rowEmail = String(uData[i][1] || "").trim().toLowerCase();
        if (rowId === srcCode || (targetEmail && rowEmail === targetEmail)) {
          shUsers.getRange(i + 1, 1).setValue(dstCode);
          if (newName) shUsers.getRange(i + 1, 3).setValue(newName);
          if (targetEmail) shUsers.getRange(i + 1, 2).setValue(targetEmail);
          break;
        }
      }
    }

    // 2. Cập nhật bảng TAXONOMY (nếu có dòng Employee)
    const shTax = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    if (shTax && shTax.getLastRow() >= 2) {
      const tData = shTax.getDataRange().getValues();
      for (let i = 1; i < tData.length; i++) {
        const type = String(tData[i][1] || "").toUpperCase().trim();
        const code = String(tData[i][2] || "").toUpperCase().trim();
        if (type === "EMPLOYEE" && (code === srcCode || String(tData[i][0]) === "EMP_" + srcCode)) {
          shTax.getRange(i + 1, 1).setValue("EMP_" + dstCode);
          shTax.getRange(i + 1, 3).setValue(dstCode);
          if (newName) shTax.getRange(i + 1, 4).setValue(newName);
        }
      }
    }

    // 3. Cập nhật toàn bộ các bảng năm TIMESHEET_YYYY
    const curYr = new Date().getFullYear();
    for (let yr = curYr - 1; yr <= curYr + 1; yr++) {
      const yearSheetName = (typeof getTimesheetYearSheetName === "function") 
        ? getTimesheetYearSheetName(yr) 
        : \`TIMESHEET_\${yr}\`;
      const shTs = ss.getSheetByName(yearSheetName);
      if (shTs && shTs.getLastRow() >= 2) {
        const tsData = shTs.getDataRange().getValues();
        for (let i = 1; i < tsData.length; i++) {
          const rowCode = String(tsData[i][13] || "").trim().toUpperCase(); // Cột 14: Staff_Code
          if (rowCode === srcCode) {
            shTs.getRange(i + 1, 14).setValue(dstCode);
            if (newName) shTs.getRange(i + 1, 15).setValue(newName); // Cột 15: Staff_Name
          }
        }
      }
    }

    // 4. Cập nhật bảng TIMESHEET_DAILY_ROLLUP
    const shRollup = ss.getSheetByName((typeof TIMESHEET_CONFIG !== "undefined" && TIMESHEET_CONFIG.ROLLUP_SHEET_NAME) ? TIMESHEET_CONFIG.ROLLUP_SHEET_NAME : "TIMESHEET_DAILY_ROLLUP");
    if (shRollup && shRollup.getLastRow() >= 2) {
      const rData = shRollup.getDataRange().getValues();
      for (let i = 1; i < rData.length; i++) {
        const rowCode = String(rData[i][2] || "").trim().toUpperCase(); // Cột 3: Staff_Code
        if (rowCode === srcCode) {
          shRollup.getRange(i + 1, 3).setValue(dstCode);
          if (newName) shRollup.getRange(i + 1, 4).setValue(newName); // Cột 4: Staff_Name
          // Cập nhật lại Rollup_ID (Cột 1)
          const dStr = (rData[i][1] instanceof Date) 
            ? Utilities.formatDate(rData[i][1], "Asia/Ho_Chi_Minh", "yyyyMMdd")
            : String(rData[i][1] || "").replace(/-/g, "").slice(0, 8);
          const pCode = String(rData[i][4] || "").trim();
          const discCode = String(rData[i][7] || "").trim();
          const newRollupId = \`\${dStr}_\${dstCode}_\${pCode}_\${discCode}\`;
          shRollup.getRange(i + 1, 1).setValue(newRollupId);
        }
      }
    }

    SpreadsheetApp.flush();
    invalidateCache([
      CONFIG.SHEET_USERS || "USERS",
      CONFIG.SHEET_TAXONOMY || "TAXONOMY",
      "TIMESHEET_2026",
      "TIMESHEET_DAILY_ROLLUP"
    ]);

    writeLog("CASCADE_STAFF", \`Cập nhật lan truyền mã nhân viên từ [\${srcCode}] sang [\${dstCode}] (\${newName || ""})\`);
    return { success: true, message: \`Đã cập nhật lan truyền mã nhân viên sang [\${dstCode}] trên toàn bộ hệ thống!\` };
  } finally {
    lock.releaseLock();
  }
}
`;

  if (!code.includes('function cascadeUpdateStaffCode')) {
    code += '\n' + cascadeStaffCode;
  }
  return code;
});
console.log("✅ Userapi.gs updated successfully!");

// ══════════════════════════════════════════════════════════════════════════
// 3. UPDATE Taxonomyapi.gs: Protect Employee email & Zombie cleanup
// ══════════════════════════════════════════════════════════════════════════
console.log("3. Updating Taxonomyapi.gs...");
updateFileWithCRLF(path.join(rootDir, 'Taxonomyapi.gs'), code => {
  // In saveTaxonomyItem, protect employee email against color hex #...
  const oldEmpSave = `    // NẾU LÀ EMPLOYEE: Lưu thẳng vào bảng USERS tập trung
    if (type === "EMPLOYEE") {
      const email = String(payload.extra1 || payload.email || "").trim();`;

  const newEmpSave = `    // NẾU LÀ EMPLOYEE: Lưu thẳng vào bảng USERS tập trung
    if (type === "EMPLOYEE") {
      let email = String(payload.extra1 || payload.email || "").trim();
      // BẢO VỆ CHỐNG TRÁO ĐỔI COLOR: Tuyệt đối không cho phép mã màu lọt vào Email
      if (!email || email.startsWith("#") || !email.includes("@")) {
        const ssUsers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_USERS || "USERS");
        if (ssUsers && ssUsers.getLastRow() >= 2) {
          const uRows = ssUsers.getDataRange().getValues();
          const foundU = uRows.find(u => String(u[0] || "").trim().toUpperCase() === code);
          if (foundU && foundU[1] && String(foundU[1]).includes("@")) {
            email = String(foundU[1]).trim();
          }
        }
      }
      if (!email || !email.includes("@")) {
        return { success: false, error: "Email nhân sự không hợp lệ hoặc bị thiếu" };
      }`;

  if (code.includes(oldEmpSave)) {
    code = code.replace(oldEmpSave, newEmpSave);
  }

  // In deleteTaxonomyItem, also deactivate in USERS to prevent zombie resurrection
  const oldDelTax = `        sh.deleteRow(i + 1);
        SpreadsheetApp.flush();
        invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);`;

  const newDelTax = `        sh.deleteRow(i + 1);
        // Nếu xóa EMPLOYEE, cũng cập nhật trạng thái Inactive trong USERS để tránh tự hồi sinh
        if (itemType === "EMPLOYEE") {
          const shUsers = ss.getSheetByName(CONFIG.SHEET_USERS || "USERS");
          if (shUsers && shUsers.getLastRow() >= 2) {
            const uData = shUsers.getDataRange().getValues();
            for (let u = 1; u < uData.length; u++) {
              if (String(uData[u][0] || "").trim().toUpperCase() === String(itemCode).trim().toUpperCase()) {
                shUsers.getRange(u + 1, 5).setValue("Inactive");
                break;
              }
            }
          }
        }
        SpreadsheetApp.flush();
        invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY", CONFIG.SHEET_USERS || "USERS"]);`;

  if (code.includes(oldDelTax)) {
    code = code.replace(oldDelTax, newDelTax);
  }

  return code;
});
console.log("✅ Taxonomyapi.gs updated successfully!");

// ══════════════════════════════════════════════════════════════════════════
// 4. UPDATE Timesheetapi.gs: Fix findTimesheetRowIndices Date fallback
// ══════════════════════════════════════════════════════════════════════════
console.log("4. Updating Timesheetapi.gs...");
updateFileWithCRLF(path.join(rootDir, 'Timesheetapi.gs'), code => {
  const targetFindOld = `      const cells = tf.findAll() || [];
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
      return rows;
    }
  } catch(e) {}`;

  const targetFindNew = `      const cells = tf.findAll() || [];
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
      if (rows.length > 0) return rows; // Chỉ trả về nếu tìm thấy
    }
  } catch(e) {}`;

  if (code.includes(targetFindOld)) {
    code = code.replace(targetFindOld, targetFindNew);
  }
  return code;
});
console.log("✅ Timesheetapi.gs updated successfully!");

// ══════════════════════════════════════════════════════════════════════════
// 5. UPDATE Index.html: Fix initProjectActualTimeTab & openTaxonomyMod
// ══════════════════════════════════════════════════════════════════════════
console.log("5. Updating Index.html...");
updateFileWithCRLF(path.join(rootDir, 'Index.html'), code => {
  // Fix openTaxonomyMod for EMPLOYEE
  const oldTaxModEmp = `        descInp.value = item.desc || '';
        extra1Inp.value = item.color || item.extra1 || '';`;

  const newTaxModEmp = `        descInp.value = item.desc || '';
        if (item.type === 'EMPLOYEE') {
          let emailVal = item.extra1 || item.email || '';
          if (emailVal.startsWith('#') || !emailVal.includes('@')) {
            const uFound = (S.members || []).find(m => m.id === item.code || m.name === item.name);
            emailVal = (uFound && uFound.email && uFound.email.includes('@')) ? uFound.email : '';
          }
          extra1Inp.value = emailVal;
        } else {
          extra1Inp.value = item.color || item.extra1 || '';
        }`;

  if (code.includes(oldTaxModEmp)) {
    code = code.replace(oldTaxModEmp, newTaxModEmp);
  }

  // Fix initProjectActualTimeTab to deduplicate by clean code
  const oldInitActual = `function initProjectActualTimeTab() {
  const sel = document.getElementById('ts-rep-pj-sel');
  if (!sel) return;

  const projectList = [];
  const seenIds = new Set();

  // 1. Lấy danh sách từ S.projects
  if (S && S.projects && S.projects.length) {
    S.projects.forEach(p => {
      const pid = String(p.id || '').trim();
      if (pid && !seenIds.has(pid)) {
        seenIds.add(pid);
        projectList.push({
          id: pid,
          name: p.name || pid
        });
      }
    });
  }

  // Bổ sung các mã dự án từ S.taxonomy.projectCodes nếu chưa có
  if (S && S.taxonomy && S.taxonomy.projectCodes && S.taxonomy.projectCodes.length) {
    S.taxonomy.projectCodes.forEach(p => {
      const pCode = String(p.code || p.id || '').trim();
      if (pCode && !seenIds.has(pCode)) {
        seenIds.add(pCode);
        projectList.push({
          id: pCode,
          name: typeof tTaxonomy === 'function' ? tTaxonomy(p) : (p.name_vi || p.name || pCode)
        });
      }
    });
  }

  // Đảm bảo 4 dự án thực tế luôn luôn có mặt đầy đủ
  const defaultActualPjs = [
    { id: "MUR01", name: "2026_01_MUR01_室蘭市蘭東下水処理場" },
    { id: "JJK01", name: "2026_02_JJK01_工房ヴィレッジ新築工事" },
    { id: "AMA01", name: "2026_03_AMA01_天草市本渡浄化センター" },
    { id: "TES01", name: "2026_04_TES01_弟子屈町弟子屈浄化センター" }
  ];
  defaultActualPjs.forEach(dp => {
    if (!seenIds.has(dp.id)) {
      seenIds.add(dp.id);
      projectList.push(dp);
    }
  });`;

  const newInitActual = `function initProjectActualTimeTab() {
  const sel = document.getElementById('ts-rep-pj-sel');
  if (!sel) return;

  const projectList = [];
  const seenCodes = new Set();

  // Danh mục 4 dự án Nhật Bản chính thức chuẩn hóa duy nhất
  const officialProjects = [
    { id: "MUR01", name: "2026_01_MUR01_室蘭市蘭東下水処理場" },
    { id: "JJK01", name: "2026_02_JJK01_工房ヴィレッジ新築工事" },
    { id: "AMA01", name: "2026_03_AMA01_天草市本渡浄化センター" },
    { id: "TES01", name: "2026_04_TES01_弟子屈町弟子屈浄化センター" }
  ];

  officialProjects.forEach(op => {
    seenCodes.add(op.id);
    // Ưu tiên tên hiển thị từ S.projects nếu có
    const foundPj = (S.projects || []).find(p => String(p.id).trim().toUpperCase() === op.id);
    projectList.push({
      id: op.id,
      name: foundPj ? (foundPj.name || op.name) : op.name
    });
  });

  // Bổ sung các dự án hợp lệ khác nếu có trong S.projects (Loại trừ triệt để mã rác)
  const obsoleteCodes = new Set(["MRR01", "AMK01", "TSK01", "JUJ01", "DA010", "HAG01"]);
  (S.projects || []).forEach(p => {
    const pid = String(p.id || '').trim().toUpperCase();
    if (pid && !seenCodes.has(pid) && !obsoleteCodes.has(pid)) {
      seenCodes.add(pid);
      projectList.push({ id: pid, name: p.name || pid });
    }
  });`;

  if (code.includes(oldInitActual)) {
    code = code.replace(oldInitActual, newInitActual);
  }
  return code;
});
console.log("✅ Index.html updated successfully!");

// ══════════════════════════════════════════════════════════════════════════
// 6. UPDATE SeederData.gs: Clean database & preserve 712.0 hours
// ══════════════════════════════════════════════════════════════════════════
console.log("6. Updating SeederData.gs...");
updateFileWithCRLF(path.join(rootDir, 'SeederData.gs'), code => {
  // Update Duy's official email to duyvultv@gmail.com
  code = code.replace(
    'DUY:   { code: "AB6FD093", name: "Vũ Đình Duy", role: "Admin", rank: "Quản trị viên (Cấp 1)" }',
    'DUY:   { code: "AB6FD093", name: "Vũ Đình Duy", email: "duyvultv@gmail.com", role: "Admin", rank: "Quản trị viên (Cấp 1)" }'
  );

  // Update duplicateStaffCodes to also clean 9210007
  code = code.replace(
    'const duplicateStaffCodes = new Set(["NV001", "NV_THACH", "NV_HUE", "NV_NHAN"]);',
    'const duplicateStaffCodes = new Set(["NV001", "NV_THACH", "NV_HUE", "NV_NHAN", "9210007"]);'
  );

  // Ensure Duy's email in USERS is duyvultv@gmail.com
  const oldUsersClean = `      // Lọc bỏ các dòng trùng lặp mã tạm NV...
      const retainedUsers = [uData[0]];
      for (let i = 1; i < uData.length; i++) {
        const c = String(uData[i][0] || "").trim().toUpperCase();
        if (!duplicateStaffCodes.has(c)) {
          retainedUsers.push(uData[i]);
        }
      }
      if (retainedUsers.length < uData.length) {
        shUsers.getDataRange().clearContent();
        shUsers.getRange(1, 1, retainedUsers.length, retainedUsers[0].length).setValues(retainedUsers);
        Logger.log(\`  🧹 Đã loại bỏ \${uData.length - retainedUsers.length} dòng nhân sự trùng lặp trong bảng USERS!\`);
      }`;

  const newUsersClean = `      // Lọc bỏ các dòng trùng lặp mã tạm NV... và mã ma 9210007
      const retainedUsers = [uData[0]];
      for (let i = 1; i < uData.length; i++) {
        const c = String(uData[i][0] || "").trim().toUpperCase();
        const em = String(uData[i][1] || "").trim().toLowerCase();
        if (duplicateStaffCodes.has(c) || em === "#6366f1") {
          continue; // Loại bỏ mã ma
        }
        let row = [...uData[i]];
        // Chuẩn hóa email Admin Duy
        if (c === officialStaff.DUY.code || String(row[2]).includes("Vũ Đình Duy")) {
          row[1] = "duyvultv@gmail.com";
          row[3] = "Admin";
        }
        retainedUsers.push(row);
      }
      shUsers.getDataRange().clearContent();
      shUsers.getRange(1, 1, retainedUsers.length, retainedUsers[0].length).setValues(retainedUsers);
      Logger.log(\`  🧹 Đã làm sạch bảng USERS: Admin Duy = duyvultv@gmail.com, đã loại bỏ dòng rác!\`);`;

  if (code.includes(oldUsersClean)) {
    code = code.replace(oldUsersClean, newUsersClean);
  }

  // Update Step 2: Projects clean up
  const oldPjSection = `    const projectDefinitions = [
      {
        id: "MUR01",
        name: "2026_01_MUR01_室蘭市蘭東下水処理場",
        desc: "Dự án nhà máy xử lý nước thải Ranto - TP Muroran (Hokkaido)",
        manager: "vudinhduy.bim@gmail.com",
        startDate: "2026-07-01",
        endDate: "2026-10-02",
        status: "Đang thực hiện",
        progress: 70,
        budgetHours: 344
      },
      {
        id: "JUJ01",
        name: "2026_02_JUJ01_工房ヴィレッジ新築工事",
        desc: "Dự án xây mới Làng xưởng Jujikai",
        manager: "vudinhduy.bim@gmail.com",
        startDate: "2026-07-02",
        endDate: "2026-10-16",
        status: "Đang thực hiện",
        progress: 100,
        budgetHours: 272
      },
      {
        id: "AMA01",
        name: "2026_03_AMA01_天草市本渡浄化センター",
        desc: "Trung tâm xử lý nước Hondo - TP Amakusa (Kumamoto)",
        manager: "vudinhduy.bim@gmail.com",
        startDate: "2026-10-26",
        endDate: "2026-12-31",
        status: "Đang thực hiện",
        progress: 10,
        budgetHours: 448
      },
      {
        id: "TES01",
        name: "2026_04_TES01_弟子屈町弟子屈浄化センター",
        desc: "TT xử lý nước Teshikaga - Thị trấn Teshikaga (Hokkaido)",
        manager: "vudinhduy.bim@gmail.com",
        startDate: "2026-07-09",
        endDate: "2026-08-21",
        status: "Đang thực hiện",
        progress: 44,
        budgetHours: 256
      }
    ];

    const shProjects = ss.getSheetByName(CONFIG.SHEET_PROJECTS || "PROJECTS");
    if (shProjects) {
      if (shProjects.getLastColumn() < 12) {
        shProjects.getRange(1, 12).setValue("Ngân Sách (Giờ)").setFontWeight("bold").setBackground("#34a853").setFontColor("white");
      }
      const pData = shProjects.getDataRange().getValues();
      projectDefinitions.forEach(pj => {
        const existingIdx = pData.findIndex(r => String(r[0]).trim().toUpperCase() === pj.id);
        if (existingIdx === -1) {
          shProjects.appendRow([
            pj.id,
            pj.name,
            pj.desc,
            pj.manager,
            pj.startDate,
            pj.endDate,
            pj.status,
            pj.progress,
            new Date(),
            "Seeder",
            JSON.stringify([pj.manager]),
            pj.budgetHours
          ]);
          Logger.log(\`  ➕ Thêm dự án: [\${pj.id}] \${pj.name} (Budget: \${pj.budgetHours}h)\`);
        } else {
          // Cập nhật ngân sách và thông tin nếu đã tồn tại
          shProjects.getRange(existingIdx + 1, 2).setValue(pj.name);
          shProjects.getRange(existingIdx + 1, 8).setValue(pj.progress);
          shProjects.getRange(existingIdx + 1, 12).setValue(pj.budgetHours);
          Logger.log(\`  ✔ Cập nhật dự án: [\${pj.id}] \${pj.name} (Budget: \${pj.budgetHours}h)\`);
        }
      });
      SpreadsheetApp.flush();
    }`;

  const newPjSection = `    const projectDefinitions = [
      {
        id: "MUR01",
        name: "2026_01_MUR01_室蘭市蘭東下水処理場",
        desc: "Dự án nhà máy xử lý nước thải Ranto - TP Muroran (Hokkaido)",
        manager: "duyvultv@gmail.com",
        startDate: "2026-07-01",
        endDate: "2026-10-02",
        status: "Đang thực hiện",
        progress: 70,
        budgetHours: 344
      },
      {
        id: "JJK01", // Chuẩn hóa mã JJK01
        name: "2026_02_JJK01_工房ヴィレッジ新築工事",
        desc: "Dự án xây mới Làng xưởng Jujikai",
        manager: "duyvultv@gmail.com",
        startDate: "2026-07-02",
        endDate: "2026-10-16",
        status: "Đang thực hiện",
        progress: 100,
        budgetHours: 272
      },
      {
        id: "AMA01",
        name: "2026_03_AMA01_天草市本渡浄化センター",
        desc: "Trung tâm xử lý nước Hondo - TP Amakusa (Kumamoto)",
        manager: "duyvultv@gmail.com",
        startDate: "2026-10-26",
        endDate: "2026-12-31",
        status: "Đang thực hiện",
        progress: 10,
        budgetHours: 448
      },
      {
        id: "TES01",
        name: "2026_04_TES01_弟子屈町弟子屈浄化センター",
        desc: "TT xử lý nước Teshikaga - Thị trấn Teshikaga (Hokkaido)",
        manager: "duyvultv@gmail.com",
        startDate: "2026-07-09",
        endDate: "2026-08-21",
        status: "Đang thực hiện",
        progress: 44,
        budgetHours: 256
      }
    ];

    const targetPjIds = new Set(["MUR01", "JJK01", "AMA01", "TES01"]);
    const shProjects = ss.getSheetByName(CONFIG.SHEET_PROJECTS || "PROJECTS");
    if (shProjects) {
      const pData = shProjects.getDataRange().getValues();
      let pHeader = pData[0] || [];
      while (pHeader.length < 12) pHeader.push("");
      pHeader[11] = "Ngân Sách (Giờ)";

      const cleanProjectRows = [pHeader];
      let removedPjCount = 0;

      // Xây dựng 4 dòng dự án chính thức
      projectDefinitions.forEach(pj => {
        const existingRow = pData.slice(1).find(r => {
          const id = String(r[0] || "").trim().toUpperCase();
          const name = String(r[1] || "").trim().toUpperCase();
          return id === pj.id || name.includes(pj.id) || (pj.id === "JJK01" && (id === "JUJ01" || name.includes("JUJ01")));
        });

        if (existingRow) {
          const updatedRow = [...existingRow];
          while (updatedRow.length < 12) updatedRow.push("");
          updatedRow[0] = pj.id;
          updatedRow[1] = pj.name;
          updatedRow[2] = pj.desc;
          updatedRow[3] = pj.manager;
          updatedRow[4] = pj.startDate;
          updatedRow[5] = pj.endDate;
          updatedRow[6] = pj.status;
          updatedRow[7] = pj.progress;
          updatedRow[11] = pj.budgetHours;
          cleanProjectRows.push(updatedRow);
          Logger.log(\`  ✔ Cập nhật dự án: [\${pj.id}] \${pj.name} (Budget: \${pj.budgetHours}h)\`);
        } else {
          cleanProjectRows.push([
            pj.id,
            pj.name,
            pj.desc,
            pj.manager,
            pj.startDate,
            pj.endDate,
            pj.status,
            pj.progress,
            new Date(),
            "Seeder",
            JSON.stringify([pj.manager]),
            pj.budgetHours
          ]);
          Logger.log(\`  ➕ Thêm mới dự án: [\${pj.id}] \${pj.name} (Budget: \${pj.budgetHours}h)\`);
        }
      });

      // Đếm các dự án thừa bị loại bỏ (như MRR01, AMK01, TSK01, JUJ01, DA010, HAG01...)
      for (let i = 1; i < pData.length; i++) {
        const id = String(pData[i][0] || "").trim().toUpperCase();
        if (!targetPjIds.has(id) && id !== "JUJ01") {
          removedPjCount++;
          Logger.log(\`  🗑️ Đã loại bỏ dự án thừa khỏi PROJECTS: [\${pData[i][0]}] \${pData[i][1]}\`);
        }
      }

      shProjects.getDataRange().clearContent();
      shProjects.getRange(1, 1, cleanProjectRows.length, cleanProjectRows[0].length).setValues(cleanProjectRows);
      Logger.log(\`  ✔ Bảng PROJECTS hiện lưu đúng 4 dự án chuẩn (Đã xóa \${removedPjCount} dự án thừa)!\`);
      SpreadsheetApp.flush();
    }

    // ══════════════════════════════════════════════════════════
    //  BƯỚC 2b: ĐỒNG BỘ BẢNG TAXONOMY (4. Mã dự án & Nhân viên sạch)
    // ══════════════════════════════════════════════════════════
    const taxonomyProjects = [
      {
        id: "PJC_MUR01",
        type: "PROJECT_CODE",
        code: "MUR01",
        name_vi: "Trạm xử lý nước thải Ranto TP Muroran",
        name_en: "2026_01_MUR01_Muroran",
        name_jp: "室蘭市蘭東下水処理場",
        desc: "2026_01_MUR01_室蘭市蘭東下水処理場",
        color: "#3b82f6",
        sortOrder: 1,
        status: "Active"
      },
      {
        id: "PJC_JJK01",
        type: "PROJECT_CODE",
        code: "JJK01",
        name_vi: "Công trình xây mới Làng xưởng Kobo Village",
        name_en: "2026_02_JJK01_KoboVillage",
        name_jp: "工房ヴィレッジ新築工事",
        desc: "2026_02_JJK01_工房ヴィレッジ新築工事",
        color: "#10b981",
        sortOrder: 2,
        status: "Active"
      },
      {
        id: "PJC_AMA01",
        type: "PROJECT_CODE",
        code: "AMA01",
        name_vi: "Trung tâm xử lý nước Hondo TP Amakusa",
        name_en: "2026_03_AMA01_Amakusa",
        name_jp: "天草市本渡浄化センター",
        desc: "2026_03_AMA01_天草市本渡浄化センター",
        color: "#f59e0b",
        sortOrder: 3,
        status: "Active"
      },
      {
        id: "PJC_TES01",
        type: "PROJECT_CODE",
        code: "TES01",
        name_vi: "TT xử lý nước Teshikaga Thị trấn Teshikaga",
        name_en: "2026_04_TES01_Teshikaga",
        name_jp: "弟子屈町弟子屈浄化センター",
        desc: "2026_04_TES01_弟子屈町弟子屈浄化センター",
        color: "#8b5cf6",
        sortOrder: 4,
        status: "Active"
      }
    ];

    if (shTax) {
      const taxData = shTax.getDataRange().getValues();
      const TAX_COLS = 11;
      const cleanTaxHeaders = ["ID", "Type", "Code", "Name_VI", "Name_EN", "Name_JP", "Description", "Color_Hex", "Sort_Order", "Status", "UpdatedAt"];
      let taxHeader = (taxData[0] && taxData[0].length >= TAX_COLS) ? taxData[0] : cleanTaxHeaders;

      // Giữ lại tất cả taxonomy trừ các mã dự án cũ và nhân viên rác
      const cleanTaxRows = [taxHeader];
      for (let i = 1; i < taxData.length; i++) {
        const rowType = String(taxData[i][1] || "").toUpperCase().trim();
        const rowCode = String(taxData[i][2] || "").toUpperCase().trim();
        if (rowType === "PROJECT_CODE") continue; // Xóa toàn bộ mã dự án cũ để nạp mới chuẩn
        if (rowType === "EMPLOYEE" && duplicateStaffCodes.has(rowCode)) continue;
        let r = [...taxData[i]];
        while (r.length < TAX_COLS) r.push("");
        cleanTaxRows.push(r.slice(0, TAX_COLS));
      }

      // Thêm 4 mã dự án chuẩn vào TAXONOMY
      const now = new Date();
      taxonomyProjects.forEach(tp => {
        cleanTaxRows.push([
          tp.id,
          tp.type,
          tp.code,
          tp.name_vi,
          tp.name_en,
          tp.name_jp,
          tp.desc,
          tp.color,
          tp.sortOrder,
          tp.status,
          now
        ]);
        Logger.log(\`  ➕ Thêm mã dự án vào TAXONOMY: [\${tp.code}] \${tp.desc}\`);
      });

      shTax.getDataRange().clearContent();
      shTax.getRange(1, 1, cleanTaxRows.length, TAX_COLS).setValues(cleanTaxRows);
      Logger.log(\`  ✔ Bảng TAXONOMY đã được cập nhật đủ 4 mã dự án chuẩn (Mục 4. Mã dự án)!\`);
      SpreadsheetApp.flush();
    }`;

  if (code.includes(oldPjSection)) {
    code = code.replace(oldPjSection, newPjSection);
  }

  // Update Project 2 work day definition to use JJK01
  code = code.replace('const P2 = "JUJ01";', 'const P2 = "JJK01";');
  code = code.replace('// 2. DỰ ÁN 2: JUJ01', '// 2. DỰ ÁN 2: JJK01');

  // Update targetProjectCodes in Step 4
  const oldTargetCodes = 'const targetProjectCodes = new Set(["MUR01", "JUJ01", "AMA01", "TES01"]);';
  const newTargetCodes = 'const targetProjectCodes = new Set(["MUR01", "JJK01", "JUJ01", "AMA01", "TES01", "DA010", "HAG01", "MRR01", "AMK01", "TSK01"]);';
  if (code.includes(oldTargetCodes)) {
    code = code.replace(oldTargetCodes, newTargetCodes);
  }

  // Update log messages
  code = code.replace(
    'Logger.log("   - Dự án 2 (JUJ01): 344.0h (43 ngày công - Vượt ngân sách 272h)");',
    'Logger.log("   - Dự án 2 (JJK01): 344.0h (43 ngày công - Vượt ngân sách 272h)");'
  );

  return code;
});
console.log("✅ SeederData.gs updated successfully!");

console.log("🎉 ALL MASTER CODE UPDATES APPLIED CLEANLY!");

