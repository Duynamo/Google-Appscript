// ============================================================
//  File: TaxonomyAPI.gs v1.0
//  Quản trị Danh mục Tiêu chuẩn (Category, Phase, Discipline, Project Codes)
// ============================================================

const DEFAULT_TAXONOMY_LIST = [
  // CATEGORIES
  { id:"CAT_GE", type:"CATEGORY", code:"GE", name:"General", desc:"Bao gồm tất cả các đầu việc chung, quản lý, điều phối", extra1:"#64748b", extra2:"全般・一般業務", status:"Active" },
  { id:"CAT_DE", type:"CATEGORY", code:"DE", name:"Develop", desc:"Bao gồm các hạng mục phát triển công cụ, tool, script", extra1:"#8b5cf6", extra2:"開発・自動化", status:"Active" },
  { id:"CAT_PC", type:"CATEGORY", code:"PC", name:"Point Cloud", desc:"Bao gồm tất cả các hạng mục xử lý Point cloud", extra1:"#06b6d4", extra2:"点群処理", status:"Active" },
  { id:"CAT_M3", type:"CATEGORY", code:"M3", name:"3D Modeling", desc:"Bao gồm tất cả các hạng mục dựng mô hình 3D BIM", extra1:"#4f6ef7", extra2:"3Dモデリング", status:"Active" },
  { id:"CAT_RP", type:"CATEGORY", code:"RP", name:"Report", desc:"Bao gồm tất cả các hạng mục tạo báo cáo, hồ sơ nghiệm thu", extra1:"#f59e0b", extra2:"報告書作成", status:"Active" },
  { id:"CAT_MTG", type:"CATEGORY", code:"MTG", name:"Meeting", desc:"Bao gồm tất cả các hạng mục họp hành, trao đổi kỹ thuật", extra1:"#ec4899", extra2:"会議・打合せ", status:"Active" },

  // PHASES
  { id:"PH_BD", type:"PHASE", code:"BD", name:"Basic Design", desc:"Thiết kế cơ sở", extra1:"", extra2:"基本設計", status:"Active" },
  { id:"PH_DD", type:"PHASE", code:"DD", name:"Detail Design", desc:"Thiết kế chi tiết", extra1:"", extra2:"詳細設計", status:"Active" },
  { id:"PH_IS", type:"PHASE", code:"IS", name:"Inspection", desc:"Nghiệm thu, kiểm tra chất lượng", extra1:"", extra2:"検査・検収", status:"Active" },

  // DISCIPLINES (Chi tiết công việc)
  { id:"DISC_AR", type:"DISCIPLINE", code:"AR", name:"Dựng hình kiến trúc", desc:"Dựng hình kiến trúc (tường, sàn, mái, cửa, bố cục)", extra1:"#4f6ef7", extra2:"建築モデリング", status:"Active" },
  { id:"DISC_STR", type:"DISCIPLINE", code:"STR", name:"Dựng hình kết cấu", desc:"Dựng hình kết cấu (móng, cột, dầm, sàn kết cấu, thép)", extra1:"#06b6d4", extra2:"構造モデリング", status:"Active" },
  { id:"DISC_MP", type:"DISCIPLINE", code:"MP", name:"Dựng hình thiết bị", desc:"Dựng hình thiết bị, cơ khí, bồn bể, đường ống công nghệ", extra1:"#8b5cf6", extra2:"設備・配管モデリング", status:"Active" },
  { id:"DISC_ELE", type:"DISCIPLINE", code:"ELE", name:"Dựng hình hệ điện", desc:"Dựng hình hệ điện (thang máng cáp, tủ điện, chiếu sáng)", extra1:"#f59e0b", extra2:"電気設備モデリング", status:"Active" },
  { id:"DISC_PCP", type:"DISCIPLINE", code:"PCP", name:"Point cloud processing", desc:"Point cloud processing: xử lý point cloud", extra1:"#10b981", extra2:"点群データ処理", status:"Active" },
  { id:"DISC_PCL", type:"DISCIPLINE", code:"PCL", name:"Point cloud layering", desc:"Point cloud layering: chia layer point cloud", extra1:"#0284c7", extra2:"点群レイヤー分け", status:"Active" },

  // PROJECT CODES (Mã dự án)
  { id:"PJC_HAG01", type:"PROJECT_CODE", code:"HAG01", name:"2026_HAG01", desc:"花見川終末処理場", extra1:"2026", extra2:"花見川終末処理場", status:"Active" },
  { id:"PJC_JJK01", type:"PROJECT_CODE", code:"JJK01", name:"2026_JJK01", desc:"十字会", extra1:"2026", extra2:"十字会", status:"Active" },

  // EMPLOYEES (Nhân sự tiêu chuẩn & Phân quyền)
  { id:"EMP_NV001", type:"EMPLOYEE", code:"NV001", name:"Vũ Đình Duy (Admin)", desc:"Quản trị viên / Leader", extra1:Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || "admin@example.com", extra2:"", extra3:"Admin", status:"Active" },
  { id:"EMP_NV002", type:"EMPLOYEE", code:"NV002", name:"Nguyễn Văn Modeler", desc:"Senior BIM Modeler", extra1:"modeler@example.com", extra2:"", extra3:"Cấp 2", status:"Active" }
];

function initTaxonomySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    sh.appendRow(["ID", "Type", "Code", "Name", "Description", "Extra1", "Extra2", "Status", "CreatedAt", "Extra3"]);
    sh.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#6366f1").setFontColor("white");
    
    // Nạp dữ liệu mẫu ban đầu
    const now = new Date();
    DEFAULT_TAXONOMY_LIST.forEach(item => {
      sh.appendRow([item.id, item.type, item.code, item.name, item.desc, item.extra1, item.extra2, item.status, now, item.extra3 || ""]);
    });
    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
  } else {
    // Đảm bảo có đủ 10 cột
    const lastCol = sh.getLastColumn();
    if (lastCol < 10) {
      sh.getRange(1, 10).setValue("Extra3").setFontWeight("bold").setBackground("#6366f1").setFontColor("white");
    }
  }
}

function getTaxonomyDataInternal() {
  initTaxonomySheet();
  const rows = getSheetData(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
  const categories = [];
  const phases = [];
  const disciplines = [];
  const projectCodes = [];
  const employees = [];

  rows.forEach(r => {
    if (!r[0]) return;
    const item = {
      id: String(r[0]),
      type: String(r[1] || "").toUpperCase(),
      code: String(r[2] || "").toUpperCase().trim(),
      name: String(r[3] || "").trim(),
      desc: String(r[4] || "").trim(),
      extra1: String(r[5] || "").trim(),
      extra2: String(r[6] || "").trim(),
      status: String(r[7] || "Active").trim(),
      extra3: String(r[9] || "Cấp 2").trim()
    };
    if (item.type === "CATEGORY") categories.push(item);
    else if (item.type === "PHASE") phases.push(item);
    else if (item.type === "DISCIPLINE") disciplines.push(item);
    else if (item.type === "PROJECT_CODE") projectCodes.push(item);
    else if (item.type === "EMPLOYEE") employees.push(item);
  });

  return { categories, phases, disciplines, projectCodes, employees };
}

function getTaxonomyData() {
  try {
    const user = getCurrentUser();
    if (!user || !user.registered) return { success: false, error: "Chưa đăng nhập" };
    const data = getTaxonomyDataInternal();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function saveTaxonomyItem(payload) {
  try {
    const user = getCurrentUser();
    if (!user || !hasPermission(user.role, "manage_tasks")) {
      return { success: false, error: "Không có quyền quản lý danh mục" };
    }
    if (!payload.type || !payload.code || !payload.name) {
      return { success: false, error: "Thiếu thông tin bắt buộc (Loại, Mã, Tên)" };
    }

    initTaxonomySheet();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    const data = sh.getDataRange().getValues();
    const code = String(payload.code).toUpperCase().trim();
    const type = String(payload.type).toUpperCase().trim();
    const extra3 = String(payload.extra3 || (type === "EMPLOYEE" ? "Cấp 2" : "")).trim();

    // Check duplicate code within the same type if new item
    if (!payload.id) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]).toUpperCase() === type && String(data[i][2]).toUpperCase() === code) {
          return { success: false, error: `Mã [${code}] đã tồn tại trong nhóm ${type}` };
        }
      }
    }

    // Tự động khởi tạo Google Sheet nếu là EMPLOYEE mà link (extra2) để trống
    if (type === "EMPLOYEE" && !payload.extra2) {
      try {
        const createRes = createNewStaffSpreadsheet(code, payload.name, payload.extra1);
        if (createRes && createRes.success && createRes.sheetUrl) {
          payload.extra2 = createRes.sheetUrl;
        }
      } catch(errCreate) {
        console.warn("Auto create sheet for employee failed:", errCreate);
      }
    }

    const now = new Date();
    if (payload.id) {
      // Update existing
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          sh.getRange(i + 1, 2, 1, 7).setValues([[
            type, code, payload.name, payload.desc || "", payload.extra1 || "", payload.extra2 || "", payload.status || "Active"
          ]]);
          sh.getRange(i + 1, 10).setValue(extra3);
          SpreadsheetApp.flush();
          invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);

          // Đồng bộ với USERS sheet nếu là EMPLOYEE
          if (type === "EMPLOYEE" && payload.extra1) {
            const isEmpL1 = ["cấp 1", "admin", "level1", "1"].includes(extra3.toLowerCase());
            syncEmployeeToUsersSheet({
              id: payload.code,
              email: payload.extra1,
              name: payload.name,
              role: isEmpL1 ? "Admin" : "Level2",
              status: payload.status || "Active",
              rank: payload.desc || ""
            });
          }

          writeLog("UPDATE_TAXONOMY", `Cập nhật ${type} [${code}]: ${payload.name}`);
          return { success: true, item: Object.assign({}, payload, { extra3 }) };
        }
      }
    }

    // Insert new item
    const newId = (type.slice(0, 3) + "_" + generateId()).toUpperCase();
    sh.appendRow([
      newId, type, code, payload.name, payload.desc || "", payload.extra1 || "", payload.extra2 || "", payload.status || "Active", now, extra3
    ]);
    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);

    // Đồng bộ với USERS sheet nếu là EMPLOYEE
    if (type === "EMPLOYEE" && payload.extra1) {
      const isEmpL1 = ["cấp 1", "admin", "level1", "1"].includes(extra3.toLowerCase());
      syncEmployeeToUsersSheet({
        id: code,
        email: payload.extra1,
        name: payload.name,
        role: isEmpL1 ? "Admin" : "Level2",
        status: payload.status || "Active",
        rank: payload.desc || ""
      });
    }

    writeLog("ADD_TAXONOMY", `Thêm mới ${type} [${code}]: ${payload.name}`);
    return { success: true, item: Object.assign({}, payload, { id: newId, extra3 }) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** Đồng bộ thông tin EMPLOYEE từ Taxonomy sang USERS sheet để tương thích ngược */
function syncEmployeeToUsersSheet(emp) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let shUsers = ss.getSheetByName(CONFIG.SHEET_USERS);
    if (!shUsers) return;
    const rows = shUsers.getDataRange().getValues();
    const emailTarget = String(emp.email).toLowerCase().trim();
    let foundIndex = -1;
    let existingRole = "";
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][1]).toLowerCase().trim() === emailTarget) {
        foundIndex = i + 1;
        existingRole = String(rows[i][3] || "").trim();
        break;
      }
    }

    let roleToSet = emp.role;
    // BẢO VỆ ADMIN: Nếu tài khoản đang là Admin hoặc Manager, tuyệt đối không bị hạ cấp
    if ((existingRole === "Admin" || existingRole === "Manager") && emp.role === "Level2") {
      roleToSet = existingRole;
    }

    if (foundIndex !== -1) {
      shUsers.getRange(foundIndex, 3).setValue(emp.name);
      shUsers.getRange(foundIndex, 4).setValue(roleToSet);
      shUsers.getRange(foundIndex, 5).setValue(emp.status);
      shUsers.getRange(foundIndex, 7).setValue(emp.rank || "");
    } else {
      shUsers.appendRow([emp.id, emp.email, emp.name, roleToSet, emp.status, new Date(), emp.rank || ""]);
    }
    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_USERS]);
  } catch(e) {
    console.warn("syncEmployeeToUsersSheet warning:", e);
  }
}

