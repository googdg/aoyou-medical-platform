/**
 * 地图系统 (Map System)
 * 坦克大战游戏的地图管理和渲染
 */

// 地图瓦片类型枚举
const TileType = {
    EMPTY: 0,      // 空地
    BRICK: 1,      // 砖墙 - 可破坏
    STEEL: 2,      // 钢墙 - 不可破坏
    WATER: 3,      // 水域 - 不可通过
    GRASS: 4,      // 草地 - 可通过，遮挡视线
    BASE: 5,       // 基地 - 需要保护
    SPAWN_PLAYER: 6,  // 玩家生成点
    SPAWN_ENEMY: 7    // 敌人生成点
};

// 瓦片属性配置
const TileConfig = {
    [TileType.EMPTY]: {
        name: '空地',
        color: '#000000',
        solid: false,
        destructible: false,
        passable: true,
        sprite: null
    },
    [TileType.BRICK]: {
        name: '砖墙',
        color: '#CD853F',
        solid: true,
        destructible: true,
        passable: false,
        sprite: null
    },
    [TileType.STEEL]: {
        name: '钢墙',
        color: '#C0C0C0',
        solid: true,
        destructible: false,
        passable: false,
        sprite: null
    },
    [TileType.WATER]: {
        name: '水域',
        color: '#4169E1',
        solid: false,
        destructible: false,
        passable: false,
        sprite: null
    },
    [TileType.GRASS]: {
        name: '草地',
        color: '#228B22',
        solid: false,
        destructible: false,
        passable: true,
        sprite: null
    },
    [TileType.BASE]: {
        name: '基地',
        color: '#FFD700',
        solid: true,
        destructible: true,
        passable: false,
        sprite: null
    },
    [TileType.SPAWN_PLAYER]: {
        name: '玩家生成点',
        color: '#00FF00',
        solid: false,
        destructible: false,
        passable: true,
        sprite: null
    },
    [TileType.SPAWN_ENEMY]: {
        name: '敌人生成点',
        color: '#FF0000',
        solid: false,
        destructible: false,
        passable: true,
        sprite: null
    }
};

// 地图瓦片类
class MapTile {
    constructor(type = TileType.EMPTY, x = 0, y = 0) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.config = TileConfig[type];
        this.health = this.config.destructible ? 1 : -1; // -1表示不可破坏
        this.visible = true;
        this.damaged = false;
    }

    // 是否可通过
    isPassable() {
        return this.config.passable && this.health !== 0;
    }

    // 是否为固体
    isSolid() {
        return this.config.solid && this.health > 0;
    }

    // 是否可破坏
    isDestructible() {
        return this.config.destructible && this.health > 0;
    }

    // 受到伤害
    takeDamage(damage = 1) {
        if (!this.isDestructible()) return false;
        
        this.health -= damage;
        this.damaged = true;
        
        if (this.health <= 0) {
            this.type = TileType.EMPTY;
            this.config = TileConfig[TileType.EMPTY];
            return true; // 瓦片被摧毁
        }
        
        return false; // 瓦片受损但未摧毁
    }

    // 修复瓦片
    repair() {
        if (this.config.destructible) {
            this.health = 1;
            this.damaged = false;
        }
    }

    // 获取渲染颜色
    getRenderColor() {
        if (this.health <= 0) {
            return TileConfig[TileType.EMPTY].color;
        }
        
        if (this.damaged && this.config.destructible) {
            // 受损时颜色变暗
            const color = this.config.color;
            return this.darkenColor(color, 0.3);
        }
        
        return this.config.color;
    }

    // 颜色变暗
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// 游戏地图类
class GameMap {
    constructor(width = 26, height = 26, tileSize = 32) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.pixelWidth = width * tileSize;
        this.pixelHeight = height * tileSize;
        
        // 地图数据 - 二维数组
        this.tiles = [];
        this.initializeMap();
        
        // 生成点
        this.playerSpawns = [];
        this.enemySpawns = [];
        this.basePosition = null;
        
        // 渲染缓存
        this.needsRedraw = true;
        this.backgroundCanvas = null;
        this.backgroundCtx = null;
        
