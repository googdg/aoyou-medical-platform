import React from 'react'
import { CheckCircle, Clock, AlertCircle, XCircle, Loader } from 'lucide-react'

interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          text: '已完成',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'processing':
        return {
          text: '处理中',
          icon: Loader,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          animate: true
        }
      case 'failed':
        return {
          text: '失败',
          icon: AlertCircle,
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      case 'cancelled':
        return {
          text: '已取消',
          icon: XCircle,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
      default: // pending
        return {
          text: '等待中',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs'
      case 'lg':
        return 'px-4 py-2 text-base'
      default:
        return 'px-3 py-1 text-sm'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3'
      case 'lg':
        return 'w-5 h-5'
      default:
        return 'w-4 h-4'
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <span className={`
      inline-flex items-center space-x-1 font-medium rounded-full border
      ${getSizeClasses()}
      ${config.className}
      ${className}
    `}>
      {showIcon && (
        <Icon className={`
          ${getIconSize()}
          ${config.animate ? 'animate-spin' : ''}
        `} />
      )}
      <span>{config.text}</span>
    </span>
  )
}

export default StatusBadge