import { NewsResponse, NewsItem, CacheData } from '@/types'
import { newsCrawler } from './crawler'

// Use local path to the original project data
const LOCAL_DATA_PATH = '/Users/chinamanor/Downloads/cursor编程/ai-news-assistant/src/data'
const API_BASE_URL = 'https://raw.githubusercontent.com/chinamanor/ai-news-assistant/main/src/data'
const CACHE_KEY = 'ai-news-cache'
const CACHE_VERSION = 'v2' // 更新版本号强制刷新缓存
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

class NewsAPI {
  private cache: CacheData | null = null

  private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        
        if (response.ok) {
          return response
        }
        
        if (i === retries - 1) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        if (i === retries - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    
    throw new Error('Max retries exceeded')
  }

  private loadCache(): CacheData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const data: CacheData = JSON.parse(cached)
        // 检查缓存版本
        if ((data as any).version !== CACHE_VERSION) {
          console.log('🔄 缓存版本已更新，清除旧缓存')
          localStorage.removeItem(CACHE_KEY)
          return null
        }
        if (Date.now() - data.timestamp < CACHE_DURATION) {
          return data
        }
      }
    } catch (error) {
      console.warn('Failed to load cache:', error)
    }
    return null
  }

  private saveCache(data: NewsItem[]): void {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        hash: this.generateHash(data),
        version: CACHE_VERSION, // 添加版本号
      } as any
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      this.cache = cacheData
    } catch (error) {
      console.warn('Failed to save cache:', error)
    }
  }

  private generateHash(data: NewsItem[]): string {
    const content = JSON.stringify({
      count: data.length,
      firstId: data[0]?.id,
      lastId: data[data.length - 1]?.id,
    })
    
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString()
  }

  private async fetchLocalData(): Promise<NewsItem[]> {
    try {
      // Try to read from the static data file in public directory
      const response = await fetch('/mock-data/ai-news.json')
      if (response.ok) {
        const result = await response.json()
        if (result.data && Array.isArray(result.data)) {
          console.log(`📂 使用本地实时数据: ${result.data.length} 条`)
          return result.data
        }
      }
    } catch (error) {
      console.warn('无法读取本地数据:', error)
    }
    return []
  }

  async getNews(forceRefresh = false): Promise<NewsResponse> {
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = this.loadCache()
        if (cached && cached.data.length > 0) {
          console.log('📄 Using cached data')
          return {
            success: true,
            data: cached.data,
            stats: this.generateStats(cached.data),
            pagination: {
              page: 1,
              pageSize: cached.data.length,
              total: cached.data.length,
              hasMore: false,
            },
            updateTime: new Date(cached.timestamp).toISOString(),
          }
        }
      }

      console.log('🌐 Fetching latest data from API...')
      
      let data: NewsItem[] = []

      // 优先调用 Vercel API 获取最新爬取的数据
      try {
        console.log('📡 调用 Vercel API 获取最新数据...')
        const response = await this.fetchWithRetry('/api/local-news')
        const result = await response.json()
        
        if (result.success && result.data && Array.isArray(result.data)) {
          data = result.data
          console.log(`✅ 成功获取 API 数据 ${data.length} 条`)
        }
      } catch (apiError) {
        console.warn('❌ API 调用失败，尝试备用数据源:', apiError)
        
        // 如果 API 失败，尝试其他数据源
        const urls = [
          '/mock-data/ai-news.json', // 本地备用数据
          `${API_BASE_URL}/ai-news.json`, // GitHub 数据
        ]

        for (const url of urls) {
          try {
            const response = await this.fetchWithRetry(url)
            const result = await response.json()
            
            if (Array.isArray(result)) {
              data = result
            } else if (result.data && Array.isArray(result.data)) {
              data = result.data
            }
            
            if (data.length > 0) {
              console.log(`📄 使用备用数据源: ${url}`)
              break
            }
          } catch (err) {
            console.warn(`Failed to fetch from ${url}:`, err)
          }
        }
      }

      // If no data from any source, generate mock data
      if (data.length === 0) {
        console.log('📝 Generating mock data as fallback')
        data = this.generateMockData()
      }

      // Process and enrich data
      const processedData = this.processNewsData(data)
      
      // Save to cache
      this.saveCache(processedData)

      return {
        success: true,
        data: processedData,
        stats: this.generateStats(processedData),
        pagination: {
          page: 1,
          pageSize: processedData.length,
          total: processedData.length,
          hasMore: false,
        },
        updateTime: new Date().toISOString(),
      }

    } catch (error) {
      console.error('❌ Failed to fetch news:', error)
      
      // Try to return cached data even if expired
      const cached = this.loadCache()
      if (cached && cached.data.length > 0) {
        return {
          success: true,
          data: cached.data,
          stats: this.generateStats(cached.data),
          pagination: {
            page: 1,
            pageSize: cached.data.length,
            total: cached.data.length,
            hasMore: false,
          },
          updateTime: new Date(cached.timestamp).toISOString(),
        }
      }

      return {
        success: false,
        data: [],
        stats: {
          totalCount: 0,
          todayCount: 0,
          categories: [],
          sources: [],
          lastUpdate: new Date().toISOString(),
        },
        pagination: {
          page: 1,
          pageSize: 0,
          total: 0,
          hasMore: false,
        },
        updateTime: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private processNewsData(data: NewsItem[]): NewsItem[] {
    return data.map(item => ({
      ...item,
      id: item.id || this.generateId(),
      tags: item.tags || [],
      category: item.category || '综合资讯',
      readTime: this.calculateReadTime(item.content || item.title),
    }))
  }

  private generateStats(data: NewsItem[]) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayCount = data.filter(item => {
      const itemDate = new Date(item.publishTime)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() === today.getTime()
    }).length

    const categories = [...new Set(data.map(item => item.category))].filter(Boolean)
    const sources = [...new Set(data.map(item => item.source))].filter(Boolean)

    return {
      totalCount: data.length,
      todayCount,
      categories,
      sources,
      lastUpdate: new Date().toISOString(),
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private calculateReadTime(text: string): number {
    const wordsPerMinute = 200
    const wordCount = text.length / 2 // Rough estimate for Chinese text
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }

  private generateMockData(): NewsItem[] {
    const categories = ['投融资', '开源项目', '产品发布', '行业动态', '技术研究', '综合资讯']
    const sources = ['AI工具集', 'TechCrunch', '机器之心', 'OpenAI', 'Google AI']
    
    const mockNews: NewsItem[] = []

    for (let i = 0; i < 50; i++) {
      const publishTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      const category = categories[Math.floor(Math.random() * categories.length)]
      const source = sources[Math.floor(Math.random() * sources.length)]
      
      mockNews.push({
        id: this.generateId(),
        title: `AI快讯 ${i + 1}: ${category}领域的最新突破`,
        content: `这是一条关于${category}的重要新闻内容，包含了最新的技术进展和行业动态。`,
        summary: `${category}领域出现重要进展`,
        source,
        publishTime: publishTime.toISOString(),
        tags: [category, 'AI', '科技'],
        category,
        readTime: Math.floor(Math.random() * 5) + 1,
      })
    }

    return mockNews.sort((a, b) => 
      new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
    )
  }

  clearCache(): void {
    try {
      localStorage.removeItem(CACHE_KEY)
      this.cache = null
      console.log('🧹 Cache cleared')
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  getCacheInfo(): { hasCache: boolean; timestamp: number; size: number } {
    const cached = this.loadCache()
    return {
      hasCache: !!cached,
      timestamp: cached?.timestamp || 0,
      size: cached?.data.length || 0,
    }
  }
}

export const newsAPI = new NewsAPI()
export default newsAPI