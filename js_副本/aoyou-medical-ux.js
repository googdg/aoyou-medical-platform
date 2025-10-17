/**
 * Aoyou Digital 医学科普学习平台 - 用户体验优化模块
 * 负责加载状态、错误处理、交互动画和用户引导
 */

class AoyouUXManager {
    constructor() {
        this.loadingStates = new Map();
        this.errorHandlers = new Map();
        this.animations = new Map();
        this.guideTour = null;
        this.feedbackSystem = null;
        
        this.init();
    }
    
    /**
     * 初始化用户体验管理器
     */
    init() {
        this.setupLoadingStates();
        this.setupErrorHandling();
        this.setupAnimations();
        this.setupUserGuide();
        this.setupFeedbackSystem();
        this.setupAccessibility();
        this.setupProgressIndicators();
    }
    
    /**
     * 设置加载状态管理
     */
    setupLoadingStates() {
        // 创建全局加载状态管理器
        this.createLoadingOverlay();
        this.createSkeletonLoaders();
        this.setupProgressBars();
    }
    
    /**
     * 创建加载遮罩层
     */
    createLoadingOverlay() {
        if (document.getElementById('global-loading')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'global-loading';
        overlay.className = 'loading-overlay hidden';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner-large"></div>
                <div class="loading-text">加载中...</div>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">0%</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    /**
     * 创建骨架屏加载器
     */
    createSkeletonLoaders() {
        const skeletonHTML = `
            <div class="skeleton-loader">
                <div class="skeleton-header">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-text">
                        <div class="skeleton-line skeleton-line-title"></div>
                        <div class="skeleton-line skeleton-line-subtitle"></div>
                    </div>
                </div>
                <div class="skeleton-content">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line skeleton-line-short"></div>
                </div>
            </div>
        `;
        
        // 为需要的容器添加骨架屏
        const containers = document.querySelectorAll('[data-skeleton]');
        containers.forEach(container => {
            container.innerHTML = skeletonHTML;
        });
    }
    
    /**
     * 设置进度条
     */
    setupProgressBars() {
        // 页面加载进度条
        this.createPageProgressBar();
        
        // 视频加载进度条
        this.setupVideoProgress();
    }
    
    /**
     * 创建页面进度条
     */
    createPageProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'page-progress';
        progressBar.className = 'page-progress-bar';
        progressBar.innerHTML = '<div class="page-progress-fill"></div>';
        document.body.appendChild(progressBar);
        
        // 监听页面加载进度
        this.trackPageLoadProgress();
    }
    
    /**
     * 跟踪页面加载进度
     */
    trackPageLoadProgress() {
        let progress = 0;
        const progressFill = document.querySelector('.page-progress-fill');
        
        const updateProgress = (value) => {
            progress = Math.min(value, 100);
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            
            if (progress >= 100) {
                setTimeout(() => {
                    document.getElementById('page-progress')?.classList.add('complete');
                }, 200);
            }
        };
        
        // 模拟加载进度
        const interval = setInterval(() => {
            if (document.readyState === 'loading') {
                updateProgress(progress + Math.random() * 30);
            } else if (document.readyState === 'interactive') {
                updateProgress(70 + Math.random() * 20);
            } else {
                updateProgress(100);
                clearInterval(interval);
            }
        }, 100);
    }
    
    /**
     * 设置视频进度
     */
    setupVideoProgress() {
        document.addEventListener('videoloadstart', () => {
            this.showVideoLoading();
        });
        
        document.addEventListener('videocanplay', () => {
            this.hideVideoLoading();
        });
    }
    
    /**
     * 显示视频加载
     */
    showVideoLoading() {
        const videoContainer = document.querySelector('.video-player-container');
        if (videoContainer) {
            const loader = document.createElement('div');
            loader.className = 'video-loading-overlay';
            loader.innerHTML = `
                <div class="video-loading-spinner"></div>
                <div class="video-loading-text">视频加载中...</div>
            `;
            videoContainer.appendChild(loader);
        }
    }
    
    /**
     * 隐藏视频加载
     */
    hideVideoLoading() {
        const loader = document.querySelector('.video-loading-overlay');
        if (loader) {
            loader.remove();
        }
    }
    
    /**
     * 设置错误处理
     */
    setupErrorHandling() {
        // 全局错误处理
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event.filename, event.lineno);
        });
        
        // Promise错误处理
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseError(event.reason);
        });
        
        // 网络错误处理
        this.setupNetworkErrorHandling();
        
        // 资源加载错误处理
        this.setupResourceErrorHandling();
    }
    
    /**
     * 处理全局错误
     */
    handleGlobalError(error, filename, lineno) {
        console.error('全局错误:', error, filename, lineno);
        
        this.showErrorNotification({
            title: '系统错误',
            message: '应用遇到了一个问题，我们正在努力修复',
            type: 'error',
            actions: [
                {
                    text: '刷新页面',
                    action: () => window.location.reload()
                },
                {
                    text: '反馈问题',
                    action: () => this.showFeedbackForm()
                }
            ]
        });
    }
    
    /**
     * 处理Promise错误
     */
    handlePromiseError(reason) {
        console.error('Promise错误:', reason);
        
        this.showErrorNotification({
            title: '操作失败',
            message: '请求处理失败，请稍后重试',
            type: 'warning'
        });
    }
    
    /**
     * 设置网络错误处理
     */
    setupNetworkErrorHandling() {
        // 监听网络状态变化
        window.addEventListener('online', () => {
            this.showSuccessNotification('网络已连接');
            this.hideOfflineIndicator();
        });
        
        window.addEventListener('offline', () => {
            this.showWarningNotification('网络连接已断开，部分功能可能无法使用');
            this.showOfflineIndicator();
        });
    }
    
    /**
     * 设置资源错误处理
     */
    setupResourceErrorHandling() {
        // 图片加载错误
        document.addEventListener('error', (event) => {
            if (event.target.tagName === 'IMG') {
                this.handleImageError(event.target);
            }
        }, true);
        
        // 视频加载错误
        document.addEventListener('error', (event) => {
            if (event.target.tagName === 'VIDEO') {
                this.handleVideoError(event.target);
            }
        }, true);
    }
    
    /**
     * 处理图片错误
     */
    handleImageError(img) {
        img.src = './images/default-image.jpg';
        img.alt = '图片加载失败';
        img.classList.add('image-error');
    }
    
    /**
     * 处理视频错误
     */
    handleVideoError(video) {
        const container = video.parentElement;
        if (container) {
            container.innerHTML = `
                <div class="video-error">
                    <div class="error-icon">📹</div>
                    <div class="error-message">视频加载失败</div>
                    <button class="retry-btn" onclick="location.reload()">重试</button>
                </div>
            `;
        }
    }
    
    /**
     * 显示离线指示器
     */
    showOfflineIndicator() {
        let indicator = document.getElementById('offline-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-indicator';
            indicator.innerHTML = `
                <span class="offline-icon">📡</span>
                <span class="offline-text">离线模式</span>
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.classList.add('show');
    }
    
    /**
     * 隐藏离线指示器
     */
    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }
    
    /**
     * 设置动画效果
     */
    setupAnimations() {
        // 页面切换动画
        this.setupPageTransitions();
        
        // 元素进入动画
        this.setupEntranceAnimations();
        
        // 交互动画
        this.setupInteractionAnimations();
    }
    
    /**
     * 设置页面切换动画
     */
    setupPageTransitions() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('active') && !target.classList.contains('animated')) {
                        this.animatePageEntry(target);
                    }
                }
            });
        });
        
        document.querySelectorAll('.page-section').forEach(section => {
            observer.observe(section, { attributes: true });
        });
    }
    
    /**
     * 页面进入动画
     */
    animatePageEntry(element) {
        element.classList.add('animated');
        element.style.animation = 'slideInRight 0.3s ease-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    }
    
    /**
     * 设置元素进入动画
     */
    setupEntranceAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElementEntry(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        }
    }
    
    /**
     * 元素进入动画
     */
    animateElementEntry(element) {
        const animationType = element.dataset.animation || 'fadeInUp';
        element.style.animation = `${animationType} 0.6s ease-out`;
        element.classList.add('animated');
    }
    
    /**
     * 设置交互动画
     */
    setupInteractionAnimations() {
        // 按钮点击动画
        document.addEventListener('click', (event) => {
            const button = event.target.closest('button, .btn');
            if (button) {
                this.animateButtonClick(button);
            }
        });
        
        // 卡片悬停动画
        document.querySelectorAll('.video-card, .category-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
    
    /**
     * 按钮点击动画
     */
    animateButtonClick(button) {
        button.classList.add('clicked');
        
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
    }
    
    /**
     * 设置用户引导
     */
    setupUserGuide() {
        // 检查是否是首次访问
        if (!localStorage.getItem('aoyou_tour_completed')) {
            setTimeout(() => {
                this.startGuideTour();
            }, 2000);
        }
        
        // 添加帮助按钮
        this.createHelpButton();
    }
    
    /**
     * 开始引导教程
     */
    startGuideTour() {
        const tourSteps = [
            {
                element: '.main-header',
                title: '欢迎来到奥友医学',
                content: '这里是您的医学学习平台，让我们开始探索吧！',
                position: 'bottom'
            },
            {
                element: '.category-grid',
                title: '医学分类',
                content: '选择您感兴趣的医学领域，开始学习之旅',
                position: 'top'
            },
            {
                element: '.bottom-nav',
                title: '导航菜单',
                content: '使用底部导航在不同功能间切换',
                position: 'top'
            },
            {
                element: '[data-page="profile"]',
                title: '个人中心',
                content: '查看您的学习进度、积分和等级',
                position: 'top'
            }
        ];
        
        this.showTourStep(tourSteps, 0);
    }
    
    /**
     * 显示引导步骤
     */
    showTourStep(steps, currentStep) {
        if (currentStep >= steps.length) {
            this.completeTour();
            return;
        }
        
        const step = steps[currentStep];
        const element = document.querySelector(step.element);
        
        if (!element) {
            this.showTourStep(steps, currentStep + 1);
            return;
        }
        
        const tooltip = this.createTourTooltip(step, currentStep, steps.length);
        this.positionTooltip(tooltip, element, step.position);
        
        // 高亮目标元素
        this.highlightElement(element);
        
        // 绑定下一步事件
        tooltip.querySelector('.tour-next').addEventListener('click', () => {
            this.removeTourTooltip();
            this.removeHighlight();
            this.showTourStep(steps, currentStep + 1);
        });
        
        // 绑定跳过事件
        tooltip.querySelector('.tour-skip').addEventListener('click', () => {
            this.completeTour();
        });
    }
    
    /**
     * 创建引导提示框
     */
    createTourTooltip(step, currentStep, totalSteps) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tour-tooltip';
        tooltip.innerHTML = `
            <div class="tour-content">
                <h4 class="tour-title">${step.title}</h4>
                <p class="tour-text">${step.content}</p>
                <div class="tour-progress">
                    <span class="tour-step">${currentStep + 1} / ${totalSteps}</span>
                    <div class="tour-progress-bar">
                        <div class="tour-progress-fill" style="width: ${((currentStep + 1) / totalSteps) * 100}%"></div>
                    </div>
                </div>
                <div class="tour-actions">
                    <button class="tour-skip">跳过</button>
                    <button class="tour-next">下一步</button>
                </div>
            </div>
            <div class="tour-arrow"></div>
        `;
        
        document.body.appendChild(tooltip);
        return tooltip;
    }
    
    /**
     * 定位提示框
     */
    positionTooltip(tooltip, element, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 10;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                tooltip.classList.add('position-top');
                break;
            case 'bottom':
                top = rect.bottom + 10;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                tooltip.classList.add('position-bottom');
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 10;
                tooltip.classList.add('position-left');
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 10;
                tooltip.classList.add('position-right');
                break;
        }
        
        tooltip.style.top = Math.max(10, top) + 'px';
        tooltip.style.left = Math.max(10, Math.min(window.innerWidth - tooltipRect.width - 10, left)) + 'px';
    }
    
    /**
     * 高亮元素
     */
    highlightElement(element) {
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        document.body.appendChild(overlay);
        
        element.classList.add('tour-highlight');
        element.style.zIndex = '10001';
    }
    
    /**
     * 移除高亮
     */
    removeHighlight() {
        const overlay = document.querySelector('.tour-overlay');
        if (overlay) overlay.remove();
        
        const highlighted = document.querySelector('.tour-highlight');
        if (highlighted) {
            highlighted.classList.remove('tour-highlight');
            highlighted.style.zIndex = '';
        }
    }
    
    /**
     * 移除引导提示框
     */
    removeTourTooltip() {
        const tooltip = document.querySelector('.tour-tooltip');
        if (tooltip) tooltip.remove();
    }
    
    /**
     * 完成引导教程
     */
    completeTour() {
        this.removeTourTooltip();
        this.removeHighlight();
        localStorage.setItem('aoyou_tour_completed', 'true');
        
        this.showSuccessNotification('引导教程完成！开始您的学习之旅吧！');
    }
    
    /**
     * 创建帮助按钮
     */
    createHelpButton() {
        const helpButton = document.createElement('button');
        helpButton.className = 'help-button';
        helpButton.innerHTML = '?';
        helpButton.title = '帮助';
        
        helpButton.addEventListener('click', () => {
            this.showHelpMenu();
        });
        
        document.body.appendChild(helpButton);
    }
    
    /**
     * 显示帮助菜单
     */
    showHelpMenu() {
        const menu = document.createElement('div');
        menu.className = 'help-menu';
        menu.innerHTML = `
            <div class="help-menu-content">
                <h4>需要帮助？</h4>
                <div class="help-options">
                    <button class="help-option" data-action="tour">重新开始引导</button>
                    <button class="help-option" data-action="faq">常见问题</button>
                    <button class="help-option" data-action="feedback">意见反馈</button>
                    <button class="help-option" data-action="contact">联系我们</button>
                </div>
                <button class="help-close">×</button>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // 绑定事件
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleHelpAction(action);
                menu.remove();
            }
            
            if (e.target.classList.contains('help-close')) {
                menu.remove();
            }
        });
    }
    
    /**
     * 处理帮助操作
     */
    handleHelpAction(action) {
        switch (action) {
            case 'tour':
                localStorage.removeItem('aoyou_tour_completed');
                this.startGuideTour();
                break;
            case 'faq':
                this.showFAQ();
                break;
            case 'feedback':
                this.showFeedbackForm();
                break;
            case 'contact':
                this.showContactInfo();
                break;
        }
    }
    
    /**
     * 设置反馈系统
     */
    setupFeedbackSystem() {
        // 创建反馈按钮
        this.createFeedbackButton();
        
        // 监听用户行为，适时显示反馈提示
        this.setupFeedbackTriggers();
    }
    
    /**
     * 创建反馈按钮
     */
    createFeedbackButton() {
        const feedbackButton = document.createElement('button');
        feedbackButton.className = 'feedback-button';
        feedbackButton.innerHTML = '💬';
        feedbackButton.title = '意见反馈';
        
        feedbackButton.addEventListener('click', () => {
            this.showFeedbackForm();
        });
        
        document.body.appendChild(feedbackButton);
    }
    
    /**
     * 显示反馈表单
     */
    showFeedbackForm() {
        const form = document.createElement('div');
        form.className = 'feedback-form-overlay';
        form.innerHTML = `
            <div class="feedback-form">
                <h4>意见反馈</h4>
                <div class="feedback-type">
                    <label>反馈类型：</label>
                    <select id="feedback-type">
                        <option value="bug">问题反馈</option>
                        <option value="suggestion">功能建议</option>
                        <option value="praise">表扬</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="feedback-content">
                    <label>详细描述：</label>
                    <textarea id="feedback-content" placeholder="请详细描述您的问题或建议..."></textarea>
                </div>
                <div class="feedback-contact">
                    <label>联系方式（可选）：</label>
                    <input type="text" id="feedback-contact" placeholder="邮箱或手机号">
                </div>
                <div class="feedback-actions">
                    <button class="feedback-cancel">取消</button>
                    <button class="feedback-submit">提交</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(form);
        
        // 绑定事件
        form.querySelector('.feedback-cancel').addEventListener('click', () => {
            form.remove();
        });
        
        form.querySelector('.feedback-submit').addEventListener('click', () => {
            this.submitFeedback(form);
        });
    }
    
    /**
     * 提交反馈
     */
    submitFeedback(form) {
        const type = form.querySelector('#feedback-type').value;
        const content = form.querySelector('#feedback-content').value;
        const contact = form.querySelector('#feedback-contact').value;
        
        if (!content.trim()) {
            this.showErrorNotification({
                title: '提交失败',
                message: '请填写反馈内容'
            });
            return;
        }
        
        // 这里可以发送反馈到服务器
        console.log('反馈提交:', { type, content, contact });
        
        form.remove();
        this.showSuccessNotification('反馈提交成功，感谢您的建议！');
    }
    
    /**
     * 设置无障碍访问
     */
    setupAccessibility() {
        // 键盘导航支持
        this.setupKeyboardNavigation();
        
        // 屏幕阅读器支持
        this.setupScreenReaderSupport();
        
        // 高对比度模式
        this.setupHighContrastMode();
    }
    
    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            // Tab键导航
            if (event.key === 'Tab') {
                this.handleTabNavigation(event);
            }
            
            // 回车键激活
            if (event.key === 'Enter') {
                this.handleEnterActivation(event);
            }
            
            // ESC键关闭
            if (event.key === 'Escape') {
                this.handleEscapeClose(event);
            }
        });
    }
    
    /**
     * 处理Tab导航
     */
    handleTabNavigation(event) {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
    
    /**
     * 处理回车激活
     */
    handleEnterActivation(event) {
        const target = event.target;
        if (target.tagName === 'BUTTON' || target.classList.contains('clickable')) {
            target.click();
        }
    }
    
    /**
     * 处理ESC关闭
     */
    handleEscapeClose(event) {
        const modals = document.querySelectorAll('.modal, .overlay, .popup');
        modals.forEach(modal => {
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });
    }
    
    /**
     * 设置屏幕阅读器支持
     */
    setupScreenReaderSupport() {
        // 为动态内容添加aria-live区域
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }
    
    /**
     * 通知屏幕阅读器
     */
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }
    
    /**
     * 设置进度指示器
     */
    setupProgressIndicators() {
        // 学习进度指示器
        this.createLearningProgress();
        
        // 任务完成指示器
        this.createTaskProgress();
    }
    
    /**
     * 创建学习进度
     */
    createLearningProgress() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'learning-progress';
        progressContainer.innerHTML = `
            <div class="progress-header">
                <span class="progress-title">学习进度</span>
                <span class="progress-percentage">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-details">
                <span>已完成 0 个视频</span>
            </div>
        `;
        
        // 添加到个人中心页面
        const profileSection = document.getElementById('profile-section');
        if (profileSection) {
            profileSection.appendChild(progressContainer);
        }
    }
    
    /**
     * 显示通知
     */
    showNotification(options) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${options.type || 'info'}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(options.type)}</div>
                <div class="notification-text">
                    <div class="notification-title">${options.title || ''}</div>
                    <div class="notification-message">${options.message}</div>
                </div>
                <button class="notification-close">×</button>
            </div>
            ${options.actions ? `
                <div class="notification-actions">
                    ${options.actions.map(action => 
                        `<button class="notification-action" data-action="${action.action}">${action.text}</button>`
                    ).join('')}
                </div>
            ` : ''}
        `;
        
        document.body.appendChild(notification);
        
        // 自动关闭
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, options.duration || 5000);
        
        // 绑定关闭事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // 绑定操作事件
        if (options.actions) {
            notification.querySelectorAll('.notification-action').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const actionName = e.target.dataset.action;
                    const action = options.actions.find(a => a.action === actionName);
                    if (action && action.action) {
                        action.action();
                    }
                    notification.remove();
                });
            });
        }
    }
    
    /**
     * 获取通知图标
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    /**
     * 显示成功通知
     */
    showSuccessNotification(message, title = '成功') {
        this.showNotification({ type: 'success', title, message });
    }
    
    /**
     * 显示错误通知
     */
    showErrorNotification(options) {
        if (typeof options === 'string') {
            options = { message: options };
        }
        this.showNotification({ ...options, type: 'error' });
    }
    
    /**
     * 显示警告通知
     */
    showWarningNotification(message, title = '警告') {
        this.showNotification({ type: 'warning', title, message });
    }
    
    /**
     * 显示信息通知
     */
    showInfoNotification(message, title = '提示') {
        this.showNotification({ type: 'info', title, message });
    }
}

// 页面加载完成后初始化用户体验管理器
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouUXManager = new AoyouUXManager();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouUXManager;
}