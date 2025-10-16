#!/bin/bash

# 奥友医学科普学习平台 - Demo视频下载脚本
# 用于下载演示视频文件

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

# 创建videos目录
mkdir -p videos

print_info "开始下载演示视频..."

# 下载示例视频1 - 基础医学内容
if [ ! -f "videos/demo-video-1.mp4" ] || [ ! -s "videos/demo-video-1.mp4" ]; then
    print_info "下载演示视频1: 基础医学概论"
    
    # 尝试多个视频源
    if wget -q --spider "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"; then
        wget "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" -O "videos/demo-video-1.mp4"
        print_success "演示视频1下载完成"
    elif wget -q --spider "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; then
        wget "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" -O "videos/demo-video-1.mp4"
        print_success "演示视频1下载完成（使用备用源）"
    else
        print_warning "无法下载演示视频1，请手动添加视频文件到 videos/demo-video-1.mp4"
        # 创建一个简单的测试视频（使用ffmpeg如果可用）
        if command -v ffmpeg &> /dev/null; then
            ffmpeg -f lavfi -i testsrc=duration=30:size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:duration=30 -c:v libx264 -c:a aac -shortest "videos/demo-video-1.mp4" -y
            print_success "使用ffmpeg生成了测试视频1"
        fi
    fi
else
    print_info "演示视频1已存在，跳过下载"
fi

# 下载示例视频2 - 临床医学内容
if [ ! -f "videos/demo-video-2.mp4" ] || [ ! -s "videos/demo-video-2.mp4" ]; then
    print_info "下载演示视频2: 临床诊疗技术"
    
    # 尝试多个视频源
    if wget -q --spider "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4"; then
        wget "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4" -O "videos/demo-video-2.mp4"
        print_success "演示视频2下载完成"
    elif wget -q --spider "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"; then
        wget "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" -O "videos/demo-video-2.mp4"
        print_success "演示视频2下载完成（使用备用源）"
    else
        print_warning "无法下载演示视频2，请手动添加视频文件到 videos/demo-video-2.mp4"
        # 创建一个简单的测试视频（使用ffmpeg如果可用）
        if command -v ffmpeg &> /dev/null; then
            ffmpeg -f lavfi -i testsrc=duration=45:size=1280x720:rate=30 -f lavfi -i sine=frequency=800:duration=45 -c:v libx264 -c:a aac -shortest "videos/demo-video-2.mp4" -y
            print_success "使用ffmpeg生成了测试视频2"
        fi
    fi
else
    print_info "演示视频2已存在，跳过下载"
fi

# 检查视频文件
print_info "检查视频文件..."

for video in videos/*.mp4; do
    if [ -f "$video" ] && [ -s "$video" ]; then
        size=$(du -h "$video" | cut -f1)
        print_success "✓ $video (大小: $size)"
    else
        print_warning "✗ $video 不存在或为空"
    fi
done

print_info "演示视频准备完成！"
print_info "您现在可以在平台中观看这些演示视频了。"
print_info "如需替换为真实的医学教育视频，请将MP4文件放入videos目录。"

echo ""
echo "推荐的视频规格:"
echo "- 分辨率: 1280x720 或 1920x1080"
echo "- 编码: H.264"
echo "- 帧率: 30fps"
echo "- 文件大小: 10-100MB"
echo "- 时长: 5-30分钟"
echo ""
echo "您也可以手动下载医学教育视频:"
echo "1. 从医学教育网站下载"
echo "2. 使用自己录制的教学视频"
echo "3. 从开放教育资源获取"
echo ""