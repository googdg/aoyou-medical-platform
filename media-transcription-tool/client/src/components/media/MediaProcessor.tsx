import React, { useState } from 'react'
import { 
  Settings, 
  Zap, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Info
} from 'lucide-react'
import { apiClient } from '../../services/api'

interface MediaProcessorProps {
  fileId: string
  fileName: string
  onProcessingComplete?: (result: any) => void
  className?: string
}

interface QualityAnalysis {
  snr?: number
  loudness?: number
  dynamicRange?: number
  peakLevel?: number
  rmsLevel?: number
  recommendation: 'excellent' | 'good' | 'fair' | 'poor'
  issues: string[]
  suggestions: string[]
}

interface ProcessingResult {
  id: string
  processingTime: number
  audioPath?: string
  qualityAnalysis?: QualityAnalysis
  enhancements: string[]
  metadata: {
    duration?: number
    format?: string
    codec?: string
    sampleRate?: number
    channels?: number
    fileSize: number
  }
}

const MediaProcessor: React.FC<MediaProcessorProps> = ({
  fileId,
  fileName,
  onProcessingComplete,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [qualityAnalysis, setQualityAnalysis] = useState<QualityAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [processingOptions, setProcessingOptions] = useState({
    extractAudio: true,
    audioFormat: 'wav' as 'wav' | 'mp3' | 'flac' | 'm4a',
    enhanceAudio: false,
    analyzeQuality: true,
    enhancementOptions: {
      noiseReduction: true,
      normalize: true,
      speechEnhancement: true,
      compressor: false,
      equalizer: false
    }
  })

  const handleProcessMedia = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const processResult = await apiClient.processMedia(fileId, processingOptions)
      setResult(processResult)
      setQualityAnalysis(processResult.qualityAnalysis)
      
      if (onProcessingComplete) {
        onProcessingComplete(processResult)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '媒体处理失败')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAnalyzeQuality = async () => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const analysisResult = await apiClient.analyzeAudioQuality(fileId)
      setQualityAnalysis(analysisResult.qualityAnalysis)
    } catch (error) {
      setError(error instanceof Error ? error.message : '音频分析失败')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleEnhanceAudio = async () => {
    setIsEnhancing(true)
    setError(null)
    
    try {
      const enhanceResult = await apiClient.enhanceAudio(fileId, processingOptions.enhancementOptions)
      setResult(enhanceResult)
      setQualityAnalysis(enhanceResult.qualityAnalysis)
      
      if (onProcessingComplete) {
        onProcessingComplete(enhanceResult)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '音频增强失败')
    } finally {
      setIsEnhancing(false)
    }
  }

  const getQualityColor = (recommendation: string) => {
    switch (recommendation) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'fair': return 'text-yellow-600 bg-yellow-50'
      case 'poor': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getQualityIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'fair': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'poor': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">媒体处理</h3>
          <p className="text-sm text-gray-600 mt-1">
            处理文件: {fileName}
          </p>
        </div>
        <Settings className="w-6 h-6 text-gray-400" />
      </div>

      {/* Processing Options */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            处理选项
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.extractAudio}
                onChange={(e) => setProcessingOptions(prev => ({
                  ...prev,
                  extractAudio: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">提取音频</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.analyzeQuality}
                onChange={(e) => setProcessingOptions(prev => ({
                  ...prev,
                  analyzeQuality: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">质量分析</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.enhanceAudio}
                onChange={(e) => setProcessingOptions(prev => ({
                  ...prev,
                  enhanceAudio: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">音频增强</span>
            </label>
          </div>
        </div>

        {/* Audio Format Selection */}
        {processingOptions.extractAudio && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              音频格式
            </label>
            <select
              value={processingOptions.audioFormat}
              onChange={(e) => setProcessingOptions(prev => ({
                ...prev,
                audioFormat: e.target.value as 'wav' | 'mp3' | 'flac' | 'm4a'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="wav">WAV (无损)</option>
              <option value="mp3">MP3 (压缩)</option>
              <option value="flac">FLAC (无损压缩)</option>
              <option value="m4a">M4A (AAC)</option>
            </select>
          </div>
        )}

        {/* Enhancement Options */}
        {processingOptions.enhanceAudio && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              增强选项
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({
                noiseReduction: '降噪处理',
                normalize: '响度标准化',
                speechEnhancement: '语音增强',
                compressor: '动态压缩',
                equalizer: '频率均衡'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={processingOptions.enhancementOptions[key as keyof typeof processingOptions.enhancementOptions]}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      enhancementOptions: {
                        ...prev.enhancementOptions,
                        [key]: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleProcessMedia}
          disabled={isProcessing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>{isProcessing ? '处理中...' : '开始处理'}</span>
        </button>

        <button
          onClick={handleAnalyzeQuality}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <BarChart3 className="w-4 h-4" />
          )}
          <span>{isAnalyzing ? '分析中...' : '质量分析'}</span>
        </button>

        <button
          onClick={handleEnhanceAudio}
          disabled={isEnhancing}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEnhancing ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          <span>{isEnhancing ? '增强中...' : '音频增强'}</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Quality Analysis Results */}
      {qualityAnalysis && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">音频质量分析</h4>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(qualityAnalysis.recommendation)}`}>
              {getQualityIcon(qualityAnalysis.recommendation)}
              <span className="capitalize">{qualityAnalysis.recommendation}</span>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            {qualityAnalysis.snr !== undefined && (
              <div className="text-sm">
                <span className="text-gray-600">信噪比:</span>
                <span className="ml-1 font-medium">{qualityAnalysis.snr.toFixed(1)} dB</span>
              </div>
            )}
            {qualityAnalysis.loudness !== undefined && (
              <div className="text-sm">
                <span className="text-gray-600">响度:</span>
                <span className="ml-1 font-medium">{qualityAnalysis.loudness.toFixed(1)} LUFS</span>
              </div>
            )}
            {qualityAnalysis.dynamicRange !== undefined && (
              <div className="text-sm">
                <span className="text-gray-600">动态范围:</span>
                <span className="ml-1 font-medium">{qualityAnalysis.dynamicRange.toFixed(1)} dB</span>
              </div>
            )}
            {qualityAnalysis.peakLevel !== undefined && (
              <div className="text-sm">
                <span className="text-gray-600">峰值电平:</span>
                <span className="ml-1 font-medium">{qualityAnalysis.peakLevel.toFixed(1)} dB</span>
              </div>
            )}
          </div>

          {/* Issues and Suggestions */}
          {qualityAnalysis.issues.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 mb-1">发现的问题:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {qualityAnalysis.issues.map((issue, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-red-500">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {qualityAnalysis.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">建议:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {qualityAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-blue-500">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Processing Results */}
      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className="text-sm font-medium text-green-900">处理完成</h4>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">处理时间:</span>
              <span className="font-medium">{(result.processingTime / 1000).toFixed(1)}s</span>
            </div>
            
            {result.metadata.duration && (
              <div className="flex justify-between">
                <span className="text-gray-600">音频时长:</span>
                <span className="font-medium">{Math.round(result.metadata.duration)}s</span>
              </div>
            )}
            
            {result.metadata.sampleRate && (
              <div className="flex justify-between">
                <span className="text-gray-600">采样率:</span>
                <span className="font-medium">{result.metadata.sampleRate} Hz</span>
              </div>
            )}
            
            {result.metadata.channels && (
              <div className="flex justify-between">
                <span className="text-gray-600">声道数:</span>
                <span className="font-medium">{result.metadata.channels}</span>
              </div>
            )}

            {result.enhancements.length > 0 && (
              <div>
                <span className="text-gray-600">应用的增强:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.enhancements.map((enhancement, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {enhancement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaProcessor