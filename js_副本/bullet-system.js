/**
 * 子弹系统 (Bullet System)
 * 坦克大战游戏的子弹和射击机制
 */

// 子弹类型枚举
const BulletType = {
    NORMAL: 'normal',           // 普通子弹
    ARMOR_PIERCING: 'armor_piercing', // 穿甲弹
    EXPLOSIVE: 'explosive',     // 爆炸弹
    LASER: 'laser',            // 激光
    PLASMA: 'plasma'           // 等离子弹
};

// 子弹配置
const BulletConfig = {
    [BulletType.NORMAL]: {
        name: '普通子弹',
        color: '#FFD700',
        speed: 300,
        damage: 1,
        range: 400,
        size: 6,
        penetration: 0,
        explosive: false,
        trail: false
    },
    [BulletType.ARMOR_PIERCING]: {
        name: '穿甲弹',
        color: '#C0C0C0',
        speed: 400,
        damage: 2,
        range: 500,
        size: 4,
        penetration: 2,
        explosive: false,
        trail: true
    },
    [BulletType.EXPLOSIVE]: {
        name: '爆炸弹',
        color: '#FF4500',
        speed: 250,
        damage: 3,
        range: 300,
        size: 8,
        penetration: 0,
        explosive: true,
        explosionRadius: 50,
        trail: false
    },
    [BulletType.LASER]: {
        name: '激光',
        color: '#FF0000',
        speed: 600,
        damage: 2,
        range: 600,
        size: 3,
        penetration: 1,
        explosive: false,
        trail: true,
        instant: true
    },
    [BulletType.PLASMA]: {
        name: '等离子弹',
        color: '#00FFFF',
        speed: 350,
        damage: 4,
        range: 450,
        size: 10,
        penetration: 1,
        explosive: true,
        explosionRadius: 30,
        trail: true
    }
};

// 子弹组件
class Bullet extends ECS.Component {
    constructor(bulletType = BulletType.NORMAL, owner = null) {
        super();
        this.bulletType = bulletType;
        this.config = BulletConfig[bulletType];
        this.owner = owner;
        
        // 子弹状态
        this.damage = this.config.damage;
        this.range = this.config.range;
        this.travelDistance = 0;
        this.penetrationLeft = this.config.penetration;
        this.active = true;
        
        // 轨迹效果
        this.trail = [];
        this.maxTrailLength = 10;
        
        // 爆炸效果
        this.exploded = false;
        this.explosionTime = 0;
    }

