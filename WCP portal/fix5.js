const fs = require('fs');
let c = fs.readFileSync('admin.js', 'utf8');

// Fix deleteAdminBook
let s3 = c.indexOf('async function deleteAdminBook');
if (s3 !== -1) {
    let part3 = c.slice(s3);
    part3 = part3.replace(/onclick="alert\('未実装'\)">編集<\/button>/g, 'onclick="openAdminBookModal(\'${b.id}\')">編集</button>');
    part3 = part3.replace(/onclick="alert\('未実装'\)">削除<\/button>/g, 'onclick="deleteAdminBook(\'${b.id}\')">削除</button>');
    c = c.slice(0, s3) + part3;
}

fs.writeFileSync('admin.js', c);
