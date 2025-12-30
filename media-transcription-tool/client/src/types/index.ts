// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp?: string
}

// File Upload Types
export interface UploadedFile {
  id: string
  filename: string
  originalName: string
  size: number
  mimetype: string
  path: string
}

// Job Types
export interface TranscriptionJob {
  id: string
  type: 'file' | 'url'
  source: string
  originalName?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  options?: TranscriptionOptions
  result?: TranscriptionResult
  errorMessage?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface TranscriptionOptions {
  language?: string
  model?: 'tiny' | 'base' | 'small' | 'medium' | 'large'
  includeTimestamps?: boolean
  wordTimestamps?: boolean
  temperature?: number
}

export interface TranscriptionResult {
  text: string
  language: string
  confidence: number
  segments: TranscriptionSegment[]
  duration?: number
}

export interface TranscriptionSegment {
  id: number
  start: number
  end: number
  text: string
  confidence?: number
  words?: TranscriptionWord[]
}

export interface TranscriptionWord {
  word: string
  start: number
  end: number
  confidence: number
}

// Audio Quality and Enhancement Types
export interface AudioQualityInfo {
  snr?: number // 信噪比
  dynamicRange?: number // 动态范围
  peakLevel?: number // 峰值电平
  rmsLevel?: number // RMS电平
  clipping?: boolean // 是否有削波
  silenceRatio?: number // 静音比例
  spectralCentroid?: number // 频谱重心
  spectralRolloff?: number // 频谱滚降
  zeroCrossingRate?: number // 过零率
  mfcc?: number[] // MFCC特征
  qualityScore?: number // 综合质量评分 (0-100)
  recommendations?: string[] // 改进建议
}

export interface AudioEnhancementResult {
  originalPath: string
  enhancedPath: string
  improvements: string[]
  qualityBefore?: AudioQualityInfo
  qualityAfter?: AudioQualityInfo
  processingTime: number
  qualityImprovement?: number
}

export interface EqualizerSettings {
  lowGain?: number // 低频增益 (-20 to 20 dB)
  midGain?: number // 中频增益 (-20 to 20 dB)  
  highGain?: number // 高频增益 (-20 to 20 dB)
  lowFreq?: number // 低频截止频率 (Hz)
  midFreq?: number // 中频中心频率 (Hz)
  highFreq?: number // 高频截止频率 (Hz)
}

export interface AudioProcessingOptions {
  noiseReduction?: boolean
  volumeNormalization?: boolean
  enhanceAudio?: boolean
  analyzeQuality?: boolean
  compressor?: boolean
  equalizer?: EqualizerSettings
  targetSampleRate?: number
  targetChannels?: number
  targetBitrate?: number
}

export interface MediaProcessingResult {
  id: string
  audioPath?: string
  qualityAnalysis?: AudioQualityInfo
  enhancements?: string[]
  processingTime: number
  metadata: {
    duration?: number
    format?: string
    codec?: string
    sampleRate?: number
    channels?: number
    fileSize?: number
  }
}

export interface AudioCapabilities {
  formats: string[]
  enhancements: string[]
  qualityMetrics: string[]
  maxFileSize: number
}

// Progress Types
export interface ProgressUpdate {
  jobId: string
  progress: number
  message: string
  timestamp: string
}

export interface JobCompleted {
  jobId: string
  result: TranscriptionResult
  timestamp: string
}

export interface JobError {
  jobId: string
  error: {
    message: string
    code: string
  }
  timestamp: string
}

// Export Types
export interface ExportOptions {
  format: 'txt' | 'srt' | 'vtt' | 'docx' | 'pdf'
  includeTimestamps?: boolean
  includeConfidence?: boolean
  template?: string
}

export interface ExportResult {
  format: string
  downloadUrl: string
  filename?: string
}

// URL Processing Types
export interface UrlInfo {
  url: string
  title?: string
  duration?: number
  thumbnail?: string
  platform?: 'youtube' | 'bilibili' | 'vimeo' | 'other'
  formats?: MediaFormat[]
}

export interface MediaFormat {
  format: string
  quality: string
  size?: number
  codec?: string
}

// UI State Types
export interface AppState {
  currentJob?: TranscriptionJob
  jobs: TranscriptionJob[]
  isLoading: boolean
  error?: string
}

// Form Types
export interface UrlSubmission {
  url: string
  options?: TranscriptionOptions
}

export interface FileSubmission {
  files: File[]
  options?: TranscriptionOptions
}