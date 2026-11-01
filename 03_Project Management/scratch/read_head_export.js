const { execSync } = require('child_process');

try {
  const oldHtml = execSync('git show HEAD:"03_Project Management/Index.html"', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const idx = oldHtml.indexOf('Nghiệm Thu');
  if (idx !== -1) {
    console.log('Old snippet:');
    console.log(oldHtml.substring(idx - 100, idx + 200));
  } else {
    console.log('Not found in HEAD');
  }

  const exportIdx = oldHtml.indexOf('exportJapanese');
  if (exportIdx !== -1) {
    console.log('Old export found at:', exportIdx);
    console.log(oldHtml.substring(exportIdx - 50, exportIdx + 200));
  } else {
    console.log('exportJapanese not found in HEAD');
  }
} catch (e) {
  console.error(e);
}

