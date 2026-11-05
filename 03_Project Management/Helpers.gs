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
    .addItem("📊 Mở Webapp (Tab mới)","openWebapp")
    .addItem("🖥️ Mở App trực tiếp trên Sheet","openAppInsideSheet")
    .addItem("🔗 Cài đặt Link Web App","setWebappUrl")
    .addSeparator()
    .addItem("⚙️ Khởi tạo Sheets","initSheets")
    .addItem("🔔 Setup Trigger","setupTriggers")
    .addItem("🗑️ Xóa Cache","clearAllCache")
    .addToUi();
}

function openAppInsideSheet() {
  try {
    if (typeof initSheets === "function") initSheets();
    const tmpl = HtmlService.createTemplateFromFile("Index");
    tmpl.appName = (typeof CONFIG !== "undefined" && CONFIG.APP_NAME) ? CONFIG.APP_NAME : "Quản Lý Dự Án v3.0";
    const html = tmpl.evaluate()
      .setWidth(1250)
      .setHeight(800)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showModalDialog(html, "🚀 Quản Lý Dự Án & Quản Lý Thời Gian v3.0");
  } catch(e) {
    SpreadsheetApp.getUi().alert("Lỗi khi mở giao diện: " + e.message);
  }
}

function clearAllCache() {
  try {
    CacheService.getScriptCache().removeAll(
      [CONFIG.SHEET_USERS,CONFIG.SHEET_PROJECTS,CONFIG.SHEET_TASKS,CONFIG.SHEET_LOG].map(s=>"sheet_"+s)
    );
    SpreadsheetApp.getUi().alert("✅ Đã xóa cache thành công!");
  } catch(e) { SpreadsheetApp.getUi().alert("Lỗi: "+e.message); }
}

function getStoredWebappUrl() {
  try {
    return PropertiesService.getScriptProperties().getProperty("WEBAPP_URL") || "";
  } catch(e) {
    return "";
  }
}

function setWebappUrl(customMsg) {
  const currentUrl = getStoredWebappUrl();
  const ui = SpreadsheetApp.getUi();
  const msg = customMsg || (
    "Vui lòng dán đường link Web App chính thức của bạn (link chứa 'AKfycb...' mà bạn vừa copy khi Deploy):\n" +
    (currentUrl ? "\n(Link hiện tại: " + currentUrl + ")" : "")
  );

  const res = ui.prompt("🔗 Cài đặt Link Web App", msg, ui.ButtonSet.OK_CANCEL);

  if (res.getSelectedButton() === ui.Button.OK) {
    const newUrl = res.getResponseText().trim();
    if (newUrl.startsWith("http")) {
      PropertiesService.getScriptProperties().setProperty("WEBAPP_URL", newUrl);
      ui.alert("✅ Đã lưu Web App URL thành công!\nTừ giờ nút 'Mở Webapp' sẽ mở đúng link này.");
      return newUrl;
    } else if (newUrl === "") {
      PropertiesService.getScriptProperties().deleteProperty("WEBAPP_URL");
      ui.alert("ℹ️ Đã xóa link đã lưu.");
      return null;
    } else {
      ui.alert("❌ Link không hợp lệ! Vui lòng dán link bắt đầu bằng https://...");
      return null;
    }
  }
  return null;
}

function openWebapp() {
  let url = getStoredWebappUrl();

  // Nếu chưa có link được lưu, yêu cầu người dùng dán link chính thức 1 lần duy nhất
  if (!url) {
    url = setWebappUrl("👉 Nút này cần link Web App chính thức (chứa 'AKfycb...') để mở không bị Google chặn:\n\nVui lòng dán link Web App của bạn vào đây (chỉ làm 1 lần):");
    if (!url) return;
  }

  // Mở tab mới với link thật
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_blank">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; text-align: center; color: #1e293b; background: #ffffff; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.3); margin-top: 12px; }
        .btn:hover { background: #1d4ed8; }
        .url-box { margin-top: 14px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; word-break: break-all; color: #475569; }
      </style>
    </head>
    <body>
      <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">🚀 Đang chuyển hướng đến Web App...</div>
      <p style="font-size: 13px; color: #64748b; margin: 0;">Bấm nút bên dưới nếu trình duyệt không tự mở tab mới:</p>
      
      <a href="${url}" target="_blank" class="btn" id="openLink" onclick="setTimeout(function(){ google.script.host.close(); }, 1200);">
        🌐 Mở Web App Ngay
      </a>

      <div class="url-box">
        <strong>Link:</strong> <a href="${url}" target="_blank" style="color: #2563eb;">${url}</a>
      </div>

      <script>
        window.addEventListener('load', function() {
          try {
            const w = window.open('${url}', '_blank');
            if (w) {
              setTimeout(function() { google.script.host.close(); }, 1000);
            }
          } catch(e) {}
        });
      </script>
    </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(450)
    .setHeight(230);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Mở Web App");
}