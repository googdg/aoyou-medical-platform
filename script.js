// Personal Blog Navigation and Interaction Manager
class BlogManager {
    constructor() {
        this.currentSection = 'main';
        this.blogDataManager = null;
        this.i18nManager = null;
        this.currentLanguage = 'en';
        this.currentFilters = {
            category: '',
            tag: ''
        };
        this.init();
    }
    
    async init() {
        this.bindEvents();
        this.setupNavigation();
        this.setupSmoothScrolling();
        this.updateActiveNavigation();
        await this.initializeI18n();
        await this.initializeBlog();
        await this.loadHomepageContent(); // 加载管理后台的主页内容
        this.initializeHomepageSync(); // 初始化主页内容同步
    }
    
    // 绑定事件监听器
    bindEvents() {
        // 导航链接点击事件
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('href');
                this.navigateToSection(target);
                // 在移动端点击导航后关闭菜单
                this.closeMobileMenu();
            });
        });
        
        // 移动端菜单切换
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // 点击菜单外部关闭移动端菜单
        document.addEventListener('click', (e) => {
            const navMenu = document.getElementById('nav-menu');
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            
            if (navMenu && mobileMenuToggle && 
                !navMenu.contains(e.target) && 
                !mobileMenuToggle.contains(e.target) &&
                navMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
        
        // 键盘导航支持
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
            
            // ESC键关闭移动端菜单
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
        
        // 滚动事件监听
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        // 窗口大小变化事件
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 处理文章链接点击
        document.addEventListener('click', (e) => {
            if (e.target.matches('.post-link') || e.target.closest('.post-link')) {
                e.preventDefault();
                const link = e.target.matches('.post-link') ? e.target : e.target.closest('.post-link');
                const href = link.getAttribute('href');
                if (href.startsWith('#post/')) {
                    const slug = href.replace('#post/', '');
                    this.showPostDetail(slug);
                }
            }
        });
    }
    
    // 设置导航功能
    setupNavigation() {
        // 为导航项添加键盘可访问性
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            
            // 键盘事件支持
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }
    
    // 设置平滑滚动
    setupSmoothScrolling() {
        // 为所有内部链接添加平滑滚动
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // 导航到指定部分
    navigateToSection(target) {
        // 移除所有导航项的活动状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加当前导航项的活动状态
        const activeNavItem = document.querySelector(`[href="${target}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // 更新当前部分
        this.currentSection = target.replace('#', '');
        
        // 滚动到目标部分
        const targetElement = document.querySelector(target);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // 更新浏览器历史记录
        if (history.pushState) {
            history.pushState(null, null, target);
        }
    }
    
    // 键盘导航处理
    handleKeyboardNavigation(e) {
        const navItems = document.querySelectorAll('.nav-item');
        const currentFocus = document.activeElement;
        const currentIndex = Array.from(navItems).indexOf(currentFocus);
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                if (currentIndex > 0) {
                    e.preventDefault();
                    navItems[currentIndex - 1].focus();
                }
                break;
                
            case 'ArrowRight':
            case 'ArrowDown':
                if (currentIndex >= 0 && currentIndex < navItems.length - 1) {
                    e.preventDefault();
                    navItems[currentIndex + 1].focus();
                }
                break;
                
            case 'Home':
                if (currentIndex >= 0) {
                    e.preventDefault();
                    navItems[0].focus();
                }
                break;
                
            case 'End':
                if (currentIndex >= 0) {
                    e.preventDefault();
                    navItems[navItems.length - 1].focus();
                }
                break;
        }
    }
    
    // 滚动处理
    handleScroll() {
        // 可以在这里添加滚动相关的功能，比如：
        // - 根据滚动位置更新活动导航项
        // - 显示/隐藏返回顶部按钮
        // - 添加滚动动画效果
        
        this.updateActiveNavigation();
    }
    
    // 更新活动导航项
    updateActiveNavigation() {
        const sections = ['main', 'blog'];
        const scrollPosition = window.scrollY + 100; // 偏移量
        
        sections.forEach(sectionId => {
            let section = document.getElementById(sectionId);
            // 如果是blog部分，查找.blog-section类
            if (sectionId === 'blog' && !section) {
                section = document.querySelector('.blog-section');
            }
            
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    // 更新导航状态
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    const activeNavItem = document.querySelector(`[href="#${sectionId}"]`);
                    if (activeNavItem) {
                        activeNavItem.classList.add('active');
                    }
                    
                    this.currentSection = sectionId;
                }
            }
        });
    }
    
    // 窗口大小变化处理
    handleResize() {
        // 在桌面端自动关闭移动端菜单
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
        
        // 更新触摸友好的交互
        this.updateTouchInteractions();
    }
    
    // 切换移动端菜单
    toggleMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        
        if (!navMenu || !mobileMenuToggle) return;
        
        const isActive = navMenu.classList.contains('active');
        
        if (isActive) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    // 打开移动端菜单
    openMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        
        if (!navMenu || !mobileMenuToggle) return;
        
        navMenu.classList.add('active');
        mobileMenuToggle.classList.add('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        
        // 设置焦点到第一个导航项
        const firstNavItem = navMenu.querySelector('.nav-item');
        if (firstNavItem) {
            firstNavItem.focus();
        }
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭移动端菜单
    closeMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        
        if (!navMenu || !mobileMenuToggle) return;
        
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        
        // 恢复背景滚动
        document.body.style.overflow = '';
    }
    
    // 更新触摸交互
    updateTouchInteractions() {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            // 为触摸设备添加特殊样式类
            document.body.classList.add('touch-device');
            
            // 增加触摸目标的最小尺寸
            const touchTargets = document.querySelectorAll('.nav-item, .lang-btn, .filter-select, .clear-filters-btn, .share-btn');
            touchTargets.forEach(target => {
                target.style.minHeight = '44px';
                target.style.minWidth = '44px';
            });
        } else {
            document.body.classList.remove('touch-device');
        }
    }
    
    // 添加返回顶部功能
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // 获取当前部分
    getCurrentSection() {
        return this.currentSection;
    }
    
    // 初始化国际化功能
    async initializeI18n() {
        this.i18nManager = new I18nManager();
        const success = await this.i18nManager.init();
        
        if (success) {
            this.currentLanguage = this.i18nManager.getCurrentLanguage();
            
            // 监听语言变化
            this.i18nManager.addObserver((newLanguage) => {
                this.currentLanguage = newLanguage;
                this.onLanguageChange(newLanguage);
            });
        }
        
        return success;
    }
    
    // 语言变化处理
    onLanguageChange(newLanguage) {
        // 更新博客语言切换按钮
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            if (btn.dataset.lang === newLanguage) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            }
        });
        
        // 重新渲染博客内容
        if (this.blogDataManager && this.blogDataManager.isDataLoaded()) {
            this.blogDataManager.setLanguage(newLanguage);
            this.renderBlogPosts();
            this.updateFilterLabels();
        }
    }
    
    // 初始化博客功能
    async initializeBlog() {
        this.blogDataManager = new BlogDataManager();
        const success = await this.blogDataManager.loadData();
        
        if (success) {
            this.setupBlogFilters();
            this.setupLanguageToggle();
            this.renderBlogPosts();
        } else {
            this.showBlogError();
        }
    }
    
    // 设置博客过滤器
    setupBlogFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const tagFilter = document.getElementById('tag-filter');
        const clearFiltersBtn = document.getElementById('clear-filters');
        
        if (!categoryFilter || !tagFilter) return;
        
        // 填充分类选项
        const categories = this.blogDataManager.getCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.getName(this.currentLanguage);
            categoryFilter.appendChild(option);
        });
        
        // 填充标签选项
        const tags = this.blogDataManager.getTags();
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
        
        // 绑定过滤器事件
        categoryFilter.addEventListener('change', () => {
            this.currentFilters.category = categoryFilter.value;
            this.renderBlogPosts();
        });
        
        tagFilter.addEventListener('change', () => {
            this.currentFilters.tag = tagFilter.value;
            this.renderBlogPosts();
        });
        
        clearFiltersBtn.addEventListener('click', () => {
            this.clearFilters();
        });
    }
    
    // 设置语言切换
    setupLanguageToggle() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const newLang = btn.dataset.lang;
                if (newLang !== this.currentLanguage) {
                    // 使用i18n管理器切换语言
                    if (this.i18nManager) {
                        this.i18nManager.setLanguage(newLang);
                    }
                }
            });
        });
    }
    
    // 更新过滤器标签
    updateFilterLabels() {
        const categoryFilter = document.getElementById('category-filter');
        const categories = this.blogDataManager.getCategories();
        
        // 更新分类选项文本
        Array.from(categoryFilter.options).forEach((option, index) => {
            if (index > 0) { // 跳过 "All Categories" 选项
                const category = categories.find(cat => cat.id === option.value);
                if (category) {
                    option.textContent = category.getName(this.currentLanguage);
                }
            }
        });
    }
    
    // 渲染博客文章
    renderBlogPosts() {
        const container = document.getElementById('blog-posts-container');
        const loadingMessage = document.getElementById('loading-message');
        const noPostsMessage = document.getElementById('no-posts-message');
        
        if (!container) return;
        
        // 显示加载状态
        loadingMessage.style.display = 'block';
        noPostsMessage.style.display = 'none';
        
        // 获取过滤后的文章
        let posts = this.blogDataManager.getPublishedPosts(this.currentLanguage);
        
        // 应用过滤器
        if (this.currentFilters.category) {
            posts = posts.filter(post => post.category === this.currentFilters.category);
        }
        
        if (this.currentFilters.tag) {
            posts = posts.filter(post => post.tags.includes(this.currentFilters.tag));
        }
        
        // 清空容器
        setTimeout(() => {
            container.innerHTML = '';
            
            if (posts.length === 0) {
                noPostsMessage.style.display = 'block';
                return;
            }
            
            // 渲染文章卡片
            posts.forEach(post => {
                const postCard = this.createPostCard(post);
                container.appendChild(postCard);
            });
            
            loadingMessage.style.display = 'none';
        }, 300); // 模拟加载时间
    }
    
    // 创建文章卡片
    createPostCard(post) {
        const card = document.createElement('article');
        card.className = `blog-post-card ${post.featured ? 'featured' : ''}`;
        card.setAttribute('data-post-id', post.id);
        
        const category = this.blogDataManager.getCategoryById(post.category);
        const categoryName = category ? category.getName(this.currentLanguage) : '';
        
        card.innerHTML = `
            <header class="blog-post-header">
                <h3 class="blog-post-title">
                    <a href="#post/${post.getSlug(this.currentLanguage)}" class="post-link" aria-label="Read full post: ${post.getTitle(this.currentLanguage)}">
                        ${post.getTitle(this.currentLanguage)}
                    </a>
                </h3>
                <div class="blog-post-meta">
                    <time class="blog-post-date" datetime="${post.publishDate}">
                        📅 ${post.getFormattedPublishDate()}
                    </time>
                    <span class="blog-post-reading-time">
                        ⏱️ ${post.getReadingTime(this.currentLanguage)} min read
                    </span>
                </div>
            </header>
            
            <div class="blog-post-content">
                <p class="blog-post-excerpt">${post.getExcerpt(this.currentLanguage)}</p>
            </div>
            
            <footer class="blog-post-footer">
                <div class="blog-post-tags">
                    ${post.tags.slice(0, 3).map(tag => 
                        `<a href="#tag/${tag}" class="blog-post-tag" aria-label="View posts tagged with ${tag}">${tag}</a>`
                    ).join('')}
                </div>
                <a href="#category/${post.category}" class="blog-post-category" aria-label="View posts in ${categoryName} category">
                    ${categoryName}
                </a>
            </footer>
        `;
        
        return card;
    }
    
    // 清除过滤器
    clearFilters() {
        this.currentFilters = {
            category: '',
            tag: ''
        };
        
        document.getElementById('category-filter').value = '';
        document.getElementById('tag-filter').value = '';
        
        this.renderBlogPosts();
    }
    
    // 显示博客错误
    showBlogError() {
        const container = document.getElementById('blog-posts-container');
        if (container) {
            const errorTitle = this.i18nManager ? this.i18nManager.t('blog.errorTitle') : 'Unable to load blog posts';
            const errorMessage = this.i18nManager ? this.i18nManager.t('blog.errorMessage') : 'Please check your connection and try again later.';
            
            container.innerHTML = `
                <div class="error-message">
                    <h3>${errorTitle}</h3>
                    <p>${errorMessage}</p>
                </div>
            `;
        }
    }
    
    // 显示文章详情
    showPostDetail(postSlug) {
        const post = this.blogDataManager.getPostBySlug(postSlug, this.currentLanguage);
        
        if (!post) {
            this.showPostNotFound();
            return;
        }
        
        // 隐藏博客列表，显示文章详情
        document.getElementById('blog').style.display = 'none';
        document.getElementById('blog-post-detail').style.display = 'block';
        
        // 渲染文章内容
        this.renderPostDetail(post);
        
        // 设置导航
        this.setupPostNavigation(post);
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 渲染文章详情
    renderPostDetail(post) {
        const category = this.blogDataManager.getCategoryById(post.category);
        
        // 设置文章信息
        document.getElementById('post-title').textContent = post.getTitle(this.currentLanguage);
        document.getElementById('post-author').textContent = post.author;
        document.getElementById('post-date').textContent = post.getFormattedPublishDate();
        document.getElementById('post-date').setAttribute('datetime', post.publishDate);
        document.getElementById('post-reading-time').textContent = post.getReadingTime(this.currentLanguage);
        
        // 更新界面文字
        if (this.i18nManager) {
            const backBtn = document.getElementById('back-to-blog');
            const prevBtn = document.getElementById('prev-post');
            const nextBtn = document.getElementById('next-post');
            
            backBtn.textContent = this.i18nManager.t('blog.post.backToBlog');
            prevBtn.textContent = this.i18nManager.t('blog.post.previous');
            nextBtn.textContent = this.i18nManager.t('blog.post.next');
            
            // 更新分享按钮文字
            document.getElementById('share-twitter').innerHTML = this.i18nManager.t('blog.post.shareTwitter');
            document.getElementById('share-linkedin').innerHTML = this.i18nManager.t('blog.post.shareLinkedin');
            document.getElementById('copy-link').innerHTML = this.i18nManager.t('blog.post.shareCopy');
            
            // 更新其他文字
            document.querySelector('.post-share h3').textContent = this.i18nManager.t('blog.post.shareTitle');
            const relatedTitle = document.querySelector('.related-posts h3');
            if (relatedTitle) {
                relatedTitle.textContent = this.i18nManager.t('blog.post.relatedTitle');
            }
        }
        
        // 设置分类
        const categoryLink = document.getElementById('post-category');
        if (category) {
            categoryLink.textContent = category.getName(this.currentLanguage);
            categoryLink.href = `#category/${post.category}`;
        }
        
        // 设置标签
        const tagsContainer = document.getElementById('post-tags');
        tagsContainer.innerHTML = post.tags.map(tag => 
            `<a href="#tag/${tag}" class="post-tag">${tag}</a>`
        ).join('');
        
        // 渲染文章内容
        this.renderPostContent(post.getContent(this.currentLanguage));
        
        // 设置分享功能
        this.setupPostSharing(post);
        
        // 显示相关文章
        this.renderRelatedPosts(post);
    }
    
    // 渲染文章内容（简单的Markdown解析）
    renderPostContent(content) {
        const postBody = document.getElementById('post-body');
        
        // 简单的Markdown到HTML转换
        let html = content
            // 标题
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 粗体和斜体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 代码块
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // 列表
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // 段落
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[h|u|p|l])(.+)$/gim, '<p>$1</p>')
            // 清理多余的标签
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<h[1-6]>)/g, '$1')
            .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
            .replace(/<p>(<ul>)/g, '$1')
            .replace(/(<\/ul>)<\/p>/g, '$1')
            .replace(/<p>(<pre>)/g, '$1')
            .replace(/(<\/pre>)<\/p>/g, '$1');
        
        postBody.innerHTML = html;
    }
    
    // 设置文章导航
    setupPostNavigation(currentPost) {
        const backBtn = document.getElementById('back-to-blog');
        const prevBtn = document.getElementById('prev-post');
        const nextBtn = document.getElementById('next-post');
        
        // 返回博客列表
        backBtn.onclick = () => {
            this.showBlogList();
        };
        
        // 获取所有文章用于导航
        const allPosts = this.blogDataManager.getPublishedPosts(this.currentLanguage);
        const currentIndex = allPosts.findIndex(post => post.id === currentPost.id);
        
        // 上一篇文章
        if (currentIndex > 0) {
            const prevPost = allPosts[currentIndex - 1];
            prevBtn.style.display = 'block';
            prevBtn.onclick = () => {
                this.showPostDetail(prevPost.getSlug(this.currentLanguage));
            };
        } else {
            prevBtn.style.display = 'none';
        }
        
        // 下一篇文章
        if (currentIndex < allPosts.length - 1) {
            const nextPost = allPosts[currentIndex + 1];
            nextBtn.style.display = 'block';
            nextBtn.onclick = () => {
                this.showPostDetail(nextPost.getSlug(this.currentLanguage));
            };
        } else {
            nextBtn.style.display = 'none';
        }
    }
    
    // 设置文章分享
    setupPostSharing(post) {
        const twitterBtn = document.getElementById('share-twitter');
        const linkedinBtn = document.getElementById('share-linkedin');
        const copyLinkBtn = document.getElementById('copy-link');
        
        const postUrl = `${window.location.origin}${window.location.pathname}#post/${post.getSlug(this.currentLanguage)}`;
        const postTitle = post.getTitle(this.currentLanguage);
        
        // Twitter分享
        twitterBtn.onclick = () => {
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
        };
        
        // LinkedIn分享
        linkedinBtn.onclick = () => {
            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
            window.open(linkedinUrl, '_blank', 'width=600,height=400');
        };
        
        // 复制链接
        copyLinkBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(postUrl);
                const copiedText = this.i18nManager ? this.i18nManager.t('blog.post.shareCopied') : '✓ Copied!';
                const originalText = this.i18nManager ? this.i18nManager.t('blog.post.shareCopy') : '🔗 Copy Link';
                
                copyLinkBtn.innerHTML = copiedText;
                copyLinkBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalText;
                    copyLinkBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        };
    }
    
    // 渲染相关文章
    renderRelatedPosts(currentPost) {
        const relatedPosts = this.blogDataManager.getRelatedPosts(currentPost, 3, this.currentLanguage);
        const container = document.getElementById('related-posts-container');
        const relatedSection = document.getElementById('related-posts');
        
        if (relatedPosts.length === 0) {
            relatedSection.style.display = 'none';
            return;
        }
        
        relatedSection.style.display = 'block';
        container.innerHTML = relatedPosts.map(post => `
            <article class="related-post-card">
                <h4 class="related-post-title">
                    <a href="#post/${post.getSlug(this.currentLanguage)}">
                        ${post.getTitle(this.currentLanguage)}
                    </a>
                </h4>
                <p class="related-post-excerpt">
                    ${post.getExcerpt(this.currentLanguage).substring(0, 100)}...
                </p>
            </article>
        `).join('');
        
        // 绑定相关文章链接
        container.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                const slug = href.replace('#post/', '');
                this.showPostDetail(slug);
            });
        });
    }
    
    // 显示博客列表
    showBlogList() {
        document.getElementById('blog-post-detail').style.display = 'none';
        document.getElementById('blog').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 显示文章未找到
    showPostNotFound() {
        const container = document.getElementById('blog-posts-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Post not found</h3>
                    <p>The requested blog post could not be found.</p>
                    <button onclick="window.blogManager.showBlogList()" class="back-to-blog-btn">
                        ← Back to Blog
                    </button>
                </div>
            `;
        }
    }
    
    // 加载管理后台保存的主页内容
    async loadHomepageContent() {
        console.log('🔄 Loading homepage content from API...');
        
        try {
            // 首先尝试从API加载最新内容
            const response = await fetch('/api/homepage');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.content) {
                    console.log('✅ Loaded homepage content from API:', data.content);
                    this.updateHomepageContent(data.content);
                    return;
                }
            }
        } catch (error) {
            console.log('ℹ️ API not available, trying localStorage...');
        }
        
        // 如果API不可用，尝试从localStorage加载
        try {
            const savedContent = localStorage.getItem('homepage_content');
            if (savedContent) {
                const homepageData = JSON.parse(savedContent);
                console.log('📦 Loading homepage content from localStorage:', homepageData);
                this.updateHomepageContent(homepageData);
            } else {
                console.log('ℹ️ No saved homepage content found, using default content');
            }
        } catch (error) {
            console.error('❌ Error loading homepage content:', error);
        }
    }
    
    // 更新主页内容到DOM
    updateHomepageContent(content) {
        console.log('🔄 Updating homepage content in DOM...');
        
        // 更新网站标题和标语
        if (content['site-title']) {
            const titleElement = document.querySelector('.site-title');
            if (titleElement) {
                titleElement.textContent = content['site-title'];
            }
            // 更新页面标题
            document.title = content['site-title'] + ' - 个人博客';
        }
        
        if (content['site-tagline']) {
            const taglineElement = document.querySelector('.site-tagline');
            if (taglineElement) {
                taglineElement.textContent = content['site-tagline'];
            }
        }
        
        // 更新欢迎区域
        if (content['welcome-title']) {
            const welcomeTitleElement = document.querySelector('.welcome-title');
            if (welcomeTitleElement) {
                welcomeTitleElement.textContent = content['welcome-title'];
            }
        }
        
        if (content['welcome-subtitle']) {
            const welcomeSubtitleElement = document.querySelector('.welcome-subtitle');
            if (welcomeSubtitleElement) {
                welcomeSubtitleElement.textContent = content['welcome-subtitle'];
            }
        }
        
        if (content['navigation-guide']) {
            const navigationGuideElement = document.querySelector('.navigation-guide');
            if (navigationGuideElement) {
                navigationGuideElement.textContent = content['navigation-guide'];
            }
        }
        
        // 更新个人介绍
        if (content['intro1']) {
            const intro1Element = document.querySelector('.personal-intro p:first-child');
            if (intro1Element) {
                intro1Element.textContent = content['intro1'];
            }
        }
        
        if (content['intro2']) {
            const intro2Element = document.querySelector('.personal-intro p:last-child');
            if (intro2Element) {
                intro2Element.textContent = content['intro2'];
            }
        }
        
        // 更新关于我部分
        if (content['about-title']) {
            const aboutTitleElement = document.querySelector('#about h2');
            if (aboutTitleElement) {
                aboutTitleElement.textContent = content['about-title'];
            }
        }
        
        if (content['about-content']) {
            const aboutContentElement = document.querySelector('#about .about-content');
            if (aboutContentElement) {
                aboutContentElement.textContent = content['about-content'];
            }
        }
        
        // 更新技能部分
        if (content['skills-title']) {
            const skillsTitleElement = document.querySelector('#skills h2');
            if (skillsTitleElement) {
                skillsTitleElement.textContent = content['skills-title'];
            }
        }
        
        // 更新经验部分
        if (content['experience-title']) {
            const experienceTitleElement = document.querySelector('#experience h2');
            if (experienceTitleElement) {
                experienceTitleElement.textContent = content['experience-title'];
            }
        }
        
        // 更新专业经历
        if (content['current-role']) {
            const currentRoleElement = document.querySelector('.current-role');
            if (currentRoleElement) {
                currentRoleElement.textContent = content['current-role'];
            }
        }
        
        if (content['current-company']) {
            const currentCompanyElement = document.querySelector('.current-company');
            if (currentCompanyElement) {
                currentCompanyElement.textContent = content['current-company'];
            }
        }
        
        if (content['current-desc']) {
            const currentDescElement = document.querySelector('.current-desc');
            if (currentDescElement) {
                currentDescElement.textContent = content['current-desc'];
            }
        }
        
        if (content['previous-role']) {
            const previousRoleElement = document.querySelector('.previous-role');
            if (previousRoleElement) {
                previousRoleElement.textContent = content['previous-role'];
            }
        }
        
        if (content['previous-company']) {
            const previousCompanyElement = document.querySelector('.previous-company');
            if (previousCompanyElement) {
                previousCompanyElement.textContent = content['previous-company'];
            }
        }
        
        if (content['previous-desc']) {
            const previousDescElement = document.querySelector('.previous-desc');
            if (previousDescElement) {
                previousDescElement.textContent = content['previous-desc'];
            }
        }
        
        // 更新联系部分
        if (content['contact-title']) {
            const contactTitleElement = document.querySelector('#contact h2');
            if (contactTitleElement) {
                contactTitleElement.textContent = content['contact-title'];
            }
        }
        
        if (content['contact-content']) {
            const contactContentElement = document.querySelector('#contact .contact-content');
            if (contactContentElement) {
                contactContentElement.textContent = content['contact-content'];
            }
        }
        
        console.log('✅ Homepage content updated successfully!');
    }
    
    // 初始化主页内容同步
    initializeHomepageSync() {
        console.log('🔄 Initializing homepage content sync...');
        
        // 监听来自管理后台的消息
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'homepage-update') {
                console.log('📝 Received homepage update from admin:', event.data.content);
                this.updateHomepageContent(event.data.content);
                
                // 同时保存到localStorage作为备份
                localStorage.setItem('homepage_content', JSON.stringify(event.data.content));
            }
        });
        
        // 定期检查API更新（可选）
        setInterval(async () => {
            try {
                const response = await fetch('/api/homepage');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.content) {
                        // 检查内容是否有变化
                        const currentContent = localStorage.getItem('homepage_content');
                        const newContentStr = JSON.stringify(data.content);
                        
                        if (currentContent !== newContentStr) {
                            console.log('🔄 Homepage content updated from API');
                            this.updateHomepageContent(data.content);
                            localStorage.setItem('homepage_content', newContentStr);
                        }
                    }
                }
            } catch (error) {
                // 静默处理错误，避免控制台噪音
            }
        }, 30000); // 每30秒检查一次
        
        console.log('✅ Homepage content sync initialized');
    }
                    }
                }
                
                if (homepageData.previousRole || homepageData.previousCompany || homepageData.previousDesc) {
                    const previousExperience = document.querySelector('.experience-item:last-child .experience-details');
                    if (previousExperience) {
                        if (homepageData.previousRole) {
                            const roleElement = previousExperience.querySelector('h4');
                            if (roleElement) roleElement.textContent = homepageData.previousRole;
                        }
                        if (homepageData.previousCompany) {
                            const companyElement = previousExperience.querySelector('p:first-of-type');
                            if (companyElement) companyElement.textContent = homepageData.previousCompany;
                        }
                        if (homepageData.previousDesc) {
                            const descElement = previousExperience.querySelector('p:last-of-type');
                            if (descElement) descElement.textContent = homepageData.previousDesc;
                        }
                    }
                }
                
                // 更新社区活动内容
                if (homepageData.techCommunityDesc) {
                    const techCommunityDesc = document.querySelector('.interest-item:first-child .interest-details p');
                    if (techCommunityDesc) {
                        techCommunityDesc.textContent = homepageData.techCommunityDesc;
                    }
                }
                
                if (homepageData.personalInterestsDesc) {
                    const personalInterestsDesc = document.querySelector('.interest-item:last-child .interest-details p');
                    if (personalInterestsDesc) {
                        personalInterestsDesc.textContent = homepageData.personalInterestsDesc;
                    }
                }
                
                console.log('Homepage content loaded successfully');
            } else {
                console.log('No saved homepage content found');
            }
        } catch (error) {
            console.error('Error loading homepage content:', error);
        }
    }
}

// 工具函数
class BlogUtils {
    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // 检测移动设备
    static isMobile() {
        return window.innerWidth <= 768;
    }
    
    // 检测触摸设备
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}

// 初始化博客管理器
document.addEventListener('DOMContentLoaded', () => {
    const blogManager = new BlogManager();
    
    // 初始化导航增强器
    const navigationEnhancer = new NavigationEnhancer();
    
    // 初始化搜索引擎
    let searchEngine = null;
    if (typeof SearchEngine !== 'undefined') {
        searchEngine = new SearchEngine(blogManager.blogDataManager, blogManager.i18nManager);
        
        // 绑定搜索触发按钮
        const searchTrigger = document.getElementById('search-trigger');
        if (searchTrigger) {
            searchTrigger.addEventListener('click', () => {
                searchEngine.showSearch();
            });
        }
    }
    
    // 初始化SEO优化器
    let seoOptimizer = null;
    if (typeof SEOOptimizer !== 'undefined') {
        seoOptimizer = new SEOOptimizer(blogManager.blogDataManager, blogManager.i18nManager);
    }
    
    // 初始化API客户端
    let apiClient = null;
    if (typeof APIClient !== 'undefined') {
        apiClient = new APIClient();
    }
    
    // 初始化内容加载器
    let contentLoader = null;
    if (typeof ContentLoader !== 'undefined' && apiClient) {
        contentLoader = new ContentLoader(apiClient, blogManager.blogDataManager);
    }
    
    // 初始化同步管理器
    let syncManager = null;
    if (typeof ContentSyncManager !== 'undefined' && apiClient) {
        syncManager = new ContentSyncManager(apiClient, blogManager.blogDataManager);
    }
    
    // 将管理器实例添加到全局作用域，以便其他脚本可以访问
    window.blogManager = blogManager;
    window.navigationEnhancer = navigationEnhancer;
    window.searchEngine = searchEngine;
    window.seoOptimizer = seoOptimizer;
    window.apiClient = apiClient;
    window.contentLoader = contentLoader;
    window.syncManager = syncManager;ow.blogManager = blogManager;
    
    // 初始化导航增强功能（如果可用）
    if (typeof NavigationEnhancer !== 'undefined') {
        window.navigationEnhancer = new NavigationEnhancer();
        
        // 为现有内容添加滚动动画
        setTimeout(() => {
            window.navigationEnhancer.addScrollAnimations();
        }, 500);
    }
    
    // 初始化搜索引擎（如果可用）
    if (typeof SearchEngine !== 'undefined') {
        // 等待博客数据和国际化管理器初始化完成
        setTimeout(() => {
            if (blogManager.blogDataManager && blogManager.i18nManager) {
                window.searchEngine = new SearchEngine(blogManager.blogDataManager, blogManager.i18nManager);
                
                // 绑定搜索触发按钮
                const searchTrigger = document.getElementById('search-trigger');
                if (searchTrigger) {
                    searchTrigger.addEventListener('click', () => {
                        window.searchEngine.showSearch();
                    });
                }
                
                console.log('Search engine initialized successfully');
            } else {
                console.warn('Blog data or i18n manager not available for search');
            }
        }, 1000);
    }
    
    // 初始化SEO优化器（如果可用）
    if (typeof SEOOptimizer !== 'undefined') {
        setTimeout(() => {
            if (blogManager.blogDataManager && blogManager.i18nManager) {
                window.seoOptimizer = new SEOOptimizer(blogManager.blogDataManager, blogManager.i18nManager);
                console.log('SEO optimizer initialized successfully');
            } else {
                console.warn('Blog data or i18n manager not available for SEO optimization');
            }
        }, 1200);
    }
    
    // 初始化API客户端和内容加载器（如果可用）
    if (typeof APIClient !== 'undefined' && typeof ContentLoader !== 'undefined') {
        setTimeout(() => {
            // 初始化API客户端
            window.apiClient = new APIClient();
            
            // 初始化内容加载器
            if (blogManager.blogDataManager) {
                window.contentLoader = new ContentLoader(window.apiClient, blogManager.blogDataManager);
                
                // 初始化同步管理器（如果可用）
                if (typeof ContentSyncManager !== 'undefined') {
                    window.syncManager = new ContentSyncManager(window.apiClient, blogManager.blogDataManager);
                    setupSyncEventListeners();
                    console.log('Content sync manager initialized successfully');
                }
                
                // 设置动态内容加载
                setupDynamicContentLoading();
                
                console.log('API client and content loader initialized successfully');
            } else {
                console.warn('Blog data manager not available for content loader');
            }
        }, 1400);
    }
    
    // 设置动态内容加载
    function setupDynamicContentLoading() {
        // 监听内容加载状态变化
        window.addEventListener('contentLoadingStateChange', (e) => {
            const { id, isLoading } = e.detail;
            updateLoadingUI(id, isLoading);
        });
        
        // 监听API未授权事件
        window.addEventListener('apiUnauthorized', () => {
            handleUnauthorizedAccess();
        });
        
        // 设置离线/在线状态指示器
        setupNetworkStatusIndicator();
    }
    
    // 更新加载UI
    function updateLoadingUI(id, isLoading) {
        const loadingElements = document.querySelectorAll(`[data-loading-for="${id}"]`);
        loadingElements.forEach(element => {
            if (isLoading) {
                element.classList.add('loading');
                element.setAttribute('aria-busy', 'true');
            } else {
                element.classList.remove('loading');
                element.setAttribute('aria-busy', 'false');
            }
        });
    }
    
    // 处理未授权访问
    function handleUnauthorizedAccess() {
        console.warn('Unauthorized access detected');
        // 可以在这里添加重新登录逻辑
    }
    
    // 设置网络状态指示器
    function setupNetworkStatusIndicator() {
        const createNetworkIndicator = () => {
            const indicator = document.createElement('div');
            indicator.id = 'network-status-indicator';
            indicator.className = 'network-status-indicator';
            indicator.innerHTML = `
                <span class="status-icon">📶</span>
                <span class="status-text">Online</span>
            `;
            document.body.appendChild(indicator);
            return indicator;
        };
        
        const indicator = createNetworkIndicator();
        
        const updateNetworkStatus = (isOnline) => {
            if (isOnline) {
                indicator.className = 'network-status-indicator online';
                indicator.innerHTML = `
                    <span class="status-icon">📶</span>
                    <span class="status-text">Online</span>
                `;
            } else {
                indicator.className = 'network-status-indicator offline';
                indicator.innerHTML = `
                    <span class="status-icon">📵</span>
                    <span class="status-text">Offline</span>
                `;
            }
        };
        
        // 初始状态
        updateNetworkStatus(navigator.onLine);
        
        // 监听网络状态变化
        window.addEventListener('online', () => updateNetworkStatus(true));
        window.addEventListener('offline', () => updateNetworkStatus(false));
    }
    
    // 设置同步事件监听器
    function setupSyncEventListeners() {
        // 监听发布状态变化
        window.addEventListener('publishStatusChange', (e) => {
            const task = e.detail;
            updatePublishStatus(task);
        });
        
        // 监听同步状态变化
        window.addEventListener('syncStatusChange', (e) => {
            const task = e.detail;
            updateSyncStatus(task);
        });
        
        // 监听发布队列变化
        window.addEventListener('publishQueued', (e) => {
            const task = e.detail;
            showPublishNotification(task);
        });
    }
    
    // 更新发布状态
    function updatePublishStatus(task) {
        const statusIndicator = document.querySelector(`[data-publish-task="${task.id}"]`);
        if (statusIndicator) {
            statusIndicator.className = `publish-status ${task.status}`;
            statusIndicator.textContent = getPublishStatusText(task.status);
        }
        
        // 显示通知
        if (task.status === 'published') {
            showSuccessNotification('Content published successfully!');
        } else if (task.status === 'failed') {
            showErrorNotification(`Failed to publish content: ${task.error}`);
        }
    }
    
    // 更新同步状态
    function updateSyncStatus(task) {
        const statusIndicator = document.querySelector(`[data-sync-task="${task.id}"]`);
        if (statusIndicator) {
            statusIndicator.className = `sync-status ${task.status}`;
            statusIndicator.textContent = getSyncStatusText(task.status);
        }
        
        // 处理冲突
        if (task.status === 'conflict' && task.conflicts) {
            showConflictResolutionDialog(task);
        }
    }
    
    // 显示发布通知
    function showPublishNotification(task) {
        const notification = createNotification(
            'Content queued for publishing',
            `${task.contentType} will be published when online`,
            'info'
        );
        showNotification(notification);
    }
    
    // 获取发布状态文本
    function getPublishStatusText(status) {
        const statusTexts = {
            'pending': 'Pending',
            'publishing': 'Publishing...',
            'published': 'Published',
            'failed': 'Failed'
        };
        return statusTexts[status] || status;
    }
    
    // 获取同步状态文本
    function getSyncStatusText(status) {
        const statusTexts = {
            'syncing': 'Syncing...',
            'completed': 'Synced',
            'conflict': 'Conflict',
            'failed': 'Failed'
        };
        return statusTexts[status] || status;
    }
    
    // 创建通知
    function createNotification(title, message, type = 'info') {
        return {
            id: Date.now(),
            title: title,
            message: message,
            type: type,
            timestamp: new Date()
        };
    }
    
    // 显示通知
    function showNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${notification.type}`;
        notificationElement.innerHTML = `
            <div class="notification-content">
                <h4 class="notification-title">${notification.title}</h4>
                <p class="notification-message">${notification.message}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notificationElement);
        
        // 自动移除
        setTimeout(() => {
            if (notificationElement.parentElement) {
                notificationElement.remove();
            }
        }, 5000);
    }
    
    // 显示成功通知
    function showSuccessNotification(message) {
        showNotification(createNotification('Success', message, 'success'));
    }
    
    // 显示错误通知
    function showErrorNotification(message) {
        showNotification(createNotification('Error', message, 'error'));
    }
    
    // 显示冲突解决对话框
    function showConflictResolutionDialog(task) {
        const dialog = document.createElement('div');
        dialog.className = 'conflict-dialog';
        dialog.innerHTML = `
            <div class="conflict-dialog-content">
                <h3>Content Conflict Detected</h3>
                <p>There are conflicts in the content that need to be resolved:</p>
                <div class="conflict-list">
                    ${task.conflicts.map(conflict => `
                        <div class="conflict-item">
                            <strong>${conflict.field}</strong> (${conflict.language || 'all'}):
                            <div class="conflict-options">
                                <button onclick="resolveConflict('${task.id}', '${conflict.field}', 'local')">
                                    Keep Local
                                </button>
                                <button onclick="resolveConflict('${task.id}', '${conflict.field}', 'remote')">
                                    Use Remote
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="conflict-actions">
                    <button onclick="resolveAllConflicts('${task.id}', 'local')">Keep All Local</button>
                    <button onclick="resolveAllConflicts('${task.id}', 'remote')">Use All Remote</button>
                    <button onclick="closeConflictDialog()">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }
    
    // 解决单个冲突
    window.resolveConflict = function(taskId, field, resolution) {
        if (window.syncManager) {
            // 这里应该调用同步管理器的冲突解决方法
            console.log(`Resolving conflict for ${field} with ${resolution}`);
        }
    };
    
    // 解决所有冲突
    window.resolveAllConflicts = function(taskId, resolution) {
        if (window.syncManager) {
            // 这里应该调用同步管理器的批量冲突解决方法
            console.log(`Resolving all conflicts with ${resolution}`);
        }
        closeConflictDialog();
    };
    
    // 关闭冲突对话框
    window.closeConflictDialog = function() {
        const dialog = document.querySelector('.conflict-dialog');
        if (dialog) {
            dialog.remove();
        }
    };
    
    // 处理页面加载时的URL哈希
    if (window.location.hash) {
        setTimeout(() => {
            blogManager.navigateToSection(window.location.hash);
        }, 100);
    }
    
    // 处理浏览器前进/后退按钮
    window.addEventListener('popstate', (e) => {
        if (window.location.hash) {
            blogManager.navigateToSection(window.location.hash);
        } else {
            blogManager.navigateToSection('#main');
        }
    });
});

// 页面导航函数
function showMainContent() {
    // 显示主要内容
    document.getElementById('main').style.display = 'block';
    const blogSection = document.querySelector('.blog-section');
    if (blogSection) {
        blogSection.style.display = 'block';
    }
    
    // 隐藏法律页面
    document.getElementById('privacy').style.display = 'none';
    document.getElementById('terms').style.display = 'none';
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPrivacyPolicy(event) {
    event.preventDefault();
    
    // 隐藏主要内容
    document.getElementById('main').style.display = 'none';
    const blogSection = document.querySelector('.blog-section');
    if (blogSection) {
        blogSection.style.display = 'none';
    }
    document.getElementById('terms').style.display = 'none';
    
    // 显示隐私政策
    document.getElementById('privacy').style.display = 'block';
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTermsOfService(event) {
    event.preventDefault();
    
    // 隐藏主要内容
    document.getElementById('main').style.display = 'none';
    const blogSection = document.querySelector('.blog-section');
    if (blogSection) {
        blogSection.style.display = 'none';
    }
    document.getElementById('privacy').style.display = 'none';
    
    // 显示服务条款
    document.getElementById('terms').style.display = 'block';
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 导出类以供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogManager, BlogUtils };
}