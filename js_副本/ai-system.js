/**
 * AI系统 (AI System)
 * 坦克大战游戏的人工智能系统
 */

// AI状态枚举
const AIState = {
    IDLE: 'idle',           // 空闲状态
    PATROL: 'patrol',       // 巡逻状态
    CHASE: 'chase',         // 追击状态
    ATTACK: 'attack',       // 攻击状态
    RETREAT: 'retreat',     // 撤退状态
    SEEK_COVER: 'seek_cover', // 寻找掩护
    DEFEND: 'defend'        // 防守状态
};

// AI行为类型
const AIBehavior = {
    AGGRESSIVE: 'aggressive',   // 激进型
    DEFENSIVE: 'defensive',     // 防守型
    BALANCED: 'balanced',       // 平衡型
    COWARD: 'coward',          // 胆小型
    BERSERKER: 'berserker'     // 狂暴型
};

// AI配置
const AIConfig = {
    [AIBehavior.AGGRESSIVE]: {
        name: '激进型',
        attackRange: 200,
        chaseRange: 300,
        retreatHealthThreshold: 0.2,
        fireRate: 0.8,
        movementSpeed: 1.2,
        decisionTime: 300,
        aggressiveness: 0.9
    },
    [AIBehavior.DEFENSIVE]: {
        name: '防守型',
        attackRange: 250,
        chaseRange: 200,
        retreatHealthThreshold: 0.5,
        fireRate: 0.6,
        movementSpeed: 0.8,
        decisionTime: 500,
        aggressiveness: 0.3
    },
    [AIBehavior.BALANCED]: {
        name: '平衡型',
        attackRange: 220,
        chaseRange: 250,
        retreatHealthThreshold: 0.3,
        fireRate: 0.7,
        movementSpeed: 1.0,
        decisionTime: 400,
        aggressiveness: 0.6
    },
    [AIBehavior.COWARD]: {
        name: '胆小型',
        attackRange: 300,
        chaseRange: 150,
        retreatHealthThreshold: 0.7,
        fireRate: 0.5,
        movementSpeed: 1.1,
        decisionTime: 200,
        aggressiveness: 0.2
    },
    [AIBehavior.BERSERKER]: {
        name: '狂暴型',
        attackRange: 150,
        chaseRange: 400,
        retreatHealthThreshold: 0.1,
        fireRate: 1.0,
        movementSpeed: 1.3,
        decisionTime: 100,
        aggressiveness: 1.0
    }
};

// 路径寻找算法
class PathFinding {
    constructor(gameMap) {
        this.gameMap = gameMap;
        this.openList = [];
        this.closedList = [];
    }

    // A*寻路算法
    findPath(startX, startY, endX, endY) {
        if (!this.gameMap) return [];

        const start = this.worldToGrid(startX, startY);
        const end = this.worldToGrid(endX, endY);

        // 检查目标是否可达
        if (!this.isWalkable(end.x, end.y)) {
            return this.findNearestWalkable(start, end);
        }

        this.openList = [];
        this.closedList = [];

        const startNode = {
            x: start.x,
            y: start.y,
            g: 0,
            h: this.heuristic(start, end),
            f: 0,
            parent: null
        };
        startNode.f = startNode.g + startNode.h;

        this.openList.push(startNode);

        while (this.openList.length > 0) {
            // 找到F值最小的节点
            let currentNode = this.openList[0];
            let currentIndex = 0;

            for (let i = 1; i < this.openList.length; i++) {
                if (this.openList[i].f < currentNode.f) {
                    currentNode = this.openList[i];
                    currentIndex = i;
                }
            }

            // 移动当前节点到关闭列表
            this.openList.splice(currentIndex, 1);
            this.closedList.push(currentNode);

            // 检查是否到达目标
            if (currentNode.x === end.x && currentNode.y === end.y) {
                return this.reconstructPath(currentNode);
            }

            // 检查相邻节点
            const neighbors = this.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (this.isInClosedList(neighbor) || !this.isWalkable(neighbor.x, neighbor.y)) {
                    continue;
                }

                const tentativeG = currentNode.g + this.getDistance(currentNode, neighbor);
                const existingNode = this.findInOpenList(neighbor);

                if (!existingNode) {
                    neighbor.g = tentativeG;
                    neighbor.h = this.heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = currentNode;
                    this.openList.push(neighbor);
                } else if (tentativeG < existingNode.g) {
                    existingNode.g = tentativeG;
                    existingNode.f = existingNode.g + existingNode.h;
                    existingNode.parent = currentNode;
                }
            }
        }

