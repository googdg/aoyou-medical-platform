#!/bin/bash

# 创建备份目录
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "💾 开始备份 WordPress 博客..."

# 备份数据库
echo "📊 备份数据库..."
docker exec wordpress-db mysqldump -u wordpress -pwordpress_password wordpress > "$BACKUP_DIR/database.sql"

# 备份 WordPress 文件
echo "📁 备份 WordPress 文件..."
docker cp wordpress-blog:/var/www/html "$BACKUP_DIR/wordpress-files"

# 备份自定义内容
echo "🎨 备份自定义内容..."
cp -r themes "$BACKUP_DIR/"
cp -r plugins "$BACKUP_DIR/"
cp -r uploads "$BACKUP_DIR/"

# 创建备份信息文件
echo "📝 创建备份信息..."
cat > "$BACKUP_DIR/backup-info.txt" << EOF
WordPress 博客备份
备份时间: $(date)
备份内容:
- 数据库: database.sql
- WordPress 文件: wordpress-files/
- 自定义主题: themes/
- 自定义插件: plugins/
- 上传文件: uploads/

恢复方法:
1. 将 wordpress-files/ 内容复制到 WordPress 安装目录
2. 导入 database.sql 到 MySQL 数据库
3. 将自定义内容复制到对应目录
EOF

echo "✅ 备份完成！"
echo "📂 备份位置: $BACKUP_DIR"