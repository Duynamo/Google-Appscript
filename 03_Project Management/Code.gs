// ============================================================
//  WEBAPP QUẢN LÝ DỰ ÁN v3.0 - Code.gs (OPTIMIZED)
//  Tối ưu: CacheService + getInitData() thay 4 round-trips
// ============================================================
const CONFIG = {
  APP_NAME      : "Quản Lý Dự Án v3.0",
  DEFAULT_LANG  : "vi",
  SHEET_USERS   : "USERS",
  SHEET_PROJECTS: "PROJECTS",
  SHEET_TASKS   : "TASKS",
  SHEET_LOG     : "ACTIVITY_LOG",
  SHEET_TAXONOMY: "TAXONOMY",
  ROLES         : ["Admin","Manager","Member","Viewer"],
  TASK_STATUS   : ["Chờ thực hiện","Đang thực hiện","Chờ duyệt","Hoàn thành","Tạm dừng","Hủy"],
  TASK_PRIORITY : ["Thấp","Trung bình","Cao","Khẩn cấp"],
  PROJECT_STATUS: ["Lên kế hoạch","Đang thực hiện","Hoàn thành","Tạm dừng","Hủy"],
  CACHE_TTL     : 300,
};

function doGet(e) {
  initSheets();
  const tmpl = HtmlService.createTemplateFromFile("Index");
  tmpl.appName = CONFIG.APP_NAME;
  return tmpl.evaluate()
    .setTitle(CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport","width=device-width,initial-scale=1");
}

function include(f) {
  return HtmlService.createHtmlOutputFromFile(f).getContent();
}

// ── CACHE HELPERS ──
function cacheGet(key) {
  try { const v = CacheService.getScriptCache().get(key); return v ? JSON.parse(v) : null; } catch(e) { return null; }
}
function cacheSet(key, data) {
  try { const j = JSON.stringify(data); if (j.length < 90000) CacheService.getScriptCache().put(key, j, CONFIG.CACHE_TTL); } catch(e) {}
}
function invalidateCache(sheets) {
  try { CacheService.getScriptCache().removeAll((sheets||[CONFIG.SHEET_TASKS,CONFIG.SHEET_PROJECTS,CONFIG.SHEET_USERS,CONFIG.SHEET_LOG]).map(s=>"sheet_"+s)); } catch(e) {}
}

// ── SHEET DATA (cached) ──
function getSheetData(sheetName) {
  const key = "sheet_" + sheetName;
  const cached = cacheGet(key);
  if (cached) return cached;
  const data = _readSheet(sheetName);
  cacheSet(key, data);
  return data;
}
function _readSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2 || sh.getLastColumn() < 1) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,sh.getLastColumn()).getValues().filter(r=>r[0]!=="");
}

function generateId() { return Utilities.getUuid().split("-")[0].toUpperCase(); }

