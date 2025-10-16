/**
 * Aoyou Digital - 主应用逻辑
 * 移动端 H5 应用核心功能
 */

class AoyouDigitalApp {
    constructor() {
        this.currentPage = 'home';
        this.isMenuOpen = false;
        this.isLoading = true;
        
        // 初始化应用
        this.init();
    }
    
    // 初始化应用
    async init() {
        console.log('🚀 Aoyou Digital 应用启动中...');
        
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }
    
    // DOM 准备就绪
    async onDOMReady() {
        try {
            // 初始化各个模块
            this.initElements();
            this.initEventListeners();
            this.initMobileOptimizations();
            
            // 模拟加载过程
            await this.simulateLoading();
            
            // 隐藏加载屏幕
            this.hideLoadingScreen();
            
            // 应用启动完成
            this.onAppReady();
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showToast('应用启动失败，请刷新页面重试');
        }
    }
    
    // 初始化 DOM 元素引用
    initElements() {
        // 加载相关
        this.loadingScreen = AoyouUtils.dom.$('#loading');
        this.progressBar = AoyouUtils.dom.$('.progress-bar');
        
        // 菜单相关
        this.menuToggle = AoyouUtils.dom.$('#menuToggle');
        this.sideMenu = AoyouUtils.dom.$('#sideMenu');
        this.menuOverlay = AoyouUtils.dom.$('#menuOverlay');
        this.menuClose = AoyouUtils.dom.$('#menuClose');
        this.menuItems = AoyouUtils.dom.$$('.menu-item');
        
        // 页面相关
        this.pageSection = AoyouUtils.dom.$$('.page-section');
        this.navItems = AoyouUtils.dom.$$('.nav-item');
        
        // 表单相关
        this.contactForm = AoyouUtils.dom.$('#contactForm');
        
        // 其他元素
        this.toast = AoyouUtils.dom.$('#toast');
        this.getStartedBtn = AoyouUtils.dom.$('#getStarted');
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 菜单切换
        if (this.menuToggle) {
            AoyouUtils.event.on(this.menuToggle, 'click', () => this.toggleMenu());
        }
        
        // 菜单关闭
        if (this.menuClose) {
            AoyouUtils.event.on(this.menuClose, 'click', () => this.closeMenu());
        }
        
        if (this.menuOverlay) {
            AoyouUtils.event.on(this.menuOverlay, 'click', () => this.closeMenu());
        }
        
        // 菜单项点击
        this.menuItems.forEach(item => {
            AoyouUtils.event.on(item, 'click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('href').substring(1);
                this.navigateToPage(page);
                this.closeMenu();
            });
        });
        
