const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. UPDATE Taxonomyapi.gs
console.log("Updating Taxonomyapi.gs...");
const taxPath = path.join(rootDir, 'Taxonomyapi.gs');
let taxContent = fs.readFileSync(taxPath, 'utf8');

const oldTaxTarget = `  // ── 4. PROJECT CODES (MÃ DỰ ÁN MẪU CHUẨN HOÁ) ──
  { id:"PJC_HAG01", type:"PROJECT_CODE", code:"HAG01", name_vi:"Trạm xử lý nước thải Hanamigawa", name_en:"2026_01_HAG01_Hanamigawa", name_jp:"花見川終末処理場", name:"2026_01_HAG01_花見川終末処理場", desc:"花見川終末処理場", color:"#6366f1", sortOrder:1, extra1:"2026", extra2:"花見川終末処理場", extra3:"01", status:"Active" },
  { id:"PJC_JJK01", type:"PROJECT_CODE", code:"JJK01", name_vi:"Công trình mới Làng xưởng Jujikai", name_en:"2026_01_JJK01_Jujikai", name_jp:"十字会工房ヴィレッジ新築工事", name:"2026_01_JJK01_十字会工房ヴィレッジ新築工事", desc:"十字会工房ヴィレッジ新築工事", color:"#6366f1", sortOrder:2, extra1:"2026", extra2:"十字会", extra3:"01", status:"Active" }
];`;

const newTaxTarget = `  // ── 4. PROJECT CODES (MÃ DỰ ÁN THỰC TẾ CHUẨN HOÁ) ──
  { id:"PJC_MUR01", type:"PROJECT_CODE", code:"MUR01", name_vi:"Trạm xử lý nước thải Ranto TP Muroran", name_en:"2026_01_MUR01_Muroran", name_jp:"室蘭市蘭東下水処理場", name:"2026_01_MUR01_室蘭市蘭東下水処理場", desc:"2026_01_MUR01_室蘭市蘭東下水処理場", color:"#3b82f6", sortOrder:1, extra1:"2026", extra2:"室蘭市蘭東下水処理場", extra3:"01", status:"Active" },
  { id:"PJC_JJK01", type:"PROJECT_CODE", code:"JJK01", name_vi:"Công trình xây mới Làng xưởng Kobo Village", name_en:"2026_02_JJK01_KoboVillage", name_jp:"工房ヴィレッジ新築工事", name:"2026_02_JJK01_工房ヴィレッジ新築工事", desc:"2026_02_JJK01_工房ヴィレッジ新築工事", color:"#10b981", sortOrder:2, extra1:"2026", extra2:"工房ヴィレッジ", extra3:"02", status:"Active" },
  { id:"PJC_AMA01", type:"PROJECT_CODE", code:"AMA01", name_vi:"Trung tâm xử lý nước Hondo TP Amakusa", name_en:"2026_03_AMA01_Amakusa", name_jp:"天草市本渡浄化センター", name:"2026_03_AMA01_天草市本渡浄化センター", desc:"2026_03_AMA01_天草市本渡浄化センター", color:"#f59e0b", sortOrder:3, extra1:"2026", extra2:"天草市本渡浄化センター", extra3:"03", status:"Active" },
  { id:"PJC_TES01", type:"PROJECT_CODE", code:"TES01", name_vi:"TT xử lý nước Teshikaga Thị trấn Teshikaga", name_en:"2026_04_TES01_Teshikaga", name_jp:"弟子屈町弟子屈浄化センター", name:"2026_04_TES01_弟子屈町弟子屈浄化センター", desc:"2026_04_TES01_弟子屈町弟子屈浄化センター", color:"#8b5cf6", sortOrder:4, extra1:"2026", extra2:"弟子屈町弟子屈浄化センター", extra3:"04", status:"Active" }
];`;

const taxNorm = taxContent.replace(/\r\n/g, '\n');
const oldTaxNorm = oldTaxTarget.replace(/\r\n/g, '\n');
if (taxNorm.includes(oldTaxNorm)) {
  const updatedTax = taxNorm.replace(oldTaxNorm, newTaxTarget.replace(/\r\n/g, '\n'));
  fs.writeFileSync(taxPath, updatedTax.replace(/\n/g, '\r\n'), 'utf8');
  console.log("✅ Taxonomyapi.gs updated successfully!");
} else {
  console.log("⚠️ Old target in Taxonomyapi.gs not found (might already be updated)");
}

// 2. UPDATE Index.html
console.log("Updating Index.html...");
const indexPath = path.join(rootDir, 'Index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const oldIndexTarget = `{ id: "JUJ01", name: "2026_02_JUJ01_工房ヴィレッジ新築工事" }`;
const newIndexTarget = `{ id: "JJK01", name: "2026_02_JJK01_工房ヴィレッジ新築工事" }`;

if (indexContent.includes(oldIndexTarget)) {
  indexContent = indexContent.split(oldIndexTarget).join(newIndexTarget);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log("✅ Index.html updated defaultActualPjs successfully!");
} else {
  console.log("⚠️ oldIndexTarget not found in Index.html");
}

console.log("Finished partial updates.");

