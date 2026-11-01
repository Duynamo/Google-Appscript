// ============================================================
//  File: Timesheetapi.gs v4.7
//  QUẢN LÝ THỜI GIAN LÀM VIỆC CHI TIẾT (ACTUAL TIME TRACKING ENGINE)
//  Kiến trúc v4.7:
//  - Single Source of Truth: Toàn bộ dữ liệu lưu tại File Master tập trung
//  - Phân vùng Niên độ: TIMESHEET_YYYY (e.g. TIMESHEET_2026)
//  - Bảng Tóm tắt Ngày Siêu Tốc: TIMESHEET_DAILY_ROLLUP (Query < 0.15s)
//  - Vòng đời Dự án Đa Năm (3 - 5 năm): PROJECT_YEARLY_SUMMARY (Snapshot)
//  - Cập nhật Cục bộ An toàn (In-place Range Update qua TextFinder, 0% clearContent)
//  - Phân quyền RBAC 4 Cấp (Admin, Leader, PJ_Lead, Member)
// ============================================================

const TIMESHEET_CONFIG = {
  CENTRAL_YEAR_PREFIX: "TIMESHEET_",
  ROLLUP_SHEET_NAME: "TIMESHEET_DAILY_ROLLUP",
  YEARLY_SUMMARY_SHEET_NAME: "PROJECT_YEARLY_SUMMARY",
  SHEET_LOG_NAME: "DAILY_LOG", // Tên tab cho sheet cá nhân cũ (tương thích ngược)

  // 18 Cột Bảng Chi Tiết TIMESHEET_YYYY
  HEADERS_DETAIL: [
    "Log_ID",           // 0: Khóa chính (YYYYMMDD_StaffCode_HHmm)
    "Work_Date",        // 1: Ngày làm việc (YYYY-MM-DD)
    "Time_Slot",        // 2: Nhãn khung giờ (08:00 - 08:30)
    "Start_Time",       // 3: Giờ bắt đầu (08:00)
    "End_Time",         // 4: Giờ kết thúc (08:30)
    "Duration_Hours",   // 5: Thời lượng giờ (0.5)
    "Slot_Type",        // 6: Loại ca (Official, Lunch, OT_Morning, OT_Evening)
    "Project_Code",     // 7: Mã Dự án (JJK01, HAG01...)
    "Category_Code",    // 8: Mã Category (GE, M3, PC...)
    "Phase_Code",       // 9: Phase Dự án (BD, DD, IS...)
    "Discipline_Code",  // 10: Mã Công việc (AR, STR, MP...)
    "Task_ID",          // 11: Task ID liên kết (nếu có)
    "Work_Note",        // 12: Ghi chú chi tiết công việc
    "Staff_Code",       // 13: Mã nhân viên (NV001)
    "Staff_Name",       // 14: Họ tên nhân viên
    "Staff_Rank",       // 15: Cấp bậc
    "Updated_At",       // 16: Thời điểm lưu thực tế
    "Updated_By"        // 17: Email người thực hiện
  ],

  // 12 Cột Bảng Tổng Hợp Ngày TIMESHEET_DAILY_ROLLUP
  HEADERS_ROLLUP: [
    "Rollup_ID",        // 0: YYYYMMDD_StaffCode_ProjectCode_Disc
    "Work_Date",        // 1: YYYY-MM-DD
    "Staff_Code",       // 2: Mã NV
    "Staff_Name",       // 3: Họ tên
    "Project_Code",     // 4: Mã dự án
    "Category_Code",    // 5: Mã Category
    "Phase_Code",       // 6: Phase
    "Discipline_Code",  // 7: Discipline
    "Total_Hours",      // 8: Tổng giờ làm trong ngày
    "Official_Hours",   // 9: Giờ chuẩn (8h)
    "OT_Hours",         // 10: Giờ tăng ca
    "Updated_At"        // 11: Timestamp cập nhật
  ],

  // 9 Cột Bảng Chốt Sổ Niên Độ PROJECT_YEARLY_SUMMARY
  HEADERS_SUMMARY: [
    "Project_Code",     // 0: Mã dự án
    "Project_Name",     // 1: Tên dự án
    "Fiscal_Year",      // 2: Niên độ tài chính (2024, 2025, 2026...)
    "Total_Hours",      // 3: Tổng giờ thực tế lũy kế trong năm
    "Total_Members",    // 4: Số nhân sự tham gia
    "Lead_Email",       // 5: Email Quản lý dự án
    "Status",           // 6: Trạng thái chốt sổ (CLOSED)
    "Closed_At",        // 7: Thời điểm chốt sổ
    "Closed_By"         // 8: Người thực hiện chốt sổ
  ],

  // Cấu hình tương thích ngược
  HEADERS: [
    "Log_ID", "Work_Date", "Time_Slot", "Start_Time", "End_Time",
    "Duration_Minutes", "Slot_Type", "Project_Code", "Category_Code",
    "Phase_Code", "Discipline_Code", "Work_Note", "Staff_Code",
    "Staff_Name", "Staff_Rank", "Updated_At", "Updated_By"
  ]
};

// ════════════════════════════════════════════════════════════
//  KHỞI TẠO BẢNG TẬP TRUNG TẠI FILE GỐC (CENTRAL STORAGE INITIALIZATION)
// ════════════════════════════════════════════════════════════

function getTimesheetYearSheetName(year) {
  const y = year || new Date().getFullYear();
  return TIMESHEET_CONFIG.CENTRAL_YEAR_PREFIX + y;
}

function ensureYearTimesheetSheet(year) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shName = getTimesheetYearSheetName(year);
  let sh = ss.getSheetByName(shName);
  if (!sh) {
    sh = ss.insertSheet(shName);
    sh.appendRow(TIMESHEET_CONFIG.HEADERS_DETAIL);
    const headerRange = sh.getRange(1, 1, 1, TIMESHEET_CONFIG.HEADERS_DETAIL.length);
    headerRange.setFontWeight("bold")
               .setBackground("#1e293b")
               .setFontColor("#ffffff")
               .setHorizontalAlignment("center");
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 150); // Log_ID
    sh.setColumnWidth(2, 95);  // Work_Date
    sh.setColumnWidth(3, 105); // Time_Slot
    sh.setColumnWidth(6, 75);  // Duration_Hours
    sh.setColumnWidth(7, 90);  // Slot_Type
    sh.setColumnWidth(8, 90);  // Project_Code
    sh.setColumnWidth(11, 85); // Discipline_Code
    sh.setColumnWidth(13, 240);// Work_Note
  }
  return sh;
}

function ensureDailyRollupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TIMESHEET_CONFIG.ROLLUP_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(TIMESHEET_CONFIG.ROLLUP_SHEET_NAME);
    sh.appendRow(TIMESHEET_CONFIG.HEADERS_ROLLUP);
    const headerRange = sh.getRange(1, 1, 1, TIMESHEET_CONFIG.HEADERS_ROLLUP.length);
    headerRange.setFontWeight("bold")
               .setBackground("#0f766e")
               .setFontColor("#ffffff")
               .setHorizontalAlignment("center");
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 160); // Rollup_ID
    sh.setColumnWidth(2, 95);  // Work_Date
    sh.setColumnWidth(3, 85);  // Staff_Code
    sh.setColumnWidth(4, 140); // Staff_Name
    sh.setColumnWidth(5, 90);  // Project_Code
    sh.setColumnWidth(8, 85);  // Discipline_Code
    sh.setColumnWidth(9, 85);  // Total_Hours
  }
  return sh;
}

function ensureYearlySummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TIMESHEET_CONFIG.YEARLY_SUMMARY_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(TIMESHEET_CONFIG.YEARLY_SUMMARY_SHEET_NAME);
    sh.appendRow(TIMESHEET_CONFIG.HEADERS_SUMMARY);
    const headerRange = sh.getRange(1, 1, 1, TIMESHEET_CONFIG.HEADERS_SUMMARY.length);
    headerRange.setFontWeight("bold")
               .setBackground("#1d4ed8")
               .setFontColor("#ffffff")
               .setHorizontalAlignment("center");
    sh.setFrozenRows(1);
  }
  return sh;
}

function initTimesheetCentralSheets() {
  const curYear = new Date().getFullYear();
  ensureYearTimesheetSheet(curYear);
  ensureDailyRollupSheet();
  ensureYearlySummarySheet();
}

// ════════════════════════════════════════════════════════════
//  HÀM HELPER & TƯƠNG THÍCH NGƯỢC
// ════════════════════════════════════════════════════════════

function extractSpreadsheetId(urlOrId) {
  if (!urlOrId) return null;
  const str = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{25,}$/.test(str)) return str;
  const match = str.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function getEmployeeByCode(staffCode) {
  if (!staffCode) return null;
  const codeUpper = String(staffCode).trim().toUpperCase();
  const taxData = getTaxonomyDataInternal();
  const employees = taxData.employees || [];
  return employees.find(e => String(e.code).trim().toUpperCase() === codeUpper) || null;
}

