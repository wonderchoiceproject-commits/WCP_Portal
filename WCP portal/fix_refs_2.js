const fs = require('fs');
const path = 'c:/Users/pingt/OneDrive/WCP/WCP portal/admin.js';
let content = fs.readFileSync(path, 'utf8');

// The books table rendering is between "// Render Books" and "// Render Events"
const renderBooksStartIndex = content.indexOf('// Render Books');
const renderEventsStartIndex = content.indexOf('// Render Events');

if (renderBooksStartIndex !== -1 && renderEventsStartIndex !== -1) {
    let beforeBooks = content.substring(0, renderBooksStartIndex);
    let booksSection = content.substring(renderBooksStartIndex, renderEventsStartIndex);
    let afterBooks = content.substring(renderEventsStartIndex);

    // Restore the onclicks for booksSection
    booksSection = booksSection.replace(/onclick="alert\('未実装'\)"/g, function(match, offset, str) {
        // We know there are two buttons: btn-edit and btn-delete
        // Let's just do a simpler replace based on class
        return match; // We'll fix it below instead
    });

    // Actually, let's just rewrite the buttons in booksSection directly.
    booksSection = booksSection.replace(/<button class="admin-action-btn btn-edit" onclick="alert\('未実装'\)">編集<\/button>/g, '<button class="admin-action-btn btn-edit" onclick="openAdminBookModal(\\'${b.id}\\')">編集</button>');
    booksSection = booksSection.replace(/<button class="admin-action-btn btn-delete" onclick="alert\('未実装'\)">削除<\/button>/g, '<button class="admin-action-btn btn-delete" onclick="deleteAdminBook(\\'${b.id}\\')">削除</button>');

    content = beforeBooks + booksSection + afterBooks;
}

// And also fix inside saveAdminBook which has // Re-render books
const saveAdminBookIndex = content.indexOf('async function saveAdminBook');
if (saveAdminBookIndex !== -1) {
    let saveAdminSection = content.substring(saveAdminBookIndex);
    let beforeSave = content.substring(0, saveAdminBookIndex);
    
    saveAdminSection = saveAdminSection.replace(/<button class="admin-action-btn btn-edit" onclick="alert\('未実装'\)">編集<\/button>/g, '<button class="admin-action-btn btn-edit" onclick="openAdminBookModal(\\'${b.id}\\')">編集</button>');
    saveAdminSection = saveAdminSection.replace(/<button class="admin-action-btn btn-delete" onclick="alert\('未実装'\)">削除<\/button>/g, '<button class="admin-action-btn btn-delete" onclick="deleteAdminBook(\\'${b.id}\\')">削除</button>');
    
    content = beforeSave + saveAdminSection;
}

fs.writeFileSync(path, content);
