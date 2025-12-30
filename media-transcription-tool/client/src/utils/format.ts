// Format file size in bytes to human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format duration in seconds to human readable format
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.round(seconds % 60)
    
    let result = `${hours}小时`
    if (minutes > 0) result += `${minutes}分`
    if (remainingSeconds > 0) result += `${remainingSeconds}秒`
    
    return result
  }
}

// Format timestamp for display
export function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Less than 1 minute
  if (diff < 60000) {
    return '刚刚'
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
  
  // Format as date
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format confidence score as percentage
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

// Format progress percentage
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`
}

// Format time in seconds to MM:SS or HH:MM:SS format
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Check if file is video format
export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v']
  const extension = getFileExtension(filename)
  return videoExtensions.includes(extension)
}

// Check if file is audio format
export function isAudioFile(filename: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'm4a', 'flac', 'aac', 'ogg', 'wma']
  const extension = getFileExtension(filename)
  return audioExtensions.includes(extension)
}

// Get media type from filename
export function getMediaType(filename: string): 'video' | 'audio' | 'unknown' {
  if (isVideoFile(filename)) return 'video'
  if (isAudioFile(filename)) return 'audio'
  return 'unknown'
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Extract platform from URL
export function extractPlatform(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'YouTube'
    } else if (hostname.includes('bilibili.com')) {
      return 'Bilibili'
    } else if (hostname.includes('vimeo.com')) {
      return 'Vimeo'
    } else {
      return '其他平台'
    }
  } catch {
    return '未知'
  }
}