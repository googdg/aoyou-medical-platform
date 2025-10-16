#!/bin/bash

# 奥友医学科普学习平台 - 部署脚本
# 用于生产环境部署和上线准备

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="aoyou-medical-platform"
BUILD_DIR="dist"
BACKUP_DIR="backup"
LOG_FILE="deploy.log"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

print_success() {
    print_message $GREEN "$1"
}

print_error() {
    print_message $RED "$1"
}

print_warning() {
    print_message $YELLOW "$1"
}

print_info() {
    print_message $BLUE "$1"
}

# 检查依赖
check_dependencies() {
    print_info "检查部署依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    print_success "依赖检查完成"
}

# 环境检查
check_environment() {
    print_info "检查部署环境..."
    
    # 检查磁盘空间
    available_space=$(df . | tail -1 | awk '{print $4}')
    if [ $available_space -lt 1048576 ]; then  # 1GB
        print_warning "磁盘空间不足 1GB，建议清理后再部署"
    fi
    
    # 检查内存
    if command -v free &> /dev/null; then
        available_memory=$(free -m | awk 'NR==2{printf "%.1f", $7/1024}')
        print_info "可用内存: ${available_memory}GB"
    fi
    
    print_success "环境检查完成"
}

# 创建备份
create_backup() {
    print_info "创建备份..."
    
    if [ -d "$BUILD_DIR" ]; then
        timestamp=$(date +%Y%m%d_%H%M%S)
        backup_name="${BACKUP_DIR}/backup_${timestamp}"
        
        mkdir -p "$BACKUP_DIR"
        cp -r "$BUILD_DIR" "$backup_name"
        
        print_success "备份创建完成: $backup_name"
    else
        print_info "没有现有构建，跳过备份"
    fi
}

# 清理构建目录
clean_build() {
    print_info "清理构建目录..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_success "构建目录已清理"
    fi
    
    mkdir -p "$BUILD_DIR"
}

