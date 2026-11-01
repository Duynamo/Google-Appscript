const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

// Read run_full_compatibility_suite.js
const suite = fs.readFileSync(path.join(root, 'scratch', 'run_full_compatibility_suite.js'), 'utf8');

// Run the suite and catch any error in seedRes
try {
  require('./run_full_compatibility_suite.js');
} catch(e) {
  console.error("Suite Exception:", e);
}

