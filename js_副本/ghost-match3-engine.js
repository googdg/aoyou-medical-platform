/**
 * 小鬼消消乐游戏引擎
 * Little Ghost Match-3 Game Engine
 * 
 * 核心游戏引擎，协调所有游戏系统的运行
 */

class GhostMatch3Engine {
    constructor(container, options = {}) {
        this.container = container;
        this.gridSize = options.gridSize || { width: 8, height: 8 };
        this.ghostTypes = options.ghostTypes || 6;
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.isGameActive = false;
        this.selectedTile = null;
        
        // 初始化子系统
        this.gridManager = null;
        this.ghostManager = null;
        this.scoreManager = null;
        this.animationEngine = null;
        this.inputHandler = null;
        this.storageManager = null;
        
        // 游戏状态
        this.gameState = {
            grid: null,
            score: 0,
            level: 1,
            moves: 30,
            timeElapsed: 0,
            isGameActive: false,
            selectedTile: null,
            animations: [],
            powerUps: [],
            highScore: 0
        };
        
        // 事件监听器
        this.eventListeners = new Map();
        
        this.initialize();
    }
    
    /**
     * 初始化游戏引擎
     */
    async initialize() {
        try {
            console.log('初始化小鬼消消乐游戏引擎...');
            
            // 等待依赖模块加载完成后再初始化子系统
            this.setupEventSystem();
            this.createGameContainer();
            
            console.log('游戏引擎初始化完成');
            this.emit('engineInitialized');
            
        } catch (error) {
            console.error('游戏引擎初始化失败:', error);
            this.handleError('INITIALIZATION_ERROR', error);
        }
    }
    
    /**
     * 初始化子系统（延迟加载）
     */
    async initializeSubSystems() {
        // 这些将在各自的模块创建后进行初始化
        // this.gridManager = new GridManager(this.gridSize);
        // this.ghostManager = new GhostManager(this.ghostTypes);
        // this.scoreManager = new ScoreManager();
        // this.animationEngine = new AnimationEngine();
        // this.inputHandler = new InputHandler(this);
        // this.storageManager = new GameStorageManager();
    }
    
    /**
     * 创建游戏容器
     */
    createGameContainer() {
        if (!this.container) {
            throw new Error('游戏容器未指定');
        }
        
        this.container.innerHTML = `
            <div class="ghost-match3-game">
                <div class="game-header">
                    <div class="game-info">
                        <span class="score">分数: <span id="current-score">0</span></span>
                        <span class="level">关卡: <span id="current-level">1</span></span>
                        <span class="moves">移动: <span id="remaining-moves">30</span></span>
                    </div>
                </div>
                <div class="game-board" id="game-board">
                    <!-- 游戏网格将在这里生成 -->
                </div>
                <div class="game-controls">
                    <button id="pause-btn" class="game-btn">暂停</button>
                    <button id="restart-btn" class="game-btn">重新开始</button>
                    <button id="hint-btn" class="game-btn">提示</button>
                </div>
                <div class="game-messages" id="game-messages">
                    <!-- 游戏消息显示区域 -->
                </div>
            </div>
        `;
        
        this.gameBoard = this.container.querySelector('#game-board');
        this.setupControlButtons();
    }
    
    /**
     * 设置控制按钮
     */
    setupControlButtons() {
        const pauseBtn = this.container.querySelector('#pause-btn');
        const restartBtn = this.container.querySelector('#restart-btn');
        const hintBtn = this.container.querySelector('#hint-btn');
        
        pauseBtn?.addEventListener('click', () => this.pauseGame());
        restartBtn?.addEventListener('click', () => this.restartGame());
        hintBtn?.addEventListener('click', () => this.showHint());
    }
    
    /**
     * 开始新游戏
     */
    startNewGame() {
        console.log('开始新游戏');
        this.resetGameState();
        this.isGameActive = true;
        this.emit('gameStarted');
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        this.isGameActive = false;
        this.emit('gamePaused');
    }
    
    /**
     * 恢复游戏
     */
    resumeGame() {
        this.isGameActive = true;
        this.emit('gameResumed');
    }
    
    /**
     * 重新开始游戏
     */
    restartGame() {
        this.resetGameState();
        this.startNewGame();
    }
    
    /**
     * 显示提示
     */
    showHint() {
        // 提示逻辑将在后续实现
        this.emit('hintRequested');
    }
    
