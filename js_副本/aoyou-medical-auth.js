/**
 * Aoyou Digital 医学科普学习平台 - 用户认证模块
 * 负责用户注册、登录和邀请码验证
 */

class AoyouAuthManager {
    constructor() {
        // 简化的4位数字邀请码
        this.validInviteCodes = [
            '1234', '5678', '9999', '0000', '1111', 
            '2222', '3333', '4444', '5555', '6666',
            '7777', '8888', '1024', '2048', '3456'
        ];
        
        this.currentInviteCode = null;
        
        this.init();
    }
    
    /**
     * 初始化认证模块
     */
    init() {
        this.initEventListeners();
        this.initFormState();
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 邀请码验证
        document.getElementById('verify-code-btn')?.addEventListener('click', () => {
            this.verifyInviteCode();
        });
        
        // 注册提交
        document.getElementById('register-btn')?.addEventListener('click', () => {
            this.handleRegister();
        });
        
        // 登录提交
        document.getElementById('login-submit-btn')?.addEventListener('click', () => {
            this.handleLogin();
        });
        
        // 切换登录/注册
        document.getElementById('switch-to-login')?.addEventListener('click', () => {
            this.switchToLogin();
        });
        
        document.getElementById('switch-to-register')?.addEventListener('click', () => {
            this.switchToRegister();
        });
        
        // 邀请码输入框回车事件
        document.getElementById('invite-code')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifyInviteCode();
            }
        });
        
        // 登录用户名输入框回车事件
        document.getElementById('login-username')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
        
        // 注册表单输入框回车事件
        document.getElementById('username')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleRegister();
            }
        });
    }
    
    /**
     * 初始化表单状态
     */
    initFormState() {
        this.showRegisterForm();
    }
    
    /**
     * 验证邀请码（简化版）
     */
    async verifyInviteCode() {
        const inviteCodeInput = document.getElementById('invite-code');
        const verifyBtn = document.getElementById('verify-code-btn');
        
        if (!inviteCodeInput || !verifyBtn) return;
        
        const inviteCode = inviteCodeInput.value.trim();
        
        // 简单验证：4位数字
        if (!inviteCode) {
            this.showToast('请输入邀请码');
            this.shakeInput(inviteCodeInput);
            return;
        }
        
        if (!/^\d{4}$/.test(inviteCode)) {
            this.showToast('邀请码应为4位数字');
            this.shakeInput(inviteCodeInput);
            return;
        }
        
        // 显示验证中状态
        verifyBtn.textContent = '验证中...';
        verifyBtn.disabled = true;
        
        try {
            // 模拟验证延迟
            await this.delay(800);
            
            if (this.validInviteCodes.includes(inviteCode)) {
                this.currentInviteCode = inviteCode;
                
                // 直接完成注册，创建简单用户
                const user = {
                    id: 'user_' + Date.now(),
                    name: '用户' + inviteCode,
                    inviteCode: inviteCode,
                    avatar: './images/default-avatar.png',
                    points: 100,
                    level: 1,
                    registeredAt: new Date().toISOString()
                };
                
                // 保存用户数据
                localStorage.setItem('aoyou_user', JSON.stringify(user));
                
                verifyBtn.textContent = '✓ 验证成功';
                verifyBtn.style.backgroundColor = '#2ECC71';
                verifyBtn.style.color = 'white';
                
                this.showToast('邀请码验证成功！正在进入平台...');
                
                // 直接跳转
                setTimeout(() => {
                    if (window.AoyouMedicalApp) {
                        window.AoyouMedicalApp.currentUser = user;
                        window.AoyouMedicalApp.updateUserUI();
                        
                        // 如果有待播放的视频，直接播放
                        if (window.AoyouMedicalApp.pendingVideo) {
                            window.AoyouMedicalApp.playPendingVideo();
                        } else {
                            window.AoyouMedicalApp.navigateTo('main');
                        }
                    }
                }, 1000);
                
            } else {
                throw new Error('邀请码无效，请检查后重试');
            }
        } catch (error) {
            this.showToast(error.message);
            verifyBtn.textContent = '验证';
            verifyBtn.disabled = false;
            this.shakeInput(inviteCodeInput);
        }
    }
    
    /**
     * 检查邀请码是否有效（简化版）
     */
    isValidInviteCode(code) {
        return this.validInviteCodes.includes(code);
    }
    
    /**
     * 处理用户注册（已简化到验证邀请码中）
     */
    async handleRegister() {
        // 这个方法已经不需要了，注册逻辑已经合并到 verifyInviteCode 中
        this.showToast('请使用邀请码验证功能');
    }
    
    /**
     * 处理用户登录（简化版）
     */
    async handleLogin() {
        const inviteCode = document.getElementById('login-username')?.value.trim();
        
        if (!inviteCode) {
            this.showToast('请输入邀请码');
            return;
        }
        
        if (!/^\d{4}$/.test(inviteCode)) {
            this.showToast('邀请码应为4位数字');
            return;
        }
        
        const loginBtn = document.getElementById('login-submit-btn');
        if (loginBtn) {
            loginBtn.textContent = '登录中...';
            loginBtn.disabled = true;
        }
        
        try {
            // 模拟登录延迟
            await this.delay(800);
            
            if (this.validInviteCodes.includes(inviteCode)) {
                // 创建或获取用户
                let user = JSON.parse(localStorage.getItem('aoyou_user') || 'null');
                
                if (!user || user.inviteCode !== inviteCode) {
                    user = {
                        id: 'user_' + Date.now(),
                        name: '用户' + inviteCode,
                        inviteCode: inviteCode,
                        avatar: './images/default-avatar.png',
                        points: 100,
                        level: 1,
                        registeredAt: new Date().toISOString()
                    };
                }
                
                user.lastLoginAt = new Date().toISOString();
                localStorage.setItem('aoyou_user', JSON.stringify(user));
                
                this.showToast('登录成功！');
                
                // 延迟跳转
                setTimeout(() => {
                    if (window.AoyouMedicalApp) {
                        window.AoyouMedicalApp.currentUser = user;
                        window.AoyouMedicalApp.updateUserUI();
                        
                        // 如果有待播放的视频，直接播放
                        if (window.AoyouMedicalApp.pendingVideo) {
                            window.AoyouMedicalApp.playPendingVideo();
                        } else {
                            window.AoyouMedicalApp.navigateTo('main');
                        }
                    }
                }, 1000);
                
            } else {
                throw new Error('邀请码无效，请检查后重试');
            }
            
        } catch (error) {
            this.showToast(error.message || '登录失败，请重试');
            if (loginBtn) {
                loginBtn.textContent = '登录';
                loginBtn.disabled = false;
            }
        }
    }
    
    /**
     * 切换到登录表单
     */
    switchToLogin() {
        this.isRegistering = false;
        this.showLoginForm();
    }
    
    /**
     * 切换到注册表单
     */
    switchToRegister() {
        this.isRegistering = true;
        this.showRegisterForm();
        this.resetRegisterForm();
    }
    
    /**
     * 显示注册表单
     */
    showRegisterForm() {
        document.getElementById('register-form')?.classList.remove('hidden');
        document.getElementById('login-form')?.classList.add('hidden');
        document.getElementById('switch-to-login')?.classList.remove('hidden');
        document.getElementById('switch-to-register')?.classList.add('hidden');
    }
    
    /**
     * 显示登录表单
     */
    showLoginForm() {
        document.getElementById('register-form')?.classList.add('hidden');
        document.getElementById('login-form')?.classList.remove('hidden');
        document.getElementById('switch-to-login')?.classList.add('hidden');
        document.getElementById('switch-to-register')?.classList.add('hidden');
        
        // 聚焦到邀请码输入框
        document.getElementById('login-username')?.focus();
    }
    
    /**
     * 重置注册表单（简化版）
     */
    resetRegisterForm() {
        const inviteCodeInput = document.getElementById('invite-code');
        const verifyBtn = document.getElementById('verify-code-btn');
        
        if (inviteCodeInput) {
            inviteCodeInput.value = '';
            inviteCodeInput.disabled = false;
        }
        
        if (verifyBtn) {
            verifyBtn.textContent = '验证并进入';
            verifyBtn.disabled = false;
            verifyBtn.style.backgroundColor = '';
            verifyBtn.style.color = '';
        }
        
        this.currentInviteCode = null;
    }
    
    /**
     * 生成用户ID
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 保存用户数据（简化版）
     */
    saveUserData(user) {
        localStorage.setItem('aoyou_user', JSON.stringify(user));
    }
    
    /**
     * 记录注册积分（简化版）
     */
    recordRegistrationPoints(user) {
        // 简化版本，积分已经在用户创建时设置
        console.log(`用户 ${user.name} 获得注册奖励积分: ${user.points}`);
    }
    
    /**
     * 用户登出
     */
    logout() {
        localStorage.removeItem('aoyou_user');
        
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.currentUser = null;
            window.AoyouMedicalApp.updateUserUI();
            window.AoyouMedicalApp.navigateTo('auth');
        }
        
        this.showToast('已退出登录');
    }
    
    /**
     * 检查用户是否已登录
     */
    isLoggedIn() {
        const userData = localStorage.getItem('aoyou_user');
        return userData !== null;
    }
    
    /**
     * 获取当前用户
     */
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('aoyou_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('获取当前用户失败:', error);
            return null;
        }
    }
    
    /**
     * 更新用户信息
     */
    updateUserInfo(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;
        
        const updatedUser = { ...currentUser, ...updates };
        this.saveUserData(updatedUser);
        
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.currentUser = updatedUser;
            window.AoyouMedicalApp.updateUserUI();
        }
        
        return true;
    }
    
    /**
     * 验证用户权限
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // 基础权限检查
        switch (permission) {
            case 'watch_video':
                return true; // 所有用户都可以观看视频
            case 'like_video':
                return true; // 所有用户都可以点赞
            case 'favorite_video':
                return true; // 所有用户都可以收藏
            case 'share_video':
                return true; // 所有用户都可以分享
            default:
                return false;
        }
    }
    

    
    /**
     * 输入框抖动效果
     */
    shakeInput(input) {
        if (!input) return;
        
        input.style.animation = 'shake 0.5s ease-in-out';
        input.style.borderColor = '#E74C3C';
        
        setTimeout(() => {
            input.style.animation = '';
            input.style.borderColor = '';
        }, 500);
    }
    
    /**
     * 工具方法：延迟执行
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    

    
    /**
     * 显示提示消息
     */
    showToast(message) {
        if (window.AoyouMedicalApp) {
            window.AoyouMedicalApp.showToast(message);
        } else {
            alert(message); // 降级处理
        }
    }
}

// 页面加载完成后初始化认证模块
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouMedicalAuth = new AoyouMedicalAuth();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouMedicalAuth;
}