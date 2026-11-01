// ============================================================
//  File: TasksAPI.gs v3.0 (OPTIMIZED)
//  Tối ưu: invalidateCache sau write, trả về task mới trong response
// ============================================================

function getTaskDetail(taskId) {
  const user = getCurrentUser();
  if (!user || !user.registered) return { success:false, error:"Chưa đăng nhập" };
  const t = getSheetData(CONFIG.SHEET_TASKS).find(r=>r[0]===taskId);
  if (!t) return { success:false, error:"Không tìm thấy" };
  return { success:true, data:mapTaskFull(t) };
}

function addTask(payload) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role,"manage_tasks")) return { success:false, error:"Không có quyền tạo" };
  if (!payload.name || !payload.projectId) return { success:false, error:"Thiếu thông tin" };
  const project = getSheetData(CONFIG.SHEET_PROJECTS).find(p=>p[0]===payload.projectId);
  if (!project) return { success:false, error:"Dự án không tồn tại" };
  if (user.role === "Manager" && project[3] !== user.email)
    return { success:false, error:"Không có quyền tạo task trong dự án này" };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_TASKS);
  const id = generateId();
  const existing = getSheetData(CONFIG.SHEET_TASKS).filter(t=>t[1]===payload.projectId);
  const maxOrder = existing.reduce((m,t)=>Math.max(m,Number(t[19])||0),0);
  const now = new Date();
  const startD = payload.startDate ? new Date(payload.startDate) : now;
  const deadD  = payload.deadline  ? new Date(payload.deadline)  : "";

  sh.appendRow([
    id, payload.projectId, project[1], payload.name, payload.desc||"",
    payload.assignee||"", payload.priority||"Trung bình", payload.status||"Chờ thực hiện",
    startD, deadD, payload.progress||0, payload.note||"", now, user.email, now,
    payload.target||"", payload.linkResults||"", payload.outputResult||"",
    payload.reminders ? JSON.stringify(payload.reminders) : "[]", maxOrder+1
  ]);

  SpreadsheetApp.flush();
  invalidateCache([CONFIG.SHEET_TASKS, CONFIG.SHEET_PROJECTS]);
  updateProjectProgress(payload.projectId);

  if (payload.assignee) {
    const rawList = String(payload.assignee).split(',').map(s => s.trim()).filter(Boolean);
    const allUsers = getSheetData(CONFIG.SHEET_USERS);
    rawList.forEach(item => {
      let email = item;
      if (!email.includes("@")) {
        const u = allUsers.find(r => r[2] && r[2].toLowerCase() === item.toLowerCase());
        if (u && u[1]) email = u[1];
      }
      if (email && email !== user.email && email.includes("@") && !email.endsWith(".local")) {
        sendAssignmentEmail(email, payload.name, project[1], payload.deadline);
      }
    });
  }
  writeLog("ADD_TASK", `Tạo task: "${payload.name}" | DA: ${project[1]}`);

  // Trả về task mới để client update local state ngay
  const tz = "Asia/Ho_Chi_Minh";
  const todayMid = new Date(); todayMid.setHours(0,0,0,0);
  const newTask = {
    id, projectId:payload.projectId, projectName:project[1], name:payload.name,
    desc:payload.desc||"", assignee:payload.assignee||"", priority:payload.priority||"Trung bình",
    status:payload.status||"Chờ thực hiện",
    startDate  : startD ? Utilities.formatDate(startD, tz, "dd/MM/yyyy") : "",
    startRaw   : startD ? Utilities.formatDate(startD, tz, "yyyy-MM-dd") : "",
    deadline   : deadD  ? Utilities.formatDate(deadD,  tz, "dd/MM/yyyy") : "",
    deadlineRaw: deadD  ? Utilities.formatDate(deadD,  tz, "yyyy-MM-dd") : "",
    progress: payload.progress||0, note: payload.note||"",
    created  : Utilities.formatDate(now, tz, "dd/MM/yyyy HH:mm"),
    createdBy: user.email,
    updatedAt: Utilities.formatDate(now, tz, "dd/MM/yyyy HH:mm"),
    target: payload.target||"", linkResults: payload.linkResults||"",
    outputResult: payload.outputResult||"", reminders: payload.reminders||[],
    sortOrder: maxOrder + 1,
    isOverdue: deadD && (deadD < todayMid) && payload.status !== "Hoàn thành" && payload.status !== "Hủy",
  };
  return { success:true, message:`Tạo "${payload.name}" thành công`, id, task:newTask };
}

