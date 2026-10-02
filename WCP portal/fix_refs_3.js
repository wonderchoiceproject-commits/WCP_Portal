const fs = require('fs');
const path = 'c:/Users/pingt/OneDrive/WCP/WCP portal/admin.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /<button class="admin-action-btn btn-edit" onclick="alert\('未実装'\)">編集<\/button>\s*<button class="admin-action-btn btn-delete" onclick="alert\('未実装'\)">削除<\/button>/g;

// Instead of doing it globally, let's target the exact string blocks
content = content.replace(
`                <button class="admin-action-btn btn-edit" onclick="alert('未実装')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="alert('未実装')">削除</button>`,
`                <button class="admin-action-btn btn-edit" onclick="openAdminBookModal('\${b.id}')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="deleteAdminBook('\${b.id}')">削除</button>`);

// Since there are two occurrences (in renderAdminTables and in saveAdminBook), we'll do it twice.
content = content.replace(
`                <button class="admin-action-btn btn-edit" onclick="alert('未実装')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="alert('未実装')">削除</button>`,
`                <button class="admin-action-btn btn-edit" onclick="openAdminBookModal('\${b.id}')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="deleteAdminBook('\${b.id}')">削除</button>`);

fs.writeFileSync(path, content);
