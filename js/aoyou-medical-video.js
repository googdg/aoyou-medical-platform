/**
 * Aoyou Digital 医学科普学习平台 - 视频播放和互动模块
 * 负责视频播放控制、点赞、收藏、分享等功能
 */

class AoyouVideoManager {
    constructor() {
        this.currentVideo = null;
        this.player = null;
        this.watchStartTime = null;
        this.totalWatchTime = 0;
        this.isWatching = false;
        
        this.init();
    }
    
    /**
     * 初始化视频模块
     */
    init() {
        this.initEventListeners();
        this.initVideoPlayer();
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 视频互动按钮
        document.getElementById('like-btn')?.addEventListener('click', () => {
            this.toggleLike();
        });
        
        document.getElementById('favorite-btn')?.addEventListener('click', () => {
            this.toggleFavorite();
        });
        
        document.getElementById('share-btn')?.addEventListener('click', () => {
            this.shareVideo();
        });
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // 监听页面卸载
        window.addEventListener('beforeunload', () => {
            this.handlePageUnload();
        });
    }
    
    /**
     * 初始化视频播放器
     */
    initVideoPlayer() {
        const videoPlayer = document.getElementById('video-player');
        if (!videoPlayer) return;
        
        this.player = videoPlayer;
        
        // 播放器事件监听
        this.player.addEventListener('loadstart', () => {
            this.onVideoLoadStart();
        });
        
        this.player.addEventListener('loadedmetadata', () => {
            this.onVideoLoadedMetadata();
        });
        
        this.player.addEventListener('play', () => {
            this.onVideoPlay();
        });
        
        this.player.addEventListener('pause', () => {
            this.onVideoPause();
        });
        
        this.player.addEventListener('ended', () => {
            this.onVideoEnded();
        });
        
        this.player.addEventListener('timeupdate', () => {
            this.onVideoTimeUpdate();
        });
        
        this.player.addEventListener('error', (e) => {
            this.onVideoError(e);
        });
        
        // 移动端优化
        this.optimizeForMobile();
    }
    
    /**
     * 移动端优化
     */
    optimizeForMobile() {
        if (!this.player) return;
        
        // 设置播放器属性
        this.player.setAttribute('playsinline', 'true');
        this.player.setAttribute('webkit-playsinline', 'true');
        this.player.setAttribute('x5-playsinline', 'true');
        this.player.setAttribute('x5-video-player-type', 'h5');
        this.player.setAttribute('x5-video-player-fullscreen', 'true');
        
        // 添加触摸控制
        this.addTouchControls();
    }
    
