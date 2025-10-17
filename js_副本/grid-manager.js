/**
 * 网格管理器
 * Grid Manager
 * 
 * 负责管理游戏网格、瓦片位置和匹配检测
 */

class GridManager {
    constructor(gridSize) {
        this.width = gridSize.width || 8;
        this.height = gridSize.height || 8;
        this.grid = this.createEmptyGrid();
        this.matchPatterns = [];
        
        console.log(`网格管理器初始化: ${this.width}x${this.height}`);
    }
    
    /**
     * 创建空网格
     */
    createEmptyGrid() {
        return Array(this.height).fill(null).map(() => Array(this.width).fill(null));
    }
    
    /**
     * 获取指定位置的瓦片
     */
    getTile(x, y) {
        if (!this.isValidPosition(x, y)) {
            return null;
        }
        return this.grid[y][x];
    }
    
    /**
     * 设置指定位置的瓦片
     */
    setTile(x, y, ghost) {
        if (!this.isValidPosition(x, y)) {
            return false;
        }
        this.grid[y][x] = ghost;
        return true;
    }
    
    /**
     * 检查位置是否有效
     */
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    /**
     * 交换两个瓦片
     */
    swapTiles(pos1, pos2) {
        if (!this.isValidPosition(pos1.x, pos1.y) || !this.isValidPosition(pos2.x, pos2.y)) {
            return false;
        }
        
        const tile1 = this.getTile(pos1.x, pos1.y);
        const tile2 = this.getTile(pos2.x, pos2.y);
        
        this.setTile(pos1.x, pos1.y, tile2);
        this.setTile(pos2.x, pos2.y, tile1);
        
        return true;
    }
    
    /**
     * 检查两个位置是否相邻
     */
    areAdjacent(pos1, pos2) {
        const dx = Math.abs(pos1.x - pos2.x);
        const dy = Math.abs(pos1.y - pos2.y);
        
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }
    
    /**
     * 查找所有匹配
     */
    findMatches() {
        const matches = [];
        
        // 查找基础匹配（3个或更多）
        matches.push(...this.findHorizontalMatches());
        matches.push(...this.findVerticalMatches());
        
        // 查找特殊匹配（L型、T型）
        const specialMatches = this.findSpecialMatches();
        matches.push(...specialMatches.map(sm => sm.positions));
        
        return this.mergeOverlappingMatches(matches);
    }
    
    /**
     * 查找所有匹配（包含详细信息）
     */
    findMatchesWithDetails() {
        const matches = [];
        
        // 基础水平匹配
        const horizontalMatches = this.findHorizontalMatches();
        horizontalMatches.forEach(match => {
            matches.push({
                positions: match,
                type: 'horizontal',
                length: match.length,
                score: this.calculateMatchScore(match.length, 'horizontal')
            });
        });
        
        // 基础垂直匹配
        const verticalMatches = this.findVerticalMatches();
        verticalMatches.forEach(match => {
            matches.push({
                positions: match,
                type: 'vertical',
                length: match.length,
                score: this.calculateMatchScore(match.length, 'vertical')
            });
        });
        
        // 特殊匹配
        const specialMatches = this.findSpecialMatches();
        specialMatches.forEach(match => {
            matches.push({
                positions: match.positions,
                type: match.type,
                length: match.positions.length,
                score: this.calculateMatchScore(match.positions.length, match.type),
                centerPosition: match.centerPosition
            });
        });
        
        return this.mergeOverlappingMatchesWithDetails(matches);
    }
    
    /**
     * 计算匹配分数
     */
    calculateMatchScore(length, type) {
        let baseScore = length * 10;
        
        // 特殊匹配加分
        switch (type) {
            case 'L-shape':
            case 'T-shape':
                baseScore *= 2;
                break;
            case 'horizontal':
            case 'vertical':
                if (length >= 5) baseScore *= 1.5;
                if (length >= 4) baseScore *= 1.2;
                break;
        }
        
        return Math.floor(baseScore);
    }
    
