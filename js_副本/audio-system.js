/**
 * 音频系统 (Audio System)
 * 坦克大战游戏的音效和背景音乐管理系统
 */

// 音频类型枚举
const AudioType = {
    SFX: 'sfx',           // 音效
    MUSIC: 'music',       // 背景音乐
    VOICE: 'voice',       // 语音
    AMBIENT: 'ambient'    // 环境音
};

// 音频状态
const AudioState = {
    LOADING: 'loading',
    READY: 'ready',
    PLAYING: 'playing',
    PAUSED: 'paused',
    STOPPED: 'stopped',
    ERROR: 'error'
};

// 音频淡入淡出类型
const FadeType = {
    FADE_IN: 'fade_in',
    FADE_OUT: 'fade_out',
    CROSS_FADE: 'cross_fade'
};

// 音频配置
const AudioConfig = {
    // 音效配置
    SFX: {
        tank_move: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.3,
            loop: true,
            category: 'movement'
        },
        tank_fire: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.6,
            loop: false,
            category: 'combat'
        },
        tank_hit: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.7,
            loop: false,
            category: 'combat'
        },
        tank_explosion: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.8,
            loop: false,
            category: 'combat'
        },
        powerup_collect: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.5,
            loop: false,
            category: 'ui'
        },
        level_complete: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.7,
            loop: false,
            category: 'ui'
        },
        game_over: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.6,
            loop: false,
            category: 'ui'
        },
        menu_select: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.4,
            loop: false,
            category: 'ui'
        }
    },
    
    // 背景音乐配置
    MUSIC: {
        main_theme: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.3,
            loop: true,
            category: 'background'
        },
        battle_theme: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.4,
            loop: true,
            category: 'background'
        },
        boss_theme: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.5,
            loop: true,
            category: 'background'
        },
        victory_theme: {
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            volume: 0.6,
            loop: false,
            category: 'background'
        }
    }
};

// 音频实例类
class AudioInstance {
    constructor(id, config, audioContext = null) {
        this.id = id;
        this.config = config;
        this.audioContext = audioContext;
        
        // 音频元素
        this.audio = null;
        this.source = null;
        this.gainNode = null;
        
        // 状态
        this.state = AudioState.LOADING;
        this.volume = config.volume || 1.0;
        this.originalVolume = this.volume;
        this.loop = config.loop || false;
        this.category = config.category || 'default';
        
        // 淡入淡出
        this.fadeTarget = null;
        this.fadeSpeed = 0.02;
        this.fadeCallback = null;
        
        // 播放控制
        this.startTime = 0;
        this.pauseTime = 0;
        this.duration = 0;
        
        // 3D音频属性
        this.position = { x: 0, y: 0, z: 0 };
        this.maxDistance = 1000;
        this.rolloffFactor = 1;
        
        this.load();
    }

    // 加载音频
    async load() {
        try {
            this.audio = new Audio();
            this.audio.src = this.config.url;
            this.audio.loop = this.loop;
            this.audio.volume = this.volume;
            
            // 设置事件监听器
            this.audio.addEventListener('loadeddata', () => {
                this.duration = this.audio.duration;
                this.state = AudioState.READY;
                console.log(`🎵 音频加载完成: ${this.id}`);
            });
            
            this.audio.addEventListener('error', (e) => {
                this.state = AudioState.ERROR;
                console.error(`❌ 音频加载失败: ${this.id}`, e);
            });
            
            this.audio.addEventListener('ended', () => {
                if (!this.loop) {
                    this.state = AudioState.STOPPED;
                }
            });
            
            // 如果有AudioContext，创建Web Audio API节点
            if (this.audioContext) {
                this.setupWebAudio();
            }
            
            // 预加载
            this.audio.load();
            
        } catch (error) {
            this.state = AudioState.ERROR;
            console.error(`❌ 音频初始化失败: ${this.id}`, error);
        }
    }

    // 设置Web Audio API
    setupWebAudio() {
        try {
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.gainNode = this.audioContext.createGain();
            
            this.source.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            this.gainNode.gain.value = this.volume;
        } catch (error) {
            console.warn(`⚠️ Web Audio API设置失败: ${this.id}`, error);
        }
    }

