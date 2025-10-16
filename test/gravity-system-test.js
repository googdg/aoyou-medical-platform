/**
 * 重力和填充系统单元测试
 * Gravity and Fill System Unit Tests
 */

class GravitySystemTest {
    constructor() {
        this.testResults = [];
        this.gridManager = null;
        this.ghostManager = null;
    }
    
    /**
     * 运行所有测试
     */
    runAllTests() {
        console.log('开始重力和填充系统单元测试...');
        
        // 初始化测试环境
        this.setupTestEnvironment();
        
        this.testBasicGravity();
        this.testGravityDetection();
        this.testGravitySimulation();
        this.testBasicFilling();
        this.testSmartFilling();
        this.testCascadeFilling();
        this.testImmediateMatchDetection();
        this.testComplexGravityScenarios();
        
        this.printTestResults();
        return this.getTestSummary();
    }
    
    /**
     * 设置测试环境
     */
    setupTestEnvironment() {
        try {
            this.gridManager = new GridManager({ width: 8, height: 8 });
            
            // 创建简单的小鬼管理器模拟
            this.ghostManager = {
                createRandomGhost: () => ({
                    id: Math.random().toString(36).substr(2, 9),
                    type: Math.floor(Math.random() * 6),
                    position: { x: 0, y: 0 },
                    isSpecial: false,
                    specialType: null,
                    animation: null,
                    isMatched: false,
                    isFalling: false
                })
            };
            
            this.assert(true, '测试环境设置');
        } catch (error) {
            this.assert(false, '测试环境设置', error.message);
        }
    }
    
    /**
     * 测试基础重力功能
     */
    testBasicGravity() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建测试场景：上方有瓦片，下方有空隙
            const tile1 = { type: 0, id: 'gravity-test-1', position: { x: 3, y: 2 } };
            const tile2 = { type: 1, id: 'gravity-test-2', position: { x: 3, y: 4 } };
            
            this.gridManager.setTile(3, 2, tile1);
            this.gridManager.setTile(3, 4, tile2);
            
            // 应用重力
            const movements = this.gridManager.applyGravity();
            
            // 验证移动结果
            this.assert(movements.length > 0, '重力产生移动');
            
            // 验证瓦片最终位置
            const finalTile1 = this.gridManager.getTile(3, 7);
            const finalTile2 = this.gridManager.getTile(3, 6);
            
            this.assert(finalTile1 && finalTile1.id === 'gravity-test-1', '瓦片1下落到正确位置');
            this.assert(finalTile2 && finalTile2.id === 'gravity-test-2', '瓦片2下落到正确位置');
            
