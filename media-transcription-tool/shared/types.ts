// 共享类型定义

export interface MediaMetadata {
  format: string
  duration: number
  bitrate: number
  sampleRate: number
  channels: number
  language?: string
}

export interface UploadResult {
  uploadId: string
  filename: string
  fileSize: number
  mimeType: string
  duration?: number
  metadata: MediaMetadata
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ProgressInfo {
  uploadId: string
  progress: number
  stage: ProcessingStage
  estimatedTime?: number
  currentText?: string
}

export type ProcessingStage = 
  | 'uploading'
  | 'validating'
  | 'extracting_audio'
  | 'enhancing_audio'
  | 'transcribing'
  | 'post_processing'
  | 'completed'
  | 'error'

export interface AudioExtractionResult {
  audioPath: string
  duration: number
  format: string
  quality: AudioQuality
}

export type AudioQuality = 'low' | 'medium' | 'high' | 'very_high'

export interface AudioEnhanceOptions {
  noiseReduction: boolean
  volumeNormalization: boolean
  speechEnhancement: boolean
}

export interface DownloadResult {
  filePath: string
  originalUrl: string
  title: string
  duration: number
  format: string
}

export interface TranscriptionOptions {
  language?: string
  model: WhisperModel
  includeTimestamps: boolean
  wordLevelTimestamps: boolean
  initialPrompt?: string
}

export type WhisperModel = 'tiny' | 'base' | 'small' | 'medium' | 'large'

export interface TranscriptionResult {
  jobId: string
  text: string
  segments: TranscriptionSegment[]
  language: string
  confidence: number
  processingTime: number
}

export interface TranscriptionSegment {
  id: number
  start: number
  end: number
  text: string
  confidence: number
  words?: WordTimestamp[]
}

export interface WordTimestamp {
  word: string
  start: number
  end: number
  confidence: number
}

export interface Job {
  id: string
  type: JobType
  status: JobStatus
  progress: number
  data: JobData
  result?: any
  error?: string
  createdAt: Date
  updatedAt: Date
}

export type JobType = 'upload' | 'extract_audio' | 'transcribe' | 'export'

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'cancelled'

export interface JobData {
  [key: string]: any
}

export interface QueueStats {
  waiting: number
  active: number
  completed: number
  failed: number
}

export type ExportFormat = 'txt' | 'srt' | 'vtt' | 'docx' | 'pdf' | 'json'

export type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'ssa'

export interface ExportResult {
  filename: string
  content: string | Buffer
  mimeType: string
  size: number
}

export interface DocumentTemplate {
  includeTimestamps: boolean
  includeConfidence: boolean
  formatting: DocumentFormatting
}

export interface DocumentFormatting {
  fontSize: number
  fontFamily: string
  lineSpacing: number
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// WebSocket事件类型
export interface SocketEvents {
  progress: ProgressInfo
  error: {
    jobId: string
    code: string
    message: string
    retryable: boolean
  }
  completed: {
    jobId: string
    result: TranscriptionResult
  }
}

// 错误类型
export interface ProcessingError {
  code: string
  message: string
  retryable: boolean
  suggestions?: string[]
}

// 支持的媒体格式
export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/flv',
  'video/webm',
  'video/mkv'
] as const

export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mp3',
  'audio/wav',
  'audio/m4a',
  'audio/flac',
  'audio/aac',
  'audio/ogg',
  'audio/wma'
] as const

// 支持的语言
export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: '自动检测' },
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' }
] as const

// 支持的视频平台
export const SUPPORTED_PLATFORMS = [
  'youtube.com',
  'youtu.be',
  'bilibili.com',
  'vimeo.com',
  'dailymotion.com'
] as const