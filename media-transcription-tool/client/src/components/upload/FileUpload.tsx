import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react'
import { validateFiles } from '../../utils/validation'
import { formatFileSize, getMediaType } from '../../utils/format'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  disabled?: boolean
  className?: string
}

interface FileWithPreview extends File {
  id: string
  preview?: string
  error?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 100,
  disabled = false,
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [uploadError, setUploadError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError('')

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`
      )
      setUploadError(errors.join('; '))
      return
    }

    // Validate files
    const validation = validateFiles(acceptedFiles)
    if (!validation.isValid) {
      setUploadError(validation.error || 'File validation failed')
      return
    }

    // Convert to FileWithPreview
    const filesWithPreview: FileWithPreview[] = acceptedFiles.map(file => ({
      ...file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    setSelectedFiles(prev => {
      const newFiles = [...prev, ...filesWithPreview]
      if (newFiles.length > maxFiles) {
        setUploadError(`最多只能选择 ${maxFiles} 个文件`)
        return prev
      }
      return newFiles
    })

    onFilesSelected(acceptedFiles)
  }, [onFilesSelected, maxFiles])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled,
    maxSize: maxSize * 1024 * 1024,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.wma']
    },
    multiple: maxFiles > 1
  })

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId)
      // Clean up preview URLs
      const removedFile = prev.find(f => f.id === fileId)
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview)
      }
      return newFiles
    })
    setUploadError('')
  }

  const clearAll = () => {
    selectedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setSelectedFiles([])
    setUploadError('')
  }

  const getDropzoneClassName = () => {
    let baseClass = 'dropzone transition-all duration-200 cursor-pointer'
    
    if (disabled) {
      baseClass += ' opacity-50 cursor-not-allowed'
    } else if (isDragReject) {
      baseClass += ' dropzone-error'
    } else if (isDragActive) {
      baseClass += ' dropzone-active'
    }
    
    return `${baseClass} ${className}`
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={getDropzoneClassName()}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-blue-600 mb-2">
                松开鼠标上传文件
              </p>
              <p className="text-sm text-gray-500">
                支持拖拽多个文件
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                点击选择文件或拖拽到此处
              </p>
              <p className="text-sm text-gray-500 mb-4">
                支持 MP4, AVI, MOV, MP3, WAV, M4A 等格式
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                <span>最大 {maxSize}MB</span>
                <span>•</span>
                <span>最多 {maxFiles} 个文件</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              已选择文件 ({selectedFiles.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              清空全部
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${
                      getMediaType(file.name) === 'video' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <File className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className="capitalize">
                      {getMediaType(file.name)} 文件
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload