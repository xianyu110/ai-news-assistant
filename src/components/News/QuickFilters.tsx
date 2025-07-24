import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useNewsStore } from '@/stores/newsStore'

const categories = [
  { id: '', label: '全部' },
  { id: '投融资', label: '投融资' },
  { id: '开源项目', label: '开源项目' },
  { id: '产品发布', label: '产品发布' },
  { id: '行业动态', label: '行业动态' },
  { id: '技术研究', label: '技术研究' },
  { id: '综合资讯', label: '综合资讯' },
]

export default function QuickFilters() {
  const { filters, setFilters, clearFilters, stats } = useNewsStore()
  
  const hasActiveFilters = filters.category || filters.source || filters.query.trim()

  return (
    <div className="space-y-3">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilters({ category: category.id })}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              filters.category === category.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category.label}
            {category.id && stats && (
              <span className="ml-1 text-xs opacity-75">
                ({stats.categories.includes(category.id) ? 
                  stats.categories.filter(c => c === category.id).length : 0})
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Source Filters */}
      {stats?.sources && stats.sources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 font-medium mr-2">来源：</span>
          <button
            onClick={() => setFilters({ source: '' })}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              !filters.source
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
            }`}
          >
            全部
          </button>
          {stats.sources.slice(0, 5).map((source) => (
            <button
              key={source}
              onClick={() => setFilters({ source })}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filters.source === source
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      )}

      {/* Active Filters & Clear */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2"
        >
          <span className="text-sm text-gray-500">活跃筛选：</span>
          
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 text-xs rounded-full">
              分类：{filters.category}
              <button
                onClick={() => setFilters({ category: '' })}
                className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.source && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 text-xs rounded-full">
              来源：{filters.source}
              <button
                onClick={() => setFilters({ source: '' })}
                className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.query.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 text-xs rounded-full">
              搜索：{filters.query.trim()}
              <button
                onClick={() => setFilters({ query: '' })}
                className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-primary-600 underline"
          >
            清除全部
          </button>
        </motion.div>
      )}
    </div>
  )
}