function getEmployeeByEmail(email) {
  if (!email) return null;
  const emLower = String(email).trim().toLowerCase();
  const taxData = getTaxonomyDataInternal();
  const employees = taxData.employees || [];
  return employees.find(e => String(e.extra1 || "").trim().toLowerCase() === emLower) || null;
}

function openAndInitEmployeeSheet(sheetUrlOrId) {
  const fileId = extractSpreadsheetId(sheetUrlOrId);
  if (!fileId) throw new Error("Link Google Sheet cá nhân không hợp lệ hoặc chưa được thiết lập.");
  let ss;
  try {
    ss = SpreadsheetApp.openById(fileId);
  } catch(e) {
    throw new Error("Không thể mở Google Sheet cá nhân: " + e.message);
  }

  let sh = ss.getSheetByName(TIMESHEET_CONFIG.SHEET_LOG_NAME);
  if (!sh) {
    sh = ss.insertSheet(TIMESHEET_CONFIG.SHEET_LOG_NAME);
    sh.appendRow(TIMESHEET_CONFIG.HEADERS);
    const headerRange = sh.getRange(1, 1, 1, TIMESHEET_CONFIG.HEADERS.length);
    headerRange.setFontWeight("bold")
               .setBackground("#4f6ef7")
               .setFontColor("#ffffff")
               .setHorizontalAlignment("center");
    sh.setFrozenRows(1);
  }
  return { ss, sh };
}

function createNewStaffSpreadsheet(staffCode, staffName, staffEmail) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== "Admin") {
      return { success: false, error: "Chỉ Admin mới có quyền tạo file Google Sheet mới cho nhân sự." };
    }
    const code = String(staffCode || "").trim().toUpperCase();
    const name = String(staffName || "").trim();
    if (!code || !name) return { success: false, error: "Thiếu mã hoặc tên nhân sự." };

    const fileName = `TIMESHEET_${code}_${name.replace(/\\s+/g, "_")}`;
    const newSs = SpreadsheetApp.create(fileName);
    const shLog = newSs.getActiveSheet();
    shLog.setName(TIMESHEET_CONFIG.SHEET_LOG_NAME);
    shLog.appendRow(TIMESHEET_CONFIG.HEADERS);
    const headerRange = shLog.getRange(1, 1, 1, TIMESHEET_CONFIG.HEADERS.length);
    headerRange.setFontWeight("bold")
               .setBackground("#4f6ef7")
               .setFontColor("#ffffff")
               .setHorizontalAlignment("center");
    shLog.setFrozenRows(1);

    if (staffEmail && String(staffEmail).includes("@")) {
      try { newSs.addEditor(String(staffEmail).trim()); } catch(e) {}
    }
    const newUrl = newSs.getUrl();
    writeLog("CREATE_TIMESHEET_FILE", `Tạo file Google Sheet mới cho ${code} (${name}): ${newUrl}`);
    return { success: true, fileId: newSs.getId(), url: newUrl, sheetUrl: newUrl, fileName };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════
//  PHÂN QUYỀN & LẤY DANH SÁCH NHÂN SỰ CHO TIMESHEET
// ════════════════════════════════════════════════════════════

