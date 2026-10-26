// ============================================================
//  File: TaxonomyAPI.gs v2.0 (CHUẨN HÓA ĐA NGÔN NGỮ VI - EN - JP)
//  Quản trị Danh mục Tiêu chuẩn (Category, Phase, Discipline, Project Codes)
// ============================================================

const DEFAULT_TAXONOMY_LIST = [
  // ── 1. NHÓM CATEGORY (8 NHÓM LỚN) ──
  { id:"CAT_PC",  type:"CATEGORY", code:"PC",  name_vi:"Xử lý Point Cloud & Panorama", name_en:"Point Cloud & Panorama", name_jp:"点群 & パノラマ", desc:"Bao gồm xử lý dữ liệu đám mây điểm và ảnh panorama", color:"#06b6d4", sortOrder:1, status:"Active" },
  { id:"CAT_MD",  type:"CATEGORY", code:"MD",  name_vi:"Dựng mô hình 3D BIM",          name_en:"3D BIM Modeling",        name_jp:"3Dモデリング",       desc:"Bao gồm dựng hình kết cấu, thiết bị, đường ống",         color:"#4f6ef7", sortOrder:2, status:"Active" },
  { id:"CAT_SD",  type:"CATEGORY", code:"SD",  name_vi:"Bản vẽ thi công (Shop Drawing)", name_en:"Shop Drawing",          name_jp:"施工図作成",         desc:"Triển khai các bản vẽ thi công 2D chi tiết",             color:"#10b981", sortOrder:3, status:"Active" },
  { id:"CAT_MC",  type:"CATEGORY", code:"MC",  name_vi:"Kiểm tra va chạm & Báo cáo",   name_en:"Model Check & Report",   name_jp:"干渉・報告書",       desc:"Báo cáo sai khác, check va chạm, xuất video",            color:"#f59e0b", sortOrder:4, status:"Active" },
  { id:"CAT_MTG", type:"CATEGORY", code:"MTG", name_vi:"Họp hành & Trao đổi",          name_en:"Meetings",               name_jp:"会議・打合せ",       desc:"Giao ban, họp khách hàng, họp nội bộ",                  color:"#ec4899", sortOrder:5, status:"Active" },
  { id:"CAT_PM",  type:"CATEGORY", code:"PM",  name_vi:"Quản lý dự án",               name_en:"Project Management",     name_jp:"プロジェクト管理",   desc:"Nghiên cứu tài liệu, quản lý tiến độ, lịch trình",      color:"#8b5cf6", sortOrder:6, status:"Active" },
  { id:"CAT_MJ",  type:"CATEGORY", code:"MJ",  name_vi:"Báo cáo & Cải tiến nội bộ",    name_en:"General & Reporting",    name_jp:"業務報告・改善",     desc:"Báo cáo định kỳ và cải tiến quy trình nghiệp vụ",        color:"#64748b", sortOrder:7, status:"Active" },
  { id:"CAT_RD",  type:"CATEGORY", code:"RD",  name_vi:"Nghiên cứu, Tool & Đào tạo",   name_en:"R&D & Skill Learning",   name_jp:"開発・スキルアップ", desc:"Phát triển script, Dynamo, tự học kỹ năng mới",        color:"#3b82f6", sortOrder:8, status:"Active" },

  // ── 2. NHÓM PHASE (3 GIAI ĐOẠN DỰ ÁN) ──
  { id:"PH_BD", type:"PHASE", code:"BD", name_vi:"Thiết kế cơ sở",        name_en:"Basic Design",   name_jp:"基本設計",   desc:"Thiết kế cơ sở",                 color:"#3b82f6", sortOrder:1, status:"Active" },
  { id:"PH_DD", type:"PHASE", code:"DD", name_vi:"Thiết kế chi tiết",     name_en:"Detail Design",  name_jp:"詳細設計",   desc:"Thiết kế chi tiết",               color:"#10b981", sortOrder:2, status:"Active" },
  { id:"PH_IS", type:"PHASE", code:"IS", name_vi:"Nghiệm thu & Kiểm tra", name_en:"Inspection",     name_jp:"検査・検収", desc:"Nghiệm thu, kiểm tra chất lượng",  color:"#f59e0b", sortOrder:3, status:"Active" },

  // ── 3. NHÓM 46 TÁC NGHIỆP CHI TIẾT (DISCIPLINES / WORK CODES) ──
  // [PC & PN - POINT CLOUD & PANORAMA]
  { id:"DISC_PN01", type:"DISCIPLINE", code:"PN01", name_vi:"Tạo ảnh Panorama Memo",           name_en:"Panorama Memo Creation",         name_jp:"【パノラマメモ】作成", desc:"Chuyển đổi bản vẽ sang ảnh, gắn liên kết", color:"#06b6d4", sortOrder:1, status:"Active" },
  { id:"DISC_PN10", type:"DISCIPLINE", code:"PN10", name_vi:"Kiểm tra Panorama Memo",          name_en:"Panorama Memo Check",            name_jp:"【パノラマメモ】チェック", desc:"Check góc nhìn, hướng xoay, liên kết", color:"#06b6d4", sortOrder:2, status:"Active" },
  { id:"DISC_PN11", type:"DISCIPLINE", code:"PN11", name_vi:"Chỉnh sửa Panorama Memo",         name_en:"Panorama Memo Revision",         name_jp:"【パノラマメモ】修正", desc:"Sửa vị trí ảnh, hướng nghiêng, link", color:"#06b6d4", sortOrder:3, status:"Active" },
  { id:"DISC_PC01", type:"DISCIPLINE", code:"PC01", name_vi:"Xử lý dữ liệu Point Cloud",       name_en:"Point Cloud Processing",         name_jp:"【点群データ】処理", desc:"Đăng ký trạm quét, khử nhiễu, Cyclone", color:"#06b6d4", sortOrder:4, status:"Active" },
  { id:"DISC_PC02", type:"DISCIPLINE", code:"PC02", name_vi:"Phân lớp Point Cloud",            name_en:"Point Cloud Layering",           name_jp:"【点群データ】レイヤー分け", desc:"Chia layer theo cao độ, phòng, hệ thống", color:"#06b6d4", sortOrder:5, status:"Active" },
  { id:"DISC_PC10", type:"DISCIPLINE", code:"PC10", name_vi:"Kiểm tra Point Cloud",            name_en:"Point Cloud Check",              name_jp:"【点群データ】チェック", desc:"Kiểm tra dung sai, độ khớp nối trạm", color:"#06b6d4", sortOrder:6, status:"Active" },
  { id:"DISC_PC11", type:"DISCIPLINE", code:"PC11", name_vi:"Sửa dữ liệu Point Cloud",         name_en:"Point Cloud Revision",           name_jp:"【点群データ】修正", desc:"Bổ sung điểm thiếu, khử lệch tọa độ", color:"#06b6d4", sortOrder:7, status:"Active" },
  { id:"DISC_PC12", type:"DISCIPLINE", code:"PC12", name_vi:"Sửa phân lớp Point Cloud",        name_en:"Point Cloud Layering Revision",  name_jp:"【点群データ】レイヤー分け修正", desc:"Điều chỉnh lại layer phân chia", color:"#06b6d4", sortOrder:8, status:"Active" },

  // [MD - 3D BIM MODELING]
  { id:"DISC_MD01", type:"DISCIPLINE", code:"MD01", name_vi:"Dựng hình Kết cấu / Thân",        name_en:"Structure Modeling",             name_jp:"【モデル】躯体作成", desc:"Móng, cột, dầm, sàn bê tông, tường", color:"#4f6ef7", sortOrder:9, status:"Active" },
  { id:"DISC_MD02", type:"DISCIPLINE", code:"MD02", name_vi:"Dựng hình Máy móc / Thiết bị",    name_en:"Equipment Modeling",             name_jp:"【モデル】機械作成", desc:"Bơm, máy thổi khí, bồn bể, van cổng", color:"#4f6ef7", sortOrder:10, status:"Active" },
  { id:"DISC_MD03", type:"DISCIPLINE", code:"MD03", name_vi:"Dựng hình Đường ống",             name_en:"Piping Modeling",                name_jp:"【モデル】配管作成", desc:"Ống công nghệ, ống dẫn khí, phụ kiện", color:"#4f6ef7", sortOrder:11, status:"Active" },
  { id:"DISC_MD04", type:"DISCIPLINE", code:"MD04", name_vi:"Hợp nhất mô hình tổng thể",       name_en:"Model Federation",               name_jp:"【モデル】合成", desc:"Ghép kết cấu, thiết bị, ống thành tổng thể", color:"#4f6ef7", sortOrder:12, status:"Active" },
  { id:"DISC_MD05", type:"DISCIPLINE", code:"MD05", name_vi:"Dựng hình hạng mục khác",         name_en:"Other Modeling",                 name_jp:"【モデル】作成（その他）", desc:"Hạng mục phụ trợ, rãnh mương cáp", color:"#4f6ef7", sortOrder:13, status:"Active" },
  { id:"DISC_MD10", type:"DISCIPLINE", code:"MD10", name_vi:"Kiểm tra mô hình BIM",            name_en:"Model Quality Check",            name_jp:"【モデル】チェック", desc:"Kiểm tra quy chuẩn dựng hình, level, grid", color:"#4f6ef7", sortOrder:14, status:"Active" },
  { id:"DISC_MD11", type:"DISCIPLINE", code:"MD11", name_vi:"Sửa mô hình Kết cấu",             name_en:"Structure Revision",             name_jp:"【モデル】躯体修正", desc:"Sửa lỗi va chạm, sai kích thước bê tông", color:"#4f6ef7", sortOrder:15, status:"Active" },
  { id:"DISC_MD12", type:"DISCIPLINE", code:"MD12", name_vi:"Sửa mô hình Thiết bị",            name_en:"Equipment Revision",             name_jp:"【モデル】機械修正", desc:"Cập nhật catalog, dịch chuyển vị trí bệ", color:"#4f6ef7", sortOrder:16, status:"Active" },
  { id:"DISC_MD13", type:"DISCIPLINE", code:"MD13", name_vi:"Sửa mô hình Đường ống",           name_en:"Piping Revision",                name_jp:"【モデル】配管修正", desc:"Né va chạm ống, sửa độ dốc, cao độ", color:"#4f6ef7", sortOrder:17, status:"Active" },
  { id:"DISC_MD14", type:"DISCIPLINE", code:"MD14", name_vi:"Sửa hợp nhất mô hình",            name_en:"Federation Revision",            name_jp:"【モデル】合成修正", desc:"Khắc phục xung đột tổng thể", color:"#4f6ef7", sortOrder:18, status:"Active" },
  { id:"DISC_MD15", type:"DISCIPLINE", code:"MD15", name_vi:"Sửa mô hình khác",                name_en:"Other Model Revision",           name_jp:"【モデル】修正（その他）", desc:"Sửa các chi tiết nhỏ phát sinh", color:"#4f6ef7", sortOrder:19, status:"Active" },
  { id:"DISC_MD16", type:"DISCIPLINE", code:"MD16", name_vi:"Nhập thuộc tính thông tin BIM",    name_en:"BIM Data Input",                 name_jp:"【モデル】情報入力", desc:"Nhập mã thiết bị, lưu lượng, thông số", color:"#4f6ef7", sortOrder:20, status:"Active" },

  // [SD - SHOP DRAWING]
  { id:"DISC_SD01", type:"DISCIPLINE", code:"SD01", name_vi:"Tổng hợp đóng tập bản vẽ",        name_en:"Drawing Compilation",            name_jp:"【施工図】図面取りまとめ", desc:"Thiết lập cây bản vẽ, khung tên, danh mục", color:"#10b981", sortOrder:21, status:"Active" },
  { id:"DISC_SD02", type:"DISCIPLINE", code:"SD02", name_vi:"Chuẩn bị bản vẽ nền Underlay",    name_en:"Background Drawing Prep",        name_jp:"【施工図】下図準備", desc:"Dọn dẹp layer nền kiến trúc/kết cấu", color:"#10b981", sortOrder:22, status:"Active" },
  { id:"DISC_SD03", type:"DISCIPLINE", code:"SD03", name_vi:"Triển khai bản vẽ mặt bằng & mặt cắt", name_en:"Plan & Section Drawing Creation", name_jp:"【施工図】平断面図作成", desc:"Bản vẽ mặt bằng và mặt cắt kết hợp", color:"#10b981", sortOrder:23, status:"Active" },
  { id:"DISC_SD04", type:"DISCIPLINE", code:"SD04", name_vi:"Bản vẽ sơ đồ không gian ống",     name_en:"Piping Isometric Drawing",       name_jp:"【施工図】配管スケルトン図作成", desc:"Sơ đồ trích xuất isometric 3D ống", color:"#10b981", sortOrder:24, status:"Active" },
  { id:"DISC_SD05", type:"DISCIPLINE", code:"SD05", name_vi:"Triển khai bản vẽ móng bệ",      name_en:"Foundation Drawing",             name_jp:"【施工図】基礎図作成", desc:"Chi tiết bệ bơm, móng máy móc", color:"#10b981", sortOrder:25, status:"Active" },
  { id:"DISC_SD06", type:"DISCIPLINE", code:"SD06", name_vi:"Bản vẽ gia công kết cấu thép",    name_en:"Steel Fabrication Drawing",      name_jp:"【施工図】鋼製加工品図作成", desc:"Giá đỡ ống, thang máng, sàn thao tác", color:"#10b981", sortOrder:26, status:"Active" },
  { id:"DISC_SD07", type:"DISCIPLINE", code:"SD07", name_vi:"Bản vẽ phối hợp đa bộ môn",      name_en:"Combined Services Drawing",      name_jp:"【施工図】複合工図作成", desc:"Bản vẽ tổng hợp mặt cắt kết hợp MEP", color:"#10b981", sortOrder:27, status:"Active" },
  { id:"DISC_SD08", type:"DISCIPLINE", code:"SD08", name_vi:"Bản vẽ thi công khác",            name_en:"Other Shop Drawing",             name_jp:"【施工図】その他", desc:"Chi tiết lắp đặt đặc thù", color:"#10b981", sortOrder:28, status:"Active" },

  // [MC - REPORT & CLASH]
  { id:"DISC_MC01", type:"DISCIPLINE", code:"MC01", name_vi:"Check va chạm vs Bản vẽ thiết kế",name_en:"Clash Check vs Tender Drawing",  name_jp:"【レポート・発注図】干渉・相違点チェック", desc:"Báo cáo lỗi sai lệch thiết kế ban đầu", color:"#f59e0b", sortOrder:29, status:"Active" },
  { id:"DISC_MC02", type:"DISCIPLINE", code:"MC02", name_vi:"Check va chạm vs Bản vẽ thi công",name_en:"Clash Check vs Shop Drawing",    name_jp:"【レポート・施工図】干渉・相違点チェック", desc:"Báo cáo xung đột ống và kết cấu thực tế", color:"#f59e0b", sortOrder:30, status:"Active" },
  { id:"DISC_MC03", type:"DISCIPLINE", code:"MC03", name_vi:"Đề xuất giải pháp xử lý va chạm", name_en:"Clash Resolution Proposal",     name_jp:"【レポート】干渉・相違点の改善提案", desc:"Đề xuất tuyến ống đi vòng, khoét lỗ", color:"#f59e0b", sortOrder:31, status:"Active" },
  { id:"DISC_MC04", type:"DISCIPLINE", code:"MC04", name_vi:"Nghiên cứu biện pháp vận chuyển", name_en:"Equipment Route Study",          name_jp:"【レポート】機器搬出入検討", desc:"Kiểm tra kích thước cửa, đường đưa máy vào", color:"#f59e0b", sortOrder:32, status:"Active" },
  { id:"DISC_MC05", type:"DISCIPLINE", code:"MC05", name_vi:"Kiểm tra xác nhận kích thước",    name_en:"Dimension Verification",         name_jp:"【レポート】寸法確認", desc:"Đo đạc clearance, khoảng hở bảo trì", color:"#f59e0b", sortOrder:33, status:"Active" },
  { id:"DISC_MC06", type:"DISCIPLINE", code:"MC06", name_vi:"Báo cáo kỹ thuật khác",           name_en:"Other Technical Report",         name_jp:"【レポート】その他", desc:"Báo cáo kiểm định đặc biệt", color:"#f59e0b", sortOrder:34, status:"Active" },
  { id:"DISC_MC07", type:"DISCIPLINE", code:"MC07", name_vi:"Tạo video mô phỏng Walkthrough",  name_en:"3D Walkthrough Animation",       name_jp:"【レポート】ウォークスルー動画作成", desc:"Xuất video diễn họa 3D cho chủ đầu tư", color:"#f59e0b", sortOrder:35, status:"Active" },

  // [MT - MEETING]
  { id:"DISC_MT00", type:"DISCIPLINE", code:"MT00", name_vi:"Họp giao ban đầu/cuối ngày",      name_en:"Daily Standup Meeting",          name_jp:"【MTG】朝礼・終礼", desc:"Giao ban nhanh 15 phút đầu/cuối ngày", color:"#ec4899", sortOrder:36, status:"Active" },
  { id:"DISC_MT01", type:"DISCIPLINE", code:"MT01", name_vi:"Họp đối tác / Khách hàng",        name_en:"External Meeting",               name_jp:"【MTG】社外", desc:"Họp kỹ thuật với nhà thầu/đối tác Nhật", color:"#ec4899", sortOrder:37, status:"Active" },
  { id:"DISC_MT02", type:"DISCIPLINE", code:"MT02", name_vi:"Họp nội bộ team",                 name_en:"Internal Meeting",               name_jp:"【MTG】社内", desc:"Họp phân chia công việc nội bộ", color:"#ec4899", sortOrder:38, status:"Active" },
  { id:"DISC_MT03", type:"DISCIPLINE", code:"MT03", name_vi:"Họp điều phối quản trị dự án",     name_en:"Management Meeting",             name_jp:"【MTG】業務管理", desc:"Họp tiến độ, giải quyết khúc mắc dự án", color:"#ec4899", sortOrder:39, status:"Active" },
  { id:"DISC_MT04", type:"DISCIPLINE", code:"MT04", name_vi:"Cuộc họp khác",                   name_en:"Other Meeting",                  name_jp:"【MTG】その他", desc:"Trao đổi phát sinh khác", color:"#ec4899", sortOrder:40, status:"Active" },

  // [PM - PROJECT MANAGEMENT]
  { id:"DISC_PM01", type:"DISCIPLINE", code:"PM01", name_vi:"Nghiên cứu tài liệu hồ sơ dự án", name_en:"Project Document Review",        name_jp:"プロジェクト資料確認", desc:"Đọc đề bài, tiêu chuẩn kỹ thuật, mark-up", color:"#8b5cf6", sortOrder:41, status:"Active" },
  { id:"DISC_PM02", type:"DISCIPLINE", code:"PM02", name_vi:"Quản lý tiến độ & Điều phối",     name_en:"Project Administration",         name_jp:"プロジェクト管理関連", desc:"Gửi mail, cập nhật lịch trình, Brabio, báo cáo", color:"#8b5cf6", sortOrder:42, status:"Active" },

  // [MJ - GENERAL REPORTING & KAIZEN]
  { id:"DISC_MJ01", type:"DISCIPLINE", code:"MJ01", name_vi:"Lập báo cáo công việc (Ngày/Tuần)",name_en:"Work Progress Report",          name_jp:"業務報告", desc:"Viết báo cáo tiến độ định kỳ", color:"#64748b", sortOrder:43, status:"Active" },
  { id:"DISC_MJ02", type:"DISCIPLINE", code:"MJ02", name_vi:"Cải tiến quy trình làm việc",     name_en:"Workflow Improvement",           name_jp:"業務改善", desc:"Chuẩn hóa quy trình, tối ưu thao tác", color:"#64748b", sortOrder:44, status:"Active" },

  // [RD - R&D & TRAINING]
  { id:"DISC_DE01", type:"DISCIPLINE", code:"DE01", name_vi:"Phát triển Tool / Script / API",  name_en:"Automation & Tool Dev",         name_jp:"開発関連", desc:"Lập trình Dynamo, Python, Revit API", color:"#3b82f6", sortOrder:45, status:"Active" },
  { id:"DISC_LN01", type:"DISCIPLINE", code:"LN01", name_vi:"Đào tạo & Nâng cao kỹ năng",      name_en:"Training & Skill Learning",      name_jp:"勉強・スキルアップ", desc:"Tự học phần mềm mới, training nội bộ", color:"#3b82f6", sortOrder:46, status:"Active" },

  // ── 4. PROJECT CODES (MÃ DỰ ÁN MẪU CHUẨN HOÁ) ──
  { id:"PJC_HAG01", type:"PROJECT_CODE", code:"HAG01", name_vi:"Trạm xử lý nước thải Hanamigawa", name_en:"2026_01_HAG01_Hanamigawa", name_jp:"花見川終末処理場", name:"2026_01_HAG01_花見川終末処理場", desc:"花見川終末処理場", color:"#6366f1", sortOrder:1, extra1:"2026", extra2:"花見川終末処理場", extra3:"01", status:"Active" },
  { id:"PJC_JJK01", type:"PROJECT_CODE", code:"JJK01", name_vi:"Công trình mới Làng xưởng Jujikai", name_en:"2026_01_JJK01_Jujikai", name_jp:"十字会工房ヴィレッジ新築工事", name:"2026_01_JJK01_十字会工房ヴィレッジ新築工事", desc:"十字会工房ヴィレッジ新築工事", color:"#6366f1", sortOrder:2, extra1:"2026", extra2:"十字会", extra3:"01", status:"Active" }
];