    /**
     * 重置游戏状态
     */
    resetGameState() {
        this.gameState = {
            grid: null,
            score: 0,
            level: 1,
            moves: 30,
            timeElapsed: 0,
            isGameActive: false,
            selectedTile: null,
            animations: [],
            powerUps: [],
            highScore: this.gameState.highScore || 0
        };
        
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.selectedTile = null;
        
        this.updateUI();
    }
    
    /**
     * 更新用户界面
     */
    updateUI() {
        const scoreElement = this.container.querySelector('#current-score');
        const levelElement = this.container.querySelector('#current-level');
        const movesElement = this.container.querySelector('#remaining-moves');
        
        if (scoreElement) scoreElement.textContent = this.gameState.score;
        if (levelElement) levelElement.textContent = this.gameState.level;
        if (movesElement) movesElement.textContent = this.gameState.moves;
    }
    
    /**
     * 游戏主循环更新
     */
    update(deltaTime) {
        if (!this.isGameActive) return;
        
        // 更新动画
        if (this.animationEngine) {
            this.animationEngine.updateAnimations(deltaTime);
        }
        
        // 更新游戏逻辑
        this.gameState.timeElapsed += deltaTime;
        
        // 检查游戏结束条件
        this.checkGameEndConditions();
    }
    
    /**
     * 渲染游戏
     */
    render() {
        if (!this.isGameActive) return;
        
        // 渲染逻辑将在网格管理器实现后添加
        this.updateUI();
    }
    
    /**
     * 检查游戏结束条件
     */
    checkGameEndConditions() {
        if (this.gameState.moves <= 0) {
            this.endGame('NO_MOVES');
        }
        
        // 检查是否达到关卡目标
        const targetScore = this.level * 1000;
        if (this.gameState.score >= targetScore) {
            this.completeLevel();
        }
    }
    
    /**
     * 完成关卡
     */
    completeLevel() {
        this.level++;
        this.gameState.level = this.level;
        this.moves += 20; // 增加移动次数
        this.gameState.moves = this.moves;
        
        this.emit('levelCompleted', { level: this.level });
        this.showMessage(`恭喜！完成关卡 ${this.level - 1}！`);
    }
    
    /**
     * 结束游戏
     */
    endGame(reason) {
        this.isGameActive = false;
        this.gameState.isGameActive = false;
        
        // 更新最高分
        if (this.gameState.score > this.gameState.highScore) {
            this.gameState.highScore = this.gameState.score;
        }
        
        this.emit('gameEnded', { reason, score: this.gameState.score });
        this.showGameOverScreen();
    }
    
    /**
     * 显示游戏结束屏幕
     */
    showGameOverScreen() {
        const message = `
            <div class="game-over-screen">
                <h2>游戏结束</h2>
                <p>最终分数: ${this.gameState.score}</p>
                <p>最高分数: ${this.gameState.highScore}</p>
                <button onclick="this.restartGame()" class="game-btn">再玩一次</button>
            </div>
        `;
        this.showMessage(message);
    }
    
    /**
     * 显示消息
     */
    showMessage(message, duration = 3000) {
        const messagesContainer = this.container.querySelector('#game-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = message;
            messagesContainer.style.display = 'block';
            
            if (duration > 0) {
                setTimeout(() => {
                    messagesContainer.style.display = 'none';
                }, duration);
            }
        }
    }
    
    /**
     * 设置事件系统
     */
    setupEventSystem() {
        // 事件发射器模式
    }
    
    /**
     * 发射事件
     */
    emit(eventName, data = null) {
        const listeners = this.eventListeners.get(eventName) || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`事件监听器错误 (${eventName}):`, error);
            }
        });
    }
    
    /**
     * 添加事件监听器
     */
    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }
    
    /**
     * 移除事件监听器
     */
    off(eventName, callback) {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    /**
     * 错误处理
     */
    handleError(errorType, error) {
        console.error(`游戏错误 (${errorType}):`, error);
        this.emit('gameError', { type: errorType, error });
        
        // 根据错误类型采取相应措施
        switch (errorType) {
            case 'INITIALIZATION_ERROR':
                this.showMessage('游戏初始化失败，请刷新页面重试');
                break;
            case 'SAVE_ERROR':
                this.showMessage('保存游戏失败');
                break;
            default:
                this.showMessage('发生未知错误');
        }
    }
    
    /**
     * 销毁游戏引擎
     */
    destroy() {
        this.isGameActive = false;
        this.eventListeners.clear();
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('游戏引擎已销毁');
    }
}

// 导出游戏引擎类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GhostMatch3Engine;
} else if (typeof window !== 'undefined') {
    window.GhostMatch3Engine = GhostMatch3Engine;
}