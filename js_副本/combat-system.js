/**
 * 战斗系统 (Combat System)
 * 坦克大战游戏的战斗和碰撞检测系统
 */

// 碰撞类型枚举
const CollisionType = {
    TANK_TANK: 'tank_tank',           // 坦克与坦克
    TANK_BULLET: 'tank_bullet',       // 坦克与子弹
    TANK_OBSTACLE: 'tank_obstacle',   // 坦克与障碍物
    BULLET_OBSTACLE: 'bullet_obstacle', // 子弹与障碍物
    TANK_POWERUP: 'tank_powerup',     // 坦克与道具
    BULLET_BULLET: 'bullet_bullet'    // 子弹与子弹
};

// 伤害类型枚举
const DamageType = {
    BULLET: 'bullet',         // 子弹伤害
    EXPLOSION: 'explosion',   // 爆炸伤害
    COLLISION: 'collision',   // 碰撞伤害
    ENVIRONMENTAL: 'environmental' // 环境伤害
};

// 战斗事件类型
const CombatEvent = {
    DAMAGE_DEALT: 'damage_dealt',
    TANK_DESTROYED: 'tank_destroyed',
    BULLET_HIT: 'bullet_hit',
    EXPLOSION_TRIGGERED: 'explosion_triggered',
    COLLISION_OCCURRED: 'collision_occurred'
};

// 高级碰撞检测器
class AdvancedCollisionDetector {
    constructor() {
        this.spatialGrid = new SpatialGrid(64); // 64像素网格
        this.collisionPairs = [];
        this.collisionHistory = new Map();
    }

    // 更新空间网格
    updateSpatialGrid(entities) {
        this.spatialGrid.clear();
        
        for (const entity of entities) {
            const transform = entity.getComponent('Transform');
            const collider = entity.getComponent('Collider');
            
            if (transform && collider) {
                this.spatialGrid.insert(entity, transform.x, transform.y, collider.width, collider.height);
            }
        }
    }

    // 检测所有碰撞
    detectCollisions(entities) {
        this.collisionPairs = [];
        this.updateSpatialGrid(entities);
        
        // 使用空间网格优化碰撞检测
        for (const entity of entities) {
            const nearbyEntities = this.spatialGrid.getNearby(entity);
            
            for (const other of nearbyEntities) {
                if (entity === other) continue;
                
                const collision = this.checkEntityCollision(entity, other);
                if (collision) {
                    this.collisionPairs.push(collision);
                }
            }
        }
        
        return this.collisionPairs;
    }

    // 检查两个实体的碰撞
    checkEntityCollision(entityA, entityB) {
        const colliderA = entityA.getComponent('Collider');
        const colliderB = entityB.getComponent('Collider');
        
        if (!colliderA || !colliderB) return null;
        
        if (colliderA.checkCollision(colliderB)) {
            const collisionType = this.determineCollisionType(entityA, entityB);
            
            return {
                entityA: entityA,
                entityB: entityB,
                colliderA: colliderA,
                colliderB: colliderB,
                type: collisionType,
                timestamp: Date.now()
            };
        }
        
        return null;
    }

    // 确定碰撞类型
    determineCollisionType(entityA, entityB) {
        const tagsA = Array.from(entityA.tags);
        const tagsB = Array.from(entityB.tags);
        
        if (tagsA.includes('tank') && tagsB.includes('tank')) {
            return CollisionType.TANK_TANK;
        } else if ((tagsA.includes('tank') && tagsB.includes('bullet')) ||
                   (tagsA.includes('bullet') && tagsB.includes('tank'))) {
            return CollisionType.TANK_BULLET;
        } else if (tagsA.includes('bullet') && tagsB.includes('bullet')) {
            return CollisionType.BULLET_BULLET;
        } else if ((tagsA.includes('tank') && tagsB.includes('powerup')) ||
                   (tagsA.includes('powerup') && tagsB.includes('tank'))) {
            return CollisionType.TANK_POWERUP;
        }
        
        return CollisionType.TANK_OBSTACLE;
    }

