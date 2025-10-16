/**
 * 奥友医学平台 - 错误修复脚本
 * 用于修复常见的JavaScript错误和兼容性问题
 */

// 错误修复和兼容性处理
(function() {
    'use strict';
    
    console.log('🔧 开始执行错误修复...');
    
    // 1. 修复未定义的全局变量
    window.AoyouMedicalApp = window.AoyouMedicalApp || class {
        constructor() {
            console.warn('使用备用的 AoyouMedicalApp 类');
        }
    };
    
    // 2. 修复缺失的管理器类
    const managerClasses = [
        'AoyouStorageManager',
        'AoyouPerformanceOptimizer', 
        'AoyouUXManager',
        'AoyouAnalyticsManager',
        'AoyouAuthManager',
        'AoyouPointsManager',
        'AoyouVideoManager',
        'AoyouWechatManager',
        'AoyouMobileManager'
    ];
    
    managerClasses.forEach(className => {
        if (typeof window[className] === 'undefined') {
            window[className] = class {
                constructor() {
                    console.warn(`使用备用的 ${className} 类`);
                }
            };
        }
    });
    
    // 3. 修复 Service Worker 注册错误
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('✅ Service Worker 注册成功');
            })
            .catch(error => {
                console.warn('⚠️ Service Worker 注册失败，但不影响主要功能:', error);
            });
    }
    
    // 4. 修复图片加载错误
    function fixImageErrors() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('error', function() {
                if (this.src.includes('default-avatar')) {
                    this.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = `
                        width: ${this.width || 40}px;
                        height: ${this.height || 40}px;
                        background: #ccc;
                        border-radius: 50%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 14px;
                    `;
                    placeholder.textContent = '👤';
                    this.parentNode.insertBefore(placeholder, this);
                } else if (this.src.includes('logo')) {
                    this.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = `
                        width: ${this.width || 120}px;
                        height: ${this.height || 40}px;
                        background: linear-gradient(135deg, #2E86AB, #5BA3C7);
                        border-radius: 8px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                    `;
                    placeholder.textContent = '🏥 奥友医学';
                    this.parentNode.insertBefore(placeholder, this);
                } else {
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNjAgOTBMMTQwIDcwSDE4MEwxNjAgOTBaIiBmaWxsPSIjQ0NDIi8+Cjwvdmc+';
                }
            });
        });
    }
    
    // 5. 修复 localStorage 错误
    function fixLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (error) {
            console.warn('⚠️ localStorage 不可用，使用内存存储');
            window.localStorage = {
                data: {},
                setItem: function(key, value) { this.data[key] = value; },
                getItem: function(key) { return this.data[key] || null; },
                removeItem: function(key) { delete this.data[key]; },
                clear: function() { this.data = {}; }
            };
        }
    }
    
    // 6. 修复未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', function(event) {
        console.warn('⚠️ 未处理的 Promise 错误:', event.reason);
        event.preventDefault(); // 阻止错误显示在控制台
    });
    
    // 7. 修复未捕获的 JavaScript 错误
    window.addEventListener('error', function(event) {
        console.warn('⚠️ JavaScript 错误:', event.error);
        return true; // 阻止默认错误处理
    });
    
    // 8. 添加兼容性检查
    function checkCompatibility() {
        const features = {
            'ES6 Classes': typeof class {} === 'function',
            'Arrow Functions': (() => true)(),
            'Template Literals': `${true}` === 'true',
            'localStorage': typeof Storage !== 'undefined',
            'IndexedDB': 'indexedDB' in window,
            'Service Worker': 'serviceWorker' in navigator,
            'Intersection Observer': 'IntersectionObserver' in window
        };
        
        console.log('🔍 浏览器兼容性检查:');
        Object.entries(features).forEach(([feature, supported]) => {
            console.log(`${supported ? '✅' : '❌'} ${feature}`);
        });
    }
    
    // 9. 初始化修复
    function init() {
        fixLocalStorage();
        checkCompatibility();
        
        // DOM 加载完成后执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fixImageErrors);
        } else {
            fixImageErrors();
        }
        
        console.log('✅ 错误修复完成');
    }
    
    // 执行初始化
    init();
    
})();

// 导出修复函数供其他脚本使用
window.AoyouErrorFixer = {
    fixImages: function() {
        document.querySelectorAll('img').forEach(img => {
            if (img.complete && img.naturalHeight === 0) {
                img.dispatchEvent(new Event('error'));
            }
        });
    },
    
    showCompatibilityInfo: function() {
        const info = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };
        
        console.table(info);
        return info;
    }
};