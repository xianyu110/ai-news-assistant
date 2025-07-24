import { motion } from 'framer-motion'
import { RefreshCw, Trash2, Database, Clock, Wifi, Bug } from 'lucide-react'
import { useNewsStore } from '@/stores/newsStore'
import { useUserStore } from '@/stores/userStore'
import { newsAPI } from '@/utils/api'
import toast from 'react-hot-toast'

export default function DebugPage() {
  const { news, stats, loading, setLoading, setNews, setStats } = useNewsStore()
  const { debugMode, setDebugMode } = useUserStore()

  const cacheInfo = newsAPI.getCacheInfo()

  const handleClearCache = () => {
    newsAPI.clearCache()
    toast.success('缓存已清除')
  }

  const handleForceRefresh = async () => {
    setLoading('loading')
    try {
      const result = await newsAPI.getNews(true)
      if (result.success) {
        setNews(result.data)
        setStats(result.stats)
        toast.success('数据已强制刷新')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error('刷新失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setLoading('idle')
    }
  }

  const handleClearAllData = () => {
    const confirmed = window.confirm('确定要清除所有数据吗？这将清除缓存、收藏等所有本地数据。')
    if (confirmed) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  const debugInfo = [
    {
      label: '当前状态',
      value: loading,
      icon: Wifi,
      color: loading === 'loading' ? 'text-yellow-500' : loading === 'error' ? 'text-red-500' : 'text-green-500'
    },
    {
      label: '新闻总数',
      value: news.length,
      icon: Database,
      color: 'text-blue-500'
    },
    {
      label: '缓存状态',
      value: cacheInfo.hasCache ? `${cacheInfo.size} 条` : '无缓存',
      icon: Database,
      color: cacheInfo.hasCache ? 'text-green-500' : 'text-gray-500'
    },
    {
      label: '缓存时间',
      value: cacheInfo.hasCache ? new Date(cacheInfo.timestamp).toLocaleString() : '无',
      icon: Clock,
      color: 'text-purple-500'
    },
    {
      label: '分类数量',
      value: stats?.categories.length || 0,
      icon: Database,
      color: 'text-indigo-500'
    },
    {
      label: '数据源数',
      value: stats?.sources.length || 0,
      icon: Database,
      color: 'text-pink-500'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Bug className="w-8 h-8 mr-3" />
              调试工具
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              系统状态监控和数据管理工具
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">调试模式</span>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                debugMode ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  debugMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              系统状态
            </h2>
            <div className="space-y-4">
              {debugInfo.map(info => (
                <div key={info.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <info.icon className={`w-5 h-5 ${info.color}`} />
                    <span className="text-gray-700 dark:text-gray-300">{info.label}</span>
                  </div>
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {info.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              调试操作
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleForceRefresh}
                disabled={loading === 'loading'}
                className="w-full btn btn-primary flex items-center justify-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading === 'loading' ? 'animate-spin' : ''}`} />
                强制刷新数据
              </button>
              
              <button
                onClick={handleClearCache}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                <Database className="w-4 h-4 mr-2" />
                清除缓存
              </button>
              
              <button
                onClick={handleClearAllData}
                className="w-full btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清除所有数据
              </button>
            </div>
          </div>

          {/* Local Storage Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              本地存储
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">LocalStorage 使用情况:</span>
                <span className="font-mono">
                  {Math.round(JSON.stringify(localStorage).length / 1024)} KB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">存储项数量:</span>
                <span className="font-mono">{localStorage.length}</span>
              </div>
            </div>
          </div>

          {/* Performance Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              性能信息
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">页面加载时间:</span>
                <span className="font-mono">
                  {performance.now().toFixed(0)} ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">内存使用:</span>
                <span className="font-mono">
                  {(performance as any).memory?.usedJSHeapSize 
                    ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)} MB`
                    : '不可用'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">用户代理:</span>
                <span className="font-mono text-xs truncate max-w-32" title={navigator.userAgent}>
                  {navigator.userAgent.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Console */}
        {debugMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 card p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              调试控制台
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64">
              <div>$ Debug mode enabled</div>
              <div>$ News count: {news.length}</div>
              <div>$ Cache status: {cacheInfo.hasCache ? 'Active' : 'Empty'}</div>
              <div>$ Last update: {stats?.lastUpdate ? new Date(stats.lastUpdate).toISOString() : 'N/A'}</div>
              <div className="text-yellow-400">$ Ready for commands...</div>
              <div className="cursor animate-pulse">_</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}