const fs = require('fs');
const path = require('path');

const suitePath = path.join(__dirname, 'run_full_compatibility_suite.js');
let content = fs.readFileSync(suitePath, 'utf8');

// Fix TC14
content = content.replace(
  `// TC14: Tính Idempotent tuyệt đối của Seeder\nconst preCountTs = memorySheets.TIMESHEET_2026.rows.length;\nctx.seedActualProjectsFromGreenTables(); // Run 2nd time`,
  `// TC14: Tính Idempotent tuyệt đối của Seeder\nctx.seedActualProjectsFromGreenTables(); // Khôi phục trạng thái chuẩn sau TC10\nconst preCountTs = memorySheets.TIMESHEET_2026.rows.length;\nctx.seedActualProjectsFromGreenTables(); // Run 2nd time`
);

// Fix TC19
const oldTC19 = `// TC19: Đổi mã nhân viên từ modal Danh mục tiêu chuẩn (saveTaxonomyItem) lan truyền 100%
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

const newTC19 = `// TC19: Đổi mã nhân viên từ modal Danh mục tiêu chuẩn (saveTaxonomyItem) lan truyền 100%
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
const userDuyCodeChanged = userDuy ? userDuy[0] : "";
const taxDuyCodeChanged = taxDuy ? taxDuy.code : "";

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
  userDuyCodeChanged === "AB6FD893" &&
  taxDuyCodeChanged === "AB6FD893" &&
  userDuyReverted && userDuyReverted[0] === "AB6FD093"),
  \`Lỗi đổi mã nhân viên: saveRes=\${JSON.stringify(saveTaxRes)}, codeChanged=\${userDuyCodeChanged}, taxChanged=\${taxDuyCodeChanged}\`
);`;

content = content.replace(oldTC19, newTC19);
fs.writeFileSync(suitePath, content, 'utf8');
console.log('✅ Updated TC14 and TC19 in run_full_compatibility_suite.js');

