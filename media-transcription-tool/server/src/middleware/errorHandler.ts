import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  isOperational?: boolean
}

export class CustomError extends Error implements AppError {
  statusCode: number
  code: string
  isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.name = 'CustomError'

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message, code = 'INTERNAL_ERROR' } = error

  // Log error
  logger.error('Error occurred:', {
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
      code,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
  })

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400
    code = 'VALIDATION_ERROR'
    message = 'Invalid input data'
  } else if (error.name === 'CastError') {
    statusCode = 400
    code = 'INVALID_ID'
    message = 'Invalid ID format'
  } else if (error.name === 'MulterError') {
    statusCode = 400
    code = 'FILE_UPLOAD_ERROR'
    if (error.message.includes('File too large')) {
      message = 'File size exceeds the maximum limit'
    } else if (error.message.includes('Unexpected field')) {
      message = 'Invalid file field'
    } else {
      message = 'File upload error'
    }
  } else if ((error as any).code === 'ENOENT') {
    statusCode = 404
    code = 'FILE_NOT_FOUND'
    message = 'File not found'
  } else if ((error as any).code === 'EACCES') {
    statusCode = 403
    code = 'PERMISSION_DENIED'
    message = 'Permission denied'
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error'
  }

  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  }

  res.status(statusCode).json(errorResponse)
}

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  const error = new CustomError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  )
  
  res.status(404).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  })
}