const fs = require('fs');
const path = 'c:/Users/pingt/OneDrive/WCP/WCP portal/admin.js';
let content = fs.readFileSync(path, 'utf8');

// The file has literals like openAdminBookModal('\') which causes syntax error if rendered. 
// However, since it's inside a template string in admin.js, the actual content in admin.js is:
// openAdminBookModal('\')
// Let's replace it with:
// openAdminBookModal('${b.id}')
content = content.replace(/openAdminBookModal\('\\'\)/g, "openAdminBookModal('${b.id}')");
content = content.replace(/deleteAdminBook\('\\'\)/g, "deleteAdminBook('${b.id}')");
content = content.replace(/openAdminBookModal\(''\)/g, "openAdminBookModal('${b.id}')"); // Just in case

// We also need to fix the members/departments/events tables.
content = content.replace(/deleteAdminBook\('\\'\)/g, "deleteAdminBook('${b.id}')");

fs.writeFileSync(path, content);