function getCurrentUser() {
  let email = Session.getActiveUser().getEmail();
  const effectiveEmail = Session.getEffectiveUser() ? Session.getEffectiveUser().getEmail() : "";
  let ownerEmail = "";
  try {
    const owner = SpreadsheetApp.getActiveSpreadsheet().getOwner();
    if (owner) ownerEmail = owner.getEmail();
  } catch(e) {}

  if (!email) {
    email = effectiveEmail || ownerEmail;
  }
  if (!email) return null;

  const emailLower = email.toLowerCase().trim();
  const effectiveLower = effectiveEmail.toLowerCase().trim();
  const ownerLower = ownerEmail.toLowerCase().trim();

  // 1. Luôn tra cứu vai trò trong USERS sheet
  const users = getSheetData(CONFIG.SHEET_USERS);
  const userRow = users.find(u => u[1] && u[1].toLowerCase().trim() === emailLower);

  // 2. Tra cứu thông tin trong TAXONOMY (EMPLOYEE)
  let emp = null;
  try {
    const taxData = getTaxonomyDataInternal();
    const employees = (taxData && taxData.employees) || [];
    emp = employees.find(e => e.extra1 && e.extra1.toLowerCase().trim() === emailLower);
  } catch(e) {
    console.warn("Taxonomy lookup error in getCurrentUser:", e);
  }

  // NGUYÊN TẮC BẢO VỆ TOÀN QUYỀN ADMIN (ROOT ADMIN & CREATOR GUARANTEE):
  // 1) Là người sở hữu bảng tính (Owner) HOẶC người chạy script (Effective User)
  // 2) HOẶC có tên/email chứa "Vũ Đình Duy" / "vudinhduy"
  // 3) HOẶC có vai trò Admin / Manager trong USERS sheet
  // 4) HOẶC có cấp bậc Admin / Cấp 1 / Level1 trong Taxonomy
  const isOwnerOrEffective = (ownerLower && emailLower === ownerLower) || (effectiveLower && emailLower === effectiveLower);
  const isNamedAdmin = (userRow && userRow[2] && String(userRow[2]).toLowerCase().includes("vũ đình duy")) ||
                       (emp && emp.name && String(emp.name).toLowerCase().includes("vũ đình duy")) ||
                       emailLower.includes("vudinhduy");
  const isMasterAdmin = Boolean(userRow && (String(userRow[3]).toLowerCase() === "admin" || String(userRow[3]).toLowerCase() === "manager"));
  const isTaxAdmin = Boolean(emp && ["cấp 1", "admin", "level1", "1"].includes(String(emp.extra3 || "").toLowerCase().trim()));

  const isFullAdmin = isOwnerOrEffective || isNamedAdmin || isMasterAdmin || isTaxAdmin;

  if (isFullAdmin) {
    // Tự động khôi phục quyền Admin trên Google Sheet nếu trước đó bị ghi đè nhầm
    ensureAdminPersistence(email, userRow, emp);

    const displayName = (emp && emp.name) ? emp.name : ((userRow && userRow[2]) ? userRow[2] : (emailLower.includes("vudinhduy") ? "Vũ Đình Duy" : "Quản trị viên"));
    const staffCode = (emp && emp.code) ? emp.code : ((userRow && userRow[0]) ? userRow[0] : "NV001");
    const role = (userRow && String(userRow[3]).toLowerCase() === "manager") ? "Manager" : "Admin";

    return {
      id: emp ? emp.id : (userRow ? userRow[0] : "ADMIN_ROOT"),
      staffCode: staffCode,
      email: email,
      name: displayName,
      rank: (emp && emp.desc) ? emp.desc : ((userRow && userRow[6]) ? userRow[6] : "Quản trị viên"),
      role: role,
      permissionLevel: 1,
      sheetUrl: (emp && emp.extra2) ? emp.extra2 : "",
      status: "Active",
      registered: true
    };
  }

  // Nếu là nhân sự Cấp 2 trong Taxonomy
  if (emp) {
    if (emp.status && emp.status.toLowerCase() !== "active" && emp.status !== "Đang hoạt động") {
      return { email, role: null, name: emp.name || email, registered: false, locked: true };
    }
    const isEmpL1 = ["cấp 1", "admin", "level1", "1"].includes(String(emp.extra3 || "").toLowerCase().trim());
    const permLevel = isEmpL1 ? 1 : 2;
    return {
      id: emp.id,
      staffCode: emp.code,
      email: emp.extra1,
      name: emp.name,
      rank: emp.desc || (isEmpL1 ? "Quản trị viên" : "Nhân viên"),
      role: isEmpL1 ? "Admin" : "Level2",
      permissionLevel: permLevel,
      sheetUrl: emp.extra2 || "",
      status: emp.status || "Active",
      registered: true
    };
  }

  // Fallback sang USERS sheet nếu không có trong Taxonomy
  if (userRow) {
    const rawRole = String(userRow[3] || "Member");
    const isL1 = (rawRole.toLowerCase() === "admin" || rawRole.toLowerCase() === "manager");
    const permLevel = isL1 ? 1 : 2;
    return {
      id: userRow[0],
      staffCode: userRow[0],
      email: userRow[1],
      name: userRow[2],
      rank: userRow[6] || (isL1 ? "Quản lý" : "Thành viên"),
      role: isL1 ? rawRole : "Level2",
      permissionLevel: permLevel,
      sheetUrl: "",
      status: userRow[4] || "Active",
      registered: true
    };
  }

  return { email: email, role: null, name: email, registered: false };
}

