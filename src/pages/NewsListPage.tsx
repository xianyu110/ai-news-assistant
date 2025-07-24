import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Filter, SortAsc } from 'lucide-react'
import { useNewsStore } from '@/stores/newsStore'
import { useUserStore } from '@/stores/userStore'
import { newsAPI } from '@/utils/api'
import NewsCard from '@/components/News/NewsCard'
import NewsListSkeleton from '@/components/News/NewsListSkeleton'
import QuickFilters from '@/components/News/QuickFilters'
import VirtualizedList from '@/components/VirtualizedList'
import { format, isToday, isYesterday } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function NewsListPage() {
  const { 
    filteredNews, 
    loading, 
    setNews, 
    setStats, 
    setLoading,
    filters,
    sortBy,
    setSortBy,
  } = useNewsStore()
  
  const { autoRefresh, refreshInterval } = useUserStore()

  // Fetch news data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: () => newsAPI.getNews(),
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchIntervalInBackground: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  useEffect(() => {
    if (data?.success) {
      setNews(data.data)
      setStats(data.stats)
    }
    setLoading(isLoading ? 'loading' : 'idle')
  }, [data, isLoading, setNews, setStats, setLoading])

  // Group news by date
  const groupedNews = filteredNews.reduce((groups, news) => {
    const date = format(new Date(news.publishTime), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(news)
    return groups
  }, {} as Record<string, typeof filteredNews>)

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) {
      return '今天'
    } else if (isYesterday(date)) {
      return '昨天'
    } else {
      return format(date, 'M月d日 EEEE', { locale: zhCN })
    }
  }

  if (isLoading && filteredNews.length === 0) {
    return (
      <div className="pt-16">
        <NewsListSkeleton />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="md:pt-0 pt-16 min-h-screen"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">📰</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">每日AI快讯</h1>
              <p className="text-primary-100">
                AI行业资讯 | 热点 | 融资 | 产品动态
              </p>
            </div>
          </div>
          
          <p className="text-primary-100 leading-relaxed max-w-2xl">
            AI工具集每日实时更新 AI 行业的最新资讯、新闻、热点、融资、产品动态、爆料等，
            让你随时了解人工智能领域最新趋势、更新突破和热门大事件。
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6 max-w-7xl">
        {/* Quick Filters & Controls */}
        <div className="mb-6">
          <QuickFilters />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input text-sm"
              >
                <option value="newest">最新发布</option>
                <option value="oldest">最早发布</option>
                <option value="source">按来源</option>
                <option value="relevance">相关性</option>
              </select>
              
              <button className="btn btn-ghost btn-sm">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              共找到 {filteredNews.length} 条快讯
            </div>
          </div>
        </div>

        {/* News List */}
        {filteredNews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              暂无匹配的快讯
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              尝试调整筛选条件或搜索关键词
            </p>
            <button 
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              刷新数据
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedNews)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, newsItems]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Date Header */}
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-primary-700 dark:text-primary-400">
                      {formatDateHeader(date)}
                    </h2>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    <span className="text-sm text-gray-500">
                      {newsItems.length} 条
                    </span>
                  </div>
                  
                  {/* News Cards */}
                  <div className="space-y-3">
                    <VirtualizedList
                      items={newsItems}
                      itemHeight={160}
                      renderItem={({ item, index }) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <NewsCard news={item} />
                        </motion.div>
                      )}
                    />
                  </div>
                </motion.div>
              ))}
          </div>
        )}

        {/* Load More */}
        {isLoading && filteredNews.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-8"
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-400">加载更多...</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}