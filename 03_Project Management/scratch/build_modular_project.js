const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'Index.html');
const destDir = path.join(__dirname, '..', '..', '03_Project Management_Modular');

console.log('--- BẮT ĐẦU PHÂN TÁCH MODULAR SANG THƯ MỤC MỚI ---');
console.log('Source:', srcFile);
console.log('Destination:', destDir);

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const rawHtml = fs.readFileSync(srcFile, 'utf8');
const lines = rawHtml.split('\n');

function sliceLines(startLine1, endLine1) {
  return lines.slice(startLine1 - 1, endLine1).join('\n');
}

// 1. App_Styles.html (Lines 9 to 538)
const appStylesContent = sliceLines(9, 538);
fs.writeFileSync(path.join(destDir, 'App_Styles.html'), appStylesContent, 'utf8');
console.log('✅ 1. App_Styles.html written:', appStylesContent.length, 'bytes');

// 2. JS_I18n.html (Lines 2073 to 3719)
const i18nContent = '<script>\n' + sliceLines(2073, 3719) + '\n</script>';
fs.writeFileSync(path.join(destDir, 'JS_I18n.html'), i18nContent, 'utf8');
console.log('✅ 2. JS_I18n.html written:', i18nContent.length, 'bytes');

// 3. Page_Projects_Tasks.html
// Projects (Lines 860 - 878), Tasks (Lines 879 - 899)
// Modals: m-pj (1372 - 1422), m-dup-pj (1423 - 1434), m-qtk (1435 - 1596)
const projectsTasksContent = [
  sliceLines(860, 899),
  sliceLines(1372, 1596)
].join('\n\n');
fs.writeFileSync(path.join(destDir, 'Page_Projects_Tasks.html'), projectsTasksContent, 'utf8');
console.log('✅ 3. Page_Projects_Tasks.html written:', projectsTasksContent.length, 'bytes');

// 4. Page_Gantt.html
// View (Lines 648 - 691), Script (Lines 4954 - 5261)
const ganttContent = [
  sliceLines(648, 691),
  '<script>',
  sliceLines(4954, 5261),
  '</script>'
].join('\n\n');
fs.writeFileSync(path.join(destDir, 'Page_Gantt.html'), ganttContent, 'utf8');
console.log('✅ 4. Page_Gantt.html written:', ganttContent.length, 'bytes');

// 5. Page_Timesheet.html
// View (Lines 1012 - 1295), Modal m-confirm-overwrite (Lines 2045 - 2067)
const pageTimesheetContent = [
  sliceLines(1012, 1295),
  sliceLines(2045, 2067)
].join('\n\n');
fs.writeFileSync(path.join(destDir, 'Page_Timesheet.html'), pageTimesheetContent, 'utf8');
console.log('✅ 5. Page_Timesheet.html written:', pageTimesheetContent.length, 'bytes');

// 6. JS_Timesheet.html
// Lines 8413 to 9910
const jsTimesheetContent = [
  '<script>',
  sliceLines(8413, 9910),
  '</script>'
].join('\n\n');
fs.writeFileSync(path.join(destDir, 'JS_Timesheet.html'), jsTimesheetContent, 'utf8');
console.log('✅ 6. JS_Timesheet.html written:', jsTimesheetContent.length, 'bytes');

// 7. Page_Taxonomy_Log.html
// Taxonomy (Lines 912 - 1011), Log (Lines 1296 - 1307)
// Modals: m-tax (1841 - 1991), m-batch-tax (1992 - 2044)
const pageTaxLogContent = [
  sliceLines(912, 1011),
  sliceLines(1296, 1307),
  sliceLines(1841, 2044)
].join('\n\n');
fs.writeFileSync(path.join(destDir, 'Page_Taxonomy_Log.html'), pageTaxLogContent, 'utf8');
console.log('✅ 7. Page_Taxonomy_Log.html written:', pageTaxLogContent.length, 'bytes');

