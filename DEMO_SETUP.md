# 奥友医学科普学习平台 - 演示设置指南

本指南将帮助您设置演示视频和图片资源，让平台能够完整展示所有功能。

## 🎥 演示视频设置

### 快速设置（推荐）

1. **下载演示视频**
```bash
# 运行视频下载脚本
./download-demo-videos.sh
```

2. **生成占位符图片**
```bash
# 运行图片生成脚本
./generate-placeholder-images.sh
```

3. **启动演示**
```bash
# 启动本地服务器
npm run dev
# 或
python3 -m http.server 3000
```

### 手动设置

如果自动下载失败，您可以手动添加视频文件：

1. **准备视频文件**
   - 将两个MP4视频文件放入 `videos/` 目录
   - 重命名为 `demo-video-1.mp4` 和 `demo-video-2.mp4`
   - 推荐规格：1280x720分辨率，H.264编码，30fps

2. **视频文件来源建议**
   - 医学教育网站的开放资源
   - 自己录制的教学视频
   - 购买的医学教育视频
   - 免费的教育视频资源

## 🖼️ 图片资源设置

### 自动生成占位符

```bash
# 生成所有占位符图片
./generate-placeholder-images.sh
```

### 手动替换图片

1. **视频缩略图** (320x180px)
   - `images/video-thumb-1.jpg` 到 `images/video-thumb-9.jpg`
   - 建议使用医学相关的缩略图

2. **讲师头像** (100x100px)
   - `images/instructor-1.jpg` 到 `images/instructor-9.jpg`
   - 可以使用真实讲师照片或专业头像

3. **默认图片**
   - `images/default-image.jpg` - 默认图片
   - `images/default-avatar.png` - 默认头像
   - `images/share-logo.png` - 分享Logo

## 🚀 启动演示

### 方法1：使用Node.js服务器
```bash
# 如果有package.json
npm install
npm run dev
```

### 方法2：使用Python服务器
```bash
# Python 3
python3 -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

### 方法3：使用PHP服务器
```bash
php -S localhost:3000
```

## 📱 功能演示

启动后访问 `http://localhost:3000/aoyou-medical-platform.html`

### 主要功能测试

1. **用户注册登录**
   - 使用邀请码：`AOYOU2024`
   - 测试用户注册流程

2. **视频播放**
   - 浏览不同分类的视频
   - 测试视频播放控制
   - 查看视频互动功能

3. **积分系统**
   - 观看视频获得积分
   - 查看等级提升
   - 测试积分防刷机制

4. **移动端体验**
   - 在手机浏览器中打开
   - 测试触摸交互
   - 验证响应式设计

5. **微信分享**
   - 在微信中打开链接
   - 测试分享功能
   - 查看自定义分享内容

## 🔧 高级配置

### 自定义视频内容

1. **添加更多视频**
```javascript
// 在 js/aoyou-medical-app.js 中添加视频数据
{
    id: 'custom_001',
    title: '您的视频标题',
    category: 'clinical', // 选择分类
    videoUrl: './videos/your-video.mp4',
    // ... 其他属性
}
```

2. **修改分类**
```javascript
// 在 generateCategories() 方法中修改分类
{
    id: 'your-category',
    name: '您的分类名称',
    icon: '🏥',
    description: '分类描述'
}
```

### 自定义样式

1. **修改主题色彩**
```css
/* 在 css/aoyou-medical.css 中修改 */
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* 修改为您喜欢的颜色 */
}
```

2. **调整布局**
```css
/* 修改网格布局 */
.video-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
```

## 📊 数据分析

### 查看用户行为数据

1. **打开浏览器开发者工具**
2. **查看Console输出**
3. **检查LocalStorage数据**

### 导出数据报告

```javascript
// 在浏览器控制台执行
const analytics = window.aoyouApp?.analyticsManager;
if (analytics) {
    console.log('用户行为数据:', analytics.getUserBehaviorData());
    console.log('性能数据:', analytics.getPerformanceData());
}
```

## 🛠️ 故障排除

### 常见问题

1. **视频无法播放**
   - 检查视频文件格式（推荐MP4）
   - 确认视频文件路径正确
   - 检查浏览器是否支持视频格式

2. **图片显示异常**
   - 确认图片文件存在
   - 检查图片格式（推荐JPG/PNG）
   - 验证图片路径正确

3. **功能异常**
   - 打开浏览器开发者工具查看错误
   - 检查JavaScript控制台输出
   - 确认所有JS文件加载正常

### 性能优化

1. **压缩视频文件**
```bash
# 使用ffmpeg压缩视频
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4
```

2. **优化图片大小**
```bash
# 使用ImageMagick优化图片
convert input.jpg -quality 85 -resize 320x180 output.jpg
```

## 📝 部署说明

### 生产环境部署

1. **使用部署脚本**
```bash
./deploy.sh
```

2. **手动部署**
   - 将所有文件上传到Web服务器
   - 确保视频和图片文件正确上传
   - 配置服务器支持MP4文件类型

### 服务器要求

- 支持静态文件服务
- 支持MP4视频文件
- 建议启用Gzip压缩
- 配置适当的缓存策略

## 📞 技术支持

如果遇到问题，请：

1. 查看浏览器控制台错误信息
2. 检查网络连接状态
3. 确认文件路径和权限
4. 参考项目文档和代码注释

---

**注意**: 这是一个演示版本，包含模拟数据和占位符内容。在生产环境中使用前，请替换为真实的医学教育内容，并确保所有资源具有合法的使用权限。