/**
 * 网格管理器单元测试
 * Grid Manager Unit Tests
 */

class GridManagerTest {
    constructor() {
        this.testResults = [];
        this.gridManager = null;
    }
    
    /**
     * 运行所有测试
     */
    runAllTests() {
        console.log('开始网格管理器单元测试...');
        
        this.testGridInitialization();
        this.testTileOperations();
        this.testPositionValidation();
        this.testTileSwapping();
        this.testMatchDetection();
        this.testGravitySystem();
        this.testSpecialMatches();
        this.testUtilityMethods();
        
        this.printTestResults();
        return this.getTestSummary();
    }
    
    /**
     * 测试网格初始化
     */
    testGridInitialization() {
        try {
            // 测试默认大小
            this.gridManager = new GridManager({ width: 8, height: 8 });
            this.assert(this.gridManager.width === 8, '网格宽度初始化');
            this.assert(this.gridManager.height === 8, '网格高度初始化');
            this.assert(this.gridManager.grid.length === 8, '网格行数正确');
            this.assert(this.gridManager.grid[0].length === 8, '网格列数正确');
            
            // 测试自定义大小
            const customGrid = new GridManager({ width: 10, height: 6 });
            this.assert(customGrid.width === 10, '自定义网格宽度');
            this.assert(customGrid.height === 6, '自定义网格高度');
            
            // 测试空网格
            const isEmpty = this.gridManager.grid.every(row => 
                row.every(cell => cell === null)
            );
            this.assert(isEmpty, '网格初始化为空');
            
        } catch (error) {
            this.assert(false, '网格初始化测试', error.message);
        }
    }
    
    /**
     * 测试瓦片操作
     */
    testTileOperations() {
        try {
            const testTile = { type: 0, id: 'test-tile' };
            
            // 测试设置瓦片
            const setResult = this.gridManager.setTile(3, 3, testTile);
            this.assert(setResult === true, '瓦片设置成功');
            
            // 测试获取瓦片
            const getTile = this.gridManager.getTile(3, 3);
            this.assert(getTile === testTile, '瓦片获取正确');
            
            // 测试边界外设置
            const invalidSet = this.gridManager.setTile(10, 10, testTile);
            this.assert(invalidSet === false, '边界外设置失败');
            
            // 测试边界外获取
            const invalidGet = this.gridManager.getTile(10, 10);
            this.assert(invalidGet === null, '边界外获取返回null');
            
        } catch (error) {
            this.assert(false, '瓦片操作测试', error.message);
        }
    }
    
    /**
     * 测试位置验证
     */
    testPositionValidation() {
        try {
            // 测试有效位置
            this.assert(this.gridManager.isValidPosition(0, 0), '左上角位置有效');
            this.assert(this.gridManager.isValidPosition(7, 7), '右下角位置有效');
            this.assert(this.gridManager.isValidPosition(3, 4), '中间位置有效');
            
            // 测试无效位置
            this.assert(!this.gridManager.isValidPosition(-1, 0), '负数x无效');
            this.assert(!this.gridManager.isValidPosition(0, -1), '负数y无效');
            this.assert(!this.gridManager.isValidPosition(8, 0), '超出x边界无效');
            this.assert(!this.gridManager.isValidPosition(0, 8), '超出y边界无效');
            
            // 测试相邻位置检测
            this.assert(this.gridManager.areAdjacent({x: 3, y: 3}, {x: 3, y: 4}), '垂直相邻');
            this.assert(this.gridManager.areAdjacent({x: 3, y: 3}, {x: 4, y: 3}), '水平相邻');
            this.assert(!this.gridManager.areAdjacent({x: 3, y: 3}, {x: 5, y: 3}), '不相邻');
            this.assert(!this.gridManager.areAdjacent({x: 3, y: 3}, {x: 4, y: 4}), '对角不相邻');
            
        } catch (error) {
            this.assert(false, '位置验证测试', error.message);
        }
    }
    
    /**
     * 测试瓦片交换
     */
    testTileSwapping() {
        try {
            const tile1 = { type: 0, id: 'tile1' };
            const tile2 = { type: 1, id: 'tile2' };
            
            this.gridManager.setTile(2, 2, tile1);
            this.gridManager.setTile(2, 3, tile2);
            
            // 测试有效交换
            const swapResult = this.gridManager.swapTiles({x: 2, y: 2}, {x: 2, y: 3});
            this.assert(swapResult === true, '瓦片交换成功');
            this.assert(this.gridManager.getTile(2, 2) === tile2, '交换后位置1正确');
            this.assert(this.gridManager.getTile(2, 3) === tile1, '交换后位置2正确');
            
            // 测试无效交换
            const invalidSwap = this.gridManager.swapTiles({x: 2, y: 2}, {x: 10, y: 10});
            this.assert(invalidSwap === false, '无效位置交换失败');
            
        } catch (error) {
            this.assert(false, '瓦片交换测试', error.message);
        }
    }
    
    /**
     * 测试匹配检测
     */
    testMatchDetection() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建水平匹配
            const redTile = { type: 0, id: 'red' };
            this.gridManager.setTile(2, 4, { ...redTile, id: 'red1' });
            this.gridManager.setTile(3, 4, { ...redTile, id: 'red2' });
            this.gridManager.setTile(4, 4, { ...redTile, id: 'red3' });
            
            // 创建垂直匹配
            const blueTile = { type: 1, id: 'blue' };
            this.gridManager.setTile(6, 2, { ...blueTile, id: 'blue1' });
            this.gridManager.setTile(6, 3, { ...blueTile, id: 'blue2' });
            this.gridManager.setTile(6, 4, { ...blueTile, id: 'blue3' });
            
