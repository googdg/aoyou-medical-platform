# 🚀 个人博客项目使用指南

欢迎使用你的个人博客网站！这是一个功能完整、设计精美的现代化博客系统。

## 📋 快速开始

### 方式1: 一键启动 (推荐)
```bash
./start.sh
```

### 方式2: 手动启动
```bash
# 安装依赖
npm install

# 启动服务器
node server.js
```

### 方式3: Docker启动
```bash
docker-compose up -d
```

## 🌐 访问地址

启动成功后，你可以访问以下地址：

- **主网站**: http://localhost:3001
- **管理后台**: http://localhost:3001/admin
- **项目验证**: http://localhost:3001/final-check.html
- **语言测试**: http://localhost:3001/admin/language-test.html

## 🔐 管理后台登录

**用户名**: `admin`  
**密码**: `admin123`

## 📚 主要功能

### 🎨 前端功能
- ✅ 极简主义设计风格
- ✅ 响应式布局，完美适配各种设备
- ✅ 中英文双语支持
- ✅ 平滑滚动和动画效果
- ✅ 图片懒加载优化
- ✅ 内容搜索功能

### 🔧 管理后台
- ✅ 直观的仪表板界面
- ✅ 文章创建和编辑
- ✅ 媒体文件管理
- ✅ 主页内容定制
- ✅ 语言切换功能
- ✅ 自动保存功能

### 🌍 多语言支持
- ✅ 中文/英文界面切换
- ✅ 多语言内容管理
- ✅ 语言设置持久化

### ⚡ 性能优化
- ✅ 代码分割和懒加载
- ✅ 图片优化和WebP支持
- ✅ CSS和JS压缩
- ✅ 缓存策略
- ✅ Service Worker支持

## 📖 使用教程

### 1. 首次设置

1. **启动项目**
   ```bash
   ./start.sh
   ```

2. **访问管理后台**
   - 打开 http://localhost:3001/admin
   - 使用 admin/admin123 登录

3. **自定义主页内容**
   - 在管理后台点击"主页管理"
   - 编辑个人信息、工作经历等
   - 点击保存或等待自动保存

### 2. 创建博客文章

1. **进入文章管理**
   - 在管理后台点击"文章管理"
   - 点击"新建文章"

2. **编写文章**
   - 输入文章标题
   - 选择语言和分类
   - 使用Markdown编辑器编写内容
   - 添加标签

3. **发布文章**
   - 预览文章效果
   - 点击"发布"按钮

### 3. 管理媒体文件

1. **上传图片**
   - 点击"媒体管理"
   - 拖拽或选择文件上传
   - 系统自动优化图片

2. **使用图片**
   - 在文章中插入图片链接
   - 支持多种格式和尺寸

### 4. 语言切换

1. **切换界面语言**
   - 点击右上角的"中文"或"English"按钮
   - 界面语言立即切换

2. **管理多语言内容**
   - 为每篇文章创建不同语言版本
   - 系统自动根据用户语言显示对应内容

## 🎯 自定义配置

### 修改网站信息
编辑以下文件来自定义你的网站：

1. **基本信息** - 在管理后台的"主页管理"中修改
2. **样式定制** - 编辑 `styles.css` 文件
3. **功能配置** - 编辑 `.env` 文件

### 环境变量配置
```bash
# 服务器配置
PORT=3001
HOST=0.0.0.0

# 安全配置
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# 数据库配置
DB_PATH=./data/production.db
```

## 🧪 测试功能

项目包含多个测试页面：

- **语言切换测试**: `/admin/language-test.html`
- **登录功能测试**: `/admin/login-test.html`
- **主页管理测试**: `/admin/homepage-test.html`
- **搜索功能测试**: `/search-test.html`
- **导航功能测试**: `/navigation-test.html`

## 🚀 部署到生产环境

### 1. 本地部署
```bash
# 设置生产环境
NODE_ENV=production ./start.sh
```

### 2. Docker部署
```bash
# 构建镜像
docker build -t personal-blog .

# 启动容器
docker run -d -p 3001:3001 personal-blog
```

### 3. 服务器部署
```bash
# 使用部署脚本
./deploy.sh production
```

## 📁 项目结构

```
personal-blog/
├── admin/              # 管理后台
├── css/               # 样式文件
├── js/                # JavaScript模块
├── data/              # 数据文件
├── images/            # 图片资源
├── test/              # 测试文件
├── server.js          # 后端服务器
├── index.html         # 主页
├── styles.css         # 主样式
├── script.js          # 主脚本
└── README.md          # 项目说明
```

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   lsof -i :3001
   
   # 杀死进程
   kill -9 <PID>
   ```

2. **依赖安装失败**
   ```bash
   # 清除缓存重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **数据库问题**
   ```bash
   # 重置数据库
   rm -f data/*.db
   node server.js
   ```

### 获取帮助

如果遇到问题，可以：

1. 查看浏览器控制台错误信息
2. 检查服务器日志 `logs/app.log`
3. 运行项目验证页面 `/final-check.html`

## 🎉 开始使用

现在你可以开始使用你的个人博客了！

1. 🚀 运行 `./start.sh` 启动项目
2. 🌐 访问 http://localhost:3001 查看网站
3. 🔧 访问 http://localhost:3001/admin 管理内容
4. ✍️ 开始写你的第一篇博客文章！

祝你使用愉快！ 🎊