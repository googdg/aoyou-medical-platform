#!/bin/bash

echo "🚀 启动 WordPress 博客..."
echo ""

# 检查 Local 是否运行
if pgrep -f "Local" > /dev/null; then
    echo "✅ Local by Flywheel 正在运行"
else
    echo "📱 启动 Local by Flywheel..."
    open -a "Local" 2>/dev/null || echo "❌ 请手动打开 Local 应用"
fi

echo ""
echo "📋 接下来的步骤："
echo "1. 在 Local 应用中创建新站点"
echo "2. 站点名称：my-wordpress-blog"
echo "3. 选择 Preferred 环境"
echo "4. 设置管理员账户信息"
echo ""

# 检查常见的 WordPress 端口
echo "🔍 检查现有的 WordPress 站点..."
for port in 10000 10001 10002 10003 10004 10005; do
    if curl -s -I "http://localhost:$port" | grep -q "200\|301\|302"; then
        echo "✅ 发现站点运行在端口 $port: http://localhost:$port"
    fi
done

echo ""
echo "💡 如果没有发现运行中的站点，请在 Local 应用中创建新站点"
echo "📖 详细步骤请查看 START_WORDPRESS.md 文件"