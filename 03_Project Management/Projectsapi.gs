// ============================================================
//  File: ProjectsAPI.gs v3.0 (OPTIMIZED)
//  Tối ưu: invalidateCache sau mỗi write, trả về data mới ngay
// ============================================================

function mapProject(r) {
  const tz = "Asia/Ho_Chi_Minh";
  let members = [];
  try { members = r[10] ? JSON.parse(r[10]) : []; } catch(e) { members = []; }
  return {
    id:r[0], name:r[1], desc:r[2], manager:r[3],
    startDate: r[4] ? Utilities.formatDate(new Date(r[4]),tz,"dd/MM/yyyy") : "",
    endDate  : r[5] ? Utilities.formatDate(new Date(r[5]),tz,"dd/MM/yyyy") : "",
    startRaw : r[4] ? Utilities.formatDate(new Date(r[4]),tz,"yyyy-MM-dd") : "",
    endRaw   : r[5] ? Utilities.formatDate(new Date(r[5]),tz,"yyyy-MM-dd") : "",
    status:r[6], progress:r[7]||0,
    created  : r[8] ? Utilities.formatDate(new Date(r[8]),tz,"dd/MM/yyyy") : "",
    createdBy: r[9],
    members: members,
  };
}

function getProjectDetail(projectId) {
  const user = getCurrentUser();
  if (!user || !user.registered) return { success:false, error:"Chưa đăng nhập" };
  const project = getSheetData(CONFIG.SHEET_PROJECTS).find(p=>p[0]===projectId);
  if (!project) return { success:false, error:"Không tìm thấy dự án" };
  const tasks = getSheetData(CONFIG.SHEET_TASKS)
    .filter(t=>t[1]===projectId)
    .sort((a,b)=>(Number(a[19])||999)-(Number(b[19])||999))
    .map(t=>mapTaskFull(t));
  return {
    success:true, project:mapProject(project),
    stats:{ total:tasks.length, completed:tasks.filter(t=>t.status==="Hoàn thành").length,
            inProgress:tasks.filter(t=>t.status==="Đang thực hiện"||t.status==="Đang tiến hành").length,
            overdue:tasks.filter(t=>t.isOverdue).length, progress:project[7]||0 },
    tasks,
  };
}

function saveProjectMembers(projectId, members) {
  const user = getCurrentUser();
  if (!user || !user.registered) return { success:false, error:"Chưa đăng nhập" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_PROJECTS);
  if (sh.getLastColumn() < 11) {
    sh.getRange(1, 11).setValue("Thành Viên").setFontWeight("bold").setBackground("#34a853").setFontColor("white");
  }
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === projectId) {
      if (user.role === "Manager" && rows[i][3] !== user.email)
        return { success:false, error:"Không phải manager của dự án" };
      sh.getRange(i + 1, 11).setValue(JSON.stringify(members || []));
      SpreadsheetApp.flush();
      invalidateCache([CONFIG.SHEET_PROJECTS]);
      writeLog("UPDATE_MEMBERS", `Cập nhật thành viên DA: ${projectId}`);
      return { success:true, message:"Đã lưu thành viên dự án" };
    }
  }
  return { success:false, error:"Không tìm thấy dự án" };
}

function addProject(payload) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role,"manage_projects")) return { success:false, error:"Không có quyền tạo dự án" };
  if (!payload.name) return { success:false, error:"Tên không được để trống" };
  
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { success:false, error:"Hệ thống đang bận, vui lòng thử lại sau" };

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const id = "DA" + genPjNum();
    const sh = ss.getSheetByName(CONFIG.SHEET_PROJECTS);
    if (sh.getLastColumn() < 11) {
      sh.getRange(1, 11).setValue("Thành Viên").setFontWeight("bold").setBackground("#34a853").setFontColor("white");
    }
    sh.appendRow([
      id, payload.name, payload.desc||"", payload.manager||user.email,
      payload.startDate?new Date(payload.startDate):new Date(),
      payload.endDate?new Date(payload.endDate):"",
      payload.status||"Lên kế hoạch", 0, new Date(), user.email,
      JSON.stringify(payload.members||[])
    ]);
    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_PROJECTS]);
    writeLog("ADD_PROJECT",`Tạo dự án: "${payload.name}" | ID: ${id}`);
    
    const newProject = { id, name:payload.name, desc:payload.desc||"", manager:payload.manager||user.email,
      startDate:payload.startDate||"", endDate:payload.endDate||"",
      startRaw:payload.startDate||"", endRaw:payload.endDate||"",
      status:payload.status||"Lên kế hoạch", progress:0, created:"", createdBy:user.email,
      members: payload.members||[] };
    return { success:true, message:`Tạo dự án "${payload.name}" thành công`, id, project:newProject };
  } finally {
    lock.releaseLock();
  }
}

