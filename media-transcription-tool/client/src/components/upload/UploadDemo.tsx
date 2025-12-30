import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import UploadManager from './UploadManager'
import { UploadedFile } from '../../types'
import { useNotifications } from '../common/NotificationSystem'

const UploadDemo: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { showSuccess, showError } = useNotifications()

  const handleUploadComplete = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    showSuccess(
      '文件上传成功',
      `成功上传 ${files.length} 个文件`
    )
    
    // 模拟开始处理
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      showSuccess('处理完成', '文件已准备好进行转录')
    }, 3000)
  }

  const handleUploadError = (error: string) => {
    showError('上传失败', error)
  }

  const handleClearFiles = () => {
    setUploadedFiles([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          文件上传演示
        </h1>
        <p className="text-gray-600">
          测试文件上传功能，支持多文件上传、进度跟踪和错误处理
        </p>
      </div>

      {/* Upload Manager */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          文件上传管理器
        </h2>
        <UploadManager
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          maxFiles={5}
          maxFileSize={50} // 50MB for demo
        />
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="text-blue-800 font-medium">正在处理文件...</p>
              <p className="text-blue-600 text-sm">准备文件以进行转录处理</p>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              已上传文件 ({uploadedFiles.length})
            </h2>
            <button
              onClick={handleClearFiles}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              清空列表
            </button>
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={`${file.id}-${index}`}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{file.mimetype}</span>
                    <span>•</span>
                    <span>已上传</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    就绪
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-3">
            <button
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              开始转录
            </button>
            <button
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              批量处理
            </button>
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <h3 className="font-medium text-gray-900">多文件上传</h3>
          </div>
          <p className="text-sm text-gray-600">
            支持同时上传多个文件，自动验证格式和大小限制
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="font-medium text-gray-900">进度跟踪</h3>
          </div>
          <p className="text-sm text-gray-600">
            实时显示上传进度，支持暂停、重试和取消操作
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <h3 className="font-medium text-gray-900">错误处理</h3>
          </div>
          <p className="text-sm text-gray-600">
            智能错误处理和恢复，提供详细的错误信息和解决建议
          </p>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">技术特性</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">支持的格式</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 视频: MP4, AVI, MOV, WMV, FLV, MKV, WebM</li>
              <li>• 音频: MP3, WAV, M4A, FLAC, AAC, OGG, WMA</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">上传限制</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 最大文件大小: 100MB</li>
              <li>• 最多文件数量: 10个</li>
              <li>• 支持断点续传和分块上传</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadDemo