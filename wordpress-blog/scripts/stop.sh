#!/bin/bash

echo "🛑 停止 WordPress 博客..."

# 停止服务
docker-compose down

echo "✅ WordPress 博客已停止"
echo "💾 数据已保存，下次启动时会恢复所有内容"