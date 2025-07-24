import { motion } from 'framer-motion'
import { Heart, Clock, ExternalLink, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NewsItem } from '@/types'
import { useUserStore } from '@/stores/userStore'
import { useNewsStore } from '@/stores/newsStore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface NewsCardProps {
  news: NewsItem
  compact?: boolean
}

export default function NewsCard({ news, compact = false }: NewsCardProps) {
  const { toggleFavorite, isFavorited } = useUserStore()
  const { toggleFavorite: toggleNewsStoreFavorite } = useNewsStore()
  const favorited = isFavorited(news.id)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    toggleFavorite(news.id)
    toggleNewsStoreFavorite(news.id)
    
    toast.success(
      favorited ? '已取消收藏' : '已添加收藏',
      { 
        icon: favorited ? '💔' : '❤️',
        duration: 1500 
      }
    )
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary || news.title,
        url: window.location.origin + `/news/${news.id}`,
      })
    } else {
      navigator.clipboard.writeText(window.location.origin + `/news/${news.id}`)
      toast.success('链接已复制到剪贴板')
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      '投融资': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      '开源项目': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      '产品发布': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      '行业动态': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      '技术研究': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      '综合资讯': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    }
    return colors[category as keyof typeof colors] || colors['综合资讯']
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link
        to={`/news/${news.id}`}
        className="block card p-4 hover:shadow-md transition-all duration-200 group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Category and Time */}
            <div className="flex items-center space-x-3 mb-2">
              <span className={`badge text-xs ${getCategoryColor(news.category)}`}>
                {news.category}
              </span>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{format(new Date(news.publishTime), 'HH:mm')}</span>
              </div>
              {news.readTime && (
                <span className="text-xs text-gray-500">
                  {news.readTime}分钟阅读
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className={`font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2 ${
              compact ? 'text-sm' : 'text-base'
            }`}>
              {news.title}
            </h3>

            {/* Summary */}
            {!compact && news.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {news.summary}
              </p>
            )}

            {/* Tags */}
            {news.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {news.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {news.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{news.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Source */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                来源：{news.source}
              </span>
              
              <div className="flex items-center space-x-2">
                {news.url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.open(news.url, '_blank')
                    }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="查看原文"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                
                <button
                  onClick={handleShare}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="分享"
                >
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={`ml-4 p-2 rounded-full transition-all duration-200 ${
              favorited
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
            title={favorited ? '取消收藏' : '收藏'}
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>
    </motion.div>
  )
}