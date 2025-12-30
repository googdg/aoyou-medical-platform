import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import ffmpeg from 'fluent-ffmpeg'
import { logger } from '../utils/logger'

export interface ProcessedFile {
  id: string
  originalName: string
  fileName: string
  filePath: string
  audioPath?: string
  mimeType: string
  size: number
  duration?: number
  metadata?: MediaMetadata
  createdAt: Date
}

export interface MediaMetadata {
  duration?: number
  bitrate?: number
  format?: string
  streams?: StreamInfo[]
  width?: number
  height?: number
  fps?: number
  audioChannels?: number
  audioSampleRate?: number
  audioQuality?: AudioQualityInfo
}

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

export interface StreamInfo {
  codec: string
  type: string
  duration?: number
  bitrate?: number
  width?: number
  height?: number
  channels?: number
  sampleRate?: number
}

export interface FileProcessingOptions {
  extractAudio?: boolean
  audioFormat?: 'wav' | 'mp3' | 'flac' | 'm4a' | 'ogg'
  audioQuality?: number
  maxDuration?: number
  normalizeAudio?: boolean
  enhanceAudio?: boolean
  noiseReduction?: boolean
  volumeNormalization?: boolean
  compressor?: boolean
  equalizer?: EqualizerSettings
  analyzeQuality?: boolean
  targetSampleRate?: number
  targetChannels?: number
  targetBitrate?: number
}

export interface EqualizerSettings {
  lowGain?: number // 低频增益 (-20 to 20 dB)
  midGain?: number // 中频增益 (-20 to 20 dB)  
  highGain?: number // 高频增益 (-20 to 20 dB)
  lowFreq?: number // 低频截止频率 (Hz)
  midFreq?: number // 中频中心频率 (Hz)
  highFreq?: number // 高频截止频率 (Hz)
}

export interface AudioEnhancementResult {
  originalPath: string
  enhancedPath: string
  improvements: string[]
  qualityBefore?: AudioQualityInfo
  qualityAfter?: AudioQualityInfo
  processingTime: number
}

