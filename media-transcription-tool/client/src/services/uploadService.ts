import { apiClient } from './api'
import { validateFiles, validateFileSize, validateFileFormat } from '../utils/validation'
import { UploadedFile } from '../types'

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  error?: string
}

export interface UploadOptions {
  maxFileSize?: number // in MB
  maxFiles?: number
  allowedFormats?: string[]
  onProgress?: (progress: UploadProgress) => void
  onComplete?: (file: UploadedFile) => void
  onError?: (error: string, fileId: string) => void
}

class UploadService {
  private activeUploads = new Map<string, AbortController>()

  // Upload single file with progress tracking
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadedFile> {
    const fileId = this.generateFileId(file)
    
    // Validate file
    const sizeValidation = validateFileSize(file, options.maxFileSize)
    if (!sizeValidation.isValid) {
      const error = sizeValidation.error || 'File validation failed'
      options.onError?.(error, fileId)
      throw new Error(error)
    }

    const formatValidation = validateFileFormat(file)
    if (!formatValidation.isValid) {
      const error = formatValidation.error || 'File format validation failed'
      options.onError?.(error, fileId)
      throw new Error(error)
    }

    // Create abort controller for this upload
    const abortController = new AbortController()
    this.activeUploads.set(fileId, abortController)

    try {
      // Notify upload start
      options.onProgress?.({
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      })

      // Create FormData
      const formData = new FormData()
      formData.append('media', file)

      // Upload with progress tracking
      const uploadedFile = await this.uploadWithProgress(
        formData,
        fileId,
        file.name,
        options,
        abortController.signal
      )

      // Notify completion
      options.onProgress?.({
        fileId,
        fileName: file.name,
        progress: 100,
        status: 'completed'
      })

      options.onComplete?.(uploadedFile)
      return uploadedFile

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      options.onProgress?.({
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'failed',
        error: errorMessage
      })

      options.onError?.(errorMessage, fileId)
      throw error

    } finally {
      this.activeUploads.delete(fileId)
    }
  }

  // Upload multiple files with individual progress tracking
  async uploadFiles(files: File[], options: UploadOptions = {}): Promise<UploadedFile[]> {
    // Validate files
    const validation = validateFiles(files)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Files validation failed')
    }

    if (options.maxFiles && files.length > options.maxFiles) {
      throw new Error(`最多只能上传 ${options.maxFiles} 个文件`)
    }

    // Upload files concurrently
    const uploadPromises = files.map(file => 
      this.uploadFile(file, options)
    )

    try {
      const results = await Promise.allSettled(uploadPromises)
      const uploadedFiles: UploadedFile[] = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          uploadedFiles.push(result.value)
        } else {
          errors.push(`${files[index].name}: ${result.reason.message}`)
        }
      })

      if (errors.length > 0 && uploadedFiles.length === 0) {
        throw new Error(`所有文件上传失败:\n${errors.join('\n')}`)
      }

      if (errors.length > 0) {
        console.warn('部分文件上传失败:', errors)
      }

      return uploadedFiles

    } catch (error) {
      throw error
    }
  }

  // Cancel upload
  cancelUpload(fileId: string): boolean {
    const abortController = this.activeUploads.get(fileId)
    if (abortController) {
      abortController.abort()
      this.activeUploads.delete(fileId)
      return true
    }
    return false
  }

  // Cancel all uploads
  cancelAllUploads(): void {
    this.activeUploads.forEach((controller) => {
      controller.abort()
    })
    this.activeUploads.clear()
  }

  // Get active upload count
  getActiveUploadCount(): number {
    return this.activeUploads.size
  }

  // Check if file is currently uploading
  isUploading(fileId: string): boolean {
    return this.activeUploads.has(fileId)
  }

  // Private methods
  private generateFileId(file: File): string {
    return `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private async uploadWithProgress(
    formData: FormData,
    fileId: string,
    fileName: string,
    options: UploadOptions,
    signal: AbortSignal
  ): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Handle upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          options.onProgress?.({
            fileId,
            fileName,
            progress,
            status: 'uploading'
          })
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success && response.data) {
              resolve(response.data)
            } else {
              reject(new Error(response.error?.message || 'Upload failed'))
            }
          } catch (error) {
            reject(new Error('Invalid response format'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      // Handle abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'))
      })

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'))
      })

      // Setup abort signal
      signal.addEventListener('abort', () => {
        xhr.abort()
      })

      // Configure and send request
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
      xhr.open('POST', `${baseURL}/upload/file`)
      xhr.timeout = 300000 // 5 minutes
      xhr.send(formData)
    })
  }

  // Utility method to create file chunks for large file upload
  private createFileChunks(file: File, chunkSize: number = 1024 * 1024): Blob[] {
    const chunks: Blob[] = []
    let start = 0

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size)
      chunks.push(file.slice(start, end))
      start = end
    }

    return chunks
  }

  // Upload large file in chunks
  async uploadLargeFile(
    file: File, 
    options: UploadOptions = {},
    chunkSize: number = 1024 * 1024 // 1MB chunks
  ): Promise<UploadedFile> {
    const fileId = this.generateFileId(file)
    const chunks = this.createFileChunks(file, chunkSize)
    const totalChunks = chunks.length

    try {
      // Initialize chunked upload
      const initResponse = await apiClient.client.post('/upload/chunk/init', {
        fileName: file.name,
        fileSize: file.size,
        totalChunks,
        fileId
      })

      const uploadId = initResponse.data.data.uploadId

      // Upload chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const formData = new FormData()
        formData.append('chunk', chunk)
        formData.append('uploadId', uploadId)
        formData.append('chunkIndex', i.toString())

        await apiClient.client.post('/upload/chunk', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })

        // Update progress
        const progress = Math.round(((i + 1) / totalChunks) * 100)
        options.onProgress?.({
          fileId,
          fileName: file.name,
          progress,
          status: 'uploading'
        })
      }

      // Complete chunked upload
      const completeResponse = await apiClient.client.post('/upload/chunk/complete', {
        uploadId
      })

      const uploadedFile = completeResponse.data.data
      options.onComplete?.(uploadedFile)
      
      return uploadedFile

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Chunked upload failed'
      options.onError?.(errorMessage, fileId)
      throw error
    }
  }
}

// Create singleton instance
export const uploadService = new UploadService()
export default uploadService