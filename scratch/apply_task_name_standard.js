const fs = require('fs');

const CODE_INJECTION = `
// =========================================================================
// 46 STANDARD DISCIPLINES DICTIONARY (VI / EN / JA) FOR DYNAMIC LOCALIZATION
// =========================================================================
const STANDARD_DISCIPLINE_NAMES = {
  "PN01": { vi: "Tạo ảnh Panorama Memo", en: "Panorama Memo Creation", ja: "【パノラマメモ】作成" },
  "PN10": { vi: "Kiểm tra Panorama Memo", en: "Panorama Memo Check", ja: "【パノラマメモ】チェック" },
  "PN11": { vi: "Chỉnh sửa Panorama Memo", en: "Panorama Memo Revision", ja: "【パノラマメモ】修正" },
  "PC01": { vi: "Xử lý dữ liệu Point Cloud", en: "Point Cloud Processing", ja: "【点群データ】処理" },
  "PC02": { vi: "Phân lớp Point Cloud", en: "Point Cloud Layering", ja: "【点群データ】レイヤー分け" },
  "PC10": { vi: "Kiểm tra Point Cloud", en: "Point Cloud Check", ja: "【点群データ】チェック" },
  "PC11": { vi: "Sửa dữ liệu Point Cloud", en: "Point Cloud Revision", ja: "【点群データ】修正" },
  "PC12": { vi: "Sửa phân lớp Point Cloud", en: "Point Cloud Layering Revision", ja: "【点群データ】レイヤー分け修正" },
  "MD01": { vi: "Dựng hình Kết cấu", en: "Structure Modeling", ja: "【モデル】躯体作成" },
  "MD02": { vi: "Dựng hình Máy móc / Thiết bị", en: "Equipment Modeling", ja: "【モデル】機械作成" },
  "MD03": { vi: "Dựng hình Đường ống", en: "Piping Modeling", ja: "【モデル】配管作成" },
  "MD04": { vi: "Hợp nhất mô hình tổng thể", en: "Model Federation", ja: "【モデル】合成" },
  "MD05": { vi: "Dựng hình hạng mục khác", en: "Other Modeling", ja: "【モデル】作成（その他）" },
  "MD10": { vi: "Kiểm tra mô hình BIM", en: "Model Quality Check", ja: "【モデル】チェック" },
  "MD11": { vi: "Sửa mô hình Kết cấu", en: "Structure Revision", ja: "【モデル】躯体修正" },
  "MD12": { vi: "Sửa mô hình Thiết bị", en: "Equipment Revision", ja: "【モデル】機械修正" },
  "MD13": { vi: "Sửa mô hình Đường ống", en: "Piping Revision", ja: "【モデル】配管修正" },
  "MD14": { vi: "Sửa hợp nhất mô hình", en: "Federation Revision", ja: "【モデル】合成修正" },
  "MD15": { vi: "Sửa mô hình khác", en: "Other Model Revision", ja: "【モデル】修正（その他）" },
  "MD16": { vi: "Nhập thuộc tính thông tin BIM", en: "BIM Data Input", ja: "【モデル】情報入力" },
  "SD01": { vi: "Tổng hợp đóng tập bản vẽ", en: "Drawing Compilation", ja: "【施工図】図面取りまとめ" },
  "SD02": { vi: "Chuẩn bị bản vẽ nền Underlay", en: "Background Drawing Prep", ja: "【施工図】下図準備" },
  "SD03": { vi: "Triển khai bản vẽ mặt bằng & mặt cắt", en: "Plan & Section Drawing Creation", ja: "【施工図】平断面図作成" },
  "SD04": { vi: "Bản vẽ sơ đồ không gian ống", en: "Piping Isometric Drawing", ja: "【施工図】配管スケルトン図作成" },
  "SD05": { vi: "Triển khai bản vẽ móng bệ", en: "Foundation Drawing", ja: "【施工図】基礎図作成" },
  "SD06": { vi: "Bản vẽ gia công kết cấu thép", en: "Steel Fabrication Drawing", ja: "【施工図】鋼製加工品図作成" },
  "SD07": { vi: "Bản vẽ phối hợp đa bộ môn", en: "Combined Services Drawing", ja: "【施工図】複合工図作成" },
  "SD08": { vi: "Bản vẽ thi công khác", en: "Other Shop Drawing", ja: "【施工図】その他" },
  "MC01": { vi: "Check va chạm vs Bản vẽ thiết kế", en: "Clash Check vs Tender Drawing", ja: "【レポート・発注図】干渉・相違点チェック" },
  "MC02": { vi: "Check va chạm vs Bản vẽ thi công", en: "Clash Check vs Shop Drawing", ja: "【レポート・施工図】干渉・相違点チェック" },
  "MC03": { vi: "Đề xuất giải pháp xử lý va chạm", en: "Clash Resolution Proposal", ja: "【レポート】干渉・相違点の改善提案" },
  "MC04": { vi: "Nghiên cứu biện pháp vận chuyển", en: "Equipment Route Study", ja: "【レポート】機器搬出入検討" },
  "MC05": { vi: "Kiểm tra xác nhận kích thước", en: "Dimension Verification", ja: "【レポート】寸法確認" },
  "MC06": { vi: "Báo cáo kỹ thuật khác", en: "Other Technical Report", ja: "【レポート】その他" },
  "MC07": { vi: "Tạo video mô phỏng Walkthrough", en: "3D Walkthrough Animation", ja: "【レポート】ウォークスルー動画作成" },
  "MT00": { vi: "Họp giao ban đầu/cuối ngày", en: "Daily Standup Meeting", ja: "【MTG】朝礼・終礼" },
  "MT01": { vi: "Họp đối tác / Khách hàng", en: "External Meeting", ja: "【MTG】社外" },
  "MT02": { vi: "Họp nội bộ nhóm dự án", en: "Internal Team Meeting", ja: "【MTG】社内" },
  "MT03": { vi: "Họp giải đáp thắc mắc Q&A", en: "Q&A Clarification Meeting", ja: "【MTG】問い合わせ" },
  "MT04": { vi: "Họp nghiệm thu đóng dự án", en: "Project Closeout Meeting", ja: "【MTG】クローズ" },
  "PM01": { vi: "Lập kế hoạch & phân rã tiến độ", en: "Project Planning & Scheduling", ja: "【管理】計画策定" },
  "PM02": { vi: "Giám sát & điều phối nguồn lực", en: "Monitoring & Coordination", ja: "【管理】進捗管理" },
  "MJ01": { vi: "Tự học chuyên môn & nâng cao kỹ năng", en: "Self-Study & Professional Skills", ja: "【研修】自己研鑽" },
  "MJ02": { vi: "Đào tạo thành viên mới / Chuyển giao", en: "Mentoring & Onboarding", ja: "【研修】教育・指導" },
  "DE01": { vi: "Nghiên cứu & phát triển giải pháp mới", en: "R&D & Engineering Innovation", ja: "【開発】技術開発" },
  "LN01": { vi: "Nghỉ phép theo chế độ", en: "Leave & Non-Project Time", ja: "【勤怠】休暇" }
};

// =========================================================================
// HELPER: ĐỊNH DẠNG TÊN NHIỆM VỤ CHUẨN ĐA NGÔN NGỮ (VI / EN / JA)
// Định dạng: [CAT-PHASE-DISC]-<Tên chi tiết đa ngôn ngữ> [- Ghi chú tùy chọn]
// =========================================================================
function _taskDisplayName(taskOrName, lang) {
  if (!taskOrName) return '';
  const rawName = (typeof taskOrName === 'object' && taskOrName !== null) ? (taskOrName.name || '') : String(taskOrName);
  if (!rawName) return '';

  const match = rawName.match(/^\\s*\\[([A-Za-z0-9_\\-]+)\\](.*)$/);
  if (!match) return rawName;

  const codeStr = match[1].toUpperCase();
  const rawSuffix = match[2] || '';
  const parts = codeStr.split('-');

  let discCode = null;
  if (parts.length >= 3) {
    discCode = parts[2];
  } else if (parts.length === 2) {
    discCode = parts[1];
  } else if (parts.length === 1) {
    discCode = parts[0];
  }

  if (!discCode) return rawName;

  const curLang = lang || ((typeof S !== 'undefined' && S.lang) ? S.lang : 'vi');

  let discTax = null;
  if (typeof S !== 'undefined' && S.taxonomy && Array.isArray(S.taxonomy.disciplines)) {
    discTax = S.taxonomy.disciplines.find(d => String(d.code || '').toUpperCase() === discCode);
  }

  let discName = '';
  if (discTax && typeof tTaxonomy === 'function') {
    discName = tTaxonomy(discTax, curLang);
  }
  if (!discName && typeof STANDARD_DISCIPLINE_NAMES !== 'undefined' && STANDARD_DISCIPLINE_NAMES[discCode]) {
    const std = STANDARD_DISCIPLINE_NAMES[discCode];
    discName = std[curLang] || std['vi'] || '';
  }

  if (!discName) return rawName;

  let remainder = rawSuffix.trim().replace(/^[-–—:]\\s*/, '').trim();

  const candidates = [];
  if (discTax) {
    if (discTax.name_vi) candidates.push(discTax.name_vi);
    if (discTax.name_en) candidates.push(discTax.name_en);
    if (discTax.name_jp) candidates.push(discTax.name_jp);
    if (discTax.name) candidates.push(discTax.name);
  }
  if (typeof STANDARD_DISCIPLINE_NAMES !== 'undefined' && STANDARD_DISCIPLINE_NAMES[discCode]) {
    const std = STANDARD_DISCIPLINE_NAMES[discCode];
    if (std.vi) candidates.push(std.vi);
    if (std.en) candidates.push(std.en);
    if (std.ja) candidates.push(std.ja);
  }
  candidates.push('Dựng hình kết cấu', 'Dựng hình Kết cấu', 'Dựng hình Kết cấu / Thân', '躯体モデル作成', '配管モデル作成', '設備モデル作成');

  for (const c of candidates) {
    if (!c) continue;
    const cleanCand = c.replace(/^[【\\[][^】\\]]+[】\\]]\\s*/, '');
    const rx1 = new RegExp('^' + c.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&') + '(\\\\s*[-–—:]\\\\s*|\\\\s+)?', 'i');
    if (rx1.test(remainder)) {
      remainder = remainder.replace(rx1, '').trim();
    }
    if (cleanCand && cleanCand !== c) {
      const rx2 = new RegExp('^' + cleanCand.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&') + '(\\\\s*[-–—:]\\\\s*|\\\\s+)?', 'i');
      if (rx2.test(remainder)) {
        remainder = remainder.replace(rx2, '').trim();
      }
    }
  }

  remainder = remainder.replace(/^[-–—:]\\s*/, '').trim();

  let formatted = \`[\${codeStr}]-\${discName}\`;
  if (remainder) {
    formatted += \` - \${remainder}\`;
  }
  return formatted;
}
`;

