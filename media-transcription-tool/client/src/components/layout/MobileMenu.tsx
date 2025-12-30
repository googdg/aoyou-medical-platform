import React, { useState, useEffect } from 'react'
import { X, FileText, History, Settings, HelpCircle } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  currentPage: string
  onPageChange: (page: string) => void
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentPage,
  onPageChange
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const menuItems = [
    {
      id: 'home',
      label: '转录工具',
      icon: FileText,
      description: '上传文件或输入链接开始转录'
    },
    {
      id: 'history',
      label: '历史记录',
      icon: History,
      description: '查看之前的转录记录'
    },
    {
      id: 'settings',
      label: '设置',
      icon: Settings,
      description: '配置转录选项和偏好'
    },
    {
      id: 'help',
      label: '帮助',
      icon: HelpCircle,
      description: '使用指南和常见问题'
    }
  ]

  const handleItemClick = (itemId: string) => {
    onPageChange(itemId)
    onClose()
  }

  if (!isOpen && !isAnimating) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              AI转录工具
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-4">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              const isActive = currentPage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className={`w-6 h-6 mt-0.5 flex-shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500 text-center">
            <p>基于 OpenAI Whisper</p>
            <p className="mt-1">高精度语音识别</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileMenu