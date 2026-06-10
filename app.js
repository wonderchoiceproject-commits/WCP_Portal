// ==========================================
// CONFIGURATION & STATE
// ==========================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyGQU0GV6xbSBwKAxYFdLh0hWSE4kkL37JcphckJUiYofPwKvAnX3CzsRQ0SJfgk74o/exec';
let currentView = 'home';
let viewHistory = [];
let isLoading = true;

// Mock Data (will be overwritten by GAS)
let mockData = {
    news: [],
    books: [],
    reviews: [],
    members: [],
    events: []
};

// ==========================================
// CATEGORY REQUIREMENTS
// ==========================================
const CATEGORY_REQUIREMENTS = {
    'Beginner': [
        { name: '社会人基礎能力テストで合格', icon: 'fa-clipboard-check' },
        { name: 'メール文テストで合格', icon: 'fa-envelope-circle-check' },
        { name: '議事録テストで合格', icon: 'fa-file-signature' },
        { name: '経理テストで合格', icon: 'fa-calculator' },
        { name: '累計プロジェクトアサイン数1以上', icon: 'fa-briefcase' },
        { name: '読書1冊以上', icon: 'fa-book-open' },
        { name: 'GPA1以上', icon: 'fa-graduation-cap' }
    ],
    'Member': [
        { name: '企画書テストで合格', icon: 'fa-lightbulb' },
        { name: 'メール文ロープレテストで合格', icon: 'fa-id-card-clip' },
        { name: '議事録ロープレテストで合格', icon: 'fa-file-lines' },
        { name: '経理ロープレテストで合格', icon: 'fa-sack-dollar' },
        { name: 'Grow5以上', icon: 'fa-chart-line' },
        { name: '課題図書5冊制覇', icon: 'fa-book-atlas' },
        { name: 'タイピング3000円コースクリア', icon: 'fa-keyboard' },
        { name: 'メンバーアサイン数1人以上', icon: 'fa-user-plus' },
        { name: '累計プロジェクトアサイン数 3以上', icon: 'fa-network-wired' },
        { name: 'Chief1人以上の推薦', icon: 'fa-thumbs-up' }
    ],
    'Assistant': [
        { name: 'ファシリテーションテストで合格', icon: 'fa-comments' },
        { name: '企画書ロープレテストで合格', icon: 'fa-paste' },
        { name: 'Grow6以上', icon: 'fa-chart-pie' },
        { name: '本を月に1冊以上読む', icon: 'fa-book-bookmark' },
        { name: 'タイピング5000円コースクリア', icon: 'fa-keyboard' },
        { name: 'メンバーアサイン数3人以上', icon: 'fa-users-gear' },
        { name: '累計プロジェクトアサイン数 4以上', icon: 'fa-folder-tree' },
        { name: '鬼プロ修了', icon: 'fa-fire' },
        { name: 'Core2人以上の推薦', icon: 'fa-star' }
    ],
    'Chief': [
        { name: '営業テストで合格', icon: 'fa-handshake' },
        { name: 'AIテストで合格', icon: 'fa-robot' },
        { name: 'Grow7以上', icon: 'fa-ranking-star' },
        { name: '本を月に1冊以上読む(Core)', icon: 'fa-book-open-reader' },
        { name: 'タイピング10000円コースクリア', icon: 'fa-keyboard' },
        { name: 'メンバーアサイン数5人以上', icon: 'fa-users-viewfinder' },
        { name: '累計プロジェクトアサイン数 6以上', icon: 'fa-diagram-project' },
        { name: '鬼修了', icon: 'fa-skull' },
        { name: '名刺100枚配りきる', icon: 'fa-address-card' },
        { name: 'Core過半数と大人', icon: 'fa-crown' }
    ]
};

function getNextCategoryInfo(currentCategory) {
    const categories = ['Beginner', 'Member', 'Assistant', 'Chief', 'Core'];
    const idx = categories.indexOf(currentCategory);
    if (idx >= 0 && idx < categories.length - 1) {
        return {
            name: categories[idx + 1],
            requirements: CATEGORY_REQUIREMENTS[currentCategory] || []
        };
    }
    return null;
}

// ==========================================
// ROUTING & NAVIGATION
// ==========================================
const appRoot = document.getElementById('app-root');
const navButtons = document.querySelectorAll('.nav-btn');

navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        
        // SPAページ(index.html)以外からアクセスされた場合は、index.htmlに遷移
        if (!appRoot) {
            window.location.href = `index.html?view=${view}`;
            return;
        }

        if(currentView !== view) {
            navigateTo(view);
        }
    });
});

