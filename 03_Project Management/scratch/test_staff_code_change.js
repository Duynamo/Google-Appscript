const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("════════════════════════════════════════════════════════════════════════════");
console.log("🧪 KIỂM THỬ ĐẶC TRỊ: THAY ĐỔI MÃ NHÂN VIÊN TRONG MODAL DANH MỤC TIÊU CHUẨN");
console.log("════════════════════════════════════════════════════════════════════════════\n");

// Memory mock sheets
const memorySheets = {
  USERS: {
    rows: [
      ["ID", "Email", "Họ Tên", "Vai Trò", "Trạng Thái", "Ngày Tạo", "Ghi Chú", "Link Bảng Tính"],
      ["AB6FD093", "duyvultv@gmail.com", "Vũ Đình Duy", "Admin", "Active", new Date(), "Sub Lead", "https://sheet.url/duy"],
      ["93FA49F8", "member_thach@internal.local", "Nguyễn Hữu Thạch", "Member", "Active", new Date(), "Kỹ sư BIM/MEP", ""]
    ]
  },
  TAXONOMY: {
    rows: [
      ["ID", "Type", "Code", "Name_VI", "Name_EN", "Name_JP", "Description", "Color_Hex", "Sort_Order", "Status", "UpdatedAt"],
      ["EMP_AB6FD093", "EMPLOYEE", "AB6FD093", "Vũ Đình Duy", "Vu Dinh Duy", "", "Sub Lead", "#6366f1", 1, "Active", new Date()]
    ]
  },
  PROJECTS: {
    rows: [
      ["ID", "Tên Dự Án", "Mô Tả", "Manager Email", "Ngày Bắt Đầu", "Ngày Kết Thúc", "Trạng Thái", "Tiến Độ %", "Ngày Tạo", "Tạo Bởi", "Thành Viên", "Ngân Sách (Giờ)"],
      ["DA01", "2026_01_MUR01_室蘭市蘭東下水処理場", "Dự án mẫu", "duyvultv@gmail.com", "2026-07-01", "2026-10-02", "Đang thực hiện", 70, new Date(), "Admin", JSON.stringify([{id: "AB6FD093", email: "duyvultv@gmail.com", name: "Vũ Đình Duy", role: "Admin"}]), 344]
    ]
  },
  TIMESHEET_2026: {
    rows: [
      ["Log_ID", "Work_Date", "Time_Slot", "Start_Time", "End_Time", "Duration_Hours", "Slot_Type", "Project_Code", "Category_Code", "Phase_Code", "Discipline_Code", "Task_ID", "Work_Note", "Staff_Code", "Staff_Name", "Staff_Rank", "Updated_At", "Updated_By"],
      ["LOG_001", "2026-07-01", "SLOT_1", "08:00", "08:30", 0.5, "Official", "MUR01", "MD", "BD", "MD01", "TK001", "Test", "AB6FD093", "Vũ Đình Duy", "Sub Lead", new Date(), "duyvultv@gmail.com"],
      ["LOG_002", "2026-07-01", "SLOT_2", "08:30", "09:00", 0.5, "Official", "MUR01", "MD", "BD", "MD01", "TK001", "Test", "93FA49F8", "Nguyễn Hữu Thạch", "Kỹ sư", new Date(), "member_thach"]
    ]
  },
  TIMESHEET_DAILY_ROLLUP: {
    rows: [
      ["Rollup_ID", "Work_Date", "Staff_Code", "Staff_Name", "Project_Code", "Category_Code", "Phase_Code", "Discipline_Code", "Total_Hours", "Official_Hours", "OT_Hours", "Updated_At"],
      ["20260701_AB6FD093_MUR01_MD01", "2026-07-01", "AB6FD093", "Vũ Đình Duy", "MUR01", "MD", "BD", "MD01", 0.5, 0.5, 0, new Date()]
    ]
  },
  TASKS: {
    rows: [
      ["ID", "Project_ID", "Project_Name", "Task_Name", "Description", "Assignee", "Priority", "Status", "Start_Date", "Deadline", "Progress", "Note", "Created", "CreatedBy", "Updated", "Target", "Link", "Output", "Reminders", "Sort_Order"],
      ["TK001", "MUR01", "2026_01_MUR01_室蘭市蘭東下水処理場", "[MD-BD-MD01] Task mẫu", "", "duyvultv@gmail.com", "Cao", "Hoàn thành", new Date(), new Date(), 100, "", new Date(), "Admin", new Date(), "", "", "", "[]", 1]
    ]
  }
};

