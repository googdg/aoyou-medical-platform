import React, { useState } from 'react'
import { Settings, Info, ChevronDown, ChevronUp } from 'lucide-react'

interface TranscriptionOptionsProps {
  options: {
    language?: string
    model?: string
    includeTimestamps?: boolean
    wordTimestamps?: boolean
    temperature?: number
  }
  onChange: (options: any) => void
  disabled?: boolean
  className?: string
}

const TranscriptionOptions: React.FC<TranscriptionOptionsProps> = ({
  options,
  onChange,
  disabled = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleOptionChange = (key: string, value: any) => {
    onChange({
      ...options,
      [key]: value
    })
  }

  const languages = [
    { code: 'auto', name: '自动检测' },
    { code: 'zh', name: '中文' },
    { code: 'en', name: '英语' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'fr', name: '法语' },
    { code: 'de', name: '德语' },
    { code: 'es', name: '西班牙语' },
    { code: 'ru', name: '俄语' },
    { code: 'ar', name: '阿拉伯语' }
  ]

  const models = [
    { 
      key: 'tiny', 
      name: 'Tiny', 
      description: '最快速度，较低精度，适合快速预览',
      size: '~39MB',
      speed: '极快'
    },
    { 
      key: 'base', 
      name: 'Base', 
      description: '平衡速度和精度，推荐日常使用',
      size: '~74MB',
      speed: '快'
    },
    { 
      key: 'small', 
      name: 'Small', 
      description: '较高精度，适中速度',
      size: '~244MB',
      speed: '中等'
    },
    { 
      key: 'medium', 
      name: 'Medium', 
      description: '高精度，较慢速度',
      size: '~769MB',
      speed: '慢'
    },
    { 
      key: 'large', 
      name: 'Large', 
      description: '最高精度，最慢速度，适合专业用途',
      size: '~1550MB',
      speed: '很慢'
    }
  ]

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">转录选项</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            可选配置
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              语言选择
            </label>
            <select
              value={options.language || 'auto'}
              onChange={(e) => handleOptionChange('language', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              选择音频的主要语言，自动检测通常效果最佳
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              模型选择
            </label>
            <div className="space-y-2">
              {models.map((model) => (
                <label
                  key={model.key}
                  className={`
                    flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors
                    ${options.model === model.key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.key}
                    checked={options.model === model.key}
                    onChange={(e) => handleOptionChange('model', e.target.value)}
                    disabled={disabled}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{model.name}</span>
                      <span className="text-xs text-gray-500">({model.size})</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        model.speed === '极快' ? 'bg-green-100 text-green-700' :
                        model.speed === '快' ? 'bg-blue-100 text-blue-700' :
                        model.speed === '中等' ? 'bg-yellow-100 text-yellow-700' :
                        model.speed === '慢' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {model.speed}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <span>高级选项</span>
              <Info className="w-4 h-4 text-gray-400" />
            </h4>

            {/* Include Timestamps */}
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={options.includeTimestamps || false}
                onChange={(e) => handleOptionChange('includeTimestamps', e.target.checked)}
                disabled={disabled}
                className="mt-1 text-blue-600 focus:ring-blue-500 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">包含时间戳</span>
                <p className="text-xs text-gray-500">为每个文本段落添加时间戳信息，便于定位和编辑</p>
              </div>
            </label>

            {/* Word Timestamps */}
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={options.wordTimestamps || false}
                onChange={(e) => handleOptionChange('wordTimestamps', e.target.checked)}
                disabled={disabled}
                className="mt-1 text-blue-600 focus:ring-blue-500 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">词级时间戳</span>
                <p className="text-xs text-gray-500">为每个单词添加精确时间戳（处理时间更长，但精度更高）</p>
              </div>
            </label>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                温度参数 ({(options.temperature || 0).toFixed(1)})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={options.temperature || 0}
                onChange={(e) => handleOptionChange('temperature', parseFloat(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>保守 (0.0)</span>
                <span>平衡 (0.5)</span>
                <span>创造性 (1.0)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                控制输出的随机性，较低值产生更一致的结果，较高值可能产生更多变化
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">处理时间估算</p>
                <ul className="text-xs space-y-1">
                  <li>• Tiny/Base 模型：约为音频时长的 0.5-1 倍</li>
                  <li>• Small/Medium 模型：约为音频时长的 1-2 倍</li>
                  <li>• Large 模型：约为音频时长的 2-3 倍</li>
                  <li>• 启用词级时间戳会增加 20-30% 的处理时间</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TranscriptionOptions