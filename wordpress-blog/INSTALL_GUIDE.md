# WordPress 博客安装指南

由于你的系统没有安装 Docker，我为你提供几种安装 WordPress 的方案。

## 方案一：使用 Docker（推荐）

### 1. 安装 Docker Desktop
访问 [Docker 官网](https://www.docker.com/products/docker-desktop/) 下载适合你系统的版本：
- macOS: Docker Desktop for Mac
- Windows: Docker Desktop for Windows
- Linux: Docker Engine

### 2. 安装完成后启动项目
```bash
cd wordpress-blog
docker-compose up -d
```

### 3. 访问博客
- 博客地址: http://localhost:8080
- 管理后台: http://localhost:8080/wp-admin

## 方案二：本地 LAMP/MAMP 环境

### macOS 用户
1. **安装 MAMP**
   - 下载 [MAMP](https://www.mamp.info/en/downloads/)
   - 安装并启动 Apache 和 MySQL

2. **下载 WordPress**
   ```bash
   cd /Applications/MAMP/htdocs
   wget https://wordpress.org/latest.zip
   unzip latest.zip
   mv wordpress wordpress-blog
   ```

3. **配置数据库**
   - 访问 http://localhost/phpMyAdmin
   - 创建数据库 `wordpress_blog`

4. **安装 WordPress**
   - 访问 http://localhost/wordpress-blog
   - 按照安装向导完成设置

### Windows 用户
1. **安装 XAMPP**
   - 下载 [XAMPP](https://www.apachefriends.org/)
   - 启动 Apache 和 MySQL

2. **下载 WordPress**
   - 下载 WordPress 到 `C:\xampp\htdocs\wordpress-blog`

3. **配置和安装**
   - 访问 http://localhost/wordpress-blog
   - 完成安装向导

## 方案三：在线安装（最简单）

### 免费托管平台
1. **WordPress.com**
   - 访问 [WordPress.com](https://wordpress.com)
   - 注册免费账户
   - 选择免费计划

2. **其他免费平台**
   - 000webhost
   - InfinityFree
   - AwardSpace

### 付费托管（推荐生产环境）
- Bluehost
- SiteGround  
- WP Engine
- 阿里云
- 腾讯云

## 方案四：使用 Local by Flywheel（本地开发）

1. **下载 Local**
   - 访问 [Local](https://localwp.com/)
   - 下载并安装

2. **创建新站点**
   - 点击 "Create a new site"
   - 输入站点名称：wordpress-blog
   - 选择环境配置
   - 设置 WordPress 用户

3. **启动站点**
   - 点击 "Start site"
   - 访问本地地址

## 推荐配置

### 基本设置
- **站点标题**: 你的博客名称
- **副标题**: 简短描述
- **时区**: Asia/Shanghai
- **语言**: 简体中文

### 必装插件
```
1. Yoast SEO - SEO优化
2. Akismet - 垃圾评论过滤  
3. WP Super Cache - 缓存加速
4. Classic Editor - 经典编辑器
5. UpdraftPlus - 自动备份
```

### 推荐主题
```
1. Twenty Twenty-Four - 官方主题
2. Astra - 轻量级主题
3. GeneratePress - 快速主题
4. Writee - 博客专用主题
```

## 写作功能

### 文章管理
- 📝 **新建文章**: 仪表盘 → 文章 → 写文章
- 📂 **分类管理**: 文章 → 分类目录
- 🏷️ **标签管理**: 文章 → 标签
- 📊 **文章列表**: 文章 → 所有文章

### 编辑器功能
- **可视化编辑器**: 所见即所得
- **文本编辑器**: HTML 代码编辑
- **古腾堡编辑器**: 块编辑器（新版本）
- **经典编辑器**: 传统编辑器（需插件）

### 媒体管理
- 📷 **图片上传**: 支持 JPG、PNG、GIF
- 📹 **视频上传**: 支持 MP4、MOV 等
- 📄 **文档上传**: 支持 PDF、DOC 等
- 🎵 **音频上传**: 支持 MP3、WAV 等

## 安全建议

1. **强密码**: 使用复杂的管理员密码
2. **定期更新**: 保持 WordPress 和插件最新
3. **备份数据**: 定期备份网站和数据库
4. **安全插件**: 安装 Wordfence 等安全插件
5. **限制登录**: 限制登录尝试次数

## 性能优化

1. **缓存插件**: WP Super Cache 或 W3 Total Cache
2. **图片优化**: 压缩图片大小
3. **CDN 加速**: 使用内容分发网络
4. **数据库优化**: 定期清理数据库
5. **主题优化**: 选择轻量级主题

## 需要帮助？

如果你选择了某个方案但遇到问题，请告诉我：
1. 你选择的安装方案
2. 遇到的具体问题
3. 错误信息截图

我会为你提供详细的解决方案！