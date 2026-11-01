const fs = require('fs');
const path = require('path');

const userApiPath = path.join(__dirname, '..', 'Userapi.gs');
const taxonomyApiPath = path.join(__dirname, '..', 'Taxonomyapi.gs');
const indexHtmlPath = path.join(__dirname, '..', 'Index.html');

console.log('--- Applying Staff Code Cascade Fix ---');

// 1. UPDATE Userapi.gs
let userApi = fs.readFileSync(userApiPath, 'utf8');

const cascadeFuncRegex = /\/\*\*[\s\S]*?function cascadeUpdateStaffCode[\s\S]*?\n\}/;
const newCascadeFunc = `/**
 * Cập nhật lan truyền (Cascade Update) mã nhân sự trên toàn hệ thống
 * Đảm bảo đồng nhất USERS, TAXONOMY, TIMESHEET_YYYY, TIMESHEET_DAILY_ROLLUP, PROJECTS, TASKS
 */
function cascadeUpdateStaffCode(oldStaffCode, newStaffCode, staffEmail, newName) {
  const user = getCurrentUser();
  if (!user || (!hasPermission(user.role, "manage_users") && user.role !== "Admin")) {
    return { success: false, error: "Chỉ Quản trị viên mới có quyền đổi mã nhân viên." };
  }

  const srcCode = String(oldStaffCode || "").trim().toUpperCase();
  const dstCode = String(newStaffCode || "").trim().toUpperCase();
  if (!srcCode || !dstCode) return { success: false, error: "Thiếu mã nhân sự nguồn hoặc đích." };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return { success: false, error: "Hệ thống đang bận, vui lòng thử lại sau vài giây." };

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let targetEmail = staffEmail ? String(staffEmail).toLowerCase().trim() : "";

    // 1. Cập nhật bảng USERS (Batch update & cập nhật toàn bộ bản ghi trùng)
    const shUsers = ss.getSheetByName(CONFIG.SHEET_USERS || "USERS");
    if (shUsers && shUsers.getLastRow() >= 2) {
      const uData = shUsers.getDataRange().getValues();
      let uChanged = false;
      for (let i = 1; i < uData.length; i++) {
        const rowId = String(uData[i][0] || "").trim().toUpperCase();
        const rowEmail = String(uData[i][1] || "").trim().toLowerCase();
        if (rowId === srcCode || (targetEmail && rowEmail === targetEmail)) {
          uData[i][0] = dstCode;
          if (newName) uData[i][2] = newName;
          if (targetEmail && !rowEmail.includes("@")) uData[i][1] = targetEmail;
          uChanged = true;
        }
      }
      if (uChanged) {
        shUsers.getRange(1, 1, uData.length, uData[0].length).setValues(uData);
      }
    }

    // 2. Cập nhật bảng TAXONOMY (nếu có dòng Employee)
    const shTax = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    if (shTax && shTax.getLastRow() >= 2) {
      const tData = shTax.getDataRange().getValues();
      let tChanged = false;
      for (let i = 1; i < tData.length; i++) {
        const type = String(tData[i][1] || "").toUpperCase().trim();
        const code = String(tData[i][2] || "").toUpperCase().trim();
        const id = String(tData[i][0] || "").trim();
        const tEmail = String(tData[i][5] || "").toLowerCase().trim();
        if (type === "EMPLOYEE" && (code === srcCode || id === "EMP_" + srcCode || (targetEmail && tEmail === targetEmail))) {
          tData[i][0] = "EMP_" + dstCode;
          tData[i][2] = dstCode;
          if (newName) tData[i][3] = newName;
          tChanged = true;
        }
      }
      if (tChanged) {
        shTax.getRange(1, 1, tData.length, tData[0].length).setValues(tData);
      }
    }

    // 3. Cập nhật toàn bộ các bảng năm TIMESHEET_YYYY (Batch atomic write)
    const curYr = new Date().getFullYear();
    for (let yr = curYr - 1; yr <= curYr + 1; yr++) {
      const yearSheetName = (typeof getTimesheetYearSheetName === "function") 
        ? getTimesheetYearSheetName(yr) 
        : \`TIMESHEET_\${yr}\`;
      const shTs = ss.getSheetByName(yearSheetName);
      if (shTs && shTs.getLastRow() >= 2) {
        const tsData = shTs.getDataRange().getValues();
        let changed = false;
        for (let i = 1; i < tsData.length; i++) {
          const rowCode = String(tsData[i][13] || "").trim().toUpperCase(); // Cột 14: Staff_Code
          if (rowCode === srcCode) {
            tsData[i][13] = dstCode;
            if (newName) tsData[i][14] = newName; // Cột 15: Staff_Name
            changed = true;
          }
        }
        if (changed) {
          shTs.getRange(1, 1, tsData.length, tsData[0].length).setValues(tsData);
        }
      }
    }

    // 4. Cập nhật bảng TIMESHEET_DAILY_ROLLUP (Batch atomic write & tái tạo Rollup_ID)
    const shRollup = ss.getSheetByName((typeof TIMESHEET_CONFIG !== "undefined" && TIMESHEET_CONFIG.ROLLUP_SHEET_NAME) ? TIMESHEET_CONFIG.ROLLUP_SHEET_NAME : "TIMESHEET_DAILY_ROLLUP");
    if (shRollup && shRollup.getLastRow() >= 2) {
      const rData = shRollup.getDataRange().getValues();
      let rChanged = false;
      for (let i = 1; i < rData.length; i++) {
        const rowCode = String(rData[i][2] || "").trim().toUpperCase(); // Cột 3: Staff_Code
        if (rowCode === srcCode) {
          rData[i][2] = dstCode;
          if (newName) rData[i][3] = newName; // Cột 4: Staff_Name
          // Tái tạo Rollup_ID chuẩn (Cột 1)
          const dStr = (rData[i][1] instanceof Date) 
            ? Utilities.formatDate(rData[i][1], "Asia/Ho_Chi_Minh", "yyyyMMdd")
            : String(rData[i][1] || "").replace(/[-/]/g, "").slice(0, 8);
          const pCode = String(rData[i][4] || "").trim();
          const discCode = String(rData[i][7] || "").trim();
          rData[i][0] = \`\${dStr}_\${dstCode}_\${pCode}_\${discCode}\`;
          rChanged = true;
        }
      }
      if (rChanged) {
        shRollup.getRange(1, 1, rData.length, rData[0].length).setValues(rData);
      }
    }

    // 5. Cập nhật danh sách thành viên trong PROJECTS sheet (nếu m.id là Staff Code)
    const shProj = ss.getSheetByName(CONFIG.SHEET_PROJECTS || "PROJECTS");
    if (shProj && shProj.getLastRow() >= 2) {
      const pData = shProj.getDataRange().getValues();
      let pChanged = false;
      for (let i = 1; i < pData.length; i++) {
        const rawMems = String(pData[i][10] || "").trim();
        if (rawMems && rawMems.startsWith("[") && (rawMems.includes(srcCode) || (targetEmail && rawMems.includes(targetEmail)))) {
          try {
            const mems = JSON.parse(rawMems);
            let mChanged = false;
            mems.forEach(m => {
              if (String(m.id || "").toUpperCase() === srcCode) {
                m.id = dstCode;
                if (newName) m.name = newName;
                mChanged = true;
              } else if (targetEmail && String(m.email || "").toLowerCase() === targetEmail) {
                if (m.id && String(m.id).toUpperCase() === srcCode) m.id = dstCode;
                if (newName) m.name = newName;
                mChanged = true;
              }
            });
            if (mChanged) {
              pData[i][10] = JSON.stringify(mems);
              pChanged = true;
            }
          } catch(e) {}
        }
      }
      if (pChanged) {
        shProj.getRange(1, 1, pData.length, pData[0].length).setValues(pData);
      }
    }

    SpreadsheetApp.flush();
    invalidateCache([
      CONFIG.SHEET_USERS || "USERS",
      CONFIG.SHEET_TAXONOMY || "TAXONOMY",
      CONFIG.SHEET_PROJECTS || "PROJECTS",
      "TIMESHEET_2026",
      "TIMESHEET_DAILY_ROLLUP"
    ]);

    writeLog("CASCADE_STAFF", \`Cập nhật lan truyền mã nhân viên từ [\${srcCode}] sang [\${dstCode}] (\${newName || ""})\`);
    return { success: true, message: \`Đã cập nhật lan truyền mã nhân viên sang [\${dstCode}] trên toàn bộ hệ thống!\` };
  } finally {
    lock.releaseLock();
  }
}`;

if (cascadeFuncRegex.test(userApi)) {
  userApi = userApi.replace(cascadeFuncRegex, newCascadeFunc);
  fs.writeFileSync(userApiPath, userApi, 'utf8');
  console.log('✅ Userapi.gs updated successfully');
} else {
  console.error('❌ Could not find cascadeUpdateStaffCode in Userapi.gs');
}

// 2. UPDATE Taxonomyapi.gs
let taxApi = fs.readFileSync(taxonomyApiPath, 'utf8');

// Replace getTaxonomyDataInternal employee population
const oldEmpTaxonomyRegex = /if \(type === "EMPLOYEE"\) employees\.push\(item\);[\s\S]*?\/\/ TÍCH HỢP ĐỒNG BỘ TỪ BẢNG USERS VÀO EMPLOYEES[\s\S]*?employees\.push\(\{[\s\S]*?sortOrder: 99\s*\}\);\s*\}\);\s*\}\s*catch\(errUsers\)\s*\{\s*console\.warn\("Lỗi nạp users vào taxonomy employees:", errUsers\);\s*\}/;

const newEmpTaxonomy = `// Bỏ qua dòng EMPLOYEE trong bảng TAXONOMY vì bảng USERS là nguồn sự thật duy nhất (Single Source of Truth)
  });

  // TÍCH HỢP ĐỒNG BỘ TẬP TRUNG TỪ BẢNG USERS VÀO EMPLOYEES (Loại trừ 100% bản ghi rác và duplicate)
  try {
    const usersData = getSheetData(CONFIG.SHEET_USERS);
    const seenCodes = new Set();
    const seenEmails = new Set();

    usersData.forEach(u => {
      if (!u[0] && !u[1]) return;
      const staffCode = String(u[0] || "").trim().toUpperCase();
      const email = String(u[1] || "").trim();
      const staffName = String(u[2] || "").trim();
      const staffRole = String(u[3] || "Member").trim();
      const staffStatus = String(u[4] || "Active").trim();
      const staffRank = String(u[6] || "").trim();
      const sheetUrl = String(u[7] || "").trim();

      // Bỏ qua dòng tiêu đề hoặc rác
      if (staffCode === "ID" || email === "EMAIL") return;
      if (!staffCode && (!email || !email.includes("@"))) return;
      if (email.startsWith("#")) return; // Loại bỏ rác mã màu lọt vào email

      const emLower = email.toLowerCase();
      if (emLower && seenEmails.has(emLower)) return;
      if (staffCode && seenCodes.has(staffCode)) return;

      if (emLower) seenEmails.add(emLower);
      if (staffCode) seenCodes.add(staffCode);

      employees.push({
        id: "EMP_" + staffCode,
        type: "EMPLOYEE",
        code: staffCode,
        name: staffName,
        name_vi: staffName,
        name_en: staffName,
        name_jp: "",
        desc: staffRank,
        color: "#6366f1",
        extra1: email,
        extra2: sheetUrl,
        extra3: staffRole,
        status: staffStatus,
        sortOrder: 99
      });
    });
  } catch(errUsers) {
    console.warn("Lỗi nạp users vào taxonomy employees:", errUsers);
  }`;

