const fs = require('fs');

const file = '03_Project Management/Index.html';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /<div class="tb-r">\s*<div class="pj-filter">[\s\S]*?<div class="drop-wrap">\s*<button class="btn bs" id="btn-open-export"[\s\S]*?<\/button>\s*<button class="btn-mk"/;

const replacement = `<div class="tb-r">
      <button class="btn bs" id="btn-open-export" onclick="AppExportManager.openModal()" style="display:inline-flex;align-items:center;gap:6px;font-weight:600;padding:7px 14px;border-radius:var(--r2);background:#fff;border:1px solid var(--bdr);cursor:pointer;color:var(--tx);white-space:nowrap;font-size:12px;height:36px" title="In / Xuất Báo Cáo">
        <span>🖨️</span><span data-i18n="btn_print_export">In Báo Cáo</span>
      </button>
      <div class="pj-filter">
        🔽 <select id="pj-filter-sel" onchange="applyPjFilter()">
          <option value="">Lọc theo dự án...</option>
        </select>
      </div>
      <div class="tb-srch"><span style="color:var(--t3)">🔍</span><input id="g-srch" placeholder="Tìm kiếm..." data-i18n-ph="search_placeholder" oninput="gSearch(this.value)"></div>
      <div class="drop-wrap">
        <button class="btn-mk"`;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, () => replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully moved #btn-open-export to the left of .pj-filter in Index.html!');
} else {
  console.error('Target pattern not found in Index.html!');
}

