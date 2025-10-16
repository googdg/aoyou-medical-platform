# 奥友医学科普学习平台 - 部署指南

本指南将帮助您将奥友医学科普学习平台部署到生产环境。

## 📋 部署前准备

### 系统要求

**服务器要求**
- 操作系统：Linux (Ubuntu 18.04+, CentOS 7+) 或 Windows Server
- 内存：最少 1GB RAM，推荐 2GB+
- 存储：最少 5GB 可用空间
- 网络：支持 HTTPS 的公网 IP

**软件要求**
- Web服务器：Nginx 1.14+ 或 Apache 2.4+
- SSL证书：Let's Encrypt 或商业证书
- 可选：CDN服务（推荐）

### 域名和SSL

1. **域名准备**
```bash
# 确保域名已正确解析到服务器IP
nslookup your-domain.com
```

2. **SSL证书申请**
```bash
# 使用Let's Encrypt（推荐）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🚀 自动化部署

### 使用部署脚本

1. **运行部署脚本**
```bash
# 克隆项目
git clone https://github.com/aoyou-digital/medical-platform.git
cd medical-platform

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

2. **上传到服务器**
```bash
# 使用rsync上传（推荐）
rsync -avz --delete dist/ user@server:/var/www/html/

# 或使用scp
scp -r dist/* user@server:/var/www/html/
```

### 验证部署

```bash
# 检查文件是否正确上传
ssh user@server "ls -la /var/www/html/"

# 测试网站访问
curl -I https://your-domain.com
```

## 🔧 服务器配置

### Nginx 配置

1. **创建配置文件**
```bash
sudo nano /etc/nginx/sites-available/aoyou-medical
```

2. **配置内容**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    # SSL配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # 静态资源缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
        access_log off;
    }
    
    # Service Worker
    location /sw.js {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # API代理（如果需要）
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /var/www/html;
    }
}
```

3. **启用配置**
```bash
sudo ln -s /etc/nginx/sites-available/aoyou-medical /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache 配置

1. **创建虚拟主机**
```bash
sudo nano /etc/apache2/sites-available/aoyou-medical.conf
```

2. **配置内容**
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/html
    
    # SSL配置
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/your-domain.com/cert.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem
    SSLCertificateChainFile /etc/letsencrypt/live/your-domain.com/chain.pem
    
    # 安全头
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # 压缩
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
    </IfModule>
    
    # 缓存
    <IfModule mod_expires.c>
        ExpiresActive on
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
    </IfModule>
    
    # SPA路由支持
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ /index.html [QSA,L]
    </IfModule>
    
    # 错误日志
    ErrorLog ${APACHE_LOG_DIR}/aoyou-medical_error.log
    CustomLog ${APACHE_LOG_DIR}/aoyou-medical_access.log combined
</VirtualHost>
```

3. **启用配置**
```bash
sudo a2ensite aoyou-medical.conf
sudo a2enmod ssl rewrite headers expires deflate
sudo systemctl reload apache2
```

## 🌐 CDN 配置

### Cloudflare 配置

1. **DNS设置**
- 添加A记录指向服务器IP
- 启用橙色云朵（代理模式）

2. **缓存规则**
```
Page Rules:
- *.css, *.js, *.png, *.jpg, *.gif, *.svg
  Cache Level: Cache Everything
  Edge Cache TTL: 1 year

- /sw.js
  Cache Level: Bypass
```

3. **安全设置**
- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- HSTS: Enabled
- Minimum TLS Version: 1.2

### 其他CDN服务

**阿里云CDN**
```bash
# 配置缓存规则
静态资源: 1年
HTML文件: 1小时
Service Worker: 不缓存
```

**腾讯云CDN**
```bash
# 配置缓存规则
.css,.js,.png,.jpg: 365天
.html: 1小时
/sw.js: 0秒
```

## 📊 监控和日志

### 服务器监控

1. **安装监控工具**
```bash
# 安装htop和iotop
sudo apt install htop iotop