        // 没有找到路径，返回空数组
        return [];
    }

    // 世界坐标转网格坐标
    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.gameMap.tileSize),
            y: Math.floor(worldY / this.gameMap.tileSize)
        };
    }

    // 网格坐标转世界坐标
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.gameMap.tileSize + this.gameMap.tileSize / 2,
            y: gridY * this.gameMap.tileSize + this.gameMap.tileSize / 2
        };
    }

    // 检查位置是否可行走
    isWalkable(gridX, gridY) {
        const tile = this.gameMap.getTile(gridX, gridY);
        return tile && tile.isPassable();
    }

    // 启发式函数（曼哈顿距离）
    heuristic(nodeA, nodeB) {
        return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
    }

    // 获取两点间距离
    getDistance(nodeA, nodeB) {
        const dx = Math.abs(nodeA.x - nodeB.x);
        const dy = Math.abs(nodeA.y - nodeB.y);
        return dx + dy;
    }

    // 获取相邻节点
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // 上
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }  // 左
        ];

        for (const dir of directions) {
            neighbors.push({
                x: node.x + dir.x,
                y: node.y + dir.y
            });
        }

        return neighbors;
    }

    // 检查节点是否在关闭列表中
    isInClosedList(node) {
        return this.closedList.some(n => n.x === node.x && n.y === node.y);
    }

    // 在开放列表中查找节点
    findInOpenList(node) {
        return this.openList.find(n => n.x === node.x && n.y === node.y);
    }

    // 重构路径
    reconstructPath(endNode) {
        const path = [];
        let currentNode = endNode;

        while (currentNode) {
            const worldPos = this.gridToWorld(currentNode.x, currentNode.y);
            path.unshift(worldPos);
            currentNode = currentNode.parent;
        }

        return path;
    }

    // 寻找最近的可行走位置
    findNearestWalkable(start, target) {
        const maxRadius = 10;
        
        for (let radius = 1; radius <= maxRadius; radius++) {
            for (let x = target.x - radius; x <= target.x + radius; x++) {
                for (let y = target.y - radius; y <= target.y + radius; y++) {
                    if (this.isWalkable(x, y)) {
                        return this.findPath(start.x * this.gameMap.tileSize, start.y * this.gameMap.tileSize,
                                           x * this.gameMap.tileSize, y * this.gameMap.tileSize);
                    }
                }
            }
        }
        
        return [];
    }
}

// AI控制器组件
class AIController extends ECS.Component {
    constructor(behavior = AIBehavior.BALANCED) {
        super();
        this.behavior = behavior;
        this.config = AIConfig[behavior];
        
        // AI状态
        this.currentState = AIState.IDLE;
        this.previousState = AIState.IDLE;
        this.stateTime = 0;
        
        // 目标和路径
        this.target = null;
        this.currentPath = [];
        this.pathIndex = 0;
        this.lastPathUpdate = 0;
        
        // 决策计时器
        this.decisionTimer = 0;
        this.lastDecisionTime = 0;
        
        // 感知系统
        this.visibleEnemies = [];
        this.nearbyObstacles = [];
        this.lastScanTime = 0;
        
        // 移动相关
        this.moveDirection = null;
        this.stuckTimer = 0;
        this.lastPosition = { x: 0, y: 0 };
        
        // 射击相关
        this.wantToFire = false;
        this.lastFireTime = 0;
        
        // 路径寻找
        this.pathFinding = null;
    }

    init() {
        // 初始化路径寻找
        const game = window.game;
        if (game && game.currentMap) {
            this.pathFinding = new PathFinding(game.currentMap);
        }
        
        // 设置初始状态
        this.changeState(AIState.PATROL);
    }

    update(deltaTime) {
        this.stateTime += deltaTime;
        this.decisionTimer += deltaTime;
        
        // 更新感知系统
        this.updatePerception();
        
        // 检查是否需要做决策
        if (this.decisionTimer >= this.config.decisionTime) {
            this.makeDecision();
            this.decisionTimer = 0;
        }
        
        // 执行当前状态的行为
        this.executeState(deltaTime);
        
        // 更新移动
        this.updateMovement(deltaTime);
        
        // 更新射击
        this.updateFiring();
        
        // 检查卡住状态
        this.checkStuck(deltaTime);
    }

