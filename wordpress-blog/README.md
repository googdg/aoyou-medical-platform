# WordPress 个人博客

一个基于 WordPress 的简洁个人博客系统，专注于写作和内容发布。

## 🚀 快速开始

### 环境要求
- Docker
- Docker Compose

### 安装步骤

1. **启动服务**
   ```bash
   docker-compose up -d
   ```

2. **访问博客**
   - 博客首页: http://localhost:8080
   - 管理后台: http://localhost:8080/wp-admin
   - 数据库管理: http://localhost:8081 (phpMyAdmin)

3. **初始化 WordPress**
   - 访问 http://localhost:8080
   - 按照向导完成 WordPress 安装
   - 设置管理员账户和密码

### 默认配置

- **WordPress 端口**: 8080
- **phpMyAdmin 端口**: 8081
- **数据库用户**: wordpress
- **数据库密码**: wordpress_password
- **数据库名**: wordpress

## 📁 项目结构

```
wordpress-blog/
├── docker-compose.yml    # Docker 编排配置
├── .env                  # 环境变量配置
├── README.md            # 项目说明
├── themes/              # 自定义主题目录
├── plugins/             # 自定义插件目录
├── uploads/             # 上传文件目录
└── scripts/             # 管理脚本
```

## 🛠️ 管理命令

### 启动服务
```bash
docker-compose up -d
```

### 停止服务
```bash
docker-compose down
```

### 查看日志
```bash
docker-compose logs -f wordpress
```

### 重启服务
```bash
docker-compose restart
```

### 备份数据
```bash
# 备份数据库
docker exec wordpress-db mysqldump -u wordpress -pwordpress_password wordpress > backup.sql

# 备份文件
docker cp wordpress-blog:/var/www/html ./wordpress-backup
```

## 🎨 自定义主题

1. 将主题文件放入 `themes/` 目录
2. 重启容器或刷新即可在后台看到新主题
3. 在 WordPress 后台 -> 外观 -> 主题 中激活

## 🔌 插件管理

1. 将插件文件放入 `plugins/` 目录
2. 在 WordPress 后台 -> 插件 中激活

## 📝 写作功能

### 核心功能
- ✅ 文章发布和编辑
- ✅ 分类和标签管理
- ✅ 媒体文件上传
- ✅ 评论系统
- ✅ SEO 友好的 URL
- ✅ 响应式设计

### 推荐插件
- **Yoast SEO**: SEO 优化
- **Akismet**: 垃圾评论过滤
- **WP Super Cache**: 缓存优化
- **Classic Editor**: 经典编辑器

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 修改 docker-compose.yml 中的端口配置
   ports:
     - "8090:80"  # 改为其他端口
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库容器状态
   docker-compose logs db
   ```

3. **权限问题**
   ```bash
   # 修复文件权限
   docker exec wordpress-blog chown -R www-data:www-data /var/www/html
   ```

## 📊 性能优化

### 建议配置
- 启用缓存插件
- 优化图片大小
- 使用 CDN
- 定期清理数据库

## 🔒 安全建议

1. 修改默认数据库密码
2. 使用强密码
3. 定期更新 WordPress 和插件
4. 安装安全插件
5. 定期备份数据

## 📞 支持

如有问题，请检查：
1. Docker 服务是否正常运行
2. 端口是否被占用
3. 数据库连接是否正常
4. 查看容器日志获取详细错误信息