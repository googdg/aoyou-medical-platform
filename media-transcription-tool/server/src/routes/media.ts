import express from 'express'
import rateLimit from 'express-rate-limit'
import { mediaProcessor } from '../services/mediaProcessor'
import { fileProcessor } from '../services/fileProcessor'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = express.Router()

// 频率限制
const mediaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次媒体处理请求
  message: { 
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '媒体处理频率过高，请稍后再试'
    }
  }
})

// 处理媒体文件
router.post('/process', mediaLimiter, asyncHandler(async (req, res) => {
  const { 
    fileId, 
    extractAudio = true,
    audioFormat = 'wav',
    audioQuality,
    enhanceAudio = false,
    analyzeQuality = true,
    enhancementOptions = {}
  } = req.body

  if (!fileId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_ID',
        message: '文件ID参数缺失'
      }
    })
  }

  try {
    logger.info(`Processing media file: ${fileId}`)

    // 获取文件信息
    const fileInfo = await fileProcessor.getFileInfo(fileId)
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: '文件未找到'
        }
      })
    }

    // 处理媒体文件
    const result = await mediaProcessor.processMedia(fileInfo.filePath, {
      extractAudio,
      audioFormat,
      audioQuality,
      enhanceAudio,
      enhancementOptions,
      analyzeQuality
    })

    res.json({
      success: true,
      data: {
        id: result.id,
        processingTime: result.processingTime,
        audioPath: result.audioPath,
        qualityAnalysis: result.qualityAnalysis,
        metadata: {
          duration: result.metadata.duration,
          format: result.metadata.format,
          codec: result.metadata.codec,
          sampleRate: result.metadata.sampleRate,
          channels: result.metadata.channels,
          fileSize: result.metadata.fileSize
        },
        enhancements: result.enhancements
      }
    })

  } catch (error) {
    logger.error('Media processing error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'PROCESSING_FAILED',
        message: error instanceof Error ? error.message : '媒体处理失败'
      }
    })
  }
}))

// 分析音频质量
router.post('/analyze', mediaLimiter, asyncHandler(async (req, res) => {
  const { fileId } = req.body

  if (!fileId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_ID',
        message: '文件ID参数缺失'
      }
    })
  }

  try {
    logger.info(`Analyzing audio quality: ${fileId}`)

    // 获取文件信息
    const fileInfo = await fileProcessor.getFileInfo(fileId)
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: '文件未找到'
        }
      })
    }

    // 如果是视频文件，先提取音频
    let audioPath = fileInfo.filePath
    if (fileInfo.mimeType.startsWith('video/')) {
      const result = await mediaProcessor.processMedia(fileInfo.filePath, {
        extractAudio: true,
        audioFormat: 'wav',
        analyzeQuality: true
      })
      
      res.json({
        success: true,
        data: {
          qualityAnalysis: result.qualityAnalysis,
          audioPath: result.audioPath,
          processingTime: result.processingTime
        }
      })
    } else {
      // 直接分析音频文件
      const result = await mediaProcessor.processMedia(fileInfo.filePath, {
        extractAudio: false,
        analyzeQuality: true
      })

      res.json({
        success: true,
        data: {
          qualityAnalysis: result.qualityAnalysis,
          processingTime: result.processingTime
        }
      })
    }

  } catch (error) {
    logger.error('Audio analysis error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : '音频分析失败'
      }
    })
  }
}))

