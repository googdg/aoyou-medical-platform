#!/bin/bash

# 🚀 奥友医学视频平台 - 快速部署脚本

echo "🏥 奥友医学视频平台 - GitHub 快速部署"
echo "========================================"

# 检查Git是否已安装
if ! command -v git &> /dev/null; then
    echo "❌ 错误：请先安装Git"
    exit 1
fi

# 获取用户输入
read -p "📝 请输入您的GitHub用户名: " username
read -p "📝 请输入仓库名称 (默认: aoyou-medical-platform): " repo_name

# 设置默认仓库名
if [ -z "$repo_name" ]; then
    repo_name="aoyou-medical-platform"
fi

echo ""
echo "🔧 准备部署到: https://github.com/$username/$repo_name"
echo ""

# 确认部署
read -p "❓ 确认开始部署吗？(y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ 部署已取消"
    exit 0
fi

echo ""
echo "🚀 开始部署..."

# 初始化Git仓库（如果还没有）
if [ ! -d ".git" ]; then
    echo "📦 初始化Git仓库..."
    git init
fi

# 添加所有文件
echo "📁 添加项目文件..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "🎉 奥友医学视频平台 - 初始发布

✨ 主要功能：
- 🔐 邀请码验证系统
- 🎬 YouTube风格视频平台  
- 📱 移动端完美适配
- 🎯 用户积分等级系统
- 🏥 7个医学分类板块

🔑 演示信息：
- 登录邀请码：AOYOU2024
- 视频邀请码：任意数字（如1234）"

# 设置远程仓库
echo "🔗 连接到GitHub仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$username/$repo_name.git"

# 设置主分支
git branch -M main

# 推送到GitHub
echo "⬆️ 推送到GitHub..."
if git push -u origin main; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "📍 仓库地址: https://github.com/$username/$repo_name"
    echo "🌐 请在GitHub上启用Pages功能："
    echo "   1. 进入仓库Settings"
    echo "   2. 滚动到Pages部分"
    echo "   3. Source选择'Deploy from a branch'"
    echo "   4. Branch选择'main'"
    echo "   5. 点击Save"
    echo ""
    echo "🎬 部署完成后访问："
    echo "   https://$username.github.io/$repo_name/aoyou-youtube-style.html"
    echo ""
    echo "🔑 演示账号："
    echo "   登录邀请码: AOYOU2024"
    echo "   视频邀请码: 任意数字（如1234）"
    echo ""
else
    echo ""
    echo "❌ 推送失败！"
    echo "💡 可能的原因："
    echo "   1. 仓库不存在，请先在GitHub创建仓库"
    echo "   2. 没有推送权限，请检查GitHub认证"
    echo "   3. 网络连接问题"
    echo ""
    echo "🔧 手动解决步骤："
    echo "   1. 在GitHub创建名为 '$repo_name' 的仓库"
    echo "   2. 运行: git push -u origin main"
fi

echo ""
echo "📋 下一步："
echo "   1. 在GitHub启用Pages功能"
echo "   2. 测试所有功能是否正常"
echo "   3. 分享项目链接"
echo "   4. 收集用户反馈"
echo ""
echo "🎯 完成！感谢使用奥友医学视频平台！"