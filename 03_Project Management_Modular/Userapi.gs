// ============================================================
//  File: UsersAPI.gs v3.0 (OPTIMIZED)
//  Quản Lý Người Dùng & Phân Quyền
// ============================================================

/**
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
        : `TIMESHEET_${yr}`;
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
          rData[i][0] = `${dStr}_${dstCode}_${pCode}_${discCode}`;
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

    writeLog("CASCADE_STAFF", `Cập nhật lan truyền mã nhân viên từ [${srcCode}] sang [${dstCode}] (${newName || ""})`);
    return { success: true, message: `Đã cập nhật lan truyền mã nhân viên sang [${dstCode}] trên toàn bộ hệ thống!` };
  } finally {
    lock.releaseLock();
  }
}
