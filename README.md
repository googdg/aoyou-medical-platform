# 🏥 奥友医学视频平台

一个专业的医学科普视频学习平台，采用邀请码验证机制，为特定用户群体提供高质量的医学教育内容。

## ✨ 核心特色

### 🔐 邀请码验证系统
- **双重验证机制** - 登录邀请码 + 视频访问邀请码
- **永久验证状态** - 每个用户只需验证一次，永久有效
- **数字邀请码** - 简单易用的数字验证码系统
- **安全访问控制** - 确保内容仅对授权用户开放

### 🎬 视频学习功能
- **7个医学分类** - 临床医学、基础医学、药学治疗、影像诊断、检验医学、预防医学、伦理法规
- **YouTube风格界面** - 现代化的视频浏览体验
- **视频互动功能** - 点赞、收藏、分享、观看进度记录
- **移动端优化** - 完美适配手机和平板设备

### 🎯 用户体验
- **积分等级系统** - 8级用户等级，激励学习进步
- **学习进度追踪** - 记录观看历史和学习成果
- **响应式设计** - 支持各种屏幕尺寸
- **流畅动画效果** - 专业的交互体验

### 技术特色
- **移动端优化** - 响应式设计，完美适配移动设备
- **数据持久化** - IndexedDB + LocalStorage 双重保障
- **性能优化** - 懒加载、缓存策略、Service Worker
- **用户体验优化** - 加载状态、错误处理、引导教程
- **数据统计分析** - 完整的用户行为追踪和分析

## 🚀 快速开始

### 环境要求
- 现代浏览器（Chrome 70+, Safari 12+, Firefox 65+）
- 支持ES6+的JavaScript环境
- 可选：Python 3.x（用于本地开发服务器）

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/aoyou-digital/medical-platform.git
cd medical-platform
```

2. **启动开发服务器**
```bash
# 使用Python（推荐）
npm run dev
# 或者
python3 -m http.server 3000

# 使用Node.js（需要安装http-server）
npx http-server -p 3000
```

3. **访问应用**
- **主平台**：`http://localhost:3000/aoyou-youtube-style.html`
- **视频详情页**：`http://localhost:3000/video-detail.html`
- **功能测试**：`http://localhost:3000/aoyou-medical-test.html`

## 🎬 演示版本

### 快速演示
```bash
# 一键启动演示（推荐）
./start-demo.sh

# 或手动设置
./generate-placeholder-images.sh  # 生成占位符图片
./download-demo-videos.sh         # 下载演示视频
python3 -m http.server 3000       # 启动服务器
```

### 🔑 演示账号信息

#### 登录信息
- **邀请码**: `AOYOU2024`
- **用户名**: `demo`（或任意）
- **密码**: `demo123`（或任意）

#### 视频访问邀请码
- **邀请码**: 任意数字（如：`1234`、`888`、`2024`等）
- **验证说明**: 首次观看视频时需要输入数字邀请码
- **验证状态**: 验证一次后永久有效

### 演示内容
- 📚 **14个演示视频** - 涵盖8个医学分类
- 🖼️ **完整图片资源** - 视频缩略图、讲师头像等
- 🎯 **全功能体验** - 注册、学习、积分、分享等
- 📱 **移动端测试** - 响应式设计、触摸交互

详细演示说明请查看 [DEMO_README.md](DEMO_README.md)

### 生产部署

1. **构建项目**
```bash
npm run build
```

2. **部署到服务器**
```bash
# 上传dist目录到服务器
rsync -avz --delete dist/ user@server:/var/www/html/
```

## 📱 移动端支持

### 微信H5优化
- 微信内置浏览器完美兼容
- 微信分享功能集成
- 移动端触摸交互优化

### PWA支持
- Service Worker离线缓存
- 可安装到桌面
- 推送通知支持

## 🏗️ 项目结构

```
aoyou-medical-platform/
├── 📄 核心页面
│   ├── aoyou-youtube-style.html   # 主平台页面（YouTube风格）
│   ├── video-detail.html         # 视频详情页
│   └── index.html                # 首页（可选）
├── 🎬 媒体资源
│   ├── videos/                   # 演示视频文件
│   │   ├── demo-video-1.mp4
│   │   └── demo-video-2.mp4
│   └── images/                   # 图片资源
│       ├── video-thumbnails/     # 视频缩略图
│       └── avatars/             # 讲师头像
├── 💻 脚本和样式
│   ├── js/                      # JavaScript模块
│   │   ├── aoyou-medical-*.js   # 功能模块
│   │   └── main.js              # 主脚本
│   └── css/                     # 样式文件
│       └── aoyou-medical.css    # 主样式
├── 🛠️ 配置和工具
│   ├── .gitignore              # Git忽略文件
│   ├── package.json            # 项目配置
│   ├── deploy.sh               # 部署脚本
│   └── start-demo.sh           # 演示启动脚本
└── 📚 文档
    ├── README.md               # 项目说明
    ├── DEPLOYMENT.md           # 部署指南
    └── LICENSE                 # 许可证
```

## 🎯 功能模块

### 1. 用户认证系统 (`aoyou-medical-auth.js`)
- 邀请码验证和注册
- 用户会话管理
- 权限控制

### 2. 视频播放系统 (`aoyou-medical-video.js`)
- 视频播放控制
- 互动功能（点赞、收藏、分享）
- 播放进度记录

### 3. 积分等级系统 (`aoyou-medical-points.js`)
- 积分获取机制
- 8级等级系统
- 防刷机制

### 4. 微信集成 (`aoyou-medical-wechat.js`)
- 微信分享功能
- 微信环境检测
- 自定义分享内容

