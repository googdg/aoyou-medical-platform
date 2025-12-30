import Redis from 'redis'
import { logger } from '../utils/logger'

let redisClient: Redis.RedisClientType | null = null

export async function initializeRedis(): Promise<Redis.RedisClientType> {
  try {
    if (redisClient) {
      return redisClient
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    
    redisClient = Redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed after 10 attempts')
            return new Error('Redis reconnection failed')
          }
          return Math.min(retries * 50, 1000)
        }
      }
    })

    redisClient.on('error', (error) => {
      logger.error('Redis error:', error)
    })

    redisClient.on('connect', () => {
      logger.info('Redis connected')
    })

    redisClient.on('disconnect', () => {
      logger.warn('Redis disconnected')
    })

    await redisClient.connect()
    
    logger.info('Redis initialized successfully')
    return redisClient
  } catch (error) {
    logger.error('Failed to initialize Redis:', error)
    throw error
  }
}

export function getRedisClient(): Redis.RedisClientType {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initializeRedis() first.')
  }
  return redisClient
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    logger.info('Redis connection closed')
  }
}

// Cache utilities
export class CacheService {
  private static client: Redis.RedisClientType

  static initialize(client: Redis.RedisClientType) {
    this.client = client
  }

  static async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key)
    } catch (error) {
      logger.error('Cache get error:', error)
      return null
    }
  }

  static async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value)
      } else {
        await this.client.set(key, value)
      }
      return true
    } catch (error) {
      logger.error('Cache set error:', error)
      return false
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key)
      return true
    } catch (error) {
      logger.error('Cache delete error:', error)
      return false
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Cache exists error:', error)
      return false
    }
  }
}