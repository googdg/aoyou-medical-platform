#!/bin/bash

# 奥友医学科普学习平台 - 快速启动演示脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# 显示欢迎信息
echo ""
echo "🏥 奥友医学科普学习平台 - 演示启动器"
echo "================================================"
echo ""

# 检查必要文件
print_info "检查项目文件..."

required_files=(
    "aoyou-medical-platform.html"
    "css/aoyou-medical.css"
    "js/aoyou-medical-app.js"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_error "缺少必要文件:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    echo ""
    echo "请确保您在正确的项目目录中运行此脚本。"
    exit 1
fi

print_success "所有必要文件检查完成"

# 检查并生成资源文件
print_info "检查演示资源..."

# 检查图片资源
if [ ! -d "images" ] || [ ! -f "images/video-thumb-1.jpg" ]; then
    print_info "生成占位符图片..."
    if [ -f "generate-placeholder-images.sh" ]; then
        ./generate-placeholder-images.sh
    else
        mkdir -p images
        for i in {1..9}; do
            echo "# 视频缩略图占位符 $i" > "images/video-thumb-$i.jpg"
            echo "# 讲师头像占位符 $i" > "images/instructor-$i.jpg"
        done
        print_success "创建了基本占位符图片"
    fi
fi

# 检查视频资源
if [ ! -d "videos" ] || [ ! -f "videos/demo-video-1.mp4" ]; then
    print_info "准备演示视频..."
    mkdir -p videos
    if [ ! -f "videos/demo-video-1.mp4" ]; then
        echo "# 演示视频1占位符" > "videos/demo-video-1.mp4"
    fi
    if [ ! -f "videos/demo-video-2.mp4" ]; then
        echo "# 演示视频2占位符" > "videos/demo-video-2.mp4"
    fi
    print_warning "使用了占位符视频文件，建议替换为真实的MP4视频"
fi

# 选择启动方式
echo ""
print_info "选择启动方式:"
echo "1. Node.js 服务器 (推荐)"
echo "2. Python 3 服务器"
echo "3. Python 2 服务器"
echo "4. PHP 服务器"
echo "5. 仅显示访问信息"
echo "6. 启动简化版本"
echo "7. 打开错误诊断工具"
echo ""

read -p "请选择 (1-5): " choice

PORT=3000

case $choice in
    1)
        if command -v node &> /dev/null && [ -f "package.json" ]; then
            print_info "使用Node.js启动服务器..."
            if [ ! -d "node_modules" ]; then
                print_info "安装依赖..."
                npm install
            fi
            print_success "服务器启动在 http://localhost:$PORT"
            print_info "按 Ctrl+C 停止服务器"
            echo ""
            npm run dev || node server.js || npx http-server -p $PORT
        else
            print_error "Node.js 未安装或缺少 package.json"
            exit 1
        fi
        ;;
    2)
        if command -v python3 &> /dev/null; then
            print_info "使用Python 3启动服务器..."
            print_success "服务器启动在 http://localhost:$PORT"
            print_info "按 Ctrl+C 停止服务器"
            echo ""
            python3 -m http.server $PORT
        else
            print_error "Python 3 未安装"
            exit 1
        fi
        ;;
    3)
        if command -v python &> /dev/null; then
            print_info "使用Python 2启动服务器..."
            print_success "服务器启动在 http://localhost:$PORT"
            print_info "按 Ctrl+C 停止服务器"
            echo ""
            python -m SimpleHTTPServer $PORT
        else
            print_error "Python 2 未安装"
            exit 1
        fi
        ;;
    4)
        if command -v php &> /dev/null; then
            print_info "使用PHP启动服务器..."
            print_success "服务器启动在 http://localhost:$PORT"
            print_info "按 Ctrl+C 停止服务器"
            echo ""
            php -S localhost:$PORT
        else
            print_error "PHP 未安装"
            exit 1
        fi
        ;;
    5)
        print_info "请手动启动Web服务器，然后访问以下地址:"
        echo ""
        echo "🌐 主页面: http://localhost:$PORT/aoyou-medical-platform.html"
        echo "🧪 测试页面: http://localhost:$PORT/aoyou-medical-test.html"
        echo "🔧 简化版本: http://localhost:$PORT/aoyou-medical-simple.html"
        echo "🐛 错误诊断: http://localhost:$PORT/debug-errors.html"
        echo ""
        ;;
    6)
        print_info "启动简化版本..."
        if command -v python3 &> /dev/null; then
            print_success "服务器启动在 http://localhost:$PORT"
            print_info "简化版本地址: http://localhost:$PORT/aoyou-medical-simple.html"
            print_info "按 Ctrl+C 停止服务器"
            echo ""
            python3 -m http.server $PORT
        else
            print_error "Python 3 未安装"
            exit 1
        fi
        ;;
    7)
        print_info "启动错误诊断工具..."
        if command -v python3 &> /dev/null; then
            print_success "服务器启动在 http://localhost:$PORT"
            print_info "错误诊断地址: http://localhost:$PORT/debug-errors.html"
            print_info "按 Ctrl+C 停止服务器"
            echo ""
            python3 -m http.server $PORT
        else
            print_error "Python 3 未安装"
            exit 1
        fi
        ;;
    *)
        print_error "无效选择"
        exit 1
        ;;
esac

if [ "$choice" != "5" ]; then
    echo ""
    echo "🎉 演示已启动！"
    echo ""
    echo "📱 访问地址:"
    echo "   主页面: http://localhost:$PORT/aoyou-medical-platform.html"
    echo "   测试页面: http://localhost:$PORT/aoyou-medical-test.html"
    echo ""
    echo "🔑 演示账号:"
    echo "   邀请码: AOYOU2024"
    echo "   用户名: demo"
    echo "   密码: demo123"
    echo ""
    echo "📋 功能测试:"
    echo "   ✅ 用户注册登录"
    echo "   ✅ 视频播放系统"
    echo "   ✅ 积分等级系统"
    echo "   ✅ 移动端适配"
    echo "   ✅ 微信分享功能"
    echo ""
    echo "💡 提示:"
    echo "   - 在手机浏览器中测试移动端体验"
    echo "   - 在微信中打开测试分享功能"
    echo "   - 查看浏览器控制台了解详细信息"
    echo ""
fi