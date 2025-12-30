import Bull from 'bull'
import { Server as SocketIOServer } from 'socket.io'
import { logger } from '../utils/logger'
import { getRedisClient } from './redis'

let transcriptionQueue: Bull.Queue | null = null
let io: SocketIOServer | null = null

export async function initializeQueues(socketIO: SocketIOServer): Promise<void> {
  try {
    io = socketIO
    
    // Initialize transcription queue
    transcriptionQueue = new Bull('transcription', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    })

    // Process transcription jobs
    transcriptionQueue.process('transcribe', parseInt(process.env.MAX_CONCURRENT_JOBS || '3'), async (job) => {
      const { jobId, filePath, options } = job.data
      
      try {
        // Update progress
        await job.progress(10)
        emitProgress(jobId, 10, 'Starting transcription...')

        // TODO: Implement actual transcription logic
        logger.info('Processing transcription job', { jobId, filePath, options })

        // Simulate processing with progress updates
        for (let i = 20; i <= 90; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          await job.progress(i)
          emitProgress(jobId, i, `Processing... ${i}%`)
        }

        await job.progress(100)
        emitProgress(jobId, 100, 'Transcription completed')

        // Return mock result
        return {
          jobId,
          text: 'Mock transcription result',
          language: 'zh',
          confidence: 0.95,
          segments: []
        }
      } catch (error) {
        logger.error('Transcription job failed', { jobId, error })
        emitError(jobId, error as Error)
        throw error
      }
    })

    // Queue event handlers
    transcriptionQueue.on('completed', (job, result) => {
      logger.info('Transcription job completed', { jobId: job.data.jobId })
      emitCompleted(job.data.jobId, result)
    })

    transcriptionQueue.on('failed', (job, error) => {
      logger.error('Transcription job failed', { jobId: job.data.jobId, error })
      emitError(job.data.jobId, error)
    })

    transcriptionQueue.on('stalled', (job) => {
      logger.warn('Transcription job stalled', { jobId: job.data.jobId })
    })

    logger.info('Job queues initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize queues:', error)
    throw error
  }
}

export function getTranscriptionQueue(): Bull.Queue {
  if (!transcriptionQueue) {
    throw new Error('Transcription queue not initialized')
  }
  return transcriptionQueue
}

// Socket.IO event emitters
function emitProgress(jobId: string, progress: number, message: string) {
  if (io) {
    io.to(`job-${jobId}`).emit('progress', {
      jobId,
      progress,
      message,
      timestamp: new Date().toISOString()
    })
  }
}

function emitCompleted(jobId: string, result: any) {
  if (io) {
    io.to(`job-${jobId}`).emit('completed', {
      jobId,
      result,
      timestamp: new Date().toISOString()
    })
  }
}

function emitError(jobId: string, error: Error) {
  if (io) {
    io.to(`job-${jobId}`).emit('error', {
      jobId,
      error: {
        message: error.message,
        code: (error as any).code || 'TRANSCRIPTION_ERROR'
      },
      timestamp: new Date().toISOString()
    })
  }
}

export async function addTranscriptionJob(jobId: string, filePath: string, options: any): Promise<Bull.Job> {
  const queue = getTranscriptionQueue()
  
  return queue.add('transcribe', {
    jobId,
    filePath,
    options
  }, {
    jobId, // Use jobId as Bull job ID for easy tracking
    timeout: parseInt(process.env.JOB_TIMEOUT || '3600') * 1000, // 1 hour default
  })
}

export async function getJobStatus(jobId: string): Promise<any> {
  const queue = getTranscriptionQueue()
  const job = await queue.getJob(jobId)
  
  if (!job) {
    return null
  }

  return {
    id: job.id,
    progress: job.progress(),
    state: await job.getState(),
    createdAt: new Date(job.timestamp),
    processedAt: job.processedOn ? new Date(job.processedOn) : null,
    finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
    failedReason: job.failedReason,
    data: job.data,
    returnValue: job.returnvalue
  }
}

export async function cancelJob(jobId: string): Promise<boolean> {
  const queue = getTranscriptionQueue()
  const job = await queue.getJob(jobId)
  
  if (!job) {
    return false
  }

  try {
    await job.remove()
    return true
  } catch (error) {
    logger.error('Failed to cancel job', { jobId, error })
    return false
  }
}