/**
 * 小鬼管理器
 * Ghost Manager
 * 
 * 负责管理小鬼角色类型、精灵和特殊道具
 */

class GhostManager {
    constructor(ghostTypes = 6) {
        this.ghostTypeCount = ghostTypes;
        this.ghostTypes = this.initializeGhostTypes(ghostTypes);
        this.specialGhosts = this.initializeSpecialGhosts();
        this.ghostIdCounter = 0;
        
        console.log(`小鬼管理器初始化: ${ghostTypes} 种小鬼类型`);
    }
    
    /**
     * 初始化小鬼类型
     */
    initializeGhostTypes(count) {
        const colors = [
            '#FF6B6B', // 红色小鬼
            '#4ECDC4', // 青色小鬼
            '#45B7D1', // 蓝色小鬼
            '#96CEB4', // 绿色小鬼
            '#FFEAA7', // 黄色小鬼
            '#DDA0DD', // 紫色小鬼
            '#FFB347', // 橙色小鬼
            '#F8BBD9'  // 粉色小鬼
        ];
        
        const names = [
            '红红', '青青', '蓝蓝', '绿绿', 
            '黄黄', '紫紫', '橙橙', '粉粉'
        ];
        
        return Array.from({length: count}, (_, i) => ({
            id: i,
            name: names[i] || `小鬼${i}`,
            color: colors[i] || this.generateRandomColor(),
            sprite: this.getGhostSprite(i),
            animation: this.getGhostAnimation(i),
            rarity: i < 6 ? 'common' : 'rare'
        }));
    }
    
    /**
     * 初始化特殊小鬼类型
     */
    initializeSpecialGhosts() {
        return {
            'row-clear': {
                id: 'row-clear',
                name: '横扫小鬼',
                color: '#FF4757',
                effect: 'clearRow',
                description: '消除整行小鬼',
                sprite: '🔥'
            },
            'column-clear': {
                id: 'column-clear',
                name: '竖扫小鬼',
                color: '#3742FA',
                effect: 'clearColumn',
                description: '消除整列小鬼',
                sprite: '⚡'
            },
            'bomb': {
                id: 'bomb',
                name: '爆炸小鬼',
                color: '#FF6348',
                effect: 'explode',
                description: '消除周围3x3区域',
                sprite: '💥'
            },
            'rainbow': {
                id: 'rainbow',
                name: '彩虹小鬼',
                color: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
                effect: 'clearType',
                description: '消除所有同类型小鬼',
                sprite: '🌈'
            }
        };
    }
    
    /**
     * 创建随机小鬼
     */
    createRandomGhost() {
        const type = Math.floor(Math.random() * this.ghostTypeCount);
        return this.createGhost(type);
    }
    
    /**
     * 创建指定类型的小鬼
     */
    createGhost(type, position = { x: 0, y: 0 }) {
        if (type < 0 || type >= this.ghostTypeCount) {
            type = 0; // 默认类型
        }
        
        const ghostType = this.ghostTypes[type];
        
        return {
            id: this.generateGhostId(),
            type: type,
            name: ghostType.name,
            color: ghostType.color,
            position: { ...position },
            isSpecial: false,
            specialType: null,
            animation: null,
            isMatched: false,
            isFalling: false,
            sprite: ghostType.sprite,
            rarity: ghostType.rarity,
            createdAt: Date.now()
        };
    }
    
    /**
     * 创建特殊小鬼
     */
    createSpecialGhost(specialType, position = { x: 0, y: 0 }) {
        const special = this.specialGhosts[specialType];
        if (!special) {
            console.warn(`未知的特殊小鬼类型: ${specialType}`);
            return this.createRandomGhost();
        }
        
        return {
            id: this.generateGhostId(),
            type: -1, // 特殊小鬼使用负数类型
            name: special.name,
            color: special.color,
            position: { ...position },
            isSpecial: true,
            specialType: specialType,
            effect: special.effect,
            animation: null,
            isMatched: false,
            isFalling: false,
            sprite: special.sprite,
            rarity: 'special',
            description: special.description,
            createdAt: Date.now()
        };
    }
    
