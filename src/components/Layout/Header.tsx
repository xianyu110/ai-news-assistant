import { Search, Menu, Bell, Settings, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { useNewsStore } from '@/stores/newsStore'
import { newsAPI } from '@/utils/api'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Header() {
  const { sidebarOpen, setSidebarOpen, setSearchOpen } = useUserStore()
  const { setNews, setStats, setLoading } = useNewsStore()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (refreshing) return
    
    setRefreshing(true)
    setLoading('loading')
    
    try {
      const result = await newsAPI.getNews(true) // Force refresh
      if (result.success) {
        setNews(result.data)
        setStats(result.stats)
        toast.success(`已更新 ${result.data.length} 条新闻`, {
          icon: '🔄',
        })
      } else {
        throw new Error(result.error || '刷新失败')
      }
    } catch (error) {
      toast.error('刷新失败，请稍后重试')
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
      setLoading('idle')
    }
  }

  return (
    <motion.header 
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 md:static bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50 safe-top"
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                AI快讯助手
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                每日AI资讯，实时更新
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <a
            href="https://link3.cc/maynorai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            由 MaynorAI 提供技术支持
          </a>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="搜索"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="通知"
          >
            <Bell className="w-5 h-5" />
          </button>
          
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="设置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.header>
  )
}