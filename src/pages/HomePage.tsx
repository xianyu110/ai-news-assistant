import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Newspaper, 
  Bot, 
  Smartphone, 
  Code, 
  TrendingUp,
  Clock,
  Heart,
  Search
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Bot,
      title: 'AI快讯聚合',
      description: '每日更新AI领域最新资讯',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Smartphone,
      title: '响应式设计',
      description: '完美适配各种设备屏幕',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Code,
      title: '现代化架构',
      description: 'React + TypeScript + Tailwind',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const stats = [
    { label: '每日更新', value: '24/7', icon: Clock },
    { label: '快讯总数', value: '1000+', icon: Newspaper },
    { label: '用户喜爱', value: '⭐⭐⭐⭐⭐', icon: Heart },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="md:pt-0 pt-16 min-h-screen"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 md:px-8 py-16 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI快讯助手
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              每日AI资讯，实时更新 · 现代化Web应用
            </p>
            <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-12 leading-relaxed">
              基于React + TypeScript构建的现代化AI新闻聚合平台，
              提供更快的响应速度和更优雅的用户体验
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/news"
                className="btn btn-lg bg-white text-primary-700 hover:bg-gray-100 shadow-lg"
              >
                <Newspaper className="w-5 h-5 mr-2" />
                开始浏览快讯
              </Link>
              <Link
                to="/search"
                className="btn btn-lg bg-primary-500/20 text-white border-2 border-white/30 hover:bg-primary-500/30 backdrop-blur-sm"
              >
                <Search className="w-5 h-5 mr-2" />
                搜索感兴趣内容
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Features */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            核心特性
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="group"
              >
                <div className="card p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} p-4 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="space-y-2"
                >
                  <stat.icon className="w-8 h-8 mx-auto text-primary-500" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              开始探索AI世界
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              获取最新的AI行业动态、技术突破和产品发布信息
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/news"
                className="btn btn-primary btn-lg shadow-lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                查看最新快讯
              </Link>
              <Link
                to="/favorites"
                className="btn btn-secondary btn-lg"
              >
                <Heart className="w-5 h-5 mr-2" />
                我的收藏
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}