    // 播放音频
    play(volume = null, loop = null) {
        if (this.state !== AudioState.READY && this.state !== AudioState.PAUSED) {
            console.warn(`⚠️ 音频未准备好: ${this.id} (${this.state})`);
            return false;
        }
        
        try {
            if (volume !== null) {
                this.setVolume(volume);
            }
            
            if (loop !== null) {
                this.audio.loop = loop;
            }
            
            this.audio.currentTime = this.pauseTime;
            this.audio.play();
            this.state = AudioState.PLAYING;
            this.startTime = Date.now() - (this.pauseTime * 1000);
            this.pauseTime = 0;
            
            return true;
        } catch (error) {
            console.error(`❌ 音频播放失败: ${this.id}`, error);
            return false;
        }
    }

    // 暂停音频
    pause() {
        if (this.state !== AudioState.PLAYING) return false;
        
        try {
            this.audio.pause();
            this.state = AudioState.PAUSED;
            this.pauseTime = this.audio.currentTime;
            return true;
        } catch (error) {
            console.error(`❌ 音频暂停失败: ${this.id}`, error);
            return false;
        }
    }

    // 停止音频
    stop() {
        if (this.state === AudioState.STOPPED) return false;
        
        try {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.state = AudioState.STOPPED;
            this.pauseTime = 0;
            return true;
        } catch (error) {
            console.error(`❌ 音频停止失败: ${this.id}`, error);
            return false;
        }
    }

    // 设置音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
    }

    // 淡入
    fadeIn(duration = 1000, targetVolume = null) {
        const target = targetVolume !== null ? targetVolume : this.originalVolume;
        this.fade(0, target, duration, FadeType.FADE_IN);
    }

    // 淡出
    fadeOut(duration = 1000, callback = null) {
        this.fade(this.volume, 0, duration, FadeType.FADE_OUT, callback);
    }

    // 淡入淡出
    fade(startVolume, endVolume, duration, type, callback = null) {
        this.setVolume(startVolume);
        this.fadeTarget = endVolume;
        this.fadeSpeed = (endVolume - startVolume) / (duration / 16); // 60fps
        this.fadeCallback = callback;
        
        if (type === FadeType.FADE_IN && this.state === AudioState.READY) {
            this.play();
        }
        
        this.updateFade();
    }

    // 更新淡入淡出
    updateFade() {
        if (this.fadeTarget === null) return;
        
        const currentVolume = this.volume;
        const targetVolume = this.fadeTarget;
        
        if (Math.abs(currentVolume - targetVolume) < Math.abs(this.fadeSpeed)) {
            // 淡入淡出完成
            this.setVolume(targetVolume);
            this.fadeTarget = null;
            
            if (targetVolume === 0) {
                this.stop();
            }
            
            if (this.fadeCallback) {
                this.fadeCallback();
                this.fadeCallback = null;
            }
        } else {
            // 继续淡入淡出
            this.setVolume(currentVolume + this.fadeSpeed);
            requestAnimationFrame(() => this.updateFade());
        }
    }

    // 设置3D位置
    setPosition(x, y, z = 0) {
        this.position = { x, y, z };
        
        // 如果有Web Audio API支持，可以实现真正的3D音频
        // 这里简化为基于距离的音量调节
        if (typeof window !== 'undefined' && window.game && window.game.playerTank) {
            const playerTransform = window.game.playerTank.getComponent('Transform');
            if (playerTransform) {
                const distance = Math.sqrt(
                    (x - playerTransform.x) ** 2 + (y - playerTransform.y) ** 2
                );
                
                const volumeMultiplier = Math.max(0, 1 - (distance / this.maxDistance));
                this.setVolume(this.originalVolume * volumeMultiplier);
            }
        }
    }

    // 获取播放进度
    getProgress() {
        if (!this.audio || this.duration === 0) return 0;
        return this.audio.currentTime / this.duration;
    }

    // 获取剩余时间
    getRemainingTime() {
        if (!this.audio) return 0;
        return Math.max(0, this.duration - this.audio.currentTime);
    }

    // 跳转到指定时间
    seekTo(time) {
        if (!this.audio) return false;
        
        try {
            this.audio.currentTime = Math.max(0, Math.min(this.duration, time));
            return true;
        } catch (error) {
            console.error(`❌ 音频跳转失败: ${this.id}`, error);
            return false;
        }
    }

    // 销毁音频实例
    destroy() {
        this.stop();
        
        if (this.audio) {
            this.audio.src = '';
            this.audio = null;
        }
        
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        
        this.state = AudioState.STOPPED;
    }
}

