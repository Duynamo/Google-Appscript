// ============================================================
//  File: Timesheetapi.gs v1.0
//  Quản Lý Thời Gian Làm Việc Chi Tiết (Timesheet 30 phút)
//  Tách biệt Google Sheet cho từng nhân viên, ghi đè an toàn,
//  sắp xếp dòng thời gian thông minh & phân quyền 2 cấp.
// ============================================================

const TIMESHEET_CONFIG = {
  SHEET_LOG_NAME: "DAILY_LOG",
  HEADERS: [
    "Log_ID",           // A: Khóa chính (Ngày_MãNV_GiờBắtĐầu)
    "Work_Date",        // B: Ngày làm việc (YYYY-MM-DD)
    "Time_Slot",        // C: Nhãn khung giờ (08:00 - 08:30)
    "Start_Time",       // D: Giờ bắt đầu (08:00)
    "End_Time",         // E: Giờ kết thúc (08:30)
    "Duration_Minutes", // F: Thời lượng (phút)
    "Slot_Type",        // G: Loại ca (Official, Lunch, OT_Morning, OT_Evening)
    "Project_Code",     // H: Mã Dự án (JJK01, HAG01...)
    "Category_Code",    // I: Mã Category (GE, M3, PC...)
    "Phase_Code",       // J: Phase Dự án (BD, DD, IS...)
    "Discipline_Code",  // K: Mã Công việc (AR, STR, MP...)
    "Work_Note",        // L: Ghi chú chi tiết công việc
    "Staff_Code",       // M: Mã nhân viên (NV001)
    "Staff_Name",       // N: Họ tên nhân viên
    "Staff_Rank",       // O: Cấp bậc
    "Updated_At",       // P: Thời điểm lưu thực tế
    "Updated_By"        // Q: Email thực hiện
  ]
};

/**
 * Trích xuất Google Spreadsheet ID từ URL bất kỳ
 */
function extractSpreadsheetId(urlOrId) {
  if (!urlOrId) return null;
  const str = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{25,}$/.test(str)) return str;
  const match = str.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Lấy thông tin nhân viên theo Mã NV từ Danh mục tiêu chuẩn (TAXONOMY)
 */
function getEmployeeByCode(staffCode) {
  if (!staffCode) return null;
  const codeUpper = String(staffCode).trim().toUpperCase();
  const taxData = getTaxonomyDataInternal();
  const employees = taxData.employees || [];
  return employees.find(e => String(e.code).trim().toUpperCase() === codeUpper) || null;
}

/**
 * Lấy thông tin nhân viên theo Email từ Danh mục tiêu chuẩn (TAXONOMY)
 */
function getEmployeeByEmail(email) {
  if (!email) return null;
  const emLower = String(email).trim().toLowerCase();
  const taxData = getTaxonomyDataInternal();
  const employees = taxData.employees || [];
  return employees.find(e => String(e.extra1 || "").trim().toLowerCase() === emLower) || null;
}

/**
 * Mở Google Sheet cá nhân của nhân viên và tự động khởi tạo tab DAILY_LOG nếu chưa có
 */
