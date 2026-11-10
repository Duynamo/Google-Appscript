const fs = require('fs');
const vm = require('vm');
const content = fs.readFileSync('03_Project Management/Index.html', 'utf8');
const scriptMatches = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
const code = scriptMatches[0].replace(/<script[^>]*>|<\/script>/gi, '');

fs.writeFileSync('scratch/extracted_index_script.js', code, 'utf8');

const { execSync } = require('child_process');
try {
  execSync('node --check scratch/extracted_index_script.js');
  console.log('Valid!');
} catch (e) {
  console.log('Syntax check output:');
  console.log(e.stderr.toString());
}