### 5. 移动端优化 (`aoyou-medical-mobile.js`)
- 触摸交互优化
- 横竖屏适配
- 手势识别

### 6. 数据存储 (`aoyou-medical-storage.js`)
- IndexedDB数据库
- 离线数据同步
- 数据备份恢复

### 7. 性能优化 (`aoyou-medical-performance.js`)
- 图片懒加载
- 资源预加载
- 缓存策略

### 8. 用户体验 (`aoyou-medical-ux.js`)
- 加载状态管理
- 错误处理
- 用户引导

### 9. 数据分析 (`aoyou-medical-analytics.js`)
- 用户行为追踪
- 性能监控
- 数据报表

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 访问测试页面
open http://localhost:3000/aoyou-medical-test.html
```

### 测试覆盖
- ✅ 用户认证功能测试
- ✅ 视频播放功能测试
- ✅ 积分系统功能测试
- ✅ 移动端兼容性测试
- ✅ 性能测试
- ✅ 数据存储测试
- ✅ 微信集成测试
- ✅ 用户体验测试

## 📊 性能指标

### 加载性能
- 首次内容绘制 (FCP) < 2秒
- 最大内容绘制 (LCP) < 3秒
- 页面完全加载 < 5秒

### 用户体验
- 交互响应时间 < 100ms
- 视觉稳定性 (CLS) < 0.1
- 首次输入延迟 (FID) < 100ms

### 移动端优化
- 移动端友好性评分 > 95
- 触摸目标大小 ≥ 44px
- 视口配置正确

## 🔧 配置说明

### 环境变量
```javascript
// 在实际部署中，这些配置应该通过环境变量设置
const CONFIG = {
    API_BASE_URL: 'https://api.aoyou.digital',
    WECHAT_APP_ID: 'your_wechat_app_id',
    ANALYTICS_ID: 'your_analytics_id'
};
```

### 服务器配置

#### Nginx配置示例
```nginx
server {
    listen 80;
    server_name medical.aoyou.digital;
    root /var/www/html;
    index index.html;
    
    # 启用Gzip压缩
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    
    # 缓存静态资源
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache配置示例
```apache
# .htaccess文件内容
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# 启用压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/css application/javascript
</IfModule>

# 设置缓存
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

## 🛡️ 安全考虑

### 前端安全
- XSS防护：内容过滤和转义
- CSRF防护：Token验证
- 数据验证：输入验证和清理
- 安全头：CSP、HSTS等

### 数据安全
- 本地数据加密存储
- 敏感信息不在前端存储
- 安全的数据传输

## 📈 监控和分析

### 性能监控
- 页面加载时间监控
- 资源加载性能追踪
- 用户交互响应时间

### 用户行为分析
- 页面访问统计
- 功能使用情况
- 用户路径分析

### 错误监控
- JavaScript错误捕获
- 网络请求失败监控
- 用户反馈收集

## 🤝 贡献指南

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

### 代码规范
- 使用ES6+语法
- 遵循JSDoc注释规范
- 保持代码简洁和可读性
- 添加适当的测试

### 提交规范
```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目主页：https://medical.aoyou.digital
- 问题反馈：https://github.com/aoyou-digital/medical-platform/issues
- 邮箱：support@aoyou.digital

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和医学专家。

---

**奥友医学科普学习平台** - 让医学学习更简单、更高效！
## 🛠️ 故
障排除

### 常见问题及解决方案

#### 1. 页面加载错误
如果遇到JavaScript错误或页面无法正常显示：

```bash
# 使用简化版本（推荐用于测试）
open aoyou-medical-simple.html

# 使用错误诊断工具
open debug-errors.html
```

#### 2. 资源文件缺失
如果图片或视频无法显示：

```bash
# 生成占位符资源
./generate-placeholder-images.sh

# 下载演示视频
./download-demo-videos.sh
```

#### 3. Service Worker 错误
如果Service Worker注册失败：
- 确保使用HTTP服务器访问（不是file://协议）
- 检查浏览器是否支持Service Worker
- 清除浏览器缓存后重试

#### 4. 移动端兼容性问题
- 确保使用现代浏览器（Chrome 70+, Safari 12+）
- 检查viewport设置
- 测试触摸事件是否正常

#### 5. 本地存储问题
如果数据无法保存：
- 检查浏览器是否启用localStorage
- 清除浏览器数据后重试
- 使用隐私模式可能会限制存储功能

### 调试工具

#### 错误诊断页面
访问 `debug-errors.html` 可以：
- 检查所有资源文件状态
- 测试JavaScript模块加载
- 查看详细的错误日志
- 验证浏览器兼容性

#### 简化版本
访问 `aoyou-medical-simple.html` 可以：
- 体验核心功能
- 避免复杂的依赖问题
- 快速验证基本流程

### 浏览器支持

| 浏览器 | 最低版本 | 推荐版本 |
|--------|----------|----------|
| Chrome | 70+ | 最新版 |
| Safari | 12+ | 最新版 |
| Firefox | 65+ | 最新版 |
| Edge | 79+ | 最新版 |

### 性能优化建议

1. **启用HTTP/2**: 提高资源加载速度
2. **使用CDN**: 加速静态资源访问
3. **启用Gzip**: 压缩传输内容
4. **配置缓存**: 设置适当的缓存策略

### 技术支持

如果问题仍然存在：

1. 查看浏览器控制台错误信息
2. 使用 `debug-errors.html` 进行诊断
3. 检查网络连接状态
4. 确认文件权限设置
5. 尝试使用简化版本