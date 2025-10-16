# 自定义主题目录

将你的自定义 WordPress 主题放在这个目录中。

## 使用方法

1. 将主题文件夹复制到此目录
2. 重启 Docker 容器或等待自动同步
3. 在 WordPress 后台 -> 外观 -> 主题 中激活新主题

## 推荐主题

### 免费主题
- **Twenty Twenty-Four**: WordPress 默认主题
- **Astra**: 轻量级多用途主题
- **GeneratePress**: 快速响应式主题
- **OceanWP**: 功能丰富的主题

### 博客专用主题
- **Writee**: 简洁的博客主题
- **Aspen**: 现代博客主题
- **Hemingway**: 极简主义博客主题

## 主题结构

```
your-theme/
├── style.css          # 主样式文件
├── index.php          # 主模板文件
├── functions.php      # 主题功能文件
├── header.php         # 头部模板
├── footer.php         # 底部模板
├── single.php         # 单篇文章模板
├── archive.php        # 归档页面模板
└── screenshot.png     # 主题预览图
```