        this.createBackgroundCanvas();
    }

    // 初始化地图
    initializeMap() {
        this.tiles = [];
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = new MapTile(TileType.EMPTY, x, y);
            }
        }
    }

    // 创建背景画布用于缓存
    createBackgroundCanvas() {
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCanvas.width = this.pixelWidth;
        this.backgroundCanvas.height = this.pixelHeight;
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');
        this.backgroundCtx.imageSmoothingEnabled = false;
    }

    // 获取瓦片
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.tiles[y][x];
    }

    // 设置瓦片
    setTile(x, y, type) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        
        this.tiles[y][x] = new MapTile(type, x, y);
        this.needsRedraw = true;
        
        // 更新生成点信息
        this.updateSpawnPoints();
        
        return true;
    }

    // 世界坐标转换为瓦片坐标
    worldToTile(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.tileSize),
            y: Math.floor(worldY / this.tileSize)
        };
    }

    // 瓦片坐标转换为世界坐标
    tileToWorld(tileX, tileY) {
        return {
            x: tileX * this.tileSize + this.tileSize / 2,
            y: tileY * this.tileSize + this.tileSize / 2
        };
    }

    // 检查位置是否可通过
    isPassable(worldX, worldY) {
        const tilePos = this.worldToTile(worldX, worldY);
        const tile = this.getTile(tilePos.x, tilePos.y);
        return tile ? tile.isPassable() : false;
    }

    // 检查矩形区域是否可通过
    isRectPassable(x, y, width, height) {
        const left = x - width / 2;
        const right = x + width / 2;
        const top = y - height / 2;
        const bottom = y + height / 2;
        
        // 检查四个角点
        const corners = [
            { x: left, y: top },
            { x: right, y: top },
            { x: left, y: bottom },
            { x: right, y: bottom }
        ];
        
        for (const corner of corners) {
            if (!this.isPassable(corner.x, corner.y)) {
                return false;
            }
        }
        
        return true;
    }

    // 获取碰撞瓦片
    getCollisionTiles(x, y, width, height) {
        const collisionTiles = [];
        const left = Math.floor((x - width / 2) / this.tileSize);
        const right = Math.floor((x + width / 2) / this.tileSize);
        const top = Math.floor((y - height / 2) / this.tileSize);
        const bottom = Math.floor((y + height / 2) / this.tileSize);
        
        for (let ty = top; ty <= bottom; ty++) {
            for (let tx = left; tx <= right; tx++) {
                const tile = this.getTile(tx, ty);
                if (tile && tile.isSolid()) {
                    collisionTiles.push({
                        tile: tile,
                        x: tx * this.tileSize,
                        y: ty * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize
                    });
                }
            }
        }
        
        return collisionTiles;
    }

    // 破坏瓦片
    destroyTile(worldX, worldY, damage = 1) {
        const tilePos = this.worldToTile(worldX, worldY);
        const tile = this.getTile(tilePos.x, tilePos.y);
        
        if (tile && tile.takeDamage(damage)) {
            this.needsRedraw = true;
            return true; // 瓦片被摧毁
        }
        
        return false; // 瓦片未被摧毁
    }

    // 更新生成点信息
    updateSpawnPoints() {
        this.playerSpawns = [];
        this.enemySpawns = [];
        this.basePosition = null;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                const worldPos = this.tileToWorld(x, y);
                
                switch (tile.type) {
                    case TileType.SPAWN_PLAYER:
                        this.playerSpawns.push(worldPos);
                        break;
                    case TileType.SPAWN_ENEMY:
                        this.enemySpawns.push(worldPos);
                        break;
                    case TileType.BASE:
                        this.basePosition = worldPos;
                        break;
                }
            }
        }
    }

    // 获取随机玩家生成点
    getRandomPlayerSpawn() {
        if (this.playerSpawns.length === 0) {
            return { x: this.tileSize, y: this.pixelHeight - this.tileSize };
        }
        return this.playerSpawns[Math.floor(Math.random() * this.playerSpawns.length)];
    }

    // 获取随机敌人生成点
    getRandomEnemySpawn() {
        if (this.enemySpawns.length === 0) {
            return { x: this.pixelWidth - this.tileSize, y: this.tileSize };
        }
        return this.enemySpawns[Math.floor(Math.random() * this.enemySpawns.length)];
    }

    // 渲染地图
    render(ctx, cameraX = 0, cameraY = 0) {
        // 如果需要重绘背景，更新背景画布
        if (this.needsRedraw) {
            this.renderBackground();
            this.needsRedraw = false;
        }
        
        // 绘制背景画布
        ctx.drawImage(this.backgroundCanvas, -cameraX, -cameraY);
        
        // 绘制动态元素（如受损效果）
        this.renderDynamicElements(ctx, cameraX, cameraY);
    }

    // 渲染背景到缓存画布
    renderBackground() {
        this.backgroundCtx.fillStyle = '#000000';
        this.backgroundCtx.fillRect(0, 0, this.pixelWidth, this.pixelHeight);
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                if (tile.type !== TileType.EMPTY) {
                    this.renderTile(this.backgroundCtx, tile, x * this.tileSize, y * this.tileSize);
                }
            }
        }
    }

    // 渲染单个瓦片
    renderTile(ctx, tile, x, y) {
        const color = tile.getRenderColor();
        
        switch (tile.type) {
            case TileType.BRICK:
                this.renderBrickTile(ctx, x, y, color, tile.damaged);
                break;
            case TileType.STEEL:
                this.renderSteelTile(ctx, x, y, color);
                break;
            case TileType.WATER:
                this.renderWaterTile(ctx, x, y, color);
                break;
            case TileType.GRASS:
                this.renderGrassTile(ctx, x, y, color);
                break;
            case TileType.BASE:
                this.renderBaseTile(ctx, x, y, color);
                break;
            case TileType.SPAWN_PLAYER:
                this.renderSpawnTile(ctx, x, y, '#00FF00');
                break;
            case TileType.SPAWN_ENEMY:
                this.renderSpawnTile(ctx, x, y, '#FF0000');
                break;
            default:
                ctx.fillStyle = color;
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
                break;
        }
    }

    // 渲染砖墙瓦片
    renderBrickTile(ctx, x, y, color, damaged = false) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制砖块纹理
        ctx.strokeStyle = damaged ? '#8B4513' : '#A0522D';
        ctx.lineWidth = 1;
        
        const brickWidth = this.tileSize / 4;
        const brickHeight = this.tileSize / 4;
        
        for (let by = 0; by < 4; by++) {
            for (let bx = 0; bx < 4; bx++) {
                const brickX = x + bx * brickWidth;
                const brickY = y + by * brickHeight;
                ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
        
        // 如果受损，添加裂纹效果
        if (damaged) {
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 5, y + 5);
            ctx.lineTo(x + this.tileSize - 5, y + this.tileSize - 5);
            ctx.moveTo(x + this.tileSize - 5, y + 5);
            ctx.lineTo(x + 5, y + this.tileSize - 5);
            ctx.stroke();
        }
    }

    // 渲染钢墙瓦片
    renderSteelTile(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制金属纹理
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 2;
        
        // 对角线纹理
        for (let i = 0; i < 4; i++) {
            const offset = i * 8;
            ctx.beginPath();
            ctx.moveTo(x + offset, y);
            ctx.lineTo(x + this.tileSize, y + this.tileSize - offset);
            ctx.stroke();
            
            if (offset > 0) {
                ctx.beginPath();
                ctx.moveTo(x, y + offset);
                ctx.lineTo(x + this.tileSize - offset, y + this.tileSize);
                ctx.stroke();
            }
        }
    }

    // 渲染水域瓦片
    renderWaterTile(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制水波纹理
        ctx.strokeStyle = '#6495ED';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 3; i++) {
            const waveY = y + (i + 1) * this.tileSize / 4;
            ctx.beginPath();
            ctx.moveTo(x, waveY);
            
            for (let wx = 0; wx <= this.tileSize; wx += 4) {
                const waveHeight = Math.sin((wx / this.tileSize) * Math.PI * 2) * 2;
                ctx.lineTo(x + wx, waveY + waveHeight);
            }
            ctx.stroke();
        }
    }

    // 渲染草地瓦片
    renderGrassTile(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制草地纹理
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 8; i++) {
            const grassX = x + Math.random() * this.tileSize;
            const grassY = y + Math.random() * this.tileSize;
            const grassHeight = 3 + Math.random() * 5;
            
            ctx.beginPath();
            ctx.moveTo(grassX, grassY);
            ctx.lineTo(grassX, grassY - grassHeight);
            ctx.stroke();
        }
    }

    // 渲染基地瓦片
    renderBaseTile(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制基地标志
        ctx.fillStyle = '#FF0000';
        const centerX = x + this.tileSize / 2;
        const centerY = y + this.tileSize / 2;
        const size = this.tileSize / 3;
        
        ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
        
        // 绘制十字
        ctx.fillStyle = '#FFFFFF';
        const crossSize = size / 3;
        ctx.fillRect(centerX - crossSize / 2, centerY - size / 2, crossSize, size);
        ctx.fillRect(centerX - size / 2, centerY - crossSize / 2, size, crossSize);
    }

    // 渲染生成点瓦片
    renderSpawnTile(ctx, x, y, color) {
        // 生成点通常是透明的，只在编辑模式下显示
        ctx.fillStyle = color + '40'; // 添加透明度
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制箭头指示
        ctx.fillStyle = color;
        const centerX = x + this.tileSize / 2;
        const centerY = y + this.tileSize / 2;
        const arrowSize = this.tileSize / 4;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - arrowSize);
        ctx.lineTo(centerX - arrowSize, centerY + arrowSize);
        ctx.lineTo(centerX + arrowSize, centerY + arrowSize);
        ctx.closePath();
        ctx.fill();
    }

    // 渲染动态元素
    renderDynamicElements(ctx, cameraX, cameraY) {
        // 这里可以渲染一些动态效果，如水波动画、草地摆动等
        // 目前暂时为空，后续可以扩展
    }

    // 从地图数据加载
    loadFromData(mapData) {
        if (!mapData || !mapData.tiles) {
            console.error('无效的地图数据');
            return false;
        }
        
        this.width = mapData.width || this.width;
        this.height = mapData.height || this.height;
        this.tileSize = mapData.tileSize || this.tileSize;
        this.pixelWidth = this.width * this.tileSize;
        this.pixelHeight = this.height * this.tileSize;
        
        // 重新创建背景画布
        this.createBackgroundCanvas();
        
        // 加载瓦片数据
        this.initializeMap();
        for (let y = 0; y < this.height && y < mapData.tiles.length; y++) {
            for (let x = 0; x < this.width && x < mapData.tiles[y].length; x++) {
                this.setTile(x, y, mapData.tiles[y][x]);
            }
        }
        
        this.needsRedraw = true;
        console.log('地图加载完成:', this.width, 'x', this.height);
        return true;
    }

    // 导出地图数据
    exportData() {
        const mapData = {
            width: this.width,
            height: this.height,
            tileSize: this.tileSize,
            tiles: []
        };
        
        for (let y = 0; y < this.height; y++) {
            mapData.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                mapData.tiles[y][x] = this.tiles[y][x].type;
            }
        }
        
        return mapData;
    }

    // 清空地图
    clear() {
        this.initializeMap();
        this.needsRedraw = true;
    }

    // 填充区域
    fillArea(startX, startY, endX, endY, tileType) {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                this.setTile(x, y, tileType);
            }
        }
    }

    // 绘制边框
    drawBorder(tileType = TileType.STEEL) {
        // 上下边框
        for (let x = 0; x < this.width; x++) {
            this.setTile(x, 0, tileType);
            this.setTile(x, this.height - 1, tileType);
        }
        
        // 左右边框
        for (let y = 0; y < this.height; y++) {
            this.setTile(0, y, tileType);
            this.setTile(this.width - 1, y, tileType);
        }
    }
}

