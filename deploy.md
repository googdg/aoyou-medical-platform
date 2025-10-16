# 🚀 部署指南

## 本地测试外网访问

### 1. 修改服务器监听地址
服务器已配置为监听所有网络接口 (`0.0.0.0`)，现在可以通过局域网IP访问。

### 2. 获取本机IP地址
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

### 3. 启动服务器
```bash
node server.js
```

### 4. 局域网访问
在同一局域网内的设备可以通过以下地址访问：
- 网站：`http://YOUR_LOCAL_IP:3001`
- 管理后台：`http://YOUR_LOCAL_IP:3001/admin`

## 生产环境部署

### 方法一：使用云服务器（推荐）

#### 1. 选择云服务提供商
- **阿里云ECS**
- **腾讯云CVM**
- **AWS EC2**
- **DigitalOcean Droplet**
- **Vultr VPS**

#### 2. 服务器配置要求
- **最低配置**：1核1GB内存，20GB存储
- **推荐配置**：2核2GB内存，40GB存储
- **操作系统**：Ubuntu 20.04 LTS 或 CentOS 8

#### 3. 服务器部署步骤

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装PM2（进程管理器）
sudo npm install -g pm2

# 4. 上传项目文件到服务器
# 可以使用scp、rsync或git clone

# 5. 安装依赖
npm install

# 6. 启动应用（生产环境）
pm2 start ecosystem.config.js --env production

# 7. 设置PM2开机自启
pm2 startup
pm2 save
```

#### 4. 配置防火墙
```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow ssh
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### 方法二：使用Nginx反向代理（推荐用于生产环境）

#### 1. 安装Nginx
```bash
sudo apt install nginx -y
```

#### 2. 配置Nginx
创建配置文件：`/etc/nginx/sites-available/stevn-blog`

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 静态文件直接由Nginx服务
    location /uploads/ {
        alias /path/to/your/project/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /data/ {
        alias /path/to/your/project/data/;
        expires 1h;
    }
    
    # 代理到Node.js应用
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/stevn-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 方法三：使用免费服务（适合测试）

#### 1. Ngrok（临时外网访问）
```bash
# 安装ngrok
npm install -g ngrok

# 启动服务器
node server.js

# 在另一个终端创建隧道
ngrok http 3001
```

#### 2. Vercel部署（静态部分）
```bash
# 安装Vercel CLI
npm install -g vercel

# 部署
vercel
```

## SSL证书配置（HTTPS）

### 使用Let's Encrypt免费证书
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 域名配置

### 1. 购买域名
- **国内**：阿里云、腾讯云、华为云
- **国外**：Namecheap、GoDaddy、Cloudflare

### 2. DNS配置
添加A记录指向您的服务器IP：
```
类型: A
名称: @
值: YOUR_SERVER_IP
TTL: 600

类型: A  
名称: www
值: YOUR_SERVER_IP
TTL: 600
```

## 监控和维护

### 1. PM2监控
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs stevn-blog

# 重启应用
pm2 restart stevn-blog

# 监控面板
pm2 monit
```

### 2. 系统监控
```bash
# 安装htop
sudo apt install htop -y

# 查看系统资源
htop
```

## 安全建议

### 1. 更改默认密码
首次登录后立即更改管理员密码

### 2. 配置防火墙
只开放必要的端口（80, 443, SSH）

### 3. 定期备份
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/stevn-blog-$DATE.tar.gz /path/to/your/project
```

### 4. 更新依赖
```bash
# 定期更新npm包
npm audit
npm update
```

## 故障排除

### 常见问题
1. **端口被占用**：使用 `lsof -i :3001` 查看
2. **权限问题**：确保文件权限正确
3. **内存不足**：监控内存使用，考虑升级服务器
4. **数据库锁定**：重启应用解决SQLite锁定问题

### 日志查看
```bash
# PM2日志
pm2 logs stevn-blog

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u nginx -f
```