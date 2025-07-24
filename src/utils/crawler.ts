import { NewsItem } from '@/types'

interface AiBotNewsItem {
  title: string
  content: string
  url: string
  publishTime: string
  category: string
  source: string
}

class NewsCrawler {
  private corsProxy = 'https://api.allorigins.win/get?url='
  
  async crawlAiBotNews(): Promise<NewsItem[]> {
    try {
      const url = 'https://ai-bot.cn/daily-ai-news/'
      const proxyUrl = `${this.corsProxy}${encodeURIComponent(url)}`
      
      console.log('🕷️ 开始爬取AI工具集新闻数据...')
      
      const response = await fetch(proxyUrl)
      const data = await response.json()
      const htmlContent = data.contents
      
      // 解析HTML内容
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      const newsItems: NewsItem[] = []
      
      // 查找新闻列表容器
      const newsElements = doc.querySelectorAll('.news-item, .daily-news-item, article, .post-item')
      
      newsElements.forEach((element, index) => {
        try {
          const titleElement = element.querySelector('h1, h2, h3, .title, .news-title')
          const contentElement = element.querySelector('.content, .excerpt, .summary, p')
          const linkElement = element.querySelector('a')
          const timeElement = element.querySelector('.time, .date, time, .publish-time')
          
          const title = titleElement?.textContent?.trim()
          const content = contentElement?.textContent?.trim()
          const url = linkElement?.getAttribute('href')
          const timeText = timeElement?.textContent?.trim()
          
          if (title && title.length > 10) {
            const newsItem: NewsItem = {
              id: `aibot-${Date.now()}-${index}`,
              title,
              content: content || title,
              summary: content ? content.substring(0, 100) + '...' : title,
              source: 'AI工具集',
              url: url ? (url.startsWith('http') ? url : `https://ai-bot.cn${url}`) : undefined,
              publishTime: this.parseTime(timeText || ''),
              tags: this.extractTags(title, content || ''),
              category: this.categorizeNews(title, content || ''),
              readTime: Math.ceil((content || title).length / 200),
            }
            
            newsItems.push(newsItem)
          }
        } catch (error) {
          console.warn('解析新闻项失败:', error)
        }
      })
      
      // 如果没有找到标准格式，尝试其他选择器
      if (newsItems.length === 0) {
        const alternativeElements = doc.querySelectorAll('div[class*="news"], div[class*="post"], div[class*="item"], li')
        
        alternativeElements.forEach((element, index) => {
          try {
            const text = element.textContent?.trim()
            if (text && text.length > 20 && text.length < 500) {
              // 简单的标题提取
              const sentences = text.split(/[。！？\n]/)
              const title = sentences[0]?.trim()
              
              if (title && title.length > 10) {
                const newsItem: NewsItem = {
                  id: `aibot-alt-${Date.now()}-${index}`,
                  title,
                  content: text,
                  summary: text.substring(0, 100) + '...',
                  source: 'AI工具集',
                  publishTime: new Date().toISOString(),
                  tags: this.extractTags(title, text),
                  category: this.categorizeNews(title, text),
                  readTime: Math.ceil(text.length / 200),
                }
                
                newsItems.push(newsItem)
              }
            }
          } catch (error) {
            console.warn('解析备选新闻项失败:', error)
          }
        })
      }
      
      console.log(`✅ 成功爬取 ${newsItems.length} 条新闻`)
      return newsItems.slice(0, 20) // 限制返回数量
      
    } catch (error) {
      console.error('❌ 爬取AI工具集新闻失败:', error)
      return []
    }
  }
  
  private parseTime(timeText: string): string {
    if (!timeText) return new Date().toISOString()
    
    const now = new Date()
    
    // 处理相对时间
    if (timeText.includes('分钟前')) {
      const minutes = parseInt(timeText.match(/(\d+)分钟前/)?.[1] || '0')
      return new Date(now.getTime() - minutes * 60 * 1000).toISOString()
    }
    
    if (timeText.includes('小时前')) {
      const hours = parseInt(timeText.match(/(\d+)小时前/)?.[1] || '0')
      return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
    }
    
    if (timeText.includes('天前')) {
      const days = parseInt(timeText.match(/(\d+)天前/)?.[1] || '0')
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
    }
    
    // 处理具体日期
    const dateMatch = timeText.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString()
    }
    
    // 默认返回当前时间
    return new Date().toISOString()
  }
  
  private extractTags(title: string, content: string): string[] {
    const text = (title + ' ' + content).toLowerCase()
    const tags: string[] = []
    
    const tagKeywords = [
      { keyword: ['openai', 'gpt', 'chatgpt'], tag: 'OpenAI' },
      { keyword: ['google', 'gemini', 'bard'], tag: 'Google' },
      { keyword: ['microsoft', 'copilot'], tag: 'Microsoft' },
      { keyword: ['meta', 'llama'], tag: 'Meta' },
      { keyword: ['anthropic', 'claude'], tag: 'Anthropic' },
      { keyword: ['nvidia', '英伟达'], tag: 'NVIDIA' },
      { keyword: ['apple', '苹果'], tag: 'Apple' },
      { keyword: ['百度', 'baidu'], tag: '百度' },
      { keyword: ['阿里', 'alibaba'], tag: '阿里巴巴' },
      { keyword: ['腾讯', 'tencent'], tag: '腾讯' },
      { keyword: ['字节', 'bytedance'], tag: '字节跳动' },
      { keyword: ['融资', '投资'], tag: '融资' },
      { keyword: ['开源', 'open source'], tag: '开源' },
      { keyword: ['模型', 'model'], tag: '大模型' },
      { keyword: ['ai', '人工智能'], tag: 'AI' },
    ]
    
    tagKeywords.forEach(({ keyword, tag }) => {
      if (keyword.some(k => text.includes(k))) {
        tags.push(tag)
      }
    })
    
    return [...new Set(tags)].slice(0, 5)
  }
  
  private categorizeNews(title: string, content: string): string {
    const text = (title + ' ' + content).toLowerCase()
    
    if (text.includes('融资') || text.includes('投资') || text.includes('亿美元') || text.includes('轮融资')) {
      return '投融资'
    }
    
    if (text.includes('开源') || text.includes('github') || text.includes('开放') || text.includes('免费')) {
      return '开源项目'
    }
    
    if (text.includes('发布') || text.includes('推出') || text.includes('上线') || text.includes('更新')) {
      return '产品发布'
    }
    
    if (text.includes('研究') || text.includes('论文') || text.includes('实验') || text.includes('测试')) {
      return '技术研究'
    }
    
    if (text.includes('合作') || text.includes('收购') || text.includes('战略') || text.includes('市场')) {
      return '行业动态'
    }
    
    return '综合资讯'
  }
}

export const newsCrawler = new NewsCrawler()
export default newsCrawler