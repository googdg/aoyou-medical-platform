// 图片优化和懒加载管理器
class ImageOptimizer {
    constructor() {
        this.lazyImages = [];
        this.imageObserver = null;
        this.webpSupported = false;
        this.init();
    }
    
    async init() {
        // 检测WebP支持
        this.webpSupported = await this.checkWebPSupport();
        
        // 初始化懒加载
        this.initLazyLoading();
        
        // 优化现有图片
        this.optimizeExistingImages();
        
        // 监听新图片添加
        this.observeNewImages();
        
        console.log('🖼️ Image Optimizer initialized', {
            webpSupported: this.webpSupported,
            lazyImagesCount: this.lazyImages.length
        });
    }
    
    // 检测WebP支持
    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
    
    // 初始化懒加载
    initLazyLoading() {
        // 使用Intersection Observer API
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                // 提前50px开始加载
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            // 查找所有需要懒加载的图片
            this.findLazyImages();
        } else {
            // 降级方案：直接加载所有图片
            this.loadAllImages();
        }
    }
    
    // 查找需要懒加载的图片
    findLazyImages() {
        const images = document.querySelectorAll('img[data-src], img[data-lazy]');
        images.forEach(img => {
            this.lazyImages.push(img);
            this.imageObserver.observe(img);
        });
        
        // 为个人照片占位符添加懒加载
        const placeholders = document.querySelectorAll('.image-placeholder');
        placeholders.forEach(placeholder => {
            if (placeholder.dataset.src) {
                this.imageObserver.observe(placeholder);
            }
        });
    }
    
    // 加载图片
    loadImage(element) {
        const isImg = element.tagName === 'IMG';
        const src = element.dataset.src;
        const srcset = element.dataset.srcset;
        
        if (!src) return;
        
        // 创建新图片对象预加载
        const img = new Image();
        
        img.onload = () => {
            if (isImg) {
                // 普通img标签
                element.src = this.getOptimizedSrc(src);
                if (srcset) {
                    element.srcset = this.getOptimizedSrcset(srcset);
                }
                element.classList.add('loaded');
            } else {
                // 背景图片或占位符
                element.style.backgroundImage = `url(${this.getOptimizedSrc(src)})`;
                element.classList.add('loaded');
            }
            
            // 添加淡入动画
            this.addFadeInAnimation(element);
        };
        
        img.onerror = () => {
            element.classList.add('error');
            console.warn('Failed to load image:', src);
        };
        
        // 开始加载
        img.src = this.getOptimizedSrc(src);
    }
    
    // 获取优化后的图片源
    getOptimizedSrc(src) {
        if (!src) return src;
        
        // 如果支持WebP，尝试使用WebP版本
        if (this.webpSupported && !src.includes('.webp')) {
            const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            return webpSrc;
        }
        
        return src;
    }
    
    // 获取优化后的srcset
    getOptimizedSrcset(srcset) {
        if (!srcset || !this.webpSupported) return srcset;
        
        return srcset.replace(/\.(jpg|jpeg|png)(\s+\d+[wx])/gi, '.webp$2');
    }
    
    // 添加淡入动画
    addFadeInAnimation(element) {
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.3s ease-in-out';
        
        // 强制重绘
        element.offsetHeight;
        
        element.style.opacity = '1';
    }
    
    // 优化现有图片
    optimizeExistingImages() {
        const images = document.querySelectorAll('img:not([data-src]):not([data-lazy])');
        images.forEach(img => {
            if (img.src && !img.classList.contains('optimized')) {
                this.optimizeImage(img);
            }
        });
    }
    
    // 优化单个图片
    optimizeImage(img) {
        const originalSrc = img.src;
        const optimizedSrc = this.getOptimizedSrc(originalSrc);
        
        if (optimizedSrc !== originalSrc) {
            const testImg = new Image();
            testImg.onload = () => {
                img.src = optimizedSrc;
                img.classList.add('optimized');
            };
            testImg.onerror = () => {
                // WebP不可用，保持原图
                img.classList.add('optimized');
            };
            testImg.src = optimizedSrc;
        } else {
            img.classList.add('optimized');
        }
    }
    
    // 监听新图片添加
    observeNewImages() {
        if (!window.MutationObserver) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // 检查新添加的img元素
                        if (node.tagName === 'IMG') {
                            this.handleNewImage(node);
                        }
                        
                        // 检查子元素中的img
                        const images = node.querySelectorAll && node.querySelectorAll('img');
                        if (images) {
                            images.forEach(img => this.handleNewImage(img));
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 处理新图片
    handleNewImage(img) {
        if (img.dataset.src || img.dataset.lazy) {
            // 懒加载图片
            this.lazyImages.push(img);
            if (this.imageObserver) {
                this.imageObserver.observe(img);
            }
        } else if (img.src && !img.classList.contains('optimized')) {
            // 立即优化
            this.optimizeImage(img);
        }
    }
    
    // 降级方案：加载所有图片
    loadAllImages() {
        const images = document.querySelectorAll('img[data-src], img[data-lazy]');
        images.forEach(img => {
            this.loadImage(img);
        });
    }
    
    // 预加载关键图片
    preloadCriticalImages(urls) {
        if (!Array.isArray(urls)) return;
        
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = this.getOptimizedSrc(url);
            document.head.appendChild(link);
        });
    }
    
    // 创建响应式图片
    createResponsiveImage(src, alt = '', sizes = '100vw') {
        const img = document.createElement('img');
        
        // 生成不同尺寸的图片源
        const srcset = this.generateSrcset(src);
        
        img.dataset.src = src;
        img.dataset.srcset = srcset;
        img.alt = alt;
        img.sizes = sizes;
        img.loading = 'lazy'; // 原生懒加载支持
        
        // 添加占位符
        img.style.backgroundColor = '#f0f0f0';
        img.style.minHeight = '200px';
        
        return img;
    }
    
    // 生成srcset
    generateSrcset(src) {
        const sizes = [320, 640, 960, 1280, 1920];
        const extension = src.split('.').pop();
        const baseName = src.replace(`.${extension}`, '');
        
        return sizes.map(size => {
            const optimizedExt = this.webpSupported ? 'webp' : extension;
            return `${baseName}_${size}w.${optimizedExt} ${size}w`;
        }).join(', ');
    }
    
    // 图片压缩（客户端）
    compressImage(file, quality = 0.8, maxWidth = 1920) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // 计算新尺寸
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // 绘制并压缩
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    // 获取图片信息
    getImageInfo(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    aspectRatio: img.naturalWidth / img.naturalHeight,
                    src: src
                });
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${src}`));
            };
            
            img.src = src;
        });
    }
    
    // 清理资源
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        this.lazyImages = [];
    }
    
    // 获取性能统计
    getPerformanceStats() {
        const images = document.querySelectorAll('img');
        const loadedImages = document.querySelectorAll('img.loaded');
        const optimizedImages = document.querySelectorAll('img.optimized');
        const errorImages = document.querySelectorAll('img.error');
        
        return {
            total: images.length,
            loaded: loadedImages.length,
            optimized: optimizedImages.length,
            errors: errorImages.length,
            webpSupported: this.webpSupported,
            lazyLoadingSupported: 'IntersectionObserver' in window
        };
    }
}

// 图片工具函数
class ImageUtils {
    // 检测图片格式支持
    static async checkFormatSupport(format) {
        const formats = {
            webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
            avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
        };
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => {
                resolve(img.height === 2);
            };
            img.src = formats[format];
        });
    }
    
    // 生成占位符图片
    static generatePlaceholder(width, height, color = '#f0f0f0') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        return canvas.toDataURL();
    }
    
    // 创建模糊占位符
    static createBlurPlaceholder(src, callback) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 创建小尺寸模糊版本
            canvas.width = 40;
            canvas.height = (img.height / img.width) * 40;
            
            ctx.filter = 'blur(2px)';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            callback(canvas.toDataURL());
        };
        
        img.src = src;
    }
    
    // 计算图片文件大小
    static getImageSize(src) {
        return fetch(src, { method: 'HEAD' })
            .then(response => {
                const size = response.headers.get('content-length');
                return size ? parseInt(size) : null;
            })
            .catch(() => null);
    }
}

// 初始化图片优化器
document.addEventListener('DOMContentLoaded', () => {
    window.imageOptimizer = new ImageOptimizer();
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImageOptimizer, ImageUtils };
}