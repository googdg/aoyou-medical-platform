#!/bin/bash

# 奥友医学科普学习平台 - 占位符图片生成脚本
# 使用ImageMagick生成占位符图片

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# 检查ImageMagick是否安装
if ! command -v convert &> /dev/null; then
    print_warning "ImageMagick未安装，将创建简单的占位符文件"
    USE_IMAGEMAGICK=false
else
    print_info "使用ImageMagick生成占位符图片"
    USE_IMAGEMAGICK=true
fi

# 创建images目录
mkdir -p images

print_info "开始生成占位符图片..."

# 生成视频缩略图
for i in {1..9}; do
    filename="images/video-thumb-$i.jpg"
    if [ ! -f "$filename" ]; then
        if [ "$USE_IMAGEMAGICK" = true ]; then
            convert -size 320x180 xc:"#667eea" \
                -gravity center \
                -pointsize 24 \
                -fill white \
                -annotate +0+0 "医学视频 $i" \
                "$filename"
            print_success "生成视频缩略图: video-thumb-$i.jpg"
        else
            echo "# 视频缩略图占位符 $i" > "$filename"
            print_info "创建占位符: video-thumb-$i.jpg"
        fi
    else
        print_info "视频缩略图 $i 已存在，跳过"
    fi
done

# 生成讲师头像
for i in {1..9}; do
    filename="images/instructor-$i.jpg"
    if [ ! -f "$filename" ]; then
        if [ "$USE_IMAGEMAGICK" = true ]; then
            convert -size 100x100 xc:"#764ba2" \
                -gravity center \
                -pointsize 16 \
                -fill white \
                -annotate +0+0 "讲师 $i" \
                "$filename"
            print_success "生成讲师头像: instructor-$i.jpg"
        else
            echo "# 讲师头像占位符 $i" > "$filename"
            print_info "创建占位符: instructor-$i.jpg"
        fi
    else
        print_info "讲师头像 $i 已存在，跳过"
    fi
done

# 生成默认图片
if [ ! -f "images/default-image.jpg" ]; then
    if [ "$USE_IMAGEMAGICK" = true ]; then
        convert -size 400x300 xc:"#f0f0f0" \
            -gravity center \
            -pointsize 20 \
            -fill "#666666" \
            -annotate +0+0 "默认图片" \
            "images/default-image.jpg"
        print_success "生成默认图片: default-image.jpg"
    else
        echo "# 默认图片占位符" > "images/default-image.jpg"
        print_info "创建占位符: default-image.jpg"
    fi
else
    print_info "默认图片已存在，跳过"
fi

# 生成默认头像
if [ ! -f "images/default-avatar.png" ]; then
    if [ "$USE_IMAGEMAGICK" = true ]; then
        convert -size 100x100 xc:"#cccccc" \
            -gravity center \
            -pointsize 16 \
            -fill "#666666" \
            -annotate +0+0 "头像" \
            "images/default-avatar.png"
        print_success "生成默认头像: default-avatar.png"
    else
        echo "# 默认头像占位符" > "images/default-avatar.png"
        print_info "创建占位符: default-avatar.png"
    fi
else
    print_info "默认头像已存在，跳过"
fi

# 生成分享Logo
if [ ! -f "images/share-logo.png" ]; then
    if [ "$USE_IMAGEMAGICK" = true ]; then
        convert -size 200x200 xc:"#667eea" \
            -gravity center \
            -pointsize 24 \
            -fill white \
            -annotate +0+0 "奥友医学" \
            "images/share-logo.png"
        print_success "生成分享Logo: share-logo.png"
    else
        echo "# 分享Logo占位符" > "images/share-logo.png"
        print_info "创建占位符: share-logo.png"
    fi
else
    print_info "分享Logo已存在，跳过"
fi

# 生成PWA图标
for size in 192 512; do
    filename="images/icon-$size.png"
    if [ ! -f "$filename" ]; then
        if [ "$USE_IMAGEMAGICK" = true ]; then
            convert -size "${size}x${size}" xc:"#667eea" \
                -gravity center \
                -pointsize $((size/8)) \
                -fill white \
                -annotate +0+0 "🏥" \
                "$filename"
            print_success "生成PWA图标: icon-$size.png"
        else
            echo "# PWA图标占位符 ${size}x${size}" > "$filename"
            print_info "创建占位符: icon-$size.png"
        fi
    else
        print_info "PWA图标 $size 已存在，跳过"
    fi
done

print_info "占位符图片生成完成！"

echo ""
echo "生成的图片文件:"
ls -la images/

echo ""
echo "注意事项:"
echo "1. 这些是占位符图片，建议替换为真实的医学相关图片"
echo "2. 如需高质量图片，请安装ImageMagick: brew install imagemagick (macOS)"
echo "3. 建议使用专业的医学图片资源"
echo "4. 确保图片具有合法的使用权限"
echo ""