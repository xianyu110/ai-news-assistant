import { motion } from 'framer-motion'
import { Heart, Trash2 } from 'lucide-react'
import { useNewsStore } from '@/stores/newsStore'
import { useUserStore } from '@/stores/userStore'
import NewsCard from '@/components/News/NewsCard'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const { news } = useNewsStore()
  const { favorites, toggleFavorite } = useUserStore()
  
  const favoriteNews = news.filter(item => favorites.includes(item.id))

  const handleClearAll = () => {
    if (favorites.length === 0) return
    
    const confirmed = window.confirm('确定要清空所有收藏吗？此操作不可撤销。')
    if (confirmed) {
      favorites.forEach(id => toggleFavorite(id))
      toast.success('已清空所有收藏')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              我的收藏
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {favoriteNews.length > 0 
                ? `共收藏了 ${favoriteNews.length} 条快讯` 
                : '还没有收藏任何快讯'}
            </p>
          </div>
          
          {favoriteNews.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空收藏</span>
            </button>
          )}
        </div>

        {/* Content */}
        {favoriteNews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              暂无收藏
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              在浏览快讯时点击心形图标，即可将感兴趣的快讯添加到收藏夹
            </p>
            <a
              href="/news"
              className="btn btn-primary"
            >
              去浏览快讯
            </a>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {favoriteNews.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NewsCard news={news} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}