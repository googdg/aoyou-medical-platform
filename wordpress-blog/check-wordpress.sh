#!/bin/bash

echo "🔍 WordPress 站点检查报告"
echo "=========================="
echo ""

# 检查 Local 进程
echo "📱 Local by Flywheel 状态："
if pgrep -f "Local" > /dev/null; then
    echo "✅ 正在运行"
    echo "   进程信息："
    ps aux | grep -i local | grep -v grep | head -3
else
    echo "❌ 未运行"
fi

echo ""
echo "🌐 网络端口检查："

# 检查常见端口
for port in 80 3000 8000 8080 10000 10001 10002 10003 10004 10005; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "✅ 端口 $port 正在使用"
        
        # 尝试访问
        response=$(curl -s -I "http://localhost:$port" 2>/dev/null | head -1)
        if [[ $response == *"200"* ]] || [[ $response == *"301"* ]] || [[ $response == *"302"* ]]; then
            echo "   📄 HTTP 响应: $response"
            
            # 检查是否是 WordPress
            content=$(curl -s "http://localhost:$port" 2>/dev/null | head -10)
            if [[ $content == *"WordPress"* ]] || [[ $content == *"wp-content"* ]]; then
                echo "   🎯 这可能是 WordPress 站点！"
                echo "   🔗 访问地址: http://localhost:$port"
                echo "   🔧 管理后台: http://localhost:$port/wp-admin"
            fi
        fi
        echo ""
    fi
done

echo ""
echo "📂 Local 站点目录检查："
local_sites_dir="$HOME/Local Sites"
if [ -d "$local_sites_dir" ]; then
    echo "✅ 找到 Local Sites 目录: $local_sites_dir"
    echo "   站点列表："
    ls -la "$local_sites_dir" 2>/dev/null | grep "^d" | awk '{print "   - " $9}' | grep -v "^\.$\|^\.\.$"
else
    echo "❌ 未找到 Local Sites 目录"
fi

echo ""
echo "🎯 建议操作："
echo "1. 打开 Local 应用查看站点列表"
echo "2. 如果有站点但未启动，点击 'Start site'"
echo "3. 如果没有站点，创建新的 WordPress 站点"
echo "4. 记录站点的具体 URL 地址"