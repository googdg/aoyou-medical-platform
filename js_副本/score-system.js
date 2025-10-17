/**
 * 得分和生命值系统 (Score and Life System)
 * 坦克大战游戏的得分、生命值和游戏状态管理系统
 */

// 得分事件类型
const ScoreEventType = {
    ENEMY_DESTROYED: 'enemy_destroyed',
    POWERUP_COLLECTED: 'powerup_collected',
    LEVEL_COMPLETED: 'level_completed',
    BONUS_ACHIEVED: 'bonus_achieved',
    COMBO_MULTIPLIER: 'combo_multiplier',
    TIME_BONUS: 'time_bonus',
    ACCURACY_BONUS: 'accuracy_bonus',
    SURVIVAL_BONUS: 'survival_bonus'
};

// 得分配置
const ScoreConfig = {
    [ScoreEventType.ENEMY_DESTROYED]: {
        ENEMY_BASIC: 100,
        ENEMY_FAST: 200,
        ENEMY_HEAVY: 300,
        ENEMY_BOSS: 1000
    },
    [ScoreEventType.POWERUP_COLLECTED]: {
        common: 50,
        uncommon: 100,
        rare: 200,
        epic: 500,
        legendary: 1000
    },
    [ScoreEventType.LEVEL_COMPLETED]: 1000,
    [ScoreEventType.BONUS_ACHIEVED]: 500,
    [ScoreEventType.TIME_BONUS]: 10, // 每秒剩余时间
    [ScoreEventType.ACCURACY_BONUS]: 5, // 每1%精度
    [ScoreEventType.SURVIVAL_BONUS]: 100 // 每条剩余生命
};

// 生命值组件（扩展版）
class LifeSystem extends Component {
    constructor(maxLives = 3, respawnTime = 3000) {
        super();
        this.maxLives = maxLives;
        this.currentLives = maxLives;
        this.respawnTime = respawnTime;
        this.isRespawning = false;
        this.respawnTimer = 0;
        this.invulnerabilityTime = 2000; // 重生后无敌时间
        this.invulnerabilityTimer = 0;
        this.isInvulnerable = false;
        
        // 生命值历史
        this.livesHistory = [maxLives];
        this.deathCount = 0;
        this.respawnCount = 0;
    }

    update(deltaTime) {
        // 更新重生计时器
        if (this.isRespawning) {
            this.respawnTimer += deltaTime;
            if (this.respawnTimer >= this.respawnTime) {
                this.completeRespawn();
            }
        }
        
        // 更新无敌计时器
        if (this.isInvulnerable) {
            this.invulnerabilityTimer += deltaTime;
            if (this.invulnerabilityTimer >= this.invulnerabilityTime) {
                this.isInvulnerable = false;
                this.invulnerabilityTimer = 0;
            }
        }
    }

    loseLife() {
        if (this.isInvulnerable || this.currentLives <= 0) return false;
        
        this.currentLives--;
        this.deathCount++;
        this.livesHistory.push(this.currentLives);
        
        console.log(`💀 失去生命，剩余: ${this.currentLives}/${this.maxLives}`);
        
        if (this.currentLives > 0) {
            this.startRespawn();
        }
        
        return true;
    }

    gainLife(amount = 1) {
        const oldLives = this.currentLives;
        this.currentLives = Math.min(this.maxLives, this.currentLives + amount);
        
        if (this.currentLives > oldLives) {
            console.log(`❤️ 获得生命，当前: ${this.currentLives}/${this.maxLives}`);
            return true;
        }
        
        return false;
    }

    startRespawn() {
        this.isRespawning = true;
        this.respawnTimer = 0;
        console.log(`⏳ 开始重生倒计时: ${this.respawnTime / 1000}秒`);
    }

    completeRespawn() {
        this.isRespawning = false;
        this.respawnTimer = 0;
        this.isInvulnerable = true;
        this.invulnerabilityTimer = 0;
        this.respawnCount++;
        
        console.log(`✨ 重生完成，获得${this.invulnerabilityTime / 1000}秒无敌时间`);
    }

    isAlive() {
        return this.currentLives > 0 && !this.isRespawning;
    }

    isDead() {
        return this.currentLives <= 0;
    }

    getRespawnProgress() {
        if (!this.isRespawning) return 1;
        return this.respawnTimer / this.respawnTime;
    }

    getInvulnerabilityProgress() {
        if (!this.isInvulnerable) return 0;
        return 1 - (this.invulnerabilityTimer / this.invulnerabilityTime);
    }

    // 获取统计信息
    getStats() {
        return {
            currentLives: this.currentLives,
            maxLives: this.maxLives,
            deathCount: this.deathCount,
            respawnCount: this.respawnCount,
            survivalRate: this.deathCount > 0 ? (this.respawnCount / this.deathCount) : 1,
            isRespawning: this.isRespawning,
            isInvulnerable: this.isInvulnerable
        };
    }
}

