import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Home, 
  Newspaper, 
  Heart, 
  Search, 
  Settings, 
  Bug,
  TrendingUp,
  Clock,
  Tag
} from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { useNewsStore } from '@/stores/newsStore'

const navItems = [
  { icon: Home, label: '首页', path: '/' },
  { icon: Newspaper, label: 'AI快讯', path: '/news' },
  { icon: Search, label: '搜索', path: '/search' },
  { icon: Heart, label: '收藏', path: '/favorites' },
  { icon: Settings, label: '设置', path: '/settings' },
  { icon: Bug, label: '调试', path: '/debug' },
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUserStore()
  const { stats } = useNewsStore()
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: -256 }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // On desktop, always show sidebar; on mobile, use sidebarOpen state
  const shouldAnimate = isDesktop ? "open" : (sidebarOpen ? "open" : "closed")

  return (
    <>
      <motion.aside
        initial="closed"
        animate={shouldAnimate}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 md:translate-x-0 md:static md:top-0 md:h-screen md:z-auto overflow-y-auto"
      >
        <div className="p-4 space-y-2">
          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Stats */}
          {stats && (
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                数据统计
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Newspaper className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">总快讯</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats.totalCount}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">今日新增</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {stats.todayCount}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">分类数</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {stats.categories.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600 dark:text-gray-400">更新时间</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(stats.lastUpdate).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Categories */}
          {stats?.categories && stats.categories.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                热门分类
              </h3>
              <div className="space-y-1">
                {stats.categories.slice(0, 6).map((category) => (
                  <button
                    key={category}
                    className="w-full text-left px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.aside>

    </>
  )
}