const TAXONOMY_HEADERS = [
  "ID", "Type", "Code", "Name_VI", "Name_EN", "Name_JP", "Description", "Color_Hex", "Sort_Order", "Status", "UpdatedAt"
];

/**
 * Khởi tạo hoặc tự động nâng cấp bảng TAXONOMY sang chuẩn 11 cột đa ngôn ngữ
 */
function initTaxonomySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
  
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    sh.appendRow(TAXONOMY_HEADERS);
    sh.getRange(1, 1, 1, TAXONOMY_HEADERS.length).setFontWeight("bold").setBackground("#6366f1").setFontColor("white");

    const now = new Date();
    DEFAULT_TAXONOMY_LIST.forEach(item => {
      sh.appendRow([
        item.id,
        item.type,
        item.code,
        item.name_vi,
        item.name_en,
        item.name_jp || "",
        item.desc || "",
        item.color || "#4f6ef7",
        item.sortOrder || 1,
        item.status || "Active",
        now
      ]);
    });
    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
    return;
  }

  // Tự động kiểm tra và di chuyển nếu đang dùng cấu trúc cũ (Extra1, Extra2, Extra3)
  const lastCol = sh.getLastColumn();
  if (lastCol <= 10) {
    const firstRow = sh.getRange(1, 1, 1, Math.max(lastCol, 1)).getValues()[0];
    const headerStr = firstRow.map(h => String(h || "").trim()).join(",");
    if (headerStr.includes("Extra1") || !headerStr.includes("Name_VI")) {
      migrateTaxonomySheet();
    }
  }
}

