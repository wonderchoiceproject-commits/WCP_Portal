const supabaseUrl = 'https://ouflqodgegugznmmlkpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Zmxxb2RnZWd1Z3pubW1sa3B0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEyNDkxMiwiZXhwIjoyMTAzNzAwOTEyfQ.HrFGGMUDAxgtVQ5M6psk6EsVcheU6cL-0jYtrQLOn3U';
window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let adminData = {
    members: [],
    departments: [],
    books: [],
    events: []
};

function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    
    // Fallback if event is not defined depending on browser handling
    const evt = window.event;
    if(evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    }
    
    document.getElementById('section-' + tabId).classList.add('active');
}

async function fetchAdminData() {
    try {
        const [
            { data: membersData },
            { data: deptsData },
            { data: booksData },
            { data: eventsData },
            { data: videosData }
        ] = await Promise.all([
            supabase.from('members').select('*').order('squadNumber'),
            supabase.from('departments').select('*'),
            supabase.from('books').select('*'),
            supabase.from('events').select('*').order('date', { ascending: false }),
            supabase.from('learning_videos').select('*').catch(() => ({ data: [] }))
        ]);
        
        adminData.members = membersData || [];
        adminData.departments = deptsData || [];
        adminData.books = booksData || [];
        adminData.events = eventsData || [];
        adminData.videos = videosData || [];
        
        // --- ログイン状態と管理者権限のチェック ---
        const loggedInSquad = sessionStorage.getItem('wcp_logged_in_squad');
        if (!loggedInSquad) {
            alert('ログインが必要です。ポータル画面からログインしてください。');
            window.close();
            return;
        }
        
        const currentUser = adminData.members.find(m => String(m.squadNumber) === String(loggedInSquad));
        if (!currentUser || (currentUser.admin !== true && currentUser.admin !== 'true' && currentUser.admin !== 'TRUE')) {
            alert('管理者権限がありません。このページを閉じます。');
            window.close();
            return;
        }
        // ------------------------------------------

        renderAdminTables();
    } catch (e) {
        console.error(e);
        alert('データの取得に失敗しました');
    }
}

function renderAdminTables() {
    // Render Members
    const tbodyM = document.getElementById('admin-tbody-members');
    tbodyM.innerHTML = adminData.members.map(m => `
        <tr>
            <td>${m.squadNumber || ''}</td>
            <td>${m.name || ''}</td>
            <td>${m.generation || ''}</td>
            <td>
                <span style="color: ${m.admin === true || m.admin === 'true' ? 'var(--accent-green)' : 'inherit'}">${(m.admin === true || m.admin === 'true') ? '✔️ 管理者' : '-'}</span>
                <button class="admin-action-btn" style="margin-left: 10px; padding: 2px 5px; font-size: 0.7rem; background: var(--bg-main);" onclick="toggleAdminStatus('${m.squadNumber}', ${m.admin === true || m.admin === 'true'})">権限変更</button>
            </td>
            <td>
                <button class="admin-action-btn btn-edit" onclick="openAdminMemberEditModal('${m.squadNumber}')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="alert('未実装')">削除</button>
            </td>
        </tr>
    `).join('');

    // Render Departments
    const tbodyD = document.getElementById('admin-tbody-departments');
    tbodyD.innerHTML = adminData.departments.map(d => `
        <tr>
            <td>${d.id}</td>
            <td>${d.name || d.id}</td>
            <td>${d.members_unvisible ? '非表示' : '表示'}</td>
            <td>
                <button class="admin-action-btn btn-edit" onclick="alert('未実装')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="deleteAdminDepartment('${d.id}')">削除</button>
            </td>
        </tr>
    `).join('');

    // Render Books
    const tbodyB = document.getElementById('admin-tbody-books');
    tbodyB.innerHTML = adminData.books.map(b => `
        <tr>
            <td><img src="${b.coverImage || 'https://via.placeholder.com/50'}" style="width: 40px; border-radius: 4px; object-fit: cover;"></td>
            <td>${b.id}</td>
            <td>${b.title}</td>
            <td>${b.status}</td>
            <td>
                <button class="admin-action-btn btn-edit" onclick="openAdminBookModal('${b.id}')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="deleteAdminBook('${b.id}')">削除</button>
            </td>
        </tr>
    `).join('');

    // Render Events
    const tbodyE = document.getElementById('admin-tbody-events');
    tbodyE.innerHTML = adminData.events.map(e => `
        <tr>
            <td>${e.date}</td>
            <td>${e.title}</td>
            <td>${e.host}</td>
            <td>
                <button class="admin-action-btn btn-edit" onclick="alert('未実装')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="alert('未実装')">削除</button>
            </td>
        </tr>
        </tr>
    `).join('');

    // Render Categories
    renderAdminCategories();

    // Render Videos
    renderAdminVideos();
}

