/**
 * Aoyou Digital 医学科普学习平台 - 微信集成模块
 * 负责微信分享、微信授权等微信生态功能
 */

class AoyouWechatManager {
    constructor() {
        this.isWeChatBrowser = this.checkWeChatBrowser();
        this.isConfigured = false;
        this.config = null;
        
        this.init();
    }
    
    /**
     * 初始化微信SDK
     */
    async init() {
        if (!this.isWeChatBrowser) {
            console.log('非微信环境，跳过微信SDK初始化');
            return;
        }
        
        try {
            // 等待微信SDK加载
            await this.waitForWeChatSDK();
            
            // 获取微信配置
            await this.getWeChatConfig();
            
            // 配置微信SDK
            await this.configureWeChatSDK();
            
            console.log('微信SDK初始化成功');
        } catch (error) {
            console.error('微信SDK初始化失败:', error);
        }
    }
    
    /**
     * 检查是否在微信浏览器中
     */
    checkWeChatBrowser() {
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('micromessenger');
    }
    
    /**
     * 等待微信SDK加载
     */
    waitForWeChatSDK() {
        return new Promise((resolve, reject) => {
            if (typeof wx !== 'undefined') {
                resolve();
                return;
            }
            
            // 动态加载微信SDK
            const script = document.createElement('script');
            script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('微信SDK加载失败'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * 获取微信配置
     */
    async getWeChatConfig() {
        // 模拟获取微信配置
        // 实际应用中需要从后端API获取
        this.config = {
            appId: 'your_app_id',
            timestamp: Math.floor(Date.now() / 1000),
            nonceStr: this.generateNonceStr(),
            signature: 'your_signature'
        };
    }
    
    /**
     * 配置微信SDK
     */
    async configureWeChatSDK() {
        if (typeof wx === 'undefined') {
            throw new Error('微信SDK未加载');
        }
        
        wx.config({
            debug: false,
            appId: this.config.appId,
            timestamp: this.config.timestamp,
            nonceStr: this.config.nonceStr,
            signature: this.config.signature,
            jsApiList: [
                'updateAppMessageShareData',
                'updateTimelineShareData',
                'onMenuShareAppMessage',
                'onMenuShareTimeline',
                'chooseImage',
                'uploadImage',
                'downloadImage'
            ]
        });
        
        return new Promise((resolve, reject) => {
            wx.ready(() => {
                this.isConfigured = true;
                resolve();
            });
            
            wx.error((res) => {
                console.error('微信SDK配置失败:', res);
                reject(new Error('微信SDK配置失败'));
            });
        });
    }
    
    /**
     * 分享到微信
     */
    async share(shareData) {
        if (!this.isWeChatBrowser) {
            throw new Error('请在微信中打开');
        }
        
        if (!this.isConfigured) {
            throw new Error('微信SDK未配置');
        }
        
        const defaultShareData = {
            title: shareData.title || '奥友医学科普学习平台',
            desc: shareData.desc || '专业医学知识，助力医学成长',
            link: shareData.link || window.location.href,
            imgUrl: shareData.imgUrl || this.generateShareImage(shareData)
        };
        
        // 分享给朋友
        wx.updateAppMessageShareData({
            title: defaultShareData.title,
            desc: defaultShareData.desc,
            link: defaultShareData.link,
            imgUrl: defaultShareData.imgUrl,
            success: () => {
                console.log('分享给朋友配置成功');
            },
            fail: (res) => {
                console.error('分享给朋友配置失败:', res);
            }
        });
        
        // 分享到朋友圈
        wx.updateTimelineShareData({
            title: defaultShareData.title,
            link: defaultShareData.link,
            imgUrl: defaultShareData.imgUrl,
            success: () => {
                console.log('分享到朋友圈配置成功');
            },
            fail: (res) => {
                console.error('分享到朋友圈配置失败:', res);
            }
        });
        
        // 兼容旧版本API
        wx.onMenuShareAppMessage({
            title: defaultShareData.title,
            desc: defaultShareData.desc,
            link: defaultShareData.link,
            imgUrl: defaultShareData.imgUrl,
            success: () => {
                console.log('分享给朋友成功');
                this.onShareSuccess('friend');
            },
            cancel: () => {
                console.log('取消分享给朋友');
            }
        });
        
        wx.onMenuShareTimeline({
            title: defaultShareData.title,
            link: defaultShareData.link,
            imgUrl: defaultShareData.imgUrl,
            success: () => {
                console.log('分享到朋友圈成功');
                this.onShareSuccess('timeline');
            },
            cancel: () => {
                console.log('取消分享到朋友圈');
            }
        });
    }
    
    /**
     * 分享成功回调
     */
    onShareSuccess(type) {
        // 触发分享成功事件
        const event = new CustomEvent('wechatShareSuccess', {
            detail: { type }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 生成随机字符串
     */
    generateNonceStr() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    /**
     * 获取微信用户信息
     */
    async getUserInfo() {
        if (!this.isWeChatBrowser) {
            throw new Error('请在微信中打开');
        }
        
        // 这里需要实现微信授权登录流程
        // 实际应用中需要后端配合完成OAuth流程
        console.log('获取微信用户信息功能需要后端支持');
    }
    
    /**
     * 选择图片
     */
    async chooseImage(options = {}) {
        if (!this.isConfigured) {
            throw new Error('微信SDK未配置');
        }
        
        return new Promise((resolve, reject) => {
            wx.chooseImage({
                count: options.count || 1,
                sizeType: options.sizeType || ['original', 'compressed'],
                sourceType: options.sourceType || ['album', 'camera'],
                success: (res) => {
                    resolve(res.localIds);
                },
                fail: (res) => {
                    reject(new Error('选择图片失败'));
                }
            });
        });
    }
    
    /**
     * 上传图片
     */
    async uploadImage(localId) {
        if (!this.isConfigured) {
            throw new Error('微信SDK未配置');
        }
        
        return new Promise((resolve, reject) => {
            wx.uploadImage({
                localId: localId,
                isShowProgressTips: 1,
                success: (res) => {
                    resolve(res.serverId);
                },
                fail: (res) => {
                    reject(new Error('上传图片失败'));
                }
            });
        });
    }
    waitForWeChatSDK() {
        return new Promise((resolve, reject) => {
            if (typeof wx !== 'undefined') {
                resolve();
                return;
            }
            
            let attempts = 0;
            const maxAttempts = 50; // 5秒超时
            
            const checkSDK = () => {
                attempts++;
                
                if (typeof wx !== 'undefined') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('微信SDK加载超时'));
                } else {
                    setTimeout(checkSDK, 100);
                }
            };
            
            checkSDK();
        });
    }
    
    /**
     * 获取微信配置
     */
    async getWeChatConfig() {
        try {
            // 在实际应用中，这里应该调用后端API获取微信配置
            // 这里使用模拟配置用于演示
            this.config = {
                appId: 'your_wechat_app_id',
                timestamp: Math.floor(Date.now() / 1000),
                nonceStr: this.generateNonceStr(),
                signature: 'your_signature',
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'updateAppMessageShareData',
                    'updateTimelineShareData',
                    'chooseImage',
                    'uploadImage',
                    'downloadImage'
                ]
            };
            
            console.log('微信配置获取成功');
        } catch (error) {
            console.error('获取微信配置失败:', error);
            throw error;
        }
    }
    
    /**
     * 配置微信SDK
     */
    configureWeChatSDK() {
        return new Promise((resolve, reject) => {
            if (!this.config) {
                reject(new Error('微信配置未获取'));
                return;
            }
            
            wx.config({
                debug: false, // 生产环境设为false
                appId: this.config.appId,
                timestamp: this.config.timestamp,
                nonceStr: this.config.nonceStr,
                signature: this.config.signature,
                jsApiList: this.config.jsApiList
            });
            
            wx.ready(() => {
                this.isConfigured = true;
                console.log('微信SDK配置成功');
                resolve();
            });
            
            wx.error((res) => {
                console.error('微信SDK配置失败:', res);
                reject(new Error('微信SDK配置失败: ' + res.errMsg));
            });
        });
    }
    
    /**
     * 分享到微信
     */
    async share(shareData) {
        if (!this.isWeChatBrowser) {
            throw new Error('请在微信中打开');
        }
        
        if (!this.isConfigured) {
            throw new Error('微信SDK未配置');
        }
        
        const defaultShareData = {
            title: 'Aoyou Digital - 医学科普学习平台',
            desc: '专业医学科普学习平台，提供优质医学视频内容',
            link: window.location.href,
            imgUrl: window.location.origin + '/images/share-logo.png'
        };
        
        const finalShareData = { ...defaultShareData, ...shareData };
        
        return new Promise((resolve, reject) => {
            try {
                // 分享到朋友圈
                wx.updateTimelineShareData({
                    title: finalShareData.title,
                    link: finalShareData.link,
                    imgUrl: finalShareData.imgUrl,
                    success: () => {
                        console.log('朋友圈分享配置成功');
                    },
                    fail: (error) => {
                        console.error('朋友圈分享配置失败:', error);
                    }
                });
                
                // 分享给朋友
                wx.updateAppMessageShareData({
                    title: finalShareData.title,
                    desc: finalShareData.desc,
                    link: finalShareData.link,
                    imgUrl: finalShareData.imgUrl,
                    success: () => {
                        console.log('好友分享配置成功');
                    },
                    fail: (error) => {
                        console.error('好友分享配置失败:', error);
                    }
                });
                
                // 兼容旧版本API
                wx.onMenuShareTimeline({
                    title: finalShareData.title,
                    link: finalShareData.link,
                    imgUrl: finalShareData.imgUrl,
                    success: () => {
                        console.log('朋友圈分享成功');
                        resolve('timeline');
                    },
                    cancel: () => {
                        console.log('用户取消朋友圈分享');
                        reject(new Error('用户取消分享'));
                    }
                });
                
                wx.onMenuShareAppMessage({
                    title: finalShareData.title,
                    desc: finalShareData.desc,
                    link: finalShareData.link,
                    imgUrl: finalShareData.imgUrl,
                    success: () => {
                        console.log('好友分享成功');
                        resolve('appmessage');
                    },
                    cancel: () => {
                        console.log('用户取消好友分享');
                        reject(new Error('用户取消分享'));
                    }
                });
                
                // 提示用户点击分享按钮
                this.showShareTip();
                
            } catch (error) {
                console.error('分享配置失败:', error);
                reject(error);
            }
        });
    }
    
    /**
     * 显示分享提示
     */
    showShareTip() {
        // 创建分享提示遮罩
        const overlay = document.createElement('div');
        overlay.className = 'wechat-share-tip';
        overlay.innerHTML = `
            <div class="share-tip-content">
                <div class="share-tip-arrow"></div>
                <div class="share-tip-text">点击右上角分享给朋友</div>
            </div>
        `;
        
        // 添加样式
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            padding: 20px;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .share-tip-content {
                background-color: white;
                padding: 12px 16px;
                border-radius: 8px;
                position: relative;
                margin-top: 40px;
                margin-right: 10px;
            }
            .share-tip-arrow {
                position: absolute;
                top: -8px;
                right: 20px;
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-bottom: 8px solid white;
            }
            .share-tip-text {
                font-size: 14px;
                color: #333;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
        
        // 点击遮罩关闭
        overlay.addEventListener('click', () => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        });
        
        document.body.appendChild(overlay);
        
        // 3秒后自动关闭
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 3000);
    }
    
    /**
     * 获取微信用户信息
     */
    async getWeChatUserInfo() {
        if (!this.isWeChatBrowser) {
            throw new Error('请在微信中打开');
        }
        
        // 在实际应用中，这里需要通过微信授权获取用户信息
        // 由于需要后端配合，这里返回模拟数据
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    openid: 'mock_openid_' + Date.now(),
                    nickname: '微信用户',
                    headimgurl: './images/default-avatar.png',
                    sex: 0,
                    province: '',
                    city: '',
                    country: ''
                });
            }, 1000);
        });
    }
    
    /**
     * 微信支付（如果需要）
     */
    async weChatPay(paymentData) {
        if (!this.isWeChatBrowser) {
            throw new Error('请在微信中打开');
        }
        
        if (!this.isConfigured) {
            throw new Error('微信SDK未配置');
        }
        
        return new Promise((resolve, reject) => {
            wx.chooseWXPay({
                timestamp: paymentData.timestamp,
                nonceStr: paymentData.nonceStr,
                package: paymentData.package,
                signType: paymentData.signType,
                paySign: paymentData.paySign,
                success: (res) => {
                    console.log('微信支付成功:', res);
                    resolve(res);
                },
                fail: (error) => {
                    console.error('微信支付失败:', error);
                    reject(error);
                },
                cancel: () => {
                    console.log('用户取消支付');
                    reject(new Error('用户取消支付'));
                }
            });
        });
    }
    
    /**
     * 选择图片
     */
    async chooseImage(options = {}) {
        if (!this.isWeChatBrowser) {
            throw new Error('请在微信中打开');
        }
        
        if (!this.isConfigured) {
            throw new Error('微信SDK未配置');
        }
        
        const defaultOptions = {
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera']
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        return new Promise((resolve, reject) => {
            wx.chooseImage({
                count: finalOptions.count,
                sizeType: finalOptions.sizeType,
                sourceType: finalOptions.sourceType,
                success: (res) => {
                    console.log('选择图片成功:', res);
                    resolve(res.localIds);
                },
                fail: (error) => {
                    console.error('选择图片失败:', error);
                    reject(error);
                }
            });
        });
    }
    
    /**
     * 上传图片
     */
    async uploadImage(localId) {
        if (!this.isWeChatBrowser) {
            throw new Error('请在微信中打开');
        }
        
        if (!this.isConfigured) {
            throw new Error('微信SDK未配置');
        }
        
        return new Promise((resolve, reject) => {
            wx.uploadImage({
                localId: localId,
                isShowProgressTips: 1,
                success: (res) => {
                    console.log('上传图片成功:', res);
                    resolve(res.serverId);
                },
                fail: (error) => {
                    console.error('上传图片失败:', error);
                    reject(error);
                }
            });
        });
    }
    
    /**
     * 设置微信菜单
     */
    setWeChatMenu() {
        if (!this.isWeChatBrowser || !this.isConfigured) {
            return;
        }
        
        // 隐藏微信默认的分享菜单项
        wx.hideMenuItems({
            menuList: [
                'menuItem:share:qq',
                'menuItem:share:weiboApp',
                'menuItem:share:facebook',
                'menuItem:share:QZone'
            ]
        });
        
        // 显示需要的菜单项
        wx.showMenuItems({
            menuList: [
                'menuItem:share:appMessage',
                'menuItem:share:timeline'
            ]
        });
    }
    
    /**
     * 获取网络状态
     */
    async getNetworkType() {
        if (!this.isWeChatBrowser || !this.isConfigured) {
            return 'unknown';
        }
        
        return new Promise((resolve) => {
            wx.getNetworkType({
                success: (res) => {
                    resolve(res.networkType);
                },
                fail: () => {
                    resolve('unknown');
                }
            });
        });
    }
    
    /**
     * 关闭微信窗口
     */
    closeWindow() {
        if (!this.isWeChatBrowser || !this.isConfigured) {
            return;
        }
        
        wx.closeWindow();
    }
    
    /**
     * 生成随机字符串
     */
    generateNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    }
    
    /**
     * 获取当前URL（去除hash）
     */
    getCurrentUrl() {
        return window.location.href.split('#')[0];
    }
    
    /**
     * 检查微信版本
     */
    checkWeChatVersion() {
        if (!this.isWeChatBrowser) {
            return null;
        }
        
        const ua = navigator.userAgent;
        const match = ua.match(/MicroMessenger\/(\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
    }
    
    /**
     * 是否支持微信JS-SDK
     */
    isSupportedWeChatVersion() {
        const version = this.checkWeChatVersion();
        if (!version) return false;
        
        const [major, minor] = version.split('.').map(Number);
        return major > 6 || (major === 6 && minor >= 0);
    }
    
    /**
     * 预加载微信分享数据
     */
    preloadShareData(video) {
        if (!video || !this.isWeChatBrowser) return;
        
        const shareData = {
            title: video.title,
            desc: video.description || '来自Aoyou Digital医学科普学习平台',
            link: window.location.href,
            imgUrl: video.thumbnail || (window.location.origin + '/images/share-logo.png')
        };
        
        // 预设置分享数据
        if (this.isConfigured) {
            this.share(shareData).catch(error => {
                console.log('预设置分享数据:', error.message);
            });
        }
    }
    
    /**
     * 监听微信分享事件
     */
    onShareSuccess(callback) {
        if (!this.isWeChatBrowser || !this.isConfigured) {
            return;
        }
        
        // 这里可以添加分享成功的回调处理
        console.log('设置分享成功回调');
    }
    
    /**
     * 获取微信环境信息
     */
    getWeChatEnvironmentInfo() {
        return {
            isWeChatBrowser: this.isWeChatBrowser,
            isConfigured: this.isConfigured,
            version: this.checkWeChatVersion(),
            isSupported: this.isSupportedWeChatVersion(),
            userAgent: navigator.userAgent
        };
    }
}

}

