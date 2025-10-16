/**
 * Aoyou Digital 医学科普学习平台 - 性能优化模块
 * 负责页面加载优化、图片懒加载、视频预加载和缓存策略
 */

class AoyouPerformanceOptimizer {
    constructor() {
        this.imageObserver = null;
        this.videoPreloadQueue = [];
        this.cacheStrategy = new Map();
        this.performanceMetrics = {};
        
        this.init();
    }
    
    /**
     * 初始化性能优化器
     */
    init() {
        this.setupImageLazyLoading();
        this.setupVideoPreloading();
        this.setupCacheStrategy();
        this.setupPerformanceMonitoring();
        this.optimizePageLoad();
        this.setupResourceHints();
    }
    
    /**
     * 设置图片懒加载
     */
    setupImageLazyLoading() {
        // 检查浏览器支持
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            // 观察所有懒加载图片
            this.observeLazyImages();
        } else {
            // 降级方案：直接加载所有图片
            this.loadAllImages();
        }
    }
    
    /**
     * 观察懒加载图片
     */
    observeLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }
    
    /**
     * 加载图片
     */
    loadImage(img) {
        const src = img.dataset.src || img.src;
        
        if (src) {
            // 创建新图片对象预加载
            const newImg = new Image();
            
            newImg.onload = () => {
                img.src = src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
            };
            
            newImg.onerror = () => {
                img.classList.add('error');
                // 设置默认图片
                img.src = './images/default-image.jpg';
            };
            
            newImg.src = src;
        }
    }
    
    /**
     * 加载所有图片（降级方案）
     */
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.loadImage(img);
        });
    }
    
    /**
     * 设置视频预加载
     */
    setupVideoPreloading() {
        // 预加载策略：预加载前3个视频的元数据
        this.preloadVideoMetadata();
        
        // 监听视频播放事件，预加载下一个视频
        document.addEventListener('videoplay', (e) => {
            this.preloadNextVideo(e.detail.videoId);
        });
    }
    
    /**
     * 预加载视频元数据
     */
    async preloadVideoMetadata() {
        try {
            // 获取当前分类的前3个视频
            const videos = this.getCurrentCategoryVideos().slice(0, 3);
            
            for (const video of videos) {
                if (video.videoUrl) {
                    this.preloadVideo(video.videoUrl, 'metadata');
                }
            }
        } catch (error) {
            console.error('预加载视频元数据失败:', error);
        }
    }
    
    /**
     * 预加载视频
     */
    preloadVideo(videoUrl, preload = 'metadata') {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = preload;
            video.muted = true;
            
            video.addEventListener('loadedmetadata', () => {
                resolve(video);
            });
            
            video.addEventListener('error', () => {
                reject(new Error('视频预加载失败'));
            });
            
            video.src = videoUrl;
        });
    }
    
    /**
     * 预加载下一个视频
     */
    async preloadNextVideo(currentVideoId) {
        try {
            const videos = this.getCurrentCategoryVideos();
            const currentIndex = videos.findIndex(v => v.id === currentVideoId);
            
            if (currentIndex >= 0 && currentIndex < videos.length - 1) {
                const nextVideo = videos[currentIndex + 1];
                if (nextVideo.videoUrl) {
                    // 预加载下一个视频的开始部分
                    await this.preloadVideo(nextVideo.videoUrl, 'auto');
                }
            }
        } catch (error) {
            console.error('预加载下一个视频失败:', error);
        }
    }
    
    /**
     * 获取当前分类视频
     */
    getCurrentCategoryVideos() {
        if (window.AoyouMedicalApp && window.AoyouMedicalApp.videoData) {
            return window.AoyouMedicalApp.videoData;
        }
        return [];
    }
    
    /**
     * 设置缓存策略
     */
    setupCacheStrategy() {
        // 设置不同资源的缓存策略
        this.cacheStrategy.set('images', {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
            maxSize: 50 * 1024 * 1024 // 50MB
        });
        
        this.cacheStrategy.set('videos', {
            maxAge: 24 * 60 * 60 * 1000, // 1天
            maxSize: 100 * 1024 * 1024 // 100MB
        });
        
        this.cacheStrategy.set('data', {
            maxAge: 60 * 60 * 1000, // 1小时
            maxSize: 10 * 1024 * 1024 // 10MB
        });
        
        // 注册Service Worker
        this.registerServiceWorker();
    }
    
    /**
     * 注册Service Worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker注册成功:', registration);
                
                // 监听Service Worker更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker注册失败:', error);
            }
        }
    }
    
    /**
     * 显示更新通知
     */
    showUpdateNotification() {
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.showToast('发现新版本，请刷新页面获取最新功能');
        }
    }
    
    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        // 监控页面加载性能
        window.addEventListener('load', () => {
            this.measurePageLoadPerformance();
        });
        
        // 监控资源加载性能
        this.monitorResourceLoading();
        
        // 监控用户交互性能
        this.monitorUserInteractions();
    }
    
    /**
     * 测量页面加载性能
     */
    measurePageLoadPerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            this.performanceMetrics = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint(),
                largestContentfulPaint: this.getLargestContentfulPaint()
            };
            
            console.log('页面性能指标:', this.performanceMetrics);
            
            // 发送性能数据到分析服务
            this.sendPerformanceData();
        }
    }
    
    /**
     * 获取首次绘制时间
     */
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }
    
    /**
     * 获取首次内容绘制时间
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }
    
    /**
     * 获取最大内容绘制时间
     */
    getLargestContentfulPaint() {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
                
                // 10秒后停止观察
                setTimeout(() => {
                    observer.disconnect();
                    resolve(0);
                }, 10000);
            } else {
                resolve(0);
            }
        });
    }
    
    /**
     * 监控资源加载
     */
    monitorResourceLoading() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.duration > 1000) { // 超过1秒的资源
                        console.warn('慢资源加载:', entry.name, entry.duration + 'ms');
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    }
    
    /**
     * 监控用户交互
     */
    monitorUserInteractions() {
        // 监控长任务
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    console.warn('长任务检测:', entry.duration + 'ms');
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
        
        // 监控输入延迟
        this.monitorInputDelay();
    }
    
    /**
     * 监控输入延迟
     */
    monitorInputDelay() {
        let inputStart = 0;
        
        document.addEventListener('touchstart', () => {
            inputStart = performance.now();
        });
        
        document.addEventListener('touchend', () => {
            if (inputStart) {
                const delay = performance.now() - inputStart;
                if (delay > 100) { // 超过100ms
                    console.warn('输入延迟:', delay + 'ms');
                }
            }
        });
    }
    
    /**
     * 优化页面加载
     */
    optimizePageLoad() {
        // 预连接到重要域名
        this.preconnectToDomains([
            'https://res.wx.qq.com',
            'https://cdn.jsdelivr.net'
        ]);
        
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 延迟加载非关键资源
        this.deferNonCriticalResources();
    }
    
    /**
     * 预连接到域名
     */
    preconnectToDomains(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
    
    /**
     * 预加载关键资源
     */
    preloadCriticalResources() {
        const criticalResources = [
            { href: './css/aoyou-medical.css', as: 'style' },
            { href: './js/aoyou-medical-app.js', as: 'script' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }
    
    /**
     * 延迟加载非关键资源
     */
    deferNonCriticalResources() {
        // 延迟加载非关键JavaScript
        const nonCriticalScripts = [
            './js/aoyou-medical-wechat.js',
            './js/aoyou-medical-mobile.js'
        ];
        
        setTimeout(() => {
            nonCriticalScripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.defer = true;
                document.head.appendChild(script);
            });
        }, 1000);
    }
    
    /**
     * 设置资源提示
     */
    setupResourceHints() {
        // DNS预解析
        const dnsPrefetchDomains = [
            '//res.wx.qq.com',
            '//cdn.jsdelivr.net'
        ];
        
        dnsPrefetchDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
    
    /**
     * 图片优化
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // 添加WebP支持检测
            if (this.supportsWebP()) {
                const src = img.src || img.dataset.src;
                if (src && !src.includes('.webp')) {
                    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    
                    // 检查WebP版本是否存在
                    this.checkImageExists(webpSrc).then(exists => {
                        if (exists) {
                            img.src = webpSrc;
                        }
                    });
                }
            }
            
            // 添加响应式图片属性
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
    
    /**
     * 检查WebP支持
     */
    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    /**
     * 检查图片是否存在
     */
    checkImageExists(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }
    
    /**
     * 压缩和优化JavaScript
     */
    optimizeJavaScript() {
        // 移除未使用的代码
        this.removeUnusedCode();
        
        // 代码分割
        this.implementCodeSplitting();
    }
    
    /**
     * 移除未使用的代码
     */
    removeUnusedCode() {
        // 这里可以实现代码使用情况分析
        // 在生产环境中通常由构建工具处理
        console.log('代码优化：移除未使用的代码');
    }
    
    /**
     * 实现代码分割
     */
    implementCodeSplitting() {
        // 动态导入非关键模块
        const loadModule = async (moduleName) => {
            try {
                const module = await import(`./js/${moduleName}.js`);
                return module;
            } catch (error) {
                console.error(`加载模块失败: ${moduleName}`, error);
            }
        };
        
        // 按需加载模块
        window.loadModule = loadModule;
    }
    
    /**
     * 发送性能数据
     */
    sendPerformanceData() {
        // 这里可以发送性能数据到分析服务
        // 例如Google Analytics、自定义分析服务等
        
        if (navigator.sendBeacon) {
            const data = JSON.stringify({
                metrics: this.performanceMetrics,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            });
            
            // navigator.sendBeacon('/api/performance', data);
            console.log('性能数据:', data);
        }
    }
    
    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        return {
            metrics: this.performanceMetrics,
            cacheHitRate: this.calculateCacheHitRate(),
            resourceLoadTimes: this.getResourceLoadTimes(),
            userInteractionMetrics: this.getUserInteractionMetrics()
        };
    }
    
    /**
     * 计算缓存命中率
     */
    calculateCacheHitRate() {
        // 这里可以实现缓存命中率计算
        return 0.85; // 示例值
    }
    
    /**
     * 获取资源加载时间
     */
    getResourceLoadTimes() {
        const resources = performance.getEntriesByType('resource');
        return resources.map(resource => ({
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize
        }));
    }
    
    /**
     * 获取用户交互指标
     */
    getUserInteractionMetrics() {
        return {
            averageResponseTime: 50, // 示例值
            longTaskCount: 2,
            inputDelayCount: 1
        };
    }
}

// 页面加载完成后初始化性能优化器
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouPerformanceOptimizer = new AoyouPerformanceOptimizer();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouPerformanceOptimizer;
}