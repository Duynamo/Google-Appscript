// ============================================================
// SMART COLUMN FILTER - Google Apps Script
// ============================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔍 Smart Filter')
    .addItem('Mở Filter Panel', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Smart Column Filter')
    .setWidth(380);
  SpreadsheetApp.getUi().showSidebar(html);
}

// Lấy danh sách tất cả sheets
function getSheetNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets().map(s => s.getName());
}

// Lấy danh sách sheets + tên sheet hiện tại đang active
function getSheetNamesWithActive() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const names = ss.getSheets().map(s => s.getName());
  const active = ss.getActiveSheet().getName();
  return { names: names, active: active };
}

// Lấy headers của sheet được chọn (row đầu tiên có dữ liệu)
function getHeaders(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];

  // Tìm header row (row đầu tiên không trống)
  const data = sheet.getRange(1, 1, Math.min(5, sheet.getLastRow()), lastCol).getValues();
  let headerRowIndex = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].some(cell => cell !== '')) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = data[headerRowIndex];
  return headers.map((h, idx) => ({
    index: idx,
    name: String(h).trim(),
    letter: columnToLetter(idx + 1)
  })).filter(h => h.name !== '');
}

// Lấy dữ liệu để filter: trả về mảng {label, link, rowIndex}
function getFilterData(sheetName, labelColIndex, linkColIndex, headerRowNum) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow <= headerRowNum) return [];

  const dataStartRow = headerRowNum + 1;
  const numRows = lastRow - headerRowNum;

  // Lấy label column và link column
  const labelRange = sheet.getRange(dataStartRow, labelColIndex + 1, numRows, 1).getValues();
  const linkRange = sheet.getRange(dataStartRow, linkColIndex + 1, numRows, 1).getValues();
  const linkFormulas = sheet.getRange(dataStartRow, linkColIndex + 1, numRows, 1).getFormulas();

  // Lấy rich text values để extract URL từ hyperlink
  let richTextValues = null;
  try {
    richTextValues = sheet.getRange(dataStartRow, linkColIndex + 1, numRows, 1).getRichTextValues();
  } catch(e) {}

  const results = [];
  for (let i = 0; i < numRows; i++) {
    const label = String(labelRange[i][0]).trim();
    if (!label || label === '') continue;

    let linkText = String(linkRange[i][0]).trim();
    let linkUrl = linkText;
    let formula = String(linkFormulas[i][0]).trim();

    // Thử extract URL từ rich text (nếu cell có hyperlink)
    if (richTextValues && richTextValues[i] && richTextValues[i][0]) {
      const rt = richTextValues[i][0];
      const runs = rt.getRuns();
      if (runs.length > 0) {
        const linkObj = runs[0].getLinkUrl ? runs[0].getLinkUrl() : null;
        if (linkObj) {
          linkUrl = linkObj;
          if (!linkText || linkText === '') linkText = linkUrl;
        }
      }
    }

    // Nếu không có linkUrl từ rich text, thử extract từ HYPERLINK formula
    if ((!linkUrl || linkUrl === linkText) && formula.toUpperCase().startsWith('=HYPERLINK')) {
      const match = formula.match(/=HYPERLINK\(\s*"([^"]+)"/i);
      if (match && match[1]) {
        linkUrl = match[1];
      }
    }

    // Kiểm tra nếu text trông như URL
    if (!linkUrl && linkText.startsWith('http')) {
      linkUrl = linkText;
    }

    results.push({
      label: label,
      linkText: linkText || '(no link)',
      linkUrl: linkUrl || '',
      rowIndex: dataStartRow + i
    });
  }

  return results;
}

// Tìm header row number (1-based)
function findHeaderRow(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return 1;

  const data = sheet.getRange(1, 1, Math.min(10, sheet.getLastRow()), sheet.getLastColumn()).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i].some(cell => cell !== '')) return i + 1;
  }
  return 1;
}

// Helper: convert column number to letter
function columnToLetter(col) {
  let letter = '';
  while (col > 0) {
    const rem = (col - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

// Scroll đến row trong sheet
function scrollToRow(sheetName, rowIndex) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      ss.setActiveSheet(sheet);
      sheet.setActiveRange(sheet.getRange(rowIndex, 1));
    }
  } catch(e) {}
}