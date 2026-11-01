const fs = require('fs');
const content = fs.readFileSync('03_Project Management/Taxonomyapi.gs', 'utf8');
const match = content.match(/const DEFAULT_TAXONOMY_LIST = (\[[\s\S]*?\]);/);
if (match) {
  const list = eval(match[1]);
  console.log('Categories:');
  list.filter(x => x.type === 'CATEGORY').forEach(c => console.log(`  ${c.code}: ${c.name_vi} (${c.name_jp})`));
  console.log('\nPhases:');
  list.filter(x => x.type === 'PHASE').forEach(p => console.log(`  ${p.code}: ${p.name_vi} (${p.name_jp})`));
  console.log('\nDisciplines (46):');
  list.filter(x => x.type === 'DISCIPLINE').forEach(d => console.log(`  ${d.code}: ${d.name_vi} | ${d.name_en} | ${d.name_jp}`));
}