// 8. JS_App.html
// Core SPA JS 1 (Lines 3720 - 4953)
// Core SPA JS 2 (Lines 5262 - 8412)
let jsAppContent = [
  '<script>',
  sliceLines(3720, 4953),
  sliceLines(5262, 8412),
  '</script>'
].join('\n\n');

// Add smart redirect in goPage for users
const oldGoPage = 'function goPage(p, el) {';
if (jsAppContent.includes(oldGoPage)) {
  jsAppContent = jsAppContent.replace(
    oldGoPage,
    `function goPage(p, el) {
  if (p === 'users') {
    goPage('taxonomy', document.querySelector('[data-p=taxonomy]'));
    if (typeof switchTaxSubTab === 'function') switchTaxSubTab('EMP');
    if (typeof toast === 'function') toast(t('msg_user_redirect_hint') || "Quản lý nhân sự đã được chuyển vào Danh mục tiêu chuẩn", "info");
    return;
  }`
  );
}
fs.writeFileSync(path.join(destDir, 'JS_App.html'), jsAppContent, 'utf8');
console.log('✅ 8. JS_App.html written:', jsAppContent.length, 'bytes');

// 9. Index.html (Orchestrator shell)
// Head (Lines 1 - 8)
// Body open & Toasts & Wrap & Sidebar (Lines 540 - 566)
// Topbar & Content open (Lines 567 - 621)
// Dashboard (Lines 622 - 647)
// Analytics (Lines 692 - 859)
// Modals: m-pd (1312 - 1359), m-at (1360 - 1371), m-mem (1597 - 1641), m-ntf (1677 - 1813), m-sys-lang (1814 - 1840)
let sidebarPart = sliceLines(544, 566);
// Remove ni-usr button from sidebar
sidebarPart = sidebarPart.replace(
  /<div class="sni" id="ni-usr"[\s\S]*?<\/div>/,
  '<!-- [ni-usr hợp nhất vào Danh mục tiêu chuẩn] -->'
);

const indexShell = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <base target="_top">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title><?= appName ?></title>
  <!-- CSS STYLESHEETS -->
  <?!= include('App_Styles'); ?>
</head>
<body>
<div id="toasts"></div>
<div id="wrap">
<!-- ══ SIDEBAR ══ -->
${sidebarPart}
<!-- ══ MAIN ══ -->
<div id="main">
  ${sliceLines(569, 619)}
  <div id="content">
    <!-- ══ DASHBOARD ══ -->
    ${sliceLines(622, 647)}
    
    <!-- ══ ANALYTICS ══ -->
    ${sliceLines(692, 859)}

    <!-- ══ PROJECTS & TASKS ══ -->
    <?!= include('Page_Projects_Tasks'); ?>

    <!-- ══ GANTT CHART ══ -->
    <?!= include('Page_Gantt'); ?>

    <!-- ══ TIMESHEET (QUẢN LÝ THỜI GIAN) ══ -->
    <?!= include('Page_Timesheet'); ?>

    <!-- ══ TAXONOMY & ACTIVITY LOG ══ -->
    <?!= include('Page_Taxonomy_Log'); ?>
  </div>
</div>
</div><!-- /wrap -->

<!-- ══ GLOBAL SHARED MODALS ══ -->
${sliceLines(1312, 1371)}
${sliceLines(1597, 1641)}
${sliceLines(1677, 1840)}

<!-- ══ CLIENT-SIDE JAVASCRIPT MODULES ══ -->
<?!= include('JS_I18n'); ?>
<?!= include('JS_App'); ?>
<?!= include('JS_Timesheet'); ?>

</body>
</html>`;

fs.writeFileSync(path.join(destDir, 'Index.html'), indexShell, 'utf8');
console.log('✅ 9. Index.html written:', indexShell.length, 'bytes');

console.log('🎉 TẤT CẢ 9 FILE ĐÃ ĐƯỢC PHÂN TÁCH VÀ GHI THÀNH CÔNG VÀO THƯ MỤC:');
console.log(destDir);
