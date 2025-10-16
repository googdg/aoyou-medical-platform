/**
 * 坦克系统 (Tank System)
 * 坦克大战游戏的坦克实体和控制逻辑
 */

// 坦克类型枚举
const TankType = {
    PLAYER: 'player',
    ENEMY_BASIC: 'enemy_basic',
    ENEMY_FAST: 'enemy_fast',
    ENEMY_HEAVY: 'enemy_heavy',
    ENEMY_SPECIAL: 'enemy_special'
};

// 坦克方向枚举
const TankDirection = {
    UP: 0,
    RIGHT: 90,
    DOWN: 180,
    LEFT: 270
};

// 坦克配置
const TankConfig = {
    [TankType.PLAYER]: {
        name: '玩家坦克',
        color: '#4CAF50',
        speed: 120,
        health: 1,
        fireRate: 400,
        bulletSpeed: 300,
        bulletDamage: 1,
        size: 30,
        armor: 0
    },
    [TankType.ENEMY_BASIC]: {
        name: '基础敌坦克',
        color: '#FF5722',
        speed: 80,
        health: 1,
        fireRate: 800,
        bulletSpeed: 250,
        bulletDamage: 1,
        size: 30,
        armor: 0
    },
    [TankType.ENEMY_FAST]: {
        name: '快速敌坦克',
        color: '#E91E63',
        speed: 150,
        health: 1,
        fireRate: 600,
        bulletSpeed: 350,
        bulletDamage: 1,
        size: 28,
        armor: 0
    },
    [TankType.ENEMY_HEAVY]: {
        name: '重型敌坦克',
        color: '#795548',
        speed: 60,
        health: 3,
        fireRate: 1000,
        bulletSpeed: 200,
        bulletDamage: 2,
        size: 34,
        armor: 1
    },
    [TankType.ENEMY_SPECIAL]: {
        name: '特殊敌坦克',
        color: '#9C27B0',
        speed: 100,
        health: 2,
        fireRate: 500,
        bulletSpeed: 300,
        bulletDamage: 1,
        size: 32,
        armor: 0
    }
};

// 坦克控制器组件
class TankController extends ECS.Component {
    constructor(tankType = TankType.PLAYER, playerId = 1) {
        super();
        this.tankType = tankType;
        this.playerId = playerId;
        this.config = TankConfig[tankType];
        
        // 控制状态
        this.inputEnabled = true;
        this.moveDirection = null;
        this.wantToFire = false;
        
        // 移动状态
        this.isMoving = false;
        this.targetDirection = TankDirection.UP;
        this.currentDirection = TankDirection.UP;
        this.turnSpeed = 360; // 度/秒
        
        // 动画状态
        this.animationTime = 0;
        this.trackOffset = 0;
        
        // 控制键映射
        this.controls = this.getControlMapping(playerId);
    }

    // 获取控制键映射
    getControlMapping(playerId) {
        if (playerId === 1) {
            return {
                up: 'KeyW',
                down: 'KeyS',
                left: 'KeyA',
                right: 'KeyD',
                fire: 'Space'
            };
        } else if (playerId === 2) {
            return {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                fire: 'Enter'
            };
        }
        return null;
    }

    init() {
        // 初始化坦克组件
        const transform = this.entity.getComponent('Transform');
        const movement = this.entity.getComponent('Movement');
        const health = this.entity.getComponent('Health');
        const weapon = this.entity.getComponent('Weapon');
        const renderer = this.entity.getComponent('Renderer');

        if (transform) {
            transform.setRotationDegrees(this.currentDirection);
        }

        if (movement) {
            movement.speed = this.config.speed;
        }

        if (health) {
            health.maxHealth = this.config.health;
            health.currentHealth = this.config.health;
        }

        if (weapon) {
            weapon.fireRate = this.config.fireRate;
            weapon.damage = this.config.bulletDamage;
            weapon.bulletSpeed = this.config.bulletSpeed;
        }

        if (renderer) {
            renderer.color = this.config.color;
            renderer.width = this.config.size;
            renderer.height = this.config.size;
        }
    }

