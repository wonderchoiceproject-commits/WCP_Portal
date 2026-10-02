const fs = require('fs');
let c = fs.readFileSync('admin.js', 'utf8');

// The books table has these lines:
// <button class="admin-action-btn btn-edit" onclick="alert('未実装')">編集</button>
// <button class="admin-action-btn btn-delete" onclick="alert('未実装')">削除</button>
// But ONLY in the Books section!

let s = c.indexOf('// Render Books');
let e = c.indexOf('// Render Events', s);

let part = c.slice(s, e);
part = part.replace(/onclick="alert\('未実装'\)">編集<\/button>/g, 'onclick="openAdminBookModal(\'${b.id}\')">編集</button>');
part = part.replace(/onclick="alert\('未実装'\)">削除<\/button>/g, 'onclick="deleteAdminBook(\'${b.id}\')">削除</button>');

c = c.slice(0, s) + part + c.slice(e);

// We also need to fix it inside saveAdminBook around line 680
let s2 = c.indexOf('// Re-render', e);
let e2 = c.indexOf('async function deleteAdminBook', s2);

if (s2 !== -1 && e2 !== -1) {
    let part2 = c.slice(s2, e2);
    part2 = part2.replace(/onclick="alert\('未実装'\)">編集<\/button>/g, 'onclick="openAdminBookModal(\'${b.id}\')">編集</button>');
    part2 = part2.replace(/onclick="alert\('未実装'\)">削除<\/button>/g, 'onclick="deleteAdminBook(\'${b.id}\')">削除</button>');
    c = c.slice(0, s2) + part2 + c.slice(e2);
}

fs.writeFileSync('admin.js', c);
