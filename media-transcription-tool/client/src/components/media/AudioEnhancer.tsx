import React, { useState } from 'react'
import { 
  Zap, 
  Volume2, 
  Waves, 
  Settings, 
  Play,
  Pause,
  Download,
  Loader,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Sliders
} from 'lucide-react'
import { apiClient } from '../../services/api'
import { AudioEnhancementResult, AudioProcessingOptions, EqualizerSettings } from '../../types'

interface AudioEnhancerProps {
  fileId: string
  className?: string
  onEnhancementComplete?: (result: AudioEnhancementResult) => void
}

const AudioEnhancer: React.FC<AudioEnhancerProps> = ({
  fileId,
  className = '',
  onEnhancementComplete
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancementResult, setEnhancementResult] = useState<AudioEnhancementResult>()
  const [error, setError] = useState<string>()
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Enhancement options
  const [options, setOptions] = useState<AudioProcessingOptions>({
    noiseReduction: true,
    volumeNormalization: true,
    enhanceAudio: true,
    analyzeQuality: true,
    compressor: false,
    equalizer: undefined
  })

  // Equalizer settings
  const [eqSettings, setEqSettings] = useState<EqualizerSettings>({
    lowGain: 0,
    midGain: 0,
    highGain: 0,
    lowFreq: 100,
    midFreq: 1000,
    highFreq: 8000
  })

  const handleEnhance = async () => {
    try {
      setIsEnhancing(true)
      setError(undefined)

      const enhancementOptions = {
        ...options,
        equalizer: options.equalizer ? eqSettings : undefined
      }

      const result = await apiClient.enhanceAudio(fileId, enhancementOptions)
      setEnhancementResult(result)
      
      if (onEnhancementComplete) {
        onEnhancementComplete(result)
      }
    } catch (error) {
      console.error('Failed to enhance audio:', error)
      setError(error instanceof Error ? error.message : '音频增强失败')
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleOptionChange = (key: keyof AudioProcessingOptions, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleEqChange = (key: keyof EqualizerSettings, value: number) => {
    setEqSettings(prev => ({ ...prev, [key]: value }))
  }

  const getQualityImprovement = (): string => {
    if (!enhancementResult?.qualityImprovement) return ''
    
    const improvement = enhancementResult.qualityImprovement
    if (improvement > 10) return '显著提升'
    if (improvement > 5) return '明显提升'
    if (improvement > 0) return '轻微提升'
    if (improvement === 0) return '无变化'
    return '质量下降'
  }

  const getImprovementColor = (): string => {
    if (!enhancementResult?.qualityImprovement) return 'text-gray-600'
    
    const improvement = enhancementResult.qualityImprovement
    if (improvement > 10) return 'text-green-600'
    if (improvement > 5) return 'text-blue-600'
    if (improvement > 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">音频增强</h3>
            <p className="text-sm text-gray-600">智能优化音频质量，提升转录准确度</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>{showAdvanced ? '简单模式' : '高级设置'}</span>
        </button>
      </div>

      {/* Basic Options */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-gray-700">基础增强选项</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.noiseReduction}
              onChange={(e) => handleOptionChange('noiseReduction', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div className="flex items-center space-x-2">
              <Waves className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">噪声降低</div>
                <div className="text-xs text-gray-600">去除背景噪音</div>
              </div>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.volumeNormalization}
              onChange={(e) => handleOptionChange('volumeNormalization', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">音量标准化</div>
                <div className="text-xs text-gray-600">统一音量水平</div>
              </div>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.compressor}
              onChange={(e) => handleOptionChange('compressor', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">动态压缩</div>
                <div className="text-xs text-gray-600">平衡音量变化</div>
              </div>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.equalizer !== undefined}
              onChange={(e) => handleOptionChange('equalizer', e.target.checked ? eqSettings : undefined)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">均衡器</div>
                <div className="text-xs text-gray-600">调节频率响应</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700">高级设置</h4>
          
          {/* Equalizer Settings */}
          {options.equalizer && (
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">均衡器设置</h5>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    低频增益 ({eqSettings.lowFreq}Hz)
                  </label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={eqSettings.lowGain}
                    onChange={(e) => handleEqChange('lowGain', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-center text-gray-600 mt-1">
                    {eqSettings.lowGain?.toFixed(1)} dB
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    中频增益 ({eqSettings.midFreq}Hz)
                  </label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={eqSettings.midGain}
                    onChange={(e) => handleEqChange('midGain', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-center text-gray-600 mt-1">
                    {eqSettings.midGain?.toFixed(1)} dB
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    高频增益 ({eqSettings.highFreq}Hz)
                  </label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={eqSettings.highGain}
                    onChange={(e) => handleEqChange('highGain', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-center text-gray-600 mt-1">
                    {eqSettings.highGain?.toFixed(1)} dB
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Target Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                目标采样率
              </label>
              <select
                value={options.targetSampleRate || 16000}
                onChange={(e) => setOptions(prev => ({ ...prev, targetSampleRate: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={8000}>8 kHz</option>
                <option value={16000}>16 kHz (推荐)</option>
                <option value={22050}>22.05 kHz</option>
                <option value={44100}>44.1 kHz</option>
                <option value={48000}>48 kHz</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                目标声道数
              </label>
              <select
                value={options.targetChannels || 1}
                onChange={(e) => setOptions(prev => ({ ...prev, targetChannels: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={1}>单声道 (推荐)</option>
                <option value={2}>立体声</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                目标比特率 (MP3)
              </label>
              <select
                value={options.targetBitrate || 128}
                onChange={(e) => setOptions(prev => ({ ...prev, targetBitrate: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={64}>64 kbps</option>
                <option value={128}>128 kbps</option>
                <option value={192}>192 kbps</option>
                <option value={256}>256 kbps</option>
                <option value={320}>320 kbps</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Enhancement Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleEnhance}
          disabled={isEnhancing}
          className="flex items-center space-x-3 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isEnhancing ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
          <span>{isEnhancing ? '正在增强...' : '开始增强'}</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-800">增强失败</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Enhancement Result */}
      {enhancementResult && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-800">增强完成</span>
          </div>

          {/* Quality Improvement */}
          {enhancementResult.qualityImprovement !== undefined && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">质量提升</span>
                <span className={`text-sm font-semibold ${getImprovementColor()}`}>
                  {enhancementResult.qualityImprovement > 0 ? '+' : ''}
                  {enhancementResult.qualityImprovement?.toFixed(1)} 分
                </span>
              </div>
              <div className="text-xs text-green-700 mt-1">
                {getQualityImprovement()}
              </div>
            </div>
          )}

          {/* Applied Improvements */}
          {enhancementResult.improvements.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="text-sm font-medium text-blue-800 mb-2">应用的增强处理</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                {enhancementResult.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Processing Time */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>处理时间</span>
            <span>{(enhancementResult.processingTime / 1000).toFixed(1)} 秒</span>
          </div>

          {/* Quality Comparison */}
          {enhancementResult.qualityBefore && enhancementResult.qualityAfter && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-600 mb-1">增强前</div>
                <div className="text-lg font-semibold text-gray-900">
                  {enhancementResult.qualityBefore.qualityScore?.toFixed(0) || 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs font-medium text-green-600 mb-1">增强后</div>
                <div className="text-lg font-semibold text-green-900">
                  {enhancementResult.qualityAfter.qualityScore?.toFixed(0) || 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AudioEnhancer