import React, { useState, useCallback, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Loader, Pause, Play, Trash2 } from 'lucide-react'
import { uploadService, UploadProgress } from '../../services/uploadService'
import { UploadedFile } from '../../types'
import { formatFileSize, getMediaType } from '../../utils/format'

interface UploadManagerProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  maxFileSize?: number
  className?: string
}

interface FileUploadState extends UploadProgress {
  file: File
  uploadedFile?: UploadedFile
  isPaused?: boolean
}

const UploadManager: React.FC<UploadManagerProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 100,
  className = ''
}) => {
  const [uploadStates, setUploadStates] = useState<Map<string, FileUploadState>>(new Map())
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateUploadState = useCallback((fileId: string, updates: Partial<FileUploadState>) => {
    setUploadStates(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(fileId)
      if (current) {
        newMap.set(fileId, { ...current, ...updates })
      }
      return newMap
    })
  }, [])

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    // Check file limits
    const currentCount = uploadStates.size
    if (currentCount + files.length > maxFiles) {
      onUploadError?.(`最多只能上传 ${maxFiles} 个文件`)
      return
    }

    // Initialize upload states
    const newStates = new Map(uploadStates)
    files.forEach(file => {
      const fileId = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      newStates.set(fileId, {
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'pending',
        file
      })
    })
    setUploadStates(newStates)

    // Start uploads
    setIsUploading(true)
    const uploadedFiles: UploadedFile[] = []

    try {
      for (const file of files) {
        const fileId = Array.from(newStates.keys()).find(id => 
          newStates.get(id)?.file === file
        )
        
        if (!fileId) continue

        try {
          const uploadedFile = await uploadService.uploadFile(file, {
            maxFileSize,
            onProgress: (progress) => {
              updateUploadState(fileId, {
                progress: progress.progress,
                status: progress.status,
                error: progress.error
              })
            }
          })

          updateUploadState(fileId, {
            uploadedFile,
            status: 'completed',
            progress: 100
          })

          uploadedFiles.push(uploadedFile)

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          updateUploadState(fileId, {
            status: 'failed',
            error: errorMessage
          })
        }
      }

      if (uploadedFiles.length > 0) {
        onUploadComplete?.(uploadedFiles)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload process failed'
      onUploadError?.(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [uploadStates, maxFiles, maxFileSize, onUploadComplete, onUploadError, updateUploadState])

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    handleFileSelect(files)
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect])

  const handleRemoveFile = useCallback((fileId: string) => {
    const state = uploadStates.get(fileId)
    if (state?.status === 'uploading') {
      uploadService.cancelUpload(fileId)
    }
    
    setUploadStates(prev => {
      const newMap = new Map(prev)
      newMap.delete(fileId)
      return newMap
    })
  }, [uploadStates])

  const handleClearAll = useCallback(() => {
    uploadService.cancelAllUploads()
    setUploadStates(new Map())
    setIsUploading(false)
  }, [])

  const handleRetryUpload = useCallback(async (fileId: string) => {
    const state = uploadStates.get(fileId)
    if (!state || !state.file) return

    updateUploadState(fileId, {
      status: 'pending',
      progress: 0,
      error: undefined
    })

    try {
      const uploadedFile = await uploadService.uploadFile(state.file, {
        maxFileSize,
        onProgress: (progress) => {
          updateUploadState(fileId, {
            progress: progress.progress,
            status: progress.status,
            error: progress.error
          })
        }
      })

      updateUploadState(fileId, {
        uploadedFile,
        status: 'completed',
        progress: 100
      })

      onUploadComplete?.([uploadedFile])

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed'
      updateUploadState(fileId, {
        status: 'failed',
        error: errorMessage
      })
    }
  }, [uploadStates, maxFileSize, onUploadComplete, updateUploadState])

  const getStatusIcon = (status: string, progress: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'uploading':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待上传'
      case 'uploading':
        return '上传中'
      case 'completed':
        return '上传完成'
      case 'failed':
        return '上传失败'
      default:
        return '未知状态'
    }
  }

  const uploadStatesArray = Array.from(uploadStates.values())
  const completedCount = uploadStatesArray.filter(state => state.status === 'completed').length
  const failedCount = uploadStatesArray.filter(state => state.status === 'failed').length
  const totalCount = uploadStatesArray.length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,audio/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || totalCount >= maxFiles}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            选择文件
          </button>
          
          {totalCount > 0 && (
            <div className="text-sm text-gray-600">
              {completedCount}/{totalCount} 完成
              {failedCount > 0 && (
                <span className="text-red-600 ml-2">
                  ({failedCount} 失败)
                </span>
              )}
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>清空</span>
          </button>
        )}
      </div>

      {/* Upload List */}
      {totalCount > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {uploadStatesArray.map((state) => (
            <div
              key={state.fileId}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded flex items-center justify-center ${
                  getMediaType(state.fileName) === 'video' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {getStatusIcon(state.status, state.progress)}
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {state.fileName}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(state.file.size)}
                  </span>
                </div>

                {/* Progress Bar */}
                {state.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    state.status === 'completed' ? 'text-green-600' :
                    state.status === 'failed' ? 'text-red-600' :
                    state.status === 'uploading' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                    {getStatusText(state.status)}
                    {state.status === 'uploading' && ` (${state.progress}%)`}
                  </span>

                  {state.error && (
                    <span className="text-xs text-red-600 truncate max-w-xs">
                      {state.error}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                {state.status === 'failed' && (
                  <button
                    onClick={() => handleRetryUpload(state.fileId)}
                    className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                    title="重试上传"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleRemoveFile(state.fileId)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="移除文件"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Limits Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 最大文件大小: {maxFileSize}MB</p>
        <p>• 最多文件数量: {maxFiles} 个</p>
        <p>• 支持格式: MP4, AVI, MOV, MP3, WAV, M4A 等</p>
      </div>
    </div>
  )
}

export default UploadManager