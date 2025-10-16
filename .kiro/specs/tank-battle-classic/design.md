# 坦克大战经典版 - 设计文档

## 项目概述

基于HTML5 Canvas和JavaScript开发的经典坦克大战游戏，重现FC时代的经典玩法，支持单人闯关和双人对战模式。

## 技术架构

### 核心技术栈
- **前端框架**: 纯JavaScript ES6+ (无依赖框架)
- **渲染引擎**: HTML5 Canvas 2D Context
- **音频系统**: Web Audio API + HTML5 Audio
- **输入处理**: Keyboard Event API
- **数据存储**: LocalStorage
- **动画系统**: RequestAnimationFrame

### 架构模式
- **游戏循环**: 标准的游戏主循环 (Update -> Render -> Repeat)
- **组件系统**: 基于组件的实体架构
- **状态管理**: 有限状态机管理游戏状态
- **事件系统**: 观察者模式处理游戏事件

## 系统设计

### 1. 游戏引擎核心 (GameEngine)

```javascript
class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER
        this.currentScene = null;
        this.inputManager = new InputManager();
        this.audioManager = new AudioManager();
        this.assetManager = new AssetManager();
    }
    
    // 主游戏循环
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}
```

### 2. 场景管理系统 (SceneManager)

**场景类型:**
- `MenuScene`: 主菜单场景
- `GameScene`: 游戏主场景
- `PauseScene`: 暂停场景
- `GameOverScene`: 游戏结束场景
- `SettingsScene`: 设置场景

```javascript
class Scene {
    constructor() {
        this.entities = [];
        this.isActive = false;
    }
    
    update(deltaTime) {
        this.entities.forEach(entity => entity.update(deltaTime));
    }
    
    render(ctx) {
        this.entities.forEach(entity => entity.render(ctx));
    }
}
```

### 3. 实体组件系统 (Entity-Component System)

**核心实体类:**
- `Tank`: 坦克基类
- `PlayerTank`: 玩家坦克
- `EnemyTank`: 敌方坦克
- `Bullet`: 子弹
- `PowerUp`: 道具
- `Obstacle`: 障碍物

**组件类型:**
- `Transform`: 位置、旋转、缩放
- `Renderer`: 渲染组件
- `Collider`: 碰撞检测
- `Movement`: 移动控制
- `Health`: 生命值
- `Weapon`: 武器系统

```javascript
class Entity {
    constructor() {
        this.components = new Map();
        this.active = true;
    }
    
    addComponent(component) {
        this.components.set(component.constructor.name, component);
        component.entity = this;
    }
    
    getComponent(componentType) {
        return this.components.get(componentType);
    }
}
```

### 4. 坦克系统设计

**坦克属性:**
```javascript
class Tank extends Entity {
    constructor(x, y, type) {
        super();
        this.type = type; // PLAYER, ENEMY_BASIC, ENEMY_FAST, ENEMY_HEAVY
        this.direction = 'UP'; // UP, DOWN, LEFT, RIGHT
        this.speed = 2;
        this.health = 1;
        this.fireRate = 500; // 毫秒
        this.lastFireTime = 0;
        this.powerUps = [];
    }
}
```

**坦克类型:**
- **玩家坦克**: 黄色，可升级，多种武器
- **基础敌坦克**: 灰色，基础属性
- **快速敌坦克**: 红色，移动速度快
- **重型敌坦克**: 绿色，生命值高，火力强
- **特殊敌坦克**: 银色，掉落道具

### 5. 地图系统 (MapSystem)

**地图结构:**
```javascript
class GameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tileSize = 32;
        this.tiles = []; // 二维数组
        this.spawnPoints = []; // 敌方坦克生成点
        this.playerSpawn = { x: 0, y: 0 }; // 玩家生成点
        this.base = { x: 0, y: 0 }; // 基地位置
    }
}
```

**地图元素类型:**
- `EMPTY`: 空地 (0)
- `BRICK`: 砖墙 (1) - 可破坏
- `STEEL`: 钢墙 (2) - 不可破坏
- `WATER`: 水域 (3) - 不可通过
- `GRASS`: 草地 (4) - 可通过，遮挡视线
- `BASE`: 基地 (5) - 需要保护

### 6. AI系统 (AISystem)

**敌方坦克AI状态:**
```javascript
class EnemyAI {
    constructor(tank) {
        this.tank = tank;
        this.state = 'PATROL'; // PATROL, CHASE, ATTACK, RETREAT
        this.target = null;
        this.pathfinding = new PathFinding();
        this.decisionTimer = 0;
    }
    
    update(deltaTime) {
        switch(this.state) {
            case 'PATROL': this.patrol(); break;
            case 'CHASE': this.chase(); break;
            case 'ATTACK': this.attack(); break;
            case 'RETREAT': this.retreat(); break;
        }
    }
}
```

**AI行为模式:**
- **巡逻模式**: 随机移动，寻找玩家
- **追击模式**: 发现玩家后追击
- **攻击模式**: 在射程内攻击玩家
- **撤退模式**: 生命值低时寻找掩护

### 7. 碰撞检测系统 (CollisionSystem)

**碰撞检测类型:**
- **AABB碰撞**: 轴对齐包围盒检测
- **网格碰撞**: 基于地图网格的碰撞
- **分层检测**: 不同类型实体的碰撞分层

