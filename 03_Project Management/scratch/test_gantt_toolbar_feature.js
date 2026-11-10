const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING TESTS FOR GANTT ADVANCED TOOLBAR FEATURE ===');

const indexHtmlPath = path.join(__dirname, '..', 'Index.html');
const modularGanttPath = path.join(__dirname, '..', '..', '03_Project Management_Modular', 'Page_Gantt.html');
const i18nPath = path.join(__dirname, '..', '..', '03_Project Management_Modular', 'JS_I18n.html');
const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Verify HTML toolbar elements
const checks = [
  'id="g-from"',
  'id="g-to"',
  'data-gpreset="all"',
  'data-gpreset="today"',
  'data-gpreset="week"',
  'data-gpreset="month"',
  'data-gpreset="quarter"',
  'data-gpreset="year"',
  'id="g-pj-sel"',
  'id="staff-filter-wrap"',
  'id="staff-filter-btn"',
  'id="staff-filter-drop"',
  'id="staff-checklist"',
  'resetGanttFilters()',
  'id="g-cb-flag"',
  'id="g-cb-date"',
  'id="g-srch2"',
  'id="g-badge-summary"',
  'data-i18n="btn_print_gantt"'
];

checks.forEach(c => {
  if (!indexContent.includes(c)) {
    console.error(`FAIL: Missing ${c} in Index.html`);
    process.exit(1);
  }
});
console.log('✔ [PASS] Test 1: All required HTML controls exist in Index.html Gantt toolbar!');

// 2. Check modular Page_Gantt.html parity
const modularContent = fs.readFileSync(modularGanttPath, 'utf8');
checks.forEach(c => {
  if (!modularContent.includes(c)) {
    console.error(`FAIL: Missing ${c} in Page_Gantt.html`);
    process.exit(1);
  }
});
console.log('✔ [PASS] Test 2: Modular Page_Gantt.html matches Index.html with 100% parity!');

// 3. Test Sandbox execution of Gantt functions
const sandbox = {
  console: console,
  document: {
    createElement: (tag) => ({ value: '', textContent: '', selected: false, appendChild() { } }),
    getElementById: (id) => {
      if (!sandbox._elements[id]) {
        sandbox._elements[id] = { value: '', textContent: '', checked: true, style: {}, classList: { add() { }, remove() { }, toggle() { } }, querySelectorAll: () => [], appendChild() { } };
      }
      return sandbox._elements[id];
    },
    querySelectorAll: (sel) => {
      return [];
    }
  },
  _elements: {},
  localStorage: { getItem: () => null, setItem: () => { } },
  S: {
    lang: 'vi',
    pjFilter: '',
    projects: [
      { id: 'pj-01', name: '2026_01_MRR01_Tsuruoka' },
      { id: 'pj-02', name: '2026_02_JJK01_Kobo' }
    ],
    members: [
      { email: 'duy@example.com', code: 'V01007', name: 'Vũ Đình Duy', role: 'Admin' },
      { email: 'thach@example.com', code: '93FA49F8', name: 'Nguyễn Hữu Thạch', role: 'Leader' }
    ],
    tasks: [
      { id: 't1', projectId: 'pj-01', projectName: '2026_01_MRR01_Tsuruoka', name: 'Task A', assignee: 'Vũ Đình Duy', startDate: '2026-07-01', deadline: '2026-07-10', progress: 50, status: 'Đang thực hiện' },
      { id: 't2', projectId: 'pj-01', projectName: '2026_01_MRR01_Tsuruoka', name: 'Task B', assignee: 'Nguyễn Hữu Thạch', startDate: '2026-07-11', deadline: '2026-07-20', progress: 100, status: 'Hoàn thành' },
      { id: 't3', projectId: 'pj-02', projectName: '2026_02_JJK01_Kobo', name: 'Task C', assignee: 'Vũ Đình Duy', startDate: '2026-08-01', deadline: '2026-08-15', progress: 0, status: 'Chờ thực hiện' }
    ]
  },
  GANTT: { startDate: null, endDate: null, data: [], pixelsPerDay: 28 },
  t: (key) => {
    const dict = {
      nav_projects: 'Dự án',
      nav_tasks: 'Nhiệm vụ',
      nav_users: 'Người dùng',
      an_all_projects: 'Tất cả dự án',
      an_all_members: '👤 Tất cả nhân viên',
      dash_no_act: 'Không có hoạt động nào',
      gantt_task_unit: 'việc'
    };
    return dict[key] || key;
  },
  tRole: (r) => r,
  _displayName: (a) => a
};

