const fs = require('fs');
const dir = '03_Project Management_Modular';
const files = fs.readdirSync(dir);
files.forEach(f => {
  if (f.endsWith('.html') || f.endsWith('.js')) {
    const c = fs.readFileSync(dir + '/' + f, 'utf8');
    const matches = [];
    if (c.includes('renderPgTkGroups')) matches.push('renderPgTkGroups');
    if (c.includes('renderGantt')) matches.push('renderGantt');
    if (c.includes('fillTpForm')) matches.push('fillTpForm');
    if (c.includes('onTaskTaxonomyChange')) matches.push('onTaskTaxonomyChange');
    if (c.includes('tTaxonomy')) matches.push('tTaxonomy');
    if (c.includes('AppExportManager')) matches.push('AppExportManager');
    if (c.includes('_displayName')) matches.push('_displayName');
    if (matches.length) {
      console.log(`${f}: [${matches.join(', ')}]`);
    }
  }
});

