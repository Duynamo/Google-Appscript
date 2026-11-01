const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'Index.html');
const srcHtml = fs.readFileSync(srcFile, 'utf8');

console.log('Source Index.html size:', srcHtml.length);

// 1. App_Styles.html
const styleStart = srcHtml.indexOf('<style>');
const styleEnd = srcHtml.indexOf('</style>', styleStart) + '</style>'.length;
const stylesBlock = srcHtml.substring(styleStart, styleEnd);
console.log('Styles length:', stylesBlock.length);

// 2. I18N block
const i18nStart = srcHtml.indexOf('const I18N = {');
const sStateStart = srcHtml.indexOf('const S = {', i18nStart);
// Look for where i18n ends (before S state and PTITLES)
// Let's see what is between i18n and S state:
// const I18N = ...; const STATUS_I18N = ...; const PRIORITY_I18N = ...; const ROLE_I18N = ...;
// function t(key, params, lang) ... function tTaxonomy(item, lang) ... function formatDisplayDate(dStr) ...
const formatDisplayDateEnd = srcHtml.indexOf('// ── Optimistic UI helpers ──', i18nStart);
console.log('i18n block length:', formatDisplayDateEnd - i18nStart);
const i18nBlock = '<script>\n' + srcHtml.substring(i18nStart, formatDisplayDateEnd).trim() + '\n</script>';

console.log('i18n block ready, length:', i18nBlock.length);

