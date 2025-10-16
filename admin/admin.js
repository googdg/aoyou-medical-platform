// 管理后台JavaScript
class AdminApp {
    constructor() {
        this.token = localStorage.getItem('admin_token');
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.currentPost = null;
        this.posts = [];
        this.categories = [];
        this.media = [];
        
        this.init();
    }
    
    init() {
        console.log('AdminApp init called');
        
        // 确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initAfterDOMLoad();
            });
        } else {
            this.initAfterDOMLoad();
        }
    }
    
    initAfterDOMLoad() {
        console.log('AdminApp initAfterDOMLoad called');
        this.bindEvents();
        
        if (this.token) {
            this.verifyToken();
        } else {
            this.showLogin();
        }
    }
    
    bindEvents() {
        console.log('Binding events');
        
        // 登录表单
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            console.log('Login form found, binding submit event');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                this.login();
            });
        } else {
            console.error('Login form not found');
        }
        
        // 退出登录
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // 侧边栏导航
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });
        
        // 新建文章
        const newPostBtn = document.getElementById('new-post-btn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => {
                this.showPostEditor();
            });
        }
        
        // 文章编辑器按钮
        const saveDraftBtn = document.getElementById('save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                this.savePost(false);
            });
        }
        
        const publishBtn = document.getElementById('publish-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                this.savePost(true);
            });
        }
        
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.navigateTo('posts');
            });
        }
        
        // 文件上传
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                this.uploadFiles(e.target.files);
            });
        }
        
        // 主页内容管理
        const saveHomepageBtn = document.getElementById('save-homepage-btn');
        if (saveHomepageBtn) {
            saveHomepageBtn.addEventListener('click', () => {
                this.saveHomepage();
            });
        }
        
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // 搜索和过滤
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchPosts(e.target.value);
        });
        
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filterPosts();
        });
        
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filterPosts();
        });
        
        // 标题自动生成slug
        document.getElementById('title-en').addEventListener('input', (e) => {
            document.getElementById('slug-en').value = this.generateSlug(e.target.value);
            this.validateField(e.target);
        });
        
        document.getElementById('title-zh').addEventListener('input', (e) => {
            document.getElementById('slug-zh').value = this.generateSlug(e.target.value);
            this.validateField(e.target);
        });
        
        // 为所有必填字段添加验证
        const requiredFields = ['title-en', 'title-zh', 'slug-en', 'slug-zh', 'content-en', 'content-zh', 'category'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', (e) => {
                    this.validateField(e.target);
                });
                field.addEventListener('input', (e) => {
                    this.clearFieldError(e.target);
                });
            }
        });
        
        // 模态框关闭
        document.querySelector('.close').addEventListener('click', () => {
            this.hideModal();
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal')) {
                this.hideModal();
            }
        });
    }
    
    // API请求方法
    async apiRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };
        
        const config = { ...defaultOptions, ...options };
        
        if (config.headers['Content-Type'] === 'multipart/form-data') {
            delete config.headers['Content-Type'];
        }
        
        try {
            const response = await fetch(`/api${url}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }
            
            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }
    
    // 登录
    async login() {
        console.log('Login function called');
        
        const usernameEl = document.getElementById('username');
        const passwordEl = document.getElementById('password');
        
        if (!usernameEl || !passwordEl) {
            console.error('Username or password input not found');
            this.showError('login-error', '页面元素未找到，请刷新页面重试');
            return;
        }
        
        const username = usernameEl.value;
        const password = passwordEl.value;
        
        console.log('Username:', username, 'Password length:', password.length);
        
        try {
            this.showLoading();
            
            // 模拟登录验证（默认用户名: admin, 密码: admin123）
            if (username === 'admin' && password === 'admin123') {
                console.log('Login credentials valid');
                this.token = 'demo_token_' + Date.now();
                this.currentUser = { username: 'admin', id: 1 };
                localStorage.setItem('admin_token', this.token);
                
                // 模拟API调用延迟
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log('Showing main app');
                this.showMainApp();
                this.showNotification('登录成功', 'success');
            } else {
                console.log('Invalid credentials');
                throw new Error('用户名或密码错误');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError('login-error', error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    // 验证token
    async verifyToken() {
        try {
            // 简单验证token是否存在
            if (this.token && this.token.startsWith('demo_token_')) {
                this.currentUser = { username: 'admin', id: 1 };
                this.showMainApp();
            } else {
                this.logout();
            }
        } catch (error) {
            this.logout();
        }
    }
    
    // 退出登录
    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('admin_token');
        this.showLogin();
    }
    
    // 显示登录页面
    showLogin() {
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
    
    // 显示主应用
    showMainApp() {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        document.getElementById('current-user').textContent = this.currentUser.username;
        
        this.loadCategories();
        this.navigateTo('dashboard');
    }
    
    // 页面导航
    navigateTo(page) {
        // 更新菜单状态
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        
        // 显示对应页面
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');
        
        this.currentPage = page;
        
        // 加载页面数据
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'homepage':
                this.loadHomepage();
                break;
            case 'posts':
                this.loadPosts();
                break;
            case 'media':
                this.loadMedia();
                break;
            case 'categories':
                this.loadCategories();
                break;
        }
    }
    
    // 加载仪表板
    async loadDashboard() {
        try {
            // 从本地存储获取统计数据
            const savedPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
            const publishedPosts = savedPosts.filter(post => post.published);
            const recentPosts = savedPosts.slice(-5).reverse();
            
            const stats = {
                totalPosts: savedPosts.length,
                publishedPosts: publishedPosts.length,
                totalMedia: 0, // 暂时设为0
                recentPosts: recentPosts
            };
            
            document.getElementById('total-posts').textContent = stats.totalPosts;
            document.getElementById('published-posts').textContent = stats.publishedPosts;
            document.getElementById('total-media').textContent = stats.totalMedia;
            
            // 显示最近文章
            const recentPostsList = document.getElementById('recent-posts-list');
            recentPostsList.innerHTML = '';
            
            if (stats.recentPosts.length === 0) {
                recentPostsList.innerHTML = '<div class="no-posts">暂无文章</div>';
            } else {
                stats.recentPosts.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.className = 'recent-post-item';
                    postElement.innerHTML = `
                        <div class="recent-post-title">${post.title_en || '无标题'} / ${post.title_zh || '无标题'}</div>
                        <div class="recent-post-date">${new Date(post.created_at).toLocaleDateString()}</div>
                    `;
                    recentPostsList.appendChild(postElement);
                });
            }
            
        } catch (error) {
            this.showNotification('加载仪表板失败: ' + error.message, 'error');
        }
    }
    
    // 加载文章列表
    async loadPosts(page = 1) {
        try {
            this.showLoading();
            
            // 从本地存储加载文章
            let savedPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
            
            // 应用过滤器
            const category = document.getElementById('category-filter').value;
            const published = document.getElementById('status-filter').value;
            const search = document.getElementById('search-input').value;
            
            let filteredPosts = savedPosts;
            
            if (category) {
                filteredPosts = filteredPosts.filter(post => post.category === category);
            }
            
            if (published !== '') {
                const isPublished = published === 'true';
                filteredPosts = filteredPosts.filter(post => post.published === isPublished);
            }
            
            if (search) {
                const searchLower = search.toLowerCase();
                filteredPosts = filteredPosts.filter(post => 
                    post.title_en.toLowerCase().includes(searchLower) ||
                    post.title_zh.toLowerCase().includes(searchLower) ||
                    post.content_en.toLowerCase().includes(searchLower) ||
                    post.content_zh.toLowerCase().includes(searchLower)
                );
            }
            
            // 分页
            const limit = 10;
            const total = filteredPosts.length;
            const pages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
            
            this.posts = paginatedPosts;
            
            this.renderPostsList(paginatedPosts);
            this.renderPagination('posts-pagination', { page, pages, total }, (p) => this.loadPosts(p));
            
            // 模拟加载延迟
            await new Promise(resolve => setTimeout(resolve, 300));
            
        } catch (error) {
            this.showNotification('加载文章失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // 渲染文章列表
    renderPostsList(posts) {
        const container = document.getElementById('posts-list');
        container.innerHTML = '';
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.innerHTML = `
                <div class="post-info">
                    <h3>${post.title_en} / ${post.title_zh}</h3>
                    <div class="post-meta">
                        分类: ${post.category} | 
                        作者: ${post.author_name} | 
                        创建时间: ${new Date(post.created_at).toLocaleDateString()}
                    </div>
                </div>
                <div class="post-status ${post.published ? 'status-published' : 'status-draft'}">
                    ${post.published ? '已发布' : '草稿'}
                </div>
                <div class="post-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminApp.editPost(${post.id})">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="adminApp.deletePost(${post.id})">删除</button>
                </div>
            `;
            container.appendChild(postElement);
        });
    }
    
    // 显示文章编辑器
    showPostEditor(post = null) {
        this.currentPost = post;
        
        if (post) {
            document.getElementById('editor-title').textContent = '编辑文章';
            this.fillPostForm(post);
        } else {
            document.getElementById('editor-title').textContent = '新建文章';
            this.clearPostForm();
        }
        
        document.getElementById('post-editor-page').classList.add('active');
        document.getElementById('posts-page').classList.remove('active');
    }
    
    // 填充文章表单
    fillPostForm(post) {
        document.getElementById('post-id').value = post.id;
        document.getElementById('title-en').value = post.title_en;
        document.getElementById('title-zh').value = post.title_zh;
        document.getElementById('slug-en').value = post.slug_en;
        document.getElementById('slug-zh').value = post.slug_zh;
        document.getElementById('category').value = post.category;
        document.getElementById('tags').value = post.tags.join(', ');
        document.getElementById('excerpt-en').value = post.excerpt_en || '';
        document.getElementById('excerpt-zh').value = post.excerpt_zh || '';
        document.getElementById('content-en').value = post.content_en;
        document.getElementById('content-zh').value = post.content_zh;
        document.getElementById('featured').checked = post.featured;
    }
    
    // 清空文章表单
    clearPostForm() {
        document.getElementById('post-form').reset();
        document.getElementById('post-id').value = '';
    }
    
    // 编辑文章
    async editPost(id) {
        try {
            // 从本地存储加载文章
            const savedPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
            const post = savedPosts.find(p => p.id === id);
            
            if (!post) {
                throw new Error('文章不存在');
            }
            
            this.showPostEditor(post);
        } catch (error) {
            this.showNotification('加载文章失败: ' + error.message, 'error');
        }
    }
    
    // 保存文章
    async savePost(publish = false) {
        try {
            this.showLoading();
            
            const formData = new FormData(document.getElementById('post-form'));
            const postData = {
                id: formData.get('id') || Date.now().toString(),
                title_en: formData.get('title_en'),
                title_zh: formData.get('title_zh'),
                slug_en: formData.get('slug_en'),
                slug_zh: formData.get('slug_zh'),
                content_en: formData.get('content_en'),
                content_zh: formData.get('content_zh'),
                excerpt_en: formData.get('excerpt_en'),
                excerpt_zh: formData.get('excerpt_zh'),
                category: formData.get('category'),
                tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
                featured: formData.has('featured'),
                published: publish,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                author_name: this.currentUser?.username || 'Admin'
            };
            
            // 验证表单
            if (!this.validateForm()) {
                throw new Error('请填写所有必填字段');
            }
            
            // 从本地存储获取现有文章
            let savedPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
            
            const postId = formData.get('id');
            
            if (postId) {
                // 更新现有文章
                const index = savedPosts.findIndex(post => post.id === postId);
                if (index !== -1) {
                    savedPosts[index] = { ...savedPosts[index], ...postData };
                } else {
                    savedPosts.push(postData);
                }
            } else {
                // 添加新文章
                savedPosts.push(postData);
            }
            
            // 保存到本地存储
            localStorage.setItem('blog_posts', JSON.stringify(savedPosts));
            
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.showNotification(publish ? '文章发布成功！' : '文章保存为草稿！', 'success');
            this.navigateTo('posts');
            
        } catch (error) {
            this.showNotification('保存文章失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // 删除文章
    async deletePost(id) {
        if (!confirm('确定要删除这篇文章吗？')) {
            return;
        }
        
        try {
            this.showLoading();
            
            // 从本地存储删除文章
            let savedPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
            savedPosts = savedPosts.filter(post => post.id !== id);
            localStorage.setItem('blog_posts', JSON.stringify(savedPosts));
            
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.showNotification('文章删除成功！', 'success');
            this.loadPosts();
            
        } catch (error) {
            this.showNotification('删除文章失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // 搜索文章
    searchPosts(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadPosts(1);
        }, 500);
    }
    
    // 过滤文章
    filterPosts() {
        this.loadPosts(1);
    }
    
    // 加载分类
    async loadCategories() {
        try {
            // 默认分类数据
            this.categories = [
                { id: 'tech', name_zh: '技术分享', name_en: 'Technology', description_zh: '技术相关文章', description_en: 'Technology related articles' },
                { id: 'life', name_zh: '生活感悟', name_en: 'Life', description_zh: '生活感悟和思考', description_en: 'Life insights and thoughts' },
                { id: 'work', name_zh: '工作经验', name_en: 'Work', description_zh: '工作经验分享', description_en: 'Work experience sharing' },
                { id: 'travel', name_zh: '旅行记录', name_en: 'Travel', description_zh: '旅行见闻', description_en: 'Travel experiences' }
            ];
            
            // 更新分类选择器
            const categorySelects = document.querySelectorAll('#category, #category-filter');
            categorySelects.forEach(select => {
                const currentValue = select.value;
                select.innerHTML = select.id === 'category-filter' ? '<option value="">所有分类</option>' : '<option value="">选择分类</option>';
                
                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = `${category.name_zh} (${category.name_en})`;
                    select.appendChild(option);
                });
                
                select.value = currentValue;
            });
            
            // 渲染分类列表页面
            if (this.currentPage === 'categories') {
                this.renderCategoriesList();
            }
            
        } catch (error) {
            this.showNotification('加载分类失败: ' + error.message, 'error');
        }
    }
    
    // 渲染分类列表
    renderCategoriesList() {
        const container = document.getElementById('categories-list');
        container.innerHTML = '';
        
        this.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.innerHTML = `
                <div class="category-icon">📂</div>
                <div class="category-info">
                    <h3>${category.name_zh} (${category.name_en})</h3>
                    <div class="category-description">${category.description_zh || category.description_en || ''}</div>
                </div>
                <div class="category-id">${category.id}</div>
            `;
            container.appendChild(categoryElement);
        });
    }
    
    // 加载媒体文件
    async loadMedia(page = 1) {
        try {
            this.showLoading();
            
            const data = await this.apiRequest(`/media?page=${page}&limit=20`);
            this.media = data.media;
            
            this.renderMediaGrid(data.media);
            this.renderPagination('media-pagination', data.pagination, (p) => this.loadMedia(p));
            
        } catch (error) {
            this.showNotification('加载媒体文件失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // 渲染媒体网格
    renderMediaGrid(media) {
        const container = document.getElementById('media-grid');
        container.innerHTML = '';
        
        media.forEach(item => {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item';
            mediaElement.innerHTML = `
                <img src="${item.path}" alt="${item.alt_text}" class="media-preview" loading="lazy">
                <div class="media-info">
                    <div class="media-name">${item.original_name}</div>
                    <div class="media-size">${this.formatFileSize(item.size)}</div>
                </div>
            `;
            container.appendChild(mediaElement);
        });
    }
    
    // 上传文件
    async uploadFiles(files) {
        for (const file of files) {
            try {
                this.showLoading();
                
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await this.apiRequest('/media/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                
                this.showNotification(`文件 ${file.name} 上传成功`, 'success');
                
            } catch (error) {
                this.showNotification(`文件 ${file.name} 上传失败: ${error.message}`, 'error');
            } finally {
                this.hideLoading();
            }
        }
        
        // 重新加载媒体列表
        this.loadMedia();
    }
    
    // 渲染分页
    renderPagination(containerId, pagination, onPageChange) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        const { page, pages, total } = pagination;
        
        // 上一页按钮
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '上一页';
        prevBtn.disabled = page <= 1;
        prevBtn.addEventListener('click', () => onPageChange(page - 1));
        container.appendChild(prevBtn);
        
        // 页码按钮
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === page ? 'current' : '';
            pageBtn.addEventListener('click', () => onPageChange(i));
            container.appendChild(pageBtn);
        }
        
        // 下一页按钮
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '下一页';
        nextBtn.disabled = page >= pages;
        nextBtn.addEventListener('click', () => onPageChange(page + 1));
        container.appendChild(nextBtn);
        
        // 总数信息
        const info = document.createElement('span');
        info.textContent = `共 ${total} 条`;
        info.style.marginLeft = '1rem';
        container.appendChild(info);
    }
    
    // 工具方法
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // UI方法
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        } else {
            console.log('Loading...');
        }
    }
    
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        } else {
            // 如果没有通知元素，使用alert作为后备
            alert(message);
        }
    }
    
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            // 如果没有错误元素，使用alert作为后备
            alert('错误: ' + message);
        }
    }
    
    showModal(content) {
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal').style.display = 'flex';
    }
    
    hideModal() {
        document.getElementById('modal').style.display = 'none';
    }
    
    // 字段验证方法
    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        if (isRequired && !value) {
            this.showFieldError(field, '此字段为必填项');
            return false;
        } else {
            this.clearFieldError(field);
            return true;
        }
    }
    
    showFieldError(field, message) {
        // 移除已存在的错误提示
        this.clearFieldError(field);
        
        // 创建错误提示元素
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '0.25rem';
        
        // 添加错误样式到字段
        field.style.borderColor = '#e74c3c';
        field.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
        
        // 插入错误提示
        field.parentNode.appendChild(errorElement);
    }
    
    clearFieldError(field) {
        // 移除错误样式
        field.style.borderColor = '';
        field.style.boxShadow = '';
        
        // 移除错误提示元素
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    // 验证整个表单
    validateForm() {
        const requiredFields = document.querySelectorAll('#post-form [required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // 主页内容管理方法
    async loadHomepage() {
        try {
            this.showLoading();
            
            // 从i18n.json文件加载当前内容
            const response = await fetch('/data/i18n.json');
            const i18nData = await response.json();
            
            // 填充表单字段
            this.populateHomepageForm(i18nData);
            
        } catch (error) {
            this.showNotification('加载主页内容失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    populateHomepageForm(i18nData) {
        const zh = i18nData.zh;
        const en = i18nData.en;
        
        // 基本信息
        document.getElementById('site-title').value = zh.site.title || '';
        document.getElementById('site-tagline').value = zh.site.tagline || '';
        document.getElementById('site-description').value = zh.site.description || '';
        
        // 个人介绍
        document.getElementById('welcome-title').value = zh.welcome.title || '';
        document.getElementById('welcome-subtitle').value = zh.welcome.subtitle || '';
        document.getElementById('intro-text1').value = zh.welcome.intro1 || '';
        document.getElementById('intro-text2').value = zh.welcome.intro2 || '';
        
        // 专业经历
        document.getElementById('current-role').value = zh.welcome.currentRole || '';
        document.getElementById('current-company').value = zh.welcome.currentCompany || '';
        document.getElementById('current-desc').value = zh.welcome.currentDesc || '';
        document.getElementById('previous-role').value = zh.welcome.previousRole || '';
        document.getElementById('previous-company').value = zh.welcome.previousCompany || '';
        document.getElementById('previous-desc').value = zh.welcome.previousDesc || '';
        
        // 社区活动
        document.getElementById('community-title').value = zh.welcome.communityTitle || '';
        document.getElementById('community-desc').value = zh.welcome.communityDesc || '';
        document.getElementById('tech-community-title').value = zh.welcome.techCommunity || '';
        document.getElementById('tech-community-desc').value = zh.welcome.techCommunityDesc || '';
        document.getElementById('personal-interests-title').value = zh.welcome.personalInterests || '';
        document.getElementById('personal-interests-desc').value = zh.welcome.personalInterestsDesc || '';
        
        // 标签（这些可能需要从现有数据中提取）
        document.getElementById('tech-community-tags').value = 'Women Techmarkers, Devfest Shanghai, Google Developer Community';
        document.getElementById('personal-interests-tags').value = 'Cooking, Food Photography, Culinary Exploration';
    }
    
    async saveHomepage() {
        try {
            this.showLoading();
            
            // 验证必填字段
            const requiredFields = [
                'site-title', 'site-tagline', 'site-description',
                'welcome-title', 'welcome-subtitle', 'intro-text1', 'intro-text2',
                'current-role', 'current-company', 'current-desc',
                'previous-role', 'previous-company', 'previous-desc',
                'community-title', 'community-desc',
                'tech-community-title', 'tech-community-desc',
                'personal-interests-title', 'personal-interests-desc'
            ];
            
            let hasErrors = false;
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value.trim()) {
                    this.showFieldError(field, '此字段为必填项');
                    hasErrors = true;
                }
            });
            
            if (hasErrors) {
                throw new Error('请填写所有必填字段');
            }
            
            // 收集表单数据
            const homepageData = {
                zh: {
                    site: {
                        title: document.getElementById('site-title').value,
                        tagline: document.getElementById('site-tagline').value,
                        description: document.getElementById('site-description').value
                    },
                    welcome: {
                        title: document.getElementById('welcome-title').value,
                        subtitle: document.getElementById('welcome-subtitle').value,
                        intro1: document.getElementById('intro-text1').value,
                        intro2: document.getElementById('intro-text2').value,
                        currentRole: document.getElementById('current-role').value,
                        currentCompany: document.getElementById('current-company').value,
                        currentDesc: document.getElementById('current-desc').value,
                        previousRole: document.getElementById('previous-role').value,
                        previousCompany: document.getElementById('previous-company').value,
                        previousDesc: document.getElementById('previous-desc').value,
                        communityTitle: document.getElementById('community-title').value,
                        communityDesc: document.getElementById('community-desc').value,
                        techCommunity: document.getElementById('tech-community-title').value,
                        techCommunityDesc: document.getElementById('tech-community-desc').value,
                        personalInterests: document.getElementById('personal-interests-title').value,
                        personalInterestsDesc: document.getElementById('personal-interests-desc').value
                    }
                }
            };
            
            // 保存到本地存储（临时解决方案）
            localStorage.setItem('homepage_data', JSON.stringify(homepageData));
            
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.showNotification('主页内容保存成功！', 'success');
            
        } catch (error) {
            this.showNotification('保存失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }urrentCompany: document.getElementById('current-company').value,
                    currentDesc: document.getElementById('current-desc').value,
                    previousRole: document.getElementById('previous-role').value,
                    previousCompany: document.getElementById('previous-company').value,
                    previousDesc: document.getElementById('previous-desc').value,
                    communityTitle: document.getElementById('community-title').value,
                    communityDesc: document.getElementById('community-desc').value,
                    techCommunity: document.getElementById('tech-community-title').value,
                    techCommunityDesc: document.getElementById('tech-community-desc').value,
                    personalInterests: document.getElementById('personal-interests-title').value,
                    personalInterestsDesc: document.getElementById('personal-interests-desc').value
                }
            };
            
            // 发送到服务器保存
            const response = await this.apiRequest('/homepage/update', {
                method: 'POST',
                body: JSON.stringify(homepageData)
            });
            
            this.showNotification('主页内容保存成功！', 'success');
            
        } catch (error) {
            this.showNotification('保存主页内容失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    switchTab(tabName) {
        // 移除所有活动状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // 激活选中的标签页
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
}

// 初始化应用
const adminApp = new AdminApp();