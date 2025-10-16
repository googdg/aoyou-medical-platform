/**
 * 特殊小鬼和道具系统单元测试
 * Special Ghost and Power-up System Unit Tests
 */

class SpecialGhostTest {
    constructor() {
        this.testResults = [];
        this.ghostManager = null;
        this.gridManager = null;
    }
    
    /**
     * 运行所有测试
     */
    runAllTests() {
        console.log('开始特殊小鬼和道具系统单元测试...');
        
        this.setupTestEnvironment();
        
        this.testSpecialGhostCreation();
        this.testSpecialEffects();
        this.testRowClearEffect();
        this.testColumnClearEffect();
        this.testBombEffect();
        this.testRainbowEffect();
        this.testLightningEffect();
        this.testRandomSwapEffect();
        this.testSpecialCombinations();
        this.testVisualAndSoundEffects();
        this.testGameStateInfluence();
        
        this.printTestResults();
        return this.getTestSummary();
    }
    
    /**
     * 设置测试环境
     */
    setupTestEnvironment() {
        try {
            this.ghostManager = new GhostManager(6);
            this.gridManager = new GridManager({ width: 8, height: 8 });
            
            this.assert(true, '测试环境设置');
        } catch (error) {
            this.assert(false, '测试环境设置', error.message);
        }
    }
    
    /**
     * 测试特殊小鬼创建
     */
    testSpecialGhostCreation() {
        try {
            // 测试行清除小鬼
            const rowClearGhost = this.ghostManager.createSpecialGhost('row-clear', { x: 3, y: 3 });
            this.assert(rowClearGhost.isSpecial, '行清除小鬼创建');
            this.assert(rowClearGhost.specialType === 'row-clear', '行清除小鬼类型正确');
            this.assert(rowClearGhost.effect === 'clearRow', '行清除小鬼效果正确');
            
            // 测试列清除小鬼
            const columnClearGhost = this.ghostManager.createSpecialGhost('column-clear', { x: 4, y: 4 });
            this.assert(columnClearGhost.isSpecial, '列清除小鬼创建');
            this.assert(columnClearGhost.specialType === 'column-clear', '列清除小鬼类型正确');
            
            // 测试炸弹小鬼
            const bombGhost = this.ghostManager.createSpecialGhost('bomb', { x: 5, y: 5 });
            this.assert(bombGhost.isSpecial, '炸弹小鬼创建');
            this.assert(bombGhost.effect === 'explode', '炸弹小鬼效果正确');
            
            // 测试彩虹小鬼
            const rainbowGhost = this.ghostManager.createSpecialGhost('rainbow', { x: 6, y: 6 });
            this.assert(rainbowGhost.isSpecial, '彩虹小鬼创建');
            this.assert(rainbowGhost.effect === 'clearType', '彩虹小鬼效果正确');
            
            // 测试无效类型
            const invalidGhost = this.ghostManager.createSpecialGhost('invalid-type');
            this.assert(!invalidGhost.isSpecial, '无效类型返回普通小鬼');
            
        } catch (error) {
            this.assert(false, '特殊小鬼创建测试', error.message);
        }
    }
    
    /**
     * 测试特殊效果基础功能
     */
    testSpecialEffects() {
        try {
            // 清空网格
            this.gridManager.clear();
            
            // 创建测试小鬼
            const specialGhost = this.ghostManager.createSpecialGhost('bomb');
            const normalGhost = this.ghostManager.createRandomGhost();
            
            // 测试特殊小鬼效果执行
            const specialResult = this.ghostManager.executeSpecialEffect(
                specialGhost, 
                this.gridManager, 
                { x: 3, y: 3 }
            );
            
            this.assert(specialResult.affectedPositions !== undefined, '特殊效果返回影响位置');
            this.assert(specialResult.score !== undefined, '特殊效果返回分数');
            this.assert(specialResult.effects !== undefined, '特殊效果返回效果列表');
            
            // 测试普通小鬼无效果
            const normalResult = this.ghostManager.executeSpecialEffect(
                normalGhost, 
                this.gridManager, 
                { x: 3, y: 3 }
            );
            
            this.assert(normalResult.affectedPositions.length === 0, '普通小鬼无特殊效果');
            this.assert(normalResult.score === 0, '普通小鬼无额外分数');
            
        } catch (error) {
            this.assert(false, '特殊效果基础功能测试', error.message);
        }
    }
    
    /**
     * 测试行清除效果
     */
    testRowClearEffect() {
        try {
            // 清空网格并填充测试数据
            this.gridManager.clear();
            
            // 在第4行放置一些瓦片
            for (let x = 0; x < 8; x++) {
                this.gridManager.setTile(x, 4, { type: x % 3, id: `row-test-${x}` });
            }
            
            // 创建行清除小鬼
            const rowClearGhost = this.ghostManager.createSpecialGhost('row-clear');
            
            // 执行行清除效果
            const result = this.ghostManager.executeSpecialEffect(
                rowClearGhost,
                this.gridManager,
                { x: 3, y: 4 }
            );
            
            // 验证结果
            this.assert(result.affectedPositions.length === 8, '行清除影响整行');
            this.assert(result.score > 0, '行清除产生分数');
            this.assert(result.effects.length > 0, '行清除产生效果');
            this.assert(result.effects[0].type === 'row_clear', '效果类型正确');
            
            // 验证行中的所有位置都被影响
            const row4Positions = result.affectedPositions.filter(pos => pos.y === 4);
            this.assert(row4Positions.length === 8, '整行都被清除');
            
        } catch (error) {
            this.assert(false, '行清除效果测试', error.message);
        }
    }
    
    /**
     * 测试列清除效果
     */
    testColumnClearEffect() {
        try {
            // 清空网格并填充测试数据
            this.gridManager.clear();
            
            // 在第3列放置一些瓦片
            for (let y = 0; y < 8; y++) {
                this.gridManager.setTile(3, y, { type: y % 3, id: `col-test-${y}` });
            }
            
            // 创建列清除小鬼
            const columnClearGhost = this.ghostManager.createSpecialGhost('column-clear');
            
            // 执行列清除效果
            const result = this.ghostManager.executeSpecialEffect(
                columnClearGhost,
                this.gridManager,
                { x: 3, y: 4 }
            );
            
            // 验证结果
            this.assert(result.affectedPositions.length === 8, '列清除影响整列');
            this.assert(result.score > 0, '列清除产生分数');
            this.assert(result.effects[0].type === 'column_clear', '效果类型正确');
            
            // 验证列中的所有位置都被影响
            const col3Positions = result.affectedPositions.filter(pos => pos.x === 3);
            this.assert(col3Positions.length === 8, '整列都被清除');
            
        } catch (error) {
            this.assert(false, '列清除效果测试', error.message);
        }
    }
    
    /**
     * 测试炸弹效果
     */
    testBombEffect() {
        try {
            // 清空网格并填充测试数据
            this.gridManager.clear();
            
            // 在炸弹周围放置瓦片
            const centerX = 4, centerY = 4;
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const x = centerX + dx;
                    const y = centerY + dy;
                    if (this.gridManager.isValidPosition(x, y)) {
                        this.gridManager.setTile(x, y, { type: 0, id: `bomb-test-${x}-${y}` });
                    }
                }
            }
            
            // 创建炸弹小鬼
            const bombGhost = this.ghostManager.createSpecialGhost('bomb');
            
            // 执行炸弹效果
            const result = this.ghostManager.executeSpecialEffect(
                bombGhost,
                this.gridManager,
                { x: centerX, y: centerY }
            );
            
            // 验证结果
            this.assert(result.affectedPositions.length >= 9, '炸弹影响周围区域'); // 至少3x3区域
            this.assert(result.score > 0, '炸弹产生分数');
            this.assert(result.effects[0].type === 'explosion', '效果类型正确');
            
