// Navigation Enhancement Module
class NavigationEnhancer {
    constructor() {
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.backToTopButton = null;
        this.pageTransitions = new Map();
        this.init();
    }
    
    init() {
        this.createBackToTopButton();
        this.setupPageTransitions();
        this.setupSmoothScrolling();
        this.setupScrollEffects();
        this.setupKeyboardNavigation();
        this.bindEvents();
    }
    
    // 创建返回顶部按钮
    createBackToTopButton() {
        this.backToTopButton = document.createElement('button');
        this.backToTopButton.id = 'back-to-top';
        this.backToTopButton.className = 'back-to-top-btn';
        this.backToTopButton.innerHTML = '↑';
        this.backToTopButton.setAttribute('aria-label', 'Back to top');
        this.backToTopButton.setAttribute('title', 'Back to top');
        this.backToTopButton.style.display = 'none';
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .back-to-top-btn {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 50px;
                height: 50px;
                border: none;
                border-radius: 50%;
                background: var(--color-primary, #333);
                color: var(--color-background, #fff);
                font-size: 1.2rem;
                font-weight: bold;
                cursor: pointer;
                z-index: 1000;
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                opacity: 0;
                transform: translateY(20px);
            }
            
            .back-to-top-btn.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .back-to-top-btn:hover {
                background: var(--color-secondary, #555);
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }
            
            .back-to-top-btn:active {
                transform: translateY(0);
            }
            
            .back-to-top-btn:focus {
                outline: 2px solid var(--color-link, #0066cc);
                outline-offset: 2px;
            }
            
            @media (max-width: 768px) {
                .back-to-top-btn {
                    bottom: 1rem;
                    right: 1rem;
                    width: 45px;
                    height: 45px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.backToTopButton);
        
        // 绑定点击事件
        this.backToTopButton.addEventListener('click', () => {
            this.scrollToTop();
        });
    }
    
    // 设置页面切换动画
    setupPageTransitions() {
        const style = document.createElement('style');
        style.textContent = `
            .page-transition {
                opacity: 1;
                transform: translateY(0);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .page-transition.fade-out {
                opacity: 0;
                transform: translateY(-10px);
            }
            
            .page-transition.fade-in {
                opacity: 0;
                transform: translateY(10px);
                animation: fadeInUp 0.5s ease forwards;
            }
            
            @keyframes fadeInUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .nav-item {
                position: relative;
                transition: all 0.2s ease;
            }
            
            .nav-item::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 50%;
                width: 0;
                height: 2px;
                background: var(--color-primary, #333);
                transition: all 0.3s ease;
                transform: translateX(-50%);
            }
            
            .nav-item:hover::after,
            .nav-item.active::after {
                width: 100%;
            }
            
            .nav-item:hover {
                transform: translateY(-1px);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // 设置平滑滚动
    setupSmoothScrolling() {
        // 为所有内部锚点链接添加平滑滚动
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                this.smoothScrollTo(targetElement);
            }
        });
    }
    
    // 平滑滚动到指定元素
    smoothScrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = Math.min(Math.abs(distance) / 2, 800); // 最大800ms
        let start = null;
        
        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }
    
    // 缓动函数
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    // 设置滚动效果
    setupScrollEffects() {
        let ticking = false;
        
        const updateScrollEffects = () => {
            const scrollY = window.pageYOffset;
            
            // 显示/隐藏返回顶部按钮
            if (scrollY > 300) {
                this.backToTopButton.classList.add('visible');
            } else {
                this.backToTopButton.classList.remove('visible');
            }
            
            // 更新导航状态
            this.updateActiveNavigation();
            
            // 添加滚动视差效果（可选）
            this.updateParallaxEffects(scrollY);
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        });
    }
    
    // 更新活动导航项
    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id], .section[id]');
        const navItems = document.querySelectorAll('.nav-item');
        const scrollPosition = window.pageYOffset + 100;
        
        let activeSection = null;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                activeSection = section.id;
            }
        });
        
        // 更新导航项状态
        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href === `#${activeSection}`) {
                item.classList.add('active');
            }
        });
    }
    
    // 视差效果（可选）
    updateParallaxEffects(scrollY) {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    // 设置键盘导航
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // 快捷键支持
            switch (e.key) {
                case 'Home':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.scrollToTop();
                    }
                    break;
                    
                case 'End':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.scrollToBottom();
                    }
                    break;
                    
                case 'ArrowUp':
                    if (e.ctrlKey && e.shiftKey) {
                        e.preventDefault();
                        this.scrollToTop();
                    }
                    break;
                    
                case 'ArrowDown':
                    if (e.ctrlKey && e.shiftKey) {
                        e.preventDefault();
                        this.scrollToBottom();
                    }
                    break;
            }
            
            // Tab键导航增强
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }
    
