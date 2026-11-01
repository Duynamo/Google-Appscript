const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const tsPath = path.join(rootDir, 'Timesheetapi.gs');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const targetOld = `    if (shRollup && shRollup.getLastRow() >= 2) {
      const rollupData = shRollup.getRange(2, 1, shRollup.getLastRow() - 1, 11).getValues();
      rollupData.forEach(r => {
        const rowPj = String(r[4] || "").trim().toUpperCase();
        if (rowPj !== pCode) return;

        let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").slice(0, 10);
        if (startDate && rDate < startDate) return;
        if (endDate && rDate > endDate) return;

        const dur = Number(r[8]) || 0;
        const off = Number(r[9]) || 0;
        const ot = Number(r[10]) || 0;

        const sCode = String(r[2] || "").trim().toUpperCase();
        const sName = String(r[3] || sCode);
        const dCode = String(r[7] || "GEN").trim().toUpperCase();

        currentYearTotalHours += dur;
        officialHours += off;
        otHours += ot;

        // Gom theo nhân sự
        if (!memberMap[sCode]) {
          memberMap[sCode] = { code: sCode, name: sName, hours: 0, workDays: new Set() };
        }
        memberMap[sCode].hours += dur;
        memberMap[sCode].workDays.add(rDate);

        // Gom theo tác nghiệp
        discMap[dCode] = (discMap[dCode] || 0) + dur;
      });
    }

    const curYrHoursRounded = Number(currentYearTotalHours.toFixed(1));`;

const targetNew = `    if (shRollup && shRollup.getLastRow() >= 2) {
      const rollupData = shRollup.getRange(2, 1, shRollup.getLastRow() - 1, 11).getValues();
      rollupData.forEach(r => {
        const rowPj = String(r[4] || "").trim().toUpperCase();
        const matchPj = (rowPj === pCode) || (rowPj && pCode && (rowPj.includes(pCode) || pCode.includes(rowPj)));
        if (!matchPj) return;

        let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").slice(0, 10);
        if (startDate && rDate < startDate) return;
        if (endDate && rDate > endDate) return;

        const dur = Number(r[8]) || 0;
        const off = Number(r[9]) || 0;
        const ot = Number(r[10]) || 0;

        const sCode = String(r[2] || "").trim().toUpperCase();
        const sName = String(r[3] || sCode);
        const dCode = String(r[7] || "GEN").trim().toUpperCase();

        currentYearTotalHours += dur;
        officialHours += off;
        otHours += ot;

        // Gom theo nhân sự
        if (!memberMap[sCode]) {
          memberMap[sCode] = { code: sCode, name: sName, hours: 0, workDays: new Set() };
        }
        memberMap[sCode].hours += dur;
        memberMap[sCode].workDays.add(rDate);

        // Gom theo tác nghiệp
        discMap[dCode] = (discMap[dCode] || 0) + dur;
      });
    }

    // Fallback nếu Rollup chưa kịp cập nhật hoặc đang trống
    if (currentYearTotalHours === 0) {
      const curYr = new Date().getFullYear();
      const shTs = ss.getSheetByName(getTimesheetYearSheetName(curYr));
      if (shTs && shTs.getLastRow() >= 2) {
        const tsData = shTs.getRange(2, 1, shTs.getLastRow() - 1, 18).getValues();
        tsData.forEach(r => {
          const rowPj = String(r[7] || "").trim().toUpperCase();
          const matchPj = (rowPj === pCode) || (rowPj && pCode && (rowPj.includes(pCode) || pCode.includes(rowPj)));
          if (!matchPj) return;

          let rDate = (r[1] instanceof Date) ? Utilities.formatDate(r[1], "Asia/Ho_Chi_Minh", "yyyy-MM-dd") : String(r[1] || "").slice(0, 10);
          if (startDate && rDate < startDate) return;
          if (endDate && rDate > endDate) return;

          const slotType = String(r[6] || "Official");
          if (slotType === "Lunch") return;

          const dur = Number(r[5]) || 0.5;
          const isOT = slotType.startsWith("OT");
          const sCode = String(r[13] || "").trim().toUpperCase();
          const sName = String(r[14] || sCode);
          const dCode = String(r[10] || "OTHER").trim().toUpperCase();

          currentYearTotalHours += dur;
          if (isOT) otHours += dur; else officialHours += dur;

          if (!memberMap[sCode]) {
            memberMap[sCode] = { code: sCode, name: sName, hours: 0, workDays: new Set() };
          }
          memberMap[sCode].hours += dur;
          memberMap[sCode].workDays.add(rDate);

          discMap[dCode] = (discMap[dCode] || 0) + dur;
        });
      }
    }

    const curYrHoursRounded = Number(currentYearTotalHours.toFixed(1));`;

const normTs = tsContent.replace(/\r\n/g, '\n');
const normOld = targetOld.replace(/\r\n/g, '\n');

if (normTs.includes(normOld)) {
  const updatedTs = normTs.replace(normOld, targetNew.replace(/\r\n/g, '\n'));
  fs.writeFileSync(tsPath, updatedTs.replace(/\n/g, '\r\n'), 'utf8');
  console.log("✅ Timesheetapi.gs updated successfully!");
} else {
  console.log("⚠️ Target not found in Timesheetapi.gs");
}