function updateProject(payload) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role,"manage_projects")) return { success:false, error:"Không có quyền" };
  if (!payload.id) return { success:false, error:"Thiếu ID" };
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sh=ss.getSheetByName(CONFIG.SHEET_PROJECTS);
  const rows=sh.getDataRange().getValues();
  for (let i=1;i<rows.length;i++) {
    if (rows[i][0]===payload.id) {
      if (user.role==="Manager"&&rows[i][3]!==user.email) return { success:false, error:"Không phải manager" };
      if (payload.name    !==undefined) sh.getRange(i+1,2).setValue(payload.name);
      if (payload.desc    !==undefined) sh.getRange(i+1,3).setValue(payload.desc);
      if (payload.manager !==undefined) sh.getRange(i+1,4).setValue(payload.manager);
      if (payload.startDate) sh.getRange(i+1,5).setValue(new Date(payload.startDate));
      if (payload.endDate)   sh.getRange(i+1,6).setValue(new Date(payload.endDate));
      if (payload.status  !==undefined) sh.getRange(i+1,7).setValue(payload.status);
      SpreadsheetApp.flush();
      updateProjectProgress(payload.id);
      invalidateCache([CONFIG.SHEET_PROJECTS]);
      writeLog("UPDATE_PROJECT",`Cập nhật DA: ${payload.id}`);
      return { success:true, message:"Cập nhật thành công" };
    }
  }
  return { success:false, error:"Không tìm thấy" };
}

function deleteProject(projectId) {
  const user = getCurrentUser();
  if (!user||user.role!=="Admin") return { success:false, error:"Chỉ Admin" };
  
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { success:false, error:"Hệ thống đang bận, vui lòng thử lại sau" };

  try {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=ss.getSheetByName(CONFIG.SHEET_PROJECTS);
    const rows=sh.getDataRange().getValues();
    let found = false;
    for (let i=1;i<rows.length;i++) {
      if (rows[i][0]===projectId) {
        sh.deleteRow(i+1);
        found = true;
        break;
      }
    }
    if (!found) return { success:false, error:"Không tìm thấy" };

    // Cascade delete: Xóa toàn bộ task thuộc dự án bị xóa trong SHEET_TASKS
    const shTk = ss.getSheetByName(CONFIG.SHEET_TASKS);
    if (shTk) {
      const tkRows = shTk.getDataRange().getValues();
      for (let j = tkRows.length - 1; j >= 1; j--) {
        if (tkRows[j][1] === projectId) {
          shTk.deleteRow(j + 1);
        }
      }
    }

    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_PROJECTS, CONFIG.SHEET_TASKS]);
    writeLog("DELETE_PROJECT",`Xóa DA: ${projectId} và toàn bộ task liên quan`);
    return { success:true, message:"Đã xóa dự án và các nhiệm vụ liên quan" };
  } finally {
    lock.releaseLock();
  }
}

function duplicateProject(projectId, newName) {
  const user = getCurrentUser();
  if (!user||!hasPermission(user.role,"manage_projects")) return { success:false, error:"Không có quyền" };
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const shPj=ss.getSheetByName(CONFIG.SHEET_PROJECTS);
  const shTk=ss.getSheetByName(CONFIG.SHEET_TASKS);
  const pjRows=shPj.getDataRange().getValues();
  let src=null;
  for (let i=1;i<pjRows.length;i++) { if(pjRows[i][0]===projectId){src=pjRows[i];break;} }
  if (!src) return { success:false, error:"Không tìm thấy dự án gốc" };
  const newId="DA"+genPjNum();
  const name=newName||`${src[1]} (Copy)`;
  shPj.appendRow([newId,name,src[2],src[3],src[4]||"",src[5]||"","Lên kế hoạch",0,new Date(),user.email,src[10]||"[]"]);
  const tkRows=shTk.getDataRange().getValues();
  let ord=1;
  for (let i=1;i<tkRows.length;i++) {
    if (tkRows[i][1]===projectId) {
      shTk.appendRow([generateId(),newId,name,tkRows[i][3],tkRows[i][4],"",tkRows[i][6],"Chờ thực hiện",
        tkRows[i][8]||new Date(),tkRows[i][9]||"",0,tkRows[i][11]||"",new Date(),user.email,new Date(),
        tkRows[i][15]||"",tkRows[i][16]||"",tkRows[i][17]||"","[]",ord++]);
    }
  }
  SpreadsheetApp.flush();
  invalidateCache([CONFIG.SHEET_PROJECTS,CONFIG.SHEET_TASKS]);
  writeLog("DUPLICATE_PROJECT",`Nhân bản: "${name}" từ ${projectId}`);
  return { success:true, message:`Đã tạo bản sao "${name}"`, id:newId };
}

