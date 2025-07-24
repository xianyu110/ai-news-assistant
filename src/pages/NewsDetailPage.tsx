import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Share2, ExternalLink, Clock, Tag } from 'lucide-react'
import { useNewsStore } from '@/stores/newsStore'
import { useUserStore } from '@/stores/userStore'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { news } = useNewsStore()
  const { toggleFavorite, isFavorited } = useUserStore()
  
  const newsItem = news.find(item => item.id === id)
  
  if (!newsItem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-16 min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            快讯不存在
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            您要查看的快讯可能已被删除或不存在
          </p>
          <Link
            to="/news"
            className="btn btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回快讯列表
          </Link>
        </div>
      </motion.div>
    )
  }

  const favorited = isFavorited(newsItem.id)

  const handleFavorite = () => {
    toggleFavorite(newsItem.id)
    toast.success(
      favorited ? '已取消收藏' : '已添加收藏',
      { 
        icon: favorited ? '💔' : '❤️',
        duration: 1500 
      }
    )
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.summary || newsItem.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-6"
        >
          <Link
            to="/news"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回快讯列表
          </Link>
        </motion.div>

        {/* Article */}
        <motion.article
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-8"
        >
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
            <span className={`badge ${getCategoryColor(newsItem.category)}`}>
              {newsItem.category}
            </span>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              {format(new Date(newsItem.publishTime), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              来源：{newsItem.source}
            </span>
            {newsItem.readTime && (
              <span className="text-gray-500 dark:text-gray-400">
                {newsItem.readTime}分钟阅读
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {newsItem.title}
          </h1>

          {/* Tags */}
          {newsItem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {newsItem.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            {newsItem.content ? (
              <div className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                {newsItem.content}
              </div>
            ) : newsItem.summary ? (
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {newsItem.summary}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">
                暂无详细内容
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleFavorite}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  favorited
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                <span>{favorited ? '已收藏' : '收藏'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>分享</span>
              </button>

              {newsItem.url && (
                <a
                  href={newsItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>查看原文</span>
                </a>
              )}
            </div>
          </div>
        </motion.article>

        {/* Related News */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            相关快讯
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {news
              .filter(item => 
                item.id !== newsItem.id && 
                (item.category === newsItem.category || 
                 item.tags.some(tag => newsItem.tags.includes(tag)))
              )
              .slice(0, 4)
              .map(relatedNews => (
                <Link
                  key={relatedNews.id}
                  to={`/news/${relatedNews.id}`}
                  className="card p-4 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`badge text-xs ${getCategoryColor(relatedNews.category)}`}>
                      {relatedNews.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
                        {relatedNews.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(relatedNews.publishTime), 'M月d日 HH:mm')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}