    /**
     * 合并重叠匹配（包含详细信息）
     */
    mergeOverlappingMatchesWithDetails(matches) {
        if (matches.length <= 1) return matches;
        
        const merged = [];
        const processed = new Set();
        
        for (let i = 0; i < matches.length; i++) {
            if (processed.has(i)) continue;
            
            let currentMatch = { ...matches[i] };
            processed.add(i);
            
            // 查找重叠匹配
            for (let j = i + 1; j < matches.length; j++) {
                if (processed.has(j)) continue;
                
                const hasOverlap = matches[j].positions.some(pos => 
                    currentMatch.positions.some(currentPos => 
                        currentPos.x === pos.x && currentPos.y === pos.y
                    )
                );
                
                if (hasOverlap) {
                    // 合并匹配
                    matches[j].positions.forEach(pos => {
                        const exists = currentMatch.positions.some(currentPos => 
                            currentPos.x === pos.x && currentPos.y === pos.y
                        );
                        if (!exists) {
                            currentMatch.positions.push(pos);
                        }
                    });
                    
                    // 更新匹配信息
                    currentMatch.length = currentMatch.positions.length;
                    currentMatch.score += matches[j].score;
                    currentMatch.type = 'combo'; // 组合匹配
                    
                    processed.add(j);
                }
            }
            
            merged.push(currentMatch);
        }
        
        return merged;
    }
    
    /**
     * 查找水平匹配
     */
    findHorizontalMatches() {
        const matches = [];
        
        for (let y = 0; y < this.height; y++) {
            let currentMatch = [];
            let currentType = null;
            
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                
                if (tile && tile.type === currentType) {
                    currentMatch.push({ x, y });
                } else {
                    if (currentMatch.length >= 3) {
                        matches.push([...currentMatch]);
                    }
                    
                    currentMatch = tile ? [{ x, y }] : [];
                    currentType = tile ? tile.type : null;
                }
            }
            
            // 检查行末的匹配
            if (currentMatch.length >= 3) {
                matches.push([...currentMatch]);
            }
        }
        
