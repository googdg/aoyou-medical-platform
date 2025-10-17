/**
 * 道具系统 (PowerUp System)
 * 坦克大战游戏的道具和武器升级系统
 */

// 道具类型枚举
const PowerUpType = {
    // 武器升级
    WEAPON_UPGRADE: 'weapon_upgrade',
    RAPID_FIRE: 'rapid_fire',
    PIERCING_SHOT: 'piercing_shot',
    EXPLOSIVE_SHOT: 'explosive_shot',
    LASER_WEAPON: 'laser_weapon',
    
    // 防御升级
    ARMOR_UPGRADE: 'armor_upgrade',
    SHIELD: 'shield',
    INVINCIBILITY: 'invincibility',
    
    // 移动升级
    SPEED_BOOST: 'speed_boost',
    TELEPORT: 'teleport',
    PHASE_THROUGH: 'phase_through',
    
    // 特殊能力
    MULTI_SHOT: 'multi_shot',
    HOMING_MISSILE: 'homing_missile',
    FREEZE_ENEMIES: 'freeze_enemies',
    HEALTH_RESTORE: 'health_restore',
    EXTRA_LIFE: 'extra_life',
    
    // 战术道具
    RADAR: 'radar',
    STEALTH: 'stealth',
    MINE_LAYER: 'mine_layer',
    REPAIR_KIT: 'repair_kit'
};

// 道具稀有度
const PowerUpRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