function updateTask(payload) {
  const user = getCurrentUser();
  if (!user || !user.registered) return { success:false, error:"Chưa đăng nhập" };
  if (!payload.id) return { success:false, error:"Thiếu ID" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_TASKS);
  const rows = sh.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === payload.id) {
      const canMg = hasPermission(user.role, "manage_tasks");
      const isAssignee = userMatchesAssignee(rows[i][5], user.email, user.name);

      if (user.role === "Member" && !isAssignee)
        return { success:false, error:"Không có quyền cập nhật task này" };

      if (user.role === "Member") {
        if (payload.status       !== undefined) sh.getRange(i+1, 8).setValue(payload.status);
        if (payload.progress     !== undefined) sh.getRange(i+1, 11).setValue(payload.progress);
        if (payload.note         !== undefined) sh.getRange(i+1, 12).setValue(payload.note);
        // Cho phép Member nộp kết quả công việc
        if (payload.target       !== undefined) sh.getRange(i+1, 16).setValue(payload.target);
        if (payload.linkResults  !== undefined) sh.getRange(i+1, 17).setValue(payload.linkResults);
        if (payload.outputResult !== undefined) sh.getRange(i+1, 18).setValue(payload.outputResult);
        if (payload.reminders    !== undefined) sh.getRange(i+1, 19).setValue(JSON.stringify(payload.reminders));
      } else if (canMg) {
        if (user.role === "Manager") {
          const pj = getSheetData(CONFIG.SHEET_PROJECTS).find(p => p[0] === rows[i][1]);
          if (pj && pj[3] !== user.email && !userMatchesAssignee(rows[i][5], user.email, user.name)) {
            return { success:false, error:"Không có quyền quản lý task của dự án này" };
          }
        }
        const set = (col, val) => { if (val !== undefined) sh.getRange(i+1, col).setValue(val); };
        set(4, payload.name); set(5, payload.desc); set(6, payload.assignee);
        set(7, payload.priority); set(8, payload.status);
        if (payload.startDate !== undefined) sh.getRange(i+1, 9).setValue(payload.startDate ? new Date(payload.startDate) : "");
        if (payload.deadline  !== undefined) sh.getRange(i+1, 10).setValue(payload.deadline ? new Date(payload.deadline) : "");
        if (payload.progress  !== undefined) sh.getRange(i+1, 11).setValue(payload.progress);
        set(12, payload.note); set(16, payload.target); set(17, payload.linkResults); set(18, payload.outputResult);
        if (payload.reminders !== undefined) sh.getRange(i+1, 19).setValue(JSON.stringify(payload.reminders));
      } else {
        return { success:false, error:"Không có quyền" };
      }

      sh.getRange(i+1, 15).setValue(new Date());
      SpreadsheetApp.flush();
      const pjId = rows[i][1];
      updateProjectProgress(pjId);
      invalidateCache([CONFIG.SHEET_TASKS, CONFIG.SHEET_PROJECTS]);
      writeLog("UPDATE_TASK", `Cập nhật task: ${payload.id}`);
      return { success:true, message:"Cập nhật thành công" };
    }
  }
  return { success:false, error:"Không tìm thấy" };
}

function deleteTask(taskId) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_tasks")) return { success:false, error:"Không có quyền" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_TASKS);
  const rows = sh.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === taskId) {
      if (user.role === "Manager") {
        const pj = getSheetData(CONFIG.SHEET_PROJECTS).find(p => p[0] === rows[i][1]);
        if (pj && pj[3] !== user.email) return { success:false, error:"Không có quyền xóa task của dự án này" };
      }
      const pjId = rows[i][1];
      sh.deleteRow(i+1);
      SpreadsheetApp.flush();
      updateProjectProgress(pjId);
      invalidateCache([CONFIG.SHEET_TASKS, CONFIG.SHEET_PROJECTS]);
      writeLog("DELETE_TASK", `Xóa task: ${taskId}`);
      return { success:true, message:"Đã xóa", projectId:pjId };
    }
  }
  return { success:false, error:"Không tìm thấy" };
}

