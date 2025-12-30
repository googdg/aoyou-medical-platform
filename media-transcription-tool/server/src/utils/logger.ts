import winston from 'winston'
import path from 'path'

// 创建日志目录
const logDir = path.join(process.cwd(), 'logs')

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// 控制台格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`
    }
    return msg
  })
)

// 创建logger实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'media-transcription-tool' },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件输出
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
})

// 开发环境下的额外配置
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

// 导出便捷方法
export const logInfo = (message: string, meta?: any) => logger.info(message, meta)
export const logError = (message: string, error?: any) => logger.error(message, error)
export const logWarn = (message: string, meta?: any) => logger.warn(message, meta)
export const logDebug = (message: string, meta?: any) => logger.debug(message, meta)