    /**
     * 生成小鬼ID
     */
    generateGhostId() {
        return `ghost_${++this.ghostIdCounter}_${Date.now()}`;
    }
    
    /**
     * 获取小鬼精灵
     */
    getGhostSprite(ghostId) {
        const sprites = [
            { emoji: '👻', name: '经典小鬼', color: '#FF6B6B' },
            { emoji: '🎃', name: '南瓜小鬼', color: '#4ECDC4' },
            { emoji: '👹', name: '红鬼', color: '#45B7D1' },
            { emoji: '👺', name: '蓝鬼', color: '#96CEB4' },
            { emoji: '🤖', name: '机器小鬼', color: '#FFEAA7' },
            { emoji: '👽', name: '外星小鬼', color: '#DDA0DD' },
            { emoji: '🦄', name: '独角兽小鬼', color: '#FFB347' },
            { emoji: '🐉', name: '龙小鬼', color: '#F8BBD9' }
        ];
        return sprites[ghostId] || sprites[0];
    }
    
    /**
     * 获取小鬼的CSS精灵类
     */
    getGhostSpriteClass(ghostId) {
        return `ghost-sprite-${ghostId}`;
    }
    
    /**
     * 获取小鬼的SVG精灵
     */
    getGhostSVG(ghostId, size = 32) {
        const ghostType = this.ghostTypes[ghostId];
        if (!ghostType) return null;
        
        return `
            <svg width="${size}" height="${size}" viewBox="0 0 32 32" class="ghost-svg">
                <defs>
                    <radialGradient id="ghost-gradient-${ghostId}" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" style="stop-color:${this.lightenColor(ghostType.color, 20)};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${ghostType.color};stop-opacity:1" />
                    </radialGradient>
                </defs>
                <path d="M16 4 C8 4 4 8 4 16 C4 20 4 24 4 28 L8 24 L12 28 L16 24 L20 28 L24 24 L28 28 C28 24 28 20 28 16 C28 8 24 4 16 4 Z" 
                      fill="url(#ghost-gradient-${ghostId})" 
                      stroke="${this.darkenColor(ghostType.color, 20)}" 
                      stroke-width="1"/>
                <circle cx="12" cy="14" r="2" fill="#000" opacity="0.8"/>
                <circle cx="20" cy="14" r="2" fill="#000" opacity="0.8"/>
                <ellipse cx="16" cy="20" rx="3" ry="2" fill="#000" opacity="0.6"/>
            </svg>
        `;
    }
    
    /**
     * 颜色变亮
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    /**
     * 颜色变暗
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    /**
     * 获取小鬼动画配置
     */
    getGhostAnimation(ghostId) {
        const baseAnimations = {
            idle: {
                duration: 2000 + (ghostId * 200), // 不同小鬼有不同的闲置动画速度
                frames: ['normal', 'blink', 'normal', 'wiggle'],
                loop: true,
                easing: 'ease-in-out'
            },
            match: {
                duration: 600,
                frames: ['highlight', 'pulse', 'sparkle', 'glow', 'fade'],
                loop: false,
                easing: 'ease-out'
            },
            fall: {
                duration: 400,
                frames: ['normal', 'falling', 'bounce'],
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                loop: false
            },
            spawn: {
                duration: 800,
                frames: ['invisible', 'fade-in', 'bounce-in', 'normal'],
                easing: 'ease-out',
                loop: false
            },
            selected: {
                duration: 300,
                frames: ['normal', 'selected-glow'],
                easing: 'ease-in-out',
                loop: true
            },
            special: {
                duration: 1000,
                frames: ['normal', 'special-glow', 'special-pulse', 'special-shine'],
                easing: 'ease-in-out',
                loop: true
            }
        };
        
        // 为不同类型的小鬼添加特殊动画变化
        const ghostType = this.ghostTypes[ghostId];
        if (ghostType && ghostType.rarity === 'rare') {
            baseAnimations.idle.duration *= 0.8; // 稀有小鬼动画更快
            baseAnimations.match.duration *= 1.2; // 匹配动画更长
        }
        
        return baseAnimations;
    }
    