class FileProcessorService {
  private uploadDir: string
  private audioDir: string

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads'
    this.audioDir = process.env.AUDIO_DIR || './uploads/audio'
    this.ensureDirectories()
    this.setupFFmpegPath()
  }

  private setupFFmpegPath(): void {
    // 设置FFmpeg路径（如果需要）
    const ffmpegPath = process.env.FFMPEG_PATH
    const ffprobePath = process.env.FFPROBE_PATH
    
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath)
    }
    if (ffprobePath) {
      ffmpeg.setFfprobePath(ffprobePath)
    }
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true })
      await fs.mkdir(this.audioDir, { recursive: true })
      logger.info('Upload directories ensured')
    } catch (error) {
      logger.error('Failed to create upload directories:', error)
      throw error
    }
  }

  /**
   * 处理上传的文件
   */
  async processFile(
    file: Express.Multer.File,
    options: FileProcessingOptions = {}
  ): Promise<ProcessedFile> {
    const fileId = uuidv4()
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const fileName = `${fileId}_${timestamp}${ext}`
    const filePath = path.join(this.uploadDir, fileName)

    try {
      // 保存上传的文件
      await fs.writeFile(filePath, file.buffer)
      logger.info(`File saved: ${fileName}`)

      // 获取文件元数据
      const metadata = await this.getFileMetadata(filePath)

      const processedFile: ProcessedFile = {
        id: fileId,
        originalName: file.originalname,
        fileName,
        filePath,
        mimeType: file.mimetype,
        size: file.size,
        duration: metadata.duration,
        metadata,
        createdAt: new Date()
      }

      // 处理音频提取和增强
      if (options.extractAudio !== false) {
        if (this.isVideoFile(file.mimetype)) {
          // 从视频提取音频
          const audioPath = await this.extractAudio(filePath, fileId, options)
          processedFile.audioPath = audioPath
        } else if (this.isAudioFile(file.mimetype)) {
          // 音频文件格式转换（如果需要）
          if (options.audioFormat && !file.originalname.endsWith(`.${options.audioFormat}`)) {
            const audioPath = await this.convertAudio(filePath, fileId, options)
            processedFile.audioPath = audioPath
          } else {
            processedFile.audioPath = filePath
          }
        }

        // 音频质量分析
        if (options.analyzeQuality && processedFile.audioPath) {
          const qualityInfo = await this.analyzeAudioQuality(processedFile.audioPath)
          if (processedFile.metadata) {
            processedFile.metadata.audioQuality = qualityInfo
          }
        }

        // 音频增强处理
        if (options.enhanceAudio && processedFile.audioPath) {
          const enhancementResult = await this.enhanceAudio(processedFile.audioPath, fileId, options)
          processedFile.audioPath = enhancementResult.enhancedPath
          
          // 更新质量信息
          if (processedFile.metadata && enhancementResult.qualityAfter) {
            processedFile.metadata.audioQuality = enhancementResult.qualityAfter
          }
        }
      }

      logger.info(`File processed successfully: ${fileId}`)
      return processedFile

    } catch (error) {
      logger.error(`Failed to process file ${fileId}:`, error)
      
      // 清理失败的文件
      try {
        await fs.unlink(filePath)
      } catch (cleanupError) {
        logger.error('Failed to cleanup file on error:', cleanupError)
      }
      
      throw error
    }
  }

  /**
   * 获取文件元数据
   */
  private async getFileMetadata(filePath: string): Promise<MediaMetadata> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('Failed to get file metadata:', err)
          resolve({}) // 返回空元数据而不是失败
        } else {
          const format = metadata.format
          const videoStream = metadata.streams?.find(s => s.codec_type === 'video')
          const audioStream = metadata.streams?.find(s => s.codec_type === 'audio')

          resolve({
            duration: format?.duration,
            bitrate: format?.bit_rate ? parseInt(String(format.bit_rate)) : undefined,
            format: format?.format_name,
            width: videoStream?.width,
            height: videoStream?.height,
            fps: videoStream?.r_frame_rate ? this.parseFrameRate(videoStream.r_frame_rate) : undefined,
            audioChannels: audioStream?.channels,
            audioSampleRate: audioStream?.sample_rate,
            streams: metadata.streams?.map(stream => ({
              codec: stream.codec_name || 'unknown',
              type: stream.codec_type || 'unknown',
              duration: stream.duration ? parseFloat(stream.duration) : undefined,
              bitrate: stream.bit_rate ? parseInt(stream.bit_rate) : undefined,
              width: stream.width,
              height: stream.height,
              channels: stream.channels,
              sampleRate: stream.sample_rate
            }))
          })
        }
      })
    })
  }

  /**
   * 解析帧率字符串
   */
  private parseFrameRate(frameRate: string): number | undefined {
    try {
      if (frameRate.includes('/')) {
        const [num, den] = frameRate.split('/').map(Number)
        return den !== 0 ? num / den : undefined
      }
      return parseFloat(frameRate)
    } catch {
      return undefined
    }
  }

  /**
   * 从视频提取音频
   */
  private async extractAudio(
    videoPath: string,
    fileId: string,
    options: FileProcessingOptions
  ): Promise<string> {
    const audioFormat = options.audioFormat || 'wav'
    const audioFileName = `${fileId}_audio.${audioFormat}`
    const audioPath = path.join(this.audioDir, audioFileName)

    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath)
        .noVideo()
        .audioCodec(this.getAudioCodec(audioFormat))
        .output(audioPath)

      // 设置音频质量
      if (options.audioQuality) {
        if (audioFormat === 'mp3') {
          command = command.audioBitrate(options.audioQuality)
        } else if (audioFormat === 'wav') {
          command = command.audioFrequency(options.audioQuality)
        }
      } else {
        // 默认设置：16kHz单声道用于语音识别
        command = command
          .audioFrequency(16000)
          .audioChannels(1)
      }

      // 设置最大时长
      if (options.maxDuration) {
        command = command.duration(options.maxDuration)
      }

      // 音频标准化
      if (options.normalizeAudio) {
        command = command.audioFilters('loudnorm')
      }

      command
        .on('start', (commandLine) => {
          logger.info(`Audio extraction started: ${commandLine}`)
        })
        .on('progress', (progress) => {
          logger.debug(`Audio extraction progress: ${progress.percent}%`)
        })
        .on('end', () => {
          logger.info(`Audio extracted successfully: ${audioFileName}`)
          resolve(audioPath)
        })
        .on('error', (err) => {
          logger.error(`Audio extraction failed: ${err.message}`)
          reject(err)
        })
        .run()
    })
  }

  /**
   * 转换音频格式
   */
  private async convertAudio(
    inputPath: string,
    fileId: string,
    options: FileProcessingOptions
  ): Promise<string> {
    const audioFormat = options.audioFormat || 'wav'
    const audioFileName = `${fileId}_converted.${audioFormat}`
    const audioPath = path.join(this.audioDir, audioFileName)

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath)
        .audioCodec(this.getAudioCodec(audioFormat))
        .output(audioPath)

      // 设置音频参数
      if (options.audioQuality) {
        if (audioFormat === 'mp3') {
          command = command.audioBitrate(options.audioQuality)
        } else if (audioFormat === 'wav') {
          command = command.audioFrequency(options.audioQuality)
        }
      } else {
        // 默认设置：16kHz单声道用于语音识别
        command = command
          .audioFrequency(16000)
          .audioChannels(1)
      }

      if (options.maxDuration) {
        command = command.duration(options.maxDuration)
      }

      if (options.normalizeAudio) {
        command = command.audioFilters('loudnorm')
      }

      command
        .on('end', () => {
          logger.info(`Audio converted successfully: ${audioFileName}`)
          resolve(audioPath)
        })
        .on('error', (err) => {
          logger.error(`Audio conversion failed: ${err.message}`)
          reject(err)
        })
        .run()
    })
  }

  /**
   * 分析音频质量
   */
  async analyzeAudioQuality(audioPath: string): Promise<AudioQualityInfo> {
    try {
      logger.info(`Starting audio quality analysis: ${audioPath}`)
      
      const analysisResults = await Promise.all([
        this.analyzeAudioLevels(audioPath),
        this.analyzeSpectralFeatures(audioPath),
        this.detectSilenceAndClipping(audioPath)
      ])

      const [levels, spectral, silence] = analysisResults
      
      // 计算综合质量评分
      const qualityScore = this.calculateQualityScore({
        ...levels,
        ...spectral,
        ...silence
      })

      // 生成改进建议
      const recommendations = this.generateRecommendations({
        ...levels,
        ...spectral,
        ...silence,
        qualityScore
      })

      const qualityInfo: AudioQualityInfo = {
        ...levels,
        ...spectral,
        ...silence,
        qualityScore,
        recommendations
      }

      logger.info(`Audio quality analysis completed. Score: ${qualityScore}`)
      return qualityInfo

    } catch (error) {
      logger.error('Failed to analyze audio quality:', error)
      return {
        qualityScore: 0,
        recommendations: ['音频质量分析失败，建议检查文件格式']
      }
    }
  }

  /**
   * 分析音频电平
   */
  private async analyzeAudioLevels(audioPath: string): Promise<Partial<AudioQualityInfo>> {
    return new Promise((resolve, reject) => {
      ffmpeg(audioPath)
        .audioFilters([
          'astats=metadata=1:reset=1',
          'volumedetect'
        ])
        .format('null')
        .output('-')
        .on('stderr', (stderrLine) => {
          // 解析FFmpeg输出获取音频统计信息
          const peakMatch = stderrLine.match(/Peak level dB: ([-\d.]+)/)
          const rmsMatch = stderrLine.match(/RMS level dB: ([-\d.]+)/)
          const dynamicRangeMatch = stderrLine.match(/Dynamic range: ([\d.]+)/)
          
          if (peakMatch || rmsMatch || dynamicRangeMatch) {
            resolve({
              peakLevel: peakMatch ? parseFloat(peakMatch[1]) : undefined,
              rmsLevel: rmsMatch ? parseFloat(rmsMatch[1]) : undefined,
              dynamicRange: dynamicRangeMatch ? parseFloat(dynamicRangeMatch[1]) : undefined
            })
          }
        })
        .on('end', () => {
          // 如果没有从stderr获取到信息，返回默认值
          resolve({})
        })
        .on('error', reject)
        .run()
    })
  }

  /**
   * 分析频谱特征
   */
  private async analyzeSpectralFeatures(audioPath: string): Promise<Partial<AudioQualityInfo>> {
    return new Promise((resolve, reject) => {
      // 使用FFmpeg的spectral分析滤镜
      ffmpeg(audioPath)
        .audioFilters([
          'aresample=16000', // 重采样到16kHz进行分析
          'asplit=2[a][b]',
          '[a]showspectrumpic=s=1024x512:mode=separate:color=intensity:scale=log[spec]',
          '[b]astats=metadata=1[stats]'
        ])
        .complexFilter([
          '[spec]null[specout]',
          '[stats]anull[audioout]'
        ])
        .map('[audioout]')
        .format('null')
        .output('-')
        .on('stderr', (stderrLine) => {
          // 解析频谱分析结果
          const centroidMatch = stderrLine.match(/Spectral centroid: ([\d.]+)/)
          const rolloffMatch = stderrLine.match(/Spectral rolloff: ([\d.]+)/)
          const zcrMatch = stderrLine.match(/Zero crossing rate: ([\d.]+)/)
          
          if (centroidMatch || rolloffMatch || zcrMatch) {
            resolve({
              spectralCentroid: centroidMatch ? parseFloat(centroidMatch[1]) : undefined,
              spectralRolloff: rolloffMatch ? parseFloat(rolloffMatch[1]) : undefined,
              zeroCrossingRate: zcrMatch ? parseFloat(zcrMatch[1]) : undefined
            })
          }
        })
        .on('end', () => {
          resolve({})
        })
        .on('error', reject)
        .run()
    })
  }

  /**
   * 检测静音和削波
   */
  private async detectSilenceAndClipping(audioPath: string): Promise<Partial<AudioQualityInfo>> {
    return new Promise((resolve, reject) => {
      ffmpeg(audioPath)
        .audioFilters([
          'silencedetect=noise=-30dB:duration=0.5',
          'astats=metadata=1'
        ])
        .format('null')
        .output('-')
        .on('stderr', (stderrLine) => {
          // 解析静音检测和削波检测结果
          const silenceMatch = stderrLine.match(/silence_duration: ([\d.]+)/)
          const clippingMatch = stderrLine.match(/Clipping: (\w+)/)
          
          if (silenceMatch || clippingMatch) {
            resolve({
              silenceRatio: silenceMatch ? parseFloat(silenceMatch[1]) : undefined,
              clipping: clippingMatch ? clippingMatch[1] === 'true' : false
            })
          }
        })
        .on('end', () => {
          resolve({})
        })
        .on('error', reject)
        .run()
    })
  }

  /**
   * 计算综合质量评分
   */
  private calculateQualityScore(quality: Partial<AudioQualityInfo>): number {
    let score = 100
    
    // 根据峰值电平扣分
    if (quality.peakLevel !== undefined) {
      if (quality.peakLevel > -1) score -= 30 // 严重削波
      else if (quality.peakLevel > -3) score -= 20 // 轻微削波
      else if (quality.peakLevel < -20) score -= 10 // 电平过低
    }

    // 根据动态范围扣分
    if (quality.dynamicRange !== undefined) {
      if (quality.dynamicRange < 10) score -= 20 // 动态范围过小
      else if (quality.dynamicRange > 60) score -= 10 // 动态范围过大
    }

    // 根据静音比例扣分
    if (quality.silenceRatio !== undefined) {
      if (quality.silenceRatio > 0.3) score -= 15 // 静音过多
    }

    // 削波检测
    if (quality.clipping) {
      score -= 25
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(quality: AudioQualityInfo): string[] {
    const recommendations: string[] = []

    if (quality.qualityScore && quality.qualityScore < 60) {
      recommendations.push('音频质量较低，建议进行增强处理')
    }

    if (quality.peakLevel && quality.peakLevel > -1) {
      recommendations.push('检测到严重削波，建议降低输入增益')
    } else if (quality.peakLevel && quality.peakLevel > -3) {
      recommendations.push('检测到轻微削波，建议适当降低音量')
    }

    if (quality.peakLevel && quality.peakLevel < -20) {
      recommendations.push('音频电平过低，建议提高音量')
    }

    if (quality.dynamicRange && quality.dynamicRange < 10) {
      recommendations.push('动态范围过小，建议减少压缩处理')
    }

    if (quality.silenceRatio && quality.silenceRatio > 0.3) {
      recommendations.push('静音部分过多，建议进行静音检测和移除')
    }

    if (quality.clipping) {
      recommendations.push('检测到削波失真，建议重新录制或进行修复')
    }

    if (recommendations.length === 0) {
      recommendations.push('音频质量良好，无需特殊处理')
    }

    return recommendations
  }

  /**
   * 音频增强处理
   */
  async enhanceAudio(
    inputPath: string,
    fileId: string,
    options: FileProcessingOptions
  ): Promise<AudioEnhancementResult> {
    const startTime = Date.now()
    const enhancedFileName = `${fileId}_enhanced.${options.audioFormat || 'wav'}`
    const enhancedPath = path.join(this.audioDir, enhancedFileName)

    try {
      logger.info(`Starting audio enhancement: ${inputPath}`)

      // 分析原始音频质量
      const qualityBefore = options.analyzeQuality ? 
        await this.analyzeAudioQuality(inputPath) : undefined

      // 构建音频滤镜链
      const filters = this.buildEnhancementFilters(options, qualityBefore)
      const improvements: string[] = []

      return new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath)
          .audioCodec(this.getAudioCodec(options.audioFormat || 'wav'))

        // 应用音频滤镜
        if (filters.length > 0) {
          command = command.audioFilters(filters)
          improvements.push(...this.getImprovementDescriptions(options))
        }

        // 设置输出参数
        if (options.targetSampleRate) {
          command = command.audioFrequency(options.targetSampleRate)
        } else {
          command = command.audioFrequency(16000) // 默认16kHz用于语音识别
        }

        if (options.targetChannels) {
          command = command.audioChannels(options.targetChannels)
        } else {
          command = command.audioChannels(1) // 默认单声道
        }

        if (options.targetBitrate && options.audioFormat === 'mp3') {
          command = command.audioBitrate(options.targetBitrate)
        }

        command
          .output(enhancedPath)
          .on('start', (commandLine) => {
            logger.info(`Audio enhancement started: ${commandLine}`)
          })
          .on('progress', (progress) => {
            logger.debug(`Audio enhancement progress: ${progress.percent}%`)
          })
          .on('end', async () => {
            try {
              // 分析增强后的音频质量
              const qualityAfter = options.analyzeQuality ? 
                await this.analyzeAudioQuality(enhancedPath) : undefined

              const processingTime = Date.now() - startTime
              
              logger.info(`Audio enhancement completed in ${processingTime}ms`)
              
              resolve({
                originalPath: inputPath,
                enhancedPath,
                improvements,
                qualityBefore,
                qualityAfter,
                processingTime
              })
            } catch (error) {
              reject(error)
            }
          })
          .on('error', (err) => {
            logger.error(`Audio enhancement failed: ${err.message}`)
            reject(err)
          })
          .run()
      })

    } catch (error) {
      logger.error('Failed to enhance audio:', error)
      throw error
    }
  }

  /**
   * 构建音频增强滤镜链
   */
  private buildEnhancementFilters(
    options: FileProcessingOptions,
    qualityInfo?: AudioQualityInfo
  ): string[] {
    const filters: string[] = []

    // 噪声降低
    if (options.noiseReduction) {
      filters.push('afftdn=nf=-25') // 自适应噪声降低
    }

    // 音量标准化
    if (options.volumeNormalization || options.normalizeAudio) {
      filters.push('loudnorm=I=-16:TP=-1.5:LRA=11') // EBU R128标准化
    }

    // 压缩器
    if (options.compressor) {
      filters.push('acompressor=threshold=0.089:ratio=9:attack=200:release=1000')
    }

    // 均衡器
    if (options.equalizer) {
      const eq = options.equalizer
      const eqFilters: string[] = []
      
      if (eq.lowGain !== undefined) {
        eqFilters.push(`equalizer=f=${eq.lowFreq || 100}:width_type=h:width=200:g=${eq.lowGain}`)
      }
      if (eq.midGain !== undefined) {
        eqFilters.push(`equalizer=f=${eq.midFreq || 1000}:width_type=h:width=200:g=${eq.midGain}`)
      }
      if (eq.highGain !== undefined) {
        eqFilters.push(`equalizer=f=${eq.highFreq || 8000}:width_type=h:width=200:g=${eq.highGain}`)
      }
      
      filters.push(...eqFilters)
    }

    // 基于质量分析的自动增强
    if (qualityInfo && options.enhanceAudio) {
      // 如果检测到低频噪声，添加高通滤波器
      if (qualityInfo.spectralCentroid && qualityInfo.spectralCentroid < 500) {
        filters.push('highpass=f=80')
      }

      // 如果动态范围过小，减少压缩
      if (qualityInfo.dynamicRange && qualityInfo.dynamicRange < 15) {
        filters.push('acompressor=threshold=0.125:ratio=4:attack=5:release=50')
      }

      // 如果有削波，尝试修复
      if (qualityInfo.clipping) {
        filters.push('alimiter=level_in=1:level_out=0.9:limit=0.9')
      }
    }

    // 去除直流偏移
    filters.push('highpass=f=20')

    // 限制器（防止削波）
    filters.push('alimiter=level_in=1:level_out=0.95:limit=0.95')

    return filters
  }

  /**
   * 获取改进描述
   */
  private getImprovementDescriptions(options: FileProcessingOptions): string[] {
    const descriptions: string[] = []

    if (options.noiseReduction) {
      descriptions.push('应用了噪声降低处理')
    }
    if (options.volumeNormalization || options.normalizeAudio) {
      descriptions.push('应用了音量标准化')
    }
    if (options.compressor) {
      descriptions.push('应用了动态压缩')
    }
    if (options.equalizer) {
      descriptions.push('应用了均衡器调节')
    }
    if (options.enhanceAudio) {
      descriptions.push('应用了智能音频增强')
    }

    return descriptions
  }

  /**
   * 批量处理音频文件
   */
  async batchProcessAudio(
    filePaths: string[],
    options: FileProcessingOptions
  ): Promise<AudioEnhancementResult[]> {
    const results: AudioEnhancementResult[] = []
    
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i]
      const fileId = `batch_${Date.now()}_${i}`
      
      try {
        logger.info(`Processing batch file ${i + 1}/${filePaths.length}: ${filePath}`)
        const result = await this.enhanceAudio(filePath, fileId, options)
        results.push(result)
      } catch (error) {
        logger.error(`Failed to process batch file ${filePath}:`, error)
        // 继续处理其他文件
      }
    }
    
    return results
  }

  /**
   * 获取音频处理能力信息
   */
  getAudioCapabilities(): {
    formats: string[]
    enhancements: string[]
    qualityMetrics: string[]
    maxFileSize: number
  } {
    return {
      formats: ['wav', 'mp3', 'flac', 'm4a', 'ogg'],
      enhancements: [
        '噪声降低',
        '音量标准化', 
        '动态压缩',
        '均衡器调节',
        '智能增强',
        '削波修复',
        '静音检测'
      ],
      qualityMetrics: [
        '信噪比',
        '动态范围',
        '峰值电平',
        'RMS电平',
        '削波检测',
        '静音比例',
        '频谱分析',
        '综合评分'
      ],
      maxFileSize: 500 * 1024 * 1024 // 500MB
    }
  }
  private getAudioCodec(format: string): string {
    switch (format) {
      case 'mp3':
        return 'libmp3lame'
      case 'flac':
        return 'flac'
      case 'm4a':
        return 'aac'
      case 'wav':
      default:
        return 'pcm_s16le'
    }
  }

  /**
   * 检查是否为视频文件
   */
  private isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/')
  }

  /**
   * 检查是否为音频文件
   */
  private isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/')
  }

  /**
   * 验证文件
   */
  validateFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    // 检查文件大小 (500MB限制)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `文件大小超过限制 (${Math.round(maxSize / 1024 / 1024)}MB)`
      }
    }

    // 检查文件类型
    const allowedTypes = [
      // 视频格式
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/mkv',
      'video/webm',
      'video/m4v',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/x-matroska',
      // 音频格式
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/flac',
      'audio/aac',
      'audio/ogg',
      'audio/wma',
      'audio/x-wav',
      'audio/x-m4a'
    ]

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `不支持的文件格式: ${file.mimetype}`
      }
    }

    return { isValid: true }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(fileId: string): Promise<ProcessedFile | null> {
    try {
      const files = await fs.readdir(this.uploadDir)
      const matchingFile = files.find(file => file.startsWith(fileId))
      
      if (!matchingFile) {
        return null
      }

      const filePath = path.join(this.uploadDir, matchingFile)
      const stats = await fs.stat(filePath)
      const metadata = await this.getFileMetadata(filePath)

      return {
        id: fileId,
        originalName: matchingFile,
        fileName: matchingFile,
        filePath,
        mimeType: 'application/octet-stream', // 实际应用中应该从数据库获取
        size: stats.size,
        duration: metadata.duration,
        metadata,
        createdAt: stats.birthtime
      }
    } catch (error) {
      logger.error(`Failed to get file info for ${fileId}:`, error)
      return null
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(processedFile: ProcessedFile): Promise<void> {
    try {
      // 删除主文件
      await fs.unlink(processedFile.filePath)
      logger.info(`Deleted file: ${processedFile.fileName}`)

      // 删除音频文件（如果存在且不同于主文件）
      if (processedFile.audioPath && processedFile.audioPath !== processedFile.filePath) {
        await fs.unlink(processedFile.audioPath)
        logger.info(`Deleted audio file: ${processedFile.audioPath}`)
      }
    } catch (error) {
      logger.error(`Failed to delete files for ${processedFile.id}:`, error)
      throw error
    }
  }

  /**
   * 清理旧文件
   */
  async cleanupOldFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const now = Date.now()
      
      // 清理上传文件
      const uploadFiles = await fs.readdir(this.uploadDir)
      for (const file of uploadFiles) {
        const filePath = path.join(this.uploadDir, file)
        const stats = await fs.stat(filePath)
        
        if (now - stats.birthtime.getTime() > maxAge) {
          await fs.unlink(filePath)
          logger.info(`Cleaned up old file: ${file}`)
        }
      }

      // 清理音频文件
      const audioFiles = await fs.readdir(this.audioDir)
      for (const file of audioFiles) {
        const filePath = path.join(this.audioDir, file)
        const stats = await fs.stat(filePath)
        
        if (now - stats.birthtime.getTime() > maxAge) {
          await fs.unlink(filePath)
          logger.info(`Cleaned up old audio file: ${file}`)
        }
      }

      logger.info('File cleanup completed')
    } catch (error) {
      logger.error('Failed to cleanup old files:', error)
    }
  }

  /**
   * 获取支持的文件格式
   */
  getSupportedFormats(): { video: string[]; audio: string[] } {
    return {
      video: [
        'MP4', 'AVI', 'MOV', 'WMV', 'FLV', 
        'MKV', 'WebM', 'M4V', 'QuickTime'
      ],
      audio: [
        'MP3', 'WAV', 'M4A', 'FLAC', 
        'AAC', 'OGG', 'WMA'
      ]
    }
  }
}

export const fileProcessor = new FileProcessorService()