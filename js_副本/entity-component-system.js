/**
 * 实体组件系统 (Entity Component System)
 * 坦克大战游戏的核心架构
 */

// 基础组件类
class Component {
    constructor() {
        this.entity = null;
        this.active = true;
    }

    // 组件初始化
    init() {
        // 子类重写
    }

    // 组件更新
    update(deltaTime) {
        // 子类重写
    }

    // 组件销毁
    destroy() {
        this.entity = null;
        this.active = false;
    }
}

// 变换组件 - 处理位置、旋转、缩放
class Transform extends Component {
    constructor(x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1) {
        super();
        this.x = x;
        this.y = y;
        this.rotation = rotation; // 弧度
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        
        // 上一帧的位置，用于碰撞检测
        this.prevX = x;
        this.prevY = y;
    }

    // 设置位置
    setPosition(x, y) {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x = x;
        this.y = y;
    }

    // 移动
    translate(dx, dy) {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x += dx;
        this.y += dy;
    }

    // 设置旋转（角度）
    setRotationDegrees(degrees) {
        this.rotation = degrees * Math.PI / 180;
    }

    // 获取旋转（角度）
    getRotationDegrees() {
        return this.rotation * 180 / Math.PI;
    }

    // 获取方向向量
    getDirection() {
        return {
            x: Math.cos(this.rotation),
            y: Math.sin(this.rotation)
        };
    }

    // 获取前方向量（坦克游戏中上方为前方）
    getForward() {
        return {
            x: Math.sin(this.rotation),
            y: -Math.cos(this.rotation)
        };
    }
}

// 渲染组件 - 处理图形渲染
class Renderer extends Component {
    constructor(sprite = null, width = 32, height = 32, color = '#FFFFFF') {
        super();
        this.sprite = sprite;
        this.width = width;
        this.height = height;
        this.color = color;
        this.visible = true;
        this.alpha = 1.0;
        this.flipX = false;
        this.flipY = false;
        
        // 渲染层级
        this.layer = 0;
        
        // 动画相关
        this.animationFrame = 0;
        this.animationSpeed = 0;
        this.animationFrames = [];
    }

    // 渲染
    render(ctx) {
        if (!this.visible || this.alpha <= 0) return;
        
        const transform = this.entity.getComponent('Transform');
        if (!transform) return;

        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = this.alpha;
        
        // 变换矩阵
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.rotation);
        ctx.scale(transform.scaleX * (this.flipX ? -1 : 1), 
                 transform.scaleY * (this.flipY ? -1 : 1));

        if (this.sprite) {
            // 渲染精灵
            ctx.drawImage(this.sprite, 
                -this.width / 2, -this.height / 2, 
                this.width, this.height);
        } else {
            // 渲染纯色矩形
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();
    }

    // 设置精灵
    setSprite(sprite) {
        this.sprite = sprite;
    }

    // 设置颜色
    setColor(color) {
        this.color = color;
    }

    // 设置可见性
    setVisible(visible) {
        this.visible = visible;
    }

    // 设置透明度
    setAlpha(alpha) {
        this.alpha = Math.max(0, Math.min(1, alpha));
    }
}

// 碰撞器组件 - 处理碰撞检测
class Collider extends Component {
    constructor(width = 32, height = 32, offsetX = 0, offsetY = 0) {
        super();
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.isTrigger = false; // 是否为触发器
        this.layer = 'default'; // 碰撞层
        
        // 碰撞回调
        this.onCollisionEnter = null;
        this.onCollisionStay = null;
        this.onCollisionExit = null;
    }

    // 获取碰撞边界
    getBounds() {
        const transform = this.entity.getComponent('Transform');
        if (!transform) return null;

        return {
            left: transform.x + this.offsetX - this.width / 2,
            right: transform.x + this.offsetX + this.width / 2,
            top: transform.y + this.offsetY - this.height / 2,
            bottom: transform.y + this.offsetY + this.height / 2,
            centerX: transform.x + this.offsetX,
            centerY: transform.y + this.offsetY
        };
    }

    // 检查与另一个碰撞器的碰撞
    checkCollision(otherCollider) {
        const bounds1 = this.getBounds();
        const bounds2 = otherCollider.getBounds();
        
        if (!bounds1 || !bounds2) return false;

        return !(bounds1.right < bounds2.left || 
                bounds1.left > bounds2.right || 
                bounds1.bottom < bounds2.top || 
                bounds1.top > bounds2.bottom);
    }

    // 检查点是否在碰撞器内
    containsPoint(x, y) {
        const bounds = this.getBounds();
        if (!bounds) return false;

        return x >= bounds.left && x <= bounds.right && 
               y >= bounds.top && y <= bounds.bottom;
    }
}

