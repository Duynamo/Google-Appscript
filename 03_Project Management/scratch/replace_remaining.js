const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const seederPath = path.join(root, 'SeederData.gs');
let seeder = fs.readFileSync(seederPath, 'utf8');

seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-22", "MTG", "BD", "MT01", "(M5) Họp đổi layout với khách hàng Higuchi-san");',
  'addDayWork(P2, ST2, NM2, "2026-07-22", "MTG", "BD", "MT01", "(M5) Họp đổi layout với khách hàng Higuchi-san", null, "JJK01_TK07");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-23", "MTG", "BD", "MT02", "(M6) Họp chốt đổi layout với đội KOSO");',
  'addDayWork(P2, ST2, NM2, "2026-07-23", "MTG", "BD", "MT02", "(M6) Họp chốt đổi layout với đội KOSO", null, "JJK01_TK08");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-29", "MTG", "BD", "MT02", "(M7) Họp review mô hình tổng thể");',
  'addDayWork(P2, ST2, NM2, "2026-07-29", "MTG", "BD", "MT02", "(M7) Họp review mô hình tổng thể", null, "JJK01_TK10");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, d, "MC", "BD", "MC01", "Kiểm tra sai lệch bản vẽ thiết kế đặt hàng");',
  'addDayWork(P2, ST2, NM2, d, "MC", "BD", "MC01", "Kiểm tra sai lệch bản vẽ thiết kế đặt hàng", null, "JJK01_TK11");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-08-07", "MTG", "BD", "MT01", "(M8) Họp báo cáo kết quả kiểm tra thiết kế");',
  'addDayWork(P2, ST2, NM2, "2026-08-07", "MTG", "BD", "MT01", "(M8) Họp báo cáo kết quả kiểm tra thiết kế", null, "JJK01_TK14");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-08-11", "MTG", "BD", "MT01", "(M9) Họp kỹ thuật chuyển đổi TFAS");',
  'addDayWork(P2, ST2, NM2, "2026-08-11", "MTG", "BD", "MT01", "(M9) Họp kỹ thuật chuyển đổi TFAS", null, "JJK01_TK15");'
);

fs.writeFileSync(seederPath, seeder, 'utf8');
console.log('✅ All 6 remaining lines updated with exact task IDs!');