    update(deltaTime) {
        if (!this.inputEnabled) return;

        // 处理输入
        this.handleInput();
        
        // 更新转向
        this.updateRotation(deltaTime);
        
        // 更新移动
        this.updateMovement(deltaTime);
        
        // 更新动画
        this.updateAnimation(deltaTime);
        
        // 处理射击
        this.handleFiring();
    }

    // 处理输入
    handleInput() {
        // 检查是否有AI控制器
        const aiController = this.entity.getComponent('AIController');
        if (aiController) {
            // AI控制，不处理键盘输入
            return;
        }
        
        if (!this.controls) return;

        const inputManager = window.game?.inputManager;
        if (!inputManager) return;

        // 重置移动方向
        this.moveDirection = null;
        this.wantToFire = false;

        // 检查移动输入
        if (inputManager.isKeyDown(this.controls.up)) {
            this.moveDirection = TankDirection.UP;
        } else if (inputManager.isKeyDown(this.controls.down)) {
            this.moveDirection = TankDirection.DOWN;
        } else if (inputManager.isKeyDown(this.controls.left)) {
            this.moveDirection = TankDirection.LEFT;
        } else if (inputManager.isKeyDown(this.controls.right)) {
            this.moveDirection = TankDirection.RIGHT;
        }

        // 检查射击输入
        if (inputManager.isKeyPressed(this.controls.fire)) {
            this.wantToFire = true;
        }
    }

    // 更新转向
    updateRotation(deltaTime) {
        if (this.moveDirection !== null) {
            this.targetDirection = this.moveDirection;
        }

        // 计算角度差
        let angleDiff = this.targetDirection - this.currentDirection;
        
        // 处理角度环绕
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;

        // 如果需要转向
        if (Math.abs(angleDiff) > 1) {
            const turnAmount = this.turnSpeed * deltaTime / 1000;
            const turnDirection = angleDiff > 0 ? 1 : -1;
            
            this.currentDirection += turnDirection * Math.min(turnAmount, Math.abs(angleDiff));
            
            // 保持角度在0-360范围内
            if (this.currentDirection < 0) this.currentDirection += 360;
            if (this.currentDirection >= 360) this.currentDirection -= 360;
            
            // 更新Transform组件
            const transform = this.entity.getComponent('Transform');
            if (transform) {
                transform.setRotationDegrees(this.currentDirection);
            }
        }
    }

    // 更新移动
    updateMovement(deltaTime) {
        const movement = this.entity.getComponent('Movement');
        const transform = this.entity.getComponent('Transform');
        
        if (!movement || !transform) return;

        // 检查是否可以移动（角度对齐）
        const angleDiff = Math.abs(this.targetDirection - this.currentDirection);
        const canMove = this.moveDirection !== null && 
                       (angleDiff < 5 || angleDiff > 355);

        if (canMove) {
            // 检查地图碰撞
            const gameMap = window.game?.currentMap;
            if (gameMap) {
                const forward = transform.getForward();
                const speed = movement.speed * deltaTime / 1000;
                const newX = transform.x + forward.x * speed;
                const newY = transform.y + forward.y * speed;
                
                if (gameMap.isRectPassable(newX, newY, this.config.size, this.config.size)) {
                    movement.moveForward();
                    
                    // 播放移动音效
                    if (!this.isMoving && window.game?.audioManager) {
                        const audioManager = window.game.audioManager;
                        audioManager.playSFX('tank_move', {
                            position: { x: transform.x, y: transform.y },
                            loop: true
                        });
                    }
                    
                    this.isMoving = true;
                } else {
                    movement.stop();
                    
                    // 停止移动音效
                    if (this.isMoving && window.game?.audioManager) {
                        window.game.audioManager.stopSFX('tank_move');
                    }
                    
                    this.isMoving = false;
                }
            } else {
                movement.moveForward();
                this.isMoving = true;
            }
        } else {
            movement.stop();
            this.isMoving = false;
        }
    }

    // 更新动画
    updateAnimation(deltaTime) {
        this.animationTime += deltaTime;
        
        if (this.isMoving) {
            // 履带动画
            this.trackOffset += deltaTime * 0.01;
            if (this.trackOffset > 1) this.trackOffset -= 1;
        }
    }

