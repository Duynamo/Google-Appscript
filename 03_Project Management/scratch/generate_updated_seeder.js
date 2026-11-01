const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const tasksDataScript = fs.readFileSync(path.join(root, 'scratch', 'build_tasks_data.js'), 'utf8');

// Trích xuất OFFICIAL_TASKS từ build_tasks_data.js
const startTasks = tasksDataScript.indexOf('const OFFICIAL_TASKS = [');
const endTasks = tasksDataScript.indexOf('console.log("=== TỔNG KẾT DANH MỤC NHIỆM VỤ ===");');
const tasksArrayCode = tasksDataScript.substring(startTasks, endTasks).trim();

// Đọc SeederData.gs hiện tại
let seeder = fs.readFileSync(path.join(root, 'SeederData.gs'), 'utf8');

// 1. Thêm mảng OFFICIAL_TASKS_LIST lên đầu hàm seedActualProjectsFromGreenTables
const insertTasksDef = `
    // ══════════════════════════════════════════════════════════
    //  DANH MỤC 68 NHIỆM VỤ (TASKS) CHUẨN THEO BÁO CÁO TIẾN ĐỘ THỰC TẾ
    // ══════════════════════════════════════════════════════════
    ${tasksArrayCode.replace('const OFFICIAL_TASKS =', 'const OFFICIAL_TASKS_LIST =')}
`;

// 2. Cập nhật projectDefinitions với mảng members chuẩn
const oldPjDefStart = 'const projectDefinitions = [';
const newPjDef = `const projectDefinitions = [
      {
        id: "MUR01",
        name: "2026_01_MUR01_室蘭市蘭東下水処理場",
        desc: "Dự án nhà máy xử lý nước thải Ranto - TP Muroran (Hokkaido)",
        manager: "duyvultv@gmail.com",
        managerName: "Vũ Đình Duy",
        startDate: "2026-07-01",
        endDate: "2026-10-02",
        status: "Đang thực hiện",
        progress: 70,
        budgetHours: 344,
        members: [
          { email: "member_thach@internal.local", name: "Nguyễn Hữu Thạch", role: "Member" },
          { email: "duyvultv@gmail.com", name: "Vũ Đình Duy", role: "Admin" }
        ]
      },
      {
        id: "JJK01",
        name: "2026_02_JJK01_工房ヴィレッジ新築工事",
        desc: "Dự án xây mới Làng xưởng Jujikai",
        manager: "duyvultv@gmail.com",
        managerName: "Vũ Đình Duy",
        startDate: "2026-07-02",
        endDate: "2026-10-16",
        status: "Đang thực hiện",
        progress: 100,
        budgetHours: 272,
        members: [
          { email: "duyvultv@gmail.com", name: "Vũ Đình Duy", role: "Admin" }
        ]
      },
      {
        id: "AMA01",
        name: "2026_03_AMA01_天草市本渡浄化センター",
        desc: "Trung tâm xử lý nước Hondo - TP Amakusa (Kumamoto)",
        manager: "duyvultv@gmail.com",
        managerName: "Vũ Đình Duy",
        startDate: "2026-10-26",
        endDate: "2026-12-31",
        status: "Đang thực hiện",
        progress: 10,
        budgetHours: 448,
        members: [
          { email: "member_hue@internal.local", name: "Ngô Thị Huệ", role: "Member" },
          { email: "duyvultv@gmail.com", name: "Vũ Đình Duy", role: "Admin" }
        ]
      },
      {
        id: "TES01",
        name: "2026_04_TES01_弟子屈町弟子屈浄化センター",
        desc: "TT xử lý nước Teshikaga - Thị trấn Teshikaga (Hokkaido)",
        manager: "duyvultv@gmail.com",
        managerName: "Vũ Đình Duy",
        startDate: "2026-07-09",
        endDate: "2026-08-21",
        status: "Đang thực hiện",
        progress: 44,
        budgetHours: 256,
        members: [
          { email: "member_nhan@internal.local", name: "Thạch Cảnh Ngô Nhân", role: "Member" },
          { email: "duyvultv@gmail.com", name: "Vũ Đình Duy", role: "Admin" }
        ]
      }
    ];`;