const NEW_ON_TASK_TAXONOMY_CHANGE = `function onTaskTaxonomyChange(mode) {
  if (mode === 'tp') {
    const cat = document.getElementById('tp-cat')?.value || '';
    const phase = document.getElementById('tp-phase')?.value || '';
    const disc = document.getElementById('tp-disc')?.value || '';
    const parts = [cat, phase, disc].filter(Boolean);
    const prefix = parts.length ? \`[\${parts.join('-')}]\` : '';

    const badge = document.getElementById('tp-tax-preview-badge');
    if (badge) {
      if (prefix) {
        badge.textContent = prefix;
        badge.style.background = '#eef2ff';
        badge.style.color = 'var(--p)';
        badge.style.borderColor = '#c7d2fe';
      } else {
        badge.textContent = (typeof t === 'function' ? t('tax_prefix_none') : null) || '[CHƯA GÁN MÃ]';
        badge.style.background = '#fff7ed';
        badge.style.color = '#ea580c';
        badge.style.borderColor = '#fdba74';
      }
    }

    const nmInp = document.getElementById('tp-nm');
    if (!nmInp) return;

    let discName = '';
    if (disc) {
      const curLang = (typeof S !== 'undefined' && S.lang) ? S.lang : 'vi';
      const discTax = ((S.taxonomy && S.taxonomy.disciplines) || []).find(d => String(d.code || '').toUpperCase() === String(disc).toUpperCase());
      if (discTax && typeof tTaxonomy === 'function') {
        discName = tTaxonomy(discTax, curLang);
      }
      if (!discName && typeof STANDARD_DISCIPLINE_NAMES !== 'undefined' && STANDARD_DISCIPLINE_NAMES[disc]) {
        const std = STANDARD_DISCIPLINE_NAMES[disc];
        discName = std[curLang] || std['vi'] || '';
      }
    }

    let curVal = nmInp.value.trim();
    curVal = curVal.replace(/^\\[[A-Za-z0-9_\\-]+\\]\\s*[-–—:]?\\s*/i, '').trim();

    if (disc) {
      const discTax = ((S.taxonomy && S.taxonomy.disciplines) || []).find(d => String(d.code || '').toUpperCase() === String(disc).toUpperCase());
      const cands = [];
      if (discTax) { cands.push(discTax.name_vi, discTax.name_en, discTax.name_jp, discTax.name); }
      if (typeof STANDARD_DISCIPLINE_NAMES !== 'undefined' && STANDARD_DISCIPLINE_NAMES[disc]) {
        const std = STANDARD_DISCIPLINE_NAMES[disc];
        cands.push(std.vi, std.en, std.ja);
      }
      cands.push('Dựng hình kết cấu', 'Dựng hình Kết cấu', 'Dựng hình Kết cấu / Thân', '躯体モデル作成', '配管モデル作成');
      for (const c of cands) {
        if (!c) continue;
        const cleanCand = c.replace(/^[【\\[][^】\\]]+[】\\]]\\s*/, '');
        const rx1 = new RegExp('^' + c.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&') + '(\\\\s*[-–—:]\\\\s*|\\\\s+)?', 'i');
        if (rx1.test(curVal)) { curVal = curVal.replace(rx1, '').trim(); }
        if (cleanCand && cleanCand !== c) {
          const rx2 = new RegExp('^' + cleanCand.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&') + '(\\\\s*[-–—:]\\\\s*|\\\\s+)?', 'i');
          if (rx2.test(curVal)) { curVal = curVal.replace(rx2, '').trim(); }
        }
      }
      curVal = curVal.replace(/^[-–—:]\\s*/, '').trim();
    }

    if (prefix) {
      if (discName) {
        nmInp.value = curVal ? \`\${prefix}-\${discName} - \${curVal}\` : \`\${prefix}-\${discName}\`;
      } else {
        nmInp.value = curVal ? \`\${prefix} \${curVal}\` : prefix;
      }
    } else {
      nmInp.value = curVal;
    }
    return;
  }

  // Default / Single mode for #m-qtk
  const cat = document.getElementById('mqtk-cat')?.value || '';
  const phase = document.getElementById('mqtk-phase')?.value || '';
  const disc = document.getElementById('mqtk-disc')?.value || '';

  const parts = [cat, phase, disc].filter(Boolean);
  const prefix = parts.length ? \`[\${parts.join('-')}]\` : '';

  const prevTxt = document.getElementById('qtk-tax-preview-txt');
  if (prevTxt) {
    prevTxt.textContent = prefix ? \`Tiền tố: \${prefix}\` : '[Mã tự chèn vào tên task]';
  }

  if (mode === 'single') {
    const nmInp = document.getElementById('mqtk-nm');
    if (!nmInp) return;
    let discName = '';
    if (disc) {
      const curLang = (typeof S !== 'undefined' && S.lang) ? S.lang : 'vi';
      const discTax = ((S.taxonomy && S.taxonomy.disciplines) || []).find(d => String(d.code || '').toUpperCase() === String(disc).toUpperCase());
      if (discTax && typeof tTaxonomy === 'function') {
        discName = tTaxonomy(discTax, curLang);
      }
      if (!discName && typeof STANDARD_DISCIPLINE_NAMES !== 'undefined' && STANDARD_DISCIPLINE_NAMES[disc]) {
        const std = STANDARD_DISCIPLINE_NAMES[disc];
        discName = std[curLang] || std['vi'] || '';
      }
    }

    let curVal = nmInp.value.trim();
    curVal = curVal.replace(/^\\[[A-Za-z0-9_\\-]+\\]\\s*[-–—:]?\\s*/i, '').trim();

    if (disc) {
      const discTax = ((S.taxonomy && S.taxonomy.disciplines) || []).find(d => String(d.code || '').toUpperCase() === String(disc).toUpperCase());
      const cands = [];
      if (discTax) { cands.push(discTax.name_vi, discTax.name_en, discTax.name_jp, discTax.name); }
      if (typeof STANDARD_DISCIPLINE_NAMES !== 'undefined' && STANDARD_DISCIPLINE_NAMES[disc]) {
        const std = STANDARD_DISCIPLINE_NAMES[disc];
        cands.push(std.vi, std.en, std.ja);
      }
      cands.push('Dựng hình kết cấu', 'Dựng hình Kết cấu', 'Dựng hình Kết cấu / Thân', '躯体モデル作成', '配管モデル作成');
      for (const c of cands) {
        if (!c) continue;
        const cleanCand = c.replace(/^[【\\[][^】\\]]+[】\\]]\\s*/, '');
        const rx1 = new RegExp('^' + c.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&') + '(\\\\s*[-–—:]\\\\s*|\\\\s+)?', 'i');
        if (rx1.test(curVal)) { curVal = curVal.replace(rx1, '').trim(); }
        if (cleanCand && cleanCand !== c) {
          const rx2 = new RegExp('^' + cleanCand.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&') + '(\\\\s*[-–—:]\\\\s*|\\\\s+)?', 'i');
          if (rx2.test(curVal)) { curVal = curVal.replace(rx2, '').trim(); }
        }
      }
      curVal = curVal.replace(/^[-–—:]\\s*/, '').trim();
    }

    if (prefix) {
      if (discName) {
        nmInp.value = curVal ? \`\${prefix}-\${discName} - \${curVal}\` : \`\${prefix}-\${discName}\`;
      } else {
        nmInp.value = curVal ? \`\${prefix} \${curVal}\` : prefix;
      }
    } else {
      nmInp.value = curVal;
    }
  }
}`;

console.log('Definitions ready.');

// =========================================================================
// 1. UPDATE 03_Project Management/Index.html
// =========================================================================
let idxContent = fs.readFileSync('03_Project Management/Index.html', 'utf8');

// Insert CODE_INJECTION if not present
if (!idxContent.includes('STANDARD_DISCIPLINE_NAMES')) {
  const marker = '// Helper: Render badge người đảm nhận hiển thị ngoài bảng nhiệm vụ';
  if (idxContent.includes(marker)) {
    idxContent = idxContent.replace(marker, CODE_INJECTION + '\n' + marker);
    console.log('Index.html: Inserted STANDARD_DISCIPLINE_NAMES and _taskDisplayName');
  } else {
    console.error('Index.html: Marker for CODE_INJECTION not found!');
  }
}

// Update renderPgTkGroups
idxContent = idxContent.replace(
  `<td style="cursor:pointer;color:var(--p)" onclick="openFullTaskEdit('\${tk.id}')"><b>\${tk.name || ""}</b>`,
  `<td style="cursor:pointer;color:var(--p)" onclick="openFullTaskEdit('\${tk.id}')"><b>\${_taskDisplayName(tk)}</b>`
);

// Update filterPgTk
idxContent = idxContent.replace(
  `const nameMatch = !q || String(tk.name || "").toLowerCase().includes(q) || String(tk.assignee || "").toLowerCase().includes(q) || dispAs.includes(q);`,
  `const nameMatch = !q || String(tk.name || "").toLowerCase().includes(q) || _taskDisplayName(tk).toLowerCase().includes(q) || String(tk.assignee || "").toLowerCase().includes(q) || dispAs.includes(q);`
);