/** Tự động khôi phục và bảo vệ quyền Admin trong Google Sheet */
function ensureAdminPersistence(email, userRow, emp) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const emailLower = email.toLowerCase().trim();
    // 1. Khôi phục USERS sheet
    const shUsers = ss.getSheetByName(CONFIG.SHEET_USERS);
    if (shUsers) {
      const rows = shUsers.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][1]).toLowerCase().trim() === emailLower) {
          found = true;
          let changed = false;
          if (rows[i][3] !== "Admin" && rows[i][3] !== "Manager") {
            shUsers.getRange(i + 1, 4).setValue("Admin");
            changed = true;
          }
          if (rows[i][4] !== "Active") {
            shUsers.getRange(i + 1, 5).setValue("Active");
            changed = true;
          }
          if (changed) {
            SpreadsheetApp.flush();
            invalidateCache([CONFIG.SHEET_USERS]);
          }
          break;
        }
      }
      if (!found) {
        shUsers.appendRow([generateId(), email, "Vũ Đình Duy", "Admin", "Active", new Date(), "Tài khoản Quản trị"]);
        SpreadsheetApp.flush();
        invalidateCache([CONFIG.SHEET_USERS]);
      }
    }

    // 2. Khôi phục TAXONOMY sheet
    const shTax = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    if (shTax) {
      const rows = shTax.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][1]).toUpperCase() === "EMPLOYEE" && String(rows[i][5]).toLowerCase().trim() === emailLower) {
          const curVal = String(rows[i][9] || "").trim();
          if (!["cấp 1", "admin", "level1", "1"].includes(curVal.toLowerCase())) {
            shTax.getRange(i + 1, 10).setValue("Admin");
            SpreadsheetApp.flush();
            invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
          }
          break;
        }
      }
    }
  } catch(e) {
    console.warn("ensureAdminPersistence warning:", e);
  }
}

function hasPermission(role, action) {
  const perms = {
    Admin  :["view","create","edit","delete","manage_users","manage_projects","manage_tasks","report","timesheet_all","timesheet_own"],
    Manager:["view","create","edit","manage_projects","manage_tasks","report","timesheet_all","timesheet_own"],
    Member :["view","edit_own_tasks","report_own","timesheet_own"],
    Level2 :["timesheet_own"], // Phân quyền Cấp 2: Chỉ nhập thời gian trong tab Quản lý thời gian
    Viewer :["view"],
  };
  return perms[role] && perms[role].includes(action);
}

function writeLog(action, detail) {
  try {
    const user = getCurrentUser();
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_LOG);
    if (sh) sh.appendRow([new Date(), user?user.email:"?", user?user.role:"?", action, detail, ""]);
    invalidateCache([CONFIG.SHEET_LOG]);
  } catch(e) {}
}

function userMatchesAssignee(assigneeStr, userEmail, userName) {
  if (!assigneeStr) return false;
  const list = String(assigneeStr).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (userEmail && list.includes(String(userEmail).toLowerCase())) return true;
  if (userName && list.includes(String(userName).toLowerCase())) return true;
  return false;
}

// ── mapTaskFull: isOverdue dùng midnight comparison ──
function mapTaskFull(t) {
  const deadlineDate = t[9] ? new Date(t[9]) : null;
  const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);
  const isOverdue = deadlineDate && t[7]!=="Hoàn thành" && t[7]!=="Hủy" && deadlineDate < todayMidnight;
  let reminders = [];
  try { reminders = t[18] ? JSON.parse(t[18]) : []; } catch(e) {}
  const tz = "Asia/Ho_Chi_Minh";
  return {
    id:t[0], projectId:t[1], projectName:t[2], name:t[3], desc:t[4], assignee:t[5],
    priority:t[6], status:t[7],
    startDate  : t[8]          ? Utilities.formatDate(new Date(t[8]),  tz,"dd/MM/yyyy") : "",
    deadline   : deadlineDate  ? Utilities.formatDate(deadlineDate,    tz,"dd/MM/yyyy") : "",
    deadlineRaw: deadlineDate  ? Utilities.formatDate(deadlineDate,    tz,"yyyy-MM-dd") : "",
    startRaw   : t[8]          ? Utilities.formatDate(new Date(t[8]),  tz,"yyyy-MM-dd") : "",
    progress:Number(t[10])||0, note:t[11]||"",
    created    : t[12] ? Utilities.formatDate(new Date(t[12]),tz,"dd/MM/yyyy HH:mm") : "",
    createdBy  : t[13]||"",
    updatedAt  : t[14] ? Utilities.formatDate(new Date(t[14]),tz,"dd/MM/yyyy HH:mm") : "",
    target:t[15]||"", linkResults:t[16]||"", outputResult:t[17]||"",
    reminders, sortOrder:Number(t[19])||999, isOverdue,
  };
}