            // 验证中心位置被影响
            const centerAffected = result.affectedPositions.some(pos => 
                pos.x === centerX && pos.y === centerY
            );
            this.assert(centerAffected, '炸弹中心位置被影响');
            
        } catch (error) {
            this.assert(false, '炸弹效果测试', error.message);
        }
    }
    
    /**
     * 测试彩虹效果
     */
    testRainbowEffect() {
        try {
            // 清空网格并填充测试数据
            this.gridManager.clear();
            
            // 放置多个相同类型的瓦片
            const targetType = 2;
            let targetCount = 0;
            
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    if ((x + y) % 3 === 0) {
                        this.gridManager.setTile(x, y, { type: targetType, id: `rainbow-test-${x}-${y}` });
                        targetCount++;
                    } else {
                        this.gridManager.setTile(x, y, { type: (x + y) % 2, id: `other-${x}-${y}` });
                    }
                }
            }
            
            // 创建彩虹小鬼
            const rainbowGhost = this.ghostManager.createSpecialGhost('rainbow');
            
            // 执行彩虹效果
            const result = this.ghostManager.executeSpecialEffect(
                rainbowGhost,
                this.gridManager,
                { x: 3, y: 3 }
            );
            
            // 验证结果
            this.assert(result.affectedPositions.length > 0, '彩虹效果影响瓦片');
            this.assert(result.score > 0, '彩虹效果产生分数');
            this.assert(result.chainMultiplier > 1, '彩虹效果有连击加成');
            this.assert(result.effects[0].type === 'type_clear', '效果类型正确');
            
        } catch (error) {
            this.assert(false, '彩虹效果测试', error.message);
        }
    }
    
    /**
     * 测试闪电效果
     */
    testLightningEffect() {
        try {
            // 清空网格并填充测试数据
            this.gridManager.clear();
            
            // 随机放置一些瓦片
            for (let i = 0; i < 20; i++) {
                const x = Math.floor(Math.random() * 8);
                const y = Math.floor(Math.random() * 8);
                this.gridManager.setTile(x, y, { type: i % 3, id: `lightning-test-${i}` });
            }
            
            // 创建闪电小鬼（需要先添加到特殊小鬼类型中）
            this.ghostManager.specialGhosts['lightning'] = {
                id: 'lightning',
                name: '闪电小鬼',
                color: '#FFD700',
                effect: 'lightning',
                description: '随机攻击多个目标',
                sprite: '⚡'
            };
            
            const lightningGhost = this.ghostManager.createSpecialGhost('lightning');
            
            // 执行闪电效果
            const result = this.ghostManager.executeSpecialEffect(
                lightningGhost,
                this.gridManager,
                { x: 3, y: 3 }
            );
            
            // 验证结果
            this.assert(result.affectedPositions.length >= 3, '闪电效果影响多个目标');
            this.assert(result.affectedPositions.length <= 8, '闪电效果目标数量合理');
            this.assert(result.score > 0, '闪电效果产生分数');
            this.assert(result.effects[0].type === 'lightning', '效果类型正确');
            
        } catch (error) {
            this.assert(false, '闪电效果测试', error.message);
        }
    }
    
    /**
     * 测试随机交换效果
     */
    testRandomSwapEffect() {
        try {
            // 清空网格并填充测试数据
            this.gridManager.clear();
            
            // 填充网格
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    this.gridManager.setTile(x, y, { type: (x + y) % 3, id: `swap-test-${x}-${y}` });
                }
            }
            
            // 记录交换前的状态
            const beforeState = this.gridManager.getGridCopy();
            
            // 创建交换小鬼
            this.ghostManager.specialGhosts['swap'] = {
                id: 'swap',
                name: '交换小鬼',
                color: '#9C88FF',
                effect: 'swap',
                description: '随机交换瓦片位置',
                sprite: '🔄'
            };
            
            const swapGhost = this.ghostManager.createSpecialGhost('swap');
            
            // 执行交换效果
            const result = this.ghostManager.executeSpecialEffect(
                swapGhost,
                this.gridManager,
                { x: 3, y: 3 }
            );
            
            // 验证结果
            this.assert(result.affectedPositions.length >= 2, '交换效果影响多个位置');
            this.assert(result.affectedPositions.length % 2 === 0, '交换位置数量为偶数');
            this.assert(result.score > 0, '交换效果产生分数');
            this.assert(result.effects[0].type === 'random_swap', '效果类型正确');
            
        } catch (error) {
            this.assert(false, '随机交换效果测试', error.message);
        }
    }
    
    /**
     * 测试特殊小鬼组合
     */
    testSpecialCombinations() {
        try {
            // 创建不同类型的特殊小鬼
            const rowClearGhost = this.ghostManager.createSpecialGhost('row-clear');
            const columnClearGhost = this.ghostManager.createSpecialGhost('column-clear');
            const bombGhost1 = this.ghostManager.createSpecialGhost('bomb');
            const bombGhost2 = this.ghostManager.createSpecialGhost('bomb');
            const rainbowGhost = this.ghostManager.createSpecialGhost('rainbow');
            
            // 测试行+列组合
            const rowColumnCombo = this.ghostManager.detectSpecialCombination(rowClearGhost, columnClearGhost);
            this.assert(rowColumnCombo !== null, '检测到行列组合');
            this.assert(rowColumnCombo.result === 'cross-clear', '行列组合结果正确');
            
            // 测试炸弹+炸弹组合
            const bombCombo = this.ghostManager.detectSpecialCombination(bombGhost1, bombGhost2);
            this.assert(bombCombo !== null, '检测到炸弹组合');
            this.assert(bombCombo.result === 'mega-bomb', '炸弹组合结果正确');
            
            // 测试彩虹+行组合
            const rainbowRowCombo = this.ghostManager.detectSpecialCombination(rainbowGhost, rowClearGhost);
            this.assert(rainbowRowCombo !== null, '检测到彩虹行组合');
            this.assert(rainbowRowCombo.result === 'rainbow-row', '彩虹行组合结果正确');
            
            // 测试无效组合
            const normalGhost = this.ghostManager.createRandomGhost();
            const invalidCombo = this.ghostManager.detectSpecialCombination(rowClearGhost, normalGhost);
            this.assert(invalidCombo === null, '普通小鬼无组合效果');
            
        } catch (error) {
            this.assert(false, '特殊小鬼组合测试', error.message);
        }
    }
    
    /**
     * 测试视觉和音效配置
     */
    testVisualAndSoundEffects() {
        try {
            // 测试视觉效果配置
            const rowVisual = this.ghostManager.getVisualEffect('row_clear');
            this.assert(rowVisual.type === 'line', '行清除视觉效果类型正确');
            this.assert(rowVisual.direction === 'horizontal', '行清除方向正确');
            this.assert(rowVisual.duration > 0, '视觉效果有持续时间');
            
            const explosionVisual = this.ghostManager.getVisualEffect('explosion');
            this.assert(explosionVisual.type === 'radial', '爆炸视觉效果类型正确');
            this.assert(explosionVisual.shockwave === true, '爆炸有冲击波效果');
            
            // 测试音效配置
            const rowSound = this.ghostManager.getSoundEffect('row_clear');
            this.assert(rowSound.file !== undefined, '行清除有音效文件');
            this.assert(rowSound.volume > 0 && rowSound.volume <= 1, '音效音量合理');
            
            const explosionSound = this.ghostManager.getSoundEffect('explosion');
            this.assert(explosionSound.file !== undefined, '爆炸有音效文件');
            
            // 测试无效效果类型
            const invalidVisual = this.ghostManager.getVisualEffect('invalid_effect');
            this.assert(invalidVisual !== null, '无效效果返回默认视觉效果');
            
        } catch (error) {
            this.assert(false, '视觉和音效配置测试', error.message);
        }
    }
    
    /**
     * 测试游戏状态对特殊效果的影响
     */
    testGameStateInfluence() {
        try {
            // 创建炸弹小鬼
            const bombGhost = this.ghostManager.createSpecialGhost('bomb');
            
            // 测试基础游戏状态
            const baseGameState = { level: 1, comboCount: 0 };
            const baseRadius = this.ghostManager.getExplosionRadius(bombGhost, baseGameState);
            this.assert(baseRadius >= 1, '基础爆炸半径合理');
            
            // 测试高等级游戏状态
            const highLevelState = { level: 15, comboCount: 0 };
            const highLevelRadius = this.ghostManager.getExplosionRadius(bombGhost, highLevelState);
            this.assert(highLevelRadius >= baseRadius, '高等级增加爆炸半径');
            
            // 测试高连击游戏状态
            const highComboState = { level: 1, comboCount: 5 };
            const highComboRadius = this.ghostManager.getExplosionRadius(bombGhost, highComboState);
            this.assert(highComboRadius >= baseRadius, '高连击增加爆炸半径');
            
            // 测试半径限制
            const extremeState = { level: 100, comboCount: 100 };
            const extremeRadius = this.ghostManager.getExplosionRadius(bombGhost, extremeState);
            this.assert(extremeRadius <= 3, '爆炸半径有最大限制');
            
        } catch (error) {
            this.assert(false, '游戏状态影响测试', error.message);
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
        
        console.log('\n=== 特殊小鬼和道具系统测试结果 ===');
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
    module.exports = SpecialGhostTest;
} else if (typeof window !== 'undefined') {
    window.SpecialGhostTest = SpecialGhostTest;
}