const endPjDefStr = 'const targetPjIds = new Set(["MUR01", "JJK01", "AMA01", "TES01"]);';

// Chèn insertTasksDef ngay trước oldPjDefStart
const pDefIdx = seeder.indexOf(oldPjDefStart);
const pDefEndIdx = seeder.indexOf(endPjDefStr);
if (pDefIdx !== -1 && pDefEndIdx !== -1) {
  seeder = seeder.substring(0, pDefIdx) + insertTasksDef + '\n    ' + newPjDef + '\n\n    ' + seeder.substring(pDefEndIdx);
  console.log('✅ Injected OFFICIAL_TASKS_LIST and updated projectDefinitions');
} else {
  console.error('❌ Failed to locate projectDefinitions', { pDefIdx, pDefEndIdx });
}

// 3. Cập nhật updatedRow[10] = JSON.stringify(pj.members)
seeder = seeder.replace(
  'cleanProjectRows.push(updatedRow);',
  'updatedRow[10] = JSON.stringify(pj.members || [{ email: pj.manager, name: pj.managerName || pj.manager, role: "Admin" }]);\n          cleanProjectRows.push(updatedRow);'
);
seeder = seeder.replace(
  'JSON.stringify([pj.manager]),',
  'JSON.stringify(pj.members || [{ email: pj.manager, name: pj.managerName || pj.manager, role: "Admin" }]),'
);

// 4. Thêm BƯỚC 3: ĐỒNG BỘ BẢNG TASKS vào SeederData.gs
const targetStep3InsertBefore = '// ══════════════════════════════════════════════════════════\r\n    //  BƯỚC 3: XÂY DỰNG LỊCH TRÌNH 712.0 GIỜ CÔNG';
const targetStep3InsertBeforeLF = '// ══════════════════════════════════════════════════════════\n    //  BƯỚC 3: XÂY DỰNG LỊCH TRÌNH 712.0 GIỜ CÔNG';

const stepTasksCode = `// ══════════════════════════════════════════════════════════
    //  BƯỚC 3a: ĐỒNG BỘ BẢNG NHIỆM VỤ (TASKS) - 68 ĐẦU VIỆC CHUẨN
    // ══════════════════════════════════════════════════════════
    const shTasks = ss.getSheetByName(CONFIG.SHEET_TASKS || "TASKS");
    if (shTasks) {
      const taskHeaders = [
        "ID","Project ID","Tên Dự Án","Tên Công Việc","Mô Tả","Người Thực Hiện",
        "Độ Ưu Tiên","Trạng Thái","Ngày Bắt Đầu","Deadline","Hoàn Thành %","Ghi Chú",
        "Ngày Tạo","Tạo Bởi","Cập Nhật","Mục Tiêu","Link Kết Quả","Kết Quả Đầu Ra","Nhắc Việc","Thứ Tự"
      ];

      const taskRows = [taskHeaders];
      OFFICIAL_TASKS_LIST.forEach(t => {
        taskRows.push([
          t.id,
          t.projectId,
          t.projectName,
          t.name,
          t.desc,
          t.assignee,
          t.priority,
          t.status,
          t.startDate,
          t.deadline,
          t.progress,
          t.note,
          nowStr,
          "duyvultv@gmail.com",
          nowStr,
          t.target || "",
          t.linkResults || "",
          t.outputResult || "",
          t.reminders || "[]",
          t.sortOrder || 999
        ]);
      });

      shTasks.getDataRange().clearContent();
      shTasks.getRange(1, 1, taskRows.length, taskRows[0].length).setValues(taskRows);
      shTasks.getRange(1, 1, 1, taskHeaders.length).setFontWeight("bold").setBackground("#ea4335").setFontColor("white");
      Logger.log(\`  ✔ Bảng TASKS đã nạp thành công \${OFFICIAL_TASKS_LIST.length} nhiệm vụ chuẩn của 4 dự án!\`);
      SpreadsheetApp.flush();
    }

    `;