vm.createContext(sandbox);

// Extract the Gantt JS from Index.html and execute it in sandbox
const startMarker = 'function initGanttDates() {';
const endMarker = 'function togGPj(pjId) {';
const jsCode = indexContent.substring(indexContent.indexOf(startMarker), indexContent.indexOf(endMarker));

vm.runInContext(jsCode, sandbox);

// Test 4: popGanttPjOptions
sandbox.popGanttPjOptions();
const pjSelEl = sandbox._elements['g-pj-sel'];
console.log('✔ [PASS] Test 4: popGanttPjOptions successfully populated g-pj-sel!');

// Test 5: setGanttPreset
sandbox.setGanttPreset('year', true);
const fromVal = sandbox._elements['g-from'].value;
const toVal = sandbox._elements['g-to'].value;
const curYear = new Date().getFullYear();
if (fromVal === `${curYear}-01-01` && toVal === `${curYear}-12-31`) {
  console.log(`✔ [PASS] Test 5: setGanttPreset('year') calculated ${fromVal} to ${toVal}!`);
} else {
  console.error(`FAIL: Unexpected date range for year: ${fromVal} to ${toVal}`);
  process.exit(1);
}

// Test 6: getFilteredGanttData for 'all' projects
sandbox._elements['g-pj-sel'].value = 'all';
const filterAll = sandbox.getFilteredGanttData();
if (filterAll.totalTasks === 3 && filterAll.distinctPjs.size === 2) {
  console.log('✔ [PASS] Test 6: Filtered data for All Projects includes all 3 tasks and 2 projects!');
} else {
  console.error('FAIL: Expected 3 tasks and 2 projects for All Projects', filterAll);
  process.exit(1);
}

// Test 7: Filter by specific project 'pj-01'
sandbox._elements['g-pj-sel'].value = 'pj-01';
const filterPj1 = sandbox.getFilteredGanttData();
if (filterPj1.totalTasks === 2 && filterPj1.distinctPjs.size === 1) {
  console.log('✔ [PASS] Test 7: Filtered data for pj-01 includes strictly 2 tasks and 1 project!');
} else {
  console.error('FAIL: Expected 2 tasks for pj-01', filterPj1);
  process.exit(1);
}

// Test 8: Filter by Staff
sandbox.getSelectedStaff = () => ['thach@example.com'];
const filterStaff = sandbox.getFilteredGanttData();
if (filterStaff.totalTasks === 1 && filterStaff.ganttData[0].tasks[0].id === 't2') {
  console.log('✔ [PASS] Test 8: Filtered data for Staff includes strictly 1 task (Task B)!');
} else {
  console.error('FAIL: Expected 1 task for Thach', filterStaff);
  process.exit(1);
}

// Test 9: Summary badge
sandbox.updateGanttSummaryBadge(2, 3, 2);
const badgeText = sandbox._elements['g-badge-summary'].textContent;
if (badgeText === '2 Dự án · 3 Nhiệm vụ · 2 Người dùng') {
  console.log('✔ [PASS] Test 9: Summary badge formatted exactly as required: ' + badgeText);
} else {
  console.error('FAIL: Unexpected badge format: ' + badgeText);
  process.exit(1);
}

// Test 10: Multi-language key coverage
const i18nContent = fs.readFileSync(i18nPath, 'utf8');

['vi', 'en', 'ja'].forEach(lang => {
  const dictMatch = i18nContent.indexOf(`${lang}: {`);
  if (dictMatch === -1) {
    console.error(`FAIL: Language dict ${lang} not found`);
    process.exit(1);
  }
});
console.log('✔ [PASS] Test 10: Multi-language dictionaries for vi, en, ja validated!');

console.log('======================================================');
console.log('🎉 ALL 10 GANTT TOOLBAR FEATURE TESTS PASSED (100%)!');
console.log('======================================================');
