const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// Read Index.html and evaluate in VM sandbox
const indexHtml = fs.readFileSync('03_Project Management/Index.html', 'utf8');
const scriptMatches = indexHtml.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
const code = scriptMatches[0].replace(/<script[^>]*>|<\/script>/gi, '');

// Set up mock window / document
const sandbox = {
  console: console,
  window: { addEventListener: () => {} },
  document: {
    addEventListener: () => {},
    getElementById: () => ({ value: '', textContent: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} } }),
    querySelector: () => null,
    querySelectorAll: () => []
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  navigator: { userAgent: 'node' }
};

vm.createContext(sandbox);
vm.runInContext(code, sandbox);

console.log('--- TESTING USER REQUIREMENT 10 ---');

// Test 1: Bare prefix [MD-BD-MD01]
console.log('Test 1: Bare prefix [MD-BD-MD01]');
const vi1 = vm.runInContext('_taskDisplayName("[MD-BD-MD01]", "vi")', sandbox);
const ja1 = vm.runInContext('_taskDisplayName("[MD-BD-MD01]", "ja")', sandbox);
const en1 = vm.runInContext('_taskDisplayName("[MD-BD-MD01]", "en")', sandbox);
console.log('  VI:', vi1);
console.log('  JA:', ja1);
console.log('  EN:', en1);
assert.strictEqual(vi1, '[MD-BD-MD01]-Dựng hình Kết cấu');
assert.strictEqual(ja1, '[MD-BD-MD01]-【モデル】躯体作成');
assert.strictEqual(en1, '[MD-BD-MD01]-Structure Modeling');
console.log('✔ Test 1 PASS!');

// Test 2: Existing Vietnamese suffix [MD-BD-MD01]-Dựng hình kết cấu
console.log('Test 2: Existing Vietnamese suffix [MD-BD-MD01]-Dựng hình kết cấu');
const vi2 = vm.runInContext('_taskDisplayName("[MD-BD-MD01]-Dựng hình kết cấu", "vi")', sandbox);
const ja2 = vm.runInContext('_taskDisplayName("[MD-BD-MD01]-Dựng hình kết cấu", "ja")', sandbox);
const en2 = vm.runInContext('_taskDisplayName("[MD-BD-MD01]-Dựng hình kết cấu", "en")', sandbox);
console.log('  VI:', vi2);
console.log('  JA:', ja2);
console.log('  EN:', en2);
assert.strictEqual(vi2, '[MD-BD-MD01]-Dựng hình Kết cấu');
assert.strictEqual(ja2, '[MD-BD-MD01]-【モデル】躯体作成');
assert.strictEqual(en2, '[MD-BD-MD01]-Structure Modeling');
console.log('✔ Test 2 PASS!');

// Test 3: Custom note preserved [MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm
console.log('Test 3: Custom note preserved [MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm');
const vi3 = vm.runInContext('_taskDisplayName("[MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm", "vi")', sandbox);
const ja3 = vm.runInContext('_taskDisplayName("[MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm", "ja")', sandbox);
const en3 = vm.runInContext('_taskDisplayName("[MD-BD-MD01]-Dựng hình kết cấu - Tầng hầm", "en")', sandbox);
console.log('  VI:', vi3);
console.log('  JA:', ja3);
console.log('  EN:', en3);
assert.strictEqual(vi3, '[MD-BD-MD01]-Dựng hình Kết cấu - Tầng hầm');
assert.strictEqual(ja3, '[MD-BD-MD01]-【モデル】躯体作成 - Tầng hầm');
assert.strictEqual(en3, '[MD-BD-MD01]-Structure Modeling - Tầng hầm');
console.log('✔ Test 3 PASS!');

// Test 4: Dynamic Language Switching via S.lang
console.log('Test 4: Dynamic Language Switching via S.lang');
vm.runInContext('S.lang = "vi"', sandbox);
assert.strictEqual(vm.runInContext('_taskDisplayName("[MD-BD-MD03]")', sandbox), '[MD-BD-MD03]-Dựng hình Đường ống');
vm.runInContext('S.lang = "ja"', sandbox);
assert.strictEqual(vm.runInContext('_taskDisplayName("[MD-BD-MD03]")', sandbox), '[MD-BD-MD03]-【モデル】配管作成');
vm.runInContext('S.lang = "en"', sandbox);
assert.strictEqual(vm.runInContext('_taskDisplayName("[MD-BD-MD03]")', sandbox), '[MD-BD-MD03]-Piping Modeling');
console.log('✔ Test 4 PASS!');

// Test 5: Verify all 46 disciplines are localized
console.log('Test 5: Verify all 46 disciplines');
const dict = vm.runInContext('STANDARD_DISCIPLINE_NAMES', sandbox);
const keys = Object.keys(dict);
assert.strictEqual(keys.length, 46);
for (const k of keys) {
  assert.ok(dict[k].vi, `Missing VI for ${k}`);
  assert.ok(dict[k].en, `Missing EN for ${k}`);
  assert.ok(dict[k].ja, `Missing JA for ${k}`);
  const sample = vm.runInContext(`_taskDisplayName("[MD-BD-${k}]", "ja")`, sandbox);
  assert.ok(sample.includes(dict[k].ja), `Failed JA sample for ${k}`);
}
console.log(`✔ Test 5 PASS! All ${keys.length} standard disciplines properly localized in VI, EN, JA!`);

console.log('====================================================');
console.log('ALL TESTS PASSED! TASK NAME LOCALIZATION 100% READY!');
console.log('====================================================');