let step3Idx = seeder.indexOf(targetStep3InsertBefore);
if (step3Idx === -1) step3Idx = seeder.indexOf(targetStep3InsertBeforeLF);

if (step3Idx !== -1) {
  seeder = seeder.substring(0, step3Idx) + stepTasksCode + seeder.substring(step3Idx);
  console.log('✅ Injected STEP 3a: TASKS sheet sync');
} else {
  console.error('❌ Failed to locate Step 3 insert point');
}

// 5. Cập nhật addDayWork và gán taskId cho các ngày công
seeder = seeder.replace(
  'function addDayWork(projectCode, staffCode, staffName, dateStr, cat, phase, disc, note, rank) {',
  'function addDayWork(projectCode, staffCode, staffName, dateStr, cat, phase, disc, note, rank, taskId) {'
);
seeder = seeder.replace(
  'rank: rank || "Kỹ sư BIM/MEP"\n      });',
  'rank: rank || "Kỹ sư BIM/MEP",\n        taskId: taskId || ""\n      });'
);
seeder = seeder.replace(
  'rank: rank || "Kỹ sư BIM/MEP"\r\n      });',
  'rank: rank || "Kỹ sư BIM/MEP",\r\n        taskId: taskId || ""\r\n      });'
);

// Cập nhật rowsToInsert để ghi day.taskId vào cột 11 (Task_ID)
seeder = seeder.replace(
  'day.disc,                           // 10: Discipline_Code\n          "",                                 // 11: Task_ID',
  'day.disc,                           // 10: Discipline_Code\n          day.taskId || "",                   // 11: Task_ID'
);
seeder = seeder.replace(
  'day.disc,                           // 10: Discipline_Code\r\n          "",                                 // 11: Task_ID',
  'day.disc,                           // 10: Discipline_Code\r\n          day.taskId || "",                   // 11: Task_ID'
);