    // 精确碰撞检测（用于重要碰撞）
    preciseCollisionCheck(entityA, entityB) {
        const transformA = entityA.getComponent('Transform');
        const transformB = entityB.getComponent('Transform');
        const colliderA = entityA.getComponent('Collider');
        const colliderB = entityB.getComponent('Collider');
        
        if (!transformA || !transformB || !colliderA || !colliderB) return null;
        
        // 计算实际碰撞点和法向量
        const boundsA = colliderA.getBounds();
        const boundsB = colliderB.getBounds();
        
        const overlapX = Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);
        const overlapY = Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);
        
        if (overlapX > 0 && overlapY > 0) {
            // 计算碰撞点
            const contactX = (Math.max(boundsA.left, boundsB.left) + Math.min(boundsA.right, boundsB.right)) / 2;
            const contactY = (Math.max(boundsA.top, boundsB.top) + Math.min(boundsA.bottom, boundsB.bottom)) / 2;
            
            // 计算法向量
            const dx = transformB.x - transformA.x;
            const dy = transformB.y - transformA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const normalX = distance > 0 ? dx / distance : 0;
            const normalY = distance > 0 ? dy / distance : 0;
            
            return {
                contactPoint: { x: contactX, y: contactY },
                normal: { x: normalX, y: normalY },
                penetration: Math.min(overlapX, overlapY)
            };
        }
        
        return null;
    }
}

// 空间网格优化
class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    // 清空网格
    clear() {
        this.grid.clear();
    }

    // 插入实体到网格
    insert(entity, x, y, width, height) {
        const cells = this.getCells(x, y, width, height);
        
        for (const cellKey of cells) {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, []);
            }
            this.grid.get(cellKey).push(entity);
        }
    }

    // 获取附近的实体
    getNearby(entity) {
        const transform = entity.getComponent('Transform');
        const collider = entity.getComponent('Collider');
        
        if (!transform || !collider) return [];
        
        const cells = this.getCells(transform.x, transform.y, collider.width, collider.height);
        const nearby = new Set();
        
        for (const cellKey of cells) {
            const cellEntities = this.grid.get(cellKey);
            if (cellEntities) {
                for (const other of cellEntities) {
                    if (other !== entity) {
                        nearby.add(other);
                    }
                }
            }
        }
        
        return Array.from(nearby);
    }

    // 获取实体占用的网格单元
    getCells(x, y, width, height) {
        const cells = [];
        const left = Math.floor((x - width / 2) / this.cellSize);
        const right = Math.floor((x + width / 2) / this.cellSize);
        const top = Math.floor((y - height / 2) / this.cellSize);
        const bottom = Math.floor((y + height / 2) / this.cellSize);
        
        for (let gx = left; gx <= right; gx++) {
            for (let gy = top; gy <= bottom; gy++) {
                cells.push(`${gx},${gy}`);
            }
        }
        
        return cells;
    }
}

// 战斗管理器
class CombatManager {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.collisionDetector = new AdvancedCollisionDetector();
        this.combatEvents = [];
        this.damageQueue = [];
        
        // 战斗统计
        this.stats = {
            totalDamageDealt: 0,
            tanksDestroyed: 0,
            bulletsHit: 0,
            explosions: 0,
            collisions: 0
        };
        