// 增强音频
router.post('/enhance', mediaLimiter, asyncHandler(async (req, res) => {
  const { 
    fileId,
    enhancementOptions = {
      noiseReduction: true,
      volumeNormalization: true,
      enhanceAudio: true,
      analyzeQuality: true
    }
  } = req.body

  if (!fileId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_ID',
        message: '文件ID参数缺失'
      }
    })
  }

  try {
    logger.info(`Enhancing audio: ${fileId}`)

    // 获取文件信息
    const fileInfo = await fileProcessor.getFileInfo(fileId)
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: '文件未找到'
        }
      })
    }

    // 确定音频路径
    let audioPath = fileInfo.audioPath || fileInfo.filePath
    
    // 如果是视频文件且没有音频路径，先提取音频
    if (fileInfo.mimeType.startsWith('video/') && !fileInfo.audioPath) {
      const extractedFile = await fileProcessor.processFile(
        { 
          originalname: fileInfo.originalName,
          mimetype: fileInfo.mimeType,
          size: fileInfo.size,
          buffer: await require('fs').promises.readFile(fileInfo.filePath)
        } as Express.Multer.File,
        { extractAudio: true, audioFormat: 'wav' }
      )
      audioPath = extractedFile.audioPath!
    }

    // 执行音频增强
    const enhancementResult = await fileProcessor.enhanceAudio(
      audioPath,
      fileId,
      enhancementOptions
    )

    res.json({
      success: true,
      data: {
        originalPath: enhancementResult.originalPath,
        enhancedPath: enhancementResult.enhancedPath,
        improvements: enhancementResult.improvements,
        qualityBefore: enhancementResult.qualityBefore,
        qualityAfter: enhancementResult.qualityAfter,
        processingTime: enhancementResult.processingTime,
        qualityImprovement: enhancementResult.qualityAfter && enhancementResult.qualityBefore
          ? (enhancementResult.qualityAfter.qualityScore || 0) - (enhancementResult.qualityBefore.qualityScore || 0)
          : undefined
      }
    })

  } catch (error) {
    logger.error('Audio enhancement error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'ENHANCEMENT_FAILED',
        message: error instanceof Error ? error.message : '音频增强失败'
      }
    })
  }
}))

// 分析音频质量（独立端点）
router.post('/quality-analysis', mediaLimiter, asyncHandler(async (req, res) => {
  const { fileId } = req.body

  if (!fileId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_ID',
        message: '文件ID参数缺失'
      }
    })
  }

  try {
    logger.info(`Analyzing audio quality: ${fileId}`)

    // 获取文件信息
    const fileInfo = await fileProcessor.getFileInfo(fileId)
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: '文件未找到'
        }
      })
    }

    // 确定音频路径
    let audioPath = fileInfo.audioPath || fileInfo.filePath
    
    // 如果是视频文件且没有音频路径，先提取音频
    if (fileInfo.mimeType.startsWith('video/') && !fileInfo.audioPath) {
      const extractedFile = await fileProcessor.processFile(
        { 
          originalname: fileInfo.originalName,
          mimetype: fileInfo.mimeType,
          size: fileInfo.size,
          buffer: await require('fs').promises.readFile(fileInfo.filePath)
        } as Express.Multer.File,
        { extractAudio: true, audioFormat: 'wav' }
      )
      audioPath = extractedFile.audioPath!
    }

    // 分析音频质量
    const qualityInfo = await fileProcessor.analyzeAudioQuality(audioPath)

    res.json({
      success: true,
      data: {
        fileId,
        audioPath,
        qualityAnalysis: qualityInfo,
        analysisTime: Date.now()
      }
    })

  } catch (error) {
    logger.error('Audio quality analysis error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : '音频质量分析失败'
      }
    })
  }
}))

// 批量音频增强
router.post('/batch-enhance', mediaLimiter, asyncHandler(async (req, res) => {
  const { 
    fileIds,
    enhancementOptions = {
      noiseReduction: true,
      volumeNormalization: true,
      enhanceAudio: true,
      analyzeQuality: true
    }
  } = req.body

  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_IDS',
        message: '文件ID列表参数缺失或为空'
      }
    })
  }

  if (fileIds.length > 5) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'TOO_MANY_FILES',
        message: '批量增强最多支持5个文件'
      }
    })
  }

  try {
    logger.info(`Batch enhancing ${fileIds.length} audio files`)

    const results = []
    
    for (const fileId of fileIds) {
      try {
        // 获取文件信息
        const fileInfo = await fileProcessor.getFileInfo(fileId)
        if (!fileInfo) {
          results.push({
            fileId,
            success: false,
            error: '文件未找到'
          })
          continue
        }

        // 确定音频路径
        let audioPath = fileInfo.audioPath || fileInfo.filePath
        
        // 如果是视频文件且没有音频路径，先提取音频
        if (fileInfo.mimeType.startsWith('video/') && !fileInfo.audioPath) {
          const extractedFile = await fileProcessor.processFile(
            { 
              originalname: fileInfo.originalName,
              mimetype: fileInfo.mimeType,
              size: fileInfo.size,
              buffer: await require('fs').promises.readFile(fileInfo.filePath)
            } as Express.Multer.File,
            { extractAudio: true, audioFormat: 'wav' }
          )
          audioPath = extractedFile.audioPath!
        }

        // 执行音频增强
        const enhancementResult = await fileProcessor.enhanceAudio(
          audioPath,
          fileId,
          enhancementOptions
        )

        results.push({
          fileId,
          success: true,
          data: {
            enhancedPath: enhancementResult.enhancedPath,
            improvements: enhancementResult.improvements,
            qualityImprovement: enhancementResult.qualityAfter && enhancementResult.qualityBefore
              ? (enhancementResult.qualityAfter.qualityScore || 0) - (enhancementResult.qualityBefore.qualityScore || 0)
              : undefined,
            processingTime: enhancementResult.processingTime
          }
        })

      } catch (error) {
        logger.error(`Failed to enhance audio for file ${fileId}:`, error)
        results.push({
          fileId,
          success: false,
          error: error instanceof Error ? error.message : '增强失败'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalProcessingTime = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.data?.processingTime || 0), 0)

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: fileIds.length,
          successful: successCount,
          failed: fileIds.length - successCount,
          totalProcessingTime
        }
      }
    })

  } catch (error) {
    logger.error('Batch audio enhancement error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_ENHANCEMENT_FAILED',
        message: error instanceof Error ? error.message : '批量音频增强失败'
      }
    })
  }
}))

