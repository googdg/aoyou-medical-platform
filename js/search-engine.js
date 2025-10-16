// Content Search Engine Module
// 实现简单的客户端搜索功能，支持搜索结果高亮和搜索界面

class SearchEngine {
    constructor(blogDataManager, i18nManager) {
        this.blogDataManager = blogDataManager;
        this.i18nManager = i18nManager;
        this.searchIndex = new Map();
        this.searchResults = [];
        this.currentQuery = '';
        this.searchContainer = null;
        this.searchInput = null;
        this.resultsContainer = null;
        this.isSearchVisible = false;
        this.searchHistory = [];
        this.maxHistoryItems = 10;
        
        this.init();
    }

    init() {
        this.createSearchInterface();
        this.buildSearchIndex();
        this.bindEvents();
        this.loadSearchHistory();
    }

    // 创建搜索界面
    createSearchInterface() {
        // 创建搜索容器
        this.searchContainer = document.createElement('div');
        this.searchContainer.className = 'search-container';
        this.searchContainer.innerHTML = `
            <div class="search-overlay" id="search-overlay"></div>
            <div class="search-modal" id="search-modal">
                <div class="search-header">
                    <div class="search-input-wrapper">
                        <input type="text" 
                               id="search-input" 
                               class="search-input" 
                               placeholder="Search blog posts..." 
                               autocomplete="off"
                               aria-label="Search blog posts">
                        <button class="search-clear-btn" id="search-clear" aria-label="Clear search">×</button>
                    </div>
                    <button class="search-close-btn" id="search-close" aria-label="Close search">
                        <span class="close-icon">×</span>
                    </button>
                </div>
                
                <div class="search-content">
                    <div class="search-suggestions" id="search-suggestions" style="display: none;">
                        <h4 class="suggestions-title">Recent Searches</h4>
                        <div class="suggestions-list" id="suggestions-list"></div>
                    </div>
                    
                    <div class="search-results" id="search-results">
                        <div class="search-status" id="search-status">
                            <p class="search-hint">Start typing to search through blog posts...</p>
                        </div>
                        <div class="results-list" id="results-list"></div>
                    </div>
                </div>
                
                <div class="search-footer">
                    <div class="search-shortcuts">
                        <span class="shortcut"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                        <span class="shortcut"><kbd>Enter</kbd> Open</span>
                        <span class="shortcut"><kbd>Esc</kbd> Close</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.searchContainer);

        // 获取元素引用
        this.searchInput = document.getElementById('search-input');
        this.resultsContainer = document.getElementById('results-list');
        this.searchStatus = document.getElementById('search-status');
        this.suggestionsContainer = document.getElementById('search-suggestions');
        this.suggestionsList = document.getElementById('suggestions-list');
    }

    // 构建搜索索引
    buildSearchIndex() {
        if (!this.blogDataManager || !this.blogDataManager.isDataLoaded()) {
            console.warn('Blog data not available for search indexing');
            return;
        }

        this.searchIndex.clear();
        
        // 获取所有语言的文章
        const languages = ['en', 'zh'];
        
        languages.forEach(lang => {
            const posts = this.blogDataManager.getPublishedPosts(lang);
            
            posts.forEach(post => {
                const searchableContent = this.extractSearchableContent(post, lang);
                const indexKey = `${post.id}_${lang}`;
                
                this.searchIndex.set(indexKey, {
                    post: post,
                    language: lang,
                    searchableText: searchableContent.toLowerCase(),
                    title: post.getTitle(lang),
                    excerpt: post.getExcerpt(lang),
                    content: post.getContent(lang),
                    tags: post.tags,
                    category: post.category
                });
            });
        });

        console.log(`Search index built with ${this.searchIndex.size} entries`);
    }

    // 提取可搜索内容
    extractSearchableContent(post, language) {
        const title = post.getTitle(language) || '';
        const excerpt = post.getExcerpt(language) || '';
        const content = post.getContent(language) || '';
        const tags = post.tags ? post.tags.join(' ') : '';
        
        // 移除HTML标签和Markdown语法
        const cleanContent = content
            .replace(/<[^>]*>/g, ' ')  // 移除HTML标签
            .replace(/[#*`_~\[\]()]/g, ' ')  // 移除Markdown语法
            .replace(/\s+/g, ' ')  // 合并多个空格
            .trim();

        return `${title} ${excerpt} ${cleanContent} ${tags}`;
    }

    // 绑定事件
    bindEvents() {
        // 搜索输入事件
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        // 键盘导航
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // 清除搜索
        document.getElementById('search-clear').addEventListener('click', () => {
            this.clearSearch();
        });

        // 关闭搜索
        document.getElementById('search-close').addEventListener('click', () => {
            this.hideSearch();
        });

        // 点击遮罩关闭
        document.getElementById('search-overlay').addEventListener('click', () => {
            this.hideSearch();
        });

        // 全局键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl+K 或 Cmd+K 打开搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.showSearch();
            }
            
            // ESC 关闭搜索
            if (e.key === 'Escape' && this.isSearchVisible) {
                this.hideSearch();
            }
        });

        // 结果点击事件
        this.resultsContainer.addEventListener('click', (e) => {
            const resultItem = e.target.closest('.search-result-item');
            if (resultItem) {
                const postId = resultItem.dataset.postId;
                const language = resultItem.dataset.language;
                this.openSearchResult(postId, language);
            }
        });

        // 搜索历史点击事件
        this.suggestionsList.addEventListener('click', (e) => {
            const suggestion = e.target.closest('.suggestion-item');
            if (suggestion) {
                const query = suggestion.dataset.query;
                this.searchInput.value = query;
                this.handleSearchInput(query);
            }
        });
    }

    // 处理搜索输入
    handleSearchInput(query) {
        this.currentQuery = query.trim();
        
        if (this.currentQuery.length === 0) {
            this.showSuggestions();
            this.clearResults();
            return;
        }

        if (this.currentQuery.length < 2) {
            this.showSearchHint('Type at least 2 characters to search...');
            return;
        }

        this.hideSuggestions();
        this.performSearch(this.currentQuery);
    }

    // 执行搜索
    performSearch(query) {
        const startTime = performance.now();
        this.searchResults = [];

        // 获取当前语言
        const currentLanguage = this.i18nManager ? this.i18nManager.getCurrentLanguage() : 'en';
        
        // 搜索算法
        const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        
        this.searchIndex.forEach((indexEntry, key) => {
            // 优先搜索当前语言的内容
            const languageBoost = indexEntry.language === currentLanguage ? 1.2 : 1.0;
            
            let score = 0;
            let matchedTerms = 0;
            const matches = [];

            queryTerms.forEach(term => {
                // 标题匹配（高权重）
                if (indexEntry.title.toLowerCase().includes(term)) {
                    score += 10 * languageBoost;
                    matchedTerms++;
                    matches.push({ type: 'title', term, text: indexEntry.title });
                }

                // 标签匹配（中等权重）
                if (indexEntry.tags.some(tag => tag.toLowerCase().includes(term))) {
                    score += 5 * languageBoost;
                    matchedTerms++;
                    matches.push({ type: 'tag', term, text: indexEntry.tags.join(', ') });
                }

                // 摘要匹配（中等权重）
                if (indexEntry.excerpt.toLowerCase().includes(term)) {
                    score += 3 * languageBoost;
                    matchedTerms++;
                    matches.push({ type: 'excerpt', term, text: indexEntry.excerpt });
                }

                // 内容匹配（低权重）
                if (indexEntry.searchableText.includes(term)) {
                    score += 1 * languageBoost;
                    matchedTerms++;
                    matches.push({ type: 'content', term, text: indexEntry.content });
                }
            });

            // 只有匹配到查询词的结果才加入
            if (matchedTerms > 0) {
                // 完整匹配加分
                if (matchedTerms === queryTerms.length) {
                    score *= 1.5;
                }

                this.searchResults.push({
                    ...indexEntry,
                    score: score,
                    matchedTerms: matchedTerms,
                    matches: matches
                });
            }
        });

        // 按分数排序
        this.searchResults.sort((a, b) => b.score - a.score);

        const endTime = performance.now();
        const searchTime = Math.round(endTime - startTime);

        this.displaySearchResults(query, searchTime);
        this.addToSearchHistory(query);
    }

    // 显示搜索结果
    displaySearchResults(query, searchTime) {
        const resultCount = this.searchResults.length;
        
        // 更新状态信息
        this.searchStatus.innerHTML = `
            <p class="search-info">
                Found ${resultCount} result${resultCount !== 1 ? 's' : ''} for "${query}" 
                <span class="search-time">(${searchTime}ms)</span>
            </p>
        `;

        // 清空结果容器
        this.resultsContainer.innerHTML = '';

        if (resultCount === 0) {
            this.resultsContainer.innerHTML = `
                <div class="no-results">
                    <h4>No results found</h4>
                    <p>Try different keywords or check your spelling.</p>
                    <div class="search-tips">
                        <h5>Search tips:</h5>
                        <ul>
                            <li>Use different keywords</li>
                            <li>Check spelling</li>
                            <li>Try broader terms</li>
                            <li>Search in different languages</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }

        // 显示搜索结果（限制前20个）
        const displayResults = this.searchResults.slice(0, 20);
        
        displayResults.forEach((result, index) => {
            const resultElement = this.createSearchResultElement(result, query, index);
            this.resultsContainer.appendChild(resultElement);
        });

        // 如果结果太多，显示提示
        if (this.searchResults.length > 20) {
            const moreResults = document.createElement('div');
            moreResults.className = 'more-results';
            moreResults.innerHTML = `
                <p>Showing top 20 results. ${this.searchResults.length - 20} more results available.</p>
                <p>Try refining your search for more specific results.</p>
            `;
            this.resultsContainer.appendChild(moreResults);
        }
    }

    // 创建搜索结果元素
    createSearchResultElement(result, query, index) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'search-result-item';
        resultDiv.dataset.postId = result.post.id;
        resultDiv.dataset.language = result.language;
        resultDiv.setAttribute('tabindex', '0');
        resultDiv.setAttribute('role', 'button');

        // 高亮匹配的文本
        const highlightedTitle = this.highlightMatches(result.title, query);
        const highlightedExcerpt = this.highlightMatches(result.excerpt, query);

        // 获取分类信息
        const category = this.blogDataManager.getCategoryById(result.category);
        const categoryName = category ? category.getName(result.language) : '';

        // 格式化日期
        const publishDate = new Date(result.post.publishDate).toLocaleDateString();

        resultDiv.innerHTML = `
            <div class="result-header">
                <h3 class="result-title">${highlightedTitle}</h3>
                <div class="result-meta">
                    <span class="result-date">${publishDate}</span>
                    ${categoryName ? `<span class="result-category">${categoryName}</span>` : ''}
                    <span class="result-language">${result.language.toUpperCase()}</span>
                </div>
            </div>
            <div class="result-content">
                <p class="result-excerpt">${highlightedExcerpt}</p>
                ${result.post.tags.length > 0 ? `
                    <div class="result-tags">
                        ${result.post.tags.slice(0, 3).map(tag => 
                            `<span class="result-tag">${this.highlightMatches(tag, query)}</span>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="result-footer">
                <span class="result-score">Relevance: ${Math.round(result.score)}</span>
                <span class="result-reading-time">${result.post.getReadingTime(result.language)} min read</span>
            </div>
        `;

        // 键盘导航支持
        resultDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openSearchResult(result.post.id, result.language);
            }
        });

        return resultDiv;
    }

    // 高亮匹配的文本
    highlightMatches(text, query) {
        if (!text || !query) return text;

        const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        let highlightedText = text;

        queryTerms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
        });

        return highlightedText;
    }

    // 转义正则表达式特殊字符
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 键盘导航处理
    handleKeyboardNavigation(e) {
        const results = this.resultsContainer.querySelectorAll('.search-result-item');
        const currentFocus = document.activeElement;
        const currentIndex = Array.from(results).indexOf(currentFocus);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < results.length - 1) {
                    results[currentIndex + 1].focus();
                } else if (results.length > 0) {
                    results[0].focus();
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    results[currentIndex - 1].focus();
                } else if (results.length > 0) {
                    results[results.length - 1].focus();
                }
                break;

            case 'Enter':
                if (currentFocus && currentFocus.classList.contains('search-result-item')) {
                    e.preventDefault();
                    const postId = currentFocus.dataset.postId;
                    const language = currentFocus.dataset.language;
                    this.openSearchResult(postId, language);
                }
                break;
        }
    }

    // 打开搜索结果
    openSearchResult(postId, language) {
        this.hideSearch();
        
        // 切换到对应语言
        if (this.i18nManager && language !== this.i18nManager.getCurrentLanguage()) {
            this.i18nManager.setLanguage(language);
        }

        // 获取文章并显示
        const post = this.blogDataManager.getPostById(postId);
        if (post && window.blogManager) {
            const slug = post.getSlug(language);
            window.blogManager.showPostDetail(slug);
        }
    }

    // 显示搜索界面
    showSearch() {
        this.searchContainer.style.display = 'block';
        this.isSearchVisible = true;
        
        // 动画显示
        requestAnimationFrame(() => {
            this.searchContainer.classList.add('search-visible');
            this.searchInput.focus();
            this.showSuggestions();
        });

        // 防止背景滚动
        document.body.style.overflow = 'hidden';
    }

    // 隐藏搜索界面
    hideSearch() {
        this.searchContainer.classList.remove('search-visible');
        this.isSearchVisible = false;
        
        setTimeout(() => {
            this.searchContainer.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    // 清除搜索
    clearSearch() {
        this.searchInput.value = '';
        this.currentQuery = '';
        this.clearResults();
        this.showSuggestions();
        this.searchInput.focus();
    }

    // 清除结果
    clearResults() {
        this.resultsContainer.innerHTML = '';
        this.searchStatus.innerHTML = '<p class="search-hint">Start typing to search through blog posts...</p>';
    }

    // 显示搜索提示
    showSearchHint(message) {
        this.searchStatus.innerHTML = `<p class="search-hint">${message}</p>`;
        this.resultsContainer.innerHTML = '';
    }

    // 显示搜索建议
    showSuggestions() {
        if (this.searchHistory.length === 0) {
            this.suggestionsContainer.style.display = 'none';
            return;
        }

        this.suggestionsList.innerHTML = this.searchHistory
            .slice(0, 5)
            .map(query => `
                <div class="suggestion-item" data-query="${query}" tabindex="0">
                    <span class="suggestion-icon">🔍</span>
                    <span class="suggestion-text">${query}</span>
                </div>
            `).join('');

        this.suggestionsContainer.style.display = 'block';
    }

    // 隐藏搜索建议
    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
    }

    // 添加到搜索历史
    addToSearchHistory(query) {
        if (!query || query.length < 2) return;

        // 移除重复项
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        
        // 添加到开头
        this.searchHistory.unshift(query);
        
        // 限制历史记录数量
        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        }

        this.saveSearchHistory();
    }

    // 保存搜索历史
    saveSearchHistory() {
        try {
            localStorage.setItem('blog_search_history', JSON.stringify(this.searchHistory));
        } catch (e) {
            console.warn('Failed to save search history:', e);
        }
    }

    // 加载搜索历史
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('blog_search_history');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load search history:', e);
            this.searchHistory = [];
        }
    }

    // 重建搜索索引（当博客数据更新时调用）
    rebuildIndex() {
        this.buildSearchIndex();
    }

    // 获取搜索统计
    getSearchStats() {
        return {
            indexSize: this.searchIndex.size,
            historySize: this.searchHistory.length,
            lastQuery: this.currentQuery,
            lastResultCount: this.searchResults.length
        };
    }

    // 销毁搜索引擎
    destroy() {
        if (this.searchContainer) {
            this.searchContainer.remove();
        }
        this.searchIndex.clear();
        this.searchResults = [];
        this.searchHistory = [];
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchEngine;
}