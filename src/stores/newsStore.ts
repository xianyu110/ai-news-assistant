import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NewsItem, NewsStats, SearchFilters, LoadingState, SortOption } from '@/types'

// Helper function to filter news
const filterNews = (state: Partial<NewsState>): NewsItem[] => {
  if (!state.news || !state.filters) return []
  
  let filtered = [...state.news]
  const { query, category, source, dateRange, tags } = state.filters

  // Text search
  if (query?.trim()) {
    const searchTerm = query.toLowerCase()
    filtered = filtered.filter(news => 
      news.title.toLowerCase().includes(searchTerm) ||
      news.content?.toLowerCase().includes(searchTerm) ||
      news.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  // Category filter
  if (category) {
    filtered = filtered.filter(news => news.category === category)
  }

  // Source filter
  if (source) {
    filtered = filtered.filter(news => news.source === source)
  }

  // Date range filter
  if (dateRange?.start || dateRange?.end) {
    filtered = filtered.filter(news => {
      const newsDate = new Date(news.publishTime)
      const start = dateRange.start ? new Date(dateRange.start) : null
      const end = dateRange.end ? new Date(dateRange.end) : null
      
      if (start && newsDate < start) return false
      if (end && newsDate > end) return false
      return true
    })
  }

  // Tags filter
  if (tags && tags.length > 0) {
    filtered = filtered.filter(news => 
      tags.some(tag => news.tags.includes(tag))
    )
  }

  // Sort
  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'newest':
        return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
      case 'oldest':
        return new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime()
      case 'source':
        return a.source.localeCompare(b.source)
      case 'relevance':
      default:
        return 0
    }
  })

  return filtered
}

interface NewsState {
  // Data
  news: NewsItem[]
  filteredNews: NewsItem[]
  stats: NewsStats | null
  
  // UI State
  loading: LoadingState
  error: string | null
  selectedNews: NewsItem | null
  
  // Filters & Search
  filters: SearchFilters
  sortBy: SortOption
  searchQuery: string
  
  // Pagination
  currentPage: number
  hasMore: boolean
  
  // Cache
  lastUpdate: number
  cacheHash: string
  
  // Actions
  setNews: (news: NewsItem[]) => void
  addNews: (news: NewsItem[]) => void
  setStats: (stats: NewsStats) => void
  setLoading: (loading: LoadingState) => void
  setError: (error: string | null) => void
  setSelectedNews: (news: NewsItem | null) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  setSortBy: (sortBy: SortOption) => void
  setSearchQuery: (query: string) => void
  setCurrentPage: (page: number) => void
  setHasMore: (hasMore: boolean) => void
  toggleFavorite: (newsId: string) => void
  filterNews: () => void
  clearFilters: () => void
  reset: () => void
}

const initialState = {
  news: [],
  filteredNews: [],
  stats: null,
  loading: 'idle' as LoadingState,
  error: null,
  selectedNews: null,
  filters: {
    query: '',
    category: '',
    source: '',
    dateRange: {},
    tags: [],
  },
  sortBy: 'newest' as SortOption,
  searchQuery: '',
  currentPage: 1,
  hasMore: true,
  lastUpdate: 0,
  cacheHash: '',
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set) => ({
      ...initialState,

      setNews: (news) => set((state) => {
        const newState = { ...state, news, lastUpdate: Date.now() }
        return { ...newState, filteredNews: filterNews(newState) }
      }),

      addNews: (news) => set((state) => {
        const existingIds = new Set(state.news.map(n => n.id))
        const newNews = news.filter(n => !existingIds.has(n.id))
        const updatedNews = [...state.news, ...newNews]
        const newState = { ...state, news: updatedNews }
        return { ...newState, filteredNews: filterNews(newState) }
      }),

      setStats: (stats) => set({ stats }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setSelectedNews: (selectedNews) => set({ selectedNews }),

      setFilters: (filters) => set((state) => {
        const newFilters = { ...state.filters, ...filters }
        const newState = { ...state, filters: newFilters, currentPage: 1 }
        return { ...newState, filteredNews: filterNews(newState) }
      }),

      setSortBy: (sortBy) => set((state) => {
        const newState = { ...state, sortBy }
        return { ...newState, filteredNews: filterNews(newState) }
      }),

      setSearchQuery: (query) => set((state) => {
        const newFilters = { ...state.filters, query }
        const newState = { ...state, searchQuery: query, filters: newFilters, currentPage: 1 }
        return { ...newState, filteredNews: filterNews(newState) }
      }),

      setCurrentPage: (currentPage) => set({ currentPage }),

      setHasMore: (hasMore) => set({ hasMore }),

      toggleFavorite: (newsId) => set((state) => {
        const updatedNews = state.news.map(n => 
          n.id === newsId ? { ...n, isFavorited: !n.isFavorited } : n
        )
        const newState = { ...state, news: updatedNews }
        return { ...newState, filteredNews: filterNews(newState) }
      }),

      filterNews: () => set((state) => {
        return { ...state, filteredNews: filterNews(state) }
      }),

      clearFilters: () => set((state) => {
        const newState = {
          ...state,
          filters: initialState.filters,
          searchQuery: '',
          sortBy: 'newest' as SortOption,
          currentPage: 1
        }
        return { ...newState, filteredNews: filterNews(newState) }
      }),

      reset: () => set(() => ({ ...initialState })),
    }),
    {
      name: 'news-store',
      partialize: (state) => ({
        news: state.news,
        stats: state.stats,
        lastUpdate: state.lastUpdate,
        cacheHash: state.cacheHash,
      }),
    }
  )
)