function openAndInitEmployeeSheet(sheetUrlOrId) {
  const fileId = extractSpreadsheetId(sheetUrlOrId);
  if (!fileId) throw new Error("Link Google Sheet cá nhân không hợp lệ hoặc chưa được thiết lập.");
  
  let ss;
  try {
    ss = SpreadsheetApp.openById(fileId);
  } catch(e) {
    throw new Error("Không thể mở Google Sheet cá nhân: " + e.message + ". Vui lòng kiểm tra quyền truy cập file.");
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

/**
 * Lấy danh sách nhân sự cho màn hình Timesheet
 * Phân quyền Cấp 1 (Admin): Thấy tất cả nhân sự và có quyền chuyển đổi.
 * Phân quyền Cấp 2 (Nhân viên): Chỉ thấy duy nhất thông tin của chính mình.
 */
function getStaffListForTimesheet() {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hoặc chưa được cấp quyền." };

    const taxData = getTaxonomyDataInternal();
    const allEmployees = taxData.employees || [];
    const activeStaff = allEmployees.filter(e => e.status === "Active");

    const empProfile = getEmployeeByEmail(user.email);
    const isLevel1 = (user.role === "Admin" || (empProfile && empProfile.extra3 === "Cấp 1"));

    if (isLevel1) {
      return {
        success: true,
        isLevel1: true,
        canSwitchStaff: true,
        currentUserEmail: user.email,
        currentStaffCode: empProfile ? empProfile.code : (activeStaff.length ? activeStaff[0].code : ""),
        staffList: activeStaff.map(e => ({
          code: e.code,
          name: e.name,
          rank: e.desc || "Thành viên",
          email: e.extra1 || "",
          sheetUrl: e.extra2 || "",
          permission: e.extra3 || "Cấp 2"
        }))
      };
    } else {
      // Phân quyền Cấp 2: Khóa cứng chỉ nhân viên của tài khoản đang đăng nhập
      if (!empProfile) {
        return { success: false, error: "Tài khoản của bạn (" + user.email + ") chưa được cấu hình hồ sơ nhân sự trong Danh mục tiêu chuẩn." };
      }
      return {
        success: true,
        isLevel1: false,
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

/**
 * Tải dữ liệu Timesheet của một nhân viên tại một ngày cụ thể (YYYY-MM-DD)
 */
function getTimesheetData(staffCode, dateStr) {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hệ thống" };

    const empProfile = getEmployeeByEmail(user.email);
    const isLevel1 = (user.role === "Admin" || (empProfile && empProfile.extra3 === "Cấp 1"));

    let targetCode = String(staffCode || "").trim().toUpperCase();
    if (!isLevel1) {
      // Ép chặt tài khoản Cấp 2 chỉ đọc được mã nhân viên của chính mình
      if (!empProfile) return { success: false, error: "Không tìm thấy hồ sơ nhân sự của bạn." };
      targetCode = String(empProfile.code).trim().toUpperCase();
    }

    const employee = getEmployeeByCode(targetCode);
    if (!employee) return { success: false, error: "Không tìm thấy mã nhân viên: " + targetCode };
    if (!employee.extra2) return { success: false, error: "Nhân viên [" + targetCode + "] chưa được cấu hình Link Google Sheet cá nhân.", needSheetConfig: true };

    const { sh } = openAndInitEmployeeSheet(employee.extra2);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) {
      return {
        success: true,
        hasData: false,
        records: [],
        sheetUrl: employee.extra2,
        staff: { code: employee.code, name: employee.name, rank: employee.desc, email: employee.extra1 },
        dateStr
      };
    }

    // Đọc theo khối (Batch Read)
    const data = sh.getRange(2, 1, lastRow - 1, TIMESHEET_CONFIG.HEADERS.length).getValues();
    const targetDateFormatted = String(dateStr).trim();

    const matchedRows = [];
    let lastUpdatedTime = "";

    data.forEach(r => {
      let rDate = "";
      if (r[1] instanceof Date) {
        rDate = Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
      } else {
        rDate = String(r[1] || "").trim().slice(0, 10);
      }

      if (rDate === targetDateFormatted) {
        matchedRows.push({
          logId: String(r[0] || ""),
          workDate: rDate,
          timeSlot: String(r[2] || ""),
          startTime: String(r[3] || ""),
          endTime: String(r[4] || ""),
          durationMinutes: Number(r[5]) || 30,
          slotType: String(r[6] || "Official"),
          projectCode: String(r[7] || ""),
          categoryCode: String(r[8] || ""),
          phaseCode: String(r[9] || ""),
          disciplineCode: String(r[10] || ""),
          workNote: String(r[11] || ""),
          updatedAt: r[15] ? (r[15] instanceof Date ? Utilities.formatDate(r[15], "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss") : String(r[15])) : "",
          updatedBy: String(r[16] || "")
        });
        if (r[15]) {
          lastUpdatedTime = r[15] instanceof Date ? Utilities.formatDate(r[15], "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm") : String(r[15]);
        }
      }
    });

    return {
      success: true,
      hasData: matchedRows.length > 0,
      records: matchedRows,
      lastUpdatedTime,
      sheetUrl: employee.extra2,
      staff: { code: employee.code, name: employee.name, rank: employee.desc, email: employee.extra1 },
      dateStr: targetDateFormatted
    };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * Lưu dữ liệu Timesheet vào Google Sheet cá nhân
 * Hỗ trợ:
 * - Bảo vệ ghi đè 2 bước (nếu ngày đã có dữ liệu mà isOverwrite=false -> từ chối lưu)
 * - Thuật toán chèn theo trình tự thời gian thông minh (Ví dụ ngày 12 chèn giữa ngày 11 và ngày 13)
 * - Tự động sắp xếp chuẩn Work_Date ASC, Start_Time ASC
 */
function saveTimesheetData(payload) {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hệ thống" };

    const rawRows = Array.isArray(payload.rows) ? payload.rows : (Array.isArray(payload.entries) ? payload.entries : []);
    if (!payload || !payload.dateStr || !rawRows.length) {
      return { success: false, error: "Dữ liệu gửi lên không hợp lệ hoặc không có khung giờ nào." };
    }

    const empProfile = getEmployeeByEmail(user.email);
    const isLevel1 = (user.role === "Admin" || (empProfile && empProfile.extra3 === "Cấp 1"));

    let targetCode = String(payload.staffCode || "").trim().toUpperCase();
    if (!isLevel1) {
      if (!empProfile) return { success: false, error: "Không tìm thấy hồ sơ nhân sự của bạn." };
      targetCode = String(empProfile.code).trim().toUpperCase();
    }

    const employee = getEmployeeByCode(targetCode);
    if (!employee) return { success: false, error: "Không tìm thấy nhân viên: " + targetCode };

    // TỰ ĐỘNG KHỞI TẠO GOOGLE SHEET NẾU CHƯA CÓ LINK:
    if (!employee.extra2) {
      const createRes = createNewStaffSpreadsheet(targetCode, employee.name, employee.extra1);
      if (createRes && createRes.success && createRes.sheetUrl) {
        employee.extra2 = createRes.sheetUrl;
        // Cập nhật ngược lại vào sheet TAXONOMY
        try {
          const ssMain = SpreadsheetApp.getActiveSpreadsheet();
          const shTax = ssMain.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
          if (shTax) {
            const tRows = shTax.getDataRange().getValues();
            for (let i = 1; i < tRows.length; i++) {
              if (String(tRows[i][1]).toUpperCase() === "EMPLOYEE" && String(tRows[i][2]).toUpperCase() === targetCode) {
                shTax.getRange(i + 1, 7).setValue(createRes.sheetUrl); // Cột G: Extra2
                break;
              }
            }
            SpreadsheetApp.flush();
            invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
          }
        } catch(eTax) {
          console.warn("Lỗi cập nhật link sheet vào Taxonomy:", eTax);
        }
      } else {
        return { success: false, error: "Nhân viên chưa có Link Google Sheet cá nhân và không thể tự khởi tạo: " + ((createRes && createRes.error) || "") };
      }
    }

    const { ss, sh } = openAndInitEmployeeSheet(employee.extra2);
    const targetDate = String(payload.dateStr).trim();
    const lastRow = sh.getLastRow();

    let allRows = [];
    if (lastRow >= 2) {
      allRows = sh.getRange(2, 1, lastRow - 1, TIMESHEET_CONFIG.HEADERS.length).getValues();
    }

    // Kiểm tra xem ngày này đã từng có dữ liệu trên Sheet chưa
    let existingIndices = [];
    allRows.forEach((r, idx) => {
      let rDate = "";
      if (r[1] instanceof Date) {
        rDate = Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
      } else {
        rDate = String(r[1] || "").trim().slice(0, 10);
      }
      if (rDate === targetDate) {
        existingIndices.push(idx);
      }
    });

    const hasExistingData = existingIndices.length > 0;

    // NGUYÊN TẮC BẢO VỆ GHI ĐÈ 2 BƯỚC:
    // Nếu ngày đã có dữ liệu mà payload không có cờ isOverwrite = true -> Chặn đứng ngay!
    if (hasExistingData && !payload.isOverwrite) {
      return {
        success: false,
        error: "Ngày " + targetDate + " đã được lưu dữ liệu trước đó (" + existingIndices.length + " bản ghi). Bạn phải bấm nút [✏️ Chỉnh Sửa] rồi mới được thực hiện Ghi đè (Overwrite).",
        requireOverwriteConfirm: true,
        requireOverwriteConfirmation: true,
        existingCount: existingIndices.length
      };
    }

    // Lọc lấy các hàng dữ liệu hợp lệ từ payload cần ghi
    const now = new Date();
    const nowStr = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
    const editorEmail = user.email || "";

    const rowsToSave = [];
    rawRows.forEach(item => {
      const startTime = String(item.startTime || "").trim();
      const endTime = String(item.endTime || "").trim();
      if (!startTime) return;

      const timeSlot = String(item.timeSlot || `${startTime} - ${endTime}`).trim();
      const isLunch = (item.slotType === "Lunch" || item.isLunch);
      const isOT = Boolean(item.isOT || (item.slotType && item.slotType.startsWith("OT")));
      const slotType = isLunch ? "Lunch" : (isOT ? (startTime < "08:00" ? "OT_Morning" : "OT_Evening") : "Official");
      const note = String(item.workNote || item.note || (isLunch ? "Nghỉ trưa / Lunch Break" : "")).trim();

      const hasContent = Boolean(item.projectCode || item.categoryCode || item.phaseCode || item.disciplineCode || note);

      if (hasContent || isLunch) {
        const cleanStart = startTime.replace(":", "");
        const cleanDate = targetDate.replace(/-/g, "");
        const logId = `${cleanDate}_${targetCode}_${cleanStart}`;

        rowsToSave.push([
          logId,                                     // A: Log_ID
          targetDate,                                // B: Work_Date
          timeSlot,                                  // C: Time_Slot
          startTime,                                 // D: Start_Time
          endTime,                                   // E: End_Time
          Number(item.durationMinutes) || 30,        // F: Duration_Minutes
          slotType,                                  // G: Slot_Type
          String(item.projectCode || ""),            // H: Project_Code
          String(item.categoryCode || ""),           // I: Category_Code
          String(item.phaseCode || ""),              // J: Phase_Code
          String(item.disciplineCode || ""),         // K: Discipline_Code
          note,                                      // L: Work_Note
          targetCode,                                // M: Staff_Code
          employee.name,                             // N: Staff_Name
          employee.desc || "",                       // O: Staff_Rank
          nowStr,                                    // P: Updated_At
          editorEmail                                // Q: Updated_By
        ]);
      }
    });

    if (rowsToSave.length === 0) {
      return { success: false, error: "Không có dòng công việc nào có dữ liệu để lưu." };
    }

    // THUẬT TOÁN CHÈN THỨ TỰ THỜI GIAN THÔNG MINH:
    // 1. Tạo danh sách mới bằng cách loại bỏ các dòng cũ của targetDate (nếu đang Overwrite)
    let preservedRows = allRows.filter((r, idx) => !existingIndices.includes(idx));

    // 2. Định vị điểm chèn (Insert Index): tìm dòng đầu tiên có Work_Date > targetDate (ví dụ dòng ngày 13 khi chèn ngày 12)
    let insertIndex = -1;
    for (let i = 0; i < preservedRows.length; i++) {
      let rDate = "";
      if (preservedRows[i][1] instanceof Date) {
        rDate = Utilities.formatDate(preservedRows[i][1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
      } else {
        rDate = String(preservedRows[i][1] || "").trim().slice(0, 10);
      }
      if (rDate > targetDate) {
        insertIndex = i;
        break;
      }
    }

    // 3. Chèn các dòng của targetDate vào đúng vị trí giữa (ví dụ giữa ngày 11 và ngày 13)
    if (insertIndex !== -1) {
      preservedRows.splice(insertIndex, 0, ...rowsToSave);
    } else {
      // Nếu không có ngày nào lớn hơn trong tương lai, nối tiếp vào sau
      preservedRows.push(...rowsToSave);
    }

    // 4. Ghi toàn bộ dữ liệu sạch theo lô (Batch Write)
    // Xóa vùng dữ liệu cũ (từ dòng 2 trở đi)
    if (lastRow >= 2) {
      sh.getRange(2, 1, lastRow - 1, TIMESHEET_CONFIG.HEADERS.length).clearContent();
    }

    // Ghi toàn bộ mảng dữ liệu mới vào
    if (preservedRows.length > 0) {
      sh.getRange(2, 1, preservedRows.length, TIMESHEET_CONFIG.HEADERS.length).setValues(preservedRows);
      
      // 5. Tự động kiểm tra sắp xếp chuẩn 2 tầng (Work_Date tăng dần, Start_Time tăng dần)
      const dataRange = sh.getRange(2, 1, preservedRows.length, TIMESHEET_CONFIG.HEADERS.length);
      dataRange.sort([
        { column: 2, ascending: true }, // Work_Date
        { column: 4, ascending: true }  // Start_Time
      ]);
    }

    SpreadsheetApp.flush();
    writeLog("SAVE_TIMESHEET", `Lưu ${rowsToSave.length} slot ngày ${targetDate} cho nhân sự ${targetCode} (${employee.name})`);

    return {
      success: true,
      message: `Đã lưu thành công dữ liệu ngày ${targetDate} (${rowsToSave.length} khung giờ) vào Google Sheet cá nhân.`,
      savedCount: rowsToSave.length,
      updatedAt: nowStr
    };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * Tiện ích Sao Chép Dữ Liệu Từ Hôm Qua (Copy from Yesterday / Previous Day)
 */
function copyTimesheetFromYesterday(staffCode, targetDateStr) {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập hệ thống" };

    const empProfile = getEmployeeByEmail(user.email);
    const isLevel1 = (user.role === "Admin" || (empProfile && empProfile.extra3 === "Cấp 1"));

    let targetCode = String(staffCode || "").trim().toUpperCase();
    if (!isLevel1) {
      if (!empProfile) return { success: false, error: "Không tìm thấy hồ sơ nhân sự của bạn." };
      targetCode = String(empProfile.code).trim().toUpperCase();
    }

    const employee = getEmployeeByCode(targetCode);
    if (!employee || !employee.extra2) return { success: false, error: "Không tìm thấy Sheet cá nhân của nhân sự." };

    const { sh } = openAndInitEmployeeSheet(employee.extra2);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return { success: false, error: "Chưa có dữ liệu ngày làm việc trước đó để sao chép." };

    const data = sh.getRange(2, 1, lastRow - 1, TIMESHEET_CONFIG.HEADERS.length).getValues();
    const curDate = String(targetDateStr).trim();

    // Tìm tất cả các ngày có dữ liệu nhỏ hơn ngày hiện tại
    const dateMap = {};
    data.forEach(r => {
      let rDate = "";
      if (r[1] instanceof Date) {
        rDate = Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
      } else {
        rDate = String(r[1] || "").trim().slice(0, 10);
      }
      if (rDate && rDate < curDate) {
        if (!dateMap[rDate]) dateMap[rDate] = [];
        dateMap[rDate].push(r);
      }
    });

    const pastDates = Object.keys(dateMap).sort().reverse();
    if (pastDates.length === 0) {
      return { success: false, error: "Không tìm thấy ngày làm việc nào trước ngày " + curDate + " để sao chép." };
    }

    const latestPastDate = pastDates[0];
    const prevRows = dateMap[latestPastDate];

    const mappedSlots = prevRows.map(r => ({
      timeSlot: String(r[2] || ""),
      startTime: String(r[3] || ""),
      endTime: String(r[4] || ""),
      durationMinutes: Number(r[5]) || 30,
      slotType: String(r[6] || "Official"),
      projectCode: String(r[7] || ""),
      categoryCode: String(r[8] || ""),
      phaseCode: String(r[9] || ""),
      disciplineCode: String(r[10] || ""),
      workNote: String(r[11] || "")
    }));

    return {
      success: true,
      sourceDate: latestPastDate,
      slots: mappedSlots,
      message: `Đã nạp ${mappedSlots.length} khung giờ từ ngày làm việc gần nhất (${latestPastDate}).`
    };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * Tự động tạo Google Sheet mới cho nhân viên từ Template chuẩn (Dành cho Admin)
 */
function createNewStaffSpreadsheet(staffCode, staffName, staffEmail) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== "Admin") {
      return { success: false, error: "Chỉ Admin mới có quyền tạo file Google Sheet mới cho nhân sự." };
    }

    const code = String(staffCode || "").trim().toUpperCase();
    const name = String(staffName || "").trim();
    if (!code || !name) return { success: false, error: "Thiếu mã hoặc tên nhân sự." };

    const fileName = `TIMESHEET_${code}_${name.replace(/\s+/g, "_")}`;
    const newSs = SpreadsheetApp.create(fileName);

    // Cấu hình tab DAILY_LOG
    const shLog = newSs.getActiveSheet();
    shLog.setName(TIMESHEET_CONFIG.SHEET_LOG_NAME);
    shLog.appendRow(TIMESHEET_CONFIG.HEADERS);
    const headerRange = shLog.getRange(1, 1, 1, TIMESHEET_CONFIG.HEADERS.length);
    headerRange.setFontWeight("bold")
               .setBackground("#4f6ef7")
               .setFontColor("#ffffff")
               .setHorizontalAlignment("center");
    shLog.setFrozenRows(1);
    shLog.setColumnWidth(1, 140);  // Log_ID
    shLog.setColumnWidth(2, 100);  // Date
    shLog.setColumnWidth(3, 110);  // Slot
    shLog.setColumnWidth(4, 70);   // Start
    shLog.setColumnWidth(5, 70);   // End
    shLog.setColumnWidth(7, 90);   // Slot Type
    shLog.setColumnWidth(8, 90);   // Project
    shLog.setColumnWidth(9, 70);   // Cat
    shLog.setColumnWidth(10, 70);  // Phase
    shLog.setColumnWidth(11, 70);  // Task
    shLog.setColumnWidth(12, 280); // Notes
    shLog.setColumnWidth(16, 140); // Updated At

    // Phân quyền chia sẻ cho email nhân viên
    if (staffEmail && String(staffEmail).includes("@")) {
      try {
        newSs.addEditor(String(staffEmail).trim());
      } catch(e) {
        console.warn("Không thể share tự động cho email:", staffEmail);
      }
    }

    const newUrl = newSs.getUrl();
    writeLog("CREATE_TIMESHEET_FILE", `Tạo file Google Sheet mới cho ${code} (${name}): ${newUrl}`);

    return {
      success: true,
      fileId: newSs.getId(),
      url: newUrl,
      sheetUrl: newUrl,
      fileName
    };
  } catch(err) {
    return { success: false, error: err.message };
  }
}
