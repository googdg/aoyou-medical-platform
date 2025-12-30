# 音视频转文字稿工具

一个基于AI的音视频转录工具，支持多种输入格式和在线链接处理。

## 功能特性

🎥 **多种输入方式**
- YouTube、Bilibili、Vimeo等视频链接
- 音频直链URL
- 本地视频文件上传 (MP4, AVI, MOV等)
- 本地音频文件上传 (MP3, WAV, M4A, FLAC等)

🤖 **AI驱动转录**
- OpenAI Whisper语音识别
- 多语言自动检测
- 高精度转录 (95%+准确率)
- 实时进度跟踪

⏱️ **时间戳功能**
- 精确的句子级时间戳
- 点击跳转音频位置
- 时间戳编辑同步

✏️ **文本编辑**
- 内置文本编辑器
- 实时保存
- 撤销/重做
- 批量替换

📤 **多格式导出**
- 纯文本 (TXT)
- 字幕文件 (SRT, VTT)
- 文档格式 (DOCX, PDF)

## 技术栈

**前端**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (状态管理)
- Wavesurfer.js (音频播放)

**后端**
- Node.js + Express
- TypeScript
- Bull Queue (任务队列)
- Socket.io (实时通信)
- SQLite/PostgreSQL

**AI & 媒体处理**
- OpenAI Whisper
- FFmpeg
- yt-dlp

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.8+ (用于Whisper)
- FFmpeg

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd media-transcription-tool

# 安装所有依赖
npm run install:all

# 安装Python依赖
pip install openai-whisper yt-dlp

# 启动开发服务器
npm run dev
```

### 环境配置

复制 `.env.example` 到 `.env` 并配置必要的环境变量：

```bash
cp .env.example .env
```

## 开发

```bash
# 开发模式 (前后端同时启动)
npm run dev

# 单独启动前端
npm run client:dev

# 单独启动后端
npm run server:dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

## 部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
media-transcription-tool/
├── client/                 # React前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── hooks/         # 自定义Hooks
│   │   ├── services/      # API服务
│   │   ├── stores/        # Zustand状态管理
│   │   ├── types/         # TypeScript类型定义
│   │   └── utils/         # 工具函数
│   ├── public/            # 静态资源
│   └── package.json
├── server/                # Node.js后端服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── models/        # 数据模型
│   │   ├── middleware/    # 中间件
│   │   ├── routes/        # 路由定义
│   │   └── utils/         # 工具函数
│   └── package.json
├── shared/                # 共享类型和工具
└── docs/                  # 文档
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License