            const matches = this.gridManager.findMatches();
            this.assert(matches.length >= 2, '找到匹配');
            
            // 验证水平匹配
            const horizontalMatch = matches.find(match => 
                match.some(pos => pos.y === 4 && pos.x >= 2 && pos.x <= 4)
            );
            this.assert(horizontalMatch && horizontalMatch.length >= 3, '水平匹配检测');
            
            // 验证垂直匹配
            const verticalMatch = matches.find(match => 
                match.some(pos => pos.x === 6 && pos.y >= 2 && pos.y <= 4)
            );
            this.assert(verticalMatch && verticalMatch.length >= 3, '垂直匹配检测');
            
        } catch (error) {
            this.assert(false, '匹配检测测试', error.message);
        }
    }
    
    /**
     * 测试重力系统
     */
    testGravitySystem() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建需要重力的情况
            const tile1 = { type: 0, id: 'gravity1' };
            const tile2 = { type: 1, id: 'gravity2' };
            
            this.gridManager.setTile(3, 2, tile1); // 上方有瓦片
            this.gridManager.setTile(3, 4, tile2); // 下方有空隙
            
            // 测试重力检测
            this.assert(this.gridManager.needsGravity(), '检测到需要重力');
            
            // 应用重力
            const movements = this.gridManager.applyGravity();
            this.assert(movements.length > 0, '重力产生移动');
            
            // 验证瓦片下落
            this.assert(this.gridManager.getTile(3, 7) === tile1, '瓦片1下落到底部');
            this.assert(this.gridManager.getTile(3, 6) === tile2, '瓦片2下落正确');
            this.assert(this.gridManager.getTile(3, 2) === null, '原位置已清空');
            
        } catch (error) {
            this.assert(false, '重力系统测试', error.message);
        }
    }
    
    /**
     * 测试特殊匹配
     */
    testSpecialMatches() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建L型匹配
            const lTile = { type: 2, id: 'l-tile' };
            this.gridManager.setTile(3, 3, { ...lTile, id: 'l-center' });
            this.gridManager.setTile(3, 2, { ...lTile, id: 'l-up1' });
            this.gridManager.setTile(3, 1, { ...lTile, id: 'l-up2' });
            this.gridManager.setTile(4, 3, { ...lTile, id: 'l-right1' });
            this.gridManager.setTile(5, 3, { ...lTile, id: 'l-right2' });
            
            const specialMatches = this.gridManager.findSpecialMatches();
            this.assert(specialMatches.length > 0, '找到特殊匹配');
            
            const lMatch = specialMatches.find(match => match.type === 'L-shape');
            this.assert(lMatch !== undefined, 'L型匹配检测');
            this.assert(lMatch.positions.length >= 5, 'L型匹配位置数量正确');
            
        } catch (error) {
            this.assert(false, '特殊匹配测试', error.message);
        }
    }
    
    /**
     * 测试工具方法
     */
    testUtilityMethods() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 测试空位置检测
            this.assert(this.gridManager.isEmpty(0, 0), '空位置检测');
            
            // 添加一些瓦片
            this.gridManager.setTile(0, 0, { type: 0, id: 'util1' });
            this.gridManager.setTile(1, 1, { type: 1, id: 'util2' });
            
            this.assert(!this.gridManager.isEmpty(0, 0), '非空位置检测');
            
            // 测试填充度计算
            const fillPercentage = this.gridManager.getFillPercentage();
            this.assert(fillPercentage > 0 && fillPercentage < 100, '填充度计算');
            
            // 测试空位置列表
            const emptyPositions = this.gridManager.getEmptyPositions();
            this.assert(emptyPositions.length === 62, '空位置列表正确'); // 8x8 - 2 = 62
            
            // 测试相邻位置获取
            const adjacent = this.gridManager.getAdjacentPositions(3, 3);
            this.assert(adjacent.length === 4, '中心位置相邻数量');
            
            const cornerAdjacent = this.gridManager.getAdjacentPositions(0, 0);
            this.assert(cornerAdjacent.length === 2, '角落位置相邻数量');
            
            // 测试网格副本
            const gridCopy = this.gridManager.getGridCopy();
            this.assert(gridCopy !== this.gridManager.grid, '网格副本是新对象');
            this.assert(gridCopy.length === this.gridManager.grid.length, '网格副本大小正确');
            
        } catch (error) {
            this.assert(false, '工具方法测试', error.message);
        }
    }
    
    /**
     * 断言方法
     */
    assert(condition, testName, errorMessage = '') {
        const result = {
            name: testName,
            passed: condition,
            message: errorMessage,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (condition) {
            console.log(`✅ ${testName}`);
        } else {
            console.error(`❌ ${testName}${errorMessage ? ': ' + errorMessage : ''}`);
        }
    }
    
    /**
     * 打印测试结果
     */
    printTestResults() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        console.log('\n=== 网格管理器测试结果 ===');
        console.log(`总测试数: ${total}`);
        console.log(`通过: ${passed}`);
        console.log(`失败: ${total - passed}`);
        console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);
        
        // 显示失败的测试
        const failed = this.testResults.filter(r => !r.passed);
        if (failed.length > 0) {
            console.log('\n失败的测试:');
            failed.forEach(test => {
                console.log(`- ${test.name}: ${test.message}`);
            });
        }
    }
    
    /**
     * 获取测试摘要
     */
    getTestSummary() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        return {
            total,
            passed,
            failed: total - passed,
            successRate: (passed / total) * 100,
            results: this.testResults
        };
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridManagerTest;
} else if (typeof window !== 'undefined') {
    window.GridManagerTest = GridManagerTest;
}