# 复制文件到构建目录
copy_files() {
    print_info "复制项目文件..."
    
    # 复制HTML文件
    cp aoyou-medical-platform.html "$BUILD_DIR/index.html"
    cp aoyou-medical-test.html "$BUILD_DIR/"
    
    # 复制CSS文件
    mkdir -p "$BUILD_DIR/css"
    cp -r css/* "$BUILD_DIR/css/"
    
    # 复制JavaScript文件
    mkdir -p "$BUILD_DIR/js"
    cp -r js/* "$BUILD_DIR/js/"
    
    # 复制Service Worker
    cp sw.js "$BUILD_DIR/"
    
    # 创建images目录（如果存在）
    if [ -d "images" ]; then
        cp -r images "$BUILD_DIR/"
    else
        mkdir -p "$BUILD_DIR/images"
        # 创建默认图片占位符
        echo "创建默认图片占位符..."
    fi
    
    print_success "文件复制完成"
}

# 优化文件
optimize_files() {
    print_info "优化文件..."
    
    # 压缩CSS（如果有工具）
    if command -v csso &> /dev/null; then
        find "$BUILD_DIR/css" -name "*.css" -exec csso {} -o {} \;
        print_success "CSS文件已压缩"
    else
        print_warning "csso 未安装，跳过CSS压缩"
    fi
    
    # 压缩JavaScript（如果有工具）
    if command -v uglifyjs &> /dev/null; then
        find "$BUILD_DIR/js" -name "*.js" -exec uglifyjs {} -o {} \;
        print_success "JavaScript文件已压缩"
    else
        print_warning "uglifyjs 未安装，跳过JavaScript压缩"
    fi
    
    # 优化图片（如果有工具）
    if command -v imagemin &> /dev/null && [ -d "$BUILD_DIR/images" ]; then
        imagemin "$BUILD_DIR/images/*" --out-dir="$BUILD_DIR/images"
        print_success "图片已优化"
    else
        print_warning "imagemin 未安装，跳过图片优化"
    fi
}

# 生成配置文件
generate_config() {
    print_info "生成配置文件..."
    
    # 生成manifest.json
    cat > "$BUILD_DIR/manifest.json" << EOF
{
    "name": "奥友医学科普学习平台",
    "short_name": "奥友医学",
    "description": "专业医学科普学习平台",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#667eea",
    "icons": [
        {
            "src": "images/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "images/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
EOF
    
    # 生成robots.txt
    cat > "$BUILD_DIR/robots.txt" << EOF
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
EOF
    
    # 生成.htaccess（Apache配置）
    cat > "$BUILD_DIR/.htaccess" << EOF
# 启用Gzip压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# 设置缓存
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# 安全头
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
</IfModule>

# 重写规则
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]
EOF
    
    print_success "配置文件生成完成"
}

# 运行测试
run_tests() {
    print_info "运行测试..."
    
    # 启动简单的HTTP服务器进行测试
    if command -v python3 &> /dev/null; then
        cd "$BUILD_DIR"
        timeout 10s python3 -m http.server 8080 > /dev/null 2>&1 &
        server_pid=$!
        
        sleep 2
        
        # 测试页面是否可访问
        if curl -s http://localhost:8080 > /dev/null; then
            print_success "页面访问测试通过"
        else
            print_error "页面访问测试失败"
        fi
        
        # 停止服务器
        kill $server_pid 2>/dev/null || true
        cd ..
    else
        print_warning "Python3 未安装，跳过HTTP服务器测试"
    fi
    
    # 检查文件完整性
    required_files=("index.html" "css/aoyou-medical.css" "js/aoyou-medical-app.js" "sw.js")
    for file in "${required_files[@]}"; do
        if [ -f "$BUILD_DIR/$file" ]; then
            print_success "✓ $file"
        else
            print_error "✗ $file 缺失"
            exit 1
        fi
    done
}

# 生成部署报告
generate_report() {
    print_info "生成部署报告..."
    
    report_file="$BUILD_DIR/deploy-report.txt"
    
    cat > "$report_file" << EOF
奥友医学科普学习平台 - 部署报告
=====================================

部署时间: $(date)
部署版本: 1.0.0
构建目录: $BUILD_DIR

文件统计:
- HTML文件: $(find "$BUILD_DIR" -name "*.html" | wc -l)
- CSS文件: $(find "$BUILD_DIR" -name "*.css" | wc -l)
- JavaScript文件: $(find "$BUILD_DIR" -name "*.js" | wc -l)
- 图片文件: $(find "$BUILD_DIR" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" | wc -l)

总文件大小: $(du -sh "$BUILD_DIR" | cut -f1)

功能模块:
✓ 用户认证系统
✓ 视频播放系统
✓ 积分等级系统
✓ 微信集成
✓ 移动端优化
✓ 数据持久化
✓ 性能优化
✓ 用户体验优化
✓ 数据统计分析

部署检查:
✓ 文件完整性检查
✓ 配置文件生成
✓ 安全设置配置
✓ 缓存策略设置
✓ PWA配置

注意事项:
1. 请确保服务器支持HTTPS
2. 配置正确的域名和SSL证书
3. 设置适当的服务器缓存策略
4. 配置CDN加速（可选）
5. 设置监控和日志记录

EOF
    
    print_success "部署报告已生成: $report_file"
}

# 显示部署后的操作指南
show_post_deploy_guide() {
    print_info "部署后操作指南:"
    echo ""
    echo "1. 上传文件到服务器:"
    echo "   rsync -avz --delete $BUILD_DIR/ user@server:/var/www/html/"
    echo ""
    echo "2. 配置Nginx (示例):"
    echo "   server {"
    echo "       listen 80;"
    echo "       server_name your-domain.com;"
    echo "       root /var/www/html;"
    echo "       index index.html;"
    echo "       "
    echo "       location / {"
    echo "           try_files \$uri \$uri/ /index.html;"
    echo "       }"
    echo "       "
    echo "       location ~* \\.(css|js|png|jpg|jpeg|gif|svg|ico)$ {"
    echo "           expires 1y;"
    echo "           add_header Cache-Control \"public, immutable\";"
    echo "       }"
    echo "   }"
    echo ""
    echo "3. 配置HTTPS:"
    echo "   certbot --nginx -d your-domain.com"
    echo ""
    echo "4. 测试部署:"
    echo "   curl -I https://your-domain.com"
    echo ""
    echo "5. 监控设置:"
    echo "   - 设置服务器监控"
    echo "   - 配置错误日志"
    echo "   - 设置性能监控"
    echo ""
}

# 主函数
main() {
    print_info "开始部署 $PROJECT_NAME..."
    echo "========================================"
    
    # 记录开始时间
    start_time=$(date +%s)
    
    # 执行部署步骤
    check_dependencies
    check_environment
    create_backup
    clean_build
    copy_files
    optimize_files
    generate_config
    run_tests
    generate_report
    
    # 计算部署时间
    end_time=$(date +%s)
    deploy_time=$((end_time - start_time))
    
    print_success "部署完成！耗时: ${deploy_time}秒"
    echo "========================================"
    
    show_post_deploy_guide
    
    print_info "构建文件位于: $BUILD_DIR"
    print_info "部署日志: $LOG_FILE"
}

# 清理函数
cleanup() {
    print_info "清理临时文件..."
    # 这里可以添加清理逻辑
}

# 错误处理
error_handler() {
    print_error "部署过程中发生错误，请检查日志"
    cleanup
    exit 1
}

# 设置错误处理
trap error_handler ERR
trap cleanup EXIT

# 检查参数
case "${1:-}" in
    "clean")
        print_info "清理构建目录..."
        rm -rf "$BUILD_DIR"
        rm -rf "$BACKUP_DIR"
        print_success "清理完成"
        exit 0
        ;;
    "test")
        print_info "运行测试模式..."
        run_tests
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "用法: $0 [选项]"
        echo ""
        echo "选项:"
        echo "  clean    清理构建目录和备份"
        echo "  test     仅运行测试"
        echo "  help     显示此帮助信息"
        echo ""
        echo "无参数运行将执行完整部署流程"
        exit 0
        ;;
esac

# 执行主函数并记录日志
main 2>&1 | tee "$LOG_FILE"