// 地图管理器
class MapManager {
    constructor() {
        this.currentMap = null;
        this.mapLibrary = new Map();
        this.loadDefaultMaps();
    }

    // 加载默认地图
    loadDefaultMaps() {
        // 创建一些预设地图
        this.createTestMap();
        this.createClassicMap();
        this.createMazeMap();
    }

    // 创建测试地图
    createTestMap() {
        const mapData = {
            name: 'test',
            width: 26,
            height: 26,
            tileSize: 32,
            tiles: []
        };
        
        // 初始化空地图
        for (let y = 0; y < mapData.height; y++) {
            mapData.tiles[y] = [];
            for (let x = 0; x < mapData.width; x++) {
                mapData.tiles[y][x] = TileType.EMPTY;
            }
        }
        
        // 添加边框
        for (let x = 0; x < mapData.width; x++) {
            mapData.tiles[0][x] = TileType.STEEL;
            mapData.tiles[mapData.height - 1][x] = TileType.STEEL;
        }
        for (let y = 0; y < mapData.height; y++) {
            mapData.tiles[y][0] = TileType.STEEL;
            mapData.tiles[y][mapData.width - 1] = TileType.STEEL;
        }
        
        // 添加一些障碍物
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * (mapData.width - 4)) + 2;
            const y = Math.floor(Math.random() * (mapData.height - 4)) + 2;
            mapData.tiles[y][x] = Math.random() > 0.5 ? TileType.BRICK : TileType.STEEL;
        }
        
        // 添加生成点
        mapData.tiles[mapData.height - 2][1] = TileType.SPAWN_PLAYER;
        mapData.tiles[mapData.height - 2][2] = TileType.SPAWN_PLAYER;
        mapData.tiles[1][mapData.width - 2] = TileType.SPAWN_ENEMY;
        mapData.tiles[1][mapData.width - 3] = TileType.SPAWN_ENEMY;
        
        // 添加基地
        mapData.tiles[mapData.height - 2][mapData.width / 2] = TileType.BASE;
        
        this.mapLibrary.set('test', mapData);
    }

    // 创建经典地图
    createClassicMap() {
        const mapData = {
            name: 'classic',
            width: 26,
            height: 26,
            tileSize: 32,
            tiles: []
        };
        
        // 这里可以定义经典的坦克大战地图布局
        // 暂时使用简单的布局
        for (let y = 0; y < mapData.height; y++) {
            mapData.tiles[y] = [];
            for (let x = 0; x < mapData.width; x++) {
                if (x === 0 || x === mapData.width - 1 || y === 0 || y === mapData.height - 1) {
                    mapData.tiles[y][x] = TileType.STEEL;
                } else {
                    mapData.tiles[y][x] = TileType.EMPTY;
                }
            }
        }
        
        this.mapLibrary.set('classic', mapData);
    }

    // 创建迷宫地图
    createMazeMap() {
        const mapData = {
            name: 'maze',
            width: 26,
            height: 26,
            tileSize: 32,
            tiles: []
        };
        
        // 创建简单的迷宫布局
        for (let y = 0; y < mapData.height; y++) {
            mapData.tiles[y] = [];
            for (let x = 0; x < mapData.width; x++) {
                if ((x + y) % 4 === 0 && x > 0 && x < mapData.width - 1 && y > 0 && y < mapData.height - 1) {
                    mapData.tiles[y][x] = TileType.BRICK;
                } else if (x === 0 || x === mapData.width - 1 || y === 0 || y === mapData.height - 1) {
                    mapData.tiles[y][x] = TileType.STEEL;
                } else {
                    mapData.tiles[y][x] = TileType.EMPTY;
                }
            }
        }
        
        this.mapLibrary.set('maze', mapData);
    }

    // 加载地图
    loadMap(mapName) {
        const mapData = this.mapLibrary.get(mapName);
        if (!mapData) {
            console.error('地图不存在:', mapName);
            return null;
        }
        
        this.currentMap = new GameMap(mapData.width, mapData.height, mapData.tileSize);
        this.currentMap.loadFromData(mapData);
        
        console.log('地图加载成功:', mapName);
        return this.currentMap;
    }

    // 获取当前地图
    getCurrentMap() {
        return this.currentMap;
    }

    // 获取地图列表
    getMapList() {
        return Array.from(this.mapLibrary.keys());
    }

    // 添加地图到库
    addMap(name, mapData) {
        this.mapLibrary.set(name, mapData);
    }

    // 移除地图
    removeMap(name) {
        return this.mapLibrary.delete(name);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        TileType,
        TileConfig,
        MapTile,
        GameMap,
        MapManager
    };
} else {
    // 浏览器环境
    window.MapSystem = {
        TileType,
        TileConfig,
        MapTile,
        GameMap,
        MapManager
    };
}