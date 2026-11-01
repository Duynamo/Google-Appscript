const fs = require('fs');
const path = require('path');
const assert = require('assert');

const modDir = path.join(__dirname, '..', '..', '03_Project Management_Modular');
console.log('════════════════════════════════════════════════════════════════════════════');
console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN DỰ ÁN TẠI THƯ MỤC MODULAR MỚI');
console.log('Target:', modDir);
console.log('════════════════════════════════════════════════════════════════════════════\n');

// 1. TẦNG 1: KIỂM TRA ĐỦ 9 FILE VÀ CÂN BẰNG THẺ HTML
const requiredFiles = [
  'Index.html',
  'App_Styles.html',
  'JS_I18n.html',
  'Page_Projects_Tasks.html',
  'Page_Gantt.html',
  'Page_Timesheet.html',
  'JS_Timesheet.html',
  'Page_Taxonomy_Log.html',
  'JS_App.html'
];

console.log('--- TẦNG 1: KIỂM TRA TỒN TẠI & CÂN BẰNG CẤU TRÚC 9 FILE ---');
requiredFiles.forEach(f => {
  const fp = path.join(modDir, f);
  assert.strictEqual(fs.existsSync(fp), true, `File missing: ${f}`);
  const stat = fs.statSync(fp);
  assert.ok(stat.size > 0, `File is empty: ${f}`);
  console.log(`✅ [PASS] ${f}: ${(stat.size / 1024).toFixed(1)} KB`);
});

// Helper: tag balance check
function checkTagBalance(content, tag) {
  const openRx = new RegExp(`<${tag}[\\s>]`, 'gi');
  const closeRx = new RegExp(`</${tag}>`, 'gi');
  const openCount = (content.match(openRx) || []).length;
  const closeCount = (content.match(closeRx) || []).length;
  return { openCount, closeCount, balanced: openCount === closeCount };
}

// 2. TẦNG 2: MÔ PHỎNG doGet() SERVER-SIDE INCLUDE
console.log('\n--- TẦNG 2: MÔ PHỎNG NẠP TEMPLATE SERVER-SIDE (doGet) ---');
const indexHtmlRaw = fs.readFileSync(path.join(modDir, 'Index.html'), 'utf8');

function mockInclude(name) {
  const target = path.join(modDir, name + '.html');
  if (!fs.existsSync(target)) {
    throw new Error(`Include target not found: ${name}.html`);
  }
  return fs.readFileSync(target, 'utf8');
}

let assembledHtml = indexHtmlRaw;
const includeRegex = /<\?!\s*=\s*include\(['"]([^'"]+)['"]\);\s*\?>/g;
assembledHtml = assembledHtml.replace(includeRegex, (match, fileName) => {
  console.log(`  🔗 Server Include: ${fileName}.html`);
  return mockInclude(fileName);
});

console.log(`✅ [PASS] Server-side assembly complete. Assembled HTML size: ${(assembledHtml.length / 1024).toFixed(1)} KB`);
assert.ok(assembledHtml.length > 400000, 'Assembled HTML size too small, may be missing files!');

// Check tag balance on assembled HTML
const divBalance = checkTagBalance(assembledHtml, 'div');
console.log(`  HTML Div balance: ${divBalance.openCount} open divs vs ${divBalance.closeCount} close divs`);
assert.strictEqual(divBalance.balanced, true, 'Div tags unbalanced!');
console.log('✅ [PASS] Div tags are 100% balanced across assembled SPA!');

// Check essential pages in assembled HTML
const requiredPages = [
  'id="page-dashboard"',
  'id="page-analytics"',
  'id="page-projects"',
  'id="page-tasks"',
  'id="page-gantt"',
  'id="page-timesheet"',
  'id="page-taxonomy"',
  'id="page-log"'
];
requiredPages.forEach(p => {
  assert.ok(assembledHtml.includes(p), `Missing page in assembled HTML: ${p}`);
  console.log(`✅ [PASS] Found ${p} in assembled layout`);
});

// Check that page-users is NOT in assembled HTML
assert.ok(!assembledHtml.includes('id="page-users"'), 'page-users should be removed!');
console.log('✅ [PASS] page-users removed successfully (consolidated into Taxonomy)');

// Check smart redirect in JS
assert.ok(assembledHtml.includes("if (p === 'users')"), 'Smart redirect for users not found in goPage!');
console.log('✅ [PASS] Smart redirect fallback for users confirmed');

// 3. TẦNG 3: KIỂM THỬ ĐA NGÔN NGỮ I18N
console.log('\n--- TẦNG 3: KIỂM THỬ ĐA NGÔN NGỮ (VI / EN / JA) TRONG JS_I18n.html ---');
const i18nRaw = fs.readFileSync(path.join(modDir, 'JS_I18n.html'), 'utf8');
const i18nCode = i18nRaw.replace(/<\/?script>/g, '');

const startIdx = i18nCode.indexOf('const I18N = {');
const endIdx = i18nCode.indexOf('const STATUS_I18N');
const dictSnippet = i18nCode.substring(startIdx + 'const I18N = '.length, i18nCode.lastIndexOf('};', endIdx) + 1);

let I18N;
eval('I18N = ' + dictSnippet);

assert.ok(I18N && I18N.vi && I18N.en && I18N.ja, 'Missing language dictionaries in I18N');
console.log(`✅ [PASS] I18N Locales present: VI (${Object.keys(I18N.vi).length} keys), EN (${Object.keys(I18N.en).length} keys), JA (${Object.keys(I18N.ja).length} keys)`);

// Check required Timesheet keys
const checkKeys = ['ts_subtab_entry', 'ts_subtab_project', 'ts_subtab_staff', 'ts_subtab_matrix', 'ts_kpi_lifetime_hours', 'ts_budget_control', 'ts_mat_col_total'];
checkKeys.forEach(k => {
  assert.ok(I18N.vi[k] && I18N.en[k] && I18N.ja[k], `Missing translation for key: ${k}`);
});
console.log(`✅ [PASS] Timesheet keys (VI / EN / JA) verified 100% in modular JS_I18n`);

// 4. TẦNG 4: BIÊN DỊCH JAVASCRIPT KIỂM TRA LỖI CÚ PHÁP
console.log('\n--- TẦNG 4: BIÊN DỊCH CÚ PHÁP CÁC FILE JAVASCRIPT ---');
const jsFiles = ['JS_I18n.html', 'Page_Gantt.html', 'JS_Timesheet.html', 'JS_App.html'];
jsFiles.forEach(f => {
  const content = fs.readFileSync(path.join(modDir, f), 'utf8');
  const scriptBlocks = content.match(/<script>([\s\S]*?)<\/script>/g) || [];
  scriptBlocks.forEach((block, idx) => {
    const code = block.replace(/<\/?script>/g, '');
    try {
      new Function(code);
      console.log(`✅ [PASS] ${f} (Block ${idx + 1}): Syntax valid!`);
    } catch (e) {
      console.error(`❌ [FAIL] ${f} (Block ${idx + 1}): Syntax Error:`, e.message);
      throw e;
    }
  });
});

console.log('\n════════════════════════════════════════════════════════════════════════════');
console.log('🎉 TẤT CẢ CÁC BÀI TEST TẦNG 1, 2, 3, 4 ĐỀU PASS 100% TRÊN THƯ MỤC MODULAR MỚI!');
console.log('════════════════════════════════════════════════════════════════════════════');