// Update fillTpForm
idxContent = idxContent.replace(
  `document.getElementById("tp-nm").value = task.name || "";`,
  `document.getElementById("tp-nm").value = _taskDisplayName(task);`
);

// Update openQuickTaskModal
idxContent = idxContent.replace(
  `document.getElementById("mqtk-nm").value = t.name || "";`,
  `document.getElementById("mqtk-nm").value = _taskDisplayName(t);`
);

// Update renderGantt: left row
idxContent = idxContent.replace(
  `<span class="gantt-tk-nm" title="\${t.name}">\${t.name}</span>`,
  `<span class="gantt-tk-nm" title="\${_taskDisplayName(t)}">\${_taskDisplayName(t)}</span>`
);

// Update renderGantt: flag and bar
idxContent = idxContent.replace(
  `title="Deadline: \${t.deadline || t.deadlineRaw} | \${t.name} (\${t.status})"`,
  `title="Deadline: \${t.deadline || t.deadlineRaw} | \${_taskDisplayName(t)} (\${t.status})"`
);
idxContent = idxContent.replace(
  `title="\${t.name} | \${t.status} | \${t.progress}%"`,
  `title="\${_taskDisplayName(t)} | \${t.status} | \${t.progress}%"`
);

// Update renderPtkGrid
idxContent = idxContent.replace(
  `<div class="ptk-nm">\${t.name}\${isTaskOverdue(t)?`,
  `<div class="ptk-nm">\${_taskDisplayName(t)}\${isTaskOverdue(t)?`
);

