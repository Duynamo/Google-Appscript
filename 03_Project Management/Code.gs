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
  ROLES         : ["Admin","Leader","PJ_Lead","Member"],
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

  // Nếu là nhân sự có trong Taxonomy
  if (emp) {
    if (emp.status && emp.status.toLowerCase() !== "active" && emp.status !== "Đang hoạt động") {
      return { email, role: null, name: emp.name || email, registered: false, locked: true };
    }
    const extra3Str = String(emp.extra3 || "").toLowerCase().trim();
    let role = "Member";
    let permLevel = 4;
    let rank = emp.desc || "Thành viên";
    if (["cấp 1", "admin", "level1", "1"].includes(extra3Str)) {
      role = "Admin";
      permLevel = 1;
      rank = emp.desc || "Quản trị viên";
    } else if (["leader", "cấp 2", "level2", "2"].includes(extra3Str)) {
      role = "Leader";
      permLevel = 2;
      rank = emp.desc || "Trưởng bộ phận";
    } else if (["pj_lead", "pj lead", "cấp 3", "level3", "3", "manager"].includes(extra3Str)) {
      role = "PJ_Lead";
      permLevel = 3;
      rank = emp.desc || "Quản lý dự án";
    }

    return {
      id: emp.id,
      staffCode: emp.code,
      email: emp.extra1,
      name: emp.name,
      rank: rank,
      role: role,
      permissionLevel: permLevel,
      sheetUrl: emp.extra2 || "",
      status: emp.status || "Active",
      registered: true
    };
  }

  // Fallback sang USERS sheet nếu không có trong Taxonomy
  if (userRow) {
    const rawRole = String(userRow[3] || "Member").trim();
    let role = "Member";
    let permLevel = 4;
    let rank = userRow[6] || "Thành viên";

    if (rawRole.toLowerCase() === "admin") {
      role = "Admin";
      permLevel = 1;
      rank = userRow[6] || "Quản trị viên";
    } else if (rawRole.toLowerCase() === "leader") {
      role = "Leader";
      permLevel = 2;
      rank = userRow[6] || "Trưởng bộ phận";
    } else if (rawRole === "PJ_Lead" || rawRole.toLowerCase() === "manager") {
      role = "PJ_Lead";
      permLevel = 3;
      rank = userRow[6] || "Quản lý dự án";
    }

    return {
      id: userRow[0],
      staffCode: userRow[0],
      email: userRow[1],
      name: userRow[2],
      rank: rank,
      role: role,
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

// ============================================================
//  MA TRẬN PHÂN QUYỀN HỆ THỐNG (DYNAMIC RBAC MATRIX)
// ============================================================
const DEFAULT_PERM_MATRIX = {
  // 1. Dashboard
  "dash_view":        { module: "dashboard", name: "Xem Dashboard tổng quan", admin: "FULL", leader: "FULL", pj_lead: "VIEW_ALL", member: "OWN" },
  "dash_filter_pj":   { module: "dashboard", name: "Lọc thống kê theo Dự án", admin: "FULL", leader: "FULL", pj_lead: "VIEW_ALL", member: "DENY" },

  // 2. Dự án (Projects)
  "pj_view":          { module: "projects",  name: "Xem danh sách dự án",     admin: "FULL", leader: "FULL", pj_lead: "VIEW_ALL", member: "OWN" },
  "pj_create":        { module: "projects",  name: "Tạo dự án mới",           admin: "FULL", leader: "FULL", pj_lead: "DENY",     member: "DENY" },
  "pj_edit":          { module: "projects",  name: "Sửa thông tin dự án",     admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },
  "pj_members":       { module: "projects",  name: "Thêm/bớt thành viên dự án", admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },
  "pj_delete":        { module: "projects",  name: "Xóa / Lưu trữ dự án",     admin: "FULL", leader: "DENY", pj_lead: "DENY",     member: "DENY" },

  // 3. Nhiệm vụ (Tasks)
  "tk_view":          { module: "tasks",     name: "Xem danh sách/Kanban task", admin: "FULL", leader: "FULL", pj_lead: "VIEW_ALL", member: "OWN" },
  "tk_create":        { module: "tasks",     name: "Tạo nhiệm vụ (Đơn/Hàng loạt)", admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },
  "tk_edit":          { module: "tasks",     name: "Sửa thông tin / Deadline / Gán người", admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },
  "tk_update_prog":   { module: "tasks",     name: "Cập nhật % tiến độ & Link kết quả", admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "OWN" },
  "tk_approve":       { module: "tasks",     name: "Duyệt hoàn thành nhiệm vụ", admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },
  "tk_delete":        { module: "tasks",     name: "Xóa nhiệm vụ",            admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },

  // 4. Sơ đồ Gantt
  "gantt_view":       { module: "gantt",     name: "Xem tiến độ trên Gantt",  admin: "FULL", leader: "FULL", pj_lead: "VIEW_ALL", member: "DENY" },
  "gantt_edit":       { module: "gantt",     name: "Kéo đổi ngày trên Gantt", admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },

  // 5. Báo cáo & Phân tích (Analytics)
  "ana_view":         { module: "analytics", name: "Xem báo cáo hiệu suất & KPI", admin: "FULL", leader: "FULL", pj_lead: "VIEW_ALL", member: "DENY" },
  "ana_export":       { module: "analytics", name: "Xuất dữ liệu báo cáo",    admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },

  // 6. Quản lý thời gian (Timesheet)
  "ts_entry":         { module: "timesheet", name: "Nhập giờ công cá nhân (30p slot)", admin: "FULL", leader: "FULL", pj_lead: "FULL", member: "FULL" },
  "ts_view_others":   { module: "timesheet", name: "Xem Timesheet nhân sự khác", admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },
  "ts_export":        { module: "timesheet", name: "Xuất bảng chấm công",     admin: "FULL", leader: "FULL", pj_lead: "LEAD_SCOPE", member: "DENY" },

  // 7. Danh mục tiêu chuẩn (Taxonomy)
  "tax_view":         { module: "taxonomy",  name: "Xem danh mục tiêu chuẩn", admin: "FULL", leader: "FULL", pj_lead: "VIEW_ALL", member: "VIEW_ALL" },
  "tax_edit":         { module: "taxonomy",  name: "Thêm/Sửa Category, Phase, Discipline", admin: "FULL", leader: "FULL", pj_lead: "DENY", member: "DENY" },
  "tax_matrix_edit":  { module: "taxonomy",  name: "Cấu hình Ma trận phân quyền", admin: "FULL", leader: "DENY", pj_lead: "DENY", member: "DENY" },

  // 8. Người dùng (Users)
  "usr_view":         { module: "users",     name: "Xem danh bạ thành viên",  admin: "FULL", leader: "VIEW_ALL", pj_lead: "VIEW_ALL", member: "DENY" },
  "usr_manage":       { module: "users",     name: "Thêm/Sửa/Khóa người dùng", admin: "FULL", leader: "DENY", pj_lead: "DENY", member: "DENY" },

  // 9. Nhật ký hoạt động (Audit Log)
  "log_view":         { module: "log",       name: "Xem nhật ký hệ thống",    admin: "FULL", leader: "VIEW_ALL", pj_lead: "DENY", member: "DENY" }
};

function getPermissionMatrixInternal() {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty("PERMISSION_MATRIX_CONFIG");
    if (raw) {
      const parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_PERM_MATRIX, parsed);
    }
  } catch(e) {}
  return DEFAULT_PERM_MATRIX;
}

