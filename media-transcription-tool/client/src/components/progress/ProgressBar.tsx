import React from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, Loader } from 'lucide-react'

interface ProgressBarProps {
  progress: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  message?: string
  estimatedTime?: number
  showDetails?: boolean
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  message,
  estimatedTime,
  showDetails = true,
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'failed':
      case 'cancelled':
        return 'bg-red-500'
      case 'processing':
        return 'bg-blue-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return '等待处理'
      case 'processing':
        return '处理中'
      case 'completed':
        return '处理完成'
      case 'failed':
        return '处理失败'
      case 'cancelled':
        return '已取消'
      default:
        return '未知状态'
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}秒`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return minutes > 0 ? `${hours}小时${minutes}分` : `${hours}小时`
    }
  }

  const getProgressSteps = () => [
    { name: '文件解析', threshold: 10 },
    { name: '音频提取', threshold: 30 },
    { name: '语音识别', threshold: 60 },
    { name: '结果生成', threshold: 90 }
  ]

  return (
    <div className={`w-full ${className}`}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-900">
            {getStatusText()}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ease-out ${getStatusColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-3">
          {/* Message */}
          {message && (
            <p className="text-sm text-gray-600">{message}</p>
          )}

          {/* Estimated Time */}
          {estimatedTime && status === 'processing' && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>预计剩余时间: {formatTime(estimatedTime)}</span>
            </div>
          )}

          {/* Progress Steps */}
          {status === 'processing' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {getProgressSteps().map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-1 p-2 rounded ${
                    progress >= step.threshold 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    progress >= step.threshold ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <span className="font-medium">{step.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProgressBar