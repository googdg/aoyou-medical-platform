// 修复版管理后台JavaScript
console.log('Admin script loaded');

class AdminApp {
    constructor() {
        console.log('AdminApp constructor called');
        this.token = localStorage.getItem('admin_token');
        this.currentUser = null;
        this.currentPage = 'dashboard';
        
        // 延迟初始化，确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
            });
        } else {
            this.init();
        }
    }
    
    init() {
        console.log('AdminApp init called');
        this.bindEvents();
        
        if (this.token && this.token.startsWith('demo_token_')) {
            this.verifyToken();
        } else {
            this.showLogin();
        }
    }
    
    bindEvents() {
        console.log('Binding events');
        
        // 登录表单
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            console.log('Login form found');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                this.login();
            });
        } else {
            console.error('Login form not found');
        }
        
        // 退出登录
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // 侧边栏导航
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                console.log('Menu item clicked:', page);
                this.navigateTo(page);
            });
        });
        
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Tab button clicked:', e.target.dataset.tab);
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // 语言切换
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.id.split('-')[1];
                console.log('Language button clicked:', lang);
                this.switchLanguage(lang);
            });
        });
    }
    
    async login() {
        console.log('Login function called');
        
        const usernameEl = document.getElementById('username');
        const passwordEl = document.getElementById('password');
        
        if (!usernameEl || !passwordEl) {
            console.error('Username or password input not found');
            this.showError('login-error', '页面元素未找到，请刷新页面重试');
            return;
        }
        
        const username = usernameEl.value.trim();
        const password = passwordEl.value.trim();
        
        console.log('Attempting login with username:', username);
        
        try {
            // 清除之前的错误信息
            this.hideError('login-error');
            
            // 模拟登录验证
            if (username === 'admin' && password === 'admin123') {
                console.log('Login credentials valid');
                
                this.token = 'demo_token_' + Date.now();
                this.currentUser = { username: 'admin', id: 1 };
                localStorage.setItem('admin_token', this.token);
                
                // 显示成功消息
                this.showSuccess('login-success', '登录成功！');
                
                // 延迟跳转到主界面
                setTimeout(() => {
                    this.showMainApp();
                }, 1000);
                
            } else {
                console.log('Invalid credentials');
                this.showError('login-error', '用户名或密码错误');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError('login-error', '登录失败：' + error.message);
        }
    }
    
    verifyToken() {
        console.log('Verifying token');
        try {
            if (this.token && this.token.startsWith('demo_token_')) {
                this.currentUser = { username: 'admin', id: 1 };
                this.showMainApp();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            this.logout();
        }
    }
    
    logout() {
        console.log('Logging out');
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('admin_token');
        this.showLogin();
    }
    
    showLogin() {
        console.log('Showing login page');
        const loginPage = document.getElementById('login-page');
        const mainApp = document.getElementById('main-app');
        
        if (loginPage) {
            loginPage.style.display = 'flex';
        }
        if (mainApp) {
            mainApp.style.display = 'none';
        }
    }
    
    showMainApp() {
        console.log('Showing main app');
        const loginPage = document.getElementById('login-page');
        const mainApp = document.getElementById('main-app');
        
        if (loginPage) {
            loginPage.style.display = 'none';
        }
        if (mainApp) {
            mainApp.style.display = 'flex';
        }
        
        // 更新用户信息
        const currentUserEl = document.getElementById('current-user');
        if (currentUserEl && this.currentUser) {
            currentUserEl.textContent = this.currentUser.username;
        }
        
        // 绑定菜单事件（在主应用显示后）
        this.bindMenuEvents();
        
        // 默认显示仪表板
        this.navigateTo('dashboard');
    }
    
    bindMenuEvents() {
        // 重新绑定菜单事件，确保在主应用显示后绑定
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                console.log('Menu item clicked:', page);
                this.navigateTo(page);
            });
        });
        
        // 重新绑定标签页事件
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Tab button clicked:', e.target.dataset.tab);
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // 重新绑定语言切换事件
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.id.split('-')[1];
                console.log('Language button clicked:', lang);
                this.switchLanguage(lang);
            });
        });
    }
    
    // 页面导航
    navigateTo(page) {
        console.log('Navigating to:', page);
        
        // 更新菜单状态
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeMenuItem = document.querySelector(`[data-page="${page}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        // 显示对应页面
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        this.currentPage = page;
        
        // 加载页面数据
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'homepage':
                this.loadHomepage();
                break;
            case 'posts':
                this.loadPosts();
                break;
            case 'media':
                this.loadMedia();
                break;
            case 'categories':
                this.loadCategories();
                break;
        }
    }
    
    // 加载仪表板
    loadDashboard() {
        console.log('Loading dashboard');
        // 简单的仪表板数据
        document.getElementById('total-posts').textContent = '0';
        document.getElementById('published-posts').textContent = '0';
        document.getElementById('total-media').textContent = '0';
        
        const recentPostsList = document.getElementById('recent-posts-list');
        if (recentPostsList) {
            recentPostsList.innerHTML = '<div class="no-posts">暂无文章</div>';
        }
    }
    
    // 加载主页内容
    loadHomepage() {
        console.log('Loading homepage');
        
        // 从localStorage加载保存的主页内容
        const savedHomepage = localStorage.getItem('homepage_content');
        if (savedHomepage) {
            try {
                const homepageData = JSON.parse(savedHomepage);
                this.fillHomepageForm(homepageData);
                console.log('Homepage content loaded from localStorage');
            } catch (error) {
                console.error('Error loading homepage content:', error);
            }
        } else {
            console.log('No saved homepage content found, using default values');
        }
        
        // 绑定保存按钮事件
        this.bindHomepageEvents();
    }
    
    // 填充主页表单
    fillHomepageForm(data) {
        // 基本信息
        if (data['site-title']) document.getElementById('site-title').value = data['site-title'];
        if (data['site-tagline']) document.getElementById('site-tagline').value = data['site-tagline'];
        if (data['site-description']) document.getElementById('site-description').value = data['site-description'];
        
        // 欢迎区域
        if (data['welcome-title']) document.getElementById('welcome-title').value = data['welcome-title'];
        if (data['welcome-subtitle']) document.getElementById('welcome-subtitle').value = data['welcome-subtitle'];
        if (data['navigation-guide']) document.getElementById('navigation-guide').value = data['navigation-guide'];
        
        // 个人介绍
        if (data['intro1']) document.getElementById('intro-text1').value = data['intro1'];
        if (data['intro2']) document.getElementById('intro-text2').value = data['intro2'];
        
        // 关于我
        if (data['about-title']) document.getElementById('about-title').value = data['about-title'];
        if (data['about-content']) document.getElementById('about-content').value = data['about-content'];
        
        // 技能和经验
        if (data['skills-title']) document.getElementById('skills-title').value = data['skills-title'];
        if (data['experience-title']) document.getElementById('experience-title').value = data['experience-title'];
        
        // 联系方式
        if (data['contact-title']) document.getElementById('contact-title').value = data['contact-title'];
        if (data['contact-content']) document.getElementById('contact-content').value = data['contact-content'];
        if (data.introText2) document.getElementById('intro-text2').value = data.introText2;
        
        // 专业经历
        if (data.currentRole) document.getElementById('current-role').value = data.currentRole;
        if (data.currentCompany) document.getElementById('current-company').value = data.currentCompany;
        if (data.currentDesc) document.getElementById('current-desc').value = data.currentDesc;
        if (data.previousRole) document.getElementById('previous-role').value = data.previousRole;
        if (data.previousCompany) document.getElementById('previous-company').value = data.previousCompany;
        if (data.previousDesc) document.getElementById('previous-desc').value = data.previousDesc;
        
        // 社区活动
        if (data.communityTitle) document.getElementById('community-title').value = data.communityTitle;
        if (data.communityDesc) document.getElementById('community-desc').value = data.communityDesc;
        if (data.techCommunityTitle) document.getElementById('tech-community-title').value = data.techCommunityTitle;
        if (data.techCommunityDesc) document.getElementById('tech-community-desc').value = data.techCommunityDesc;
        if (data.techCommunityTags) document.getElementById('tech-community-tags').value = data.techCommunityTags;
        if (data.personalInterestsTitle) document.getElementById('personal-interests-title').value = data.personalInterestsTitle;
        if (data.personalInterestsDesc) document.getElementById('personal-interests-desc').value = data.personalInterestsDesc;
        if (data.personalInterestsTags) document.getElementById('personal-interests-tags').value = data.personalInterestsTags;
    }
    
    // 绑定主页相关事件
    bindHomepageEvents() {
        // 保存按钮
        const saveBtn = document.getElementById('save-homepage-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveHomepage();
            });
        }
        
        // 自动保存功能 - 监听表单字段变化
        const homepageFields = [
            'site-title', 'site-tagline', 'site-description',
            'welcome-title', 'welcome-subtitle', 'intro-text1', 'intro-text2',
            'current-role', 'current-company', 'current-desc',
            'previous-role', 'previous-company', 'previous-desc',
            'community-title', 'community-desc',
            'tech-community-title', 'tech-community-desc', 'tech-community-tags',
            'personal-interests-title', 'personal-interests-desc', 'personal-interests-tags'
        ];
        
        homepageFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    clearTimeout(this.autoSaveTimeout);
                    this.autoSaveTimeout = setTimeout(() => {
                        this.autoSaveHomepage();
                    }, 2000); // 2秒后自动保存
                });
            }
        });
    }
    
    // 保存主页内容
    saveHomepage() {
        try {
            const homepageData = this.getHomepageFormData();
            localStorage.setItem('homepage_content', JSON.stringify(homepageData));
            this.showNotification('主页内容保存成功！', 'success');
            console.log('Homepage content saved:', homepageData);
        } catch (error) {
            console.error('Error saving homepage content:', error);
            this.showNotification('保存失败：' + error.message, 'error');
        }
    }
    
    // 自动保存主页内容
    autoSaveHomepage() {
        try {
            const homepageData = this.getHomepageFormData();
            localStorage.setItem('homepage_content', JSON.stringify(homepageData));
            console.log('Homepage content auto-saved');
            
            // 显示自动保存提示
            this.showNotification('内容已自动保存', 'info', 1000);
        } catch (error) {
            console.error('Error auto-saving homepage content:', error);
        }
    }
    
    // 获取主页表单数据
    getHomepageFormData() {
        return {
            'site-title': document.getElementById('site-title')?.value || '',
            'site-tagline': document.getElementById('site-tagline')?.value || '',
            'site-description': document.getElementById('site-description')?.value || '',
            'welcome-title': document.getElementById('welcome-title')?.value || '',
            'welcome-subtitle': document.getElementById('welcome-subtitle')?.value || '',
            'navigation-guide': document.getElementById('navigation-guide')?.value || '',
            'intro1': document.getElementById('intro-text1')?.value || '',
            'intro2': document.getElementById('intro-text2')?.value || '',
            'about-title': document.getElementById('about-title')?.value || '',
            'about-content': document.getElementById('about-content')?.value || '',
            'skills-title': document.getElementById('skills-title')?.value || '',
            'experience-title': document.getElementById('experience-title')?.value || '',
            'contact-title': document.getElementById('contact-title')?.value || '',
            'contact-content': document.getElementById('contact-content')?.value || '',
            'current-role': document.getElementById('current-role')?.value || '',
            'current-company': document.getElementById('current-company')?.value || '',
            'current-desc': document.getElementById('current-desc')?.value || '',
            'previous-role': document.getElementById('previous-role')?.value || '',
            'previous-company': document.getElementById('previous-company')?.value || '',
            'previous-desc': document.getElementById('previous-desc')?.value || '',
            'community-title': document.getElementById('community-title')?.value || '',
            'community-desc': document.getElementById('community-desc')?.value || '',
            'tech-community-title': document.getElementById('tech-community-title')?.value || '',
            'tech-community-desc': document.getElementById('tech-community-desc')?.value || '',
            'tech-community-tags': document.getElementById('tech-community-tags')?.value || '',
            'personal-interests-title': document.getElementById('personal-interests-title')?.value || '',
            'personal-interests-desc': document.getElementById('personal-interests-desc')?.value || '',
            'personal-interests-tags': document.getElementById('personal-interests-tags')?.value || '',
            'last-saved': new Date().toISOString()
        };
    }
    
    // 加载文章列表
    loadPosts() {
        console.log('Loading posts');
        // 文章管理功能
    }
    
    // 加载媒体库
    loadMedia() {
        console.log('Loading media');
        // 媒体库功能
    }
    
    // 加载分类
    loadCategories() {
        console.log('Loading categories');
        // 分类管理功能
    }
    
    // 标签页切换
    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // 移除所有活动状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // 激活选中的标签页
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);
        
        if (activeBtn) {
            activeBtn.classList.add('active');
        } else {
            console.error('Tab button not found:', tabName);
        }
        
        if (activeContent) {
            activeContent.classList.add('active');
        } else {
            console.error('Tab content not found:', tabName + '-tab');
        }
    }
    
    // 语言切换
    switchLanguage(lang) {
        console.log('Switching language to:', lang);
        
        // 更新按钮状态
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`lang-${lang}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // 保存语言设置
        localStorage.setItem('admin_language', lang);
        
        // 显示切换成功提示
        const langName = lang === 'zh' ? '中文' : 'English';
        this.showNotification(`语言已切换为${langName}`, 'success', 2000);
        
        // 这里可以添加实际的语言切换逻辑
        // 比如加载不同的语言包，更新界面文本等
        if (lang === 'en') {
            this.applyEnglishTranslation();
        } else {
            this.applyChineseTranslation();
        }
    }
    
    // 应用英文翻译
    applyEnglishTranslation() {
        // 这里可以添加英文界面的翻译逻辑
        console.log('Applying English translation...');
        // 暂时只是一个占位符，可以后续扩展
    }
    
    // 应用中文翻译
    applyChineseTranslation() {
        // 这里可以添加中文界面的翻译逻辑
        console.log('Applying Chinese translation...');
        // 暂时只是一个占位符，可以后续扩展
    }
    
    showError(elementId, message) {
        console.log('Showing error:', message);
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.style.color = 'red';
        } else {
            alert('错误: ' + message);
        }
    }
    
    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    showSuccess(elementId, message) {
        console.log('Showing success:', message);
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            successElement.style.color = 'green';
        } else {
            // 创建成功消息元素
            const loginError = document.getElementById('login-error');
            if (loginError) {
                loginError.textContent = message;
                loginError.style.display = 'block';
                loginError.style.color = 'green';
            } else {
                alert(message);
            }
        }
    }
    
    // 显示通知
    showNotification(message, type = 'success', duration = 3000) {
        console.log('Showing notification:', message, type);
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, duration);
        } else {
            // 如果没有通知元素，使用alert作为后备
            alert(message);
        }
    }
}

// 确保在DOM加载完成后初始化
console.log('Setting up DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, creating AdminApp instance');
    window.adminApp = new AdminApp();
});

// 如果DOM已经加载完成，立即初始化
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, creating AdminApp instance');
    window.adminApp = new AdminApp();
}