// Gán taskId cụ thể cho từng đầu việc:
// MUR01
seeder = seeder.replace(
  'addDayWork(P1, ST1, NM1, d, "MD", "BD", "MD01", "【モデル】躯体作成: Dựng hình móng bệ, bể xử lý");',
  'addDayWork(P1, ST1, NM1, d, "MD", "BD", "MD01", "【モデル】躯体作成: Dựng hình móng bệ, bể xử lý", null, "MUR01_TK01");'
);
seeder = seeder.replace(
  'addDayWork(P1, ST1, NM1, d, "MD", "BD", "MD03", "【モデル】配管作成: Tuyến ống công nghệ chính");',
  'addDayWork(P1, ST1, NM1, d, "MD", "BD", "MD03", "【モデル】配管作成: Tuyến ống công nghệ chính", null, "MUR01_TK02");'
);
seeder = seeder.replace(
  'addDayWork(P1, ST1, NM1, d, "MD", "BD", "MD02", "【モデル】機械作成: (a\') Layout máy thổi khí");',
  'addDayWork(P1, ST1, NM1, d, "MD", "BD", "MD02", "【モデル】機械作成: (a\') Layout máy thổi khí", null, "MUR01_TK03");'
);
seeder = seeder.replace(
  'addDayWork(P1, ST1, NM1, d, "PC", "BD", "PC01", "【点群データ】処理: Ghép và xử lý đám mây điểm 3D");',
  'addDayWork(P1, ST1, NM1, d, "PC", "BD", "PC01", "【点群データ】処理: Ghép và xử lý đám mây điểm 3D", null, "MUR01_TK04");'
);
seeder = seeder.replace(
  'addDayWork(P1, ST1, NM1, "2026-07-13", "MD", "BD", "MD04", "【モデル】合成: Hợp nhất mô hình tổng thể");',
  'addDayWork(P1, ST1, NM1, "2026-07-13", "MD", "BD", "MD04", "【モデル】合成: Hợp nhất mô hình tổng thể", null, "MUR01_TK06");'
);
seeder = seeder.replace(
  'addDayWork(P1, ST1, NM1, d, "MC", "BD", "MC01", "【レポート・発注図】(a) Lập và nộp báo cáo kiểm tra thiết kế");',
  'addDayWork(P1, ST1, NM1, d, "MC", "BD", "MC01", "【レポート・発注図】(a) Lập và nộp báo cáo kiểm tra thiết kế", null, "MUR01_TK07");'
);
seeder = seeder.replace(
  'addDayWork(P1, ST1, NM1, d, "MC", "BD", "MC01", "【レポート・発注図】(c) Lập và nộp báo cáo phương án 2");',
  'addDayWork(P1, ST1, NM1, d, "MC", "BD", "MC01", "【レポート・発注図】(c) Lập và nộp báo cáo phương án 2", null, "MUR01_TK08");'
);
seeder = seeder.replace(
  'addDayWork(P1, ST1, NM1, d, "MD", "DD", "MD13", "【モデル】配管修正: Hiệu chỉnh mô hình từ bản vẽ thi công");',
  'addDayWork(P1, ST1, NM1, d, "MD", "DD", "MD13", "【モデル】配管修正: Hiệu chỉnh mô hình từ bản vẽ thi công", null, "MUR01_TK11");'
);
seeder = seeder.replace(
  'addDayWork(P1, ST1, NM1, d, "MC", "DD", "MC02", "【レポート・施工図】(d,e) Báo cáo kiểm tra bản vẽ thi công");',
  'addDayWork(P1, ST1, NM1, d, "MC", "DD", "MC02", "【レポート・施工図】(d,e) Báo cáo kiểm tra bản vẽ thi công", null, "MUR01_TK12");'
);

