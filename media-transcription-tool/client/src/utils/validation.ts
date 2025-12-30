// File validation utilities

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

// Validate file size
export function validateFileSize(file: File, maxSizeInMB: number = 100): FileValidationResult {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `文件大小不能超过 ${maxSizeInMB}MB，当前文件大小为 ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }
  }
  
  return { isValid: true }
}

// Validate file format
export function validateFileFormat(file: File): FileValidationResult {
  const allowedFormats = [
    // Video formats
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v',
    // Audio formats
    'mp3', 'wav', 'm4a', 'flac', 'aac', 'ogg', 'wma'
  ]
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  if (!fileExtension || !allowedFormats.includes(fileExtension)) {
    return {
      isValid: false,
      error: `不支持的文件格式。支持的格式：${allowedFormats.join(', ')}`
    }
  }
  
  return { isValid: true }
}

// Validate multiple files
export function validateFiles(files: File[]): FileValidationResult {
  if (files.length === 0) {
    return {
      isValid: false,
      error: '请选择至少一个文件'
    }
  }
  
  if (files.length > 10) {
    return {
      isValid: false,
      error: '一次最多只能上传10个文件'
    }
  }
  
  for (const file of files) {
    const sizeValidation = validateFileSize(file)
    if (!sizeValidation.isValid) {
      return sizeValidation
    }
    
    const formatValidation = validateFileFormat(file)
    if (!formatValidation.isValid) {
      return formatValidation
    }
  }
  
  return { isValid: true }
}

// Validate URL
export function validateUrl(url: string): FileValidationResult {
  if (!url.trim()) {
    return {
      isValid: false,
      error: '请输入有效的URL'
    }
  }
  
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Check if it's a supported platform
    const supportedPlatforms = [
      'youtube.com',
      'youtu.be',
      'bilibili.com',
      'vimeo.com'
    ]
    
    const isSupported = supportedPlatforms.some(platform => 
      hostname.includes(platform)
    )
    
    // Also allow direct audio/video links
    const isDirectLink = /\.(mp3|wav|m4a|flac|aac|ogg|mp4|avi|mov|wmv|flv|mkv|webm)$/i.test(url)
    
    if (!isSupported && !isDirectLink) {
      return {
        isValid: false,
        error: '不支持的链接。支持 YouTube、Bilibili、Vimeo 或直链音视频文件'
      }
    }
    
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: '请输入有效的URL格式'
    }
  }
}

// Validate transcription options
export function validateTranscriptionOptions(options: any): FileValidationResult {
  if (options.temperature && (options.temperature < 0 || options.temperature > 1)) {
    return {
      isValid: false,
      error: 'Temperature 值必须在 0 到 1 之间'
    }
  }
  
  const validModels = ['tiny', 'base', 'small', 'medium', 'large']
  if (options.model && !validModels.includes(options.model)) {
    return {
      isValid: false,
      error: `无效的模型选择。支持的模型：${validModels.join(', ')}`
    }
  }
  
  return { isValid: true }
}

// Check if file is empty
export function isFileEmpty(file: File): boolean {
  return file.size === 0
}

// Check if filename is valid
export function validateFilename(filename: string): FileValidationResult {
  if (!filename.trim()) {
    return {
      isValid: false,
      error: '文件名不能为空'
    }
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(filename)) {
    return {
      isValid: false,
      error: '文件名包含无效字符'
    }
  }
  
  if (filename.length > 255) {
    return {
      isValid: false,
      error: '文件名过长（最多255个字符）'
    }
  }
  
  return { isValid: true }
}

// Validate export options
export function validateExportOptions(options: any): FileValidationResult {
  const validFormats = ['txt', 'srt', 'vtt', 'docx', 'pdf']
  
  if (!options.format || !validFormats.includes(options.format)) {
    return {
      isValid: false,
      error: `无效的导出格式。支持的格式：${validFormats.join(', ')}`
    }
  }
  
  return { isValid: true }
}