// ============================================================
//  getInitData — TẤT CẢ data trong 1 lần gọi duy nhất
//  Thay thế: getDashboardData + getProjects + getTasks + getMemberList
// ============================================================
function getInitData() {
  const user = getCurrentUser();
  if (!user || !user.registered)
    return { success:false, error:"Chưa được cấp quyền. Liên hệ Admin." };

  const allProjects = getSheetData(CONFIG.SHEET_PROJECTS);
  const allTasks    = getSheetData(CONFIG.SHEET_TASKS);
  const allUsers    = getSheetData(CONFIG.SHEET_USERS);

  let projects = allProjects;
  let tasks    = allTasks;
  if (user.role === "Manager") {
    const managedProjects = allProjects.filter(p => p[3] === user.email);
    const managedPjIds    = new Set(managedProjects.map(p => p[0]));
    tasks = allTasks.filter(t => managedPjIds.has(t[1]) || userMatchesAssignee(t[5], user.email, user.name));
    const relatedPjIds    = new Set([...managedPjIds, ...tasks.map(t => t[1])]);
    projects = allProjects.filter(p => relatedPjIds.has(p[0]));
  } else if (user.role === "Member") {
    tasks = allTasks.filter(t => userMatchesAssignee(t[5], user.email, user.name));
    const memberPjIds = new Set(tasks.map(t => t[1]));
    projects = allProjects.filter(p => memberPjIds.has(p[0]));
  }

  const mappedProjects = projects.map(r=>mapProject(r));
  const mappedTasks    = tasks.sort((a,b)=>(Number(a[19])||999)-(Number(b[19])||999)).map(t=>mapTaskFull(t));
  const members        = allUsers.filter(r=>r[4]==="Active").map(r=>({email:r[1],name:r[2],role:r[3]}));

  const taskByStatus = {};
  CONFIG.TASK_STATUS.forEach(s=>taskByStatus[s]=0);
  mappedTasks.forEach(t=>{ if(taskByStatus[t.status]!==undefined) taskByStatus[t.status]++; });
  const overdue = mappedTasks.filter(t=>t.isOverdue).length;

  const sysLang = PropertiesService.getScriptProperties().getProperty("SYS_DEFAULT_LANG") || CONFIG.DEFAULT_LANG || "vi";
  let userLang = "";
  try { userLang = PropertiesService.getUserProperties().getProperty("USER_LANG") || ""; } catch(e) {}

  return {
    success:true,
    systemDefaultLang: sysLang,
    userLang: userLang,
    user    : {
      email: user.email,
      name: user.name,
      role: user.role,
      permissionLevel: user.permissionLevel || 1,
      staffCode: user.staffCode || "",
      rank: user.rank || "",
      sheetUrl: user.sheetUrl || ""
    },
    isTimesheetOnly: (user.permissionLevel === 2),
    projects: mappedProjects,
    tasks   : mappedTasks,
    members,
    taxonomy: getTaxonomyDataInternal(),
    summary : {
      totalProjects: mappedProjects.length,
      totalTasks   : mappedTasks.length,
      overdue,
      totalUsers   : user.role==="Admin" ? allUsers.filter(u=>u[4]==="Active").length : null,
      taskByStatus,
    },
  };
}