// JJK01
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-02", "MTG", "BD", "MT01", "(M1) Họp giải đáp thắc mắc");',
  'addDayWork(P2, ST2, NM2, "2026-07-02", "MTG", "BD", "MT01", "(M1) Họp giải đáp thắc mắc", null, "JJK01_TK01");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-07", "MTG", "BD", "MT01", "(M2) Họp Kickoff dự án");',
  'addDayWork(P2, ST2, NM2, "2026-07-07", "MTG", "BD", "MT01", "(M2) Họp Kickoff dự án", null, "JJK01_TK01");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, d, "MD", "BD", "MD10", "Kiểm tra mô hình kết cấu từ KOSO");',
  'addDayWork(P2, ST2, NM2, d, "MD", "BD", "MD10", "Kiểm tra mô hình kết cấu từ KOSO", null, "JJK01_TK02");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-08", "MTG", "BD", "MT02", "(M3) Họp thống nhất quy ước màu sắc mô hình");',
  'addDayWork(P2, ST2, NM2, "2026-07-08", "MTG", "BD", "MT02", "(M3) Họp thống nhất quy ước màu sắc mô hình", null, "JJK01_TK03");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-16", "MD", "BD", "MD10", "Kiểm tra mô hình kiến trúc KOSO");',
  'addDayWork(P2, ST2, NM2, "2026-07-16", "MD", "BD", "MD10", "Kiểm tra mô hình kiến trúc KOSO", null, "JJK01_TK04");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-21", "MTG", "BD", "MT02", "(M4) Họp thay đổi layout trần");',
  'addDayWork(P2, ST2, NM2, "2026-07-21", "MTG", "BD", "MT02", "(M4) Họp thay đổi layout trần", null, "JJK01_TK05");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, d, "MD", "BD", "MD10", "(e) Kiểm tra mô hình MEP & Điện");',
  'addDayWork(P2, ST2, NM2, d, "MD", "BD", "MD10", "(e) Kiểm tra mô hình MEP & Điện", null, "JJK01_TK06");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-22", "MTG", "BD", "MT01", "(M5) Họp thống nhất đổi layout với khách hàng FUSO");',
  'addDayWork(P2, ST2, NM2, "2026-07-22", "MTG", "BD", "MT01", "(M5) Họp thống nhất đổi layout với khách hàng FUSO", null, "JJK01_TK07");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-23", "MTG", "BD", "MT02", "(M6) Chốt đổi layout với KOSO");',
  'addDayWork(P2, ST2, NM2, "2026-07-23", "MTG", "BD", "MT02", "(M6) Chốt đổi layout với KOSO", null, "JJK01_TK08");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-29", "MD", "BD", "MD04", "Hợp nhất mô hình đa bộ môn");',
  'addDayWork(P2, ST2, NM2, "2026-07-29", "MD", "BD", "MD04", "Hợp nhất mô hình đa bộ môn", null, "JJK01_TK09");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-07-29", "MTG", "BD", "MT02", "(M7) Review tổng thể mô hình");',
  'addDayWork(P2, ST2, NM2, "2026-07-29", "MTG", "BD", "MT02", "(M7) Review tổng thể mô hình", null, "JJK01_TK10");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, d, "MC", "BD", "MC01", "Rà soát kiểm tra bản vẽ thiết kế đặt hàng");',
  'addDayWork(P2, ST2, NM2, d, "MC", "BD", "MC01", "Rà soát kiểm tra bản vẽ thiết kế đặt hàng", null, "JJK01_TK11");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-08-03", "SD", "BD", "SD08", "Chuyển đổi định dạng TFAS đợt 1");',
  'addDayWork(P2, ST2, NM2, "2026-08-03", "SD", "BD", "SD08", "Chuyển đổi định dạng TFAS đợt 1", null, "JJK01_TK12");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, d, "MC", "BD", "MC01", "Lập & nộp báo cáo kiểm tra thiết kế đợt 1");',
  'addDayWork(P2, ST2, NM2, d, "MC", "BD", "MC01", "Lập & nộp báo cáo kiểm tra thiết kế đợt 1", null, "JJK01_TK13");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-08-07", "MTG", "BD", "MT01", "(M8) Họp báo cáo kết quả kiểm tra thiết kế đợt 1");',
  'addDayWork(P2, ST2, NM2, "2026-08-07", "MTG", "BD", "MT01", "(M8) Họp báo cáo kết quả kiểm tra thiết kế đợt 1", null, "JJK01_TK14");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-08-11", "MTG", "BD", "MT01", "(M9) Họp kỹ thuật chuyển đổi dữ liệu TFAS");',
  'addDayWork(P2, ST2, NM2, "2026-08-11", "MTG", "BD", "MT01", "(M9) Họp kỹ thuật chuyển đổi dữ liệu TFAS", null, "JJK01_TK15");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, d, "PM", "BD", "PM01", "Bóc tách khối lượng vật tư Giai đoạn 1");',
  'addDayWork(P2, ST2, NM2, d, "PM", "BD", "PM01", "Bóc tách khối lượng vật tư Giai đoạn 1", null, "JJK01_TK16");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-08-19", "MTG", "BD", "MT01", "(M10) Họp giải quyết vướng mắc Giai đoạn 1");',
  'addDayWork(P2, ST2, NM2, "2026-08-19", "MTG", "BD", "MT01", "(M10) Họp giải quyết vướng mắc Giai đoạn 1", null, "JJK01_TK17");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, d, "MC", "BD", "MC03", "Phối hợp xử lý xung đột & Issue tồn đọng");',
  'addDayWork(P2, ST2, NM2, d, "MC", "BD", "MC03", "Phối hợp xử lý xung đột & Issue tồn đọng", null, "JJK01_TK18");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-08-24", "MC", "BD", "MC06", "Báo cáo kỹ thuật xung đột dưới sàn ván ép");',
  'addDayWork(P2, ST2, NM2, "2026-08-24", "MC", "BD", "MC06", "Báo cáo kỹ thuật xung đột dưới sàn ván ép", null, "JJK01_TK19");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-08-25", "MTG", "BD", "MT01", "Họp rà soát công việc còn lại & Tiến độ");',
  'addDayWork(P2, ST2, NM2, "2026-08-25", "MTG", "BD", "MT01", "Họp rà soát công việc còn lại & Tiến độ", null, "JJK01_TK20");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-08-26", "MTG", "BD", "MT02", "Họp xử lý vấn đề kỹ thuật dưới sàn");',
  'addDayWork(P2, ST2, NM2, "2026-08-26", "MTG", "BD", "MT02", "Họp xử lý vấn đề kỹ thuật dưới sàn", null, "JJK01_TK21");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-09-01", "SD", "BD", "SD08", "Chuyển đổi định dạng TFAS đợt 2 sau sửa issue");',
  'addDayWork(P2, ST2, NM2, "2026-09-01", "SD", "BD", "SD08", "Chuyển đổi định dạng TFAS đợt 2 sau sửa issue", null, "JJK01_TK22");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-09-04", "MTG", "BD", "MT01", "Họp báo cáo tiến độ định kỳ với FUSO");',
  'addDayWork(P2, ST2, NM2, "2026-09-04", "MTG", "BD", "MT01", "Họp báo cáo tiến độ định kỳ với FUSO", null, "JJK01_TK23");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-09-08", "MTG", "BD", "MT01", "Họp giải quyết vấn đề kỹ thuật phát sinh");',
  'addDayWork(P2, ST2, NM2, "2026-09-08", "MTG", "BD", "MT01", "Họp giải quyết vấn đề kỹ thuật phát sinh", null, "JJK01_TK24");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-09-15", "MTG", "DD", "MT01", "Họp về kế hoạch lập bản vẽ thi công");',
  'addDayWork(P2, ST2, NM2, "2026-09-15", "MTG", "DD", "MT01", "Họp về kế hoạch lập bản vẽ thi công", null, "JJK01_TK25");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-09-16", "MTG", "BD", "MT02", "Họp bố trí lỗ thăm kỹ thuật trần/sàn");',
  'addDayWork(P2, ST2, NM2, "2026-09-16", "MTG", "BD", "MT02", "Họp bố trí lỗ thăm kỹ thuật trần/sàn", null, "JJK01_TK26");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-09-23", "MC", "BD", "MC01", "Lập & nộp báo cáo kiểm tra thiết kế đợt 2");',
  'addDayWork(P2, ST2, NM2, "2026-09-23", "MC", "BD", "MC01", "Lập & nộp báo cáo kiểm tra thiết kế đợt 2", null, "JJK01_TK27");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, d, "SD", "BD", "SD08", "Chuyển đổi định dạng TFAS hoàn thiện đợt 3");',
  'addDayWork(P2, ST2, NM2, d, "SD", "BD", "SD08", "Chuyển đổi định dạng TFAS hoàn thiện đợt 3", null, "JJK01_TK28");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-10-02", "MTG", "BD", "MT01", "Họp báo cáo kiểm tra thiết kế đợt 2");',
  'addDayWork(P2, ST2, NM2, "2026-10-02", "MTG", "BD", "MT01", "Họp báo cáo kiểm tra thiết kế đợt 2", null, "JJK01_TK29");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-10-08", "MTG", "BD", "MT02", "Họp đánh giá rút kinh nghiệm dự án");',
  'addDayWork(P2, ST2, NM2, "2026-10-08", "MTG", "BD", "MT02", "Họp đánh giá rút kinh nghiệm dự án", null, "JJK01_TK30");'
);
seeder = seeder.replace(
  'addDayWork(P2, ST2, NM2, "2026-10-16", "MTG", "BD", "MT01", "Họp nghiệm thu đóng dự án");',
  'addDayWork(P2, ST2, NM2, "2026-10-16", "MTG", "BD", "MT01", "Họp nghiệm thu đóng dự án", null, "JJK01_TK31");'
);

