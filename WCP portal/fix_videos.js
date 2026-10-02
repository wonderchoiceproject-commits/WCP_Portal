const fs = require('fs');
let appContent = fs.readFileSync('app.js', 'utf8');

const target1 = `        const [
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
        ]);`;

const rep1 = `        const [
            { data: settingsData },
            { data: departmentsData },
            { data: membersData },
            { data: booksData },
            { data: eventsData },
            { data: reviewsData },
            { data: videosData },
            { data: newsData }
        ] = await Promise.all([
            supabase.from('settings').select('*'),
            supabase.from('departments').select('*').order('created_at'),
            supabase.from('members').select('*'),
            supabase.from('books').select('*'),
            supabase.from('events').select('*'),
            supabase.from('reviews').select('*'),
            supabase.from('learning_videos').select('*').catch(() => ({ data: [] })),
            supabase.from('news').select('*').order('date', { ascending: false }).catch(() => ({ data: [] }))
        ]);`;

const target2 = `        mockData = {
            settings: settingsObj,
            departments: departmentsData || [],
            members: membersData || [],
            books: booksData || [],
            events: eventsData || [],
            reviews: reviewsData || [],
            news: [] // 現在のUIの要件を満たすため空配列
        };`;

const rep2 = `        mockData = {
            settings: settingsObj,
            departments: departmentsData || [],
            members: membersData || [],
            books: booksData || [],
            events: eventsData || [],
            reviews: reviewsData || [],
            videos: videosData || [],
            news: newsData || []
        };`;

const target3 = `function getLearningVideos() {
    const stored = localStorage.getItem('wcp_learning_videos');
    if (stored) {
        return JSON.parse(stored);
    }
    // Default mock data if empty
    const defaults = [
        { id: 'v1', title: 'サンプル動画1', category: 'Beginner→Member', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 'v2', title: 'サンプル動画2', category: 'Member→Assistant', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 'v3', title: 'サンプル動画3', category: 'Assistant→Chief', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 'v4', title: 'サンプル動画4', category: 'Chief→Core', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
    ];
    localStorage.setItem('wcp_learning_videos', JSON.stringify(defaults));
    return defaults;
}`;

const rep3 = `function getLearningVideos() {
    return mockData.videos || [];
}`;

appContent = appContent.replace(target1.replace(/\r\n/g, '\n'), rep1).replace(target1.replace(/\n/g, '\r\n'), rep1);
appContent = appContent.replace(target2.replace(/\r\n/g, '\n'), rep2).replace(target2.replace(/\n/g, '\r\n'), rep2);
appContent = appContent.replace(target3.replace(/\r\n/g, '\n'), rep3).replace(target3.replace(/\n/g, '\r\n'), rep3);

fs.writeFileSync('app.js', appContent);

let adminContent = fs.readFileSync('admin.js', 'utf8');

const targetAdmin1 = `        const [
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
        adminData.events = eventsData || [];`;

const repAdmin1 = `        const [
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
        adminData.videos = videosData || [];`;

const targetAdmin2 = `function getAdminLearningVideos() {
    const stored = localStorage.getItem('wcp_learning_videos');
    if (stored) {
        return JSON.parse(stored);
    }
    const defaults = [
        { id: 'v1', title: 'サンプル動画1', category: 'Beginner→Member', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 'v2', title: 'サンプル動画2', category: 'Member→Assistant', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 'v3', title: 'サンプル動画3', category: 'Assistant→Chief', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 'v4', title: 'サンプル動画4', category: 'Chief→Core', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
    ];
    localStorage.setItem('wcp_learning_videos', JSON.stringify(defaults));
    return defaults;
}

function saveAdminLearningVideos(videos) {
    localStorage.setItem('wcp_learning_videos', JSON.stringify(videos));
}`;

const repAdmin2 = `function getAdminLearningVideos() {
    return adminData.videos || [];
}`;

const targetAdmin3 = `function adminSaveNewVideo() {
    const title = document.getElementById('add-video-title').value.trim();
    const category = document.getElementById('add-video-category').value;
    const url = document.getElementById('add-video-url').value.trim();
    
    if (!title || !url) {
        alert("タイトルとURLを入力してください。");
        return;
    }
    
    const videos = getAdminLearningVideos();
    const newVideo = {
        id: 'v' + Date.now(),
        title: title,
        category: category,
        url: url
    };
    
    videos.push(newVideo);
    saveAdminLearningVideos(videos);
    renderAdminVideos();
    closeAdminModal();
    alert("動画を追加しました。");
}`;

const repAdmin3 = `async function adminSaveNewVideo() {
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
}`;

const targetAdmin4 = `function adminDeleteVideo(id) {
    if (!confirm("本当にこの動画を削除しますか？")) return;
    let videos = getAdminLearningVideos();
    videos = videos.filter(v => v.id !== id);
    saveAdminLearningVideos(videos);
    renderAdminVideos();
}`;

const repAdmin4 = `async function adminDeleteVideo(id) {
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
}`;

adminContent = adminContent.replace(targetAdmin1.replace(/\r\n/g, '\n'), repAdmin1).replace(targetAdmin1.replace(/\n/g, '\r\n'), repAdmin1);
adminContent = adminContent.replace(targetAdmin2.replace(/\r\n/g, '\n'), repAdmin2).replace(targetAdmin2.replace(/\n/g, '\r\n'), repAdmin2);
adminContent = adminContent.replace(targetAdmin3.replace(/\r\n/g, '\n'), repAdmin3).replace(targetAdmin3.replace(/\n/g, '\r\n'), repAdmin3);
adminContent = adminContent.replace(targetAdmin4.replace(/\r\n/g, '\n'), repAdmin4).replace(targetAdmin4.replace(/\n/g, '\r\n'), repAdmin4);

fs.writeFileSync('admin.js', adminContent);

console.log('Update complete.');
