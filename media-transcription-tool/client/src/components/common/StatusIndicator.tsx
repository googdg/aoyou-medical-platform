import React from 'react'
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader, Pause } from 'lucide-react'

interface StatusIndicatorProps {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused'
  message?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: message || '处理完成'
        }
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: message || '处理失败'
        }
      case 'cancelled':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          text: message || '已取消'
        }
      case 'processing':
        return {
          icon: Loader,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: message || '处理中...',
          animate: true
        }
      case 'paused':
        return {
          icon: Pause,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: message || '已暂停'
        }
      case 'pending':
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: message || '等待处理'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: message || '就绪'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          icon: 'w-3 h-3',
          text: 'text-xs'
        }
      case 'lg':
        return {
          container: 'px-4 py-3',
          icon: 'w-6 h-6',
          text: 'text-base'
        }
      default:
        return {
          container: 'px-3 py-2',
          icon: 'w-4 h-4',
          text: 'text-sm'
        }
    }
  }

  const config = getStatusConfig()
  const sizeClasses = getSizeClasses()
  const IconComponent = config.icon

  return (
    <div className={`
      inline-flex items-center space-x-2 rounded-lg border
      ${config.bgColor} ${config.borderColor} ${sizeClasses.container}
      ${className}
    `}>
      {showIcon && (
        <IconComponent 
          className={`
            ${sizeClasses.icon} ${config.color}
            ${config.animate ? 'animate-spin' : ''}
          `} 
        />
      )}
      <span className={`font-medium ${config.color} ${sizeClasses.text}`}>
        {config.text}
      </span>
    </div>
  )
}

export default StatusIndicator