function getPermissionMatrix() {
  return { success: true, matrix: getPermissionMatrixInternal() };
}

function savePermissionMatrix(matrix) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== "Admin") {
      return { success: false, error: "Chỉ Admin mới có quyền lưu ma trận phân quyền" };
    }
    if (!matrix || typeof matrix !== "object") {
      return { success: false, error: "Dữ liệu ma trận không hợp lệ" };
    }
    PropertiesService.getScriptProperties().setProperty("PERMISSION_MATRIX_CONFIG", JSON.stringify(matrix));
    writeLog("UPDATE_MATRIX", "Cập nhật cấu hình Ma trận phân quyền hệ thống");
    return { success: true, matrix: matrix };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function resetPermissionMatrix() {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== "Admin") {
      return { success: false, error: "Chỉ Admin mới có quyền khôi phục ma trận phân quyền" };
    }
    PropertiesService.getScriptProperties().deleteProperty("PERMISSION_MATRIX_CONFIG");
    writeLog("RESET_MATRIX", "Khôi phục Ma trận phân quyền về mặc định chuẩn");
    return { success: true, matrix: DEFAULT_PERM_MATRIX };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function hasPermission(role, action) {
  if (!role) return false;
  if (role === "Admin") return true;

  const matrix = getPermissionMatrixInternal();
  let roleKey = "member";
  if (role === "Leader") roleKey = "leader";
  else if (role === "PJ_Lead" || role === "Manager") roleKey = "pj_lead";

  if (matrix && matrix[action]) {
    const val = matrix[action][roleKey];
    return val === "FULL" || val === "LEAD_SCOPE" || val === "VIEW_ALL";
  }

  // Fallback map
  const perms = {
    Admin  :["view","create","edit","delete","manage_users","manage_projects","manage_tasks","report","timesheet_all","timesheet_own"],
    Leader :["view","create","edit","manage_projects","manage_tasks","report","timesheet_all","timesheet_own"],
    PJ_Lead:["view","create","edit","manage_tasks","report","timesheet_own"],
    Manager:["view","create","edit","manage_tasks","report","timesheet_own"],
    Member :["view","edit_own_tasks","report_own","timesheet_own"],
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

  if (user.role === "Member") {
    // Thành viên: lọc nhiệm vụ được giao và các dự án tham gia
    tasks = allTasks.filter(t => userMatchesAssignee(t[5], user.email, user.name));
    const memberPjIds = new Set(tasks.map(t => t[1]));
    projects = allProjects.filter(p => memberPjIds.has(p[0]) || userMatchesAssignee(p[3], user.email, user.name));
  } else {
    // Admin, Leader, PJ_Lead: Xem toàn bộ dự án và nhiệm vụ để phối hợp
    projects = allProjects;
    tasks = allTasks;
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
    isTimesheetOnly: false,
    projects: mappedProjects,
    tasks   : mappedTasks,
    members,
    taxonomy: getTaxonomyDataInternal(),
    permissionMatrix: getPermissionMatrixInternal(),
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
    s.appendRow(["ID","Email","Họ Tên","Vai Trò","Trạng Thái","Ngày Tạo","Ghi Chú","Link Bảng Tính"]);
    s.getRange(1,1,1,8).setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");
    s.appendRow([generateId(),Session.getActiveUser().getEmail(),"Admin","Admin","Active",new Date(),"Tài khoản khởi tạo",""]);
  } else {
    const s = ss.getSheetByName(CONFIG.SHEET_USERS);
    if (s.getLastColumn() < 8) {
      s.getRange(1, 8).setValue("Link Bảng Tính").setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");
    }
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