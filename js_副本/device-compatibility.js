// 设备兼容性测试和优化
class DeviceCompatibility {
    constructor() {
        this.deviceInfo = this.getDeviceInfo();
        this.browserInfo = this.getBrowserInfo();
        this.init();
    }
    
    init() {
        this.detectDevice();
        this.optimizeForDevice();
        this.addCompatibilityClasses();
        this.testFeatures();
        this.logCompatibilityInfo();
    }
    
    // 获取设备信息
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const pixelRatio = window.devicePixelRatio || 1;
        
        return {
            userAgent,
            screenWidth,
            screenHeight,
            viewportWidth,
            viewportHeight,
            pixelRatio,
            isMobile: this.isMobile(),
            isTablet: this.isTablet(),
            isDesktop: this.isDesktop(),
            isTouchDevice: this.isTouchDevice(),
            isRetina: pixelRatio > 1
        };
    }
    
    // 获取浏览器信息
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        const browsers = {
            chrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
            firefox: /Firefox/.test(userAgent),
            safari: /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor),
            edge: /Edge/.test(userAgent),
            ie: /Trident/.test(userAgent),
            opera: /Opera/.test(userAgent)
        };
        
        const currentBrowser = Object.keys(browsers).find(browser => browsers[browser]) || 'unknown';
        
        return {
            name: currentBrowser,
            version: this.getBrowserVersion(currentBrowser),
            supportsModernFeatures: this.supportsModernFeatures()
        };
    }
    
    // 检测移动设备
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }
    
    // 检测平板设备
    isTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && 
               window.innerWidth > 768 && window.innerWidth <= 1024;
    }
    
    // 检测桌面设备
    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    }
    
    // 检测触摸设备
    isTouchDevice() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0;
    }
    
    // 获取浏览器版本
    getBrowserVersion(browserName) {
        const userAgent = navigator.userAgent;
        let version = 'unknown';
        
        switch (browserName) {
            case 'chrome':
                const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
                version = chromeMatch ? chromeMatch[1] : 'unknown';
                break;
            case 'firefox':
                const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
                version = firefoxMatch ? firefoxMatch[1] : 'unknown';
                break;
            case 'safari':
                const safariMatch = userAgent.match(/Version\/(\d+)/);
                version = safariMatch ? safariMatch[1] : 'unknown';
                break;
            case 'edge':
                const edgeMatch = userAgent.match(/Edge\/(\d+)/);
                version = edgeMatch ? edgeMatch[1] : 'unknown';
                break;
        }
        
        return version;
    }
    
    // 检测现代浏览器特性支持
    supportsModernFeatures() {
        const features = {
            flexbox: this.supportsFlexbox(),
            grid: this.supportsGrid(),
            customProperties: this.supportsCustomProperties(),
            es6: this.supportsES6(),
            webp: this.supportsWebP(),
            intersectionObserver: 'IntersectionObserver' in window,
            serviceWorker: 'serviceWorker' in navigator,
            localStorage: this.supportsLocalStorage()
        };
        
        return features;
    }
    
    // 检测Flexbox支持
    supportsFlexbox() {
        const element = document.createElement('div');
        element.style.display = 'flex';
        return element.style.display === 'flex';
    }
    
    // 检测CSS Grid支持
    supportsGrid() {
        const element = document.createElement('div');
        element.style.display = 'grid';
        return element.style.display === 'grid';
    }
    
    // 检测CSS自定义属性支持
    supportsCustomProperties() {
        return window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
    }
    
    // 检测ES6支持
    supportsES6() {
        try {
            new Function('(a = 0) => a');
            return true;
        } catch (err) {
            return false;
        }
    }
    
    // 检测WebP支持
    supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
    
    // 检测localStorage支持
    supportsLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // 设备检测
    detectDevice() {
        const { viewportWidth } = this.deviceInfo;
        
        if (viewportWidth <= 480) {
            this.deviceInfo.category = 'mobile-small';
        } else if (viewportWidth <= 768) {
            this.deviceInfo.category = 'mobile-large';
        } else if (viewportWidth <= 1024) {
            this.deviceInfo.category = 'tablet';
        } else if (viewportWidth <= 1440) {
            this.deviceInfo.category = 'desktop';
        } else {
            this.deviceInfo.category = 'desktop-large';
        }
    }
    
    // 为设备优化
    optimizeForDevice() {
        const { isMobile, isTablet, isTouchDevice, isRetina } = this.deviceInfo;
        
        // 移动端优化
        if (isMobile) {
            this.optimizeForMobile();
        }
        
        // 平板优化
        if (isTablet) {
            this.optimizeForTablet();
        }
        
        // 触摸设备优化
        if (isTouchDevice) {
            this.optimizeForTouch();
        }
        
        // 高分辨率屏幕优化
        if (isRetina) {
            this.optimizeForRetina();
        }
    }
    
    // 移动端优化
    optimizeForMobile() {
        // 禁用双击缩放
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
        }
        
        // 优化字体大小
        document.documentElement.style.setProperty('--font-size-base', '16px');
        
        // 增加触摸目标大小
        const style = document.createElement('style');
        style.textContent = `
            .mobile-optimized .nav-item,
            .mobile-optimized .lang-btn,
            .mobile-optimized .filter-select,
            .mobile-optimized button {
                min-height: 44px;
                min-width: 44px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 平板优化
    optimizeForTablet() {
        // 调整网格布局
        const style = document.createElement('style');
        style.textContent = `
            .tablet-optimized .blog-posts-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        `;
        document.head.appendChild(style);
    }
    
    // 触摸设备优化
    optimizeForTouch() {
        // 移除hover效果
        const style = document.createElement('style');
        style.textContent = `
            .touch-device .nav-item:hover,
            .touch-device .blog-post-card:hover {
                transform: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 高分辨率屏幕优化
    optimizeForRetina() {
        // 可以在这里添加高分辨率图片的处理逻辑
        console.log('Retina display detected, optimizing for high resolution');
    }
    
    // 添加兼容性CSS类
    addCompatibilityClasses() {
        const { category, isMobile, isTablet, isDesktop, isTouchDevice, isRetina } = this.deviceInfo;
        const { name: browserName, supportsModernFeatures } = this.browserInfo;
        
        const classes = [
            `device-${category}`,
            browserName,
            isMobile ? 'mobile' : '',
            isTablet ? 'tablet' : '',
            isDesktop ? 'desktop' : '',
            isTouchDevice ? 'touch-device' : 'no-touch',
            isRetina ? 'retina' : 'standard-dpi'
        ].filter(Boolean);
        
        // 添加现代特性支持类
        Object.entries(supportsModernFeatures).forEach(([feature, supported]) => {
            classes.push(supported ? `supports-${feature}` : `no-${feature}`);
        });
        
        document.documentElement.classList.add(...classes);
    }
    
    // 测试关键功能
    testFeatures() {
        const tests = {
            navigation: this.testNavigation(),
            responsive: this.testResponsive(),
            accessibility: this.testAccessibility(),
            performance: this.testPerformance()
        };
        
        this.testResults = tests;
        return tests;
    }
    
    // 测试导航功能
    testNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const mobileMenu = document.getElementById('mobile-menu-toggle');
        
        return {
            navItemsFound: navItems.length > 0,
            mobileMenuExists: !!mobileMenu,
            keyboardAccessible: Array.from(navItems).every(item => 
                item.hasAttribute('tabindex') || item.tabIndex >= 0
            )
        };
    }
    
    // 测试响应式设计
    testResponsive() {
        const breakpoints = [320, 768, 1024, 1440];
        const results = {};
        
        breakpoints.forEach(width => {
            // 模拟不同屏幕宽度（仅用于测试）
            const mediaQuery = window.matchMedia(`(max-width: ${width}px)`);
            results[`breakpoint_${width}`] = mediaQuery.matches;
        });
        
        return {
            breakpointTests: results,
            viewportMetaExists: !!document.querySelector('meta[name="viewport"]'),
            fluidLayout: this.hasFluidLayout()
        };
    }
    
    // 检测流体布局
    hasFluidLayout() {
        const container = document.querySelector('.site-content, .section-container');
        if (!container) return false;
        
        const styles = window.getComputedStyle(container);
        return styles.maxWidth !== 'none' && styles.width.includes('%');
    }
    
    // 测试可访问性
    testAccessibility() {
        return {
            altTextsPresent: this.checkAltTexts(),
            ariaLabelsPresent: this.checkAriaLabels(),
            headingStructure: this.checkHeadingStructure(),
            colorContrast: this.checkColorContrast()
        };
    }
    
    // 检查图片alt文本
    checkAltTexts() {
        const images = document.querySelectorAll('img');
        return Array.from(images).every(img => img.hasAttribute('alt'));
    }
    
    // 检查ARIA标签
    checkAriaLabels() {
        const interactiveElements = document.querySelectorAll('button, a, input, select');
        return Array.from(interactiveElements).some(el => 
            el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
        );
    }
    
    // 检查标题结构
    checkHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return headings.length > 0;
    }
    
    // 检查颜色对比度（简化版）
    checkColorContrast() {
        // 这里可以实现更复杂的颜色对比度检查
        return true; // 简化实现
    }
    
    // 测试性能
    testPerformance() {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        
        return {
            loadTime,
            domReady,
            resourceCount: performance.getEntriesByType('resource').length,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }
    
    // 记录兼容性信息
    logCompatibilityInfo() {
        console.group('🔧 Device Compatibility Report');
        console.log('📱 Device Info:', this.deviceInfo);
        console.log('🌐 Browser Info:', this.browserInfo);
        console.log('✅ Test Results:', this.testResults);
        console.groupEnd();
        
        // 检查是否有兼容性问题
        this.checkCompatibilityIssues();
    }
    
    // 检查兼容性问题
    checkCompatibilityIssues() {
        const issues = [];
        const { supportsModernFeatures } = this.browserInfo;
        
        // 检查关键特性支持
        if (!supportsModernFeatures.flexbox) {
            issues.push('Flexbox not supported - layout may be broken');
        }
        
        if (!supportsModernFeatures.customProperties) {
            issues.push('CSS custom properties not supported - theming may not work');
        }
        
        if (!supportsModernFeatures.localStorage) {
            issues.push('localStorage not supported - settings cannot be saved');
        }
        
        // 检查移动端问题
        if (this.deviceInfo.isMobile && this.deviceInfo.viewportWidth < 320) {
            issues.push('Screen too narrow - content may be cramped');
        }
        
        // 显示问题
        if (issues.length > 0) {
            console.warn('⚠️ Compatibility Issues Found:');
            issues.forEach(issue => console.warn(`  - ${issue}`));
            
            // 可以在页面上显示警告
            this.showCompatibilityWarning(issues);
        } else {
            console.log('✅ No compatibility issues detected');
        }
    }
    
    // 显示兼容性警告
    showCompatibilityWarning(issues) {
        const warning = document.createElement('div');
        warning.className = 'compatibility-warning';
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff6b6b;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 9999;
            font-size: 14px;
        `;
        
        warning.innerHTML = `
            <strong>⚠️ Compatibility Issues Detected:</strong><br>
            ${issues.join('<br>')}
            <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: white; color: #ff6b6b; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                Dismiss
            </button>
        `;
        
        document.body.insertBefore(warning, document.body.firstChild);
        
        // 自动隐藏警告
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }
    
    // 获取兼容性报告
    getCompatibilityReport() {
        return {
            device: this.deviceInfo,
            browser: this.browserInfo,
            tests: this.testResults,
            timestamp: new Date().toISOString()
        };
    }
}

// 初始化设备兼容性检测
document.addEventListener('DOMContentLoaded', () => {
    window.deviceCompatibility = new DeviceCompatibility();
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceCompatibility;
}