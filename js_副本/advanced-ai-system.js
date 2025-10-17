    //
 分析当前情况
    analyzeSituation() {
        return {
            enemyCount: this.enemies.length,
            teammateCount: this.teammates.length,
            healthPercentage: this.getHealthPercentage(),
            ammoCount: this.getAmmoCount(),
            terrainType: this.getCurrentTerrainType(),
            coverAvailable: this.safeZones.length > 0,
            dangerLevel: this.calculateOverallDangerLevel()
        };
    }

    // 应用难度修正
    applyDifficultyModifiers() {
        const config = this.difficultyConfig;
        
        // 反应时间修正
        if (this.lastDecisionTime && Date.now() - this.lastDecisionTime < config.reactionTime) {
            return; // 还在反应时间内，不做决策
        }
        
        // 精度修正
        if (this.wantToFire && Math.random() > config.accuracy) {
            this.wantToFire = false; // 降低射击精度
        }
        
        // 决策速度修正
        if (Math.random() < config.decisionSpeed / 1000) {
            this.lastDecisionTime = Date.now();
        }
    }

    // 辅助方法
    findProtectionTarget() {
        // 寻找需要保护的目标（如基地、重要建筑等）
        if (this.strategicPoints.length > 0) {
            return this.strategicPoints[0];
        }
        
        // 如果没有特定目标，保护地图中心
        const map = this.pathFinding?.gameMap;
        if (map) {
            return {
                x: map.pixelWidth / 2,
                y: map.pixelHeight / 2
            };
        }
        
        return null;
    }

    calculateFlankPosition(enemy) {
        if (!enemy || !enemy.transform) return null;
        
        const angle = Math.random() * Math.PI * 2; // 随机角度
        const distance = 150 + Math.random() * 100; // 150-250像素距离
        
        return {
            x: enemy.transform.x + Math.cos(angle) * distance,
            y: enemy.transform.y + Math.sin(angle) * distance
        };
    }

    findBestSniperPosition() {
        if (this.strategicPoints.length === 0) return null;
        
        // 选择视野最好的战略点
        return this.strategicPoints.reduce((best, point) => 
            point.visibility > best.visibility ? point : best);
    }

    findTeammateNeedingHelp() {
        // 寻找生命值低或被围攻的队友
        for (const teammate of this.teammates) {
            const health = teammate.entity.getComponent('Health');
            if (health && health.current < health.max * 0.3) {
                return teammate;
            }
            
            // 检查是否被多个敌人围攻
            const nearbyEnemies = this.enemies.filter(enemy => 
                this.getDistance(teammate.transform, enemy.transform) < 200);
            
            if (nearbyEnemies.length >= 2) {
                return teammate;
            }
        }
        
        return null;
    }

    findAmbushPosition() {
        // 寻找隐蔽且有良好射击角度的位置
        const goodPositions = this.safeZones.filter(zone => 
            zone.cover > 0.7 && zone.safety > 0.6);
        
        if (goodPositions.length > 0) {
            return goodPositions[Math.floor(Math.random() * goodPositions.length)];
        }
        
        return null;
    }

    calculateSafetyLevel(x, y) {
        let safety = 1.0;
        
        // 检查危险区域
        for (const danger of this.dangerZones) {
            const distance = Math.sqrt((x - danger.x) ** 2 + (y - danger.y) ** 2);
            if (distance < danger.radius) {
                safety -= (danger.threat / 100) * (1 - distance / danger.radius);
            }
        }
        
        return Math.max(0, safety);
    }

    calculateCoverLevel(x, y) {
        if (!this.pathFinding || !this.pathFinding.gameMap) return 0;
        
        const map = this.pathFinding.gameMap;
        const tilePos = map.worldToTile(x, y);
        
        // 检查周围的掩体
        let coverCount = 0;
        const checkRadius = 2;
        
        for (let dy = -checkRadius; dy <= checkRadius; dy++) {
            for (let dx = -checkRadius; dx <= checkRadius; dx++) {
                const checkX = tilePos.x + dx;
                const checkY = tilePos.y + dy;
                
                if (map.getTile(checkX, checkY) === 1) { // 假设1是墙壁
                    coverCount++;
                }
            }
        }
        
        return coverCount / ((checkRadius * 2 + 1) ** 2);
    }

    calculateVisibility(x, y) {
        if (!this.pathFinding || !this.pathFinding.gameMap) return 0;
        
        const map = this.pathFinding.gameMap;
        const viewDistance = 300;
        const rayCount = 16;
        let visibleRays = 0;
        
        // 发射射线检测视野
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            const endX = x + Math.cos(angle) * viewDistance;
            const endY = y + Math.sin(angle) * viewDistance;
            
            if (this.hasLineOfSight(x, y, endX, endY)) {
                visibleRays++;
            }
        }
        
        return visibleRays / rayCount;
    }

    calculateThreatLevel(entity) {
        const weapon = entity.getComponent('Weapon');
        const health = entity.getComponent('Health');
        
        let threat = 50; // 基础威胁
        
        if (weapon) {
            threat += weapon.damage || 25;
        }
        
        if (health) {
            threat *= (health.current / health.max);
        }
        
        return threat;
    }

    calculateOverallDangerLevel() {
        let danger = 0;
        
        for (const zone of this.dangerZones) {
            const transform = this.entity.getComponent('Transform');
            if (transform) {
                const distance = Math.sqrt(
                    (transform.x - zone.x) ** 2 + (transform.y - zone.y) ** 2
                );
                
                if (distance < zone.radius * 2) {
                    danger += zone.threat * (1 - distance / (zone.radius * 2));
                }
            }
        }
        
        return Math.min(1, danger / 100);
    }

    getHealthPercentage() {
        const health = this.entity.getComponent('Health');
        return health ? health.current / health.max : 1;
    }

    getAmmoCount() {
        const weapon = this.entity.getComponent('Weapon');
        return weapon ? weapon.ammo || Infinity : 0;
    }

    getCurrentTerrainType() {
        const transform = this.entity.getComponent('Transform');
        if (!transform || !this.pathFinding || !this.pathFinding.gameMap) {
            return 'unknown';
        }
        
        const map = this.pathFinding.gameMap;
        const tilePos = map.worldToTile(transform.x, transform.y);
        const tile = map.getTile(tilePos.x, tilePos.y);
        
        switch (tile) {
            case 0: return 'open';
            case 1: return 'wall';
            case 2: return 'water';
            case 3: return 'forest';
            default: return 'unknown';
        }
    }

    getDistanceToPoint(x, y) {
        const transform = this.entity.getComponent('Transform');
        if (!transform) return Infinity;
        
        return Math.sqrt((transform.x - x) ** 2 + (transform.y - y) ** 2);
    }
}

