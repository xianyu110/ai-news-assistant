/**
 * 数据服务 - 优化数据获取策略，支持自动刷新
 */

// 数据存储接口
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  originalContent: string;
  source: string;
  sourceUrl: string;
  publishTime: string;
  crawlTime: string;
  category: string;
  tags: string[];
  dateText: string;
}

export interface NewsData {
  success: boolean;
  updateTime: string;
  count: number;
  data: NewsItem[];
  stats: {
    todayCount: number;
    totalCount: number;
    categories: string[];
    sources: string[];
  };
  error?: string;
}

// 数据源配置
const DATA_SOURCES = {
  // GitHub Pages 原始数据源
  github: 'https://raw.githubusercontent.com/xianyu110/ai-news-assistant/main/src/data/ai-news.json',
  // 本地路径
  local: '/data/ai-news.json',
  // 缓存配置 - 优化缓存时间
  cache: {
    key: 'newsData',
    updateKey: 'lastUpdateTime',
    expireTime: 2 * 60 * 1000, // 减少到2分钟缓存
    lastDataHashKey: 'lastDataHash' // 新增：用于检测数据变化
  }
};

// 本地存储管理
export class LocalStorage {
  
  // 保存收藏
  static saveFavorite(newsItem: NewsItem) {
    try {
      const favorites = this.getFavorites();
      const exists = favorites.find((item: any) => item.id === newsItem.id);
      
      if (!exists) {
        favorites.push({
          id: newsItem.id,
          title: newsItem.title,
          category: newsItem.category,
          createTime: new Date().toISOString()
        });
        
        uni.setStorageSync('favorites', favorites);
        return true;
      }
      return false;
    } catch (error) {
      console.error('保存收藏失败:', error);
      return false;
    }
  }
  
  // 移除收藏
  static removeFavorite(newsId: string) {
    try {
      const favorites = this.getFavorites();
      const newFavorites = favorites.filter((item: any) => item.id !== newsId);
      uni.setStorageSync('favorites', newFavorites);
      return true;
    } catch (error) {
      console.error('移除收藏失败:', error);
      return false;
    }
  }
  
  // 获取收藏列表
  static getFavorites() {
    try {
      return uni.getStorageSync('favorites') || [];
    } catch (error) {
      console.error('获取收藏失败:', error);
      return [];
    }
  }
  
  // 检查是否已收藏
  static isFavorited(newsId: string) {
    try {
      const favorites = this.getFavorites();
      return favorites.some((item: any) => item.id === newsId);
    } catch (error) {
      return false;
    }
  }
  
  // 保存搜索历史
  static saveSearchHistory(keyword: string) {
    try {
      if (!keyword.trim()) return;
      
      let history = this.getSearchHistory();
      
      // 移除重复项
      history = history.filter(item => item !== keyword);
      
      // 添加到开头
      history.unshift(keyword);
      
      // 限制数量
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      
      uni.setStorageSync('searchHistory', history);
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }
  
  // 获取搜索历史
  static getSearchHistory(): string[] {
    try {
      return uni.getStorageSync('searchHistory') || [];
    } catch (error) {
      return [];
    }
  }
  
  // 清除搜索历史
  static clearSearchHistory() {
    try {
      uni.removeStorageSync('searchHistory');
    } catch (error) {
      console.error('清除搜索历史失败:', error);
    }
  }

  // 检查缓存是否过期
  static isCacheExpired(): boolean {
    try {
      const lastUpdate = uni.getStorageSync(DATA_SOURCES.cache.updateKey);
      if (!lastUpdate) return true;
      
      const now = Date.now();
      const expireTime = lastUpdate + DATA_SOURCES.cache.expireTime;
      
      return now > expireTime;
    } catch (error) {
      return true;
    }
  }

  // 更新缓存时间戳
  static updateCacheTime() {
    try {
      uni.setStorageSync(DATA_SOURCES.cache.updateKey, Date.now());
    } catch (error) {
      console.error('更新缓存时间失败:', error);
    }
  }

  // 新增：生成数据哈希用于检测变化
  static generateDataHash(data: any): string {
    try {
      const content = JSON.stringify({
        count: data.count || 0,
        updateTime: data.updateTime,
        firstItemId: data.data?.[0]?.id,
        lastItemId: data.data?.[data.data?.length - 1]?.id,
        dataLength: data.data?.length || 0
      });
      // 简单哈希算法
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
      }
      return hash.toString();
    } catch (error) {
      return '';
    }
  }

