/**
 * Aoyou Digital 医学科普学习平台 - 数据统计和分析模块
 * 负责用户行为追踪、数据统计、分析报表和关键指标监控
 */

class AoyouAnalyticsManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.events = [];
        this.metrics = new Map();
        this.reports = new Map();
        this.isTracking = true;
        
        this.init();
    }
    
    /**
     * 初始化分析模块
     */
    init() {
        this.setupUserTracking();
        this.setupEventTracking();
        this.setupPerformanceTracking();
        this.setupEngagementTracking();
        this.setupReporting();
        this.startDataCollection();
    }
    
    /**
     * 生成会话ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 设置用户追踪
     */
    setupUserTracking() {
        // 获取用户信息
        this.updateUserInfo();
        
        // 监听用户登录/登出
        document.addEventListener('userLogin', (e) => {
            this.onUserLogin(e.detail.user);
        });
        
        document.addEventListener('userLogout', () => {
            this.onUserLogout();
        });
    }
    
    /**
     * 更新用户信息
     */
    updateUserInfo() {
        if (window.AoyouMedicalAuth) {
            const user = window.AoyouMedicalAuth.getCurrentUser();
            if (user) {
                this.userId = user.id;
                this.trackEvent('user_session_start', {
                    userId: this.userId,
                    userLevel: user.level || 1,
                    sessionId: this.sessionId
                });
            }
        }
    }
    
    /**
     * 用户登录事件
     */
    onUserLogin(user) {
        this.userId = user.id;
        this.trackEvent('user_login', {
            userId: this.userId,
            loginMethod: 'invite_code',
            sessionId: this.sessionId
        });
    }
    
    /**
     * 用户登出事件
     */
    onUserLogout() {
        this.trackEvent('user_logout', {
            userId: this.userId,
            sessionDuration: this.getSessionDuration(),
            sessionId: this.sessionId
        });
        this.userId = null;
    }
    
    /**
     * 设置事件追踪
     */
    setupEventTracking() {
        // 页面浏览追踪
        this.trackPageViews();
        
        // 视频相关事件
        this.trackVideoEvents();
        
        // 用户交互事件
        this.trackUserInteractions();
        
        // 积分系统事件
        this.trackPointsEvents();
    }
    
    /**
     * 追踪页面浏览
     */
    trackPageViews() {
        // 初始页面加载
        this.trackEvent('page_view', {
            page: 'main',
            url: window.location.href,
            referrer: document.referrer,
            timestamp: Date.now()
        });
        
        // 页面切换追踪
        document.addEventListener('pageChange', (e) => {
            this.trackEvent('page_view', {
                page: e.detail.page,
                previousPage: e.detail.previousPage,
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * 追踪视频事件
     */
    trackVideoEvents() {
        // 视频播放事件
        document.addEventListener('videoplay', (e) => {
            this.trackEvent('video_play', {
                videoId: e.detail.videoId,
                videoTitle: e.detail.videoTitle,
                category: e.detail.category,
                timestamp: Date.now()
            });
        });
        
        // 视频暂停事件
        document.addEventListener('videopause', (e) => {
            this.trackEvent('video_pause', {
                videoId: e.detail.videoId,
                currentTime: e.detail.currentTime,
                duration: e.detail.duration,
                timestamp: Date.now()
            });
        });
        
        // 视频完成事件
        document.addEventListener('videocomplete', (e) => {
            this.trackEvent('video_complete', {
                videoId: e.detail.videoId,
                watchTime: e.detail.watchTime,
                completionRate: 100,
                timestamp: Date.now()
            });
        });
        
        // 视频互动事件
        document.addEventListener('videolike', (e) => {
            this.trackEvent('video_like', {
                videoId: e.detail.videoId,
                action: e.detail.action, // 'like' or 'unlike'
                timestamp: Date.now()
            });
        });
        
        document.addEventListener('videofavorite', (e) => {
            this.trackEvent('video_favorite', {
                videoId: e.detail.videoId,
                action: e.detail.action, // 'favorite' or 'unfavorite'
                timestamp: Date.now()
            });
        });
        
        document.addEventListener('videoshare', (e) => {
            this.trackEvent('video_share', {
                videoId: e.detail.videoId,
                platform: e.detail.platform,
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * 追踪用户交互
     */
    trackUserInteractions() {
        // 搜索事件
        document.addEventListener('search', (e) => {
            this.trackEvent('search', {
                query: e.detail.query,
                results: e.detail.results,
                timestamp: Date.now()
            });
        });
        
        // 分类浏览事件
        document.addEventListener('categorySelect', (e) => {
            this.trackEvent('category_select', {
                category: e.detail.category,
                timestamp: Date.now()
            });
        });
        
        // 点击事件追踪
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-track]');
            if (target) {
                this.trackEvent('element_click', {
                    element: target.dataset.track,
                    elementType: target.tagName.toLowerCase(),
                    timestamp: Date.now()
                });
            }
        });
    }
    
    /**
     * 追踪积分事件
     */
    trackPointsEvents() {
        document.addEventListener('pointsEarned', (e) => {
            this.trackEvent('points_earned', {
                action: e.detail.action,
                points: e.detail.points,
                resourceId: e.detail.resourceId,
                timestamp: Date.now()
            });
        });
        
        document.addEventListener('levelUp', (e) => {
            this.trackEvent('level_up', {
                newLevel: e.detail.level.level,
                levelName: e.detail.level.name,
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * 设置性能追踪
     */
    setupPerformanceTracking() {
        // 页面加载性能
        window.addEventListener('load', () => {
            this.trackPagePerformance();
        });
        
        // 资源加载性能
        this.trackResourcePerformance();
        
        // 用户体验指标
        this.trackUserExperienceMetrics();
    }
    
    /**
     * 追踪页面性能
     */
    trackPagePerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            this.trackEvent('page_performance', {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint(),
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * 获取首次绘制时间
     */
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }
    
    /**
     * 获取首次内容绘制时间
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }
    
    /**
     * 追踪资源性能
     */
    trackResourcePerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.duration > 1000) { // 超过1秒的资源
                        this.trackEvent('slow_resource', {
                            resource: entry.name,
                            duration: entry.duration,
                            size: entry.transferSize,
                            timestamp: Date.now()
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    }
    
    /**
     * 追踪用户体验指标
     */
    trackUserExperienceMetrics() {
        // 监控长任务
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.trackEvent('long_task', {
                        duration: entry.duration,
                        startTime: entry.startTime,
                        timestamp: Date.now()
                    });
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
        
        // 监控输入延迟
        this.trackInputDelay();
    }
    
    /**
     * 追踪输入延迟
     */
    trackInputDelay() {
        let inputStart = 0;
        
        document.addEventListener('touchstart', () => {
            inputStart = performance.now();
        });
        
        document.addEventListener('touchend', () => {
            if (inputStart) {
                const delay = performance.now() - inputStart;
                if (delay > 100) { // 超过100ms
                    this.trackEvent('input_delay', {
                        delay: delay,
                        timestamp: Date.now()
                    });
                }
            }
        });
    }
    
    /**
     * 设置参与度追踪
     */
    setupEngagementTracking() {
        // 会话时长追踪
        this.startSessionTracking();
        
        // 页面停留时间追踪
        this.trackPageDwellTime();
        
        // 滚动深度追踪
        this.trackScrollDepth();
        
        // 活跃度追踪
        this.trackUserActivity();
    }
    
    /**
     * 开始会话追踪
     */
    startSessionTracking() {
        this.sessionStartTime = Date.now();
        
        // 页面卸载时记录会话结束
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end', {
                sessionId: this.sessionId,
                duration: this.getSessionDuration(),
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * 获取会话时长
     */
    getSessionDuration() {
        return Date.now() - this.sessionStartTime;
    }
    
    /**
     * 追踪页面停留时间
     */
    trackPageDwellTime() {
        let pageStartTime = Date.now();
        
        document.addEventListener('pageChange', (e) => {
            const dwellTime = Date.now() - pageStartTime;
            
            this.trackEvent('page_dwell_time', {
                page: e.detail.previousPage,
                dwellTime: dwellTime,
                timestamp: Date.now()
            });
            
            pageStartTime = Date.now();
        });
    }
    
    /**
     * 追踪滚动深度
     */
    trackScrollDepth() {
        let maxScrollDepth = 0;
        const thresholds = [25, 50, 75, 100];
        const tracked = new Set();
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
                
                thresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !tracked.has(threshold)) {
                        tracked.add(threshold);
                        this.trackEvent('scroll_depth', {
                            depth: threshold,
                            timestamp: Date.now()
                        });
                    }
                });
            }
        });
    }
    
    /**
     * 追踪用户活跃度
     */
    trackUserActivity() {
        let lastActivity = Date.now();
        let isActive = true;
        
        const updateActivity = () => {
            lastActivity = Date.now();
            if (!isActive) {
                isActive = true;
                this.trackEvent('user_active', {
                    timestamp: Date.now()
                });
            }
        };
        
        // 监听用户交互事件
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
        
        // 检查用户是否不活跃
        setInterval(() => {
            if (Date.now() - lastActivity > 30000 && isActive) { // 30秒无活动
                isActive = false;
                this.trackEvent('user_inactive', {
                    inactiveTime: Date.now() - lastActivity,
                    timestamp: Date.now()
                });
            }
        }, 10000);
    }
    
    /**
     * 设置报表生成
     */
    setupReporting() {
        // 定期生成报表
        setInterval(() => {
            this.generateReports();
        }, 60000); // 每分钟生成一次
        
        // 页面卸载时生成最终报表
        window.addEventListener('beforeunload', () => {
            this.generateFinalReport();
        });
    }
    
    /**
     * 开始数据收集
     */
    startDataCollection() {
        // 定期保存事件数据
        setInterval(() => {
            this.saveEventData();
        }, 30000); // 每30秒保存一次
        
        // 定期清理旧数据
        setInterval(() => {
            this.cleanupOldData();
        }, 24 * 60 * 60 * 1000); // 每24小时清理一次
    }
    
    /**
     * 追踪事件
     */
    trackEvent(eventName, data = {}) {
        if (!this.isTracking) return;
        
        const event = {
            id: this.generateEventId(),
            name: eventName,
            data: {
                ...data,
                userId: this.userId,
                sessionId: this.sessionId,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: Date.now()
            }
        };
        
        this.events.push(event);
        
        // 实时处理某些关键事件
        this.processRealTimeEvent(event);
        
        console.log('Analytics Event:', event);
    }
    
    /**
     * 生成事件ID
     */
    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 实时处理事件
     */
    processRealTimeEvent(event) {
        // 更新实时指标
        this.updateRealTimeMetrics(event);
        
        // 检查异常情况
        this.checkAnomalies(event);
    }
    
    /**
     * 更新实时指标
     */
    updateRealTimeMetrics(event) {
        const eventName = event.name;
        
        // 更新事件计数
        const currentCount = this.metrics.get(eventName) || 0;
        this.metrics.set(eventName, currentCount + 1);
        
        // 更新特定指标
        switch (eventName) {
            case 'video_play':
                this.updateVideoMetrics(event);
                break;
            case 'points_earned':
                this.updatePointsMetrics(event);
                break;
            case 'user_login':
                this.updateUserMetrics(event);
                break;
        }
    }
    
    /**
     * 更新视频指标
     */
    updateVideoMetrics(event) {
        const videoId = event.data.videoId;
        const videoMetrics = this.metrics.get('video_' + videoId) || {
            plays: 0,
            likes: 0,
            favorites: 0,
            shares: 0,
            completions: 0
        };
        
        videoMetrics.plays++;
        this.metrics.set('video_' + videoId, videoMetrics);
    }
    
    /**
     * 更新积分指标
     */
    updatePointsMetrics(event) {
        const pointsMetrics = this.metrics.get('points_total') || {
            totalEarned: 0,
            byAction: {}
        };
        
        pointsMetrics.totalEarned += event.data.points;
        
        const action = event.data.action;
        pointsMetrics.byAction[action] = (pointsMetrics.byAction[action] || 0) + event.data.points;
        
        this.metrics.set('points_total', pointsMetrics);
    }
    
    /**
     * 更新用户指标
     */
    updateUserMetrics(event) {
        const userMetrics = this.metrics.get('user_activity') || {
            totalLogins: 0,
            uniqueUsers: new Set(),
            activeUsers: new Set()
        };
        
        userMetrics.totalLogins++;
        userMetrics.uniqueUsers.add(event.data.userId);
        userMetrics.activeUsers.add(event.data.userId);
        
        this.metrics.set('user_activity', userMetrics);
    }
    
    /**
     * 检查异常情况
     */
    checkAnomalies(event) {
        // 检查错误率
        if (event.name === 'error' || event.name === 'slow_resource') {
            const errorCount = this.metrics.get('error_count') || 0;
            this.metrics.set('error_count', errorCount + 1);
            
            if (errorCount > 10) { // 错误过多
                this.reportAnomaly('high_error_rate', { errorCount });
            }
        }
        
        // 检查性能问题
        if (event.name === 'long_task' && event.data.duration > 5000) {
            this.reportAnomaly('performance_issue', {
                taskDuration: event.data.duration
            });
        }
    }
    
    /**
     * 报告异常
     */
    reportAnomaly(type, data) {
        console.warn('Analytics Anomaly:', type, data);
        
        // 这里可以发送异常报告到监控系统
        this.trackEvent('anomaly_detected', {
            anomalyType: type,
            anomalyData: data
        });
    }
    
    /**
     * 生成报表
     */
    generateReports() {
        const now = Date.now();
        
        // 生成用户活跃度报表
        this.generateUserActivityReport();
        
        // 生成内容消费报表
        this.generateContentConsumptionReport();
        
        // 生成性能报表
        this.generatePerformanceReport();
        
        // 生成积分系统报表
        this.generatePointsReport();
    }
    
    /**
     * 生成用户活跃度报表
     */
    generateUserActivityReport() {
        const userEvents = this.events.filter(e => 
            ['user_login', 'user_active', 'user_inactive', 'session_end'].includes(e.name)
        );
        
        const report = {
            type: 'user_activity',
            timestamp: Date.now(),
            data: {
                totalSessions: userEvents.filter(e => e.name === 'user_login').length,
                averageSessionDuration: this.calculateAverageSessionDuration(userEvents),
                activeUsers: this.getActiveUsersCount(),
                userEngagement: this.calculateUserEngagement()
            }
        };
        
        this.reports.set('user_activity', report);
    }
    
    /**
     * 生成内容消费报表
     */
    generateContentConsumptionReport() {
        const videoEvents = this.events.filter(e => 
            e.name.startsWith('video_')
        );
        
        const report = {
            type: 'content_consumption',
            timestamp: Date.now(),
            data: {
                totalVideoPlays: videoEvents.filter(e => e.name === 'video_play').length,
                totalVideoCompletions: videoEvents.filter(e => e.name === 'video_complete').length,
                averageWatchTime: this.calculateAverageWatchTime(videoEvents),
                popularCategories: this.getPopularCategories(videoEvents),
                topVideos: this.getTopVideos(videoEvents)
            }
        };
        
        this.reports.set('content_consumption', report);
    }
    
    /**
     * 生成性能报表
     */
    generatePerformanceReport() {
        const performanceEvents = this.events.filter(e => 
            ['page_performance', 'slow_resource', 'long_task', 'input_delay'].includes(e.name)
        );
        
        const report = {
            type: 'performance',
            timestamp: Date.now(),
            data: {
                averageLoadTime: this.calculateAverageLoadTime(performanceEvents),
                slowResourcesCount: performanceEvents.filter(e => e.name === 'slow_resource').length,
                longTasksCount: performanceEvents.filter(e => e.name === 'long_task').length,
                inputDelayIssues: performanceEvents.filter(e => e.name === 'input_delay').length
            }
        };
        
        this.reports.set('performance', report);
    }
    
    /**
     * 生成积分系统报表
     */
    generatePointsReport() {
        const pointsEvents = this.events.filter(e => 
            ['points_earned', 'level_up'].includes(e.name)
        );
        
        const report = {
            type: 'points_system',
            timestamp: Date.now(),
            data: {
                totalPointsEarned: this.calculateTotalPointsEarned(pointsEvents),
                pointsByAction: this.getPointsByAction(pointsEvents),
                levelUps: pointsEvents.filter(e => e.name === 'level_up').length,
                topEarners: this.getTopPointsEarners(pointsEvents)
            }
        };
        
        this.reports.set('points_system', report);
    }
    
    /**
     * 计算平均会话时长
     */
    calculateAverageSessionDuration(events) {
        const sessionEnds = events.filter(e => e.name === 'session_end');
        if (sessionEnds.length === 0) return 0;
        
        const totalDuration = sessionEnds.reduce((sum, event) => 
            sum + (event.data.duration || 0), 0
        );
        
        return Math.round(totalDuration / sessionEnds.length);
    }
    
    /**
     * 获取活跃用户数
     */
    getActiveUsersCount() {
        const activeUsers = new Set();
        const recentEvents = this.events.filter(e => 
            Date.now() - e.data.timestamp < 24 * 60 * 60 * 1000 // 24小时内
        );
        
        recentEvents.forEach(event => {
            if (event.data.userId) {
                activeUsers.add(event.data.userId);
            }
        });
        
        return activeUsers.size;
    }
    
    /**
     * 计算用户参与度
     */
    calculateUserEngagement() {
        const engagementEvents = this.events.filter(e => 
            ['video_play', 'video_like', 'video_favorite', 'video_share'].includes(e.name)
        );
        
        const userEngagement = {};
        
        engagementEvents.forEach(event => {
            const userId = event.data.userId;
            if (userId) {
                userEngagement[userId] = (userEngagement[userId] || 0) + 1;
            }
        });
        
        const engagementScores = Object.values(userEngagement);
        const averageEngagement = engagementScores.length > 0 
            ? engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length 
            : 0;
        
        return Math.round(averageEngagement);
    }
    
    /**
     * 保存事件数据
     */
    async saveEventData() {
        if (this.events.length === 0) return;
        
        try {
            // 保存到IndexedDB
            if (window.AoyouStorageManager) {
                for (const event of this.events) {
                    await window.AoyouStorageManager.saveToIndexedDB('analytics_events', event);
                }
            }
            
            // 保存到localStorage作为备份
            const existingEvents = JSON.parse(localStorage.getItem('aoyou_analytics_events') || '[]');
            const allEvents = [...existingEvents, ...this.events];
            
            // 只保留最近1000个事件
            if (allEvents.length > 1000) {
                allEvents.splice(0, allEvents.length - 1000);
            }
            
            localStorage.setItem('aoyou_analytics_events', JSON.stringify(allEvents));
            
            // 清空当前事件数组
            this.events = [];
            
        } catch (error) {
            console.error('保存分析数据失败:', error);
        }
    }
    
    /**
     * 清理旧数据
     */
    cleanupOldData() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        // 清理localStorage中的旧事件
        try {
            const events = JSON.parse(localStorage.getItem('aoyou_analytics_events') || '[]');
            const filteredEvents = events.filter(event => 
                event.data.timestamp > thirtyDaysAgo
            );
            localStorage.setItem('aoyou_analytics_events', JSON.stringify(filteredEvents));
        } catch (error) {
            console.error('清理分析数据失败:', error);
        }
    }
    
    /**
     * 生成最终报表
     */
    generateFinalReport() {
        this.generateReports();
        
        const finalReport = {
            sessionId: this.sessionId,
            userId: this.userId,
            sessionDuration: this.getSessionDuration(),
            totalEvents: this.events.length,
            reports: Object.fromEntries(this.reports),
            metrics: Object.fromEntries(this.metrics),
            timestamp: Date.now()
        };
        
        // 保存最终报表
        localStorage.setItem('aoyou_analytics_final_report', JSON.stringify(finalReport));
        
        console.log('Analytics Final Report:', finalReport);
    }
    
    /**
     * 获取分析报表
     */
    getAnalyticsReport() {
        this.generateReports();
        
        return {
            reports: Object.fromEntries(this.reports),
            metrics: Object.fromEntries(this.metrics),
            recentEvents: this.events.slice(-50), // 最近50个事件
            sessionInfo: {
                sessionId: this.sessionId,
                userId: this.userId,
                duration: this.getSessionDuration()
            }
        };
    }
    
    /**
     * 导出分析数据
     */
    exportAnalyticsData() {
        const data = {
            events: JSON.parse(localStorage.getItem('aoyou_analytics_events') || '[]'),
            reports: Object.fromEntries(this.reports),
            metrics: Object.fromEntries(this.metrics),
            exportTime: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `aoyou_analytics_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * 设置追踪开关
     */
    setTracking(enabled) {
        this.isTracking = enabled;
        
        if (enabled) {
            console.log('Analytics tracking enabled');
        } else {
            console.log('Analytics tracking disabled');
        }
    }
}

// 页面加载完成后初始化分析模块
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouAnalytics = new AoyouAnalytics();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouAnalytics;
}