# 安装Nginx状态模块
sudo apt install nginx-module-http-stub-status
```

2. **配置监控**
```nginx
# 在Nginx配置中添加
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

### 日志管理

1. **配置日志轮转**
```bash
sudo nano /etc/logrotate.d/aoyou-medical
```

```
/var/log/nginx/aoyou-medical*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

2. **实时日志监控**
```bash
# 监控访问日志
sudo tail -f /var/log/nginx/access.log

# 监控错误日志
sudo tail -f /var/log/nginx/error.log

# 使用multitail同时监控多个日志
sudo apt install multitail
sudo multitail /var/log/nginx/access.log /var/log/nginx/error.log
```

## 🔒 安全配置

### 防火墙设置

```bash
# 使用ufw配置防火墙
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### 安全更新

```bash
# 设置自动安全更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 备份策略

1. **自动备份脚本**
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/aoyou-medical"
WEB_DIR="/var/www/html"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份网站文件
tar -czf $BACKUP_DIR/website_$DATE.tar.gz -C $WEB_DIR .

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /etc/nginx/sites-available/aoyou-medical

# 清理30天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

2. **设置定时备份**
```bash
# 添加到crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

## 🚀 性能优化

### 服务器优化

1. **Nginx优化**
```nginx
# 在nginx.conf中添加
worker_processes auto;
worker_connections 1024;

# 启用HTTP/2
listen 443 ssl http2;

# 启用Brotli压缩（如果支持）
brotli on;
brotli_comp_level 6;
brotli_types text/css application/javascript;
```

2. **系统优化**
```bash
# 增加文件描述符限制
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf

# 优化TCP参数
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
sysctl -p
```

### 数据库优化（如果使用）

```bash
# MySQL优化示例
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_size = 128M
```

## 🔍 故障排除

### 常见问题

1. **502 Bad Gateway**
```bash
# 检查后端服务
sudo systemctl status nginx
sudo nginx -t

# 检查端口占用
sudo netstat -tlnp | grep :80
```

2. **SSL证书问题**
```bash
# 检查证书有效期
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout

# 续期证书
sudo certbot renew --dry-run
```

3. **性能问题**
```bash
# 检查服务器负载
htop
iotop

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

### 日志分析

```bash
# 分析访问日志
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# 分析错误日志
sudo grep "error" /var/log/nginx/error.log | tail -20

# 分析响应时间
sudo awk '{print $NF}' /var/log/nginx/access.log | sort -n | tail -10
```

## 📈 性能监控

### 网站性能监控

1. **使用Google PageSpeed Insights**
```bash
# 在线测试
https://pagespeed.web.dev/

# 目标指标
- Performance Score: > 90
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 3s
```

2. **使用GTmetrix**
```bash
# 在线测试
https://gtmetrix.com/

# 目标指标
- PageSpeed Score: A (90%+)
- YSlow Score: A (90%+)
- Fully Loaded Time: < 5s
```

### 服务器监控

1. **使用Prometheus + Grafana**
```bash
# 安装Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*
./prometheus --config.file=prometheus.yml
```

2. **配置监控指标**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
```

## 🎯 部署检查清单

### 部署前检查
- [ ] 域名DNS解析正确
- [ ] SSL证书已申请
- [ ] 服务器资源充足
- [ ] 备份策略已制定

### 部署过程检查
- [ ] 文件上传完整
- [ ] 权限设置正确
- [ ] 配置文件无误
- [ ] 服务重启成功

### 部署后检查
- [ ] 网站正常访问
- [ ] HTTPS工作正常
- [ ] 移动端适配正常
- [ ] 性能指标达标
- [ ] 监控系统运行
- [ ] 备份任务正常

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. 查看错误日志
2. 检查配置文件
3. 参考故障排除章节
4. 联系技术支持

**联系方式**
- 邮箱：support@aoyou.digital
- 文档：https://docs.aoyou.digital
- 社区：https://community.aoyou.digital

---

**祝您部署顺利！** 🚀