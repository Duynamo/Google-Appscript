// ============================================================
// Code.gs — Text-to-Speech Add-in for Google Sheets
// ============================================================

/**
 * Adds a custom menu to the spreadsheet when it opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔊 Đọc văn bản')
    .addItem('Mở bảng điều khiển', 'showSidebar')
    .addToUi();
}

/**
 * Opens the sidebar with the TTS control panel.
 */
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('🔊 Text-to-Speech')
    .setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Returns the value of the currently active (selected) cell.
 * Called from the sidebar via google.script.run.
 * @returns {{value: string, address: string}}
 */
function getActiveCellValue() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const cell  = sheet.getActiveCell();
  return {
    value:   cell.getDisplayValue(),
    address: cell.getA1Notation()
  };
}

/**
 * Saves the user's preferred language to PropertiesService so it persists
 * across sessions.
 * @param {string} lang  BCP-47 language tag, e.g. "ja-JP" or "vi-VN"
 */
function saveLanguagePreference(lang) {
  PropertiesService.getUserProperties().setProperty('tts_lang', lang);
}

/**
 * Retrieves the user's saved language preference.
 * @returns {string} BCP-47 language tag, or empty string if not set.
 */
function getLanguagePreference() {
  return PropertiesService.getUserProperties().getProperty('tts_lang') || '';
}
