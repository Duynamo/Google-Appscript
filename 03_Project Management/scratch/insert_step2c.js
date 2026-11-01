const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const seederPath = path.join(root, 'SeederData.gs');
let seeder = fs.readFileSync(seederPath, 'utf8');

const target = '// ══════════════════════════════════════════════════════════\r\n    //  BƯỚC 3: XÂY DỰNG DANH SÁCH 712.0 GIỜ CHẤM CÔNG THỰC TẾ';
const targetLF = '// ══════════════════════════════════════════════════════════\n    //  BƯỚC 3: XÂY DỰNG DANH SÁCH 712.0 GIỜ CHẤM CÔNG THỰC TẾ';

const stepTasksCode = `// ══════════════════════════════════════════════════════════
    //  BƯỚC 2c: ĐỒNG BỘ BẢNG NHIỆM VỤ (TASKS) - 68 ĐẦU VIỆC CHUẨN
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

let idx = seeder.indexOf(target);
if (idx === -1) idx = seeder.indexOf(targetLF);

if (idx !== -1) {
  seeder = seeder.substring(0, idx) + stepTasksCode + seeder.substring(idx);
  fs.writeFileSync(seederPath, seeder, 'utf8');
  console.log('✅ Injected BƯỚC 2c: TASKS sync successfully into SeederData.gs');
} else {
  console.error('❌ Could not find target in SeederData.gs');
}

