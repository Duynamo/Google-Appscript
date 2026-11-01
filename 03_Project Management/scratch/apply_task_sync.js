const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. UPDATE Index.html renderPdMembers
const indexPath = path.join(root, 'Index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const targetPdMemStart = 'function renderPdMembers(pjId) {';
const targetPdMemEnd = '// ═══════════════════════════════════════\r\n//  USER MODE (full email / name-only)';
const targetPdMemEndLF = '// ═══════════════════════════════════════\n//  USER MODE (full email / name-only)';

const newPdMem = `function renderPdMembers(pjId) {
  const mems = S.projectMembers[pjId] || _loadProjectMembers(pjId);
  S.projectMembers[pjId] = mems;
  const cntEl = document.getElementById('pd-mem-count');
  const listEl = document.getElementById('pd-mem-list');
  if (cntEl) cntEl.textContent = mems.length;
  if (!listEl) return;
  if (!mems.length) {
    listEl.innerHTML='<div style="font-size:10px;color:var(--t3);padding:4px 0">Chưa có thành viên</div>';
    return;
  }
  const show = mems.slice(0, 6);
  listEl.innerHTML = show.map(m=>{
    let mName = "";
    if (typeof m === "string") {
      const found = (S.members || []).find(u => u.email === m || u.name === m);
      mName = found ? found.name : m;
    } else if (m && typeof m === "object") {
      mName = m.name || (m.email ? ((S.members || []).find(u => u.email === m.email) || {}).name : "") || m.email || "Thành viên";
    } else {
      mName = "Thành viên";
    }
    const initials = (mName || "?").slice(0, 2).toUpperCase();
    return \`
    <div class="mem-mini-row">
      <div class="mem-avatar" style="width:22px;height:22px;font-size:9px">\${initials}</div>
      <span style="font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="\${mName}">\${mName}</span>
    </div>\`;
  }).join('') + (mems.length>6?\`<div style="font-size:10px;color:var(--t3);padding:2px 0">+\${mems.length-6} người khác...</div>\`:'');
}

`;

const startPdIdx = indexContent.indexOf(targetPdMemStart);
let endPdIdx = indexContent.indexOf(targetPdMemEnd);
if (endPdIdx === -1) endPdIdx = indexContent.indexOf(targetPdMemEndLF);

if (startPdIdx !== -1 && endPdIdx !== -1) {
  indexContent = indexContent.substring(0, startPdIdx) + newPdMem + indexContent.substring(endPdIdx);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✅ Updated Index.html renderPdMembers');
} else {
  console.error('❌ Could not locate renderPdMembers in Index.html', { startPdIdx, endPdIdx });
}

