// Accessibility Enhancement Module
// 实现键盘导航支持、ARIA标签和语义化标记、屏幕阅读器兼容

class AccessibilityEnhancer {
    constructor() {
        this.focusableElements = [];
        this.skipLinks = [];
        this.announcements = [];
        this.currentFocusIndex = -1;
        this.isHighContrastMode = false;
        this.isReducedMotionMode = false;
        this.screenReaderAnnouncer = null;
        
        this.init();
    }

    init() {
        this.detectUserPreferences();
        this.createScreenReaderAnnouncer();
        this.createSkipLinks();
        this.enhanceKeyboardNavigation();
        this.addAriaLabels();
        this.improveSemanticStructure();
        this.setupFocusManagement();
        this.addAccessibilityControls();
        this.bindEvents();
        
        console.log('Accessibility enhancements initialized');
    }

    // 检测用户偏好
    detectUserPreferences() {
        // 检测高对比度模式
        this.isHighContrastMode = window.matchMedia('(prefers-contrast: high)').matches;
        
        // 检测减少动画偏好
        this.isReducedMotionMode = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // 应用相应的类
        if (this.isHighContrastMode) {
            document.body.classList.add('high-contrast');
        }
        
        if (this.isReducedMotionMode) {
            document.body.classList.add('reduced-motion');
        }
    }

    // 创建屏幕阅读器公告器
    createScreenReaderAnnouncer() {
        this.screenReaderAnnouncer = document.createElement('div');
        this.screenReaderAnnouncer.id = 'screen-reader-announcer';
        this.screenReaderAnnouncer.setAttribute('aria-live', 'polite');
        this.screenReaderAnnouncer.setAttribute('aria-atomic', 'true');
        this.screenReaderAnnouncer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(this.screenReaderAnnouncer);
    }