        // 事件监听器
        this.eventListeners = new Map();
    }

    // 更新战斗系统
    update(deltaTime) {
        // 检测碰撞
        const entities = Array.from(this.entityManager.entities.values());
        const collisions = this.collisionDetector.detectCollisions(entities);
        
        // 处理碰撞
        for (const collision of collisions) {
            this.handleCollision(collision);
        }
        
        // 处理伤害队列
        this.processDamageQueue();
        
        // 清理过期事件
        this.cleanupEvents();
    }

    // 处理碰撞
    handleCollision(collision) {
        switch (collision.type) {
            case CollisionType.TANK_TANK:
                this.handleTankTankCollision(collision);
                break;
            case CollisionType.TANK_BULLET:
                this.handleTankBulletCollision(collision);
                break;
            case CollisionType.BULLET_OBSTACLE:
                this.handleBulletObstacleCollision(collision);
                break;
            case CollisionType.TANK_POWERUP:
                this.handleTankPowerupCollision(collision);
                break;
            case CollisionType.BULLET_BULLET:
                this.handleBulletBulletCollision(collision);
                break;
        }
    }

    // 处理坦克与坦克碰撞
    handleTankTankCollision(collision) {
        const { entityA, entityB } = collision;
        
        // 获取精确碰撞信息
        const preciseCollision = this.collisionDetector.preciseCollisionCheck(entityA, entityB);
        if (!preciseCollision) return;
        
        // 分离坦克
        this.separateTanks(entityA, entityB, preciseCollision);
        
        // 停止移动
        const movementA = entityA.getComponent('Movement');
        const movementB = entityB.getComponent('Movement');
        
        if (movementA) movementA.stop();
        if (movementB) movementB.stop();
        
        // 记录碰撞事件
        this.addCombatEvent(CombatEvent.COLLISION_OCCURRED, {
            entities: [entityA, entityB],
            type: 'tank_tank'
        });
        
        this.stats.collisions++;
    }

    // 处理坦克与子弹碰撞
    handleTankBulletCollision(collision) {
        let tank, bullet;
        
        if (collision.entityA.hasTag('tank')) {
            tank = collision.entityA;
            bullet = collision.entityB;
        } else {
            tank = collision.entityB;
            bullet = collision.entityA;
        }
        
        const bulletComponent = bullet.getComponent('Bullet');
        if (!bulletComponent || !bulletComponent.active) return;
        
        // 检查是否是友军火力
        if (bulletComponent.owner === tank) return;
        
        // 应用伤害
        const damage = bulletComponent.damage;
        this.dealDamage(tank, damage, DamageType.BULLET, bullet);
        
        // 处理子弹击中
        const destroyed = bulletComponent.hit(tank);
        
        // 记录事件
        this.addCombatEvent(CombatEvent.BULLET_HIT, {
            tank: tank,
            bullet: bullet,
            damage: damage,
            destroyed: destroyed
        });
        
        this.stats.bulletsHit++;
    }

    // 处理子弹与障碍物碰撞
    handleBulletObstacleCollision(collision) {
        // 这个逻辑已经在子弹系统中处理了
        // 这里主要是记录统计信息
        this.stats.bulletsHit++;
    }

    // 处理坦克与道具碰撞
    handleTankPowerupCollision(collision) {
        let tank, powerup;
        
        if (collision.entityA.hasTag('tank')) {
            tank = collision.entityA;
            powerup = collision.entityB;
        } else {
            tank = collision.entityB;
            powerup = collision.entityA;
        }
        
        // 应用道具效果
        this.applyPowerup(tank, powerup);
        
        // 移除道具
        this.entityManager.removeEntity(powerup);
    }

    // 处理子弹与子弹碰撞
    handleBulletBulletCollision(collision) {
        const bulletA = collision.entityA.getComponent('Bullet');
        const bulletB = collision.entityB.getComponent('Bullet');
        
        if (bulletA && bulletB && bulletA.active && bulletB.active) {
            // 两颗子弹都被摧毁
            bulletA.destroy();
            bulletB.destroy();
            
            // 创建小爆炸效果
            const transformA = collision.entityA.getComponent('Transform');
            if (transformA && window.game && window.game.createExplosion) {
                window.game.createExplosion(transformA.x, transformA.y, 20);
            }
        }
    }

    // 分离坦克
    separateTanks(tankA, tankB, collisionInfo) {
        const transformA = tankA.getComponent('Transform');
        const transformB = tankB.getComponent('Transform');
        
        if (!transformA || !transformB) return;
        
        const separationDistance = collisionInfo.penetration / 2;
        
        // 沿法向量分离
        transformA.x -= collisionInfo.normal.x * separationDistance;
        transformA.y -= collisionInfo.normal.y * separationDistance;
        
        transformB.x += collisionInfo.normal.x * separationDistance;
        transformB.y += collisionInfo.normal.y * separationDistance;
    }

    // 造成伤害
    dealDamage(target, damage, damageType, source = null) {
        const health = target.getComponent('Health');
        if (!health) return false;
        
        // 检查无敌状态
        if (health.invulnerable) return false;
        
        // 应用伤害
        const actualDamage = this.calculateDamage(target, damage, damageType);
        const wasDamaged = health.takeDamage(actualDamage);
        
        if (wasDamaged) {
            // 记录伤害事件
            this.addCombatEvent(CombatEvent.DAMAGE_DEALT, {
                target: target,
                damage: actualDamage,
                damageType: damageType,
                source: source
            });
            
            this.stats.totalDamageDealt += actualDamage;
            
            // 检查是否被摧毁
            if (!health.isAlive()) {
                this.handleEntityDestroyed(target, source);
            }
        }
        
        return wasDamaged;
    }

    // 计算实际伤害
    calculateDamage(target, baseDamage, damageType) {
        let damage = baseDamage;
        
        // 检查护甲
        const tankController = target.getComponent('TankController');
        if (tankController && tankController.config.armor > 0) {
            damage = Math.max(1, damage - tankController.config.armor);
        }
        
        // 伤害类型修正
        switch (damageType) {
            case DamageType.EXPLOSION:
                // 爆炸伤害对重型坦克减少
                if (tankController && tankController.tankType === TankSystem.TankType.ENEMY_HEAVY) {
                    damage *= 0.8;
                }
                break;
            case DamageType.COLLISION:
                // 碰撞伤害通常较小
                damage *= 0.5;
                break;
        }
        
        return Math.max(1, Math.floor(damage));
    }

    // 处理实体被摧毁
    handleEntityDestroyed(entity, source) {
        // 记录摧毁事件
        this.addCombatEvent(CombatEvent.TANK_DESTROYED, {
            entity: entity,
            source: source
        });
        
        this.stats.tanksDestroyed++;
        
        // 创建爆炸效果
        const transform = entity.getComponent('Transform');
        if (transform && window.game && window.game.createExplosion) {
            window.game.createExplosion(transform.x, transform.y, 60);
            this.stats.explosions++;
        }
        
        // 触发游戏事件
        if (entity.hasTag('player') && window.game && window.game.onPlayerTankDestroyed) {
            window.game.onPlayerTankDestroyed(entity);
        } else if (entity.hasTag('enemy') && window.game && window.game.onEnemyTankDestroyed) {
            window.game.onEnemyTankDestroyed(entity);
        }
    }

    // 应用道具效果
    applyPowerup(tank, powerup) {
        // 这里可以根据道具类型应用不同效果
        // 目前先实现基础的生命值恢复
        const health = tank.getComponent('Health');
        if (health) {
            health.heal(1);
        }
        
        console.log('🎁 坦克获得道具');
    }

    // 处理伤害队列
    processDamageQueue() {
        while (this.damageQueue.length > 0) {
            const damageInfo = this.damageQueue.shift();
            this.dealDamage(
                damageInfo.target,
                damageInfo.damage,
                damageInfo.damageType,
                damageInfo.source
            );
        }
    }

    // 添加战斗事件
    addCombatEvent(eventType, data) {
        this.combatEvents.push({
            type: eventType,
            data: data,
            timestamp: Date.now()
        });
        
        // 触发事件监听器
        this.triggerEventListeners(eventType, data);
    }

    // 触发事件监听器
    triggerEventListeners(eventType, data) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(data);
                } catch (error) {
                    console.error('战斗事件监听器错误:', error);
                }
            }
        }
    }

    // 添加事件监听器
    addEventListener(eventType, listener) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(listener);
    }

    // 移除事件监听器
    removeEventListener(eventType, listener) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // 清理过期事件
    cleanupEvents() {
        const now = Date.now();
        const maxAge = 5000; // 5秒
        
        this.combatEvents = this.combatEvents.filter(event => 
            now - event.timestamp < maxAge
        );
    }

    // 获取战斗统计
    getStats() {
        return { ...this.stats };
    }

    // 重置统计
    resetStats() {
        this.stats = {
            totalDamageDealt: 0,
            tanksDestroyed: 0,
            bulletsHit: 0,
            explosions: 0,
            collisions: 0
        };
    }

    // 获取最近的战斗事件
    getRecentEvents(count = 10) {
        return this.combatEvents.slice(-count);
    }
}