// Update renderAtGrid & filterAtGrid
idxContent = idxContent.replace(
  `const nm=(t.name||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");`,
  `const nm=(_taskDisplayName(t)||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");`
);
idxContent = idxContent.replace(
  `||(t.name||"").toLowerCase().includes(lq)||`,
  `||(t.name||"").toLowerCase().includes(lq)||_taskDisplayName(t).toLowerCase().includes(lq)||`
);

// Update onTaskTaxonomyChange in Index.html
const oldTaxChangeRegex = /function onTaskTaxonomyChange\(mode\) \{[\s\S]*?\n\}/;
if (oldTaxChangeRegex.test(idxContent)) {
  idxContent = idxContent.replace(oldTaxChangeRegex, NEW_ON_TASK_TAXONOMY_CHANGE);
  console.log('Index.html: Replaced onTaskTaxonomyChange');
}

// Update AppExportManager in Index.html
idxContent = idxContent.replace(
  `<td style="padding:6px 6px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="\${t.name}">\${t.name}</td>`,
  `<td style="padding:6px 6px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="\${_taskDisplayName(t)}">\${_taskDisplayName(t)}</td>`
);
idxContent = idxContent.replace(
  `<td style="padding:3px 6px;border:1px solid #e2e8f0;font-weight:600;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="\${t.name}">`,
  `<td style="padding:3px 6px;border:1px solid #e2e8f0;font-weight:600;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="\${_taskDisplayName(t)}">`
);
idxContent = idxContent.replace(
  `\${t.code ? \`<span style="color:#4f6ef7;margin-right:3px">[\${t.code}]</span>\` : ''}\${t.name}`,
  `\${_taskDisplayName(t)}`
);
idxContent = idxContent.replace(
  `return \`<td style="border:1px solid #e2e8f0;padding:0;background:\${stColor}" title="\${t.name}"></td>\`;`,
  `return \`<td style="border:1px solid #e2e8f0;padding:0;background:\${stColor}" title="\${_taskDisplayName(t)}"></td>\`;`
);
idxContent = idxContent.replace(
  `rows.push([i + 1, pjName, t.code || '', t.name, _displayName(t.assignee), t.startDate || '', t.deadline || '', \`\${t.progress || 0}%\`, t.priority || '', t.status]);`,
  `rows.push([i + 1, pjName, t.code || '', _taskDisplayName(t), _displayName(t.assignee), t.startDate || '', t.deadline || '', \`\${t.progress || 0}%\`, t.priority || '', t.status]);`
);
idxContent = idxContent.replace(
  `const row = [i + 1, pjName, t.code || '', t.name, _displayName(t.assignee), t.startDate || '', t.deadline || '', \`\${t.progress || 0}%\`, t.status];`,
  `const row = [i + 1, pjName, t.code || '', _taskDisplayName(t), _displayName(t.assignee), t.startDate || '', t.deadline || '', \`\${t.progress || 0}%\`, t.status];`
);

