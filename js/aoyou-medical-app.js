/**
 * Aoyou Digital 医学科普学习平台 - 主应用
 * 负责应用初始化、页面路由和全局状态管理
 */

class AoyouMedicalApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'auth';
        this.isLoading = false;
        this.videoData = [];
        this.currentCategory = 'all';
        
        // 初始化应用
        this.init();
    }
    
    /**
     * 应用初始化
     */
    async init() {
        try {
            console.log('开始初始化奥友医学平台...');
            this.showLoading();
            
            // 初始化各个管理器
            this.initManagers();
            
            // 检查用户登录状态
            await this.checkAuthStatus();
            
            // 初始化事件监听
            this.initEventListeners();
            
            // 生成视频数据
            this.generateVideoData();
            
            // 加载保存的视频数据
            this.loadSavedVideoData();
            
            // 初始化页面
            this.initPage();
            
            // 检查是否从演示页面跳转过来
            this.checkDemoMode();
            
            console.log('奥友医学平台初始化完成');
            this.hideLoading();
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showToast('应用初始化失败，请刷新页面重试');
            this.hideLoading();
        }
    }
    
    /**
     * 初始化各个管理器
     */
    initManagers() {
        try {
            // 初始化存储管理器
            if (typeof AoyouStorageManager !== 'undefined') {
                this.storageManager = new AoyouStorageManager();
            }
            
            // 初始化性能优化器
            if (typeof AoyouPerformanceOptimizer !== 'undefined') {
                this.performanceOptimizer = new AoyouPerformanceOptimizer();
            }
            
            // 初始化用户体验管理器
            if (typeof AoyouUXManager !== 'undefined') {
                this.uxManager = new AoyouUXManager();
            }
            
            // 初始化数据分析管理器
            if (typeof AoyouAnalyticsManager !== 'undefined') {
                this.analyticsManager = new AoyouAnalyticsManager();
            }
            
            // 初始化认证管理器
            if (typeof AoyouAuthManager !== 'undefined') {
                this.authManager = new AoyouAuthManager();
            }
            
            // 初始化积分管理器
            if (typeof AoyouPointsManager !== 'undefined') {
                this.pointsManager = new AoyouPointsManager();
            }
            
            // 初始化视频管理器
            if (typeof AoyouVideoManager !== 'undefined') {
                this.videoManager = new AoyouVideoManager();
            }
            
            // 初始化微信管理器
            if (typeof AoyouWechatManager !== 'undefined') {
                this.wechatManager = new AoyouWechatManager();
            }
            
            // 初始化移动端管理器
            if (typeof AoyouMobileManager !== 'undefined') {
                this.mobileManager = new AoyouMobileManager();
            }
            
            console.log('管理器初始化完成');
        } catch (error) {
            console.warn('部分管理器初始化失败:', error);
        }
    }
    
    /**
     * 检查用户认证状态
     */
    async checkAuthStatus() {
        const userData = localStorage.getItem('aoyou_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.currentPage = 'main';
                this.updateUserUI();
            } catch (error) {
                console.error('用户数据解析失败:', error);
                localStorage.removeItem('aoyou_user');
            }
        }
        // 无论是否登录，都显示主页面，允许浏览内容
        this.currentPage = 'main';
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 底部导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });
        
        // 分类导航
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.switchCategory(category);
            });
            
            // 长按显示分类信息
            let pressTimer;
            item.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    const category = e.currentTarget.dataset.category;
                    this.showCategoryInfo(category);
                }, 500);
            });
            
            item.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });
            
            // 鼠标悬停显示分类信息（桌面端）
            item.addEventListener('mouseenter', (e) => {
                const category = e.currentTarget.dataset.category;
                this.showCategoryInfoTooltip(category, e.currentTarget);
            });
        });
        
        // 关闭分类信息面板
        document.getElementById('close-category-info')?.addEventListener('click', () => {
            this.hideCategoryInfo();
        });
        
        // 搜索功能
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        searchBtn?.addEventListener('click', () => this.performSearch());
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // 返回按钮
        document.getElementById('back-btn')?.addEventListener('click', () => {
            this.navigateTo('main');
        });
        
        document.getElementById('profile-back-btn')?.addEventListener('click', () => {
            this.navigateTo('main');
        });
        
        // 用户头像点击
        document.getElementById('user-avatar')?.addEventListener('click', () => {
            this.navigateTo('profile');
        });
        
        // 个人中心功能按钮
        document.getElementById('clear-history-btn')?.addEventListener('click', () => {
            this.clearWatchHistory();
        });
        
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });
        
        // 登录按钮
        document.getElementById('login-btn')?.addEventListener('click', () => {
            this.navigateTo('auth');
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.currentUser) {
                this.refreshUserData();
            }
        });
    }
    
    /**
     * 加载视频数据
     */
    async loadVideoData() {
        try {
            // 模拟视频数据（实际应用中应从API获取）
            this.videoData = this.generateMockVideoData();
            this.renderVideoList();
        } catch (error) {
            console.error('加载视频数据失败:', error);
            this.showToast('加载视频数据失败');
        }
    }
    
    /**
     * 生成模拟视频数据
     */
    generateMockVideoData() {
        const categories = [
            { 
                id: 'basic', 
                name: '基础医学', 
                icon: '📚',
                description: '解剖学、生理学、病理学等医学基础知识',
                color: '#FF6B6B'
            },
            { 
                id: 'clinical', 
                name: '临床医学', 
                icon: '🩺',
                description: '内科、外科、妇产科、儿科等临床实践',
                color: '#4ECDC4'
            },
            { 
                id: 'imaging', 
                name: '医学影像', 
                icon: '🔬',
                description: 'X光、CT、MRI、超声等影像诊断技术',
                color: '#45B7D1'
            },
            { 
                id: 'pharmacy', 
                name: '药学治疗', 
                icon: '💊',
                description: '药理学、临床用药、治疗方案制定',
                color: '#96CEB4'
            },
            { 
                id: 'technology', 
                name: '前沿技术', 
                icon: '🤖',
                description: '人工智能、精准医学、新兴医疗技术',
                color: '#FFEAA7'
            },
            { 
                id: 'ethics', 
                name: '伦理法规', 
                icon: '⚖️',
                description: '医疗法规、伦理规范、质量管理',
                color: '#DDA0DD'
            },
            { 
                id: 'education', 
                name: '继续教育', 
                icon: '🎓',
                description: '学术会议、专家讲座、技能培训',
                color: '#98D8C8'
            }
        ];
        
        const videos = [];
        
        // 添加奥友医学平台演示视频（真实视频）
        videos.push({
            id: 'aoyou_demo_2_0',
            title: '奥友医学平台演示视频 2.0',
            description: '奥友医学科普学习平台完整功能演示，展示用户注册、视频学习、积分系统、移动端体验等核心功能特性',
            category: 'education',
            categoryName: '平台演示',
            categoryColor: '#667eea',
            subCategory: 'platform',
            subCategoryName: '平台介绍',
            difficulty: 'beginner',
            duration: 300, // 5分钟（请根据实际视频长度调整）
            videoUrl: './videos/aoyou-demo-video-2.0.mp4',
            thumbnail: './images/aoyou-demo-thumbnail.jpg',
            viewCount: 5280,
            likeCount: 456,
            favoriteCount: 789,
            shareCount: 234,
            rating: '5.0',
            instructor: {
                name: '奥友团队',
                title: '产品经理',
                hospital: '奥友数字医疗',
                avatar: './images/instructor-1.jpg',
                bio: '专注于医学教育数字化转型'
            },
            tags: ['平台演示', '功能介绍', '使用指南', '医学教育'],
            createdAt: new Date('2024-01-20'),
            isLiked: false,
            isFavorited: false,
            isNew: true,
            isHot: true,
            isPremium: true,
            isFeatured: true, // 设为推荐视频
            isDemo: true // 标记为演示视频
        });
        
        // 为每个分类生成不同类型的视频
        categories.forEach(category => {
            const videoTypes = this.getVideoTypesByCategory(category.id);
            
            videoTypes.forEach((type, index) => {
                const videoCount = Math.floor(Math.random() * 5) + 3; // 每种类型3-7个视频
                
                for (let i = 1; i <= videoCount; i++) {
                    videos.push({
                        id: `${category.id}_${type.id}_${i}`,
                        title: `${type.title} - 第${i}讲`,
                        description: type.description,
                        category: category.id,
                        categoryName: category.name,
                        categoryColor: category.color,
                        subCategory: type.id,
                        subCategoryName: type.title,
                        difficulty: type.difficulty || this.getRandomDifficulty(),
                        duration: Math.floor(Math.random() * 3600) + 600, // 10分钟到1小时
                        videoUrl: this.getRandomVideoUrl(),
                        thumbnail: this.getRandomThumbnail(),
                        viewCount: Math.floor(Math.random() * 10000) + 100,
                        likeCount: Math.floor(Math.random() * 1000) + 10,
                        favoriteCount: Math.floor(Math.random() * 500) + 5,
                        shareCount: Math.floor(Math.random() * 200) + 2,
                        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0评分
                        instructor: this.getRandomInstructor(),
                        tags: this.getRandomTags(category.id),
                        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // 最近90天
                        isLiked: false,
                        isFavorited: false,
                        isNew: Math.random() < 0.2, // 20%概率是新视频
                        isHot: Math.random() < 0.15, // 15%概率是热门视频
                        isPremium: Math.random() < 0.1 // 10%概率是精品内容
                    });
                }
            });
        });
        
        return videos.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    /**
     * 根据分类获取视频类型
     */
    getVideoTypesByCategory(categoryId) {
        const videoTypes = {
            basic: [
                { id: 'anatomy', title: '人体解剖学', description: '系统学习人体各器官系统的结构和功能', difficulty: 'beginner', tags: ['解剖', '基础'] },
                { id: 'physiology', title: '生理学基础', description: '深入理解人体生理机制和调节过程', difficulty: 'intermediate', tags: ['生理', '机制'] },
                { id: 'pathology', title: '病理学概论', description: '疾病发生发展的基本规律和病理变化', difficulty: 'intermediate', tags: ['病理', '疾病'] },
                { id: 'biochemistry', title: '医学生物化学', description: '生物分子结构功能与代谢调节', difficulty: 'advanced', tags: ['生化', '分子'] }
            ],
            clinical: [
                { id: 'internal', title: '内科学精要', description: '内科常见疾病的诊断治疗和管理', difficulty: 'intermediate', tags: ['内科', '诊断'] },
                { id: 'surgery', title: '外科手术技巧', description: '外科手术操作技能和围手术期管理', difficulty: 'advanced', tags: ['外科', '手术'] },
                { id: 'pediatrics', title: '儿科临床实践', description: '儿童疾病特点和诊疗要点', difficulty: 'intermediate', tags: ['儿科', '儿童'] },
                { id: 'obstetrics', title: '妇产科临床', description: '妇科疾病和产科管理的临床要点', difficulty: 'intermediate', tags: ['妇产科', '产科'] }
            ],
            imaging: [
                { id: 'xray', title: 'X线影像诊断', description: 'X线片的阅读技巧和诊断要点', difficulty: 'beginner', tags: ['X线', '诊断'] },
                { id: 'ct', title: 'CT影像解读', description: 'CT扫描图像的分析和诊断方法', difficulty: 'intermediate', tags: ['CT', '扫描'] },
                { id: 'mri', title: 'MRI成像原理', description: 'MRI成像技术和临床应用', difficulty: 'advanced', tags: ['MRI', '成像'] },
                { id: 'ultrasound', title: '超声诊断技术', description: '超声检查操作和图像判读', difficulty: 'intermediate', tags: ['超声', '检查'] }
            ],
            pharmacy: [
                { id: 'pharmacology', title: '药理学基础', description: '药物作用机制和药代动力学', difficulty: 'intermediate', tags: ['药理', '机制'] },
                { id: 'clinical_pharmacy', title: '临床药学实践', description: '临床合理用药和药物治疗管理', difficulty: 'advanced', tags: ['临床', '用药'] },
                { id: 'drug_interaction', title: '药物相互作用', description: '药物间相互作用的识别和处理', difficulty: 'advanced', tags: ['相互作用', '安全'] },
                { id: 'adverse_reaction', title: '药物不良反应', description: '不良反应的监测预防和处理', difficulty: 'intermediate', tags: ['不良反应', '监测'] }
            ],
            technology: [
                { id: 'ai_medicine', title: '医学人工智能', description: 'AI在医疗诊断和治疗中的应用', difficulty: 'advanced', tags: ['AI', '智能'] },
                { id: 'precision_medicine', title: '精准医学', description: '基因检测和个体化治疗策略', difficulty: 'advanced', tags: ['精准', '基因'] },
                { id: 'telemedicine', title: '远程医疗技术', description: '远程诊疗系统和数字健康', difficulty: 'intermediate', tags: ['远程', '数字'] },
                { id: 'medical_devices', title: '医疗设备创新', description: '新型医疗设备的原理和应用', difficulty: 'intermediate', tags: ['设备', '创新'] }
            ],
            ethics: [
                { id: 'medical_ethics', title: '医学伦理学', description: '医疗实践中的伦理原则和道德规范', difficulty: 'beginner', tags: ['伦理', '道德'] },
                { id: 'medical_law', title: '医疗法律法规', description: '医疗相关法律条文和执业规范', difficulty: 'intermediate', tags: ['法律', '规范'] },
                { id: 'quality_management', title: '医疗质量管理', description: '医疗质量控制和持续改进', difficulty: 'intermediate', tags: ['质量', '管理'] },
                { id: 'patient_safety', title: '患者安全', description: '医疗安全管理和风险防控', difficulty: 'intermediate', tags: ['安全', '风险'] }
            ],
            education: [
                { id: 'academic_conference', title: '学术会议精选', description: '国内外重要医学会议内容分享', difficulty: 'advanced', tags: ['会议', '学术'] },
                { id: 'expert_lecture', title: '专家讲座', description: '知名专家的学术讲座和经验分享', difficulty: 'intermediate', tags: ['专家', '讲座'] },
                { id: 'skill_training', title: '技能培训', description: '临床技能操作和实践训练', difficulty: 'beginner', tags: ['技能', '培训'] },
                { id: 'case_study', title: '病例讨论', description: '典型病例分析和诊疗思路', difficulty: 'advanced', tags: ['病例', '讨论'] }
            ]
        };
        
        return videoTypes[categoryId] || [];
    }
    
    /**
     * 获取随机难度
     */
    getRandomDifficulty() {
        const difficulties = ['beginner', 'intermediate', 'advanced'];
        return difficulties[Math.floor(Math.random() * difficulties.length)];
    }
    
    /**
     * 获取随机讲师
     */
    getRandomInstructor() {
        const instructors = [
            { name: '张教授', title: '主任医师', hospital: '北京协和医院' },
            { name: '李主任', title: '副主任医师', hospital: '上海华山医院' },
            { name: '王医生', title: '主治医师', hospital: '广州中山医院' },
            { name: '陈专家', title: '教授', hospital: '四川大学华西医院' },
            { name: '刘院长', title: '主任医师', hospital: '西京医院' },
            { name: '赵博士', title: '副教授', hospital: '中南大学湘雅医院' }
        ];
        
        return instructors[Math.floor(Math.random() * instructors.length)];
    }
    
    /**
     * 渲染视频列表
     */
    renderVideoList(videos = null) {
        const videoList = document.getElementById('video-list');
        if (!videoList) return;
        
        const videosToRender = videos || this.getFilteredVideos();
        
        // 更新分类计数
        this.updateCategoryCounts();
        
        if (videosToRender.length === 0) {
            videoList.innerHTML = `
                <div class="empty-state">
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📺</div>
                        <h3>暂无视频内容</h3>
                        <p>该分类下暂时没有视频，请尝试其他分类</p>
                    </div>
                </div>
            `;
            return;
        }
        
        const isLoggedIn = !!this.currentUser;
        
        videoList.innerHTML = videosToRender.map(video => {
            const difficultyColors = {
                'beginner': '#2ECC71',
                'intermediate': '#F39C12', 
                'advanced': '#E74C3C'
            };
            
            const difficultyNames = {
                'beginner': '入门',
                'intermediate': '进阶',
                'advanced': '高级'
            };
            
            return `
                <div class="video-card ${!isLoggedIn ? 'requires-auth' : ''}" data-video-id="${video.id}">
                    <div class="video-thumbnail">
                        <img src="${video.thumbnail}" alt="${video.title}" 
                             onerror="this.src='./images/default-thumbnail.jpg'">
                        <div class="video-duration-badge">${this.formatDuration(video.duration)}</div>
                        ${video.isNew ? '<div class="video-badge new-badge">新</div>' : ''}
                        ${video.isHot ? '<div class="video-badge hot-badge">热</div>' : ''}
                        ${video.isPremium ? '<div class="video-badge premium-badge">精</div>' : ''}
                        <div class="play-icon">▶</div>
                    </div>
                    <div class="video-info">
                        <h3 class="video-title">${video.title}</h3>
                        ${video.instructor ? `
                            <div class="video-instructor">
                                <span class="instructor-name">${video.instructor.name}</span>
                                <span class="instructor-title">${video.instructor.title}</span>
                            </div>
                        ` : ''}
                        <div class="video-meta">
                            <span class="video-category-badge" style="background-color: ${video.categoryColor || '#2E86AB'}">${video.categoryName}</span>
                            <span class="difficulty-badge" style="background-color: ${difficultyColors[video.difficulty] || '#6c757d'}">${difficultyNames[video.difficulty] || '通用'}</span>
                            <span class="video-rating">⭐ ${video.rating || '4.5'}</span>
                        </div>
                        <div class="video-stats">
                            <span>👁️ ${this.formatNumber(video.viewCount)}</span>
                            <span>👍 ${this.formatNumber(video.likeCount)}</span>
                            <span>⭐ ${this.formatNumber(video.favoriteCount)}</span>
                        </div>
                        ${video.tags && video.tags.length > 0 ? `
                            <div class="video-tags">
                                ${video.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // 添加视频卡片点击事件
        videoList.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const videoId = e.currentTarget.dataset.videoId;
                this.playVideo(videoId);
            });
        });
    }
    
    /**
     * 获取过滤后的视频列表
     */
    getFilteredVideos() {
        let filtered = this.videoData;
        
        // 按分类过滤
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(video => video.category === this.currentCategory);
        }
        
        // 按搜索关键词过滤
        const searchTerm = document.getElementById('search-input')?.value.trim();
        if (searchTerm) {
            filtered = filtered.filter(video => 
                video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                video.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filtered;
    }
    
    /**
     * 切换分类
     */
    switchCategory(category) {
        this.currentCategory = category;
        
        // 更新分类导航UI
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
        
        // 重新渲染视频列表
        this.renderVideoList();
    }
    
    /**
     * 执行搜索
     */
    performSearch() {
        this.renderVideoList();
    }
    
    /**
     * 播放视频
     */
    playVideo(videoId) {
        const video = this.videoData.find(v => v.id === videoId);
        if (!video) {
            this.showToast('视频不存在');
            return;
        }
        
        // 检查用户是否已登录
        if (!this.currentUser) {
            // 未登录，显示邀请码注册页面
            this.showAuthForVideo(video);
            return;
        }
        
        // 已登录，直接播放视频
        // 更新观看次数
        video.viewCount = (video.viewCount || 0) + 1;
        video.views = (video.views || 0) + 1;
        
        // 设置视频播放器的当前视频
        if (window.AoyouMedicalVideo) {
            window.AoyouMedicalVideo.setCurrentVideo(video);
        }
        
        // 记录观看历史
        this.recordVideoWatch(video);
        
        // 导航到视频页面
        this.navigateTo('video', { video });
        
        // 保存更新的视频数据
        this.saveVideoData();
    }
    
    /**
     * 保存视频数据到本地存储
     */
    saveVideoData() {
        try {
            localStorage.setItem('aoyou_video_data', JSON.stringify(this.videoData));
        } catch (error) {
            console.error('保存视频数据失败:', error);
        }
    }
    
    /**
     * 从本地存储加载保存的视频数据
     */
    loadSavedVideoData() {
        try {
            const savedData = localStorage.getItem('aoyou_video_data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // 合并保存的数据和默认数据
                this.videoData = this.videoData.map(video => {
                    const savedVideo = parsedData.find(v => v.id === video.id);
                    return savedVideo ? { ...video, ...savedVideo } : video;
                });
            }
        } catch (error) {
            console.error('加载视频数据失败:', error);
        }
    }
    
    /**
     * 更新观看进度
     */
    updateWatchProgress(videoId, progress) {
        const video = this.videoData.find(v => v.id === videoId);
        if (video) {
            video.watchProgress = progress;
            this.saveVideoData();
        }
    }
    
    /**
     * 记录视频观看
     */
    recordVideoWatch(video) {
        if (!this.currentUser) return;
        
        // 更新用户观看历史
        const watchHistory = JSON.parse(localStorage.getItem('aoyou_watch_history') || '[]');
        const existingIndex = watchHistory.findIndex(item => item.videoId === video.id);
        
        const watchRecord = {
            videoId: video.id,
            videoTitle: video.title,
            videoCategory: video.categoryName,
            videoThumbnail: video.thumbnail,
            watchedAt: new Date().toISOString(),
            duration: video.duration,
            progress: 0 // 观看进度，将在视频播放时更新
        };
        
        if (existingIndex >= 0) {
            // 保留之前的观看进度
            watchRecord.progress = watchHistory[existingIndex].progress || 0;
            watchHistory[existingIndex] = watchRecord;
        } else {
            watchHistory.unshift(watchRecord);
        }
        
        // 只保留最近50条记录
        if (watchHistory.length > 50) {
            watchHistory.splice(50);
        }
        
        localStorage.setItem('aoyou_watch_history', JSON.stringify(watchHistory));
        
        // 给予观看积分
        if (window.AoyouPointsSystem) {
            window.AoyouPointsSystem.earnPoints('VIDEO_WATCH', video.id);
        }
    }
    
    /**
     * 更新观看进度
     */
    updateWatchProgress(videoId, progress) {
        const watchHistory = JSON.parse(localStorage.getItem('aoyou_watch_history') || '[]');
        const recordIndex = watchHistory.findIndex(item => item.videoId === videoId);
        
        if (recordIndex >= 0) {
            watchHistory[recordIndex].progress = progress;
            watchHistory[recordIndex].watchedAt = new Date().toISOString();
            localStorage.setItem('aoyou_watch_history', JSON.stringify(watchHistory));
        }
    }
    
    /**
     * 页面导航
     */
    navigateTo(page, data = null) {
        // 隐藏所有页面
        document.querySelectorAll('.main-content > section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // 更新底部导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 显示目标页面
        switch (page) {
            case 'auth':
                this.showAuthPage();
                break;
            case 'main':
                this.showMainPage();
                break;
            case 'video':
                this.showVideoPage(data?.video);
                break;
            case 'profile':
                this.showProfilePage();
                break;
        }
        
        this.currentPage = page;
    }
    
    /**
     * 显示认证页面
     */
    showAuthPage() {
        document.getElementById('auth-section')?.classList.remove('hidden');
        
        // 如果没有待播放的视频，显示通用的登录提示
        if (!this.pendingVideo) {
            const authHeader = document.querySelector('.auth-header');
            if (authHeader) {
                authHeader.innerHTML = `
                    <h2>登录/注册</h2>
                    <p>登录后可享受完整的学习体验</p>
                `;
            }
        }
    }
    
    /**
     * 显示主页面
     */
    showMainPage() {
        // 允许未登录用户浏览主页面
        document.getElementById('main-section')?.classList.remove('hidden');
        document.querySelector('[data-page="main"]')?.classList.add('active');
    }
    
    /**
     * 显示视频页面
     */
    showVideoPage(video) {
        if (!video) {
            this.navigateTo('main');
            return;
        }
        
        const videoSection = document.getElementById('video-section');
        if (!videoSection) return;
        
        videoSection.classList.remove('hidden');
        
        // 更新视频信息
        document.getElementById('video-title').textContent = video.title;
        document.getElementById('video-duration').textContent = this.formatDuration(video.duration);
        document.getElementById('video-category').textContent = video.categoryName;
        document.getElementById('video-views').textContent = `${this.formatNumber(video.viewCount)}次观看`;
        document.getElementById('video-desc').textContent = video.description;
        
        // 设置视频源
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            videoPlayer.src = video.videoUrl;
            videoPlayer.load();
        }
        
        // 更新互动按钮状态
        this.updateVideoActions(video);
    }
    
    /**
     * 显示个人中心页面
     */
    showProfilePage() {
        if (!this.currentUser) {
            this.showToast('请先登录后查看个人中心');
            this.navigateTo('auth');
            return;
        }
        
        document.getElementById('profile-section')?.classList.remove('hidden');
        document.querySelector('[data-page="profile"]')?.classList.add('active');
        
        // 更新个人信息
        this.updateProfileUI();
        
        // 更新积分显示
        this.updatePointsDisplay();
        
        // 初始化等级详情面板
        this.initLevelDetailsPanel();
    }
    
    /**
     * 更新用户界面
     */
    updateUserUI() {
        if (!this.currentUser) {
            document.getElementById('user-info')?.classList.add('hidden');
            document.getElementById('login-btn')?.classList.remove('hidden');
            return;
        }
        
        document.getElementById('login-btn')?.classList.add('hidden');
        document.getElementById('user-info')?.classList.remove('hidden');
        
        // 更新用户信息显示
        const levelNum = document.getElementById('user-level-num');
        const pointsNum = document.getElementById('user-points-num');
        const userAvatar = document.getElementById('user-avatar');
        
        if (levelNum) levelNum.textContent = this.currentUser.level || 1;
        if (pointsNum) pointsNum.textContent = this.currentUser.points || 0;
        if (userAvatar) userAvatar.src = this.currentUser.avatar || './images/default-avatar.png';
    }
    
    /**
     * 更新个人中心界面
     */
    updateProfileUI() {
        if (!this.currentUser) return;
        
        // 基本信息
        document.getElementById('profile-name').textContent = this.currentUser.name || '用户';
        document.getElementById('profile-invite-code').textContent = this.currentUser.inviteCode || '----';
        document.getElementById('profile-join-date').textContent = this.formatDate(this.currentUser.registeredAt);
        document.getElementById('profile-avatar').src = this.currentUser.avatar || './images/default-avatar.png';
        
        // 统计信息
        document.getElementById('total-points').textContent = this.currentUser.points || 0;
        document.getElementById('current-level').textContent = this.currentUser.level || 1;
        
        // 观看和收藏统计
        const watchHistory = JSON.parse(localStorage.getItem('aoyou_watch_history') || '[]');
        const favorites = JSON.parse(localStorage.getItem('aoyou_favorites') || '[]');
        const likes = JSON.parse(localStorage.getItem('aoyou_likes') || '[]');
        
        // 计算总观看时长
        let totalWatchTime = 0;
        watchHistory.forEach(record => {
            if (record.duration && record.progress) {
                totalWatchTime += record.duration * record.progress;
            }
        });
        
        document.getElementById('watched-videos').textContent = watchHistory.length;
        document.getElementById('favorite-videos').textContent = favorites.length;
        document.getElementById('liked-videos').textContent = likes.length;
        document.getElementById('total-watch-time').textContent = Math.round(totalWatchTime / 60); // 转换为分钟
        
        // 等级进度
        this.updateLevelProgress();
        
        // 收藏列表
        this.updateFavoritesList();
        
        // 最近观看
        this.updateRecentWatchList();
    }
    
    /**
     * 更新等级进度
     */
    updateLevelProgress() {
        const currentLevel = this.currentUser?.level || 1;
        const currentPoints = this.currentUser?.points || 0;
        
        // 等级系统配置
        const levels = [
            { level: 1, name: '初学者', minPoints: 0, maxPoints: 99 },
            { level: 2, name: '学习者', minPoints: 100, maxPoints: 299 },
            { level: 3, name: '进步者', minPoints: 300, maxPoints: 599 },
            { level: 4, name: '实践者', minPoints: 600, maxPoints: 999 },
            { level: 5, name: '专业者', minPoints: 1000, maxPoints: 1999 },
            { level: 6, name: '专家', minPoints: 2000, maxPoints: 3999 },
            { level: 7, name: '大师', minPoints: 4000, maxPoints: 7999 },
            { level: 8, name: '导师', minPoints: 8000, maxPoints: Infinity }
        ];
        
        const currentLevelInfo = levels.find(l => l.level === currentLevel) || levels[0];
        const nextLevelInfo = levels.find(l => l.level === currentLevel + 1);
        
        document.getElementById('level-name').textContent = currentLevelInfo.name;
        
        if (nextLevelInfo) {
            const progress = ((currentPoints - currentLevelInfo.minPoints) / 
                            (nextLevelInfo.minPoints - currentLevelInfo.minPoints)) * 100;
            document.getElementById('level-progress-text').textContent = 
                `${currentPoints}/${nextLevelInfo.minPoints}`;
            document.getElementById('progress-fill').style.width = `${Math.min(progress, 100)}%`;
        } else {
            document.getElementById('level-progress-text').textContent = '已达到最高等级';
            document.getElementById('progress-fill').style.width = '100%';
        }
    }
    
    /**
     * 更新收藏列表
     */
    updateFavoritesList() {
        const favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) return;
        
        const favorites = JSON.parse(localStorage.getItem('aoyou_favorites') || '[]');
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="text-center text-secondary">暂无收藏的视频</p>';
            return;
        }
        
        favoritesList.innerHTML = favorites.map(fav => {
            const video = this.videoData.find(v => v.id === fav.videoId);
            if (!video) return '';
            
            return `
                <div class="favorite-item" data-video-id="${video.id}">
                    <img src="${video.thumbnail}" alt="${video.title}" class="favorite-thumbnail"
                         onerror="this.src='./images/default-thumbnail.jpg'">
                    <div class="favorite-info">
                        <div class="favorite-title">${video.title}</div>
                        <div class="favorite-meta">
                            ${video.categoryName} · ${this.formatDuration(video.duration)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // 添加点击事件
        favoritesList.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const videoId = e.currentTarget.dataset.videoId;
                this.playVideo(videoId);
            });
        });
    }
    
    /**
     * 更新视频互动按钮
     */
    updateVideoActions(video) {
        const favorites = JSON.parse(localStorage.getItem('aoyou_favorites') || '[]');
        const likes = JSON.parse(localStorage.getItem('aoyou_likes') || '[]');
        
        const isLiked = likes.some(like => like.videoId === video.id);
        const isFavorited = favorites.some(fav => fav.videoId === video.id);
        
        // 更新按钮状态
        const likeBtn = document.getElementById('like-btn');
        const favoriteBtn = document.getElementById('favorite-btn');
        
        if (likeBtn) {
            likeBtn.classList.toggle('active', isLiked);
            document.getElementById('like-count').textContent = video.likeCount;
        }
        
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active', isFavorited);
            document.getElementById('favorite-count').textContent = video.favoriteCount;
        }
    }
    
    /**
     * 刷新用户数据
     */
    refreshUserData() {
        if (this.currentUser) {
            // 从本地存储更新用户数据
            const userData = localStorage.getItem('aoyou_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.updateUserUI();
                
                if (this.currentPage === 'profile') {
                    this.updateProfileUI();
                }
            }
        }
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 可以在这里添加响应式处理逻辑
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer && !videoPlayer.paused) {
            // 调整视频播放器大小
            videoPlayer.style.height = 'auto';
        }
    }
    
    /**
     * 显示加载动画
     */
    showLoading() {
        this.isLoading = true;
        document.getElementById('loading-overlay')?.classList.remove('hidden');
    }
    
    /**
     * 隐藏加载动画
     */
    hideLoading() {
        this.isLoading = false;
        setTimeout(() => {
            document.getElementById('loading-overlay')?.classList.add('hidden');
        }, 500);
    }
    
    /**
     * 显示提示消息
     */
    showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, duration);
        }
    }
    
    /**
     * 更新积分显示
     */
    updatePointsDisplay() {
        if (!this.currentUser || !window.AoyouPointsSystem) return;
        
        const userPoints = window.AoyouPointsSystem.getUserPoints(this.currentUser.id);
        const levelProgress = window.AoyouPointsSystem.getLevelProgress(userPoints.total);
        
        // 更新个人中心的积分显示
        const totalPointsEl = document.getElementById('total-points');
        const currentLevelEl = document.getElementById('current-level');
        const levelNameEl = document.getElementById('level-name');
        const levelProgressTextEl = document.getElementById('level-progress-text');
        const progressFillEl = document.getElementById('progress-fill');
        
        if (totalPointsEl) totalPointsEl.textContent = userPoints.total;
        if (currentLevelEl) currentLevelEl.textContent = userPoints.level;
        if (levelNameEl) levelNameEl.textContent = userPoints.levelName;
        
        if (levelProgressTextEl && levelProgress.next) {
            const currentInLevel = userPoints.total - levelProgress.current.minPoints;
            const neededForNext = levelProgress.next.minPoints - levelProgress.current.minPoints;
            levelProgressTextEl.textContent = `${currentInLevel}/${neededForNext}`;
        } else if (levelProgressTextEl) {
            levelProgressTextEl.textContent = '已满级';
        }
        
        if (progressFillEl) {
            progressFillEl.style.width = `${levelProgress.progress}%`;
        }
        
        // 更新导航栏的积分显示（如果有的话）
        const navPointsEl = document.querySelector('.nav-points');
        if (navPointsEl) {
            navPointsEl.textContent = userPoints.total;
        }
    }
    
    /**
     * 显示等级升级通知
     */
    showLevelUpNotification(level) {
        // 创建升级通知元素
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎉</div>
                <div class="level-up-text">
                    <h3>恭喜升级！</h3>
                    <p>您已升级到 <strong>${level.name}</strong> (${level.level}级)</p>
                </div>
            </div>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: levelUpAnimation 3s ease-in-out;
            text-align: center;
            min-width: 280px;
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes levelUpAnimation {
                0% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.5); 
                }
                20% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.1); 
                }
                30% { 
                    transform: translate(-50%, -50%) scale(1); 
                }
                90% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
                100% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.8); 
                }
            }
            .level-up-content {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .level-up-icon {
                font-size: 48px;
            }
            .level-up-text h3 {
                margin: 0 0 8px 0;
                font-size: 20px;
            }
            .level-up-text p {
                margin: 0;
                font-size: 16px;
                opacity: 0.9;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 3000);
        
        // 播放升级音效（如果有的话）
        this.playLevelUpSound();
    }
    
    /**
     * 播放升级音效
     */
    playLevelUpSound() {
        try {
            // 创建简单的升级音效
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('无法播放音效:', error);
        }
    }
    
    /**
     * 初始化等级详情面板
     */
    initLevelDetailsPanel() {
        const levelDetailsBtn = document.getElementById('level-details-btn');
        const levelDetailsPanel = document.getElementById('level-details-panel');
        const levelDetailsClose = document.getElementById('level-details-close');
        
        if (levelDetailsBtn) {
            levelDetailsBtn.addEventListener('click', () => {
                this.showLevelDetailsPanel();
            });
        }
        
        if (levelDetailsClose) {
            levelDetailsClose.addEventListener('click', () => {
                this.hideLevelDetailsPanel();
            });
        }
        
        if (levelDetailsPanel) {
            levelDetailsPanel.addEventListener('click', (e) => {
                if (e.target === levelDetailsPanel) {
                    this.hideLevelDetailsPanel();
                }
            });
        }
    }
    
    /**
     * 显示等级详情面板
     */
    showLevelDetailsPanel() {
        if (!this.currentUser || !window.AoyouPointsSystem) return;
        
        const panel = document.getElementById('level-details-panel');
        if (!panel) return;
        
        // 更新等级详情内容
        this.updateLevelDetailsContent();
        
        // 显示面板
        panel.classList.remove('hidden');
    }
    
    /**
     * 隐藏等级详情面板
     */
    hideLevelDetailsPanel() {
        const panel = document.getElementById('level-details-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }
    
    /**
     * 更新等级详情内容
     */
    updateLevelDetailsContent() {
        if (!this.currentUser || !window.AoyouPointsSystem) return;
        
        const userPoints = window.AoyouPointsSystem.getUserPoints(this.currentUser.id);
        const levelProgress = window.AoyouPointsSystem.getLevelProgress(userPoints.total);
        const levelSystem = window.AoyouPointsSystem.levelSystem;
        
        // 更新当前等级信息
        const currentLevelNumber = document.getElementById('current-level-number');
        const currentLevelName = document.getElementById('current-level-name');
        const currentLevelDesc = document.getElementById('current-level-desc');
        
        if (currentLevelNumber) currentLevelNumber.textContent = levelProgress.current.level;
        if (currentLevelName) currentLevelName.textContent = levelProgress.current.name;
        if (currentLevelDesc) {
            currentLevelDesc.textContent = this.getLevelDescription(levelProgress.current.level);
        }
        
        // 更新当前等级特权
        this.updateCurrentPrivileges(levelProgress.current.level);
        
        // 更新下一等级信息
        if (levelProgress.next) {
            const nextLevelInfo = document.getElementById('next-level-info');
            const nextLevelName = document.getElementById('next-level-name');
            const pointsToNext = document.getElementById('points-to-next');
            
            if (nextLevelInfo) nextLevelInfo.classList.remove('hidden');
            if (nextLevelName) nextLevelName.textContent = levelProgress.next.name;
            if (pointsToNext) pointsToNext.textContent = levelProgress.pointsToNext;
            
            this.updateNextPrivileges(levelProgress.next.level);
        } else {
            const nextLevelInfo = document.getElementById('next-level-info');
            if (nextLevelInfo) nextLevelInfo.classList.add('hidden');
        }
        
        // 更新所有等级列表
        this.updateAllLevelsList(levelSystem, userPoints.total);
    }
    
    /**
     * 获取等级描述
     */
    getLevelDescription(level) {
        const descriptions = {
            1: '医学学习的起点，开始您的专业成长之路',
            2: '掌握基础知识，向更深层次的医学领域探索',
            3: '不断进步中，医学知识体系逐渐完善',
            4: '理论与实践结合，具备一定的专业能力',
            5: '专业知识扎实，能够独立处理常见问题',
            6: '医学专家水平，具备丰富的临床经验',
            7: '医学大师级别，在专业领域有深入研究',
            8: '医学导师，能够指导他人的学习和成长'
        };
        return descriptions[level] || '继续努力，不断提升专业水平';
    }
    
    /**
     * 更新当前等级特权
     */
    updateCurrentPrivileges(level) {
        const privilegesList = document.getElementById('current-privileges');
        if (!privilegesList) return;
        
        const privileges = this.getLevelPrivileges(level);
        privilegesList.innerHTML = privileges.map(privilege => 
            `<li>✅ ${privilege}</li>`
        ).join('');
    }
    
    /**
     * 更新下一等级特权
     */
    updateNextPrivileges(level) {
        const privilegesList = document.getElementById('next-privileges');
        if (!privilegesList) return;
        
        const currentLevel = level - 1;
        const currentPrivileges = this.getLevelPrivileges(currentLevel);
        const nextPrivileges = this.getLevelPrivileges(level);
        
        // 找出新增的特权
        const newPrivileges = nextPrivileges.filter(privilege => 
            !currentPrivileges.includes(privilege)
        );
        
        privilegesList.innerHTML = newPrivileges.map(privilege => 
            `<li>🔓 ${privilege}</li>`
        ).join('');
    }
    
    /**
     * 获取等级特权
     */
    getLevelPrivileges(level) {
        const allPrivileges = {
            1: ['观看基础医学视频', '参与视频互动（点赞、收藏、分享）'],
            2: ['访问进阶医学内容', '获得学习徽章'],
            3: ['参与专业讨论', '下载学习资料'],
            4: ['访问实践案例', '获得学习证书'],
            5: ['参与专家讲座', '优先获得新内容'],
            6: ['访问专家级内容', '参与内容评审'],
            7: ['成为内容贡献者', '获得专属标识'],
            8: ['指导新用户', '参与平台治理', '获得最高荣誉']
        };
        
        let privileges = [];
        for (let i = 1; i <= level; i++) {
            if (allPrivileges[i]) {
                privileges = privileges.concat(allPrivileges[i]);
            }
        }
        
        return privileges;
    }
    
    /**
     * 更新所有等级列表
     */
    updateAllLevelsList(levelSystem, currentPoints) {
        const levelsList = document.getElementById('levels-list');
        if (!levelsList) return;
        
        levelsList.innerHTML = levelSystem.map(level => {
            let statusClass = 'locked';
            let statusIcon = '🔒';
            
            if (currentPoints >= level.minPoints) {
                if (currentPoints <= level.maxPoints || level.maxPoints === Infinity) {
                    statusClass = 'current';
                    statusIcon = '⭐';
                } else {
                    statusClass = 'completed';
                    statusIcon = '✅';
                }
            }
            
            const pointsRange = level.maxPoints === Infinity 
                ? `${level.minPoints}+ 积分`
                : `${level.minPoints}-${level.maxPoints} 积分`;
            
            return `
                <div class="level-item ${statusClass}">
                    <div class="level-item-badge">${statusIcon}</div>
                    <div class="level-item-info">
                        <div class="level-item-name">${level.level}级 ${level.name}</div>
                        <div class="level-item-range">${pointsRange}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * 显示确认对话框
     */
    showConfirm(title, message, onConfirm, onCancel = null) {
        const dialog = document.getElementById('confirm-dialog');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');
        
        if (dialog && titleEl && messageEl && okBtn && cancelBtn) {
            titleEl.textContent = title;
            messageEl.textContent = message;
            dialog.classList.remove('hidden');
            
            const handleOk = () => {
                dialog.classList.add('hidden');
                if (onConfirm) onConfirm();
                cleanup();
            };
            
            const handleCancel = () => {
                dialog.classList.add('hidden');
                if (onCancel) onCancel();
                cleanup();
            };
            
            const cleanup = () => {
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
            };
            
            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
        }
    }
    
    /**
     * 初始化页面
     */
    initPage() {
        // 默认显示主页面，允许用户浏览内容
        this.navigateTo('main');
    }
    
    /**
     * 显示视频播放需要的认证页面
     */
    showAuthForVideo(video) {
        // 保存要播放的视频信息
        this.pendingVideo = video;
        
        // 显示认证页面
        this.navigateTo('auth');
        
        // 更新认证页面的提示信息
        const authHeader = document.querySelector('.auth-header');
        if (authHeader) {
            authHeader.innerHTML = `
                <h2>观看视频需要验证</h2>
                <p>请使用邀请码注册或登录以观看《${video.title}》</p>
            `;
        }
    }
    
    /**
     * 认证成功后播放待播放的视频
     */
    playPendingVideo() {
        if (this.pendingVideo && this.currentUser) {
            const video = this.pendingVideo;
            this.pendingVideo = null;
            
            // 更新观看次数
            video.viewCount++;
            
            // 记录观看历史
            this.recordVideoWatch(video);
            
            // 导航到视频页面
            this.navigateTo('video', { video });
        }
    }
    
    /**
     * 工具方法：格式化时长
     */
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * 更新最近观看列表
     */
    updateRecentWatchList() {
        const recentWatchList = document.getElementById('recent-watch-list');
        if (!recentWatchList) return;
        
        const watchHistory = JSON.parse(localStorage.getItem('aoyou_watch_history') || '[]');
        
        if (watchHistory.length === 0) {
            recentWatchList.innerHTML = '<p class="text-center text-secondary">暂无观看记录</p>';
            return;
        }
        
        // 只显示最近5个
        const recentVideos = watchHistory.slice(0, 5);
        
        recentWatchList.innerHTML = recentVideos.map(record => {
            const video = this.videoData.find(v => v.id === record.videoId);
            if (!video) return '';
            
            const watchProgress = record.progress || 0;
            const watchTime = this.formatRelativeTime(record.watchedAt);
            
            return `
                <div class="recent-watch-item" data-video-id="${video.id}">
                    <div class="recent-watch-thumbnail">
                        <img src="${video.thumbnail}" alt="${video.title}" 
                             onerror="this.src='./images/default-thumbnail.jpg'">
                        <div class="watch-progress-bar" style="width: ${watchProgress * 100}%"></div>
                    </div>
                    <div class="recent-watch-info">
                        <div class="recent-watch-title">${video.title}</div>
                        <div class="recent-watch-meta">
                            <span>${video.categoryName}</span>
                            <span class="watch-time">${watchTime}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // 添加点击事件
        recentWatchList.querySelectorAll('.recent-watch-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const videoId = e.currentTarget.dataset.videoId;
                this.playVideo(videoId);
            });
        });
    }
    
    /**
     * 清除观看记录
     */
    clearWatchHistory() {
        this.showConfirm(
            '清除观看记录',
            '确定要清除所有观看记录吗？此操作不可恢复。',
            () => {
                localStorage.removeItem('aoyou_watch_history');
                this.updateProfileUI();
                this.showToast('观看记录已清除');
            }
        );
    }
    
    /**
     * 用户退出登录
     */
    logout() {
        this.showConfirm(
            '退出登录',
            '确定要退出登录吗？',
            () => {
                // 清除用户数据
                localStorage.removeItem('aoyou_user');
                this.currentUser = null;
                
                // 更新UI
                this.updateUserUI();
                
                // 跳转到主页
                this.navigateTo('main');
                
                this.showToast('已退出登录');
            }
        );
    }
    
    /**
     * 格式化相对时间
     */
    formatRelativeTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 7) return `${diffDays}天前`;
        
        return date.toLocaleDateString('zh-CN');
    }
    
    /**
     * 格式化日期
     */
    formatDate(dateString) {
        if (!dateString) return '未知';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    /**
     * 更新分类计数
     */
    updateCategoryCounts() {
        const categories = ['all', 'basic', 'clinical', 'imaging', 'pharmacy', 'technology', 'ethics', 'education'];
        
        categories.forEach(category => {
            const count = category === 'all' 
                ? this.videoData.length 
                : this.videoData.filter(video => video.category === category).length;
            
            const countElement = document.getElementById(`count-${category}`);
            if (countElement) {
                countElement.textContent = count;
                countElement.style.display = count > 0 ? 'block' : 'none';
            }
        });
    }
    
    /**
     * 显示分类信息面板
     */
    showCategoryInfo(categoryId) {
        const categoryInfo = this.getCategoryInfo(categoryId);
        if (!categoryInfo) return;
        
        const infoPanel = document.getElementById('category-info');
        const title = document.getElementById('category-info-title');
        const description = document.getElementById('category-info-description');
        const videoCount = document.getElementById('category-video-count');
        const totalDuration = document.getElementById('category-total-duration');
        
        if (infoPanel && title && description && videoCount && totalDuration) {
            title.textContent = categoryInfo.name;
            description.textContent = categoryInfo.description;
            videoCount.textContent = `${categoryInfo.videoCount} 个视频`;
            totalDuration.textContent = `${Math.round(categoryInfo.totalDuration / 60)} 分钟`;
            
            infoPanel.classList.remove('hidden');
        }
    }
    
    /**
     * 隐藏分类信息面板
     */
    hideCategoryInfo() {
        const infoPanel = document.getElementById('category-info');
        if (infoPanel) {
            infoPanel.classList.add('hidden');
        }
    }
    
    /**
     * 显示分类信息提示（桌面端）
     */
    showCategoryInfoTooltip(categoryId, element) {
        // 简单的提示实现，可以后续扩展
        const categoryInfo = this.getCategoryInfo(categoryId);
        if (categoryInfo) {
            element.title = `${categoryInfo.name}: ${categoryInfo.videoCount}个视频`;
        }
    }
    
    /**
     * 获取分类信息
     */
    getCategoryInfo(categoryId) {
        const categoryMap = {
            all: { 
                name: '全部视频', 
                description: '平台所有医学科普和学术视频内容',
                icon: '🏥'
            },
            basic: { 
                name: '基础医学', 
                description: '解剖学、生理学、病理学等医学基础知识',
                icon: '📚'
            },
            clinical: { 
                name: '临床医学', 
                description: '内科、外科、妇产科、儿科等临床实践',
                icon: '🩺'
            },
            imaging: { 
                name: '医学影像', 
                description: 'X光、CT、MRI、超声等影像诊断技术',
                icon: '🔬'
            },
            pharmacy: { 
                name: '药学治疗', 
                description: '药理学、临床用药、治疗方案制定',
                icon: '💊'
            },
            technology: { 
                name: '前沿技术', 
                description: '人工智能、精准医学、新兴医疗技术',
                icon: '🤖'
            },
            ethics: { 
                name: '伦理法规', 
                description: '医疗法规、伦理规范、质量管理',
                icon: '⚖️'
            },
            education: { 
                name: '继续教育', 
                description: '学术会议、专家讲座、技能培训',
                icon: '🎓'
            }
        };
        
        const categoryData = categoryMap[categoryId];
        if (!categoryData) return null;
        
        const videos = categoryId === 'all' 
            ? this.videoData 
            : this.videoData.filter(video => video.category === categoryId);
        
        const totalDuration = videos.reduce((sum, video) => sum + video.duration, 0);
        
        return {
            ...categoryData,
            videoCount: videos.length,
            totalDuration: totalDuration
        };
    }
    
    /**
     * 获取分类统计信息
     */
    getCategoryStats() {
        const stats = {};
        const categories = ['basic', 'clinical', 'imaging', 'pharmacy', 'technology', 'ethics', 'education'];
        
        categories.forEach(category => {
            const videos = this.videoData.filter(video => video.category === category);
            const totalDuration = videos.reduce((sum, video) => sum + video.duration, 0);
            const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0);
            
            stats[category] = {
                videoCount: videos.length,
                totalDuration: totalDuration,
                totalViews: totalViews,
                averageRating: videos.length > 0 
                    ? (videos.reduce((sum, video) => sum + parseFloat(video.rating || 0), 0) / videos.length).toFixed(1)
                    : 0
            };
        });
        
        return stats;
    }
    
    /**
     * 工具方法：格式化数字
     */
    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.aoyouApp = new AoyouMedicalApp();
        console.log('奥友医学平台初始化成功');
    } catch (error) {
        console.error('应用初始化失败:', error);
        // 显示错误信息给用户
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4757;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
        `;
        errorDiv.textContent = '应用初始化失败，请刷新页面重试';
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});

    /**
     * 获取随机演示视频URL
     */
    getRandomVideoUrl() {
        const demoVideos = [
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
        ];
        
        return demoVideos[Math.floor(Math.random() * demoVideos.length)];
    }
    
    /**
     * 获取随机缩略图URL
     */
    getRandomThumbnail() {
        const thumbnails = [
            'https://via.placeholder.com/320x180/667eea/ffffff?text=心脏解剖',
            'https://via.placeholder.com/320x180/764ba2/ffffff?text=血液循环',
            'https://via.placeholder.com/320x180/f093fb/ffffff?text=体格检查',
            'https://via.placeholder.com/320x180/4facfe/ffffff?text=心电图解读',
            'https://via.placeholder.com/320x180/43e97b/ffffff?text=无菌操作',
            'https://via.placeholder.com/320x180/38f9d7/ffffff?text=缝合技术',
            'https://via.placeholder.com/320x180/feca57/ffffff?text=问诊技巧',
            'https://via.placeholder.com/320x180/ff9ff3/ffffff?text=听诊技术',
            'https://via.placeholder.com/320x180/54a0ff/ffffff?text=药物配伍',
            'https://via.placeholder.com/320x180/5f27cd/ffffff?text=AI辅助诊断',
            'https://via.placeholder.com/320x180/ff6b6b/ffffff?text=医学教育',
            'https://via.placeholder.com/320x180/4ecdc4/ffffff?text=临床实践',
            'https://via.placeholder.com/320x180/45b7d1/ffffff?text=医学知识'
        ];
        
        return thumbnails[Math.floor(Math.random() * thumbnails.length)];
    }
    
    /**
     * 获取随机标签
     */
    getRandomTags(categoryId) {
        const tagsByCategory = {
            clinical: ['临床诊断', '病例分析', '诊疗指南', '临床技能'],
            basic: ['解剖学', '生理学', '病理学', '基础理论'],
            surgery: ['手术技巧', '无菌操作', '术前准备', '术后护理'],
            internal: ['内科诊疗', '慢病管理', '急诊处理', '康复治疗'],
            pharmacy: ['药理学', '临床用药', '药物相互作用', '用药安全'],
            technology: ['人工智能', '精准医学', '远程医疗', '数字化'],
            ethics: ['医疗伦理', '法律法规', '医患关系', '质量管理'],
            education: ['继续教育', '学术前沿', '专业发展', '技能培训']
        };
        
        const categoryTags = tagsByCategory[categoryId] || ['医学教育', '专业知识'];
        const allTags = [...categoryTags, '实用技能', '专家讲解', '案例教学'];
        
        // 随机选择2-4个标签
        const tagCount = Math.floor(Math.random() * 3) + 2;
        const selectedTags = [];
        
        for (let i = 0; i < tagCount; i++) {
            const availableTags = allTags.filter(tag => !selectedTags.includes(tag));
            if (availableTags.length > 0) {
                const randomTag = availableTags[Math.floor(Math.random() * availableTags.length)];
                selectedTags.push(randomTag);
            }
        }
        
        return selectedTags;
    }
    
    /**
     * 检查演示模式
     */
    checkDemoMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const isDemo = urlParams.get('demo');
        const videoId = urlParams.get('video');
        
        if (isDemo && videoId) {
            // 延迟执行，确保数据已加载
            setTimeout(() => {
                const video = this.videoData.find(v => v.id === videoId);
                if (video) {
                    // 自动登录演示用户
                    this.loginDemoUser();
                    
                    // 播放指定视频
                    setTimeout(() => {
                        this.playVideo(videoId);
                    }, 500);
                }
            }, 1000);
        }
    }
    
    /**
     * 登录演示用户
     */
    loginDemoUser() {
        const demoUser = {
            id: 'demo_user_001',
            username: '演示用户',
            inviteCode: 'DEMO2024',
            level: 3,
            levelName: '进步者',
            points: 350,
            joinDate: new Date().toISOString(),
            avatar: 'https://via.placeholder.com/60x60/667eea/ffffff?text=演示'
        };
        
        this.currentUser = demoUser;
        localStorage.setItem('aoyou_current_user', JSON.stringify(demoUser));
        
        // 更新UI
        this.updateUserUI();
        
        // 显示欢迎消息
        setTimeout(() => {
            this.showToast('欢迎体验奥友医学科普学习平台！');
        }, 1500);
    }
    
    /**
     * 获取随机讲师信息
     */
    getRandomInstructor() {
        const instructors = [
            {
                name: '张教授',
                title: '主任医师、教授',
                hospital: '北京协和医院',
                avatar: 'https://via.placeholder.com/60x60/667eea/ffffff?text=张'
            },
            {
                name: '李主任',
                title: '副主任医师',
                hospital: '上海华山医院',
                avatar: 'https://via.placeholder.com/60x60/764ba2/ffffff?text=李'
            },
            {
                name: '王医生',
                title: '主治医师',
                hospital: '广州中山医院',
                avatar: 'https://via.placeholder.com/60x60/f093fb/ffffff?text=王'
            },
            {
                name: '陈教授',
                title: '主任医师、博导',
                hospital: '四川华西医院',
                avatar: 'https://via.placeholder.com/60x60/4facfe/ffffff?text=陈'
            },
            {
                name: '刘主任',
                title: '副主任医师',
                hospital: '西安交大一附院',
                avatar: 'https://via.placeholder.com/60x60/43e97b/ffffff?text=刘'
            },
            {
                name: '赵医生',
                title: '主治医师',
                hospital: '南京鼓楼医院',
                avatar: 'https://via.placeholder.com/60x60/38f9d7/ffffff?text=赵'
            },
            {
                name: '孙教授',
                title: '主任医师、教授',
                hospital: '天津医科大学总医院',
                avatar: 'https://via.placeholder.com/60x60/feca57/ffffff?text=孙'
            },
            {
                name: '周主任',
                title: '副主任医师',
                hospital: '重庆医科大学附属医院',
                avatar: 'https://via.placeholder.com/60x60/ff9ff3/ffffff?text=周'
            }
        ];
        
        return instructors[Math.floor(Math.random() * instructors.length)];
    }
}

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouMedicalApp;
}