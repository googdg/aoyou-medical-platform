// Dynamic Content Loader
// 实现动态内容加载、数据缓存和更新机制

class ContentLoader {
    constructor(apiClient, blogDataManager) {
        this.apiClient = apiClient;
        this.blogDataManager = blogDataManager;
        this.loadingStates = new Map();
        this.contentCache = new Map();
        this.observers = new Map();
        this.updateQueue = [];
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        this.setupNetworkListeners();
        this.setupIntersectionObserver();
        this.bindEvents();
        console.log('Content Loader initialized');
    }

    // 设置网络监听器
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processUpdateQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // 设置交叉观察器（用于懒加载）
    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const loadType = element.dataset.loadType;
                    const loadId = element.dataset.loadId;
                    
                    if (loadType && loadId) {
                        this.loadContent(loadType, loadId, element);
                        this.intersectionObserver.unobserve(element);
                    }
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });
    }

    // 绑定事件
    bindEvents() {
        // 监听API加载状态变化
        window.addEventListener('apiLoadingStateChange', (e) => {
            this.handleLoadingStateChange(e.detail);
        });

        // 监听内容更新事件
        window.addEventListener('contentUpdate', (e) => {
            this.handleContentUpdate(e.detail);
        });
    }

    // 动态加载博客文章列表
    async loadBlogPosts(container, options = {}) {
        const {
            language = 'en',
            page = 1,
            limit = 10,
            category = null,
            tag = null,
            append = false
        } = options;

        const loadingId = `blog-posts-${language}-${page}-${category}-${tag}`;
        
        try {
            this.setLoadingState(loadingId, true);
            this.showLoadingIndicator(container, 'Loading blog posts...');

            let posts;
            
            if (this.isOnline) {
                // 从API加载
                const response = await this.apiClient.getBlogPosts(language, page, limit);
                posts = response.data.posts;
                
                // 更新本地数据
                this.updateLocalBlogData(posts, language);
            } else {
                // 从本地数据加载
                posts = this.blogDataManager.getPublishedPosts(language);
                
                // 应用过滤器
                if (category) {
                    posts = posts.filter(post => post.category === category);
                }
                if (tag) {
                    posts = posts.filter(post => post.tags.includes(tag));
                }
                
                // 分页
                const startIndex = (page - 1) * limit;
                posts = posts.slice(startIndex, startIndex + limit);
            }

            // 渲染文章
            this.renderBlogPosts(container, posts, append);
            
            // 缓存结果
            this.contentCache.set(loadingId, {
                data: posts,
                timestamp: Date.now(),
                options: options
            });

        } catch (error) {
            console.error('Failed to load blog posts:', error);
            this.showErrorMessage(container, 'Failed to load blog posts. Please try again.');
        } finally {
            this.setLoadingState(loadingId, false);
            this.hideLoadingIndicator(container);
        }
    }

    // 动态加载单篇博客文章
    async loadBlogPost(container, postId, language = 'en') {
        const loadingId = `blog-post-${postId}-${language}`;
        
        try {
            this.setLoadingState(loadingId, true);
            this.showLoadingIndicator(container, 'Loading article...');

            let post;
            
            if (this.isOnline) {
                // 从API加载
                const response = await this.apiClient.getBlogPost(postId, language);
                post = response.data;
                
                // 更新本地数据
                this.updateLocalPostData(post);
            } else {
                // 从本地数据加载
                post = this.blogDataManager.getPostById(postId);
            }

            if (!post) {
                throw new Error('Post not found');
            }

            // 渲染文章
            this.renderBlogPost(container, post, language);
            
            // 缓存结果
            this.contentCache.set(loadingId, {
                data: post,
                timestamp: Date.now(),
                language: language
            });

            // 更新浏览历史
            this.updateViewHistory(postId);

        } catch (error) {
            console.error('Failed to load blog post:', error);
            this.showErrorMessage(container, 'Failed to load article. Please try again.');
        } finally {
            this.setLoadingState(loadingId, false);
            this.hideLoadingIndicator(container);
        }
    }

    // 动态加载分类和标签
    async loadCategoriesAndTags(language = 'en') {
        const loadingId = `categories-tags-${language}`;
        
        try {
            this.setLoadingState(loadingId, true);

            let categories, tags;
            
            if (this.isOnline) {
                const [categoriesResponse, tagsResponse] = await Promise.all([
                    this.apiClient.getCategories(language),
                    this.apiClient.getTags(language)
                ]);
                
                categories = categoriesResponse.data;
                tags = tagsResponse.data;
                
                // 更新本地数据
                this.updateLocalCategoriesAndTags(categories, tags, language);
            } else {
                // 从本地数据加载
                categories = this.blogDataManager.getCategories();
                tags = this.blogDataManager.getTags();
            }

            // 更新过滤器UI
            this.updateFiltersUI(categories, tags, language);
            
            // 缓存结果
            this.contentCache.set(loadingId, {
                categories: categories,
                tags: tags,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('Failed to load categories and tags:', error);
        } finally {
            this.setLoadingState(loadingId, false);
        }
    }

    // 渲染博客文章列表
    renderBlogPosts(container, posts, append = false) {
        if (!append) {
            container.innerHTML = '';
        }

        posts.forEach(post => {
            const postElement = this.createBlogPostElement(post);
            container.appendChild(postElement);
        });

        // 设置懒加载
        this.setupLazyLoading(container);
    }

    // 创建博客文章元素
    createBlogPostElement(post) {
        const article = document.createElement('article');
        article.className = 'blog-post-card dynamic-content';
        article.dataset.postId = post.id;
        
        const language = post.language || 'en';
        const category = this.blogDataManager.getCategoryById(post.category);
        const categoryName = category ? category.getName(language) : '';

        article.innerHTML = `
            <header class="blog-post-header">
                <h3 class="blog-post-title">
                    <a href="#post/${post.getSlug(language)}" class="post-link" 
                       data-post-id="${post.id}" data-language="${language}">
                        ${post.getTitle(language)}
                    </a>
                </h3>
                <div class="blog-post-meta">
                    <time class="blog-post-date" datetime="${post.publishDate}">
                        📅 ${post.getFormattedPublishDate()}
                    </time>
                    <span class="blog-post-reading-time">
                        ⏱️ ${post.getReadingTime(language)} min read
                    </span>
                </div>
            </header>
            
            <div class="blog-post-content">
                <p class="blog-post-excerpt">${post.getExcerpt(language)}</p>
            </div>
            
            <footer class="blog-post-footer">
                <div class="blog-post-tags">
                    ${post.tags.slice(0, 3).map(tag => 
                        `<span class="blog-post-tag">${tag}</span>`
                    ).join('')}
                </div>
                ${categoryName ? `<span class="blog-post-category">${categoryName}</span>` : ''}
            </footer>
        `;

        return article;
    }

    // 渲染单篇博客文章
    renderBlogPost(container, post, language) {
        const category = this.blogDataManager.getCategoryById(post.category);
        
        container.innerHTML = `
            <article class="blog-post-detail dynamic-content">
                <header class="post-header">
                    <div class="post-meta-top">
                        ${category ? `<span class="post-category">${category.getName(language)}</span>` : ''}
                        <time class="post-date" datetime="${post.publishDate}">
                            ${post.getFormattedPublishDate()}
                        </time>
                    </div>
                    
                    <h1 class="post-title">${post.getTitle(language)}</h1>
                    
                    <div class="post-meta-bottom">
                        <div class="post-author">
                            <span class="author-label">By</span>
                            <span class="author-name">${post.author}</span>
                        </div>
                        <div class="post-reading-time">
                            ${post.getReadingTime(language)} min read
                        </div>
                    </div>
                    
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                </header>

                <main class="post-content">
                    <div class="post-body">
                        ${this.renderMarkdown(post.getContent(language))}
                    </div>
                </main>
            </article>
        `;
    }

    // 简单的Markdown渲染
    renderMarkdown(content) {
        return content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[h|u|p|l])(.+)$/gim, '<p>$1</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<h[1-6]>)/g, '$1')
            .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
            .replace(/<p>(<ul>)/g, '$1')
            .replace(/(<\/ul>)<\/p>/g, '$1')
            .replace(/<p>(<pre>)/g, '$1')
            .replace(/(<\/pre>)<\/p>/g, '$1');
    }

    // 更新过滤器UI
    updateFiltersUI(categories, tags, language) {
        const categoryFilter = document.getElementById('category-filter');
        const tagFilter = document.getElementById('tag-filter');

        if (categoryFilter) {
            // 清空现有选项（保留第一个"All Categories"选项）
            while (categoryFilter.children.length > 1) {
                categoryFilter.removeChild(categoryFilter.lastChild);
            }

            // 添加分类选项
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.getName(language);
                categoryFilter.appendChild(option);
            });
        }

        if (tagFilter) {
            // 清空现有选项（保留第一个"All Tags"选项）
            while (tagFilter.children.length > 1) {
                tagFilter.removeChild(tagFilter.lastChild);
            }

            // 添加标签选项
            tags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                tagFilter.appendChild(option);
            });
        }
    }

    // 设置懒加载
    setupLazyLoading(container) {
        const lazyElements = container.querySelectorAll('[data-load-type]');
        lazyElements.forEach(element => {
            this.intersectionObserver.observe(element);
        });
    }

    // 加载内容（通用方法）
    async loadContent(type, id, element) {
        try {
            switch (type) {
                case 'post':
                    await this.loadBlogPost(element, id);
                    break;
                case 'image':
                    await this.loadImage(element, id);
                    break;
                case 'comments':
                    await this.loadComments(element, id);
                    break;
                default:
                    console.warn(`Unknown content type: ${type}`);
            }
        } catch (error) {
            console.error(`Failed to load ${type} content:`, error);
        }
    }

    // 加载图片
    async loadImage(element, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                element.src = src;
                element.classList.add('loaded');
                resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    // 显示加载指示器
    showLoadingIndicator(container, message = 'Loading...') {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p class="loading-message">${message}</p>
        `;
        
        container.appendChild(loadingDiv);
    }

    // 隐藏加载指示器
    hideLoadingIndicator(container) {
        const loadingIndicator = container.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    // 显示错误消息
    showErrorMessage(container, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>Error</h3>
            <p>${message}</p>
            <button class="retry-btn" onclick="location.reload()">Retry</button>
        `;
        
        container.appendChild(errorDiv);
    }

    // 设置加载状态
    setLoadingState(id, isLoading) {
        this.loadingStates.set(id, isLoading);
        
        // 触发事件
        window.dispatchEvent(new CustomEvent('contentLoadingStateChange', {
            detail: { id, isLoading }
        }));
    }

    // 处理加载状态变化
    handleLoadingStateChange(detail) {
        const { requestId, isLoading } = detail;
        
        // 更新UI加载状态
        const loadingElements = document.querySelectorAll(`[data-loading-id="${requestId}"]`);
        loadingElements.forEach(element => {
            if (isLoading) {
                element.classList.add('loading');
            } else {
                element.classList.remove('loading');
            }
        });
    }

    // 处理内容更新
    handleContentUpdate(detail) {
        const { type, id, data } = detail;
        
        // 清除相关缓存
        this.clearRelatedCache(type, id);
        
        // 重新加载内容
        this.reloadContent(type, id, data);
    }

    // 清除相关缓存
    clearRelatedCache(type, id) {
        for (const [key] of this.contentCache) {
            if (key.includes(`${type}-${id}`)) {
                this.contentCache.delete(key);
            }
        }
    }

    // 重新加载内容
    async reloadContent(type, id, data) {
        const containers = document.querySelectorAll(`[data-content-type="${type}"][data-content-id="${id}"]`);
        
        containers.forEach(async (container) => {
            try {
                await this.loadContent(type, id, container);
            } catch (error) {
                console.error(`Failed to reload ${type} content:`, error);
            }
        });
    }

    // 更新本地博客数据
    updateLocalBlogData(posts, language) {
        if (this.blogDataManager) {
            posts.forEach(postData => {
                this.blogDataManager.updatePost(postData);
            });
        }
    }

    // 更新本地文章数据
    updateLocalPostData(postData) {
        if (this.blogDataManager) {
            this.blogDataManager.updatePost(postData);
        }
    }

    // 更新本地分类和标签数据
    updateLocalCategoriesAndTags(categories, tags, language) {
        if (this.blogDataManager) {
            this.blogDataManager.updateCategories(categories);
            this.blogDataManager.updateTags(tags);
        }
    }

    // 更新浏览历史
    updateViewHistory(postId) {
        const viewHistory = JSON.parse(localStorage.getItem('viewHistory') || '[]');
        
        // 移除重复项
        const filteredHistory = viewHistory.filter(item => item.postId !== postId);
        
        // 添加到开头
        filteredHistory.unshift({
            postId: postId,
            timestamp: Date.now()
        });
        
        // 限制历史记录数量
        const limitedHistory = filteredHistory.slice(0, 50);
        
        localStorage.setItem('viewHistory', JSON.stringify(limitedHistory));
    }

    // 处理更新队列
    processUpdateQueue() {
        if (!this.isOnline || this.updateQueue.length === 0) return;

        const updates = [...this.updateQueue];
        this.updateQueue = [];

        updates.forEach(async (update) => {
            try {
                await this.executeUpdate(update);
            } catch (error) {
                console.error('Failed to process update:', error);
                // 重新加入队列
                this.updateQueue.push(update);
            }
        });
    }

    // 执行更新
    async executeUpdate(update) {
        const { type, action, data } = update;
        
        switch (action) {
            case 'create':
                await this.apiClient.post(`/${type}`, data);
                break;
            case 'update':
                await this.apiClient.put(`/${type}/${data.id}`, data);
                break;
            case 'delete':
                await this.apiClient.delete(`/${type}/${data.id}`);
                break;
        }
    }

    // 获取加载状态
    getLoadingStatus() {
        return {
            activeLoads: Array.from(this.loadingStates.entries()).filter(([, isLoading]) => isLoading),
            cacheSize: this.contentCache.size,
            updateQueueSize: this.updateQueue.length,
            isOnline: this.isOnline
        };
    }

    // 销毁方法
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.loadingStates.clear();
        this.contentCache.clear();
        this.updateQueue = [];
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentLoader;
}