// Update setLanguage in Index.html
if (!idxContent.includes('if (typeof popTaskTaxonomySelects === \'function\') popTaskTaxonomySelects();')) {
  idxContent = idxContent.replace(
    `applyTranslations();\n  updateLangDropdownUI();`,
    `applyTranslations();\n  updateLangDropdownUI();\n  if (typeof popTaskTaxonomySelects === 'function') popTaskTaxonomySelects();`
  );
  console.log('Index.html: Updated setLanguage to refresh taxonomy dropdowns');
}

fs.writeFileSync('03_Project Management/Index.html', idxContent, 'utf8');
console.log('Index.html saved successfully.');

// =========================================================================
// 2. UPDATE 03_Project Management_Modular/JS_App.html
// =========================================================================
let jsAppContent = fs.readFileSync('03_Project Management_Modular/JS_App.html', 'utf8');

if (!jsAppContent.includes('STANDARD_DISCIPLINE_NAMES')) {
  const marker = '// ═══════════════════════════════════════\n  //  CHARTS';
  if (jsAppContent.includes(marker)) {
    jsAppContent = jsAppContent.replace(marker, CODE_INJECTION + '\n  ' + marker);
    console.log('JS_App.html: Inserted STANDARD_DISCIPLINE_NAMES and _taskDisplayName');
  } else {
    console.error('JS_App.html: Marker for CODE_INJECTION not found!');
  }
}

