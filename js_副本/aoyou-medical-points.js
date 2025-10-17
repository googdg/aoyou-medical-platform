/**
 * Aoyou Digital 医学科普学习平台 - 积分系统模块
 * 负责积分获取、等级计算和防刷机制
 */

class AoyouPointsManager {
    constructor() {
        // 积分规则配置
        this.pointsRules = {
            VIDEO_WATCH: 10,      // 观看完整视频
            VIDEO_LIKE: 2,        // 点赞视频
            VIDEO_FAVORITE: 3,    // 收藏视频
            VIDEO_SHARE: 5,       // 分享视频
            REGISTRATION: 100     // 注册奖励
        };
        
        // 每日积分上限
        this.dailyLimits = {
            VIDEO_WATCH: 100,     // 每日最多100个视频积分
            VIDEO_LIKE: 20,       // 每日最多20个点赞积分
            VIDEO_FAVORITE: 15,   // 每日最多15个收藏积分
            VIDEO_SHARE: 10       // 每日最多10个分享积分
        };
        
        // 等级系统配置
        this.levelSystem = [
            { level: 1, name: '初学者', minPoints: 0, maxPoints: 99 },
            { level: 2, name: '学习者', minPoints: 100, maxPoints: 299 },
            { level: 3, name: '进步者', minPoints: 300, maxPoints: 599 },
            { level: 4, name: '实践者', minPoints: 600, maxPoints: 999 },
            { level: 5, name: '专业者', minPoints: 1000, maxPoints: 1999 },
            { level: 6, name: '专家', minPoints: 2000, maxPoints: 3999 },
            { level: 7, name: '大师', minPoints: 4000, maxPoints: 7999 },
            { level: 8, name: '导师', minPoints: 8000, maxPoints: Infinity }
        ];
        
        this.init();
    }
    
    /**
     * 初始化积分系统
     */
    init() {
        // 清理过期的每日限制数据
        this.cleanupDailyLimits();
    }
    
    /**
     * 获得积分
     */
    async earnPoints(action, resourceId = null) {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.log('用户未登录，无法获得积分');
            return false;
        }
        
        // 检查用户是否被封禁
        if (this.isUserBanned(userId)) {
            const remainingTime = this.getBanRemainingTime(userId);
            const minutes = Math.ceil(remainingTime / (60 * 1000));
            this.showToast(`积分功能暂时限制，还需等待 ${minutes} 分钟`);
            return false;
        }
        
        // 检查积分规则
        if (!this.pointsRules[action]) {
            console.error('未知的积分行为:', action);
            return false;
        }
        
        // 检查每日限制
        if (!this.checkDailyLimit(userId, action)) {
            console.log('已达到每日积分上限:', action);
            this.showToast('今日该类型积分已达上限');
            return false;
        }
        
        // 检查防刷机制
        if (!this.checkAntiSpam(userId, action, resourceId)) {
            console.log('触发防刷机制:', action, resourceId);
            return false;
        }
        
        const points = this.pointsRules[action];
        
        // 记录积分获取
        const pointRecord = {
            id: 'points_' + Date.now(),
            userId: userId,
            action: action,
            resourceId: resourceId,
            points: points,
            timestamp: new Date().toISOString(),
            date: new Date().toDateString()
        };
        
        // 保存积分记录
        this.savePointRecord(pointRecord);
        
        // 更新用户总积分
        this.updateUserPoints(userId, points);
        
        // 检查等级升级
        this.checkLevelUp(userId);
        
        // 更新每日限制计数
        this.updateDailyLimit(userId, action, points);
        
        console.log(`获得积分: ${points} (${action})`);
        
        // 触发积分获得事件
        this.triggerPointsEarnedEvent(pointRecord);
        
