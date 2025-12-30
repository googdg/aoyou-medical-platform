import express from 'express'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { fileProcessor } from '../services/fileProcessor'
import { urlProcessor } from '../services/urlProcessor'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = express.Router()

// 频率限制
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 每个IP最多10次上传
  message: { 
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '上传频率过高，请稍后再试'
    }
  }
})

const urlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 20, // 每个IP最多20次URL请求
  message: { 
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'URL处理频率过高，请稍后再试'
    }
  }
})

// 配置multer使用内存存储
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB限制
    files: 1 // 一次只能上传一个文件
  },
  fileFilter: (req, file, cb) => {
    const validation = fileProcessor.validateFile(file)
    if (validation.isValid) {
      cb(null, true)
    } else {
      cb(new Error(validation.error))
    }
  }
})

// 上传单个文件
router.post('/file', uploadLimiter, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE',
        message: '未选择文件'
      }
    })
  }

  logger.info(`Processing file upload: ${req.file.originalname}`)

  try {
    // 处理上传的文件
    const processedFile = await fileProcessor.processFile(req.file, {
      extractAudio: true,
      audioFormat: 'wav',
      audioQuality: 16000, // 16kHz用于语音识别
      normalizeAudio: true
    })

    // TODO: 保存到数据库
    // await database.files.create(processedFile)

    res.json({
      success: true,
      data: {
        id: processedFile.id,
        originalName: processedFile.originalName,
        size: processedFile.size,
        duration: processedFile.duration,
        mimeType: processedFile.mimeType,
        hasAudio: !!processedFile.audioPath,
        metadata: processedFile.metadata,
        createdAt: processedFile.createdAt
      }
    })

  } catch (error) {
    logger.error('File upload error:', error)
    
    let errorMessage = '文件上传失败'
    let errorCode = 'UPLOAD_FAILED'
    
    if (error.message.includes('File too large')) {
      errorMessage = '文件大小超过限制 (500MB)'
      errorCode = 'FILE_TOO_LARGE'
    } else if (error.message.includes('不支持的文件格式')) {
      errorMessage = error.message
      errorCode = 'UNSUPPORTED_FORMAT'
    } else if (error.message) {
      errorMessage = error.message
    }

    res.status(400).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    })
  }
}))

// 上传多个文件 (暂时移除，专注于单文件上传)
// router.post('/files', upload.array('media', 10), asyncHandler(async (req, res) => {
//   // 多文件上传逻辑
// }))

// 获取URL信息
router.post('/url/info', urlLimiter, asyncHandler(async (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_URL',
        message: 'URL参数缺失'
      }
    })
  }

  // 验证URL
  const validation = urlProcessor.validateUrl(url)
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_URL',
        message: validation.error
      }
    })
  }

  try {
    logger.info(`Getting URL info: ${url}`)
    
    // 获取URL信息
    const urlInfo = await urlProcessor.getUrlInfo(url)
    
    res.json({
      success: true,
      data: urlInfo
    })

  } catch (error) {
    logger.error('URL info error:', error)
    res.status(400).json({
      success: false,
      error: {
        code: 'URL_INFO_FAILED',
        message: error.message || 'URL信息获取失败'
      }
    })
  }
}))

// 处理在线链接
router.post('/url', urlLimiter, asyncHandler(async (req, res) => {
  const { url, options = {} } = req.body

  if (!url) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_URL',
        message: 'URL参数缺失'
      }
    })
  }

  // 验证URL
  const validation = urlProcessor.validateUrl(url)
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_URL',
        message: validation.error
      }
    })
  }

  try {
    logger.info(`Processing URL: ${url}`)
    
    // 处理URL
    const processedMedia = await urlProcessor.processUrl(url, {
      audioOnly: options.audioOnly || false,
      quality: options.quality || 'best',
      maxDuration: options.maxDuration
    })

    // TODO: 保存到数据库
    // await database.media.create(processedMedia)

    res.json({
      success: true,
      data: {
        id: processedMedia.id,
        originalUrl: processedMedia.originalUrl,
        title: processedMedia.title,
        size: processedMedia.size,
        duration: processedMedia.duration,
        format: processedMedia.format,
        platform: processedMedia.platform,
        hasAudio: !!processedMedia.audioPath,
        createdAt: processedMedia.createdAt
      }
    })

  } catch (error) {
    logger.error('URL processing error:', error)
    res.status(400).json({
      success: false,
      error: {
        code: 'URL_PROCESSING_FAILED',
        message: error.message || 'URL处理失败'
      }
    })
  }
}))

// 获取文件信息
router.get('/file/:fileId', asyncHandler(async (req, res) => {
  const { fileId } = req.params

  try {
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

    res.json({
      success: true,
      data: {
        id: fileInfo.id,
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        duration: fileInfo.duration,
        mimeType: fileInfo.mimeType,
        metadata: fileInfo.metadata,
        createdAt: fileInfo.createdAt
      }
    })

  } catch (error) {
    logger.error('Get file info error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FILE_INFO_FAILED',
        message: '获取文件信息失败'
      }
    })
  }
}))

// 删除文件
router.delete('/file/:fileId', asyncHandler(async (req, res) => {
  const { fileId } = req.params

  try {
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

    await fileProcessor.deleteFile(fileInfo)
    
    // TODO: 从数据库删除
    // await database.files.delete(fileId)

    logger.info(`File deleted: ${fileId}`)

    res.json({
      success: true,
      message: '文件删除成功'
    })

  } catch (error) {
    logger.error('Delete file error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FILE_FAILED',
        message: '文件删除失败'
      }
    })
  }
}))

// 获取支持的平台列表
router.get('/platforms', asyncHandler(async (req, res) => {
  const platforms = urlProcessor.getSupportedPlatforms()
  const formats = fileProcessor.getSupportedFormats()

  res.json({
    success: true,
    data: {
      platforms,
      formats
    }
  })
}))

// 错误处理中间件
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    let errorMessage = '文件上传失败'
    let errorCode = 'UPLOAD_ERROR'

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        errorMessage = '文件大小超过限制 (500MB)'
        errorCode = 'FILE_TOO_LARGE'
        break
      case 'LIMIT_FILE_COUNT':
        errorMessage = '一次只能上传一个文件'
        errorCode = 'TOO_MANY_FILES'
        break
      case 'LIMIT_UNEXPECTED_FILE':
        errorMessage = '意外的文件字段'
        errorCode = 'UNEXPECTED_FILE'
        break
    }

    return res.status(400).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    })
  }

  logger.error('Upload middleware error:', error)
  res.status(400).json({
    success: false,
    error: {
      code: 'UPLOAD_ERROR',
      message: error.message || '上传处理失败'
    }
  })
})

export default router