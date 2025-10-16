// 简化版主页内容同步脚本
console.log('Loading homepage content sync script...');

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, starting homepage content sync...');
    
    try {
        await loadHomepageContent();
        initializeHomepageSync();
        console.log('Homepage content sync initialized successfully');
    } catch (error) {
        console.error('Error initializing homepage content sync:', error);
    }
});

// 从API加载主页内容
async function loadHomepageContent() {
    console.log('Loading homepage content from API...');
    
    try {
        // 首先尝试从API加载最新内容
        const response = await fetch('/api/homepage');
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.content) {
                console.log('Loaded homepage content from API:', data.content);
                updateHomepageContent(data.content);
                return;
            }
        }
    } catch (error) {
        console.log('API not available, trying localStorage...', error);
    }
    
    // 如果API不可用，尝试从localStorage加载
    try {
        const savedContent = localStorage.getItem('homepage_content');
        if (savedContent) {
            const homepageData = JSON.parse(savedContent);
            console.log('Loading homepage content from localStorage:', homepageData);
            updateHomepageContent(homepageData);
        } else {
            console.log('No saved homepage content found, using default content');
        }
    } catch (error) {
        console.error('Error loading homepage content:', error);
    }
}

// 更新主页内容到DOM
function updateHomepageContent(content) {
    console.log('Updating homepage content in DOM...', content);
    
    // 更新网站标题和标语
    if (content['site-title']) {
        const titleElement = document.querySelector('.site-title');
        if (titleElement) {
            titleElement.textContent = content['site-title'];
            console.log('Updated site title:', content['site-title']);
        }
        // 更新页面标题
        document.title = content['site-title'] + ' - 个人博客';
    }
    
    if (content['site-tagline']) {
        const taglineElement = document.querySelector('.site-tagline');
        if (taglineElement) {
            taglineElement.textContent = content['site-tagline'];
            console.log('Updated site tagline:', content['site-tagline']);
        }
    }
    
    // 更新欢迎区域
    if (content['welcome-title']) {
        const welcomeTitleElement = document.querySelector('.welcome-title');
        if (welcomeTitleElement) {
            welcomeTitleElement.textContent = content['welcome-title'];
            console.log('Updated welcome title:', content['welcome-title']);
        }
    }
    
    if (content['welcome-subtitle']) {
        const welcomeSubtitleElement = document.querySelector('.welcome-subtitle');
        if (welcomeSubtitleElement) {
            welcomeSubtitleElement.textContent = content['welcome-subtitle'];
            console.log('Updated welcome subtitle:', content['welcome-subtitle']);
        }
    }
    
    if (content['navigation-guide']) {
        const navigationGuideElement = document.querySelector('.navigation-guide');
        if (navigationGuideElement) {
            navigationGuideElement.textContent = content['navigation-guide'];
            console.log('Updated navigation guide:', content['navigation-guide']);
        }
    }
    
    // 更新个人介绍
    if (content['intro1']) {
        const intro1Element = document.querySelector('.personal-intro p:first-child');
        if (intro1Element) {
            intro1Element.textContent = content['intro1'];
            console.log('Updated intro1:', content['intro1']);
        }
    }
    
    if (content['intro2']) {
        const intro2Element = document.querySelector('.personal-intro p:last-child');
        if (intro2Element) {
            intro2Element.textContent = content['intro2'];
            console.log('Updated intro2:', content['intro2']);
        }
    }
    
    // 更新专业经历
    if (content['current-role']) {
        const currentRoleElement = document.querySelector('.current-role');
        if (currentRoleElement) {
            currentRoleElement.textContent = content['current-role'];
            console.log('Updated current role:', content['current-role']);
        }
    }
    
    if (content['current-company']) {
        const currentCompanyElement = document.querySelector('.current-company');
        if (currentCompanyElement) {
            currentCompanyElement.textContent = content['current-company'];
            console.log('Updated current company:', content['current-company']);
        }
    }
    
    if (content['current-desc']) {
        const currentDescElement = document.querySelector('.current-desc');
        if (currentDescElement) {
            currentDescElement.textContent = content['current-desc'];
            console.log('Updated current desc:', content['current-desc']);
        }
    }
    
    if (content['previous-role']) {
        const previousRoleElement = document.querySelector('.previous-role');
        if (previousRoleElement) {
            previousRoleElement.textContent = content['previous-role'];
            console.log('Updated previous role:', content['previous-role']);
        }
    }
    
    if (content['previous-company']) {
        const previousCompanyElement = document.querySelector('.previous-company');
        if (previousCompanyElement) {
            previousCompanyElement.textContent = content['previous-company'];
            console.log('Updated previous company:', content['previous-company']);
        }
    }
    
    if (content['previous-desc']) {
        const previousDescElement = document.querySelector('.previous-desc');
        if (previousDescElement) {
            previousDescElement.textContent = content['previous-desc'];
            console.log('Updated previous desc:', content['previous-desc']);
        }
    }
    
    console.log('Homepage content updated successfully!');
}

// 初始化主页内容同步
function initializeHomepageSync() {
    console.log('Initializing homepage content sync...');
    
    // 监听来自管理后台的消息
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'homepage-update') {
            console.log('Received homepage update from admin:', event.data.content);
            updateHomepageContent(event.data.content);
            
            // 同时保存到localStorage作为备份
            localStorage.setItem('homepage_content', JSON.stringify(event.data.content));
        }
    });
    
    // 定期检查API更新（可选）
    setInterval(async () => {
        try {
            const response = await fetch('/api/homepage');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.content) {
                    // 检查内容是否有变化
                    const currentContent = localStorage.getItem('homepage_content');
                    const newContentStr = JSON.stringify(data.content);
                    
                    if (currentContent !== newContentStr) {
                        console.log('Homepage content updated from API');
                        updateHomepageContent(data.content);
                        localStorage.setItem('homepage_content', newContentStr);
                    }
                }
            }
        } catch (error) {
            // 静默处理错误，避免控制台噪音
        }
    }, 30000); // 每30秒检查一次
    
    console.log('Homepage content sync initialized');
}

// 手动刷新内容的函数（用于调试）
window.refreshHomepageContent = async function() {
    console.log('Manually refreshing homepage content...');
    await loadHomepageContent();
};

console.log('Homepage content sync script loaded successfully');