// 移动组件 - 处理移动逻辑
class Movement extends Component {
    constructor(speed = 100) {
        super();
        this.speed = speed; // 像素/秒
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.friction = 0.9;
        this.maxSpeed = speed * 2;
        
        // 移动限制
        this.canMove = true;
        this.bounds = null; // 移动边界
    }

    update(deltaTime) {
        if (!this.canMove) return;

        const transform = this.entity.getComponent('Transform');
        if (!transform) return;

        // 应用加速度
        this.velocity.x += this.acceleration.x * deltaTime / 1000;
        this.velocity.y += this.acceleration.y * deltaTime / 1000;

        // 限制最大速度
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }

        // 应用摩擦力
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;

        // 更新位置
        const deltaX = this.velocity.x * deltaTime / 1000;
        const deltaY = this.velocity.y * deltaTime / 1000;
        
        // 检查边界
        if (this.bounds) {
            const newX = transform.x + deltaX;
            const newY = transform.y + deltaY;
            
            if (newX >= this.bounds.left && newX <= this.bounds.right) {
                transform.x = newX;
            } else {
                this.velocity.x = 0;
            }
            
            if (newY >= this.bounds.top && newY <= this.bounds.bottom) {
                transform.y = newY;
            } else {
                this.velocity.y = 0;
            }
        } else {
            transform.translate(deltaX, deltaY);
        }
    }

    // 设置速度
    setVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    // 添加力
    addForce(x, y) {
        this.acceleration.x += x;
        this.acceleration.y += y;
    }

    // 向前移动
    moveForward(speed = null) {
        const transform = this.entity.getComponent('Transform');
        if (!transform) return;

        const moveSpeed = speed || this.speed;
        const forward = transform.getForward();
        this.setVelocity(forward.x * moveSpeed, forward.y * moveSpeed);
    }

    // 向后移动
    moveBackward(speed = null) {
        const transform = this.entity.getComponent('Transform');
        if (!transform) return;

        const moveSpeed = speed || this.speed;
        const forward = transform.getForward();
        this.setVelocity(-forward.x * moveSpeed, -forward.y * moveSpeed);
    }

    // 停止移动
    stop() {
        this.setVelocity(0, 0);
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }

    // 设置移动边界
    setBounds(left, top, right, bottom) {
        this.bounds = { left, top, right, bottom };
    }
}

// 生命值组件 - 处理生命值和伤害
class Health extends Component {
    constructor(maxHealth = 1, currentHealth = null) {
        super();
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth || maxHealth;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // 事件回调
        this.onDamage = null;
        this.onHeal = null;
        this.onDeath = null;
    }

    update(deltaTime) {
        // 更新无敌时间
        if (this.invulnerabilityTime > 0) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
    }

    // 受到伤害
    takeDamage(damage) {
        if (this.invulnerable || this.currentHealth <= 0) return false;

        this.currentHealth -= damage;
        this.currentHealth = Math.max(0, this.currentHealth);

        // 触发伤害事件
        if (this.onDamage) {
            this.onDamage(damage, this.currentHealth);
        }

        // 检查死亡
        if (this.currentHealth <= 0 && this.onDeath) {
            this.onDeath();
        }

        return true;
    }

    // 恢复生命值
    heal(amount) {
        if (this.currentHealth <= 0) return false;

        const oldHealth = this.currentHealth;
        this.currentHealth += amount;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth);

        const actualHeal = this.currentHealth - oldHealth;
        if (actualHeal > 0 && this.onHeal) {
            this.onHeal(actualHeal, this.currentHealth);
        }

        return actualHeal > 0;
    }

    // 设置无敌状态
    setInvulnerable(duration) {
        this.invulnerable = true;
        this.invulnerabilityTime = duration;
    }

    // 是否存活
    isAlive() {
        return this.currentHealth > 0;
    }

    // 是否满血
    isFullHealth() {
        return this.currentHealth >= this.maxHealth;
    }

    // 获取生命值百分比
    getHealthPercentage() {
        return this.currentHealth / this.maxHealth;
    }
}

// 武器组件 - 处理射击和武器系统
class Weapon extends Component {
    constructor(fireRate = 500, damage = 1, range = 400) {
        super();
        this.fireRate = fireRate; // 射击间隔（毫秒）
        this.damage = damage;
        this.range = range;
        this.lastFireTime = 0;
        this.canFire = true;
        this.ammo = -1; // -1表示无限弹药
        this.maxAmmo = -1;
        
        // 子弹属性
        this.bulletSpeed = 300;
        this.bulletType = 'normal';
        
        // 事件回调
        this.onFire = null;
        this.onReload = null;
    }