/**
 * Tự động sao lưu và di chuyển an toàn bảng TAXONOMY cũ sang chuẩn 11 cột đa ngôn ngữ
 */
function migrateTaxonomySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
  if (!sh) return;

  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return;

  const header = data[0].map(h => String(h || "").trim());
  if (header.includes("Name_VI") && header.includes("Name_JP") && header.includes("Color_Hex")) {
    return; // Đã là chuẩn mới
  }

  // 1. Sao lưu bảng tính cũ
  const timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyyMMdd_HHmm");
  const backupName = `TAXONOMY_BACKUP_${timestamp}`;
  let shBackup = ss.getSheetByName(backupName);
  if (!shBackup) {
    shBackup = ss.insertSheet(backupName);
    sh.getDataRange().copyTo(shBackup.getRange(1, 1));
  }

  // 2. Chuyển đổi dữ liệu cũ
  const newRows = [];
  const employeesToSync = [];
  const sortCounter = { CATEGORY: 1, PHASE: 1, DISCIPLINE: 1, PROJECT_CODE: 1 };

  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[0]) continue;
    const id = String(r[0]).trim();
    const type = String(r[1] || "").toUpperCase().trim();
    const code = String(r[2] || "").toUpperCase().trim();
    const oldName = String(r[3] || "").trim();
    const oldDesc = String(r[4] || "").trim();
    const extra1 = String(r[5] || "").trim(); // color / email / year
    const extra2 = String(r[6] || "").trim(); // jp / sheetUrl / shortName
    const status = String(r[7] || "Active").trim();
    const extra3 = String(r[9] || "").trim(); // role / seq

    if (type === "EMPLOYEE") {
      employeesToSync.push({
        id: code,
        email: extra1,
        name: oldName,
        role: extra3 || "Member",
        status: status,
        rank: oldDesc,
        sheetUrl: extra2
      });
      continue;
    }

    let nameVI = oldName;
    let nameEN = oldName;
    let nameJP = extra2;
    let colorHex = (extra1 && extra1.startsWith("#")) ? extra1 : "#4f6ef7";
    let order = sortCounter[type] ? sortCounter[type]++ : 1;

    // Phân loại song ngữ thông minh cho các bản ghi cũ
    if (type === "CATEGORY") {
      nameEN = oldName;
      const catMap = {
        "GE": "Công việc chung", "DE": "Phát triển & Tool", "PC": "Xử lý Point Cloud",
        "M3": "Dựng hình 3D BIM", "RP": "Báo cáo & Nghiệm thu", "MTG": "Họp hành & Trao đổi"
      };
      if (catMap[code]) nameVI = catMap[code];
    } else if (type === "PHASE") {
      nameEN = oldName;
      if (oldDesc) nameVI = oldDesc;
      const phaseMap = { "BD": "Thiết kế cơ sở", "DD": "Thiết kế chi tiết", "IS": "Nghiệm thu & Kiểm tra" };
      if (phaseMap[code]) nameVI = phaseMap[code];
    } else if (type === "DISCIPLINE") {
      nameVI = oldName;
      const discEnMap = {
        "AR": "Architecture Modeling", "STR": "Structure Modeling", "MP": "Mechanical & Piping",
        "ELE": "Electrical Modeling", "PCP": "Point Cloud Processing", "PCL": "Point Cloud Layering",
        "UI": "UI Design", "UX": "UX Design", "GE": "Skill Learning"
      };
      if (discEnMap[code]) nameEN = discEnMap[code];
    } else if (type === "PROJECT_CODE") {
      nameVI = oldName;
      nameEN = oldName;
      if (extra3 && /^\d+$/.test(extra3)) order = parseInt(extra3, 10);
      if (extra1 && extra1.length === 4) colorHex = extra1;
    }

    newRows.push([
      id, type, code, nameVI, nameEN, nameJP, oldDesc, colorHex, order, status, new Date()
    ]);
  }

  // 3. Đồng bộ nhân sự sang bảng USERS
  if (employeesToSync.length > 0) {
    employeesToSync.forEach(emp => {
      syncEmployeeToUsersSheet(emp);
    });
  }

  // 4. Ghi đè cấu trúc 11 cột chuẩn
  sh.clear();
  sh.appendRow(TAXONOMY_HEADERS);
  sh.getRange(1, 1, 1, TAXONOMY_HEADERS.length).setFontWeight("bold").setBackground("#6366f1").setFontColor("white");

  if (newRows.length > 0) {
    sh.getRange(2, 1, newRows.length, TAXONOMY_HEADERS.length).setValues(newRows);
  }

  SpreadsheetApp.flush();
  invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY", CONFIG.SHEET_USERS]);
  writeLog("MIGRATE_TAXONOMY", `Tự động nâng cấp bảng TAXONOMY sang 11 cột đa ngôn ngữ (Bản sao lưu: ${backupName})`);
}