// ── NGÔN NGỮ MẶC ĐỊNH (I18N SETTINGS) ──
function setSystemDefaultLanguage(lang) {
  const user = getCurrentUser();
  if (!user || user.role !== "Admin") {
    return { success: false, error: "Chỉ Admin mới có quyền đổi ngôn ngữ mặc định hệ thống" };
  }
  if (!["vi", "en", "ja"].includes(lang)) {
    return { success: false, error: "Ngôn ngữ không hợp lệ" };
  }
  PropertiesService.getScriptProperties().setProperty("SYS_DEFAULT_LANG", lang);
  writeLog("SYS_LANG", `Đổi ngôn ngữ mặc định hệ thống thành: ${lang}`);
  return { success: true, lang: lang };
}

function setUserLanguagePreference(lang) {
  if (!["vi", "en", "ja"].includes(lang)) {
    return { success: false, error: "Ngôn ngữ không hợp lệ" };
  }
  try {
    PropertiesService.getUserProperties().setProperty("USER_LANG", lang);
    return { success: true, lang: lang };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// Giữ lại để tương thích ngược
function getDashboardData() { return getInitData(); }
function getProjects()      { const r=getInitData(); return r.success?{success:true,data:r.projects}:{success:false,error:r.error}; }
function getTasks()         { const r=getInitData(); return r.success?{success:true,data:r.tasks}:{success:false,error:r.error}; }
function getMemberList()    { const r=getInitData(); return r.success?{success:true,data:r.members}:{success:false,error:r.error}; }

function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(CONFIG.SHEET_USERS)) {
    const s=ss.insertSheet(CONFIG.SHEET_USERS);
    s.appendRow(["ID","Email","Họ Tên","Vai Trò","Trạng Thái","Ngày Tạo","Ghi Chú"]);
    s.getRange(1,1,1,7).setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");
    s.appendRow([generateId(),Session.getActiveUser().getEmail(),"Admin","Admin","Active",new Date(),"Tài khoản khởi tạo"]);
  }
  if (!ss.getSheetByName(CONFIG.SHEET_PROJECTS)) {
    const s=ss.insertSheet(CONFIG.SHEET_PROJECTS);
    s.appendRow(["ID","Tên Dự Án","Mô Tả","Manager Email","Ngày Bắt Đầu","Ngày Kết Thúc","Trạng Thái","Tiến Độ %","Ngày Tạo","Tạo Bởi"]);
    s.getRange(1,1,1,10).setFontWeight("bold").setBackground("#34a853").setFontColor("white");
  }
  if (!ss.getSheetByName(CONFIG.SHEET_TASKS)) {
    const s=ss.insertSheet(CONFIG.SHEET_TASKS);
    s.appendRow(["ID","Project ID","Tên Dự Án","Tên Công Việc","Mô Tả","Người Thực Hiện","Độ Ưu Tiên","Trạng Thái","Ngày Bắt Đầu","Deadline","Hoàn Thành %","Ghi Chú","Ngày Tạo","Tạo Bởi","Cập Nhật","Mục Tiêu","Link Kết Quả","Kết Quả Đầu Ra","Nhắc Việc","Thứ Tự"]);
    s.getRange(1,1,1,20).setFontWeight("bold").setBackground("#ea4335").setFontColor("white");
  } else {
    const s = ss.getSheetByName(CONFIG.SHEET_TASKS);
    const lastCol = s.getLastColumn();
    if (lastCol < 20) {
      const extraHeaders = ["Mục Tiêu","Link Kết Quả","Kết Quả Đầu Ra","Nhắc Việc","Thứ Tự"];
      extraHeaders.forEach((h, i) => {
        s.getRange(1, lastCol + 1 + i).setValue(h).setFontWeight("bold").setBackground("#ea4335").setFontColor("white");
      });
    }
  }
  if (!ss.getSheetByName(CONFIG.SHEET_LOG)) {
    const s=ss.insertSheet(CONFIG.SHEET_LOG);
    s.appendRow(["Thời Gian","Email","Vai Trò","Hành Động","Chi Tiết","Session"]);
    s.getRange(1,1,1,6).setFontWeight("bold").setBackground("#fbbc04").setFontColor("#333");
  }
  initTaxonomySheet();
}