    // 更新感知系统
    updatePerception() {
        const now = Date.now();
        if (now - this.lastScanTime < 100) return; // 每100ms扫描一次
        
        this.lastScanTime = now;
        this.visibleEnemies = [];
        
        const game = window.game;
        if (!game || !game.entityManager) return;
        
        const transform = this.entity.getComponent('Transform');
        if (!transform) return;
        
        // 扫描敌方目标
        const playerTanks = game.entityManager.getEntitiesByTag('player');
        for (const playerTank of playerTanks) {
            const playerTransform = playerTank.getComponent('Transform');
            if (!playerTransform) continue;
            
            const distance = this.getDistance(transform, playerTransform);
            const inRange = distance <= this.config.chaseRange;
            const hasLineOfSight = this.hasLineOfSight(transform, playerTransform);
            
            if (inRange && hasLineOfSight) {
                this.visibleEnemies.push({
                    entity: playerTank,
                    distance: distance,
                    transform: playerTransform
                });
            }
        }
        
        // 按距离排序
        this.visibleEnemies.sort((a, b) => a.distance - b.distance);
    }

    // 检查视线
    hasLineOfSight(fromTransform, toTransform) {
        if (!this.pathFinding || !this.pathFinding.gameMap) return true;
        
        const dx = toTransform.x - fromTransform.x;
        const dy = toTransform.y - fromTransform.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / 16); // 每16像素检查一次
        
        for (let i = 1; i < steps; i++) {
            const checkX = fromTransform.x + (dx / steps) * i;
            const checkY = fromTransform.y + (dy / steps) * i;
            
            const tilePos = this.pathFinding.gameMap.worldToTile(checkX, checkY);
            const tile = this.pathFinding.gameMap.getTile(tilePos.x, tilePos.y);
            
            if (tile && tile.isSolid()) {
                return false;
            }
        }
        