// 伤害数字显示系统
class DamageNumberSystem {
    constructor() {
        this.damageNumbers = [];
    }

    // 显示伤害数字
    showDamage(x, y, damage, damageType = DamageType.BULLET) {
        const damageNumber = {
            x: x,
            y: y,
            damage: damage,
            type: damageType,
            life: 1.0,
            velocity: { x: (Math.random() - 0.5) * 50, y: -100 },
            startTime: Date.now()
        };
        
        this.damageNumbers.push(damageNumber);
    }

    // 更新伤害数字
    update(deltaTime) {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const number = this.damageNumbers[i];
            
            // 更新位置
            number.x += number.velocity.x * deltaTime / 1000;
            number.y += number.velocity.y * deltaTime / 1000;
            
            // 更新生命值
            number.life -= deltaTime / 1500; // 1.5秒生命周期
            
            // 移除过期的数字
            if (number.life <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }
    }

    // 渲染伤害数字
    render(ctx) {
        for (const number of this.damageNumbers) {
            ctx.save();
            
            // 设置样式
            ctx.globalAlpha = number.life;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 根据伤害类型设置颜色
            switch (number.type) {
                case DamageType.BULLET:
                    ctx.fillStyle = '#FFD700';
                    break;
                case DamageType.EXPLOSION:
                    ctx.fillStyle = '#FF4500';
                    break;
                case DamageType.COLLISION:
                    ctx.fillStyle = '#FFFFFF';
                    break;
                default:
                    ctx.fillStyle = '#FF0000';
                    break;
            }
            
            // 绘制描边
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(number.damage.toString(), number.x, number.y);
            
            // 绘制文字
            ctx.fillText(number.damage.toString(), number.x, number.y);
            
            ctx.restore();
        }
    }

    // 清除所有伤害数字
    clear() {
        this.damageNumbers = [];
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        CollisionType,
        DamageType,
        CombatEvent,
        AdvancedCollisionDetector,
        SpatialGrid,
        CombatManager,
        DamageNumberSystem
    };
} else {
    // 浏览器环境
    window.CombatSystem = {
        CollisionType,
        DamageType,
        CombatEvent,
        AdvancedCollisionDetector,
        SpatialGrid,
        CombatManager,
        DamageNumberSystem
    };
}