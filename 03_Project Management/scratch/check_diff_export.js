const { execSync } = require('child_process');

try {
  const diff = execSync('git diff -U3 "03_Project Management/Index.html"', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const lines = diff.split('\n');
  const exportLines = lines.filter((l, i) => {
    return l.includes('exportJapanese') || l.includes('openTsDrilldownModal');
  });
  console.log('Export matches in diff:', exportLines);

  // Check if any deleted line had exportJapanese
  const deleted = lines.filter(l => l.startsWith('-') && l.includes('exportJapanese'));
  console.log('Deleted lines with exportJapanese:', deleted);
} catch (e) {
  console.error(e);
}