        return true;
    }

    // 做决策
    makeDecision() {
        const health = this.entity.getComponent('Health');
        const healthRatio = health ? health.getHealthPercentage() : 1;
        
        // 检查是否需要撤退
        if (healthRatio <= this.config.retreatHealthThreshold) {
            this.changeState(AIState.RETREAT);
            return;
        }
        
        // 检查是否有可见敌人
        if (this.visibleEnemies.length > 0) {
            const closestEnemy = this.visibleEnemies[0];
            
            if (closestEnemy.distance <= this.config.attackRange) {
                this.changeState(AIState.ATTACK);
                this.target = closestEnemy.entity;
            } else {
                this.changeState(AIState.CHASE);
                this.target = closestEnemy.entity;
            }
        } else {
            // 没有敌人，进入巡逻状态
            this.changeState(AIState.PATROL);
            this.target = null;
        }
    }

    // 改变状态
    changeState(newState) {
        if (this.currentState === newState) return;
        
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateTime = 0;
        
        // 状态进入处理
        this.onStateEnter(newState);
    }

    // 状态进入处理
    onStateEnter(state) {
        switch (state) {
            case AIState.PATROL:
                this.generatePatrolTarget();
                break;
            case AIState.CHASE:
                this.updatePathToTarget();
                break;
            case AIState.ATTACK:
                this.currentPath = [];
                break;
            case AIState.RETREAT:
                this.findRetreatPosition();
                break;
        }
    }

    // 执行状态行为
    executeState(deltaTime) {
        switch (this.currentState) {
            case AIState.IDLE:
                this.executeIdle();
                break;
            case AIState.PATROL:
                this.executePatrol();
                break;
            case AIState.CHASE:
                this.executeChase();
                break;
            case AIState.ATTACK:
                this.executeAttack();
                break;
            case AIState.RETREAT:
                this.executeRetreat();
                break;
        }
    }

    // 执行空闲状态
    executeIdle() {
        this.moveDirection = null;
        this.wantToFire = false;
    }

    // 执行巡逻状态
    executePatrol() {
        if (this.currentPath.length === 0 || this.pathIndex >= this.currentPath.length) {
            this.generatePatrolTarget();
        } else {
            this.followPath();
        }
        
        this.wantToFire = false;
    }

    // 执行追击状态
    executeChase() {
        if (this.target) {
            // 定期更新路径
            const now = Date.now();
            if (now - this.lastPathUpdate > 500) {
                this.updatePathToTarget();
                this.lastPathUpdate = now;
            }
            
            this.followPath();
        }
        
        this.wantToFire = false;
    }

    // 执行攻击状态
    executeAttack() {
        if (!this.target) {
            this.changeState(AIState.PATROL);
            return;
        }
        
        const transform = this.entity.getComponent('Transform');
        const targetTransform = this.target.getComponent('Transform');
        
        if (!transform || !targetTransform) return;
        
        // 面向目标
        this.faceTarget(transform, targetTransform);
        
        // 尝试射击
        if (Math.random() < this.config.fireRate) {
            this.wantToFire = true;
        }
        
        // 保持距离或寻找更好的位置
        const distance = this.getDistance(transform, targetTransform);
        if (distance < this.config.attackRange * 0.7) {
            // 太近了，后退
            this.moveAwayFromTarget(transform, targetTransform);
        } else if (distance > this.config.attackRange) {
            // 太远了，靠近
            this.moveTowardsTarget(transform, targetTransform);
        } else {
            // 距离合适，停止移动
            this.moveDirection = null;
        }
    }

    // 执行撤退状态
    executeRetreat() {
        this.followPath();
        this.wantToFire = false;
    }

    // 生成巡逻目标
    generatePatrolTarget() {
        if (!this.pathFinding || !this.pathFinding.gameMap) return;
        
        const transform = this.entity.getComponent('Transform');
        if (!transform) return;
        
        const map = this.pathFinding.gameMap;
        const maxAttempts = 10;
        
        for (let i = 0; i < maxAttempts; i++) {
            const targetX = Math.random() * map.pixelWidth;
            const targetY = Math.random() * map.pixelHeight;
            
            if (map.isPassable(targetX, targetY)) {
                this.currentPath = this.pathFinding.findPath(
                    transform.x, transform.y, targetX, targetY
                );
                this.pathIndex = 0;
                break;
            }
        }
    }

    // 更新到目标的路径
    updatePathToTarget() {
        if (!this.target || !this.pathFinding) return;
        
        const transform = this.entity.getComponent('Transform');
        const targetTransform = this.target.getComponent('Transform');
        
        if (!transform || !targetTransform) return;
        
        this.currentPath = this.pathFinding.findPath(
            transform.x, transform.y,
            targetTransform.x, targetTransform.y
        );
        this.pathIndex = 0;
    }

    // 寻找撤退位置
    findRetreatPosition() {
        if (!this.pathFinding || !this.pathFinding.gameMap) return;
        
        const transform = this.entity.getComponent('Transform');
        if (!transform) return;
        
        const map = this.pathFinding.gameMap;
        let bestPosition = null;
        let maxDistance = 0;
        
        // 寻找离所有敌人最远的位置
        for (let attempts = 0; attempts < 20; attempts++) {
            const testX = Math.random() * map.pixelWidth;
            const testY = Math.random() * map.pixelHeight;
            
            if (!map.isPassable(testX, testY)) continue;
            
            let minDistanceToEnemy = Infinity;
            for (const enemy of this.visibleEnemies) {
                const distance = Math.sqrt(
                    Math.pow(testX - enemy.transform.x, 2) +
                    Math.pow(testY - enemy.transform.y, 2)
                );
                minDistanceToEnemy = Math.min(minDistanceToEnemy, distance);
            }
            
            if (minDistanceToEnemy > maxDistance) {
                maxDistance = minDistanceToEnemy;
                bestPosition = { x: testX, y: testY };
            }
        }
        
        if (bestPosition) {
            this.currentPath = this.pathFinding.findPath(
                transform.x, transform.y,
                bestPosition.x, bestPosition.y
            );
            this.pathIndex = 0;
        }
    }

    // 跟随路径
    followPath() {
        if (this.currentPath.length === 0 || this.pathIndex >= this.currentPath.length) {
            this.moveDirection = null;
            return;
        }
        
        const transform = this.entity.getComponent('Transform');
        if (!transform) return;
        
        const targetPoint = this.currentPath[this.pathIndex];
        const distance = Math.sqrt(
            Math.pow(targetPoint.x - transform.x, 2) +
            Math.pow(targetPoint.y - transform.y, 2)
        );
        
        if (distance < 20) {
            // 到达当前路径点，移动到下一个
            this.pathIndex++;
            return;
        }
        
        // 计算移动方向
        const dx = targetPoint.x - transform.x;
        const dy = targetPoint.y - transform.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.moveDirection = dx > 0 ? TankSystem.TankDirection.RIGHT : TankSystem.TankDirection.LEFT;
        } else {
            this.moveDirection = dy > 0 ? TankSystem.TankDirection.DOWN : TankSystem.TankDirection.UP;
        }
    }

    // 面向目标
    faceTarget(transform, targetTransform) {
        const dx = targetTransform.x - transform.x;
        const dy = targetTransform.y - transform.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.moveDirection = dx > 0 ? TankSystem.TankDirection.RIGHT : TankSystem.TankDirection.LEFT;
        } else {
            this.moveDirection = dy > 0 ? TankSystem.TankDirection.DOWN : TankSystem.TankDirection.UP;
        }
    }

    // 远离目标移动
    moveAwayFromTarget(transform, targetTransform) {
        const dx = transform.x - targetTransform.x;
        const dy = transform.y - targetTransform.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.moveDirection = dx > 0 ? TankSystem.TankDirection.RIGHT : TankSystem.TankDirection.LEFT;
        } else {
            this.moveDirection = dy > 0 ? TankSystem.TankDirection.DOWN : TankSystem.TankDirection.UP;
        }
    }

    // 朝向目标移动
    moveTowardsTarget(transform, targetTransform) {
        const dx = targetTransform.x - transform.x;
        const dy = targetTransform.y - transform.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.moveDirection = dx > 0 ? TankSystem.TankDirection.RIGHT : TankSystem.TankDirection.LEFT;
        } else {
            this.moveDirection = dy > 0 ? TankSystem.TankDirection.DOWN : TankSystem.TankDirection.UP;
        }
    }

    // 更新移动
    updateMovement(deltaTime) {
        const controller = this.entity.getComponent('TankController');
        if (!controller) return;
        
        // 设置移动方向
        if (this.moveDirection !== null) {
            controller.targetDirection = this.moveDirection;
            controller.moveDirection = this.moveDirection;
        } else {
            controller.moveDirection = null;
        }
    }

    // 更新射击
    updateFiring() {
        const controller = this.entity.getComponent('TankController');
        if (!controller) return;
        
        controller.wantToFire = this.wantToFire;
        this.wantToFire = false; // 重置射击标志
    }

    // 检查卡住状态
    checkStuck(deltaTime) {
        const transform = this.entity.getComponent('Transform');
        if (!transform) return;
        
        const distance = Math.sqrt(
            Math.pow(transform.x - this.lastPosition.x, 2) +
            Math.pow(transform.y - this.lastPosition.y, 2)
        );
        
        if (distance < 5 && this.moveDirection !== null) {
            this.stuckTimer += deltaTime;
            
            if (this.stuckTimer > 2000) { // 卡住2秒
                // 尝试换个方向
                this.generatePatrolTarget();
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = 0;
        }
        
        this.lastPosition.x = transform.x;
        this.lastPosition.y = transform.y;
    }

    // 获取距离
    getDistance(transform1, transform2) {
        return Math.sqrt(
            Math.pow(transform2.x - transform1.x, 2) +
            Math.pow(transform2.y - transform1.y, 2)
        );
    }

    // 获取AI状态信息
    getStatus() {
        return {
            behavior: this.behavior,
            state: this.currentState,
            hasTarget: !!this.target,
            pathLength: this.currentPath.length,
            visibleEnemies: this.visibleEnemies.length,
            stateTime: this.stateTime
        };
    }
}