// AI记忆系统
class AIMemory {
    constructor() {
        this.shortTermMemory = new Map(); // 短期记忆（几秒钟）
        this.longTermMemory = new Map();  // 长期记忆（整个游戏会话）
        this.spatialMemory = new Map();   // 空间记忆（地图相关）
        
        this.maxShortTermEntries = 50;
        this.maxLongTermEntries = 200;
        this.shortTermDuration = 10000; // 10秒
    }

    update(deltaTime) {
        this.cleanupShortTermMemory();
    }

    // 记录敌人移动
    recordEnemyMovement(enemy, data) {
        const key = `enemy_${enemy.id}_movement`;
        this.shortTermMemory.set(key, {
            ...data,
            timestamp: Date.now()
        });
    }

    // 记录战斗事件
    recordCombatEvent(event, data) {
        const key = `combat_${Date.now()}`;
        this.longTermMemory.set(key, {
            event: event,
            data: data,
            timestamp: Date.now()
        });
    }

    // 记录位置信息
    recordSpatialInfo(x, y, info) {
        const key = `spatial_${Math.floor(x/50)}_${Math.floor(y/50)}`;
        this.spatialMemory.set(key, {
            ...info,
            timestamp: Date.now()
        });
    }

    // 获取最近表现
    getRecentPerformance() {
        const now = Date.now();
        const recentTime = 30000; // 30秒内
        
        let kills = 0;
        let deaths = 0;
        let survivalTime = 0;
        
        for (const [key, value] of this.longTermMemory) {
            if (now - value.timestamp <= recentTime) {
                if (value.event === 'kill') kills++;
                if (value.event === 'death') deaths++;
                if (value.event === 'spawn') {
                    survivalTime = Math.max(survivalTime, now - value.timestamp);
                }
            }
        }
        
        return { kills, deaths, survivalTime };
    }

    cleanupShortTermMemory() {
        const now = Date.now();
        for (const [key, value] of this.shortTermMemory) {
            if (now - value.timestamp > this.shortTermDuration) {
                this.shortTermMemory.delete(key);
            }
        }
        
        // 限制条目数量
        if (this.shortTermMemory.size > this.maxShortTermEntries) {
            const entries = Array.from(this.shortTermMemory.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            const toDelete = entries.slice(0, entries.length - this.maxShortTermEntries);
            for (const [key] of toDelete) {
                this.shortTermMemory.delete(key);
            }
        }
    }
}

// 团队协作系统
class TeamworkSystem {
    constructor() {
        this.communicationMessages = [];
        this.sharedTargets = new Map();
        this.formations = new Map();
        this.roles = new Map();
    }

    update(deltaTime) {
        this.processMessages();
        this.updateFormations();
    }

