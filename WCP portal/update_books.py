import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace renderBookList function
new_render_func = '''    function renderBookList(books) {
        if (books.length === 0) return '<div style="text-align:center; padding:2rem; color:var(--text-muted); grid-column: 1 / -1;">該当する本が見つかりませんでした</div>';
        return books.map((book, index) => {
            const rank = index + 1;
            const coverUrl = book.coverImage || \https://picsum.photos/seed/\/200/300\;
            
            let buttonsHtml = '';
            if (book.status === 'available') {
                buttonsHtml += \<button class="manga-action-btn" onclick="openBorrowModal('\')">借りる</button>\;
            } else {
                buttonsHtml += \<button class="manga-action-btn danger" onclick="returnBook('\')">返却</button>\;
                buttonsHtml += \<button class="manga-action-btn warning" onclick="openReserveModal('\')">予約</button>\;
            }
            buttonsHtml += \<button class="manga-action-btn" style="background:#6c5ce7;" onclick="openReviewModal('\')">感想文</button>\;
            buttonsHtml += \<button class="manga-action-btn" style="background:var(--accent-green);" onclick="openAddReviewModal('', '\')">提出</button>\;

            let statusHtml = '';
            if (book.status === 'available') {
                if (book.preserve && String(book.preserve).split(',').filter(Boolean).length > 0) {
                    statusHtml = '<span style="position:absolute; bottom:5px; right:5px; background:var(--accent-yellow); color:#333; font-size:0.7rem; padding:2px 5px; border-radius:3px; z-index:10; font-weight:bold;">予約あり</span>';
                } else {
                    statusHtml = '<span style="position:absolute; bottom:5px; right:5px; background:var(--accent-blue); color:#fff; font-size:0.7rem; padding:2px 5px; border-radius:3px; z-index:10; font-weight:bold;">貸出可能</span>';
                }
            } else {
                const borrowerName = getMemberNameFromSquad(book.borrower);
                statusHtml = \<span style="position:absolute; bottom:5px; right:5px; background:var(--accent-pink); color:#fff; font-size:0.7rem; padding:2px 5px; border-radius:3px; z-index:10; font-weight:bold;">貸出中 (\)</span>\;
            }
            
            const genreText = book.genre || 'ファンタジー・SF';

            return \
            <div class="manga-card">
                <div class="manga-cover-wrapper">
                    <div class="manga-rank-ribbon">\</div>
                    <img class="manga-cover-img" src="\" alt="カバー画像">
                    \
                    <div class="manga-action-overlay">
                        \
                    </div>
                </div>
                <div class="manga-title">\</div>
                <div class="manga-meta">\<br><span>\ | 毎週更新</span></div>
            </div>
            \;
        }).join('');
    }'''

# Find the start and end of renderBookList
pattern = re.compile(r'    function renderBookList\(books\) \{.*?\n    \}', re.DOTALL)
content = pattern.sub(new_render_func, content)

# Replace 'book-shelf-grid' with 'manga-grid'
content = content.replace('book-shelf-grid', 'manga-grid')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated app.js")