function deleteTaxonomyItem(id) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== "Admin") {
      return { success: false, error: "Chỉ Admin mới có quyền xóa danh mục tiêu chuẩn" };
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    if (!sh) return { success: false, error: "Sheet không tồn tại" };
    const data = sh.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        const itemCode = data[i][2];
        const itemType = data[i][1];
        sh.deleteRow(i + 1);
        SpreadsheetApp.flush();
        invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
        writeLog("DELETE_TAXONOMY", `Xóa ${itemType} [${itemCode}]`);
        return { success: true };
      }
    }
    return { success: false, error: "Không tìm thấy mục cần xóa" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function loadDefaultTaxonomy() {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== "Admin") {
      return { success: false, error: "Chỉ Admin mới có quyền khôi phục danh mục mẫu" };
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    if (sh) {
      ss.deleteSheet(sh);
    }
    initTaxonomySheet();
    writeLog("RESET_TAXONOMY", "Khôi phục danh mục mẫu tiêu chuẩn từ hệ thống");
    return { success: true, data: getTaxonomyDataInternal() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function batchUpdateLegacyTasks(taskUpdates) {
  try {
    const user = getCurrentUser();
    if (!user || !hasPermission(user.role, "manage_tasks")) {
      return { success: false, error: "Không có quyền cập nhật nhiệm vụ" };
    }
    if (!Array.isArray(taskUpdates) || !taskUpdates.length) {
      return { success: false, error: "Danh sách cập nhật rỗng" };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(CONFIG.SHEET_TASKS);
    if (!sh) return { success: false, error: "Không tìm thấy sheet TASKS" };
    const data = sh.getDataRange().getValues();
    let updatedCount = 0;

    taskUpdates.forEach(u => {
      if (!u.id || !u.newName) return;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(u.id)) {
          sh.getRange(i + 1, 4).setValue(u.newName); // Column 4 = Tên công việc
          updatedCount++;
          break;
        }
      }
    });

    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_TASKS]);
    writeLog("BATCH_UPDATE_TASKS", `Chuẩn hóa tiền tố cho ${updatedCount} nhiệm vụ cũ`);
    return { success: true, updatedCount };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