        return true;
    }
    
    /**
     * 检查每日限制
     */
    checkDailyLimit(userId, action) {
        if (!this.dailyLimits[action]) return true;
        
        const today = new Date().toDateString();
        const dailyData = this.getDailyLimitData(userId, today);
        
        return (dailyData[action] || 0) < this.dailyLimits[action];
    }
    
    /**
     * 检查防刷机制
     */
    checkAntiSpam(userId, action, resourceId) {
        // 检查重复行为
        if (resourceId && this.isRepeatedAction(userId, action, resourceId)) {
            console.log('防刷机制：重复行为', action, resourceId);
            return false;
        }
        
        // 检查行为频率
        if (this.isHighFrequencyAction(userId, action)) {
            console.log('防刷机制：高频行为', action);
            return false;
        }
        
        // 检查异常模式
        if (this.detectAbnormalPattern(userId, action)) {
            console.log('防刷机制：异常模式', action);
            return false;
        }
        
        // 检查设备指纹
        if (this.checkDeviceFingerprint(userId, action)) {
            console.log('防刷机制：设备异常', action);
            return false;
        }
        
        return true;
    }
    
    /**
     * 检查是否为重复行为
     */
    isRepeatedAction(userId, action, resourceId) {
        const records = this.getPointRecords(userId);
        const today = new Date().toDateString();
        
        // 检查今天是否已经对同一资源执行过相同行为
        return records.some(record => 
            record.date === today &&
            record.action === action &&
            record.resourceId === resourceId
        );
    }
    
    /**
     * 检查是否为高频行为
     */
    isHighFrequencyAction(userId, action) {
        const records = this.getPointRecords(userId);
        const now = Date.now();
        const fiveMinutesAgo = now - (5 * 60 * 1000);
        
        // 检查5分钟内同类型行为次数
        const recentActions = records.filter(record => 
            record.action === action &&
            new Date(record.timestamp).getTime() > fiveMinutesAgo
        );
        
        // 根据行为类型设置不同的频率限制
        const frequencyLimits = {
            VIDEO_WATCH: 3,   // 5分钟内最多3次
            VIDEO_LIKE: 10,   // 5分钟内最多10次
            VIDEO_FAVORITE: 5, // 5分钟内最多5次
            VIDEO_SHARE: 3    // 5分钟内最多3次
        };
        
        const limit = frequencyLimits[action] || 5;
        return recentActions.length >= limit;
    }
    
    /**
     * 保存积分记录
     */
    savePointRecord(record) {
        const records = JSON.parse(localStorage.getItem('aoyou_point_records') || '[]');
        records.unshift(record);
        
        // 只保留最近1000条记录
        if (records.length > 1000) {
            records.splice(1000);
        }
        
        localStorage.setItem('aoyou_point_records', JSON.stringify(records));
    }
    
    /**
     * 获取积分记录
     */
    getPointRecords(userId) {
        const records = JSON.parse(localStorage.getItem('aoyou_point_records') || '[]');
        return records.filter(record => record.userId === userId);
    }
    
    /**
     * 更新用户积分
     */
    updateUserPoints(userId, points) {
        const userPoints = this.getUserPoints(userId);
        const newTotal = userPoints.total + points;
        
        const updatedPoints = {
            ...userPoints,
            total: newTotal,
            lastUpdated: new Date().toISOString()
        };
        
        this.saveUserPoints(userId, updatedPoints);
    }
    
    /**
     * 获取用户积分
     */
    getUserPoints(userId) {
        const allPoints = JSON.parse(localStorage.getItem('aoyou_user_points') || '{}');
        return allPoints[userId] || {
            total: 0,
            level: 1,
            levelName: '初学者',
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
    }
    
    /**
     * 保存用户积分
     */
    saveUserPoints(userId, points) {
        const allPoints = JSON.parse(localStorage.getItem('aoyou_user_points') || '{}');
        allPoints[userId] = points;
        localStorage.setItem('aoyou_user_points', JSON.stringify(allPoints));
    }
    
    /**
     * 检查等级升级
     */
    checkLevelUp(userId) {
        const userPoints = this.getUserPoints(userId);
        const currentLevel = this.calculateLevel(userPoints.total);
        
        if (currentLevel.level > userPoints.level) {
            // 等级升级
            userPoints.level = currentLevel.level;
            userPoints.levelName = currentLevel.name;
            this.saveUserPoints(userId, userPoints);
            
            // 触发升级事件
            this.triggerLevelUpEvent(userId, currentLevel);
            
            console.log(`等级升级: ${currentLevel.name} (${currentLevel.level}级)`);
        }
    }
    
    /**
     * 计算等级
     */
    calculateLevel(totalPoints) {
        for (let i = this.levelSystem.length - 1; i >= 0; i--) {
            const level = this.levelSystem[i];
            if (totalPoints >= level.minPoints) {
                return level;
            }
        }
        return this.levelSystem[0];
    }
    
    /**
     * 获取等级进度
     */
    getLevelProgress(totalPoints) {
        const currentLevel = this.calculateLevel(totalPoints);
        const nextLevel = this.levelSystem.find(level => level.level === currentLevel.level + 1);
        
        if (!nextLevel) {
            // 已达到最高等级
            return {
                current: currentLevel,
                next: null,
                progress: 100,
                pointsToNext: 0
            };
        }
        
        const pointsInCurrentLevel = totalPoints - currentLevel.minPoints;
        const pointsNeededForNext = nextLevel.minPoints - currentLevel.minPoints;
        const progress = Math.floor((pointsInCurrentLevel / pointsNeededForNext) * 100);
        
        return {
            current: currentLevel,
            next: nextLevel,
            progress: Math.min(progress, 100),
            pointsToNext: nextLevel.minPoints - totalPoints
        };
    }
    
    /**
     * 获取每日限制数据
     */
    getDailyLimitData(userId, date) {
        const dailyLimits = JSON.parse(localStorage.getItem('aoyou_daily_limits') || '{}');
        const userLimits = dailyLimits[userId] || {};
        return userLimits[date] || {};
    }
    
    /**
     * 更新每日限制
     */
    updateDailyLimit(userId, action, points) {
        const today = new Date().toDateString();
        const dailyLimits = JSON.parse(localStorage.getItem('aoyou_daily_limits') || '{}');
        
        if (!dailyLimits[userId]) {
            dailyLimits[userId] = {};
        }
        
        if (!dailyLimits[userId][today]) {
            dailyLimits[userId][today] = {};
        }
        
        dailyLimits[userId][today][action] = (dailyLimits[userId][today][action] || 0) + points;
        
        localStorage.setItem('aoyou_daily_limits', JSON.stringify(dailyLimits));
    }
    
    /**
     * 清理过期的每日限制数据
     */
    cleanupDailyLimits() {
        const dailyLimits = JSON.parse(localStorage.getItem('aoyou_daily_limits') || '{}');
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        Object.keys(dailyLimits).forEach(userId => {
            const userLimits = dailyLimits[userId];
            Object.keys(userLimits).forEach(date => {
                if (new Date(date) < sevenDaysAgo) {
                    delete userLimits[date];
                }
            });
        });
        
        localStorage.setItem('aoyou_daily_limits', JSON.stringify(dailyLimits));
    }
    
    /**
     * 触发积分获得事件
     */
    triggerPointsEarnedEvent(pointRecord) {
        const event = new CustomEvent('pointsEarned', {
            detail: pointRecord
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 触发等级升级事件
     */
    triggerLevelUpEvent(userId, newLevel) {
        const event = new CustomEvent('levelUp', {
            detail: { userId, level: newLevel }
        });
        document.dispatchEvent(event);
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
     * 获取积分统计
     */
    getPointsStats(userId) {
        const records = this.getPointRecords(userId);
        const userPoints = this.getUserPoints(userId);
        
        const stats = {
            total: userPoints.total,
            level: userPoints.level,
            levelName: userPoints.levelName,
            todayPoints: 0,
            weekPoints: 0,
            monthPoints: 0,
            actionStats: {}
        };
        
        const now = new Date();
        const today = now.toDateString();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        records.forEach(record => {
            const recordDate = new Date(record.timestamp);
            
            // 今日积分
            if (record.date === today) {
                stats.todayPoints += record.points;
            }
            
            // 本周积分
            if (recordDate >= weekAgo) {
                stats.weekPoints += record.points;
            }
            
            // 本月积分
            if (recordDate >= monthAgo) {
                stats.monthPoints += record.points;
            }
            
            // 行为统计
            if (!stats.actionStats[record.action]) {
                stats.actionStats[record.action] = {
                    count: 0,
                    points: 0
                };
            }
            stats.actionStats[record.action].count++;
            stats.actionStats[record.action].points += record.points;
        });
        
        return stats;
    }
    async earnPoints(action, relatedId = null, customPoints = null) {
        const user = this.getCurrentUser();
        if (!user) {
            console.warn('用户未登录，无法获得积分');
            return false;
        }
        
        // 检查积分规则
        const points = customPoints || this.pointsRules[action];
        if (!points || points <= 0) {
            console.warn('无效的积分规则:', action);
            return false;
        }
        
        // 检查每日限制
        if (!this.checkDailyLimit(user.id, action, points)) {
            this.showToast('今日该类型积分已达上限');
            return false;
        }
        
        // 检查重复行为（防刷机制）
        if (!this.checkDuplicateAction(user.id, action, relatedId)) {
            console.warn('重复行为，不给予积分');
            return false;
        }
        
        try {
            // 记录积分获取
            const pointsRecord = {
                id: 'points_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                userId: user.id,
                action: action,
                points: points,
                relatedId: relatedId,
                description: this.getActionDescription(action),
                timestamp: new Date().toISOString(),
                date: new Date().toDateString()
            };
            
            // 保存积分记录
            this.savePointsRecord(pointsRecord);
            
            // 更新用户积分
            const newTotalPoints = (user.points || 0) + points;
            const oldLevel = user.level || 1;
            const newLevel = this.calculateLevel(newTotalPoints);
            
            // 更新用户数据
            const updatedUser = {
                ...user,
                points: newTotalPoints,
                level: newLevel
            };
            
            this.updateUserData(updatedUser);
            
            // 检查是否升级
            if (newLevel > oldLevel) {
                this.handleLevelUp(oldLevel, newLevel);
            }
            
            // 更新每日限制记录
            this.updateDailyLimit(user.id, action, points);
            
            console.log(`用户 ${user.name} 获得 ${points} 积分 (${action})`);
            return true;
            
        } catch (error) {
            console.error('积分获取失败:', error);
            return false;
        }
    }
    
    /**
     * 检查每日限制
     */
    checkDailyLimit(userId, action, points) {
        const today = new Date().toDateString();
        const dailyData = this.getDailyLimitData(userId, today);
        
        const currentPoints = dailyData[action] || 0;
        const limit = this.dailyLimits[action];
        
        if (!limit) return true; // 没有限制的行为
        
        return (currentPoints + points) <= limit;
    }
    
    /**
     * 检查重复行为
     */
    checkDuplicateAction(userId, action, relatedId) {
        if (!relatedId) return true; // 没有关联ID的行为不检查重复
        
        // 对于视频相关行为，检查是否已经对同一视频执行过相同操作
        if (action.startsWith('VIDEO_')) {
            const recentRecords = this.getRecentPointsRecords(userId, 24); // 24小时内
            const duplicateRecord = recentRecords.find(record => 
                record.action === action && record.relatedId === relatedId
            );
            
            return !duplicateRecord;
        }
        
        return true;
    }
    
    /**
     * 获取每日限制数据
     */
    getDailyLimitData(userId, date) {
        const dailyLimits = JSON.parse(localStorage.getItem('aoyou_daily_limits') || '{}');
        const userKey = `${userId}_${date}`;
        return dailyLimits[userKey] || {};
    }
    
    /**
     * 更新每日限制数据
     */
    updateDailyLimit(userId, action, points) {
        const today = new Date().toDateString();
        const dailyLimits = JSON.parse(localStorage.getItem('aoyou_daily_limits') || '{}');
        const userKey = `${userId}_${today}`;
        
        if (!dailyLimits[userKey]) {
            dailyLimits[userKey] = {};
        }
        
        dailyLimits[userKey][action] = (dailyLimits[userKey][action] || 0) + points;
        
        localStorage.setItem('aoyou_daily_limits', JSON.stringify(dailyLimits));
    }
    
    /**
     * 清理过期的每日限制数据
     */
    cleanupDailyLimits() {
        const dailyLimits = JSON.parse(localStorage.getItem('aoyou_daily_limits') || '{}');
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        const cleanedLimits = {};
        
        Object.keys(dailyLimits).forEach(key => {
            const [userId, dateStr] = key.split('_');
            const date = new Date(dateStr);
            
            if (date >= threeDaysAgo) {
                cleanedLimits[key] = dailyLimits[key];
            }
        });
        
        localStorage.setItem('aoyou_daily_limits', JSON.stringify(cleanedLimits));
    }
    
    /**
     * 保存积分记录
     */
    savePointsRecord(record) {
        const records = JSON.parse(localStorage.getItem('aoyou_points_history') || '[]');
        records.unshift(record);
        
        // 只保留最近1000条记录
        if (records.length > 1000) {
            records.splice(1000);
        }
        
        localStorage.setItem('aoyou_points_history', JSON.stringify(records));
    }
    
    /**
     * 获取最近的积分记录
     */
    getRecentPointsRecords(userId, hours = 24) {
        const records = JSON.parse(localStorage.getItem('aoyou_points_history') || '[]');
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - hours);
        
        return records.filter(record => 
            record.userId === userId && 
            new Date(record.timestamp) >= cutoffTime
        );
    }
    
    /**
     * 计算用户等级
     */
    calculateLevel(points) {
        for (let i = this.levelSystem.length - 1; i >= 0; i--) {
            const level = this.levelSystem[i];
            if (points >= level.minPoints) {
                return level.level;
            }
        }
        return 1; // 默认等级
    }
    
    /**
     * 获取等级信息
     */
    getLevelInfo(level) {
        return this.levelSystem.find(l => l.level === level) || this.levelSystem[0];
    }
    
    /**
     * 获取下一等级信息
     */
    getNextLevelInfo(currentLevel) {
        return this.levelSystem.find(l => l.level === currentLevel + 1);
    }
    
    /**
     * 处理等级升级
     */
    handleLevelUp(oldLevel, newLevel) {
        const newLevelInfo = this.getLevelInfo(newLevel);
        
        // 显示升级通知
        this.showLevelUpNotification(oldLevel, newLevel, newLevelInfo.name);
        
        // 记录升级事件
        this.recordLevelUpEvent(oldLevel, newLevel);
        
        // 可以在这里添加升级奖励逻辑
        console.log(`用户升级: ${oldLevel} -> ${newLevel} (${newLevelInfo.name})`);
    }
    
    /**
     * 显示升级通知
     */
    showLevelUpNotification(oldLevel, newLevel, levelName) {
        // 创建升级通知元素
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎉</div>
                <h3>恭喜升级！</h3>
                <p>您已升级到 <strong>Lv.${newLevel} ${levelName}</strong></p>
            </div>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2E86AB, #5BA3C7);
            color: white;
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: levelUpAnimation 0.5s ease-out;
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes levelUpAnimation {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            .level-up-notification .level-up-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            .level-up-notification h3 {
                margin: 0 0 8px 0;
                font-size: 24px;
            }
            .level-up-notification p {
                margin: 0;
                font-size: 16px;
            }
        `;
        document.head.appendChild(style);
        
        // 显示通知
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
    }
    
    /**
     * 记录升级事件
     */
    recordLevelUpEvent(oldLevel, newLevel) {
        const user = this.getCurrentUser();
        if (!user) return;
        
        const event = {
            id: 'levelup_' + Date.now(),
            userId: user.id,
            eventType: 'level_up',
            oldLevel: oldLevel,
            newLevel: newLevel,
            timestamp: new Date().toISOString()
        };
        
        const events = JSON.parse(localStorage.getItem('aoyou_level_events') || '[]');
        events.unshift(event);
        
        // 只保留最近100条升级记录
        if (events.length > 100) {
            events.splice(100);
        }
        
        localStorage.setItem('aoyou_level_events', JSON.stringify(events));
    }
    
    /**
     * 获取行为描述
     */
    getActionDescription(action) {
        const descriptions = {
            VIDEO_WATCH: '观看视频',
            VIDEO_LIKE: '点赞视频',
            VIDEO_FAVORITE: '收藏视频',
            VIDEO_SHARE: '分享视频',
            REGISTRATION: '注册奖励'
        };
        
        return descriptions[action] || action;
    }
    
    /**
     * 获取用户积分统计
     */
    getUserPointsStats(userId) {
        const records = JSON.parse(localStorage.getItem('aoyou_points_history') || '[]');
        const userRecords = records.filter(record => record.userId === userId);
        
        const stats = {
            totalPoints: 0,
            todayPoints: 0,
            weekPoints: 0,
            monthPoints: 0,
            actionStats: {}
        };
        
        const today = new Date().toDateString();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        
        userRecords.forEach(record => {
            const recordDate = new Date(record.timestamp);
            
            stats.totalPoints += record.points;
            
            if (record.date === today) {
                stats.todayPoints += record.points;
            }
            
            if (recordDate >= weekAgo) {
                stats.weekPoints += record.points;
            }
            
            if (recordDate >= monthAgo) {
                stats.monthPoints += record.points;
            }
            
            // 按行为类型统计
            if (!stats.actionStats[record.action]) {
                stats.actionStats[record.action] = {
                    count: 0,
                    points: 0
                };
            }
            stats.actionStats[record.action].count++;
            stats.actionStats[record.action].points += record.points;
        });
        
        return stats;
    }
    
    /**
     * 获取积分排行榜
     */
    getLeaderboard(limit = 10) {
        const users = this.getAllUsers();
        
        return users
            .filter(user => user.points > 0)
            .sort((a, b) => b.points - a.points)
            .slice(0, limit)
            .map((user, index) => ({
                rank: index + 1,
                name: user.name,
                points: user.points,
                level: user.level,
                levelName: this.getLevelInfo(user.level).name
            }));
    }
    
    /**
     * 获取用户在排行榜中的排名
     */
    getUserRank(userId) {
        const users = this.getAllUsers();
        const sortedUsers = users
            .filter(user => user.points > 0)
            .sort((a, b) => b.points - a.points);
        
        const userIndex = sortedUsers.findIndex(user => user.id === userId);
        return userIndex >= 0 ? userIndex + 1 : null;
    }
    
    /**
     * 检查积分系统健康状态
     */
    checkSystemHealth() {
        const issues = [];
        
        // 检查数据完整性
        try {
            JSON.parse(localStorage.getItem('aoyou_points_history') || '[]');
        } catch (error) {
            issues.push('积分历史数据损坏');
        }
        
        try {
            JSON.parse(localStorage.getItem('aoyou_daily_limits') || '{}');
        } catch (error) {
            issues.push('每日限制数据损坏');
        }
        
        // 检查存储空间
        const storageUsed = this.calculateStorageUsage();
        if (storageUsed > 5 * 1024 * 1024) { // 5MB
            issues.push('存储空间使用过多');
        }
        
        return {
            healthy: issues.length === 0,
            issues: issues,
            storageUsed: storageUsed
        };
    }
    
    /**
     * 计算存储使用量
     */
    calculateStorageUsage() {
        let total = 0;
        const keys = [
            'aoyou_points_history',
            'aoyou_daily_limits',
            'aoyou_level_events'
        ];
        
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                total += data.length;
            }
        });
        
        return total;
    }
    
    /**
     * 清理积分系统数据
     */
    cleanupPointsData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // 清理过期的积分记录
        const records = JSON.parse(localStorage.getItem('aoyou_points_history') || '[]');
        const filteredRecords = records.filter(record => 
            new Date(record.timestamp) > thirtyDaysAgo
        );
        localStorage.setItem('aoyou_points_history', JSON.stringify(filteredRecords));
        
        // 清理过期的等级事件
        const levelEvents = JSON.parse(localStorage.getItem('aoyou_level_events') || '[]');
        const filteredLevelEvents = levelEvents.filter(event => 
            new Date(event.timestamp) > thirtyDaysAgo
        );
        localStorage.setItem('aoyou_level_events', JSON.stringify(filteredLevelEvents));
        
        // 清理每日限制数据
        this.cleanupDailyLimits();
        
        console.log('积分系统数据清理完成');
    }
    
    /**
     * 获取当前用户
     */
    getCurrentUser() {
        if (window.AoyouMedicalAuth) {
            return window.AoyouMedicalAuth.getCurrentUser();
        }
        
        try {
            const userData = localStorage.getItem('aoyou_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('获取当前用户失败:', error);
            return null;
        }
    }
    
    /**
     * 获取所有用户
     */
    getAllUsers() {
        try {
            return JSON.parse(localStorage.getItem('aoyou_users') || '[]');
        } catch (error) {
            console.error('获取用户列表失败:', error);
            return [];
        }
    }
    
    /**
     * 更新用户数据
     */
    updateUserData(user) {
        if (window.AoyouMedicalAuth) {
            window.AoyouMedicalAuth.updateUserInfo(user);
        } else {
            // 直接更新本地存储
            localStorage.setItem('aoyou_user', JSON.stringify(user));
            
            const users = this.getAllUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex >= 0) {
                users[userIndex] = user;
                localStorage.setItem('aoyou_users', JSON.stringify(users));
            }
        }
        
        // 更新UI
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.currentUser = user;
            window.AoyouMedicalApp.updateUserUI();
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
}

// 页面加载完成后初始化积分系统
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouPointsSystem = new AoyouPointsSystem();
    
    // 定期清理过期数据
    setInterval(() => {
        window.AoyouPointsSystem.cleanupPointsData();
    }, 24 * 60 * 60 * 1000); // 每24小时清理一次
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouPointsManager;
}


// 页面加载完成后初始化积分系统
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouPointsSystem = new AoyouPointsSystem();
    
    // 监听积分获得事件
    document.addEventListener('pointsEarned', (e) => {
        const { points, action } = e.detail;
        console.log(`积分获得: +${points} (${action})`);
        
        // 更新UI显示
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.updatePointsDisplay();
        }
    });
    
    // 监听等级升级事件
    document.addEventListener('levelUp', (e) => {
        const { level } = e.detail;
        console.log(`等级升级: ${level.name} (${level.level}级)`);
        
        // 显示升级提示
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.showLevelUpNotification(level);
        }
    });
    
    // 定期清理过期数据
    setInterval(() => {
        window.AoyouPointsSystem.cleanupExpiredData();
    }, 60 * 60 * 1000); // 每小时清理一次
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouPointsSystem;
}    /
**
     * 检测异常行为模式
     */
    detectAbnormalPattern(userId, action) {
        const records = this.getPointRecords(userId);
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        // 获取最近一小时的行为记录
        const recentRecords = records.filter(record => 
            new Date(record.timestamp).getTime() > oneHourAgo
        );
        
        // 检查行为模式异常
        if (this.isRobotLikePattern(recentRecords)) {
            this.recordSuspiciousActivity(userId, 'robot_like_pattern', action);
            return true;
        }
        
        // 检查积分获取速度异常
        if (this.isExcessivePointsGaining(recentRecords)) {
            this.recordSuspiciousActivity(userId, 'excessive_points', action);
            return true;
        }
        
        return false;
    }
    
    /**
     * 检查是否为机器人行为模式
     */
    isRobotLikePattern(records) {
        if (records.length < 10) return false;
        
        // 检查时间间隔是否过于规律
        const intervals = [];
        for (let i = 1; i < records.length; i++) {
            const interval = new Date(records[i-1].timestamp).getTime() - new Date(records[i].timestamp).getTime();
            intervals.push(interval);
        }
        
        // 如果时间间隔的标准差很小，可能是机器人行为
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        
        // 如果标准差小于平均值的10%，认为是异常规律
        return stdDev < avgInterval * 0.1 && avgInterval < 10000; // 10秒内的规律行为
    }
    
    /**
     * 检查是否过度获取积分
     */
    isExcessivePointsGaining(records) {
        const totalPoints = records.reduce((sum, record) => sum + record.points, 0);
        
        // 一小时内获得超过200积分认为异常
        return totalPoints > 200;
    }
    
    /**
     * 检查设备指纹
     */
    checkDeviceFingerprint(userId, action) {
        const fingerprint = this.generateDeviceFingerprint();
        const storedFingerprints = this.getUserDeviceFingerprints(userId);
        
        // 如果是新设备且行为频繁，标记为可疑
        if (!storedFingerprints.includes(fingerprint)) {
            const recentActions = this.getRecentActions(userId, 10 * 60 * 1000); // 10分钟
            if (recentActions.length > 20) {
                this.recordSuspiciousActivity(userId, 'new_device_high_activity', action);
                return true;
            }
            
            // 记录新设备指纹
            this.addUserDeviceFingerprint(userId, fingerprint);
        }
        
        return false;
    }
    
    /**
     * 生成设备指纹
     */
    generateDeviceFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        // 简单哈希
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        return hash.toString();
    }
    
    /**
     * 获取用户设备指纹
     */
    getUserDeviceFingerprints(userId) {
        const fingerprints = JSON.parse(localStorage.getItem('aoyou_device_fingerprints') || '{}');
        return fingerprints[userId] || [];
    }
    
    /**
     * 添加用户设备指纹
     */
    addUserDeviceFingerprint(userId, fingerprint) {
        const fingerprints = JSON.parse(localStorage.getItem('aoyou_device_fingerprints') || '{}');
        if (!fingerprints[userId]) {
            fingerprints[userId] = [];
        }
        
        if (!fingerprints[userId].includes(fingerprint)) {
            fingerprints[userId].push(fingerprint);
            
            // 只保留最近5个设备指纹
            if (fingerprints[userId].length > 5) {
                fingerprints[userId] = fingerprints[userId].slice(-5);
            }
            
            localStorage.setItem('aoyou_device_fingerprints', JSON.stringify(fingerprints));
        }
    }
    
    /**
     * 获取最近的行为记录
     */
    getRecentActions(userId, timeWindow) {
        const records = this.getPointRecords(userId);
        const now = Date.now();
        const cutoff = now - timeWindow;
        
        return records.filter(record => 
            new Date(record.timestamp).getTime() > cutoff
        );
    }
    
    /**
     * 记录可疑活动
     */
    recordSuspiciousActivity(userId, type, action) {
        const suspiciousActivities = JSON.parse(localStorage.getItem('aoyou_suspicious_activities') || '[]');
        
        const activity = {
            id: 'suspicious_' + Date.now(),
            userId: userId,
            type: type,
            action: action,
            timestamp: new Date().toISOString(),
            deviceFingerprint: this.generateDeviceFingerprint()
        };
        
        suspiciousActivities.unshift(activity);
        
        // 只保留最近1000条记录
        if (suspiciousActivities.length > 1000) {
            suspiciousActivities.splice(1000);
        }
        
        localStorage.setItem('aoyou_suspicious_activities', JSON.stringify(suspiciousActivities));
        
        // 检查是否需要临时封禁
        this.checkTemporaryBan(userId);
    }
    
    /**
     * 检查是否需要临时封禁
     */
    checkTemporaryBan(userId) {
        const suspiciousActivities = JSON.parse(localStorage.getItem('aoyou_suspicious_activities') || '[]');
        const userActivities = suspiciousActivities.filter(activity => activity.userId === userId);
        
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        // 统计最近一小时的可疑活动
        const recentSuspicious = userActivities.filter(activity => 
            new Date(activity.timestamp).getTime() > oneHourAgo
        );
        
        // 如果一小时内有5次以上可疑活动，临时封禁1小时
        if (recentSuspicious.length >= 5) {
            this.setTemporaryBan(userId, 60 * 60 * 1000); // 1小时
        }
    }
    
    /**
     * 设置临时封禁
     */
    setTemporaryBan(userId, duration) {
        const bans = JSON.parse(localStorage.getItem('aoyou_temporary_bans') || '{}');
        const banUntil = Date.now() + duration;
        
        bans[userId] = {
            banUntil: banUntil,
            reason: 'suspicious_activity',
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('aoyou_temporary_bans', JSON.stringify(bans));
        
        console.log(`用户 ${userId} 被临时封禁至 ${new Date(banUntil).toLocaleString()}`);
        
        // 通知用户
        if (this.getCurrentUserId() === userId) {
            this.showToast('检测到异常行为，积分功能暂时限制1小时');
        }
    }
    
    /**
     * 检查用户是否被封禁
     */
    isUserBanned(userId) {
        const bans = JSON.parse(localStorage.getItem('aoyou_temporary_bans') || '{}');
        const ban = bans[userId];
        
        if (!ban) return false;
        
        const now = Date.now();
        if (now > ban.banUntil) {
            // 封禁已过期，清除记录
            delete bans[userId];
            localStorage.setItem('aoyou_temporary_bans', JSON.stringify(bans));
            return false;
        }
        
        return true;
    }
    
    /**
     * 获取封禁剩余时间
     */
    getBanRemainingTime(userId) {
        const bans = JSON.parse(localStorage.getItem('aoyou_temporary_bans') || '{}');
        const ban = bans[userId];
        
        if (!ban) return 0;
        
        const now = Date.now();
        const remaining = ban.banUntil - now;
        
        return Math.max(0, remaining);
    }
    
    /**
     * 清理过期数据
     */
    cleanupExpiredData() {
        // 清理过期的可疑活动记录
        const suspiciousActivities = JSON.parse(localStorage.getItem('aoyou_suspicious_activities') || '[]');
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        const filteredActivities = suspiciousActivities.filter(activity => 
            new Date(activity.timestamp).getTime() > sevenDaysAgo
        );
        
        localStorage.setItem('aoyou_suspicious_activities', JSON.stringify(filteredActivities));
        
        // 清理过期的封禁记录
        const bans = JSON.parse(localStorage.getItem('aoyou_temporary_bans') || '{}');
        const now = Date.now();
        
        Object.keys(bans).forEach(userId => {
            if (now > bans[userId].banUntil) {
                delete bans[userId];
            }
        });
        
        localStorage.setItem('aoyou_temporary_bans', JSON.stringify(bans));
    }