    init() {
        // 设置渲染器
        const renderer = this.entity.getComponent('Renderer');
        if (renderer) {
            renderer.color = this.config.color;
            renderer.width = this.config.size;
            renderer.height = this.config.size;
            renderer.layer = 10; // 子弹在较高层级
        }

        // 设置碰撞器
        const collider = this.entity.getComponent('Collider');
        if (collider) {
            collider.width = this.config.size;
            collider.height = this.config.size;
        }

        // 设置移动组件
        const movement = this.entity.getComponent('Movement');
        if (movement) {
            movement.speed = this.config.speed;
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        const transform = this.entity.getComponent('Transform');
        const movement = this.entity.getComponent('Movement');
        
        if (!transform || !movement) return;

        // 更新轨迹
        if (this.config.trail) {
            this.updateTrail(transform);
        }

        // 更新行进距离
        const speed = Math.sqrt(movement.velocity.x * movement.velocity.x + movement.velocity.y * movement.velocity.y);
        this.travelDistance += speed * deltaTime / 1000;

        // 检查射程
        if (this.travelDistance >= this.range) {
            this.destroy();
            return;
        }

        // 检查边界
        if (this.isOutOfBounds(transform)) {
            this.destroy();
            return;
        }
    }

    // 更新轨迹
    updateTrail(transform) {
        this.trail.push({
            x: transform.x,
            y: transform.y,
            time: Date.now()
        });

        // 限制轨迹长度
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // 移除过期的轨迹点
        const now = Date.now();
        this.trail = this.trail.filter(point => now - point.time < 500);
    }

    // 检查是否超出边界
    isOutOfBounds(transform) {
        const game = window.game;
        if (!game || !game.canvas) return false;

        return transform.x < -50 || transform.x > game.canvas.width + 50 ||
               transform.y < -50 || transform.y > game.canvas.height + 50;
    }

    // 击中目标
    hit(target) {
        if (!this.active) return false;

        // 造成伤害
        const health = target.getComponent('Health');
        if (health) {
            health.takeDamage(this.damage);
        }

        // 处理穿透
        if (this.penetrationLeft > 0) {
            this.penetrationLeft--;
            this.damage = Math.max(1, Math.floor(this.damage * 0.7)); // 穿透后伤害衰减
            return false; // 不销毁子弹
        }

        // 处理爆炸
        if (this.config.explosive) {
            this.explode();
        }

        this.destroy();
        return true;
    }

    // 击中地图瓦片
    hitTile(tile, worldX, worldY) {
        if (!this.active) return false;

        // 处理穿透
        if (this.penetrationLeft > 0 && tile.isDestructible()) {
            // 穿甲弹可以穿透可破坏瓦片
            const game = window.game;
            if (game && game.currentMap) {
                game.currentMap.destroyTile(worldX, worldY);
            }
            
            this.penetrationLeft--;
            this.damage = Math.max(1, Math.floor(this.damage * 0.8));
            return false; // 继续飞行
        }

        // 普通子弹击中瓦片
        if (tile.isDestructible()) {
            const game = window.game;
            if (game && game.currentMap) {
                game.currentMap.destroyTile(worldX, worldY);
            }
        }

        // 处理爆炸
        if (this.config.explosive) {
            this.explode();
        }

        this.destroy();
        return true;
    }

    // 爆炸效果
    explode() {
        if (this.exploded) return;
        
        this.exploded = true;
        const transform = this.entity.getComponent('Transform');
        if (!transform) return;

        // 创建爆炸效果
        const game = window.game;
        if (game && game.createExplosion) {
            game.createExplosion(transform.x, transform.y, this.config.explosionRadius || 50);
        }

        // 对范围内的目标造成伤害
        this.explosionDamage(transform.x, transform.y);
    }

    // 爆炸伤害
    explosionDamage(x, y) {
        const game = window.game;
        if (!game || !game.entityManager) return;

        const radius = this.config.explosionRadius || 50;
        const tanks = game.entityManager.getEntitiesByTag('tank');

        for (const tank of tanks) {
            if (tank === this.owner) continue; // 不伤害发射者

            const tankTransform = tank.getComponent('Transform');
            if (!tankTransform) continue;

            const distance = Math.sqrt(
                Math.pow(tankTransform.x - x, 2) + 
                Math.pow(tankTransform.y - y, 2)
            );

            if (distance <= radius) {
                const health = tank.getComponent('Health');
                if (health) {
                    // 距离越近伤害越高
                    const damageRatio = 1 - (distance / radius);
                    const explosionDamage = Math.ceil(this.damage * damageRatio);
                    health.takeDamage(explosionDamage);
                }
            }
        }

        // 破坏范围内的瓦片
        if (game.currentMap) {
            const tileSize = game.currentMap.tileSize;
            const startX = Math.floor((x - radius) / tileSize);
            const endX = Math.floor((x + radius) / tileSize);
            const startY = Math.floor((y - radius) / tileSize);
            const endY = Math.floor((y + radius) / tileSize);

            for (let ty = startY; ty <= endY; ty++) {
                for (let tx = startX; tx <= endX; tx++) {
                    const tileWorldPos = game.currentMap.tileToWorld(tx, ty);
                    const tileDistance = Math.sqrt(
                        Math.pow(tileWorldPos.x - x, 2) + 
                        Math.pow(tileWorldPos.y - y, 2)
                    );

                    if (tileDistance <= radius) {
                        game.currentMap.destroyTile(tileWorldPos.x, tileWorldPos.y);
                    }
                }
            }
        }
    }

    // 销毁子弹
    destroy() {
        this.active = false;
        const game = window.game;
        if (game && game.entityManager) {
            game.entityManager.removeEntity(this.entity);
        }
    }
}

// 子弹渲染器
class BulletRenderer extends ECS.Renderer {
    constructor(bulletType = BulletType.NORMAL) {
        const config = BulletConfig[bulletType];
        super(null, config.size, config.size, config.color);
        
        this.bulletType = bulletType;
        this.config = config;
        this.glowIntensity = 0;
        this.glowDirection = 1;
    }

    render(ctx) {
        if (!this.visible || this.alpha <= 0) return;
        
        const transform = this.entity.getComponent('Transform');
        const bullet = this.entity.getComponent('Bullet');
        
        if (!transform) return;

        // 渲染轨迹
        if (bullet && bullet.config.trail) {
            this.renderTrail(ctx, bullet.trail);
        }

        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = this.alpha;
        
        // 变换矩阵
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.rotation);

