/**
 * 动画和视觉效果引擎
 * Animation and Visual Effects Engine
 * 
 * 负责处理游戏中的所有动画效果，包括瓦片移动、匹配效果、粒子系统等
 */

class AnimationEngine {
    constructor(container) {
        this.container = container;
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.particleSystem = new ParticleSystem(container);
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.animationId = null;
        
        // 动画配置
        this.config = {
            tileSwapDuration: 300,
            tileRemovalDuration: 500,
            gravityDuration: 400,
            spawnDuration: 600,
            particleLifetime: 2000,
            maxParticles: 100
        };
        
        // 缓动函数
        this.easingFunctions = {
            linear: t => t,
            easeIn: t => t * t,
            easeOut: t => t * (2 - t),
            easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            bounce: t => {
                if (t < 1/2.75) return 7.5625 * t * t;
                if (t < 2/2.75) return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
                if (t < 2.5/2.75) return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
                return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
            },
            elastic: t => {
                if (t === 0 || t === 1) return t;
                return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
            }
        };
        
        console.log('动画引擎初始化完成');
    }
    
    /**
     * 启动动画循环
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animationLoop();
        
        console.log('动画引擎启动');
    }
    
    /**
     * 停止动画循环
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        console.log('动画引擎停止');
    }
    
    /**
     * 动画主循环
     */
    animationLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // 更新所有动画
        this.updateAnimations(deltaTime);
        
        // 更新粒子系统
        this.particleSystem.update(deltaTime);
        
        // 处理动画队列
        this.processAnimationQueue();
        
