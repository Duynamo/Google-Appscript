const fs = require('fs');
const path = require('path');

const userApi = fs.readFileSync(path.join(__dirname, '..', 'Userapi.gs'), 'utf8');
console.log('=== Functions in Userapi.gs ===');
userApi.split('\n').forEach((l, i) => {
  if (l.trim().startsWith('function ')) console.log(`Line ${i+1}: ${l.trim()}`);
});

const html = fs.readFileSync(path.join(__dirname, '..', 'Index.html'), 'utf8');

const pUsersIdx = html.indexOf('id="page-users"');
if (pUsersIdx !== -1) {
  const nextDiv = html.indexOf('id="page-', pUsersIdx + 20);
  console.log('\n=== page-users in Index.html ===');
  console.log(html.substring(pUsersIdx, nextDiv !== -1 ? nextDiv : pUsersIdx + 800));
}

// Find JS functions related to users
console.log('\n=== JS functions for users in Index.html ===');
const jsFns = ['loadPgUsr', 'renderPgUsr', 'openUserModal', 'saveUser', 'delUser'];
jsFns.forEach(fn => {
  const idx = html.indexOf('function ' + fn);
  if (idx !== -1) console.log(`Found ${fn} at char ${idx}`);
});