// AMA01
seeder = seeder.replace(
  'addDayWork(P3, ST3, NM3, d, "MD", "BD", "MD03", "【モデル】配管作成: Dựng mô hình đường ống công nghệ");',
  'addDayWork(P3, ST3, NM3, d, "MD", "BD", "MD03", "【モデル】配管作成: Dựng mô hình đường ống công nghệ", null, "AMA01_TK01");'
);

// TES01
seeder = seeder.replace(
  'addDayWork(P4, ST4, NM4, d, "MD", "BD", "MD01", "【モデル】躯体作成: Dựng hình móng bệ, bể xử lý");',
  'addDayWork(P4, ST4, NM4, d, "MD", "BD", "MD01", "【モデル】躯体作成: Dựng hình móng bệ, bể xử lý", null, "TES01_TK01");'
);
seeder = seeder.replace(
  'addDayWork(P4, ST4, NM4, d, "MD", "BD", "MD03", "【モデル】配管作成: Tuyến ống công nghệ chính");',
  'addDayWork(P4, ST4, NM4, d, "MD", "BD", "MD03", "【モデル】配管作成: Tuyến ống công nghệ chính", null, "TES01_TK02");'
);
seeder = seeder.replace(
  'addDayWork(P4, ST4, NM4, "2026-08-03", "MD", "BD", "MD02", "【モデル】機械作成: Dựng mô hình thiết bị máy móc");',
  'addDayWork(P4, ST4, NM4, "2026-08-03", "MD", "BD", "MD02", "【モデル】機械作成: Dựng mô hình thiết bị máy móc", null, "TES01_TK03");'
);
seeder = seeder.replace(
  'addDayWork(P4, ST4, NM4, d, "PC", "BD", "PC01", "【点群データ】処理: (b) Xử lý Point Cloud hiện trạng");',
  'addDayWork(P4, ST4, NM4, d, "PC", "BD", "PC01", "【点群データ】処理: (b) Xử lý Point Cloud hiện trạng", null, "TES01_TK04");'
);
seeder = seeder.replace(
  'addDayWork(P4, ST4, NM4, "2026-08-06", "MTG", "BD", "MT01", "Họp xác nhận vị trí tháo dỡ Point Cloud");',
  'addDayWork(P4, ST4, NM4, "2026-08-06", "MTG", "BD", "MT01", "Họp xác nhận vị trí tháo dỡ Point Cloud", null, "TES01_TK05");'
);
seeder = seeder.replace(
  'addDayWork(P4, ST4, NM4, d, "MC", "BD", "MC01", "Rà soát kiểm tra bản vẽ thiết kế đặt hàng");',
  'addDayWork(P4, ST4, NM4, d, "MC", "BD", "MC01", "Rà soát kiểm tra bản vẽ thiết kế đặt hàng", null, "TES01_TK06");'
);
seeder = seeder.replace(
  'addDayWork(P4, ST4, NM4, d, "MC", "BD", "MC01", "【レポート・発注図】(c) Lập và nộp báo cáo kiểm tra thiết kế");',
  'addDayWork(P4, ST4, NM4, d, "MC", "BD", "MC01", "【レポート・発注図】(c) Lập và nộp báo cáo kiểm tra thiết kế", null, "TES01_TK07");'
);

// Ghi đè SeederData.gs
fs.writeFileSync(path.join(root, 'SeederData.gs'), seeder, 'utf8');
console.log('✅ SeederData.gs updated successfully with 68 tasks and two-way Timesheet links!');