// 音频管理器
class AudioManager {
    constructor() {
        // 音频上下文
        this.audioContext = null;
        this.masterGainNode = null;
        
        // 音频实例
        this.audioInstances = new Map();
        this.audioGroups = new Map();
        
        // 音量控制
        this.masterVolume = 1.0;
        this.categoryVolumes = {
            sfx: 1.0,
            music: 0.7,
            voice: 1.0,
            ambient: 0.5,
            ui: 0.8,
            movement: 0.6,
            combat: 0.9,
            background: 0.4
        };
        
        // 设置
        this.enabled = true;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // 当前播放的背景音乐
        this.currentMusic = null;
        this.musicQueue = [];
        
        // 音频池（用于频繁播放的音效）
        this.audioPools = new Map();
        
        // 统计信息
        this.stats = {
            totalLoaded: 0,
            totalPlaying: 0,
            totalErrors: 0,
            memoryUsage: 0
        };
        
        this.initialize();
    }

    // 初始化音频系统
    async initialize() {
        try {
            // 尝试创建AudioContext
            if (typeof AudioContext !== 'undefined') {
                this.audioContext = new AudioContext();
                this.masterGainNode = this.audioContext.createGain();
                this.masterGainNode.connect(this.audioContext.destination);
                this.masterGainNode.gain.value = this.masterVolume;
                
                console.log('🎵 Web Audio API初始化成功');
            } else {
                console.warn('⚠️ Web Audio API不支持，使用HTML5 Audio');
            }
            
            // 加载音频配置
            await this.loadAudioConfig();
            
            // 创建音频池
            this.createAudioPools();
            
            // 加载设置
            this.loadSettings();
            
            console.log('🎵 音频系统初始化完成');
            
        } catch (error) {
            console.error('❌ 音频系统初始化失败:', error);
        }
    }

    // 加载音频配置
    async loadAudioConfig() {
        // 加载音效
        for (const [id, config] of Object.entries(AudioConfig.SFX)) {
            await this.loadAudio(id, config, AudioType.SFX);
        }
        
        // 加载背景音乐
        for (const [id, config] of Object.entries(AudioConfig.MUSIC)) {
            await this.loadAudio(id, config, AudioType.MUSIC);
        }
        
        console.log(`🎵 加载了${this.audioInstances.size}个音频文件`);
    }

    // 加载单个音频
    async loadAudio(id, config, type) {
        try {
            const audioInstance = new AudioInstance(id, config, this.audioContext);
            this.audioInstances.set(id, audioInstance);
            
            // 按类型分组
            if (!this.audioGroups.has(type)) {
                this.audioGroups.set(type, new Set());
            }
            this.audioGroups.get(type).add(id);
            
            this.stats.totalLoaded++;
            
            return audioInstance;
        } catch (error) {
            console.error(`❌ 音频加载失败: ${id}`, error);
            this.stats.totalErrors++;
            return null;
        }
    }

    // 创建音频池
    createAudioPools() {
        // 为频繁使用的音效创建对象池
        const poolConfigs = [
            { id: 'tank_fire', size: 5 },
            { id: 'tank_hit', size: 3 },
            { id: 'tank_explosion', size: 3 }
        ];
        
        for (const poolConfig of poolConfigs) {
            const pool = [];
            const originalConfig = AudioConfig.SFX[poolConfig.id];
            
            if (originalConfig) {
                for (let i = 0; i < poolConfig.size; i++) {
                    const instance = new AudioInstance(
                        `${poolConfig.id}_pool_${i}`, 
                        originalConfig, 
                        this.audioContext
                    );
                    pool.push(instance);
                }
                
                this.audioPools.set(poolConfig.id, pool);
                console.log(`🎵 创建音频池: ${poolConfig.id} (${poolConfig.size}个实例)`);
            }
        }
    }

