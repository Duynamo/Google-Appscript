const fs = require('fs');
const content = fs.readFileSync('03_Project Management/Index.html', 'utf8');

const target1 = `function _displayName(val, projectId) {
  if (!val) return '—';
  const str = String(val).trim();
  if (!str || str === '—') return '—';

  const parts = str.split(/[,;\\n]+/).map(s => s.trim()).filter(Boolean);
  if (!parts.length) return '—';

  const names = [];
  const seen = new Set();

  parts.forEach(p => {
    const name = _displayNameSingle(p, projectId);
    if (name && name !== '—') {
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        names.push(name);
      }
    }
  });

  return names.length ? names.join(', ') : '—';
}`;

console.log('Target 1 in Index.html?', content.includes(target1));

const target2 = `<td style="cursor:pointer;color:var(--p)" onclick="openFullTaskEdit('\${tk.id}')"><b>\${tk.name || ""}</b>`;
console.log('Target 2 in Index.html?', content.includes(target2));

const target3 = `const nameMatch = !q || String(tk.name || "").toLowerCase().includes(q) || String(tk.assignee || "").toLowerCase().includes(q) || dispAs.includes(q);`;
console.log('Target 3 in Index.html?', content.includes(target3));

const target4 = `document.getElementById("tp-nm").value = task.name || "";`;
console.log('Target 4 in Index.html?', content.includes(target4));

const target5 = `<span class="gantt-tk-nm" title="\${t.name}">\${t.name}</span>`;
console.log('Target 5 in Index.html?', content.includes(target5));