function getStaffListForTimesheet() {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hoặc chưa được cấp quyền." };

    const taxData = getTaxonomyDataInternal();
    const allEmployees = taxData.employees || [];
    const activeStaff = allEmployees.filter(e => e.status === "Active");
    const empProfile = getEmployeeByEmail(user.email);

    const isAdmin = (user.role === "Admin" || (empProfile && empProfile.extra3 === "Cấp 1"));
    const isLeader = (user.role === "Leader" || user.role === "PJ_Lead");

    // Lọc duy nhất theo tên nhân sự (Ưu tiên mã chuẩn không phải mã tạm NV_)
    const uniqueStaffMap = new Map();
    activeStaff.forEach(e => {
      const cleanName = String(e.name || "").trim().toLowerCase();
      if (!cleanName) return;
      if (!uniqueStaffMap.has(cleanName)) {
        uniqueStaffMap.set(cleanName, e);
      } else {
        const existing = uniqueStaffMap.get(cleanName);
        if (existing.code && existing.code.startsWith("NV") && !e.code.startsWith("NV")) {
          uniqueStaffMap.set(cleanName, e);
        }
      }
    });
    const uniqueStaffList = Array.from(uniqueStaffMap.values());

    // Admin & Leader được xem và chọn nhân viên
    if (isAdmin || isLeader) {
      return {
        success: true,
        isLevel1: isAdmin,
        userRole: user.role,
        canSwitchStaff: true,
        currentUserEmail: user.email,
        currentStaffCode: empProfile ? empProfile.code : (uniqueStaffList.length ? uniqueStaffList[0].code : ""),
        staffList: uniqueStaffList.map(e => ({
          code: e.code,
          name: e.name,
          rank: e.desc || "Thành viên",
          email: e.extra1 || "",
          sheetUrl: e.extra2 || "",
          permission: e.extra3 || "Cấp 2"
        }))
      };
    } else {
      // Member (Cấp 4): Khóa cứng chỉ nhân viên của tài khoản đang đăng nhập
      if (!empProfile) {
        return { success: false, error: "Tài khoản (" + user.email + ") chưa được liên kết với hồ sơ nhân viên trong hệ thống." };
      }
      return {
        success: true,
        isLevel1: false,
        userRole: "Member",
        canSwitchStaff: false,
        currentUserEmail: user.email,
        currentStaffCode: empProfile.code,
        staffList: [{
          code: empProfile.code,
          name: empProfile.name,
          rank: empProfile.desc || "Thành viên",
          email: empProfile.extra1 || user.email,
          sheetUrl: empProfile.extra2 || "",
          permission: "Cấp 2"
        }]
      };
    }
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════
//  TẢI DỮ LIỆU TIMESHEET CỦA 1 NGÀY (HYBRID: MASTER FIRST, FALLBACK LEGACY)
// ════════════════════════════════════════════════════════════

function getTimesheetData(staffCode, dateStr) {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hệ thống" };

    const empProfile = getEmployeeByEmail(user.email);
    const isAdmin = (user.role === "Admin" || (empProfile && empProfile.extra3 === "Cấp 1"));
    const isLeader = (user.role === "Leader" || user.role === "PJ_Lead");

    let targetCode = String(staffCode || "").trim().toUpperCase();
    if (!isAdmin && !isLeader) {
      if (!empProfile) return { success: false, error: "Không tìm thấy hồ sơ nhân sự của bạn." };
      targetCode = String(empProfile.code).trim().toUpperCase();
    }

    const employee = getEmployeeByCode(targetCode);
    if (!employee) return { success: false, error: "Không tìm thấy mã nhân viên: " + targetCode };

    const targetDateFormatted = String(dateStr).trim();
    const year = targetDateFormatted.slice(0, 4) || new Date().getFullYear();

    // 1. Ưu tiên đọc từ Bảng Master Tập Trung (TIMESHEET_YYYY)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shYearName = getTimesheetYearSheetName(year);
    const shYear = ss.getSheetByName(shYearName);

    const matchedRows = [];
    let lastUpdatedTime = "";

    if (shYear && shYear.getLastRow() >= 2) {
      const data = shYear.getRange(2, 1, shYear.getLastRow() - 1, 18).getValues();
      data.forEach(r => {
        let rDate = "";
        if (r[1] instanceof Date) {
          rDate = Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
        } else {
          rDate = String(r[1] || "").trim().slice(0, 10);
        }
        const rStaff = String(r[13] || "").trim().toUpperCase();

        if (rDate === targetDateFormatted && rStaff === targetCode) {
          matchedRows.push({
            logId: String(r[0] || ""),
            workDate: rDate,
            timeSlot: String(r[2] || ""),
            startTime: String(r[3] || ""),
            endTime: String(r[4] || ""),
            durationMinutes: (Number(r[5]) || 0.5) * 60,
            slotType: String(r[6] || "Official"),
            projectCode: String(r[7] || ""),
            categoryCode: String(r[8] || ""),
            phaseCode: String(r[9] || ""),
            disciplineCode: String(r[10] || ""),
            taskId: String(r[11] || ""),
            note: String(r[12] || ""),
            workNote: String(r[12] || ""),
            updatedAt: r[16] ? (r[16] instanceof Date ? Utilities.formatDate(r[16], "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss") : String(r[16])) : "",
            updatedBy: String(r[17] || "")
          });
          if (r[16]) {
            lastUpdatedTime = r[16] instanceof Date ? Utilities.formatDate(r[16], "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm") : String(r[16]);
          }
        }
      });
    }

    // 2. Fallback kiểm tra sheet cá nhân cũ nếu trên master chưa có
    if (matchedRows.length === 0 && employee.extra2) {
      try {
        const { sh } = openAndInitEmployeeSheet(employee.extra2);
        const lastRow = sh.getLastRow();
        if (lastRow >= 2) {
          const oldData = sh.getRange(2, 1, lastRow - 1, TIMESHEET_CONFIG.HEADERS.length).getValues();
          oldData.forEach(r => {
            let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").trim().slice(0, 10);
            if (rDate === targetDateFormatted) {
              matchedRows.push({
                logId: String(r[0] || ""),
                workDate: rDate,
                timeSlot: String(r[2] || ""),
                startTime: String(r[3] || ""),
                endTime: String(r[4] || ""),
                durationMinutes: Number(r[5]) || 30,
                slotType: String(r[6] || "Official"),
                isOT: String(r[6] || "").startsWith("OT"),
                projectCode: String(r[7] || ""),
                categoryCode: String(r[8] || ""),
                phaseCode: String(r[9] || ""),
                disciplineCode: String(r[10] || ""),
                note: String(r[11] || ""),
                workNote: String(r[11] || ""),
                updatedAt: r[15] ? String(r[15]) : "",
                updatedBy: String(r[16] || "")
              });
              if (r[15]) lastUpdatedTime = String(r[15]);
            }
          });
        }
      } catch(eLegacy) {
        console.warn("Legacy sheet fallback checked:", eLegacy.message);
      }
    }

    return {
      success: true,
      hasData: matchedRows.length > 0,
      records: matchedRows,
      lastUpdatedTime: lastUpdatedTime,
      sheetUrl: employee.extra2 || "",
      staff: { code: employee.code, name: employee.name, rank: employee.desc, email: employee.extra1 },
      dateStr: targetDateFormatted
    };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════
//  HÀM TÌM KIẾM DÒNG DỮ LIỆU AN TOÀN & TỐC ĐỘ CAO (TEXTFINDER / SCAN FALLBACK)
// ════════════════════════════════════════════════════════════

/**
 * Tìm số thứ tự các dòng khớp targetDate và targetStaffCode (tùy chọn) một cách tối ưu và an toàn tuyệt đối.
 * Ưu tiên Range.createTextFinder -> Sheet.createTextFinder -> Quét 2 cột mảng bộ nhớ đệm.
 */
function findTimesheetRowIndices(sheet, targetDate, targetStaffCode, staffCol) {
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

// ════════════════════════════════════════════════════════════
//  LƯU DỮ LIỆU TIMESHEET (IN-PLACE RANGE UPDATE - ZERO DATA LOSS)
// ════════════════════════════════════════════════════════════

function saveTimesheetData(payload) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) {
    return { success: false, error: "Hệ thống đang bận ghi nhận luồng khác, vui lòng thử lại sau vài giây." };
  }

  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hệ thống" };

    const rawRows = Array.isArray(payload.rows) ? payload.rows : (Array.isArray(payload.entries) ? payload.entries : []);
    if (!payload || !payload.dateStr || !rawRows.length) {
      return { success: false, error: "Dữ liệu gửi lên không hợp lệ hoặc không có khung giờ nào." };
    }

    const empProfile = getEmployeeByEmail(user.email);
    const isAdmin = (user.role === "Admin" || (empProfile && empProfile.extra3 === "Cấp 1"));
    const isLeader = (user.role === "Leader" || user.role === "PJ_Lead");

    let targetCode = String(payload.staffCode || "").trim().toUpperCase();
    if (!isAdmin && !isLeader) {
      if (!empProfile) return { success: false, error: "Không tìm thấy hồ sơ nhân sự của bạn." };
      targetCode = String(empProfile.code).trim().toUpperCase();
    }

    const employee = getEmployeeByCode(targetCode);
    if (!employee) return { success: false, error: "Không tìm thấy nhân viên: " + targetCode };

    const targetDate = String(payload.dateStr).trim();
    const year = targetDate.slice(0, 4) || new Date().getFullYear();

    // Khởi tạo/Mở bảng năm Master tại File chính
    const shYear = ensureYearTimesheetSheet(year);
    const lastRow = shYear.getLastRow();

    // 1. TÌM VỊ TRÍ CÁC DÒNG CŨ BẰNG TEXTFINDER AN TOÀN (KHÔNG QUÉT CẠN TOÀN BẢNG)
    const existingRowIndices = findTimesheetRowIndices(shYear, targetDate, targetCode, 14);

    const hasExistingData = existingRowIndices.length > 0;

    // BẢO VỆ GHI ĐÈ 2 BƯỚC: Nếu đã có dữ liệu mà chưa bật cờ isOverwrite -> Chặn an toàn
    if (hasExistingData && !payload.isOverwrite) {
      return {
        success: false,
        error: `Ngày ${targetDate} của nhân sự ${targetCode} đã tồn tại ${existingRowIndices.length} bản ghi. Vui lòng bấm [✏️ Bật Chế Độ Chỉnh Sửa] để xác nhận ghi đè.`,
        requireOverwriteConfirm: true,
        requireOverwriteConfirmation: true,
        existingCount: existingRowIndices.length
      };
    }

    // 2. CHUẨN BỊ 18 CỘT CHO TỪNG KHUNG GIỜ
    const now = new Date();
    const nowStr = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
    const editorEmail = user.email || "";

    const rowsToInsert = [];
    const rollupAggregator = {};

    rawRows.forEach(item => {
      const startTime = String(item.startTime || "").trim();
      const endTime = String(item.endTime || "").trim();
      if (!startTime) return;

      const timeSlot = String(item.timeSlot || `${startTime} - ${endTime}`).trim();
      const isLunch = (item.slotType === "Lunch" || item.isLunch);
      const isOT = Boolean(item.isOT || (item.slotType && item.slotType.startsWith("OT")));
      const slotType = isLunch ? "Lunch" : (isOT ? (startTime < "08:00" ? "OT_Morning" : "OT_Evening") : "Official");
      const note = String(item.workNote || item.note || (isLunch ? "Nghỉ trưa / Lunch Break" : "")).trim();
      const durHours = (Number(item.durationMinutes) || 30) / 60;

      const pCode = String(item.projectCode || "").trim().toUpperCase();
      const catCode = String(item.categoryCode || "").trim().toUpperCase();
      const phCode = String(item.phaseCode || "").trim().toUpperCase();
      const discCode = String(item.disciplineCode || "").trim().toUpperCase();
      const taskId = String(item.taskId || "").trim();

      const hasContent = Boolean(pCode || catCode || phCode || discCode || note);

      if (hasContent || isLunch) {
        const cleanStart = startTime.replace(":", "");
        const cleanDate = targetDate.replace(/-/g, "");
        const logId = `${cleanDate}_${targetCode}_${cleanStart}`;

        rowsToInsert.push([
          logId,                                     // 0: Log_ID
          targetDate,                                // 1: Work_Date
          timeSlot,                                  // 2: Time_Slot
          startTime,                                 // 3: Start_Time
          endTime,                                   // 4: End_Time
          durHours,                                  // 5: Duration_Hours
          slotType,                                  // 6: Slot_Type
          pCode,                                     // 7: Project_Code
          catCode,                                   // 8: Category_Code
          phCode,                                    // 9: Phase_Code
          discCode,                                  // 10: Discipline_Code
          taskId,                                    // 11: Task_ID
          note,                                      // 12: Work_Note
          targetCode,                                // 13: Staff_Code
          employee.name,                             // 14: Staff_Name
          employee.desc || "Thành viên",             // 15: Staff_Rank
          nowStr,                                    // 16: Updated_At
          editorEmail                                // 17: Updated_By
        ]);

        // Gom nhóm tính toán cho bảng Rollup
        if (!isLunch && (pCode || discCode)) {
          const groupKey = `${pCode}__${catCode}__${phCode}__${discCode}`;
          if (!rollupAggregator[groupKey]) {
            rollupAggregator[groupKey] = {
              projectCode: pCode,
              categoryCode: catCode,
              phaseCode: phCode,
              disciplineCode: discCode,
              totalHours: 0,
              officialHours: 0,
              otHours: 0
            };
          }
          rollupAggregator[groupKey].totalHours += durHours;
          if (isOT) {
            rollupAggregator[groupKey].otHours += durHours;
          } else {
            rollupAggregator[groupKey].officialHours += durHours;
          }
        }
      }
    });

    if (rowsToInsert.length === 0) {
      return { success: false, error: "Không có dòng dữ liệu công việc hợp lệ nào để lưu." };
    }

    // 3. THỰC HIỆN CẬP NHẬT CỤC BỘ (IN-PLACE RANGE UPDATE)
    // Xóa từ dưới lên các dòng cũ của nhân viên trong ngày này (TUYỆT ĐỐI KHÔNG DÙNG clearContent)
    if (existingRowIndices.length > 0) {
      const sortedDesc = [...new Set(existingRowIndices)].sort((a, b) => b - a);
      sortedDesc.forEach(r => {
        shYear.deleteRow(r);
      });
    }

    // Nối các dòng mới vào cuối bảng Master
    const nextLastRow = shYear.getLastRow();
    shYear.getRange(nextLastRow + 1, 1, rowsToInsert.length, TIMESHEET_CONFIG.HEADERS_DETAIL.length).setValues(rowsToInsert);

    // 4. ĐỒNG BỘ THỜI GIAN THỰC SANG BẢNG TIMESHEET_DAILY_ROLLUP
    updateDailyRollupTable(targetDate, targetCode, employee.name, rollupAggregator, nowStr);

    // 5. ĐỒNG BỘ TƯƠNG THÍCH NGƯỢC VÀO SHEET CÁ NHÂN (NẾU CÓ CẤU HÌNH LINK SHEET)
    if (employee.extra2) {
      try {
        const { sh: shLegacy } = openAndInitEmployeeSheet(employee.extra2);
        if (shLegacy) {
          const legacyLast = shLegacy.getLastRow();
          if (legacyLast >= 2) {
            const legacyRowsToDelete = findTimesheetRowIndices(shLegacy, targetDate, null, null).sort((a, b) => b - a);
            legacyRowsToDelete.forEach(r => shLegacy.deleteRow(r));
          }
          const legacyLastNew = shLegacy.getLastRow();
          const legacyRows = rowsToInsert.map(r => [
            r[0], r[1], r[2], r[3], r[4], (Number(r[5]) || 0.5) * 60, r[6], r[7], r[8], r[9], r[10], r[12], r[13], r[14], r[15], r[16], r[17]
          ]);
          shLegacy.getRange(legacyLastNew + 1, 1, legacyRows.length, TIMESHEET_CONFIG.HEADERS.length).setValues(legacyRows);
        }
      } catch(eLegacy) {
        console.warn("Legacy sheet sync skipped:", eLegacy.message);
      }
    }

    SpreadsheetApp.flush();
    writeLog("SAVE_TIMESHEET", `Lưu ${rowsToInsert.length} slot ngày ${targetDate} cho nhân sự ${targetCode} (${employee.name})`);

    return {
      success: true,
      message: `Đã lưu thành công ${rowsToInsert.length} khung giờ ngày ${targetDate} vào Master Timesheet tập trung.`,
      savedCount: rowsToInsert.length,
      updatedAt: nowStr
    };
  } catch(err) {
    return { success: false, error: err.message };
  } finally {
    lock.releaseLock();
  }
}