// 道具配置
const PowerUpConfig = {
    [PowerUpType.WEAPON_UPGRADE]: {
        name: '武器升级',
        description: '提升武器威力',
        rarity: PowerUpRarity.COMMON,
        duration: 0, // 永久
        color: '#FFD700',
        icon: '⚡',
        spawnChance: 0.15,
        effects: {
            damageMultiplier: 1.5,
            penetration: 1
        }
    },
    
    [PowerUpType.RAPID_FIRE]: {
        name: '快速射击',
        description: '大幅提升射击速度',
        rarity: PowerUpRarity.UNCOMMON,
        duration: 15000, // 15秒
        color: '#FF4500',
        icon: '🔥',
        spawnChance: 0.12,
        effects: {
            fireRateMultiplier: 3.0,
            recoilReduction: 0.5
        }
    },
    
    [PowerUpType.PIERCING_SHOT]: {
        name: '穿透弹',
        description: '子弹可以穿透多个敌人',
        rarity: PowerUpRarity.RARE,
        duration: 20000, // 20秒
        color: '#00FFFF',
        icon: '🎯',
        spawnChance: 0.08,
        effects: {
            piercing: true,
            maxPenetrations: 3,
            damageRetention: 0.8
        }
    },
    
    [PowerUpType.EXPLOSIVE_SHOT]: {
        name: '爆炸弹',
        description: '子弹命中时产生爆炸',
        rarity: PowerUpRarity.RARE,
        duration: 25000, // 25秒
        color: '#FF6347',
        icon: '💥',
        spawnChance: 0.06,
        effects: {
            explosive: true,
            explosionRadius: 60,
            explosionDamage: 40
        }
    },
    
    [PowerUpType.LASER_WEAPON]: {
        name: '激光武器',
        description: '发射瞬间命中的激光',
        rarity: PowerUpRarity.EPIC,
        duration: 12000, // 12秒
        color: '#FF00FF',
        icon: '⚡',
        spawnChance: 0.04,
        effects: {
            instantHit: true,
            laserDamage: 60,
            laserRange: 400
        }
    },
    
    [PowerUpType.ARMOR_UPGRADE]: {
        name: '装甲升级',
        description: '提升防御力',
        rarity: PowerUpRarity.COMMON,
        duration: 0, // 永久
        color: '#C0C0C0',
        icon: '🛡️',
        spawnChance: 0.12,
        effects: {
            armorMultiplier: 1.5,
            damageReduction: 0.25
        }
    },
    
    [PowerUpType.SHIELD]: {
        name: '能量护盾',
        description: '吸收一定伤害的护盾',
        rarity: PowerUpRarity.UNCOMMON,
        duration: 30000, // 30秒
        color: '#00BFFF',
        icon: '🔵',
        spawnChance: 0.10,
        effects: {
            shieldHealth: 100,
            shieldRegenRate: 2
        }
    },
    
    [PowerUpType.INVINCIBILITY]: {
        name: '无敌状态',
        description: '短时间内免疫所有伤害',
        rarity: PowerUpRarity.LEGENDARY,
        duration: 8000, // 8秒
        color: '#FFD700',
        icon: '⭐',
        spawnChance: 0.02,
        effects: {
            invulnerable: true,
            glowEffect: true
        }
    },
    
    [PowerUpType.SPEED_BOOST]: {
        name: '速度提升',
        description: '大幅提升移动速度',
        rarity: PowerUpRarity.COMMON,
        duration: 20000, // 20秒
        color: '#32CD32',
        icon: '💨',
        spawnChance: 0.14,
        effects: {
            speedMultiplier: 1.8,
            acceleration: 1.5
        }
    },
    
    [PowerUpType.TELEPORT]: {
        name: '瞬移',
        description: '可以瞬间移动到指定位置',
        rarity: PowerUpRarity.EPIC,
        duration: 0, // 一次性使用
        color: '#9370DB',
        icon: '🌀',
        spawnChance: 0.03,
        effects: {
            teleportRange: 200,
            uses: 3
        }
    },
    
    [PowerUpType.MULTI_SHOT]: {
        name: '多重射击',
        description: '同时发射多发子弹',
        rarity: PowerUpRarity.RARE,
        duration: 18000, // 18秒
        color: '#FFA500',
        icon: '🎆',
        spawnChance: 0.07,
        effects: {
            bulletCount: 3,
            spreadAngle: 0.3,
            damagePerBullet: 0.7
        }
    },
    
    [PowerUpType.HOMING_MISSILE]: {
        name: '追踪导弹',
        description: '发射自动追踪敌人的导弹',
        rarity: PowerUpRarity.EPIC,
        duration: 15000, // 15秒
        color: '#DC143C',
        icon: '🚀',
        spawnChance: 0.05,
        effects: {
            homingSpeed: 150,
            homingRange: 300,
            homingDamage: 80
        }
    },
    
    [PowerUpType.FREEZE_ENEMIES]: {
        name: '冰冻敌人',
        description: '冻结附近所有敌人',
        rarity: PowerUpRarity.RARE,
        duration: 0, // 瞬间效果
        color: '#87CEEB',
        icon: '❄️',
        spawnChance: 0.06,
        effects: {
            freezeRadius: 200,
            freezeDuration: 5000,
            slowEffect: 0.2
        }
    },
    
    [PowerUpType.HEALTH_RESTORE]: {
        name: '生命恢复',
        description: '恢复生命值',
        rarity: PowerUpRarity.COMMON,
        duration: 0, // 瞬间效果
        color: '#FF69B4',
        icon: '❤️',
        spawnChance: 0.16,
        effects: {
            healAmount: 50,
            maxHealthBonus: 25
        }
    },
    
    [PowerUpType.EXTRA_LIFE]: {
        name: '额外生命',
        description: '获得一条额外生命',
        rarity: PowerUpRarity.LEGENDARY,
        duration: 0, // 永久
        color: '#FFD700',
        icon: '👑',
        spawnChance: 0.01,
        effects: {
            extraLives: 1
        }
    },
    
    [PowerUpType.RADAR]: {
        name: '雷达系统',
        description: '显示所有敌人位置',
        rarity: PowerUpRarity.UNCOMMON,
        duration: 30000, // 30秒
        color: '#00FF00',
        icon: '📡',
        spawnChance: 0.09,
        effects: {
            radarRange: 500,
            showEnemies: true,
            showPowerUps: true
        }
    },
    
    [PowerUpType.STEALTH]: {
        name: '隐身模式',
        description: '敌人无法发现你',
        rarity: PowerUpRarity.EPIC,
        duration: 12000, // 12秒
        color: '#696969',
        icon: '👻',
        spawnChance: 0.04,
        effects: {
            invisible: true,
            transparency: 0.3,
            noiseReduction: 0.8
        }
    },
    
    [PowerUpType.REPAIR_KIT]: {
        name: '修理包',
        description: '持续恢复生命值',
        rarity: PowerUpRarity.UNCOMMON,
        duration: 20000, // 20秒
        color: '#32CD32',
        icon: '🔧',
        spawnChance: 0.11,
        effects: {
            healPerSecond: 3,
            repairArmor: true
        }
    }
};

