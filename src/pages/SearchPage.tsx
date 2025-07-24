import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X, Clock, TrendingUp } from 'lucide-react'
import { useNewsStore } from '@/stores/newsStore'
import NewsCard from '@/components/News/NewsCard'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  
  const { 
    news, 
    setSearchQuery, 
    setFilters,
    stats 
  } = useNewsStore()

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim() && !selectedCategory && !selectedSource) return []
    
    return news.filter(item => {
      const matchesQuery = !query.trim() || 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content?.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      
      const matchesCategory = !selectedCategory || item.category === selectedCategory
      const matchesSource = !selectedSource || item.source === selectedSource
      
      return matchesQuery && matchesCategory && matchesSource
    })
  }, [news, query, selectedCategory, selectedSource])

  // Recent searches (mock data)
  const recentSearches = ['GPT-4', 'OpenAI', '融资', '开源', 'Google']
  const trendingSearches = ['ChatGPT', '人工智能', 'AI工具', '机器学习', '深度学习']

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    setSearchQuery(searchQuery)
    setFilters({
      query: searchQuery,
      category: selectedCategory,
      source: selectedSource,
    })
  }

  const clearSearch = () => {
    setQuery('')
    setSelectedCategory('')
    setSelectedSource('')
    setSearchQuery('')
    setFilters({
      query: '',
      category: '',
      source: '',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
            搜索AI资讯
          </h1>
          
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="搜索标题、内容或标签..."
              className="w-full pl-10 pr-20 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
              {(query || selectedCategory || selectedSource) && (
                <button
                  onClick={clearSearch}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分类
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full input"
                  >
                    <option value="">全部分类</option>
                    {stats?.categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    来源
                  </label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full input"
                  >
                    <option value="">全部来源</option>
                    {stats?.sources.map(source => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => handleSearch(query)}
                  className="btn btn-primary"
                >
                  应用筛选
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Search Suggestions */}
        {!query && !selectedCategory && !selectedSource && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Recent Searches */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  最近搜索
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(search => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Searches */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  热门搜索
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map(search => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {(query || selectedCategory || selectedSource) && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                搜索结果
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                找到 {searchResults.length} 条相关快讯
              </p>
            </div>

            {searchResults.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  没有找到相关结果
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  尝试使用不同的关键词或调整筛选条件
                </p>
                <button
                  onClick={clearSearch}
                  className="btn btn-primary"
                >
                  清除搜索条件
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((news, index) => (
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
        )}
      </div>
    </motion.div>
  )
}