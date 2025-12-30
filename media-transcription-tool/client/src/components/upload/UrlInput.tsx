import React, { useState, useCallback } from 'react'
import { Link, Play, AlertCircle, CheckCircle, Loader, Info, ExternalLink } from 'lucide-react'
import { apiClient } from '../../services/api'
import { UrlInfo } from '../../types'

interface UrlInputProps {
  onUrlSubmit: (url: string, urlInfo?: UrlInfo) => void
  disabled?: boolean
  className?: string
}

interface UrlPreview {
  url: string
  platform: string
  isValid: boolean
  isLoading: boolean
  error?: string
  urlInfo?: UrlInfo
}

const UrlInput: React.FC<UrlInputProps> = ({
  onUrlSubmit,
  disabled = false,
  className = ''
}) => {
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<UrlPreview | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleUrlChange = useCallback((value: string) => {
    setUrl(value)
    setPreview(null)
    
    // Clear existing timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout)
    }
    
    if (value.trim()) {
      // Debounce validation
      const timeoutId = setTimeout(() => {
        validateUrlInput(value.trim())
      }, 800)
      
      setValidationTimeout(timeoutId)
    }
  }, [validationTimeout])

  const validateUrlInput = async (inputUrl: string) => {
    setIsValidating(true)
    
    try {
      // Client-side validation first
      const clientValidation = apiClient.validateUrl(inputUrl)
      
      if (!clientValidation.isValid) {
        setPreview({
          url: inputUrl,
          platform: 'unknown',
          isValid: false,
          isLoading: false,
          error: clientValidation.error
        })
        setIsValidating(false)
        return
      }

      // Get URL info from server
      const urlInfo = await apiClient.getUrlInfo(inputUrl)
      
      setPreview({
        url: inputUrl,
        platform: urlInfo.platform,
        isValid: true,
        isLoading: false,
        urlInfo
      })
      
    } catch (error) {
      setPreview({
        url: inputUrl,
        platform: 'unknown',
        isValid: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '获取链接信息失败'
      })
    }
    
    setIsValidating(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) return
    
    if (preview?.isValid && preview.urlInfo) {
      onUrlSubmit(url.trim(), preview.urlInfo)
    } else {
      // Fallback for basic validation
      const validation = apiClient.validateUrl(url)
      if (validation.isValid) {
        onUrlSubmit(url.trim())
      }
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return '🎥'
      case 'bilibili':
        return '📺'
      case 'vimeo':
        return '🎬'
      case 'tiktok':
        return '🎵'
      case 'twitter':
        return '🐦'
      case 'instagram':
        return '📷'
      case 'direct':
        return '🔗'
      default:
        return '🌐'
    }
  }

  const getSupportedPlatforms = () => [
    { name: 'YouTube', icon: '🎥', example: 'youtube.com/watch?v=...' },
    { name: 'Bilibili', icon: '📺', example: 'bilibili.com/video/...' },
    { name: 'Vimeo', icon: '🎬', example: 'vimeo.com/...' },
    { name: 'TikTok', icon: '🎵', example: 'tiktok.com/@user/video/...' },
    { name: 'Twitter/X', icon: '🐦', example: 'twitter.com/user/status/...' },
    { name: 'Instagram', icon: '📷', example: 'instagram.com/p/...' },
    { name: '音频直链', icon: '🔗', example: 'example.com/audio.mp3' },
    { name: '视频直链', icon: '🎬', example: 'example.com/video.mp4' }
  ]

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null
    
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link className="w-5 h-5 text-gray-400" />
          </div>
          
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="粘贴 YouTube、Bilibili、Vimeo 等平台链接"
            disabled={disabled}
            className={`
              w-full pl-10 pr-4 py-3 border rounded-lg text-sm
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${preview?.isValid === false ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          
          {/* Loading Indicator */}
          {isValidating && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Loader className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || !url.trim() || preview?.isValid === false}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${disabled || !url.trim() || preview?.isValid === false
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
            }
          `}
        >
          <div className="flex items-center justify-center space-x-2">
            <Play className="w-4 h-4" />
            <span>开始处理</span>
          </div>
        </button>
      </form>

      {/* URL Preview */}
      {preview && (
        <div className={`
          p-4 rounded-lg border
          ${preview.isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
          }
        `}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {preview.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {preview.isValid && preview.urlInfo ? (
                <div className="space-y-3">
                  {/* Basic Info */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">
                        {getPlatformIcon(preview.platform)}
                      </span>
                      <p className="text-sm font-medium text-green-800">
                        {preview.platform} 链接已识别
                      </p>
                    </div>
                    
                    {preview.urlInfo.title && (
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {preview.urlInfo.title}
                      </h4>
                    )}
                    
                    <p className="text-xs text-green-600 break-all">
                      {preview.url}
                    </p>
                  </div>

                  {/* Media Details */}
                  {(preview.urlInfo.duration || preview.urlInfo.uploader || preview.urlInfo.viewCount) && (
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      {preview.urlInfo.duration && (
                        <div className="flex items-center space-x-1">
                          <Info className="w-3 h-3" />
                          <span>时长: {formatDuration(preview.urlInfo.duration)}</span>
                        </div>
                      )}
                      
                      {preview.urlInfo.uploader && (
                        <div className="flex items-center space-x-1">
                          <span>👤</span>
                          <span>作者: {preview.urlInfo.uploader}</span>
                        </div>
                      )}
                      
                      {preview.urlInfo.viewCount && (
                        <div className="flex items-center space-x-1">
                          <span>👁️</span>
                          <span>观看: {preview.urlInfo.viewCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thumbnail */}
                  {preview.urlInfo.thumbnail && (
                    <div className="flex items-center space-x-2">
                      <img 
                        src={preview.urlInfo.thumbnail} 
                        alt="视频缩略图"
                        className="w-16 h-12 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="text-xs text-gray-500">
                        <p>缩略图预览</p>
                        {preview.urlInfo.formats && preview.urlInfo.formats.length > 0 && (
                          <p>可用格式: {preview.urlInfo.formats.length} 个</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* External Link */}
                  <div className="pt-2 border-t border-green-200">
                    <a 
                      href={preview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-green-700 hover:text-green-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>在新窗口中打开</span>
                    </a>
                  </div>
                </div>
              ) : preview.isValid ? (
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">
                      {getPlatformIcon(preview.platform)}
                    </span>
                    <p className="text-sm font-medium text-green-800">
                      {preview.platform} 链接已识别
                    </p>
                  </div>
                  <p className="text-xs text-green-600 break-all">
                    {preview.url}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    链接格式错误
                  </p>
                  <p className="text-xs text-red-600">
                    {preview.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Supported Platforms */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          支持的平台
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          {getSupportedPlatforms().map((platform) => (
            <div key={platform.name} className="flex items-center space-x-2">
              <span className="text-lg">{platform.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">
                  {platform.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {platform.example}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 提示：支持大部分主流视频平台和音频直链，系统会自动识别并下载最佳质量的音频。处理时间取决于视频长度和网络速度。
          </p>
        </div>
      </div>
    </div>
  )
}

export default UrlInput