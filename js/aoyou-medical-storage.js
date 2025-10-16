/**
 * Aoyou Digital 医学科普学习平台 - 数据持久化模块
 * 负责本地存储、数据缓存、离线同步和数据备份恢复
 */

class AoyouStorageManager {
    constructor() {
        this.dbName = 'AoyouMedicalDB';
        this.dbVersion = 1;
        this.db = null;
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        
        this.init();
    }
    
    /**
     * 初始化存储管理器
     */
    async init() {
        try {
            await this.initIndexedDB();
            this.setupNetworkListener();
            this.setupPeriodicSync();
            this.migrateLocalStorageData();
            console.log('存储管理器初始化成功');
        } catch (error) {
            console.error('存储管理器初始化失败:', error);
        }
    }
    
    /**
     * 初始化IndexedDB
     */
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 用户数据存储
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('inviteCode', 'inviteCode', { unique: true });
                }
                
                // 视频数据存储
                if (!db.objectStoreNames.contains('videos')) {
                    const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
                    videoStore.createIndex('category', 'category', { unique: false });
                    videoStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                }
                
                // 积分记录存储
                if (!db.objectStoreNames.contains('pointRecords')) {
                    const pointStore = db.createObjectStore('pointRecords', { keyPath: 'id' });
                    pointStore.createIndex('userId', 'userId', { unique: false });
                    pointStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // 观看历史存储
                if (!db.objectStoreNames.contains('watchHistory')) {
                    const historyStore = db.createObjectStore('watchHistory', { keyPath: 'id' });
                    historyStore.createIndex('userId', 'userId', { unique: false });
                    historyStore.createIndex('videoId', 'videoId', { unique: false });
                }
                
                // 收藏数据存储
                if (!db.objectStoreNames.contains('favorites')) {
                    const favStore = db.createObjectStore('favorites', { keyPath: 'id' });
                    favStore.createIndex('userId', 'userId', { unique: false });
                    favStore.createIndex('videoId', 'videoId', { unique: false });
                }
                
                // 同步队列存储
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id' });
                }
                
                // 缓存数据存储
                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                    cacheStore.createIndex('expiry', 'expiry', { unique: false });
                }
            };
        });
    }
    
    /**
     * 保存数据到IndexedDB
     */
    async saveToIndexedDB(storeName, data) {
        if (!this.db) return false;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * 从IndexedDB读取数据
     */
    async getFromIndexedDB(storeName, key) {
        if (!this.db) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * 从IndexedDB查询数据
     */
    async queryFromIndexedDB(storeName, indexName, value) {
        if (!this.db) return [];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * 删除IndexedDB数据
     */
    async deleteFromIndexedDB(storeName, key) {
        if (!this.db) return false;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * 保存用户数据
     */
    async saveUserData(userData) {
        try {
            // 保存到IndexedDB
            await this.saveToIndexedDB('users', userData);
            
            // 同时保存到localStorage作为备份
            const users = JSON.parse(localStorage.getItem('aoyou_users') || '{}');
            users[userData.id] = userData;
            localStorage.setItem('aoyou_users', JSON.stringify(users));
            
            return true;
        } catch (error) {
            console.error('保存用户数据失败:', error);
            return false;
        }
    }
    
    /**
     * 获取用户数据
     */
    async getUserData(userId) {
        try {
            // 优先从IndexedDB获取
            let userData = await this.getFromIndexedDB('users', userId);
            
            if (!userData) {
                // 从localStorage获取备份
                const users = JSON.parse(localStorage.getItem('aoyou_users') || '{}');
                userData = users[userId];
            }
            
            return userData;
        } catch (error) {
            console.error('获取用户数据失败:', error);
            return null;
        }
    }
    
    /**
     * 保存视频数据
     */
    async saveVideoData(videoData) {
        try {
            if (Array.isArray(videoData)) {
                // 批量保存
                for (const video of videoData) {
                    await this.saveToIndexedDB('videos', video);
                }
            } else {
                await this.saveToIndexedDB('videos', videoData);
            }
            
            return true;
        } catch (error) {
            console.error('保存视频数据失败:', error);
            return false;
        }
    }
    
    /**
     * 获取视频数据
     */
    async getVideoData(videoId) {
        try {
            return await this.getFromIndexedDB('videos', videoId);
        } catch (error) {
            console.error('获取视频数据失败:', error);
            return null;
        }
    }
    
    /**
     * 按分类获取视频
     */
    async getVideosByCategory(category) {
        try {
            return await this.queryFromIndexedDB('videos', 'category', category);
        } catch (error) {
            console.error('按分类获取视频失败:', error);
            return [];
        }
    }
    
    /**
     * 保存积分记录
     */
    async savePointRecord(record) {
        try {
            await this.saveToIndexedDB('pointRecords', record);
            
            // 添加到同步队列
            if (this.isOnline) {
                this.addToSyncQueue('pointRecord', 'create', record);
            }
            
            return true;
        } catch (error) {
            console.error('保存积分记录失败:', error);
            return false;
        }
    }
    
    /**
     * 获取用户积分记录
     */
    async getUserPointRecords(userId) {
        try {
            return await this.queryFromIndexedDB('pointRecords', 'userId', userId);
        } catch (error) {
            console.error('获取积分记录失败:', error);
            return [];
        }
    }
    
    /**
     * 保存观看历史
     */
    async saveWatchHistory(history) {
        try {
            await this.saveToIndexedDB('watchHistory', history);
            return true;
        } catch (error) {
            console.error('保存观看历史失败:', error);
            return false;
        }
    }
    
    /**
     * 获取观看历史
     */
    async getWatchHistory(userId) {
        try {
            return await this.queryFromIndexedDB('watchHistory', 'userId', userId);
        } catch (error) {
            console.error('获取观看历史失败:', error);
            return [];
        }
    }
    
    /**
     * 保存收藏数据
     */
    async saveFavorite(favorite) {
        try {
            await this.saveToIndexedDB('favorites', favorite);
            return true;
        } catch (error) {
            console.error('保存收藏失败:', error);
            return false;
        }
    }
    
    /**
     * 获取用户收藏
     */
    async getUserFavorites(userId) {
        try {
            return await this.queryFromIndexedDB('favorites', 'userId', userId);
        } catch (error) {
            console.error('获取收藏失败:', error);
            return [];
        }
    }
    
    /**
     * 缓存数据
     */
    async cacheData(key, data, ttl = 3600000) { // 默认1小时
        try {
            const cacheItem = {
                key: key,
                data: data,
                timestamp: Date.now(),
                expiry: Date.now() + ttl
            };
            
            await this.saveToIndexedDB('cache', cacheItem);
            return true;
        } catch (error) {
            console.error('缓存数据失败:', error);
            return false;
        }
    }
    
    /**
     * 获取缓存数据
     */
    async getCachedData(key) {
        try {
            const cacheItem = await this.getFromIndexedDB('cache', key);
            
            if (!cacheItem) return null;
            
            // 检查是否过期
            if (Date.now() > cacheItem.expiry) {
                await this.deleteFromIndexedDB('cache', key);
                return null;
            }
            
            return cacheItem.data;
        } catch (error) {
            console.error('获取缓存数据失败:', error);
            return null;
        }
    }
    
    /**
     * 清理过期缓存
     */
    async cleanExpiredCache() {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const index = store.index('expiry');
            const range = IDBKeyRange.upperBound(Date.now());
            
            const request = index.openCursor(range);
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
        } catch (error) {
            console.error('清理过期缓存失败:', error);
        }
    }
    
    /**
     * 添加到同步队列
     */
    async addToSyncQueue(type, action, data) {
        const syncItem = {
            id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: type,
            action: action,
            data: data,
            timestamp: Date.now(),
            retryCount: 0
        };
        
        this.syncQueue.push(syncItem);
        await this.saveToIndexedDB('syncQueue', syncItem);
    }
    
    /**
     * 处理同步队列
     */
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;
        
        const itemsToSync = [...this.syncQueue];
        
        for (const item of itemsToSync) {
            try {
                await this.syncItem(item);
                
                // 同步成功，从队列中移除
                this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
                await this.deleteFromIndexedDB('syncQueue', item.id);
                
            } catch (error) {
                console.error('同步失败:', item, error);
                
                // 增加重试次数
                item.retryCount++;
                
                // 超过最大重试次数则移除
                if (item.retryCount > 3) {
                    this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
                    await this.deleteFromIndexedDB('syncQueue', item.id);
                }
            }
        }
    }
    
    /**
     * 同步单个项目
     */
    async syncItem(item) {
        // 这里应该调用实际的API接口
        // 模拟API调用
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90%成功率
                    resolve();
                } else {
                    reject(new Error('同步失败'));
                }
            }, 1000);
        });
    }
    
    /**
     * 设置网络监听
     */
    setupNetworkListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('网络已连接，开始同步数据');
            this.processSyncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('网络已断开，数据将在本地缓存');
        });
    }
    
    /**
     * 设置定期同步
     */
    setupPeriodicSync() {
        // 每5分钟尝试同步一次
        setInterval(() => {
            if (this.isOnline) {
                this.processSyncQueue();
                this.cleanExpiredCache();
            }
        }, 5 * 60 * 1000);
    }
    
    /**
     * 迁移localStorage数据
     */
    async migrateLocalStorageData() {
        try {
            // 迁移用户数据
            const users = JSON.parse(localStorage.getItem('aoyou_users') || '{}');
            for (const userId in users) {
                await this.saveUserData(users[userId]);
            }
            
            // 迁移积分记录
            const pointRecords = JSON.parse(localStorage.getItem('aoyou_point_records') || '[]');
            for (const record of pointRecords) {
                await this.saveToIndexedDB('pointRecords', record);
            }
            
            // 迁移观看历史
            const watchHistory = JSON.parse(localStorage.getItem('aoyou_watch_history') || '[]');
            for (const history of watchHistory) {
                await this.saveWatchHistory(history);
            }
            
            // 迁移收藏数据
            const favorites = JSON.parse(localStorage.getItem('aoyou_favorites') || '[]');
            for (const favorite of favorites) {
                await this.saveFavorite(favorite);
            }
            
            console.log('数据迁移完成');
        } catch (error) {
            console.error('数据迁移失败:', error);
        }
    }
    
    /**
     * 导出数据备份
     */
    async exportBackup() {
        try {
            const backup = {
                version: 1,
                timestamp: Date.now(),
                data: {}
            };
            
            // 导出所有存储的数据
            const stores = ['users', 'videos', 'pointRecords', 'watchHistory', 'favorites'];
            
            for (const storeName of stores) {
                backup.data[storeName] = await this.getAllFromStore(storeName);
            }
            
            const backupJson = JSON.stringify(backup);
            const blob = new Blob([backupJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `aoyou_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('导出备份失败:', error);
            return false;
        }
    }
    
    /**
     * 导入数据备份
     */
    async importBackup(file) {
        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            
            if (!backup.version || !backup.data) {
                throw new Error('备份文件格式不正确');
            }
            
            // 导入数据
            for (const storeName in backup.data) {
                const items = backup.data[storeName];
                for (const item of items) {
                    await this.saveToIndexedDB(storeName, item);
                }
            }
            
            return true;
        } catch (error) {
            console.error('导入备份失败:', error);
            return false;
        }
    }
    
    /**
     * 获取存储中的所有数据
     */
    async getAllFromStore(storeName) {
        if (!this.db) return [];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * 清空所有数据
     */
    async clearAllData() {
        try {
            const stores = ['users', 'videos', 'pointRecords', 'watchHistory', 'favorites', 'cache', 'syncQueue'];
            
            for (const storeName of stores) {
                await this.clearStore(storeName);
            }
            
            // 同时清空localStorage
            const keys = Object.keys(localStorage).filter(key => key.startsWith('aoyou_'));
            keys.forEach(key => localStorage.removeItem(key));
            
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }
    
    /**
     * 清空指定存储
     */
    async clearStore(storeName) {
        if (!this.db) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * 获取存储使用情况
     */
    async getStorageUsage() {
        try {
            const usage = {
                indexedDB: 0,
                localStorage: 0,
                total: 0
            };
            
            // 计算IndexedDB使用量
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                usage.indexedDB = estimate.usage || 0;
            }
            
            // 计算localStorage使用量
            let localStorageSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    localStorageSize += localStorage[key].length + key.length;
                }
            }
            usage.localStorage = localStorageSize;
            
            usage.total = usage.indexedDB + usage.localStorage;
            
            return usage;
        } catch (error) {
            console.error('获取存储使用情况失败:', error);
            return { indexedDB: 0, localStorage: 0, total: 0 };
        }
    }
}

// 页面加载完成后初始化存储管理器
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouStorageManager = new AoyouStorageManager();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouStorageManager;
}