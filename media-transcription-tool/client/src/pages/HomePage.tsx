import React, { useState } from 'react'
import { Upload, Link, FileText, Download, Settings, Zap, Play } from 'lucide-react'
import FileUpload from '../components/upload/FileUpload'
import UrlInput from '../components/upload/UrlInput'
import ProgressBar from '../components/progress/ProgressBar'
import TranscriptionOptions from '../components/transcription/TranscriptionOptions'
import StatusIndicator from '../components/common/StatusIndicator'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { apiClient } from '../services/api'
import { UrlInfo } from '../types'

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle')
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transcriptionOptions, setTranscriptionOptions] = useState({
    language: 'auto',
    model: 'base',
    includeTimestamps: true,
    wordTimestamps: false,
    temperature: 0
  })

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return
    
    const file = files[0] // 处理第一个文件
    console.log('Processing file:', file.name)
    
    try {
      setIsProcessing(true)
      setStatus('processing')
      setProgress(0)
      setError(null)
      setCurrentFile(file.name)

      // 上传文件并跟踪进度
      const uploadedFile = await apiClient.uploadFile(file, (progress) => {
        setProgress(Math.min(progress.percentage * 0.5, 50)) // 上传占总进度的50%
      })

      if (uploadedFile) {
        setProgress(60)
        
        // 启动转录
        const transcriptionJob = await apiClient.startTranscription(uploadedFile.id, transcriptionOptions)
        
        if (transcriptionJob) {
          // 模拟转录进度
          let currentProgress = 60
          const progressInterval = setInterval(() => {
            currentProgress += 5
            setProgress(currentProgress)
            
            if (currentProgress >= 100) {
              clearInterval(progressInterval)
              setStatus('completed')
              setIsProcessing(false)
            }
          }, 1000)
        } else {
          throw new Error('转录启动失败')
        }
      } else {
        throw new Error('文件上传失败')
      }
      
    } catch (error) {
      console.error('File processing error:', error)
      setStatus('failed')
      setIsProcessing(false)
      setError(error instanceof Error ? error.message : '文件处理失败')
    }
  }

  const handleUrlSubmit = async (url: string, urlInfo?: UrlInfo) => {
    console.log('Processing URL:', url, urlInfo)
    
    try {
      setIsProcessing(true)
      setStatus('processing')
      setProgress(0)
      setError(null)
      setCurrentFile(urlInfo?.title || url)

      // 获取URL信息（如果还没有）
      if (!urlInfo) {
        setProgress(10)
        urlInfo = await apiClient.getUrlInfo(url)
      }

      // 处理URL
      setProgress(30)
      const processedMedia = await apiClient.processUrl(url, {
        audioOnly: false,
        quality: 'best'
      })

      if (processedMedia) {
        setProgress(60)
        
        // 启动转录
        const transcriptionJob = await apiClient.startTranscription(processedMedia.id, transcriptionOptions)
        
        if (transcriptionJob) {
          // 模拟转录进度
          let currentProgress = 60
          const progressInterval = setInterval(() => {
            currentProgress += 5
            setProgress(currentProgress)
            
            if (currentProgress >= 100) {
              clearInterval(progressInterval)
              setStatus('completed')
              setIsProcessing(false)
            }
          }, 1000)
        } else {
          throw new Error('转录启动失败')
        }
      } else {
        throw new Error('URL处理失败')
      }
      
    } catch (error) {
      console.error('URL processing error:', error)
      setStatus('failed')
      setIsProcessing(false)
      setError(error instanceof Error ? error.message : 'URL处理失败')
    }
  }

  const resetProcessing = () => {
    setIsProcessing(false)
    setProgress(0)
    setStatus('idle')
    setCurrentFile(null)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI 音视频转文字稿工具
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          支持多种输入方式，基于 OpenAI Whisper 的高精度语音识别，
          一键生成专业文字稿和字幕文件
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">YouTube / Bilibili</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-700 font-medium">本地文件上传</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-full">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-purple-700 font-medium">多语言识别</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-orange-700 font-medium">多格式导出</span>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">处理进度</h3>
              {currentFile && (
                <p className="text-sm text-gray-600 mt-1">
                  正在处理: {currentFile}
                </p>
              )}
            </div>
            <StatusIndicator status={status} />
          </div>
          <ProgressBar
            progress={progress}
            status={status}
            message={
              progress < 50 
                ? "正在上传和处理文件..." 
                : progress < 60 
                ? "正在启动 AI 转录..." 
                : "正在使用 AI 模型转录音频..."
            }
            estimatedTime={120}
            showDetails={true}
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={resetProcessing}
                className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
              >
                重新开始
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transcription Options */}
      <div className="mb-8">
        <TranscriptionOptions
          options={transcriptionOptions}
          onChange={setTranscriptionOptions}
          disabled={isProcessing}
        />
      </div>

      {/* Input Methods Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('file')}
            disabled={isProcessing}
            className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'file'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>本地文件上传</span>
          </button>
          
          <button
            onClick={() => setActiveTab('url')}
            disabled={isProcessing}
            className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'url'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Link className="w-5 h-5" />
            <span>在线链接处理</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'file' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  上传音视频文件
                </h2>
                <p className="text-gray-600">
                  支持拖拽上传，兼容多种音视频格式，最大支持 500MB 文件
                </p>
              </div>
              
              <FileUpload
                onFilesSelected={handleFilesSelected}
                maxFiles={1}
                maxSize={500}
                disabled={isProcessing}
              />
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  处理在线视频链接
                </h2>
                <p className="text-gray-600">
                  输入视频链接，系统会自动下载并提取音频进行转录
                </p>
              </div>
              
              <UrlInput
                onUrlSubmit={handleUrlSubmit}
                disabled={isProcessing}
              />
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">高精度转录</h3>
          <p className="text-sm text-gray-600">
            基于 OpenAI Whisper 模型，支持多语言识别，准确率高达 95%
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">实时进度</h3>
          <p className="text-sm text-gray-600">
            实时显示处理进度，支持时间估算和错误恢复
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">多格式导出</h3>
          <p className="text-sm text-gray-600">
            支持 TXT、SRT、VTT、DOCX、PDF 等多种格式导出
          </p>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          快速开始
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: 1, title: '上传文件或输入链接', desc: '选择本地文件或粘贴在线视频链接' },
            { step: 2, title: '选择转录选项', desc: '设置语言、模型精度等参数' },
            { step: 3, title: '等待 AI 处理', desc: '实时查看处理进度和状态' },
            { step: 4, title: '编辑并导出', desc: '在线编辑文字稿并导出多种格式' }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage