import { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import Layout from '@/components/Layout'

// Lazy load page components
const HomePage = lazy(() => import('@/pages/HomePage'))
const NewsListPage = lazy(() => import('@/pages/NewsListPage'))
const NewsDetailPage = lazy(() => import('@/pages/NewsDetailPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const DebugPage = lazy(() => import('@/pages/DebugPage'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

function App() {
  const { theme, setTheme } = useUserStore()

  useEffect(() => {
    // Initialize theme
    setTheme(theme)

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const root = document.documentElement
        root.classList.toggle('dark', mediaQuery.matches)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, setTheme])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Layout>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/news" element={<NewsListPage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </Layout>
    </div>
  )
}

export default App