const fs = require('fs');
const path = 'c:/Users/pingt/OneDrive/WCP/WCP portal/admin.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/onclick="deleteAdminBook\('\$\{b\.id\}'\)"/g, 'onclick="alert(\'未実装\')"');
content = content.replace(/onclick="openAdminBookModal\('\$\{b\.id\}'\)"/g, 'onclick="alert(\'未実装\')"');

fs.writeFileSync(path, content);
