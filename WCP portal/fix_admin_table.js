const fs = require('fs');
const path = 'c:/Users/pingt/OneDrive/WCP/WCP portal/admin.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /<tr>\s*<td>\$\{b\.id\}<\/td>/g;
const replacement = `<tr>
            <td><img src="\${b.coverImage || 'https://via.placeholder.com/50'}" style="width: 40px; border-radius: 4px; object-fit: cover;"></td>
            <td>\${b.id}</td>`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content);