function duplicateTask(taskId) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_tasks")) return { success:false, error:"Không có quyền" };
  const t = getSheetData(CONFIG.SHEET_TASKS).find(r=>r[0]===taskId);
  if (!t) return { success:false, error:"Không tìm thấy" };

  if (user.role === "Manager") {
    const pj = getSheetData(CONFIG.SHEET_PROJECTS).find(p => p[0] === t[1]);
    if (pj && pj[3] !== user.email) return { success:false, error:"Không có quyền nhân bản task của dự án này" };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_TASKS);
  const newId = generateId();
  const existing = getSheetData(CONFIG.SHEET_TASKS).filter(x=>x[1]===t[1]);
  const maxOrder = existing.reduce((m,x)=>Math.max(m,Number(x[19])||0),0);
  const now = new Date();

  sh.appendRow([
    newId, t[1], t[2], `${t[3]} (Copy)`, t[4], t[5], t[6], "Chờ thực hiện",
    t[8]||now, t[9]||"", 0, t[11]||"", now, user.email, now,
    t[15]||"", t[16]||"", t[17]||"", "[]", maxOrder+1
  ]);

  SpreadsheetApp.flush();
  updateProjectProgress(t[1]);
  invalidateCache([CONFIG.SHEET_TASKS, CONFIG.SHEET_PROJECTS]);
  writeLog("DUPLICATE_TASK", `Nhân bản task: "${t[3]}"`);
  return { success:true, message:`Đã tạo bản sao "${t[3]} (Copy)"`, id:newId };
}

function updateTaskReminders(taskId, reminders) {
  const user = getCurrentUser();
  if (!user || !user.registered) return { success:false, error:"Chưa đăng nhập" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_TASKS);
  const rows = sh.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === taskId) {
      if (user.role === "Member" && !userMatchesAssignee(rows[i][5], user.email, user.name)) return { success:false, error:"Không có quyền" };
      sh.getRange(i+1, 19).setValue(JSON.stringify(reminders));
      sh.getRange(i+1, 15).setValue(new Date());
      SpreadsheetApp.flush();
      invalidateCache([CONFIG.SHEET_TASKS]);
      return { success:true, message:"Đã cập nhật nhắc việc" };
    }
  }
  return { success:false, error:"Không tìm thấy" };
}

function sendAssignmentEmail(toEmail, taskName, projectName, deadline) {
  if (!toEmail || !toEmail.includes("@") || toEmail.endsWith(".local")) return;
  try {
    MailApp.sendEmail({
      to: toEmail,
      subject: `[${CONFIG.APP_NAME}] Bạn được giao: ${taskName}`,
      body: `Bạn vừa được giao công việc "${taskName}" trong dự án "${projectName}".\nDeadline: ${deadline || "Chưa xác định"}`
    });
  } catch(e) {}
}

function sendDeadlineReminders() {
  const tasks = getSheetData(CONFIG.SHEET_TASKS);
  const allUsers = getSheetData(CONFIG.SHEET_USERS);
  const today = new Date(), in3 = new Date(today.getTime() + 3*86400000);
  tasks.forEach(t => {
    if (!t[9] || !t[5] || t[7] === "Hoàn thành" || t[7] === "Hủy") return;
    const dl = new Date(t[9]);
    if (dl > today && dl <= in3) {
      const rawList = String(t[5]).split(',').map(s => s.trim()).filter(Boolean);
      rawList.forEach(item => {
        let email = item;
        if (!email.includes("@")) {
          const u = allUsers.find(r => r[2] && r[2].toLowerCase() === item.toLowerCase());
          if (u && u[1]) email = u[1];
        }
        if (email && email.includes("@") && !email.endsWith(".local")) {
          try {
            MailApp.sendEmail({
              to: email,
              subject: `[NHẮC] Task "${t[3]}" còn ${Math.ceil((dl - today)/86400000)} ngày`,
              body: `Công việc "${t[3]}" sẽ đến hạn ${Utilities.formatDate(dl, "Asia/Ho_Chi_Minh", "dd/MM/yyyy")}.\nTiến độ: ${t[10]}%`
            });
          } catch(e) {}
        }
      });
    }
  });
}

/**
 * Thêm hàng loạt nhiệm vụ vào một dự án (Tối ưu setValues 1 lần)
 * @param {Object} payload { projectId: string, tasks: Array<Object> }
 * @returns {Object} { success: boolean, message: string, count: number, tasks: Array<Object> }
 */