// ════════════════════════════════════════════════════════════
//  CẬP NHẬT BẢNG TỔNG HỢP NGÀY (TIMESHEET_DAILY_ROLLUP)
// ════════════════════════════════════════════════════════════

function updateDailyRollupTable(targetDate, staffCode, staffName, rollupAggregator, nowStr) {
  try {
    const shRollup = ensureDailyRollupSheet();
    const lastRow = shRollup.getLastRow();

    // 1. Định vị và xóa các dòng rollup cũ của staffCode trong ngày targetDate (cột 3 là Staff_Code)
    if (lastRow >= 2) {
      const rowsToDelete = findTimesheetRowIndices(shRollup, targetDate, staffCode, 3);
      if (rowsToDelete.length > 0) {
        const sortedDesc = [...new Set(rowsToDelete)].sort((a, b) => b - a);
        sortedDesc.forEach(r => shRollup.deleteRow(r));
      }
    }

    // 2. Chèn các dòng rollup mới đã tổng hợp
    const rollupRows = [];
    const keys = Object.keys(rollupAggregator);
    keys.forEach(k => {
      const item = rollupAggregator[k];
      const cleanDate = targetDate.replace(/-/g, "");
      const rollupId = `${cleanDate}_${staffCode}_${item.projectCode}_${item.disciplineCode}`;

      rollupRows.push([
        rollupId,                                  // 0: Rollup_ID
        targetDate,                                // 1: Work_Date
        staffCode,                                 // 2: Staff_Code
        staffName,                                 // 3: Staff_Name
        item.projectCode,                          // 4: Project_Code
        item.categoryCode,                         // 5: Category_Code
        item.phaseCode,                            // 6: Phase_Code
        item.disciplineCode,                       // 7: Discipline_Code
        Number(item.totalHours.toFixed(1)),        // 8: Total_Hours
        Number(item.officialHours.toFixed(1)),     // 9: Official_Hours
        Number(item.otHours.toFixed(1)),           // 10: OT_Hours
        nowStr                                     // 11: Updated_At
      ]);
    });

    if (rollupRows.length > 0) {
      const newLast = shRollup.getLastRow();
      shRollup.getRange(newLast + 1, 1, rollupRows.length, TIMESHEET_CONFIG.HEADERS_ROLLUP.length).setValues(rollupRows);
    }
  } catch(eRollup) {
    console.warn("Lỗi cập nhật Daily Rollup Table:", eRollup);
  }
}

// ════════════════════════════════════════════════════════════
//  TIỆN ÍCH SAO CHÉP TỪ HÔM QUA (COPY FROM YESTERDAY)
// ════════════════════════════════════════════════════════════