// 得分组件
class ScoreComponent extends Component {
    constructor() {
        super();
        this.currentScore = 0;
        this.highScore = this.loadHighScore();
        this.sessionScore = 0; // 本次游戏得分
        this.levelScore = 0; // 当前关卡得分
        
        // 得分统计
        this.scoreHistory = [];
        this.scoreEvents = [];
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboTimeout = 3000; // 3秒连击超时
        this.maxCombo = 0;
        
        // 奖励倍数
        this.multiplier = 1.0;
        this.multiplierTimer = 0;
        this.multiplierDuration = 10000; // 10秒倍数持续时间
        
        // 精度统计
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.accuracy = 0;
    }

    update(deltaTime) {
        // 更新连击计时器
        if (this.comboCount > 0) {
            this.comboTimer += deltaTime;
            if (this.comboTimer >= this.comboTimeout) {
                this.resetCombo();
            }
        }
        
        // 更新倍数计时器
        if (this.multiplier > 1.0) {
            this.multiplierTimer += deltaTime;
            if (this.multiplierTimer >= this.multiplierDuration) {
                this.resetMultiplier();
            }
        }
        
        // 更新精度
        this.updateAccuracy();
    }

    addScore(points, eventType = null, details = null) {
        if (points <= 0) return;
        
        // 应用倍数
        const finalPoints = Math.floor(points * this.multiplier);
        
        // 更新得分
        this.currentScore += finalPoints;
        this.sessionScore += finalPoints;
        this.levelScore += finalPoints;
        
        // 记录得分事件
        const scoreEvent = {
            points: finalPoints,
            originalPoints: points,
            multiplier: this.multiplier,
            eventType: eventType,
            details: details,
            timestamp: Date.now(),
            comboCount: this.comboCount
        };
        
        this.scoreEvents.push(scoreEvent);
        this.scoreHistory.push({
            score: this.currentScore,
            timestamp: Date.now()
        });
        
        // 限制历史记录长度
        if (this.scoreEvents.length > 100) {
            this.scoreEvents.shift();
        }
        if (this.scoreHistory.length > 1000) {
            this.scoreHistory.shift();
        }
        
        // 更新最高分
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
        
        console.log(`💰 获得得分: ${finalPoints} (${points} x${this.multiplier.toFixed(1)}) 总分: ${this.currentScore}`);
        
        // 触发得分事件
        this.onScoreAdded(scoreEvent);
        
        return finalPoints;
    }

    addCombo() {
        this.comboCount++;
        this.comboTimer = 0;
        
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }
        
        // 连击奖励
        if (this.comboCount >= 3) {
            const comboBonus = this.comboCount * 10;
            this.addScore(comboBonus, ScoreEventType.COMBO_MULTIPLIER, {
                combo: this.comboCount
            });
        }
        
        // 连击倍数
        if (this.comboCount >= 5) {
            this.setMultiplier(1.5, 5000);
        } else if (this.comboCount >= 10) {
            this.setMultiplier(2.0, 8000);
        }
        
