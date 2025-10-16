/**
 * Aoyou Digital 医学科普学习平台 - 移动端体验优化模块
 * 负责触摸交互、手势识别、横竖屏适配等移动端功能
 */

class AoyouMobileManager {
    constructor() {
        this.isTouch = 'ontouchstart' in window;
        this.orientation = window.orientation || 0;
        this.keyboardHeight = 0;
        this.pullToRefreshEnabled = true;
        this.hapticEnabled = 'vibrate' in navigator;
        
        this.init();
    }
    
    /**
     * 初始化移动端管理器
     */
    init() {
        this.setupTouchEvents();
        this.setupOrientationChange();
        this.setupKeyboardDetection();
        this.setupPullToRefresh();
        this.setupHapticFeedback();
        this.setupGestureRecognition();
        this.optimizeScrolling();
        this.preventZoom();
    }
    
    /**
     * 设置触摸事件
     */
    setupTouchEvents() {
        if (!this.isTouch) return;
        
        // 添加触摸反馈
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.touch-feedback');
            if (target) {
                target.classList.add('touching');
            }
        });
        
        document.addEventListener('touchend', (e) => {
            const target = e.target.closest('.touch-feedback');
            if (target) {
                setTimeout(() => {
                    target.classList.remove('touching');
                }, 150);
            }
        });
        
        // 长按事件
        this.setupLongPress();
    }
    
    /**
     * 设置长按事件
     */
    setupLongPress() {
        let longPressTimer;
        let startPos = { x: 0, y: 0 };
        
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('[data-long-press]');
            if (!target) return;
            
            startPos.x = e.touches[0].clientX;
            startPos.y = e.touches[0].clientY;
            
            longPressTimer = setTimeout(() => {
                this.triggerLongPress(target, e);
            }, 500);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!longPressTimer) return;
            
            const deltaX = Math.abs(e.touches[0].clientX - startPos.x);
            const deltaY = Math.abs(e.touches[0].clientY - startPos.y);
            
            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });
        
        document.addEventListener('touchend', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });
    }
    
    /**
     * 触发长按事件
     */
    triggerLongPress(target, originalEvent) {
        this.hapticFeedback('medium');
        
        const event = new CustomEvent('longpress', {
            detail: { target, originalEvent }
        });
        target.dispatchEvent(event);
    }
    
    /**
     * 设置横竖屏变化监听
     */
    setupOrientationChange() {
        const handleOrientationChange = () => {
            const newOrientation = window.orientation || 0;
            
            if (newOrientation !== this.orientation) {
                this.orientation = newOrientation;
                
                // 延迟处理，等待浏览器完成旋转
                setTimeout(() => {
                    this.handleOrientationChange();
                }, 100);
            }
        };
        
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);
    }
    
    /**
     * 处理横竖屏变化
     */
    handleOrientationChange() {
        const isLandscape = Math.abs(this.orientation) === 90;
        
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);
        
        // 触发自定义事件
        const event = new CustomEvent('orientationchange', {
            detail: { orientation: this.orientation, isLandscape }
        });
        document.dispatchEvent(event);
        
        // 优化视频播放器
        this.optimizeVideoForOrientation(isLandscape);
    }
    
    /**
     * 优化视频播放器方向
     */
    optimizeVideoForOrientation(isLandscape) {
        const videoPlayer = document.getElementById('video-player');
        if (!videoPlayer) return;
        
        if (isLandscape && window.innerHeight < 500) {
            // 横屏且屏幕较小时，隐藏其他元素
            document.body.classList.add('video-landscape-mode');
        } else {
            document.body.classList.remove('video-landscape-mode');
        }
    }
    
    /**
     * 设置虚拟键盘检测
     */
    setupKeyboardDetection() {
        const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
        
        const handleViewportChange = () => {
            const currentHeight = window.visualViewport?.height || window.innerHeight;
            const heightDiff = initialViewportHeight - currentHeight;
            
            if (heightDiff > 150) {
                // 键盘弹出
                this.keyboardHeight = heightDiff;
                document.body.classList.add('keyboard-active');
                this.handleKeyboardShow(heightDiff);
            } else {
                // 键盘收起
                this.keyboardHeight = 0;
                document.body.classList.remove('keyboard-active');
                this.handleKeyboardHide();
            }
        };
        
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
        } else {
            window.addEventListener('resize', handleViewportChange);
        }
    }
    
    /**
     * 处理键盘显示
     */
    handleKeyboardShow(height) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            // 滚动到输入框
            setTimeout(() => {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }
    
    /**
     * 处理键盘隐藏
     */
    handleKeyboardHide() {
        // 恢复页面滚动位置
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * 设置下拉刷新
     */
    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        let isRefreshing = false;
        
        const refreshContainer = document.querySelector('.pull-to-refresh');
        if (!refreshContainer) return;
        
        const indicator = document.querySelector('.pull-refresh-indicator');
        
        refreshContainer.addEventListener('touchstart', (e) => {
            if (window.scrollY > 0 || isRefreshing) return;
            
            startY = e.touches[0].clientY;
            isPulling = true;
        });
        
        refreshContainer.addEventListener('touchmove', (e) => {
            if (!isPulling || isRefreshing) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 0 && window.scrollY === 0) {
                e.preventDefault();
                
                const pullDistance = Math.min(deltaY * 0.5, 80);
                
                if (indicator) {
                    indicator.style.transform = `translateX(-50%) translateY(${pullDistance - 60}px)`;
                    indicator.classList.toggle('pulling', pullDistance > 40);
                }
            }
        });
        
        refreshContainer.addEventListener('touchend', () => {
            if (!isPulling || isRefreshing) return;
            
            const deltaY = currentY - startY;
            isPulling = false;
            
            if (deltaY > 80) {
                this.triggerRefresh();
            } else if (indicator) {
                indicator.style.transform = 'translateX(-50%) translateY(-60px)';
                indicator.classList.remove('pulling');
            }
        });
    }
    
    /**
     * 触发刷新
     */
    async triggerRefresh() {
        if (!this.pullToRefreshEnabled) return;
        
        const indicator = document.querySelector('.pull-refresh-indicator');
        if (indicator) {
            indicator.classList.add('refreshing');
        }
        
        this.hapticFeedback('light');
        
        // 触发刷新事件
        const event = new CustomEvent('pulltorefresh');
        document.dispatchEvent(event);
        
        // 模拟刷新延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (indicator) {
            indicator.classList.remove('refreshing', 'pulling');
            indicator.style.transform = 'translateX(-50%) translateY(-60px)';
        }
    }
    
    /**
     * 设置震动反馈
     */
    setupHapticFeedback() {
        // 为特定元素添加震动反馈
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.haptic-feedback');
            if (target) {
                this.hapticFeedback('light');
            }
        });
    }
    
    /**
     * 震动反馈
     */
    hapticFeedback(type = 'light') {
        if (!this.hapticEnabled) return;
        
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [50, 50, 50]
        };
        
        const pattern = patterns[type] || patterns.light;
        navigator.vibrate(pattern);
    }
    
    /**
     * 设置手势识别
     */
    setupGestureRecognition() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // 检测滑动手势
            if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 300) {
                const direction = deltaX > 0 ? 'right' : 'left';
                this.handleSwipe(direction, e);
            }
        });
    }
    
    /**
     * 处理滑动手势
     */
    handleSwipe(direction, event) {
        const swipeEvent = new CustomEvent('swipe', {
            detail: { direction, originalEvent: event }
        });
        document.dispatchEvent(swipeEvent);
    }
    
    /**
     * 优化滚动
     */
    optimizeScrolling() {
        // 添加平滑滚动
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // 优化滚动性能
        const scrollContainers = document.querySelectorAll('.scroll-container');
        scrollContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
        });
    }
    
    /**
     * 防止缩放
     */
    preventZoom() {
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 防止手势缩放
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    }
    
    /**
     * 显示加载动画
     */
    showLoading(text = '加载中...') {
        let overlay = document.getElementById('loading-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner-large"></div>
                <div class="loading-text">${text}</div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.classList.remove('hidden');
    }
    
    /**
     * 隐藏加载动画
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
    
    /**
     * 页面过渡动画
     */
    pageTransition(element) {
        if (element) {
            element.classList.add('page-transition');
            setTimeout(() => {
                element.classList.remove('page-transition');
            }, 300);
        }
    }
    
    /**
     * 检测网络状态
     */
    setupNetworkDetection() {
        const updateNetworkStatus = () => {
            const isOnline = navigator.onLine;
            document.body.classList.toggle('offline', !isOnline);
            
            if (!isOnline) {
                this.showToast('网络连接已断开');
            }
        };
        
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        updateNetworkStatus();
    }
    
    /**
     * 显示提示消息
     */
    showToast(message) {
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.showToast(message);
        }
    }
}

// 页面加载完成后初始化移动端管理器
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouMobileMgr = new AoyouMobileMgr();
    
    // 监听自定义事件
    document.addEventListener('orientationchange', (e) => {
        console.log('屏幕方向改变:', e.detail);
    });
    
    document.addEventListener('swipe', (e) => {
        console.log('滑动手势:', e.detail.direction);
    });
    
    document.addEventListener('pulltorefresh', () => {
        console.log('下拉刷新触发');
        // 刷新页面数据
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.refreshData();
        }
    });
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouMobileMgr;
}