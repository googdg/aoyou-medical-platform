import React from 'react'
import { useParams } from 'react-router-dom'

const TranscriptionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          转录详情 - {id}
        </h1>
        
        <div className="text-center py-12">
          <p className="text-gray-600">
            转录页面功能开发中...
          </p>
        </div>
      </div>
    </div>
  )
}

export default TranscriptionPage