# 🚀 部署指南

## GitHub Pages 部署

### 方法一：通过GitHub网页界面

1. **创建GitHub仓库**
   - 登录GitHub，点击"New repository"
   - 仓库名建议：`aoyou-medical-platform`
   - 设置为Public（如果要使用免费的GitHub Pages）
   - 勾选"Add a README file"

2. **上传项目文件**
   - 点击"uploading an existing file"
   - 将以下核心文件拖拽上传：
     ```
     aoyou-youtube-style.html
     video-detail.html
     videos/
     images/
     css/
     js/
     README.md
     LICENSE
     ```

3. **启用GitHub Pages**
   - 进入仓库Settings
   - 滚动到"Pages"部分
   - Source选择"Deploy from a branch"
   - Branch选择"main"
   - 点击Save

4. **访问网站**
   - 等待几分钟部署完成
   - 访问：`https://yourusername.github.io/aoyou-medical-platform/aoyou-youtube-style.html`

### 方法二：通过Git命令行

```bash
# 1. 初始化Git仓库
git init
git add .
git commit -m "🎉 初始提交：奥友医学视频平台"

# 2. 连接到GitHub仓库
git remote add origin https://github.com/yourusername/aoyou-medical-platform.git
git branch -M main
git push -u origin main

# 3. 在GitHub上启用Pages（参考方法一的步骤3）
```

## 自定义域名配置

### 1. 添加CNAME文件
```bash
echo "medical.yourdomain.com" > CNAME
git add CNAME
git commit -m "添加自定义域名"
git push
```

### 2. 配置DNS记录
在你的域名提供商处添加CNAME记录：
```
Type: CNAME
Name: medical
Value: yourusername.github.io
```

### 3. 启用HTTPS
- 在GitHub Pages设置中勾选"Enforce HTTPS"

## 其他部署平台

### Netlify部署

1. **连接GitHub**
   - 登录Netlify
   - 点击"New site from Git"
   - 选择GitHub并授权
   - 选择你的仓库

2. **配置构建设置**
   ```
   Build command: (留空)
   Publish directory: ./
   ```

3. **自定义域名**
   - 在Site settings > Domain management中添加

### Vercel部署

1. **导入项目**
   - 登录Vercel
   - 点击"Import Project"
   - 选择GitHub仓库

2. **配置设置**
   ```
   Framework Preset: Other
   Build Command: (留空)
   Output Directory: ./
   ```

## 环境配置

### 生产环境优化

1. **创建生产版本配置**
```javascript
// config.prod.js
const PRODUCTION_CONFIG = {
    BASE_URL: 'https://medical.yourdomain.com',
    API_ENDPOINT: 'https://api.yourdomain.com',
    ANALYTICS_ID: 'your-analytics-id',
    WECHAT_APP_ID: 'your-wechat-app-id'
};
```

2. **优化资源加载**
```html
<!-- 在生产环境中启用CDN -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="dns-prefetch" href="//fonts.googleapis.com">
```

### 性能优化

1. **启用压缩**
```nginx
# nginx.conf
gzip on;
gzip_types text/css application/javascript image/svg+xml;
gzip_min_length 1000;
```

2. **设置缓存头**
```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 监控和分析

### 1. Google Analytics集成
```html
<!-- 在<head>中添加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. 错误监控
```javascript
// 添加全局错误处理
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    // 发送错误报告到监控服务
});
```

## 安全配置

### 1. 内容安全策略(CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               img-src 'self' data: https:;
               font-src 'self' https://fonts.gstatic.com;">
```

### 2. 安全头配置
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## 备份和恢复

### 1. 自动备份脚本
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "backup_${DATE}.tar.gz" \
    aoyou-youtube-style.html \
    video-detail.html \
    css/ js/ images/ videos/
```

### 2. 版本管理
```bash
# 创建发布标签
git tag -a v1.0.0 -m "发布版本 1.0.0"
git push origin v1.0.0
```

## 故障排除

### 常见问题

1. **页面404错误**
   - 检查文件路径是否正确
   - 确认GitHub Pages已启用
   - 检查仓库是否为Public

2. **资源加载失败**
   - 检查相对路径是否正确
   - 确认所有资源文件已上传
   - 检查文件大小限制（GitHub单文件100MB）

3. **自定义域名不工作**
   - 检查DNS配置是否正确
   - 等待DNS传播（可能需要24小时）
   - 确认CNAME文件内容正确

### 调试工具

1. **GitHub Pages状态检查**
   - 访问仓库的Actions标签页
   - 查看部署日志

2. **DNS检查工具**
   ```bash
   # 检查DNS解析
   nslookup medical.yourdomain.com
   
   # 检查网站状态
   curl -I https://yourusername.github.io/aoyou-medical-platform/
   ```

## 维护和更新

### 1. 定期更新
```bash
# 拉取最新代码
git pull origin main

# 添加新功能
git add .
git commit -m "✨ 添加新功能"
git push origin main
```

### 2. 性能监控
- 定期检查页面加载速度
- 监控用户反馈
- 分析访问统计数据

---

**部署完成后，记得测试所有功能是否正常工作！** 🎉