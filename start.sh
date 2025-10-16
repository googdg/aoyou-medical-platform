#!/bin/bash

# Personal Blog Quick Start Script
# 快速启动个人博客项目

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 显示欢迎信息
echo -e "${BLUE}"
echo "=================================================="
echo "🎉 个人博客项目快速启动"
echo "=================================================="
echo -e "${NC}"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本: $(node --version)${NC}"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm 版本: $(npm --version)${NC}"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 正在安装依赖...${NC}"
    npm install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✅ 依赖已存在${NC}"
fi

# 创建必要的目录
mkdir -p data logs uploads static
echo -e "${GREEN}✅ 目录结构检查完成${NC}"

# 检查环境配置
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️ 创建环境配置文件...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ 环境配置文件已创建${NC}"
else
    echo -e "${GREEN}✅ 环境配置文件已存在${NC}"
fi

# 启动服务器
echo -e "${BLUE}"
echo "=================================================="
echo "🚀 启动开发服务器"
echo "=================================================="
echo -e "${NC}"

echo -e "${YELLOW}📍 服务器地址: http://localhost:3001${NC}"
echo -e "${YELLOW}🔧 管理后台: http://localhost:3001/admin${NC}"
echo -e "${YELLOW}🧪 功能测试: http://localhost:3001/final-check.html${NC}"
echo ""
echo -e "${BLUE}按 Ctrl+C 停止服务器${NC}"
echo ""

# 启动Node.js服务器
node server.js