        // 底部导航
        this.navItems.forEach(item => {
            AoyouUtils.event.on(item, 'click', () => {
                const page = item.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });
        
        // 开始使用按钮
        if (this.getStartedBtn) {
            AoyouUtils.event.on(this.getStartedBtn, 'click', () => {
                this.navigateToPage('features');
                this.showToast('欢迎使用 Aoyou Digital！');
            });
        }
        
        // 联系表单
        if (this.contactForm) {
            AoyouUtils.event.on(this.contactForm, 'submit', (e) => this.handleContactForm(e));
        }
        
        // 窗口大小变化
        AoyouUtils.event.on(window, 'resize', 
            AoyouUtils.event.debounce(() => this.handleResize(), 250)
        );
        
        // 页面可见性变化
        AoyouUtils.event.on(document, 'visibilitychange', () => this.handleVisibilityChange());
        
        // 返回按钮处理
        AoyouUtils.event.on(window, 'popstate', (e) => this.handlePopState(e));
    }
    
    // 初始化移动端优化
    initMobileOptimizations() {
        // 禁用双击缩放
        let lastTouchEnd = 0;
        AoyouUtils.event.on(document, 'touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        });
        
        // 禁用长按菜单
        AoyouUtils.event.on(document, 'contextmenu', (e) => {
            if (AoyouUtils.device.isMobile()) {
                e.preventDefault();
            }
        });
        
        // 优化滚动性能
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // 设置视口高度 CSS 变量
        this.updateViewportHeight();
        
        // 检测设备方向变化
        AoyouUtils.event.on(window, 'orientationchange', () => {
            setTimeout(() => this.updateViewportHeight(), 100);
        });
        
        console.log('📱 移动端优化已启用');
    }
    
    // 更新视口高度
    updateViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // 模拟加载过程
    async simulateLoading() {
        const steps = [
            { text: '初始化应用...', progress: 20 },
            { text: '加载资源...', progress: 50 },
            { text: '准备界面...', progress: 80 },
            { text: '启动完成...', progress: 100 }
        ];
        
        for (const step of steps) {
            await this.updateLoadingProgress(step.text, step.progress);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    // 更新加载进度
    async updateLoadingProgress(text, progress) {
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        
        const loadingText = AoyouUtils.dom.$('.loading-text');
        if (loadingText && text) {
            loadingText.textContent = text;
        }
    }
    
    // 隐藏加载屏幕
    hideLoadingScreen() {
        if (this.loadingScreen) {
            AoyouUtils.dom.addClass(this.loadingScreen, 'hidden');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                this.isLoading = false;
            }, 500);
        }
    }
    
    // 应用准备就绪
    onAppReady() {
        console.log('✅ Aoyou Digital 应用启动完成');
        
        // 记录启动时间
        const startupTime = performance.now();
        console.log(`⚡ 启动耗时: ${Math.round(startupTime)}ms`);
        
        // 保存应用状态
        AoyouUtils.storage.set('aoyou_last_visit', new Date().toISOString());
        
        // 检查是否为首次访问
        const isFirstVisit = !AoyouUtils.storage.get('aoyou_visited');
        if (isFirstVisit) {
            AoyouUtils.storage.set('aoyou_visited', true);
            setTimeout(() => {
                this.showToast('欢迎首次使用 Aoyou Digital！');
            }, 1000);
        }
        
        // 触发应用就绪事件
        AoyouUtils.event.trigger(document, 'aoyou:ready', {
            startupTime: startupTime,
            isFirstVisit: isFirstVisit
        });
    }
    
    // 切换菜单
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        if (this.isMenuOpen) {
            this.openMenu();
        } else {
            this.closeMenu();
        }
    }
    
    // 打开菜单
    openMenu() {
        this.isMenuOpen = true;
        AoyouUtils.dom.addClass(this.sideMenu, 'active');
        AoyouUtils.dom.addClass(this.menuToggle, 'active');
        
        // 禁用背景滚动
        document.body.style.overflow = 'hidden';
        
        console.log('📱 侧边菜单已打开');
    }
    
    // 关闭菜单
    closeMenu() {
        this.isMenuOpen = false;
        AoyouUtils.dom.removeClass(this.sideMenu, 'active');
        AoyouUtils.dom.removeClass(this.menuToggle, 'active');
        
        // 恢复背景滚动
        document.body.style.overflow = '';
        
        console.log('📱 侧边菜单已关闭');
    }
    
    // 页面导航
    navigateToPage(page) {
        if (page === this.currentPage) return;
        
        console.log(`🔄 导航到页面: ${page}`);
        
        // 隐藏当前页面
        this.pageSection.forEach(section => {
            AoyouUtils.dom.removeClass(section, 'active');
        });
        
        // 显示目标页面
        const targetSection = AoyouUtils.dom.$(`#${page}`);
        if (targetSection) {
            AoyouUtils.dom.addClass(targetSection, 'active');
        }
        
        // 更新导航状态
        this.updateNavigationState(page);
        
        // 更新当前页面
        this.currentPage = page;
        
        // 更新 URL（不刷新页面）
        history.pushState({ page: page }, '', `#${page}`);
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // 触发页面变更事件
        AoyouUtils.event.trigger(document, 'aoyou:pagechange', {
            from: this.currentPage,
            to: page
        });
    }
    
    // 更新导航状态
    updateNavigationState(page) {
        // 更新底部导航
        this.navItems.forEach(item => {
            const itemPage = item.getAttribute('data-page');
            if (itemPage === page) {
                AoyouUtils.dom.addClass(item, 'active');
            } else {
                AoyouUtils.dom.removeClass(item, 'active');
            }
        });
        
        // 更新侧边菜单
        this.menuItems.forEach(item => {
            const itemPage = item.getAttribute('href').substring(1);
            if (itemPage === page) {
                AoyouUtils.dom.addClass(item, 'active');
            } else {
                AoyouUtils.dom.removeClass(item, 'active');
            }
        });
    }
    
    // 处理联系表单
    async handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(this.contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
        
        // 验证表单数据
        if (!data.name || !data.email || !data.message) {
            this.showToast('请填写所有必填字段');
            return;
        }
        
        if (!AoyouUtils.validate.email(data.email)) {
            this.showToast('请输入有效的邮箱地址');
            return;
        }
        
        try {
            // 显示提交中状态
            const submitBtn = this.contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '发送中...';
            submitBtn.disabled = true;
            
            // 模拟提交过程
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 这里可以添加实际的表单提交逻辑
            console.log('📧 表单数据:', data);
            
            // 显示成功消息
            this.showToast('消息发送成功！我们会尽快回复您。');
            
            // 重置表单
            this.contactForm.reset();
            
            // 恢复按钮状态
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
        } catch (error) {
            console.error('❌ 表单提交失败:', error);
            this.showToast('发送失败，请稍后重试');
            
            // 恢复按钮状态
            const submitBtn = this.contactForm.querySelector('button[type="submit"]');
            submitBtn.textContent = '发送消息';
            submitBtn.disabled = false;
        }
    }
    
    // 显示 Toast 通知
    showToast(message, duration = 3000) {
        if (!this.toast) return;
        
        this.toast.textContent = message;
        AoyouUtils.dom.addClass(this.toast, 'show');
        
        setTimeout(() => {
            AoyouUtils.dom.removeClass(this.toast, 'show');
        }, duration);
        
        console.log(`💬 Toast: ${message}`);
    }
    
    // 处理窗口大小变化
    handleResize() {
        this.updateViewportHeight();
        
        // 如果菜单在小屏幕上打开，关闭它
        if (this.isMenuOpen && window.innerWidth > 768) {
            this.closeMenu();
        }
        
        console.log('📐 窗口大小已变化:', AoyouUtils.device.getScreenSize());
    }
    
    // 处理页面可见性变化
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('👁️ 页面已隐藏');
        } else {
            console.log('👁️ 页面已显示');
        }
    }
    
    // 处理浏览器返回按钮
    handlePopState(e) {
        const state = e.state;
        if (state && state.page) {
            this.navigateToPage(state.page);
        } else {
            // 默认返回首页
            this.navigateToPage('home');
        }
    }
    
    // 获取应用状态
    getAppState() {
        return {
            currentPage: this.currentPage,
            isMenuOpen: this.isMenuOpen,
            isLoading: this.isLoading,
            deviceInfo: {
                isMobile: AoyouUtils.device.isMobile(),
                isIOS: AoyouUtils.device.isIOS(),
                isAndroid: AoyouUtils.device.isAndroid(),
                isWeChat: AoyouUtils.device.isWeChat(),
                screenSize: AoyouUtils.device.getScreenSize()
            }
        };
    }
}

// 应用实例
let app;

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    app = new AoyouDigitalApp();
});

// 全局导出
window.AoyouDigitalApp = AoyouDigitalApp;