function addBulkTasks(payload) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_tasks")) {
    return { success: false, error: "Không có quyền tạo nhiệm vụ" };
  }
  if (!payload || !payload.projectId || !Array.isArray(payload.tasks) || payload.tasks.length === 0) {
    return { success: false, error: "Danh sách nhiệm vụ trống hoặc không hợp lệ" };
  }

  const project = getSheetData(CONFIG.SHEET_PROJECTS).find(p => p[0] === payload.projectId);
  if (!project) return { success: false, error: "Dự án không tồn tại" };
  if (user.role === "Manager" && project[3] !== user.email) {
    return { success: false, error: "Không có quyền tạo task trong dự án này" };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_TASKS);
  const existing = getSheetData(CONFIG.SHEET_TASKS).filter(t => t[1] === payload.projectId);
  let maxOrder = existing.reduce((m, t) => Math.max(m, Number(t[19]) || 0), 0);

  const now = new Date();
  const tz = "Asia/Ho_Chi_Minh";
  const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);

  const rowsToAdd = [];
  const clientTasks = [];
  const allUsers = getSheetData(CONFIG.SHEET_USERS);

  payload.tasks.forEach(item => {
    const taskName = (item.name || "").trim();
    if (!taskName) return;

    const id = generateId();
    maxOrder++;
    const startD = item.startDate ? new Date(item.startDate) : now;
    const deadD = item.deadline ? new Date(item.deadline) : "";
    const priority = item.priority || "Trung bình";
    const status = item.status || "Chờ thực hiện";
    const assignee = item.assignee || "";
    const desc = item.desc || "";
    const progress = Number(item.progress) || 0;
    const note = item.note || "";

    rowsToAdd.push([
      id, payload.projectId, project[1], taskName, desc,
      assignee, priority, status,
      startD, deadD, progress, note, now, user.email, now,
      "", "", "", "[]", maxOrder
    ]);

    clientTasks.push({
      id, projectId: payload.projectId, projectName: project[1], name: taskName,
      desc, assignee, priority, status,
      startDate: startD ? Utilities.formatDate(startD, tz, "dd/MM/yyyy") : "",
      startRaw: startD ? Utilities.formatDate(startD, tz, "yyyy-MM-dd") : "",
      deadline: deadD ? Utilities.formatDate(deadD, tz, "dd/MM/yyyy") : "",
      deadlineRaw: deadD ? Utilities.formatDate(deadD, tz, "yyyy-MM-dd") : "",
      progress, note,
      created: Utilities.formatDate(now, tz, "dd/MM/yyyy HH:mm"),
      createdBy: user.email,
      updatedAt: Utilities.formatDate(now, tz, "dd/MM/yyyy HH:mm"),
      target: "", linkResults: "", outputResult: "", reminders: [],
      sortOrder: maxOrder,
      isOverdue: deadD && (deadD < todayMid) && status !== "Hoàn thành" && status !== "Hủy"
    });
  });

  if (rowsToAdd.length === 0) {
    return { success: false, error: "Không có nhiệm vụ hợp lệ nào để thêm" };
  }

  const startRow = sh.getLastRow() + 1;
  sh.getRange(startRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
  SpreadsheetApp.flush();

  invalidateCache([CONFIG.SHEET_TASKS, CONFIG.SHEET_PROJECTS]);
  updateProjectProgress(payload.projectId);

  try {
    rowsToAdd.forEach(r => {
      const asgn = r[5], tName = r[3], dLine = r[9];
      if (asgn) {
        const rawList = String(asgn).split(',').map(s => s.trim()).filter(Boolean);
        rawList.forEach(item => {
          let email = item;
          if (!email.includes("@")) {
            const u = allUsers.find(x => x[2] && x[2].toLowerCase() === item.toLowerCase());
            if (u && u[1]) email = u[1];
          }
          if (email && email !== user.email && email.includes("@") && !email.endsWith(".local")) {
            sendAssignmentEmail(email, tName, project[1], dLine ? Utilities.formatDate(new Date(dLine), tz, "dd/MM/yyyy") : "");
          }
        });
      }
    });
  } catch(e) {}

  writeLog("ADD_BULK_TASKS", `Tạo hàng loạt ${rowsToAdd.length} task trong DA: "${project[1]}"`);

  return {
    success: true,
    message: `Đã tạo thành công ${rowsToAdd.length} nhiệm vụ!`,
    count: rowsToAdd.length,
    tasks: clientTasks
  };
}