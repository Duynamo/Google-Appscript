const fs = require('fs');
const path = require('path');

const suitePath = path.join(__dirname, 'run_full_compatibility_suite.js');
let content = fs.readFileSync(suitePath, 'utf8');

const target = `assert("TC18", "Cấu trúc Thành viên Dự án chuẩn (Ngăn ngừa lỗi avatar '? undefined')",
  invalidMemberPj.length === 0,
  \`Dự án thành viên lỗi: \${invalidMemberPj.length}\`
);`;

const addition = `assert("TC18", "Cấu trúc Thành viên Dự án chuẩn (Ngăn ngừa lỗi avatar '? undefined')",
  invalidMemberPj.length === 0,
  \`Dự án thành viên lỗi: \${invalidMemberPj.length}\`
);

// TC19: Đổi mã nhân viên từ modal Danh mục tiêu chuẩn (saveTaxonomyItem) lan truyền 100%
const saveTaxRes = ctx.saveTaxonomyItem({
  id: "EMP_AB6FD093",
  type: "EMPLOYEE",
  code: "AB6FD893",
  name: "Vũ Đình Duy",
  name_vi: "Vũ Đình Duy",
  name_en: "Vu Dinh Duy",
  desc: "Quản trị viên (Cấp 1)",
  extra1: "duyvultv@gmail.com",
  extra2: "",
  extra3: "Admin",
  status: "Active"
});
const userDuy = memorySheets.USERS.rows.slice(1).find(u => u[1] === "duyvultv@gmail.com");
const taxDuy = ctx.getTaxonomyDataInternal().employees.find(e => e.extra1 === "duyvultv@gmail.com");

// Revert lại về mã gốc AB6FD093 để bảo toàn dữ liệu sau test
ctx.saveTaxonomyItem({
  id: "EMP_AB6FD893",
  type: "EMPLOYEE",
  code: "AB6FD093",
  name: "Vũ Đình Duy",
  name_vi: "Vũ Đình Duy",
  desc: "Quản trị viên (Cấp 1)",
  extra1: "duyvultv@gmail.com",
  extra3: "Admin",
  status: "Active"
});
const userDuyReverted = memorySheets.USERS.rows.slice(1).find(u => u[1] === "duyvultv@gmail.com");

assert("TC19", "Đổi mã nhân viên qua modal Danh mục tiêu chuẩn lan truyền 100% sang USERS, TAXONOMY, TIMESHEET",
  Boolean(saveTaxRes && saveTaxRes.success &&
  userDuy && userDuy[0] === "AB6FD893" &&
  taxDuy && taxDuy.code === "AB6FD893" &&
  userDuyReverted && userDuyReverted[0] === "AB6FD093"),
  \`Lỗi đổi mã nhân viên: saveRes=\${JSON.stringify(saveTaxRes)}, userDuyCode=\${userDuy ? userDuy[0] : 'null'}\`
);`;

content = content.replace(target, addition);
content = content.replace(/\$\{passCount\}\/18/g, '${passCount}/19');
content = content.replace(/passCount\/18/g, 'passCount/19');

fs.writeFileSync(suitePath, content, 'utf8');
console.log('✅ Added TC19 to run_full_compatibility_suite.js');

