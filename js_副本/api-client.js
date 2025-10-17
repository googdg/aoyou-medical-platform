// API Client Service
// 创建API客户端服务、实现动态内容加载、添加数据缓存和更新机制、处理API错误和加载状态

class APIClient {
    constructor() {
        this.baseURL = '/api';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
        this.requestQueue = new Map();
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.loadingStates = new Map();
        this.errorHandlers = new Map();
        this.interceptors = {
            request: [],
            response: []
        };
        
        this.init();
    }

    init() {
        this.setupDefaultInterceptors();
        this.setupNetworkStatusListener();
        console.log('API Client initialized');
    }

    // 设置默认拦截器
    setupDefaultInterceptors() {
        // 请求拦截器 - 添加认证头
        this.addRequestInterceptor((config) => {
            const token = this.getAuthToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            
            // 添加内容类型
            if (config.data && !config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
            }
            
            return config;
        });

        // 响应拦截器 - 处理通用错误
        this.addResponseInterceptor(
            (response) => response,
            (error) => {
                if (error.status === 401) {
                    this.handleUnauthorized();
                } else if (error.status === 429) {
                    this.handleRateLimit(error);
                }
                return Promise.reject(error);
            }
        );
    }

    // 设置网络状态监听
    setupNetworkStatusListener() {
        window.addEventListener('online', () => {
            console.log('Network connection restored');
            this.retryFailedRequests();
        });

        window.addEventListener('offline', () => {
            console.log('Network connection lost');
        });
    }

    // 通用请求方法
    async request(config) {
        const requestId = this.generateRequestId(config);
        
        try {
            // 检查是否有相同的请求正在进行
            if (this.requestQueue.has(requestId)) {
                return await this.requestQueue.get(requestId);
            }

            // 检查缓存
            if (config.method === 'GET' && config.cache !== false) {
                const cachedResponse = this.getFromCache(requestId);
                if (cachedResponse) {
                    return cachedResponse;
                }
            }

            // 设置加载状态
            this.setLoadingState(requestId, true);

            // 应用请求拦截器
            const processedConfig = await this.applyRequestInterceptors(config);

            // 创建请求Promise
            const requestPromise = this.executeRequest(processedConfig);
            this.requestQueue.set(requestId, requestPromise);

            // 执行请求
            const response = await requestPromise;

            // 应用响应拦截器
            const processedResponse = await this.applyResponseInterceptors(response);

            // 缓存GET请求的响应
            if (config.method === 'GET' && config.cache !== false) {
                this.setCache(requestId, processedResponse);
            }

            return processedResponse;

        } catch (error) {
            // 处理错误
            const processedError = await this.applyResponseInterceptors(null, error);
            throw processedError;
        } finally {
            // 清理
            this.setLoadingState(requestId, false);
            this.requestQueue.delete(requestId);
        }
    }

    // 执行实际的HTTP请求
    async executeRequest(config) {
        const { url, method = 'GET', data, headers = {}, timeout = 10000 } = config;
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const fetchConfig = {
                method: method.toUpperCase(),
                headers: headers,
                signal: controller.signal
            };

            if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                fetchConfig.body = typeof data === 'string' ? data : JSON.stringify(data);
            }