// 获取音频处理能力信息
router.get('/audio-capabilities', asyncHandler(async (req, res) => {
  const capabilities = fileProcessor.getAudioCapabilities()
  
  res.json({
    success: true,
    data: capabilities
  })
}))

// 批量处理媒体文件
router.post('/batch', mediaLimiter, asyncHandler(async (req, res) => {
  const { 
    fileIds,
    extractAudio = true,
    audioFormat = 'wav',
    enhanceAudio = false,
    analyzeQuality = true,
    concurrency = 2
  } = req.body

  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_IDS',
        message: '文件ID列表参数缺失或为空'
      }
    })
  }

  if (fileIds.length > 10) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'TOO_MANY_FILES',
        message: '批量处理最多支持10个文件'
      }
    })
  }

  try {
    logger.info(`Batch processing ${fileIds.length} files`)

    // 获取所有文件路径
    const filePaths: string[] = []
    for (const fileId of fileIds) {
      const fileInfo = await fileProcessor.getFileInfo(fileId)
      if (!fileInfo) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: `文件未找到: ${fileId}`
          }
        })
      }
      filePaths.push(fileInfo.filePath)
    }

    // 批量处理
    const results = await mediaProcessor.batchProcessMedia(filePaths, {
      extractAudio,
      audioFormat,
      enhanceAudio,
      analyzeQuality,
      concurrency
    })

    res.json({
      success: true,
      data: {
        results: results.map(result => ({
          id: result.id,
          audioPath: result.audioPath,
          qualityAnalysis: result.qualityAnalysis,
          enhancements: result.enhancements,
          processingTime: result.processingTime
        })),
        totalProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0),
        processedCount: results.length
      }
    })

  } catch (error) {
    logger.error('Batch processing error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_PROCESSING_FAILED',
        message: error instanceof Error ? error.message : '批量处理失败'
      }
    })
  }
}))

// 获取媒体处理能力信息
router.get('/capabilities', asyncHandler(async (req, res) => {
  const capabilities = mediaProcessor.getCapabilities()
  
  res.json({
    success: true,
    data: capabilities
  })
}))

// 获取媒体文件详细信息
router.get('/info/:fileId', asyncHandler(async (req, res) => {
  const { fileId } = req.params

  try {
    // 获取文件信息
    const fileInfo = await fileProcessor.getFileInfo(fileId)
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: '文件未找到'
        }
      })
    }

    // 获取详细媒体信息
    const result = await mediaProcessor.processMedia(fileInfo.filePath, {
      extractAudio: false,
      analyzeQuality: false
    })

    res.json({
      success: true,
      data: {
        id: fileId,
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        mimeType: fileInfo.mimeType,
        metadata: result.metadata,
        createdAt: fileInfo.createdAt
      }
    })

  } catch (error) {
    logger.error('Get media info error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_INFO_FAILED',
        message: '获取媒体信息失败'
      }
    })
  }
}))

// 清理临时文件
router.post('/cleanup', asyncHandler(async (req, res) => {
  const { maxAge = 3600000 } = req.body // 默认1小时

  try {
    await mediaProcessor.cleanup(maxAge)
    
    res.json({
      success: true,
      message: '临时文件清理完成'
    })

  } catch (error) {
    logger.error('Cleanup error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'CLEANUP_FAILED',
        message: '清理失败'
      }
    })
  }
}))

export default router