if (oldEmpTaxonomyRegex.test(taxApi)) {
  taxApi = taxApi.replace(oldEmpTaxonomyRegex, newEmpTaxonomy);
  console.log('✅ Taxonomyapi.gs getTaxonomyDataInternal updated successfully');
} else {
  console.error('❌ Could not find employee extraction block in getTaxonomyDataInternal');
}

// Replace saveTaxonomyItem EMPLOYEE block
const oldSaveEmpRegex = /\/\/ NẾU LÀ EMPLOYEE: Lưu thẳng vào bảng USERS tập trung[\s\S]*?return \{\s*success: true,\s*item: \{[\s\S]*?sortOrder: sortOrder\s*\}\s*\};\s*\}/;

const newSaveEmp = `// NẾU LÀ EMPLOYEE: Quản lý nhân sự tập trung, đồng bộ toàn diện và Cascade Update
    if (type === "EMPLOYEE") {
      let email = String(payload.extra1 || payload.email || "").trim();
      let sheetUrl = String(payload.extra2 || payload.sheetUrl || "").trim();

      // 1. Xác định mã nhân viên cũ (Old Staff Code)
      let oldStaffCode = "";
      if (payload.id && String(payload.id).startsWith("EMP_")) {
        oldStaffCode = String(payload.id).replace(/^EMP_/, "").trim().toUpperCase();
      }

      // Tra cứu bảng USERS để lấy chính xác mã cũ và email
      const ssUsers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_USERS || "USERS");
      let foundUserRow = null;
      if (ssUsers && ssUsers.getLastRow() >= 2) {
        const uRows = ssUsers.getDataRange().getValues();
        for (let i = 1; i < uRows.length; i++) {
          const rowCode = String(uRows[i][0] || "").trim().toUpperCase();
          const rowEmail = String(uRows[i][1] || "").trim().toLowerCase();
          if ((email && rowEmail === email.toLowerCase()) || (oldStaffCode && rowCode === oldStaffCode)) {
            foundUserRow = uRows[i];
            if (!oldStaffCode) oldStaffCode = rowCode;
            if (!email || email.startsWith("#") || !email.includes("@")) {
              if (rowEmail && rowEmail.includes("@")) email = rowEmail;
            }
            break;
          }
        }
      }

      // BẢO VỆ CHỐNG TRÁO ĐỔI COLOR: Tuyệt đối không cho phép mã màu lọt vào Email
      if (!email || email.startsWith("#") || !email.includes("@")) {
        return { success: false, error: "Email nhân sự không hợp lệ hoặc bị thiếu" };
      }

      if (!sheetUrl) {
        try {
          const createRes = createNewStaffSpreadsheet(code, nameVI, email);
          if (createRes && createRes.success && createRes.sheetUrl) {
            sheetUrl = createRes.sheetUrl;
          }
        } catch(errCreate) {
          console.warn("Auto create sheet for employee failed:", errCreate);
        }
      }

      let targetRole = "Member";
      const ex3 = extra3.toLowerCase();
      if (["cấp 1", "admin", "level1", "1"].includes(ex3)) targetRole = "Admin";
      else if (["cấp 2", "leader", "level2", "2"].includes(ex3)) targetRole = "Leader";
      else if (["cấp 3", "pj_lead", "pj lead", "level3", "3", "manager"].includes(ex3)) targetRole = "PJ_Lead";
      else if (extra3) targetRole = extra3;

      if (foundUserRow && String(foundUserRow[3] || "").trim() === "Admin" && targetRole !== "Admin") {
        targetRole = "Admin";
      }

      const newStaffCode = code;

      // 2. KÍCH HOẠT CASCADE UPDATE NẾU ĐỔI MÃ NHÂN VIÊN
      if (oldStaffCode && newStaffCode && oldStaffCode !== newStaffCode) {
        const cascadeRes = cascadeUpdateStaffCode(oldStaffCode, newStaffCode, email, nameVI);
        if (!cascadeRes || !cascadeRes.success) {
          return { success: false, error: "Lỗi cập nhật lan truyền mã nhân viên: " + ((cascadeRes && cascadeRes.error) || "Không xác định") };
        }
      }

      // 3. Đồng bộ vào bảng USERS (cột 1 sẽ được cập nhật newStaffCode)
      syncEmployeeToUsersSheet({
        id: newStaffCode,
        oldId: oldStaffCode,
        email: email,
        name: nameVI,
        role: targetRole,
        status: status,
        rank: desc,
        sheetUrl: sheetUrl
      });

      // 4. Đồng bộ vào bảng TAXONOMY nếu có dòng EMPLOYEE tương ứng
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const shTax = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
      if (shTax && shTax.getLastRow() >= 2) {
        const tData = shTax.getDataRange().getValues();
        let foundTaxRow = -1;
        for (let i = 1; i < tData.length; i++) {
          const tType = String(tData[i][1] || "").toUpperCase().trim();
          const tCode = String(tData[i][2] || "").toUpperCase().trim();
          const tId = String(tData[i][0] || "").trim();
          if (tType === "EMPLOYEE" && (tCode === oldStaffCode || tCode === newStaffCode || tId === "EMP_" + oldStaffCode || tId === payload.id)) {
            foundTaxRow = i + 1;
            break;
          }
        }
        if (foundTaxRow !== -1) {
          shTax.getRange(foundTaxRow, 1).setValue("EMP_" + newStaffCode);
          shTax.getRange(foundTaxRow, 3).setValue(newStaffCode);
          shTax.getRange(foundTaxRow, 4).setValue(nameVI);
          shTax.getRange(foundTaxRow, 5).setValue(nameEN || nameVI);
          shTax.getRange(foundTaxRow, 7).setValue(desc);
          shTax.getRange(foundTaxRow, 10).setValue(status);
        }
      }

      SpreadsheetApp.flush();
      invalidateCache([CONFIG.SHEET_USERS, CONFIG.SHEET_TAXONOMY || "TAXONOMY", "TIMESHEET_2026", "TIMESHEET_DAILY_ROLLUP"]);
      writeLog("SAVE_EMPLOYEE", \`Lưu nhân sự [\${newStaffCode}] (cũ: \${oldStaffCode}): \${nameVI} (\${email})\`);
      return {
        success: true,
        message: (oldStaffCode && oldStaffCode !== newStaffCode)
          ? \`Đã đổi mã nhân viên từ [\${oldStaffCode}] sang [\${newStaffCode}] và đồng bộ toàn hệ thống!\`
          : \`Đã lưu nhân sự [\${newStaffCode}] thành công!\`,
        item: {
          id: "EMP_" + newStaffCode,
          type: "EMPLOYEE",
          code: newStaffCode,
          name: nameVI,
          name_vi: nameVI,
          name_en: nameEN,
          name_jp: nameJP,
          desc: desc,
          color: "#6366f1",
          extra1: email,
          extra2: sheetUrl,
          extra3: targetRole,
          status: status,
          sortOrder: sortOrder
        }
      };
    }`;