// AI管理器
class AIManager {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.aiEntities = [];
        this.updateInterval = 50; // 50ms更新一次AI
        this.lastUpdate = 0;
    }

    // 添加AI实体
    addAI(entity) {
        if (entity.hasComponent('AIController')) {
            this.aiEntities.push(entity);
        }
    }

    // 移除AI实体
    removeAI(entity) {
        const index = this.aiEntities.indexOf(entity);
        if (index > -1) {
            this.aiEntities.splice(index, 1);
        }
    }

    // 更新AI系统
    update(deltaTime) {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval) return;
        
        this.lastUpdate = now;
        
        // 清理已销毁的实体
        this.aiEntities = this.aiEntities.filter(entity => !entity.destroyed);
        
        // 更新所有AI实体
        for (const entity of this.aiEntities) {
            const aiController = entity.getComponent('AIController');
            if (aiController && aiController.active) {
                aiController.update(deltaTime);
            }
        }
    }

    // 获取AI统计信息
    getStats() {
        const stats = {
            totalAI: this.aiEntities.length,
            stateDistribution: {},
            behaviorDistribution: {}
        };
        
        for (const entity of this.aiEntities) {
            const aiController = entity.getComponent('AIController');
            if (aiController) {
                const state = aiController.currentState;
                const behavior = aiController.behavior;
                
                stats.stateDistribution[state] = (stats.stateDistribution[state] || 0) + 1;
                stats.behaviorDistribution[behavior] = (stats.behaviorDistribution[behavior] || 0) + 1;
            }
        }
        
        return stats;
    }

    // 清除所有AI
    clearAll() {
        this.aiEntities = [];
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        AIState,
        AIBehavior,
        AIConfig,
        PathFinding,
        AIController,
        AIManager
    };
} else {
    // 浏览器环境
    window.AISystem = {
        AIState,
        AIBehavior,
        AIConfig,
        PathFinding,
        AIController,
        AIManager
    };
}