        // 渲染子弹主体
        this.renderBulletBody(ctx);
        
        // 渲染特殊效果
        this.renderSpecialEffects(ctx);

        ctx.restore();
    }

    // 渲染子弹主体
    renderBulletBody(ctx) {
        const halfSize = this.width / 2;
        
        switch (this.bulletType) {
            case BulletType.NORMAL:
                this.renderNormalBullet(ctx, halfSize);
                break;
            case BulletType.ARMOR_PIERCING:
                this.renderArmorPiercingBullet(ctx, halfSize);
                break;
            case BulletType.EXPLOSIVE:
                this.renderExplosiveBullet(ctx, halfSize);
                break;
            case BulletType.LASER:
                this.renderLaserBullet(ctx, halfSize);
                break;
            case BulletType.PLASMA:
                this.renderPlasmaBullet(ctx, halfSize);
                break;
            default:
                this.renderNormalBullet(ctx, halfSize);
                break;
        }
    }

    // 渲染普通子弹
    renderNormalBullet(ctx, halfSize) {
        // 主体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-halfSize * 0.3, -halfSize * 0.3, halfSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // 渲染穿甲弹
    renderArmorPiercingBullet(ctx, halfSize) {
        // 主体 - 尖锐形状
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -halfSize);
        ctx.lineTo(halfSize * 0.7, halfSize);
        ctx.lineTo(-halfSize * 0.7, halfSize);
        ctx.closePath();
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // 渲染爆炸弹
    renderExplosiveBullet(ctx, halfSize) {
        // 主体
        ctx.fillStyle = this.color;
        ctx.fillRect(-halfSize, -halfSize, this.width, this.height);
        
        // 警告标记
        ctx.fillStyle = '#FFFF00';
        ctx.font = `${halfSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, 0);
    }

    // 渲染激光
    renderLaserBullet(ctx, halfSize) {
        // 激光束
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -halfSize * 2);
        ctx.lineTo(0, halfSize * 2);
        ctx.stroke();
        
        // 内核
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = this.width * 0.3;
        ctx.stroke();
    }

    // 渲染等离子弹
    renderPlasmaBullet(ctx, halfSize) {
        // 外层光晕
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, halfSize * 1.5);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.7, this.color + '80');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, halfSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 内核
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, halfSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 渲染轨迹
    renderTrail(ctx, trail) {
        if (!trail || trail.length < 2) return;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        for (let i = 1; i < trail.length; i++) {
            const prev = trail[i - 1];
            const curr = trail[i];
            const alpha = i / trail.length * 0.5;
            
            ctx.strokeStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = (i / trail.length) * 3;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // 渲染特殊效果
    renderSpecialEffects(ctx) {
        // 发光效果
        if (this.bulletType === BulletType.LASER || this.bulletType === BulletType.PLASMA) {
            this.glowIntensity += this.glowDirection * 0.05;
            if (this.glowIntensity >= 1) {
                this.glowIntensity = 1;
                this.glowDirection = -1;
            } else if (this.glowIntensity <= 0) {
                this.glowIntensity = 0;
                this.glowDirection = 1;
            }
            
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10 + this.glowIntensity * 10;
        }
    }
}

// 射击系统
class FireSystem {
    constructor() {
        this.bulletPool = [];
        this.maxPoolSize = 50;
        this.activeBullets = [];
    }

    // 创建子弹
    createBullet(bulletData) {
        let bullet;
        
        // 尝试从对象池获取
        if (this.bulletPool.length > 0) {
            bullet = this.bulletPool.pop();
            this.resetBullet(bullet, bulletData);
        } else {
            bullet = this.createNewBullet(bulletData);
        }
        
        this.activeBullets.push(bullet);
        return bullet;
    }

    // 创建新子弹
    createNewBullet(bulletData) {
        const bullet = new ECS.Entity('Bullet');
        
        // 添加基础组件
        bullet.addComponent(new ECS.Transform(bulletData.x, bulletData.y, 0));
        bullet.addComponent(new ECS.Collider(6, 6));
        bullet.addComponent(new ECS.Movement(bulletData.bulletSpeed || 300));
        
        // 添加子弹专用组件
        const bulletComponent = new Bullet(bulletData.type || BulletType.NORMAL, bulletData.owner);
        bullet.addComponent(bulletComponent);
        bullet.addComponent(new BulletRenderer(bulletData.type || BulletType.NORMAL));
        
        // 设置移动
        const movement = bullet.getComponent('Movement');
        if (movement) {
            movement.setVelocity(bulletData.velocityX, bulletData.velocityY);
        }
        
        // 添加标签
        bullet.addTag('bullet');
        bullet.addTag('projectile');
        
        return bullet;
    }

    // 重置子弹
    resetBullet(bullet, bulletData) {
        const transform = bullet.getComponent('Transform');
        const movement = bullet.getComponent('Movement');
        const bulletComponent = bullet.getComponent('Bullet');
        
        if (transform) {
            transform.setPosition(bulletData.x, bulletData.y);
        }
        
        if (movement) {
            movement.setVelocity(bulletData.velocityX, bulletData.velocityY);
        }
        
        if (bulletComponent) {
            bulletComponent.active = true;
            bulletComponent.travelDistance = 0;
            bulletComponent.penetrationLeft = bulletComponent.config.penetration;
            bulletComponent.exploded = false;
            bulletComponent.trail = [];
        }
        
        bullet.active = true;
        bullet.destroyed = false;
    }

    // 回收子弹
    recycleBullet(bullet) {
        const index = this.activeBullets.indexOf(bullet);
        if (index > -1) {
            this.activeBullets.splice(index, 1);
        }
        
        if (this.bulletPool.length < this.maxPoolSize) {
            bullet.active = false;
            this.bulletPool.push(bullet);
        }
    }

    // 更新射击系统
    update(deltaTime) {
        // 更新活跃子弹
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];
            const bulletComponent = bullet.getComponent('Bullet');
            
            if (!bulletComponent || !bulletComponent.active || bullet.destroyed) {
                this.recycleBullet(bullet);
            }
        }
    }

    // 清除所有子弹
    clearAll() {
        this.activeBullets.forEach(bullet => {
            const game = window.game;
            if (game && game.entityManager) {
                game.entityManager.removeEntity(bullet);
            }
        });
        
        this.activeBullets = [];
        this.bulletPool = [];
    }

    // 获取统计信息
    getStats() {
        return {
            activeBullets: this.activeBullets.length,
            pooledBullets: this.bulletPool.length,
            totalBullets: this.activeBullets.length + this.bulletPool.length
        };
    }
}

// 爆炸效果
class Explosion extends ECS.Component {
    constructor(radius = 50, duration = 1000) {
        super();
        this.radius = radius;
        this.maxRadius = radius;
        this.duration = duration;
        this.elapsed = 0;
        this.particles = [];
        
        this.createParticles();
    }

    createParticles() {
        const particleCount = Math.floor(this.radius / 2);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = 50 + Math.random() * 100;
            
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.5 + Math.random() * 0.5,
                size: 2 + Math.random() * 4,
                color: Math.random() > 0.5 ? '#FF4500' : '#FFD700'
            });
        }
    }

    update(deltaTime) {
        this.elapsed += deltaTime;
        
        // 更新粒子
        for (const particle of this.particles) {
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            particle.life -= particle.decay * deltaTime / 1000;
            
            // 添加重力
            particle.vy += 100 * deltaTime / 1000;
        }
        
        // 移除死亡粒子
        this.particles = this.particles.filter(p => p.life > 0);
        
        // 检查爆炸是否结束
        if (this.elapsed >= this.duration) {
            const game = window.game;
            if (game && game.entityManager) {
                game.entityManager.removeEntity(this.entity);
            }
        }
    }
}

// 爆炸渲染器
class ExplosionRenderer extends ECS.Renderer {
    constructor() {
        super(null, 0, 0, '#FF4500');
        this.layer = 15; // 爆炸在最高层级
    }

    render(ctx) {
        const transform = this.entity.getComponent('Transform');
        const explosion = this.entity.getComponent('Explosion');
        
        if (!transform || !explosion) return;

        ctx.save();
        ctx.translate(transform.x, transform.y);
        
        // 渲染爆炸圆圈
        const progress = explosion.elapsed / explosion.duration;
        const currentRadius = explosion.maxRadius * progress;
        const alpha = 1 - progress;
        
        // 外圈
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 内圈
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 渲染粒子
        for (const particle of explosion.particles) {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        BulletType,
        BulletConfig,
        Bullet,
        BulletRenderer,
        FireSystem,
        Explosion,
        ExplosionRenderer
    };
} else {
    // 浏览器环境
    window.BulletSystem = {
        BulletType,
        BulletConfig,
        Bullet,
        BulletRenderer,
        FireSystem,
        Explosion,
        ExplosionRenderer
    };
}