/**
 * Đọc dữ liệu Taxonomy nội bộ kết hợp song ngữ và tương thích ngược
 */
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
    const isNew = r.length >= 11;
    const id = String(r[0]);
    const type = String(r[1] || "").toUpperCase().trim();
    const code = String(r[2] || "").toUpperCase().trim();

    let nameVI = "";
    let nameEN = "";
    let nameJP = "";
    let desc = "";
    let color = "#4f6ef7";
    let sortOrder = 1;
    let status = "Active";
    let extra1 = "";
    let extra2 = "";
    let extra3 = "";

    if (isNew) {
      nameVI = String(r[3] || "").trim();
      nameEN = String(r[4] || "").trim();
      nameJP = String(r[5] || "").trim();
      desc = String(r[6] || "").trim();
      color = String(r[7] || "#4f6ef7").trim();
      sortOrder = Number(r[8]) || 1;
      status = String(r[9] || "Active").trim();

      // Legacy aliases để mọi tính năng cũ truy cập .extra1, .extra2, .name không bao giờ bị null
      extra1 = color;
      extra2 = nameJP;
      extra3 = String(sortOrder);
      if (type === "PROJECT_CODE") {
        extra1 = "2026";
        extra2 = nameJP || desc;
        extra3 = String(sortOrder).padStart(2, "0");
      }
    } else {
      nameVI = String(r[3] || "").trim();
      nameEN = String(r[3] || "").trim();
      desc = String(r[4] || "").trim();
      extra1 = String(r[5] || "").trim();
      extra2 = String(r[6] || "").trim();
      status = String(r[7] || "Active").trim();
      extra3 = String(r[9] || "").trim();
      nameJP = extra2;
      color = (extra1 && extra1.startsWith("#")) ? extra1 : "#4f6ef7";
    }

    // Tự động loại bỏ tiền tố mã bị lặp nếu có (VD: "PM01_..." hoặc "PM01 - ...")
    if (code) {
      const rx = new RegExp('^' + code + '[_\\-\\s:]+', 'i');
      if (nameJP) nameJP = nameJP.replace(rx, '').trim();
      if (nameVI) nameVI = nameVI.replace(rx, '').trim();
      if (nameEN) nameEN = nameEN.replace(rx, '').trim();
    }

    const item = {
      id: id,
      type: type,
      code: code,
      name_vi: nameVI,
      name_en: nameEN,
      name_jp: nameJP,
      name: nameVI || nameEN || code, // Fallback alias
      desc: desc,
      color: color,
      sortOrder: sortOrder,
      status: status,
      extra1: extra1,
      extra2: extra2,
      extra3: extra3
    };

    if (type === "CATEGORY") categories.push(item);
    else if (type === "PHASE") phases.push(item);
    else if (type === "DISCIPLINE") disciplines.push(item);
    else if (type === "PROJECT_CODE") projectCodes.push(item);
    else if (type === "EMPLOYEE") employees.push(item);
  });

  // TÍCH HỢP ĐỒNG BỘ TỪ BẢNG USERS VÀO EMPLOYEES
  // Đảm bảo TimesheetAPI và các chức năng phân quyền tìm thấy nhân viên không bao giờ bị lỗi
  try {
    const usersData = getSheetData(CONFIG.SHEET_USERS);
    const existingEmails = new Set(employees.map(e => String(e.extra1 || "").toLowerCase().trim()));

    usersData.forEach(u => {
      if (!u[0] || !u[1]) return;
      const email = String(u[1]).trim();
      if (existingEmails.has(email.toLowerCase())) return;

      const staffCode = String(u[0]).trim();
      const staffName = String(u[2] || "").trim();
      const staffRole = String(u[3] || "Member").trim();
      const staffStatus = String(u[4] || "Active").trim();
      const staffRank = String(u[6] || "").trim();
      const sheetUrl = String(u[7] || "").trim();

      employees.push({
        id: "EMP_" + staffCode,
        type: "EMPLOYEE",
        code: staffCode,
        name: staffName,
        name_vi: staffName,
        name_en: staffName,
        name_jp: "",
        desc: staffRank,
        color: "#6366f1",
        extra1: email,
        extra2: sheetUrl,
        extra3: staffRole,
        status: staffStatus,
        sortOrder: 99
      });
    });
  } catch(errUsers) {
    console.warn("Lỗi nạp users vào taxonomy employees:", errUsers);
  }

  // Sắp xếp theo sortOrder
  categories.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
  phases.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
  disciplines.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
  projectCodes.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));

  return {
    categories,
    phases,
    disciplines,
    projectCodes,
    employees,
    permissionMatrix: getPermissionMatrixInternal()
  };
}