    /**
     * 创建动画关键帧
     */
    createAnimationKeyframes(animationType, ghostId) {
        const animations = this.getGhostAnimation(ghostId);
        const animation = animations[animationType];
        
        if (!animation) return null;
        
        const keyframes = [];
        const frameCount = animation.frames.length;
        
        animation.frames.forEach((frame, index) => {
            const percentage = (index / (frameCount - 1)) * 100;
            keyframes.push({
                offset: percentage / 100,
                transform: this.getFrameTransform(frame, ghostId),
                opacity: this.getFrameOpacity(frame),
                filter: this.getFrameFilter(frame, ghostId)
            });
        });
        
        return {
            keyframes,
            options: {
                duration: animation.duration,
                easing: animation.easing,
                iterations: animation.loop ? Infinity : 1,
                fill: 'forwards'
            }
        };
    }
    
    /**
     * 获取帧变换
     */
    getFrameTransform(frame, ghostId) {
        const transforms = {
            'normal': 'scale(1) rotate(0deg)',
            'blink': 'scale(1) rotate(0deg)',
            'wiggle': 'scale(1) rotate(2deg)',
            'highlight': 'scale(1.1) rotate(0deg)',
            'pulse': 'scale(1.2) rotate(0deg)',
            'sparkle': 'scale(1.15) rotate(5deg)',
            'glow': 'scale(1.1) rotate(-2deg)',
            'fade': 'scale(0.8) rotate(0deg)',
            'falling': 'scale(0.95) rotate(10deg)',
            'bounce': 'scale(1.05) rotate(0deg)',
            'invisible': 'scale(0) rotate(0deg)',
            'fade-in': 'scale(0.5) rotate(0deg)',
            'bounce-in': 'scale(1.2) rotate(0deg)',
            'selected-glow': 'scale(1.1) rotate(0deg)',
            'special-glow': 'scale(1.05) rotate(0deg)',
            'special-pulse': 'scale(1.15) rotate(0deg)',
            'special-shine': 'scale(1.1) rotate(0deg)'
        };
        
        return transforms[frame] || transforms['normal'];
    }
    
    /**
     * 获取帧透明度
     */
    getFrameOpacity(frame) {
        const opacities = {
            'normal': 1,
            'blink': 0.7,
            'wiggle': 1,
            'highlight': 1,
            'pulse': 0.9,
            'sparkle': 1,
            'glow': 0.95,
            'fade': 0,
            'falling': 1,
            'bounce': 1,
            'invisible': 0,
            'fade-in': 0.5,
            'bounce-in': 1,
            'selected-glow': 1,
            'special-glow': 0.9,
            'special-pulse': 1,
            'special-shine': 0.95
        };
        
        return opacities[frame] || 1;
    }
    
    /**
     * 获取帧滤镜效果
     */
    getFrameFilter(frame, ghostId) {
        const ghostType = this.ghostTypes[ghostId];
        const baseColor = ghostType ? ghostType.color : '#FF6B6B';
        
        const filters = {
            'normal': 'none',
            'blink': 'none',
            'wiggle': 'none',
            'highlight': `drop-shadow(0 0 8px ${baseColor})`,
            'pulse': `drop-shadow(0 0 12px ${baseColor})`,
            'sparkle': `drop-shadow(0 0 15px ${baseColor}) brightness(1.2)`,
            'glow': `drop-shadow(0 0 10px ${baseColor})`,
            'fade': 'none',
            'falling': 'none',
            'bounce': 'none',
            'invisible': 'none',
            'fade-in': 'none',
            'bounce-in': `drop-shadow(0 0 5px ${baseColor})`,
            'selected-glow': `drop-shadow(0 0 10px #FFD700)`,
            'special-glow': `drop-shadow(0 0 15px ${baseColor}) hue-rotate(30deg)`,
            'special-pulse': `drop-shadow(0 0 20px ${baseColor}) saturate(1.5)`,
            'special-shine': `drop-shadow(0 0 25px ${baseColor}) brightness(1.3)`
        };
        
        return filters[frame] || 'none';
    }
    