    // 播放音效
    playSFX(id, options = {}) {
        if (!this.enabled || !this.sfxEnabled) return null;
        
        // 尝试从对象池获取
        if (this.audioPools.has(id)) {
            const pool = this.audioPools.get(id);
            const availableInstance = pool.find(instance => 
                instance.state === AudioState.READY || instance.state === AudioState.STOPPED);
            
            if (availableInstance) {
                return this.playAudioInstance(availableInstance, options);
            }
        }
        
        // 从普通实例播放
        const instance = this.audioInstances.get(id);
        if (instance) {
            return this.playAudioInstance(instance, options);
        }
        
        console.warn(`⚠️ 音效不存在: ${id}`);
        return null;
    }

    // 播放背景音乐
    playMusic(id, options = {}) {
        if (!this.enabled || !this.musicEnabled) return null;
        
        const instance = this.audioInstances.get(id);
        if (!instance) {
            console.warn(`⚠️ 背景音乐不存在: ${id}`);
            return null;
        }
        
        // 停止当前音乐
        if (this.currentMusic && this.currentMusic !== instance) {
            if (options.crossFade) {
                this.currentMusic.fadeOut(options.fadeTime || 1000);
            } else {
                this.currentMusic.stop();
            }
        }
        
        this.currentMusic = instance;
        
        // 播放新音乐
        if (options.fadeIn) {
            instance.fadeIn(options.fadeTime || 1000);
        } else {
            this.playAudioInstance(instance, options);
        }
        
        return instance;
    }

    // 播放音频实例
    playAudioInstance(instance, options = {}) {
        if (!instance) return null;
        
        // 应用选项
        const volume = options.volume !== undefined ? options.volume : instance.originalVolume;
        const loop = options.loop !== undefined ? options.loop : instance.loop;
        
        // 应用分类音量
        const categoryVolume = this.categoryVolumes[instance.category] || 1.0;
        const finalVolume = volume * categoryVolume * this.masterVolume;
        
        // 设置3D位置
        if (options.position) {
            instance.setPosition(options.position.x, options.position.y, options.position.z);
        }
        
        // 播放
        if (instance.play(finalVolume, loop)) {
            this.stats.totalPlaying++;
            return instance;
        }
        
        return null;
    }

    // 停止音效
    stopSFX(id) {
        const instance = this.audioInstances.get(id);
        if (instance) {
            instance.stop();
            return true;
        }
        return false;
    }

    // 停止背景音乐
    stopMusic(fadeOut = false, fadeTime = 1000) {
        if (this.currentMusic) {
            if (fadeOut) {
                this.currentMusic.fadeOut(fadeTime, () => {
                    this.currentMusic = null;
                });
            } else {
                this.currentMusic.stop();
                this.currentMusic = null;
            }
            return true;
        }
        return false;
    }

    // 暂停所有音频
    pauseAll() {
        for (const instance of this.audioInstances.values()) {
            if (instance.state === AudioState.PLAYING) {
                instance.pause();
            }
        }
        
        for (const pool of this.audioPools.values()) {
            for (const instance of pool) {
                if (instance.state === AudioState.PLAYING) {
                    instance.pause();
                }
            }
        }
    }

    // 恢复所有音频
    resumeAll() {
        for (const instance of this.audioInstances.values()) {
            if (instance.state === AudioState.PAUSED) {
                instance.play();
            }
        }
        
        for (const pool of this.audioPools.values()) {
            for (const instance of pool) {
                if (instance.state === AudioState.PAUSED) {
                    instance.play();
                }
            }
        }
    }

    // 停止所有音频
    stopAll() {
        for (const instance of this.audioInstances.values()) {
            instance.stop();
        }
        
        for (const pool of this.audioPools.values()) {
            for (const instance of pool) {
                instance.stop();
            }
        }
        
        this.currentMusic = null;
        this.stats.totalPlaying = 0;
    }

    // 设置主音量
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
        
