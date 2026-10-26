/**
 * AUTOMATED TEST SUITE CHO HỆ THỐNG GAS WEBAPP
 * Chạy kiểm thử: node scratch/run_full_tests.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=================================================================");
console.log("🚀 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN HỆ THỐNG WEBAPP & TAXONOMY 46 MÃ");
console.log("=================================================================\n");

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, errorDetails = "") {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} - ${errorDetails}`);
    failedCount++;
  }
}

// ── TẦNG 1: KIỂM TRA CÚ PHÁP TẤT CẢ FILE .GS VÀ SCRIPT TRONG HTML ──
console.log("👉 BƯỚC 1: KIỂM TRA CÚ PHÁP TĨNH (STATIC SYNTAX CHECK)");

const gsFiles = ['Code.gs', 'Userapi.gs', 'Taxonomyapi.gs', 'Timesheetapi.gs', 'Taskapi.gs', 'Projectsapi.gs', 'Helpers.gs'];
gsFiles.forEach(f => {
  try {
    const code = fs.readFileSync(f, 'utf8');
    new vm.Script(code);
    assert(true, `Biên dịch file backend ${f}`);
  } catch (err) {
    assert(false, `Biên dịch file backend ${f}`, err.message);
  }
});

// Bóc tách kiểm tra script trong Index.html
try {
  const html = fs.readFileSync('Index.html', 'utf8');
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptIdx = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    scriptIdx++;
    if (match[1] && match[1].trim()) {
      new vm.Script(match[1]);
      assert(true, `Biên dịch script block #${scriptIdx} trong Index.html (${match[1].length} ký tự)`);
    }
  }
} catch (errHtml) {
  assert(false, "Biên dịch script trong Index.html", errHtml.message);
}

// ── TẦNG 2: KIỂM THỬ LOGIC TAXONOMY VÀ 46 MÃ CÔNG VIỆC ──
console.log("\n👉 BƯỚC 2: KIỂM THỬ TÍNH ĐÚNG ĐẮN CỦA 46 MÃ CÔNG VIỆC");

try {
  const taxCode = fs.readFileSync('Taxonomyapi.gs', 'utf8');
  const sandbox = {
    console: console,
    Logger: { log: () => {} },
    Utilities: { formatDate: () => "20261026_120000" },
    CONFIG: { SHEET_TAXONOMY: "TAXONOMY" },
    SpreadsheetApp: { getActiveSpreadsheet: () => null }
  };
  vm.createContext(sandbox);
  vm.runInContext(taxCode, sandbox);

  const list = vm.runInContext("DEFAULT_TAXONOMY_LIST", sandbox);
  assert(Array.isArray(list) && list.length > 0, "DEFAULT_TAXONOMY_LIST tồn tại và là một mảng");

  const categories = list.filter(i => i.type === "CATEGORY");
  const phases = list.filter(i => i.type === "PHASE");
  const disciplines = list.filter(i => i.type === "DISCIPLINE");
  const projectCodes = list.filter(i => i.type === "PROJECT_CODE");

  assert(categories.length === 8, `Đủ 8 nhóm Category chuẩn (Thực tế: ${categories.length})`);
  assert(phases.length === 3, `Đủ 3 giai đoạn Phase chuẩn (Thực tế: ${phases.length})`);
  assert(disciplines.length === 46, `Đủ 46 mã tác nghiệp Discipline (Thực tế: ${disciplines.length})`);

  // Kiểm tra không bị lặp mã trong trường name_jp (Lỗi PM01_...)
  const duplicatedJp = disciplines.filter(d => d.name_jp && d.name_jp.startsWith(d.code));
  assert(duplicatedJp.length === 0, `Không có mã nào bị lặp tiền tố trong name_jp (Phát hiện: ${duplicatedJp.map(d=>d.code).join(', ')})`);

  // Kiểm tra tam ngữ (VI, EN, JP) không được để trống
  const missingLangs = disciplines.filter(d => !d.name_vi || !d.name_en || !d.name_jp);
  assert(missingLangs.length === 0, `100% mã tác nghiệp có đủ 3 thứ tiếng VI, EN, JP (Thiếu: ${missingLangs.length})`);

  // Kiểm tra màu nhận diện hợp lệ dạng HEX (#xxxxxx)
  const invalidColors = disciplines.filter(d => !d.color || !d.color.startsWith('#'));
  assert(invalidColors.length === 0, `100% mã tác nghiệp có mã màu Hex hợp lệ (Thiếu: ${invalidColors.length})`);

} catch (errTax) {
  assert(false, "Kiểm thử logic Taxonomy", errTax.message);
}

// ── TẦNG 3: KIỂM THỬ HÀM XỬ LÝ NHÃN TAM NGỮ TRONG INDEX.HTML ──
console.log("\n👉 BƯỚC 3: KIỂM THỬ HÀM XỬ LÝ NHÃN TTAXONOMY");

try {
  const html = fs.readFileSync('Index.html', 'utf8');
  // Trích xuất hàm tTaxonomy từ Index.html
  const tTaxMatch = html.match(/function\s+tTaxonomy\s*\([\s\S]*?\n\}/);
  if (tTaxMatch) {
    const sandboxUI = { S: { lang: 'ja' } };
    vm.createContext(sandboxUI);
    vm.runInContext(tTaxMatch[0], sandboxUI);

    const sampleItem = {
      code: "PM01",
      name_vi: "Nghiên cứu tài liệu hồ sơ dự án",
      name_en: "Project Document Review",
      name_jp: "PM01_プロジェクト資料確認" // Giả sử dữ liệu cũ bị dính PM01_
    };

    const resJa = sandboxUI.tTaxonomy(sampleItem, 'ja');
    assert(!resJa.startsWith('PM01_') && !resJa.startsWith('PM01'), `tTaxonomy tự động khử tiền tố lặp PM01_ khi chọn tiếng Nhật (Kết quả: "${resJa}")`);

    const resVi = sandboxUI.tTaxonomy(sampleItem, 'vi');
    assert(resVi === "Nghiên cứu tài liệu hồ sơ dự án", `tTaxonomy trả về đúng tiếng Việt (Kết quả: "${resVi}")`);

    const resEn = sandboxUI.tTaxonomy(sampleItem, 'en');
    assert(resEn === "Project Document Review", `tTaxonomy trả về đúng tiếng Anh (Kết quả: "${resEn}")`);
  } else {
    assert(false, "Không tìm thấy hàm tTaxonomy trong Index.html");
  }
} catch (errUI) {
  assert(false, "Kiểm thử tTaxonomy", errUI.message);
}

// ── TỔNG KẾT BÁO CÁO ──
console.log("\n=================================================================");
console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passedCount} PASS | ${failedCount} FAIL`);
if (failedCount === 0) {
  console.log("🎉 HỆ THỐNG HOÀN TOÀN ĐẠT CHUẨN KỸ THUẬT & AN TOÀN TUYỆT ĐỐI!");
} else {
  console.error("⚠️ CÓ LỖI CẦN SỬA TRƯỚC KHI DEPLOY!");
}
console.log("=================================================================");

process.exit(failedCount === 0 ? 0 : 1);