  // 新增：检查数据是否有变化
  static hasDataChanged(newData: any): boolean {
    try {
      const newHash = this.generateDataHash(newData);
      const oldHash = uni.getStorageSync(DATA_SOURCES.cache.lastDataHashKey);
      
      if (!oldHash || oldHash !== newHash) {
        // 保存新的哈希值
        uni.setStorageSync(DATA_SOURCES.cache.lastDataHashKey, newHash);
        return true;
      }
      return false;
    } catch (error) {
      console.error('检查数据变化失败:', error);
      return true; // 出错时假设有变化
    }
  }
}

// 数据服务
export class NewsService {
  
  // 获取新闻数据 - 优化获取策略
  static async getNews(forceRefresh: boolean = false): Promise<NewsData> {
    try {
      console.log('🔄 开始获取新闻数据...', { forceRefresh });
      
      // 检查是否需要强制刷新或缓存过期
      const shouldRefresh = forceRefresh || LocalStorage.isCacheExpired();
      
      if (!shouldRefresh) {
        // 使用缓存数据
        const cachedData = uni.getStorageSync(DATA_SOURCES.cache.key);
        if (cachedData) {
          console.log('📄 使用缓存数据');
          return cachedData as NewsData;
        }
      }
      
      let latestData: any = null;
      
      // 1. 优先从 GitHub 获取最新数据
      try {
        console.log('🌐 尝试从本地路径获取最新数据...');
        const response = await uni.request({
          url: DATA_SOURCES.local,
          method: 'GET',
          timeout: 8000, // 减少超时时间
          header: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'If-None-Match': '' // 强制获取新数据
          }
        });
        
        if (response.statusCode === 200 && response.data) {
          console.log('✅ GitHub 数据获取成功');
          latestData = response.data;
        }
      } catch (error) {
        console.warn('❌ GitHub 数据获取失败:', error);
      }
      
      // 2. 如果GitHub失败，尝试导入本地JSON数据
      if (!latestData) {
        try {
          console.log('📁 尝试导入本地数据...');
          const newsModule = await import('../data/ai-news.json');
          latestData = newsModule.default || newsModule;
          console.log('✅ 本地数据导入成功');
        } catch (error) {
          console.warn('❌ 本地数据导入失败:', error);
        }
      }
      
      // 3. 如果还是没有数据，尝试从本地路径获取
      if (!latestData) {
        try {
          console.log('🔗 尝试从本地路径获取数据...');
          const response = await uni.request({
            url: DATA_SOURCES.local,
            method: 'GET',
            timeout: 5000
          });
          
          if (response.statusCode === 200 && response.data) {
            console.log('✅ 本地路径数据获取成功');
            latestData = response.data;
          }
        } catch (error) {
          console.warn('❌ 本地路径数据获取失败:', error);
        }
      }
      
      // 处理获取到的数据
      if (latestData && latestData.data && Array.isArray(latestData.data)) {
        const newsData = this.processNewsData(latestData);
        
        // 检查数据是否有变化
        if (LocalStorage.hasDataChanged(latestData)) {
          console.log('🆕 检测到数据变化，更新缓存');
        }
        
        // 缓存数据
        uni.setStorageSync(DATA_SOURCES.cache.key, newsData);
        LocalStorage.updateCacheTime();
        return newsData;
      }
      
      // 4. 使用旧缓存数据
      const cachedData = uni.getStorageSync(DATA_SOURCES.cache.key);
      if (cachedData) {
        console.log('📄 使用旧缓存数据');
        return cachedData as NewsData;
      }
      
      // 5. 返回默认数据
      console.log('⚠️ 使用默认数据');
      return this.getDefaultData();
      
    } catch (error) {
      console.error('❌ 获取新闻数据失败:', error);
      
      // 尝试使用缓存数据
      const cachedData = uni.getStorageSync(DATA_SOURCES.cache.key);
      if (cachedData) {
        return cachedData as NewsData;
      }
      
      return this.getDefaultData();
    }
  }
  
  // 处理并计算新闻数据统计
  static processNewsData(rawData: any): NewsData {
    const data = rawData.data || [];
    const now = new Date();
    const today = now.toDateString();
    
    // 计算统计信息
    const todayCount = data.filter((item: NewsItem) => {
      const publishDate = new Date(item.publishTime);
      return publishDate.toDateString() === today;
    }).length;
    
    // 获取所有分类和来源
    const categories = [...new Set(data.map((item: NewsItem) => item.category))] as string[];
    const sources = [...new Set(data.map((item: NewsItem) => item.source))] as string[];
    
    return {
      success: true,
      updateTime: rawData.updateTime || new Date().toISOString(),
      count: data.length,
      data: data,
      stats: {
        todayCount: todayCount,
        totalCount: data.length,
        categories: categories,
        sources: sources
      }
    };
  }

  // 强制刷新数据
  static async refreshNews(): Promise<NewsData> {
    console.log('🔄 强制刷新新闻数据...');
    return this.getNews(true);
  }
  
  // 搜索新闻
  static async searchNews(keyword: string, data?: NewsItem[]): Promise<NewsItem[]> {
    try {
      if (!data) {
        const newsData = await this.getNews();
        data = newsData.data;
      }
      
      if (!keyword.trim()) {
        return data;
      }
      
      const searchTerm = keyword.toLowerCase();
      
      return data.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        item.source.toLowerCase().includes(searchTerm)
      );
      
    } catch (error) {
      console.error('搜索新闻失败:', error);
      return [];
    }
  }
  
  // 按分类筛选
  static filterByCategory(data: NewsItem[], category: string): NewsItem[] {
    if (category === '全部') {
      return data;
    }
    return data.filter(item => item.category === category);
  }
  
  // 获取默认数据
  static getDefaultData(): NewsData {
    return {
      success: true,
      updateTime: new Date().toISOString(),
      count: 5,
      data: [
        {
          id: "demo-1",
          title: "AI新闻助手数据加载中...",
          content: "正在从远程数据源获取最新AI资讯，请稍候...",
          originalContent: "正在从远程数据源获取最新AI资讯，请稍候...",
          source: "系统提示",
          sourceUrl: "https://ai-bot.cn/daily-ai-news/",
          publishTime: new Date().toISOString(),
          crawlTime: new Date().toISOString(),
          category: "系统消息",
          tags: ["加载中"],
          dateText: "今日"
        },
        {
          id: "demo-2",
          title: "数据获取策略说明",
          content: "本应用会优先从 GitHub 获取最新数据，如果失败则使用本地缓存数据，确保在各种网络环境下都能正常访问。",
          originalContent: "本应用会优先从 GitHub 获取最新数据，如果失败则使用本地缓存数据，确保在各种网络环境下都能正常访问。",
          source: "系统说明",
          sourceUrl: "https://ai-bot.cn/daily-ai-news/",
          publishTime: new Date().toISOString(),
          crawlTime: new Date().toISOString(),
          category: "系统消息",
          tags: ["说明"],
          dateText: "今日"
        }
      ],
      stats: {
        todayCount: 0,
        totalCount: 2,
        categories: ["系统消息"],
        sources: ["系统提示", "系统说明"]
      }
    };
  }
}

// 默认导出
export default {
  LocalStorage,
  NewsService
};