    // Tab键导航处理
    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
        );
        
        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.indexOf(document.activeElement);
        
        // 如果当前焦点元素不在可聚焦元素列表中，设置焦点到第一个元素
        if (currentIndex === -1 && !e.shiftKey) {
            e.preventDefault();
            focusableArray[0]?.focus();
        }
    }
    
    // 绑定事件
    bindEvents() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.onPageVisible();
            }
        });
        
        // 窗口大小变化
        window.addEventListener('resize', this.debounce(() => {
            this.onWindowResize();
        }, 250));
        
        // 页面加载完成
        window.addEventListener('load', () => {
            this.onPageLoad();
        });
    }
    
    // 页面可见时的处理
    onPageVisible() {
        // 重新计算位置和状态
        this.updateActiveNavigation();
    }
    
    // 窗口大小变化处理
    onWindowResize() {
        // 重新计算滚动位置
        this.updateActiveNavigation();
        
        // 调整移动端返回顶部按钮位置
        if (window.innerWidth <= 768) {
            this.backToTopButton.style.bottom = '1rem';
            this.backToTopButton.style.right = '1rem';
        } else {
            this.backToTopButton.style.bottom = '2rem';
            this.backToTopButton.style.right = '2rem';
        }
    }
    
    // 页面加载完成处理
    onPageLoad() {
        // 添加页面加载动画
        document.body.classList.add('page-loaded');
        
        // 检查URL哈希并滚动到对应位置
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    this.smoothScrollTo(target);
                }
            }, 100);
        }
    }
    
    // 滚动到顶部
    scrollToTop() {
        const startPosition = window.pageYOffset;
        const duration = Math.min(startPosition / 3, 800);
        let start = null;
        
        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, -startPosition, duration);
            
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }
    
    // 滚动到底部
    scrollToBottom() {
        const startPosition = window.pageYOffset;
        const targetPosition = document.documentElement.scrollHeight - window.innerHeight;
        const distance = targetPosition - startPosition;
        const duration = Math.min(Math.abs(distance) / 3, 800);
        let start = null;
        
        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }
    
    // 页面切换动画
    animatePageTransition(fromElement, toElement, callback) {
        if (fromElement) {
            fromElement.classList.add('fade-out');
        }
        
        setTimeout(() => {
            if (fromElement) {
                fromElement.style.display = 'none';
                fromElement.classList.remove('fade-out');
            }
            
            if (toElement) {
                toElement.style.display = 'block';
                toElement.classList.add('fade-in');
                
                setTimeout(() => {
                    toElement.classList.remove('fade-in');
                    if (callback) callback();
                }, 500);
            }
        }, 300);
    }
    
    // 添加页面进入动画
    addPageEnterAnimation(element) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 获取当前滚动位置
    getScrollPosition() {
        return {
            x: window.pageXOffset,
            y: window.pageYOffset
        };
    }
    
    // 检查元素是否在视口中
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // 滚动到指定元素并高亮
    scrollToAndHighlight(element) {
        this.smoothScrollTo(element);
        
        // 添加高亮效果
        element.classList.add('highlighted');
        setTimeout(() => {
            element.classList.remove('highlighted');
        }, 2000);
    }
}

// 高亮样式
const highlightStyle = document.createElement('style');
highlightStyle.textContent = `
    .highlighted {
        background-color: rgba(255, 255, 0, 0.3);
        transition: background-color 0.3s ease;
    }
    
    .page-loaded {
        animation: pageLoad 0.5s ease-out;
    }
    
    @keyframes pageLoad {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(highlightStyle);

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationEnhancer;
} else {
    window.NavigationEnhancer = NavigationEnhancer;
}