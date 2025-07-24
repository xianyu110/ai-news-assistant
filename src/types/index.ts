export interface NewsItem {
  id: string
  title: string
  content?: string
  summary?: string
  source: string
  url?: string
  publishTime: string
  tags: string[]
  category: string
  isFavorited?: boolean
  readTime?: number
}

export interface NewsStats {
  totalCount: number
  todayCount: number
  categories: string[]
  sources: string[]
  lastUpdate: string
}

export interface NewsPagination {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface NewsResponse {
  success: boolean
  data: NewsItem[]
  stats: NewsStats
  pagination: NewsPagination
  updateTime: string
  error?: string
}

export interface SearchFilters {
  query: string
  category: string
  source: string
  dateRange: {
    start?: string
    end?: string
  }
  tags: string[]
}

export interface ViewMode {
  type: 'list' | 'grid' | 'compact'
  density: 'comfortable' | 'cozy' | 'compact'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  viewMode: ViewMode
  autoRefresh: boolean
  refreshInterval: number
  notifications: {
    enabled: boolean
    categories: string[]
  }
  favorites: string[]
}

export interface CacheData {
  data: NewsItem[]
  timestamp: number
  hash: string
}

export type LoadingState = 'idle' | 'loading' | 'error' | 'success'

export type SortOption = 'newest' | 'oldest' | 'relevance' | 'source'