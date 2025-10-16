# Aoyou Digital 医学科普学习平台 - 设计文档

## 系统架构概述

### 整体架构
```
┌─────────────────────────────────────────────────────────┐
│                    微信 H5 前端                          │
├─────────────────────────────────────────────────────────┤
│  用户界面层 (UI Layer)                                   │
│  ├── 注册登录模块    ├── 视频学习模块    ├── 积分系统模块  │
│  ├── 个人中心模块    ├── 社交互动模块    ├── 学习统计模块  │
├─────────────────────────────────────────────────────────┤
│  业务逻辑层 (Business Logic Layer)                       │
│  ├── 用户管理服务    ├── 内容管理服务    ├── 积分管理服务  │
│  ├── 学习跟踪服务    ├── 互动管理服务    ├── 推荐算法服务  │
├─────────────────────────────────────────────────────────┤
│  数据访问层 (Data Access Layer)                          │
│  ├── 用户数据接口    ├── 视频内容接口    ├── 学习记录接口  │
│  ├── 积分记录接口    ├── 互动数据接口    ├── 统计分析接口  │
└─────────────────────────────────────────────────────────┘
```

## 核心模块设计

### 1. 用户认证模块

#### 1.1 邀请码系统
```javascript
class InvitationCodeSystem {
    // 邀请码验证
    async validateCode(code) {
        // 验证邀请码有效性
        // 检查使用次数限制
        // 验证有效期
    }
    
    // 邀请码使用
    async useCode(code, userId) {
        // 标记邀请码已使用
        // 记录使用者信息
        // 更新使用统计
    }
}
```

#### 1.2 用户注册流程
```
用户输入邀请码 → 验证邀请码 → 填写基本信息 → 完成注册 → 分配初始积分
```

### 2. 视频内容模块

#### 2.1 视频分类体系（5-7个主要板块）
```
医学科普学习平台分类
├── 1. 基础医学知识
│   └── 解剖学、生理学、病理学基础
├── 2. 临床医学实践  
│   └── 内科、外科、妇产科、儿科
├── 3. 医学影像诊断
│   └── X光、CT、MRI、超声诊断
├── 4. 药学与治疗
│   └── 药理学、临床用药、治疗方案
├── 5. 医学前沿技术
│   └── 人工智能、精准医学、新技术
├── 6. 医学伦理法规
│   └── 医疗法规、伦理规范、质量管理
└── 7. 继续教育培训
    └── 学术会议、专家讲座、技能培训
```

#### 2.2 视频播放器设计
```javascript
class MedicalVideoPlayer {
    constructor(container, options) {
        this.container = container;
        this.options = {
            autoplay: false,
            controls: true,
            responsive: true,
            qualitySelector: true,
            playbackRates: [0.5, 1, 1.25, 1.5, 2],
            ...options
        };
    }
    
    // 播放进度跟踪
    trackProgress() {
        // 记录观看时长
        // 标记观看完成度
        // 触发积分奖励
    }
    
    // 自适应清晰度
    adaptiveQuality() {
        // 检测网络状况
        // 自动调整视频质量
        // 提供手动选择选项
    }
}
```

### 3. 积分激励系统

#### 3.1 简化积分规则设计
```javascript
const SimplePointsRules = {
    // 基础行为积分（固定值）
    VIDEO_WATCH: 10,      // 观看完整视频
    VIDEO_LIKE: 2,        // 点赞视频
    VIDEO_FAVORITE: 3,    // 收藏视频
    VIDEO_SHARE: 5,       // 分享视频
    
    // 每日上限（防刷机制）
    DAILY_LIMITS: {
        VIDEO_WATCH: 100,   // 每日最多100个视频积分
        VIDEO_LIKE: 20,     // 每日最多20个点赞积分
        VIDEO_FAVORITE: 15, // 每日最多15个收藏积分
        VIDEO_SHARE: 10     // 每日最多10个分享积分
    }
};
```

#### 3.2 简化等级系统
```javascript
const SimpleLevelSystem = {
    levels: [
        { level: 1, name: '初学者', minPoints: 0, maxPoints: 99 },
        { level: 2, name: '学习者', minPoints: 100, maxPoints: 299 },
        { level: 3, name: '进步者', minPoints: 300, maxPoints: 599 },
        { level: 4, name: '实践者', minPoints: 600, maxPoints: 999 },
        { level: 5, name: '专业者', minPoints: 1000, maxPoints: 1999 },
        { level: 6, name: '专家', minPoints: 2000, maxPoints: 3999 },
        { level: 7, name: '大师', minPoints: 4000, maxPoints: 7999 },
        { level: 8, name: '导师', minPoints: 8000, maxPoints: Infinity }
    ],
    
    // 等级仅作展示，无特殊权益
    // 所有用户都可以观看所有视频内容
};
```

### 4. 学习进度管理

#### 4.1 学习记录数据结构
```javascript
const LearningRecord = {
    userId: String,
    videoId: String,
    startTime: Date,
    endTime: Date,
    watchDuration: Number,    // 观看时长（秒）
    totalDuration: Number,    // 视频总时长（秒）
    completionRate: Number,   // 完成度（0-1）
    isCompleted: Boolean,     // 是否完成
    pointsEarned: Number,     // 获得积分
    notes: String,           // 学习笔记
    bookmarks: [Number],     // 书签时间点
    interactions: {          // 互动记录
        likes: Boolean,
        comments: [String],
        shares: Number
    }
};
```