/**
 * Lấy dữ liệu danh mục cho WebApp
 */
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

/**
 * Lưu hoặc cập nhật tiêu chuẩn (Hỗ trợ song ngữ và tương thích ngược hoàn hảo)
 */
function saveTaxonomyItem(payload) {
  try {
    const user = getCurrentUser();
    if (!user || !hasPermission(user.role, "manage_tasks")) {
      return { success: false, error: "Không có quyền quản lý danh mục" };
    }
    if (!payload.type || !payload.code || (!payload.name && !payload.name_vi && !payload.name_en)) {
      return { success: false, error: "Thiếu thông tin bắt buộc (Loại, Mã, Tên)" };
    }

    initTaxonomySheet();
    const type = String(payload.type).toUpperCase().trim();
    const code = String(payload.code).toUpperCase().trim();
    const status = String(payload.status || "Active").trim();

    const nameVI = String(payload.name_vi || payload.name || "").trim();
    const nameEN = String(payload.name_en || payload.name || nameVI).trim();
    const nameJP = String(payload.name_jp || payload.extra2 || "").trim();
    const desc = String(payload.desc || "").trim();
    const color = String(payload.color || payload.color_hex || payload.extra1 || "#4f6ef7").trim();
    const sortOrder = Number(payload.sortOrder || payload.order || 1);
    const extra3 = String(payload.extra3 || "").trim();

    // NẾU LÀ EMPLOYEE: Lưu thẳng vào bảng USERS tập trung
    if (type === "EMPLOYEE") {
      const email = String(payload.extra1 || payload.email || "").trim();
      let sheetUrl = String(payload.extra2 || payload.sheetUrl || "").trim();

      if (!sheetUrl) {
        try {
          const createRes = createNewStaffSpreadsheet(code, nameVI, email);
          if (createRes && createRes.success && createRes.sheetUrl) {
            sheetUrl = createRes.sheetUrl;
          }
        } catch(errCreate) {
          console.warn("Auto create sheet for employee failed:", errCreate);
        }
      }

      let targetRole = "Member";
      const ex3 = extra3.toLowerCase();
      if (["cấp 1", "admin", "level1", "1"].includes(ex3)) targetRole = "Admin";
      else if (["cấp 2", "leader", "level2", "2"].includes(ex3)) targetRole = "Leader";
      else if (["cấp 3", "pj_lead", "pj lead", "level3", "3", "manager"].includes(ex3)) targetRole = "PJ_Lead";
      else if (extra3) targetRole = extra3;

      syncEmployeeToUsersSheet({
        id: code,
        email: email,
        name: nameVI,
        role: targetRole,
        status: status,
        rank: desc,
        sheetUrl: sheetUrl
      });

      invalidateCache([CONFIG.SHEET_USERS, CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
      writeLog("SAVE_EMPLOYEE", `Lưu nhân sự [${code}]: ${nameVI} (${email})`);
      return {
        success: true,
        item: {
          id: payload.id || ("EMP_" + code),
          type: "EMPLOYEE",
          code: code,
          name: nameVI,
          name_vi: nameVI,
          name_en: nameEN,
          name_jp: nameJP,
          desc: desc,
          color: "#6366f1",
          extra1: email,
          extra2: sheetUrl,
          extra3: targetRole,
          status: status,
          sortOrder: sortOrder
        }
      };
    }

    // LƯU CÁC DANH MỤC TIÊU CHUẨN (CATEGORY, PHASE, DISCIPLINE, PROJECT_CODE)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    const data = sh.getDataRange().getValues();
    const isNew = sh.getLastColumn() >= 11;
    const now = new Date();

    // Kiểm tra trùng mã code khi thêm mới
    if (!payload.id) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]).toUpperCase() === type && String(data[i][2]).toUpperCase() === code) {
          return { success: false, error: `Mã [${code}] đã tồn tại trong nhóm ${type}` };
        }
      }
    }

    // Cập nhật mục đã tồn tại
    if (payload.id) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          if (isNew) {
            sh.getRange(i + 1, 2, 1, 10).setValues([[
              type, code, nameVI, nameEN, nameJP, desc, color, sortOrder, status, now
            ]]);
          } else {
            sh.getRange(i + 1, 2, 1, 7).setValues([[
              type, code, nameVI, desc, color, nameJP, status
            ]]);
            sh.getRange(i + 1, 10).setValue(extra3);
          }
          SpreadsheetApp.flush();
          invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
          writeLog("UPDATE_TAXONOMY", `Cập nhật ${type} [${code}]: ${nameVI}`);
          return {
            success: true,
            item: {
              id: payload.id,
              type: type,
              code: code,
              name: nameVI,
              name_vi: nameVI,
              name_en: nameEN,
              name_jp: nameJP,
              desc: desc,
              color: color,
              extra1: color,
              extra2: nameJP,
              extra3: extra3,
              sortOrder: sortOrder,
              status: status
            }
          };
        }
      }
    }

    // Thêm mục mới
    const newId = (type.slice(0, 3) + "_" + generateId()).toUpperCase();
    if (isNew) {
      sh.appendRow([
        newId, type, code, nameVI, nameEN, nameJP, desc, color, sortOrder, status, now
      ]);
    } else {
      sh.appendRow([
        newId, type, code, nameVI, desc, color, nameJP, status, now, extra3
      ]);
    }

    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
    writeLog("ADD_TAXONOMY", `Thêm mới ${type} [${code}]: ${nameVI}`);
    return {
      success: true,
      item: {
        id: newId,
        type: type,
        code: code,
        name: nameVI,
        name_vi: nameVI,
        name_en: nameEN,
        name_jp: nameJP,
        desc: desc,
        color: color,
        extra1: color,
        extra2: nameJP,
        extra3: extra3,
        sortOrder: sortOrder,
        status: status
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Đồng bộ thông tin nhân sự sang USERS sheet an toàn
 */
function syncEmployeeToUsersSheet(emp) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let shUsers = ss.getSheetByName(CONFIG.SHEET_USERS);
    if (!shUsers) return;

    if (shUsers.getLastColumn() < 8) {
      shUsers.getRange(1, 8).setValue("Link Bảng Tính").setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");
    }

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
    // BẢO VỆ ADMIN: Nếu tài khoản đang là Admin, tuyệt đối không bị hạ cấp
    if (existingRole === "Admin" && emp.role !== "Admin") {
      roleToSet = existingRole;
    }

    if (foundIndex !== -1) {
      shUsers.getRange(foundIndex, 3).setValue(emp.name);
      shUsers.getRange(foundIndex, 4).setValue(roleToSet);
      shUsers.getRange(foundIndex, 5).setValue(emp.status);
      shUsers.getRange(foundIndex, 7).setValue(emp.rank || "");
      if (emp.sheetUrl) shUsers.getRange(foundIndex, 8).setValue(emp.sheetUrl);
    } else {
      shUsers.appendRow([emp.id, emp.email, emp.name, roleToSet, emp.status, new Date(), emp.rank || "", emp.sheetUrl || ""]);
    }
    SpreadsheetApp.flush();
    invalidateCache([CONFIG.SHEET_USERS]);
  } catch(e) {
    console.warn("syncEmployeeToUsersSheet warning:", e);
  }
}