// 道具组件
class PowerUp extends Component {
    constructor(type, x, y) {
        super();
        this.type = type;
        this.config = PowerUpConfig[type];
        this.x = x;
        this.y = y;
        this.collected = false;
        this.spawnTime = Date.now();
        this.lifetime = 30000; // 30秒后消失
        
        // 视觉效果
        this.pulsePhase = 0;
        this.rotationSpeed = 2;
        this.bobSpeed = 3;
        this.bobAmplitude = 5;
    }

    update(deltaTime) {
        this.pulsePhase += deltaTime * 0.003;
        
        // 检查是否过期
        if (Date.now() - this.spawnTime > this.lifetime) {
            this.shouldDestroy = true;
        }
    }

    getPulseScale() {
        return 1 + Math.sin(this.pulsePhase) * 0.2;
    }

    getBobOffset() {
        return Math.sin(this.pulsePhase * this.bobSpeed) * this.bobAmplitude;
    }

    getRotation() {
        return (Date.now() - this.spawnTime) * 0.001 * this.rotationSpeed;
    }
}

// 道具效果组件
class PowerUpEffect extends Component {
    constructor(type, duration = 0) {
        super();
        this.type = type;
        this.config = PowerUpConfig[type];
        this.duration = duration || this.config.duration;
        this.startTime = Date.now();
        this.active = true;
        this.stacks = 1; // 叠加层数
        
        // 效果数据
        this.effects = { ...this.config.effects };
    }

    update(deltaTime) {
        if (this.duration > 0) {
            const elapsed = Date.now() - this.startTime;
            if (elapsed >= this.duration) {
                this.active = false;
                this.shouldDestroy = true;
            }
        }
    }

    getRemainingTime() {
        if (this.duration === 0) return Infinity;
        return Math.max(0, this.duration - (Date.now() - this.startTime));
    }

    getProgress() {
        if (this.duration === 0) return 1;
        return Math.min(1, (Date.now() - this.startTime) / this.duration);
    }

    // 叠加效果
    stack(amount = 1) {
        this.stacks += amount;
        this.startTime = Date.now(); // 重置时间
        
        // 某些效果可以叠加
        if (this.type === PowerUpType.WEAPON_UPGRADE) {
            this.effects.damageMultiplier = 1 + (this.stacks * 0.5);
        } else if (this.type === PowerUpType.ARMOR_UPGRADE) {
            this.effects.armorMultiplier = 1 + (this.stacks * 0.3);
        }
    }
}

// 道具管理器
class PowerUpManager {
    constructor(entityManager, gameMap) {
        this.entityManager = entityManager;
        this.gameMap = gameMap;
        this.activePowerUps = new Map(); // 场景中的道具
        this.playerEffects = new Map(); // 玩家身上的效果
        
        // 生成设置
        this.spawnTimer = 0;
        this.spawnInterval = 8000; // 8秒生成一个道具
        this.maxPowerUps = 5; // 场景中最多5个道具
        
        // 统计数据
        this.stats = {
            totalSpawned: 0,
            totalCollected: 0,
            collectionsByType: new Map()
        };
    }

    update(deltaTime) {
        this.spawnTimer += deltaTime;
        
        // 生成新道具
        if (this.spawnTimer >= this.spawnInterval && 
            this.activePowerUps.size < this.maxPowerUps) {
            this.spawnRandomPowerUp();
            this.spawnTimer = 0;
        }
        
        // 更新道具
        this.updatePowerUps(deltaTime);
        
        // 更新玩家效果
        this.updatePlayerEffects(deltaTime);
        
        // 检查道具收集
        this.checkPowerUpCollection();
    }

    spawnRandomPowerUp() {
        if (!this.gameMap) return;
        
        // 选择道具类型（基于稀有度权重）
        const powerUpType = this.selectRandomPowerUpType();
        
        // 寻找合适的生成位置
        const position = this.findSpawnPosition();
        if (!position) return;
        
        this.spawnPowerUp(powerUpType, position.x, position.y);
    }

