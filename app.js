// ==========================================
// CONFIGURATION & STATE
// ==========================================
const supabaseUrl = 'https://ouflqodgegugznmmlkpt.supabase.co';
// 笞・・遘ｻ陦悟ｯｾ蠢・ 譌｢蟄倥・GAS蜷檎ｭ峨・繧｢繧ｯ繧ｻ繧ｹ讓ｩ繧剃ｿ昴▽縺溘ａ service_role 繧剃ｽｿ逕ｨ縲ょ・髢狗腸蠅・〒縺ｯanon key縺ｸ縺ｮ蛻・ｊ譖ｿ縺医ｒ謗ｨ螂ｨ縺励∪縺吶・const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Zmxxb2RnZWd1Z3pubW1sa3B0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEyNDkxMiwiZXhwIjoyMTAzNzAwOTEyfQ.HrFGGMUDAxgtVQ5M6psk6EsVcheU6cL-0jYtrQLOn3U';
window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Docs隱ｭ縺ｿ蜿悶ｊ繝ｻ蜀咏悄繧｢繝・・繝ｭ繝ｼ繝臥畑縺ｮGAS (蠕後⊇縺ｩ譁ｰ縺励＞URL縺ｫ譖ｸ縺肴鋤縺医∪縺・
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyzxm6kng2G6jI4lej_FR8e9aC0LswY9gAh07yOiPCRxixhFd5Gm9ZhhnUJxDqAnA/exec';

const DISCORD_WEBHOOK_URL_PORTAL = 'https://discord.com/api/webhooks/1413674829080563834/EW_nJCjxwl1AkEgKAnfTGHHPC_RDplGqj6A_LMOnT4usoNr9KsSJ_BxmalvVFtdPeYhd';
const DISCORD_WEBHOOK_URL_LIBRARY = 'https://discord.com/api/webhooks/1524715463928451122/zpkYVX5suAaakeDXumnfN1_Bq5gIq3Z70wGpNXTZY7xe2NyfDYy0GgGjrNizb8SX5ewo';
let currentView = 'home';
let currentUser = null;
let viewHistory = [];
let isLoading = true;

// Mock Data (will be overwritten by GAS)
let mockData = {
    news: [],
    books: [],
    reviews: [],
    members: [],
    events: [],
    departments: [],
    settings: {}
};

let currentRosterTab = 'members';
let isEditMode = false;
let editModeTargetSquad = null;

// Roster Filters
let currentRosterSearch = '';
let currentRosterFilterProject = '';
let currentRosterFilterGeneration = '';
let currentRosterFilterCategory = '';

// Book Filters
let currentBookSearch = '';
let currentBookFilterBorrowed = false;
let pendingOrgUpdates = [];

// ==========================================
// CATEGORY REQUIREMENTS
// ==========================================
const CATEGORY_REQUIREMENTS = {
    'Beginner': [
        { name: '社会人基礎力テストで満点', icon: 'fa-clipboard-check' },
        { name: 'メールテストで満点', icon: 'fa-envelope-circle-check' },
        { name: '企画書テストで満点', icon: 'fa-file-signature' },
        { name: '計算テストで満点', icon: 'fa-calculator' },
        { name: '累計プロジェクトアサイン数1以上', icon: 'fa-briefcase' },
        { name: '読書1冊以上', icon: 'fa-book-open' },
        { name: 'GPA1以上', icon: 'fa-graduation-cap' }
    ],
    'Member': [
        { name: '企画書テストで満点', icon: 'fa-lightbulb' },
        { name: 'メールロールプレテストで満点', icon: 'fa-id-card-clip' },
        { name: '企画書ロールプレテストで満点', icon: 'fa-file-lines' },
        { name: '計算ロールプレテストで満点', icon: 'fa-sack-dollar' },
        { name: 'Grow5以上', icon: 'fa-chart-line' },
        { name: '課題図書5冊制覇', icon: 'fa-book-atlas' },
        { name: 'タイピング3000文字クリア', icon: 'fa-keyboard' },
        { name: 'メンバーアサイン数1人以上', icon: 'fa-user-plus' },
        { name: '累計プロジェクトアサイン数 3以上', icon: 'fa-network-wired' },
        { name: 'Chief1人以上の推薦', icon: 'fa-thumbs-up' }
    ],
    'Assistant': [
        { name: 'ファシリテーションテストで満点', icon: 'fa-comments' },
        { name: '企画書ロールプレテストで満点', icon: 'fa-paste' },
        { name: 'Grow6以上', icon: 'fa-chart-pie' },
        { name: '本を月に1冊以上読む', icon: 'fa-book-bookmark' },
        { name: 'タイピング5000文字クリア', icon: 'fa-keyboard' },
        { name: 'メンバーアサイン数3人以上', icon: 'fa-users-gear' },
        { name: '累計プロジェクトアサイン数 4以上', icon: 'fa-folder-tree' },
        { name: '鬼プロ修了', icon: 'fa-fire' },
        { name: 'Core2人以上の推薦', icon: 'fa-star' }
    ],
    'Chief': [
        { name: '交渉テストで満点', icon: 'fa-handshake' },
        { name: 'AIテストで満点', icon: 'fa-robot' },
        { name: 'Grow7以上', icon: 'fa-ranking-star' },
        { name: '本を月に1冊以上読む(Core)', icon: 'fa-book-open-reader' },
        { name: 'タイピング10000文字クリア', icon: 'fa-keyboard' },
        { name: 'メンバーアサイン数5人以上', icon: 'fa-users-viewfinder' },
        { name: '累計プロジェクトアサイン数 6以上', icon: 'fa-diagram-project' },
        { name: '鬼修了', icon: 'fa-skull' },
        { name: '名刺100枚配りきる', icon: 'fa-address-card' },
        { name: 'Core人数と大人', icon: 'fa-crown' }
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

function parseDepartmentIds(deptInput) {
    if (!deptInput) return [];
    let deptStrings = [];
    if (Array.isArray(deptInput)) {
        deptStrings = deptInput;
    } else if (typeof deptInput === 'string') {
        deptStrings = deptInput.split(',');
    }
    return deptStrings.map(str => {
        const cleanStr = String(str).trim();
        const match = cleanStr.match(/^(.+?)(?:\((.+?)\))?$/);
        if (match) {
            return {
                id: match[1].trim(),
                title: match[2] ? match[2].trim() : null
            };
        }
        return { id: cleanStr, title: null };
    });
}

// ==========================================
// ROUTING & NAVIGATION
// ==========================================
const appRoot = document.getElementById('app-root');
const navButtons = document.querySelectorAll('.nav-btn');

navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        
        // SPA繝壹・繧ｸ(index.html)莉･螟悶°繧峨い繧ｯ繧ｻ繧ｹ縺輔ｌ縺溷ｴ蜷医・縲（ndex.html縺ｫ驕ｷ遘ｻ
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
        return `<button class="cyber-btn" style="margin-bottom: 1.5rem;" onclick="goBack()"><i class="fa-solid fa-arrow-left"></i> 謌ｻ繧・/button>`;
    }
    return '';
}

// ==========================================
// LOGIN
// ==========================================
function performLogin() {
    const input = document.getElementById('login-squad-input').value.trim();
    if(!input) return;
    const user = mockData.members.find(m => String(m.squadNumber) === input);
    if(user) {
        currentUser = user;
        sessionStorage.setItem('wcp_logged_in_squad', user.squadNumber);
        
        document.getElementById('login-overlay').style.display = 'none';
        if(user.admin === true || user.admin === 'true' || user.admin === 'TRUE') {
            document.getElementById('nav-admin-btn').style.display = 'block';
        }
        // User status header update
        const statusEl = document.querySelector('.user-status');
        if(statusEl) {
            statusEl.innerHTML = `<i class="fa-solid fa-user-check" style="color: var(--accent-blue);"></i> ${user.name}縺輔ｓ`;
        }
        
        // 2繝ｶ譛亥燕縺ｮ莠亥ｮ壹ョ繝ｼ繧ｿ繧偵ヰ繝・け繧ｰ繝ｩ繧ｦ繝ｳ繝峨〒繧ｯ繝ｪ繝ｼ繝ｳ繧｢繝・・
        cleanupOldEvents();
    } else {
        const err = document.getElementById('login-error');
        err.innerText = "謖・ｮ壹＆繧後◆閭檎分蜿ｷ縺ｮ繝｡繝ｳ繝舌・縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・;
        err.style.display = 'block';
    }
}

async function cleanupOldEvents() {
    if (!mockData || !mockData.events) return;
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const idsToDelete = [];
    mockData.events.forEach(e => {
        if (e.date) {
            const evtDate = new Date(e.date.replace(/\//g, '-'));
            if (!isNaN(evtDate) && evtDate < twoMonthsAgo) {
                idsToDelete.push(e.id);
            }
        }
    });
    
    if (idsToDelete.length > 0) {
        try {
            const { error } = await supabase.from('events').delete().in('id', idsToDelete);
            if (!error) {
                mockData.events = mockData.events.filter(e => !idsToDelete.includes(e.id));
                console.log(`蜿､縺・ｺ亥ｮ壹ョ繝ｼ繧ｿ繧・{idsToDelete.length}莉ｶ蜑企勁縺励∪縺励◆縲Ａ);
                // 繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ逕ｻ髱｢繧帝幕縺・※縺・ｋ蝣ｴ蜷医・蜀肴緒逕ｻ
                if (currentView === 'schedule') {
                    renderSchedule();
                }
            } else {
                console.error("蜿､縺・ｺ亥ｮ壹・蜑企勁縺ｫ螟ｱ謨励＠縺ｾ縺励◆:", error);
            }
        } catch (err) {
            console.error(err);
        }
    }
}

// ==========================================
// API騾壻ｿ｡ (GET / POST)
// ==========================================
async function fetchPortalData() {
    isLoading = true;
    try {
        appRoot.innerHTML = `
            <div style="text-align:center; margin-top:5rem; font-family: var(--font-heading);">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-blue);"></i>
                <div style="color: var(--accent-blue); letter-spacing: 2px; font-size: 1.5rem;">LOADING...</div>
            </div>`;

        // Supabase縺九ｉ6縺､縺ｮ繝・・繝悶Ν繧剃ｸｦ陦後＠縺ｦ蜿門ｾ・        const [
            { data: settingsData },
            { data: departmentsData },
            { data: membersData },
            { data: booksData },
            { data: eventsData },
            { data: reviewsData }
        ] = await Promise.all([
            supabase.from('settings').select('*'),
            supabase.from('departments').select('*').order('created_at'),
            supabase.from('members').select('*'),
            supabase.from('books').select('*'),
            supabase.from('events').select('*'),
            supabase.from('reviews').select('*')
        ]);

        // settings繧・key-value 繧ｪ繝悶ず繧ｧ繧ｯ繝亥喧
        const settingsObj = {};
        if (settingsData) {
            settingsData.forEach(s => { settingsObj[s.key] = s.value; });
        }

        mockData = {
            settings: settingsObj,
            departments: departmentsData || [],
            members: membersData || [],
            books: booksData || [],
            events: eventsData || [],
            reviews: reviewsData || [],
            news: [] // 迴ｾ蝨ｨ縺ｮUI縺ｮ隕∽ｻｶ繧呈ｺ縺溘☆縺溘ａ遨ｺ驟榊・
        };

        isLoading = false;
        navigateTo(currentView);
    } catch (error) {
        isLoading = false;
        console.error("繝・・繧ｿ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆:", error);
        appRoot.innerHTML = `
            <div style="text-align:center; margin-top:5rem; background: #fff; padding: 2rem; border: var(--border-width) solid var(--border-color); border-radius: 12px; box-shadow: var(--hard-shadow); display: inline-block;">
                <div style="color: #ff6b6b; font-family: var(--font-heading); font-size: 2rem; margin-bottom: 1rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i> ERROR!
                </div>
                <p style="font-weight: 700; margin-top: 1rem;">繝・・繧ｿ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆縲・/p>
            </div>`;
    }
}

// 豎守畑縺ｮ繝・・繧ｿ騾∽ｿ｡蜃ｦ逅・async function sendAction(action, payload) {
    try {
        let result = false;
        switch(action) {
            case 'submitTyping': {
                const member = mockData.members.find(m => String(m.squadNumber) === String(payload.squadNum));
                const { error } = await supabase.from('members')
                    .update({ monthlyTyping: payload.course + "蜀・さ繝ｼ繧ｹ", typingScore: payload.score })
                    .eq('squadNumber', payload.squadNum);
                if (error) throw error;
                
                if (payload.imageBase64) {
                    const res = await fetch(payload.imageBase64);
                    const blob = await res.blob();
                    const formData = new FormData();
                    formData.append("content", `竚ｨ・・**繧ｿ繧､繝斐Φ繧ｰ險倬鹸謠仙・**\n蜷榊燕: ${member ? member.name : payload.squadNum}\n繧ｳ繝ｼ繧ｹ: ${payload.course}蜀・さ繝ｼ繧ｹ\n繧ｹ繧ｳ繧｢: ${payload.score}`);
                    formData.append("file", blob, payload.filename || "typing.jpg");
                    await fetch(DISCORD_WEBHOOK_URL_PORTAL, { method: 'POST', body: formData });
                }
                result = true;
                break;
            }
            case 'borrowBook': {
                const { error } = await supabase.from('books')
                    .update({ borrower: payload.squadNum, dueDate: payload.dueDate, status: '雋ｸ蜃ｺ荳ｭ' })
                    .eq('id', payload.bookId);
                if (error) throw error;
                result = true;
                break;
            }
            case 'returnBook': {
                const { error } = await supabase.from('books')
                    .update({ borrower: null, dueDate: null, status: '蝨ｨ蠎ｫ縺ゅｊ' })
                    .eq('id', payload.bookId);
                if (error) throw error;
                result = true;
                break;
            }
            case 'reserveBook': {
                const { error } = await supabase.from('books')
                    .update({ borrower: payload.squadNum, dueDate: null, status: '莠育ｴ・ｸｭ' })
                    .eq('id', payload.bookId);
                if (error) throw error;
                result = true;
                break;
            }
            case 'updateAttendance': {
                const event = mockData.events.find(e => String(e.id) === String(payload.eventId));
                if (!event) throw new Error('Event not found');
                
                let att = event.attendees ? String(event.attendees).split(',').map(s=>s.trim()).filter(s=>s) : [];
                let abs = event.absentees ? String(event.absentees).split(',').map(s=>s.trim()).filter(s=>s) : [];
                
                // 譌｢蟄倥°繧牙炎髯､
                att = att.filter(s => s !== payload.squadNum);
                abs = abs.filter(s => s !== payload.squadNum);
                
                if (payload.status === 'attend') att.push(payload.squadNum);
                if (payload.status === 'absent') abs.push(payload.squadNum);
                
                const updates = { attendees: att.join(', '), absentees: abs.join(', ') };
                const { error } = await supabase.from('events').update(updates).eq('id', payload.eventId);
                if (error) throw error;
                result = true;
                break;
            }
            case 'addEvent': {
                const { error } = await supabase.from('events').insert([{
                    title: payload.title,
                    date: payload.date,
                    startTime: payload.startTime,
                    endTime: payload.endTime,
                    location: payload.location,
                    description: payload.description,
                    capacity: payload.capacity,
                    host: payload.host,
                    color: payload.color
                }]);
                if (error) throw error;
                
                await fetch(DISCORD_WEBHOOK_URL_PORTAL, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ content: `套 **譁ｰ縺励＞繧､繝吶Φ繝医′霑ｽ蜉縺輔ｌ縺ｾ縺励◆**\n${payload.title}\n譌･遞・ ${payload.date}`})
                });
                result = true;
                break;
            }
            case 'editEvent': {
                const { error } = await supabase.from('events').update({
                    title: payload.title,
                    date: payload.date,
                    startTime: payload.startTime,
                    endTime: payload.endTime,
                    location: payload.location,
                    description: payload.description,
                    capacity: payload.capacity,
                    host: payload.host,
                    color: payload.color
                }).eq('id', payload.id);
                if (error) throw error;
                result = true;
                break;
            }
            case 'deleteEvent': {
                const { error } = await supabase.from('events').delete().eq('id', payload.eventId);
                if (error) throw error;
                result = true;
                break;
            }
            case 'updateMemberField': {
                const updates = {};
                updates[payload.fieldName] = payload.newValue;
                const { error } = await supabase.from('members').update(updates).eq('squadNumber', payload.squadNum);
                if (error) throw error;
                result = true;
                break;
            }
            case 'addReview': {
                const { error } = await supabase.from('reviews').insert([{
                    squadNumber: payload.squadNum,
                    bookId: payload.bookId,
                    bookTitle: payload.bookTitle,
                    docLink: payload.docLink,
                    date: payload.date,
                    reviewer: payload.reviewer
                }]);
                if (error) throw error;
                
                await fetch(DISCORD_WEBHOOK_URL_LIBRARY, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ content: `答 **譁ｰ縺励＞繝ｬ繝薙Η繝ｼ縺瑚ｿｽ蜉縺輔ｌ縺ｾ縺励◆**\n譛ｬ: ${payload.bookTitle}\n繝ｬ繝薙Η繧｢繝ｼ: ${payload.reviewer}\n繝ｪ繝ｳ繧ｯ: ${payload.docLink}`})
                });
                result = true;
                break;
            }
            case 'batchUpdateMemberDepartments': {
                for (const u of payload.updates) {
                    await supabase.from('members').update({ departmentIds: u.departmentIds }).eq('squadNumber', u.squadNum);
                }
                result = true;
                break;
            }
            case 'updateMemberCategory': {
                const member = mockData.members.find(m => String(m.squadNumber) === String(payload.squadNum));
                const achievements = member.achievements_and_flags || {};
                achievements[payload.fieldName] = payload.newValue;
                const { error } = await supabase.from('members')
                    .update({ achievements_and_flags: achievements })
                    .eq('squadNumber', payload.squadNum);
                if (error) throw error;
                result = true;
                break;
            }
            case 'updateMemberBadge': {
                const member = mockData.members.find(m => String(m.squadNumber) === String(payload.squadNum));
                let badges = member.badges || [];
                if (payload.isRemove) {
                    badges = badges.filter(b => !b.includes(payload.badgeName));
                } else {
                    badges.push(`<span class="badge" style="background:${payload.badgeColor};">${payload.badgeName}</span>`);
                }
                const { error } = await supabase.from('members').update({ badges: badges }).eq('squadNumber', payload.squadNum);
                if (error) throw error;
                result = true;
                break;
            }
            case 'updateMemberDepartment': {
                const member = mockData.members.find(m => String(m.squadNumber) === String(payload.squadNum));
                let depts = member.departmentIds || [];
                if (payload.isRemove) {
                    depts = depts.filter(d => !d.startsWith(payload.deptId));
                } else {
                    const newDept = payload.title ? `${payload.deptId}(${payload.title})` : payload.deptId;
                    depts.push(newDept);
                }
                const { error } = await supabase.from('members').update({ departmentIds: depts }).eq('squadNumber', payload.squadNum);
                if (error) throw error;
                result = true;
                break;
            }
            default: {
                console.warn("Unknown action routed to GAS fallback: " + action);
                const fallbackResponse = await fetch(GAS_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action, ...payload })
                });
                const res = await fallbackResponse.json();
                result = res.success;
                if (!result) alert("繧ｨ繝ｩ繝ｼ: " + res.error);
                break;
            }
        }
        return result;
    } catch (error) {
        console.error("騾∽ｿ｡繧ｨ繝ｩ繝ｼ:", error);
        alert("騾壻ｿ｡繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆: " + (error.message || JSON.stringify(error)));
        return false;
    }
}

// ==========================================
// VIEWS
// ==========================================

function getMemberNameFromSquad(squadNum) {
    if (!squadNum) return '';
    if (mockData && mockData.members) {
        const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
        if (member && member.name) {
            return `${member.name} (${squadNum})`;
        }
    }
    return squadNum;
}

function renderHome() {
    // --- 繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ險育ｮ・---
    let topTypingScoreMember = null;
    let topTypingScore = -1;
    let topMonthlyTypingMember = null;
    let topMonthlyTypingScore = -1;

    (mockData.members || []).forEach(m => {
        // 繧ｿ繧､繝斐Φ繧ｰ險倬鹸・育ｴｯ險茨ｼ・        const tScore = parseInt(m.typingScore, 10);
        if (!isNaN(tScore) && tScore > topTypingScore) {
            topTypingScore = tScore;
            topTypingScoreMember = m;
        }

        // 莉頑怦縺ｮ繧ｿ繧､繝斐Φ繧ｰ險倬鹸
        if (m.monthlyTyping) {
            const mScoreStr = String(m.monthlyTyping).split('/')[0].replace(/[^0-9]/g, '');
            const mScore = parseInt(mScoreStr, 10);
            if (!isNaN(mScore) && mScore > topMonthlyTypingScore) {
                topMonthlyTypingScore = mScore;
                topMonthlyTypingMember = m;
            }
        }
    });

    // 隱ｭ譖ｸ諢滓Φ譁・・髮・ｨ・    const reviewCounts = {};
    const monthlyReviewCounts = {};
    const currentMonthPrefix = mockData.settings && mockData.settings['Current month'] ? mockData.settings['Current month'].replace('-', '/') : '';
    
    (mockData.reviews || []).forEach(r => {
        const sq = String(r.squadNumber);
        reviewCounts[sq] = (reviewCounts[sq] || 0) + 1;
        
        if (currentMonthPrefix && r.date && r.date.startsWith(currentMonthPrefix)) {
            monthlyReviewCounts[sq] = (monthlyReviewCounts[sq] || 0) + 1;
        }
    });

    let topReviewSq = null;
    let topReviewCount = 0;
    Object.keys(reviewCounts).forEach(sq => {
        if (reviewCounts[sq] > topReviewCount) {
            topReviewCount = reviewCounts[sq];
            topReviewSq = sq;
        }
    });
    const topReviewMember = topReviewSq ? (mockData.members || []).find(m => String(m.squadNumber) === topReviewSq) : null;

    let topMonthlyReviewSq = null;
    let topMonthlyReviewCount = 0;
    Object.keys(monthlyReviewCounts).forEach(sq => {
        if (monthlyReviewCounts[sq] > topMonthlyReviewCount) {
            topMonthlyReviewCount = monthlyReviewCounts[sq];
            topMonthlyReviewSq = sq;
        }
    });
    const topMonthlyReviewMember = topMonthlyReviewSq ? (mockData.members || []).find(m => String(m.squadNumber) === topMonthlyReviewSq) : null;

    const currentMonthLabel = mockData.settings && mockData.settings['Current month'] ? mockData.settings['Current month'].split('-')[1].replace(/^0/, '') + '譛・ : '莉頑怦';

    let html = `
        <div class="view-animate">
            <h1 class="section-title">繝帙・繝</h1>
            
            <!-- Marquee for Goal -->
            <div class="marquee-container">
                <div class="marquee-content">
                    <span class="marquee-text">縺壹→縺壹→縺壹→縺壹→縺壹→螟｢荳ｭ</span>
                    <span class="marquee-text">縺壹→縺壹→縺壹→縺壹→縺壹→螟｢荳ｭ</span>
                    <span class="marquee-text">縺壹→縺壹→縺壹→縺壹→縺壹→螟｢荳ｭ</span>
                    <span class="marquee-text">縺壹→縺壹→縺壹→縺壹→縺壹→螟｢荳ｭ</span>
                    <span class="marquee-text">縺壹→縺壹→縺壹→縺壹→縺壹→螟｢荳ｭ</span>
                </div>
            </div>

            <!-- 髮・粋蜀咏悄 -->
            <div style="margin-bottom: 3rem; position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 0 40px rgba(99, 179, 237, 0.25), 0 8px 32px rgba(0,0,0,0.4);">
                <img src="./images/group_photo.png" alt="WCP髮・粋蜀咏悄"
                     style="width: 100%; max-height: 480px; object-fit: cover; object-position: center top; display: block;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 1.2rem 1.5rem;
                            background: linear-gradient(to top, rgba(10,10,26,0.85) 0%, transparent 100%);
                            font-family: var(--font-heading); font-size: 1.1rem; color: rgba(255,255,255,0.8); letter-spacing: 0.1em;">
                    WCP 繝｡繝ｳ繝舌・
                </div>
            </div>

            <div class="grid-2" style="margin-bottom: 4rem;">
                <div>
                    <h3 style="font-family: var(--font-heading); font-size: 4rem; margin-bottom: 1rem; color: var(--accent-blue); line-height: 1;">逅・ｿｵ</h3>
                    <div style="font-family: var(--font-mono); font-size: 1.1rem; line-height: 1.8; color: var(--text-muted); border-left: 2px solid var(--border-color); padding-left: 1rem;">
                        <strong style="color: var(--accent-blue);">逅・ｿｵ:</strong><br>
                        闍･閠・′閾ｪ蛻・◆縺｡縺ｮ縲後ｄ繧翫◆縺・阪ｒ霑ｽ豎ゅ＠縲∬・蛻・・莠ｺ逕溘→閾ｪ蛻・↓髢｢繧上ｋ莠ｺ縺ｮ莠ｺ逕溷・縺ｦ繧定ｱ翫°縺ｫ縺吶ｋ縲・br><br>
                        <strong style="color: var(--accent-blue);">繝薙ず繝ｧ繝ｳ:</strong><br>
                        蟄ｦ逕溘′螟壽ｧ倥〒繝ｯ繧ｯ繝ｯ繧ｯ縺吶ｋ蟆・擂縺ｮ驕ｸ謚櫁い繧偵∬・蛻・◆縺｡縺ｧ蜑ｵ繧雁・縺帙ｋ迺ｰ蠅・ｒ縺､縺上ｋ縲・br><br>
                        <strong style="color: var(--accent-blue);">繝溘ャ繧ｷ繝ｧ繝ｳ:</strong><br>
                        縲瑚｡励▼縺上ｊ縲阪ｒ騾壹§縺ｦ縲∝慍蝓溘ｄ遉ｾ莨壹→縺､縺ｪ縺後ｊ縺ｪ縺後ｉ縲∬凶閠・′謖第姶縺玲・髟ｷ縺吶ｋ讖滉ｼ壹ｒ謠蝉ｾ帙☆繧九・                    </div>
                </div>

                <div style="background-color: #cda87a; background-image: radial-gradient(#b89467 15%, transparent 16%), radial-gradient(#b89467 15%, transparent 16%); background-size: 16px 16px; background-position: 0 0, 8px 8px; border: 12px solid #6b4c2a; border-radius: 12px; padding: 2rem; box-shadow: inset 0 0 30px rgba(0,0,0,0.4), 10px 10px 30px rgba(0,0,0,0.2);">
                    <div style="text-align: center;">
                        <h3 style="font-family: var(--font-heading); font-size: 3.5rem; margin-bottom: 2.5rem; color: #fff; line-height: 1; text-shadow: 2px 2px 6px rgba(0,0,0,0.6); display: inline-block; background: rgba(0,0,0,0.2); padding: 0.8rem 2.5rem; border-radius: 8px; transform: rotate(-1deg); box-shadow: 2px 2px 5px rgba(0,0,0,0.3); border: 1px dashed rgba(255,255,255,0.4);">荘 Honor Board</h3>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <!-- 繧ｿ繧､繝斐Φ繧ｰ・育ｴｯ險茨ｼ・-->
                        <div style="background: #fffae6; border-radius: 2px; padding: 2rem 1.5rem 1.5rem; box-shadow: 4px 6px 15px rgba(0,0,0,0.3); position: relative; transform: rotate(-2deg); transition: transform 0.2s ease;">
                            <div style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 16px; height: 16px; background: radial-gradient(circle at 30% 30%, #ff7675, #d63031); border-radius: 50%; box-shadow: 2px 4px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.2);"></div>
                            <div style="font-size: 0.8rem; color: #777; font-weight: bold; margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px dashed #ccc; padding-bottom: 0.5rem; text-align: center;">譛鬮倥ち繧､繝斐Φ繧ｰ險倬鹸</div>
                            ${topTypingScoreMember ? `
                                <div style="font-size: 1.2rem; font-weight: 800; color: #2d3436; margin-bottom: 0.3rem; text-align: center;"><i class="fa-solid fa-medal" style="color: #FFD700; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.2));"></i> ${topTypingScoreMember.name || topTypingScoreMember.squadNumber}</div>
                                <div style="font-size: 1.8rem; font-weight: 900; color: #000; text-align: center;">${topTypingScore} <span style="font-size: 0.8rem; color: #777; font-weight: bold;">SCORE</span></div>
                            ` : `<div style="color: #999; font-size: 0.9rem; text-align: center;">隧ｲ蠖楢・↑縺・/div>`}
                        </div>

                        <!-- 繧ｿ繧､繝斐Φ繧ｰ・井ｻ頑怦・・-->
                        <div style="background: #f0f8ff; border-radius: 2px; padding: 2rem 1.5rem 1.5rem; box-shadow: 4px 6px 15px rgba(0,0,0,0.3); position: relative; transform: rotate(1.5deg); transition: transform 0.2s ease;">
                            <div style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 16px; height: 16px; background: radial-gradient(circle at 30% 30%, #74b9ff, #0984e3); border-radius: 50%; box-shadow: 2px 4px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.2);"></div>
                            <div style="font-size: 0.8rem; color: #777; font-weight: bold; margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px dashed #ccc; padding-bottom: 0.5rem; text-align: center;">${currentMonthLabel}縺ｮ繧ｿ繧､繝斐Φ繧ｰ險倬鹸</div>
                            ${topMonthlyTypingMember ? `
                                <div style="font-size: 1.2rem; font-weight: 800; color: #2d3436; margin-bottom: 0.3rem; text-align: center;"><i class="fa-solid fa-medal" style="color: #C0C0C0; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.2));"></i> ${topMonthlyTypingMember.name || topMonthlyTypingMember.squadNumber}</div>
                                <div style="font-size: 1.8rem; font-weight: 900; color: #000; text-align: center;">${topMonthlyTypingScore} <span style="font-size: 0.8rem; color: #777; font-weight: bold;">SCORE</span></div>
                            ` : `<div style="color: #999; font-size: 0.9rem; text-align: center;">隧ｲ蠖楢・↑縺・/div>`}
                        </div>

                        <!-- 隱ｭ譖ｸ・育ｴｯ險茨ｼ・-->
                        <div style="background: #fff0f5; border-radius: 2px; padding: 2rem 1.5rem 1.5rem; box-shadow: 4px 6px 15px rgba(0,0,0,0.3); position: relative; transform: rotate(-1deg); transition: transform 0.2s ease;">
                            <div style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 16px; height: 16px; background: radial-gradient(circle at 30% 30%, #55efc4, #00b894); border-radius: 50%; box-shadow: 2px 4px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.2);"></div>
                            <div style="font-size: 0.8rem; color: #777; font-weight: bold; margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px dashed #ccc; padding-bottom: 0.5rem; text-align: center;">隱ｭ譖ｸ諢滓Φ譁・(邏ｯ險・</div>
                            ${topReviewMember ? `
                                <div style="font-size: 1.2rem; font-weight: 800; color: #2d3436; margin-bottom: 0.3rem; text-align: center;"><i class="fa-solid fa-book-open" style="color: #e84393; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.1));"></i> ${topReviewMember.name || topReviewMember.squadNumber}</div>
                                <div style="font-size: 1.8rem; font-weight: 900; color: #000; text-align: center;">${topReviewCount} <span style="font-size: 0.8rem; color: #777; font-weight: bold;">蜀・/span></div>
                            ` : `<div style="color: #999; font-size: 0.9rem; text-align: center;">隧ｲ蠖楢・↑縺・/div>`}
                        </div>

                        <!-- 隱ｭ譖ｸ・井ｻ頑怦・・-->
                        <div style="background: #fdf5e6; border-radius: 2px; padding: 2rem 1.5rem 1.5rem; box-shadow: 4px 6px 15px rgba(0,0,0,0.3); position: relative; transform: rotate(2deg); transition: transform 0.2s ease;">
                            <div style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 16px; height: 16px; background: radial-gradient(circle at 30% 30%, #ffeaa7, #fdcb6e); border-radius: 50%; box-shadow: 2px 4px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.2);"></div>
                            <div style="font-size: 0.8rem; color: #777; font-weight: bold; margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px dashed #ccc; padding-bottom: 0.5rem; text-align: center;">${currentMonthLabel}縺ｮ隱ｭ譖ｸ諢滓Φ譁・/div>
                            ${topMonthlyReviewMember ? `
                                <div style="font-size: 1.2rem; font-weight: 800; color: #2d3436; margin-bottom: 0.3rem; text-align: center;"><i class="fa-solid fa-book-bookmark" style="color: #6c5ce7; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.1));"></i> ${topMonthlyReviewMember.name || topMonthlyReviewMember.squadNumber}</div>
                                <div style="font-size: 1.8rem; font-weight: 900; color: #000; text-align: center;">${topMonthlyReviewCount} <span style="font-size: 0.8rem; color: #777; font-weight: bold;">蜀・/span></div>
                            ` : `<div style="color: #999; font-size: 0.9rem; text-align: center;">隧ｲ蠖楢・↑縺・/div>`}
                        </div>
                    </div>
                </div>
            </div>

            <h2 class="section-title">繧ｯ繧､繝・け繧｢繧ｯ繧ｻ繧ｹ</h2>
            <div class="typo-menu-list">
                <div class="typo-menu-item" onclick="window.location.href='about.html'">
                    <span class="typo-menu-index">01</span> [ WCP縺ｫ縺､縺・※ ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='system.html'">
                    <span class="typo-menu-index">02</span> [ 繧ｷ繧ｹ繝・Β ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='manual_email.html'">
                    <span class="typo-menu-index">03</span> [ 繝槭ル繝･繧｢繝ｫ: 繝｡繝ｼ繝ｫ ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='manual_proposal.html'">
                    <span class="typo-menu-index">04</span> [ 繝槭ル繝･繧｢繝ｫ: 莨∫判譖ｸ ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='manual_accounting.html'">
                    <span class="typo-menu-index">05</span> [ 繝槭ル繝･繧｢繝ｫ: 邨檎炊 ]
                </div>
                <div class="typo-menu-item" onclick="window.location.href='manual_tools.html'">
                    <span class="typo-menu-index">06</span> [ 繝槭ル繝･繧｢繝ｫ: 繝・・繝ｫ ]
                </div>
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

function renderBooks() {
    let booksToRender = mockData.books;
    if (currentBookSearch) {
        const lowerSearch = currentBookSearch.toLowerCase();
        booksToRender = booksToRender.filter(b => {
            const titleMatch = b.title && b.title.toLowerCase().includes(lowerSearch);
            const authorMatch = b.author && b.author.toLowerCase().includes(lowerSearch);
            return titleMatch || authorMatch;
        });
    }

    if (currentBookFilterBorrowed) {
        booksToRender = booksToRender.filter(b => b.status !== 'available');
    }

    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title">蝗ｳ譖ｸ邂｡逅・/h1>
            <div style="font-size: 0.9rem; color: var(--accent-pink); margin-bottom: 1rem; font-weight: bold; background: var(--bg-main); padding: 0.5rem 1rem; border-radius: 8px; border-left: 4px solid var(--accent-pink); box-shadow: var(--shadow-out); display: inline-block;">
                <i class="fa-regular fa-clock"></i> 隱ｭ譖ｸ諢滓Φ譁・邱蛻・ ${mockData.settings['readingDeadLine'] || '譛ｪ險ｭ螳・}
            </div>
            
            <button class="cyber-btn" style="margin-bottom: 1.5rem; width: 100%; font-size: 1.1rem; padding: 1rem;" onclick="openAddReviewModal('', 'other')"><i class="fa-solid fa-pen-nib"></i> 縲瑚ｪｭ譖ｸ諢滓Φ譁・肴署蜃ｺ・亥峙譖ｸ莉･螟悶・譛ｬ・・/button>
            <div class="cyber-card" style="margin-bottom: 1.5rem; padding: 1rem;">
                <div style="font-size: 0.8rem; color: var(--accent-blue); margin-bottom: 0.3rem;"><i class="fa-solid fa-magnifying-glass"></i> 譛ｬ縺ｮ讀懃ｴ｢ (繧ｿ繧､繝医Ν繝ｻ闡苓・</div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="bookSearchInput" placeholder="譛ｬ縺ｮ繧ｿ繧､繝医Ν繧・送閠・ｒ蜈･蜉・.." value="${currentBookSearch}" 
                               onkeydown="if(event.key === 'Enter') handleBookSearch(this.value)"
                               style="flex: 1; width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem; border-radius: 4px; outline: none; transition: border-color 0.3s;"
                               onfocus="this.style.borderColor='var(--accent-blue)'" onblur="this.style.borderColor='var(--border-color)'">
                        <button class="cyber-btn" onclick="handleBookSearch(document.getElementById('bookSearchInput').value)" style="padding: 0.5rem 1rem;">讀懃ｴ｢</button>
                    </div>
                    <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.9rem; margin-top:0.5rem; color:var(--text-main); cursor:pointer;">
                        <input type="checkbox" ${currentBookFilterBorrowed ? 'checked' : ''} onchange="handleBookFilterBorrowed(this.checked)" style="cursor:pointer; transform:scale(1.2);"> 雋ｸ蜃ｺ荳ｭ縺ｮ譛ｬ縺ｮ縺ｿ陦ｨ遉ｺ
                    </label>
                </div>
            </div>

            <div class="book-shelf-grid">
                ${booksToRender.length === 0 ? '<div style="text-align:center; padding:2rem; color:var(--text-muted); grid-column: 1 / -1;">隧ｲ蠖薙☆繧区悽縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆</div>' : booksToRender.map(book => {
                    const spineColors = ['#fc8181', '#63b3ed', '#68d391', '#ffdb4d', '#b794f4', '#f6ad55', '#4fd1c5'];
                    const spineColor = spineColors[book.title.length % spineColors.length];
                    return `
                    <div class="book-spine-card" style="border-left-color: ${spineColor};">
                        <div class="book-spine-title">${book.title}</div>
                        <div class="book-meta" style="text-align:center; font-size: 0.8rem; margin-bottom: 0.5rem; word-break: break-all;">${book.author}</div>
                        
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            <div style="text-align:center; margin-bottom: 0.5rem;">
                                ${book.status === 'available' 
                                    ? (book.preserve && String(book.preserve).split(',').filter(Boolean).length > 0 
                                        ? `<span class="status-badge" style="font-size:0.7rem; padding:0.2rem 0.5rem; display:block; background:var(--accent-yellow); color:#333;">莠育ｴ・叙鄂ｮ荳ｭ</span>`
                                        : `<span class="status-badge status-available" style="font-size:0.7rem; padding:0.2rem 0.5rem; display:block;">雋ｸ蜃ｺ蜿ｯ</span>`)
                                    : `<span class="status-badge status-borrowed" style="font-size:0.7rem; padding:0.2rem 0.5rem; display:block;">雋ｸ蜃ｺ荳ｭ<br>${getMemberNameFromSquad(book.borrower)}${book.dueDate ? `<br>譛滄剞: ${String(book.dueDate).split('T')[0]}` : ''}</span>`
                                }
                            </div>
                            
                            ${(() => {
                                let preserveHtml = '';
                                if (book.preserve) {
                                    const preserveList = String(book.preserve).split(',').map(s => s.trim()).filter(Boolean);
                                    if (preserveList.length > 0) {
                                        preserveHtml = `<div style="font-size:0.7rem; color:var(--text-muted); text-align:center; margin-bottom:0.5rem; max-height:40px; overflow-y:auto; padding:2px; background:var(--surface-color); border-radius:4px;">莠育ｴ・・ ${preserveList.map(s => getMemberNameFromSquad(s)).join(', ')}</div>`;
                                    }
                                }
                                return preserveHtml;
                            })()}
                            
                            ${book.status === 'available'
                                ? `<button class="cyber-btn" style="padding: 0.4rem; font-size: 0.75rem;" onclick="openBorrowModal('${book.id}')">蛟溘ｊ繧・/button>`
                                : `<div style="display:flex; gap:0.2rem;"><button class="cyber-btn danger" style="padding: 0.4rem; font-size: 0.75rem; flex:1;" onclick="returnBook('${book.id}')">霑泌唆</button><button class="cyber-btn" style="padding: 0.4rem; font-size: 0.75rem; flex:1; background:var(--accent-yellow); color:#333; border-color:var(--accent-yellow);" onclick="openReserveModal('${book.id}')">莠育ｴ・/button></div>`
                            }
                            <button class="cyber-btn" style="padding: 0.4rem; font-size: 0.75rem;" title="諢滓Φ譁・ｱ･豁ｴ" onclick="openReviewModal('${book.id}')"><i class="fa-solid fa-clock-rotate-left"></i> 諢滓Φ譁・/button>
                            <button class="cyber-btn" style="padding: 0.4rem; font-size: 0.75rem; color: var(--accent-green);" title="諢滓Φ譁・署蜃ｺ" onclick="openAddReviewModal('', '${book.id}')"><i class="fa-solid fa-pen-nib"></i> 謠仙・</button>
                        </div>
                    </div>
                `}).join('')}
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

window.switchRosterTab = function(tab) {
    currentRosterTab = tab;
    renderRoster();
}

function getOrganizationHtml() {
    let initialNodes = renderOrgNodes(null, 0);
    return `
        <div class="organization-container" style="overflow: hidden;">
            <div class="horizontal-tree-wrapper" id="horizontal-tree-wrapper">
                ${initialNodes ? `<div class="tree-column" id="tree-col-0" data-col="0">${initialNodes}</div>` : '<div style="text-align: center; padding: 2rem; color: var(--text-muted); width: 100%;">邨・ｹ斐ョ繝ｼ繧ｿ縺後≠繧翫∪縺帙ｓ縲・/div>'}
            </div>
        </div>
    `;
}

function getDeptName(dept) {
    return dept.name || dept.Name || dept.NAME || '名称未設定';
}

function renderOrgNodes(parentId, columnIndex) {
    if (!mockData.departments) return '';
    const parentKey = String(parentId || '');
    
    // Find children
    const children = mockData.departments.filter(d => String(getDeptParentId(d)) === parentKey);
    if (children.length === 0) return '';
    
    let html = '';
    children.forEach(dept => {
        const deptId = getDeptId(dept);
        const deptName = getDeptName(dept);
        if (!deptId) return;
        
        const hasMembers = mockData.members && mockData.members.some(m => {
            const mDepts = parseDepartmentIds(m.departmentIds || m.departmentids || m.departmentsIds || m.DepartmentsIds);
            return mDepts.some(d => String(d.id) === String(deptId));
        });
        
        const hasChildren = mockData.departments.some(d => String(getDeptParentId(d)) === String(deptId));
        
        const unvisible = String(dept.members_unvisible || dept['members_unvisible'] || '').toUpperCase() === 'TRUE';
        
        // VIEW MEMBERS 繝懊ち繝ｳ縺ｯ縲碁撼譛荳倶ｽ榊ｱ､ 縺九▽ 繝｡繝ｳ繝舌・縺悟ｭ伜惠縺吶ｋ 縺九▽ members_unvisible縺荊rue縺ｧ縺ｪ縺・榊ｴ蜷医↓陦ｨ遉ｺ
        const showMembersButton = hasMembers && hasChildren && !unvisible;
        
        const dropEvents = `ondragover="handleDragOver(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${deptId}')"`;
        html += `
            <div class="tree-node-wrapper">
                <div class="org-folder-card tree-node-card" id="org-node-${deptId}" ${dropEvents} onclick="expandOrgNode('${deptId}', ${columnIndex}, this, ${hasChildren}, ${hasMembers}, false)">
                    <div class="org-folder-header">
                        <div class="org-folder-title">${deptName}</div>
                        ${showMembersButton ? `<button class="cyber-btn neon-btn" onclick="event.stopPropagation(); expandOrgNode('${deptId}', ${columnIndex}, this.closest('.org-folder-card'), ${hasChildren}, ${hasMembers}, true)">VIEW MEMBERS</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    return html;
}

function renderMemberNodes(deptId, columnIndex) {
    if (!mockData.members) return '';
    const members = mockData.members.filter(m => {
        const mDepts = parseDepartmentIds(m.departmentIds || m.departmentids || m.departmentsIds || m.DepartmentsIds);
        return mDepts.some(d => String(d.id) === String(deptId));
    });
    if (members.length === 0) return '';
    
    const dData = mockData.departments.find(d => String(getDeptId(d)) === String(deptId));
    const dName = dData ? getDeptName(dData) : '繝｡繝ｳ繝舌・';
    
    let membersHtml = members.map(m => {
        const mDepts = parseDepartmentIds(m.departmentIds || m.departmentids || m.departmentsIds || m.DepartmentsIds);
        const targetDept = mDepts.find(d => String(d.id) === String(deptId));

        // 閧ｩ譖ｸ・夐Κ鄂ｲ蜀・・蠖ｹ閨ｷ・医≠繧後・陦ｨ遉ｺ・・        const title = targetDept && targetDept.title ? targetDept.title : '';
        const titleTag = title
            ? `<span style="background: var(--accent-yellow); color: #333; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: bold; font-size: 0.72rem; white-space: nowrap; box-shadow: 0 0 6px var(--accent-yellow);">${title}</span>`
            : '';

        // 繧ｫ繝・ざ繝ｪ/蛹ｺ蛻・ｼ壹≠繧後・蜷榊燕縺ｮ荳九↓阮・￥陦ｨ遉ｺ
        const category = (m.category || '').trim();
        const categoryTag = category
            ? `<div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem;">${category}</div>`
            : '';
            
        return `
            <div class="member-item" onclick="window.location.hash=''; switchRosterTab('members'); setTimeout(() => toggleMemberDetails('${m.squadNumber}'), 100);">
                <div class="avatar" style="width: 32px; height: 32px; font-size: 0.85rem; margin-right: 0.75rem; flex-shrink: 0;">${m.squadNumber}</div>
                <div style="min-width: 0;">
                    <div style="font-size: 0.9rem; font-weight: bold; color: var(--text-main); display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                        ${m.name}${titleTag ? '&nbsp;' + titleTag : ''}
                    </div>
                    ${categoryTag}
                </div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="tree-node-wrapper">
            <div class="org-folder-card tree-node-card member-list-card">
                <div class="org-folder-header">
                    <div class="org-folder-title" style="color: var(--accent-green); text-shadow: 0 0 8px rgba(72, 187, 120, 0.6);">
                        <i class="fa-solid fa-users"></i> ${dName}
                    </div>
                </div>
                <div class="member-list-content">
                    ${membersHtml}
                </div>
            </div>
        </div>
    `;
}

window.expandOrgNode = function(deptId, columnIndex, element, hasChildren, hasMembers, isMembersOnly) {
    // 1. 蜷碁嚴螻､縺ｮ蜈・ｼ溘ｒ髱槭い繧ｯ繝・ぅ繝悶↓縺吶ｋ
    const column = element.closest('.tree-column');
    if (column) {
        column.querySelectorAll('.org-folder-card').forEach(card => card.classList.remove('active'));
    }
    element.classList.add('active');

    // 2. Remove all columns to the right of the current one
    const wrapper = document.getElementById('horizontal-tree-wrapper');
    if (!wrapper) return;
    const allCols = Array.from(wrapper.querySelectorAll('.tree-column'));
    allCols.forEach(col => {
        if (parseInt(col.dataset.col) > columnIndex) {
            col.remove();
        }
    });
    // 譌｢蟄倥・SVG邱壹ｂ豸医☆
    const oldSvg = document.getElementById('tree-connections-svg');
    if (oldSvg) oldSvg.remove();

    // 3. Render next column
    if (isMembersOnly || (!hasChildren && hasMembers) || hasChildren) {
        let nextHtml = '';
        const isMemberColumn = isMembersOnly || (!hasChildren && hasMembers);
        
        if (isMemberColumn) {
            if (hasMembers) nextHtml = renderMemberNodes(deptId, columnIndex + 1);
        } else {
            if (hasChildren) nextHtml = renderOrgNodes(deptId, columnIndex + 1);
        }
        
        if (nextHtml) {
            const newColHtml = `<div class="tree-column" id="tree-col-${columnIndex + 1}" data-col="${columnIndex + 1}">${nextHtml}</div>`;
            wrapper.insertAdjacentHTML('beforeend', newColHtml);
            
            // Frame 1: 菴咲ｽｮ蜷医ｏ縺幢ｼ域怙蛻昴・蟄舌き繝ｼ繝峨・荳顔ｫｯ = 隕ｪ繧ｫ繝ｼ繝峨・荳顔ｫｯ・・            requestAnimationFrame(() => {
                const addedCol = document.getElementById(`tree-col-${columnIndex + 1}`);
                if (addedCol) {
                    const parentRect = element.getBoundingClientRect();
                    const colRect = addedCol.getBoundingClientRect();
                    // 譛蛻昴・蟄舌き繝ｼ繝峨・荳顔ｫｯ繧定ｦｪ繧ｫ繝ｼ繝峨・荳顔ｫｯ縺ｫ蜷医ｏ縺帙ｋ
                    const shift = Math.max(0, parentRect.top - colRect.top);
                    addedCol.style.paddingTop = shift + 'px';
                    // 窶ｻ 繝｡繝ｳ繝舌・繧ｫ繝ｼ繝峨・鬮倥＆縺ｯ蠑ｷ蛻ｶ縺励↑縺・ゅさ繝ｳ繝・Φ繝・↓蜷医ｏ縺帙※閾ｪ蜍戊ｪｿ謨ｴ縺輔○繧・                }

                // 繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ(0.4s)螳御ｺ・ｾ後↓邱壹ｒ謠上￥ 竊・蠎ｧ讓吶′final繝昴ず繧ｷ繝ｧ繝ｳ縺ｧ豁｣遒ｺ縺ｫ蜿悶ｌ繧・                setTimeout(() => {
                    drawTreeLines();
                    const addedCol2 = document.getElementById(`tree-col-${columnIndex + 1}`);
                    if (addedCol2) {
                        addedCol2.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
                    }
                }, 420);
            });
        }
    }
}

/**
 * SVG繧ｪ繝ｼ繝舌・繝ｬ繧､縺ｧ蜈ｨ繧ｫ繝ｩ繝髢薙・謗･邯夂ｷ壹ｒ謠冗判縺吶ｋ
 *
 * 邱壹・讒矩・郁､・焚蟄舌き繝ｼ繝峨・蝣ｴ蜷茨ｼ・
 *   竭 譫・: 隕ｪ繧ｫ繝ｼ繝牙承霎ｺ 竊・譛蛻昴・蟄舌き繝ｼ繝牙ｷｦ霎ｺ (隕ｪ繧ｫ繝ｼ繝峨・荳ｭ蠢ズ縺ｮ鬮倥＆縺ｧ豌ｴ蟷ｳ)
 *   竭｡ 蟷ｹ: 譫・縺ｮ荳ｭ轤ｹX 縺九ｉ 譛蠕後・蟄舌き繝ｼ繝峨・荳ｭ蠢ズ 縺ｾ縺ｧ蝙ら峩縺ｫ荳九∈
 *   竭｢ 蜷・椌: 2譫夂岼莉･髯阪・蟄舌き繝ｼ繝峨・蟾ｦ霎ｺ 竊・蟷ｹX (蜷・き繝ｼ繝峨・荳ｭ蠢ズ縺ｮ鬮倥＆縺ｧ豌ｴ蟷ｳ)
 *
 * 邱壹・讒矩・亥ｭ舌き繝ｼ繝・譫壹・蝣ｴ蜷茨ｼ・
 *   竭 逶ｴ邱・ 隕ｪ繧ｫ繝ｼ繝牙承霎ｺ 竊・繧ｫ繝ｼ繝牙ｷｦ霎ｺ (隕ｪ繧ｫ繝ｼ繝峨・荳ｭ蠢ズ縺ｮ鬮倥＆縺ｧ豌ｴ蟷ｳ)
 */
function drawTreeLines() {
    const wrapper = document.getElementById('horizontal-tree-wrapper');
    if (!wrapper) return;

    // 譌｢蟄倥・SVG繧貞炎髯､
    const old = document.getElementById('tree-connections-svg');
    if (old) old.remove();

    const cols = Array.from(wrapper.querySelectorAll('.tree-column'));
    if (cols.length < 2) return;

    const NS = 'http://www.w3.org/2000/svg';

    // SVG繧奪OM縺ｮ蜈磯ｭ縺ｫ謖ｿ蜈･・医☆縺ｹ縺ｦ縺ｮ繧ｫ繝ｩ繝繧医ｊ蜑・= 閭碁擇・・    // z-index:0 縺ｫ縺吶ｋ縺薙→縺ｧ tree-column(z-index:1) 縺悟燕髱｢縺ｫ譚･縺ｦ邱壹′髫繧後ｋ
    const svg = document.createElementNS(NS, 'svg');
    svg.id = 'tree-connections-svg';
    svg.setAttribute('width', wrapper.scrollWidth);
    svg.setAttribute('height', wrapper.scrollHeight);
    svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:0;overflow:visible;';
    wrapper.prepend(svg);

    // 蠎ｧ讓吝､画鋤: viewport蠎ｧ讓・竊・wrapper蜀・せ繧ｯ繝ｭ繝ｼ繝ｫ蠎ｧ讓・    // SVG縺ｯwrapper縺ｮpadding-box蟾ｦ荳雁次轤ｹ繧・0,0)縺ｨ縺吶ｋ
    const wStyle = getComputedStyle(wrapper);
    const bLeft = parseFloat(wStyle.borderLeftWidth) || 0;
    const bTop  = parseFloat(wStyle.borderTopWidth)  || 0;
    const wRect = wrapper.getBoundingClientRect();
    const ox = wRect.left + bLeft;  // SVG(0,0)縺ｮviewport x
    const oy = wRect.top  + bTop;   // SVG(0,0)縺ｮviewport y
    const sx = wrapper.scrollLeft;
    const sy = wrapper.scrollTop;

    function toX(vx) { return vx - ox + sx; }
    function toY(vy) { return vy - oy + sy; }

    function addLine(x1, y1, x2, y2, color) {
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', x1.toFixed(1));
        line.setAttribute('y1', y1.toFixed(1));
        line.setAttribute('x2', x2.toFixed(1));
        line.setAttribute('y2', y2.toFixed(1));
        line.setAttribute('stroke', color || '#63b3ed');
        line.setAttribute('stroke-width', '2.5');
        line.setAttribute('stroke-opacity', '0.85');
        line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(line);
    }

    // 蜷・き繝ｩ繝髢薙・謗･邯夂ｷ壹ｒ謠冗判
    for (let i = 1; i < cols.length; i++) {
        const childCol  = cols[i];
        const parentCol = cols[i - 1];

        const activeCard = parentCol.querySelector('.org-folder-card.active');
        if (!activeCard) continue;

        const childWrappers = Array.from(childCol.querySelectorAll(':scope > .tree-node-wrapper'));
        if (!childWrappers.length) continue;

        const isMemberCol = !!childCol.querySelector('.member-list-card');
        const color = isMemberCol ? '#48bb78' : '#63b3ed';

        // 隕ｪ繧ｫ繝ｼ繝峨・蠎ｧ讓呻ｼ亥承霎ｺ繝ｻ荳ｭ蠢ズ・・        const pRect = activeCard.getBoundingClientRect();
        const px2 = toX(pRect.right);
        const pcy = toY(pRect.top + pRect.height / 2);

        // 蟄舌き繝ｩ繝縺ｮ蟾ｦ霎ｺ繧偵☆縺ｹ縺ｦ縺ｮ譫昴・邨らせ縺ｨ縺励※菴ｿ縺・        // ・医き繝ｼ繝峨・ left 縺ｯ animation騾比ｸｭ縺ｧ繝悶Ξ繧句庄閭ｽ諤ｧ縺後≠繧九◆繧√√き繝ｩ繝蟾ｦ霎ｺ繧貞渕貅悶↓縺吶ｋ・・        const colRect = childCol.getBoundingClientRect();
        const colLeft = toX(colRect.left);

        // 譛蠕後・蟄舌き繝ｼ繝峨・荳ｭ蠢ズ
        const lcEl = childWrappers[childWrappers.length - 1].querySelector('.org-folder-card');
        if (!lcEl) continue;
        const lr = lcEl.getBoundingClientRect();
        const lcy = toY(lr.top + lr.height / 2);

        if (childWrappers.length === 1) {
            // 蟄舌き繝ｼ繝・譫・ 隕ｪ蜿ｳ霎ｺ 竊・繧ｫ繝ｩ繝蟾ｦ霎ｺ (隕ｪ繧ｫ繝ｼ繝峨・荳ｭ蠢ズ縺ｧ)
            addLine(px2, pcy, colLeft, pcy, color);
        } else {
            // 竭 譫・: 隕ｪ蜿ｳ霎ｺ 竊・繧ｫ繝ｩ繝蟾ｦ霎ｺ (隕ｪ繧ｫ繝ｼ繝峨・荳ｭ蠢ズ縺ｧ)
            addLine(px2, pcy, colLeft, pcy, color);

            // 蟷ｹX = 譫・縺ｮ荳ｭ轤ｹ
            const tx = (px2 + colLeft) / 2;

            // 竭｡ 蟷ｹ: 譫・縺ｮ荳ｭ轤ｹX縺九ｉ譛蠕後・蟄舌き繝ｼ繝峨・荳ｭ蠢ズ縺ｾ縺ｧ蝙ら峩
            addLine(tx, pcy, tx, lcy, color);

            // 竭｢ 蜷・椌: 2譫夂岼莉･髯阪・蟄舌き繝ｼ繝峨・蟾ｦ霎ｺ 竊・蟷ｹX
            for (let j = 1; j < childWrappers.length; j++) {
                const card = childWrappers[j].querySelector('.org-folder-card');
                if (!card) continue;
                const r = card.getBoundingClientRect();
                const ccy = toY(r.top + r.height / 2);
                addLine(colLeft, ccy, tx, ccy, color);
            }
        }
    }
}

window.openDepartmentMembersModal = function(deptId) {
    const allIds = getAllDescendantDeptIds(deptId);
    allIds.push(String(deptId));
    
    const targetMembers = (mockData.members || []).filter(m => {
        const mDepts = parseDepartmentIds(m.departmentIds || m.departmentids || m.departmentsIds || m.DepartmentsIds);
        return mDepts.some(d => allIds.includes(String(d.id)));
    });
    
    const dData = mockData.departments.find(d => String(getDeptId(d)) === String(deptId));
    const dName = dData ? getDeptName(dData) : deptId;
    
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue); text-shadow: 0 0 10px var(--accent-blue);">
            <i class="fa-solid fa-users-viewfinder"></i> ${dName} 縺ｮ繝｡繝ｳ繝舌・
        </h2>
        <div style="max-height: 60vh; overflow-y: auto; padding-right: 1rem;">
            ${targetMembers.length === 0 ? '<p style="color: var(--text-muted);">謇螻槭Γ繝ｳ繝舌・縺ｯ縺・∪縺帙ｓ縲・/p>' : ''}
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${targetMembers.map(m => {
                    const mDepts = parseDepartmentIds(m.departmentIds || m.departmentids);
                    const targetDept = mDepts.find(d => allIds.includes(String(d.id)));
                    const titleTag = targetDept && targetDept.title 
                        ? `<span style="background: var(--accent-yellow); color: #333; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold; font-size: 0.85rem; margin-right: 0.5rem; box-shadow: 0 0 8px var(--accent-yellow);">[${targetDept.title}]</span>` 
                        : '';
                        
                    return `
                        <div style="background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 12px; display: flex; align-items: center; border-left: 4px solid var(--accent-blue);">
                            <div class="avatar" style="width: 50px; height: 50px; font-size: 1.2rem; margin-right: 1rem;">${m.squadNumber}</div>
                            <div>
                                <div style="font-size: 1.1rem; font-weight: bold; color: var(--text-main); margin-bottom: 0.3rem;">
                                    ${titleTag}${m.name}
                                </div>
                                <div style="font-size: 0.85rem; color: var(--text-muted);">
                                    閭檎分蜿ｷ: ${m.squadNumber} / 繧ｫ繝・ざ繝ｪ繝ｼ: ${m.category || '譛ｪ逋ｻ骭ｲ'}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    openModal(html);
}

function getAllDescendantDeptIds(parentId, visited = new Set()) {
    let ids = [];
    if (!mockData.departments) return ids;
    const parentKey = String(parentId || '');
    if (visited.has(parentKey)) return ids;
    visited.add(parentKey);

    const children = mockData.departments.filter(d => String(getDeptParentId(d)) === parentKey);
    children.forEach(c => {
        const cId = getDeptId(c);
        if (cId && !visited.has(String(cId))) {
            ids.push(String(cId));
            const newVisited = new Set(visited);
            ids = ids.concat(getAllDescendantDeptIds(cId, newVisited));
        }
    });
    return ids;
}

window.handleRosterSearch = function(val) { currentRosterSearch = val; renderRoster(); };
window.handleRosterFilterProject = function(val) { currentRosterFilterProject = val; renderRoster(); };
window.handleRosterFilterGeneration = function(val) { currentRosterFilterGeneration = val; renderRoster(); };
window.handleRosterFilterCategory = function(val) { currentRosterFilterCategory = val; renderRoster(); };
window.handleBookSearch = function(val) { currentBookSearch = val; renderBooks(); };
window.handleBookFilterBorrowed = function(val) { currentBookFilterBorrowed = val; renderBooks(); };

function renderRoster() {
    mockData.members = mockData.members || [];
    mockData.departments = mockData.departments || [];
    mockData.reviews = mockData.reviews || [];
    mockData.settings = mockData.settings || {};

    const now = new Date();

    let tabsHtml = `
        <div class="schedule-tabs" style="margin-bottom: 2rem;">
            <button class="schedule-tab-btn ${currentRosterTab === 'members' ? 'active' : ''}" onclick="switchRosterTab('members')">
                <i class="fa-solid fa-users"></i> 繝｡繝ｳ繝舌・
            </button>
            <button class="schedule-tab-btn ${currentRosterTab === 'organization' ? 'active' : ''}" onclick="switchRosterTab('organization')">
                <i class="fa-solid fa-sitemap"></i> 邨・ｹ・            </button>
        </div>
    `;

    let contentHtml = '';

    if (currentRosterTab === 'members') {
        // Extract filter options dynamically
        const uniqueCategories = [...new Set(mockData.members.map(m => m.category || '譛ｪ逋ｻ骭ｲ'))].filter(Boolean);
        const uniqueGenerations = [...new Set(mockData.members.map(m => m.squadNumber ? String(m.squadNumber).charAt(0) : '').filter(Boolean))].sort();
        
        // Extract projects from mockData.departments
        const uniqueProjects = mockData.departments.map(d => ({
            id: getDeptId(d),
            name: getDeptName(d)
        })).filter(p => p.id && p.name);

        let membersToRender = mockData.members;

        // Apply Search Filter
        if (currentRosterSearch) {
            const lowerSearch = currentRosterSearch.toLowerCase();
            membersToRender = membersToRender.filter(m => {
                const nameMatch = m.name && m.name.toLowerCase().includes(lowerSearch);
                const squadMatch = m.squadNumber && String(m.squadNumber).toLowerCase().includes(lowerSearch);
                return nameMatch || squadMatch;
            });
        }

        // Apply Project Filter
        if (currentRosterFilterProject) {
            membersToRender = membersToRender.filter(m => {
                const depts = parseDepartmentIds(m.departmentIds || m.departmentids || m.departmentsIds || m.DepartmentsIds);
                return depts.some(d => String(d.id) === currentRosterFilterProject);
            });
        }

        // Apply Generation Filter
        if (currentRosterFilterGeneration) {
            membersToRender = membersToRender.filter(m => {
                return m.squadNumber && String(m.squadNumber).charAt(0) === currentRosterFilterGeneration;
            });
        }

        // Apply Category Filter
        if (currentRosterFilterCategory) {
            membersToRender = membersToRender.filter(m => {
                const cat = m.category || '譛ｪ逋ｻ骭ｲ';
                return cat === currentRosterFilterCategory;
            });
        }

        // Filter UI HTML
        const filterHtml = `
            <div class="cyber-card" style="margin-bottom: 1.5rem; padding: 1rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;">
                <div style="flex: 1; min-width: 200px;">
                    <div style="font-size: 0.8rem; color: var(--accent-blue); margin-bottom: 0.3rem;"><i class="fa-solid fa-magnifying-glass"></i> 讀懃ｴ｢ (蜷榊燕繝ｻ閭檎分蜿ｷ)</div>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="rosterSearchInput" placeholder="蜷榊燕縺ｾ縺溘・閭檎分蜿ｷ繧貞・蜉・.." value="${currentRosterSearch}" 
                               onkeydown="if(event.key === 'Enter') handleRosterSearch(this.value)"
                               style="flex: 1; width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem; border-radius: 4px; outline: none; transition: border-color 0.3s;"
                               onfocus="this.style.borderColor='var(--accent-blue)'" onblur="this.style.borderColor='var(--border-color)'">
                        <button class="cyber-btn" onclick="handleRosterSearch(document.getElementById('rosterSearchInput').value)" style="padding: 0.5rem 1rem;">讀懃ｴ｢</button>
                    </div>
                </div>
                <div style="flex: 1; min-width: 150px;">
                    <div style="font-size: 0.8rem; color: var(--accent-blue); margin-bottom: 0.3rem;"><i class="fa-solid fa-folder"></i> 繝励Ο繧ｸ繧ｧ繧ｯ繝・/div>
                    <select onchange="handleRosterFilterProject(this.value)" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem; border-radius: 4px; outline: none; cursor: pointer;">
                        <option value="">縺吶∋縺ｦ</option>
                        ${uniqueProjects.map(p => `<option value="${p.id}" ${currentRosterFilterProject === String(p.id) ? 'selected' : ''}>${p.name}</option>`).join('')}
                    </select>
                </div>
                <div style="flex: 1; min-width: 100px;">
                    <div style="font-size: 0.8rem; color: var(--accent-blue); margin-bottom: 0.3rem;"><i class="fa-solid fa-calendar-days"></i> 蜈･莨壽悄</div>
                    <select onchange="handleRosterFilterGeneration(this.value)" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem; border-radius: 4px; outline: none; cursor: pointer;">
                        <option value="">縺吶∋縺ｦ</option>
                        ${uniqueGenerations.map(g => `<option value="${g}" ${currentRosterFilterGeneration === g ? 'selected' : ''}>${g}譛・/option>`).join('')}
                    </select>
                </div>
                <div style="flex: 1; min-width: 150px;">
                    <div style="font-size: 0.8rem; color: var(--accent-blue); margin-bottom: 0.3rem;"><i class="fa-solid fa-layer-group"></i> 繧ｫ繝・ざ繝ｪ繝ｼ</div>
                    <select onchange="handleRosterFilterCategory(this.value)" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem; border-radius: 4px; outline: none; cursor: pointer;">
                        <option value="">縺吶∋縺ｦ</option>
                        ${uniqueCategories.map(c => `<option value="${c}" ${currentRosterFilterCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;

        contentHtml = `
            ${filterHtml}
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${membersToRender.length === 0 ? '<div class="cyber-card" style="text-align:center; padding:2rem; color:var(--text-muted);">隧ｲ蠖薙☆繧九Γ繝ｳ繝舌・縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆</div>' : membersToRender.map(member => {
                    const depts = parseDepartmentIds(member.departmentIds || member.departmentids || member.departmentsIds || member.DepartmentsIds);
                    let deptBadgesHtml = '';
                    if (depts && depts.length > 0 && mockData.departments) {
                        deptBadgesHtml = depts.map(dept => {
                            const dData = mockData.departments.find(d => String(getDeptId(d)) === String(dept.id));
                            if (dData && String(dData.members_unvisible || dData['members_unvisible'] || '').toUpperCase() === 'TRUE') return '';
                            
                            const dName = dData ? getDeptName(dData) : dept.id;
                            const titleStr = dept.title ? ` / ${dept.title}` : '';
                            return `<span class="badge" style="background: var(--surface-color); border: 1px solid var(--accent-blue);"><i class="fa-solid fa-folder-open"></i> ${dName}${titleStr}</span>`;
                        }).filter(Boolean).join('');
                    }
                    
                    const isSelf = currentUser && (String(member.squadNumber) === String(currentUser.squadNumber));
                    const canEdit = isSelf;

                    return `
                    <div class="cyber-card member-card" style="cursor: pointer;" onclick="toggleMemberDetails('${member.squadNumber}')">
                        <div class="profile-header" style="margin-bottom: 0;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                                <div class="avatar" style="overflow: hidden; position: relative; padding: 0; ${canEdit ? 'cursor: pointer;' : ''}" ${canEdit ? `onclick="event.stopPropagation(); triggerPhotoUpload('${member.squadNumber}')" title="蜀咏悄繧定ｿｽ蜉繝ｻ螟画峩縺吶ｋ"` : ''}>
                                    <img src="${member.photo || member.image || `images/${member.squadNumber}.jpg`}" alt="" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 10;" onerror="this.style.display='none';">
                                    ${member.squadNumber}
                                </div>
                                ${canEdit ? `<button class="cyber-btn" style="padding: 0.2rem 0.5rem; font-size: 0.65rem; border-radius: 10px;" onclick="event.stopPropagation(); triggerPhotoUpload('${member.squadNumber}')"><i class="fa-solid fa-camera"></i> 蜀咏悄螟画峩</button>` : ''}
                            </div>
                            <div class="profile-info" style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding-left: 1rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; flex-wrap: wrap;">
                                    <h3 style="color: var(--accent-green); font-size: 1.4rem; margin: 0;">${member.name}</h3>
                                    ${member.badges && member.badges.length > 0 ? member.badges.map(badge => {
                                        let bName = badge;
                                        let bColor = 'var(--accent-blue)';
                                        const match = badge.match(/(.*)\((#[0-9a-fA-F]{3,6}|[a-zA-Z]+)\)$/);
                                        if (match) {
                                            bName = match[1].trim();
                                            bColor = match[2];
                                        }
                                        return `<span class="badge" style="color: ${bColor}; font-size: 0.7rem; padding: 0.2rem 0.5rem; background: var(--surface-color); border: 1px solid var(--border-color);">${bName}</span>`;
                                    }).join('') : ''}
                                </div>
                                <div style="font-family: var(--font-heading); font-size: 0.95rem; color: var(--text-muted); display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap;">
                                    <span>閭檎分蜿ｷ: <span style="color: var(--text-main); font-weight: bold;">${member.squadNumber}</span></span>
                                    <span>繧ｫ繝・ざ繝ｪ繝ｼ: <span style="color: var(--text-main); font-weight: bold;">${member.category || '譛ｪ逋ｻ骭ｲ'}</span></span>
                                </div>
                                <div class="badge-list" style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                    ${deptBadgesHtml}
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
                                        return `<div style="text-align: center; margin: 1rem 0; width: 100%; font-weight: bold; color: var(--accent-blue); text-shadow: 1px 1px 0px var(--border-color); letter-spacing: 2px;"><i class="fa-solid fa-crown" style="color: gold;"></i> Core</div>`;
                                    }
                                    const reqs = nextCatInfo.requirements;
                                    const isTarget = isSelf;
                                    const iconsHtml = reqs.map(req => {
                                        const isCompleted = member[req.name] === true || member[req.name] === "TRUE";
                                        if (isTarget) {
                                            return `<div class="task-icon ${isCompleted ? 'unlocked' : 'locked'}" data-tooltip="${req.name}" style="cursor:pointer;" onclick="event.stopPropagation(); toggleCategoryProgress('${member.squadNumber}', '${req.name}', ${!isCompleted})"><i class="fa-solid ${req.icon}"></i></div>`;
                                        } else {
                                            return `<div class="task-icon ${isCompleted ? 'unlocked' : 'locked'}" data-tooltip="${req.name}"><i class="fa-solid ${req.icon}"></i></div>`;
                                        }
                                    }).join('');
                                    return `
                                        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 0.5rem;">
                                            <h4 style="font-size: 0.8rem; color: var(--accent-blue); text-transform: uppercase; margin-bottom: 0;"><i class="fa-solid fa-turn-up"></i> Next Step: ${nextCatInfo.name}縺ｸ縺ｮ驕・/h4>
                                            ${isTarget ? '<span style="font-size: 0.75rem; color: var(--accent-pink);"><i class="fa-solid fa-hand-pointer"></i> 繧｢繧､繧ｳ繝ｳ繧偵ち繝・・縺励※蛻・崛</span>' : ''}
                                        </div>
                                        <div class="task-icons-container">
                                            ${iconsHtml}
                                        </div>
                                    `;
                                })()}
                            </div>
                            
                            <div class="detail-row" style="display: flex; gap: 1rem;">
                                <div style="flex: 1;">
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">繧ｿ繧､繝斐Φ繧ｰ險倬鹸</h4>
                                    <div style="font-weight: bold; margin-bottom: 0.5rem;">${member.typingScore || '譛ｪ逋ｻ骭ｲ'}</div>
                                    ${canEdit ? `<button class="cyber-btn member-edit-btn" onclick="event.stopPropagation(); openEditMemberModal('${member.squadNumber}', 'typingScore', '${member.typingScore || ''}')"><i class="fa-solid fa-pen"></i> 邱ｨ髮・/button>` : ''}
                                </div>
                                <div style="flex: 1; border-left: 1px dashed var(--border-color); padding-left: 1rem;">
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">豈取怦謠仙・</h4>
                                    <div style="font-weight: bold; margin-bottom: 0.2rem; font-size: 0.9rem;">${member.monthlyTyping || '譛ｪ謠仙・'}</div>
                                    <div style="font-size: 0.7rem; color: var(--accent-pink); margin-bottom: 0.5rem; font-weight: bold;"><i class="fa-regular fa-clock"></i> 邱蛻・ ${mockData.settings['typingEndDate'] || '譛ｪ險ｭ螳・}</div>
                                    ${isSelf ? `
                                    <button class="cyber-btn" style="padding: 0.4rem; font-size: 0.75rem; background: var(--accent-green); color: #fff; border: none;" onclick="event.stopPropagation(); openTypingModal('${member.squadNumber}')">
                                        <i class="fa-solid fa-upload"></i> ${(mockData.settings['Current month'] ? mockData.settings['Current month'].split('-')[1].replace(/^0/, '') : '莉・)}譛医ち繧､繝斐Φ繧ｰ謠仙・
                                    </button>` : ''}
                                </div>
                            </div>

                            <div class="detail-row">
                                <div style="flex: 1;">
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">隱ｭ譖ｸ險倬鹸</h4>
                                    <div style="font-size: 0.9rem; display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                                        ${(() => {
                                            const memberReviews = (mockData.reviews || []).filter(r => String(r.squadNumber) === String(member.squadNumber));
                                            if (memberReviews.length > 0) {
                                                return memberReviews.map(rev => `<button class="cyber-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.3rem; border: none; cursor: pointer;" onclick="event.stopPropagation(); openDocViewerModal('${rev.docLink}', '${rev.bookTitle}')"><i class="fa-solid fa-file-lines"></i> ${rev.bookTitle}</button>`).join('');
                                            } else {
                                                return '<span style="color: var(--text-muted); font-size: 0.8rem;">縺ｪ縺・/span>';
                                            }
                                        })()}
                                    </div>
                                </div>
                                ${isSelf ? `<button class="cyber-btn member-edit-btn" onclick="event.stopPropagation(); openAddReviewModal('${member.squadNumber}')"><i class="fa-solid fa-plus"></i> 霑ｽ蜉</button>` : ''}
                            </div>
                            
                            <div class="detail-row">
                                <div style="flex: 1;">
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">隱ｲ鬘悟峙譖ｸ縺ｮ騾ｲ謐・/h4>
                                    <div class="task-icons-container" style="margin-top: 0.5rem; gap: 0.5rem;">
                                        ${['K-01', 'K-02', 'K-03', 'K-04', 'K-05'].map((key, index) => {
                                            const isCompleted = member[key] === true || member[key] === "TRUE";
                                            if (isSelf) {
                                                return `<div class="task-icon ${isCompleted ? 'unlocked' : 'locked'}" data-tooltip="隱ｲ鬘悟峙譖ｸ${index + 1}" style="width: 35px; height: 35px; font-size: 1rem; cursor:pointer;" onclick="event.stopPropagation(); toggleCategoryProgress('${member.squadNumber}', '${key}', ${!isCompleted})"><i class="fa-solid fa-book"></i></div>`;
                                            } else {
                                                return `<div class="task-icon ${isCompleted ? 'unlocked' : 'locked'}" data-tooltip="隱ｲ鬘悟峙譖ｸ${index + 1}" style="width: 35px; height: 35px; font-size: 1rem;"><i class="fa-solid fa-book"></i></div>`;
                                            }
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
    } else if (currentRosterTab === 'organization') {
        contentHtml = getOrganizationHtml();
    }

    let html = `
        <div class="view-animate">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                ${getBackButtonHtml()}
            </div>
            <h1 class="section-title" style="margin-bottom: 1rem;">繝｡繝ｳ繝舌・蜷咲ｰｿ</h1>
            ${tabsHtml}
            ${contentHtml}
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
                    <h3 style="margin: 0; font-size: 1.5rem;">${year}蟷ｴ ${month + 1}譛・/h3>
                    <button class="cyber-btn" style="padding: 0.5rem 1rem;" onclick="changeCalendarMonth(1)"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
                <div class="calendar-grid">
                    <div style="font-weight: bold; color: #ff6b6b; padding: 0.5rem 0;">譌･</div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">譛・/div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">轣ｫ</div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">豌ｴ</div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">譛ｨ</div>
                    <div style="font-weight: bold; padding: 0.5rem 0;">驥・/div>
                    <div style="font-weight: bold; color: #4facfe; padding: 0.5rem 0;">蝨・/div>
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
                let timeStr = (e.startTime && e.endTime) ? `<div style="font-size: 0.65rem; opacity: 0.8; margin-top: 1px;">${e.startTime}・・{e.endTime}</div>` : '';
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
                        <i class="fa-solid fa-filter"></i> ${currentEventFilter} 縺ｮ繧､繝吶Φ繝医ｒ陦ｨ遉ｺ荳ｭ
                    </div>
                    <button class="cyber-btn" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="filterEventsByDate(null)">
                        縺吶∋縺ｦ陦ｨ遉ｺ
                    </button>
                </div>
            `;
        }

        let eventListHtml = `
            ${filterHtml}
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${filteredEvents.length === 0 ? '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">縺薙・譌･縺ｮ繧､繝吶Φ繝医・縺ゅｊ縺ｾ縺帙ｓ縲・/div>' : ''}
                ${filteredEvents.map(event => {
                    const attendeesCount = event.attendees ? event.attendees.length : 0;
                    const absenteesCount = event.absentees ? event.absentees.length : 0;
                    const capacity = event.capacity ? Number(event.capacity) : 0;
                    const isFull = capacity > 0 && attendeesCount >= capacity;
                    const timeStr = (event.startTime && event.endTime) ? `${event.startTime}・・{event.endTime}` : '';
                    
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
                                    <i class="fa-solid fa-user-tie"></i> 荳ｻ蛯ｬ閠・ ${event.host ? event.host : '譛ｪ謖・ｮ・}
                                </div>
                                <div style="font-size: 0.85rem; font-weight: bold; color: ${isFull ? '#ff6b6b' : 'var(--text-main)'};">
                                    <i class="fa-solid fa-users"></i> ${capacity > 0 ? `迴ｾ蝨ｨ縺ｮ蜿ょ刈莠ｺ謨ｰ: ${attendeesCount} / ${capacity}` : '螳壼藤: 蛻ｶ髯舌↑縺・(蜍滄寔荳ｭ)'}
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
                                        蜃ｺ蟶ｭ閠・(${attendeesCount}莠ｺ)
                                    </div>
                                    <div class="event-attendees" style="margin-bottom: 0;">
                                        ${attendeesCount > 0 
                                            ? event.attendees.map(a => `<span class="attendee-tag">${String(a).trim()}</span>`).join('') 
                                            : '<span style="color: var(--text-muted); font-size: 0.85rem;">縺ｾ縺縺・∪縺帙ｓ</span>'}
                                    </div>
                                </div>
                                <div style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.02); padding: 1rem; border-radius: 12px;">
                                    <div style="font-size: 0.85rem; color: var(--accent-pink); margin-bottom: 0.5rem; font-weight: bold;">
                                        谺蟶ｭ閠・(${absenteesCount}莠ｺ)
                                    </div>
                                    <div class="event-attendees" style="margin-bottom: 0;">
                                        ${absenteesCount > 0 
                                            ? event.absentees.map(a => `<span class="attendee-tag" style="background: var(--bg-color);">${String(a).trim()}</span>`).join('') 
                                            : '<span style="color: var(--text-muted); font-size: 0.85rem;">縺ｾ縺縺・∪縺帙ｓ</span>'}
                                    </div>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; gap: 1rem;">
                                <button class="cyber-btn" style="padding: 0.4rem; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--accent-yellow); color: #333;" onclick="event.stopPropagation(); openPasswordModal('editEvent', '${event.id}')" title="邱ｨ髮・>
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="cyber-btn danger" style="padding: 0.4rem; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;" onclick="event.stopPropagation(); openPasswordModal('deleteEvent', '${event.id}')" title="蜑企勁">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                                <button class="cyber-btn" ${isFull ? 'disabled' : ''} style="padding: 0.5rem 1rem;" onclick="event.stopPropagation(); openAttendanceModal('${event.id}')">
                                    ${isFull ? '貅蜩｡' : '蜃ｺ谺逋ｻ骭ｲ'}
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
                <i class="fa-solid fa-calendar"></i> 繧ｫ繝ｬ繝ｳ繝繝ｼ
            </button>
            <button class="schedule-tab-btn ${currentScheduleView === 'event' ? 'active' : ''}" onclick="switchScheduleView('event')">
                <i class="fa-solid fa-list"></i> 繧､繝吶Φ繝井ｸ隕ｧ
            </button>
        </div>
    `;

    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title" style="margin-bottom: 1rem;">繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ</h1>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                ${tabsHtml}
                <button class="cyber-btn" onclick="openPasswordModal('addEvent')"><i class="fa-solid fa-plus"></i> 繧､繝吶Φ繝医ｒ霑ｽ蜉</button>
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

window.openTypingModal = function(squadNum) {
    const typingSquadNumEl = document.getElementById('typingSquadNum');
    if(typingSquadNumEl) typingSquadNumEl.value = squadNum;
    document.getElementById('typingCourse').value = '3000';
    document.getElementById('typingScore').value = '';
    document.getElementById('typingImage').value = '';
    document.getElementById('typing-modal').classList.remove('hidden');
}

window.closeTypingModal = function() {
    document.getElementById('typing-modal').classList.add('hidden');
}

window.submitTyping = async function() {
    const squadNum = document.getElementById('typingSquadNum').value;
    const course = document.getElementById('typingCourse').value;
    const score = document.getElementById('typingScore').value;
    const fileInput = document.getElementById('typingImage');
    
    if(!squadNum || !course || !score || !fileInput.files.length) {
        alert("縺吶∋縺ｦ縺ｮ鬆・岼・医さ繝ｼ繧ｹ縲∬ｨ倬鹸縲∫判蜒擾ｼ峨ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
        return;
    }
    
    const file = fileInput.files[0];
    
    const submitBtn = document.getElementById('btn-submit-typing');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 騾∽ｿ｡荳ｭ...';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = async function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            const payload = {
                squadNum: squadNum,
                course: parseInt(course, 10),
                score: parseInt(score, 10),
                imageBase64: dataUrl,
                imageMimeType: 'image/jpeg',
                filename: 'typing_record.jpg'
            };
            
            const success = await sendAction('submitTyping', payload);
            if (success) {
                alert("繧ｿ繧､繝斐Φ繧ｰ險倬鹸繧呈署蜃ｺ縺励∪縺励◆・・);
                closeTypingModal();
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 騾∽ｿ｡';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

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
    const defaultSquad = currentUser ? currentUser.squadNumber : '';
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-green);"><i class="fa-solid fa-hand-holding-hand"></i> 譛ｬ繧貞溘ｊ繧・/h2>
        <p style="margin-bottom: 1.5rem;">蟇ｾ雎｡: <strong>${book.title}</strong></p>
        
        <div class="form-group">
            <label>蛟溘ｊ謇・(閭檎分蜿ｷ) ${currentUser ? '<span style="font-size:0.8rem; color:var(--accent-blue);">(繝ｭ繧ｰ繧､繝ｳ荳ｭ)</span>' : ''}</label>
            <input type="text" id="squadNumInput" class="cyber-input" value="${defaultSquad}" ${currentUser ? 'readonly style="background:rgba(0,0,0,0.2); cursor:not-allowed;"' : 'placeholder="萓・ 007"'}>
        </div>
        <div class="form-group">
            <label>霑泌唆譛滄剞</label>
            <input type="date" id="dueDateInput" class="cyber-input">
        </div>
        <button class="cyber-btn" id="btn-borrow" style="width: 100%; margin-top: 1rem;" onclick="submitBorrow('${bookId}')">雋ｸ蜃ｺ繝ｪ繧ｯ繧ｨ繧ｹ繝磯∽ｿ｡</button>
    `;
    openModal(html);
}

async function submitBorrow(bookId) {
    const squadNum = document.getElementById('squadNumInput').value;
    const dueDate = document.getElementById('dueDateInput').value;
    
    if(!squadNum || !dueDate) {
        alert("縺吶∋縺ｦ縺ｮ鬆・岼繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
        return;
    }

    // UX蜷台ｸ翫・縺溘ａ蜈医↓繝懊ち繝ｳ繧堤┌蜉ｹ蛹・    document.getElementById('btn-borrow').disabled = true;
    document.getElementById('btn-borrow').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 騾∽ｿ｡荳ｭ...';
    
    const success = await sendAction('borrowBook', { bookId, squadNum, dueDate });
    if (success) {
        const book = mockData.books.find(b => b.id === bookId);
        if (book) {
            book.status = 'borrowed';
            book.borrower = squadNum;
            book.dueDate = dueDate;
            if (book.preserve) {
                let currentPreserve = String(book.preserve).split(',').map(s => s.trim()).filter(Boolean);
                if (currentPreserve.length > 0 && String(currentPreserve[0]) === String(squadNum)) {
                    currentPreserve.shift();
                    book.preserve = currentPreserve.join(',');
                }
            }
        }
        navigateTo(currentView);
        closeModal();
    } else {
        document.getElementById('btn-borrow').disabled = false;
        document.getElementById('btn-borrow').innerHTML = '雋ｸ蜃ｺ繝ｪ繧ｯ繧ｨ繧ｹ繝磯∽ｿ｡';
    }
}

async function returnBook(bookId) {
    if(confirm("縺薙・譛ｬ繧定ｿ泌唆縺励∪縺吶°・・)) {
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

function openReserveModal(bookId) {
    const book = mockData.books.find(b => b.id === bookId);
    const defaultSquad = currentUser ? currentUser.squadNumber : '';
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-yellow);"><i class="fa-solid fa-bookmark"></i> 譛ｬ繧剃ｺ育ｴ・☆繧・/h2>
        <p style="margin-bottom: 1.5rem;">蟇ｾ雎｡: <strong>${book.title}</strong></p>
        
        <div class="form-group">
            <label>莠育ｴ・・(閭檎分蜿ｷ) ${currentUser ? '<span style="font-size:0.8rem; color:var(--accent-blue);">(繝ｭ繧ｰ繧､繝ｳ荳ｭ)</span>' : ''}</label>
            <input type="text" id="reserveSquadNumInput" class="cyber-input" value="${defaultSquad}" ${currentUser ? 'readonly style="background:rgba(0,0,0,0.2); cursor:not-allowed;"' : 'placeholder="萓・ 007"'}>
        </div>
        <button class="cyber-btn" id="btn-reserve" style="width: 100%; margin-top: 1rem;" onclick="submitReserve('${bookId}')">莠育ｴ・☆繧・/button>
    `;
    openModal(html);
}

async function submitReserve(bookId) {
    const squadNum = document.getElementById('reserveSquadNumInput').value;
    
    if(!squadNum) {
        alert("閭檎分蜿ｷ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
        return;
    }

    document.getElementById('btn-reserve').disabled = true;
    document.getElementById('btn-reserve').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 騾∽ｿ｡荳ｭ...';
    
    const success = await sendAction('reserveBook', { bookId, squadNum });
    if (success) {
        const book = mockData.books.find(b => b.id === bookId);
        if (book) {
            let currentPreserve = book.preserve ? String(book.preserve).split(',').map(s => s.trim()).filter(Boolean) : [];
            if (!currentPreserve.includes(String(squadNum))) {
                currentPreserve.push(String(squadNum));
                book.preserve = currentPreserve.join(',');
            }
        }
        navigateTo(currentView);
        closeModal();
    }
}

function openReviewModal(bookId) {
    const book = mockData.books.find(b => b.id === bookId);
    if (!book) return;
    
    const baseIdParts = book.id.split('-');
    const baseId = baseIdParts.length >= 2 ? baseIdParts[0] + '-' + baseIdParts[1] : book.id;
    
    // ID縺ｮ蜈ｱ騾夐Κ蛻・ｼ・-1縺ｪ縺ｩ・峨°繧牙酔荳譛ｬ繧貞愛螳壹＠縺ｦ諢滓Φ譁・ｒ縺吶∋縺ｦ謚ｽ蜃ｺ
    const bookReviews = mockData.reviews.filter(r => {
        const rBook = mockData.books.find(b => b.id === r.bookId);
        if (!rBook) return false;
        const rBaseParts = rBook.id.split('-');
        const rBaseId = rBaseParts.length >= 2 ? rBaseParts[0] + '-' + rBaseParts[1] : rBook.id;
        return rBaseId === baseId || rBook.title === book.title;
    });
    
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-green);"><i class="fa-solid fa-clock-rotate-left"></i> 諢滓Φ譁・ｱ･豁ｴ</h2>
        <p style="margin-bottom: 1.5rem; color: var(--text-muted);">${book.title}</p>
        
        <div class="timeline">
            ${bookReviews.length > 0 ? bookReviews.map(review => `
                <div class="timeline-item">
                    <div style="font-family: var(--font-heading); font-size: 0.8rem; color: var(--accent-green); margin-bottom: 0.5rem;">${review.date ? String(review.date).split('T')[0] : ''} - 閭檎分蜿ｷ ${review.reviewer || review.squadNumber || ''}</div>
                    <button class="cyber-btn" style="padding: 0.5rem 1rem;" onclick="openDocViewerModal('${review.docLink}', '${book.title} (閭檎分蜿ｷ${review.reviewer})')"><i class="fa-solid fa-file-lines"></i> 諢滓Φ譁・ｒ隱ｭ繧</button>
                </div>
            `).join('') : '<div style="color: var(--text-muted);">縺薙・譛ｬ縺ｮ諢滓Φ譁・・縺ｾ縺縺ゅｊ縺ｾ縺帙ｓ縲・/div>'}
        </div>
    `;
    openModal(html);
}

function openAttendanceModal(eventId) {
    const event = mockData.events.find(e => e.id === eventId);
    const defaultSquad = currentUser ? currentUser.squadNumber : '';
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-green);"><i class="fa-solid fa-calendar-check"></i> 蜃ｺ谺逋ｻ骭ｲ</h2>
        <p style="margin-bottom: 1.5rem;">繧､繝吶Φ繝・ <strong>${event.title}</strong></p>
        
        <div class="form-group">
            <label>閭檎分蜿ｷ (Squad Number) ${currentUser ? '<span style="font-size:0.8rem; color:var(--accent-blue);">(繝ｭ繧ｰ繧､繝ｳ荳ｭ)</span>' : ''}</label>
            <input type="text" id="attSquadNum" class="cyber-input" value="${defaultSquad}" ${currentUser ? 'readonly style="background:rgba(0,0,0,0.2); cursor:not-allowed;"' : 'placeholder="萓・ 007"'}>
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <button class="cyber-btn" id="btn-attend" style="flex: 1;" onclick="submitAttendance('${eventId}', 'attend')">蜃ｺ蟶ｭ</button>
            <button class="cyber-btn danger" id="btn-absent" style="flex: 1;" onclick="submitAttendance('${eventId}', 'absent')">谺蟶ｭ</button>
        </div>
    `;
    openModal(html);
}

async function submitAttendance(eventId, status) {
    const squadNum = document.getElementById('attSquadNum').value;
    if(!squadNum) {
        alert("閭檎分蜿ｷ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
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
        <h2 style="margin-bottom: 1rem; color: var(--accent-yellow);"><i class="fa-solid fa-lock"></i> 隱崎ｨｼ縺悟ｿ・ｦ√〒縺・/h2>
        <p style="margin-bottom: 1.5rem;">縺薙・謫堺ｽ懊ｒ螳溯｡後☆繧九↓縺ｯ繝代せ繝ｯ繝ｼ繝峨ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・/p>
        
        <div class="form-group">
            <input type="password" id="passwordInput" class="cyber-input" placeholder="繝代せ繝ｯ繝ｼ繝峨ｒ蜈･蜉・>
        </div>
        <button class="cyber-btn" style="width: 100%;" onclick="submitPassword('${actionType}', ${payloadArg})">隱崎ｨｼ</button>
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
        alert("繝代せ繝ｯ繝ｼ繝峨′髢馴＆縺｣縺ｦ縺・∪縺吶・);
    }
}

function openAddEventModal() {
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-calendar-plus"></i> 繧､繝吶Φ繝医ｒ霑ｽ蜉</h2>
        
        <div class="form-group">
            <label>繧､繝吶Φ繝亥錐</label>
            <input type="text" id="addEventTitle" class="cyber-input" placeholder="萓・ 螳壻ｾ九Α繝ｼ繝・ぅ繝ｳ繧ｰ">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <div style="flex: 2;">
                <label>髢句ぎ譌･ (Date)</label>
                <input type="text" id="addEventDate" class="cyber-input" placeholder="萓・ 2026/06/01">
            </div>
            <div style="flex: 1;">
                <label>髢句ｧ区凾髢・/label>
                <input type="time" id="addEventStartTime" class="cyber-input">
            </div>
            <div style="flex: 1;">
                <label>邨ゆｺ・凾髢・/label>
                <input type="time" id="addEventEndTime" class="cyber-input">
            </div>
        </div>
        <div class="form-group">
            <label>蝣ｴ謇 (Location)</label>
            <input type="text" id="addEventLocation" class="cyber-input" placeholder="萓・ 莨夊ｭｰ螳､A">
        </div>
        <div class="form-group">
            <label>繧ｫ繝ｼ繝峨・濶ｲ (Color)</label>
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
            <label>荳險隱ｬ譏・/label>
            <input type="text" id="addEventDesc" class="cyber-input" placeholder="萓・ 驥崎ｦ√↑隴ｰ鬘後′縺ゅｊ縺ｾ縺・>
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
                <label>螳壼藤</label>
                <input type="number" id="addEventCapacity" class="cyber-input" placeholder="萓・ 10" min="1">
            </div>
            <div style="flex: 1;">
                <label>荳ｻ蛯ｬ閠・レ逡ｪ蜿ｷ</label>
                <input type="text" id="addEventHost" class="cyber-input" placeholder="萓・ 001">
            </div>
        </div>
        
        <button class="cyber-btn" id="btn-add-event" style="width: 100%; margin-top: 1rem;" onclick="submitAddEvent()">繧､繝吶Φ繝井ｽ懈・</button>
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
        alert("蠢・磯・岼(繧､繝吶Φ繝亥錐縲・幕蛯ｬ譌･)繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
        return;
    }

    document.getElementById('btn-add-event').disabled = true;
    document.getElementById('btn-add-event').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 菴懈・荳ｭ...';
    
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
        <h2 style="margin-bottom: 1rem; color: var(--accent-yellow);"><i class="fa-solid fa-pen-to-square"></i> 繧､繝吶Φ繝医ｒ邱ｨ髮・/h2>
        
        <div class="form-group">
            <label>繧､繝吶Φ繝亥錐</label>
            <input type="text" id="editEventTitle" class="cyber-input" value="${event.title || ''}">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <div style="flex: 2;">
                <label>髢句ぎ譌･ (Date)</label>
                <input type="text" id="editEventDate" class="cyber-input" value="${event.date || ''}">
            </div>
            <div style="flex: 1;">
                <label>髢句ｧ区凾髢・/label>
                <input type="time" id="editEventStartTime" class="cyber-input" value="${event.startTime || ''}">
            </div>
            <div style="flex: 1;">
                <label>邨ゆｺ・凾髢・/label>
                <input type="time" id="editEventEndTime" class="cyber-input" value="${event.endTime || ''}">
            </div>
        </div>
        <div class="form-group">
            <label>蝣ｴ謇 (Location)</label>
            <input type="text" id="editEventLocation" class="cyber-input" value="${event.location || ''}">
        </div>
        <div class="form-group">
            <label>繧ｫ繝ｼ繝峨・濶ｲ (Color)</label>
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
            <label>荳險隱ｬ譏・/label>
            <input type="text" id="editEventDesc" class="cyber-input" value="${event.description || ''}">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
                <label>螳壼藤</label>
                <input type="number" id="editEventCapacity" class="cyber-input" value="${event.capacity || ''}" min="1">
            </div>
            <div style="flex: 1;">
                <label>荳ｻ蛯ｬ閠・レ逡ｪ蜿ｷ</label>
                <input type="text" id="editEventHost" class="cyber-input" value="${event.host || ''}">
            </div>
        </div>
        
        <button class="cyber-btn" id="btn-edit-event" style="width: 100%; margin-top: 1rem;" onclick="submitEditEvent('${event.id}')">繧､繝吶Φ繝域峩譁ｰ</button>
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
        alert("蠢・磯・岼(繧､繝吶Φ繝亥錐縲・幕蛯ｬ譌･)繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
        return;
    }

    document.getElementById('btn-edit-event').disabled = true;
    document.getElementById('btn-edit-event').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 譖ｴ譁ｰ荳ｭ...';
    
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
    if(confirm("譛ｬ蠖薙↓縺薙・繧､繝吶Φ繝医ｒ蜑企勁縺励∪縺吶°・・)) {
        modalBody.innerHTML = '<div style="text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-blue);"></i><p style="margin-top:1rem;">蜑企勁荳ｭ...</p></div>';
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
                <label>謖第姶縺励◆繧ｳ繝ｼ繧ｹ</label>
                <select id="typingCourse" class="cyber-input">
                    <option value="3000蜀・>3000蜀・/option>
                    <option value="5000蜀・>5000蜀・/option>
                    <option value="10000蜀・>10000蜀・/option>
                </select>
            </div>
            <div class="form-group">
                <label>閾ｪ蛻・・險倬鹸</label>
                <input type="number" id="typingRecord" class="cyber-input" placeholder="萓・ 4500">
            </div>
        `;
    } else {
        if(fieldName === 'badges') {
            fieldLabel = '繝舌ャ繧ｸ';
            note = '<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">窶ｻ繧ｫ繝ｳ繝槫玄蛻・ｊ縺ｧ蜈･蜉帙＠縺ｦ縺上□縺輔＞</p>';
        } else if(fieldName === 'readingRecord') {
            fieldLabel = '隱ｭ譖ｸ險倬鹸';
            note = '<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">窶ｻ繧ｫ繝ｳ繝槫玄蛻・ｊ縺ｧ蜈･蜉帙＠縺ｦ縺上□縺輔＞</p>';
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
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-pen-to-square"></i> 繝｡繝ｳ繝舌・諠・ｱ邱ｨ髮・/h2>
        <p style="margin-bottom: 1.5rem;">閭檎分蜿ｷ: <strong>${squadNum}</strong></p>
        
        ${inputHtml}
        
        <button class="cyber-btn" id="btn-edit-member" style="width: 100%; margin-top: 1rem;" onclick="submitMemberEdit('${squadNum}', '${fieldName}')">譖ｴ譁ｰ縺吶ｋ</button>
    `;
    openModal(html);
}

async function submitMemberEdit(squadNum, fieldName) {
    let newValue;
    if (fieldName === 'typingScore') {
        const course = document.getElementById('typingCourse').value;
        const record = document.getElementById('typingRecord').value;
        if (!record) {
            alert("閾ｪ蛻・・險倬鹸繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
            return;
        }
        newValue = `${record} / ${course}`;
    } else {
        newValue = document.getElementById('editMemberInput').value;
    }
    
    document.getElementById('btn-edit-member').disabled = true;
    document.getElementById('btn-edit-member').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 譖ｴ譁ｰ荳ｭ...';
    
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
// ADD REVIEW MODAL & ACTIONS
// ==========================================
function openAddReviewModal(squadNum = '', defaultBookId = '') {
    if (!squadNum && currentUser) {
        squadNum = currentUser.squadNumber;
    }
    const seenBooks = new Set();
    let bookOptions = '';
    let bookTitleText = '';
    
    for (const b of mockData.books) {
        if (!b.id) continue;
        const parts = b.id.split('-');
        let identifier = b.id;
        if (parts.length >= 2) {
            identifier = parts[0] + '-' + parts[1];
        }
        if (!seenBooks.has(identifier)) {
            seenBooks.add(identifier);
            if (b.id === defaultBookId) bookTitleText = b.title;
            const isSelected = b.id === defaultBookId ? 'selected' : '';
            bookOptions += `<option value="${b.id}" ${isSelected}>${b.title}</option>`;
        }
    }
    
    let bookSelectionGroup = '';
    if (defaultBookId) {
        bookSelectionGroup = `
            <div class="form-group">
                <label>譛ｬ縺ｮ繧ｿ繧､繝医Ν</label>
                <div class="cyber-input" style="background: rgba(0,0,0,0.2); color: var(--text-muted); cursor: not-allowed; pointer-events: none;">${bookTitleText}</div>
                <select id="addReviewBookSelect" style="display: none;">
                    <option value="${defaultBookId}" selected>${bookTitleText}</option>
                </select>
            </div>
            <div style="display: none;">
                <input type="text" id="addReviewManualTitle" value="">
            </div>
        `;
    } else {
        bookSelectionGroup = `
            <div class="form-group">
                <label>譛ｬ縺ｮ繧ｿ繧､繝医Ν (蝗ｳ譖ｸ邂｡逅・・譛ｬ縺九ｉ驕ｸ謚・</label>
                <select id="addReviewBookSelect" class="cyber-input" onchange="if(this.value) document.getElementById('addReviewManualTitle').value = '';">
                    <option value="">驕ｸ謚槭＠縺ｦ縺上□縺輔＞</option>
                    ${bookOptions}
                </select>
            </div>
            
            <div class="form-group" id="manualBookTitleGroup">
                <label>蝗ｳ譖ｸ莉･螟悶・譛ｬ縺ｮ諢滓Φ譁・/label>
                <input type="text" id="addReviewManualTitle" class="cyber-input" placeholder="蝗ｳ譖ｸ莉･螟悶・譛ｬ縺ｮ繧ｿ繧､繝医Ν繧貞・蜉・ oninput="if(this.value.trim()) document.getElementById('addReviewBookSelect').value = '';">
            </div>
        `;
    }
    
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-book-open"></i> 隱ｭ譖ｸ諢滓Φ譁・・霑ｽ蜉</h2>
        
        <div class="form-group">
            <label>閭檎分蜿ｷ (Squad Number)</label>
            <input type="text" id="addReviewSquadNum" class="cyber-input" value="${squadNum}" ${squadNum ? 'readonly' : ''} placeholder="萓・ 001">
        </div>
        
        ${bookSelectionGroup}
        
        <div class="form-group">
            <label>諢滓Φ譁・Μ繝ｳ繧ｯ (繝峨く繝･繝｡繝ｳ繝・RL)</label>
            <input type="url" id="addReviewDocLink" class="cyber-input" placeholder="https://docs.google.com/...">
        </div>
        
        <button class="cyber-btn" id="btn-add-review" style="width: 100%; margin-top: 1rem;" onclick="submitAddReview()">霑ｽ蜉縺吶ｋ</button>
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
    
    if (!squadNum.trim()) {
        alert("閭檎分蜿ｷ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
        return;
    }
    
    let bookId = '';
    let bookTitle = '';
    
    if (manualTitle.trim() && select.value !== '') {
        alert("蝗ｳ譖ｸ縺ｮ譛ｬ縺ｮ驕ｸ謚槭→縲∝峙譖ｸ莉･螟悶・譛ｬ縺ｮ蜈･蜉帙・縲√←縺｡繧峨°荳譁ｹ縺ｮ縺ｿ縺ｫ縺励※縺上□縺輔＞縲・);
        return;
    }
    
    if (manualTitle.trim()) {
        bookTitle = manualTitle.trim();
        bookId = 'other';
    } else if (select.value !== '') {
        bookId = select.value;
        bookTitle = select.options[select.selectedIndex].text;
    } else {
        alert("譛ｬ縺ｮ繧ｿ繧､繝医Ν繧帝∈謚槭∪縺溘・蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
        return;
    }
    
    if (!docLink.trim()) {
        alert("諢滓Φ譁・Μ繝ｳ繧ｯ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
        return;
    }

    const btn = document.getElementById('btn-add-review');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 騾∽ｿ｡荳ｭ...';
    
    const success = await sendAction('addReview', { 
        squadNumber: squadNum.trim(), 
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
            squadNumber: squadNum.trim(),
            reviewer: squadNum.trim(),
            bookId: bookId,
            bookTitle: bookTitle,
            docLink: docLink.trim(),
            date: `${yyyy}/${mm}/${dd}`,
            text: ''
        });
        navigateTo(currentView);
        closeModal();
    } else {
        btn.disabled = false;
        btn.innerHTML = '霑ｽ蜉縺吶ｋ';
    }
}

// ==========================================
// EDIT MODE FUNCTIONS
// ==========================================

function openEditModeModal() {
    const html = `
        <h2 style="margin-bottom: 1.5rem; color: var(--accent-pink);"><i class="fa-solid fa-gear"></i> 邱ｨ髮・Δ繝ｼ繝・/h2>
        <div class="form-group">
            <label>繝代せ繝ｯ繝ｼ繝・/label>
            <input type="password" id="editModePassword" class="cyber-input">
        </div>
        <button class="cyber-btn" style="width: 100%; margin-top: 1rem;" onclick="submitEditMode()">邱ｨ髮・Δ繝ｼ繝峨↓蜈･繧・/button>
    `;
    openModal(html);
}

function submitEditMode() {
    const pw = document.getElementById('editModePassword').value;

    if (pw !== "20230914") {
        alert("繝代せ繝ｯ繝ｼ繝峨′驕輔＞縺ｾ縺吶・);
        return;
    }

    isEditMode = true;
    editModeTargetSquad = null;
    closeModal();
    renderRoster();
}

async function exitEditMode() {
    if (pendingOrgUpdates.length > 0) {
        const overlay = document.getElementById('loading-overlay') || document.createElement('div');
        if (!document.getElementById('loading-overlay')) {
            overlay.id = 'loading-overlay';
            overlay.className = 'modal-overlay';
            overlay.innerHTML = '<div style="color:#fff; text-align:center; margin-top:20vh;"><i class="fa-solid fa-spinner fa-spin fa-3x"></i><p style="margin-top:1rem; font-size:1.2rem;">邨・ｹ斐・螟画峩繧剃ｿ晏ｭ倅ｸｭ...</p></div>';
            document.body.appendChild(overlay);
        }
        overlay.classList.remove('hidden');

        const success = await sendAction('batchUpdateMemberDepartments', { updates: pendingOrgUpdates });
        if (success) {
            pendingOrgUpdates = [];
            await fetchPortalData();
            overlay.classList.add('hidden');
        } else {
            alert("荳諡ｬ菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆");
            overlay.classList.add('hidden');
            return;
        }
    }

    isEditMode = false;
    editModeTargetSquad = null;
    renderRoster();
}

async function toggleCategoryProgress(squadNum, reqName, newValue) {
    const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
    if (!member) return;

    // Send action to GAS
    const success = await sendAction('updateMemberCategory', {
        squadNum: squadNum,
        fieldName: reqName,
        newValue: newValue ? "TRUE" : "FALSE"
    });

    if (success) {
        member[reqName] = newValue ? "TRUE" : "FALSE";
        renderRoster();
    } else {
        alert("菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆");
    }
}

function openAddBadgeModal(squadNum) {
    const html = `
        <h2 style="margin-bottom: 1.5rem; color: var(--accent-blue);"><i class="fa-solid fa-medal"></i> 繝舌ャ繧ｸ霑ｽ蜉</h2>
        <div class="form-group">
            <label>繝舌ャ繧ｸ蜷・/label>
            <input type="text" id="addBadgeName" class="cyber-input" placeholder="萓・ HTML繝槭せ繧ｿ繝ｼ">
        </div>
        <div class="form-group">
            <label>濶ｲ (繧ｫ繝ｩ繝ｼ繧ｳ繝ｼ繝峨∪縺溘・繧ｫ繝ｩ繝ｼ蜷・</label>
            <input type="color" id="addBadgeColor" class="cyber-input" value="#63b3ed" style="height: 50px; padding: 0.5rem;">
        </div>
        <button class="cyber-btn" id="btn-add-badge" style="width: 100%; margin-top: 1rem;" onclick="submitAddBadge('${squadNum}')">霑ｽ蜉</button>
    `;
    openModal(html);
}

async function submitAddBadge(squadNum) {
    const name = document.getElementById('addBadgeName').value.trim();
    const color = document.getElementById('addBadgeColor').value.trim();

    if (!name) {
        alert("繝舌ャ繧ｸ蜷阪ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞");
        return;
    }

    document.getElementById('btn-add-badge').disabled = true;
    document.getElementById('btn-add-badge').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 菫晏ｭ倅ｸｭ...';

    const badgeStr = `${name}(${color})`;
    const success = await sendAction('updateMemberBadge', {
        squadNum: squadNum,
        operation: 'add',
        badgeStr: badgeStr
    });

    if (success) {
        const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
        if (member) {
            member.badges = member.badges || [];
            member.badges.push(badgeStr);
        }
        closeModal();
        renderRoster();
    } else {
        alert("菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆");
        document.getElementById('btn-add-badge').disabled = false;
        document.getElementById('btn-add-badge').innerHTML = '霑ｽ蜉';
    }
}

async function deleteBadge(squadNum, badgeStr) {
    if (!confirm(`繝舌ャ繧ｸ縲・{badgeStr.replace(/\(.*?\)$/, '')}縲阪ｒ蜑企勁縺励∪縺吶°・歔)) return;

    const success = await sendAction('updateMemberBadge', {
        squadNum: squadNum,
        operation: 'delete',
        badgeStr: badgeStr
    });

    if (success) {
        const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
        if (member && member.badges) {
            member.badges = member.badges.filter(b => b !== badgeStr);
        }
        renderRoster();
    } else {
        alert("蜑企勁縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
    }
}

function openEditDepartmentModal(squadNum) {
    const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
    const depts = member ? parseDepartmentIds(member.departmentIds || member.departmentids || member.departmentsIds || member.DepartmentsIds) : [];
    
    let deptListHtml = '';
    if (depts.length > 0) {
        deptListHtml = depts.map(dept => {
            const dData = mockData.departments.find(d => String(getDeptId(d)) === String(dept.id));
            const dName = dData ? getDeptName(dData) : dept.id;
            const titleStr = dept.title ? ` / ${dept.title}` : '';
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-color); padding:0.5rem 1rem; border-radius:10px; box-shadow:var(--shadow-in); margin-bottom:0.5rem;">
                    <span>${dName}${titleStr}</span>
                    <button class="cyber-btn danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="deleteDepartment('${squadNum}', '${dept.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        }).join('');
    } else {
        deptListHtml = '<p style="color:var(--text-muted); font-size:0.9rem;">謇螻槫ｽｹ閨ｷ縺ｪ縺・/p>';
    }

    const deptOptions = mockData.departments.map(d => `<option value="${getDeptId(d)}">${getDeptName(d)}</option>`).join('');

    const html = `
        <h2 style="margin-bottom: 1.5rem; color: var(--accent-blue);"><i class="fa-solid fa-folder-open"></i> 蠖ｹ閨ｷ邱ｨ髮・/h2>
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem;">迴ｾ蝨ｨ縺ｮ蠖ｹ閨ｷ</h4>
            ${deptListHtml}
        </div>
        <div style="border-top: 1px dashed var(--border-color); padding-top: 1.5rem;">
            <h4 style="margin-bottom: 1rem; font-size: 0.9rem;">譁ｰ隕剰ｿｽ蜉</h4>
            <div class="form-group">
                <label>驛ｨ鄂ｲ/蠖ｹ閨ｷ</label>
                <select id="addDeptId" class="cyber-input">
                    ${deptOptions}
                </select>
            </div>
            <div class="form-group">
                <label>閧ｩ譖ｸ (莉ｻ諢・</label>
                <input type="text" id="addDeptTitle" class="cyber-input" placeholder="萓・ 繝ｪ繝ｼ繝繝ｼ">
            </div>
            <button class="cyber-btn" id="btn-add-dept" style="width: 100%; margin-top: 0.5rem;" onclick="submitAddDepartment('${squadNum}')">霑ｽ蜉</button>
        </div>
    `;
    openModal(html);
}

async function submitAddDepartment(squadNum) {
    const deptId = document.getElementById('addDeptId').value;
    const title = document.getElementById('addDeptTitle').value.trim();

    if (!deptId) return;

    document.getElementById('btn-add-dept').disabled = true;
    document.getElementById('btn-add-dept').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 霑ｽ蜉荳ｭ...';

    const success = await sendAction('updateMemberDepartment', {
        squadNum: squadNum,
        operation: 'add',
        deptId: deptId,
        title: title
    });

    if (success) {
        // Need to refetch data to get correctly assigned parent departments, but for immediate UI:
        // Let's just do a full page reload or refetch member data to be safe.
        // Actually since we don't have a single user fetch, we'll mimic the parent assignment locally
        // to avoid a full reload.
        
        let newDepts = [{ id: deptId, title: title }];
        let currentParentId = mockData.departments.find(d => String(getDeptId(d)) === String(deptId))?.parentId;
        while (currentParentId) {
            newDepts.push({ id: currentParentId, title: '' });
            currentParentId = mockData.departments.find(d => String(getDeptId(d)) === String(currentParentId))?.parentId;
        }

        const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
        if (member) {
            let currentDepts = parseDepartmentIds(member.departmentIds || member.departmentids || member.departmentsIds || member.DepartmentsIds);
            newDepts.forEach(nd => {
                const exists = currentDepts.find(cd => String(cd.id) === String(nd.id));
                if (exists) {
                    if (nd.title && !exists.title) exists.title = nd.title;
                } else {
                    currentDepts.push(nd);
                }
            });
            member.departmentIds = currentDepts.map(d => d.title ? `${d.id}(${d.title})` : d.id).join(',');
        }

        closeModal();
        renderRoster();
        // optionally reopen the modal so they can add more:
        // setTimeout(() => openEditDepartmentModal(squadNum), 300);
    } else {
        alert("霑ｽ蜉縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
        document.getElementById('btn-add-dept').disabled = false;
        document.getElementById('btn-add-dept').innerHTML = '霑ｽ蜉';
    }
}

async function deleteDepartment(squadNum, deptId) {
    if (!confirm("縺薙・蠖ｹ閨ｷ繧貞炎髯､縺励∪縺吶°・・)) return;
    
    // In the modal, we might be clicking delete. If we are in the modal, we can show a loader or just close it.
    const success = await sendAction('updateMemberDepartment', {
        squadNum: squadNum,
        operation: 'delete',
        deptId: deptId
    });

    if (success) {
        const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
        if (member) {
            let currentDepts = parseDepartmentIds(member.departmentIds || member.departmentids || member.departmentsIds || member.DepartmentsIds);
            currentDepts = currentDepts.filter(cd => String(cd.id) !== String(deptId));
            member.departmentIds = currentDepts.map(d => d.title ? `${d.id}(${d.title})` : d.id).join(',');
        }
        
        // Re-render
        if(document.getElementById('modal-overlay').classList.contains('hidden') === false) {
            // we are inside modal
            openEditDepartmentModal(squadNum);
            renderRoster();
        } else {
            renderRoster();
        }
    } else {
        alert("蜑企勁縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
    }
}

// ==========================================
// DOCUMENT VIEWER
// ==========================================
function closeDocViewerModal() {
    document.getElementById('doc-viewer-overlay').classList.add('hidden');
}

async function openDocViewerModal(docLink, title) {
    const overlay = document.getElementById('doc-viewer-overlay');
    const titleEl = document.getElementById('doc-viewer-title');
    const bodyEl = document.getElementById('doc-viewer-body');
    
    titleEl.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${title}`;
    bodyEl.innerHTML = `<div style="text-align:center; padding:2rem;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:1rem;">繝・・繧ｿ縺ｮ蜿門ｾ嶺ｸｭ...</p></div>`;
    
    overlay.classList.remove('hidden');
    
    try {
        const response = await fetch(GAS_API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getDocText', docLink: docLink })
        });
        const result = await response.json();
        
        if (result.success && result.text) {
            bodyEl.textContent = result.text; // TextContent escapes HTML safely
        } else {
            bodyEl.innerHTML = `<div style="color:var(--accent-pink); text-align:center; padding:2rem;"><i class="fa-solid fa-triangle-exclamation fa-2x"></i><p style="margin-top:1rem;">蜿門ｾ怜､ｱ謨・ ${result.error || '荳肴・縺ｪ繧ｨ繝ｩ繝ｼ'}</p></div>`;
        }
    } catch (e) {
        bodyEl.innerHTML = `<div style="color:var(--accent-pink); text-align:center; padding:2rem;"><i class="fa-solid fa-triangle-exclamation fa-2x"></i><p style="margin-top:1rem;">騾壻ｿ｡繧ｨ繝ｩ繝ｼ: ${e.message}</p></div>`;
    }
}

// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (appRoot) {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        currentView = viewParam ? viewParam : 'home';
        
        const targetSquad = params.get('squadNum');
        if (targetSquad) {
            currentRosterSearch = targetSquad; // set filter
        }
        
        const targetEventId = params.get('eventId');
        if (targetEventId) {
            currentScheduleView = 'event';
        }
        
        // URL繝代Λ繝｡繝ｼ繧ｿ繧偵け繝ｪ繝ｼ繝ｳ縺ｫ縺吶ｋ(莉ｻ諢・
        if (viewParam || targetSquad || targetEventId) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        fetchPortalData().then(() => {
            // Scroll to event if schedule is targeted
            if (targetEventId && currentView === 'schedule') {
                setTimeout(() => {
                    const eventCards = document.querySelectorAll('.cyber-card');
                    for (const card of eventCards) {
                        if (card.innerHTML.includes(targetEventId)) {
                            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            card.style.transition = 'box-shadow 0.3s';
                            card.style.boxShadow = '0 0 20px var(--accent-pink)';
                            setTimeout(() => card.style.boxShadow = '', 3000);
                            break;
                        }
                    }
                }, 500);
            }
        });
    }
});

// ==========================================
// CROPPER & PHOTO UPLOAD
// ==========================================
let cropper = null;
let currentUploadSquadNum = null;

function triggerPhotoUpload(squadNum) {
    currentUploadSquadNum = squadNum;
    const input = document.getElementById('memberPhotoInput');
    input.value = ''; // Reset
    input.click();
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('memberPhotoInput');
    if (input) {
        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.getElementById('cropper-image');
                    img.src = e.target.result;
                    document.getElementById('cropper-modal').classList.remove('hidden');
                    
                    if (cropper) {
                        cropper.destroy();
                    }
                    cropper = new Cropper(img, {
                        aspectRatio: 1,
                        viewMode: 1,
                        dragMode: 'move',
                        autoCropArea: 1,
                        restore: false,
                        guides: true,
                        center: true,
                        highlight: false,
                        cropBoxMovable: true,
                        cropBoxResizable: true,
                        toggleDragModeOnDblclick: false,
                    });
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
});

function closeCropperModal() {
    document.getElementById('cropper-modal').classList.add('hidden');
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    currentUploadSquadNum = null;
}

function cropAndUpload() {
    if (!cropper || !currentUploadSquadNum) return;
    
    const btn = document.getElementById('btn-crop-upload');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 繧｢繝・・繝ｭ繝ｼ繝我ｸｭ...';
    btn.disabled = true;

    const canvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });
    
    const base64Data = canvas.toDataURL('image/jpeg', 0.8);
    
    // API Call
    fetch(GAS_API_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'uploadMemberPhoto',
            squadNum: currentUploadSquadNum,
            imageBase64: base64Data
        })
    })
    .then(r => r.json())
    .then(data => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        if (data.success) {
            closeCropperModal();
            // Update mockData
            const m = mockData.members.find(x => String(x.squadNumber) === String(currentUploadSquadNum));
            if (m) {
                m.photo = data.url; // url will be returned from GAS
            }
            renderRoster(); // Re-render to show new image
            alert("繧｢繝・・繝ｭ繝ｼ繝峨′螳御ｺ・＠縺ｾ縺励◆・・);
        } else {
            alert("繧ｨ繝ｩ繝ｼ: " + data.error);
        }
    })
    .catch(err => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert("騾壻ｿ｡繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
        console.error(err);
    });
}