```javascript
class CollisionSystem {
    static checkAABB(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    static checkTileCollision(entity, map) {
        // 检查实体与地图瓦片的碰撞
    }
}
```

### 8. 武器和道具系统

**武器类型:**
- **普通子弹**: 基础伤害，单发
- **穿甲弹**: 可穿透砖墙
- **爆炸弹**: 范围伤害
- **激光**: 瞬间命中，高伤害

**道具类型:**
```javascript
const PowerUpTypes = {
    WEAPON_UPGRADE: 'weapon_upgrade',    // 武器升级
    SPEED_BOOST: 'speed_boost',          // 速度提升
    SHIELD: 'shield',                    // 护盾
    EXTRA_LIFE: 'extra_life',           // 额外生命
    FREEZE: 'freeze',                    // 冻结敌人
    DESTROY_ALL: 'destroy_all'           // 消灭所有敌人
};
```

### 9. 音频系统 (AudioSystem)

**音效管理:**
```javascript
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        this.muted = false;
    }
    
    loadSound(name, url) {
        const audio = new Audio(url);
        this.sounds.set(name, audio);
    }
    
    playSound(name, loop = false) {
        if (this.muted) return;
        const sound = this.sounds.get(name);
        if (sound) {
            sound.currentTime = 0;
            sound.loop = loop;
            sound.volume = this.sfxVolume;
            sound.play();
        }
    }
}
```

**音效列表:**
- `tank_move`: 坦克移动音效
- `tank_fire`: 射击音效
- `explosion`: 爆炸音效
- `powerup_pickup`: 道具拾取音效
- `game_start`: 游戏开始音效
- `game_over`: 游戏结束音效
- `level_complete`: 关卡完成音效

### 10. 渲染系统 (RenderSystem)

**渲染层级:**
1. **背景层**: 地图瓦片
2. **实体层**: 坦克、子弹、道具
3. **特效层**: 爆炸、粒子效果
4. **UI层**: 界面元素

**精灵渲染:**
```javascript
class SpriteRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.sprites = new Map();
    }
    
    drawSprite(sprite, x, y, rotation = 0) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(sprite, -sprite.width/2, -sprite.height/2);
        this.ctx.restore();
    }
}
```

### 11. 输入系统 (InputSystem)

**控制方案:**
```javascript
const Controls = {
    PLAYER1: {
        UP: 'KeyW',
        DOWN: 'KeyS', 
        LEFT: 'KeyA',
        RIGHT: 'KeyD',
        FIRE: 'Space'
    },
    PLAYER2: {
        UP: 'ArrowUp',
        DOWN: 'ArrowDown',
        LEFT: 'ArrowLeft', 
        RIGHT: 'ArrowRight',
        FIRE: 'Enter'
    }
};
```

### 12. 关卡系统 (LevelSystem)

**关卡配置:**
```javascript
class Level {
    constructor(levelData) {
        this.id = levelData.id;
        this.name = levelData.name;
        this.map = levelData.map;
        this.enemyCount = levelData.enemyCount;
        this.enemyTypes = levelData.enemyTypes;
        this.timeLimit = levelData.timeLimit;
        this.objectives = levelData.objectives;
    }
}
```

**关卡进度:**
- 20个预设关卡
- 难度递增
- 不同的地图布局
- 敌人数量和类型变化

## 数据结构

### 游戏状态
```javascript
const GameState = {
    currentLevel: 1,
    score: 0,
    lives: 3,
    playerTanks: [],
    enemyTanks: [],
    bullets: [],
    powerUps: [],
    gameMode: 'SINGLE', // SINGLE, DOUBLE
    settings: {
        soundEnabled: true,
        musicVolume: 0.7,
        sfxVolume: 0.8,
        difficulty: 'NORMAL'
    }
};
```

### 存档数据
```javascript
const SaveData = {
    highScore: 0,
    currentLevel: 1,
    unlockedLevels: [1],
    settings: {},
    statistics: {
        totalGamesPlayed: 0,
        totalEnemiesDestroyed: 0,
        totalTimePlayed: 0
    }
};
```

## 性能优化

### 1. 对象池 (Object Pooling)
- 子弹对象池，避免频繁创建销毁
- 粒子效果对象池
- 敌方坦克对象池

### 2. 碰撞优化
- 空间分割算法
- 碰撞检测的早期退出
- 分层碰撞检测

### 3. 渲染优化
- 视锥剔除，只渲染可见区域
- 精灵批处理
- 减少Canvas状态切换

### 4. 内存管理
- 及时清理无用对象
- 避免内存泄漏
- 合理的垃圾回收

## 用户界面设计

### 主菜单
- 开始游戏 (单人/双人)
- 关卡选择
- 设置选项
- 最高分记录
- 退出游戏

### 游戏界面
- 生命值显示
- 得分显示
- 关卡信息
- 暂停按钮
- 小地图 (可选)

### 设置界面
- 音量控制
- 按键设置
- 难度选择
- 重置数据

## 部署和兼容性

### 浏览器兼容性
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### 移动端适配
- 触摸控制支持
- 响应式布局
- 性能优化

### 部署方案
- 静态文件部署
- CDN加速
- 离线缓存支持