        return matches;
    }
    
    /**
     * 查找垂直匹配
     */
    findVerticalMatches() {
        const matches = [];
        
        for (let x = 0; x < this.width; x++) {
            let currentMatch = [];
            let currentType = null;
            
            for (let y = 0; y < this.height; y++) {
                const tile = this.getTile(x, y);
                
                if (tile && tile.type === currentType) {
                    currentMatch.push({ x, y });
                } else {
                    if (currentMatch.length >= 3) {
                        matches.push([...currentMatch]);
                    }
                    
                    currentMatch = tile ? [{ x, y }] : [];
                    currentType = tile ? tile.type : null;
                }
            }
            
            // 检查列末的匹配
            if (currentMatch.length >= 3) {
                matches.push([...currentMatch]);
            }
        }
        
        return matches;
    }
    
    /**
     * 合并重叠的匹配
     */
    mergeOverlappingMatches(matches) {
        if (matches.length <= 1) return matches;
        
        const merged = [];
        const processed = new Set();
        
        for (let i = 0; i < matches.length; i++) {
            if (processed.has(i)) continue;
            
            let currentMatch = [...matches[i]];
            processed.add(i);
            
            // 查找与当前匹配重叠的其他匹配
            for (let j = i + 1; j < matches.length; j++) {
                if (processed.has(j)) continue;
                
                const hasOverlap = matches[j].some(pos => 
                    currentMatch.some(currentPos => 
                        currentPos.x === pos.x && currentPos.y === pos.y
                    )
                );
                
                if (hasOverlap) {
                    // 合并匹配，避免重复位置
                    matches[j].forEach(pos => {
                        const exists = currentMatch.some(currentPos => 
                            currentPos.x === pos.x && currentPos.y === pos.y
                        );
                        if (!exists) {
                            currentMatch.push(pos);
                        }
                    });
                    processed.add(j);
                }
            }
            
            merged.push(currentMatch);
        }
        
        return merged;
    }
    
    /**
     * 检测L型和T型匹配
     */
    findSpecialMatches() {
        const specialMatches = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                if (!tile) continue;
                
                // 检测L型匹配
                const lMatches = this.findLShapeMatches(x, y, tile.type);
                specialMatches.push(...lMatches);
                
                // 检测T型匹配
                const tMatches = this.findTShapeMatches(x, y, tile.type);
                specialMatches.push(...tMatches);
            }
        }
        
        return specialMatches;
    }
    
    /**
     * 查找L型匹配
     */
    findLShapeMatches(centerX, centerY, type) {
        const matches = [];
        const directions = [
            // L型的四种方向
            [{ dx: 0, dy: -1 }, { dx: 0, dy: -2 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }], // ┘
            [{ dx: 0, dy: -1 }, { dx: 0, dy: -2 }, { dx: -1, dy: 0 }, { dx: -2, dy: 0 }], // └
            [{ dx: 0, dy: 1 }, { dx: 0, dy: 2 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }], // ┐
            [{ dx: 0, dy: 1 }, { dx: 0, dy: 2 }, { dx: -1, dy: 0 }, { dx: -2, dy: 0 }] // ┌
        ];
        
        directions.forEach(pattern => {
            const positions = [{ x: centerX, y: centerY }];
            let isValid = true;
            
            for (const dir of pattern) {
                const x = centerX + dir.dx;
                const y = centerY + dir.dy;
                
                if (!this.isValidPosition(x, y)) {
                    isValid = false;
                    break;
                }
                
                const tile = this.getTile(x, y);
                if (!tile || tile.type !== type) {
                    isValid = false;
                    break;
                }
                
                positions.push({ x, y });
            }
            
            if (isValid && positions.length >= 5) {
                matches.push({
                    positions,
                    type: 'L-shape',
                    centerPosition: { x: centerX, y: centerY }
                });
            }
        });
        
        return matches;
    }
    
    /**
     * 查找T型匹配
     */
    findTShapeMatches(centerX, centerY, type) {
        const matches = [];
        const patterns = [
            // T型的四种方向
            [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: -2 }], // ┴
            [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: 2 }], // ┬
            [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: -2, dy: 0 }], // ┤
            [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }] // ├
        ];
        
        patterns.forEach(pattern => {
            const positions = [{ x: centerX, y: centerY }];
            let isValid = true;
            
            for (const dir of pattern) {
                const x = centerX + dir.dx;
                const y = centerY + dir.dy;
                
                if (!this.isValidPosition(x, y)) {
                    isValid = false;
                    break;
                }
                
                const tile = this.getTile(x, y);
                if (!tile || tile.type !== type) {
                    isValid = false;
                    break;
                }
                
                positions.push({ x, y });
            }
            
            if (isValid && positions.length >= 5) {
                matches.push({
                    positions,
                    type: 'T-shape',
                    centerPosition: { x: centerX, y: centerY }
                });
            }
        });
        
        return matches;
    }
    
    /**
     * 移除指定位置的瓦片
     */
    removeTiles(positions) {
        const removedTiles = [];
        
        positions.forEach(pos => {
            if (this.isValidPosition(pos.x, pos.y)) {
                const tile = this.getTile(pos.x, pos.y);
                if (tile) {
                    removedTiles.push({ position: pos, tile });
                    this.setTile(pos.x, pos.y, null);
                }
            }
        });
        
        return removedTiles;
    }
    
    /**
     * 应用重力，让瓦片下落
     */
    applyGravity() {
        const movements = [];
        
        for (let x = 0; x < this.width; x++) {
            const columnData = [];
            
            // 收集该列的所有非空瓦片及其原始位置
            for (let y = 0; y < this.height; y++) {
                const tile = this.getTile(x, y);
                if (tile) {
                    columnData.push({
                        tile: tile,
                        originalY: y
                    });
                }
            }
            
            // 清空该列
            for (let y = 0; y < this.height; y++) {
                this.setTile(x, y, null);
            }
            
            // 从底部重新放置瓦片
            for (let i = 0; i < columnData.length; i++) {
                const newY = this.height - 1 - i;
                const data = columnData[columnData.length - 1 - i]; // 从底部开始
                
                this.setTile(x, newY, data.tile);
                
                // 更新瓦片位置信息
                if (data.tile.position) {
                    data.tile.position.x = x;
                    data.tile.position.y = newY;
                }
                
                // 记录移动信息
                if (data.originalY !== newY) {
                    movements.push({
                        tile: data.tile,
                        from: { x, y: data.originalY },
                        to: { x, y: newY },
                        distance: newY - data.originalY
                    });
                }
            }
        }
        
        return movements;
    }
    
    /**
     * 检查是否需要应用重力
     */
    needsGravity() {
        for (let x = 0; x < this.width; x++) {
            for (let y = this.height - 1; y >= 0; y--) {
                if (this.isEmpty(x, y)) {
                    // 检查上方是否有瓦片
                    for (let checkY = y - 1; checkY >= 0; checkY--) {
                        if (!this.isEmpty(x, checkY)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    
    /**
     * 模拟重力应用（不实际修改网格）
     */
    simulateGravity() {
        const simulation = this.getGridCopy();
        const movements = [];
        
        for (let x = 0; x < this.width; x++) {
            const column = [];
            
            // 收集该列的所有非空瓦片
            for (let y = this.height - 1; y >= 0; y--) {
                if (simulation[y][x]) {
                    column.push({
                        tile: simulation[y][x],
                        originalY: y
                    });
                }
            }
            
            // 计算新位置
            for (let i = 0; i < column.length; i++) {
                const newY = this.height - 1 - i;
                const data = column[column.length - 1 - i];
                
                if (data.originalY !== newY) {
                    movements.push({
                        tile: data.tile,
                        from: { x, y: data.originalY },
                        to: { x, y: newY },
                        distance: newY - data.originalY
                    });
                }
            }
        }
        
        return movements;
    }
    
    /**
     * 查找瓦片的原始位置（用于动画）
     */
    findTileOriginalPosition(tile, x) {
        // 在该列中查找瓦片的原始位置
        for (let y = 0; y < this.height; y++) {
            const currentTile = this.getTile(x, y);
            if (currentTile && currentTile.id === tile.id) {
                return y;
            }
        }
        return 0;
    }
    
    /**
     * 获取相邻位置
     */
    getAdjacentPositions(x, y) {
        const adjacent = [];
        const directions = [
            { dx: 0, dy: -1 }, // 上
            { dx: 1, dy: 0 },  // 右
            { dx: 0, dy: 1 },  // 下
            { dx: -1, dy: 0 }  // 左
        ];
        
        directions.forEach(dir => {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            if (this.isValidPosition(newX, newY)) {
                adjacent.push({ x: newX, y: newY });
            }
        });
        
        return adjacent;
    }
    
    /**
     * 检查指定位置是否为空
     */
    isEmpty(x, y) {
        return this.getTile(x, y) === null;
    }
    
    /**
     * 获取空位置列表
     */
    getEmptyPositions() {
        const empty = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.isEmpty(x, y)) {
                    empty.push({ x, y });
                }
            }
        }
        return empty;
    }
    
    /**
     * 计算网格填充度
     */
    getFillPercentage() {
        let filled = 0;
        const total = this.width * this.height;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.isEmpty(x, y)) {
                    filled++;
                }
            }
        }
        
        return (filled / total) * 100;
    }
    
    /**
     * 从顶部填充新瓦片
     */
    fillFromTop(ghostManager) {
        const newTiles = [];
        
        for (let x = 0; x < this.width; x++) {
            // 从顶部开始填充空位
            for (let y = 0; y < this.height; y++) {
                if (!this.getTile(x, y)) {
                    const newGhost = ghostManager ? ghostManager.createRandomGhost() : this.createDefaultGhost();
                    
                    // 设置瓦片位置信息
                    if (newGhost.position) {
                        newGhost.position.x = x;
                        newGhost.position.y = y;
                    }
                    
                    this.setTile(x, y, newGhost);
                    newTiles.push({
                        position: { x, y },
                        tile: newGhost,
                        isNew: true
                    });
                }
            }
        }
        
        return newTiles;
    }
    
    /**
     * 智能填充（避免立即匹配）
     */
    smartFillFromTop(ghostManager, maxAttempts = 5) {
        const newTiles = [];
        
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (!this.getTile(x, y)) {
                    let newGhost = null;
                    let attempts = 0;
                    
                    // 尝试创建不会立即匹配的瓦片
                    do {
                        newGhost = ghostManager ? ghostManager.createRandomGhost() : this.createDefaultGhost();
                        attempts++;
                    } while (attempts < maxAttempts && this.wouldCreateImmediateMatch(x, y, newGhost));
                    
                    // 设置瓦片位置信息
                    if (newGhost.position) {
                        newGhost.position.x = x;
                        newGhost.position.y = y;
                    }
                    
                    this.setTile(x, y, newGhost);
                    newTiles.push({
                        position: { x, y },
                        tile: newGhost,
                        isNew: true,
                        attempts: attempts
                    });
                }
            }
        }
        
        return newTiles;
    }
    
    /**
     * 检查放置瓦片是否会立即产生匹配
     */
    wouldCreateImmediateMatch(x, y, ghost) {
        // 临时放置瓦片
        this.setTile(x, y, ghost);
        
        // 检查是否产生匹配
        const matches = this.findMatches();
        const hasMatch = matches.some(match => 
            match.some(pos => pos.x === x && pos.y === y)
        );
        
        // 移除临时瓦片
        this.setTile(x, y, null);
        
        return hasMatch;
    }
    
    /**
     * 分阶段填充（模拟瓦片从上方掉落）
     */
    cascadeFillFromTop(ghostManager) {
        const fillStages = [];
        
        for (let x = 0; x < this.width; x++) {
            const columnFills = [];
            let dropHeight = 0;
            
            // 从顶部开始，为每个空位创建掉落瓦片
            for (let y = 0; y < this.height; y++) {
                if (!this.getTile(x, y)) {
                    const newGhost = ghostManager ? ghostManager.createRandomGhost() : this.createDefaultGhost();
                    
                    // 设置掉落起始位置（屏幕上方）
                    const startY = y - dropHeight - 1;
                    
                    columnFills.push({
                        tile: newGhost,
                        startPosition: { x, y: startY },
                        endPosition: { x, y },
                        dropDistance: dropHeight + 1,
                        delay: dropHeight * 100 // 延迟时间（毫秒）
                    });
                    
                    dropHeight++;
                }
            }
            
            if (columnFills.length > 0) {
                fillStages.push({
                    column: x,
                    fills: columnFills
                });
            }
        }
        
        return fillStages;
    }
    
    /**
     * 应用填充阶段
     */
    applyFillStage(fillStage) {
        const appliedTiles = [];
        
        fillStage.fills.forEach(fill => {
            // 设置瓦片位置信息
            if (fill.tile.position) {
                fill.tile.position.x = fill.endPosition.x;
                fill.tile.position.y = fill.endPosition.y;
            }
            
            this.setTile(fill.endPosition.x, fill.endPosition.y, fill.tile);
            appliedTiles.push({
                position: fill.endPosition,
                tile: fill.tile,
                startPosition: fill.startPosition,
                dropDistance: fill.dropDistance
            });
        });
        
        return appliedTiles;
    }
    
    /**
     * 创建默认小鬼（临时实现）
     */
    createDefaultGhost() {
        return {
            id: Math.random().toString(36).substr(2, 9),
            type: Math.floor(Math.random() * 6),
            position: { x: 0, y: 0 },
            isSpecial: false,
            specialType: null,
            animation: null,
            isMatched: false,
            isFalling: false
        };
    }
    
    /**
     * 检查网格是否有可能的移动
     */
    hasPossibleMoves() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // 检查右侧交换
                if (x < this.width - 1) {
                    if (this.wouldCreateMatch(x, y, x + 1, y)) {
                        return true;
                    }
                }
                
                // 检查下方交换
                if (y < this.height - 1) {
                    if (this.wouldCreateMatch(x, y, x, y + 1)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * 检查交换是否会创建匹配
     */
    wouldCreateMatch(x1, y1, x2, y2) {
        // 临时交换
        this.swapTiles({ x: x1, y: y1 }, { x: x2, y: y2 });
        
        // 检查是否有匹配
        const matches = this.findMatches();
        const hasMatch = matches.length > 0;
        
        // 恢复交换
        this.swapTiles({ x: x1, y: y1 }, { x: x2, y: y2 });
        
        return hasMatch;
    }
    
    /**
     * 获取网格的字符串表示（用于调试）
     */
    toString() {
        let result = '';
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                result += tile ? tile.type : '.';
                result += ' ';
            }
            result += '\n';
        }
        return result;
    }
    
    /**
     * 清空网格
     */
    clear() {
        this.grid = this.createEmptyGrid();
    }
    
    /**
     * 获取网格副本
     */
    getGridCopy() {
        return this.grid.map(row => [...row]);
    }
    
    /**
     * 检查指定移动是否会产生匹配
     */
    checkMoveForMatches(fromPos, toPos) {
        // 临时执行移动
        const originalFrom = this.getTile(fromPos.x, fromPos.y);
        const originalTo = this.getTile(toPos.x, toPos.y);
        
        this.swapTiles(fromPos, toPos);
        
        // 检查移动后的匹配
        const matches = this.findMatchesWithDetails();
        
        // 恢复原状态
        this.swapTiles(fromPos, toPos);
        
        return {
            hasMatches: matches.length > 0,
            matches: matches,
            totalScore: matches.reduce((sum, match) => sum + match.score, 0)
        };
    }
    
    /**
     * 获取所有可能的移动
     */
    getAllPossibleMoves() {
        const possibleMoves = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const currentTile = this.getTile(x, y);
                if (!currentTile) continue;
                
                // 检查四个方向的相邻位置
                const directions = [
                    { dx: 0, dy: -1 }, // 上
                    { dx: 1, dy: 0 },  // 右
                    { dx: 0, dy: 1 },  // 下
                    { dx: -1, dy: 0 }  // 左
                ];
                
                directions.forEach(dir => {
                    const newX = x + dir.dx;
                    const newY = y + dir.dy;
                    
                    if (this.isValidPosition(newX, newY)) {
                        const moveResult = this.checkMoveForMatches(
                            { x, y }, 
                            { x: newX, y: newY }
                        );
                        
                        if (moveResult.hasMatches) {
                            possibleMoves.push({
                                from: { x, y },
                                to: { x: newX, y: newY },
                                matches: moveResult.matches,
                                score: moveResult.totalScore
                            });
                        }
                    }
                });
            }
        }
        
        return possibleMoves;
    }
    
    /**
     * 获取最佳移动建议
     */
    getBestMove() {
        const possibleMoves = this.getAllPossibleMoves();
        
        if (possibleMoves.length === 0) {
            return null;
        }
        
        // 按分数排序，返回最高分的移动
        possibleMoves.sort((a, b) => b.score - a.score);
        
        return possibleMoves[0];
    }
    
    /**
     * 检查网格是否稳定（无匹配）
     */
    isStable() {
        const matches = this.findMatches();
        return matches.length === 0;
    }
    
    /**
     * 处理连锁反应
     */
    processChainReactions() {
        const chainResults = [];
        let chainLevel = 0;
        
        while (!this.isStable()) {
            chainLevel++;
            
            // 查找当前匹配
            const matches = this.findMatchesWithDetails();
            if (matches.length === 0) break;
            
            // 移除匹配的瓦片
            const removedTiles = [];
            matches.forEach(match => {
                match.positions.forEach(pos => {
                    const tile = this.getTile(pos.x, pos.y);
                    if (tile) {
                        removedTiles.push({ position: pos, tile });
                        this.setTile(pos.x, pos.y, null);
                    }
                });
            });
            
            // 应用重力
            const movements = this.applyGravity();
            
            // 记录连锁结果
            chainResults.push({
                level: chainLevel,
                matches: matches,
                removedTiles: removedTiles,
                movements: movements,
                score: matches.reduce((sum, match) => sum + match.score, 0) * chainLevel
            });
            
            // 防止无限循环
            if (chainLevel > 10) {
                console.warn('连锁反应超过最大层数，强制停止');
                break;
            }
        }
        
        return chainResults;
    }
    
    /**
     * 验证网格状态
     */
    validateGrid() {
        const issues = [];
        
        // 检查网格完整性
        if (!this.grid || this.grid.length !== this.height) {
            issues.push('网格高度不正确');
        }
        
        for (let y = 0; y < this.height; y++) {
            if (!this.grid[y] || this.grid[y].length !== this.width) {
                issues.push(`第${y}行宽度不正确`);
            }
        }
        
        // 检查瓦片数据完整性
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                if (tile) {
                    if (typeof tile.type !== 'number') {
                        issues.push(`位置(${x},${y})的瓦片类型无效`);
                    }
                    if (!tile.id) {
                        issues.push(`位置(${x},${y})的瓦片缺少ID`);
                    }
                }
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }
    
    /**
     * 获取网格统计信息
     */
    getGridStats() {
        const stats = {
            totalTiles: 0,
            emptySpaces: 0,
            tileTypes: {},
            fillPercentage: 0,
            possibleMoves: 0
        };
        
        // 统计瓦片
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                if (tile) {
                    stats.totalTiles++;
                    stats.tileTypes[tile.type] = (stats.tileTypes[tile.type] || 0) + 1;
                } else {
                    stats.emptySpaces++;
                }
            }
        }
        
        stats.fillPercentage = (stats.totalTiles / (this.width * this.height)) * 100;
        stats.possibleMoves = this.getAllPossibleMoves().length;
        
        return stats;
    }
}

// 导出网格管理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridManager;
} else if (typeof window !== 'undefined') {
    window.GridManager = GridManager;
}