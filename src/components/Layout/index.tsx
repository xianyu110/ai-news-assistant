import { ReactNode, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import Sidebar from './Sidebar'
import { useUserStore } from '@/stores/userStore'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useUserStore()

  // Handle responsive sidebar state
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768
      setSidebarOpen(isDesktop)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[calc(100vh-4rem)]"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <Header />
        <Sidebar />
        <main className="pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[calc(100vh-4rem)]"
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}