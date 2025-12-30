import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  ApiResponse, 
  UploadedFile, 
  TranscriptionJob, 
  TranscriptionOptions,
  ExportOptions,
  ExportResult,
  UrlInfo 
} from '../types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('API Response Error:', error)
        
        // Handle common errors
        if (error.response?.status === 429) {
          throw new Error('请求过于频繁，请稍后再试')
        } else if (error.response?.status >= 500) {
          throw new Error('服务器错误，请稍后再试')
        } else if (error.code === 'NETWORK_ERROR') {
          throw new Error('网络连接错误，请检查网络设置')
        }
        
        throw error
      }
    )
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.client.get<ApiResponse>('/health')
    return response.data.data
  }

  // File upload with progress tracking
  async uploadFile(
    file: File,
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
  ): Promise<UploadedFile> {
    const formData = new FormData()
    formData.append('file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            }
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300 && response.success) {
            resolve(response.data)
          } else {
            reject(new Error(response.error?.message || `Upload failed: ${xhr.status}`))
          }
        } catch (error) {
          reject(new Error('Invalid response format'))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'))
      })

      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
      xhr.open('POST', `${baseURL}/upload/file`)
      xhr.timeout = 5 * 60 * 1000 // 5 minutes timeout
      xhr.send(formData)
    })
  }

  // Get file information
  async getFileInfo(fileId: string): Promise<UploadedFile> {
    const response = await this.client.get<ApiResponse<UploadedFile>>(`/upload/file/${fileId}`)

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get file info')
    }

    return response.data.data
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse>(`/upload/file/${fileId}`)

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete file')
    }
  }

  // Get supported platforms and formats
  async getSupportedPlatforms(): Promise<{
    platforms: string[]
    formats: { video: string[]; audio: string[] }
  }> {
    const response = await this.client.get<ApiResponse<{
      platforms: string[]
      formats: { video: string[]; audio: string[] }
    }>>('/upload/platforms')

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get supported platforms')
    }

    return response.data.data
  }

  // Validate file before upload
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `文件大小超过限制 (${Math.round(maxSize / 1024 / 1024)}MB)`
      }
    }

    // Check file type
    const allowedTypes = [
      // Video types
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
      'video/mkv', 'video/webm', 'video/m4v', 'video/quicktime',
      'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska',
      // Audio types
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/flac',
      'audio/aac', 'audio/ogg', 'audio/wma', 'audio/x-wav', 'audio/x-m4a'
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `不支持的文件格式: ${file.type}`
      }
    }

    return { isValid: true }
  }

  // Validate URL
  validateUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url)
      
      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          error: '仅支持 HTTP 和 HTTPS 协议'
        }
      }

      // Check if it's a supported platform or direct media link
      const supportedDomains = [
        'youtube.com', 'youtu.be', 'bilibili.com', 'vimeo.com',
        'tiktok.com', 'twitter.com', 'x.com', 'instagram.com'
      ]
      
      const isDirectMedia = /\.(mp4|avi|mov|mkv|webm|flv|wmv|m4v|mp3|wav|m4a|flac|aac|ogg|wma)$/i.test(url)
      const isSupportedPlatform = supportedDomains.some(domain => 
        urlObj.hostname.toLowerCase().includes(domain)
      )

      if (!isSupportedPlatform && !isDirectMedia) {
        return {
          isValid: false,
          error: '不支持的平台或链接格式'
        }
      }

      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        error: '无效的URL格式'
      }
    }
  }

  // Get URL information
  async getUrlInfo(url: string): Promise<UrlInfo> {
    const response = await this.client.post<ApiResponse<UrlInfo>>('/upload/url/info', {
      url
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get URL info')
    }

    return response.data.data
  }

  // URL processing
  async processUrl(
    url: string, 
    options?: {
      audioOnly?: boolean
      quality?: 'best' | 'worst' | 'bestaudio' | 'worstaudio'
      maxDuration?: number
    }
  ): Promise<UrlInfo> {
    const response = await this.client.post<ApiResponse<UrlInfo>>('/upload/url', {
      url,
      options
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'URL processing failed')
    }

    return response.data.data
  }

  // Start transcription
  async startTranscription(fileId: string, options?: TranscriptionOptions): Promise<TranscriptionJob> {
    const response = await this.client.post<ApiResponse<TranscriptionJob>>('/transcription/start', {
      fileId,
      options
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to start transcription')
    }

    return response.data.data
  }

  // Get transcription status
  async getTranscriptionStatus(jobId: string): Promise<TranscriptionJob> {
    const response = await this.client.get<ApiResponse<TranscriptionJob>>(`/transcription/status/${jobId}`)

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get transcription status')
    }

    return response.data.data
  }

  // Get transcription result
  async getTranscriptionResult(jobId: string): Promise<TranscriptionJob> {
    const response = await this.client.get<ApiResponse<TranscriptionJob>>(`/transcription/result/${jobId}`)

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get transcription result')
    }

    return response.data.data
  }

  // Cancel transcription
  async cancelTranscription(jobId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse>(`/transcription/${jobId}`)

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to cancel transcription')
    }
  }

  // Export transcription
  async exportTranscription(jobId: string, options: ExportOptions): Promise<ExportResult> {
    const endpoint = `/export/${options.format}`
    const response = await this.client.post<ApiResponse<ExportResult>>(endpoint, {
      jobId,
      options
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Export failed')
    }

    return response.data.data
  }

  // Download exported file
  async downloadFile(filename: string): Promise<Blob> {
    const response = await this.client.get(`/export/download/${filename}`, {
      responseType: 'blob'
    })

    return response.data
  }

  // Media processing endpoints
  
  // Process media file
  async processMedia(
    fileId: string,
    options?: {
      extractAudio?: boolean
      audioFormat?: 'wav' | 'mp3' | 'flac' | 'm4a'
      audioQuality?: number
      enhanceAudio?: boolean
      analyzeQuality?: boolean
      enhancementOptions?: {
        noiseReduction?: boolean
        normalize?: boolean
        compressor?: boolean
        equalizer?: boolean
        speechEnhancement?: boolean
      }
    }
  ): Promise<any> {
    const response = await this.client.post<ApiResponse>('/media/process', {
      fileId,
      ...options
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Media processing failed')
    }

    return response.data.data
  }

  // Analyze audio quality
  async analyzeAudioQuality(fileId: string): Promise<{
    fileId: string
    audioPath: string
    qualityAnalysis: AudioQualityInfo
    analysisTime: number
  }> {
    const response = await this.client.post<ApiResponse<{
      fileId: string
      audioPath: string
      qualityAnalysis: AudioQualityInfo
      analysisTime: number
    }>>('/media/quality-analysis', { fileId })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Audio analysis failed')
    }

    return response.data.data
  }

  // Enhance audio
  async enhanceAudio(
    fileId: string,
    enhancementOptions?: {
      noiseReduction?: boolean
      volumeNormalization?: boolean
      enhanceAudio?: boolean
      analyzeQuality?: boolean
      compressor?: boolean
      equalizer?: {
        lowGain?: number
        midGain?: number
        highGain?: number
        lowFreq?: number
        midFreq?: number
        highFreq?: number
      }
    }
  ): Promise<AudioEnhancementResult> {
    const response = await this.client.post<ApiResponse<AudioEnhancementResult>>('/media/enhance', {
      fileId,
      enhancementOptions
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Audio enhancement failed')
    }

    return response.data.data
  }

  // Batch enhance audio
  async batchEnhanceAudio(
    fileIds: string[],
    enhancementOptions?: {
      noiseReduction?: boolean
      volumeNormalization?: boolean
      enhanceAudio?: boolean
      analyzeQuality?: boolean
    }
  ): Promise<{
    results: Array<{
      fileId: string
      success: boolean
      data?: {
        enhancedPath: string
        improvements: string[]
        qualityImprovement?: number
        processingTime: number
      }
      error?: string
    }>
    summary: {
      total: number
      successful: number
      failed: number
      totalProcessingTime: number
    }
  }> {
    const response = await this.client.post<ApiResponse<{
      results: Array<{
        fileId: string
        success: boolean
        data?: {
          enhancedPath: string
          improvements: string[]
          qualityImprovement?: number
          processingTime: number
        }
        error?: string
      }>
      summary: {
        total: number
        successful: number
        failed: number
        totalProcessingTime: number
      }
    }>>('/media/batch-enhance', {
      fileIds,
      enhancementOptions
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Batch audio enhancement failed')
    }

    return response.data.data
  }

  // Get audio processing capabilities
  async getAudioCapabilities(): Promise<{
    formats: string[]
    enhancements: string[]
    qualityMetrics: string[]
    maxFileSize: number
  }> {
    const response = await this.client.get<ApiResponse<{
      formats: string[]
      enhancements: string[]
      qualityMetrics: string[]
      maxFileSize: number
    }>>('/media/audio-capabilities')

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get audio capabilities')
    }

    return response.data.data
  }

  // Get media processing capabilities
  async getMediaCapabilities(): Promise<any> {
    const response = await this.client.get<ApiResponse>('/media/capabilities')

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get media capabilities')
    }

    return response.data.data
  }

  // Get detailed media info
  async getDetailedMediaInfo(fileId: string): Promise<any> {
    const response = await this.client.get<ApiResponse>(`/media/info/${fileId}`)

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get media info')
    }

    return response.data.data
  }
}

// Create singleton instance
export const apiClient = new ApiClient()
export default apiClient