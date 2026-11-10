const fs = require('fs');
const content = fs.readFileSync('03_Project Management/Index.html', 'utf8');
const scriptMatches = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
const code = scriptMatches[0].replace(/<script[^>]*>|<\/script>/gi, '');

try {
  new Function(code);
  console.log('Index.html Script is valid!');
} catch (e) {
  console.error('Index.html Error:', e.message);
  // Find where error is by slicing
  const lines = code.split('\n');
  let low = 0, high = lines.length;
  while (low < high - 1) {
    const mid = Math.floor((low + high) / 2);
    try {
      new Function(lines.slice(0, mid).join('\n'));
      low = mid;
    } catch (err) {
      if (err.message.includes('Unexpected end of input') || err.message.includes('missing }') || err.message.includes('Unexpected token')) {
        // syntax error might be before or unclosed block
      }
      high = mid;
    }
  }
  console.log('Error around line:', high);
  console.log(lines.slice(Math.max(0, high - 10), Math.min(lines.length, high + 10)).map((l, i) => (high - 10 + i) + ': ' + l).join('\n'));
}

