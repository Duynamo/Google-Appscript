// ============================================================
//  Code.gs  –  Email Flow Manager with Label Filter UI
//  Phụ thuộc: Dialog.html (cùng project Apps Script)
// ============================================================

const PROP_KEY_LABELS   = 'SELECTED_LABELS';
const PROP_KEY_LAST_RUN = 'LAST_RUN_TS';

// ============================================================
//  SYSTEM LABELS cần loại bỏ
//  GmailApp.getUserLabels() đôi khi trả về cả các nhãn hệ thống
//  ẩn bắt đầu bằng "[Gmail]/" hoặc "CATEGORY_" hoặc tên nội bộ.
//  Danh sách này lọc chúng ra để chỉ giữ nhãn người dùng tự tạo.
// ============================================================
const SYSTEM_LABEL_PREFIXES = [
  '[Gmail]',
  'CATEGORY_',
  'CHAT',
  'DRAFT',
  'INBOX',
  'IMPORTANT',
  'SENT',
  'SPAM',
  'STARRED',
  'TRASH',
  'UNREAD',
];

/**
 * Kiểm tra xem một tên nhãn có phải nhãn hệ thống không.
 * @param {string} name
 * @returns {boolean}
 */
function _isSystemLabel(name) {
  for (var i = 0; i < SYSTEM_LABEL_PREFIXES.length; i++) {
    if (name.indexOf(SYSTEM_LABEL_PREFIXES[i]) === 0) return true;
  }
  return false;
}

// ============================================================
//  1. MENU
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📧 Hệ thống Email')
    .addItem('🔄 Cập nhật Email (Refresh)', 'handleRefresh')
    .addItem('♻️  Tải lại từ đầu (Reset)', 'handleReset')
    .addSeparator()
    .addItem('🏷️  Thay đổi Nhãn (Change Labels)', 'showLabelDialog')
    .addSeparator()
    .addItem('ℹ️  Tài khoản đang dùng', 'showActiveAccount')
    .addToUi();
}

// ============================================================
//  2. HIỂN THỊ TÀI KHOẢN ĐANG CHẠY SCRIPT
//  Giúp xác nhận script đang trỏ đúng Gmail account.
// ============================================================
function showActiveAccount() {
  const email = Session.getEffectiveUser().getEmail();
  SpreadsheetApp.getUi().alert(
    'Tài khoản Gmail đang sử dụng:\n\n' + email +
    '\n\nNếu không đúng, hãy đổi tài khoản Google đang đăng nhập trên trình duyệt.'
  );
}

// ============================================================
//  3. XỬ LÝ NÚT REFRESH và RESET
// ============================================================
function handleRefresh() {
  const props           = PropertiesService.getDocumentProperties();
  const savedLabelsJson = props.getProperty(PROP_KEY_LABELS);

  if (!savedLabelsJson) {
    showLabelDialog(true);
  } else {
    const labels = JSON.parse(savedLabelsJson);
    if (!labels || labels.length === 0) {
      showLabelDialog(true);
    } else {
      fetchAndProcessEmails(labels);
    }
  }
}

/**
 * Xóa timestamp lần chạy trước → tải lại TOÀN BỘ email từ đầu.
 * Dùng khi muốn re-import hoặc dữ liệu bị đặt lại.
 */
