import { motion } from 'framer-motion'
import { Moon, Sun, Monitor, RefreshCw, Bell, Mail } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    viewMode,
    setViewMode,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    notifications,
    setNotifications,
  } = useUserStore()

  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  const themeOptions = [
    { value: 'light', label: '浅色', icon: Sun },
    { value: 'dark', label: '深色', icon: Moon },
    { value: 'system', label: '跟随系统', icon: Monitor },
  ]

  const refreshIntervalOptions = [
    { value: 1 * 60 * 1000, label: '1分钟' },
    { value: 5 * 60 * 1000, label: '5分钟' },
    { value: 10 * 60 * 1000, label: '10分钟' },
    { value: 30 * 60 * 1000, label: '30分钟' },
    { value: 60 * 60 * 1000, label: '1小时' },
  ]

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('请输入有效的邮箱地址')
      return
    }
    
    setIsSubscribing(true)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Subscription failed');
      }
      
      toast.success('订阅成功！感谢您的关注')
      setEmail('')
    } catch (error: any) {
      toast.error(error.message || '订阅失败，请稍后再试')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          设置
        </h1>

        <div className="space-y-6">
          {/* Newsletter Subscription */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              邮件订阅 (Newsletter)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              订阅每日AI快讯精选，将最新动态直接发送到您的邮箱。
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="请输入您的邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input flex-grow"
                disabled={isSubscribing}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubscribing}
              >
                {isSubscribing ? '订阅中...' : '订阅'}
              </button>
            </form>
          </div>

          {/* Theme Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              外观主题
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value as any)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    theme === option.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <option.icon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              显示模式
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  列表类型
                </label>
                <select
                  value={viewMode.type}
                  onChange={(e) => setViewMode({ ...viewMode, type: e.target.value as any })}
                  className="w-full input"
                >
                  <option value="list">列表视图</option>
                  <option value="grid">网格视图</option>
                  <option value="compact">紧凑视图</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  显示密度
                </label>
                <select
                  value={viewMode.density}
                  onChange={(e) => setViewMode({ ...viewMode, density: e.target.value as any })}
                  className="w-full input"
                >
                  <option value="comfortable">舒适</option>
                  <option value="cozy">适中</option>
                  <option value="compact">紧凑</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auto Refresh Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              自动刷新
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">启用自动刷新</span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {autoRefresh && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    刷新间隔
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-full input"
                  >
                    {refreshIntervalOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              通知设置
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">启用通知</span>
                <button
                  onClick={() => setNotifications({ ...notifications, enabled: !notifications.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {notifications.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  通知功能正在开发中，敬请期待。
                </motion.div>
              )}
            </div>
          </div>

          {/* About */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              关于
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>AI快讯助手 v2.0</p>
              <p>基于 React + TypeScript + Tailwind CSS 构建</p>
              <p>每日更新最新AI行业资讯</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}