            const response = await fetch(fullUrl, fetchConfig);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new APIError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    response
                );
            }

            const contentType = response.headers.get('content-type');
            let responseData;

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            return {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                config: config
            };

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new APIError('Request timeout', 408);
            }
            
            if (error instanceof APIError) {
                throw error;
            }
            
            throw new APIError(error.message, 0, null, error);
        }
    }

    // GET请求
    async get(url, config = {}) {
        return this.request({ ...config, method: 'GET', url });
    }

    // POST请求
    async post(url, data, config = {}) {
        return this.request({ ...config, method: 'POST', url, data });
    }

    // PUT请求
    async put(url, data, config = {}) {
        return this.request({ ...config, method: 'PUT', url, data });
    }

    // PATCH请求
    async patch(url, data, config = {}) {
        return this.request({ ...config, method: 'PATCH', url, data });
    }

    // DELETE请求
    async delete(url, config = {}) {
        return this.request({ ...config, method: 'DELETE', url });
    }

    // 博客相关API方法
    async getBlogPosts(language = 'en', page = 1, limit = 10) {
        return this.get(`/posts`, {
            params: { language, page, limit },
            cache: true
        });
    }

    async getBlogPost(id, language = 'en') {
        return this.get(`/posts/${id}`, {
            params: { language },
            cache: true
        });
    }

    async createBlogPost(postData) {
        return this.post('/posts', postData);
    }

    async updateBlogPost(id, postData) {
        return this.put(`/posts/${id}`, postData);
    }

    async deleteBlogPost(id) {
        return this.delete(`/posts/${id}`);
    }

    async getCategories(language = 'en') {
        return this.get('/categories', {
            params: { language },
            cache: true
        });
    }

    async getTags(language = 'en') {
        return this.get('/tags', {
            params: { language },
            cache: true
        });
    }

    // 媒体文件相关API
    async uploadFile(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request({
            method: 'POST',
            url: '/media/upload',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: onProgress,
            cache: false
        });
    }

    async getMediaFiles(page = 1, limit = 20) {
        return this.get('/media', {
            params: { page, limit },
            cache: true
        });
    }

    async deleteMediaFile(id) {
        return this.delete(`/media/${id}`);
    }

    // 用户认证相关API
    async login(credentials) {
        const response = await this.post('/auth/login', credentials, { cache: false });
        if (response.data.token) {
            this.setAuthToken(response.data.token);
        }
        return response;
    }

    async logout() {
        const response = await this.post('/auth/logout', {}, { cache: false });
        this.removeAuthToken();
        return response;
    }

    async refreshToken() {
        const response = await this.post('/auth/refresh', {}, { cache: false });
        if (response.data.token) {
            this.setAuthToken(response.data.token);
        }
        return response;
    }

    async getCurrentUser() {
        return this.get('/auth/me', { cache: true });
    }

    // 统计和分析API
    async getAnalytics(startDate, endDate) {
        return this.get('/analytics', {
            params: { startDate, endDate },
            cache: true
        });
    }

    async getPostViews(postId) {
        return this.get(`/analytics/posts/${postId}/views`, { cache: true });
    }

    // 缓存管理
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache(pattern) {
        if (pattern) {
            for (const [key] of this.cache) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    // 加载状态管理
    setLoadingState(requestId, isLoading) {
        this.loadingStates.set(requestId, isLoading);
        this.notifyLoadingStateChange(requestId, isLoading);
    }

    isLoading(requestId) {
        return this.loadingStates.get(requestId) || false;
    }

    notifyLoadingStateChange(requestId, isLoading) {
        const event = new CustomEvent('apiLoadingStateChange', {
            detail: { requestId, isLoading }
        });
        window.dispatchEvent(event);
    }

    // 错误处理
    handleUnauthorized() {
        this.removeAuthToken();
        window.dispatchEvent(new CustomEvent('apiUnauthorized'));
    }

    handleRateLimit(error) {
        const retryAfter = error.response?.headers?.get('Retry-After') || 60;
        console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
        
        setTimeout(() => {
            this.retryFailedRequests();
        }, retryAfter * 1000);
    }

    // 重试失败的请求
    async retryFailedRequests() {
        // 实现重试逻辑
        console.log('Retrying failed requests...');
    }

    // 拦截器管理
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    addResponseInterceptor(successInterceptor, errorInterceptor) {
        this.interceptors.response.push({
            success: successInterceptor,
            error: errorInterceptor
        });
    }

    async applyRequestInterceptors(config) {
        let processedConfig = { ...config };
        
        for (const interceptor of this.interceptors.request) {
            processedConfig = await interceptor(processedConfig);
        }
        
        return processedConfig;
    }

    async applyResponseInterceptors(response, error) {
        if (error) {
            let processedError = error;
            
            for (const interceptor of this.interceptors.response) {
                if (interceptor.error) {
                    try {
                        processedError = await interceptor.error(processedError);
                    } catch (e) {
                        processedError = e;
                    }
                }
            }
            
            return processedError;
        } else {
            let processedResponse = response;
            
            for (const interceptor of this.interceptors.response) {
                if (interceptor.success) {
                    processedResponse = await interceptor.success(processedResponse);
                }
            }
            
            return processedResponse;
        }
    }

    // 认证令牌管理
    getAuthToken() {
        return localStorage.getItem('auth_token');
    }

    setAuthToken(token) {
        localStorage.setItem('auth_token', token);
    }

    removeAuthToken() {
        localStorage.removeItem('auth_token');
    }

    // 工具方法
    generateRequestId(config) {
        const { method = 'GET', url, data } = config;
        const dataString = data ? JSON.stringify(data) : '';
        return `${method}:${url}:${btoa(dataString).slice(0, 10)}`;
    }

    // 批量请求
    async batch(requests) {
        const promises = requests.map(config => this.request(config));
        return Promise.allSettled(promises);
    }

    // 并发控制
    async concurrent(requests, limit = 5) {
        const results = [];
        
        for (let i = 0; i < requests.length; i += limit) {
            const batch = requests.slice(i, i + limit);
            const batchPromises = batch.map(config => this.request(config));
            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults);
        }
        
        return results;
    }

    // 获取API状态
    getStatus() {
        return {
            cacheSize: this.cache.size,
            activeRequests: this.requestQueue.size,
            loadingStates: Array.from(this.loadingStates.entries()),
            isOnline: navigator.onLine
        };
    }

    // 销毁方法
    destroy() {
        this.cache.clear();
        this.requestQueue.clear();
        this.loadingStates.clear();
        this.errorHandlers.clear();
    }
}