/**
 * Xóa mục tiêu chuẩn hoặc vô hiệu hóa nhân sự
 */
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

/**
 * Khôi phục danh mục mẫu tiêu chuẩn đa ngôn ngữ từ hệ thống
 */
function loadDefaultTaxonomy() {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== "Admin") {
      return { success: false, error: "Chỉ Admin mới có quyền khôi phục danh mục mẫu" };
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
    if (sh) {
      // Sao lưu an toàn trước khi khôi phục
      const timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyyMMdd_HHmmss");
      const backupName = `TAXONOMY_BACKUP_${timestamp}`;
      const backupSh = ss.insertSheet(backupName);
      sh.getDataRange().copyTo(backupSh.getRange(1, 1));
      ss.deleteSheet(sh);
    }
    initTaxonomySheet();
    invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
    writeLog("RESET_TAXONOMY", "Khôi phục danh mục mẫu tiêu chuẩn đa ngôn ngữ");
    return { success: true, data: getTaxonomyDataInternal() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Hàm tiện ích: Nạp trực tiếp 46 mã công việc chuẩn hóa vào Google Sheet
 * Có thể chạy trực tiếp từ nút [▶ Chạy] trong Apps Script Editor mà không cần qua WebApp
 */
function setupTaxonomy46Codes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_TAXONOMY || "TAXONOMY");
  if (sh) {
    const timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyyMMdd_HHmmss");
    const backupName = `TAXONOMY_BACKUP_${timestamp}`;
    const backupSh = ss.insertSheet(backupName);
    sh.getDataRange().copyTo(backupSh.getRange(1, 1));
    ss.deleteSheet(sh);
  }
  initTaxonomySheet();
  invalidateCache([CONFIG.SHEET_TAXONOMY || "TAXONOMY"]);
  Logger.log("✅ ĐÃ NẠP THÀNH CÔNG 46 MÃ CÔNG VIỆC CHUẨN HÓA VÀO TAB TAXONOMY!");
  return "Đã nạp thành công 46 mã công việc chuẩn hóa vào tab TAXONOMY!";
}

/**
 * Chuẩn hóa tiền tố cho các nhiệm vụ cũ hàng loạt
 */
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
          sh.getRange(i + 1, 4).setValue(u.newName); // Cột 4 = Tên công việc
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