#### 4.2 学习分析算法
```javascript
class LearningAnalytics {
    // 计算学习效率
    calculateEfficiency(records) {
        const totalTime = records.reduce((sum, r) => sum + r.watchDuration, 0);
        const completedVideos = records.filter(r => r.isCompleted).length;
        return completedVideos / (totalTime / 3600); // 每小时完成视频数
    }
    
    // 生成学习报告
    generateReport(userId, period) {
        // 学习时长统计
        // 知识点掌握分析
        // 学习习惯分析
        // 推荐改进建议
    }
    
    // 个性化推荐
    recommendContent(userId) {
        // 基于学习历史
        // 考虑知识点关联
        // 结合用户偏好
        // 难度递进推荐
    }
}
```

### 5. 基础互动系统

#### 5.1 视频互动功能设计
```javascript
class VideoInteractionSystem {
    // 互动数据结构
    interaction: {
        id: String,
        videoId: String,
        userId: String,
        type: String,         // 'like', 'favorite', 'share'
        timestamp: Date
    }
    
    // 点赞功能
    async likeVideo(videoId, userId) {
        // 切换点赞状态
        // 更新点赞计数
        // 给予积分奖励
    }
    
    // 收藏功能
    async favoriteVideo(videoId, userId) {
        // 添加到收藏列表
        // 更新收藏计数
        // 给予积分奖励
    }
    
    // 分享功能
    async shareVideo(videoId, userId, platform) {
        // 生成分享链接
        // 调用微信分享API
        // 记录分享行为
        // 给予积分奖励
    }
}
```

### 6. 移动端适配设计

#### 6.1 响应式布局策略
```css
/* 移动端优先设计 */
.container {
    /* 基础移动端样式 */
    width: 100%;
    padding: 16px;
}

/* 平板适配 */
@media (min-width: 768px) {
    .container {
        max-width: 768px;
        margin: 0 auto;
        padding: 24px;
    }
}

/* 大屏适配 */
@media (min-width: 1024px) {
    .container {
        max-width: 1024px;
        padding: 32px;
    }
}
```

#### 6.2 微信 H5 优化
```javascript
class WeChatOptimization {
    // 微信分享配置
    configWeChatShare(shareData) {
        wx.config({
            // 微信 JS-SDK 配置
        });
        
        wx.ready(() => {
            wx.onMenuShareTimeline(shareData);
            wx.onMenuShareAppMessage(shareData);
        });
    }
    
    // 微信支付集成（如需要）
    initWeChatPay() {
        // 微信支付配置
    }
    
    // 微信登录授权
    weChatAuth() {
        // 获取微信用户信息
        // 绑定平台账户
    }
}
```

## 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    invitation_code VARCHAR(20) NOT NULL,
    wechat_openid VARCHAR(50) UNIQUE,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    profession VARCHAR(100),
    institution VARCHAR(200),
    avatar_url VARCHAR(500),
    total_points INT DEFAULT 0,
    current_level INT DEFAULT 1,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_expert BOOLEAN DEFAULT FALSE
);
```

### 视频内容表 (videos)
```sql
CREATE TABLE videos (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id VARCHAR(36),
    subcategory_id VARCHAR(36),
    duration INT NOT NULL,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    transcript TEXT,
    tags JSON,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    points_reward INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE
);
```

### 学习记录表 (learning_records)
```sql
CREATE TABLE learning_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    video_id VARCHAR(36) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    watch_duration INT DEFAULT 0,
    completion_rate DECIMAL(3,2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT FALSE,
    points_earned INT DEFAULT 0,
    notes TEXT,
    bookmarks JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (video_id) REFERENCES videos(id)
);
```

### 积分记录表 (points_history)
```sql
CREATE TABLE points_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    points_change INT NOT NULL,
    description VARCHAR(200),
    reference_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API 接口设计

### 认证相关接口
```
POST /api/auth/validate-invitation    # 验证邀请码
POST /api/auth/register              # 用户注册
POST /api/auth/login                 # 用户登录
POST /api/auth/wechat-auth          # 微信授权登录
```

### 视频内容接口
```
GET  /api/videos                    # 获取视频列表
GET  /api/videos/:id                # 获取视频详情
GET  /api/videos/categories         # 获取分类列表
GET  /api/videos/search             # 搜索视频
POST /api/videos/:id/view           # 记录观看
```

### 学习管理接口
```
GET  /api/learning/progress         # 获取学习进度
POST /api/learning/record           # 记录学习行为
GET  /api/learning/history          # 获取学习历史
GET  /api/learning/report           # 获取学习报告
GET  /api/learning/recommendations  # 获取推荐内容
```

### 积分系统接口
```
GET  /api/points/balance            # 获取积分余额
GET  /api/points/history            # 获取积分历史
GET  /api/points/leaderboard        # 获取排行榜
POST /api/points/earn               # 获得积分
```

### 社交互动接口
```
GET  /api/comments/:videoId         # 获取评论列表
POST /api/comments                  # 发表评论
POST /api/comments/:id/like         # 点赞评论
POST /api/comments/:id/reply        # 回复评论
```

## 安全设计

### 数据安全
- 用户敏感信息加密存储
- API 接口 HTTPS 传输
- 数据库连接加密
- 定期数据备份

### 访问控制
- JWT Token 认证
- 角色权限管理
- API 访问频率限制
- 敏感操作二次验证

### 内容安全
- 视频内容审核机制
- 评论敏感词过滤
- 用户举报处理流程
- 医学内容专业性审核

## 性能优化策略

### 前端优化
- 组件懒加载
- 图片压缩和 WebP 格式
- CSS 和 JS 文件压缩
- 浏览器缓存策略

### 视频优化
- 多清晰度自适应
- CDN 内容分发
- 视频预加载
- 断点续播功能

### 数据库优化
- 索引优化
- 查询缓存
- 读写分离
- 数据分页加载

### 缓存策略
- Redis 缓存热点数据
- 浏览器本地存储
- API 响应缓存
- 静态资源 CDN 缓存