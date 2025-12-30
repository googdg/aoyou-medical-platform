import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

// Import routes
import uploadRoutes from './routes/upload'
import transcriptionRoutes from './routes/transcription'
import exportRoutes from './routes/export'
import healthRoutes from './routes/health'
import mediaRoutes from './routes/media'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { requestLogger } from './middleware/requestLogger'

// Import services
import { initializeDatabase } from './services/database'
import { initializeRedis } from './services/redis'
import { initializeQueues } from './services/queue'
import { logger } from './utils/logger'

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

// Make io available to routes
app.set('io', io)

const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))

// Body parsing middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}))
app.use(requestLogger)

// Rate limiting
app.use('/api', rateLimiter)

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/health', healthRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/transcription', transcriptionRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/media', mediaRoutes)

// API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Media Transcription API',
    version: '1.0.0',
    description: 'AI-powered media transcription service',
    endpoints: {
      health: '/api/health',
      upload: '/api/upload',
      transcription: '/api/transcription',
      export: '/api/export',
      media: '/api/media',
    },
    documentation: '/api/docs',
  })
})

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../client/dist')
  app.use(express.static(frontendPath))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
}

// Error handling middleware (must be last)
app.use(errorHandler)

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)
  
  socket.on('join-job', (jobId: string) => {
    socket.join(`job-${jobId}`)
    logger.info(`Client ${socket.id} joined job ${jobId}`)
  })
  
  socket.on('leave-job', (jobId: string) => {
    socket.leave(`job-${jobId}`)
    logger.info(`Client ${socket.id} left job ${jobId}`)
  })
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase()
    logger.info('Database initialized successfully')
    
    // Initialize Redis
    await initializeRedis()
    logger.info('Redis initialized successfully')
    
    // Initialize job queues
    await initializeQueues(io)
    logger.info('Job queues initialized successfully')
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`📝 API documentation: http://localhost:${PORT}/api`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`🔗 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

startServer()

export default app