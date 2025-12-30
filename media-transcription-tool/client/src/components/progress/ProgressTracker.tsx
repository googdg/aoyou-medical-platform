import React from 'react'
import { CheckCircle, Clock, AlertCircle, Loader, Play, Pause } from 'lucide-react'
import { formatProgress, formatDuration, formatTimestamp } from '../../utils/format'
import { TranscriptionJob } from '../../types'

interface ProgressTrackerProps {
  job: TranscriptionJob
  onCancel?: () => void
  onRetry?: () => void
  className?: string
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  job,
  onCancel,
  onRetry,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      case 'cancelled':
        return <Pause className="w-6 h-6 text-gray-500" />
      case 'processing':
        return <Loader className="w-6 h-6 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (job.status) {
      case 'pending':
        return '等待处理'
      case 'processing':
        return '正在处理'
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

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getProgressStages = () => {
    const stages = [
      { name: '准备中', progress: 0 },
      { name: '音频提取', progress: 20 },
      { name: '语音识别', progress: 60 },
      { name: '文本处理', progress: 90 },
      { name: '完成', progress: 100 }
    ]

    return stages.map(stage => ({
      ...stage,
      isActive: job.progress >= stage.progress,
      isCurrent: job.progress >= stage.progress && job.progress < (stages[stages.indexOf(stage) + 1]?.progress || 100)
    }))
  }

  const estimateTimeRemaining = () => {
    if (job.status !== 'processing' || job.progress <= 0) return null
    
    const elapsed = new Date().getTime() - new Date(job.createdAt).getTime()
    const rate = job.progress / elapsed
    const remaining = (100 - job.progress) / rate
    
    return Math.max(0, remaining)
  }

  const timeRemaining = estimateTimeRemaining()

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {job.originalName || '转录任务'}
            </h3>
            <p className="text-sm text-gray-500">
              {getStatusText()} • {formatTimestamp(job.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {job.status === 'processing' && onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              取消
            </button>
          )}
          {job.status === 'failed' && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              重试
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(job.status === 'processing' || job.status === 'completed') && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              处理进度
            </span>
            <span className="text-sm text-gray-500">
              {formatProgress(job.progress)}
            </span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          
          {timeRemaining && (
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>预计剩余时间</span>
              <span>{formatDuration(timeRemaining / 1000)}</span>
            </div>
          )}
        </div>
      )}

      {/* Processing Stages */}
      {job.status === 'processing' && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            处理阶段
          </h4>
          
          <div className="space-y-2">
            {getProgressStages().map((stage, index) => (
              <div
                key={stage.name}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  stage.isCurrent 
                    ? 'bg-blue-50 border border-blue-200' 
                    : stage.isActive 
                      ? 'bg-green-50' 
                      : 'bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  stage.isActive 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {stage.isActive ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                <span className={`text-sm ${
                  stage.isCurrent 
                    ? 'text-blue-700 font-medium' 
                    : stage.isActive 
                      ? 'text-green-700' 
                      : 'text-gray-500'
                }`}>
                  {stage.name}
                </span>
                
                {stage.isCurrent && (
                  <Loader className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {getStatusText()}
            </p>
            {job.errorMessage && (
              <p className="text-xs mt-1 opacity-75">
                {job.errorMessage}
              </p>
            )}
            {job.status === 'completed' && job.result && (
              <div className="text-xs mt-1 space-y-1">
                <p>语言: {job.result.language === 'zh' ? '中文' : '英文'}</p>
                <p>置信度: {Math.round(job.result.confidence * 100)}%</p>
                {job.result.duration && (
                  <p>时长: {formatDuration(job.result.duration)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">任务ID:</span>
            <span className="ml-1 font-mono">{job.id.slice(-8)}</span>
          </div>
          <div>
            <span className="font-medium">类型:</span>
            <span className="ml-1">{job.type === 'file' ? '文件上传' : '在线链接'}</span>
          </div>
          <div>
            <span className="font-medium">创建时间:</span>
            <span className="ml-1">{formatTimestamp(job.createdAt)}</span>
          </div>
          {job.completedAt && (
            <div>
              <span className="font-medium">完成时间:</span>
              <span className="ml-1">{formatTimestamp(job.completedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressTracker