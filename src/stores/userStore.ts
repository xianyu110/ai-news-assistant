import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserPreferences, ViewMode } from '@/types'

interface UserState extends UserPreferences {
  // UI State
  sidebarOpen: boolean
  searchOpen: boolean
  debugMode: boolean
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setViewMode: (viewMode: ViewMode) => void
  setAutoRefresh: (enabled: boolean) => void
  setRefreshInterval: (interval: number) => void
  setNotifications: (notifications: UserPreferences['notifications']) => void
  addFavorite: (newsId: string) => void
  removeFavorite: (newsId: string) => void
  toggleFavorite: (newsId: string) => void
  isFavorited: (newsId: string) => boolean
  setSidebarOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setDebugMode: (enabled: boolean) => void
  reset: () => void
}

const initialState: UserPreferences = {
  theme: 'system',
  viewMode: {
    type: 'list',
    density: 'comfortable',
  },
  autoRefresh: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  notifications: {
    enabled: true,
    categories: [],
  },
  favorites: [],
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      sidebarOpen: window.innerWidth >= 768, // Desktop: open by default, Mobile: closed
      searchOpen: false,
      debugMode: false,

      setTheme: (theme) => set((state) => {
        // Apply theme to document
        const root = document.documentElement
        if (theme === 'dark') {
          root.classList.add('dark')
        } else if (theme === 'light') {
          root.classList.remove('dark')
        } else {
          // System preference
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          root.classList.toggle('dark', mediaQuery.matches)
        }
        
        return { ...state, theme }
      }),

      setViewMode: (viewMode) => set((state) => ({ ...state, viewMode })),

      setAutoRefresh: (autoRefresh) => set((state) => ({ ...state, autoRefresh })),

      setRefreshInterval: (refreshInterval) => set((state) => ({ ...state, refreshInterval })),

      setNotifications: (notifications) => set((state) => ({ ...state, notifications })),

      addFavorite: (newsId) => set((state) => ({
        ...state,
        favorites: state.favorites.includes(newsId) 
          ? state.favorites 
          : [...state.favorites, newsId]
      })),

      removeFavorite: (newsId) => set((state) => ({
        ...state,
        favorites: state.favorites.filter(id => id !== newsId)
      })),

      toggleFavorite: (newsId) => set((state) => {
        const favorites = state.favorites.includes(newsId)
          ? state.favorites.filter(id => id !== newsId)
          : [...state.favorites, newsId]
        return { ...state, favorites }
      }),

      isFavorited: (newsId) => {
        return get().favorites.includes(newsId)
      },

      setSidebarOpen: (sidebarOpen) => set((state) => ({ ...state, sidebarOpen })),

      setSearchOpen: (searchOpen) => set((state) => ({ ...state, searchOpen })),

      setDebugMode: (debugMode) => set((state) => ({ ...state, debugMode })),

      reset: () => set(() => ({
        ...initialState,
        sidebarOpen: false,
        searchOpen: false,
        debugMode: false,
      })),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
        notifications: state.notifications,
        favorites: state.favorites,
        debugMode: state.debugMode,
      }),
    }
  )
)