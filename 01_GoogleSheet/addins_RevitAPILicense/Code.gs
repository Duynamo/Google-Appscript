/**
 * @file Code.gs
 * @description Google Apps Script Web App để xác thực bản quyền.
 * Biến Google Sheet thành một API để kiểm tra License Key.
 */

// --- CÁC HẰNG SỐ ---
// Sử dụng hằng số giúp code dễ đọc và dễ bảo trì hơn khi cần thay đổi.
const SHEET_NAME = "Sheet1";
const COL_LICENSE_KEY = 4; // Cột D: LicenseKey
const COL_DEVICE_1 = 5;    // Cột E: Device_1
const COL_DEVICE_2 = 6;    // Cột F: Device_2
const COL_IS_ACTIVE = 7;   // Cột G: IsActive

/**
 * Xử lý yêu cầu HTTP POST gửi đến Web App.
 * Đây là hàm chính của API.
 * @param {Object} e - Đối tượng sự kiện chứa dữ liệu của yêu cầu.
 * @returns {ContentService.TextOutput} Một đối tượng phản hồi JSON.
 */
function doPost(e) {
  try {
    // 1. Phân tích dữ liệu JSON từ body của yêu cầu POST.
    // Client cần gửi request với Content-Type là 'application/json'.
    const params = JSON.parse(e.postData.contents);
    const { key, macAddress } = params;

    // Kiểm tra cơ bản: đảm bảo 'key' và 'macAddress' được cung cấp.
    if (!key || !macAddress) {
      return createJsonResponse({
        status: "bad_request",
        message: "Thiếu tham số 'key' hoặc 'macAddress'."
      });
    }

    // 2. Truy cập vào bảng tính và sheet cụ thể.
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      // Ghi lại lỗi nếu không tìm thấy sheet để debug.
      Logger.log(`Không tìm thấy sheet với tên "${SHEET_NAME}".`);
      throw new Error(`Không tìm thấy sheet "${SHEET_NAME}".`);
    }
    
    // Lấy toàn bộ dữ liệu từ sheet, bắt đầu từ hàng 2 để bỏ qua tiêu đề.
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
    const values = dataRange.getValues();

    // 3. Tìm dòng tương ứng với license key được cung cấp.
    let foundRowIndex = -1;
    let licenseData = null;

    for (let i = 0; i < values.length; i++) {
      // Cột D (LicenseKey) tương ứng với chỉ số 3 trong mảng (bắt đầu từ 0).
      if (values[i][COL_LICENSE_KEY - 1] === key) {
        foundRowIndex = i;
        licenseData = values[i];
        break;
      }
    }

    // 4. Xử lý trường hợp không tìm thấy key.
    if (foundRowIndex === -1) {
      return createJsonResponse({
        status: "invalid_key",
        message: "Mã bản quyền không tồn tại"
      });
    }

    // 5. Kiểm tra xem key có bị khóa không (Cột G, chỉ số 6).
    const isActive = licenseData[COL_IS_ACTIVE - 1];
    if (isActive !== true) {
      return createJsonResponse({
        status: "locked",
        message: "Key đã bị khóa"
      });
    }

    // 6. Kiểm tra địa chỉ MAC của thiết bị (Cột E và F).
    const device1 = licenseData[COL_DEVICE_1 - 1];
    const device2 = licenseData[COL_DEVICE_2 - 1];

    // Trường hợp 1: MAC address đã được đăng ký.
    if (macAddress === device1 || macAddress === device2) {
      return createJsonResponse({
        status: "success",
        message: "Xác thực thành công"
      });
    }

    // Trường hợp 2: MAC address chưa có, kiểm tra xem còn chỗ trống không.
    // Số hàng thực tế trên sheet = chỉ số dòng trong mảng (foundRowIndex) + 2.
    const sheetRow = foundRowIndex + 2;

    if (device1 === "" || device1 == null) {
      // Ghi vào Cột E (Device_1).
      sheet.getRange(sheetRow, COL_DEVICE_1).setValue(macAddress);
      return createJsonResponse({
        status: "success",
        message: "Đăng ký thiết bị thành công"
      });
    }

    if (device2 === "" || device2 == null) {
      // Ghi vào Cột F (Device_2).
      sheet.getRange(sheetRow, COL_DEVICE_2).setValue(macAddress);
      return createJsonResponse({
        status: "success",
        message: "Đăng ký thiết bị thành công"
      });
    }

    // Trường hợp 3: Cả hai vị trí thiết bị đều đã được sử dụng.
    return createJsonResponse({
      status: "limit_reached",
      message: "Đã đạt giới hạn 2 thiết bị"
    });

  } catch (error) {
    // Ghi lại lỗi để dễ dàng gỡ lỗi từ phía server.
    Logger.log(error.toString());
    // Trả về một thông báo lỗi chung cho client.
    return createJsonResponse({
      status: "error",
      message: "Đã có lỗi xảy ra ở phía máy chủ: " + error.message
    });
  }
}

/**
 * Xử lý yêu cầu HTTP GET gửi đến Web App.
 * Khi người dùng truy cập URL trực tiếp bằng trình duyệt, hàm này sẽ được gọi.
 * Nó sẽ hiển thị một thông báo cho biết API đang hoạt động.
 * @param {Object} e - Đối tượng sự kiện.
 * @returns {HtmlService.HtmlOutput} Một trang HTML đơn giản.
 */
function doGet(e) {
  return HtmlService.createHtmlOutput(
    "<h1>API Xác Thực Bản Quyền</h1>" +
    "<p>API đang hoạt động.</p>" +
    "<p>Vui lòng sử dụng phương thức POST để gửi dữ liệu xác thực theo đúng tài liệu.</p>"
  );
}
/**
 * Hàm trợ giúp để tạo một phản hồi JSON chuẩn.
 * @param {Object} data - Đối tượng JavaScript cần chuyển thành chuỗi JSON.
 * @returns {ContentService.TextOutput} Đối tượng phản hồi JSON.
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}