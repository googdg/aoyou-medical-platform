import ytdl from 'ytdl-core'
import youtubeDl from 'youtube-dl-exec'
import axios from 'axios'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger'

export interface UrlInfo {
  url: string
  title?: string
  duration?: number
  thumbnail?: string
  platform: string
  quality?: string
  description?: string
  uploader?: string
  uploadDate?: string
  viewCount?: number
  formats?: MediaFormat[]
}

export interface MediaFormat {
  formatId: string
  ext: string
  quality: string
  filesize?: number
  acodec?: string
  vcodec?: string
  abr?: number
  vbr?: number
}

export interface UrlProcessingOptions {
  audioOnly?: boolean
  quality?: 'best' | 'worst' | 'bestaudio' | 'worstaudio'
  maxDuration?: number
  format?: string
}

export interface ProcessedMedia {
  id: string
  originalUrl: string
  title: string
  filePath: string
  audioPath?: string
  duration?: number
  size: number
  format: string
  platform: string
  createdAt: Date
}

class UrlProcessorService {
  private downloadDir: string
  private audioDir: string

  constructor() {
    this.downloadDir = process.env.DOWNLOAD_DIR || './downloads'
    this.audioDir = process.env.AUDIO_DIR || './downloads/audio'
    this.ensureDirectories()
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.downloadDir, { recursive: true })
      await fs.mkdir(this.audioDir, { recursive: true })
      logger.info('Download directories ensured')
    } catch (error) {
      logger.error('Failed to create download directories:', error)
      throw error
    }
  }

  /**
   * 检测URL所属的平台
   */
  detectPlatform(url: string): string {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()

      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return 'youtube'
      } else if (hostname.includes('bilibili.com')) {
        return 'bilibili'
      } else if (hostname.includes('vimeo.com')) {
        return 'vimeo'
      } else if (hostname.includes('tiktok.com')) {
        return 'tiktok'
      } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        return 'twitter'
      } else if (hostname.includes('instagram.com')) {
        return 'instagram'
      } else if (this.isDirectMediaUrl(url)) {
        return 'direct'
      } else {
        return 'generic'
      }
    } catch (error) {
      logger.error('Failed to detect platform:', error)
      return 'unknown'
    }
  }

  /**
   * 检查是否为直接媒体链接
   */
  private isDirectMediaUrl(url: string): boolean {
    const mediaExtensions = [
      '.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v',
      '.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.wma'
    ]
    return mediaExtensions.some(ext => url.toLowerCase().includes(ext))
  }

  /**
   * 验证URL格式和支持性
   */
  validateUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url)
      
      // 检查协议
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          error: '仅支持 HTTP 和 HTTPS 协议'
        }
      }

      const platform = this.detectPlatform(url)
      const supportedPlatforms = [
        'youtube', 'bilibili', 'vimeo', 'tiktok', 
        'twitter', 'instagram', 'direct', 'generic'
      ]

      if (!supportedPlatforms.includes(platform)) {
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

  /**
   * 获取URL信息
   */
  async getUrlInfo(url: string): Promise<UrlInfo> {
    const platform = this.detectPlatform(url)
    
    try {
      logger.info(`Getting info for ${platform} URL: ${url}`)
      
      switch (platform) {
        case 'youtube':
          return await this.getYouTubeInfo(url)
        case 'bilibili':
        case 'vimeo':
        case 'tiktok':
        case 'twitter':
        case 'instagram':
          return await this.getGenericInfo(url)
        case 'direct':
          return await this.getDirectMediaInfo(url)
        default:
          return await this.getGenericInfo(url)
      }
    } catch (error) {
      logger.error(`Failed to get URL info for ${url}:`, error)
      throw new Error(`无法获取链接信息: ${error.message}`)
    }
  }

  /**
   * 获取YouTube视频信息
   */
  private async getYouTubeInfo(url: string): Promise<UrlInfo> {
    try {
      // 使用ytdl-core获取基本信息
      const info = await ytdl.getInfo(url)
      const videoDetails = info.videoDetails

      // 获取可用格式
      const formats: MediaFormat[] = info.formats.map(format => ({
        formatId: format.itag.toString(),
        ext: format.container || 'unknown',
        quality: format.qualityLabel || format.quality || 'unknown',
        filesize: format.contentLength ? parseInt(format.contentLength) : undefined,
        acodec: format.audioCodec,
        vcodec: format.videoCodec,
        abr: format.audioBitrate,
        vbr: format.bitrate
      }))

      return {
        url,
        title: videoDetails.title,
        duration: parseInt(videoDetails.lengthSeconds),
        thumbnail: videoDetails.thumbnails?.[0]?.url,
        platform: 'youtube',
        description: videoDetails.description,
        uploader: videoDetails.author?.name,
        uploadDate: videoDetails.publishDate,
        viewCount: parseInt(videoDetails.viewCount),
        formats
      }
    } catch (error) {
      logger.error('YouTube info extraction failed:', error)
      throw new Error(`YouTube信息获取失败: ${error.message}`)
    }
  }

  /**
   * 获取通用平台信息（使用youtube-dl）
   */
  private async getGenericInfo(url: string): Promise<UrlInfo> {
    try {
      const info = await youtubeDl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]
      })

      const formats: MediaFormat[] = info.formats?.map((format: any) => ({
        formatId: format.format_id,
        ext: format.ext,
        quality: format.quality || format.height?.toString() || 'unknown',
        filesize: format.filesize,
        acodec: format.acodec,
        vcodec: format.vcodec,
        abr: format.abr,
        vbr: format.vbr
      })) || []

      return {
        url,
        title: info.title || 'Unknown Title',
        duration: info.duration,
        thumbnail: info.thumbnail,
        platform: this.detectPlatform(url),
        description: info.description,
        uploader: info.uploader,
        uploadDate: info.upload_date,
        viewCount: info.view_count,
        formats
      }
    } catch (error) {
      logger.error('Generic info extraction failed:', error)
      throw new Error(`信息获取失败: ${error.message}`)
    }
  }

  /**
   * 获取直接媒体链接信息
   */
  private async getDirectMediaInfo(url: string): Promise<UrlInfo> {
    try {
      const response = await axios.head(url, { timeout: 10000 })
      const contentType = response.headers['content-type'] || ''
      const contentLength = response.headers['content-length']
      
      return {
        url,
        title: path.basename(url),
        platform: 'direct',
        formats: [{
          formatId: 'direct',
          ext: path.extname(url).slice(1) || 'unknown',
          quality: 'original',
          filesize: contentLength ? parseInt(contentLength) : undefined,
          acodec: contentType.startsWith('audio/') ? 'unknown' : undefined,
          vcodec: contentType.startsWith('video/') ? 'unknown' : undefined
        }]
      }
    } catch (error) {
      logger.error('Direct media info extraction failed:', error)
      throw new Error(`直链媒体信息获取失败: ${error.message}`)
    }
  }

  /**
   * 处理URL并下载媒体
   */
  async processUrl(
    url: string,
    options: UrlProcessingOptions = {}
  ): Promise<ProcessedMedia> {
    const platform = this.detectPlatform(url)
    const mediaId = uuidv4()
    
    try {
      logger.info(`Processing ${platform} URL: ${url}`)
      
      // 获取媒体信息
      const urlInfo = await this.getUrlInfo(url)
      
      let downloadedPath: string
      
      switch (platform) {
        case 'youtube':
          downloadedPath = await this.downloadYouTube(url, mediaId, options)
          break
        case 'direct':
          downloadedPath = await this.downloadDirect(url, mediaId)
          break
        default:
          downloadedPath = await this.downloadGeneric(url, mediaId, options)
      }

      // 获取文件信息
      const stats = await fs.stat(downloadedPath)
      
      const processedMedia: ProcessedMedia = {
        id: mediaId,
        originalUrl: url,
        title: urlInfo.title || 'Unknown Title',
        filePath: downloadedPath,
        duration: urlInfo.duration,
        size: stats.size,
        format: path.extname(downloadedPath).slice(1),
        platform,
        createdAt: new Date()
      }

      // 如果需要音频，提取音频文件
      if (options.audioOnly || !this.isAudioFile(downloadedPath)) {
        const audioPath = await this.extractAudio(downloadedPath, mediaId)
        processedMedia.audioPath = audioPath
      } else {
        processedMedia.audioPath = downloadedPath
      }

      logger.info(`URL processed successfully: ${mediaId}`)
      return processedMedia
      
    } catch (error) {
      logger.error(`Failed to process URL ${url}:`, error)
      throw error
    }
  }

  /**
   * 下载YouTube视频
   */
  private async downloadYouTube(
    url: string,
    mediaId: string,
    options: UrlProcessingOptions
  ): Promise<string> {
    const outputPath = path.join(this.downloadDir, `${mediaId}_youtube`)
    
    try {
      if (options.audioOnly) {
        // 下载音频
        const audioStream = ytdl(url, {
          quality: 'highestaudio',
          filter: 'audioonly'
        })
        
        const audioPath = `${outputPath}.m4a`
        const writeStream = require('fs').createWriteStream(audioPath)
        
        return new Promise((resolve, reject) => {
          audioStream.pipe(writeStream)
          audioStream.on('error', reject)
          writeStream.on('finish', () => resolve(audioPath))
          writeStream.on('error', reject)
        })
      } else {
        // 下载视频
        const videoStream = ytdl(url, {
          quality: options.quality === 'best' ? 'highest' : 'lowest'
        })
        
        const videoPath = `${outputPath}.mp4`
        const writeStream = require('fs').createWriteStream(videoPath)
        
        return new Promise((resolve, reject) => {
          videoStream.pipe(writeStream)
          videoStream.on('error', reject)
          writeStream.on('finish', () => resolve(videoPath))
          writeStream.on('error', reject)
        })
      }
    } catch (error) {
      throw new Error(`YouTube下载失败: ${error.message}`)
    }
  }

  /**
   * 下载通用平台媒体
   */
  private async downloadGeneric(
    url: string,
    mediaId: string,
    options: UrlProcessingOptions
  ): Promise<string> {
    const outputTemplate = path.join(this.downloadDir, `${mediaId}_%(title)s.%(ext)s`)
    
    try {
      const downloadOptions: any = {
        output: outputTemplate,
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]
      }

      if (options.audioOnly) {
        downloadOptions.extractAudio = true
        downloadOptions.audioFormat = 'mp3'
        downloadOptions.audioQuality = '192K'
      } else {
        downloadOptions.format = options.quality || 'best'
      }

      if (options.maxDuration) {
        downloadOptions.matchFilter = `duration < ${options.maxDuration}`
      }

      await youtubeDl(url, downloadOptions)
      
      // 查找下载的文件
      const files = await fs.readdir(this.downloadDir)
      const downloadedFile = files.find(file => file.startsWith(mediaId))
      
      if (!downloadedFile) {
        throw new Error('Downloaded file not found')
      }
      
      return path.join(this.downloadDir, downloadedFile)
    } catch (error) {
      throw new Error(`下载失败: ${error.message}`)
    }
  }

  /**
   * 下载直接媒体链接
   */
  private async downloadDirect(url: string, mediaId: string): Promise<string> {
    try {
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        timeout: 30000
      })

      const extension = path.extname(url) || '.bin'
      const outputPath = path.join(this.downloadDir, `${mediaId}_direct${extension}`)
      
      const writeStream = require('fs').createWriteStream(outputPath)
      
      return new Promise((resolve, reject) => {
        response.data.pipe(writeStream)
        response.data.on('error', reject)
        writeStream.on('finish', () => resolve(outputPath))
        writeStream.on('error', reject)
      })
    } catch (error) {
      throw new Error(`直链下载失败: ${error.message}`)
    }
  }

  /**
   * 提取音频文件
   */
  private async extractAudio(videoPath: string, mediaId: string): Promise<string> {
    const ffmpeg = require('fluent-ffmpeg')
    const audioPath = path.join(this.audioDir, `${mediaId}_audio.wav`)
    
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('pcm_s16le')
        .audioFrequency(16000)
        .audioChannels(1)
        .output(audioPath)
        .on('start', (commandLine: string) => {
          logger.info(`Audio extraction started: ${commandLine}`)
        })
        .on('progress', (progress: any) => {
          logger.debug(`Audio extraction progress: ${progress.percent}%`)
        })
        .on('end', () => {
          logger.info(`Audio extracted successfully: ${audioPath}`)
          resolve(audioPath)
        })
        .on('error', (err: Error) => {
          logger.error(`Audio extraction failed: ${err.message}`)
          reject(err)
        })
        .run()
    })
  }

  /**
   * 检查是否为音频文件
   */
  private isAudioFile(filePath: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.wma']
    const ext = path.extname(filePath).toLowerCase()
    return audioExtensions.includes(ext)
  }

  /**
   * 获取支持的平台列表
   */
  getSupportedPlatforms(): string[] {
    return [
      'YouTube',
      'Bilibili',
      'Vimeo', 
      'TikTok',
      'Twitter/X',
      'Instagram',
      '直接媒体链接'
    ]
  }

  /**
   * 清理下载文件
   */
  async cleanupDownloads(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const now = Date.now()
      
      // 清理下载目录
      const downloadFiles = await fs.readdir(this.downloadDir)
      for (const file of downloadFiles) {
        const filePath = path.join(this.downloadDir, file)
        const stats = await fs.stat(filePath)
        
        if (now - stats.birthtime.getTime() > maxAge) {
          await fs.unlink(filePath)
          logger.info(`Cleaned up old download: ${file}`)
        }
      }
      
      // 清理音频目录
      const audioFiles = await fs.readdir(this.audioDir)
      for (const file of audioFiles) {
        const filePath = path.join(this.audioDir, file)
        const stats = await fs.stat(filePath)
        
        if (now - stats.birthtime.getTime() > maxAge) {
          await fs.unlink(filePath)
          logger.info(`Cleaned up old audio file: ${file}`)
        }
      }
      
      logger.info('Download cleanup completed')
    } catch (error) {
      logger.error('Failed to cleanup downloads:', error)
    }
  }

  /**
   * 删除处理的媒体文件
   */
  async deleteProcessedMedia(processedMedia: ProcessedMedia): Promise<void> {
    try {
      // 删除主文件
      await fs.unlink(processedMedia.filePath)
      logger.info(`Deleted file: ${processedMedia.filePath}`)
      
      // 删除音频文件
      if (processedMedia.audioPath && processedMedia.audioPath !== processedMedia.filePath) {
        await fs.unlink(processedMedia.audioPath)
        logger.info(`Deleted audio file: ${processedMedia.audioPath}`)
      }
    } catch (error) {
      logger.error(`Failed to delete files for ${processedMedia.id}:`, error)
      throw error
    }
  }
}

export const urlProcessor = new UrlProcessorService()