function handleReset() {
  const ui    = SpreadsheetApp.getUi();
  const props = PropertiesService.getDocumentProperties();

  const savedLabelsJson = props.getProperty(PROP_KEY_LABELS);
  if (!savedLabelsJson) {
    showLabelDialog(true);
    return;
  }

  const confirm = ui.alert(
    '♻️ Tải lại từ đầu',
    'Thao tác này sẽ XÓA TOÀN BỘ dữ liệu hiện tại và ghi lại mới.\n\nTiếp tục?',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  // 1. Xóa timestamp → query không có "after:"
  props.deleteProperty(PROP_KEY_LAST_RUN);

  // 2. Xóa toàn bộ nội dung sheet (kể cả header)
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clearContents();
  Logger.log('[handleReset] Đã xóa sheet và LAST_RUN_TS, ghi lại toàn bộ...');

  // 3. Tải và ghi lại
  const labels = JSON.parse(savedLabelsJson);
  fetchAndProcessEmails(labels);
}

// ============================================================
//  4. DIALOG CHỌN NHÃN
// ============================================================
/**
 * @param {boolean} isFirstSetup - true = auto-refresh ngay sau khi lưu
 */
function showLabelDialog(isFirstSetup) {
  const template = HtmlService.createTemplateFromFile('Dialog');

  // ── Lấy nhãn người dùng TỰ TẠO, loại bỏ system labels ──
  const rawLabels = GmailApp.getUserLabels();
  const userLabels = rawLabels
    .map(function(l) { return l.getName(); })
    .filter(function(name) { return !_isSystemLabel(name); })
    .sort();

  Logger.log('[showLabelDialog] Tài khoản: %s | Số nhãn người dùng: %s',
    Session.getEffectiveUser().getEmail(), userLabels.length);
  Logger.log('[showLabelDialog] Danh sách nhãn: %s', userLabels.join(' | '));

  // ── Nhãn đã lưu ─────────────────────────────────────────
  const props           = PropertiesService.getDocumentProperties();
  const savedLabelsJson = props.getProperty(PROP_KEY_LABELS);
  const savedLabels     = savedLabelsJson ? JSON.parse(savedLabelsJson) : [];

  // ── QUAN TRỌNG: Truyền JSON string qua scriptlet ─────────
  // Dùng JSON.stringify 2 lần để tránh ký tự đặc biệt phá vỡ JS trong HTML.
  // Phía HTML sẽ JSON.parse() một lần để lấy lại array.
  template.allLabelsJson   = JSON.stringify(userLabels);   // → chuỗi JSON an toàn
  template.savedLabelsJson = JSON.stringify(savedLabels);
  template.isFirstSetup    = isFirstSetup ? 'true' : 'false';

  const htmlOutput = template.evaluate()
    .setWidth(580)
    .setHeight(620)
    .setTitle('🏷️  Cấu hình nhãn Gmail');

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '🏷️  Cấu hình nhãn Gmail');
}

// ============================================================
//  5a. TRẢ VỀ EMAIL TÀI KHOẢN ĐANG CHẠY (gọi từ Dialog)
// ============================================================
function getActiveEmail() {
  return Session.getEffectiveUser().getEmail();
}

// ============================================================
//  5. LƯU CẤU HÌNH (được gọi bởi google.script.run từ Dialog)
// ============================================================
/**
 * @param {string[]} selectedLabels
 * @param {string}   isFirstSetup
 * @returns {string} 'OK' hoặc thông báo lỗi
 */
function saveLabelsAndRun(selectedLabels, isFirstSetup) {
  if (!selectedLabels || selectedLabels.length === 0) {
    return 'ERROR: Bạn chưa chọn nhãn nào!';
  }

  const props = PropertiesService.getDocumentProperties();
  props.setProperty(PROP_KEY_LABELS, JSON.stringify(selectedLabels));

  Logger.log('[saveLabelsAndRun] Đã lưu %s nhãn: %s',
    selectedLabels.length, selectedLabels.join(', '));

  if (isFirstSetup === true || isFirstSetup === 'true') {
    fetchAndProcessEmails(selectedLabels);
  }

  return 'OK';
}

