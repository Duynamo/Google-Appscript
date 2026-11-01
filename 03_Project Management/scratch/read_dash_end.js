const fs = require('fs');
const lines = fs.readFileSync('03_Project Management/Index.html', 'utf8').split('\n');

for (let i = 642; i < 652; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