    // 发送消息给队友
    sendMessage(message, targetId = null) {
        this.communicationMessages.push({
            message: message,
            targetId: targetId,
            timestamp: Date.now(),
            senderId: this.entity?.id
        });
    }

    // 处理消息
    processMessages() {
        const now = Date.now();
        this.communicationMessages = this.communicationMessages.filter(msg => 
            now - msg.timestamp < 5000); // 5秒后消息过期
    }

    // 更新编队
    updateFormations() {
        // 简单的编队逻辑
        // 可以根据需要扩展更复杂的编队系统
    }

    // 分配角色
    assignRole(entityId, role) {
        this.roles.set(entityId, role);
    }

    // 获取角色
    getRole(entityId) {
        return this.roles.get(entityId) || 'assault';
    }
}

// 预测系统
class PredictionSystem {
    constructor() {
        this.predictions = new Map();
        this.predictionAccuracy = new Map();
    }

    update(deltaTime) {
        this.updatePredictions();
        this.validatePredictions();
    }

    // 预测敌人位置
    predictEnemyPosition(enemy, timeAhead) {
        const movement = enemy.getComponent('Movement');
        const transform = enemy.getComponent('Transform');
        
        if (!movement || !transform) return null;
        
        return {
            x: transform.x + movement.velocity.x * timeAhead,
            y: transform.y + movement.velocity.y * timeAhead,
            confidence: this.calculatePredictionConfidence(enemy)
        };
    }

    calculatePredictionConfidence(enemy) {
        // 基于历史数据计算预测置信度
        const accuracy = this.predictionAccuracy.get(enemy.id) || 0.5;
        return Math.min(0.95, Math.max(0.1, accuracy));
    }

    updatePredictions() {
        // 更新所有预测
        for (const [entityId, prediction] of this.predictions) {
            prediction.timeRemaining -= 16; // 假设16ms更新间隔
            if (prediction.timeRemaining <= 0) {
                this.predictions.delete(entityId);
            }
        }
    }

    validatePredictions() {
        // 验证预测准确性并更新置信度
        // 这里可以添加更复杂的验证逻辑
    }
}

// 学习系统
class LearningSystem {
    constructor() {
        this.behaviorPatterns = new Map();
        this.adaptationRules = new Map();
        this.learningRate = 0.1;
    }

    update(deltaTime) {
        this.updateLearning();
    }

    // 学习玩家行为模式
    learnPlayerBehavior(playerId, action, context) {
        const key = `player_${playerId}_behavior`;
        
        if (!this.behaviorPatterns.has(key)) {
            this.behaviorPatterns.set(key, {
                actions: [],
                contexts: [],
                patterns: new Map()
            });
        }
        
        const behavior = this.behaviorPatterns.get(key);
        behavior.actions.push(action);
        behavior.contexts.push(context);
        
        // 保持最近100个行为记录
        if (behavior.actions.length > 100) {
            behavior.actions.shift();
            behavior.contexts.shift();
        }
        
        this.analyzePatterns(behavior);
    }

    analyzePatterns(behavior) {
        // 分析行为模式
        const recentActions = behavior.actions.slice(-20); // 最近20个动作
        
        // 寻找重复模式
        for (let i = 0; i < recentActions.length - 2; i++) {
            const pattern = recentActions.slice(i, i + 3).join('-');
            const count = behavior.patterns.get(pattern) || 0;
            behavior.patterns.set(pattern, count + 1);
        }
    }

    updateLearning() {
        // 更新学习算法
        // 可以添加更复杂的机器学习算法
    }

    // 获取学习到的行为预测
    predictPlayerAction(playerId, currentContext) {
        const key = `player_${playerId}_behavior`;
        const behavior = this.behaviorPatterns.get(key);
        
        if (!behavior || behavior.patterns.size === 0) {
            return null;
        }
        
        // 找到最常见的模式
        let mostCommonPattern = null;
        let maxCount = 0;
        
        for (const [pattern, count] of behavior.patterns) {
            if (count > maxCount) {
                maxCount = count;
                mostCommonPattern = pattern;
            }
        }
        
        if (mostCommonPattern) {
            const actions = mostCommonPattern.split('-');
            return actions[actions.length - 1]; // 返回模式中的下一个动作
        }
        
        return null;
    }
}

// 导出高级AI系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AdvancedAIController,
        AIStrategy,
        AIDifficulty,
        DifficultyConfig,
        AIMemory,
        TeamworkSystem,
        PredictionSystem,
        LearningSystem
    };
} else {
    // 浏览器环境
    window.AdvancedAISystem = {
        AdvancedAIController,
        AIStrategy,
        AIDifficulty,
        DifficultyConfig,
        AIMemory,
        TeamworkSystem,
        PredictionSystem,
        LearningSystem
    };
}