// API错误类
class APIError extends Error {
    constructor(message, status = 0, response = null, originalError = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.response = response;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            timestamp: this.timestamp
        };
    }
}

// 数据同步管理器
class DataSyncManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.syncQueue = [];
        this.syncInterval = null;
        this.syncFrequency = 30000; // 30秒
        this.conflictResolver = null;
        
        this.init();
    }

    init() {
        this.startAutoSync();
        this.setupEventListeners();
    }

    // 开始自动同步
    startAutoSync() {
        this.syncInterval = setInterval(() => {
            this.syncPendingChanges();
        }, this.syncFrequency);
    }

    // 停止自动同步
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // 添加到同步队列
    addToSyncQueue(operation) {
        this.syncQueue.push({
            ...operation,
            timestamp: Date.now(),
            retries: 0
        });
    }

    // 同步待处理的更改
    async syncPendingChanges() {
        if (this.syncQueue.length === 0) return;

        const operations = [...this.syncQueue];
        this.syncQueue = [];

        for (const operation of operations) {
            try {
                await this.executeOperation(operation);
            } catch (error) {
                console.error('Sync operation failed:', error);
                
                if (operation.retries < 3) {
                    operation.retries++;
                    this.syncQueue.push(operation);
                }
            }
        }
    }

    // 执行同步操作
    async executeOperation(operation) {
        const { type, data, id } = operation;
        
        switch (type) {
            case 'create':
                return await this.apiClient.post(operation.endpoint, data);
            case 'update':
                return await this.apiClient.put(`${operation.endpoint}/${id}`, data);
            case 'delete':
                return await this.apiClient.delete(`${operation.endpoint}/${id}`);
            default:
                throw new Error(`Unknown operation type: ${type}`);
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        window.addEventListener('online', () => {
            this.syncPendingChanges();
        });

        window.addEventListener('beforeunload', () => {
            this.syncPendingChanges();
        });
    }

    // 设置冲突解决器
    setConflictResolver(resolver) {
        this.conflictResolver = resolver;
    }

    // 销毁方法
    destroy() {
        this.stopAutoSync();
        this.syncQueue = [];
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, APIError, DataSyncManager };
}