    selectRandomPowerUpType() {
        const types = Object.keys(PowerUpConfig);
        const weights = [];
        let totalWeight = 0;
        
        // 计算权重
        for (const type of types) {
            const config = PowerUpConfig[type];
            let weight = config.spawnChance;
            
            // 根据稀有度调整权重
            switch (config.rarity) {
                case PowerUpRarity.COMMON:
                    weight *= 1.0;
                    break;
                case PowerUpRarity.UNCOMMON:
                    weight *= 0.7;
                    break;
                case PowerUpRarity.RARE:
                    weight *= 0.4;
                    break;
                case PowerUpRarity.EPIC:
                    weight *= 0.2;
                    break;
                case PowerUpRarity.LEGENDARY:
                    weight *= 0.1;
                    break;
            }
            
            weights.push(weight);
            totalWeight += weight;
        }
        
        // 随机选择
        let random = Math.random() * totalWeight;
        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return types[i];
            }
        }
        
        return types[0]; // 默认返回第一个
    }

    findSpawnPosition() {
        const attempts = 20;
        
        for (let i = 0; i < attempts; i++) {
            const x = Math.random() * this.gameMap.pixelWidth;
            const y = Math.random() * this.gameMap.pixelHeight;
            
            // 检查位置是否可用
            if (this.gameMap.isPassable(x, y) && 
                !this.isPositionOccupied(x, y)) {
                return { x, y };
            }
        }
        
        return null;
    }

    isPositionOccupied(x, y, radius = 50) {
        // 检查是否与其他道具太近
        for (const [id, powerUp] of this.activePowerUps) {
            const distance = Math.sqrt((x - powerUp.x) ** 2 + (y - powerUp.y) ** 2);
            if (distance < radius) {
                return true;
            }
        }
        
        // 检查是否与坦克太近
        const tanks = this.entityManager.getEntitiesByTag('player')
            .concat(this.entityManager.getEntitiesByTag('enemy'));
        
        for (const tank of tanks) {
            const transform = tank.getComponent('Transform');
            if (transform) {
                const distance = Math.sqrt((x - transform.x) ** 2 + (y - transform.y) ** 2);
                if (distance < radius) {
                    return true;
                }
            }
        }
        
        return false;
    }

    spawnPowerUp(type, x, y) {
        const entity = this.entityManager.createEntity();
        entity.addTag('powerup');
        
        // 添加组件
        entity.addComponent(new Transform(x, y, 0));
        entity.addComponent(new PowerUp(type, x, y));
        entity.addComponent(new Collider(24, 24, 'powerup'));
        
        // 添加渲染组件
        const config = PowerUpConfig[type];
        const renderer = new Renderer(config.color, 24, 24);
        renderer.shape = 'powerup';
        renderer.icon = config.icon;
        entity.addComponent(renderer);
        
        this.activePowerUps.set(entity.id, entity);
        this.stats.totalSpawned++;
        
        console.log(`✨ 生成道具: ${config.name} at (${x}, ${y})`);
    }

    updatePowerUps(deltaTime) {
        const toRemove = [];
        
        for (const [id, entity] of this.activePowerUps) {
            const powerUp = entity.getComponent('PowerUp');
            if (powerUp) {
                powerUp.update(deltaTime);
                
                if (powerUp.shouldDestroy) {
                    toRemove.push(id);
                }
            }
        }
        
        // 移除过期的道具
        for (const id of toRemove) {
            const entity = this.activePowerUps.get(id);
            if (entity) {
                this.entityManager.removeEntity(entity);
                this.activePowerUps.delete(id);
            }
        }
    }

    updatePlayerEffects(deltaTime) {
        const toRemove = [];
        
        for (const [type, effect] of this.playerEffects) {
            effect.update(deltaTime);
            
            if (!effect.active) {
                toRemove.push(type);
            }
        }
        
        // 移除过期的效果
        for (const type of toRemove) {
            this.removePlayerEffect(type);
        }
    }

    checkPowerUpCollection() {
        const players = this.entityManager.getEntitiesByTag('player');
        
        for (const player of players) {
            const playerTransform = player.getComponent('Transform');
            const playerCollider = player.getComponent('Collider');
            
            if (!playerTransform || !playerCollider) continue;
            
            for (const [id, powerUpEntity] of this.activePowerUps) {
                const powerUpTransform = powerUpEntity.getComponent('Transform');
                const powerUpCollider = powerUpEntity.getComponent('Collider');
                const powerUp = powerUpEntity.getComponent('PowerUp');
                
                if (!powerUpTransform || !powerUpCollider || !powerUp) continue;
                
                // 检查碰撞
                if (this.checkCollision(playerTransform, playerCollider, 
                                     powerUpTransform, powerUpCollider)) {
                    this.collectPowerUp(player, powerUp);
                    
                    // 移除道具
                    this.entityManager.removeEntity(powerUpEntity);
                    this.activePowerUps.delete(id);
                    break;
                }
            }
        }
    }

    checkCollision(transform1, collider1, transform2, collider2) {
        const dx = transform1.x - transform2.x;
        const dy = transform1.y - transform2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const minDistance = (collider1.width + collider2.width) / 2;
        return distance < minDistance;
    }

    collectPowerUp(player, powerUp) {
        const config = powerUp.config;
        
        console.log(`🎁 收集道具: ${config.name}`);
        
        // 播放收集音效
        if (typeof window !== 'undefined' && window.game && window.game.audioManager) {
            const transform = player.getComponent('Transform');
            window.game.audioManager.playSFX('powerup_collect', {
                position: transform ? { x: transform.x, y: transform.y } : null
            });
        }
        
        // 应用效果
        this.applyPowerUpEffect(player, powerUp.type);
        
        // 更新统计
        this.stats.totalCollected++;
        const typeCount = this.stats.collectionsByType.get(powerUp.type) || 0;
        this.stats.collectionsByType.set(powerUp.type, typeCount + 1);
        
        // 触发收集事件
        this.onPowerUpCollected(player, powerUp);
    }

    applyPowerUpEffect(player, type) {
        const config = PowerUpConfig[type];
        
        // 检查是否已有相同效果
        if (this.playerEffects.has(type)) {
            const existingEffect = this.playerEffects.get(type);
            
            // 某些效果可以叠加
            if (this.canStack(type)) {
                existingEffect.stack();
                console.log(`📈 道具效果叠加: ${config.name} (${existingEffect.stacks}层)`);
            } else {
                // 重置持续时间
                existingEffect.startTime = Date.now();
                console.log(`🔄 道具效果重置: ${config.name}`);
            }
        } else {
            // 添加新效果
            const effect = new PowerUpEffect(type);
            this.playerEffects.set(type, effect);
            player.addComponent(effect);
            
            console.log(`✅ 应用道具效果: ${config.name}`);
        }
        
        // 立即效果
        this.applyImmediateEffect(player, type);
    }

    applyImmediateEffect(player, type) {
        const config = PowerUpConfig[type];
        const effects = config.effects;
        
        switch (type) {
            case PowerUpType.HEALTH_RESTORE:
                const health = player.getComponent('Health');
                if (health) {
                    health.heal(effects.healAmount);
                    if (effects.maxHealthBonus) {
                        health.max += effects.maxHealthBonus;
                    }
                }
                break;
                
            case PowerUpType.EXTRA_LIFE:
                // 这里需要与游戏管理器交互
                // 暂时记录在玩家组件中
                let livesComponent = player.getComponent('ExtraLives');
                if (!livesComponent) {
                    livesComponent = new Component();
                    livesComponent.lives = 0;
                    player.addComponent(livesComponent);
                }
                livesComponent.lives += effects.extraLives;
                break;
                
            case PowerUpType.FREEZE_ENEMIES:
                this.freezeNearbyEnemies(player, effects);
                break;
                
            case PowerUpType.TELEPORT:
                // 标记玩家可以使用瞬移
                let teleportComponent = player.getComponent('TeleportAbility');
                if (!teleportComponent) {
                    teleportComponent = new Component();
                    teleportComponent.uses = 0;
                    teleportComponent.range = effects.teleportRange;
                    player.addComponent(teleportComponent);
                }
                teleportComponent.uses += effects.uses;
                break;
        }
    }

    freezeNearbyEnemies(player, effects) {
        const playerTransform = player.getComponent('Transform');
        if (!playerTransform) return;
        
        const enemies = this.entityManager.getEntitiesByTag('enemy');
        
        for (const enemy of enemies) {
            const enemyTransform = enemy.getComponent('Transform');
            if (!enemyTransform) continue;
            
            const distance = Math.sqrt(
                (playerTransform.x - enemyTransform.x) ** 2 + 
                (playerTransform.y - enemyTransform.y) ** 2
            );
            
            if (distance <= effects.freezeRadius) {
                // 添加冰冻效果
                const freezeEffect = new Component();
                freezeEffect.duration = effects.freezeDuration;
                freezeEffect.slowMultiplier = effects.slowEffect;
                freezeEffect.startTime = Date.now();
                
                enemy.addComponent(freezeEffect);
                console.log('🧊 敌人被冰冻');
            }
        }
    }

    canStack(type) {
        return type === PowerUpType.WEAPON_UPGRADE || 
               type === PowerUpType.ARMOR_UPGRADE ||
               type === PowerUpType.SPEED_BOOST;
    }

    removePlayerEffect(type) {
        const effect = this.playerEffects.get(type);
        if (effect) {
            console.log(`⏰ 道具效果结束: ${PowerUpConfig[type].name}`);
            this.playerEffects.delete(type);
        }
    }

    onPowerUpCollected(player, powerUp) {
        // 可以在这里添加音效、粒子效果等
        // 触发自定义事件
        const event = new CustomEvent('powerUpCollected', {
            detail: {
                player: player,
                powerUp: powerUp,
                type: powerUp.type
            }
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
        }
    }

    // 获取玩家当前效果
    getPlayerEffects() {
        return Array.from(this.playerEffects.entries()).map(([type, effect]) => ({
            type: type,
            name: PowerUpConfig[type].name,
            remainingTime: effect.getRemainingTime(),
            progress: effect.getProgress(),
            stacks: effect.stacks,
            config: PowerUpConfig[type]
        }));
    }

    // 获取统计信息
    getStats() {
        return {
            ...this.stats,
            activePowerUps: this.activePowerUps.size,
            activeEffects: this.playerEffects.size
        };
    }

    // 清除所有道具和效果
    clear() {
        // 移除所有道具
        for (const [id, entity] of this.activePowerUps) {
            this.entityManager.removeEntity(entity);
        }
        this.activePowerUps.clear();
        
        // 清除所有效果
        this.playerEffects.clear();
        
        // 重置统计
        this.stats = {
            totalSpawned: 0,
            totalCollected: 0,
            collectionsByType: new Map()
        };
    }

    // 强制生成指定道具（用于测试）
    forceSpawnPowerUp(type, x, y) {
        if (PowerUpConfig[type]) {
            this.spawnPowerUp(type, x, y);
        }
    }

    // 给玩家直接添加效果（用于测试）
    givePlayerEffect(player, type) {
        this.applyPowerUpEffect(player, type);
    }
}

