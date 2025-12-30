import React from 'react'
import { Github, Heart } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4 md:mb-0">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>by AI Assistant</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            
            <div className="text-sm text-gray-500">
              © 2024 音视频转文字稿工具
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 text-center md:text-left">
            <p>
              支持 YouTube、Bilibili、Vimeo 等平台链接 | 
              支持 MP4、MP3、WAV 等多种格式 | 
              基于 OpenAI Whisper 的高精度转录
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer