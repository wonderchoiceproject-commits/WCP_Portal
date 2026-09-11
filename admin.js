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
            { data: eventsData }
        ] = await Promise.all([
            supabase.from('members').select('*').order('squadNumber'),
            supabase.from('departments').select('*'),
            supabase.from('books').select('*'),
            supabase.from('events').select('*').order('date', { ascending: false })
        ]);
        
        adminData.members = membersData || [];
        adminData.departments = deptsData || [];
        adminData.books = booksData || [];
        adminData.events = eventsData || [];
        
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
                <button class="admin-action-btn btn-delete" onclick="alert('未実装: 削除機能のモックアップです。ご要望に合わせて実装します。')">削除</button>
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
                <button class="admin-action-btn btn-edit" onclick="alert('未実装: 編集機能のモックアップです。ご要望に合わせて実装します。')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="deleteAdminDepartment('${d.id}')">削除</button>
            </td>
        </tr>
    `).join('');

    // Render Books
    const tbodyB = document.getElementById('admin-tbody-books');
    tbodyB.innerHTML = adminData.books.map(b => `
        <tr>
            <td>${b.id}</td>
            <td>${b.title}</td>
            <td>${b.status}</td>
            <td>
                <button class="admin-action-btn btn-edit" onclick="alert('未実装: 編集機能のモックアップです。ご要望に合わせて実装します。')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="alert('未実装: 削除機能のモックアップです。ご要望に合わせて実装します。')">削除</button>
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
                <button class="admin-action-btn btn-edit" onclick="alert('未実装: 編集機能のモックアップです。ご要望に合わせて実装します。')">編集</button>
                <button class="admin-action-btn btn-delete" onclick="alert('未実装: 削除機能のモックアップです。ご要望に合わせて実装します。')">削除</button>
            </td>
        </tr>
        </tr>
    `).join('');

    // Render Categories
    renderAdminCategories();
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

document.addEventListener('DOMContentLoaded', fetchAdminData);