    /**
     * 添加触摸控制
     */
    addTouchControls() {
        if (!this.player) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        let isSeeking = false;
        
        this.player.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.player.addEventListener('touchmove', (e) => {
            if (e.touches.length !== 1) return;
            
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;
            
            // 水平滑动调整进度
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
                if (!isSeeking) {
                    isSeeking = true;
                    e.preventDefault();
                }
                
                const rect = this.player.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, deltaX / rect.width));
                const newTime = this.player.currentTime + (progress * 10); // 10秒步进
                
                if (newTime >= 0 && newTime <= this.player.duration) {
                    this.player.currentTime = newTime;
                }
            }
        });
        
        this.player.addEventListener('touchend', () => {
            isSeeking = false;
        });
    }
    
    /**
     * 视频开始加载
     */
    onVideoLoadStart() {
        console.log('视频开始加载');
    }
    
    /**
     * 视频元数据加载完成
     */
    onVideoLoadedMetadata() {
        console.log('视频元数据加载完成');
        
        // 更新视频时长显示
        if (this.currentVideo && this.player.duration) {
            this.currentVideo.duration = Math.floor(this.player.duration);
        }
    }
    
    /**
     * 视频开始播放
     */
    onVideoPlay() {
        this.isWatching = true;
        this.watchStartTime = Date.now();
        
        console.log('视频开始播放');
        
        // 记录播放开始事件
        this.recordVideoEvent('play_start');
    }
    
    /**
     * 视频暂停
     */
    onVideoPause() {
        this.isWatching = false;
        this.updateWatchTime();
        
        console.log('视频暂停');
        
        // 记录暂停事件
        this.recordVideoEvent('pause');
    }
    
    /**
     * 视频播放结束
     */
    onVideoEnded() {
        this.isWatching = false;
        this.updateWatchTime();
        
        console.log('视频播放结束');
        
        // 记录完成观看事件
        this.recordVideoEvent('complete');
        
        // 给予完成观看积分
        if (window.AoyouPointsSystem && this.currentVideo) {
            window.AoyouPointsSystem.earnPoints('VIDEO_WATCH', this.currentVideo.id);
        }
        
        this.showToast('视频观看完成，获得积分奖励！');
    }
    
    /**
     * 视频时间更新
     */
    onVideoTimeUpdate() {
        if (!this.isWatching || !this.currentVideo) return;
        
        const currentTime = this.player.currentTime;
        const duration = this.player.duration;
        
        // 每10秒更新一次观看进度
        if (Math.floor(currentTime) % 10 === 0) {
            this.recordWatchProgress(currentTime, duration);
            
            // 更新观看历史中的进度
            if (window.AoyouMedicalApp && duration > 0) {
                const progress = currentTime / duration;
                window.AoyouMedicalApp.updateWatchProgress(this.currentVideo.id, progress);
            }
        }
    }
    
    /**
     * 视频播放错误
     */
    onVideoError(error) {
        console.error('视频播放错误:', error);
        this.showToast('视频播放失败，请检查网络连接');
    }
    
    /**
     * 更新观看时长
     */
    updateWatchTime() {
        if (this.watchStartTime) {
            const sessionTime = Date.now() - this.watchStartTime;
            this.totalWatchTime += sessionTime;
            this.watchStartTime = null;
        }
    }
    
    /**
     * 记录视频事件
     */
    recordVideoEvent(eventType) {
        if (!this.currentVideo) return;
        
        const event = {
            id: 'event_' + Date.now(),
            videoId: this.currentVideo.id,
            userId: this.getCurrentUserId(),
            eventType: eventType,
            timestamp: new Date().toISOString(),
            currentTime: this.player?.currentTime || 0,
            duration: this.player?.duration || 0
        };
        
        // 保存到本地存储
        const events = JSON.parse(localStorage.getItem('aoyou_video_events') || '[]');
        events.unshift(event);
        
        // 只保留最近1000条记录
        if (events.length > 1000) {
            events.splice(1000);
        }
        
        localStorage.setItem('aoyou_video_events', JSON.stringify(events));
    }
    
    /**
     * 记录观看进度
     */
    recordWatchProgress(currentTime, duration) {
        if (!this.currentVideo) return;
        
        const progress = {
            videoId: this.currentVideo.id,
            userId: this.getCurrentUserId(),
            currentTime: currentTime,
            duration: duration,
            progress: duration > 0 ? currentTime / duration : 0,
            timestamp: new Date().toISOString()
        };
        
        // 保存观看进度
        const progressData = JSON.parse(localStorage.getItem('aoyou_watch_progress') || '{}');
        progressData[this.currentVideo.id] = progress;
        localStorage.setItem('aoyou_watch_progress', JSON.stringify(progressData));
    }
    
    /**
     * 切换点赞状态
     */
    async toggleLike() {
        if (!this.currentVideo) return;
        
        const userId = this.getCurrentUserId();
        if (!userId) {
            this.showToast('请先登录后再进行互动操作');
            // 跳转到登录页面
            if (window.AoyouMedicalApp) {
                window.AoyouMedicalApp.navigateTo('auth');
            }
            return;
        }
        
        if (!this.checkUserPermission('like_video')) return;
        
        const likeBtn = document.getElementById('like-btn');
        if (!likeBtn) return;
        
        // 防止重复点击
        if (likeBtn.classList.contains('loading')) return;
        
        likeBtn.classList.add('loading');
        
        const likes = JSON.parse(localStorage.getItem('aoyou_likes') || '[]');
        const existingLike = likes.find(like => 
            like.videoId === this.currentVideo.id && like.userId === userId
        );
        
        const likeCount = document.getElementById('like-count');
        
        try {
            if (existingLike) {
                // 取消点赞
                const index = likes.indexOf(existingLike);
                likes.splice(index, 1);
                
                this.currentVideo.likeCount = Math.max(0, (this.currentVideo.likeCount || 0) - 1);
                likeBtn.classList.remove('active');
                
                this.showActionSuccess(likeBtn, '已取消点赞');
            } else {
                // 添加点赞
                const newLike = {
                    id: 'like_' + Date.now(),
                    videoId: this.currentVideo.id,
                    userId: userId,
                    timestamp: new Date().toISOString()
                };
                
                likes.unshift(newLike);
                this.currentVideo.likeCount = (this.currentVideo.likeCount || 0) + 1;
                likeBtn.classList.add('active');
                
                // 播放点赞动画
                likeBtn.classList.add('like-animation');
                setTimeout(() => {
                    likeBtn.classList.remove('like-animation');
                }, 600);
                
                // 给予点赞积分
                if (window.AoyouPointsSystem) {
                    window.AoyouPointsSystem.earnPoints('VIDEO_LIKE', this.currentVideo.id);
                }
                
                this.showActionSuccess(likeBtn, '点赞成功，+2积分');
            }
            
            // 更新显示
            if (likeCount) {
                likeCount.textContent = this.currentVideo.likeCount || 0;
            }
            
            // 保存数据
            localStorage.setItem('aoyou_likes', JSON.stringify(likes));
            this.updateVideoInList();
            
        } catch (error) {
            console.error('点赞操作失败:', error);
            this.showToast('操作失败，请重试');
        } finally {
            likeBtn.classList.remove('loading');
        }
    }
    
    /**
     * 切换收藏状态
     */
    async toggleFavorite() {
        if (!this.currentVideo) return;
        
        const userId = this.getCurrentUserId();
        if (!userId) {
            this.showToast('请先登录后再进行互动操作');
            // 跳转到登录页面
            if (window.AoyouMedicalApp) {
                window.AoyouMedicalApp.navigateTo('auth');
            }
            return;
        }
        
        if (!this.checkUserPermission('favorite_video')) return;
        
        const favoriteBtn = document.getElementById('favorite-btn');
        if (!favoriteBtn) return;
        
        // 防止重复点击
        if (favoriteBtn.classList.contains('loading')) return;
        
        favoriteBtn.classList.add('loading');
        
        const favorites = JSON.parse(localStorage.getItem('aoyou_favorites') || '[]');
        const existingFavorite = favorites.find(fav => 
            fav.videoId === this.currentVideo.id && fav.userId === userId
        );
        
        const favoriteCount = document.getElementById('favorite-count');
        
        try {
            if (existingFavorite) {
                // 取消收藏
                const index = favorites.indexOf(existingFavorite);
                favorites.splice(index, 1);
                
                this.currentVideo.favoriteCount = Math.max(0, (this.currentVideo.favoriteCount || 0) - 1);
                favoriteBtn.classList.remove('active');
                
                this.showActionSuccess(favoriteBtn, '已取消收藏');
            } else {
                // 添加收藏
                const newFavorite = {
                    id: 'favorite_' + Date.now(),
                    videoId: this.currentVideo.id,
                    userId: userId,
                    videoTitle: this.currentVideo.title,
                    videoThumbnail: this.currentVideo.thumbnail,
                    timestamp: new Date().toISOString()
                };
                
                favorites.unshift(newFavorite);
                this.currentVideo.favoriteCount = (this.currentVideo.favoriteCount || 0) + 1;
                favoriteBtn.classList.add('active');
                
                // 播放收藏动画
                favoriteBtn.classList.add('favorite-animation');
                setTimeout(() => {
                    favoriteBtn.classList.remove('favorite-animation');
                }, 800);
                
                // 给予收藏积分
                if (window.AoyouPointsSystem) {
                    window.AoyouPointsSystem.earnPoints('VIDEO_FAVORITE', this.currentVideo.id);
                }
                
                this.showActionSuccess(favoriteBtn, '收藏成功，+3积分');
            }
            
            // 更新显示
            if (favoriteCount) {
                favoriteCount.textContent = this.currentVideo.favoriteCount || 0;
            }
            
            // 保存数据
            localStorage.setItem('aoyou_favorites', JSON.stringify(favorites));
            this.updateVideoInList();
            
        } catch (error) {
            console.error('收藏操作失败:', error);
            this.showToast('操作失败，请重试');
        } finally {
            favoriteBtn.classList.remove('loading');
        }
    }
    
    /**
     * 分享视频
     */
    async shareVideo() {
        if (!this.currentVideo) return;
        
        const userId = this.getCurrentUserId();
        if (!userId) {
            this.showToast('请先登录后再进行互动操作');
            // 跳转到登录页面
            if (window.AoyouMedicalApp) {
                window.AoyouMedicalApp.navigateTo('auth');
            }
            return;
        }
        
        if (!this.checkUserPermission('share_video')) return;
        
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.classList.add('share-animation');
            setTimeout(() => {
                shareBtn.classList.remove('share-animation');
            }, 500);
        }
        
        // 显示分享面板
        this.showSharePanel();
    }
    
    /**
     * 显示分享面板
     */
    showSharePanel() {
        // 创建分享面板
        const sharePanel = this.createSharePanel();
        document.body.appendChild(sharePanel);
        
        // 显示面板
        setTimeout(() => {
            sharePanel.querySelector('.share-overlay').classList.add('show');
            sharePanel.querySelector('.share-panel').classList.add('show');
        }, 10);
    }
    
    /**
     * 创建分享面板
     */
    createSharePanel() {
        const container = document.createElement('div');
        container.className = 'share-container';
        
        container.innerHTML = `
            <div class="share-overlay"></div>
            <div class="share-panel">
                <div class="share-panel-header">
                    <h3 class="share-panel-title">分享视频</h3>
                    <button class="share-panel-close">×</button>
                </div>
                <div class="share-options">
                    ${this.isWeChatBrowser() ? `
                        <div class="share-option share-option-wechat" data-type="wechat">
                            <div class="share-option-icon">💬</div>
                            <span class="share-option-text">微信好友</span>
                        </div>
                        <div class="share-option share-option-timeline" data-type="timeline">
                            <div class="share-option-icon">📱</div>
                            <span class="share-option-text">朋友圈</span>
                        </div>
                    ` : ''}
                    <div class="share-option share-option-copy" data-type="copy">
                        <div class="share-option-icon">📋</div>
                        <span class="share-option-text">复制链接</span>
                    </div>
                </div>
            </div>
        `;
        
        // 绑定事件
        const overlay = container.querySelector('.share-overlay');
        const panel = container.querySelector('.share-panel');
        const closeBtn = container.querySelector('.share-panel-close');
        const options = container.querySelectorAll('.share-option');
        
        // 关闭面板
        const closePanel = () => {
            overlay.classList.remove('show');
            panel.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(container);
            }, 300);
        };
        
        overlay.addEventListener('click', closePanel);
        closeBtn.addEventListener('click', closePanel);
        
        // 分享选项点击
        options.forEach(option => {
            option.addEventListener('click', async (e) => {
                const type = e.currentTarget.dataset.type;
                await this.handleShareOption(type);
                closePanel();
            });
        });
        
        return container;
    }
    
    /**
     * 处理分享选项
     */
    async handleShareOption(type) {
        try {
            switch (type) {
                case 'wechat':
                case 'timeline':
                    await this.shareToWeChat();
                    break;
                case 'copy':
                    await this.copyToClipboard(window.location.href);
                    this.showToast('链接已复制到剪贴板');
                    break;
                default:
                    await this.shareWithWebAPI();
            }
            
            // 记录分享行为
            this.recordShareAction(type);
            
            // 给予分享积分
            if (window.AoyouPointsSystem) {
                window.AoyouPointsSystem.earnPoints('VIDEO_SHARE', this.currentVideo.id);
            }
            
            if (type !== 'copy') {
                this.showToast('分享成功，获得积分奖励！');
            }
            
        } catch (error) {
            console.error('分享失败:', error);
            this.showToast('分享失败，请重试');
        }
    }
    
    /**
     * 微信分享
     */
    async shareToWeChat() {
        if (!window.AoyouWeChatSDK) {
            throw new Error('微信SDK未加载');
        }
        
        const shareData = {
            title: this.currentVideo.title,
            desc: this.currentVideo.description,
            link: window.location.href,
            imgUrl: this.currentVideo.thumbnail
        };
        
        return window.AoyouWeChatSDK.share(shareData);
    }
    
    /**
     * Web Share API分享
     */
    async shareWithWebAPI() {
        if (navigator.share) {
            const shareData = {
                title: this.currentVideo.title,
                text: this.currentVideo.description,
                url: window.location.href
            };
            
            await navigator.share(shareData);
        } else {
            // 降级到复制链接
            await this.copyToClipboard(window.location.href);
            this.showToast('链接已复制到剪贴板');
        }
    }
    
    /**
     * 复制到剪贴板
     */
    async copyToClipboard(text) {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        } else {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
    
    /**
     * 记录分享行为
     */
    recordShareAction(type = 'web') {
        const shares = JSON.parse(localStorage.getItem('aoyou_shares') || '[]');
        
        const shareRecord = {
            id: 'share_' + Date.now(),
            videoId: this.currentVideo.id,
            userId: this.getCurrentUserId(),
            timestamp: new Date().toISOString(),
            platform: type,
            shareType: type
        };
        
        shares.unshift(shareRecord);
        
        // 只保留最近500条记录
        if (shares.length > 500) {
            shares.splice(500);
        }
        
        localStorage.setItem('aoyou_shares', JSON.stringify(shares));
        
        // 更新视频分享计数
        this.currentVideo.shareCount = (this.currentVideo.shareCount || 0) + 1;
        this.updateVideoInList();
    }
    
    /**
     * 显示操作成功提示
     */
    showActionSuccess(button, message) {
        // 创建提示元素
        const tip = document.createElement('div');
        tip.className = 'action-success-tip';
        tip.textContent = message;
        
        // 添加到按钮容器
        button.style.position = 'relative';
        button.appendChild(tip);
        
        // 自动移除
        setTimeout(() => {
            if (tip.parentNode) {
                tip.parentNode.removeChild(tip);
            }
        }, 2000);
    }
    
    /**
     * 设置当前视频
     */
    setCurrentVideo(video) {
        this.currentVideo = video;
        
        // 重置观看状态
        this.totalWatchTime = 0;
        this.watchStartTime = null;
        this.isWatching = false;
        
        // 设置视频源
        if (this.player && video.videoUrl) {
            this.player.src = video.videoUrl;
            this.player.load(); // 重新加载视频
        }
        
        // 更新视频详情信息
        this.updateVideoDetails();
        
        // 加载观看进度
        this.loadWatchProgress();
        
        // 加载相关推荐
        this.loadRelatedVideos();
    }
    
    /**
     * 更新视频详情信息
     */
    updateVideoDetails() {
        if (!this.currentVideo) return;
        
        // 更新基本信息
        const categoryEl = document.getElementById('video-category');
        const difficultyEl = document.getElementById('video-difficulty');
        const ratingEl = document.getElementById('video-rating');
        const durationEl = document.getElementById('video-duration');
        const viewsEl = document.getElementById('video-views');
        const uploadDateEl = document.getElementById('video-upload-date');
        const descEl = document.getElementById('video-desc');
        
        if (categoryEl) categoryEl.textContent = this.currentVideo.category || '医学科普';
        if (difficultyEl) {
            difficultyEl.textContent = this.getDifficultyText(this.currentVideo.difficulty);
            difficultyEl.className = `difficulty-badge difficulty-${this.currentVideo.difficulty || 'beginner'}`;
        }
        if (ratingEl) ratingEl.textContent = `⭐ ${this.currentVideo.rating || '0.0'}`;
        if (durationEl) durationEl.textContent = `📺 ${this.formatTime(this.currentVideo.duration || 0)}`;
        if (viewsEl) viewsEl.textContent = `👁️ ${this.formatNumber(this.currentVideo.views || 0)}`;
        if (uploadDateEl) uploadDateEl.textContent = `📅 ${this.formatDate(this.currentVideo.uploadDate)}`;
        if (descEl) descEl.textContent = this.currentVideo.description || '暂无描述';
        
        // 更新讲师信息
        this.updateInstructorInfo();
        
        // 更新标签
        this.updateVideoTags();
        
        // 更新互动状态
        this.updateInteractionStatus();
    }
    
    /**
     * 更新讲师信息
     */
    updateInstructorInfo() {
        if (!this.currentVideo?.instructor) return;
        
        const instructor = this.currentVideo.instructor;
        const avatarEl = document.getElementById('instructor-avatar');
        const nameEl = document.getElementById('instructor-name');
        const titleEl = document.getElementById('instructor-title');
        const hospitalEl = document.getElementById('instructor-hospital');
        
        if (avatarEl) avatarEl.src = instructor.avatar || './images/default-avatar.png';
        if (nameEl) nameEl.textContent = instructor.name || '未知讲师';
        if (titleEl) titleEl.textContent = instructor.title || '医师';
        if (hospitalEl) hospitalEl.textContent = instructor.hospital || '医疗机构';
    }
    
    /**
     * 更新视频标签
     */
    updateVideoTags() {
        const tagsContainer = document.getElementById('video-tags');
        if (!tagsContainer || !this.currentVideo?.tags) return;
        
        tagsContainer.innerHTML = '';
        
        this.currentVideo.tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'video-tag';
            tagEl.textContent = tag;
            tagsContainer.appendChild(tagEl);
        });
    }
    
    /**
     * 更新互动状态
     */
    updateInteractionStatus() {
        if (!this.currentVideo) return;
        
        const userId = this.getCurrentUserId();
        if (!userId) return;
        
        // 更新点赞状态
        const likes = JSON.parse(localStorage.getItem('aoyou_likes') || '[]');
        const isLiked = likes.some(like => 
            like.videoId === this.currentVideo.id && like.userId === userId
        );
        
        const likeBtn = document.getElementById('like-btn');
        const likeCount = document.getElementById('like-count');
        
        if (likeBtn) {
            likeBtn.classList.toggle('active', isLiked);
        }
        if (likeCount) {
            likeCount.textContent = this.currentVideo.likeCount || 0;
        }
        
        // 更新收藏状态
        const favorites = JSON.parse(localStorage.getItem('aoyou_favorites') || '[]');
        const isFavorited = favorites.some(fav => 
            fav.videoId === this.currentVideo.id && fav.userId === userId
        );
        
        const favoriteBtn = document.getElementById('favorite-btn');
        const favoriteCount = document.getElementById('favorite-count');
        
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active', isFavorited);
        }
        if (favoriteCount) {
            favoriteCount.textContent = this.currentVideo.favoriteCount || 0;
        }
    }
    
    /**
     * 加载相关推荐视频
     */
    loadRelatedVideos() {
        if (!this.currentVideo) return;
        
        const relatedContainer = document.getElementById('related-list');
        if (!relatedContainer) return;
        
        // 获取相关视频（同分类或相似标签）
        const relatedVideos = this.getRelatedVideos();
        
        relatedContainer.innerHTML = '';
        
        relatedVideos.forEach(video => {
            const videoEl = this.createRelatedVideoElement(video);
            relatedContainer.appendChild(videoEl);
        });
    }
    
    /**
     * 获取相关推荐视频
     */
    getRelatedVideos() {
        if (!window.AoyouMedicalApp?.videoData) return [];
        
        const allVideos = window.AoyouMedicalApp.videoData;
        const currentVideo = this.currentVideo;
        
        // 过滤掉当前视频
        const otherVideos = allVideos.filter(v => v.id !== currentVideo.id);
        
        // 按相关性排序
        const scoredVideos = otherVideos.map(video => {
            let score = 0;
            
            // 同分类加分
            if (video.category === currentVideo.category) {
                score += 10;
            }
            
            // 相同标签加分
            if (video.tags && currentVideo.tags) {
                const commonTags = video.tags.filter(tag => 
                    currentVideo.tags.includes(tag)
                );
                score += commonTags.length * 5;
            }
            
            // 相似难度加分
            if (video.difficulty === currentVideo.difficulty) {
                score += 3;
            }
            
            // 高评分视频加分
            if (video.rating >= 4.0) {
                score += 2;
            }
            
            return { video, score };
        });
        
        // 按分数排序并取前6个
        return scoredVideos
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
            .map(item => item.video);
    }
    
    /**
     * 创建相关视频元素
     */
    createRelatedVideoElement(video) {
        const videoEl = document.createElement('div');
        videoEl.className = 'related-video-item';
        videoEl.onclick = () => this.playRelatedVideo(video);
        
        videoEl.innerHTML = `
            <div class="related-video-thumbnail">
                <img src="${video.thumbnail || './images/default-video.jpg'}" alt="${video.title}">
                <span class="related-video-duration">${this.formatTime(video.duration || 0)}</span>
            </div>
            <div class="related-video-info">
                <h5 class="related-video-title">${video.title}</h5>
                <div class="related-video-meta">
                    <span class="related-video-category">${video.category}</span>
                    <span>👁️ ${this.formatNumber(video.views || 0)}</span>
                    <span>⭐ ${video.rating || '0.0'}</span>
                </div>
            </div>
        `;
        
        return videoEl;
    }
    
    /**
     * 播放相关视频
     */
    playRelatedVideo(video) {
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.playVideo(video);
        }
    }
    
    /**
     * 获取难度文本
     */
    getDifficultyText(difficulty) {
        const difficultyMap = {
            'beginner': '入门',
            'intermediate': '进阶',
            'advanced': '高级',
            'expert': '专家'
        };
        return difficultyMap[difficulty] || '入门';
    }
    
    /**
     * 格式化数字
     */
    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
    
    /**
     * 格式化日期
     */
    formatDate(dateString) {
        if (!dateString) return '今天';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return '今天';
        if (diffDays === 1) return '昨天';
        if (diffDays < 7) return `${diffDays}天前`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
        
        return date.toLocaleDateString('zh-CN');
    }
    
    /**
     * 加载观看进度
     */
    loadWatchProgress() {
        if (!this.currentVideo || !this.player) return;
        
        const progressData = JSON.parse(localStorage.getItem('aoyou_watch_progress') || '{}');
        const progress = progressData[this.currentVideo.id];
        
        if (progress && progress.currentTime > 10) {
            // 如果有观看进度且超过10秒，询问是否继续观看
            const continueWatch = confirm(
                `检测到您之前观看到 ${this.formatTime(progress.currentTime)}，是否继续观看？`
            );
            
            if (continueWatch) {
                this.player.currentTime = progress.currentTime;
            }
        }
    }
    
    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时暂停视频
            if (this.player && !this.player.paused) {
                this.player.pause();
            }
        }
    }
    
    /**
     * 处理页面卸载
     */
    handlePageUnload() {
        // 保存观看时长
        this.updateWatchTime();
        
        // 记录退出事件
        if (this.currentVideo) {
            this.recordVideoEvent('exit');
        }
    }
    
    /**
     * 更新视频列表中的数据
     */
    updateVideoInList() {
        if (window.AoyouMedicalApp && this.currentVideo) {
            const videoIndex = window.AoyouMedicalApp.videoData.findIndex(
                v => v.id === this.currentVideo.id
            );
            
            if (videoIndex >= 0) {
                window.AoyouMedicalApp.videoData[videoIndex] = { ...this.currentVideo };
            }
        }
    }
    
    /**
     * 检查用户权限
     */
    checkUserPermission(permission) {
        if (window.AoyouMedicalAuth) {
            return window.AoyouMedicalAuth.hasPermission(permission);
        }
        return false;
    }
    
    /**
     * 获取当前用户ID
     */
    getCurrentUserId() {
        if (window.AoyouMedicalAuth) {
            const user = window.AoyouMedicalAuth.getCurrentUser();
            return user?.id;
        }
        return null;
    }
    
    /**
     * 检查是否在微信浏览器
     */
    isWeChatBrowser() {
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('micromessenger');
    }
    
    /**
     * 格式化时间
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * 显示提示消息
     */
    showToast(message) {
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.showToast(message);
        } else {
            console.log(message);
        }
    }
    
    /**
     * 获取视频统计信息
     */
    getVideoStats(videoId) {
        const events = JSON.parse(localStorage.getItem('aoyou_video_events') || '[]');
        const videoEvents = events.filter(event => event.videoId === videoId);
        
        const stats = {
            totalViews: videoEvents.filter(e => e.eventType === 'play_start').length,
            totalCompletions: videoEvents.filter(e => e.eventType === 'complete').length,
            averageWatchTime: 0,
            completionRate: 0
        };
        
        if (stats.totalViews > 0) {
            stats.completionRate = (stats.totalCompletions / stats.totalViews) * 100;
        }
        
        return stats;
    }
    
    /**
     * 清理过期数据
     */
    cleanupOldData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // 清理过期的视频事件
        const events = JSON.parse(localStorage.getItem('aoyou_video_events') || '[]');
        const filteredEvents = events.filter(event => 
            new Date(event.timestamp) > thirtyDaysAgo
        );
        localStorage.setItem('aoyou_video_events', JSON.stringify(filteredEvents));
        
        // 清理过期的分享记录
        const shares = JSON.parse(localStorage.getItem('aoyou_shares') || '[]');
        const filteredShares = shares.filter(share => 
            new Date(share.timestamp) > thirtyDaysAgo
        );
        localStorage.setItem('aoyou_shares', JSON.stringify(filteredShares));
    }
}

// 页面加载完成后初始化视频模块
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouMedicalVideo = new AoyouMedicalVideo();
    
    // 监听微信分享成功事件
    document.addEventListener('wechatShareSuccess', (e) => {
        if (window.AoyouMedicalVideo?.currentVideo) {
            console.log('微信分享成功:', e.detail.type);
            
            // 记录分享成功
            window.AoyouMedicalVideo.recordShareAction();
            
            // 给予分享积分
            if (window.AoyouPointsSystem) {
                window.AoyouPointsSystem.earnPoints('VIDEO_SHARE', window.AoyouMedicalVideo.currentVideo.id);
            }
            
            window.AoyouMedicalVideo.showToast('分享成功，获得积分奖励！');
        }
    });
    
    // 定期清理过期数据
    setInterval(() => {
        window.AoyouMedicalVideo.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // 每24小时清理一次
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouMedicalVideo;
}