const fs = require('fs');
const lines = fs.readFileSync('03_Project Management/Index.html', 'utf8').split('\n');

for (let i = 899; i < 913; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

