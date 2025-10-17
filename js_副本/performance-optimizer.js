// 页面性能优化管理器
class PerformanceOptimizer {
    constructor() {
        this.metrics = {};
        this.observers = [];
        this.resourceCache = new Map();
        this.init();
    }
    
    init() {
        // 监控性能指标
        this.monitorPerformance();
        
        // 优化资源加载
        this.optimizeResourceLoading();
        
        // 实现缓存策略
        this.implementCaching();
        
        // 优化字体加载
        this.optimizeFontLoading();
        
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 监听页面可见性变化
        this.handleVisibilityChange();
        
        console.log('⚡ Performance Optimizer initialized');
    }
    
    // 监控性能指标
    monitorPerformance() {
        // 监控核心Web指标
        this.observeWebVitals();
        
        // 监控资源加载
        this.observeResourceTiming();
        
        // 监控长任务
        this.observeLongTasks();
        
        // 监控布局偏移
        this.observeLayoutShift();
    }
    
    // 观察Web核心指标
    observeWebVitals() {
        // First Contentful Paint (FCP)
        this.observePerformanceEntry('paint', (entries) => {
            entries.forEach(entry => {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.fcp = entry.startTime;
                    this.logMetric('FCP', entry.startTime);
                }
            });
        });
        
        // Largest Contentful Paint (LCP)
        this.observePerformanceEntry('largest-contentful-paint', (entries) => {
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.startTime;
            this.logMetric('LCP', lastEntry.startTime);
        });
        
        // First Input Delay (FID) - 通过事件监听模拟
        this.measureFirstInputDelay();
        
