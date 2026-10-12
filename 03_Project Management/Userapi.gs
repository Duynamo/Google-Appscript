// ============================================================
//  File: UsersAPI.gs v3.0 (OPTIMIZED)
//  Quản Lý Người Dùng & Phân Quyền
// ============================================================

/** Lấy danh sách người dùng (Admin only) */
function getUsers() {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_users"))
    return { success: false, error: "Không có quyền truy cập" };

  const data = getSheetData(CONFIG.SHEET_USERS);
  const users = data.map(r => ({
    id     : r[0],
    email  : r[1],
    name   : r[2],
    role   : r[3],
    status : r[4],
    created: r[5] ? Utilities.formatDate(new Date(r[5]), "Asia/Ho_Chi_Minh", "dd/MM/yyyy") : "",
    note   : r[6] || ""
  }));
  return { success: true, data: users };
}

/** Thêm người dùng mới (hỗ trợ cả Gmail và Thành viên nội bộ chỉ cần tên) */
function addUser(payload) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_users"))
    return { success: false, error: "Không có quyền thực hiện" };
  if (!payload.name || !payload.role)
    return { success: false, error: "Thiếu thông tin bắt buộc" };
  if (!CONFIG.ROLES.includes(payload.role))
    return { success: false, error: "Vai trò không hợp lệ" };

  const id = generateId();
  // Nếu không có email (chế độ chỉ cần tên), tự sinh email định danh nội bộ
  const email = (payload.email && payload.email.trim()) 
    ? payload.email.trim() 
    : `member_${id.toLowerCase()}@internal.local`;

  const existing = getSheetData(CONFIG.SHEET_USERS).find(r => r[1] && r[1].toLowerCase() === email.toLowerCase());
  if (existing) return { success: false, error: "Email/Mã thành viên đã tồn tại trong hệ thống" };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_USERS);
  const now = new Date();
  sh.appendRow([id, email, payload.name, payload.role, payload.status || "Active", now, payload.note || ""]);
  SpreadsheetApp.flush();
  invalidateCache([CONFIG.SHEET_USERS]);
  writeLog("ADD_USER", `Thêm user: ${payload.name} (${email}) | Role: ${payload.role}`);

  const userObj = {
    id, email, name: payload.name, role: payload.role, status: payload.status || "Active",
    created: Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "dd/MM/yyyy"),
    note: payload.note || ""
  };

  return { success: true, message: `Đã thêm ${payload.name} thành công`, id, user: userObj };
}

/** Cập nhật thông tin người dùng */
function updateUser(payload) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_users"))
    return { success: false, error: "Không có quyền thực hiện" };
  if (!payload.id && !payload.email) return { success: false, error: "Thiếu ID hoặc Email người dùng" };

  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const sh   = ss.getSheetByName(CONFIG.SHEET_USERS);
  const rows = sh.getDataRange().getValues();

  const targetId = payload.id ? String(payload.id).trim().toLowerCase() : "";
  const targetEmail = payload.email ? String(payload.email).trim().toLowerCase() : "";

  for (let i = 1; i < rows.length; i++) {
    const rowId = String(rows[i][0] || "").trim().toLowerCase();
    const rowEmail = String(rows[i][1] || "").trim().toLowerCase();
    const isMatch = (targetId && (rowId === targetId || rowEmail === targetId)) ||
                    (targetEmail && (rowId === targetEmail || rowEmail === targetEmail));

    if (isMatch) {
      if (payload.name   !== undefined) sh.getRange(i+1, 3).setValue(payload.name);
      if (payload.role   !== undefined) sh.getRange(i+1, 4).setValue(payload.role);
      if (payload.status !== undefined) sh.getRange(i+1, 5).setValue(payload.status);
      if (payload.note   !== undefined) sh.getRange(i+1, 7).setValue(payload.note);
      SpreadsheetApp.flush();
      invalidateCache([CONFIG.SHEET_USERS]);
      writeLog("UPDATE_USER", `Cập nhật user ID: ${rows[i][0]} | Email: ${rows[i][1]}`);
      return { success: true, message: "Cập nhật thành công" };
    }
  }
  return { success: false, error: "Không tìm thấy người dùng" };
}

/** Xóa người dùng vĩnh viễn khỏi hệ thống */
function deleteUser(userId, userEmail) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_users"))
    return { success: false, error: "Không có quyền thực hiện" };

  if (!userId && !userEmail)
    return { success: false, error: "Thiếu ID hoặc Email người dùng cần xóa" };

  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const sh   = ss.getSheetByName(CONFIG.SHEET_USERS);
  const rows = sh.getDataRange().getValues();

  const targetId = userId ? String(userId).trim().toLowerCase() : "";
  const targetEmail = userEmail ? String(userEmail).trim().toLowerCase() : "";

  for (let i = 1; i < rows.length; i++) {
    const rowId = String(rows[i][0] || "").trim().toLowerCase();
    const rowEmail = String(rows[i][1] || "").trim().toLowerCase();

    const isMatch = (targetId && (rowId === targetId || rowEmail === targetId)) ||
                    (targetEmail && (rowId === targetEmail || rowEmail === targetEmail));

    if (isMatch) {
      if (rowEmail && user.email && rowEmail === user.email.toLowerCase())
        return { success: false, error: "Không thể xóa tài khoản đang đăng nhập" };

      const displayName = rows[i][2] || rows[i][1] || userId;
      sh.deleteRow(i + 1);
      SpreadsheetApp.flush();
      invalidateCache([CONFIG.SHEET_USERS]);
      writeLog("DELETE_USER", `Xóa user ID: ${rows[i][0]} | Email: ${rows[i][1]} | Tên: ${displayName}`);
      return { success: true, message: `Đã xóa người dùng "${displayName}"` };
    }
  }
  return { success: false, error: "Không tìm thấy người dùng trong hệ thống" };
}

/** Chuyển đổi trạng thái Active <-> Inactive */
function toggleUserStatus(userId, userEmail) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.role, "manage_users"))
    return { success: false, error: "Không có quyền thực hiện" };

  if (!userId && !userEmail)
    return { success: false, error: "Thiếu ID hoặc Email người dùng" };

  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const sh   = ss.getSheetByName(CONFIG.SHEET_USERS);
  const rows = sh.getDataRange().getValues();

  const targetId = userId ? String(userId).trim().toLowerCase() : "";
  const targetEmail = userEmail ? String(userEmail).trim().toLowerCase() : "";

  for (let i = 1; i < rows.length; i++) {
    const rowId = String(rows[i][0] || "").trim().toLowerCase();
    const rowEmail = String(rows[i][1] || "").trim().toLowerCase();

    const isMatch = (targetId && (rowId === targetId || rowEmail === targetId)) ||
                    (targetEmail && (rowId === targetEmail || rowEmail === targetEmail));

    if (isMatch) {
      if (rowEmail && user.email && rowEmail === user.email.toLowerCase())
        return { success: false, error: "Không thể đổi trạng thái tài khoản đang đăng nhập" };

      const newStatus = rows[i][4] === "Active" ? "Inactive" : "Active";
      sh.getRange(i + 1, 5).setValue(newStatus);
      SpreadsheetApp.flush();
      invalidateCache([CONFIG.SHEET_USERS]);
      writeLog("UPDATE_USER", `Đổi trạng thái user ID: ${rows[i][0]} -> ${newStatus}`);
      return { success: true, message: `Đã đổi trạng thái thành ${newStatus}`, status: newStatus };
    }
  }
  return { success: false, error: "Không tìm thấy người dùng trong hệ thống" };
}