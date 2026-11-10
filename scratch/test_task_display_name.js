const STANDARD_DISCIPLINE_NAMES = {
  'MD01': { vi: 'Dựng hình Kết cấu', en: 'Structure Modeling', ja: '【モデル】躯体作成' },
  'MD03': { vi: 'Dựng hình Đường ống', en: 'Piping Modeling', ja: '【モデル】配管作成' },
  'MD12': { vi: 'Sửa mô hình Thiết bị', en: 'Equipment Revision', ja: '【モデル】機械修正' },
  'MC06': { vi: 'Báo cáo kỹ thuật khác', en: 'Other Technical Report', ja: '【レポート】その他' }
};

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

  let discObj = STANDARD_DISCIPLINE_NAMES[discCode];
  if (!discObj) return rawName;

  const curLang = lang || 'vi';
  let discName = discObj[curLang] || discObj['vi'] || '';

  let remainder = rawSuffix.trim().replace(/^[-–—:]\s*/, '').trim();

  const knownNames = [discObj.vi, discObj.en, discObj.ja].filter(Boolean);
  for (const kn of knownNames) {
    const rx = new RegExp('^' + kn.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '(\\s*[-–—:]\\s*|\\s+)?', 'i');
    if (rx.test(remainder)) {
      remainder = remainder.replace(rx, '').trim();
      break;
    }
  }

  remainder = remainder.replace(/^[-–—:]\s*/, '').trim();

  let formatted = `[${codeStr}]-${discName}`;
  if (remainder) {
    formatted += ` - ${remainder}`;
  }
  return formatted;
}

console.log('VI 1:', _taskDisplayName('[MD-BD-MD01]', 'vi'));
console.log('JA 1:', _taskDisplayName('[MD-BD-MD01]', 'ja'));
console.log('EN 1:', _taskDisplayName('[MD-BD-MD01]', 'en'));

console.log('VI 2 (from VI):', _taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu', 'vi'));
console.log('JA 2 (from VI):', _taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu', 'ja'));
console.log('EN 2 (from VI):', _taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu', 'en'));

console.log('JA 3 (with custom note):', _taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm', 'ja'));
console.log('VI 3 (with custom note):', _taskDisplayName('[MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm', 'vi'));

console.log('VI 4 (MD03):', _taskDisplayName('[MD-BD-MD03]', 'vi'));
console.log('JA 4 (MD03):', _taskDisplayName('[MD-BD-MD03]', 'ja'));

console.log('Non-taxonomy:', _taskDisplayName('Hop giao ban 15 phut', 'vi'));

