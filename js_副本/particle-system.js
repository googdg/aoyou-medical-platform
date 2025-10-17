/**
 * 粒子系统
 * Particle System
 * 
 * 负责创建和管理各种粒子效果
 */

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 200;
        this.particleId = 0;
        
        // 创建粒子容器
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particle-container';
        this.particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 25;
            overflow: hidden;
        `;
        
        if (this.container) {
            this.container.appendChild(this.particleContainer);
        }
        
        console.log('粒子系统初始化完成');
    }
    
    /**
     * 更新所有粒子
     */
    update(deltaTime) {
        const activeParticles = [];
        
        this.particles.forEach(particle => {
            this.updateParticle(particle, deltaTime);
            
            if (particle.life > 0) {
                activeParticles.push(particle);
            } else {
                this.recycleParticle(particle);
            }
        });
        
        this.particles = activeParticles;
    }
    
    /**
     * 更新单个粒子
     */
    updateParticle(particle, deltaTime) {
        // 更新生命周期
        particle.life -= deltaTime;
        particle.age += deltaTime;
        
        if (particle.life <= 0) return;
        
        // 更新位置
        particle.x += particle.velocityX * deltaTime / 1000;
        particle.y += particle.velocityY * deltaTime / 1000;
        
        // 应用重力
        if (particle.gravity) {
            particle.velocityY += particle.gravity * deltaTime / 1000;
        }
        
        // 应用阻力
        if (particle.friction) {
            particle.velocityX *= Math.pow(particle.friction, deltaTime / 1000);
            particle.velocityY *= Math.pow(particle.friction, deltaTime / 1000);
        }
        
        // 更新大小
        if (particle.scaleStart !== particle.scaleEnd) {
            const progress = 1 - (particle.life / particle.maxLife);
            particle.scale = particle.scaleStart + (particle.scaleEnd - particle.scaleStart) * progress;
        }
        
        // 更新透明度
        if (particle.alphaStart !== particle.alphaEnd) {
            const progress = 1 - (particle.life / particle.maxLife);
            particle.alpha = particle.alphaStart + (particle.alphaEnd - particle.alphaStart) * progress;
        }
        
        // 更新颜色
        if (particle.colorStart && particle.colorEnd) {
            const progress = 1 - (particle.life / particle.maxLife);
            particle.color = this.interpolateColor(particle.colorStart, particle.colorEnd, progress);
        }
        
        // 更新DOM元素
        this.updateParticleElement(particle);
    }
    
    /**
     * 更新粒子DOM元素
     */
    updateParticleElement(particle) {
        if (!particle.element) return;
        
        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) scale(${particle.scale}) rotate(${particle.rotation}deg)`;
        particle.element.style.opacity = particle.alpha;
        
        if (particle.color) {
            particle.element.style.backgroundColor = particle.color;
        }
        
        // 更新旋转
        if (particle.rotationSpeed) {
            particle.rotation += particle.rotationSpeed * 16.67 / 1000; // 假设60fps
        }
    }
    
    /**
     * 创建粒子
     */
    createParticle(config) {
        if (this.particles.length >= this.maxParticles) {
            return null;
        }
        
        let particle = this.getParticleFromPool();
        
        if (!particle) {
            particle = this.createNewParticle();
        }
        
        // 设置粒子属性
        particle.id = ++this.particleId;
        particle.x = config.x || 0;
        particle.y = config.y || 0;
        particle.velocityX = config.velocityX || 0;
        particle.velocityY = config.velocityY || 0;
        particle.life = config.life || 1000;
        particle.maxLife = particle.life;
        particle.age = 0;
        particle.scale = config.scale || 1;
        particle.scaleStart = config.scaleStart || particle.scale;
        particle.scaleEnd = config.scaleEnd || particle.scale;
        particle.alpha = config.alpha || 1;
        particle.alphaStart = config.alphaStart || particle.alpha;
        particle.alphaEnd = config.alphaEnd || 0;
        particle.color = config.color || '#ffffff';
        particle.colorStart = config.colorStart || null;
        particle.colorEnd = config.colorEnd || null;
        particle.rotation = config.rotation || 0;
        particle.rotationSpeed = config.rotationSpeed || 0;
        particle.gravity = config.gravity || 0;
        particle.friction = config.friction || 1;
        particle.type = config.type || 'default';
        
        // 设置DOM元素样式
        if (particle.element) {
            particle.element.className = `particle particle-${particle.type}`;
            particle.element.style.cssText = `
                position: absolute;
                width: ${config.size || 6}px;
                height: ${config.size || 6}px;
                background-color: ${particle.color};
                border-radius: 50%;
                pointer-events: none;
                transform-origin: center;
            `;
            
            // 特殊粒子样式
            if (particle.type === 'star') {
                particle.element.innerHTML = '★';
                particle.element.style.backgroundColor = 'transparent';
                particle.element.style.color = particle.color;
                particle.element.style.fontSize = `${config.size || 12}px`;
                particle.element.style.textAlign = 'center';
                particle.element.style.lineHeight = `${config.size || 12}px`;
            } else if (particle.type === 'sparkle') {
                particle.element.innerHTML = '✨';
                particle.element.style.backgroundColor = 'transparent';
                particle.element.style.fontSize = `${config.size || 10}px`;
            }
        }
        
        this.particles.push(particle);
        return particle;
    }
    
    /**
     * 创建新粒子对象
     */
    createNewParticle() {
        const element = document.createElement('div');
        this.particleContainer.appendChild(element);
        
        return {
            element: element,
            id: 0,
            x: 0, y: 0,
            velocityX: 0, velocityY: 0,
            life: 0, maxLife: 0, age: 0,
            scale: 1, scaleStart: 1, scaleEnd: 1,
            alpha: 1, alphaStart: 1, alphaEnd: 0,
            color: '#ffffff', colorStart: null, colorEnd: null,
            rotation: 0, rotationSpeed: 0,
            gravity: 0, friction: 1,
            type: 'default'
        };
    }
    
    /**
     * 从对象池获取粒子
     */
    getParticleFromPool() {
        return this.particlePool.pop() || null;
    }
    
    /**
     * 回收粒子到对象池
     */
    recycleParticle(particle) {
        if (particle.element) {
            particle.element.style.display = 'none';
        }
        
        if (this.particlePool.length < 50) {
            this.particlePool.push(particle);
        }
    }
    
    /**
     * 创建匹配效果
     */
    createMatchEffect(x, y, matchType = 'normal') {
        const particleCount = matchType === 'special' ? 15 : 8;
        const colors = this.getMatchColors(matchType);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 50 + Math.random() * 100;
            const size = 4 + Math.random() * 4;
            
            this.createParticle({
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 800 + Math.random() * 400,
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                scaleStart: 1,
                scaleEnd: 0,
                alphaStart: 1,
                alphaEnd: 0,
                gravity: 20,
                friction: 0.98,
                type: matchType === 'special' ? 'star' : 'default'
            });
        }
    }
    
    /**
     * 创建爆炸效果
     */
    createExplosion(x, y, radius = 1) {
        const particleCount = 20 + radius * 10;
        const colors = ['#FF6B6B', '#FF8E53', '#FF6348', '#FFD93D', '#6BCF7F'];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 200;
            const size = 3 + Math.random() * 6;
            const distance = Math.random() * radius * 50;
            
            this.createParticle({
                x: x + Math.cos(angle) * distance * 0.3,
                y: y + Math.sin(angle) * distance * 0.3,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 600 + Math.random() * 800,
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                scaleStart: 1.5,
                scaleEnd: 0,
                alphaStart: 1,
                alphaEnd: 0,
                gravity: 50,
                friction: 0.95,
                rotationSpeed: (Math.random() - 0.5) * 360,
                type: 'default'
            });
        }
        
        // 添加冲击波粒子
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 200 + Math.random() * 100;
            
            this.createParticle({
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 400,
                size: 8,
                color: '#FFFFFF',
                scaleStart: 0.5,
                scaleEnd: 2,
                alphaStart: 0.8,
                alphaEnd: 0,
                friction: 0.9,
                type: 'default'
            });
        }
    }
    
    /**
     * 创建彩虹效果
     */
    createRainbowEffect(x, y) {
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 120;
            const size = 6 + Math.random() * 4;
            
            this.createParticle({
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1200 + Math.random() * 600,
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                scaleStart: 1,
                scaleEnd: 0.2,
                alphaStart: 1,
                alphaEnd: 0,
                gravity: 30,
                friction: 0.97,
                rotationSpeed: (Math.random() - 0.5) * 180,
                type: 'sparkle'
            });
        }
    }
    
    /**
     * 创建闪电效果
     */
    createLightningEffect(startX, startY, endX, endY) {
        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const particleCount = Math.floor(distance / 10);
        
        for (let i = 0; i < particleCount; i++) {
            const progress = i / particleCount;
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;
            
            // 添加随机偏移
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            
            this.createParticle({
                x: x + offsetX,
                y: y + offsetY,
                velocityX: (Math.random() - 0.5) * 50,
                velocityY: (Math.random() - 0.5) * 50,
                life: 300 + Math.random() * 200,
                size: 3 + Math.random() * 3,
                color: '#FFD700',
                scaleStart: 1.5,
                scaleEnd: 0,
                alphaStart: 1,
                alphaEnd: 0,
                friction: 0.95,
                type: 'star'
            });
        }
    }
    
    /**
     * 创建连击效果
     */
    createComboEffect(x, y, comboCount) {
        const particleCount = Math.min(comboCount * 5, 30);
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF1493'];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 80;
            const size = 5 + Math.random() * 5;
            
            this.createParticle({
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed - 50, // 向上偏移
                life: 1000 + Math.random() * 500,
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                scaleStart: 1.2,
                scaleEnd: 0,
                alphaStart: 1,
                alphaEnd: 0,
                gravity: 40,
                friction: 0.98,
                rotationSpeed: (Math.random() - 0.5) * 270,
                type: 'star'
            });
        }
    }
    
    /**
     * 获取匹配颜色
     */
    getMatchColors(matchType) {
        const colorSets = {
            'normal': ['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            'special': ['#FFD700', '#FFA500', '#FF6347', '#FF1493'],
            'combo': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
        };
        
        return colorSets[matchType] || colorSets['normal'];
    }
    
    /**
     * 颜色插值
     */
    interpolateColor(color1, color2, progress) {
        // 简化的颜色插值实现
        const r1 = parseInt(color1.substr(1, 2), 16);
        const g1 = parseInt(color1.substr(3, 2), 16);
        const b1 = parseInt(color1.substr(5, 2), 16);
        
        const r2 = parseInt(color2.substr(1, 2), 16);
        const g2 = parseInt(color2.substr(3, 2), 16);
        const b2 = parseInt(color2.substr(5, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * progress);
        const g = Math.round(g1 + (g2 - g1) * progress);
        const b = Math.round(b1 + (b2 - b1) * progress);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * 清除所有粒子
     */
    clear() {
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        
        this.particles.length = 0;
        this.particlePool.length = 0;
    }
    
    /**
     * 获取活动粒子数量
     */
    getActiveParticleCount() {
        return this.particles.length;
    }
    
    /**
     * 设置最大粒子数量
     */
    setMaxParticles(max) {
        this.maxParticles = max;
    }
    
    /**
     * 销毁粒子系统
     */
    destroy() {
        this.clear();
        
        if (this.particleContainer && this.particleContainer.parentNode) {
            this.particleContainer.parentNode.removeChild(this.particleContainer);
        }
        
        console.log('粒子系统已销毁');
    }
}

// 导出粒子系统类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
} else if (typeof window !== 'undefined') {
    window.ParticleSystem = ParticleSystem;
}