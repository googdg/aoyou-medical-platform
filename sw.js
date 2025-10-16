/**
 * Aoyou Digital 医学科普学习平台 - Service Worker
 * 负责缓存策略、离线支持和后台同步
 */

const CACHE_NAME = 'aoyou-medical-v1.0.0';
const STATIC_CACHE = 'aoyou-static-v1';
const DYNAMIC_CACHE = 'aoyou-dynamic-v1';
const IMAGE_CACHE = 'aoyou-images-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/aoyou-medical-platform.html',
    '/css/aoyou-medical.css',
    '/js/aoyou-medical-app.js',
    '/js/aoyou-medical-auth.js',
    '/js/aoyou-medical-points.js',
    '/js/aoyou-medical-video.js',
    '/js/aoyou-medical-storage.js',
    '/js/aoyou-medical-performance.js',
    '/images/default-avatar.png',
    '/images/default-image.jpg'
];

// 需要网络优先的资源
const NETWORK_FIRST = [
    '/api/',
    'https://res.wx.qq.com/'
];

// 需要缓存优先的资源
const CACHE_FIRST = [
    '/images/',
    '/css/',
    '/js/'
];

/**
 * Service Worker安装事件
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker 安装中...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('缓存静态资源...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('静态资源缓存完成');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('静态资源缓存失败:', error);
            })
    );
});

/**
 * Service Worker激活事件
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker 激活中...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // 删除旧版本缓存
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== IMAGE_CACHE) {
                            console.log('删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker 激活完成');
                return self.clients.claim();
            })
    );
});

/**
 * 网络请求拦截
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 跳过非GET请求
    if (request.method !== 'GET') {
        return;
    }
    
    // 跳过chrome-extension请求
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // 根据资源类型选择缓存策略
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isImageRequest(request.url)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
    } else if (isAPIRequest(request.url)) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    } else if (isDynamicContent(request.url)) {
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    } else {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
});

/**
 * 缓存优先策略
 */
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('缓存优先策略失败:', error);
        return getOfflineFallback(request);
    }
}

/**
 * 网络优先策略
 */
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('网络请求失败，尝试缓存:', request.url);
        
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return getOfflineFallback(request);
    }
}

/**
 * 过期重新验证策略
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // 网络失败时返回缓存
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

/**
 * 获取离线回退页面
 */
function getOfflineFallback(request) {
    if (request.destination === 'document') {
        return caches.match('/aoyou-medical-platform.html');
    }
    
    if (request.destination === 'image') {
        return caches.match('/images/default-image.jpg');
    }
    
    return new Response('离线状态', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
    });
}

/**
 * 判断是否为静态资源
 */
function isStaticAsset(url) {
    return CACHE_FIRST.some(pattern => url.includes(pattern)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.woff') ||
           url.includes('.woff2');
}

/**
 * 判断是否为图片请求
 */
function isImageRequest(url) {
    return url.includes('/images/') ||
           /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

/**
 * 判断是否为API请求
 */
function isAPIRequest(url) {
    return NETWORK_FIRST.some(pattern => url.includes(pattern)) ||
           url.includes('/api/');
}

/**
 * 判断是否为动态内容
 */
function isDynamicContent(url) {
    return url.includes('aoyou-medical-platform.html') ||
           url.includes('/data/');
}

/**
 * 后台同步事件
 */
self.addEventListener('sync', (event) => {
    console.log('后台同步事件:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * 执行后台同步
 */
async function doBackgroundSync() {
    try {
        // 这里可以执行数据同步逻辑
        console.log('执行后台数据同步...');
        
        // 同步用户数据
        await syncUserData();
        
        // 同步积分记录
        await syncPointRecords();
        
        console.log('后台同步完成');
    } catch (error) {
        console.error('后台同步失败:', error);
        throw error;
    }
}

/**
 * 同步用户数据
 */
async function syncUserData() {
    // 实现用户数据同步逻辑
    console.log('同步用户数据...');
}

/**
 * 同步积分记录
 */
async function syncPointRecords() {
    // 实现积分记录同步逻辑
    console.log('同步积分记录...');
}

/**
 * 推送通知事件
 */
self.addEventListener('push', (event) => {
    console.log('收到推送消息:', event);
    
    const options = {
        body: event.data ? event.data.text() : '您有新的医学内容更新',
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '查看详情',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: '关闭',
                icon: '/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('奥友医学', options)
    );
});

/**
 * 通知点击事件
 */
self.addEventListener('notificationclick', (event) => {
    console.log('通知被点击:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/aoyou-medical-platform.html')
        );
    }
});

/**
 * 消息事件
 */
self.addEventListener('message', (event) => {
    console.log('收到消息:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

/**
 * 缓存管理
 */
async function manageCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        // 删除最旧的缓存项
        const itemsToDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(
            itemsToDelete.map(key => cache.delete(key))
        );
    }
}

/**
 * 定期清理缓存
 */
setInterval(() => {
    manageCacheSize(DYNAMIC_CACHE, 50);
    manageCacheSize(IMAGE_CACHE, 100);
}, 24 * 60 * 60 * 1000); // 每24小时清理一次