        // Cumulative Layout Shift (CLS)
        this.observePerformanceEntry('layout-shift', (entries) => {
            let clsValue = 0;
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            this.metrics.cls = clsValue;
            this.logMetric('CLS', clsValue);
        });
    }
    
    // 观察性能条目
    observePerformanceEntry(type, callback) {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    callback(list.getEntries());
                });
                observer.observe({ type, buffered: true });
                this.observers.push(observer);
            } catch (e) {
                console.warn(`Cannot observe ${type}:`, e);
            }
        }
    }
    
    // 测量首次输入延迟
    measureFirstInputDelay() {
        let firstInputTime = null;
        let firstInputDelay = null;
        
        const measureFID = (event) => {
            if (firstInputTime === null) {
                firstInputTime = event.timeStamp;
                firstInputDelay = performance.now() - event.timeStamp;
                this.metrics.fid = firstInputDelay;
                this.logMetric('FID', firstInputDelay);
                
                // 移除事件监听器
                ['mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach(type => {
                    document.removeEventListener(type, measureFID, true);
                });
            }
        };
        
        ['mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach(type => {
            document.addEventListener(type, measureFID, true);
        });
    }
    
    // 观察资源加载时间
    observeResourceTiming() {
        this.observePerformanceEntry('resource', (entries) => {
            entries.forEach(entry => {
                const resourceType = this.getResourceType(entry.name);
                if (!this.metrics.resources) {
                    this.metrics.resources = {};
                }
                if (!this.metrics.resources[resourceType]) {
                    this.metrics.resources[resourceType] = [];
                }
                
                this.metrics.resources[resourceType].push({
                    name: entry.name,
                    duration: entry.duration,
                    size: entry.transferSize,
                    cached: entry.transferSize === 0
                });
            });
        });
    }
    
    // 观察长任务
    observeLongTasks() {
        this.observePerformanceEntry('longtask', (entries) => {
            entries.forEach(entry => {
                if (!this.metrics.longTasks) {
                    this.metrics.longTasks = [];
                }
                this.metrics.longTasks.push({
                    duration: entry.duration,
                    startTime: entry.startTime
                });
                
                if (entry.duration > 50) {
                    console.warn('Long task detected:', entry.duration + 'ms');
                }
            });
        });
    }
    
    // 观察布局偏移
    observeLayoutShift() {
        this.observePerformanceEntry('layout-shift', (entries) => {
            entries.forEach(entry => {
                if (!entry.hadRecentInput && entry.value > 0.1) {
                    console.warn('Significant layout shift detected:', entry.value);
                }
            });
        });
    }
    
    // 获取资源类型
    getResourceType(url) {
        if (url.match(/\.(css)$/)) return 'css';
        if (url.match(/\.(js)$/)) return 'javascript';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
        return 'other';
    }
    
    // 优化资源加载
    optimizeResourceLoading() {
        // 延迟加载非关键CSS
        this.deferNonCriticalCSS();
        
        // 异步加载JavaScript
        this.loadJavaScriptAsync();
        
        // 压缩和合并资源
        this.optimizeResources();
        
        // 实现资源提示
        this.addResourceHints();
    }
    
    // 延迟加载非关键CSS
    deferNonCriticalCSS() {
        const nonCriticalCSS = [
            // 可以在这里添加非关键CSS文件
        ];
        
        nonCriticalCSS.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.media = 'print';
            link.onload = () => {
                link.media = 'all';
            };
            document.head.appendChild(link);
        });
    }
    
    // 异步加载JavaScript
    loadJavaScriptAsync() {
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.async && !script.defer) {
                script.async = true;
            }
        });
    }
    
    // 优化资源
    optimizeResources() {
        // 移除未使用的CSS
        this.removeUnusedCSS();
        
        // 压缩内联样式
        this.compressInlineStyles();
        
        // 优化图片
        this.optimizeImages();
    }
    
    // 移除未使用的CSS
    removeUnusedCSS() {
        // 这里可以实现CSS使用情况分析
        // 简化实现：标记未使用的样式
        const unusedSelectors = [];
        
        document.querySelectorAll('style').forEach(styleElement => {
            const rules = styleElement.sheet?.cssRules || [];
            Array.from(rules).forEach(rule => {
                if (rule.selectorText) {
                    try {
                        if (!document.querySelector(rule.selectorText)) {
                            unusedSelectors.push(rule.selectorText);
                        }
                    } catch (e) {
                        // 忽略无效选择器
                    }
                }
            });
        });
        
        if (unusedSelectors.length > 0) {
            console.log('Unused CSS selectors found:', unusedSelectors.length);
        }
    }
    
    // 压缩内联样式
    compressInlineStyles() {
        document.querySelectorAll('[style]').forEach(element => {
            const style = element.getAttribute('style');
            if (style) {
                const compressed = style
                    .replace(/\s+/g, ' ')
                    .replace(/;\s*}/g, '}')
                    .replace(/\s*{\s*/g, '{')
                    .replace(/;\s*$/g, '')
                    .trim();
                element.setAttribute('style', compressed);
            }
        });
    }
    
    // 优化图片
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // 添加loading="lazy"属性
            if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }
            
            // 添加decoding="async"属性
            if (!img.hasAttribute('decoding')) {
                img.decoding = 'async';
            }
        });
    }
    
    // 添加资源提示
    addResourceHints() {
        // DNS预解析
        const domains = [
            '//fonts.googleapis.com',
            '//fonts.gstatic.com'
        ];
        
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
        
        // 预连接关键域名
        const preconnectDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];
        
        preconnectDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    // 实现缓存策略
    implementCaching() {
        // Service Worker缓存
        this.registerServiceWorker();
        
        // 内存缓存
        this.implementMemoryCache();
        
        // localStorage缓存
        this.implementLocalStorageCache();
    }
    
    // 注册Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
    
    // 实现内存缓存
    implementMemoryCache() {
        const originalFetch = window.fetch;
        
        window.fetch = (url, options = {}) => {
            const cacheKey = `${url}_${JSON.stringify(options)}`;
            
            // 检查缓存
            if (this.resourceCache.has(cacheKey)) {
                const cached = this.resourceCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 300000) { // 5分钟缓存
                    return Promise.resolve(cached.response.clone());
                }
            }
            
            // 发起请求并缓存
            return originalFetch(url, options).then(response => {
                if (response.ok) {
                    this.resourceCache.set(cacheKey, {
                        response: response.clone(),
                        timestamp: Date.now()
                    });
                }
                return response;
            });
        };
    }
    
    // 实现localStorage缓存
    implementLocalStorageCache() {
        const cache = {
            set: (key, value, ttl = 3600000) => { // 默认1小时
                const item = {
                    value,
                    timestamp: Date.now(),
                    ttl
                };
                try {
                    localStorage.setItem(`perf_cache_${key}`, JSON.stringify(item));
                } catch (e) {
                    console.warn('localStorage cache failed:', e);
                }
            },
            
            get: (key) => {
                try {
                    const item = localStorage.getItem(`perf_cache_${key}`);
                    if (!item) return null;
                    
                    const parsed = JSON.parse(item);
                    if (Date.now() - parsed.timestamp > parsed.ttl) {
                        localStorage.removeItem(`perf_cache_${key}`);
                        return null;
                    }
                    
                    return parsed.value;
                } catch (e) {
                    return null;
                }
            },
            
            clear: () => {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('perf_cache_')) {
                        localStorage.removeItem(key);
                    }
                });
            }
        };
        
        window.perfCache = cache;
    }
    
    // 优化字体加载
    optimizeFontLoading() {
        // 预加载关键字体
        this.preloadFonts();
        
        // 使用font-display优化
        this.optimizeFontDisplay();
        
        // 字体子集化
        this.implementFontSubsetting();
    }
    
    // 预加载字体
    preloadFonts() {
        const fonts = [
            // 可以在这里添加需要预加载的字体
        ];
        
        fonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.href = font;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    // 优化字体显示
    optimizeFontDisplay() {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'System Font';
                font-display: swap;
                src: local('system-ui'), local('-apple-system'), local('BlinkMacSystemFont');
            }
        `;
        document.head.appendChild(style);
    }
    
    // 字体子集化
    implementFontSubsetting() {
        // 检测页面使用的字符
        const usedChars = new Set();
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent;
            for (let char of text) {
                usedChars.add(char);
            }
        }
        
        console.log('Used characters count:', usedChars.size);
    }
    
    // 预加载关键资源
    preloadCriticalResources() {
        const criticalResources = [
            { href: 'styles.css', as: 'style' },
            { href: 'script.js', as: 'script' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'script') {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }
    
    // 处理页面可见性变化
    handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时暂停非关键操作
                this.pauseNonCriticalOperations();
            } else {
                // 页面可见时恢复操作
                this.resumeOperations();
            }
        });
    }
    
    // 暂停非关键操作
    pauseNonCriticalOperations() {
        // 暂停动画
        document.querySelectorAll('*').forEach(el => {
            if (el.style.animationPlayState !== 'paused') {
                el.style.animationPlayState = 'paused';
                el.dataset.wasPaused = 'false';
            } else {
                el.dataset.wasPaused = 'true';
            }
        });
        
        // 暂停视频
        document.querySelectorAll('video').forEach(video => {
            if (!video.paused) {
                video.pause();
                video.dataset.wasPlaying = 'true';
            }
        });
    }
    
    // 恢复操作
    resumeOperations() {
        // 恢复动画
        document.querySelectorAll('*').forEach(el => {
            if (el.dataset.wasPaused === 'false') {
                el.style.animationPlayState = 'running';
            }
            delete el.dataset.wasPaused;
        });
        
        // 恢复视频
        document.querySelectorAll('video').forEach(video => {
            if (video.dataset.wasPlaying === 'true') {
                video.play();
            }
            delete video.dataset.wasPlaying;
        });
    }
    
    // 记录性能指标
    logMetric(name, value) {
        console.log(`📊 ${name}: ${Math.round(value)}ms`);
        
        // 发送到分析服务（如果需要）
        this.sendAnalytics(name, value);
    }
    
    // 发送分析数据
    sendAnalytics(metric, value) {
        // 这里可以发送到Google Analytics或其他分析服务
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metric', {
                metric_name: metric,
                metric_value: Math.round(value),
                custom_parameter: 'performance_optimization'
            });
        }
    }
    
    // 获取性能报告
    getPerformanceReport() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
            // 导航时间
            navigation: {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart
            },
            
            // 绘制时间
            paint: paint.reduce((acc, entry) => {
                acc[entry.name.replace('-', '_')] = entry.startTime;
                return acc;
            }, {}),
            
            // Web核心指标
            webVitals: {
                fcp: this.metrics.fcp,
                lcp: this.metrics.lcp,
                fid: this.metrics.fid,
                cls: this.metrics.cls
            },
            
            // 资源统计
            resources: this.metrics.resources,
            
            // 长任务
            longTasks: this.metrics.longTasks,
            
            // 内存使用
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            
            // 缓存统计
            cache: {
                memoryCache: this.resourceCache.size,
                localStorage: Object.keys(localStorage).filter(key => 
                    key.startsWith('perf_cache_')
                ).length
            }
        };
    }
    
    // 优化建议
    getOptimizationSuggestions() {
        const suggestions = [];
        const report = this.getPerformanceReport();
        
        // LCP建议
        if (report.webVitals.lcp > 2500) {
            suggestions.push({
                type: 'warning',
                metric: 'LCP',
                message: 'Largest Contentful Paint is slow. Consider optimizing images and critical resources.',
                value: report.webVitals.lcp
            });
        }
        
        // FID建议
        if (report.webVitals.fid > 100) {
            suggestions.push({
                type: 'warning',
                metric: 'FID',
                message: 'First Input Delay is high. Consider reducing JavaScript execution time.',
                value: report.webVitals.fid
            });
        }
        
        // CLS建议
        if (report.webVitals.cls > 0.1) {
            suggestions.push({
                type: 'error',
                metric: 'CLS',
                message: 'Cumulative Layout Shift is high. Ensure images and ads have dimensions.',
                value: report.webVitals.cls
            });
        }
        
        // 长任务建议
        if (report.longTasks && report.longTasks.length > 0) {
            suggestions.push({
                type: 'warning',
                metric: 'Long Tasks',
                message: `${report.longTasks.length} long tasks detected. Consider code splitting.`,
                value: report.longTasks.length
            });
        }
        
        return suggestions;
    }
    
    // 清理资源
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.resourceCache.clear();
    }
}

// 性能监控工具
class PerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.checkpoints = new Map();
    }
    
    // 添加检查点
    checkpoint(name) {
        this.checkpoints.set(name, performance.now() - this.startTime);
        console.log(`⏱️ Checkpoint ${name}: ${Math.round(this.checkpoints.get(name))}ms`);
    }
    
    // 获取所有检查点
    getCheckpoints() {
        return Object.fromEntries(this.checkpoints);
    }
    
    // 测量函数执行时间
    measure(name, fn) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        console.log(`⏱️ ${name}: ${Math.round(duration)}ms`);
        return result;
    }
    
    // 异步测量
    async measureAsync(name, fn) {
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;
        console.log(`⏱️ ${name}: ${Math.round(duration)}ms`);
        return result;
    }
}

// 初始化性能优化器
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    window.performanceMonitor = new PerformanceMonitor();
    
    // 页面加载完成后显示性能报告
    window.addEventListener('load', () => {
        setTimeout(() => {
            const report = window.performanceOptimizer.getPerformanceReport();
            const suggestions = window.performanceOptimizer.getOptimizationSuggestions();
            
            console.group('📊 Performance Report');
            console.table(report.webVitals);
            console.log('Navigation:', report.navigation);
            console.log('Paint:', report.paint);
            if (suggestions.length > 0) {
                console.warn('Optimization Suggestions:', suggestions);
            }
            console.groupEnd();
        }, 1000);
    });
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceOptimizer, PerformanceMonitor };
}