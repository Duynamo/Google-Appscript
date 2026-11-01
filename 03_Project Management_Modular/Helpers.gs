// ============================================================
//  File: Helpers.gs v3.0 (OPTIMIZED)
// ============================================================

function getLogData() {
  const user=getCurrentUser();
  if (!user) return [];
  return getSheetData(CONFIG.SHEET_LOG).map(r=>{
    const row=[...r];
    if (row[0]&&row[0] instanceof Date)
      row[0]=Utilities.formatDate(new Date(row[0]),"Asia/Ho_Chi_Minh","dd/MM/yyyy HH:mm:ss");
    return row;
  });
}

// Lưu ý: Các hàm quản lý người dùng (getUsers, addUser, updateUser, deleteUser)
// được quản lý tại file UsersAPI.gs để tránh xung đột namespace.


function getLogoutUrl() { return "https://accounts.google.com/logout"; }

function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("sendDeadlineReminders").timeBased().everyDays(1).atHour(8).create();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("🚀 Project Manager v3")
    .addItem("📊 Mở Webapp","openWebapp")
    .addSeparator()
    .addItem("⚙️ Khởi tạo Sheets","initSheets")
    .addItem("🔔 Setup Trigger","setupTriggers")
    .addItem("🗑️ Xóa Cache","clearAllCache")
    .addToUi();
}

function clearAllCache() {
  try {
    CacheService.getScriptCache().removeAll(
      [CONFIG.SHEET_USERS,CONFIG.SHEET_PROJECTS,CONFIG.SHEET_TASKS,CONFIG.SHEET_LOG].map(s=>"sheet_"+s)
    );
    SpreadsheetApp.getUi().alert("✅ Đã xóa cache thành công!");
  } catch(e) { SpreadsheetApp.getUi().alert("Lỗi: "+e.message); }
}

function openWebapp() {
  const url=ScriptApp.getService().getUrl();
  if (!url) { SpreadsheetApp.getUi().alert("Chưa deploy webapp"); return; }
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(`<script>window.open('${url}','_blank');google.script.host.close();</script>`),"Đang mở...");
}