        // 更新所有实例的音量
        this.updateAllVolumes();
        this.saveSettings();
    }

    // 设置分类音量
    setCategoryVolume(category, volume) {
        this.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
    }

    // 更新所有音量
    updateAllVolumes() {
        for (const instance of this.audioInstances.values()) {
            if (instance.state === AudioState.PLAYING) {
                const categoryVolume = this.categoryVolumes[instance.category] || 1.0;
                const finalVolume = instance.originalVolume * categoryVolume * this.masterVolume;
                instance.setVolume(finalVolume);
            }
        }
    }

    // 启用/禁用音频
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            this.stopAll();
        }
        
        this.saveSettings();
    }

    // 启用/禁用音乐
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        
        if (!enabled && this.currentMusic) {
            this.stopMusic();
        }
        
        this.saveSettings();
    }

    // 启用/禁用音效
    setSFXEnabled(enabled) {
        this.sfxEnabled = enabled;
        
        if (!enabled) {
            // 停止所有音效
            for (const [id, instance] of this.audioInstances) {
                if (instance.category !== 'background') {
                    instance.stop();
                }
            }
        }
        
        this.saveSettings();
    }

    // 获取音频信息
    getAudioInfo(id) {
        const instance = this.audioInstances.get(id);
        if (!instance) return null;
        
        return {
            id: instance.id,
            state: instance.state,
            volume: instance.volume,
            duration: instance.duration,
            progress: instance.getProgress(),
            remainingTime: instance.getRemainingTime(),
            category: instance.category,
            loop: instance.loop
        };
    }

    // 获取统计信息
    getStats() {
        // 更新播放中的音频数量
        let playing = 0;
        for (const instance of this.audioInstances.values()) {
            if (instance.state === AudioState.PLAYING) {
                playing++;
            }
        }
        
        for (const pool of this.audioPools.values()) {
            for (const instance of pool) {
                if (instance.state === AudioState.PLAYING) {
                    playing++;
                }
            }
        }
        
        this.stats.totalPlaying = playing;
        
        return {
            ...this.stats,
            totalInstances: this.audioInstances.size,
            poolInstances: Array.from(this.audioPools.values()).reduce((sum, pool) => sum + pool.length, 0),
            masterVolume: this.masterVolume,
            enabled: this.enabled,
            musicEnabled: this.musicEnabled,
            sfxEnabled: this.sfxEnabled,
            currentMusic: this.currentMusic ? this.currentMusic.id : null
        };
    }

    // 保存设置
    saveSettings() {
        try {
            const settings = {
                masterVolume: this.masterVolume,
                categoryVolumes: this.categoryVolumes,
                enabled: this.enabled,
                musicEnabled: this.musicEnabled,
                sfxEnabled: this.sfxEnabled
            };
            
            localStorage.setItem('tankBattle_audioSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('⚠️ 无法保存音频设置:', error);
        }
    }

    // 加载设置
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('tankBattle_audioSettings') || '{}');
            
            if (settings.masterVolume !== undefined) {
                this.setMasterVolume(settings.masterVolume);
            }
            
            if (settings.categoryVolumes) {
                Object.assign(this.categoryVolumes, settings.categoryVolumes);
            }
            
            if (settings.enabled !== undefined) {
                this.enabled = settings.enabled;
            }
            
            if (settings.musicEnabled !== undefined) {
                this.musicEnabled = settings.musicEnabled;
            }
            
            if (settings.sfxEnabled !== undefined) {
                this.sfxEnabled = settings.sfxEnabled;
            }
            
            console.log('🎵 音频设置已加载');
        } catch (error) {
            console.warn('⚠️ 无法加载音频设置:', error);
        }
    }

    // 销毁音频管理器
    destroy() {
        this.stopAll();
        
        // 销毁所有实例
        for (const instance of this.audioInstances.values()) {
            instance.destroy();
        }
        
        for (const pool of this.audioPools.values()) {
            for (const instance of pool) {
                instance.destroy();
            }
        }
        
        // 清理AudioContext
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.audioInstances.clear();
        this.audioGroups.clear();
        this.audioPools.clear();
        
        console.log('🎵 音频系统已销毁');
    }
}

// 导出音频系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AudioType,
        AudioState,
        FadeType,
        AudioConfig,
        AudioInstance,
        AudioManager
    };
} else {
    // 浏览器环境
    window.AudioSystem = {
        AudioType,
        AudioState,
        FadeType,
        AudioConfig,
        AudioInstance,
        AudioManager
    };
}