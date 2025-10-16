# 🚀 启动 WordPress 博客

## 方案选择

由于你的系统没有 Docker，我为你提供以下几种启动 WordPress 的方案：

## 🎯 方案1：使用 Local by Flywheel（推荐）

### 步骤1：打开 Local 应用
```bash
# 如果 Local 没有运行，可以这样启动：
open -a "Local"
```

### 步骤2：创建新站点
1. 在 Local 应用中点击 "Create a new site"
2. 输入站点名称：`my-wordpress-blog`
3. 选择环境：`Preferred`
4. 设置 WordPress 管理员信息：
   - 用户名：`admin`
   - 密码：`your-strong-password`
   - 邮箱：`your-email@example.com`

### 步骤3：启动站点
- 等待安装完成
- 点击 "Start site"
- 记录站点 URL（如：http://my-wordpress-blog.local）

## 🎯 方案2：安装 Docker 并使用我们的配置

### 安装 Docker Desktop
1. 访问：https://www.docker.com/products/docker-desktop/
2. 下载 Docker Desktop for Mac
3. 安装并启动 Docker

### 启动 WordPress
```bash
cd wordpress-blog
docker-compose up -d
```

### 访问站点
- WordPress 首页：http://localhost:8080
- 管理后台：http://localhost:8080/wp-admin
- 数据库管理：http://localhost:8081

## 🎯 方案3：使用 MAMP（本地服务器）

### 安装 MAMP
1. 下载：https://www.mamp.info/en/downloads/
2. 安装 MAMP
3. 启动 Apache 和 MySQL

### 安装 WordPress
1. 下载 WordPress：https://wordpress.org/download/
2. 解压到 `/Applications/MAMP/htdocs/wordpress-blog`
3. 访问：http://localhost/wordpress-blog

## 🔧 快速启动脚本

让我为你创建一个启动脚本：