// 武器升级系统
class WeaponUpgradeSystem {
    constructor() {
        this.upgradeLevels = new Map();
        this.maxLevel = 5;
    }

    upgradeWeapon(entity, upgradeType = 'damage') {
        const weapon = entity.getComponent('Weapon');
        if (!weapon) return false;
        
        const currentLevel = this.upgradeLevels.get(entity.id) || 0;
        if (currentLevel >= this.maxLevel) return false;
        
        const newLevel = currentLevel + 1;
        this.upgradeLevels.set(entity.id, newLevel);
        
        // 应用升级
        switch (upgradeType) {
            case 'damage':
                weapon.damage *= 1.3;
                break;
            case 'fireRate':
                weapon.fireRate *= 0.8; // 降低冷却时间
                break;
            case 'range':
                weapon.range *= 1.2;
                break;
            case 'penetration':
                weapon.penetration = (weapon.penetration || 0) + 1;
                break;
        }
        
        console.log(`🔧 武器升级 ${upgradeType} 到等级 ${newLevel}`);
        return true;
    }

    getWeaponLevel(entity) {
        return this.upgradeLevels.get(entity.id) || 0;
    }

    resetWeaponLevel(entity) {
        this.upgradeLevels.delete(entity.id);
    }
}

// 导出道具系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PowerUpType,
        PowerUpRarity,
        PowerUpConfig,
        PowerUp,
        PowerUpEffect,
        PowerUpManager,
        WeaponUpgradeSystem
    };
} else {
    // 浏览器环境
    window.PowerUpSystem = {
        PowerUpType,
        PowerUpRarity,
        PowerUpConfig,
        PowerUp,
        PowerUpEffect,
        PowerUpManager,
        WeaponUpgradeSystem
    };
}