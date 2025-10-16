# Aoyou Digital - 移动端开发指南

## 📱 移动端适配策略

### 视口配置
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 安全区域适配
```css
/* 支持刘海屏等异形屏 */
--safe-area-top: env(safe-area-inset-top);
--safe-area-bottom: env(safe-area-inset-bottom);
```

### 触摸优化
- 禁用双击缩放
- 禁用长按菜单
- 优化点击响应
- 防止意外选择

## 🎨 设计规范

### 尺寸标准
- 最小点击区域：44px × 44px
- 文字最小尺寸：14px
- 行高建议：1.4-1.6
- 边距标准：8px、16px、24px、32px

### 颜色系统
```css
--primary-color: #2196F3;    /* 主色调 */
--secondary-color: #FF9800;  /* 辅助色 */
--success-color: #4CAF50;    /* 成功色 */
--warning-color: #FFC107;    /* 警告色 */
--error-color: #F44336;      /* 错误色 */
```

### 字体系统
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 
             'Helvetica Neue', Helvetica, Arial, sans-serif;
```

## 🔧 交互模式

### 导航模式
1. **底部标签导航** - 主要页面切换
2. **侧边滑出菜单** - 更多功能入口
3. **页面内导航** - 内容区域跳转

### 手势支持
- 点击：主要交互方式
- 滑动：页面切换、菜单操作
- 长按：上下文菜单（可选）
- 双击：禁用（防止误操作）

### 反馈机制
- 视觉反馈：按钮状态变化
- 触觉反馈：振动（可选）
- 音频反馈：提示音（可选）
- Toast 通知：操作结果

## ⚡ 性能优化

### 加载优化
```javascript
// 预加载关键资源
<link rel="preload" href="css/main.css" as="style">
<link rel="preload" href="js/main.js" as="script">

// 懒加载非关键资源
const lazyLoad = (element) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 加载资源
                observer.unobserve(entry.target);
            }
        });
    });
    observer.observe(element);
};
```

### 滚动优化
```css
/* 启用硬件加速 */
-webkit-overflow-scrolling: touch;
transform: translateZ(0);

/* 优化滚动性能 */
will-change: transform;
```

### 事件优化
```javascript
// 防抖处理
const debouncedResize = AoyouUtils.event.debounce(() => {
    // 处理窗口大小变化
}, 250);

// 节流处理
const throttledScroll = AoyouUtils.event.throttle(() => {
    // 处理滚动事件
}, 16); // 60fps
```

## 📐 响应式设计

### 断点系统
```css
/* 手机竖屏 */
@media (max-width: 480px) { }

/* 手机横屏 / 小平板 */
@media (min-width: 481px) and (max-width: 768px) { }

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) { }

/* 桌面 */
@media (min-width: 1025px) { }
```

### 弹性布局
```css
/* Flexbox 布局 */
.container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Grid 布局 */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}
```

## 🔒 兼容性处理

### iOS Safari 特殊处理
```css
/* 修复 iOS Safari 的 100vh 问题 */
.full-height {
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
}
```

```javascript
// 动态计算视口高度
const updateVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', updateVH);
window.addEventListener('orientationchange', updateVH);
```

### Android WebView 优化
```css
/* 修复 Android 输入框缩放 */
input, textarea, select {
    font-size: 16px; /* 防止缩放 */
}

/* 优化 Android 滚动 */
body {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}
```

## 🧪 测试策略

### 设备测试
- iPhone SE (375×667)
- iPhone 12 (390×844)
- iPhone 12 Pro Max (428×926)
- Samsung Galaxy S21 (360×800)
- iPad (768×1024)

### 浏览器测试
- Safari (iOS)
- Chrome (Android)
- 微信内置浏览器
- QQ 浏览器
- UC 浏览器

### 功能测试
- 触摸交互
- 页面切换
- 表单输入
- 网络请求
- 本地存储
- 横竖屏切换

## 📊 性能监控

### 关键指标
```javascript
// 页面加载时间
const loadTime = performance.now();

// 首次内容绘制
const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
        }
    });
});
observer.observe({ entryTypes: ['paint'] });

// 内存使用
if ('memory' in performance) {
    console.log('Memory:', performance.memory);
}
```

### 优化建议
1. **减少 DOM 操作**：批量更新，使用 DocumentFragment
2. **优化图片**：WebP 格式，适当压缩
3. **缓存策略**：合理使用 localStorage 和 sessionStorage
4. **代码分割**：按需加载非关键功能
5. **CDN 加速**：静态资源使用 CDN

## 🚀 部署建议

### PWA 配置
```json
{
  "name": "Aoyou Digital",
  "short_name": "Aoyou",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#2196F3"
}
```

### Service Worker
```javascript
// 缓存策略
const CACHE_NAME = 'aoyou-v1';
const urlsToCache = [
    '/',
    '/css/main.css',
    '/js/main.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});
```

### HTTPS 部署
- 必须使用 HTTPS（PWA 要求）
- 配置 SSL 证书
- 启用 HTTP/2
- 设置安全头部

---

这个指南涵盖了移动端 H5 开发的核心要点，确保 Aoyou Digital 在各种移动设备上都能提供优秀的用户体验。