    /**
     * 生成随机颜色
     */
    generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }
    
    /**
     * 执行特殊小鬼效果
     */
    executeSpecialEffect(ghost, gridManager, position, gameState = {}) {
        if (!ghost.isSpecial) {
            return {
                affectedPositions: [],
                score: 0,
                effects: [],
                chainMultiplier: 1
            };
        }
        
        const result = {
            affectedPositions: [],
            score: 0,
            effects: [],
            chainMultiplier: 1,
            specialType: ghost.specialType
        };
        
        switch (ghost.effect) {
            case 'clearRow':
                result.affectedPositions = this.clearRow(gridManager, position.y);
                result.score = result.affectedPositions.length * 50;
                result.effects.push({
                    type: 'row_clear',
                    position: position,
                    count: result.affectedPositions.length
                });
                break;
                
            case 'clearColumn':
                result.affectedPositions = this.clearColumn(gridManager, position.x);
                result.score = result.affectedPositions.length * 50;
                result.effects.push({
                    type: 'column_clear',
                    position: position,
                    count: result.affectedPositions.length
                });
                break;
                
            case 'explode':
                const radius = this.getExplosionRadius(ghost, gameState);
                result.affectedPositions = this.explodeArea(gridManager, position, radius);
                result.score = result.affectedPositions.length * 30;
                result.effects.push({
                    type: 'explosion',
                    position: position,
                    radius: radius,
                    count: result.affectedPositions.length
                });
                break;
                
            case 'clearType':
                const targetType = this.selectTargetType(gridManager, position);
                result.affectedPositions = this.clearAllOfType(gridManager, targetType);
                result.score = result.affectedPositions.length * 40;
                result.chainMultiplier = 1.5;
                result.effects.push({
                    type: 'type_clear',
                    targetType: targetType,
                    count: result.affectedPositions.length
                });
                break;
                
            case 'lightning':
                result.affectedPositions = this.lightningStrike(gridManager, position);
                result.score = result.affectedPositions.length * 60;
                result.effects.push({
                    type: 'lightning',
                    position: position,
                    count: result.affectedPositions.length
                });
                break;
                
            case 'swap':
                result.affectedPositions = this.randomSwap(gridManager, 5);
                result.score = 100;
                result.effects.push({
                    type: 'random_swap',
                    swapCount: result.affectedPositions.length / 2
                });
                break;
                
            default:
                console.warn(`未实现的特殊效果: ${ghost.effect}`);
        }
        
        // 添加特殊效果的视觉效果
        result.effects.forEach(effect => {
            effect.visualEffect = this.getVisualEffect(effect.type);
            effect.soundEffect = this.getSoundEffect(effect.type);
        });
        
        return result;
    }
    
    /**
     * 获取爆炸半径
     */
    getExplosionRadius(ghost, gameState) {
        let baseRadius = 1;
        
        // 根据游戏状态调整半径
        if (gameState.level && gameState.level > 5) {
            baseRadius += Math.floor(gameState.level / 10);
        }
        
        // 根据连击数调整
        if (gameState.comboCount && gameState.comboCount > 3) {
            baseRadius += 1;
        }
        
        return Math.min(baseRadius, 3); // 最大半径限制
    }
    
    /**
     * 选择目标类型（彩虹小鬼用）
     */
    selectTargetType(gridManager, position) {
        // 统计网格中各类型的数量
        const typeCounts = {};
        
        for (let y = 0; y < gridManager.height; y++) {
            for (let x = 0; x < gridManager.width; x++) {
                const tile = gridManager.getTile(x, y);
                if (tile && !tile.isSpecial) {
                    typeCounts[tile.type] = (typeCounts[tile.type] || 0) + 1;
                }
            }
        }
        
        // 选择数量最多的类型
        let maxCount = 0;
        let targetType = 0;
        
        Object.entries(typeCounts).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                targetType = parseInt(type);
            }
        });
        
        return targetType;
    }
    
    /**
     * 闪电攻击效果
     */
    lightningStrike(gridManager, position) {
        const positions = [];
        
        // 随机选择多个目标
        const targetCount = Math.min(8, Math.floor(Math.random() * 5) + 3);
        const allPositions = [];
        
        // 收集所有有瓦片的位置
        for (let y = 0; y < gridManager.height; y++) {
            for (let x = 0; x < gridManager.width; x++) {
                if (gridManager.getTile(x, y)) {
                    allPositions.push({ x, y });
                }
            }
        }
        
        // 随机选择目标
        for (let i = 0; i < targetCount && allPositions.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * allPositions.length);
            positions.push(allPositions.splice(randomIndex, 1)[0]);
        }
        
        return positions;
    }
    
    /**
     * 随机交换效果
     */
    randomSwap(gridManager, swapCount) {
        const positions = [];
        const allPositions = [];
        
        // 收集所有有瓦片的位置
        for (let y = 0; y < gridManager.height; y++) {
            for (let x = 0; x < gridManager.width; x++) {
                if (gridManager.getTile(x, y)) {
                    allPositions.push({ x, y });
                }
            }
        }
        
        // 执行随机交换
        for (let i = 0; i < swapCount && allPositions.length >= 2; i++) {
            const index1 = Math.floor(Math.random() * allPositions.length);
            const pos1 = allPositions.splice(index1, 1)[0];
            
            const index2 = Math.floor(Math.random() * allPositions.length);
            const pos2 = allPositions.splice(index2, 1)[0];
            
            // 执行交换
            gridManager.swapTiles(pos1, pos2);
            
            positions.push(pos1, pos2);
        }
        
        return positions;
    }
    
    /**
     * 获取视觉效果配置
     */
    getVisualEffect(effectType) {
        const effects = {
            'row_clear': {
                type: 'line',
                direction: 'horizontal',
                color: '#FF4757',
                duration: 800,
                particles: true
            },
            'column_clear': {
                type: 'line',
                direction: 'vertical',
                color: '#3742FA',
                duration: 800,
                particles: true
            },
            'explosion': {
                type: 'radial',
                color: '#FF6348',
                duration: 1000,
                particles: true,
                shockwave: true
            },
            'type_clear': {
                type: 'rainbow',
                color: 'multicolor',
                duration: 1200,
                particles: true,
                sparkles: true
            },
            'lightning': {
                type: 'zigzag',
                color: '#FFD700',
                duration: 600,
                flash: true
            },
            'random_swap': {
                type: 'swirl',
                color: '#9C88FF',
                duration: 1000,
                trails: true
            }
        };
        
        return effects[effectType] || effects['explosion'];
    }
    
    /**
     * 获取音效配置
     */
    getSoundEffect(effectType) {
        const sounds = {
            'row_clear': { file: 'row_clear.mp3', volume: 0.7 },
            'column_clear': { file: 'column_clear.mp3', volume: 0.7 },
            'explosion': { file: 'explosion.mp3', volume: 0.8 },
            'type_clear': { file: 'rainbow_clear.mp3', volume: 0.9 },
            'lightning': { file: 'lightning.mp3', volume: 0.8 },
            'random_swap': { file: 'magic_swap.mp3', volume: 0.6 }
        };
        
        return sounds[effectType] || sounds['explosion'];
    }
    
    /**
     * 创建组合特殊小鬼
     */
    createComboSpecialGhost(specialType1, specialType2, position) {
        const comboEffects = {
            'row-clear+column-clear': 'cross-clear',
            'bomb+bomb': 'mega-bomb',
            'rainbow+row-clear': 'rainbow-row',
            'rainbow+column-clear': 'rainbow-column',
            'rainbow+bomb': 'rainbow-bomb',
            'lightning+bomb': 'thunder-bomb'
        };
        
        const comboKey = [specialType1, specialType2].sort().join('+');
        const comboEffect = comboEffects[comboKey];
        
        if (comboEffect) {
            return this.createSpecialGhost(comboEffect, position);
        }
        
        return null;
    }
    
    /**
     * 检测特殊小鬼组合
     */
    detectSpecialCombination(ghost1, ghost2) {
        if (!ghost1.isSpecial || !ghost2.isSpecial) {
            return null;
        }
        
        const combinations = [
            {
                types: ['row-clear', 'column-clear'],
                result: 'cross-clear',
                name: '十字清除',
                description: '清除十字形区域'
            },
            {
                types: ['bomb', 'bomb'],
                result: 'mega-bomb',
                name: '超级炸弹',
                description: '大范围爆炸'
            },
            {
                types: ['rainbow', 'row-clear'],
                result: 'rainbow-row',
                name: '彩虹横扫',
                description: '将所有同类型转换为横扫'
            },
            {
                types: ['rainbow', 'column-clear'],
                result: 'rainbow-column',
                name: '彩虹竖扫',
                description: '将所有同类型转换为竖扫'
            }
        ];
        
        for (const combo of combinations) {
            if (combo.types.includes(ghost1.specialType) && 
                combo.types.includes(ghost2.specialType)) {
                return combo;
            }
        }
        
        return null;
    }
    
    /**
     * 清除整行
     */
    clearRow(gridManager, row) {
        const positions = [];
        for (let x = 0; x < gridManager.width; x++) {
            positions.push({ x, y: row });
        }
        return positions;
    }
    
    /**
     * 清除整列
     */
    clearColumn(gridManager, col) {
        const positions = [];
        for (let y = 0; y < gridManager.height; y++) {
            positions.push({ x: col, y });
        }
        return positions;
    }
    
    /**
     * 爆炸区域
     */
    explodeArea(gridManager, center, radius) {
        const positions = [];
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = center.x + dx;
                const y = center.y + dy;
                
                if (gridManager.isValidPosition(x, y)) {
                    positions.push({ x, y });
                }
            }
        }
        
        return positions;
    }
    
    /**
     * 清除所有同类型小鬼
     */
    clearAllOfType(gridManager, targetType) {
        const positions = [];
        
        for (let y = 0; y < gridManager.height; y++) {
            for (let x = 0; x < gridManager.width; x++) {
                const tile = gridManager.getTile(x, y);
                if (tile && tile.type === targetType) {
                    positions.push({ x, y });
                }
            }
        }
        
        return positions;
    }
    
    /**
     * 根据匹配数量确定特殊小鬼类型
     */
    getSpecialGhostTypeForMatch(matchCount, matchShape) {
        if (matchCount >= 5) {
            return 'rainbow';
        } else if (matchCount === 4) {
            return matchShape === 'horizontal' ? 'row-clear' : 'column-clear';
        } else if (matchShape === 'L' || matchShape === 'T') {
            return 'bomb';
        }
        
        return null;
    }
    
    /**
     * 为小鬼添加动画
     */
    animateGhost(ghost, animationType, duration = 500) {
        ghost.animation = {
            type: animationType,
            startTime: Date.now(),
            duration: duration,
            isActive: true
        };
        
        return ghost;
    }
    
    /**
     * 更新小鬼动画
     */
    updateGhostAnimations(ghosts, currentTime) {
        ghosts.forEach(ghost => {
            if (ghost.animation && ghost.animation.isActive) {
                const elapsed = currentTime - ghost.animation.startTime;
                
                if (elapsed >= ghost.animation.duration) {
                    ghost.animation.isActive = false;
                    ghost.animation = null;
                }
            }
        });
    }
    
    /**
     * 获取小鬼类型信息
     */
    getGhostTypeInfo(type) {
        if (type >= 0 && type < this.ghostTypes.length) {
            return this.ghostTypes[type];
        }
        return null;
    }
    
    /**
     * 获取所有小鬼类型
     */
    getAllGhostTypes() {
        return [...this.ghostTypes];
    }
    
    /**
     * 获取所有特殊小鬼类型
     */
    getAllSpecialGhostTypes() {
        return { ...this.specialGhosts };
    }
    
    /**
     * 小鬼表情系统
     */
    getGhostExpression(ghost, state = 'normal') {
        const expressions = {
            'normal': { eyes: '• •', mouth: '○' },
            'happy': { eyes: '^ ^', mouth: '◡' },
            'excited': { eyes: '★ ★', mouth: '◡' },
            'sleepy': { eyes: '- -', mouth: '○' },
            'surprised': { eyes: '○ ○', mouth: '○' },
            'angry': { eyes: '> <', mouth: '△' },
            'sad': { eyes: '; ;', mouth: '◦' },
            'confused': { eyes: '@ @', mouth: '~' },
            'special': { eyes: '✦ ✦', mouth: '◡' },
            'matched': { eyes: '★ ★', mouth: '◡' }
        };
        
        return expressions[state] || expressions['normal'];
    }
    
    /**
     * 根据游戏状态更新小鬼表情
     */
    updateGhostExpression(ghost, gameState) {
        if (ghost.isMatched) {
            ghost.expression = this.getGhostExpression(ghost, 'matched');
        } else if (ghost.isSpecial) {
            ghost.expression = this.getGhostExpression(ghost, 'special');
        } else if (ghost.isFalling) {
            ghost.expression = this.getGhostExpression(ghost, 'surprised');
        } else {
            // 随机表情变化
            const expressions = ['normal', 'happy', 'sleepy'];
            const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
            ghost.expression = this.getGhostExpression(ghost, randomExpression);
        }
        
        return ghost;
    }
    
    /**
     * 小鬼状态管理
     */
    updateGhostState(ghost, newState, duration = 1000) {
        const previousState = ghost.state || 'normal';
        
        ghost.state = newState;
        ghost.stateStartTime = Date.now();
        ghost.stateDuration = duration;
        ghost.previousState = previousState;
        
        // 更新相应的动画和表情
        this.animateGhost(ghost, newState, duration);
        this.updateGhostExpression(ghost, { state: newState });
        
        return ghost;
    }
    
    /**
     * 检查小鬼状态是否过期
     */
    isGhostStateExpired(ghost) {
        if (!ghost.state || !ghost.stateStartTime) return false;
        
        const elapsed = Date.now() - ghost.stateStartTime;
        return elapsed >= ghost.stateDuration;
    }
    
    /**
     * 重置过期的小鬼状态
     */
    resetExpiredGhostStates(ghosts) {
        ghosts.forEach(ghost => {
            if (this.isGhostStateExpired(ghost)) {
                ghost.state = 'normal';
                ghost.stateStartTime = null;
                ghost.stateDuration = 0;
                ghost.animation = null;
                this.updateGhostExpression(ghost, { state: 'normal' });
            }
        });
    }
    
    /**
     * 小鬼情绪系统
     */
    updateGhostMood(ghost, events = []) {
        if (!ghost.mood) {
            ghost.mood = {
                happiness: 50,
                energy: 50,
                excitement: 50,
                lastUpdate: Date.now()
            };
        }
        
        // 基于事件更新情绪
        events.forEach(event => {
            switch (event.type) {
                case 'matched':
                    ghost.mood.happiness += 20;
                    ghost.mood.excitement += 15;
                    break;
                case 'special_created':
                    ghost.mood.happiness += 30;
                    ghost.mood.excitement += 25;
                    ghost.mood.energy += 10;
                    break;
                case 'long_idle':
                    ghost.mood.energy -= 5;
                    break;
                case 'chain_reaction':
                    ghost.mood.excitement += 10;
                    break;
            }
        });
        
        // 限制情绪值范围
        ghost.mood.happiness = Math.max(0, Math.min(100, ghost.mood.happiness));
        ghost.mood.energy = Math.max(0, Math.min(100, ghost.mood.energy));
        ghost.mood.excitement = Math.max(0, Math.min(100, ghost.mood.excitement));
        
        // 自然衰减
        const timeSinceUpdate = Date.now() - ghost.mood.lastUpdate;
        if (timeSinceUpdate > 5000) { // 5秒后开始衰减
            ghost.mood.excitement = Math.max(30, ghost.mood.excitement - 1);
            ghost.mood.energy = Math.max(30, ghost.mood.energy - 0.5);
        }
        
        ghost.mood.lastUpdate = Date.now();
        
        // 根据情绪更新表情
        this.updateExpressionBasedOnMood(ghost);
        
        return ghost.mood;
    }
    
    /**
     * 根据情绪更新表情
     */
    updateExpressionBasedOnMood(ghost) {
        if (!ghost.mood) return;
        
        let expressionState = 'normal';
        
        if (ghost.mood.happiness > 80) {
            expressionState = 'happy';
        } else if (ghost.mood.excitement > 70) {
            expressionState = 'excited';
        } else if (ghost.mood.energy < 30) {
            expressionState = 'sleepy';
        } else if (ghost.mood.happiness < 30) {
            expressionState = 'sad';
        }
        
        ghost.expression = this.getGhostExpression(ghost, expressionState);
    }
    
    /**
     * 获取小鬼的个性特征
     */
    getGhostPersonality(ghost) {
        if (!ghost.personality) {
            // 基于小鬼ID生成一致的个性
            const seed = this.hashString(ghost.id);
            
            ghost.personality = {
                playfulness: (seed % 100) / 100,
                friendliness: ((seed * 7) % 100) / 100,
                energy: ((seed * 13) % 100) / 100,
                curiosity: ((seed * 19) % 100) / 100,
                patience: ((seed * 23) % 100) / 100
            };
        }
        
        return ghost.personality;
    }
    
    /**
     * 字符串哈希函数
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash);
    }
    
    /**
     * 小鬼互动系统
     */
    createGhostInteraction(ghost1, ghost2, interactionType) {
        const interaction = {
            id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            participants: [ghost1.id, ghost2.id],
            type: interactionType,
            startTime: Date.now(),
            duration: 2000,
            effects: []
        };
        
        // 根据互动类型和个性计算效果
        const personality1 = this.getGhostPersonality(ghost1);
        const personality2 = this.getGhostPersonality(ghost2);
        
        switch (interactionType) {
            case 'friendship':
                if (personality1.friendliness > 0.7 && personality2.friendliness > 0.7) {
                    interaction.effects.push({
                        type: 'mood_boost',
                        target: 'both',
                        value: 10
                    });
                }
                break;
                
            case 'competition':
                if (personality1.energy > 0.6 || personality2.energy > 0.6) {
                    interaction.effects.push({
                        type: 'excitement_boost',
                        target: 'both',
                        value: 15
                    });
                }
                break;
        }
        
        return interaction;
    }
    
    /**
     * 应用互动效果
     */
    applyInteractionEffects(interaction, ghostsMap) {
        interaction.effects.forEach(effect => {
            const targets = effect.target === 'both' ? 
                interaction.participants : 
                [interaction.participants[0]];
                
            targets.forEach(ghostId => {
                const ghost = ghostsMap.get(ghostId);
                if (ghost) {
                    switch (effect.type) {
                        case 'mood_boost':
                            this.updateGhostMood(ghost, [{ type: 'social_interaction', value: effect.value }]);
                            break;
                        case 'excitement_boost':
                            if (ghost.mood) {
                                ghost.mood.excitement += effect.value;
                            }
                            break;
                    }
                }
            });
        });
    }
}

// 导出小鬼管理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GhostManager;
} else if (typeof window !== 'undefined') {
    window.GhostManager = GhostManager;
}