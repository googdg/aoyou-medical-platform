/**
 * 输入处理系统
 * Input Handler System
 * 
 * 负责处理鼠标、触摸和键盘输入
 */

class InputHandler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.container = gameEngine.container;
        
        // 输入状态
        this.isMouseDown = false;
        this.isTouchActive = false;
        this.isDragging = false;
        this.dragThreshold = 10; // 像素
        
        // 位置记录
        this.mouseStartPos = null;
        this.touchStartPos = null;
        this.currentPos = null;
        this.lastClickTime = 0;
        this.doubleClickThreshold = 300; // 毫秒
        
        // 选择状态
        this.selectedTile = null;
        this.hoveredTile = null;
        
        // 事件监听器引用
        this.eventListeners = new Map();
        
        // 输入配置
        this.config = {
            enableMouse: true,
            enableTouch: true,
            enableKeyboard: true,
            swipeMinDistance: 30,
            swipeMaxTime: 500,
            longPressTime: 500
        };
        
        this.setupEventListeners();
        console.log('输入处理系统初始化完成');
    }
    
    /**
     * 设置所有事件监听器
     */
    setupEventListeners() {
        if (this.config.enableMouse) {
            this.setupMouseEvents();
        }
        
        if (this.config.enableTouch) {
            this.setupTouchEvents();
        }
        
        if (this.config.enableKeyboard) {
            this.setupKeyboardEvents();
        }
        
        // 通用事件
        this.setupGeneralEvents();
    }
    
    /**
     * 设置鼠标事件
     */
    setupMouseEvents() {
        const mouseDownHandler = (event) => this.handleMouseDown(event);
        const mouseMoveHandler = (event) => this.handleMouseMove(event);
        const mouseUpHandler = (event) => this.handleMouseUp(event);
        const clickHandler = (event) => this.handleClick(event);
        const contextMenuHandler = (event) => this.handleContextMenu(event);
        
        this.container.addEventListener('mousedown', mouseDownHandler);
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
        this.container.addEventListener('click', clickHandler);
        this.container.addEventListener('contextmenu', contextMenuHandler);
        
        // 保存引用以便后续移除
        this.eventListeners.set('mousedown', { element: this.container, handler: mouseDownHandler });
        this.eventListeners.set('mousemove', { element: document, handler: mouseMoveHandler });
        this.eventListeners.set('mouseup', { element: document, handler: mouseUpHandler });
        this.eventListeners.set('click', { element: this.container, handler: clickHandler });
        this.eventListeners.set('contextmenu', { element: this.container, handler: contextMenuHandler });
    }
    
    /**
     * 设置触摸事件
     */
    setupTouchEvents() {
        const touchStartHandler = (event) => this.handleTouchStart(event);
        const touchMoveHandler = (event) => this.handleTouchMove(event);
        const touchEndHandler = (event) => this.handleTouchEnd(event);
        const touchCancelHandler = (event) => this.handleTouchCancel(event);
        
        this.container.addEventListener('touchstart', touchStartHandler, { passive: false });
        this.container.addEventListener('touchmove', touchMoveHandler, { passive: false });
        this.container.addEventListener('touchend', touchEndHandler, { passive: false });
        this.container.addEventListener('touchcancel', touchCancelHandler, { passive: false });
        
        this.eventListeners.set('touchstart', { element: this.container, handler: touchStartHandler });
        this.eventListeners.set('touchmove', { element: this.container, handler: touchMoveHandler });
        this.eventListeners.set('touchend', { element: this.container, handler: touchEndHandler });
        this.eventListeners.set('touchcancel', { element: this.container, handler: touchCancelHandler });
    }
    
    /**
     * 设置键盘事件
     */
    setupKeyboardEvents() {
        const keyDownHandler = (event) => this.handleKeyDown(event);
        const keyUpHandler = (event) => this.handleKeyUp(event);
        
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        
        this.eventListeners.set('keydown', { element: document, handler: keyDownHandler });
        this.eventListeners.set('keyup', { element: document, handler: keyUpHandler });
    }
    
    /**
     * 设置通用事件
     */
    setupGeneralEvents() {
        const resizeHandler = () => this.handleResize();
        const blurHandler = () => this.handleBlur();
        
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('blur', blurHandler);
        
        this.eventListeners.set('resize', { element: window, handler: resizeHandler });
        this.eventListeners.set('blur', { element: window, handler: blurHandler });
    }
    
    /**
     * 处理鼠标按下
     */
    handleMouseDown(event) {
        if (!this.gameEngine.isGameActive) return;
        
        event.preventDefault();
        
        this.isMouseDown = true;
        this.mouseStartPos = this.getEventPosition(event);
        this.currentPos = { ...this.mouseStartPos };
        
        const tile = this.getTileFromPosition(this.mouseStartPos);
        if (tile) {
            this.handleTileMouseDown(tile, event);
        }
    }
    
    /**
     * 处理鼠标移动
     */
    handleMouseMove(event) {
        if (!this.gameEngine.isGameActive) return;
        
        this.currentPos = this.getEventPosition(event);
        
        // 处理拖拽
        if (this.isMouseDown && this.mouseStartPos) {
            const distance = this.getDistance(this.mouseStartPos, this.currentPos);
            
            if (!this.isDragging && distance > this.dragThreshold) {
                this.isDragging = true;
                this.handleDragStart(this.mouseStartPos);
            }
            
            if (this.isDragging) {
                this.handleDragMove(this.currentPos);
            }
        }
        
        // 处理悬停
        const hoveredTile = this.getTileFromPosition(this.currentPos);
        if (hoveredTile !== this.hoveredTile) {
            this.handleTileHover(hoveredTile, this.hoveredTile);
            this.hoveredTile = hoveredTile;
        }
    }
    
    /**
     * 处理鼠标释放
     */
    handleMouseUp(event) {
        if (!this.gameEngine.isGameActive) return;
        
        const endPos = this.getEventPosition(event);
        
        if (this.isDragging) {
            this.handleDragEnd(endPos);
        }
        
        this.isMouseDown = false;
        this.isDragging = false;
        this.mouseStartPos = null;
    }
    
    /**
     * 处理点击
     */
    handleClick(event) {
        if (!this.gameEngine.isGameActive) return;
        
        event.preventDefault();
        
        const clickPos = this.getEventPosition(event);
        const tile = this.getTileFromPosition(clickPos);
        
        if (tile) {
            const currentTime = Date.now();
            const isDoubleClick = currentTime - this.lastClickTime < this.doubleClickThreshold;
            
            this.handleTileClick(tile, event, isDoubleClick);
            this.lastClickTime = currentTime;
        }
    }
    
    /**
     * 处理右键菜单
     */
    handleContextMenu(event) {
        event.preventDefault(); // 禁用右键菜单
        
        const clickPos = this.getEventPosition(event);
        const tile = this.getTileFromPosition(clickPos);
        
        if (tile) {
            this.handleTileRightClick(tile, event);
        }
    }
    
    /**
     * 处理触摸开始
     */
    handleTouchStart(event) {
        if (!this.gameEngine.isGameActive) return;
        
        event.preventDefault();
        
        if (event.touches.length === 1) {
            this.isTouchActive = true;
            this.touchStartPos = this.getEventPosition(event.touches[0]);
            this.currentPos = { ...this.touchStartPos };
            
            const tile = this.getTileFromPosition(this.touchStartPos);
            if (tile) {
                this.handleTileTouchStart(tile, event);
            }
            
            // 长按检测
            this.longPressTimer = setTimeout(() => {
                if (this.isTouchActive) {
                    this.handleLongPress(this.touchStartPos);
                }
            }, this.config.longPressTime);
        }
    }
    
    /**
     * 处理触摸移动
     */
    handleTouchMove(event) {
        if (!this.gameEngine.isGameActive || !this.isTouchActive) return;
        
        event.preventDefault();
        
        if (event.touches.length === 1) {
            this.currentPos = this.getEventPosition(event.touches[0]);
            
            const distance = this.getDistance(this.touchStartPos, this.currentPos);
            
            if (!this.isDragging && distance > this.dragThreshold) {
                this.isDragging = true;
                this.clearLongPressTimer();
                this.handleDragStart(this.touchStartPos);
            }
            
            if (this.isDragging) {
                this.handleDragMove(this.currentPos);
            }
        }
    }
    
    /**
     * 处理触摸结束
     */
    handleTouchEnd(event) {
        if (!this.gameEngine.isGameActive) return;
        
        event.preventDefault();
        this.clearLongPressTimer();
        
        if (this.isTouchActive) {
            const endPos = this.currentPos;
            
            if (this.isDragging) {
                this.handleDragEnd(endPos);
            } else {
                // 处理点击
                const tile = this.getTileFromPosition(this.touchStartPos);
                if (tile) {
                    this.handleTileClick(tile, event, false);
                }
            }
        }
        
        this.isTouchActive = false;
        this.isDragging = false;
        this.touchStartPos = null;
    }
    
    /**
     * 处理触摸取消
     */
    handleTouchCancel(event) {
        this.clearLongPressTimer();
        this.isTouchActive = false;
        this.isDragging = false;
        this.touchStartPos = null;
    }
    
    /**
     * 处理键盘按下
     */
    handleKeyDown(event) {
        if (!this.gameEngine.isGameActive) return;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                event.preventDefault();
                this.handleArrowKey(event.key);
                break;
                
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.handleSelectKey();
                break;
                
            case 'Escape':
                event.preventDefault();
                this.handleEscapeKey();
                break;
                
            case 'h':
            case 'H':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.handleHintKey();
                }
                break;
        }
    }
    
    /**
     * 处理键盘释放
     */
    handleKeyUp(event) {
        // 键盘释放处理（如果需要）
    }
    
    /**
     * 处理窗口大小改变
     */
    handleResize() {
        // 重新计算游戏区域尺寸
        this.gameEngine.handleResize?.();
    }
    
    /**
     * 处理窗口失焦
     */
    handleBlur() {
        // 暂停游戏或重置输入状态
        this.resetInputState();
        this.gameEngine.pauseGame?.();
    }
    
    /**
     * 处理瓦片点击
     */
    handleTileClick(tile, event, isDoubleClick) {
        if (isDoubleClick) {
            this.handleTileDoubleClick(tile, event);
            return;
        }
        
        if (this.selectedTile === null) {
            // 选择瓦片
            this.selectTile(tile);
        } else if (this.selectedTile === tile) {
            // 取消选择
            this.deselectTile();
        } else {
            // 尝试交换
            this.attemptSwap(this.selectedTile, tile);
        }
    }
    
    /**
     * 处理瓦片双击
     */
    handleTileDoubleClick(tile, event) {
        // 双击可以触发特殊效果或提示
        if (tile.isSpecial) {
            this.gameEngine.activateSpecialTile?.(tile);
        } else {
            this.gameEngine.showTileHint?.(tile);
        }
    }
    
    /**
     * 处理瓦片右键
     */
    handleTileRightClick(tile, event) {
        // 右键可以显示瓦片信息或上下文菜单
        this.gameEngine.showTileInfo?.(tile);
    }
    
    /**
     * 处理瓦片悬停
     */
    handleTileHover(newTile, oldTile) {
        if (oldTile) {
            this.gameEngine.animationEngine?.animateSelection(oldTile.element, false);
        }
        
        if (newTile && newTile !== this.selectedTile) {
            this.gameEngine.animationEngine?.animateSelection(newTile.element, true);
        }
    }
    
    /**
     * 处理拖拽开始
     */
    handleDragStart(startPos) {
        const tile = this.getTileFromPosition(startPos);
        if (tile) {
            this.selectTile(tile);
        }
    }
    
    /**
     * 处理拖拽移动
     */
    handleDragMove(currentPos) {
        const tile = this.getTileFromPosition(currentPos);
        if (tile && tile !== this.selectedTile) {
            // 显示可能的交换预览
            this.showSwapPreview(this.selectedTile, tile);
        }
    }
    
    /**
     * 处理拖拽结束
     */
    handleDragEnd(endPos) {
        const endTile = this.getTileFromPosition(endPos);
        
        if (this.selectedTile && endTile && endTile !== this.selectedTile) {
            this.attemptSwap(this.selectedTile, endTile);
        }
        
        this.hideSwapPreview();
    }
    
    /**
     * 处理长按
     */
    handleLongPress(position) {
        const tile = this.getTileFromPosition(position);
        if (tile) {
            this.gameEngine.showTileInfo?.(tile);
        }
    }
    
    /**
     * 处理方向键
     */
    handleArrowKey(key) {
        if (!this.selectedTile) {
            // 如果没有选中瓦片，选择中心瓦片
            const centerTile = this.gameEngine.getCenterTile?.();
            if (centerTile) {
                this.selectTile(centerTile);
            }
            return;
        }
        
        const direction = {
            'ArrowUp': { dx: 0, dy: -1 },
            'ArrowDown': { dx: 0, dy: 1 },
            'ArrowLeft': { dx: -1, dy: 0 },
            'ArrowRight': { dx: 1, dy: 0 }
        }[key];
        
        const newPos = {
            x: this.selectedTile.position.x + direction.dx,
            y: this.selectedTile.position.y + direction.dy
        };
        
        const newTile = this.gameEngine.getTileAt?.(newPos.x, newPos.y);
        if (newTile) {
            this.selectTile(newTile);
        }
    }
    
    /**
     * 处理选择键
     */
    handleSelectKey() {
        if (this.selectedTile) {
            // 可以实现自动寻找最佳交换目标
            const bestMove = this.gameEngine.getBestMoveForTile?.(this.selectedTile);
            if (bestMove) {
                this.attemptSwap(this.selectedTile, bestMove.target);
            }
        }
    }
    
    /**
     * 处理ESC键
     */
    handleEscapeKey() {
        this.deselectTile();
        this.gameEngine.showPauseMenu?.();
    }
    
    /**
     * 处理提示键
     */
    handleHintKey() {
        this.gameEngine.showHint?.();
    }
    
    /**
     * 选择瓦片
     */
    selectTile(tile) {
        if (this.selectedTile) {
            this.deselectTile();
        }
        
        this.selectedTile = tile;
        tile.element?.classList.add('selected');
        this.gameEngine.animationEngine?.animateSelection(tile.element, true);
        
        this.gameEngine.onTileSelected?.(tile);
    }
    
    /**
     * 取消选择瓦片
     */
    deselectTile() {
        if (this.selectedTile) {
            this.selectedTile.element?.classList.remove('selected');
            this.gameEngine.animationEngine?.animateSelection(this.selectedTile.element, false);
            this.selectedTile = null;
        }
        
        this.gameEngine.onTileDeselected?.();
    }
    
    /**
     * 尝试交换瓦片
     */
    attemptSwap(tile1, tile2) {
        if (this.validateMove(tile1, tile2)) {
            this.gameEngine.swapTiles?.(tile1, tile2);
            this.deselectTile();
        } else {
            // 显示无效移动反馈
            this.showInvalidMoveEffect(tile1, tile2);
        }
    }
    
    /**
     * 验证移动是否有效
     */
    validateMove(tile1, tile2) {
        if (!tile1 || !tile2) return false;
        
        // 检查是否相邻
        const dx = Math.abs(tile1.position.x - tile2.position.x);
        const dy = Math.abs(tile1.position.y - tile2.position.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // 检查交换后是否会产生匹配
            return this.gameEngine.wouldCreateMatch?.(tile1, tile2) || false;
        }
        
        return false;
    }
    
    /**
     * 显示交换预览
     */
    showSwapPreview(tile1, tile2) {
        if (this.validateMove(tile1, tile2)) {
            tile2.element?.classList.add('swap-preview-valid');
        } else {
            tile2.element?.classList.add('swap-preview-invalid');
        }
    }
    
    /**
     * 隐藏交换预览
     */
    hideSwapPreview() {
        const previewElements = this.container.querySelectorAll('.swap-preview-valid, .swap-preview-invalid');
        previewElements.forEach(element => {
            element.classList.remove('swap-preview-valid', 'swap-preview-invalid');
        });
    }
    
    /**
     * 显示无效移动效果
     */
    showInvalidMoveEffect(tile1, tile2) {
        // 播放摇摆动画表示无效移动
        [tile1, tile2].forEach(tile => {
            if (tile.element) {
                tile.element.classList.add('invalid-move');
                setTimeout(() => {
                    tile.element.classList.remove('invalid-move');
                }, 500);
            }
        });
    }
    
    /**
     * 获取事件位置
     */
    getEventPosition(event) {
        const rect = this.container.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    /**
     * 从位置获取瓦片
     */
    getTileFromPosition(position) {
        const element = document.elementFromPoint(
            position.x + this.container.getBoundingClientRect().left,
            position.y + this.container.getBoundingClientRect().top
        );
        
        if (element && element.classList.contains('game-tile')) {
            return this.gameEngine.getTileFromElement?.(element);
        }
        
        return null;
    }
    
    /**
     * 计算两点距离
     */
    getDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 清除长按计时器
     */
    clearLongPressTimer() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }
    
    /**
     * 重置输入状态
     */
    resetInputState() {
        this.isMouseDown = false;
        this.isTouchActive = false;
        this.isDragging = false;
        this.mouseStartPos = null;
        this.touchStartPos = null;
        this.clearLongPressTimer();
        this.deselectTile();
        this.hideSwapPreview();
    }
    
    /**
     * 设置配置
     */
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * 启用/禁用输入类型
     */
    setInputEnabled(inputType, enabled) {
        this.config[`enable${inputType}`] = enabled;
        
        if (!enabled) {
            this.removeEventListeners(inputType.toLowerCase());
        } else {
            this.setupEventListeners();
        }
    }
    
    /**
     * 移除特定类型的事件监听器
     */
    removeEventListeners(inputType) {
        const typeMap = {
            'mouse': ['mousedown', 'mousemove', 'mouseup', 'click', 'contextmenu'],
            'touch': ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
            'keyboard': ['keydown', 'keyup']
        };
        
        const events = typeMap[inputType] || [];
        events.forEach(eventName => {
            const listener = this.eventListeners.get(eventName);
            if (listener) {
                listener.element.removeEventListener(eventName, listener.handler);
                this.eventListeners.delete(eventName);
            }
        });
    }
    
    /**
     * 销毁输入处理器
     */
    destroy() {
        this.resetInputState();
        
        // 移除所有事件监听器
        this.eventListeners.forEach((listener, eventName) => {
            listener.element.removeEventListener(eventName, listener.handler);
        });
        
        this.eventListeners.clear();
        
        console.log('输入处理系统已销毁');
    }
}

// 导出输入处理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
} else if (typeof window !== 'undefined') {
    window.InputHandler = InputHandler;
}