    update(deltaTime) {
        // 更新射击冷却
        if (!this.canFire) {
            const currentTime = Date.now();
            if (currentTime - this.lastFireTime >= this.fireRate) {
                this.canFire = true;
            }
        }
    }

    // 尝试射击
    tryFire() {
        if (!this.canFire || (this.ammo !== -1 && this.ammo <= 0)) {
            return false;
        }

        this.lastFireTime = Date.now();
        this.canFire = false;

        // 消耗弹药
        if (this.ammo > 0) {
            this.ammo--;
        }

        // 触发射击事件
        if (this.onFire) {
            this.onFire(this.createBulletData());
        }

        return true;
    }

    // 创建子弹数据
    createBulletData() {
        const transform = this.entity.getComponent('Transform');
        if (!transform) return null;

        const forward = transform.getForward();
        
        return {
            x: transform.x,
            y: transform.y,
            velocityX: forward.x * this.bulletSpeed,
            velocityY: forward.y * this.bulletSpeed,
            damage: this.damage,
            range: this.range,
            type: this.bulletType,
            owner: this.entity
        };
    }

    // 重新装弹
    reload() {
        if (this.maxAmmo === -1) return false;
        
        this.ammo = this.maxAmmo;
        if (this.onReload) {
            this.onReload();
        }
        return true;
    }

    // 设置弹药
    setAmmo(current, max = null) {
        this.ammo = current;
        if (max !== null) {
            this.maxAmmo = max;
        }
    }

    // 是否可以射击
    canFireNow() {
        return this.canFire && (this.ammo === -1 || this.ammo > 0);
    }
}

// 基础实体类
class Entity {
    constructor(name = 'Entity') {
        this.id = Entity.generateId();
        this.name = name;
        this.components = new Map();
        this.active = true;
        this.destroyed = false;
        this.tags = new Set();
    }

    // 生成唯一ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 添加组件
    addComponent(component) {
        const componentName = component.constructor.name;
        this.components.set(componentName, component);
        component.entity = this;
        component.init();
        return this;
    }

    // 获取组件
    getComponent(componentName) {
        return this.components.get(componentName);
    }

    // 检查是否有组件
    hasComponent(componentName) {
        return this.components.has(componentName);
    }

    // 移除组件
    removeComponent(componentName) {
        const component = this.components.get(componentName);
        if (component) {
            component.destroy();
            this.components.delete(componentName);
        }
        return this;
    }

    // 更新实体
    update(deltaTime) {
        if (!this.active || this.destroyed) return;

        // 更新所有组件
        for (const component of this.components.values()) {
            if (component.active) {
                component.update(deltaTime);
            }
        }
    }

    // 渲染实体
    render(ctx) {
        if (!this.active || this.destroyed) return;

        const renderer = this.getComponent('Renderer');
        if (renderer) {
            renderer.render(ctx);
        }
    }

    // 添加标签
    addTag(tag) {
        this.tags.add(tag);
        return this;
    }

    // 移除标签
    removeTag(tag) {
        this.tags.delete(tag);
        return this;
    }

    // 检查是否有标签
    hasTag(tag) {
        return this.tags.has(tag);
    }

    // 销毁实体
    destroy() {
        this.destroyed = true;
        
        // 销毁所有组件
        for (const component of this.components.values()) {
            component.destroy();
        }
        
        this.components.clear();
        this.tags.clear();
    }

    // 设置激活状态
    setActive(active) {
        this.active = active;
        return this;
    }

    // 获取位置
    getPosition() {
        const transform = this.getComponent('Transform');
        return transform ? { x: transform.x, y: transform.y } : { x: 0, y: 0 };
    }

    // 设置位置
    setPosition(x, y) {
        const transform = this.getComponent('Transform');
        if (transform) {
            transform.setPosition(x, y);
        }
        return this;
    }
}

// 实体管理器
class EntityManager {
    constructor() {
        this.entities = new Map();
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
        this.systems = [];
    }

    // 添加实体
    addEntity(entity) {
        this.entitiesToAdd.push(entity);
        return entity;
    }

    // 移除实体
    removeEntity(entity) {
        if (typeof entity === 'string') {
            // 通过ID移除
            const entityObj = this.entities.get(entity);
            if (entityObj) {
                this.entitiesToRemove.push(entityObj);
            }
        } else {
            // 直接移除实体对象
            this.entitiesToRemove.push(entity);
        }
    }