function updateProjectProgress(projectId) {
  SpreadsheetApp.flush();
  const tasks=_readSheet(CONFIG.SHEET_TASKS).filter(r=>r[1]===projectId);
  const avg = tasks.length ? Math.round(tasks.reduce((s,t)=>s+(Number(t[10])||0),0)/tasks.length) : 0;
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sh=ss.getSheetByName(CONFIG.SHEET_PROJECTS);
  const rows=sh.getDataRange().getValues();
  for (let i=1;i<rows.length;i++) {
    if (rows[i][0]===projectId) {
      sh.getRange(i+1,8).setValue(avg);
      if (avg===100&&rows[i][6]==="Đang thực hiện") sh.getRange(i+1,7).setValue("Hoàn thành");
      break;
    }
  }
  SpreadsheetApp.flush();
  invalidateCache([CONFIG.SHEET_PROJECTS]);
}

function saveTaskOrder(orderedIds) {
  const user=getCurrentUser();
  if (!user||!user.registered) return { success:false };
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sh=ss.getSheetByName(CONFIG.SHEET_TASKS);
  const rows=sh.getDataRange().getValues();
  if (rows.length <= 1) return { success:true };
  const idxMap={};
  orderedIds.forEach((id,i)=>idxMap[id]=i+1);
  const col20 = [];
  for (let i=1;i<rows.length;i++) {
    const taskId = rows[i][0];
    col20.push([idxMap[taskId]!==undefined ? idxMap[taskId] : (Number(rows[i][19])||999)]);
  }
  sh.getRange(2,20,col20.length,1).setValues(col20);
  SpreadsheetApp.flush();
  invalidateCache([CONFIG.SHEET_TASKS]);
  return { success:true };
}

function getGanttData(staffFilter) {
  const user=getCurrentUser();
  if (!user||!user.registered) return { success:false, error:"Chưa đăng nhập" };
  let projects=getSheetData(CONFIG.SHEET_PROJECTS);
  let tasks=getSheetData(CONFIG.SHEET_TASKS);
  if (user.role==="Manager") {
    projects=projects.filter(p=>p[3]===user.email);
    const pjIds=new Set(projects.map(p=>p[0]));
    tasks=tasks.filter(t=>pjIds.has(t[1])||t[5]===user.email);
    const relatedIds = new Set([...pjIds, ...tasks.map(t=>t[1])]);
    projects = projects.filter(p=>relatedIds.has(p[0]));
  } else if (user.role==="Member") {
    tasks=tasks.filter(t=>t[5]===user.email);
    const myPjIds=new Set(tasks.map(t=>t[1]));
    projects=projects.filter(p=>myPjIds.has(p[0]));
  }
  if (staffFilter&&staffFilter!=="all") tasks=tasks.filter(t=>t[5]===staffFilter);
  tasks.sort((a,b)=>(Number(a[19])||999)-(Number(b[19])||999));
  return { success:true, data:projects.map(p=>({ project:mapProject(p), tasks:tasks.filter(t=>t[1]===p[0]).map(t=>mapTaskFull(t)) })) };
}

function getDashboardStats() {
  return getInitData();
}

function exportProjectReport(projectId) {
  const user=getCurrentUser();
  if (!user||!hasPermission(user.role,"report")) return { success:false, error:"Không có quyền" };
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const project=getSheetData(CONFIG.SHEET_PROJECTS).find(p=>p[0]===projectId);
  if (!project) return { success:false, error:"Không tìm thấy" };
  const tasks=getSheetData(CONFIG.SHEET_TASKS).filter(t=>t[1]===projectId);
  const safeName = (project[1]||"DA").replace(/[:\\/\?\*\[\]]/g, "_").substring(0, 15);
  const shName=`BC_${safeName}_${Utilities.formatDate(new Date(),"Asia/Ho_Chi_Minh","ddMMyyyy_HHmm")}`;
  let sh=ss.getSheetByName(shName);
  if (sh) ss.deleteSheet(sh);
  sh=ss.insertSheet(shName);
  sh.getRange("A1:H1").merge().setValue(`BÁO CÁO: ${project[1]}`).setFontSize(14).setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");
  sh.getRange("A2").setValue("Xuất: "+user.email);
  sh.getRange("D2").setValue(Utilities.formatDate(new Date(),"Asia/Ho_Chi_Minh","dd/MM/yyyy HH:mm"));
  sh.getRange(4,1,1,8).setValues([["STT","Tên Công Việc","Người TH","Ưu Tiên","Trạng Thái","Deadline","Tiến Độ %","Ghi Chú"]]).setFontWeight("bold").setBackground("#34a853").setFontColor("white");
  tasks.forEach((t,i)=>sh.appendRow([i+1,t[3],t[5],t[6],t[7],t[9]?Utilities.formatDate(new Date(t[9]),"Asia/Ho_Chi_Minh","dd/MM/yyyy"):"",t[10],t[11]]));
  sh.autoResizeColumns(1,8);
  writeLog("EXPORT_REPORT",`Xuất BC: ${project[1]}`);
  return { success:true, message:`Đã xuất sheet "${shName}"` };
}

function genPjNum() {
  const existing=_readSheet(CONFIG.SHEET_PROJECTS);
  let n=existing.length+1, id;
  do { id=String(n).padStart(3,"0"); n++; } while (existing.some(p=>p[0]==="DA"+id));
  return id;
}