// ============================================================
//  6. QUÉT VÀ XỬ LÝ EMAIL
// ============================================================
function fetchAndProcessEmails(labels) {
  if (!labels || labels.length === 0) return;

  const ui = SpreadsheetApp.getUi();

  const labelQuery = labels
    .map(function(l) { return 'label:"' + l + '"'; })
    .join(' OR ');

  const props      = PropertiesService.getDocumentProperties();
  const lastRunRaw = props.getProperty(PROP_KEY_LAST_RUN);
  const fullQuery  = lastRunRaw
    ? labelQuery + ' after:' + lastRunRaw
    : labelQuery;

  Logger.log('[fetchAndProcessEmails] Query: %s', fullQuery);

  const threads = GmailApp.search(fullQuery, 0, 50);

  if (threads.length === 0) {
    ui.alert('✅ Không có email mới để xử lý.');
    return;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  _ensureHeaders(sheet);

  // ── Gom tất cả email vào mảng ────────────────────────────────
  var rows = [];
  threads.forEach(function(thread) {
    var threadLabels = thread.getLabels()
      .map(function(l) { return l.getName(); }).join(', ');
    thread.getMessages().forEach(function(msg) {
      var toField  = msg.getTo()  || '';
      var ccField  = msg.getCc()  || '';
      var allRecipients = [toField, ccField]
        .filter(function(s) { return s.trim() !== ''; }).join(', ');
      rows.push({
        date: msg.getDate(),
        rowData: [
          msg.getDate(),       // A: Ngày
          msg.getFrom(),       // B: Người gửi
          allRecipients,       // C: Người nhận (To + CC)
          msg.getSubject(),    // D: Tiêu đề gốc
          threadLabels,        // E: Nhãn
          msg.getPlainBody(),  // F: Nội dung
          new Date()           // G: Cập nhật lúc
        ]
      });
    });
  });

  // ── Sắp xếp: nhóm theo Label (A→Z), trong cùng label → cũ nhất trước ──
  rows.sort(function(a, b) {
    var labelA = a.rowData[4] || '';  // cột E: Nhãn
    var labelB = b.rowData[4] || '';
    if (labelA < labelB) return -1;
    if (labelA > labelB) return  1;
    return a.date - b.date;           // cùng label → cũ hơn lên trước
  });

  // ── Ghi dữ liệu + áp dụng Rich Text ──────────────────────────
  var startRow = sheet.getLastRow() + 1;
  rows.forEach(function(row, i) {
    sheet.appendRow(row.rowData);
    // Cột F (số 6): tô màu nội dung email
    sheet.getRange(startRow + i, 6)
         .setRichTextValue(_buildBodyRichText(row.rowData[5]));
  });

  props.setProperty(PROP_KEY_LAST_RUN, String(Math.floor(Date.now() / 1000)));
  ui.alert('✅ Hoàn thành!\nĐã xử lý ' + rows.length + ' email từ ' + threads.length + ' cuộc hội thoại.');
}

// (Hàm _translateText đã được xóa — cột tiêu đề đã dịch không còn sử dụng)

// ============================================================
//  8. TIỆN ÍCH
// ============================================================
function _ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    // Thứ tự: Ngày → Người gửi → Người nhận → Tiêu đề gốc → Nhãn → Nội dung → Cập nhật lúc
    const headers = ['Ngày', 'Người gửi', 'Người nhận', 'Tiêu đề gốc', 'Nhãn', 'Nội dung', 'Cập nhật lúc'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight('bold')
         .setBackground('#1a1a2e')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}

// ============================================================
//  9. RICH TEXT: Tô màu nội dung email
//  • Nội dung chính (không quote): Đỏ  #CC0000
//  • Dòng quote "> ...": Dark Gray 3  #434343
//  • Dòng ngày giờ (On ... wrote:):  Dark Gray 3  #434343
// ============================================================
function _buildBodyRichText(body) {
  if (!body) return SpreadsheetApp.newRichTextValue().setText('').build();

  var RED  = '#CC0000';  // Đỏ — nội dung chính
  var GRAY = '#434343';  // Dark Gray 3 — phần quote và ngày giờ

  var redStyle  = SpreadsheetApp.newTextStyle().setForegroundColor(RED).build();
  var grayStyle = SpreadsheetApp.newTextStyle().setForegroundColor(GRAY).build();

  var builder = SpreadsheetApp.newRichTextValue().setText(body);
  var lines   = body.split('\n');
  var pos     = 0;

  lines.forEach(function(line) {
    var len = line.length;
    var end = Math.min(pos + len, body.length);

    if (len > 0 && pos < body.length) {
      // Dòng được quote: bắt đầu bằng ">"
      // Dòng info ngày gửi: "On [ngày], [người] wrote:"
      var isGray = /^>/.test(line)
                || /^On .+wrote:/i.test(line)
                || /^Sent:/i.test(line)
                || /^From:/i.test(line)
                || /^To:/i.test(line)
                || /^Cc:/i.test(line)
                || /^Subject:/i.test(line);
      builder.setTextStyle(pos, end, isGray ? grayStyle : redStyle);
    }

    pos += len + 1; // +1 cho ký tự '\n'
  });

  return builder.build();
}

// ============================================================
//  DEBUG: Chạy hàm này từ Apps Script Editor để kiểm tra
//  xem script đang đọc đúng tài khoản và nhãn nào không.
// ============================================================
function debugListLabels() {
  const email    = Session.getEffectiveUser().getEmail();
  const raw      = GmailApp.getUserLabels();
  const allNames = raw.map(function(l) { return l.getName(); }).sort();
  const userOnly = allNames.filter(function(n) { return !_isSystemLabel(n); });

  Logger.log('=== DEBUG LABEL LIST ===');
  Logger.log('Tài khoản: ' + email);
  Logger.log('Tổng labels (raw): ' + allNames.length);
  Logger.log('Labels người dùng (sau lọc): ' + userOnly.length);
  Logger.log('--- Danh sách (đã lọc) ---');
  userOnly.forEach(function(n, i) { Logger.log((i+1) + '. ' + n); });
  Logger.log('--- Labels bị lọc bỏ (system) ---');
  allNames.filter(function(n) { return _isSystemLabel(n); })
          .forEach(function(n) { Logger.log('  [SYS] ' + n); });
}