if (oldSaveEmpRegex.test(taxApi)) {
  taxApi = taxApi.replace(oldSaveEmpRegex, newSaveEmp);
  console.log('✅ Taxonomyapi.gs saveTaxonomyItem EMPLOYEE block updated successfully');
} else {
  console.error('❌ Could not find saveTaxonomyItem EMPLOYEE block');
}

// Replace syncEmployeeToUsersSheet
const oldSyncEmpRegex = /function syncEmployeeToUsersSheet\(emp\) \{[\s\S]*?\n\}/;

const newSyncEmp = `function syncEmployeeToUsersSheet(emp) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let shUsers = ss.getSheetByName(CONFIG.SHEET_USERS);
    if (!shUsers) return;

    if (shUsers.getLastColumn() < 8) {
      shUsers.getRange(1, 8).setValue("Link Bảng Tính").setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");
    }

    const rows = shUsers.getDataRange().getValues();
    const emailTarget = String(emp.email || "").toLowerCase().trim();
    const oldIdTarget = String(emp.oldId || "").toUpperCase().trim();
    const idTarget = String(emp.id || "").toUpperCase().trim();
    let foundIndex = -1;
    let existingRole = "";

    for (let i = 1; i < rows.length; i++) {
      const rowId = String(rows[i][0] || "").toUpperCase().trim();
      const rowEmail = String(rows[i][1] || "").toLowerCase().trim();
      if ((emailTarget && rowEmail === emailTarget) || (oldIdTarget && rowId === oldIdTarget) || (idTarget && rowId === idTarget)) {
        foundIndex = i + 1;
        existingRole = String(rows[i][3] || "").trim();
        break;
      }
    }

    let roleToSet = emp.role;
    // BẢO VỆ ADMIN: Nếu tài khoản đang là Admin, tuyệt đối không bị hạ cấp
    if (existingRole === "Admin" && emp.role !== "Admin") {
      roleToSet = existingRole;
    }

    if (foundIndex !== -1) {
      if (emp.id) shUsers.getRange(foundIndex, 1).setValue(emp.id); // <--- CRUCIAL FIX: CẬP NHẬT MÃ NHÂN VIÊN VÀO CỘT 1
      if (emp.email && !emp.email.startsWith("#")) shUsers.getRange(foundIndex, 2).setValue(emp.email);
      shUsers.getRange(foundIndex, 3).setValue(emp.name);
      shUsers.getRange(foundIndex, 4).setValue(roleToSet);
      shUsers.getRange(foundIndex, 5).setValue(emp.status);
      shUsers.getRange(foundIndex, 7).setValue(emp.rank || "");
      if (emp.sheetUrl) shUsers.getRange(foundIndex, 8).setValue(emp.sheetUrl);
    } else {
      shUsers.appendRow([emp.id, emp.email, emp.name, roleToSet, emp.status, new Date(), emp.rank || "", emp.sheetUrl || ""]);
    }
    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_USERS]);
  } catch(e) {
    console.warn("syncEmployeeToUsersSheet warning:", e);
  }
}`;