function renderAdminCategories() {
    const container = document.getElementById('admin-category-container');
    if (!container) return;

    // Group members by category
    const categoriesMap = {};
    adminData.members.forEach(m => {
        const cat = m.category || '未設定';
        if (!categoriesMap[cat]) categoriesMap[cat] = [];
        categoriesMap[cat].push(m);
    });

    // Custom sort logic could be added here. For now, alphabetical.
    const sortedCats = Object.keys(categoriesMap).sort();
    const tasksToCheck = ['K-01', 'K-02', 'K-03', 'K-04', 'K-05', 'Core', 'Trainee', 'Rookie', 'Regular', 'Member'];

    let html = '';
    for (const cat of sortedCats) {
        html += `
            <div class="cyber-card" style="padding: 1.5rem; background: var(--bg-surface);">
                <h3 style="color: var(--accent-blue); margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                    ${cat} <span style="font-size: 0.9rem; color: var(--text-muted);">(${categoriesMap[cat].length}名)</span>
                </h3>
                <div style="overflow-x: auto;">
                    <table class="admin-table" style="min-width: 800px; margin-bottom: 0;">
                        <thead>
                            <tr>
                                <th style="width: 150px;">名前 (背番号)</th>
                                ${tasksToCheck.map(t => `<th style="text-align:center;">${t}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${categoriesMap[cat].map(m => `
                                <tr>
                                    <td><strong>${m.name}</strong><br><small style="color:var(--text-muted);">${m.squadNumber}</small></td>
                                    ${tasksToCheck.map(t => {
                                        const isCompleted = m[t] === true || m[t] === "TRUE";
                                        const color = isCompleted ? 'var(--accent-green)' : 'var(--border-color)';
                                        const icon = isCompleted ? 'fa-check-circle' : 'fa-circle';
                                        return `<td style="text-align:center;">
                                            <i class="fa-solid ${icon}" style="color: ${color}; cursor:pointer; font-size: 1.3rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="adminToggleCategoryTask('${m.squadNumber}', '${t}', ${!isCompleted})"></i>
                                        </td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

async function adminToggleCategoryTask(squadNumber, key, newValue) {
    try {
        const updateObj = {};
        updateObj[key] = newValue;
        const { error } = await supabase.from('members').update(updateObj).eq('squadNumber', squadNumber);
        if(error) throw error;
        await fetchAdminData();
    } catch(e) {
        console.error(e);
        alert('進捗の更新に失敗しました。');
    }
}

async function deleteAdminDepartment(deptId) {
    if (!confirm('この部署と、紐づくすべての子孫部署を削除します。よろしいですか？')) return;
    
    // Find all descendants using a BFS queue
    const idsToDelete = [deptId];
    const queue = [deptId];
    
    while(queue.length > 0) {
        const currentId = queue.shift();
        const children = adminData.departments.filter(d => d.parentId === currentId);
        for(const child of children) {
            if(!idsToDelete.includes(child.id)) {
                idsToDelete.push(child.id);
                queue.push(child.id);
            }
        }
    }
    
    try {
        const { error } = await supabase.from('departments').delete().in('id', idsToDelete);
        if(error) throw error;
        
        alert(`${idsToDelete.length}件の部署を削除しました。`);
        fetchAdminData(); // 削除後にデータを再取得して再描画
    } catch(e) {
        console.error(e);
        alert('削除処理中にエラーが発生しました。');
    }
}

async function toggleAdminStatus(squadNumber, currentStatus) {
    if (!confirm(`背番号 ${squadNumber} の管理者権限を ${currentStatus ? '解除' : '付与'} しますか？`)) return;
    
    const newStatus = !currentStatus;
    try {
        const { error } = await supabase.from('members').update({ admin: newStatus }).eq('squadNumber', squadNumber);
        if(error) throw error;
        
        alert(`管理者権限を更新しました。`);
        fetchAdminData();
    } catch(e) {
        console.error(e);
        alert('更新処理中にエラーが発生しました。');
    }
}

// ==========================================
// MODAL & MEMBER EDIT LOGIC
// ==========================================
function openAdminModal(html) {
    document.getElementById('admin-modal-content').innerHTML = html;
    document.getElementById('admin-modal-overlay').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('admin-modal-overlay').style.display = 'none';
}

function openAdminMemberEditModal(squadNumber) {
    const m = adminData.members.find(x => String(x.squadNumber) === String(squadNumber));
    if (!m) return;

    const badgesHtml = m.badges && m.badges.length > 0 ? m.badges.map(b => {
        return `<span class="badge" style="background: var(--surface-color); border: 1px solid var(--border-color); padding: 0.2rem 0.5rem; margin: 0.2rem; font-size: 0.8rem;">
            ${b} <i class="fa-solid fa-xmark" style="cursor:pointer; color:var(--accent-pink); margin-left:0.3rem;" onclick="adminDeleteBadge('${squadNumber}', '${b}')"></i>
        </span>`;
    }).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">なし</span>';

    const deptsHtml = m.departmentIds && m.departmentIds.length > 0 ? m.departmentIds.map(dId => {
        const dObj = adminData.departments.find(d => d.id === dId);
        const dName = dObj ? dObj.name : dId;
        return `<span class="badge" style="background: var(--surface-color); border: 1px solid var(--accent-blue); padding: 0.2rem 0.5rem; margin: 0.2rem; font-size: 0.8rem;">
            ${dName} <i class="fa-solid fa-xmark" style="cursor:pointer; color:var(--accent-pink); margin-left:0.3rem;" onclick="adminDeleteDepartment('${squadNumber}', '${dId}')"></i>
        </span>`;
    }).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">なし</span>';

    const categoryTasks = ['K-01', 'K-02', 'K-03', 'K-04', 'K-05', 'Core', 'Trainee', 'Rookie', 'Regular', 'Member'];
    const tasksHtml = categoryTasks.map(key => {
        const isCompleted = m[key] === true || m[key] === "TRUE";
        const color = isCompleted ? 'var(--accent-green)' : 'var(--text-muted)';
        const icon = isCompleted ? 'fa-check-circle' : 'fa-circle';
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.3rem 0; border-bottom: 1px solid var(--border-color);">
                <span>${key}</span>
                <i class="fa-solid ${icon}" style="color: ${color}; cursor:pointer; font-size: 1.2rem;" onclick="adminToggleTask('${squadNumber}', '${key}', ${!isCompleted})"></i>
            </div>
        `;
    }).join('');

    let html = `
        <h2 style="margin-bottom: 1rem;"><i class="fa-solid fa-user-edit"></i> メンバー編集: ${m.name}</h2>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <!-- 基本情報 -->
            <div class="cyber-card" style="padding: 1rem;">
                <h3 style="margin-bottom: 0.5rem; font-size: 1rem; color: var(--accent-blue);">基本情報</h3>
                <div class="form-group" style="margin-bottom: 0.5rem;">
                    <label>名前</label>
                    <input type="text" id="edit-m-name" class="cyber-input" value="${m.name || ''}">
                </div>
                <div class="form-group" style="margin-bottom: 0.5rem;">
                    <label>カテゴリー</label>
                    <input type="text" id="edit-m-category" class="cyber-input" value="${m.category || ''}">
                </div>
                <div class="form-group" style="margin-bottom: 0.5rem;">
                    <label>代</label>
                    <input type="text" id="edit-m-generation" class="cyber-input" value="${m.generation || ''}">
                </div>
                <button class="cyber-btn" onclick="saveAdminMemberBasic('${squadNumber}')">基本情報を保存</button>
            </div>

            <!-- バッジ -->
            <div class="cyber-card" style="padding: 1rem;">
                <h3 style="margin-bottom: 0.5rem; font-size: 1rem; color: var(--accent-blue);">バッジ</h3>
                <div style="margin-bottom: 0.5rem; display:flex; flex-wrap:wrap;">${badgesHtml}</div>
                <div style="display:flex; gap:0.5rem;">
                    <input type="text" id="edit-m-new-badge" class="cyber-input" placeholder="バッジ名(色コード)" style="flex:1;">
                    <button class="cyber-btn" onclick="adminAddBadge('${squadNumber}')">追加</button>
                </div>
                <small style="color:var(--text-muted);">例: 読書マスター(#ff9900)</small>
            </div>

            <!-- 部署 (役職) -->
            <div class="cyber-card" style="padding: 1rem;">
                <h3 style="margin-bottom: 0.5rem; font-size: 1rem; color: var(--accent-blue);">部署 (役職)</h3>
                <div style="margin-bottom: 0.5rem; display:flex; flex-wrap:wrap;">${deptsHtml}</div>
                <div style="display:flex; gap:0.5rem;">
                    <select id="edit-m-new-dept" class="cyber-input" style="flex:1;">
                        <option value="">部署を選択</option>
                        ${adminData.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                    <button class="cyber-btn" onclick="adminAddDepartment('${squadNumber}')">追加</button>
                </div>
            </div>

            <!-- 進捗 (課題・カテゴリ要件) -->
            <div class="cyber-card" style="padding: 1rem;">
                <h3 style="margin-bottom: 0.5rem; font-size: 1rem; color: var(--accent-blue);">課題・要件進捗</h3>
                ${tasksHtml}
            </div>
        </div>
        <div style="text-align:right; margin-top:1rem;">
            <button class="cyber-btn" onclick="closeAdminModal()">閉じる</button>
        </div>
    `;
    openAdminModal(html);
}

async function saveAdminMemberBasic(squadNumber) {
    const name = document.getElementById('edit-m-name').value;
    const category = document.getElementById('edit-m-category').value;
    const generation = document.getElementById('edit-m-generation').value;

    try {
        const { error } = await supabase.from('members').update({ name, category, generation }).eq('squadNumber', squadNumber);
        if(error) throw error;
        alert('基本情報を更新しました。');
        await fetchAdminData();
        openAdminMemberEditModal(squadNumber); // 再描画
    } catch(e) {
        console.error(e);
        alert('更新に失敗しました。');
    }
}

async function adminToggleTask(squadNumber, key, newValue) {
    try {
        const updateObj = {};
        updateObj[key] = newValue;
        const { error } = await supabase.from('members').update(updateObj).eq('squadNumber', squadNumber);
        if(error) throw error;
        await fetchAdminData();
        openAdminMemberEditModal(squadNumber);
    } catch(e) {
        console.error(e);
        alert('進捗の更新に失敗しました。');
    }
}

async function adminAddBadge(squadNumber) {
    const badge = document.getElementById('edit-m-new-badge').value.trim();
    if(!badge) return;
    
    const m = adminData.members.find(x => String(x.squadNumber) === String(squadNumber));
    const current = m.badges || [];
    if(current.includes(badge)) {
        alert('すでに同じバッジが存在します。');
        return;
    }
    
    try {
        const newBadges = [...current, badge];
        const { error } = await supabase.from('members').update({ badges: newBadges }).eq('squadNumber', squadNumber);
        if(error) throw error;
        await fetchAdminData();
        openAdminMemberEditModal(squadNumber);
    } catch(e) {
        console.error(e);
        alert('バッジ追加に失敗しました。');
    }
}

async function adminDeleteBadge(squadNumber, badge) {
    if(!confirm(`バッジ「${badge}」を削除しますか？`)) return;
    const m = adminData.members.find(x => String(x.squadNumber) === String(squadNumber));
    const current = m.badges || [];
    const newBadges = current.filter(b => b !== badge);
    
    try {
        const { error } = await supabase.from('members').update({ badges: newBadges }).eq('squadNumber', squadNumber);
        if(error) throw error;
        await fetchAdminData();
        openAdminMemberEditModal(squadNumber);
    } catch(e) {
        console.error(e);
        alert('バッジ削除に失敗しました。');
    }
}

async function adminAddDepartment(squadNumber) {
    const deptId = document.getElementById('edit-m-new-dept').value;
    if(!deptId) return;
    
    const m = adminData.members.find(x => String(x.squadNumber) === String(squadNumber));
    const current = m.departmentIds || [];
    if(current.includes(deptId)) {
        alert('すでにその部署に所属しています。');
        return;
    }
    
    try {
        const newDepts = [...current, deptId];
        const { error } = await supabase.from('members').update({ departmentIds: newDepts }).eq('squadNumber', squadNumber);
        if(error) throw error;
        await fetchAdminData();
        openAdminMemberEditModal(squadNumber);
    } catch(e) {
        console.error(e);
        alert('部署追加に失敗しました。');
    }
}

async function adminDeleteDepartment(squadNumber, deptId) {
    if(!confirm(`部署ID「${deptId}」の所属を解除しますか？`)) return;
    const m = adminData.members.find(x => String(x.squadNumber) === String(squadNumber));
    const current = m.departmentIds || [];
    const newDepts = current.filter(d => d !== deptId);
    
    try {
        const { error } = await supabase.from('members').update({ departmentIds: newDepts }).eq('squadNumber', squadNumber);
        if(error) throw error;
        await fetchAdminData();
        openAdminMemberEditModal(squadNumber);
    } catch(e) {
        console.error(e);
        alert('部署削除に失敗しました。');
    }
}

// ==========================================
// VIDEO MANAGEMENT LOGIC
// ==========================================

function getAdminLearningVideos() {
    return adminData.videos || [];
}

function renderAdminVideos() {
    const tbodyV = document.getElementById('admin-tbody-videos');
    if (!tbodyV) return;
    
    const videos = getAdminLearningVideos();
    tbodyV.innerHTML = videos.map(v => `
        <tr>
            <td>${v.title}</td>
            <td>${v.category}</td>
            <td><a href="${v.url}" target="_blank" style="color: var(--accent-blue);">${v.url.substring(0, 30)}...</a></td>
            <td>
                <button class="admin-action-btn btn-delete" onclick="adminDeleteVideo('${v.id}')">削除</button>
            </td>
        </tr>
    `).join('');
}

function openAddVideoModal() {
    const html = `
        <div class="admin-header">
            <h2>動画の追加</h2>
        </div>
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-main);">タイトル</label>
            <input type="text" id="add-video-title" class="admin-input" placeholder="例: Beginner導入動画">
        </div>
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-main);">対象カテゴリー</label>
            <select id="add-video-category" class="admin-input">
                <option value="Beginner→Member">Beginner→Member</option>
                <option value="Member→Assistant">Member→Assistant</option>
                <option value="Assistant→Chief">Assistant→Chief</option>
                <option value="Chief→Core">Chief→Core</option>
            </select>
        </div>
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-main);">動画URL (mp4等)</label>
            <input type="text" id="add-video-url" class="admin-input" placeholder="https://...">
        </div>
        <div style="display: flex; gap: 1rem;">
            <button class="cyber-btn" style="flex: 1; background: var(--accent-green);" onclick="adminSaveNewVideo()">保存</button>
            <button class="cyber-btn" style="flex: 1;" onclick="closeAdminModal()">キャンセル</button>
        </div>
    `;
    openAdminModal(html);
}

async function adminSaveNewVideo() {
    const title = document.getElementById('add-video-title').value.trim();
    const category = document.getElementById('add-video-category').value;
    const url = document.getElementById('add-video-url').value.trim();
    
    if (!title || !url) {
        alert("タイトルとURLを入力してください。");
        return;
    }
    
    const newVideo = {
        id: 'v' + Date.now(),
        title: title,
        category: category,
        url: url
    };
    
    try {
        const { error } = await supabase.from('learning_videos').insert([newVideo]);
        if (error) throw error;
        
        // ローカルのデータも更新して再描画
        const videos = getAdminLearningVideos();
        videos.push(newVideo);
        adminData.videos = videos;
        
        renderAdminVideos();
        closeAdminModal();
        alert("動画を追加しました。");
    } catch (e) {
        console.error(e);
        alert("動画の追加に失敗しました。");
    }
}

async function adminDeleteVideo(id) {
    if (!confirm("本当にこの動画を削除しますか？")) return;
    try {
        const { error } = await supabase.from('learning_videos').delete().eq('id', id);
        if (error) throw error;
        
        let videos = getAdminLearningVideos();
        videos = videos.filter(v => v.id !== id);
        adminData.videos = videos;
        
        renderAdminVideos();
    } catch (e) {
        console.error(e);
        alert("動画の削除に失敗しました。");
    }
}

document.addEventListener('DOMContentLoaded', fetchAdminData);

// ==========================================
// BOOK MANAGEMENT
// ==========================================
function openAdminBookModal(bookId = null) {
    let book = { id: '', title: '', author: '', genre: '', coverImage: '' };
    if (bookId) {
        book = adminData.books.find(b => b.id === bookId) || book;
    }

    const html = `
        <h2 style="color: var(--accent-blue); margin-bottom: 1rem;"><i class="fa-solid fa-book"></i> ${bookId ? '図書編集' : '図書追加'}</h2>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${bookId ? `<input type="hidden" id="admin-book-id" value="${book.id}">` : `
            <div>
                <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.2rem;">図書ID (必須)</label>
                <input type="text" id="admin-book-id" class="cyber-input" value="" style="width: 100%;">
            </div>
            `}
            <div>
                <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.2rem;">タイトル (必須)</label>
                <input type="text" id="admin-book-title" class="cyber-input" value="${book.title}" style="width: 100%;">
            </div>
            <div>
                <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.2rem;">著者</label>
                <input type="text" id="admin-book-author" class="cyber-input" value="${book.author || ''}" style="width: 100%;">
            </div>
            <div>
                <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.2rem;">ジャンル (省略時: ファンタジー・SF)</label>
                <input type="text" id="admin-book-genre" class="cyber-input" value="${book.genre || ''}" style="width: 100%;">
            </div>
            <div>
                <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.2rem;">カバー画像 URL (またはファイル選択)</label>
                <input type="text" id="admin-book-cover" class="cyber-input" value="${book.coverImage || ''}" style="width: 100%; margin-bottom: 0.5rem;" placeholder="https://... またはBase64">
                <input type="file" id="admin-book-cover-file" accept="image/*" class="cyber-input" style="width: 100%;" onchange="handleAdminBookCoverUpload(this)">
                ${book.coverImage ? `<div style="margin-top:0.5rem;"><img src="${book.coverImage}" style="max-height:150px; border-radius:4px;"></div>` : ''}
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button class="cyber-btn" style="flex: 1; background: var(--bg-surface); color: var(--text-main);" onclick="closeAdminModal()">キャンセル</button>
                <button class="cyber-btn" style="flex: 1;" onclick="saveAdminBook('${bookId ? 'edit' : 'add'}')">保存</button>
            </div>
        </div>
    `;
    openAdminModal(html);
}

async function handleAdminBookCoverUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        // 5MB limit for typical covers
        if (file.size > 5 * 1024 * 1024) {
            alert('画像サイズは5MB以下にしてください。');
            input.value = '';
            return;
        }

        try {
            document.getElementById('admin-book-cover').value = 'アップロード中...';
            input.disabled = true;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `books/${fileName}`;

            const { data, error } = await supabase.storage
                .from('covers')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('covers')
                .getPublicUrl(filePath);

            document.getElementById('admin-book-cover').value = publicUrlData.publicUrl;
            
            // Preview image update if img tag exists
            const imgPreview = input.parentElement.querySelector('img');
            if (imgPreview) {
                imgPreview.src = publicUrlData.publicUrl;
            } else {
                const imgContainer = document.createElement('div');
                imgContainer.style.marginTop = '0.5rem';
                imgContainer.innerHTML = `<img src="${publicUrlData.publicUrl}" style="max-height:150px; border-radius:4px;">`;
                input.parentElement.appendChild(imgContainer);
            }
            
            alert('画像のアップロードが完了しました！');

        } catch (error) {
            console.error('Upload Error:', error);
            alert('画像のアップロードに失敗しました。バケットの設定（Public）などを確認してください。\n' + error.message);
            document.getElementById('admin-book-cover').value = '';
        } finally {
            input.disabled = false;
        }
    }
}

async function saveAdminBook(mode) {
    const id = document.getElementById('admin-book-id').value.trim();
    const title = document.getElementById('admin-book-title').value.trim();
    const author = document.getElementById('admin-book-author').value.trim();
    const genre = document.getElementById('admin-book-genre').value.trim();
    const coverImage = document.getElementById('admin-book-cover').value.trim();

    if (!id || !title) {
        alert('IDとタイトルは必須です。');
        return;
    }

    const payload = { title, author, genre, coverImage };
    
    // We should not change 'id' field in Postgres unless it's a new row (add).
    // Usually, in supabase, if id is a primary key, insert needs it.
    if (mode === 'add') {
        payload.id = id;
        payload.status = 'available'; // Default status
    }

    try {
        let result;
        if (mode === 'add') {
            result = await supabase.from('books').insert([payload]);
        } else {
            result = await supabase.from('books').update(payload).eq('id', id);
        }
        
        if (result.error) throw result.error;

        alert('保存しました。');
        closeAdminModal();
        
        // Reload books data
        const { data } = await supabase.from('books').select('*');
        if (data) {
            adminData.books = data;
            
            // Re-render
            const tbodyB = document.getElementById('admin-tbody-books');
            tbodyB.innerHTML = adminData.books.map(b => `
                <tr>
                    <td><img src="${b.coverImage || 'https://via.placeholder.com/50'}" style="width: 40px; border-radius: 4px;"></td>
                    <td>${b.id}</td>
                    <td>${b.title}</td>
                    <td>${b.status}</td>
                    <td>
                        <button class="admin-action-btn btn-edit" onclick="openAdminBookModal('${b.id}')">編集</button>
                        <button class="admin-action-btn btn-delete" onclick="deleteAdminBook('${b.id}')">削除</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        console.error(e);
        alert('保存に失敗しました: ' + (e.message || JSON.stringify(e)));
    }
}

async function deleteAdminBook(id) {
    if(!confirm('本当に削除しますか？')) return;
    try {
        const { error } = await supabase.from('books').delete().eq('id', id);
        if (error) throw error;
        alert('削除しました。');
        const { data } = await supabase.from('books').select('*');
        if (data) {
            adminData.books = data;
            const tbodyB = document.getElementById('admin-tbody-books');
            tbodyB.innerHTML = adminData.books.map(b => `
                <tr>
                    <td><img src="${b.coverImage || 'https://via.placeholder.com/50'}" style="width: 40px; border-radius: 4px;"></td>
                    <td>${b.id}</td>
                    <td>${b.title}</td>
                    <td>${b.status}</td>
                    <td>
                        <button class="admin-action-btn btn-edit" onclick="openAdminBookModal('${b.id}')">編集</button>
                        <button class="admin-action-btn btn-delete" onclick="deleteAdminBook('${b.id}')">削除</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch(e) {
        console.error(e);
        alert('削除に失敗しました: ' + (e.message || JSON.stringify(e)));
    }
}
