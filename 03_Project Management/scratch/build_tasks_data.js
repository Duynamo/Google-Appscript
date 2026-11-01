const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// Khai báo 68 Tasks chuẩn xác theo báo cáo tuần xanh lá
const OFFICIAL_TASKS = [
  // ── MUR01: 室蘭市蘭東下水処理場 (15 tasks - 240.0h) ──
  {
    id: "MUR01_TK01", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MD01] 躯体モデル作成 - Dựng kết cấu thân công trình", desc: "Dựng hình móng bệ, bể xử lý",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-07-01", deadline: "2026-07-03", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD01 | 24.0h (3 công)",
    target: "Hoàn thành mô hình kết cấu cơ sở", linkResults: "", outputResult: "Mô hình BIM 3D", reminders: "[]", sortOrder: 1
  },
  {
    id: "MUR01_TK02", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MD03] 配管モデル作成 - Dựng hệ thống đường ống", desc: "Tuyến ống công nghệ chính",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Khẩn cấp", status: "Hoàn thành",
    startDate: "2026-07-06", deadline: "2026-07-10", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD03 | 40.0h (5 công)",
    target: "Khớp nối cao độ và tuyến ống", linkResults: "", outputResult: "Mô hình đường ống MEP", reminders: "[]", sortOrder: 2
  },
  {
    id: "MUR01_TK03", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MD02] 設備モデル作成 - Dựng thiết bị máy móc", desc: "(a') Layout máy thổi khí",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-07-07", deadline: "2026-07-08", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD02 | 16.0h (2 công)",
    target: "Định vị máy thổi khí chính xác", linkResults: "", outputResult: "Mô hình thiết bị máy móc", reminders: "[]", sortOrder: 3
  },
  {
    id: "MUR01_TK04", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[PC01] 点群データ処理 - Xử lý dữ liệu Point Cloud", desc: "Ghép và xử lý đám mây điểm 3D",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-07-01", deadline: "2026-07-06", progress: 100,
    note: "Category: PC | Phase: BD | Discipline: PC01 | 32.0h (4 công)",
    target: "Đồng bộ tọa độ đám mây điểm", linkResults: "", outputResult: "Point Cloud rà soát", reminders: "[]", sortOrder: 4
  },
  {
    id: "MUR01_TK05", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MT01] 点群データの撤去部分の確認MTG - Họp xác nhận tháo dỡ", desc: "Họp xác nhận vị trí tháo dỡ Point Cloud",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-07-10", deadline: "2026-07-10", progress: 0,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 0.0h",
    target: "Biên bản họp thống nhất tháo dỡ", linkResults: "", outputResult: "Biên bản MTG", reminders: "[]", sortOrder: 5
  },
  {
    id: "MUR01_TK06", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MD04] データ合成 - Hợp nhất mô hình tổng thể", desc: "Hợp nhất mô hình tổng thể đa bộ môn",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-07-13", deadline: "2026-07-13", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD04 | 8.0h (1 công)",
    target: "Mô hình liên kết không lỗi tọa độ", linkResults: "", outputResult: "Mô hình tổng thể Navisworks", reminders: "[]", sortOrder: 6
  },
  {
    id: "MUR01_TK07", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MC01] 発注図チェックレポート作成・提出 - Báo cáo kiểm tra thiết kế", desc: "(a) Lập và nộp báo cáo kiểm tra thiết kế",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-07-20", deadline: "2026-07-27", progress: 100,
    note: "Category: MC | Phase: BD | Discipline: MC01 | 32.0h (4 công)",
    target: "Nộp báo cáo va chạm thiết kế", linkResults: "", outputResult: "Báo cáo PDF nộp khách hàng", reminders: "[]", sortOrder: 7
  },
  {
    id: "MUR01_TK08", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MC01] 案②の計画図チェックレポート作成・提出 - Báo cáo phương án 2", desc: "(c) Lập và nộp báo cáo phương án 2",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-07-27", deadline: "2026-07-28", progress: 100,
    note: "Category: MC | Phase: BD | Discipline: MC01 | 16.0h (2 công)",
    target: "Nộp báo cáo phương án 2", linkResults: "", outputResult: "Báo cáo phương án 2 PDF", reminders: "[]", sortOrder: 8
  },
  {
    id: "MUR01_TK09", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MT01] 発注図チェックレポート報告MTG - Họp báo cáo kết quả kiểm tra thiết kế", desc: "Họp báo cáo kết quả kiểm tra thiết kế với khách hàng",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-07-30", deadline: "2026-07-30", progress: 0,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 0.0h",
    target: "Chốt phương án xử lý va chạm", linkResults: "", outputResult: "Biên bản họp", reminders: "[]", sortOrder: 9
  },
  {
    id: "MUR01_TK10", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MC04] 送風機の搬入検討 - Nghiên cứu vận chuyển máy thổi khí", desc: "Nghiên cứu biện pháp vận chuyển máy thổi khí",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Thấp", status: "Chờ thực hiện",
    startDate: "2026-08-05", deadline: "2026-08-05", progress: 0,
    note: "Category: MC | Phase: BD | Discipline: MC04 | 0.0h",
    target: "Kế hoạch định tuyến vận chuyển", linkResults: "", outputResult: "Bản vẽ lộ trình vận chuyển", reminders: "[]", sortOrder: 10
  },
  {
    id: "MUR01_TK11", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MD13] 施工図からモデル修正 - Hiệu chỉnh mô hình từ bản vẽ thi công", desc: "Hiệu chỉnh mô hình từ bản vẽ thi công (Phase DD)",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Khẩn cấp", status: "Hoàn thành",
    startDate: "2026-09-21", deadline: "2026-10-01", progress: 100,
    note: "Category: MD | Phase: DD | Discipline: MD13 | 40.0h (5 công)",
    target: "Mô hình chi tiết khớp bản vẽ thi công", linkResults: "", outputResult: "Mô hình BIM thi công", reminders: "[]", sortOrder: 11
  },
  {
    id: "MUR01_TK12", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MC02] 施工図チェックレポート作成・提出 - Báo cáo bản vẽ thi công", desc: "(d,e) Báo cáo kiểm tra bản vẽ thi công (Phase DD)",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-09-24", deadline: "2026-10-02", progress: 100,
    note: "Category: MC | Phase: DD | Discipline: MC02 | 32.0h (4 công)",
    target: "Nộp báo cáo nghiệm thu Shop Drawing", linkResults: "", outputResult: "Báo cáo kiểm tra Shop Drawing", reminders: "[]", sortOrder: 12
  },
  {
    id: "MUR01_TK13", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MT01] 施工図チェックレポート報告MTG - Họp báo cáo thi công", desc: "Họp báo cáo kiểm tra bản vẽ thi công",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-10-05", deadline: "2026-10-05", progress: 0,
    note: "Category: MTG | Phase: DD | Discipline: MT01 | 0.0h",
    target: "Thông qua biên bản báo cáo thi công", linkResults: "", outputResult: "Biên bản họp", reminders: "[]", sortOrder: 13
  },
  {
    id: "MUR01_TK14", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MC03] 追加依頼・レポート修正 - Yêu cầu bổ sung & sửa báo cáo", desc: "Yêu cầu bổ sung & chỉnh sửa báo cáo",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Thấp", status: "Chờ thực hiện",
    startDate: "2026-10-08", deadline: "2026-10-08", progress: 0,
    note: "Category: MC | Phase: BD | Discipline: MC03 | 0.0h",
    target: "Bổ sung theo yêu cầu khách hàng", linkResults: "", outputResult: "Báo cáo chỉnh sửa", reminders: "[]", sortOrder: 14
  },
  {
    id: "MUR01_TK15", projectId: "MUR01", projectName: "2026_01_MUR01_室蘭市蘭東下水処理場",
    name: "[MT01] クローズMTG - Họp nghiệm thu đóng dự án", desc: "Họp nghiệm thu đóng dự án",
    assignee: "member_thach@internal.local, Nguyễn Hữu Thạch", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-10-15", deadline: "2026-10-15", progress: 0,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 0.0h",
    target: "Đóng hồ sơ thanh quyết toán dự án", linkResults: "", outputResult: "Biên bản Close MTG", reminders: "[]", sortOrder: 15
  },

  // ── JJK01: 工房ヴィレッジ新築工事 (31 tasks - 344.0h) ──
  {
    id: "JJK01_TK01", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] 問い合わせMTG - Họp giải đáp thắc mắc & Khởi động", desc: "(M1, M2) Họp giải đáp thắc mắc & Kickoff",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-07-02", deadline: "2026-07-07", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 16.0h (2 công)",
    target: "Thống nhất phạm vi công việc", linkResults: "", outputResult: "Biên bản Kickoff", reminders: "[]", sortOrder: 1
  },
  {
    id: "JJK01_TK02", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MD10] 構造モデル作成_チェック - Kiểm tra mô hình kết cấu từ KOSO", desc: "Rà soát mô hình kết cấu do đối tác KOSO cung cấp",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-07-08", deadline: "2026-07-09", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD10 | 16.0h (2 công)",
    target: "Kiểm tra tiết diện và định vị kết cấu", linkResults: "", outputResult: "Báo cáo kiểm tra kết cấu", reminders: "[]", sortOrder: 2
  },
  {
    id: "JJK01_TK03", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT02] MTG(FVC-KOSO)_構造物／モデルの色付 - Họp quy ước màu sắc", desc: "(M3) Họp thống nhất quy ước màu sắc mô hình",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-07-08", deadline: "2026-07-08", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT02 | 8.0h (1 công)",
    target: "Bảng chuẩn mã màu các bộ môn", linkResults: "", outputResult: "Bảng quy ước màu", reminders: "[]", sortOrder: 3
  },
  {
    id: "JJK01_TK04", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MD10] 建築モデル作成_チェック - Kiểm tra mô hình kiến trúc từ KOSO", desc: "Rà soát mô hình kiến trúc KOSO gửi qua",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-07-16", deadline: "2026-07-16", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD10 | 8.0h (1 công)",
    target: "Khớp nối kiến trúc - kết cấu", linkResults: "", outputResult: "Báo cáo kiến trúc", reminders: "[]", sortOrder: 4
  },
  {
    id: "JJK01_TK05", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT02] MTG(FVC-KOSO)_レイアウト変更 - Họp thay đổi layout trần với KOSO", desc: "(M4) Họp thống nhất thay đổi layout trần",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-07-21", deadline: "2026-07-21", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT02 | 8.0h (1 công)",
    target: "Chốt layout trần mới", linkResults: "", outputResult: "Biên bản họp", reminders: "[]", sortOrder: 5
  },
  {
    id: "JJK01_TK06", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MD10] 設備及び電気モデル_チェック - Kiểm tra mô hình MEP & Điện", desc: "Rà soát mô hình MEP đối tác gửi (e)",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Khẩn cấp", status: "Hoàn thành",
    startDate: "2026-07-22", deadline: "2026-07-27", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD10 | 32.0h (4 công)",
    target: "Phát hiện toàn bộ xung đột MEP", linkResults: "", outputResult: "Báo cáo kiểm tra MEP", reminders: "[]", sortOrder: 6
  },
  {
    id: "JJK01_TK07", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] MTG(FUSO-FVC)_レイアウト変更 - Họp đổi layout với khách hàng FUSO", desc: "(M5) Họp thống nhất đổi layout với khách hàng",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-07-22", deadline: "2026-07-22", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Khách hàng duyệt phương án trần", linkResults: "", outputResult: "Biên bản duyệt", reminders: "[]", sortOrder: 7
  },
  {
    id: "JJK01_TK08", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT02] MTG(FVC-KOSO)_レイアウト変更 - Họp chốt đổi layout với đội KOSO", desc: "(M6) Chốt phương án triển khai với KOSO",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-07-23", deadline: "2026-07-23", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT02 | 8.0h (1 công)",
    target: "Đội ngũ KOSO cập nhật bản vẽ", linkResults: "", outputResult: "Biên bản làm việc", reminders: "[]", sortOrder: 8
  },
  {
    id: "JJK01_TK09", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MD04] データ合成 - Hợp nhất mô hình đa bộ môn", desc: "Ghép nối mô hình Kiến trúc - Kết cấu - MEP",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-07-29", deadline: "2026-07-29", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD04 | 8.0h (1 công)",
    target: "Mô hình tích hợp tổng thể Navisworks", linkResults: "", outputResult: "Mô hình tổng thể", reminders: "[]", sortOrder: 9
  },
  {
    id: "JJK01_TK10", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT02] MTG(FVC-KOSO)_モデルレビュー - Họp review mô hình tổng thể với KOSO", desc: "(M7) Review tổng thể trước khi nộp",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-07-29", deadline: "2026-07-29", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT02 | 8.0h (1 công)",
    target: "Thông qua chất lượng mô hình", linkResults: "", outputResult: "Biên bản Review", reminders: "[]", sortOrder: 10
  },
  {
    id: "JJK01_TK11", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MC01] 発注図チェック - Rà soát kiểm tra bản vẽ đặt hàng", desc: "Kiểm tra sai lệch bản vẽ thiết kế đặt hàng",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-07-30", deadline: "2026-07-31", progress: 100,
    note: "Category: MC | Phase: BD | Discipline: MC01 | 16.0h (2 công)",
    target: "Lập danh sách sai lệch kích thước", linkResults: "", outputResult: "Checklist sai lệch", reminders: "[]", sortOrder: 11
  },
  {
    id: "JJK01_TK12", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[SD08] TFASデータ変換（1回目） - Chuyển đổi định dạng TFAS đợt 1", desc: "Convert dữ liệu sang định dạng TFAS đợt 1",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-08-03", deadline: "2026-08-03", progress: 100,
    note: "Category: SD | Phase: BD | Discipline: SD08 | 8.0h (1 công)",
    target: "File TFAS mở chuẩn trên phần mềm công trường", linkResults: "", outputResult: "Dữ liệu TFAS đợt 1", reminders: "[]", sortOrder: 12
  },
  {
    id: "JJK01_TK13", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MC01] 設計図チェックレポート作成・提出（1回目） - Báo cáo thiết kế đợt 1", desc: "Xuất báo cáo nộp khách hàng FUSO",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Khẩn cấp", status: "Hoàn thành",
    startDate: "2026-08-04", deadline: "2026-08-06", progress: 100,
    note: "Category: MC | Phase: BD | Discipline: MC01 | 24.0h (3 công)",
    target: "Nộp báo cáo chính thức đợt 1", linkResults: "", outputResult: "Báo cáo thiết kế PDF đợt 1", reminders: "[]", sortOrder: 13
  },
  {
    id: "JJK01_TK14", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] 設計図チェックレポート報告MTG（1回目） - Họp báo cáo thiết kế đợt 1", desc: "(M8) Họp báo cáo kết quả kiểm tra thiết kế",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-08-07", deadline: "2026-08-07", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Khách hàng duyệt báo cáo đợt 1", linkResults: "", outputResult: "Biên bản họp đợt 1", reminders: "[]", sortOrder: 14
  },
  {
    id: "JJK01_TK15", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] TFASデータ変換のMTG - Họp kỹ thuật về chuyển đổi dữ liệu TFAS", desc: "(M9) Họp giải quyết các lỗi font và layer khi convert",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-08-11", deadline: "2026-08-11", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Thống nhất chuẩn chuyển đổi TFAS", linkResults: "", outputResult: "Biên bản kỹ thuật TFAS", reminders: "[]", sortOrder: 15
  },
  {
    id: "JJK01_TK16", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[PM01] フェーズ１の数量集計 - Bóc tách khối lượng vật tư Giai đoạn 1", desc: "Thống kê số lượng phục vụ đặt hàng",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-08-17", deadline: "2026-08-19", progress: 100,
    note: "Category: PM | Phase: BD | Discipline: PM01 | 24.0h (3 công)",
    target: "Bảng khối lượng chính xác cho CĐT", linkResults: "", outputResult: "Bảng BOQ Giai đoạn 1", reminders: "[]", sortOrder: 16
  },
  {
    id: "JJK01_TK17", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] フェーズ１の課題解決MTG - Họp giải quyết vướng mắc Giai đoạn 1", desc: "(M10) Họp giải quyết vướng mắc khối lượng",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-08-19", deadline: "2026-08-19", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Chốt danh mục đặt hàng vật tư", linkResults: "", outputResult: "Biên bản chốt khối lượng", reminders: "[]", sortOrder: 17
  },
  {
    id: "JJK01_TK18", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MC03] イシュー対応 - Xử lý các xung đột & Issue tồn đọng", desc: "FVC phối hợp xử lý xung đột tồn đọng",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-08-20", deadline: "2026-08-21", progress: 100,
    note: "Category: MC | Phase: BD | Discipline: MC03 | 16.0h (2 công)",
    target: "Xóa sạch các va chạm nặng", linkResults: "", outputResult: "Issue Tracking Sheet", reminders: "[]", sortOrder: 18
  },
  {
    id: "JJK01_TK19", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MC01] 床合板下のイシューのレポート - Báo cáo xung đột dưới sàn ván ép", desc: "Xử lý xung đột cao độ đường ống dưới sàn",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-08-24", deadline: "2026-08-24", progress: 100,
    note: "Category: MC | Phase: BD | Discipline: MC01 | 8.0h (1 công)",
    target: "Phương án hạ cao độ ống khả thi", linkResults: "", outputResult: "Báo cáo xung đột sàn", reminders: "[]", sortOrder: 19
  },
  {
    id: "JJK01_TK20", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[SD08] TFASデータ変換（2回目） - Chuyển đổi định dạng TFAS đợt 2", desc: "Convert cập nhật dữ liệu TFAS đợt 2",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-08-25", deadline: "2026-08-25", progress: 100,
    note: "Category: SD | Phase: BD | Discipline: SD08 | 8.0h (1 công)",
    target: "Dữ liệu TFAS cập nhật vị trí ống mới", linkResults: "", outputResult: "File TFAS đợt 2", reminders: "[]", sortOrder: 20
  },
  {
    id: "JJK01_TK21", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] イシュー対応MTG - Họp chốt phương án xử lý xung đột", desc: "Họp chốt phương án xử lý xung đột sàn ván ép",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-08-28", deadline: "2026-08-28", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Thống nhất giải pháp thi công", linkResults: "", outputResult: "Biên bản thống nhất phương án", reminders: "[]", sortOrder: 21
  },
  {
    id: "JJK01_TK22", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[SD08] TFASデータ変換（2回目再確認） - TFAS đợt 2 sau hiệu chỉnh", desc: "Convert sau khi hiệu chỉnh Issue sàn",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-09-01", deadline: "2026-09-01", progress: 100,
    note: "Category: SD | Phase: BD | Discipline: SD08 | 8.0h (1 công)",
    target: "Bộ file TFAS chuẩn xác", linkResults: "", outputResult: "File TFAS hiệu chỉnh", reminders: "[]", sortOrder: 22
  },
  {
    id: "JJK01_TK23", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] MTG(FUSO-FVC)進捗報告 - Họp báo cáo tiến độ định kỳ với FUSO", desc: "Họp báo cáo tiến độ định kỳ với khách hàng FUSO",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-09-04", deadline: "2026-09-04", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Cập nhật tiến độ tháng 9", linkResults: "", outputResult: "Slide báo cáo tiến độ", reminders: "[]", sortOrder: 23
  },
  {
    id: "JJK01_TK24", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] MTG(FUSO-FVC)問題解決 - Họp giải quyết vướng mắc phát sinh", desc: "Họp giải quyết các vấn đề phát sinh tại công trường",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-09-08", deadline: "2026-09-08", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Tháo gỡ toàn bộ điểm nghẽn kỹ thuật", linkResults: "", outputResult: "Biên bản xử lý sự vụ", reminders: "[]", sortOrder: 24
  },
  {
    id: "JJK01_TK25", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] MTG(FUSO-FVC)施工図作成について - Họp về kế hoạch lập bản vẽ thi công", desc: "Họp kế hoạch triển khai Shop Drawing (Phase DD)",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Khẩn cấp", status: "Hoàn thành",
    startDate: "2026-09-15", deadline: "2026-09-15", progress: 100,
    note: "Category: MTG | Phase: DD | Discipline: MT01 | 8.0h (1 công)",
    target: "Phê duyệt kế hoạch bản vẽ thi công", linkResults: "", outputResult: "Kế hoạch Shop Drawing", reminders: "[]", sortOrder: 25
  },
  {
    id: "JJK01_TK26", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT02] MTG(FVC-KOSO)点検口について - Họp vị trí bố trí lỗ thăm kỹ thuật", desc: "Họp vị trí bố trí lỗ thăm kỹ thuật trần/sàn",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-09-16", deadline: "2026-09-16", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT02 | 8.0h (1 công)",
    target: "Chốt bản vẽ vị trí lỗ thăm", linkResults: "", outputResult: "Bản vẽ lỗ thăm kỹ thuật", reminders: "[]", sortOrder: 26
  },
  {
    id: "JJK01_TK27", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MC01] 設計図チェックレポート作成・提出（2回目） - Báo cáo thiết kế đợt 2", desc: "Lập & nộp báo cáo kiểm tra thiết kế đợt 2",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-09-23", deadline: "2026-09-23", progress: 100,
    note: "Category: MC | Phase: BD | Discipline: MC01 | 8.0h (1 công)",
    target: "Nộp báo cáo chính thức đợt 2", linkResults: "", outputResult: "Báo cáo thiết kế đợt 2 PDF", reminders: "[]", sortOrder: 27
  },
  {
    id: "JJK01_TK28", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[SD08] TFASデータ変換（3回目） - Hoàn tất bộ dữ liệu TFAS cho công trường", desc: "Chuyển đổi định dạng TFAS hoàn thiện đợt 3",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-09-28", deadline: "2026-09-29", progress: 100,
    note: "Category: SD | Phase: BD | Discipline: SD08 | 16.0h (2 công)",
    target: "Bàn giao trọn bộ TFAS cho công trường", linkResults: "", outputResult: "Bộ file TFAS bàn giao", reminders: "[]", sortOrder: 28
  },
  {
    id: "JJK01_TK29", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] 設計図チェックレポート報告MTG（2回目） - Họp báo cáo thiết kế đợt 2", desc: "Họp báo cáo kiểm tra thiết kế đợt 2",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-10-02", deadline: "2026-10-02", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Nghiệm thu hồ sơ đợt 2", linkResults: "", outputResult: "Biên bản nghiệm thu đợt 2", reminders: "[]", sortOrder: 29
  },
  {
    id: "JJK01_TK30", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT02] MTG(FVC-KOSO)振り返り - Họp đánh giá rút kinh nghiệm dự án", desc: "Họp đánh giá rút kinh nghiệm phối hợp giữa 2 bên",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-10-08", deadline: "2026-10-08", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT02 | 8.0h (1 công)",
    target: "Báo cáo bài học kinh nghiệm (Lessons Learned)", linkResults: "", outputResult: "Báo cáo Lessons Learned", reminders: "[]", sortOrder: 30
  },
  {
    id: "JJK01_TK31", projectId: "JJK01", projectName: "2026_02_JJK01_工房ヴィレッジ新築工事",
    name: "[MT01] クローズMTG - Họp nghiệm thu đóng dự án", desc: "Họp nghiệm thu đóng dự án và thanh lý hợp đồng",
    assignee: "duyvultv@gmail.com, Vũ Đình Duy", priority: "Khẩn cấp", status: "Hoàn thành",
    startDate: "2026-10-16", deadline: "2026-10-16", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Ký kết biên bản Close Project chính thức", linkResults: "", outputResult: "Biên bản đóng dự án", reminders: "[]", sortOrder: 31
  },

  // ── AMA01: 天草市本渡浄化センター (10 tasks - 16.0h thực tế) ──
  {
    id: "AMA01_TK01", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[MD03] 配管モデル作成 - Dựng mô hình đường ống công nghệ", desc: "Dựng hình hệ thống đường ống công nghệ xử lý nước",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Khẩn cấp", status: "Đang thực hiện",
    startDate: "2026-10-27", deadline: "2026-10-28", progress: 50,
    note: "Category: MD | Phase: BD | Discipline: MD03 | 16.0h (2 công)",
    target: "Hoàn thành tuyến ống chính", linkResults: "", outputResult: "Mô hình đường ống", reminders: "[]", sortOrder: 1
  },
  {
    id: "AMA01_TK02", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[SD08] 汚泥搬出設備の施工計画 - Kế hoạch thi công thiết bị vận chuyển bùn", desc: "Lập biện pháp thi công thiết bị bùn (Phase DD)",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Cao", status: "Chờ thực hiện",
    startDate: "2026-11-02", deadline: "2026-11-06", progress: 0,
    note: "Category: SD | Phase: DD | Discipline: SD08 | 0.0h",
    target: "Hồ sơ biện pháp thi công", linkResults: "", outputResult: "Thuyết minh biện pháp", reminders: "[]", sortOrder: 2
  },
  {
    id: "AMA01_TK03", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[MC06] 汚泥搬出設備の施工計画のレポート提出 - Nộp báo cáo kế hoạch thi công bùn", desc: "Nộp báo cáo kế hoạch thi công bùn (Phase DD)",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-11-09", deadline: "2026-11-10", progress: 0,
    note: "Category: MC | Phase: DD | Discipline: MC06 | 0.0h",
    target: "Nộp báo cáo cho CĐT duyệt", linkResults: "", outputResult: "Báo cáo kế hoạch thi công", reminders: "[]", sortOrder: 3
  },
  {
    id: "AMA01_TK04", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[MT01] 汚泥搬出設備の施工計画の報告MTG - Họp báo cáo kế hoạch thi công bùn", desc: "Họp bảo vệ kế hoạch thi công thiết bị bùn (Phase DD)",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-11-11", deadline: "2026-11-11", progress: 0,
    note: "Category: MTG | Phase: DD | Discipline: MT01 | 0.0h",
    target: "Thông qua phương án thi công", linkResults: "", outputResult: "Biên bản duyệt phương án", reminders: "[]", sortOrder: 4
  },
  {
    id: "AMA01_TK05", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[MC01] 脱水機廻りの干渉報告 - Báo cáo va chạm quanh máy tách nước", desc: "Kiểm tra va chạm không gian quanh máy tách nước",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Cao", status: "Chờ thực hiện",
    startDate: "2026-11-12", deadline: "2026-11-13", progress: 0,
    note: "Category: MC | Phase: BD | Discipline: MC01 | 0.0h",
    target: "Báo cáo va chạm máy tách nước", linkResults: "", outputResult: "Clash Report", reminders: "[]", sortOrder: 5
  },
  {
    id: "AMA01_TK06", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[MD05] 配管サポートモデル作成 - Dựng mô hình giá đỡ ống", desc: "Dựng giá đỡ cho toàn bộ hệ thống ống",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-11-16", deadline: "2026-11-18", progress: 0,
    note: "Category: MD | Phase: BD | Discipline: MD05 | 0.0h",
    target: "Mô hình giá đỡ ống chi tiết", linkResults: "", outputResult: "Mô hình giá đỡ Pipe Support", reminders: "[]", sortOrder: 6
  },
  {
    id: "AMA01_TK07", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[MD05] 鋼製加工品モデル作成 - Dựng mô hình cấu kiện thép gia công", desc: "Dựng hình cấu kiện thép gia công lắp đặt",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-11-19", deadline: "2026-11-20", progress: 0,
    note: "Category: MD | Phase: BD | Discipline: MD05 | 0.0h",
    target: "Mô hình thép phụ trợ", linkResults: "", outputResult: "Mô hình cấu kiện thép", reminders: "[]", sortOrder: 7
  },
  {
    id: "AMA01_TK08", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[MC02] 施工図チェック - Kiểm tra bản vẽ thi công", desc: "Kiểm tra bản vẽ thi công Shop Drawing (Phase DD)",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Cao", status: "Chờ thực hiện",
    startDate: "2026-11-23", deadline: "2026-11-25", progress: 0,
    note: "Category: MC | Phase: DD | Discipline: MC02 | 0.0h",
    target: "Báo cáo kiểm tra Shop Drawing", linkResults: "", outputResult: "Checklist Shop Drawing", reminders: "[]", sortOrder: 8
  },
  {
    id: "AMA01_TK09", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[MC02] 施工図レポートの作成・提出 - Lập & nộp báo cáo bản vẽ thi công", desc: "Lập & nộp báo cáo bản vẽ thi công (Phase DD)",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Cao", status: "Chờ thực hiện",
    startDate: "2026-11-26", deadline: "2026-11-27", progress: 0,
    note: "Category: MC | Phase: DD | Discipline: MC02 | 0.0h",
    target: "Nộp báo cáo Shop Drawing cho CĐT", linkResults: "", outputResult: "Báo cáo Shop Drawing PDF", reminders: "[]", sortOrder: 9
  },
  {
    id: "AMA01_TK10", projectId: "AMA01", projectName: "2026_03_AMA01_天草市本渡浄化センター",
    name: "[MT01] 施工図レポートの報告MTG - Họp báo cáo kết quả kiểm tra Shop", desc: "Họp báo cáo kết quả kiểm tra Shop với CĐT (Phase DD)",
    assignee: "member_hue@internal.local, Ngô Thị Huệ", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-11-30", deadline: "2026-11-30", progress: 0,
    note: "Category: MTG | Phase: DD | Discipline: MT01 | 0.0h",
    target: "Chốt biên bản Shop Drawing", linkResults: "", outputResult: "Biên bản họp", reminders: "[]", sortOrder: 10
  },

  // ── TES01: 弟子屈町弟子屈浄化センター (12 tasks - 112.0h) ──
  {
    id: "TES01_TK01", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MD01] 躯体モデル作成 - Dựng mô hình kết cấu thân công trình", desc: "Dựng hình móng bệ, bể xử lý",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-07-09", deadline: "2026-07-11", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD01 | 24.0h (3 công)",
    target: "Hoàn thành hình học kết cấu bể", linkResults: "", outputResult: "Mô hình kết cấu BIM", reminders: "[]", sortOrder: 1
  },
  {
    id: "TES01_TK02", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MD03] 配管モデル作成 - Dựng mô hình hệ thống đường ống", desc: "Tuyến ống công nghệ chính",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Khẩn cấp", status: "Hoàn thành",
    startDate: "2026-07-24", deadline: "2026-07-28", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD03 | 24.0h (3 công)",
    target: "Đường ống công nghệ xử lý nước", linkResults: "", outputResult: "Mô hình đường ống MEP", reminders: "[]", sortOrder: 2
  },
  {
    id: "TES01_TK03", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MD02] 設備モデル作成 - Dựng mô hình thiết bị máy móc", desc: "Dựng mô hình thiết bị máy móc",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-08-03", deadline: "2026-08-03", progress: 100,
    note: "Category: MD | Phase: BD | Discipline: MD02 | 8.0h (1 công)",
    target: "Định vị thiết bị máy bơm, máy thổi khí", linkResults: "", outputResult: "Mô hình thiết bị", reminders: "[]", sortOrder: 3
  },
  {
    id: "TES01_TK04", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[PC01] 点群データ処理 - Xử lý dữ liệu Point Cloud hiện trạng", desc: "(b) Xử lý Point Cloud hiện trạng",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-08-04", deadline: "2026-08-05", progress: 100,
    note: "Category: PC | Phase: BD | Discipline: PC01 | 16.0h (2 công)",
    target: "Làm sạch và ghép nối dữ liệu Scan 3D", linkResults: "", outputResult: "File Point Cloud xử lý", reminders: "[]", sortOrder: 4
  },
  {
    id: "TES01_TK05", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MT01] 点群データの撤去部分の確認MTG - Họp xác nhận vị trí tháo dỡ", desc: "Họp xác nhận vị trí tháo dỡ Point Cloud",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Trung bình", status: "Hoàn thành",
    startDate: "2026-08-06", deadline: "2026-08-06", progress: 100,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 8.0h (1 công)",
    target: "Chốt vị trí tháo dỡ công trình cũ", linkResults: "", outputResult: "Biên bản họp tháo dỡ", reminders: "[]", sortOrder: 5
  },
  {
    id: "TES01_TK06", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MC01] 発注図チェック - Rà soát kiểm tra bản vẽ thiết kế", desc: "Rà soát kiểm tra bản vẽ thiết kế đặt hàng",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-08-19", deadline: "2026-08-20", progress: 100,
    note: "Category: MC | Phase: BD | Discipline: MC01 | 16.0h (2 công)",
    target: "Kiểm tra bản vẽ trước thi công", linkResults: "", outputResult: "Checklist bản vẽ", reminders: "[]", sortOrder: 6
  },
  {
    id: "TES01_TK07", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MC01] 発注図チェックレポート作成・提出 - Báo cáo kiểm tra thiết kế", desc: "(c) Lập và nộp báo cáo kiểm tra thiết kế",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Cao", status: "Hoàn thành",
    startDate: "2026-08-20", deadline: "2026-08-21", progress: 100,
    note: "Category: MC | Phase: BD | Discipline: MC01 | 16.0h (2 công)",
    target: "Nộp báo cáo chính thức cho khách hàng", linkResults: "", outputResult: "Báo cáo kiểm tra thiết kế PDF", reminders: "[]", sortOrder: 7
  },
  {
    id: "TES01_TK08", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MT01] 発注図チェックレポート報告MTG - Họp báo cáo kết quả kiểm tra thiết kế", desc: "Họp báo cáo kết quả kiểm tra thiết kế",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-08-25", deadline: "2026-08-25", progress: 0,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 0.0h",
    target: "Báo cáo kết quả kiểm tra với khách hàng", linkResults: "", outputResult: "Biên bản họp", reminders: "[]", sortOrder: 8
  },
  {
    id: "TES01_TK09", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MD13] 施工図からモデル修正 - Hiệu chỉnh mô hình từ bản vẽ thi công", desc: "Hiệu chỉnh mô hình từ bản vẽ thi công (Phase DD)",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Cao", status: "Chờ thực hiện",
    startDate: "2026-09-01", deadline: "2026-09-05", progress: 0,
    note: "Category: MD | Phase: DD | Discipline: MD13 | 0.0h",
    target: "Mô hình khớp bản vẽ thi công", linkResults: "", outputResult: "Mô hình BIM thi công", reminders: "[]", sortOrder: 9
  },
  {
    id: "TES01_TK10", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MC02] 施工図チェックレポート作成・提出 - Lập & nộp báo cáo bản vẽ thi công", desc: "Lập & nộp báo cáo bản vẽ thi công (Phase DD)",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Cao", status: "Chờ thực hiện",
    startDate: "2026-09-08", deadline: "2026-09-10", progress: 0,
    note: "Category: MC | Phase: DD | Discipline: MC02 | 0.0h",
    target: "Báo cáo nghiệm thu bản vẽ thi công", linkResults: "", outputResult: "Báo cáo nghiệm thu Shop Drawing", reminders: "[]", sortOrder: 10
  },
  {
    id: "TES01_TK11", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MT01] 施工図チェックレポート報告MTG - Họp báo cáo kiểm tra bản vẽ thi công", desc: "Họp báo cáo kiểm tra bản vẽ thi công (Phase DD)",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-09-15", deadline: "2026-09-15", progress: 0,
    note: "Category: MTG | Phase: DD | Discipline: MT01 | 0.0h",
    target: "Thông qua biên bản nghiệm thu", linkResults: "", outputResult: "Biên bản họp nghiệm thu", reminders: "[]", sortOrder: 11
  },
  {
    id: "TES01_TK12", projectId: "TES01", projectName: "2026_04_TES01_弟子屈町弟子屈浄化センター",
    name: "[MT01] クローズMTG - Họp nghiệm thu đóng dự án", desc: "Họp nghiệm thu đóng dự án",
    assignee: "member_nhan@internal.local, Thạch Cảnh Ngô Nhân", priority: "Trung bình", status: "Chờ thực hiện",
    startDate: "2026-09-22", deadline: "2026-09-22", progress: 0,
    note: "Category: MTG | Phase: BD | Discipline: MT01 | 0.0h",
    target: "Thanh lý hợp đồng và lưu trữ dữ liệu", linkResults: "", outputResult: "Biên bản Close MTG", reminders: "[]", sortOrder: 12
  }
];

console.log("=== TỔNG KẾT DANH MỤC NHIỆM VỤ ===");
console.log("Tổng số Task:", OFFICIAL_TASKS.length, "(Kỳ vọng: 68 tasks)");

const pjs = ["MUR01", "JJK01", "AMA01", "TES01"];
pjs.forEach(pj => {
  const pTasks = OFFICIAL_TASKS.filter(t => t.projectId === pj);
  const doneTasks = pTasks.filter(t => t.status === "Hoàn thành" || t.status === "Đang thực hiện");
  const hours = doneTasks.reduce((sum, t) => {
    const m = t.note.match(/(\d+\.?\d*)h/);
    return sum + (m ? parseFloat(m[1]) : 0);
  }, 0);
  console.log(`Dự án ${pj}: ${pTasks.length} tasks (${doneTasks.length} việc có giờ) | Tổng giờ: ${hours}h`);
});