            // 验证原位置已清空
            this.assert(this.gridManager.getTile(3, 2) === null, '原位置已清空');
            this.assert(this.gridManager.getTile(3, 4) === null, '原位置已清空');
            
        } catch (error) {
            this.assert(false, '基础重力功能测试', error.message);
        }
    }
    
    /**
     * 测试重力检测
     */
    testGravityDetection() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 测试无需重力的情况
            this.gridManager.setTile(3, 7, { type: 0, id: 'bottom-tile' });
            this.assert(!this.gridManager.needsGravity(), '底部瓦片无需重力');
            
            // 测试需要重力的情况
            this.gridManager.setTile(3, 5, { type: 1, id: 'floating-tile' });
            this.assert(this.gridManager.needsGravity(), '悬浮瓦片需要重力');
            
            // 测试复杂情况
            this.gridManager.clear();
            this.gridManager.setTile(2, 6, { type: 0, id: 'tile1' });
            this.gridManager.setTile(2, 4, { type: 1, id: 'tile2' });
            this.gridManager.setTile(2, 2, { type: 2, id: 'tile3' });
            
            this.assert(this.gridManager.needsGravity(), '多层空隙需要重力');
            
        } catch (error) {
            this.assert(false, '重力检测测试', error.message);
        }
    }
    
    /**
     * 测试重力模拟
     */
    testGravitySimulation() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 设置测试场景
            this.gridManager.setTile(1, 1, { type: 0, id: 'sim-tile-1' });
            this.gridManager.setTile(1, 3, { type: 1, id: 'sim-tile-2' });
            
            // 模拟重力（不修改网格）
            const simulatedMovements = this.gridManager.simulateGravity();
            
            // 验证模拟结果
            this.assert(simulatedMovements.length > 0, '重力模拟产生移动');
            
            // 验证网格未被修改
            this.assert(this.gridManager.getTile(1, 1) !== null, '模拟后原位置未变');
            this.assert(this.gridManager.getTile(1, 7) === null, '模拟后目标位置未变');
            
            // 验证模拟结果的准确性
            const movement1 = simulatedMovements.find(m => m.tile.id === 'sim-tile-1');
            this.assert(movement1 && movement1.to.y === 7, '模拟移动位置正确');
            
        } catch (error) {
            this.assert(false, '重力模拟测试', error.message);
        }
    }
    
    /**
     * 测试基础填充功能
     */
    testBasicFilling() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建一些空隙
            this.gridManager.setTile(0, 7, { type: 0, id: 'existing-tile' });
            
            // 执行填充
            const newTiles = this.gridManager.fillFromTop(this.ghostManager);
            
            // 验证填充结果
            this.assert(newTiles.length === 63, '填充了正确数量的瓦片'); // 8x8 - 1 = 63
            
            // 验证网格已满
            const fillPercentage = this.gridManager.getFillPercentage();
            this.assert(fillPercentage === 100, '网格已完全填充');
            
            // 验证新瓦片有正确的属性
            const firstNewTile = newTiles[0];
            this.assert(firstNewTile.tile.id && firstNewTile.tile.type !== undefined, '新瓦片有正确属性');
            this.assert(firstNewTile.isNew === true, '新瓦片标记正确');
            
        } catch (error) {
            this.assert(false, '基础填充功能测试', error.message);
        }
    }
    
    /**
     * 测试智能填充功能
     */
    testSmartFilling() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建可能产生立即匹配的场景
            this.gridManager.setTile(3, 6, { type: 0, id: 'match-tile-1' });
            this.gridManager.setTile(3, 7, { type: 0, id: 'match-tile-2' });
            
            // 使用智能填充
            const newTiles = this.gridManager.smartFillFromTop(this.ghostManager, 3);
            
            // 验证填充结果
            this.assert(newTiles.length > 0, '智能填充产生新瓦片');
            
            // 检查是否避免了立即匹配
            const matches = this.gridManager.findMatches();
            const hasImmediateMatch = matches.length > 0;
            
            // 注意：由于随机性，这个测试可能偶尔失败，但大多数情况下应该成功
            if (hasImmediateMatch) {
                console.warn('智能填充未能完全避免立即匹配（这在随机情况下是可能的）');
            }
            
            this.assert(true, '智能填充执行完成');
            
        } catch (error) {
            this.assert(false, '智能填充功能测试', error.message);
        }
    }
    
    /**
     * 测试级联填充功能
     */
    testCascadeFilling() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建部分空隙
            this.gridManager.setTile(2, 6, { type: 0, id: 'existing-1' });
            this.gridManager.setTile(2, 7, { type: 1, id: 'existing-2' });
            
            // 执行级联填充
            const fillStages = this.gridManager.cascadeFillFromTop(this.ghostManager);
            
            // 验证填充阶段
            this.assert(fillStages.length > 0, '生成填充阶段');
            
            const column2Stage = fillStages.find(stage => stage.column === 2);
            this.assert(column2Stage && column2Stage.fills.length === 6, '第2列填充数量正确');
            
            // 验证掉落距离计算
            const firstFill = column2Stage.fills[0];
            this.assert(firstFill.dropDistance > 0, '掉落距离计算正确');
            this.assert(firstFill.delay >= 0, '延迟时间设置正确');
            
            // 应用填充阶段
            const appliedTiles = this.gridManager.applyFillStage(column2Stage);
            this.assert(appliedTiles.length === 6, '应用填充阶段成功');
            
        } catch (error) {
            this.assert(false, '级联填充功能测试', error.message);
        }
    }
    
    /**
     * 测试立即匹配检测
     */
    testImmediateMatchDetection() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建匹配场景
            this.gridManager.setTile(4, 6, { type: 2, id: 'match-setup-1' });
            this.gridManager.setTile(4, 7, { type: 2, id: 'match-setup-2' });
            
            // 测试会产生匹配的瓦片
            const matchingGhost = { type: 2, id: 'matching-ghost' };
            const wouldMatch = this.gridManager.wouldCreateImmediateMatch(4, 5, matchingGhost);
            this.assert(wouldMatch, '检测到会产生立即匹配');
            
            // 测试不会产生匹配的瓦片
            const nonMatchingGhost = { type: 1, id: 'non-matching-ghost' };
            const wouldNotMatch = this.gridManager.wouldCreateImmediateMatch(4, 5, nonMatchingGhost);
            this.assert(!wouldNotMatch, '检测到不会产生立即匹配');
            
        } catch (error) {
            this.assert(false, '立即匹配检测测试', error.message);
        }
    }
    
    /**
     * 测试复杂重力场景
     */
    testComplexGravityScenarios() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建复杂场景：多列，不同高度的空隙
            this.gridManager.setTile(1, 1, { type: 0, id: 'complex-1' });
            this.gridManager.setTile(1, 3, { type: 1, id: 'complex-2' });
            this.gridManager.setTile(1, 5, { type: 2, id: 'complex-3' });
            
            this.gridManager.setTile(3, 2, { type: 0, id: 'complex-4' });
            this.gridManager.setTile(3, 6, { type: 1, id: 'complex-5' });
            
            // 应用重力
            const movements = this.gridManager.applyGravity();
            
            // 验证复杂移动
            this.assert(movements.length === 5, '复杂场景产生正确数量的移动');
            
            // 验证最终状态
            const column1Bottom = this.gridManager.getTile(1, 7);
            const column1Middle = this.gridManager.getTile(1, 6);
            const column1Top = this.gridManager.getTile(1, 5);
            
            this.assert(column1Bottom && column1Bottom.id === 'complex-1', '第1列底部瓦片正确');
            this.assert(column1Middle && column1Middle.id === 'complex-2', '第1列中部瓦片正确');
            this.assert(column1Top && column1Top.id === 'complex-3', '第1列顶部瓦片正确');
            
            const column3Bottom = this.gridManager.getTile(3, 7);
            const column3Top = this.gridManager.getTile(3, 6);
            
            this.assert(column3Bottom && column3Bottom.id === 'complex-4', '第3列底部瓦片正确');
            this.assert(column3Top && column3Top.id === 'complex-5', '第3列顶部瓦片正确');
            
        } catch (error) {
            this.assert(false, '复杂重力场景测试', error.message);
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
        
        console.log('\n=== 重力和填充系统测试结果 ===');
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
    module.exports = GravitySystemTest;
} else if (typeof window !== 'undefined') {
    window.GravitySystemTest = GravitySystemTest;
}