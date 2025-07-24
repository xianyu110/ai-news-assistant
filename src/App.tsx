import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import NewsListPage from '@/pages/NewsListPage'
import NewsDetailPage from '@/pages/NewsDetailPage'
import SearchPage from '@/pages/SearchPage'
import FavoritesPage from '@/pages/FavoritesPage'
import SettingsPage from '@/pages/SettingsPage'
import DebugPage from '@/pages/DebugPage'

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
        </AnimatePresence>
      </Layout>
    </div>
  )
}

export default App