    // 通过ID获取实体
    getEntity(id) {
        return this.entities.get(id);
    }

    // 通过名称获取实体
    getEntityByName(name) {
        for (const entity of this.entities.values()) {
            if (entity.name === name) {
                return entity;
            }
        }
        return null;
    }

    // 通过标签获取实体
    getEntitiesByTag(tag) {
        const result = [];
        for (const entity of this.entities.values()) {
            if (entity.hasTag(tag)) {
                result.push(entity);
            }
        }
        return result;
    }

    // 通过组件类型获取实体
    getEntitiesWithComponent(componentName) {
        const result = [];
        for (const entity of this.entities.values()) {
            if (entity.hasComponent(componentName)) {
                result.push(entity);
            }
        }
        return result;
    }

    // 更新所有实体
    update(deltaTime) {
        // 处理待添加的实体
        for (const entity of this.entitiesToAdd) {
            this.entities.set(entity.id, entity);
        }
        this.entitiesToAdd.length = 0;

        // 更新所有实体
        for (const entity of this.entities.values()) {
            entity.update(deltaTime);
        }

        // 处理待移除的实体
        for (const entity of this.entitiesToRemove) {
            entity.destroy();
            this.entities.delete(entity.id);
        }
        this.entitiesToRemove.length = 0;

        // 移除已销毁的实体
        for (const [id, entity] of this.entities.entries()) {
            if (entity.destroyed) {
                this.entities.delete(id);
            }
        }
    }

    // 渲染所有实体
    render(ctx) {
        // 按渲染层级排序
        const entitiesArray = Array.from(this.entities.values());
        entitiesArray.sort((a, b) => {
            const rendererA = a.getComponent('Renderer');
            const rendererB = b.getComponent('Renderer');
            const layerA = rendererA ? rendererA.layer : 0;
            const layerB = rendererB ? rendererB.layer : 0;
            return layerA - layerB;
        });

        // 渲染所有实体
        for (const entity of entitiesArray) {
            entity.render(ctx);
        }
    }

    // 清除所有实体
    clear() {
        for (const entity of this.entities.values()) {
            entity.destroy();
        }
        this.entities.clear();
        this.entitiesToAdd.length = 0;
        this.entitiesToRemove.length = 0;
    }

    // 获取实体数量
    getEntityCount() {
        return this.entities.size;
    }
}

// 碰撞系统
class CollisionSystem {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.collisionPairs = [];
    }

    // 更新碰撞检测
    update() {
        this.collisionPairs.length = 0;
        
        const collidableEntities = this.entityManager.getEntitiesWithComponent('Collider');
        
        // 检测所有碰撞对
        for (let i = 0; i < collidableEntities.length; i++) {
            for (let j = i + 1; j < collidableEntities.length; j++) {
                const entityA = collidableEntities[i];
                const entityB = collidableEntities[j];
                
                if (!entityA.active || !entityB.active) continue;
                
                const colliderA = entityA.getComponent('Collider');
                const colliderB = entityB.getComponent('Collider');
                
                if (colliderA.checkCollision(colliderB)) {
                    this.collisionPairs.push({ entityA, entityB, colliderA, colliderB });
                    
                    // 触发碰撞事件
                    if (colliderA.onCollisionEnter) {
                        colliderA.onCollisionEnter(entityB, colliderB);
                    }
                    if (colliderB.onCollisionEnter) {
                        colliderB.onCollisionEnter(entityA, colliderA);
                    }
                }
            }
        }
    }

    // 获取碰撞对
    getCollisionPairs() {
        return this.collisionPairs;
    }

    // 检查特定实体的碰撞
    checkEntityCollisions(entity) {
        const collider = entity.getComponent('Collider');
        if (!collider) return [];

        const collisions = [];
        const collidableEntities = this.entityManager.getEntitiesWithComponent('Collider');
        
        for (const otherEntity of collidableEntities) {
            if (otherEntity === entity || !otherEntity.active) continue;
            
            const otherCollider = otherEntity.getComponent('Collider');
            if (collider.checkCollision(otherCollider)) {
                collisions.push({ entity: otherEntity, collider: otherCollider });
            }
        }
        
        return collisions;
    }
}

// 导出所有类
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        Component,
        Transform,
        Renderer,
        Collider,
        Movement,
        Health,
        Weapon,
        Entity,
        EntityManager,
        CollisionSystem
    };
} else {
    // 浏览器环境
    window.ECS = {
        Component,
        Transform,
        Renderer,
        Collider,
        Movement,
        Health,
        Weapon,
        Entity,
        EntityManager,
        CollisionSystem
    };
}