        // 请求下一帧
        this.animationId = requestAnimationFrame(() => this.animationLoop());
    }
    
    /**
     * 更新所有活动动画
     */
    updateAnimations(deltaTime) {
        const completedAnimations = [];
        
        this.activeAnimations.forEach((animation, id) => {
            animation.elapsed += deltaTime;
            const progress = Math.min(animation.elapsed / animation.duration, 1);
            
            // 应用缓动函数
            const easedProgress = this.easingFunctions[animation.easing](progress);
            
            // 更新动画
            this.updateAnimation(animation, easedProgress);
            
            // 检查动画是否完成
            if (progress >= 1) {
                this.completeAnimation(animation);
                completedAnimations.push(id);
            }
        });
        
        // 移除已完成的动画
        completedAnimations.forEach(id => {
            this.activeAnimations.delete(id);
        });
    }
    
    /**
     * 更新单个动画
     */
    updateAnimation(animation, progress) {
        switch (animation.type) {
            case 'tileSwap':
                this.updateTileSwapAnimation(animation, progress);
                break;
            case 'tileRemoval':
                this.updateTileRemovalAnimation(animation, progress);
                break;
            case 'gravity':
                this.updateGravityAnimation(animation, progress);
                break;
            case 'spawn':
                this.updateSpawnAnimation(animation, progress);
                break;
            case 'special':
                this.updateSpecialAnimation(animation, progress);
                break;
            case 'selection':
                this.updateSelectionAnimation(animation, progress);
                break;
        }
    }
    
    /**
     * 瓦片交换动画
     */
    animateTileSwap(tile1Element, tile2Element, duration = null) {
        const animationDuration = duration || this.config.tileSwapDuration;
        const animationId = this.generateAnimationId();
        
        // 获取初始位置
        const rect1 = tile1Element.getBoundingClientRect();
        const rect2 = tile2Element.getBoundingClientRect();
        
        const animation = {
            id: animationId,
            type: 'tileSwap',
            duration: animationDuration,
            elapsed: 0,
            easing: 'easeInOut',
            elements: [tile1Element, tile2Element],
            startPositions: [
                { x: rect1.left, y: rect1.top },
                { x: rect2.left, y: rect2.top }
            ],
            endPositions: [
                { x: rect2.left, y: rect2.top },
                { x: rect1.left, y: rect1.top }
            ],
            onComplete: null
        };
        
        this.activeAnimations.set(animationId, animation);
        return animationId;
    }
    
    /**
     * 更新瓦片交换动画
     */
    updateTileSwapAnimation(animation, progress) {
        animation.elements.forEach((element, index) => {
            const start = animation.startPositions[index];
            const end = animation.endPositions[index];
            
            const currentX = start.x + (end.x - start.x) * progress;
            const currentY = start.y + (end.y - start.y) * progress;
            
            element.style.transform = `translate(${currentX - start.x}px, ${currentY - start.y}px)`;
            element.style.zIndex = '10';
        });
    }
    
    /**
     * 瓦片消除动画
     */
    animateTileRemoval(tileElements, matchType = 'normal') {
        const animationId = this.generateAnimationId();
        const duration = this.config.tileRemovalDuration;
        
        const animation = {
            id: animationId,
            type: 'tileRemoval',
            duration: duration,
            elapsed: 0,
            easing: 'easeOut',
            elements: tileElements,
            matchType: matchType,
            onComplete: () => {
                // 移除DOM元素
                tileElements.forEach(element => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                });
            }
        };
        
        // 创建粒子效果
        tileElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            this.particleSystem.createMatchEffect(centerX, centerY, matchType);
        });
        
        this.activeAnimations.set(animationId, animation);
        return animationId;
    }
    
    /**
     * 更新瓦片消除动画
     */
    updateTileRemovalAnimation(animation, progress) {
        const scale = 1 - progress;
        const opacity = 1 - progress;
        const rotation = progress * 360;
        
        animation.elements.forEach(element => {
            element.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            element.style.opacity = opacity;
            
            // 添加发光效果
            if (progress < 0.5) {
                const glowIntensity = progress * 2;
                element.style.filter = `drop-shadow(0 0 ${glowIntensity * 10}px rgba(255, 255, 255, ${glowIntensity}))`;
            }
        });
    }
    
    /**
     * 重力下落动画
     */
    animateGravity(movements) {
        const animationId = this.generateAnimationId();
        const duration = this.config.gravityDuration;
        
        const animation = {
            id: animationId,
            type: 'gravity',
            duration: duration,
            elapsed: 0,
            easing: 'bounce',
            movements: movements,
            onComplete: null
        };
        
        this.activeAnimations.set(animationId, animation);
        return animationId;
    }
    
    /**
     * 更新重力动画
     */
    updateGravityAnimation(animation, progress) {
        animation.movements.forEach(movement => {
            if (movement.element) {
                const startY = movement.from.y * this.getTileSize();
                const endY = movement.to.y * this.getTileSize();
                const currentY = startY + (endY - startY) * progress;
                
                movement.element.style.transform = `translateY(${currentY - startY}px)`;
            }
        });
    }
    
    /**
     * 新瓦片生成动画
     */
    animateSpawn(tileElements, spawnPositions) {
        const animationId = this.generateAnimationId();
        const duration = this.config.spawnDuration;
        
        const animation = {
            id: animationId,
            type: 'spawn',
            duration: duration,
            elapsed: 0,
            easing: 'bounce',
            elements: tileElements,
            spawnPositions: spawnPositions,
            onComplete: null
        };
        
        // 设置初始状态
        tileElements.forEach((element, index) => {
            const spawnPos = spawnPositions[index];
            element.style.transform = `translateY(${spawnPos.startY}px) scale(0)`;
            element.style.opacity = '0';
        });
        
        this.activeAnimations.set(animationId, animation);
        return animationId;
    }
    
    /**
     * 更新生成动画
     */
    updateSpawnAnimation(animation, progress) {
        animation.elements.forEach((element, index) => {
            const spawnPos = animation.spawnPositions[index];
            const translateY = spawnPos.startY * (1 - progress);
            const scale = progress;
            const opacity = progress;
            
            element.style.transform = `translateY(${translateY}px) scale(${scale})`;
            element.style.opacity = opacity;
        });
    }
    
    /**
     * 特殊效果动画
     */
    animateSpecialEffect(effectType, position, options = {}) {
        const animationId = this.generateAnimationId();
        
        switch (effectType) {
            case 'row_clear':
                return this.animateRowClear(position, options);
            case 'column_clear':
                return this.animateColumnClear(position, options);
            case 'explosion':
                return this.animateExplosion(position, options);
            case 'lightning':
                return this.animateLightning(position, options);
            case 'rainbow':
                return this.animateRainbow(position, options);
            default:
                console.warn(`未知的特殊效果类型: ${effectType}`);
                return null;
        }
    }
    
    /**
     * 行清除动画
     */
    animateRowClear(position, options) {
        const animationId = this.generateAnimationId();
        
        // 创建行清除效果元素
        const effectElement = document.createElement('div');
        effectElement.className = 'row-clear-effect';
        effectElement.style.cssText = `
            position: absolute;
            top: ${position.y * this.getTileSize()}px;
            left: 0;
            width: 100%;
            height: ${this.getTileSize()}px;
            background: linear-gradient(90deg, transparent, #FF4757, transparent);
            z-index: 20;
            pointer-events: none;
        `;
        
        this.container.appendChild(effectElement);
        
        const animation = {
            id: animationId,
            type: 'special',
            subType: 'row_clear',
            duration: 800,
            elapsed: 0,
            easing: 'easeOut',
            element: effectElement,
            onComplete: () => {
                if (effectElement.parentNode) {
                    effectElement.parentNode.removeChild(effectElement);
                }
            }
        };
        
        this.activeAnimations.set(animationId, animation);
        return animationId;
    }
    
    /**
     * 列清除动画
     */
    animateColumnClear(position, options) {
        const animationId = this.generateAnimationId();
        
        // 创建列清除效果元素
        const effectElement = document.createElement('div');
        effectElement.className = 'column-clear-effect';
        effectElement.style.cssText = `
            position: absolute;
            top: 0;
            left: ${position.x * this.getTileSize()}px;
            width: ${this.getTileSize()}px;
            height: 100%;
            background: linear-gradient(180deg, transparent, #3742FA, transparent);
            z-index: 20;
            pointer-events: none;
        `;
        
        this.container.appendChild(effectElement);
        
        const animation = {
            id: animationId,
            type: 'special',
            subType: 'column_clear',
            duration: 800,
            elapsed: 0,
            easing: 'easeOut',
            element: effectElement,
            onComplete: () => {
                if (effectElement.parentNode) {
                    effectElement.parentNode.removeChild(effectElement);
                }
            }
        };
        
        this.activeAnimations.set(animationId, animation);
        return animationId;
    }
    
    /**
     * 爆炸动画
     */
    animateExplosion(position, options) {
        const animationId = this.generateAnimationId();
        const radius = options.radius || 1;
        
        // 创建爆炸效果
        const centerX = position.x * this.getTileSize() + this.getTileSize() / 2;
        const centerY = position.y * this.getTileSize() + this.getTileSize() / 2;
        
        // 创建冲击波效果
        const shockwaveElement = document.createElement('div');
        shockwaveElement.className = 'explosion-shockwave';
        shockwaveElement.style.cssText = `
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 0;
            height: 0;
            border: 2px solid #FF6348;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            z-index: 15;
            pointer-events: none;
        `;
        
        this.container.appendChild(shockwaveElement);
        
        // 创建粒子爆炸效果
        this.particleSystem.createExplosion(centerX, centerY, radius);
        
        const animation = {
            id: animationId,
            type: 'special',
            subType: 'explosion',
            duration: 1000,
            elapsed: 0,
            easing: 'easeOut',
            element: shockwaveElement,
            radius: radius,
            centerX: centerX,
            centerY: centerY,
            onComplete: () => {
                if (shockwaveElement.parentNode) {
                    shockwaveElement.parentNode.removeChild(shockwaveElement);
                }
            }
        };
        
        this.activeAnimations.set(animationId, animation);
        return animationId;
    }
    
    /**
     * 更新特殊动画
     */
    updateSpecialAnimation(animation, progress) {
        switch (animation.subType) {
            case 'row_clear':
                animation.element.style.opacity = 1 - progress;
                animation.element.style.transform = `scaleX(${1 + progress})`;
                break;
                
            case 'column_clear':
                animation.element.style.opacity = 1 - progress;
                animation.element.style.transform = `scaleY(${1 + progress})`;
                break;
                
            case 'explosion':
                const maxRadius = animation.radius * this.getTileSize() * 2;
                const currentRadius = maxRadius * progress;
                animation.element.style.width = `${currentRadius}px`;
                animation.element.style.height = `${currentRadius}px`;
                animation.element.style.opacity = 1 - progress;
                break;
        }
    }
    
    /**
     * 选择动画
     */
    animateSelection(tileElement, selected = true) {
        const animationId = this.generateAnimationId();
        
        if (selected) {
            tileElement.classList.add('selected');
            
            const animation = {
                id: animationId,
                type: 'selection',
                duration: 300,
                elapsed: 0,
                easing: 'easeInOut',
                element: tileElement,
                selected: true,
                onComplete: null
            };
            
            this.activeAnimations.set(animationId, animation);
        } else {
            tileElement.classList.remove('selected');
            tileElement.style.transform = '';
            tileElement.style.filter = '';
        }
        
        return animationId;
    }
    
    /**
     * 更新选择动画
     */
    updateSelectionAnimation(animation, progress) {
        if (animation.selected) {
            const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.05;
            const glow = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
            
            animation.element.style.transform = `scale(${scale})`;
            animation.element.style.filter = `drop-shadow(0 0 ${glow * 10}px #FFD700)`;
        }
    }
    
    /**
     * 完成动画
     */
    completeAnimation(animation) {
        if (animation.onComplete) {
            animation.onComplete();
        }
        
        // 清理动画状态
        if (animation.elements) {
            animation.elements.forEach(element => {
                element.style.transform = '';
                element.style.opacity = '';
                element.style.filter = '';
                element.style.zIndex = '';
            });
        }
        
        if (animation.element) {
            animation.element.style.transform = '';
            animation.element.style.opacity = '';
            animation.element.style.filter = '';
        }
    }
    
    /**
     * 处理动画队列
     */
    processAnimationQueue() {
        while (this.animationQueue.length > 0 && this.activeAnimations.size < 10) {
            const queuedAnimation = this.animationQueue.shift();
            this.activeAnimations.set(queuedAnimation.id, queuedAnimation);
        }
    }
    
    /**
     * 添加动画到队列
     */
    queueAnimation(animation) {
        this.animationQueue.push(animation);
    }
    
    /**
     * 清除所有动画
     */
    clearAllAnimations() {
        this.activeAnimations.clear();
        this.animationQueue.length = 0;
        this.particleSystem.clear();
    }
    
    /**
     * 获取瓦片大小
     */
    getTileSize() {
        // 假设瓦片大小，实际应该从游戏配置获取
        return 60;
    }
    
    /**
     * 生成动画ID
     */
    generateAnimationId() {
        return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    
    /**
     * 设置动画配置
     */
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * 获取活动动画数量
     */
    getActiveAnimationCount() {
        return this.activeAnimations.size;
    }
    
    /**
     * 检查是否有活动动画
     */
    hasActiveAnimations() {
        return this.activeAnimations.size > 0 || this.animationQueue.length > 0;
    }
    
    /**
     * 销毁动画引擎
     */
    destroy() {
        this.stop();
        this.clearAllAnimations();
        this.particleSystem.destroy();
        
        console.log('动画引擎已销毁');
    }
}

// 导出动画引擎类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationEngine;
} else if (typeof window !== 'undefined') {
    window.AnimationEngine = AnimationEngine;
}