function createMockSheet(name) {
  if (!memorySheets[name]) {
    memorySheets[name] = { rows: [["Header"]] };
  }
  const obj = memorySheets[name];
  return {
    getName: () => name,
    getLastRow: () => obj.rows.length,
    getLastColumn: () => (obj.rows[0] ? obj.rows[0].length : 1),
    getDataRange: () => ({
      getValues: () => obj.rows.map(r => [...r]),
      clearContent: () => { obj.rows = []; }
    }),
    getRange: (r, c, nr, nc) => ({
      setValue: (val) => {
        while (obj.rows.length < r) obj.rows.push([]);
        while (obj.rows[r - 1].length < c) obj.rows[r - 1].push("");
        obj.rows[r - 1][c - 1] = val;
      },
      setValues: (matrix) => {
        for (let i = 0; i < matrix.length; i++) {
          const rowIdx = r - 1 + i;
          while (obj.rows.length <= rowIdx) obj.rows.push([]);
          for (let j = 0; j < matrix[i].length; j++) {
            const colIdx = c - 1 + j;
            while (obj.rows[rowIdx].length <= colIdx) obj.rows[rowIdx].push("");
            obj.rows[rowIdx][colIdx] = matrix[i][j];
          }
        }
      },
      getValues: () => {
        const res = [];
        for (let i = 0; i < nr; i++) {
          const rowIdx = r - 1 + i;
          const row = [];
          for (let j = 0; j < nc; j++) {
            const colIdx = c - 1 + j;
            row.push((obj.rows[rowIdx] && obj.rows[rowIdx][colIdx] !== undefined) ? obj.rows[rowIdx][colIdx] : "");
          }
          res.push(row);
        }
        return res;
      },
      setFontWeight: function() { return this; },
      setBackground: function() { return this; },
      setFontColor: function() { return this; }
    }),
    appendRow: (arr) => obj.rows.push([...arr]),
    deleteRow: (idx) => obj.rows.splice(idx - 1, 1),
    clear: () => { obj.rows = []; }
  };
}