    // 处理射击
    handleFiring() {
        if (!this.wantToFire) return;

        const weapon = this.entity.getComponent('Weapon');
        if (!weapon) return;

        if (weapon.tryFire()) {
            const bulletData = weapon.createBulletData();
            if (bulletData && window.game) {
                // 创建子弹
                window.game.createBullet(bulletData);
                
                // 播放射击音效
                if (window.game.audioManager) {
                    const transform = this.entity.getComponent('Transform');
                    window.game.audioManager.playSFX('tank_fire', {
                        position: transform ? { x: transform.x, y: transform.y } : null
                    });
                }
            }
        }
    }

    // 设置输入启用状态
    setInputEnabled(enabled) {
        this.inputEnabled = enabled;
        if (!enabled) {
            this.moveDirection = null;
            this.wantToFire = false;
            this.isMoving = false;
        }
    }

    // 获取坦克状态
    getStatus() {
        return {
            type: this.tankType,
            direction: this.currentDirection,
            isMoving: this.isMoving,
            health: this.entity.getComponent('Health')?.currentHealth || 0,
            canFire: this.entity.getComponent('Weapon')?.canFireNow() || false
        };
    }
}

// 坦克渲染器组件
class TankRenderer extends ECS.Renderer {
    constructor(tankType = TankType.PLAYER) {
        const config = TankConfig[tankType];
        super(null, config.size, config.size, config.color);
        
        this.tankType = tankType;
        this.config = config;
        this.showDamageEffect = false;
        this.damageEffectTime = 0;
        this.muzzleFlashTime = 0;
    }

    render(ctx) {
        if (!this.visible || this.alpha <= 0) return;
        
        const transform = this.entity.getComponent('Transform');
        const controller = this.entity.getComponent('TankController');
        const health = this.entity.getComponent('Health');
        
        if (!transform) return;

        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = this.alpha;
        
        // 变换矩阵
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.rotation);

        // 绘制坦克
        this.renderTankBody(ctx, controller);
        this.renderTankTurret(ctx, controller);
        this.renderTankTracks(ctx, controller);
        
        // 绘制炮口闪光
        if (this.muzzleFlashTime > 0) {
            this.renderMuzzleFlash(ctx);
            this.muzzleFlashTime -= 16; // 假设16ms帧时间
        }

        ctx.restore();