if (oldSyncEmpRegex.test(taxApi)) {
  taxApi = taxApi.replace(oldSyncEmpRegex, newSyncEmp);
  fs.writeFileSync(taxonomyApiPath, taxApi, 'utf8');
  console.log('✅ Taxonomyapi.gs syncEmployeeToUsersSheet updated successfully');
} else {
  console.error('❌ Could not find syncEmployeeToUsersSheet in Taxonomyapi.gs');
}

// 3. UPDATE Index.html
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const oldSubmitTaxSuccessRegex = /if \(res && res\.success\) \{\s*closeModal\('m-tax'\);\s*toast\(t\('tax_item_saved'\), "success"\);\s*loadPgTaxonomy\(true\);\s*\}/;

const newSubmitTaxSuccess = `if (res && res.success) {
        closeModal('m-tax');
        toast(res.message || t('tax_item_saved'), "success");
        if (type === 'EMPLOYEE') {
          // Cập nhật ngay trong cache frontend (Optimistic UI)
          const newCode = payload.code;
          if (Array.isArray(S.members)) {
            const m = S.members.find(x => (payload.extra1 && x.email === payload.extra1) || (payload.id && x.id === payload.id?.replace(/^EMP_/, '')) || x.id === newCode);
            if (m) {
              m.id = newCode;
              m.code = newCode;
              m.name = payload.name;
            }
          }
          if (S.user && (S.user.email === payload.extra1 || S.user.staffCode === payload.id?.replace(/^EMP_/, ''))) {
            S.user.staffCode = newCode;
            S.user.id = newCode;
            S.user.name = payload.name;
          }
        }
        loadPgTaxonomy(true);
      }`;

if (oldSubmitTaxSuccessRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(oldSubmitTaxSuccessRegex, newSubmitTaxSuccess);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✅ Index.html submitTaxonomyItem success handler updated successfully');
} else {
  console.warn('⚠️ Could not find exact submitTaxonomyItem success handler in Index.html (might need manual check)');
}

console.log('--- Apply completed ---');