const mockSandbox = {
  SpreadsheetApp: {
    getActiveSpreadsheet: () => ({
      getSheetByName: (name) => createMockSheet(name),
      getSheets: () => Object.keys(memorySheets).map(k => createMockSheet(k)),
      insertSheet: (name) => createMockSheet(name)
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
    formatDate: (d, tz, fmt) => {
      if (fmt === "yyyyMMdd") return "20260701";
      if (fmt === "yyyy-MM-dd") return "2026-07-01";
      return "20260701_120000";
    }
  },
  CONFIG: {
    SHEET_USERS: "USERS",
    SHEET_PROJECTS: "PROJECTS",
    SHEET_TASKS: "TASKS",
    SHEET_TAXONOMY: "TAXONOMY"
  },
  TIMESHEET_CONFIG: {
    ROLLUP_SHEET_NAME: "TIMESHEET_DAILY_ROLLUP"
  },
  getCurrentUser: () => ({
    email: "duyvultv@gmail.com",
    role: "Admin",
    staffCode: "AB6FD093",
    name: "Vũ Đình Duy",
    registered: true
  }),
  getSheetData: (sheetName) => {
    const sh = createMockSheet(sheetName);
    return sh.getDataRange().getValues();
  },
  hasPermission: () => true,
  getPermissionMatrixInternal: () => [],
  writeLog: () => {},
  invalidateCache: () => {},
  initSheets: () => {},
  getTimesheetYearSheetName: (yr) => `TIMESHEET_${yr}`,
  createNewStaffSpreadsheet: () => ({ success: true, sheetUrl: "https://sheet.url/duy" })
};

const root = path.join(__dirname, '..');
const userCode = fs.readFileSync(path.join(root, 'Userapi.gs'), 'utf8');
const taxCode = fs.readFileSync(path.join(root, 'Taxonomyapi.gs'), 'utf8');

const ctx = vm.createContext(mockSandbox);
vm.runInContext(userCode, ctx);
vm.runInContext(taxCode, ctx);

console.log("👉 TRẠNG THÁI TRƯỚC KHI ĐỔI MÃ:");
console.log("   USERS Row 1 ID:", memorySheets.USERS.rows[1][0]);
console.log("   TAXONOMY Row 1 Code:", memorySheets.TAXONOMY.rows[1][2]);
console.log("   TIMESHEET_2026 Staff_Code:", memorySheets.TIMESHEET_2026.rows[1][13]);
console.log("   ROLLUP Staff_Code & ID:", memorySheets.TIMESHEET_DAILY_ROLLUP.rows[1][2], "|", memorySheets.TIMESHEET_DAILY_ROLLUP.rows[1][0]);
console.log("   PROJECTS Members:", memorySheets.PROJECTS.rows[1][10]);

// Giả lập người dùng bấm đổi mã từ AB6FD093 -> AB6FD893 trong modal Taxonomy
console.log("\n🚀 BẮT ĐẦU GỌI saveTaxonomyItem VỚI MÃ MỚI: AB6FD893...");
const payload = {
  id: "EMP_AB6FD093",
  type: "EMPLOYEE",
  code: "AB6FD893",
  name: "Vũ Đình Duy",
  name_vi: "Vũ Đình Duy",
  name_en: "Vu Dinh Duy",
  desc: "Sub Lead",
  extra1: "duyvultv@gmail.com",
  extra2: "https://sheet.url/duy",
  extra3: "Admin",
  status: "Active"
};

const saveRes = ctx.saveTaxonomyItem(payload);
console.log("Kết quả saveTaxonomyItem:", JSON.stringify(saveRes));

console.log("\n👉 TRẠNG THÁI SAU KHI ĐỔI MÃ SANG AB6FD893:");
const uRow = memorySheets.USERS.rows[1];
console.log("   USERS Row 1 ID:", uRow[0], "| Name:", uRow[2], "| Email:", uRow[1]);

const tRow = memorySheets.TAXONOMY.rows[1];
console.log("   TAXONOMY Row 1 ID & Code:", tRow[0], "|", tRow[2]);

const tsRow = memorySheets.TIMESHEET_2026.rows[1];
console.log("   TIMESHEET_2026 Staff_Code:", tsRow[13]);

const rRow = memorySheets.TIMESHEET_DAILY_ROLLUP.rows[1];
console.log("   ROLLUP Staff_Code & ID:", rRow[2], "|", rRow[0]);

const pRow = memorySheets.PROJECTS.rows[1];
console.log("   PROJECTS Members:", pRow[10]);

// Kiểm tra getTaxonomyDataInternal xem UI nhận đúng mã mới không
const taxData = ctx.getTaxonomyDataInternal();
const duyEmp = (taxData.employees || []).find(e => e.extra1 === "duyvultv@gmail.com");
console.log("   Taxonomy UI employees object for Duy:", JSON.stringify(duyEmp));

let passed = true;
if (uRow[0] !== "AB6FD893") {
  console.error("❌ USERS Sheet ID không đổi thành AB6FD893 (thực tế: " + uRow[0] + ")");
  passed = false;
}
if (tRow[2] !== "AB6FD893" || tRow[0] !== "EMP_AB6FD893") {
  console.error("❌ TAXONOMY Sheet không đổi thành AB6FD893");
  passed = false;
}
if (tsRow[13] !== "AB6FD893") {
  console.error("❌ TIMESHEET_2026 không đổi thành AB6FD893");
  passed = false;
}
if (rRow[2] !== "AB6FD893" || !rRow[0].includes("AB6FD893")) {
  console.error("❌ ROLLUP không đổi thành AB6FD893");
  passed = false;
}
if (!pRow[10].includes("AB6FD893")) {
  console.error("❌ PROJECTS Members không đổi thành AB6FD893");
  passed = false;
}
if (!duyEmp || duyEmp.code !== "AB6FD893" || duyEmp.id !== "EMP_AB6FD893") {
  console.error("❌ Taxonomy UI employees không trả về AB6FD893!");
  passed = false;
}

if (passed) {
  console.log("\n🎉 HOÀN TOÀN THÀNH CÔNG! MÃ NHÂN VIÊN ĐÃ ĐỔI TỪ AB6FD093 -> AB6FD893 VÀ LAN TRUYỀN 100% TRÊN TOÀN BỘ CÁC BẢNG!");
} else {
  console.error("\n❌ KIỂM THỬ THẤT BẠI!");
  process.exit(1);
}