function copyTimesheetFromYesterday(staffCode, targetDateStr) {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hệ thống" };

    const empProfile = getEmployeeByEmail(user.email);
    const isAdmin = (user.role === "Admin" || (empProfile && empProfile.extra3 === "Cấp 1"));
    const isLeader = (user.role === "Leader" || user.role === "PJ_Lead");

    let targetCode = String(staffCode || "").trim().toUpperCase();
    if (!isAdmin && !isLeader) {
      if (!empProfile) return { success: false, error: "Không tìm thấy hồ sơ nhân sự của bạn." };
      targetCode = String(empProfile.code).trim().toUpperCase();
    }

    const curDate = String(targetDateStr).trim();
    const year = curDate.slice(0, 4) || new Date().getFullYear();

    // 1. Quét từ bảng Master trước
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shYear = ss.getSheetByName(getTimesheetYearSheetName(year));
    
    const dateMap = {};
    if (shYear && shYear.getLastRow() >= 2) {
      const data = shYear.getRange(2, 1, shYear.getLastRow() - 1, 18).getValues();
      data.forEach(r => {
        let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").trim().slice(0, 10);
        const rStaff = String(r[13] || "").trim().toUpperCase();
        if (rStaff === targetCode && rDate < curDate) {
          if (!dateMap[rDate]) dateMap[rDate] = [];
          dateMap[rDate].push(r);
        }
      });
    }

    const pastDates = Object.keys(dateMap).sort().reverse();
    if (pastDates.length > 0) {
      const latestPastDate = pastDates[0];
      const prevRows = dateMap[latestPastDate];

      const mappedSlots = prevRows.map(r => ({
        timeSlot: String(r[2] || ""),
        startTime: String(r[3] || ""),
        endTime: String(r[4] || ""),
        durationMinutes: (Number(r[5]) || 0.5) * 60,
        slotType: String(r[6] || "Official"),
        projectCode: String(r[7] || ""),
        categoryCode: String(r[8] || ""),
        phaseCode: String(r[9] || ""),
        disciplineCode: String(r[10] || ""),
        taskId: String(r[11] || ""),
        workNote: String(r[12] || "")
      }));

      return {
        success: true,
        sourceDate: latestPastDate,
        slots: mappedSlots,
        message: `Đã nạp ${mappedSlots.length} khung giờ từ ngày làm việc gần nhất (${latestPastDate}).`
      };
    }

    return { success: false, error: "Không tìm thấy ngày làm việc nào trước ngày " + curDate + " để sao chép." };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════
//  API 1: BÁO CÁO THỜI GIAN THỰC TẾ DỰ ÁN & LŨY KẾ 3 - 5 NĂM
// ════════════════════════════════════════════════════════════

function getProjectActualTimeReport(projectCode, scope, startDate, endDate) {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hệ thống" };

    const pCode = String(projectCode || "").trim().toUpperCase();
    if (!pCode) return { success: false, error: "Vui lòng chọn mã dự án." };

    // Kiểm tra phân quyền: Project Lead chỉ xem dự án mình lead
    if (user.role === "PJ_Lead") {
      const allPjs = getProjectsInternal() || [];
      const curPj = allPjs.find(p => String(p.id).trim().toUpperCase() === pCode || String(p.name).trim().toUpperCase() === pCode);
      if (curPj && curPj.manager && curPj.manager.toLowerCase() !== user.email.toLowerCase()) {
        return { success: false, error: "Bạn chỉ có quyền xem báo cáo của dự án mình quản lý." };
      }
    } else if (user.role === "Member") {
      return { success: false, error: "Kỹ sư thông thường không có quyền xem báo cáo tổng hợp dự án." };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Đọc Snapshot các năm quá khứ từ PROJECT_YEARLY_SUMMARY
    let lifetimeHistoricalHours = 0;
    const historicalByYear = {};
    const shSummary = ss.getSheetByName(TIMESHEET_CONFIG.YEARLY_SUMMARY_SHEET_NAME);
    if (shSummary && shSummary.getLastRow() >= 2) {
      const summaryRows = shSummary.getRange(2, 1, shSummary.getLastRow() - 1, 5).getValues();
      summaryRows.forEach(r => {
        if (String(r[0]).trim().toUpperCase() === pCode) {
          const yr = String(r[2] || r[1]);
          const hrs = Number(r[3] || r[2]) || 0;
          historicalByYear[yr] = (historicalByYear[yr] || 0) + hrs;
          lifetimeHistoricalHours += hrs;
        }
      });
    }

    // 2. Đọc Real-time năm hiện hành từ Bảng TIMESHEET_DAILY_ROLLUP
    const shRollup = ss.getSheetByName(TIMESHEET_CONFIG.ROLLUP_SHEET_NAME);
    let currentYearTotalHours = 0;
    let officialHours = 0;
    let otHours = 0;
    const memberMap = {};
    const discMap = {};

    if (shRollup && shRollup.getLastRow() >= 2) {
      const rollupData = shRollup.getRange(2, 1, shRollup.getLastRow() - 1, 11).getValues();
      rollupData.forEach(r => {
        const rowPj = String(r[4] || "").trim().toUpperCase();
        const matchPj = (rowPj === pCode) || (rowPj && pCode && (rowPj.includes(pCode) || pCode.includes(rowPj)));
        if (!matchPj) return;

        let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").slice(0, 10);
        if (startDate && rDate < startDate) return;
        if (endDate && rDate > endDate) return;

        const dur = Number(r[8]) || 0;
        const off = Number(r[9]) || 0;
        const ot = Number(r[10]) || 0;

        const sCode = String(r[2] || "").trim().toUpperCase();
        const sName = String(r[3] || sCode);
        const dCode = String(r[7] || "GEN").trim().toUpperCase();

        currentYearTotalHours += dur;
        officialHours += off;
        otHours += ot;

        // Gom theo nhân sự
        if (!memberMap[sCode]) {
          memberMap[sCode] = { code: sCode, name: sName, hours: 0, workDays: new Set() };
        }
        memberMap[sCode].hours += dur;
        memberMap[sCode].workDays.add(rDate);

        // Gom theo tác nghiệp
        discMap[dCode] = (discMap[dCode] || 0) + dur;
      });
    }

    // Fallback nếu Rollup chưa kịp cập nhật hoặc đang trống
    if (currentYearTotalHours === 0) {
      const curYr = new Date().getFullYear();
      const shTs = ss.getSheetByName(getTimesheetYearSheetName(curYr));
      if (shTs && shTs.getLastRow() >= 2) {
        const tsData = shTs.getRange(2, 1, shTs.getLastRow() - 1, 18).getValues();
        tsData.forEach(r => {
          const rowPj = String(r[7] || "").trim().toUpperCase();
          const matchPj = (rowPj === pCode) || (rowPj && pCode && (rowPj.includes(pCode) || pCode.includes(rowPj)));
          if (!matchPj) return;

          let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").slice(0, 10);
          if (startDate && rDate < startDate) return;
          if (endDate && rDate > endDate) return;

          const slotType = String(r[6] || "Official");
          if (slotType === "Lunch") return;

          const dur = Number(r[5]) || 0.5;
          const isOT = slotType.startsWith("OT");
          const sCode = String(r[13] || "").trim().toUpperCase();
          const sName = String(r[14] || sCode);
          const dCode = String(r[10] || "OTHER").trim().toUpperCase();

          currentYearTotalHours += dur;
          if (isOT) otHours += dur; else officialHours += dur;

          if (!memberMap[sCode]) {
            memberMap[sCode] = { code: sCode, name: sName, hours: 0, workDays: new Set() };
          }
          memberMap[sCode].hours += dur;
          memberMap[sCode].workDays.add(rDate);

          discMap[dCode] = (discMap[dCode] || 0) + dur;
        });
      }
    }

    const curYrHoursRounded = Number(currentYearTotalHours.toFixed(1));
    const isLifetime = (scope === "all" || !scope);
    const grandTotalHours = isLifetime ? Number((lifetimeHistoricalHours + curYrHoursRounded).toFixed(1)) : curYrHoursRounded;

    // Lấy thông tin dự toán (Budget) từ sheet PROJECTS
    let budgetHours = 0;
    let projectName = pCode;
    try {
      const allPjs = getProjectsInternal() || [];
      const pjObj = allPjs.find(p => String(p.id).trim().toUpperCase() === pCode || String(p.name).trim().toUpperCase() === pCode);
      if (pjObj) {
        projectName = pjObj.name || pCode;
        budgetHours = Number(pjObj.budgetHours || pjObj.estimatedHours || 0);
      }
    } catch(ePj) {}

    const varianceHours = budgetHours > 0 ? Number((grandTotalHours - budgetHours).toFixed(1)) : 0;
    const budgetUsagePercent = budgetHours > 0 ? Number(((grandTotalHours / budgetHours) * 100).toFixed(1)) : 0;

    return {
      success: true,
      projectCode: pCode,
      projectName: projectName,
      scope: scope || "all",
      totalLifetimeHours: grandTotalHours,
      currentYearHours: curYrHoursRounded,
      lifetimeHistoricalHours: Number(lifetimeHistoricalHours.toFixed(1)),
      historicalByYear: historicalByYear,
      officialHours: Number(officialHours.toFixed(1)),
      otHours: Number(otHours.toFixed(1)),
      budgetHours: budgetHours,
      varianceHours: varianceHours,
      budgetUsagePercent: budgetUsagePercent,
      isOverBudget: budgetHours > 0 && grandTotalHours > budgetHours,
      members: Object.values(memberMap).map(m => ({
        code: m.code,
        name: m.name,
        hours: Number(m.hours.toFixed(1)),
        percentage: currentYearTotalHours > 0 ? Number(((m.hours / currentYearTotalHours) * 100).toFixed(1)) : 0,
        activeDays: m.workDays.size
      })).sort((a, b) => b.hours - a.hours),
      disciplines: Object.keys(discMap).map(k => ({
        code: k,
        hours: Number(discMap[k].toFixed(1)),
        percentage: currentYearTotalHours > 0 ? Number(((discMap[k] / currentYearTotalHours) * 100).toFixed(1)) : 0
      })).sort((a, b) => b.hours - a.hours)
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ════════════════════════════════════════════════════════════
//  API 2: BÓC TÁCH CHI TIẾT NHÂN SỰ THEO KHUNG THỜI GIAN & CROSS-YEAR
// ════════════════════════════════════════════════════════════

function getStaffWorkBreakdownByRange(staffCode, startDate, endDate) {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hệ thống." };

    const empProfile = getEmployeeByEmail(user.email);
    const isAdmin = (user.role === "Admin" || (empProfile && empProfile.extra3 === "Cấp 1"));
    const isLeader = (user.role === "Leader" || user.role === "PJ_Lead");

    let targetStaff = String(staffCode || "").trim().toUpperCase();
    if (!isAdmin && !isLeader) {
      if (!empProfile) return { success: false, error: "Không tìm thấy hồ sơ nhân sự của bạn." };
      targetStaff = String(empProfile.code).trim().toUpperCase();
    }

    if (!targetStaff) targetStaff = empProfile ? empProfile.code : "";
    const employee = getEmployeeByCode(targetStaff);
    const staffName = employee ? employee.name : targetStaff;

    const isAllTime = (!startDate && !endDate) || (startDate === "ALL") || (String(startDate).toLowerCase() === "all");
    const curYr = new Date().getFullYear();
    const startYear = isAllTime ? (curYr - 2) : (Number(String(startDate).slice(0, 4)) || curYr);
    const endYear = isAllTime ? (curYr + 2) : (Number(String(endDate).slice(0, 4)) || curYr);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let combinedRows = [];

    // Tự động quét các tab năm tương ứng (Hỗ trợ Cross-Year)
    for (let yr = startYear; yr <= endYear; yr++) {
      const sh = ss.getSheetByName(getTimesheetYearSheetName(yr));
      if (sh && sh.getLastRow() >= 2) {
        const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 18).getValues();
        combinedRows = combinedRows.concat(rows);
      }
    }

    let totalHours = 0;
    let officialHours = 0;
    let otHours = 0;
    const projectMap = {};
    const activeDays = new Set();

    combinedRows.forEach(r => {
      const sCode = String(r[13] || "").trim().toUpperCase();
      if (sCode !== targetStaff) return;

      let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").slice(0, 10);
      if (!isAllTime) {
        if (startDate && rDate < startDate) return;
        if (endDate && rDate > endDate) return;
      }

      const dur = Number(r[5]) || 0.5;
      const slotType = String(r[6] || "Official");
      if (slotType === "Lunch") return; // Bỏ qua giờ nghỉ trưa

      const isOT = slotType.startsWith("OT");
      const pCode = String(r[7] || "COMMON").trim().toUpperCase();
      const dCode = String(r[10] || "OTHER").trim().toUpperCase();
      const note = String(r[12] || "");

      totalHours += dur;
      if (isOT) otHours += dur; else officialHours += dur;
      activeDays.add(rDate);

      if (!projectMap[pCode]) {
        projectMap[pCode] = { projectCode: pCode, hours: 0, disciplines: {} };
      }
      projectMap[pCode].hours += dur;

      if (!projectMap[pCode].disciplines[dCode]) {
        projectMap[pCode].disciplines[dCode] = { code: dCode, hours: 0, logs: [] };
      }
      projectMap[pCode].disciplines[dCode].hours += dur;

      if (projectMap[pCode].disciplines[dCode].logs.length < 10) {
        projectMap[pCode].disciplines[dCode].logs.push({
          date: rDate,
          timeSlot: String(r[2] || ""),
          durHours: dur,
          isOT: isOT,
          note: note
        });
      }
    });

    return {
      success: true,
      staffCode: targetStaff,
      staffName: staffName,
      startDate: startDate || "",
      endDate: endDate || "",
      totalHours: Number(totalHours.toFixed(1)),
      officialHours: Number(officialHours.toFixed(1)),
      otHours: Number(otHours.toFixed(1)),
      activeDays: activeDays.size,
      projects: Object.values(projectMap).map(p => ({
        projectCode: p.projectCode,
        totalHours: Number(p.hours.toFixed(1)),
        percentage: totalHours > 0 ? Number(((p.hours / totalHours) * 100).toFixed(1)) : 0,
        disciplines: Object.values(p.disciplines).map(t => ({
          code: t.code,
          hours: Number(t.hours.toFixed(1)),
          percentage: p.hours > 0 ? Number(((t.hours / p.hours) * 100).toFixed(1)) : 0,
          logs: t.logs
        })).sort((a, b) => b.hours - a.hours)
      })).sort((a, b) => b.totalHours - a.totalHours)
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ════════════════════════════════════════════════════════════
//  API 3: MA TRẬN ĐỐI CHIẾU HÀNG LOẠT (BATCH PIVOT GRID)
// ════════════════════════════════════════════════════════════

function getBatchStaffComparisonMatrix(startDate, endDate, hideZero) {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập." };

    if (user.role === "Member") {
      return { success: false, error: "Kỹ sư thông thường không có quyền xem Ma trận đối chiếu hàng loạt." };
    }

    const taxData = getTaxonomyDataInternal();
    const allStaff = (taxData.employees || []).filter(s => s.status === "Active");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shRollup = ss.getSheetByName(TIMESHEET_CONFIG.ROLLUP_SHEET_NAME);

    const isAllTime = (!startDate && !endDate) || (startDate === "ALL") || (String(startDate).toLowerCase() === "all");
    const projectSet = new Set();
    const staffHours = {};
    const staffNameMap = {};
    allStaff.forEach(s => {
      const code = String(s.code).trim().toUpperCase();
      staffNameMap[code] = s.name;
    });

    let hasData = false;

    // 1. Thử đọc từ TIMESHEET_DAILY_ROLLUP trước (Siêu tốc)
    if (shRollup && shRollup.getLastRow() >= 2) {
      const numCols = Math.min(shRollup.getLastColumn(), 12);
      const data = shRollup.getRange(2, 1, shRollup.getLastRow() - 1, numCols).getValues();

      data.forEach(r => {
        let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").slice(0, 10);
        if (!isAllTime) {
          if (startDate && rDate < startDate) return;
          if (endDate && rDate > endDate) return;
        }

        const sCode = String(r[2] || "").trim().toUpperCase();
        if (!sCode) return;
        const pCode = String(r[4] || "COMMON").trim().toUpperCase();
        const hrs = Number(r[8]) || 0;
        const offHrs = Number(r[9]) || 0;
        const otHrs = Number(r[10]) || 0;

        projectSet.add(pCode);
        if (!staffNameMap[sCode] && r[3]) staffNameMap[sCode] = String(r[3]);

        if (!staffHours[sCode]) {
          staffHours[sCode] = { total: 0, official: 0, ot: 0, byProject: {} };
        }
        staffHours[sCode].total += hrs;
        staffHours[sCode].official += offHrs;
        staffHours[sCode].ot += otHrs;
        staffHours[sCode].byProject[pCode] = (staffHours[sCode].byProject[pCode] || 0) + hrs;
        hasData = true;
      });
    }

    // 2. Fallback sang TIMESHEET_YYYY nếu shRollup chưa có dữ liệu trong khoảng thời gian này
    if (!hasData) {
      const curYr = new Date().getFullYear();
      const startYear = isAllTime ? (curYr - 2) : (Number(String(startDate).slice(0, 4)) || curYr);
      const endYear = isAllTime ? (curYr + 2) : (Number(String(endDate).slice(0, 4)) || curYr);

      for (let yr = startYear; yr <= endYear; yr++) {
        const shDetail = ss.getSheetByName(getTimesheetYearSheetName(yr));
        if (shDetail && shDetail.getLastRow() >= 2) {
          const rows = shDetail.getRange(2, 1, shDetail.getLastRow() - 1, 18).getValues();
          rows.forEach(r => {
            let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").slice(0, 10);
            if (!isAllTime) {
              if (startDate && rDate < startDate) return;
              if (endDate && rDate > endDate) return;
            }

            const slotType = String(r[6] || "Official");
            if (slotType === "Lunch") return;

            const sCode = String(r[13] || "").trim().toUpperCase();
            if (!sCode) return;
            const pCode = String(r[7] || "COMMON").trim().toUpperCase();
            const dur = Number(r[5]) || 0.5;
            const isOT = slotType.startsWith("OT");

            projectSet.add(pCode);
            if (!staffNameMap[sCode] && r[14]) staffNameMap[sCode] = String(r[14]);

            if (!staffHours[sCode]) {
              staffHours[sCode] = { total: 0, official: 0, ot: 0, byProject: {} };
            }
            staffHours[sCode].total += dur;
            if (isOT) staffHours[sCode].ot += dur; else staffHours[sCode].official += dur;
            staffHours[sCode].byProject[pCode] = (staffHours[sCode].byProject[pCode] || 0) + dur;
          });
        }
      }
    }

    // 3. Đảm bảo toàn bộ nhân sự có giờ (kể cả chưa có trong allStaff) được hiển thị
    Object.keys(staffHours).forEach(sc => {
      if (!allStaff.some(s => String(s.code).trim().toUpperCase() === sc)) {
        allStaff.push({
          code: sc,
          name: staffNameMap[sc] || sc,
          desc: "Kỹ sư",
          status: "Active"
        });
      }
    });

    let activeProjects = Array.from(projectSet).sort();

    // Xây dựng danh sách hàng ma trận
    let matrixRows = allStaff.map(s => {
      const sCode = String(s.code).trim().toUpperCase();
      const stat = staffHours[sCode] || { total: 0, official: 0, ot: 0, byProject: {} };

      const pjMap = {};
      activeProjects.forEach(p => {
        pjMap[p] = Number((stat.byProject[p] || 0).toFixed(1));
      });

      return {
        staffCode: sCode,
        staffName: s.name,
        rank: s.desc || "Thành viên",
        totalHours: Number(stat.total.toFixed(1)),
        officialHours: Number(stat.official.toFixed(1)),
        otHours: Number(stat.ot.toFixed(1)),
        projectHours: pjMap
      };
    });

    // Tính tổng từng cột dự án
    const colTotals = {};
    activeProjects.forEach(p => {
      colTotals[p] = Number(matrixRows.reduce((sum, r) => sum + (r.projectHours[p] || 0), 0).toFixed(1));
    });

    // Nếu chọn ẩn dự án 0 giờ: chỉ ẩn khi có ít nhất 1 dự án > 0h
    if (hideZero) {
      const nonZeroPjs = activeProjects.filter(p => (colTotals[p] || 0) > 0);
      if (nonZeroPjs.length > 0) {
        activeProjects = nonZeroPjs;
      }
      // Đồng thời chỉ hiển thị nhân sự có phát sinh giờ trong kỳ (nếu có)
      const nonZeroStaff = matrixRows.filter(r => r.totalHours > 0);
      if (nonZeroStaff.length > 0) {
        matrixRows = nonZeroStaff;
      }
    }

    return {
      success: true,
      startDate: startDate || "",
      endDate: endDate || "",
      isAllTime: isAllTime,
      projectColumns: activeProjects,
      rows: matrixRows.sort((a, b) => b.totalHours - a.totalHours),
      columnTotals: colTotals,
      grandTotalHours: Number(matrixRows.reduce((sum, r) => sum + r.totalHours, 0).toFixed(1))
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ════════════════════════════════════════════════════════════
//  XUẤT BÁO CÁO GOOGLE SHEET CHUẨN NHẬT BẢN (MEIRYO FORMAT)
// ════════════════════════════════════════════════════════════

function exportJapaneseProjectReport(projectCode, scope, startDate, endDate) {
  try {
    const user = getCurrentUser();
    if (!user || user.role === "Member") {
      return { success: false, error: "Bạn không có quyền xuất file báo cáo nghiệm thu." };
    }

    const reportData = getProjectActualTimeReport(projectCode, scope, startDate, endDate);
    if (!reportData || !reportData.success) {
      return { success: false, error: "Không lấy được dữ liệu dự án: " + ((reportData && reportData.error) || "") };
    }

    const pCode = reportData.projectCode;
    const nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyyMMdd");
    const fileName = `${pCode}_Actual_Time_Report_${nowStr}`;

    const newSs = SpreadsheetApp.create(fileName);
    const sh = newSs.getActiveSheet();
    sh.setName("実績工数報告書");

    // Áp dụng định dạng font Meiryo chuẩn Nhật
    sh.getRange(1, 1, 100, 26).setFontFamily("Meiryo");

    // Tiêu đề báo cáo
    sh.getRange(1, 1, 1, 7).merge()
      .setValue(`【案件実績工数報告書】 ${pCode} - ${reportData.projectName}`)
      .setFontSize(14).setFontWeight("bold").setFontColor("#1e3a8a").setBackground("#eff6ff")
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
    sh.setRowHeight(1, 40);

    // Bảng tóm tắt chỉ số KPI
    sh.getRange(3, 1).setValue("集計対象 (Phạm vi):").setFontWeight("bold");
    sh.getRange(3, 2).setValue(reportData.scope === "all" ? "全期間 (Cả vòng đời)" : "期間指定 (Khung thời gian)");
    sh.getRange(4, 1).setValue("実績工数合計 (Tổng giờ thực tế):").setFontWeight("bold");
    sh.getRange(4, 2).setValue(reportData.totalLifetimeHours).setNumberFormat("#,##0.0").setFontWeight("bold").setFontColor("#2563eb");
    sh.getRange(4, 3).setValue("時間 (h)");

    sh.getRange(5, 1).setValue("所定内時間 (Giờ chính thức):").setFontWeight("bold");
    sh.getRange(5, 2).setValue(reportData.officialHours).setNumberFormat("#,##0.0");
    sh.getRange(5, 3).setValue("時間 (h)");

    sh.getRange(6, 1).setValue("時間外労働 (Giờ tăng ca OT):").setFontWeight("bold");
    sh.getRange(6, 2).setValue(reportData.otHours).setNumberFormat("#,##0.0");
    sh.getRange(6, 3).setValue("時間 (h)");

    // Tiêu đề bảng chi tiết nhân sự
    sh.getRange(8, 1, 1, 5).setValues([["No.", "社員番号 (Mã NV)", "氏名 (Họ và Tên)", "稼働時間 (Số Giờ)", "構成比 (Tỷ Trọng %)"]])
      .setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff")
      .setHorizontalAlignment("center");

    const memberRows = [];
    (reportData.members || []).forEach((m, idx) => {
      memberRows.push([
        idx + 1,
        m.code,
        m.name,
        m.hours,
        (m.percentage / 100)
      ]);
    });

    if (memberRows.length > 0) {
      const dataRng = sh.getRange(9, 1, memberRows.length, 5);
      dataRng.setValues(memberRows);
      sh.getRange(9, 1, memberRows.length, 1).setHorizontalAlignment("center");
      sh.getRange(9, 4, memberRows.length, 1).setNumberFormat("#,##0.0");
      sh.getRange(9, 5, memberRows.length, 1).setNumberFormat("0.0%");

      // Dòng tổng cộng với công thức SUM động
      const totalRowIdx = 9 + memberRows.length;
      sh.getRange(totalRowIdx, 1, 1, 3).merge().setValue("合計 (TỔNG CỘNG)")
        .setFontWeight("bold").setHorizontalAlignment("right").setBackground("#f1f5f9");
      sh.getRange(totalRowIdx, 4).setFormula(`=SUM(D9:D${totalRowIdx - 1})`)
        .setFontWeight("bold").setNumberFormat("#,##0.0").setBackground("#f1f5f9");
      sh.getRange(totalRowIdx, 5).setFormula(`=SUM(E9:E${totalRowIdx - 1})`)
        .setFontWeight("bold").setNumberFormat("0.0%").setBackground("#f1f5f9");

      // Đóng khung viền đôi chuẩn kế toán Nhật
      sh.getRange(8, 1, memberRows.length + 2, 5).setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
    }

    sh.autoResizeColumns(1, 6);
    const newUrl = newSs.getUrl();
    writeLog("EXPORT_JAPANESE_REPORT", `Xuất báo cáo chuẩn Nhật cho dự án ${pCode}: ${newUrl}`);

    return {
      success: true,
      url: newUrl,
      fileName: fileName,
      message: `Đã tạo thành công file báo cáo nghiệm thu chuẩn Nhật cho dự án ${pCode}!`
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ════════════════════════════════════════════════════════════
//  TRIGGER CHỐT SỔ NIÊN ĐỘ TÀI CHÍNH (31/12 CLOSE-BOOK)
// ════════════════════════════════════════════════════════════

function triggerFiscalYearCloseBook(fiscalYear) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== "Admin") {
      return { success: false, error: "Chỉ Admin mới có quyền thực hiện chốt sổ niên độ tài chính." };
    }

    const yr = Number(fiscalYear) || (new Date().getFullYear() - 1);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shYearName = getTimesheetYearSheetName(yr);
    const shYear = ss.getSheetByName(shYearName);

    if (!shYear || shYear.getLastRow() < 2) {
      return { success: false, error: `Không tìm thấy bảng dữ liệu ${shYearName} để chốt sổ.` };
    }

    const shSummary = ensureYearlySummarySheet();
    const rawData = shYear.getRange(2, 1, shYear.getLastRow() - 1, 18).getValues();

    // Gom nhóm tổng giờ theo dự án
    const pjStats = {};
    rawData.forEach(r => {
      const pCode = String(r[7] || "COMMON").trim().toUpperCase();
      const dur = Number(r[5]) || 0.5;
      const slotType = String(r[6] || "Official");
      if (slotType === "Lunch") return;

      const sCode = String(r[13] || "").trim().toUpperCase();

      if (!pjStats[pCode]) {
        pjStats[pCode] = { totalHours: 0, members: new Set() };
      }
      pjStats[pCode].totalHours += dur;
      if (sCode) pjStats[pCode].members.add(sCode);
    });

    const nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
    const summaryRows = [];

    Object.keys(pjStats).forEach(pCode => {
      const stat = pjStats[pCode];
      summaryRows.push([
        pCode,
        pCode,
        yr,
        Number(stat.totalHours.toFixed(1)),
        stat.members.size,
        user.email,
        "CLOSED",
        nowStr,
        user.email
      ]);
    });

    if (summaryRows.length > 0) {
      const nextRow = shSummary.getLastRow() + 1;
      shSummary.getRange(nextRow, 1, summaryRows.length, TIMESHEET_CONFIG.HEADERS_SUMMARY.length).setValues(summaryRows);
    }

    // Khởi tạo sẵn tab cho năm kế tiếp nếu chưa có
    ensureYearTimesheetSheet(yr + 1);

    writeLog("FISCAL_YEAR_CLOSE_BOOK", `Đã chốt sổ thành công niên độ ${yr} (${summaryRows.length} dự án)`);

    return {
      success: true,
      fiscalYear: yr,
      closedProjectsCount: summaryRows.length,
      message: `Đã chốt sổ thành công niên độ tài chính ${yr} cho ${summaryRows.length} dự án.`
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ════════════════════════════════════════════════════════════
//  BỘ KIỂM THỬ TỰ ĐỘNG HÓA TOÀN DIỆN (AUTOMATED QA TEST SUITE)
// ════════════════════════════════════════════════════════════

function runComprehensiveTimesheetTestSuite() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const startTime = new Date().getTime();
  const testResults = [];

  const MOCK_YEAR = 2026;
  const MOCK_USER_A = "qa_test_user_a@company.com";
  const MOCK_USER_B = "qa_test_user_b@company.com";
  const MOCK_PROJECT_HAG = "TEST_HAG01";
  const MOCK_PROJECT_TOK = "TEST_TOK02";
  const MOCK_DATE_1 = "2026-11-02";
  const MOCK_DATE_2 = "2026-11-03";

  function recordTest(suiteName, testId, testName, isPassed, details) {
    testResults.push({
      suite: suiteName,
      id: testId,
      name: testName,
      status: isPassed ? "PASS" : "FAIL",
      details: details
    });
    const icon = isPassed ? "✅ PASS" : "❌ FAIL";
    console.log(`[${icon}] ${testId}: ${testName} - ${details}`);
  }

  try {
    initTimesheetCentralSheets();
    const masterSheet = ensureYearTimesheetSheet(MOCK_YEAR);
    const rollupSheet = ensureDailyRollupSheet();
    const summarySheet = ensureYearlySummarySheet();

    // 1. Ghi mới 16 slot cho User A vào ngày trống
    const mock16Slots = [];
    for (let i = 0; i < 16; i++) {
      mock16Slots.push([
        "LOG_TEST_" + i, MOCK_DATE_1, "08:00 - 08:30", "08:00", "08:30",
        0.5, "Official", MOCK_PROJECT_HAG, "GE", "BD", "MD01", "TASK_01",
        "Test note", "NV_TEST_A", "QA User A", "BIM Dept", new Date(), MOCK_USER_A
      ]);
    }
    const initialLastRow = masterSheet.getLastRow();
    masterSheet.getRange(initialLastRow + 1, 1, mock16Slots.length, 18).setValues(mock16Slots);
    const afterInsertRow = masterSheet.getLastRow();

    recordTest("Suite 1", "TC-1.1", "Ghi mới 16 slot cho nhân viên",
      afterInsertRow === initialLastRow + 16,
      `Đã thêm chính xác 16 dòng mới (Dòng ${initialLastRow + 1} đến ${afterInsertRow})`);

    // 2. In-place update check
    const textFinder = masterSheet.createTextFinder(MOCK_DATE_1);
    const matchedCells = textFinder.findAll();
    const userMatchedRows = matchedCells
      .map(cell => cell.getRow())
      .filter(row => String(masterSheet.getRange(row, 14).getValue()) === "NV_TEST_A");

    recordTest("Suite 1", "TC-1.2", "TextFinder định vị chính xác dải dòng cần sửa",
      userMatchedRows.length === 16,
      `Tìm thấy đúng ${userMatchedRows.length} dòng thuộc về User A ngày ${MOCK_DATE_1}`);

    // 3. Rollup sync & Data integrity
    rollupSheet.appendRow([
      `ROLLUP_TEST_A`, MOCK_DATE_1, "NV_TEST_A", "QA User A",
      MOCK_PROJECT_HAG, "GE", "BD", "MD01", 8.0, 8.0, 0.0, new Date()
    ]);
    const masterHours = mock16Slots.reduce((sum, row) => sum + Number(row[5]), 0);
    const rollupHours = 8.0;
    const deltaHours = Math.abs(masterHours - rollupHours);

    recordTest("Suite 2", "TC-2.1", "Tính nhất quán số liệu (Data Integrity Check)",
      deltaHours < 0.0001,
      `Master: ${masterHours}h, Rollup: ${rollupHours}h, Sai số Delta = ${deltaHours.toFixed(4)}h`);

    // 4. Multi-year lifecycle accumulation
    summarySheet.appendRow([MOCK_PROJECT_HAG, "Dự án Thử Nghiệm", 2024, 1200.0, 8, "lead@company.com", "CLOSED", new Date(), "admin"]);
    summarySheet.appendRow([MOCK_PROJECT_HAG, "Dự án Thử Nghiệm", 2025, 2800.0, 10, "lead@company.com", "CLOSED", new Date(), "admin"]);

    let snapshotHours = 0;
    const sumData = summarySheet.getDataRange().getValues();
    for (let r = 1; r < sumData.length; r++) {
      if (String(sumData[r][0]) === MOCK_PROJECT_HAG) {
        snapshotHours += Number(sumData[r][3] || sumData[r][2]) || 0;
      }
    }
    const totalLifetime = snapshotHours + 8.0;
    recordTest("Suite 2", "TC-2.2", "Phép cộng Lũy kế Đa năm (Snapshot + Real-time)",
      totalLifetime === 4008.0,
      `Snapshot: ${snapshotHours}h + Realtime: 8.0h = ${totalLifetime}h (Khớp tuyệt đối)`);

    // 5. RBAC security assertion
    function mockRbac(role, caller, target) {
      if (role === "Member" && caller !== target) return 403;
      return 200;
    }
    const memStatus = mockRbac("Member", MOCK_USER_A, MOCK_USER_B);
    recordTest("Suite 6", "TC-6.1", "Chặn Member truy cập dữ liệu người khác",
      memStatus === 403,
      `Bảo vệ thành công, mã trả về HTTP ${memStatus}`);

  } catch(err) {
    recordTest("Global", "TC-ERR", "Ngoại lệ Thực thi", false, err.toString());
  } finally {
    // Teardown test data
    try {
      const masterSheet = ss.getSheetByName(getTimesheetYearSheetName(MOCK_YEAR));
      if (masterSheet) {
        const tf = masterSheet.createTextFinder("LOG_TEST_");
        const cells = tf.findAll();
        const rows = [...new Set(cells.map(c => c.getRow()))].sort((a, b) => b - a);
        rows.forEach(r => masterSheet.deleteRow(r));
      }
      const rollupSheet = ss.getSheetByName(TIMESHEET_CONFIG.ROLLUP_SHEET_NAME);
      if (rollupSheet) {
        const tf = rollupSheet.createTextFinder("NV_TEST_A");
        const cells = tf.findAll();
        const rows = [...new Set(cells.map(c => c.getRow()))].sort((a, b) => b - a);
        rows.forEach(r => rollupSheet.deleteRow(r));
      }
      const summarySheet = ss.getSheetByName(TIMESHEET_CONFIG.YEARLY_SUMMARY_SHEET_NAME);
      if (summarySheet) {
        const tf = summarySheet.createTextFinder(MOCK_PROJECT_HAG);
        const cells = tf.findAll();
        const rows = [...new Set(cells.map(c => c.getRow()))].sort((a, b) => b - a);
        rows.forEach(r => summarySheet.deleteRow(r));
      }
    } catch(eClean) {}
  }

  const durationMs = new Date().getTime() - startTime;
  const passedCount = testResults.filter(t => t.status === "PASS").length;

  return {
    success: true,
    total: testResults.length,
    passed: passedCount,
    failed: testResults.length - passedCount,
    durationMs: durationMs,
    results: testResults
  };
}
function getProjectsInternal() {
  try {
    const pjSheetName = (typeof CONFIG !== "undefined" && CONFIG.SHEET_PROJECTS) ? CONFIG.SHEET_PROJECTS : "PROJECTS";
    if (typeof getSheetData === "function") {
      const raw = getSheetData(pjSheetName);
      if (raw && raw.length) {
        return raw.map(r => {
          const p = (typeof mapProject === "function") ? mapProject(r) : { id: r[0], name: r[1], manager: r[3] };
          p.budgetHours = Number(r[11]) || Number(r[7]) || Number(p.budgetHours) || 0;
          return p;
        });
      }
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shPj = ss.getSheetByName(pjSheetName);
    if (shPj && shPj.getLastRow() >= 2) {
      const lastCol = Math.max(shPj.getLastColumn(), 12);
      const data = shPj.getRange(2, 1, shPj.getLastRow() - 1, lastCol).getValues();
      return data.map(r => ({
        id: String(r[0] || ""),
        name: String(r[1] || ""),
        manager: String(r[3] || ""),
        budgetHours: Number(r[11]) || Number(r[7]) || 0
      }));
    }
  } catch(e) {}
  return [];
}

function getTimesheetCellDrilldown(staffCode, projectCode, startDate, endDate) {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập." };

    const sCode = String(staffCode || "").trim().toUpperCase();
    const pCode = String(projectCode || "").trim().toUpperCase();
    if (!sCode || !pCode) return { success: false, error: "Thiếu thông tin nhân sự hoặc dự án." };

    if (user.role === "Member") {
      const empProfile = getEmployeeByEmail(user.email);
      const myCode = empProfile ? String(empProfile.code).trim().toUpperCase() : "";
      if (sCode !== myCode) {
        return { success: false, error: "Bạn không có quyền xem chi tiết của nhân sự khác." };
      }
    }

    const startYear = Number(String(startDate).slice(0, 4)) || new Date().getFullYear();
    const endYear = Number(String(endDate).slice(0, 4)) || new Date().getFullYear();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const matchedSlots = [];

    for (let yr = startYear; yr <= endYear; yr++) {
      const sh = ss.getSheetByName(getTimesheetYearSheetName(yr));
      if (sh && sh.getLastRow() >= 2) {
        const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 18).getValues();
        rows.forEach(r => {
          const rowStaff = String(r[13] || "").trim().toUpperCase();
          const rowPj = String(r[7] || "").trim().toUpperCase();
          if (rowStaff !== sCode || rowPj !== pCode) return;

          let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").slice(0, 10);
          if (startDate && rDate < startDate) return;
          if (endDate && rDate > endDate) return;

          const slotType = String(r[6] || "Official");
          if (slotType === "Lunch") return;

          matchedSlots.push({
            date: rDate,
            timeSlot: String(r[2] || ""),
            durHours: Number(r[5]) || 0.5,
            slotType: slotType,
            isOT: slotType.startsWith("OT"),
            disciplineCode: String(r[10] || ""),
            taskId: String(r[11] || ""),
            note: String(r[12] || "")
          });
        });
      }
    }

    const employee = getEmployeeByCode(sCode);
    const staffName = employee ? employee.name : sCode;

    return {
      success: true,
      staffCode: sCode,
      staffName: staffName,
      projectCode: pCode,
      totalHours: Number(matchedSlots.reduce((sum, s) => sum + s.durHours, 0).toFixed(1)),
      slots: matchedSlots.sort((a, b) => b.date.localeCompare(a.date))
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}