// Update renderPgTkGroups
jsAppContent = jsAppContent.replace(
  `<td style="cursor:pointer;color:var(--p)" onclick="openFullTaskEdit('\${tk.id}')"><b>\${tk.name || ""}</b>`,
  `<td style="cursor:pointer;color:var(--p)" onclick="openFullTaskEdit('\${tk.id}')"><b>\${_taskDisplayName(tk)}</b>`
);

// Update filterPgTk
jsAppContent = jsAppContent.replace(
  `const nameMatch = !q || String(tk.name || "").toLowerCase().includes(q) || String(tk.assignee || "").toLowerCase().includes(q) || dispAs.includes(q);`,
  `const nameMatch = !q || String(tk.name || "").toLowerCase().includes(q) || _taskDisplayName(tk).toLowerCase().includes(q) || String(tk.assignee || "").toLowerCase().includes(q) || dispAs.includes(q);`
);

// Update fillTpForm
jsAppContent = jsAppContent.replace(
  `document.getElementById("tp-nm").value = task.name || "";`,
  `document.getElementById("tp-nm").value = _taskDisplayName(task);`
);

// Update onTaskTaxonomyChange in JS_App.html
if (oldTaxChangeRegex.test(jsAppContent)) {
  jsAppContent = jsAppContent.replace(oldTaxChangeRegex, NEW_ON_TASK_TAXONOMY_CHANGE);
  console.log('JS_App.html: Replaced onTaskTaxonomyChange');
}

// Update AppExportManager in JS_App.html
jsAppContent = jsAppContent.replace(
  `<td style="padding:6px 6px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="\${t.name}">\${t.name}</td>`,
  `<td style="padding:6px 6px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="\${_taskDisplayName(t)}">\${_taskDisplayName(t)}</td>`
);
jsAppContent = jsAppContent.replace(
  `<td style="padding:3px 6px;border:1px solid #e2e8f0;font-weight:600;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="\${t.name}">`,
  `<td style="padding:3px 6px;border:1px solid #e2e8f0;font-weight:600;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="\${_taskDisplayName(t)}">`
);
jsAppContent = jsAppContent.replace(
  `\${t.code ? \`<span style="color:#4f6ef7;margin-right:3px">[\${t.code}]</span>\` : ''}\${t.name}`,
  `\${_taskDisplayName(t)}`
);
jsAppContent = jsAppContent.replace(
  `return \`<td style="border:1px solid #e2e8f0;padding:0;background:\${stColor}" title="\${t.name}"></td>\`;`,
  `return \`<td style="border:1px solid #e2e8f0;padding:0;background:\${stColor}" title="\${_taskDisplayName(t)}"></td>\`;`
);
jsAppContent = jsAppContent.replace(
  `rows.push([i + 1, pjName, t.code || '', t.name, _displayName(t.assignee), t.startDate || '', t.deadline || '', \`\${t.progress || 0}%\`, t.priority || '', t.status]);`,
  `rows.push([i + 1, pjName, t.code || '', _taskDisplayName(t), _displayName(t.assignee), t.startDate || '', t.deadline || '', \`\${t.progress || 0}%\`, t.priority || '', t.status]);`
);
jsAppContent = jsAppContent.replace(
  `const row = [i + 1, pjName, t.code || '', t.name, _displayName(t.assignee), t.startDate || '', t.deadline || '', \`\${t.progress || 0}%\`, t.status];`,
  `const row = [i + 1, pjName, t.code || '', _taskDisplayName(t), _displayName(t.assignee), t.startDate || '', t.deadline || '', \`\${t.progress || 0}%\`, t.status];`
);

// Update setLanguage in JS_App.html
if (!jsAppContent.includes('if (typeof popTaskTaxonomySelects === \'function\') popTaskTaxonomySelects();')) {
  jsAppContent = jsAppContent.replace(
    `applyTranslations();\n  updateLangDropdownUI();`,
    `applyTranslations();\n  updateLangDropdownUI();\n  if (typeof popTaskTaxonomySelects === 'function') popTaskTaxonomySelects();`
  );
  console.log('JS_App.html: Updated setLanguage to refresh taxonomy dropdowns');
}

fs.writeFileSync('03_Project Management_Modular/JS_App.html', jsAppContent, 'utf8');
console.log('JS_App.html saved successfully.');

// =========================================================================
// 3. UPDATE 03_Project Management_Modular/Page_Gantt.html
// =========================================================================
let ganttContent = fs.readFileSync('03_Project Management_Modular/Page_Gantt.html', 'utf8');

ganttContent = ganttContent.replace(
  `<span class="gantt-tk-nm" title="\${t.name}">\${t.name}</span>`,
  `<span class="gantt-tk-nm" title="\${_taskDisplayName(t)}">\${_taskDisplayName(t)}</span>`
);
ganttContent = ganttContent.replace(
  `title="Deadline: \${t.deadline || t.deadlineRaw} | \${t.name} (\${t.status})"`,
  `title="Deadline: \${t.deadline || t.deadlineRaw} | \${_taskDisplayName(t)} (\${t.status})"`
);
ganttContent = ganttContent.replace(
  `title="\${t.name} | \${t.status} | \${t.progress}%"`,
  `title="\${_taskDisplayName(t)} | \${t.status} | \${t.progress}%"`
);

fs.writeFileSync('03_Project Management_Modular/Page_Gantt.html', ganttContent, 'utf8');
console.log('Page_Gantt.html saved successfully.');