        // 绘制UI元素（不受旋转影响）
        this.renderHealthBar(ctx, transform, health);
        this.renderDamageEffect(ctx, transform);
    }

    // 渲染坦克车体
    renderTankBody(ctx, controller) {
        const size = this.width;
        const halfSize = size / 2;
        
        // 车体主体
        ctx.fillStyle = this.config.color;
        ctx.fillRect(-halfSize, -halfSize, size, size);
        
        // 车体边框
        ctx.strokeStyle = this.darkenColor(this.config.color, 0.3);
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfSize, -halfSize, size, size);
        
        // 车体细节
        ctx.fillStyle = this.darkenColor(this.config.color, 0.2);
        ctx.fillRect(-halfSize + 4, -halfSize + 4, size - 8, size - 8);
    }

    // 渲染坦克炮塔
    renderTankTurret(ctx, controller) {
        const turretSize = this.width * 0.6;
        const halfTurret = turretSize / 2;
        
        // 炮塔主体
        ctx.fillStyle = this.lightenColor(this.config.color, 0.1);
        ctx.beginPath();
        ctx.arc(0, 0, halfTurret, 0, Math.PI * 2);
        ctx.fill();
        
        // 炮塔边框
        ctx.strokeStyle = this.darkenColor(this.config.color, 0.4);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 炮管
        const barrelLength = this.width * 0.8;
        const barrelWidth = 4;
        
        ctx.fillStyle = this.darkenColor(this.config.color, 0.5);
        ctx.fillRect(-barrelWidth / 2, -barrelLength, barrelWidth, barrelLength);
        
        // 炮管末端
        ctx.beginPath();
        ctx.arc(0, -barrelLength, barrelWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 渲染坦克履带
    renderTankTracks(ctx, controller) {
        const size = this.width;
        const halfSize = size / 2;
        const trackWidth = 6;
        const trackOffset = controller?.trackOffset || 0;
        
        ctx.fillStyle = this.darkenColor(this.config.color, 0.6);
        
        // 左履带
        ctx.fillRect(-halfSize - trackWidth, -halfSize, trackWidth, size);
        // 右履带
        ctx.fillRect(halfSize, -halfSize, trackWidth, size);
        
        // 履带纹理
        if (controller?.isMoving) {
            ctx.fillStyle = this.darkenColor(this.config.color, 0.8);
            const segmentHeight = 8;
            const segments = Math.ceil(size / segmentHeight) + 1;
            
            for (let i = 0; i < segments; i++) {
                const y = -halfSize + (i * segmentHeight) + (trackOffset * segmentHeight);
                if (y > -halfSize && y < halfSize) {
                    // 左履带纹理
                    ctx.fillRect(-halfSize - trackWidth, y, trackWidth, 2);
                    // 右履带纹理
                    ctx.fillRect(halfSize, y, trackWidth, 2);
                }
            }
        }
    }

    // 渲染炮口闪光
    renderMuzzleFlash(ctx) {
        const flashSize = 20;
        const barrelLength = this.width * 0.8;
        
        ctx.fillStyle = '#FFFF00';
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.arc(0, -barrelLength - 5, flashSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.arc(0, -barrelLength - 5, flashSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }

    // 渲染生命值条
    renderHealthBar(ctx, transform, health) {
        if (!health || health.currentHealth >= health.maxHealth) return;
        
        const barWidth = this.width + 10;
        const barHeight = 4;
        const barY = transform.y - this.height / 2 - 10;
        
        // 背景
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(transform.x - barWidth / 2, barY, barWidth, barHeight);
        
        // 生命值
        const healthPercent = health.currentHealth / health.maxHealth;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(transform.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        
        // 边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(transform.x - barWidth / 2, barY, barWidth, barHeight);
    }

    // 渲染伤害效果
    renderDamageEffect(ctx, transform) {
        if (!this.showDamageEffect) return;
        
        ctx.fillStyle = `rgba(255, 0, 0, ${0.5 * (this.damageEffectTime / 500)})`;
        ctx.fillRect(
            transform.x - this.width / 2 - 5,
            transform.y - this.height / 2 - 5,
            this.width + 10,
            this.height + 10
        );
        
        this.damageEffectTime -= 16;
        if (this.damageEffectTime <= 0) {
            this.showDamageEffect = false;
        }
    }

    // 显示炮口闪光
    showMuzzleFlash() {
        this.muzzleFlashTime = 100; // 100ms
    }

    // 显示伤害效果
    showDamageEffect() {
        this.showDamageEffect = true;
        this.damageEffectTime = 500; // 500ms
    }

    // 颜色变暗
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${r}, ${g}, ${b})`;
    }

    // 颜色变亮
    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * (1 + factor)));
        const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * (1 + factor)));
        const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * (1 + factor)));
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// 坦克工厂类
class TankFactory {
    static createPlayerTank(x, y, playerId = 1) {
        const tank = new ECS.Entity(`Player${playerId}Tank`);
        
        // 添加基础组件
        tank.addComponent(new ECS.Transform(x, y, 0));
        tank.addComponent(new ECS.Collider(30, 30));
        tank.addComponent(new ECS.Movement(120));
        tank.addComponent(new ECS.Health(1));
        tank.addComponent(new ECS.Weapon(400, 1, 400));
        
        // 添加坦克专用组件
        tank.addComponent(new TankController(TankType.PLAYER, playerId));
        tank.addComponent(new TankRenderer(TankType.PLAYER));
        
        // 设置标签
        tank.addTag('tank');
        tank.addTag('player');
        tank.addTag(`player${playerId}`);
        
        // 设置事件处理
        const health = tank.getComponent('Health');
        const renderer = tank.getComponent('TankRenderer');
        const weapon = tank.getComponent('Weapon');
        
        if (health && renderer) {
            health.onDamage = () => {
                renderer.showDamageEffect();
            };
            
            health.onDeath = () => {
                // 坦克死亡处理
                console.log('玩家坦克被摧毁');
                if (window.game) {
                    window.game.onPlayerTankDestroyed(tank);
                }
            };
        }
        
        if (weapon && renderer) {
            weapon.onFire = () => {
                renderer.showMuzzleFlash();
            };
        }
        
        return tank;
    }

    static createEnemyTank(x, y, tankType = TankType.ENEMY_BASIC) {
        const tank = new ECS.Entity(`EnemyTank_${Date.now()}`);
        const config = TankConfig[tankType];
        
        // 添加基础组件
        tank.addComponent(new ECS.Transform(x, y, 0));
        tank.addComponent(new ECS.Collider(config.size, config.size));
        tank.addComponent(new ECS.Movement(config.speed));
        tank.addComponent(new ECS.Health(config.health));
        tank.addComponent(new ECS.Weapon(config.fireRate, config.bulletDamage, 400));
        
        // 添加坦克专用组件
        tank.addComponent(new TankController(tankType, 0)); // 0表示AI控制
        tank.addComponent(new TankRenderer(tankType));
        
        // 设置标签
        tank.addTag('tank');
        tank.addTag('enemy');
        tank.addTag(tankType);
        
        // 设置事件处理
        const health = tank.getComponent('Health');
        const renderer = tank.getComponent('TankRenderer');
        const weapon = tank.getComponent('Weapon');
        
        if (health && renderer) {
            health.onDamage = () => {
                renderer.showDamageEffect();
            };
            
            health.onDeath = () => {
                // 敌方坦克死亡处理
                console.log('敌方坦克被摧毁');
                if (window.game) {
                    window.game.onEnemyTankDestroyed(tank);
                }
            };
        }
        
        if (weapon && renderer) {
            weapon.onFire = () => {
                renderer.showMuzzleFlash();
            };
        }
        
        return tank;
    }
}

// 坦克管理器
class TankManager {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.playerTanks = [];
        this.enemyTanks = [];
    }

    // 创建玩家坦克
    createPlayerTank(x, y, playerId = 1) {
        const tank = TankFactory.createPlayerTank(x, y, playerId);
        this.entityManager.addEntity(tank);
        this.playerTanks.push(tank);
        return tank;
    }

    // 创建敌方坦克
    createEnemyTank(x, y, tankType = TankType.ENEMY_BASIC) {
        const tank = TankFactory.createEnemyTank(x, y, tankType);
        this.entityManager.addEntity(tank);
        this.enemyTanks.push(tank);
        return tank;
    }

    // 移除坦克
    removeTank(tank) {
        this.entityManager.removeEntity(tank);
        
        const playerIndex = this.playerTanks.indexOf(tank);
        if (playerIndex > -1) {
            this.playerTanks.splice(playerIndex, 1);
        }
        
        const enemyIndex = this.enemyTanks.indexOf(tank);
        if (enemyIndex > -1) {
            this.enemyTanks.splice(enemyIndex, 1);
        }
    }

    // 获取存活的玩家坦克
    getAlivePlayers() {
        return this.playerTanks.filter(tank => {
            const health = tank.getComponent('Health');
            return health && health.isAlive();
        });
    }

    // 获取存活的敌方坦克
    getAliveEnemies() {
        return this.enemyTanks.filter(tank => {
            const health = tank.getComponent('Health');
            return health && health.isAlive();
        });
    }

    // 清除所有坦克
    clearAll() {
        [...this.playerTanks, ...this.enemyTanks].forEach(tank => {
            this.entityManager.removeEntity(tank);
        });
        this.playerTanks = [];
        this.enemyTanks = [];
    }

    // 获取统计信息
    getStats() {
        return {
            totalPlayers: this.playerTanks.length,
            alivePlayers: this.getAlivePlayers().length,
            totalEnemies: this.enemyTanks.length,
            aliveEnemies: this.getAliveEnemies().length
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        TankType,
        TankDirection,
        TankConfig,
        TankController,
        TankRenderer,
        TankFactory,
        TankManager
    };
} else {
    // 浏览器环境
    window.TankSystem = {
        TankType,
        TankDirection,
        TankConfig,
        TankController,
        TankRenderer,
        TankFactory,
        TankManager
    };
}