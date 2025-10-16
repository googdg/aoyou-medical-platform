/**
 * Aoyou Digital - 工具函数库
 * 移动端 H5 应用通用工具函数
 */

// 工具函数命名空间
const AoyouUtils = {
    
    // 设备检测
    device: {
        // 检测是否为移动设备
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        // 检测是否为 iOS
        isIOS() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent);
        },
        
        // 检测是否为 Android
        isAndroid() {
            return /Android/.test(navigator.userAgent);
        },
        
        // 检测是否为微信浏览器
        isWeChat() {
            return /MicroMessenger/i.test(navigator.userAgent);
        },
        
        // 获取屏幕尺寸
        getScreenSize() {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
                ratio: window.devicePixelRatio || 1
            };
        }
    },
    
    // DOM 操作
    dom: {
        // 查询元素
        $(selector) {
            return document.querySelector(selector);
        },
        
        // 查询所有元素
        $$(selector) {
            return document.querySelectorAll(selector);
        },
        
        // 添加类名
        addClass(element, className) {
            if (element && className) {
                element.classList.add(className);
            }
        },
        
        // 移除类名
        removeClass(element, className) {
            if (element && className) {
                element.classList.remove(className);
            }
        },
        
        // 切换类名
        toggleClass(element, className) {
            if (element && className) {
                element.classList.toggle(className);
            }
        },
        
        // 检查是否有类名
        hasClass(element, className) {
            return element && element.classList.contains(className);
        }
    },
    
    // 事件处理
    event: {
        // 添加事件监听器
        on(element, event, handler, options = false) {
            if (element && event && handler) {
                element.addEventListener(event, handler, options);
            }
        },
        
        // 移除事件监听器
        off(element, event, handler, options = false) {
            if (element && event && handler) {
                element.removeEventListener(event, handler, options);
            }
        },
        
        // 触发自定义事件
        trigger(element, eventName, data = null) {
            if (element && eventName) {
                const event = new CustomEvent(eventName, { detail: data });
                element.dispatchEvent(event);
            }
        },
        
        // 防抖函数
        debounce(func, wait, immediate = false) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },
        
        // 节流函数
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    },
    
    // 动画工具
    animation: {
        // 简单的淡入动画
        fadeIn(element, duration = 300) {
            if (!element) return;
            
            element.style.opacity = '0';
            element.style.display = 'block';
            
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        },
        
        // 简单的淡出动画
        fadeOut(element, duration = 300) {
            if (!element) return;
            
            const start = performance.now();
            const startOpacity = parseFloat(getComputedStyle(element).opacity);
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = startOpacity * (1 - progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                }
            };
            
            requestAnimationFrame(animate);
        },
        
        // 滑动动画
        slideToggle(element, duration = 300) {
            if (!element) return;
            
            const isVisible = element.offsetHeight > 0;
            const startHeight = isVisible ? element.offsetHeight : 0;
            const endHeight = isVisible ? 0 : element.scrollHeight;
            
            element.style.height = startHeight + 'px';
            element.style.overflow = 'hidden';
            
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentHeight = startHeight + (endHeight - startHeight) * progress;
                element.style.height = currentHeight + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.height = '';
                    element.style.overflow = '';
                    if (!isVisible) {
                        element.style.display = 'block';
                    } else {
                        element.style.display = 'none';
                    }
                }
            };
            
            requestAnimationFrame(animate);
        }
    },
    
    // 存储工具
    storage: {
        // 设置本地存储
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('LocalStorage 设置失败:', e);
                return false;
            }
        },
        
        // 获取本地存储
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('LocalStorage 获取失败:', e);
                return defaultValue;
            }
        },
        
        // 移除本地存储
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('LocalStorage 移除失败:', e);
                return false;
            }
        },
        
        // 清空本地存储
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.warn('LocalStorage 清空失败:', e);
                return false;
            }
        }
    },
    
    // 网络请求
    http: {
        // GET 请求
        async get(url, options = {}) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    ...options
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('GET 请求失败:', error);
                throw error;
            }
        },
        
        // POST 请求
        async post(url, data = {}, options = {}) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    body: JSON.stringify(data),
                    ...options
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('POST 请求失败:', error);
                throw error;
            }
        }
    },
    
    // 格式化工具
    format: {
        // 格式化日期
        date(date, format = 'YYYY-MM-DD') {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            
            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('HH', hours)
                .replace('mm', minutes)
                .replace('ss', seconds);
        },
        
        // 格式化数字
        number(num, decimals = 0) {
            return Number(num).toFixed(decimals);
        },
        
        // 格式化文件大小
        fileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    },
    
    // 验证工具
    validate: {
        // 验证邮箱
        email(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        // 验证手机号
        phone(phone) {
            const re = /^1[3-9]\d{9}$/;
            return re.test(phone);
        },
        
        // 验证身份证号
        idCard(idCard) {
            const re = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            return re.test(idCard);
        },
        
        // 验证 URL
        url(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }
    }
};

// 全局导出
window.AoyouUtils = AoyouUtils;