    // 创建跳转链接
    createSkipLinks() {
        const skipLinksContainer = document.createElement('div');
        skipLinksContainer.className = 'skip-links';
        skipLinksContainer.innerHTML = `
            <a href="#main" class="skip-link">Skip to main content</a>
            <a href="#nav-menu" class="skip-link">Skip to navigation</a>
            <a href="#blog" class="skip-link">Skip to blog posts</a>
            <a href="#search-trigger" class="skip-link">Skip to search</a>
        `;
        
        document.body.insertBefore(skipLinksContainer, document.body.firstChild);
        
        // 绑定跳转链接事件
        skipLinksContainer.querySelectorAll('.skip-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.focus();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    this.announceToScreenReader(`Jumped to ${targetElement.textContent || targetId}`);
                }
            });
        });
    }

    // 增强键盘导航
    enhanceKeyboardNavigation() {
        // 确保所有交互元素都可以通过键盘访问
        const interactiveElements = document.querySelectorAll(`
            a, button, input, select, textarea, 
            [tabindex], [role="button"], [role="link"], 
            .nav-item, .blog-post-card, .search-result-item
        `);

        interactiveElements.forEach(element => {
            // 确保有tabindex
            if (!element.hasAttribute('tabindex') && !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
                element.setAttribute('tabindex', '0');
            }

            // 添加键盘事件支持
            if (!element.hasAttribute('data-keyboard-enhanced')) {
                this.addKeyboardSupport(element);
                element.setAttribute('data-keyboard-enhanced', 'true');
            }
        });

        // 添加焦点陷阱支持（用于模态框）
        this.setupFocusTraps();
    }

    // 为元素添加键盘支持
    addKeyboardSupport(element) {
        element.addEventListener('keydown', (e) => {
            // Enter 和 Space 键激活
            if ((e.key === 'Enter' || e.key === ' ') && 
                element.getAttribute('role') === 'button' ||
                element.classList.contains('nav-item') ||
                element.classList.contains('blog-post-card')) {
                
                e.preventDefault();
                element.click();
            }

            // 方向键导航
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowKeyNavigation(e, element);
            }

            // Home/End 键导航
            if (e.key === 'Home' || e.key === 'End') {
                this.handleHomeEndNavigation(e, element);
            }
        });

        // 添加焦点样式
        element.addEventListener('focus', () => {
            element.classList.add('keyboard-focused');
        });

        element.addEventListener('blur', () => {
            element.classList.remove('keyboard-focused');
        });
    }

    // 处理方向键导航
    handleArrowKeyNavigation(e, currentElement) {
        const container = currentElement.closest('.main-navigation, .blog-posts-grid, .results-list');
        if (!container) return;

        const focusableElements = Array.from(container.querySelectorAll('[tabindex="0"], a, button'));
        const currentIndex = focusableElements.indexOf(currentElement);
        
        let nextIndex = currentIndex;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                break;
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowLeft':
                if (container.classList.contains('main-navigation')) {
                    e.preventDefault();
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                }
                break;
            case 'ArrowRight':
                if (container.classList.contains('main-navigation')) {
                    e.preventDefault();
                    nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                }
                break;
        }

        if (nextIndex !== currentIndex && focusableElements[nextIndex]) {
            focusableElements[nextIndex].focus();
        }
    }

    // 处理Home/End键导航
    handleHomeEndNavigation(e, currentElement) {
        const container = currentElement.closest('.main-navigation, .blog-posts-grid, .results-list');
        if (!container) return;

        const focusableElements = Array.from(container.querySelectorAll('[tabindex="0"], a, button'));
        
        if (e.key === 'Home') {
            e.preventDefault();
            focusableElements[0]?.focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            focusableElements[focusableElements.length - 1]?.focus();
        }
    }

    // 设置焦点陷阱
    setupFocusTraps() {
        // 为搜索模态框设置焦点陷阱
        document.addEventListener('keydown', (e) => {
            const searchModal = document.querySelector('.search-modal');
            if (searchModal && searchModal.closest('.search-container').style.display !== 'none') {
                this.handleModalFocusTrap(e, searchModal);
            }
        });
    }

    // 处理模态框焦点陷阱
    handleModalFocusTrap(e, modal) {
        if (e.key !== 'Tab') return;

        const focusableElements = modal.querySelectorAll(`
            input, button, select, textarea, a[href], 
            [tabindex]:not([tabindex="-1"])
        `);
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // 添加ARIA标签
    addAriaLabels() {
        // 为导航添加ARIA标签
        const navigation = document.querySelector('.main-navigation');
        if (navigation) {
            navigation.setAttribute('role', 'navigation');
            navigation.setAttribute('aria-label', 'Main navigation');
        }

        // 为博客文章添加ARIA标签
        document.querySelectorAll('.blog-post-card').forEach((card, index) => {
            card.setAttribute('role', 'article');
            card.setAttribute('aria-labelledby', `post-title-${index}`);
            
            const title = card.querySelector('.blog-post-title, h3');
            if (title) {
                title.id = `post-title-${index}`;
            }
        });

        // 为搜索功能添加ARIA标签
        const searchTrigger = document.getElementById('search-trigger');
        if (searchTrigger) {
            searchTrigger.setAttribute('aria-haspopup', 'dialog');
            searchTrigger.setAttribute('aria-expanded', 'false');
        }

        // 为表单元素添加ARIA标签
        document.querySelectorAll('input, select, textarea').forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label && !input.getAttribute('aria-label')) {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });

        // 为图片添加适当的alt属性
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('alt')) {
                img.setAttribute('alt', '');
            }
        });
    }

    // 改善语义化结构
    improveSemanticStructure() {
        // 确保标题层级正确
        this.validateHeadingStructure();
        
        // 为区域添加landmark roles
        const main = document.querySelector('main');
        if (main && !main.hasAttribute('role')) {
            main.setAttribute('role', 'main');
        }

        const header = document.querySelector('header');
        if (header && !header.hasAttribute('role')) {
            header.setAttribute('role', 'banner');
        }

        const footer = document.querySelector('footer');
        if (footer && !footer.hasAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
        }

        // 为列表添加适当的role
        document.querySelectorAll('.blog-posts-grid').forEach(grid => {
            grid.setAttribute('role', 'feed');
            grid.setAttribute('aria-label', 'Blog posts');
        });
    }

    // 验证标题结构
    validateHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let currentLevel = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level > currentLevel + 1) {
                console.warn(`Heading level jump detected: ${heading.tagName} after h${currentLevel}`, heading);
            }
            
            currentLevel = level;
        });
    }

    // 设置焦点管理
    setupFocusManagement() {
        // 页面加载时设置初始焦点
        document.addEventListener('DOMContentLoaded', () => {
            const skipLink = document.querySelector('.skip-link');
            if (skipLink) {
                skipLink.focus();
            }
        });

        // 处理动态内容的焦点管理
        this.setupDynamicFocusManagement();
    }

    // 设置动态焦点管理
    setupDynamicFocusManagement() {
        // 监听内容变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.enhanceNewContent(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 增强新添加的内容
    enhanceNewContent(element) {
        // 为新元素添加键盘支持
        const interactiveElements = element.querySelectorAll(`
            a, button, input, select, textarea, 
            [tabindex], [role="button"], [role="link"]
        `);

        interactiveElements.forEach(el => {
            if (!el.hasAttribute('data-keyboard-enhanced')) {
                this.addKeyboardSupport(el);
                el.setAttribute('data-keyboard-enhanced', 'true');
            }
        });
    }

    // 添加可访问性控制面板
    addAccessibilityControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'accessibility-controls';
        controlsContainer.innerHTML = `
            <button class="accessibility-toggle" aria-label="Toggle accessibility controls" title="Accessibility Options">
                ♿
            </button>
            <div class="accessibility-panel" style="display: none;">
                <h3>Accessibility Options</h3>
                <div class="control-group">
                    <button class="control-btn" id="toggle-high-contrast" aria-pressed="false">
                        High Contrast
                    </button>
                    <button class="control-btn" id="increase-font-size" aria-label="Increase font size">
                        A+
                    </button>
                    <button class="control-btn" id="decrease-font-size" aria-label="Decrease font size">
                        A-
                    </button>
                    <button class="control-btn" id="reset-font-size" aria-label="Reset font size">
                        Reset
                    </button>
                </div>
                <div class="control-group">
                    <button class="control-btn" id="toggle-animations" aria-pressed="false">
                        Reduce Motion
                    </button>
                    <button class="control-btn" id="focus-outline" aria-pressed="false">
                        Focus Outlines
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(controlsContainer);
        this.bindAccessibilityControls();
    }

    // 绑定可访问性控制事件
    bindAccessibilityControls() {
        const toggle = document.querySelector('.accessibility-toggle');
        const panel = document.querySelector('.accessibility-panel');

        toggle.addEventListener('click', () => {
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
            toggle.setAttribute('aria-expanded', !isVisible);
        });

        // 高对比度切换
        document.getElementById('toggle-high-contrast').addEventListener('click', (e) => {
            this.toggleHighContrast();
            e.target.setAttribute('aria-pressed', document.body.classList.contains('high-contrast'));
        });

        // 字体大小控制
        document.getElementById('increase-font-size').addEventListener('click', () => {
            this.adjustFontSize(1.1);
        });

        document.getElementById('decrease-font-size').addEventListener('click', () => {
            this.adjustFontSize(0.9);
        });

        document.getElementById('reset-font-size').addEventListener('click', () => {
            this.resetFontSize();
        });

        // 动画切换
        document.getElementById('toggle-animations').addEventListener('click', (e) => {
            this.toggleAnimations();
            e.target.setAttribute('aria-pressed', document.body.classList.contains('reduced-motion'));
        });

        // 焦点轮廓切换
        document.getElementById('focus-outline').addEventListener('click', (e) => {
            this.toggleFocusOutlines();
            e.target.setAttribute('aria-pressed', document.body.classList.contains('enhanced-focus'));
        });
    }

    // 切换高对比度模式
    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        this.isHighContrastMode = document.body.classList.contains('high-contrast');
        
        this.announceToScreenReader(
            this.isHighContrastMode ? 'High contrast mode enabled' : 'High contrast mode disabled'
        );
    }

    // 调整字体大小
    adjustFontSize(factor) {
        const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const newSize = currentSize * factor;
        
        if (newSize >= 12 && newSize <= 24) {
            document.documentElement.style.fontSize = newSize + 'px';
            this.announceToScreenReader(`Font size adjusted to ${Math.round(newSize)}px`);
        }
    }

    // 重置字体大小
    resetFontSize() {
        document.documentElement.style.fontSize = '';
        this.announceToScreenReader('Font size reset to default');
    }

    // 切换动画
    toggleAnimations() {
        document.body.classList.toggle('reduced-motion');
        this.isReducedMotionMode = document.body.classList.contains('reduced-motion');
        
        this.announceToScreenReader(
            this.isReducedMotionMode ? 'Animations reduced' : 'Animations enabled'
        );
    }

    // 切换焦点轮廓
    toggleFocusOutlines() {
        document.body.classList.toggle('enhanced-focus');
        
        this.announceToScreenReader(
            document.body.classList.contains('enhanced-focus') ? 
            'Enhanced focus outlines enabled' : 'Enhanced focus outlines disabled'
        );
    }

    // 向屏幕阅读器宣布消息
    announceToScreenReader(message) {
        if (this.screenReaderAnnouncer) {
            this.screenReaderAnnouncer.textContent = message;
            
            // 清除消息以便下次宣布
            setTimeout(() => {
                this.screenReaderAnnouncer.textContent = '';
            }, 1000);
        }
    }

    // 绑定事件
    bindEvents() {
        // 监听媒体查询变化
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        highContrastQuery.addListener((e) => {
            if (e.matches && !this.isHighContrastMode) {
                this.toggleHighContrast();
            }
        });

        reducedMotionQuery.addListener((e) => {
            if (e.matches && !this.isReducedMotionMode) {
                this.toggleAnimations();
            }
        });

        // 监听焦点变化
        document.addEventListener('focusin', (e) => {
            this.handleFocusChange(e.target);
        });

        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });
    }

    // 处理焦点变化
    handleFocusChange(element) {
        // 确保焦点元素可见
        if (element && typeof element.scrollIntoView === 'function') {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    // 处理全局键盘事件
    handleGlobalKeyboard(e) {
        // Alt + A 打开可访问性控制面板
        if (e.altKey && e.key === 'a') {
            e.preventDefault();
            const accessibilityToggle = document.querySelector('.accessibility-toggle');
            if (accessibilityToggle) {
                accessibilityToggle.click();
                accessibilityToggle.focus();
            }
        }

        // Escape 关闭打开的面板
        if (e.key === 'Escape') {
            const openPanels = document.querySelectorAll('.accessibility-panel[style*="block"]');
            openPanels.forEach(panel => {
                panel.style.display = 'none';
                const toggle = panel.previousElementSibling;
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    // 获取可访问性状态
    getAccessibilityStatus() {
        return {
            highContrast: this.isHighContrastMode,
            reducedMotion: this.isReducedMotionMode,
            enhancedFocus: document.body.classList.contains('enhanced-focus'),
            fontSize: getComputedStyle(document.documentElement).fontSize
        };
    }

    // 销毁方法
    destroy() {
        // 移除添加的元素
        const skipLinks = document.querySelector('.skip-links');
        const accessibilityControls = document.querySelector('.accessibility-controls');
        const announcer = document.getElementById('screen-reader-announcer');

        if (skipLinks) skipLinks.remove();
        if (accessibilityControls) accessibilityControls.remove();
        if (announcer) announcer.remove();

        // 移除添加的类
        document.body.classList.remove('high-contrast', 'reduced-motion', 'enhanced-focus');
        
        // 重置字体大小
        document.documentElement.style.fontSize = '';
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityEnhancer;
}

// 自动初始化
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.accessibilityEnhancer = new AccessibilityEnhancer();
        });
    } else {
        window.accessibilityEnhancer = new AccessibilityEnhancer();
    }
}