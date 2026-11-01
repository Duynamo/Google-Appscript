const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'Taxonomyapi.gs'), 'utf8');

// Look for disciplines or getTaxonomy
const taxIdx = code.indexOf('getTaxonomyData');
if (taxIdx !== -1) {
  console.log(code.substring(taxIdx, taxIdx + 1200));
} else {
  console.log('getTaxonomyData not found, looking for disciplines');
  const dIdx = code.indexOf('disciplines');
  if (dIdx !== -1) {
    console.log(code.substring(dIdx - 50, dIdx + 500));
  }
}

