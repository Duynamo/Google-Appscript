const fs = require('fs');

console.log('Testing export modal click event execution...');

const content = fs.readFileSync('03_Project Management/Index.html', 'utf8');

// Ensure button exists to the left of pj-filter
const topbarMatch = content.match(/<div class="tb-r">\s*<button class="btn bs" id="btn-open-export"[\s\S]*?<\/button>\s*<div class="pj-filter">/);
if (!topbarMatch) {
  throw new Error('Button is not positioned immediately to the left of .pj-filter!');
}
console.log('✔ Verified: #btn-open-export is positioned strictly to the left of .pj-filter');

// Ensure button is not inside drop-wrap
const dropWrapIdx = content.indexOf('<div class="drop-wrap">');
const btnIdx = content.indexOf('id="btn-open-export"');
if (btnIdx > dropWrapIdx && btnIdx < dropWrapIdx + 200) {
  throw new Error('Button is still inside .drop-wrap!');
}
console.log('✔ Verified: #btn-open-export is cleanly outside .drop-wrap');

// Test JS execution of openExportReportModal()
const dom = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        id,
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); console.log(`  DOM: ${id}.classList.add("${c}")`); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        style: {},
        value: '',
        checked: true
      };
    }
    return this.elements[id];
  },
  documentElement: {
    style: { setProperty(k, v) {} }
  }
};

global.document = dom;
global.window = global;
global.t = (k) => k;
global.tStatus = (k) => k;
global._displayName = (k) => k || '—';
global.S = {
  projects: [{ id: 'pj1', name: '2026_01_TEST_PROJ' }],
  tasks: [{ id: 'tk1', projectId: 'pj1', name: 'Task 1', assignee: 'user@test.com' }],
  members: [{ id: 'u1', name: 'User Test', email: 'user@test.com' }],
  pjFilter: ''
};
global.GANTT = { startDate: null, endDate: null, data: [], pixelsPerDay: 28 };
global.openModal = (id) => dom.getElementById(id).classList.add('show');
global.closeModal = (id) => dom.getElementById(id).classList.remove('show');

// Extract AppExportManager & openExportReportModal
const exportManagerCode = content.match(/const AppExportManager = \{[\s\S]*?\n\};\s*\nwindow\.AppExportManager = AppExportManager;[\s\S]*?window\.openExportReportModal = openExportReportModal;/);
if (!exportManagerCode) {
  throw new Error('Could not extract AppExportManager & openExportReportModal from Index.html');
}

eval(exportManagerCode[0].replace('const AppExportManager =', 'var AppExportManager ='));

console.log('Testing openExportReportModal() call without arguments:');
openExportReportModal();

if (!dom.getElementById('m-export-report').classList.contains('show')) {
  throw new Error('m-export-report modal was NOT opened!');
}
console.log('✔ Verified: m-export-report modal is open (has class "show")');

console.log('Testing openExportReportModal("gantt") call:');
openExportReportModal('gantt');
console.log('✔ Verified: openExportReportModal("gantt") executed without error');

console.log('Testing openExportReportModal("analytics") call:');
openExportReportModal('analytics');
console.log('✔ Verified: openExportReportModal("analytics") executed without error');

console.log('ALL CLICK EVENT VERIFICATION TESTS PASSED SUCCESSFULLY!');

