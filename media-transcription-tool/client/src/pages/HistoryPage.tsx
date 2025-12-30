import React from 'react'
import { FileText, Clock, Download } from 'lucide-react'

const HistoryPage: React.FC = () => {
  // Mock data for demonstration
  const mockHistory = [
    {
      id: '1',
      title: '技术分享会录音.mp3',
      status: 'completed',
      createdAt: '2024-01-15 14:30',
      duration: '45:32',
      language: 'zh',
      confidence: 0.95
    },
    {
      id: '2',
      title: 'YouTube: React 最佳实践',
      status: 'processing',
      createdAt: '2024-01-15 13:15',
      duration: '28:45',
      language: 'en',
      confidence: null
    },
    {
      id: '3',
      title: '产品需求讨论.mp4',
      status: 'failed',
      createdAt: '2024-01-14 16:20',
      duration: '1:12:30',
      language: 'zh',
      confidence: null
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'processing':
        return '处理中'
      case 'failed':
        return '失败'
      default:
        return '未知'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          历史记录
        </h1>
        <p className="text-gray-600">
          查看和管理您的转录历史记录
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总转录数</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总时长</p>
              <p className="text-2xl font-bold text-gray-900">12.5h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">平均准确率</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            转录记录
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {mockHistory.map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.createdAt}</span>
                    </span>
                    <span>时长: {item.duration}</span>
                    <span>语言: {item.language === 'zh' ? '中文' : '英文'}</span>
                    {item.confidence && (
                      <span>准确率: {Math.round(item.confidence * 100)}%</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {item.status === 'completed' && (
                    <>
                      <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        查看
                      </button>
                      <button className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        导出
                      </button>
                    </>
                  )}
                  {item.status === 'processing' && (
                    <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      取消
                    </button>
                  )}
                  {item.status === 'failed' && (
                    <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      重试
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockHistory.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无转录记录
            </h3>
            <p className="text-gray-600">
              开始您的第一个转录任务吧！
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage