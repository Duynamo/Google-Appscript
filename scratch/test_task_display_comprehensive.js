const assert = require('assert');

const STANDARD_DISCIPLINE_NAMES = {
  "MD01": { vi: "Dựng hình Kết cấu", en: "Structure Modeling", ja: "【モデル】躯体作成" },
  "MD02": { vi: "Dựng hình Máy móc / Thiết bị", en: "Equipment Modeling", ja: "【モデル】機械作成" },
  "MD03": { vi: "Dựng hình Đường ống", en: "Piping Modeling", ja: "【モデル】配管作成" },
  "MC01": { vi: "Check va chạm vs Bản vẽ thiết kế", en: "Clash Check vs Tender Drawing", ja: "【レポート・発注図】干渉・相違点チェック" }
};

let S = {
  lang: 'vi',
  taxonomy: {
    disciplines: [
      { code: 'MD01', name_vi: 'Dựng hình Kết cấu', name_en: 'Structure Modeling', name_jp: '【モデル】躯体作成' },
      { code: 'MD03', name_vi: 'Dựng hình Đường ống', name_en: 'Piping Modeling', name_jp: '【モデル】配管作成' }
    ]
  }
};

function tTaxonomy(item, lang) {
  if (!item) return "";
  const curLang = lang || ((typeof S !== 'undefined' && S.lang) ? S.lang : 'vi');
  let text = "";
  if (curLang === 'ja') text = item.name_jp || item.name_en || item.name_vi || item.name || item.code || "";
  else if (curLang === 'en') text = item.name_en || item.name_vi || item.name_jp || item.name || item.code || "";
  else text = item.name_vi || item.name_en || item.name || item.code || "";
  return text;
}

function _taskDisplayName(taskOrName, lang) {
  if (!taskOrName) return '';
  const rawName = (typeof taskOrName === 'object' && taskOrName !== null) ? (taskOrName.name || '') : String(taskOrName);
  if (!rawName) return '';

  const match = rawName.match(/^\s*\[([A-Za-z0-9_\-]+)\](.*)$/);
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

  let remainder = rawSuffix.trim().replace(/^[-–—:]\s*/, '').trim();

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
  candidates.push('Dựng hình kết cấu', 'Dựng hình Kết cấu', 'Dựng hình Kết cấu / Thân', '躯体モデル作成', '配管モデル作成');

  for (const c of candidates) {
    if (!c) continue;
    const cleanCand = c.replace(/^[【\[][^】\]]+[】\]]\s*/, '');
    const rx1 = new RegExp('^' + c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '(\\s*[-–—:]\\s*|\\s+)?', 'i');
    if (rx1.test(remainder)) {
      remainder = remainder.replace(rx1, '').trim();
    }
    if (cleanCand && cleanCand !== c) {
      const rx2 = new RegExp('^' + cleanCand.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '(\\s*[-–—:]\\s*|\\s+)?', 'i');
      if (rx2.test(remainder)) {
        remainder = remainder.replace(rx2, '').trim();
      }
    }
  }

  remainder = remainder.replace(/^[-–—:]\s*/, '').trim();

  let formatted = `[${codeStr}]-${discName}`;
  if (remainder) {
    formatted += ` - ${remainder}`;
  }
  return formatted;
}

// Test Cases
console.log('--- Test 1: Bare prefix [MD-BD-MD01] ---');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]', 'vi'), '[MD-BD-MD01]-Dựng hình Kết cấu');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]', 'ja'), '[MD-BD-MD01]-【モデル】躯体作成');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]', 'en'), '[MD-BD-MD01]-Structure Modeling');
console.log('✔ Test 1 PASS');

console.log('--- Test 2: Existing Vietnamese suffix [MD-BD-MD01]-Dựng hình kết cấu ---');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu', 'vi'), '[MD-BD-MD01]-Dựng hình Kết cấu');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu', 'ja'), '[MD-BD-MD01]-【モデル】躯体作成');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu', 'en'), '[MD-BD-MD01]-Structure Modeling');
console.log('✔ Test 2 PASS');

console.log('--- Test 3: Existing Japanese suffix [MD-BD-MD01]-【モデル】躯体作成 ---');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]-【モデル】躯体作成', 'vi'), '[MD-BD-MD01]-Dựng hình Kết cấu');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]-【モデル】躯体作成', 'ja'), '[MD-BD-MD01]-【モデル】躯体作成');
console.log('✔ Test 3 PASS');

console.log('--- Test 4: With custom text [MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm B1 ---');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm B1', 'vi'), '[MD-BD-MD01]-Dựng hình Kết cấu - Tầng hầm B1');
assert.strictEqual(_taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm B1', 'ja'), '[MD-BD-MD01]-【モデル】躯体作成 - Tầng hầm B1');
console.log('✔ Test 4 PASS');

console.log('--- Test 5: Fallback to STANDARD_DISCIPLINE_NAMES when not in S.taxonomy (MC01) ---');
assert.strictEqual(_taskDisplayName('[MC-DD-MC01]', 'vi'), '[MC-DD-MC01]-Check va chạm vs Bản vẽ thiết kế');
assert.strictEqual(_taskDisplayName('[MC-DD-MC01]', 'ja'), '[MC-DD-MC01]-【レポート・発注図】干渉・相違点チェック');
console.log('✔ Test 5 PASS');

console.log('--- Test 6: Short code [MD01] ---');
assert.strictEqual(_taskDisplayName('[MD01]', 'vi'), '[MD01]-Dựng hình Kết cấu');
console.log('✔ Test 6 PASS');

console.log('--- Test 7: Non-taxonomy task name ---');
assert.strictEqual(_taskDisplayName('Họp khẩn cấp', 'vi'), 'Họp khẩn cấp');
assert.strictEqual(_taskDisplayName('Họp khẩn cấp', 'ja'), 'Họp khẩn cấp');
console.log('✔ Test 7 PASS');

console.log('--- Test 8: Object input { name: "[MD-BD-MD01]" } ---');
assert.strictEqual(_taskDisplayName({ name: '[MD-BD-MD01]' }, 'vi'), '[MD-BD-MD01]-Dựng hình Kết cấu');
assert.strictEqual(_taskDisplayName({ name: '[MD-BD-MD01]' }, 'ja'), '[MD-BD-MD01]-【モデル】躯体作成');
console.log('✔ Test 8 PASS');

console.log('ALL 8 TEST CASES PASSED PERFECTLY!');

