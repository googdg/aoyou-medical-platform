import React from 'react'
import { Loader } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-8 h-8'
      default:
        return 'w-6 h-6'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'lg':
        return 'text-base'
      default:
        return 'text-sm'
    }
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader className={`${getSizeClasses()} text-blue-500 animate-spin`} />
      {text && (
        <span className={`${getTextSize()} text-gray-600`}>
          {text}
        </span>
      )}
    </div>
  )
}

export default LoadingSpinner