function navigateTo(view, isBack = false) {
    if (!isBack && currentView) {
        viewHistory.push(currentView);
    }
    
    currentView = view;
    
    // Update active nav button
    navButtons.forEach(btn => {
        if(btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (isLoading) return;

    // Render corresponding view
    switch(view) {
        case 'home': renderHome(); break;
        case 'books': renderBooks(); break;
        case 'roster': renderRoster(); break;
        case 'schedule': renderSchedule(); break;
    }
}

window.goBack = function() {
    if (viewHistory.length > 0) {
        const previousView = viewHistory.pop();
        navigateTo(previousView, true);
    } else {
        navigateTo('home', true);
    }
};

function getBackButtonHtml() {
    if (viewHistory.length > 0) {
        return `<button class="cyber-btn" style="margin-bottom: 1.5rem;" onclick="goBack()"><i class="fa-solid fa-arrow-left"></i> 戻る</button>`;
    }
    return '';
}

// ==========================================
// API通信 (GET / POST)
// ==========================================
async function fetchPortalData() {
    isLoading = true;
    try {
        // ロード中のポップな演出
        appRoot.innerHTML = `
            <div style="text-align:center; margin-top:5rem; font-family: var(--font-heading);">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-blue);"></i>
                <div style="color: var(--accent-blue); letter-spacing: 2px; font-size: 1.5rem;">LOADING...</div>
            </div>`;

        const response = await fetch(GAS_API_URL);
        const data = await response.json();

        // 取得したデータで上書き
        mockData = data;
        isLoading = false;

        // データ取得完了後に現在のビューを描画
        navigateTo(currentView);
    } catch (error) {
        isLoading = false;
        console.error("データの取得に失敗しました:", error);
        appRoot.innerHTML = `
            <div style="text-align:center; margin-top:5rem; background: #fff; padding: 2rem; border: var(--border-width) solid var(--border-color); border-radius: 12px; box-shadow: var(--hard-shadow); display: inline-block;">
                <div style="color: #ff6b6b; font-family: var(--font-heading); font-size: 2rem; margin-bottom: 1rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i> ERROR!
                </div>
                <p style="font-weight: 700; margin-top: 1rem;">データの取得に失敗しました。</p>
            </div>`;
    }
}

// 汎用のデータ送信処理
async function sendAction(action, payload) {
    try {
        const response = await fetch(GAS_API_URL, {
            method: 'POST',
            // CORSのpreflightを回避するために text/plain で送信
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action, ...payload })
        });
        
        const result = await response.json();
        if(result.success) {
            return true;
        } else {
            alert("エラー: " + result.error);
            return false;
        }
    } catch (error) {
        console.error("送信エラー:", error);
        alert("通信エラーが発生しました。データが保存されていない可能性があります。");
        return false;
    }
}

// ==========================================
// VIEWS
// ==========================================

function renderHome() {
    let html = `
        <div class="view-animate">
            <h1 class="section-title">ホーム</h1>
            
            <!-- Marquee for Goal -->
            <div class="marquee-container">
                <div class="marquee-content">
                    <span class="marquee-text">ずとずとずとずとずと夢中</span>
                    <span class="marquee-text">ずとずとずとずとずと夢中</span>
                    <span class="marquee-text">ずとずとずとずとずと夢中</span>
                    <span class="marquee-text">ずとずとずとずとずと夢中</span>
                    <span class="marquee-text">ずとずとずとずとずと夢中</span>
                </div>
            </div>

            <div class="grid-2" style="margin-bottom: 4rem;">
                <div>
                    <h3 style="font-family: var(--font-heading); font-size: 4rem; margin-bottom: 1rem; color: var(--accent-blue); line-height: 1;">01_ 理念</h3>
                    <div style="font-family: var(--font-mono); font-size: 1.1rem; line-height: 1.8; color: var(--text-muted); border-left: 2px solid var(--border-color); padding-left: 1rem;">
                        <strong style="color: var(--accent-blue);">理念:</strong><br>
                        若者が自分たちの「やりたい」を追求し、自分の人生と自分に関わる人の人生全てを豊かにする。<br><br>
                        <strong style="color: var(--accent-blue);">ビジョン:</strong><br>
                        学生が多様でワクワクする将来の選択肢を、自分たちで創り出せる環境をつくる。<br><br>
                        <strong style="color: var(--accent-blue);">ミッション:</strong><br>
                        「街づくり」を通じて、地域や社会とつながりながら、若者が挑戦し成長する機会を提供する。
                    </div>
                </div>

                <div>
                    <h3 style="font-family: var(--font-heading); font-size: 4rem; margin-bottom: 1rem; color: var(--accent-yellow); line-height: 1;">02_ お知らせ</h3>
                    <div class="news-list" style="font-family: var(--font-mono); border-left: 2px solid var(--border-color); padding-left: 1rem; max-height: 250px; overflow-y: auto;">
                        ${mockData.news.map(item => `
                            <div class="news-item">
                                <div class="news-date">${item.date}</div>
                                <div style="color: var(--text-main); font-size: 1.1rem;">${item.text}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <h2 class="section-title">クイックアクセス</h2>
            <div class="typo-menu-list">
                <div class="typo-menu-item" onclick="window.location.href='about.html'">
                    <span class="typo-menu-index">01</span> [ WCPについて ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='system.html'">
                    <span class="typo-menu-index">02</span> [ システム ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='manual_email.html'">
                    <span class="typo-menu-index">03</span> [ マニュアル: メール ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='manual_proposal.html'">
                    <span class="typo-menu-index">04</span> [ マニュアル: 企画書 ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='manual_accounting.html'">
                    <span class="typo-menu-index">05</span> [ マニュアル: 経理 ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='manual_tools.html'">
                    <span class="typo-menu-index">06</span> [ マニュアル: ツール ]
                </div>
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

function renderBooks() {
    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title">図書管理</h1>
            <div class="grid-3">
                ${mockData.books.map(book => `
                    <div class="cyber-card">
                        <div class="book-cover">
                            <i class="fa-solid fa-book-journal-whills"></i>
                        </div>
                        <div class="book-title">${book.title}</div>
                        <div class="book-meta">${book.author}</div>
                        
                        <div style="margin-bottom: 1rem;">
                            ${book.status === 'available' 
                                ? `<span class="status-badge status-available">貸出可能</span>`
                                : `<span class="status-badge status-borrowed">貸出中: ${book.borrower} (期限: ${book.dueDate})</span>`
                            }
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem;">
                            ${book.status === 'available'
                                ? `<button class="cyber-btn" style="flex: 1;" onclick="openBorrowModal('${book.id}')">借りる</button>`
                                : `<button class="cyber-btn danger" style="flex: 1;" onclick="returnBook('${book.id}')">返却</button>`
                            }
                            <button class="cyber-btn" title="履歴を見る" onclick="openReviewModal('${book.id}')"><i class="fa-solid fa-clock-rotate-left"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

function renderRoster() {
    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title">メンバー名簿</h1>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${mockData.members.map(member => `
                    <div class="cyber-card member-card" style="cursor: pointer;" onclick="toggleMemberDetails('${member.squadNumber}')">
                        <div class="profile-header" style="margin-bottom: 0;">
                            <div class="avatar">${member.squadNumber}</div>
                            <div class="profile-info" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                                <h3 style="color: var(--accent-green); margin-bottom: 0.4rem; font-size: 1.4rem;">${member.name}</h3>
                                <div style="font-family: var(--font-heading); font-size: 0.95rem; color: var(--text-muted); display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap;">
                                    <span>背番号: <span style="color: var(--text-main); font-weight: bold;">${member.squadNumber}</span></span>
                                    <span>カテゴリー: <span style="color: var(--text-main); font-weight: bold;">${member.category || '未登録'}</span></span>
                                </div>
                            </div>
                            <div class="accordion-icon" id="icon-${member.squadNumber}" style="color: var(--accent-blue); font-size: 1.5rem; margin-right: 1rem; display: flex; align-items: center;">
                                <i class="fa-solid fa-chevron-down transition-icon"></i>
                            </div>
                        </div>
                        <div id="details-${member.squadNumber}" class="member-details">
                            <div class="detail-row" style="flex-direction: column;">
                                ${(() => {
                                    const nextCatInfo = getNextCategoryInfo(member.category);
                                    if (!nextCatInfo) {
                                        return `<div style="text-align: center; margin: 1rem 0; width: 100%; font-weight: bold; color: var(--accent-blue); text-shadow: 1px 1px 0px var(--border-color); letter-spacing: 2px;"><i class="fa-solid fa-crown" style="color: gold;"></i> ★すべてのカテゴリー条件を達成しました！</div>`;
                                    }
                                    const reqs = nextCatInfo.requirements;
                                    const iconsHtml = reqs.map(req => {
                                        const isCompleted = member[req.name] === true || member[req.name] === "TRUE";
                                        return `<div class="task-icon ${isCompleted ? 'unlocked' : 'locked'}" data-tooltip="${req.name}"><i class="fa-solid ${req.icon}"></i></div>`;
                                    }).join('');
                                    return `
                                        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 0.5rem;">
                                            <h4 style="font-size: 0.8rem; color: var(--accent-blue); text-transform: uppercase; margin-bottom: 0;"><i class="fa-solid fa-turn-up"></i> Next Step: ${nextCatInfo.name}への道</h4>
                                            <button class="cyber-btn member-edit-btn" onclick="event.stopPropagation(); openEditTasksModal('${member.squadNumber}', '${member.category}')"><i class="fa-solid fa-list-check"></i> 進捗更新</button>
                                        </div>
                                        <div class="task-icons-container">
                                            ${iconsHtml}
                                        </div>
                                    `;
                                })()}
                            </div>
                            
                            <div class="detail-row">
                                <div>
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">タイピング記録</h4>
                                    <div style="font-weight: bold;">${member.typingScore || '未登録'}</div>
                                </div>
                                <button class="cyber-btn member-edit-btn" onclick="event.stopPropagation(); openEditMemberModal('${member.squadNumber}', 'typingScore', '${member.typingScore || ''}')"><i class="fa-solid fa-pen"></i> 編集</button>
                            </div>
                            
                            <div class="detail-row">
                                <div style="flex: 1;">
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">バッジ</h4>
                                    <div class="badge-list">
                                        ${member.badges && member.badges.length > 0 ? member.badges.map(badge => `<span class="badge">${badge}</span>`).join('') : '<span style="color: var(--text-muted); font-size: 0.8rem;">なし</span>'}
                                    </div>
                                </div>
                            </div>

                            <div class="detail-row">
                                <div style="flex: 1;">
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">読書記録</h4>
                                    <div style="font-size: 0.9rem; display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                                        ${(() => {
                                            const memberReviews = mockData.reviews.filter(r => String(r.squadNumber) === String(member.squadNumber));
                                            if (memberReviews.length > 0) {
                                                return memberReviews.map(rev => `<a href="${rev.docLink}" target="_blank" rel="noopener noreferrer" class="cyber-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;" onclick="event.stopPropagation();"><i class="fa-solid fa-file-lines"></i> ${rev.bookTitle}</a>`).join('');
                                            } else {
                                                return '<span style="color: var(--text-muted); font-size: 0.8rem;">なし</span>';
                                            }
                                        })()}
                                    </div>
                                </div>
                                <button class="cyber-btn member-edit-btn" onclick="event.stopPropagation(); openAddReviewModal('${member.squadNumber}')"><i class="fa-solid fa-plus"></i> 追加</button>
                            </div>
                            
                            <div class="detail-row">
                                <div style="flex: 1;">
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">課題図書の進捗</h4>
                                    <div class="task-icons-container" style="margin-top: 0.5rem; gap: 0.5rem;">
                                        ${['K-01', 'K-02', 'K-03', 'K-04', 'K-05'].map((key, index) => {
                                            const isCompleted = member[key] === true || member[key] === "TRUE";
                                            return `<div class="task-icon ${isCompleted ? 'unlocked' : 'locked'}" data-tooltip="課題図書${index + 1}" style="width: 35px; height: 35px; font-size: 1rem;"><i class="fa-solid fa-book"></i></div>`;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

function toggleMemberDetails(squadNum) {
    const detailsDiv = document.getElementById(`details-${squadNum}`);
    const iconDiv = document.getElementById(`icon-${squadNum}`);
    if(detailsDiv) {
        detailsDiv.classList.toggle('open');
    }
    if(iconDiv) {
        iconDiv.classList.toggle('open');
    }
}

let currentCalendarDate = new Date();
// Ensure 4-digit year for currentCalendarDate
if (currentCalendarDate.getFullYear() < 1000) {
    currentCalendarDate.setFullYear(currentCalendarDate.getFullYear() + 2000);
}

let currentScheduleView = 'calendar';
let currentEventFilter = null; // null for all, 'YYYY/MM/DD' for specific date

window.changeCalendarMonth = function(offset) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    renderSchedule();
}

window.switchScheduleView = function(view) {
    currentScheduleView = view;
    if (view === 'calendar') {
        currentEventFilter = null; // Reset filter when going back to calendar
    }
    renderSchedule();
}

window.filterEventsByDate = function(dateStr) {
    currentEventFilter = dateStr;
    currentScheduleView = 'event';
    renderSchedule();
}

window.jumpToEvent = function(eventId) {
    currentScheduleView = 'event';
    renderSchedule();
    setTimeout(() => {
        const el = document.getElementById(`event-card-${eventId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('highlight-event');
            setTimeout(() => el.classList.remove('highlight-event'), 1500);
            
            // Auto expand
            const detailsDiv = document.getElementById(`event-details-${eventId}`);
            const iconDiv = document.getElementById(`event-icon-${eventId}`);
            if(detailsDiv && !detailsDiv.classList.contains('expanded')) {
                detailsDiv.classList.add('expanded');
                if(iconDiv) iconDiv.classList.add('open');
            }
        }
    }, 100);
}

window.toggleEventDetails = function(eventId) {
    const detailsDiv = document.getElementById(`event-details-${eventId}`);
    const iconDiv = document.getElementById(`event-icon-${eventId}`);
    if(detailsDiv) {
        detailsDiv.classList.toggle('expanded');
    }
    if(iconDiv) {
        iconDiv.classList.toggle('open');
    }
}

function safeParseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.replace(/-/g, '/').split('/');
    if (parts.length >= 3) {
        let year = parseInt(parts[0], 10);
        if (year < 100) year += 2000;
        let month = parseInt(parts[1], 10) - 1;
        let day = parseInt(parts[2], 10);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }
    return null;
}

function renderSchedule() {
    let year = currentCalendarDate.getFullYear();
    if (year < 1000) {
        year += 2000;
        currentCalendarDate.setFullYear(year);
    }
    const month = currentCalendarDate.getMonth();
    
    let contentHtml = '';
    
    if (currentScheduleView === 'calendar') {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
        
        let calendarHtml = `
            <div class="cyber-card" style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <button class="cyber-btn" style="padding: 0.5rem 1rem;" onclick="changeCalendarMonth(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                    <h3 style="margin: 0; font-size: 1.5rem;">${year}年 ${month + 1}月</h3>
                    <button class="cyber-btn" style="padding: 0.5rem 1rem;" onclick="changeCalendarMonth(1)"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
                <div class="calendar-grid">
                    <div style="font-weight: bold; color: #ff6b6b; padding: 0.5rem 0;">日</div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">月</div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">火</div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">水</div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">木</div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">金</div>
                    <div style="font-weight: bold; color: #4facfe; padding: 0.5rem 0;">土</div>
        `;
        
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHtml += `<div style="padding: 0.5rem; background: rgba(0,0,0,0.02); border-radius: 4px;"></div>`;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
            
            const dayEvents = mockData.events.filter(e => {
                if (!e.date) return false;
                const d = safeParseDate(e.date);
                if (!d) return false;
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
            });
            
            let eventsHtml = dayEvents.map(e => {
                let bgColor = e.color || 'var(--accent-blue)';
                let textColor = e.color ? '#333' : 'white';
                let timeStr = (e.startTime && e.endTime) ? `<div style="font-size: 0.65rem; opacity: 0.8; margin-top: 1px;">${e.startTime}～${e.endTime}</div>` : '';
                return `
                <div style="font-size: 0.7rem; font-weight: bold; background: ${bgColor}; color: ${textColor}; border-radius: 4px; margin-top: 2px; padding: 2px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; transition: transform 0.2s; box-shadow: 1px 1px 0px var(--border-color);" title="${e.title}" onclick="event.stopPropagation(); jumpToEvent('${e.id}')" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="overflow: hidden; text-overflow: ellipsis;">${e.title}</div>
                    ${timeStr}
                </div>
                `;
            }).join('');
            
            const today = new Date();
            const isToday = (day === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            const borderStyle = isToday ? 'border: 2px solid var(--accent-blue);' : 'border: 1px solid var(--border-color);';
            
            calendarHtml += `
                <div class="calendar-cell" style="${borderStyle}" onclick="filterEventsByDate('${dateStr}')">
                    <div style="text-align: left; font-weight: bold; font-size: 0.8rem; ${isToday ? 'color: var(--accent-blue);' : ''}">${day}</div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 2px; margin-top: 2px; overflow: hidden;">
                        ${eventsHtml}
                    </div>
                </div>
            `;
        }
        
        const remainingSlots = (7 - ((startingDayOfWeek + daysInMonth) % 7)) % 7;
        for (let i = 0; i < remainingSlots; i++) {
            calendarHtml += `<div style="padding: 0.5rem; background: rgba(0,0,0,0.02); border-radius: 4px;"></div>`;
        }
        
        calendarHtml += `
                </div>
            </div>
        `;
        contentHtml = calendarHtml;
    } else if (currentScheduleView === 'event') {
        let filteredEvents = mockData.events.slice();
        filteredEvents.sort((a, b) => {
            const dA = safeParseDate(a.date);
            const dB = safeParseDate(b.date);
            if(dA && dB) return dA - dB;
            return 0;
        });

        if (currentEventFilter) {
            const filterDate = safeParseDate(currentEventFilter);
            if (filterDate) {
                filteredEvents = filteredEvents.filter(e => {
                    if (!e.date) return false;
                    const d = safeParseDate(e.date);
                    if (!d) return false;
                    return d.getFullYear() === filterDate.getFullYear() && 
                           d.getMonth() === filterDate.getMonth() && 
                           d.getDate() === filterDate.getDate();
                });
            }
        }
        
        let filterHtml = '';
        if (currentEventFilter) {
            filterHtml = `
                <div style="background: var(--surface-color); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-in);">
                    <div style="font-weight: bold; color: var(--accent-blue);">
                        <i class="fa-solid fa-filter"></i> ${currentEventFilter} のイベントを表示中
                    </div>
                    <button class="cyber-btn" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="filterEventsByDate(null)">
                        すべて表示
                    </button>
                </div>
            `;
        }

        let eventListHtml = `
            ${filterHtml}
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${filteredEvents.length === 0 ? '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">この日のイベントはありません。</div>' : ''}
                ${filteredEvents.map(event => {
                    const attendeesCount = event.attendees ? event.attendees.length : 0;
                    const absenteesCount = event.absentees ? event.absentees.length : 0;
                    const capacity = event.capacity ? Number(event.capacity) : 0;
                    const isFull = capacity > 0 && attendeesCount >= capacity;
                    const timeStr = (event.startTime && event.endTime) ? `${event.startTime}～${event.endTime}` : '';
                    
                    const bgColor = event.color || 'var(--surface-color)';
                    
                    return `
                    <div class="cyber-card" id="event-card-${event.id}" style="cursor: pointer; background-color: ${bgColor};" onclick="toggleEventDetails('${event.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1; margin-right: 1rem;">
                                <div class="news-date" style="margin-bottom: 0.3rem;">${event.date} ${timeStr} ${event.location ? `| <i class="fa-solid fa-location-dot"></i> ${event.location}` : ''}</div>
                                <h3 style="margin-bottom: 0.5rem; color: var(--accent-blue); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                    ${event.title}
                                </h3>
                                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.3rem;">
                                    <i class="fa-solid fa-user-tie"></i> 主催者: ${event.host ? event.host : '未指定'}
                                </div>
                                <div style="font-size: 0.85rem; font-weight: bold; color: ${isFull ? '#ff6b6b' : 'var(--text-main)'};">
                                    <i class="fa-solid fa-users"></i> ${capacity > 0 ? `現在の参加人数: ${attendeesCount} / ${capacity}` : '定員: 制限なし (募集中)'}
                                </div>
                            </div>
                            <div class="accordion-icon" id="event-icon-${event.id}" style="color: var(--accent-blue); font-size: 1.5rem; display: flex; align-items: center;">
                                <i class="fa-solid fa-chevron-down transition-icon"></i>
                            </div>
                        </div>
                        
                        <div class="event-card-details" id="event-details-${event.id}">
                            ${event.description ? `<div style="padding: 1rem; background: rgba(0,0,0,0.02); border-radius: 12px; margin-bottom: 1rem; font-size: 0.95rem;">${event.description}</div>` : ''}
                            
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                                <div style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.02); padding: 1rem; border-radius: 12px;">
                                    <div style="font-size: 0.85rem; color: var(--accent-green); margin-bottom: 0.5rem; font-weight: bold;">
                                        出席者 (${attendeesCount}人)
                                    </div>
                                    <div class="event-attendees" style="margin-bottom: 0;">
                                        ${attendeesCount > 0 
                                            ? event.attendees.map(a => `<span class="attendee-tag">${String(a).trim()}</span>`).join('') 
                                            : '<span style="color: var(--text-muted); font-size: 0.85rem;">まだいません</span>'}
                                    </div>
                                </div>
                                <div style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.02); padding: 1rem; border-radius: 12px;">
                                    <div style="font-size: 0.85rem; color: var(--accent-pink); margin-bottom: 0.5rem; font-weight: bold;">
                                        欠席者 (${absenteesCount}人)
                                    </div>
                                    <div class="event-attendees" style="margin-bottom: 0;">
                                        ${absenteesCount > 0 
                                            ? event.absentees.map(a => `<span class="attendee-tag" style="background: var(--bg-color);">${String(a).trim()}</span>`).join('') 
                                            : '<span style="color: var(--text-muted); font-size: 0.85rem;">まだいません</span>'}
                                    </div>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; gap: 1rem;">
                                <button class="cyber-btn" style="padding: 0.4rem; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--accent-yellow); color: #333;" onclick="event.stopPropagation(); openPasswordModal('editEvent', '${event.id}')" title="編集">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="cyber-btn danger" style="padding: 0.4rem; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;" onclick="event.stopPropagation(); openPasswordModal('deleteEvent', '${event.id}')" title="削除">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                                <button class="cyber-btn" ${isFull ? 'disabled' : ''} style="padding: 0.5rem 1rem;" onclick="event.stopPropagation(); openAttendanceModal('${event.id}')">
                                    ${isFull ? '満員' : '出欠登録'}
                                </button>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
        contentHtml = eventListHtml;
    }

    let tabsHtml = `
        <div class="schedule-tabs">
            <button class="schedule-tab-btn ${currentScheduleView === 'calendar' ? 'active' : ''}" onclick="switchScheduleView('calendar')">
                <i class="fa-solid fa-calendar"></i> カレンダー
            </button>
            <button class="schedule-tab-btn ${currentScheduleView === 'event' ? 'active' : ''}" onclick="switchScheduleView('event')">
                <i class="fa-solid fa-list"></i> イベント一覧
            </button>
        </div>
    `;

    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title" style="margin-bottom: 1rem;">スケジュール</h1>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                ${tabsHtml}
                <button class="cyber-btn" onclick="openPasswordModal('addEvent')"><i class="fa-solid fa-plus"></i> イベントを追加</button>
            </div>
            
            ${contentHtml}
        </div>
    `;
    appRoot.innerHTML = html;
}

// ==========================================
// MODALS & INTERACTIONS
// ==========================================
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

modalClose.addEventListener('click', closeModal);

function openModal(contentHtml) {
    modalBody.innerHTML = contentHtml;
    modalOverlay.classList.remove('hidden');
}

function closeModal() {
    modalOverlay.classList.add('hidden');
}

function openBorrowModal(bookId) {
    const book = mockData.books.find(b => b.id === bookId);
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-green);"><i class="fa-solid fa-hand-holding-hand"></i> 本を借りる</h2>
        <p style="margin-bottom: 1.5rem;">対象: <strong>${book.title}</strong></p>
        
        <div class="form-group">
            <label>背番号 (Squad Number)</label>
            <input type="text" id="squadNumInput" class="cyber-input" placeholder="例: 007">
        </div>
        <div class="form-group">
            <label>返却期限</label>
            <input type="date" id="dueDateInput" class="cyber-input">
        </div>
        <button class="cyber-btn" id="btn-borrow" style="width: 100%; margin-top: 1rem;" onclick="submitBorrow('${bookId}')">貸出リクエスト送信</button>
    `;
    openModal(html);
}

async function submitBorrow(bookId) {
    const squadNum = document.getElementById('squadNumInput').value;
    const dueDate = document.getElementById('dueDateInput').value;
    
    if(!squadNum || !dueDate) {
        alert("すべての項目を入力してください。");
        return;
    }

    // UX向上のため先にボタンを無効化
    document.getElementById('btn-borrow').disabled = true;
    document.getElementById('btn-borrow').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
    
    const success = await sendAction('borrowBook', { bookId, squadNum, dueDate });
    if (success) {
        const book = mockData.books.find(b => b.id === bookId);
        if (book) {
            book.status = 'borrowed';
            book.borrower = squadNum;
            book.dueDate = dueDate;
        }
        navigateTo(currentView);
        closeModal();
    }
}

async function returnBook(bookId) {
    if(confirm("この本を返却しますか？")) {
        // ボタンを無効化する代わりに少し待つUIも可能ですが、シンプルに同期
        const success = await sendAction('returnBook', { bookId });
        if (success) {
            const book = mockData.books.find(b => b.id === bookId);
            if (book) {
                book.status = 'available';
                book.borrower = '';
                book.dueDate = '';
            }
            navigateTo(currentView);
        }
    }
}

function openReviewModal(bookId) {
    const book = mockData.books.find(b => b.id === bookId);
    const bookReviews = mockData.reviews.filter(r => r.bookId === bookId);
    
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-green);"><i class="fa-solid fa-clock-rotate-left"></i> 感想文履歴</h2>
        <p style="margin-bottom: 1.5rem; color: var(--text-muted);">${book.title}</p>
        
        <div class="timeline">
            ${bookReviews.length > 0 ? bookReviews.map(review => `
                <div class="timeline-item">
                    <div style="font-family: var(--font-heading); font-size: 0.8rem; color: var(--accent-green);">${review.date} - 背番号 ${review.reviewer}</div>
                    <div style="margin-top: 0.5rem; font-size: 0.95rem; line-height: 1.4;">「${review.text}」</div>
                </div>
            `).join('') : '<div style="color: var(--text-muted);">この本の履歴はまだありません。</div>'}
        </div>
    `;
    openModal(html);
}

function openAttendanceModal(eventId) {
    const event = mockData.events.find(e => e.id === eventId);
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-green);"><i class="fa-solid fa-calendar-check"></i> 出欠登録</h2>
        <p style="margin-bottom: 1.5rem;">イベント: <strong>${event.title}</strong></p>
        
        <div class="form-group">
            <label>背番号 (Squad Number)</label>
            <input type="text" id="attSquadNum" class="cyber-input" placeholder="例: 007">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <button class="cyber-btn" id="btn-attend" style="flex: 1;" onclick="submitAttendance('${eventId}', 'attend')">出席</button>
            <button class="cyber-btn danger" id="btn-absent" style="flex: 1;" onclick="submitAttendance('${eventId}', 'absent')">欠席</button>
        </div>
    `;
    openModal(html);
}

async function submitAttendance(eventId, status) {
    const squadNum = document.getElementById('attSquadNum').value;
    if(!squadNum) {
        alert("背番号を入力してください。");
        return;
    }

    document.getElementById('btn-attend').disabled = true;
    document.getElementById('btn-absent').disabled = true;

    const success = await sendAction('updateAttendance', { eventId, squadNum, status });
    if (success) {
        const event = mockData.events.find(e => e.id === eventId);
        if (event) {
            if (!event.attendees) event.attendees = [];
            if (!event.absentees) event.absentees = [];
            if (status === 'attend') {
                if (!event.attendees.includes(squadNum)) {
                    event.attendees.push(squadNum);
                }
                event.absentees = event.absentees.filter(a => a !== squadNum);
            } else if (status === 'absent') {
                if (!event.absentees.includes(squadNum)) {
                    event.absentees.push(squadNum);
                }
                event.attendees = event.attendees.filter(a => a !== squadNum);
            }
        }
        navigateTo(currentView);
        closeModal();
    }
}

function openPasswordModal(actionType, payload = null) {
    let payloadArg = payload ? `'${payload}'` : 'null';
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-yellow);"><i class="fa-solid fa-lock"></i> 認証が必要です</h2>
        <p style="margin-bottom: 1.5rem;">この操作を実行するにはパスワードを入力してください。</p>
        
        <div class="form-group">
            <input type="password" id="passwordInput" class="cyber-input" placeholder="パスワードを入力">
        </div>
        <button class="cyber-btn" style="width: 100%;" onclick="submitPassword('${actionType}', ${payloadArg})">認証</button>
    `;
    openModal(html);
}

function submitPassword(actionType, payload) {
    const pwd = document.getElementById('passwordInput').value;
    if (pwd === '20230914') {
        if(actionType === 'addEvent') {
            openAddEventModal();
        } else if(actionType === 'deleteEvent') {
            confirmDeleteEvent(payload);
        } else if(actionType === 'editEvent') {
            openEditEventModal(payload);
        }
    } else {
        alert("パスワードが間違っています。");
    }
}

function openAddEventModal() {
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-calendar-plus"></i> イベントを追加</h2>
        
        <div class="form-group">
            <label>イベント名</label>
            <input type="text" id="addEventTitle" class="cyber-input" placeholder="例: 定例ミーティング">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <div style="flex: 2;">
                <label>開催日 (Date)</label>
                <input type="text" id="addEventDate" class="cyber-input" placeholder="例: 2026/06/01">
            </div>
            <div style="flex: 1;">
                <label>開始時間</label>
                <input type="time" id="addEventStartTime" class="cyber-input">
            </div>
            <div style="flex: 1;">
                <label>終了時間</label>
                <input type="time" id="addEventEndTime" class="cyber-input">
            </div>
        </div>
        <div class="form-group">
            <label>場所 (Location)</label>
            <input type="text" id="addEventLocation" class="cyber-input" placeholder="例: 会議室A">
        </div>
        <div class="form-group">
            <label>カードの色 (Color)</label>
            <div class="color-picker">
                <label class="color-option">
                    <input type="radio" name="addEventColor" value="#ffdee9" checked onchange="document.getElementById('addEventColorText').value = this.value">
                    <span class="color-circle" style="background: #ffdee9;"></span>
                </label>
                <label class="color-option">
                    <input type="radio" name="addEventColor" value="#e0f2fe" onchange="document.getElementById('addEventColorText').value = this.value">
                    <span class="color-circle" style="background: #e0f2fe;"></span>
                </label>
                <label class="color-option">
                    <input type="radio" name="addEventColor" value="#f0fdf4" onchange="document.getElementById('addEventColorText').value = this.value">
                    <span class="color-circle" style="background: #f0fdf4;"></span>
                </label>
                <label class="color-option">
                    <input type="radio" name="addEventColor" value="#fef9c3" onchange="document.getElementById('addEventColorText').value = this.value">
                    <span class="color-circle" style="background: #fef9c3;"></span>
                </label>
            </div>
            <input type="hidden" id="addEventColorText" value="#ffdee9">
        </div>
        <div class="form-group">
            <label>一言説明</label>
            <input type="text" id="addEventDesc" class="cyber-input" placeholder="例: 重要な議題があります">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
                <label>定員</label>
                <input type="number" id="addEventCapacity" class="cyber-input" placeholder="例: 10" min="1">
            </div>
            <div style="flex: 1;">
                <label>主催者背番号</label>
                <input type="text" id="addEventHost" class="cyber-input" placeholder="例: 001">
            </div>
        </div>
        
        <button class="cyber-btn" id="btn-add-event" style="width: 100%; margin-top: 1rem;" onclick="submitAddEvent()">イベント作成</button>
    `;
    openModal(html);
}

async function submitAddEvent() {
    const title = document.getElementById('addEventTitle').value;
    const date = document.getElementById('addEventDate').value;
    const startTime = document.getElementById('addEventStartTime').value;
    const endTime = document.getElementById('addEventEndTime').value;
    const location = document.getElementById('addEventLocation').value;
    const color = document.getElementById('addEventColorText').value;
    const description = document.getElementById('addEventDesc').value;
    const capacity = document.getElementById('addEventCapacity').value;
    const host = document.getElementById('addEventHost').value;
    
    if(!title || !date) {
        alert("必須項目(イベント名、開催日)を入力してください。");
        return;
    }

    document.getElementById('btn-add-event').disabled = true;
    document.getElementById('btn-add-event').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 作成中...';
    
    const payload = { title, date, startTime, endTime, location, color, description, capacity, host };
    const success = await sendAction('addEvent', payload);
    if (success) {
        mockData.events.push({
            id: 'evt_' + Date.now(),
            ...payload,
            attendees: [],
            absentees: []
        });
        navigateTo(currentView);
        closeModal();
    }
}

function openEditEventModal(eventId) {
    const event = mockData.events.find(e => e.id === eventId);
    if (!event) return;

    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-yellow);"><i class="fa-solid fa-pen-to-square"></i> イベントを編集</h2>
        
        <div class="form-group">
            <label>イベント名</label>
            <input type="text" id="editEventTitle" class="cyber-input" value="${event.title || ''}">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <div style="flex: 2;">
                <label>開催日 (Date)</label>
                <input type="text" id="editEventDate" class="cyber-input" value="${event.date || ''}">
            </div>
            <div style="flex: 1;">
                <label>開始時間</label>
                <input type="time" id="editEventStartTime" class="cyber-input" value="${event.startTime || ''}">
            </div>
            <div style="flex: 1;">
                <label>終了時間</label>
                <input type="time" id="editEventEndTime" class="cyber-input" value="${event.endTime || ''}">
            </div>
        </div>
        <div class="form-group">
            <label>場所 (Location)</label>
            <input type="text" id="editEventLocation" class="cyber-input" value="${event.location || ''}">
        </div>
        <div class="form-group">
            <label>カードの色 (Color)</label>
            <div class="color-picker">
                <label class="color-option">
                    <input type="radio" name="editEventColor" value="#ffdee9" ${event.color === '#ffdee9' ? 'checked' : ''} onchange="document.getElementById('editEventColorText').value = this.value">
                    <span class="color-circle" style="background: #ffdee9;"></span>
                </label>
                <label class="color-option">
                    <input type="radio" name="editEventColor" value="#e0f2fe" ${event.color === '#e0f2fe' || !event.color ? 'checked' : ''} onchange="document.getElementById('editEventColorText').value = this.value">
                    <span class="color-circle" style="background: #e0f2fe;"></span>
                </label>
                <label class="color-option">
                    <input type="radio" name="editEventColor" value="#f0fdf4" ${event.color === '#f0fdf4' ? 'checked' : ''} onchange="document.getElementById('editEventColorText').value = this.value">
                    <span class="color-circle" style="background: #f0fdf4;"></span>
                </label>
                <label class="color-option">
                    <input type="radio" name="editEventColor" value="#fef9c3" ${event.color === '#fef9c3' ? 'checked' : ''} onchange="document.getElementById('editEventColorText').value = this.value">
                    <span class="color-circle" style="background: #fef9c3;"></span>
                </label>
            </div>
            <input type="hidden" id="editEventColorText" value="${event.color || '#e0f2fe'}">
        </div>
        <div class="form-group">
            <label>一言説明</label>
            <input type="text" id="editEventDesc" class="cyber-input" value="${event.description || ''}">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
                <label>定員</label>
                <input type="number" id="editEventCapacity" class="cyber-input" value="${event.capacity || ''}" min="1">
            </div>
            <div style="flex: 1;">
                <label>主催者背番号</label>
                <input type="text" id="editEventHost" class="cyber-input" value="${event.host || ''}">
            </div>
        </div>
        
        <button class="cyber-btn" id="btn-edit-event" style="width: 100%; margin-top: 1rem;" onclick="submitEditEvent('${event.id}')">イベント更新</button>
    `;
    openModal(html);
}

async function submitEditEvent(eventId) {
    const title = document.getElementById('editEventTitle').value;
    const date = document.getElementById('editEventDate').value;
    const startTime = document.getElementById('editEventStartTime').value;
    const endTime = document.getElementById('editEventEndTime').value;
    const location = document.getElementById('editEventLocation').value;
    const color = document.getElementById('editEventColorText').value;
    const description = document.getElementById('editEventDesc').value;
    const capacity = document.getElementById('editEventCapacity').value;
    const host = document.getElementById('editEventHost').value;
    
    if(!title || !date) {
        alert("必須項目(イベント名、開催日)を入力してください。");
        return;
    }

    document.getElementById('btn-edit-event').disabled = true;
    document.getElementById('btn-edit-event').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 更新中...';
    
    const payload = { eventId, title, date, startTime, endTime, location, color, description, capacity, host };
    const success = await sendAction('editEvent', payload);
    if (success) {
        const eventIndex = mockData.events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
            mockData.events[eventIndex] = { ...mockData.events[eventIndex], ...payload };
        }
        navigateTo(currentView);
        closeModal();
    }
}



async function confirmDeleteEvent(eventId) {
    if(confirm("本当にこのイベントを削除しますか？")) {
        modalBody.innerHTML = '<div style="text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-blue);"></i><p style="margin-top:1rem;">削除中...</p></div>';
        const success = await sendAction('deleteEvent', { eventId });
        if (success) {
            mockData.events = mockData.events.filter(e => e.id !== eventId);
            navigateTo(currentView);
            closeModal();
        }
    }
}

// ==========================================
// MEMBER EDIT MODAL & ACTIONS
// ==========================================
function openEditMemberModal(squadNum, fieldName, currentVal) {
    let fieldLabel = '';
    let note = '';
    let inputHtml = '';
    if(fieldName === 'typingScore') {
        inputHtml = `
            <div class="form-group">
                <label>挑戦したコース</label>
                <select id="typingCourse" class="cyber-input">
                    <option value="3000円">3000円</option>
                    <option value="5000円">5000円</option>
                    <option value="10000円">10000円</option>
                </select>
            </div>
            <div class="form-group">
                <label>自分の記録</label>
                <input type="number" id="typingRecord" class="cyber-input" placeholder="例: 4500">
            </div>
        `;
    } else {
        if(fieldName === 'badges') {
            fieldLabel = 'バッジ';
            note = '<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">※カンマ区切りで入力してください</p>';
        } else if(fieldName === 'readingRecord') {
            fieldLabel = '読書記録';
            note = '<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">※カンマ区切りで入力してください</p>';
        }
        inputHtml = `
            <div class="form-group">
                <label>${fieldLabel}</label>
                ${note}
                <input type="text" id="editMemberInput" class="cyber-input" value="${currentVal}">
            </div>
        `;
    }

    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-pen-to-square"></i> メンバー情報編集</h2>
        <p style="margin-bottom: 1.5rem;">背番号: <strong>${squadNum}</strong></p>
        
        ${inputHtml}
        
        <button class="cyber-btn" id="btn-edit-member" style="width: 100%; margin-top: 1rem;" onclick="submitMemberEdit('${squadNum}', '${fieldName}')">更新する</button>
    `;
    openModal(html);
}

async function submitMemberEdit(squadNum, fieldName) {
    let newValue;
    if (fieldName === 'typingScore') {
        const course = document.getElementById('typingCourse').value;
        const record = document.getElementById('typingRecord').value;
        if (!record) {
            alert("自分の記録を入力してください。");
            return;
        }
        newValue = `${record} / ${course}`;
    } else {
        newValue = document.getElementById('editMemberInput').value;
    }
    
    document.getElementById('btn-edit-member').disabled = true;
    document.getElementById('btn-edit-member').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 更新中...';
    
    const success = await sendAction('updateMemberField', { squadNum, fieldName, newValue });
    if (success) {
        const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
        if (member) {
            if (fieldName === 'badges' || fieldName === 'completedTasks') {
                member[fieldName] = newValue ? newValue.split(',').map(s => s.trim()) : [];
            } else {
                member[fieldName] = newValue;
            }
        }
        navigateTo(currentView);
        closeModal();
    }
}

// ==========================================
// TASKS EDIT MODAL & ACTIONS
// ==========================================
function openEditTasksModal(squadNum, currentCategory) {
    const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
    const nextCatInfo = getNextCategoryInfo(currentCategory);
    if (!nextCatInfo || !member) return;
    
    const reqs = nextCatInfo.requirements;
    const completedTasks = member.completedTasks || [];
    
    let checkboxesHtml = reqs.map((req, index) => {
        const isChecked = completedTasks.includes(req.name) ? 'checked' : '';
        return `
            <label style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem; background: #ffffff; border: var(--border-width) solid var(--border-color); border-radius: 8px; margin-bottom: 0.8rem; cursor: pointer; transition: all var(--transition-speed); box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
                <input type="checkbox" class="task-checkbox" value="${req.name}" ${isChecked} style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--accent-blue);">
                <div style="width: 30px; text-align: center; font-size: 1.2rem; color: var(--accent-blue);">
                    <i class="fa-solid ${req.icon}"></i>
                </div>
                <span style="font-size: 0.95rem; font-weight: 700; flex: 1;">${req.name}</span>
            </label>
        `;
    }).join('');

    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-list-check"></i> 進捗の更新</h2>
        <p style="margin-bottom: 1.5rem;">背番号: <strong>${squadNum}</strong> <br>目標: <strong style="color: var(--accent-green);">${nextCatInfo.name}</strong></p>
        
        <div class="tasks-list" style="max-height: 400px; overflow-y: auto; padding-right: 0.5rem; margin-bottom: 1rem;">
            ${checkboxesHtml}
        </div>
        
        <button class="cyber-btn" id="btn-edit-tasks" style="width: 100%; margin-top: 1rem;" onclick="submitTasksEdit('${squadNum}')">進捗を保存</button>
    `;
    openModal(html);
}

async function submitTasksEdit(squadNum) {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    const selectedTasks = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    const newValue = selectedTasks.join(',');
    
    document.getElementById('btn-edit-tasks').disabled = true;
    document.getElementById('btn-edit-tasks').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 保存中...';
    
    const success = await sendAction('updateMemberField', { squadNum, fieldName: 'completedTasks', newValue });
    if (success) {
        const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
        if (member) {
            member.completedTasks = selectedTasks;
        }
        navigateTo(currentView);
        closeModal();
    }
}

// ==========================================
// ADD REVIEW MODAL & ACTIONS
// ==========================================
function openAddReviewModal(squadNum) {
    const seenBooks = new Set();
    let bookOptions = '';
    for (const b of mockData.books) {
        if (!b.id) continue;
        const parts = b.id.split('-');
        let identifier = b.id;
        if (parts.length >= 2) {
            identifier = parts[0] + '-' + parts[1];
        }
        if (!seenBooks.has(identifier)) {
            seenBooks.add(identifier);
            bookOptions += `<option value="${b.id}">${b.title}</option>`;
        }
    }
    
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-book-open"></i> 読書感想文の追加</h2>
        
        <div class="form-group">
            <label>背番号 (Squad Number)</label>
            <input type="text" id="addReviewSquadNum" class="cyber-input" value="${squadNum}" readonly>
        </div>
        
        <div class="form-group">
            <label>本のタイトル</label>
            <select id="addReviewBookSelect" class="cyber-input" onchange="toggleManualBookTitle()">
                <option value="">選択してください</option>
                ${bookOptions}
                <option value="other">その他（手動入力）</option>
            </select>
        </div>
        
        <div class="form-group" id="manualBookTitleGroup" style="display: none;">
            <label>本のタイトル (手動入力)</label>
            <input type="text" id="addReviewManualTitle" class="cyber-input" placeholder="本のタイトルを入力">
        </div>
        
        <div class="form-group">
            <label>感想文リンク (ドキュメントURL)</label>
            <input type="url" id="addReviewDocLink" class="cyber-input" placeholder="https://docs.google.com/...">
        </div>
        
        <button class="cyber-btn" id="btn-add-review" style="width: 100%; margin-top: 1rem;" onclick="submitAddReview()">追加する</button>
    `;
    openModal(html);
}

function toggleManualBookTitle() {
    const select = document.getElementById('addReviewBookSelect');
    const manualGroup = document.getElementById('manualBookTitleGroup');
    if(select.value === 'other') {
        manualGroup.style.display = 'block';
    } else {
        manualGroup.style.display = 'none';
    }
}

async function submitAddReview() {
    const squadNum = document.getElementById('addReviewSquadNum').value;
    const select = document.getElementById('addReviewBookSelect');
    const manualTitle = document.getElementById('addReviewManualTitle').value;
    const docLink = document.getElementById('addReviewDocLink').value;
    
    let bookId = '';
    let bookTitle = '';
    
    if (select.value === '') {
        alert("本のタイトルを選択してください。");
        return;
    } else if (select.value === 'other') {
        if (!manualTitle.trim()) {
            alert("本のタイトルを手動入力してください。");
            return;
        }
        bookTitle = manualTitle.trim();
    } else {
        bookId = select.value;
        bookTitle = select.options[select.selectedIndex].text;
    }
    
    if (!docLink.trim()) {
        alert("感想文リンクを入力してください。");
        return;
    }

    document.getElementById('btn-add-review').disabled = true;
    document.getElementById('btn-add-review').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
    
    const success = await sendAction('addReview', { 
        squadNumber: squadNum, 
        bookId: bookId, 
        bookTitle: bookTitle, 
        docLink: docLink.trim() 
    });
    
    if (success) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        mockData.reviews.push({
            id: 'rev_' + Date.now(),
            squadNumber: squadNum,
            reviewer: squadNum,
            bookId: bookId,
            bookTitle: bookTitle,
            docLink: docLink.trim(),
            date: `${yyyy}/${mm}/${dd}`,
            text: ''
        });
        navigateTo(currentView);
        closeModal();
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (appRoot) {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        currentView = viewParam ? viewParam : 'home';
        
        // URLパラメータをクリーンにする(任意)
        if (viewParam) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        fetchPortalData();
    }
});