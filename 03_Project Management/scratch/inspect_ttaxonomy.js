const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const tIdx = code.indexOf('function tTaxonomy');
if (tIdx !== -1) {
  console.log(code.substring(tIdx, tIdx + 1000));
} else {
  console.log('function tTaxonomy not found');
}

