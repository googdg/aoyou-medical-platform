import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Volume2, 
  Waves, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Info,
  Loader,
  RefreshCw,
  Zap
} from 'lucide-react'
import { apiClient } from '../../services/api'
import { AudioQualityInfo } from '../../types'

interface AudioQualityAnalyzerProps {
  fileId?: string
  qualityData?: AudioQualityInfo
  isLoading?: boolean
  className?: string
  onAnalysisComplete?: (qualityData: AudioQualityInfo) => void
}

const AudioQualityAnalyzer: React.FC<AudioQualityAnalyzerProps> = ({
  fileId,
  qualityData: initialQualityData,
  isLoading: externalLoading = false,
  className = '',
  onAnalysisComplete
}) => {
  const [qualityData, setQualityData] = useState<AudioQualityInfo | undefined>(initialQualityData)
  const [isLoading, setIsLoading] = useState(externalLoading)
  const [error, setError] = useState<string>()

  // 自动分析音频质量
  useEffect(() => {
    if (fileId && !qualityData && !externalLoading) {
      analyzeQuality()
    }
  }, [fileId])

  const analyzeQuality = async () => {
    if (!fileId) return

    try {
      setIsLoading(true)
      setError(undefined)
      
      const result = await apiClient.analyzeAudioQuality(fileId)
      setQualityData(result.qualityAnalysis)
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result.qualityAnalysis)
      }
    } catch (error) {
      console.error('Failed to analyze audio quality:', error)
      setError(error instanceof Error ? error.message : '音频质量分析失败')
    } finally {
      setIsLoading(false)
    }
  }

  const getQualityColor = (score?: number): string => {
    if (!score) return 'text-gray-600'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (score?: number): string => {
    if (!score) return 'bg-gray-500'
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatMetricValue = (value: number | undefined, unit: string): string => {
    if (value === undefined) return 'N/A'
    return `${value.toFixed(1)} ${unit}`
  }

  const getMetricStatus = (value: number | undefined, thresholds: { good: number; fair: number }): 'good' | 'fair' | 'poor' => {
    if (value === undefined) return 'fair'
    if (value >= thresholds.good) return 'good'
    if (value >= thresholds.fair) return 'fair'
    return 'poor'
  }

  const getQualityLevel = (score?: number): string => {
    if (!score) return '未知'
    if (score >= 80) return '优秀'
    if (score >= 60) return '良好'
    if (score >= 40) return '一般'
    return '较差'
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <Loader className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="text-gray-600">正在分析音频质量...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-3">{error}</p>
          {fileId && (
            <button
              onClick={analyzeQuality}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重新分析</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!qualityData) {
    return (
      <div className={`bg-gray-50 rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="mb-3">暂无质量分析数据</p>
          {fileId && (
            <button
              onClick={analyzeQuality}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>开始分析</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  const qualityScore = qualityData.qualityScore || 0

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">音频质量分析</h3>
            <p className="text-sm text-gray-600">详细的音频质量指标和建议</p>
          </div>
        </div>
        
        {/* Overall Quality Score */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${getQualityColor(qualityScore)}`}>
            {qualityScore.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            质量评分
          </div>
          {fileId && (
            <button
              onClick={analyzeQuality}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600 flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>重新分析</span>
            </button>
          )}
        </div>
      </div>

      {/* Quality Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">整体质量</span>
          <span className={`text-sm font-medium ${getQualityColor(qualityScore)}`}>
            {getQualityLevel(qualityScore)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(qualityScore)}`}
            style={{ width: `${qualityScore}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Signal-to-Noise Ratio */}
        {qualityData.snr !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Waves className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">信噪比</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatMetricValue(qualityData.snr, 'dB')}
            </div>
            <div className={`text-xs ${
              getMetricStatus(qualityData.snr, { good: 20, fair: 10 }) === 'good' ? 'text-green-600' :
              getMetricStatus(qualityData.snr, { good: 20, fair: 10 }) === 'fair' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {getMetricStatus(qualityData.snr, { good: 20, fair: 10 }) === 'good' ? '优秀' :
               getMetricStatus(qualityData.snr, { good: 20, fair: 10 }) === 'fair' ? '一般' : '较差'}
            </div>
          </div>
        )}

        {/* Dynamic Range */}
        {qualityData.dynamicRange !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">动态范围</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatMetricValue(qualityData.dynamicRange, 'dB')}
            </div>
            <div className={`text-xs ${
              getMetricStatus(qualityData.dynamicRange, { good: 15, fair: 8 }) === 'good' ? 'text-green-600' :
              getMetricStatus(qualityData.dynamicRange, { good: 15, fair: 8 }) === 'fair' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {getMetricStatus(qualityData.dynamicRange, { good: 15, fair: 8 }) === 'good' ? '丰富' :
               getMetricStatus(qualityData.dynamicRange, { good: 15, fair: 8 }) === 'fair' ? '适中' : '受限'}
            </div>
          </div>
        )}

        {/* Peak Level */}
        {qualityData.peakLevel !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">峰值电平</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatMetricValue(qualityData.peakLevel, 'dB')}
            </div>
            <div className={`text-xs ${
              qualityData.peakLevel <= -3 ? 'text-green-600' :
              qualityData.peakLevel <= 0 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {qualityData.peakLevel <= -3 ? '安全' :
               qualityData.peakLevel <= 0 ? '临界' : '削波'}
            </div>
          </div>
        )}

        {/* RMS Level */}
        {qualityData.rmsLevel !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">RMS电平</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatMetricValue(qualityData.rmsLevel, 'dB')}
            </div>
            <div className={`text-xs ${
              qualityData.rmsLevel >= -25 && qualityData.rmsLevel <= -16 ? 'text-green-600' :
              qualityData.rmsLevel >= -35 && qualityData.rmsLevel <= -10 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {qualityData.rmsLevel >= -25 && qualityData.rmsLevel <= -16 ? '理想' :
               qualityData.rmsLevel >= -35 && qualityData.rmsLevel <= -10 ? '可接受' : '需调整'}
            </div>
          </div>
        )}
      </div>

      {/* Clipping Detection */}
      {qualityData.clipping !== undefined && (
        <div className={`mb-4 p-3 rounded-lg border ${
          qualityData.clipping 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center space-x-2">
            {qualityData.clipping ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-sm font-medium ${
              qualityData.clipping ? 'text-red-800' : 'text-green-800'
            }`}>
              削波检测: {qualityData.clipping ? '检测到削波失真' : '无削波失真'}
            </span>
          </div>
        </div>
      )}

      {/* Silence Ratio */}
      {qualityData.silenceRatio !== undefined && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">静音比例</span>
            <span className="text-sm text-gray-900">
              {(qualityData.silenceRatio * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                qualityData.silenceRatio > 0.3 ? 'bg-red-500' : 
                qualityData.silenceRatio > 0.1 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${qualityData.silenceRatio * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Recommendations */}
      {qualityData.recommendations && qualityData.recommendations.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800">优化建议</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            {qualityData.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quality Explanation */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-2">质量指标说明</h5>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>信噪比 (SNR):</strong> 信号与噪音的比值，越高越好 (>20dB 优秀)</p>
          <p><strong>动态范围:</strong> 最大与最小音量差，适中范围有利于语音识别</p>
          <p><strong>峰值电平:</strong> 最大音量，应低于 -3dB 避免削波失真</p>
          <p><strong>RMS电平:</strong> 平均音量，-16 到 -25 dB 为理想范围</p>
          <p><strong>削波检测:</strong> 检测音频是否存在失真</p>
          <p><strong>静音比例:</strong> 音频中静音部分的占比</p>
        </div>
      </div>
    </div>
  )
}

export default AudioQualityAnalyzer