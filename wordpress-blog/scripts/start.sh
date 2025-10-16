#!/bin/bash

echo "🚀 启动 WordPress 博客..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 启动服务
echo "📦 启动 Docker 容器..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "✅ WordPress 博客已启动！"
echo ""
echo "📝 访问地址:"
echo "   博客首页: http://localhost:8080"
echo "   管理后台: http://localhost:8080/wp-admin"
echo "   数据库管理: http://localhost:8081"
echo ""
echo "🔧 首次访问请完成 WordPress 安装向导"
echo "💡 建议设置强密码并记录管理员账户信息"