// Content Sync Manager
// 实现内容发布和更新流程、添加静态文件生成功能、创建内容版本控制、实现多语言内容同步

class ContentSyncManager {
    constructor(apiClient, blogDataManager) {
        this.apiClient = apiClient;
        this.blogDataManager = blogDataManager;
        this.syncQueue = [];
        this.syncHistory = [];
        this.conflictResolver = null;
        this.syncInterval = null;
        this.syncFrequency = 30000; // 30秒
        this.versionControl = new Map();
        this.publishQueue = [];
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        this.loadSyncHistory();
        this.setupEventListeners();
        this.startAutoSync();
        console.log('Content Sync Manager initialized');
    }

    // 设置事件监听器
    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        window.addEventListener('beforeunload', () => {
            this.saveSyncHistory();
            this.processSyncQueue();
        });

        // 监听内容变化
        window.addEventListener('contentChanged', (e) => {
            this.handleContentChange(e.detail);
        });
    }

    // 开始自动同步
    startAutoSync() {
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.processSyncQueue();
            }
        }, this.syncFrequency);
    }

    // 停止自动同步
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // 发布内容
    async publishContent(contentId, contentType, publishOptions = {}) {
        const {
            immediate = false,
            languages = ['en', 'zh'],
            generateStatic = true,
            notifySubscribers = true
        } = publishOptions;

        try {
            // 创建发布任务
            const publishTask = {
                id: this.generateTaskId(),
                contentId: contentId,
                contentType: contentType,
                languages: languages,
                generateStatic: generateStatic,
                notifySubscribers: notifySubscribers,
                status: 'pending',
                timestamp: Date.now(),
                retries: 0
            };

            if (immediate && this.isOnline) {
                return await this.executePublishTask(publishTask);
            } else {
                this.publishQueue.push(publishTask);
                this.notifyPublishQueued(publishTask);
                return publishTask;
            }

        } catch (error) {
            console.error('Failed to publish content:', error);
            throw error;
        }
    }

    // 执行发布任务
    async executePublishTask(task) {
        try {
            task.status = 'publishing';
            this.notifyPublishStatusChange(task);

            // 获取内容数据
            const content = await this.getContentData(task.contentId, task.contentType);
            
            if (!content) {
                throw new Error('Content not found');
            }

            // 多语言发布
            const publishResults = [];
            
            for (const language of task.languages) {
                const languageResult = await this.publishContentForLanguage(
                    content, 
                    language, 
                    task
                );
                publishResults.push(languageResult);
            }

            // 生成静态文件
            if (task.generateStatic) {
                await this.generateStaticFiles(content, task.languages);
            }

            // 通知订阅者
            if (task.notifySubscribers) {
                await this.notifyContentSubscribers(content, task.languages);
            }

            // 更新版本控制
            this.updateVersionControl(task.contentId, task.contentType);

            task.status = 'published';
            task.publishResults = publishResults;
            task.completedAt = Date.now();

            this.notifyPublishStatusChange(task);
            this.addToSyncHistory(task);

            return task;

        } catch (error) {
            task.status = 'failed';
            task.error = error.message;
            task.failedAt = Date.now();

            this.notifyPublishStatusChange(task);
            
            // 重试逻辑
            if (task.retries < 3) {
                task.retries++;
                task.status = 'pending';
                this.publishQueue.push(task);
            }

            throw error;
        }
    }

    // 为特定语言发布内容
    async publishContentForLanguage(content, language, task) {
        try {
            // 准备语言特定的内容
            const languageContent = this.prepareLanguageContent(content, language);
            
            // 发布到API
            let publishResult;
            
            if (content.id && await this.contentExists(content.id, language)) {
                // 更新现有内容
                publishResult = await this.apiClient.put(
                    `/content/${task.contentType}/${content.id}`,
                    { ...languageContent, language }
                );
            } else {
                // 创建新内容
                publishResult = await this.apiClient.post(
                    `/content/${task.contentType}`,
                    { ...languageContent, language }
                );
            }

            return {
                language: language,
                success: true,
                result: publishResult.data,
                timestamp: Date.now()
            };

        } catch (error) {
            return {
                language: language,
                success: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    // 准备语言特定的内容
    prepareLanguageContent(content, language) {
        const languageContent = { ...content };
        
        // 根据内容类型处理多语言字段
        if (content.title && typeof content.title === 'object') {
            languageContent.title = content.title[language] || content.title.en;
        }
        
        if (content.content && typeof content.content === 'object') {
            languageContent.content = content.content[language] || content.content.en;
        }
        
        if (content.excerpt && typeof content.excerpt === 'object') {
            languageContent.excerpt = content.excerpt[language] || content.excerpt.en;
        }

        return languageContent;
    }

    // 生成静态文件
    async generateStaticFiles(content, languages) {
        try {
            const staticFiles = [];

            for (const language of languages) {
                // 生成HTML文件
                const htmlContent = await this.generateHTMLFile(content, language);
                staticFiles.push({
                    type: 'html',
                    language: language,
                    content: htmlContent,
                    path: this.getStaticFilePath(content, language, 'html')
                });

                // 生成JSON文件
                const jsonContent = this.generateJSONFile(content, language);
                staticFiles.push({
                    type: 'json',
                    language: language,
                    content: jsonContent,
                    path: this.getStaticFilePath(content, language, 'json')
                });
            }

            // 保存静态文件
            await this.saveStaticFiles(staticFiles);

            return staticFiles;

        } catch (error) {
            console.error('Failed to generate static files:', error);
            throw error;
        }
    }

    // 生成HTML文件
    async generateHTMLFile(content, language) {
        const template = await this.getHTMLTemplate(content.type);
        const languageContent = this.prepareLanguageContent(content, language);
        
        return this.renderTemplate(template, {
            ...languageContent,
            language: language,
            generatedAt: new Date().toISOString()
        });
    }

    // 生成JSON文件
    generateJSONFile(content, language) {
        const languageContent = this.prepareLanguageContent(content, language);
        
        return JSON.stringify({
            ...languageContent,
            language: language,
            generatedAt: new Date().toISOString(),
            version: this.getContentVersion(content.id)
        }, null, 2);
    }

    // 获取静态文件路径
    getStaticFilePath(content, language, extension) {
        const slug = content.slug || content.id;
        return `/static/${content.type}/${language}/${slug}.${extension}`;
    }

    // 保存静态文件
    async saveStaticFiles(staticFiles) {
        // 这里通常需要服务器端支持
        // 可以通过API调用来保存文件
        for (const file of staticFiles) {
            try {
                await this.apiClient.post('/static/save', {
                    path: file.path,
                    content: file.content,
                    type: file.type
                });
            } catch (error) {
                console.warn(`Failed to save static file ${file.path}:`, error);
            }
        }
    }

    // 内容同步
    async syncContent(contentId, contentType, syncOptions = {}) {
        const {
            direction = 'bidirectional', // 'up', 'down', 'bidirectional'
            conflictResolution = 'manual', // 'manual', 'local', 'remote', 'merge'
            languages = ['en', 'zh']
        } = syncOptions;

        try {
            const syncTask = {
                id: this.generateTaskId(),
                contentId: contentId,
                contentType: contentType,
                direction: direction,
                conflictResolution: conflictResolution,
                languages: languages,
                status: 'syncing',
                timestamp: Date.now()
            };

            this.notifySyncStatusChange(syncTask);

            // 获取本地和远程版本
            const localContent = await this.getLocalContent(contentId, contentType);
            const remoteContent = await this.getRemoteContent(contentId, contentType);

            // 检测冲突
            const conflicts = this.detectConflicts(localContent, remoteContent, languages);

            if (conflicts.length > 0) {
                syncTask.conflicts = conflicts;
                
                if (conflictResolution === 'manual') {
                    syncTask.status = 'conflict';
                    this.notifySyncStatusChange(syncTask);
                    return syncTask;
                }
                
                // 自动解决冲突
                await this.resolveConflicts(conflicts, conflictResolution);
            }

            // 执行同步
            const syncResult = await this.executeSyncOperation(
                localContent, 
                remoteContent, 
                direction, 
                languages
            );

            syncTask.status = 'completed';
            syncTask.result = syncResult;
            syncTask.completedAt = Date.now();

            this.notifySyncStatusChange(syncTask);
            this.addToSyncHistory(syncTask);

            return syncTask;

        } catch (error) {
            console.error('Content sync failed:', error);
            throw error;
        }
    }

    // 检测冲突
    detectConflicts(localContent, remoteContent, languages) {
        const conflicts = [];

        if (!localContent || !remoteContent) {
            return conflicts;
        }

        // 检查版本冲突
        if (localContent.version !== remoteContent.version) {
            conflicts.push({
                type: 'version',
                field: 'version',
                local: localContent.version,
                remote: remoteContent.version
            });
        }

        // 检查修改时间冲突
        if (localContent.lastModified !== remoteContent.lastModified) {
            conflicts.push({
                type: 'timestamp',
                field: 'lastModified',
                local: localContent.lastModified,
                remote: remoteContent.lastModified
            });
        }

        // 检查内容字段冲突
        const fieldsToCheck = ['title', 'content', 'excerpt', 'tags'];
        
        fieldsToCheck.forEach(field => {
            languages.forEach(language => {
                const localValue = this.getFieldValue(localContent, field, language);
                const remoteValue = this.getFieldValue(remoteContent, field, language);
                
                if (localValue !== remoteValue) {
                    conflicts.push({
                        type: 'content',
                        field: field,
                        language: language,
                        local: localValue,
                        remote: remoteValue
                    });
                }
            });
        });

        return conflicts;
    }

    // 解决冲突
    async resolveConflicts(conflicts, resolution) {
        for (const conflict of conflicts) {
            switch (resolution) {
                case 'local':
                    // 保持本地版本
                    break;
                case 'remote':
                    // 使用远程版本
                    await this.applyRemoteChange(conflict);
                    break;
                case 'merge':
                    // 尝试合并
                    await this.mergeConflict(conflict);
                    break;
            }
        }
    }

    // 版本控制
    updateVersionControl(contentId, contentType) {
        const versionKey = `${contentType}:${contentId}`;
        const currentVersion = this.versionControl.get(versionKey) || 0;
        const newVersion = currentVersion + 1;
        
        this.versionControl.set(versionKey, {
            version: newVersion,
            timestamp: Date.now(),
            contentId: contentId,
            contentType: contentType
        });

        // 保存到本地存储
        this.saveVersionControl();
    }

    // 获取内容版本
    getContentVersion(contentId, contentType = 'post') {
        const versionKey = `${contentType}:${contentId}`;
        const versionInfo = this.versionControl.get(versionKey);
        return versionInfo ? versionInfo.version : 1;
    }

    // 创建内容快照
    createContentSnapshot(content, language) {
        return {
            id: content.id,
            type: content.type,
            language: language,
            version: this.getContentVersion(content.id, content.type),
            snapshot: JSON.parse(JSON.stringify(content)),
            timestamp: Date.now()
        };
    }

    // 处理内容变化
    handleContentChange(changeDetail) {
        const { contentId, contentType, changeType, data } = changeDetail;
        
        // 添加到同步队列
        this.addToSyncQueue({
            contentId: contentId,
            contentType: contentType,
            changeType: changeType,
            data: data,
            timestamp: Date.now()
        });
    }

    // 添加到同步队列
    addToSyncQueue(syncItem) {
        // 检查是否已存在相同的同步项
        const existingIndex = this.syncQueue.findIndex(item => 
            item.contentId === syncItem.contentId && 
            item.contentType === syncItem.contentType
        );

        if (existingIndex !== -1) {
            // 更新现有项
            this.syncQueue[existingIndex] = { ...this.syncQueue[existingIndex], ...syncItem };
        } else {
            // 添加新项
            this.syncQueue.push(syncItem);
        }
    }

    // 处理同步队列
    async processSyncQueue() {
        if (this.syncQueue.length === 0 || !this.isOnline) {
            return;
        }

        const itemsToSync = [...this.syncQueue];
        this.syncQueue = [];

        for (const item of itemsToSync) {
            try {
                await this.processSyncItem(item);
            } catch (error) {
                console.error('Failed to sync item:', error);
                
                // 重新加入队列（有重试限制）
                if (!item.retries || item.retries < 3) {
                    item.retries = (item.retries || 0) + 1;
                    this.syncQueue.push(item);
                }
            }
        }
    }

    // 处理单个同步项
    async processSyncItem(item) {
        const { contentId, contentType, changeType, data } = item;

        switch (changeType) {
            case 'create':
                await this.apiClient.post(`/content/${contentType}`, data);
                break;
            case 'update':
                await this.apiClient.put(`/content/${contentType}/${contentId}`, data);
                break;
            case 'delete':
                await this.apiClient.delete(`/content/${contentType}/${contentId}`);
                break;
        }
    }

    // 工具方法
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getFieldValue(content, field, language) {
        if (!content || !content[field]) return null;
        
        if (typeof content[field] === 'object') {
            return content[field][language] || content[field].en;
        }
        
        return content[field];
    }

    async getContentData(contentId, contentType) {
        if (this.blogDataManager && contentType === 'post') {
            return this.blogDataManager.getPostById(contentId);
        }
        
        // 从其他数据源获取
        return null;
    }

    async contentExists(contentId, language) {
        try {
            await this.apiClient.get(`/content/post/${contentId}?language=${language}`);
            return true;
        } catch (error) {
            return false;
        }
    }

    async getLocalContent(contentId, contentType) {
        return this.getContentData(contentId, contentType);
    }

    async getRemoteContent(contentId, contentType) {
        try {
            const response = await this.apiClient.get(`/content/${contentType}/${contentId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    // 通知方法
    notifyPublishQueued(task) {
        window.dispatchEvent(new CustomEvent('publishQueued', { detail: task }));
    }

    notifyPublishStatusChange(task) {
        window.dispatchEvent(new CustomEvent('publishStatusChange', { detail: task }));
    }

    notifySyncStatusChange(task) {
        window.dispatchEvent(new CustomEvent('syncStatusChange', { detail: task }));
    }

    async notifyContentSubscribers(content, languages) {
        // 实现订阅者通知逻辑
        console.log('Notifying subscribers about content update:', content.id);
    }

    // 持久化方法
    saveSyncHistory() {
        try {
            localStorage.setItem('syncHistory', JSON.stringify(this.syncHistory.slice(-100)));
        } catch (error) {
            console.warn('Failed to save sync history:', error);
        }
    }

    loadSyncHistory() {
        try {
            const saved = localStorage.getItem('syncHistory');
            if (saved) {
                this.syncHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load sync history:', error);
            this.syncHistory = [];
        }
    }

    saveVersionControl() {
        try {
            const versionData = Array.from(this.versionControl.entries());
            localStorage.setItem('versionControl', JSON.stringify(versionData));
        } catch (error) {
            console.warn('Failed to save version control:', error);
        }
    }

    loadVersionControl() {
        try {
            const saved = localStorage.getItem('versionControl');
            if (saved) {
                const versionData = JSON.parse(saved);
                this.versionControl = new Map(versionData);
            }
        } catch (error) {
            console.warn('Failed to load version control:', error);
            this.versionControl = new Map();
        }
    }

    addToSyncHistory(task) {
        this.syncHistory.push({
            ...task,
            timestamp: Date.now()
        });
        
        // 限制历史记录数量
        if (this.syncHistory.length > 100) {
            this.syncHistory = this.syncHistory.slice(-100);
        }
        
        this.saveSyncHistory();
    }

    // 获取状态
    getStatus() {
        return {
            syncQueueSize: this.syncQueue.length,
            publishQueueSize: this.publishQueue.length,
            syncHistorySize: this.syncHistory.length,
            versionControlSize: this.versionControl.size,
            isOnline: this.isOnline,
            autoSyncEnabled: this.syncInterval !== null
        };
    }

    // 销毁方法
    destroy() {
        this.stopAutoSync();
        this.saveSyncHistory();
        this.saveVersionControl();
        this.syncQueue = [];
        this.publishQueue = [];
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentSyncManager;
}