// 页面加载完成后初始化微信SDK
document.addEventListener('DOMContentLoaded', () => {
    window.AoyouWechatManager = new AoyouWechatManager();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AoyouWechatManager;
}

    /**
     * 生成分享图片
     */
    generateShareImage(shareData) {
        // 创建canvas生成分享图片
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        // 背景渐变
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);
        
        // 标题
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(shareData.title || '奥友医学科普', 200, 100);
        
        // 描述
        ctx.font = '16px Arial';
        ctx.fillText(shareData.desc || '专业医学知识学习平台', 200, 140);
        
        // Logo
        ctx.font = 'bold 32px Arial';
        ctx.fillText('🏥', 200, 200);
        
        // 底部文字
        ctx.font = '14px Arial';
        ctx.fillText('扫码观看更多医学视频', 200, 250);
        
        return canvas.toDataURL();
    }
    
    /**
     * 设置自定义分享内容
     */
    setCustomShareContent(videoData) {
        if (!videoData) return;
        
        const shareData = {
            title: `${videoData.title} - 奥友医学`,
            desc: `${videoData.description || '专业医学视频'} | ${videoData.categoryName || '医学科普'}`,
            link: `${window.location.origin}${window.location.pathname}?video=${videoData.id}`,
            imgUrl: videoData.thumbnail || this.generateShareImage(videoData)
        };
        
        this.share(shareData);
    }