        console.log(`🔥 连击: ${this.comboCount}`);
    }

    resetCombo() {
        if (this.comboCount > 0) {
            console.log(`💔 连击结束: ${this.comboCount}`);
            this.comboCount = 0;
            this.comboTimer = 0;
        }
    }

    setMultiplier(multiplier, duration = 10000) {
        this.multiplier = Math.max(this.multiplier, multiplier);
        this.multiplierTimer = 0;
        this.multiplierDuration = duration;
        
        console.log(`⚡ 得分倍数: x${this.multiplier.toFixed(1)} (${duration / 1000}秒)`);
    }

    resetMultiplier() {
        if (this.multiplier > 1.0) {
            console.log(`⏰ 得分倍数结束`);
            this.multiplier = 1.0;
            this.multiplierTimer = 0;
        }
    }

    recordShot(hit = false) {
        this.shotsFired++;
        if (hit) {
            this.shotsHit++;
            this.addCombo();
        } else {
            this.resetCombo();
        }
    }

    updateAccuracy() {
        this.accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired) : 0;
    }

    // 关卡完成奖励
    completeLevel(timeRemaining = 0, enemiesDestroyed = 0) {
        let bonus = 0;
        
        // 基础完成奖励
        bonus += ScoreConfig[ScoreEventType.LEVEL_COMPLETED];
        
        // 时间奖励
        if (timeRemaining > 0) {
            const timeBonus = Math.floor(timeRemaining * ScoreConfig[ScoreEventType.TIME_BONUS]);
            bonus += timeBonus;
        }
        
        // 精度奖励
        if (this.accuracy > 0.5) {
            const accuracyBonus = Math.floor(this.accuracy * 100 * ScoreConfig[ScoreEventType.ACCURACY_BONUS]);
            bonus += accuracyBonus;
        }
        
        this.addScore(bonus, ScoreEventType.LEVEL_COMPLETED, {
            timeRemaining: timeRemaining,
            accuracy: this.accuracy,
            enemiesDestroyed: enemiesDestroyed
        });
        
        // 重置关卡得分
        this.levelScore = 0;
        
        return bonus;
    }

    // 游戏结束处理
    gameOver(livesRemaining = 0) {
        // 生存奖励
        if (livesRemaining > 0) {
            const survivalBonus = livesRemaining * ScoreConfig[ScoreEventType.SURVIVAL_BONUS];
            this.addScore(survivalBonus, ScoreEventType.SURVIVAL_BONUS, {
                livesRemaining: livesRemaining
            });
        }
        
        // 保存最终得分
        this.saveGameStats();
    }

    // 重置得分
    reset() {
        this.currentScore = 0;
        this.sessionScore = 0;
        this.levelScore = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.multiplier = 1.0;
        this.multiplierTimer = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.accuracy = 0;
        this.scoreEvents = [];
        
        console.log('🔄 得分系统重置');
    }

    // 获取统计信息
    getStats() {
        return {
            currentScore: this.currentScore,
            highScore: this.highScore,
            sessionScore: this.sessionScore,
            levelScore: this.levelScore,
            comboCount: this.comboCount,
            maxCombo: this.maxCombo,
            multiplier: this.multiplier,
            accuracy: this.accuracy,
            shotsFired: this.shotsFired,
            shotsHit: this.shotsHit,
            totalEvents: this.scoreEvents.length
        };
    }

    // 获取最近得分事件
    getRecentEvents(count = 5) {
        return this.scoreEvents.slice(-count).reverse();
    }

    // 保存最高分
    saveHighScore() {
        try {
            localStorage.setItem('tankBattle_highScore', this.highScore.toString());
        } catch (e) {
            console.warn('无法保存最高分:', e);
        }
    }

    // 加载最高分
    loadHighScore() {
        try {
            const saved = localStorage.getItem('tankBattle_highScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.warn('无法加载最高分:', e);
            return 0;
        }
    }

    // 保存游戏统计
    saveGameStats() {
        try {
            const stats = {
                finalScore: this.currentScore,
                sessionScore: this.sessionScore,
                maxCombo: this.maxCombo,
                accuracy: this.accuracy,
                shotsFired: this.shotsFired,
                shotsHit: this.shotsHit,
                timestamp: Date.now()
            };
            
            const gameHistory = JSON.parse(localStorage.getItem('tankBattle_gameHistory') || '[]');
            gameHistory.push(stats);
            
            // 只保留最近50场游戏
            if (gameHistory.length > 50) {
                gameHistory.shift();
            }
            
            localStorage.setItem('tankBattle_gameHistory', JSON.stringify(gameHistory));
        } catch (e) {
            console.warn('无法保存游戏统计:', e);
        }
    }

    // 得分事件回调
    onScoreAdded(scoreEvent) {
        // 触发自定义事件
        const event = new CustomEvent('scoreAdded', {
            detail: scoreEvent
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
        }
    }
}

// 游戏状态管理器
class GameStateManager {
    constructor() {
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER, LEVEL_COMPLETE
        this.previousState = null;
        this.stateHistory = ['MENU'];
        this.stateStartTime = Date.now();
        this.stateDuration = 0;
        
        // 游戏数据
        this.currentLevel = 1;
        this.maxLevel = 20;
        this.gameMode = 'SINGLE'; // SINGLE, DOUBLE, SURVIVAL
        this.difficulty = 'NORMAL'; // EASY, NORMAL, HARD, EXPERT
        
        // 关卡数据
        this.levelData = {
            enemiesTotal: 0,
            enemiesDestroyed: 0,
            timeLimit: 0,
            timeRemaining: 0,
            objectivesCompleted: 0,
            objectivesTotal: 0
        };
        
        // 游戏会话数据
        this.sessionData = {
            startTime: Date.now(),
            playTime: 0,
            levelsCompleted: 0,
            totalEnemiesDestroyed: 0,
            totalPowerUpsCollected: 0,
            totalDeaths: 0
        };
    }

    changeState(newState, data = null) {
        if (newState === this.gameState) return;
        
        this.previousState = this.gameState;
        this.gameState = newState;
        this.stateHistory.push(newState);
        
        // 限制历史记录长度
        if (this.stateHistory.length > 50) {
            this.stateHistory.shift();
        }
        
        // 记录状态持续时间
        const now = Date.now();
        this.stateDuration = now - this.stateStartTime;
        this.stateStartTime = now;
        
        console.log(`🎮 游戏状态变更: ${this.previousState} -> ${this.gameState}`);
        
        // 处理状态变更
        this.onStateChanged(newState, this.previousState, data);
    }

    onStateChanged(newState, oldState, data) {
        switch (newState) {
            case 'PLAYING':
                this.onGameStart(data);
                break;
            case 'PAUSED':
                this.onGamePause(data);
                break;
            case 'GAME_OVER':
                this.onGameOver(data);
                break;
            case 'LEVEL_COMPLETE':
                this.onLevelComplete(data);
                break;
            case 'MENU':
                this.onReturnToMenu(data);
                break;
        }
        
        // 触发状态变更事件
        const event = new CustomEvent('gameStateChanged', {
            detail: {
                newState: newState,
                oldState: oldState,
                data: data,
                manager: this
            }
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
        }
    }

    onGameStart(data) {
        if (this.previousState === 'MENU') {
            // 新游戏开始
            this.sessionData.startTime = Date.now();
            this.sessionData.playTime = 0;
            this.sessionData.levelsCompleted = 0;
            this.sessionData.totalEnemiesDestroyed = 0;
            this.sessionData.totalPowerUpsCollected = 0;
            this.sessionData.totalDeaths = 0;
        }
        
        console.log('🎯 游戏开始');
    }

    onGamePause(data) {
        console.log('⏸️ 游戏暂停');
    }

    onGameOver(data) {
        // 更新会话数据
        this.sessionData.playTime = Date.now() - this.sessionData.startTime;
        
        console.log('💀 游戏结束');
        console.log('📊 会话统计:', this.sessionData);
    }

    onLevelComplete(data) {
        this.sessionData.levelsCompleted++;
        this.currentLevel++;
        
        console.log(`🎉 关卡完成: ${this.currentLevel - 1}`);
        
        if (this.currentLevel > this.maxLevel) {
            // 游戏通关
            this.changeState('GAME_OVER', { victory: true });
        }
    }

    onReturnToMenu(data) {
        console.log('🏠 返回主菜单');
    }

    // 更新关卡数据
    updateLevelData(data) {
        Object.assign(this.levelData, data);
    }

    // 检查关卡完成条件
    checkLevelComplete() {
        const { enemiesTotal, enemiesDestroyed, objectivesTotal, objectivesCompleted } = this.levelData;
        
        // 检查敌人是否全部消灭
        const enemiesComplete = enemiesTotal > 0 && enemiesDestroyed >= enemiesTotal;
        
        // 检查目标是否全部完成
        const objectivesComplete = objectivesTotal > 0 && objectivesCompleted >= objectivesTotal;
        
        return enemiesComplete || objectivesComplete;
    }

    // 检查游戏失败条件
    checkGameOver(playerLives = 0) {
        // 玩家生命值耗尽
        if (playerLives <= 0) {
            return true;
        }
        
        // 时间限制
        if (this.levelData.timeLimit > 0 && this.levelData.timeRemaining <= 0) {
            return true;
        }
        
        return false;
    }

    // 获取游戏进度
    getProgress() {
        return {
            level: this.currentLevel,
            maxLevel: this.maxLevel,
            levelProgress: (this.currentLevel - 1) / this.maxLevel,
            enemyProgress: this.levelData.enemiesTotal > 0 ? 
                this.levelData.enemiesDestroyed / this.levelData.enemiesTotal : 0,
            objectiveProgress: this.levelData.objectivesTotal > 0 ? 
                this.levelData.objectivesCompleted / this.levelData.objectivesTotal : 0,
            timeProgress: this.levelData.timeLimit > 0 ? 
                this.levelData.timeRemaining / this.levelData.timeLimit : 1
        };
    }

    // 获取统计信息
    getStats() {
        return {
            gameState: this.gameState,
            currentLevel: this.currentLevel,
            gameMode: this.gameMode,
            difficulty: this.difficulty,
            levelData: { ...this.levelData },
            sessionData: { ...this.sessionData },
            stateDuration: Date.now() - this.stateStartTime
        };
    }

    // 重置游戏状态
    reset() {
        this.gameState = 'MENU';
        this.previousState = null;
        this.currentLevel = 1;
        this.levelData = {
            enemiesTotal: 0,
            enemiesDestroyed: 0,
            timeLimit: 0,
            timeRemaining: 0,
            objectivesCompleted: 0,
            objectivesTotal: 0
        };
        
        console.log('🔄 游戏状态重置');
    }
}

// 导出得分和生命值系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ScoreEventType,
        ScoreConfig,
        LifeSystem,
        ScoreComponent,
        GameStateManager
    };
} else {
    // 浏览器环境
    window.ScoreSystem = {
        ScoreEventType,
        ScoreConfig,
        LifeSystem,
        ScoreComponent,
        GameStateManager
    };
}