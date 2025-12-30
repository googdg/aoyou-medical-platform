import express from 'express'
import { asyncHandler } from '../middleware/errorHandler'

const router = express.Router()

// 健康检查端点
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }
  })
}))

// 详细健康检查
router.get('/detailed', asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'OK', // TODO: 实际检查数据库连接
      redis: 'OK',     // TODO: 实际检查Redis连接
      storage: 'OK',   // TODO: 实际检查存储可用性
      whisper: 'OK'    // TODO: 实际检查Whisper服务
    },
    resources: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: process.platform !== 'win32' ? process.loadavg() : [0, 0, 0]
      }
    }
  }

  res.json({
    success: true,
    data: healthCheck
  })
}))

export default router