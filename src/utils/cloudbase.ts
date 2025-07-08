/**
 * 数据服务 - 不依赖CloudBase的静态数据服务
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
}

// 数据服务
export class NewsService {
  
  // 获取新闻数据
  static async getNews(): Promise<NewsData> {
    try {
      // 尝试导入本地JSON数据
      try {
        // 动态导入数据文件
        const newsModule = await import('../data/ai-news.json');
        const rawData = newsModule.default || newsModule;
        
        // 检查数据格式并添加统计信息
        if (rawData && rawData.data && Array.isArray(rawData.data)) {
          const newsData = this.processNewsData(rawData);
          // 缓存数据到本地
          uni.setStorageSync('newsData', newsData);
          return newsData;
        }
      } catch (error) {
        console.warn('导入本地数据失败，尝试网络请求:', error);
      }
      
      // 尝试从网络获取最新数据
      try {
        const response = await uni.request({
          url: '/data/ai-news.json',
          method: 'GET',
          timeout: 10000
        });
        
        if (response.statusCode === 200 && response.data) {
          const newsData = this.processNewsData(response.data);
          // 缓存数据到本地
          uni.setStorageSync('newsData', newsData);
          return newsData;
        }
      } catch (error) {
        console.warn('网络获取数据失败，尝试使用本地缓存:', error);
      }
      
      // 尝试从本地缓存获取
      const cachedData = uni.getStorageSync('newsData');
      if (cachedData) {
        return cachedData as NewsData;
      }
      
      // 返回默认数据
      return this.getDefaultData();
      
    } catch (error) {
      console.error('获取新闻数据失败:', error);
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
          id: "1",
          title: "通义网络智能体WebSailor开源，检索性能登顶开源榜单！",
          content: "阿里云通义实验室开源网络智能体WebSailor。智能体具备强大的推理和检索能力，在智能体评测集BrowseComp上超越DeepSeek R1、Grok-3等模型，登顶开源网络智能体榜单。WebSailor通过创新的post-training方法和强化学习算法DUPO，大幅提升了复杂网页推理任务的表现。",
          originalContent: "阿里云通义实验室开源网络智能体WebSailor。智能体具备强大的推理和检索能力，在智能体评测集BrowseComp上超越DeepSeek R1、Grok-3等模型，登顶开源网络智能体榜单。WebSailor通过创新的post-training方法和强化学习算法DUPO，大幅提升了复杂网页推理任务的表现。",
          source: "阿里云",
          sourceUrl: "https://ai-bot.cn/daily-ai-news/",
          publishTime: "2024-01-08T10:00:00.000Z",
          crawlTime: new Date().toISOString(),
          category: "开源项目",
          tags: ["AI模型", "开源", "大语言模型"],
          dateText: "1月8·周一"
        },
        {
          id: "2",
          title: "字节跳动开源 AI IDE 工具核心组件 Trae-Agent",
          content: "字节开源TRAE Agent 在 SWE-bench Verified 排行榜上取得 75.2% 的求解率，位居第一。TRAE Agent 是基于大语言模型的智能助手，专为软件工程任务设计，能自主完成代码理解、问题复现、修复方案制定、高质量代码编写等任务。",
          originalContent: "字节开源TRAE Agent 在 SWE-bench Verified 排行榜上取得 75.2% 的求解率，位居第一。TRAE Agent 是基于大语言模型的智能助手，专为软件工程任务设计，能自主完成代码理解、问题复现、修复方案制定、高质量代码编写等任务。",
          source: "TRAE.ai",
          sourceUrl: "https://ai-bot.cn/daily-ai-news/",
          publishTime: "2024-01-07T15:00:00.000Z",
          crawlTime: new Date().toISOString(),
          category: "开源项目",
          tags: ["AI模型", "开源", "开发工具"],
          dateText: "1月7·周日"
        },
        {
          id: "3",
          title: "星动纪元完成近5亿元A轮融资！通用具身技术突破驱动商业化落地",
          content: "星动纪元宣布完成近5亿元A轮融资，由鼎晖VGC和海尔资本联合领投。公司成立于2023年，是清华大学唯一持股的具身智能企业，致力于打造通用智能体。目前，星动纪元已向全球科技巨头批量交付超200台产品，订单中50%以上来自海外客户，在工业物流、连锁零售等行业加速落地。",
          originalContent: "星动纪元宣布完成近5亿元A轮融资，由鼎晖VGC和海尔资本联合领投。公司成立于2023年，是清华大学唯一持股的具身智能企业，致力于打造通用智能体。目前，星动纪元已向全球科技巨头批量交付超200台产品，订单中50%以上来自海外客户，在工业物流、连锁零售等行业加速落地。",
          source: "北京星动纪元科技有限公司",
          sourceUrl: "https://ai-bot.cn/daily-ai-news/",
          publishTime: "2024-01-07T09:00:00.000Z",
          crawlTime: new Date().toISOString(),
          category: "投融资",
          tags: ["投融资", "机器人"],
          dateText: "1月7·周日"
        },
        {
          id: "4",
          title: "通义实验室开源首个音频生成模型 ThinkSound",
          content: "通义实验室开源首个音频生成模型ThinkSound，专为打破静音画面局限而生。模型通过引入思维链（CoT）技术，让AI学会结构化推理画面与声音的关系，实现高保真、强同步的空间音频生成。基于2531.8小时高质量多模态数据训练，包含对象级和指令级样本，支持交互式编辑。",
          originalContent: "通义实验室开源首个音频生成模型ThinkSound，专为打破静音画面局限而生。模型通过引入思维链（CoT）技术，让AI学会结构化推理画面与声音的关系，实现高保真、强同步的空间音频生成。基于2531.8小时高质量多模态数据训练，包含对象级和指令级样本，支持交互式编辑。",
          source: "通义大模型",
          sourceUrl: "https://ai-bot.cn/daily-ai-news/",
          publishTime: "2024-01-06T14:00:00.000Z",
          crawlTime: new Date().toISOString(),
          category: "开源项目",
          tags: ["AI模型", "语音技术", "开源"],
          dateText: "1月6·周六"
        },
        {
          id: "5",
          title: "AIGC独角兽硅基智能完成D轮融资，数字人业务营收数亿",
          content: "AIGC独角兽硅基智能完成数亿元D轮融资，投资方为嘉兴高新区产业基金。本轮资金将用于研发创新、技术落地及产品市场化。自2017年成立以来，硅基智能已完成10轮融资，投资方包括腾讯、红杉中国等。",
          originalContent: "AIGC独角兽硅基智能完成数亿元D轮融资，投资方为嘉兴高新区产业基金。本轮资金将用于研发创新、技术落地及产品市场化。自2017年成立以来，硅基智能已完成10轮融资，投资方包括腾讯、红杉中国等。",
          source: "36氪",
          sourceUrl: "https://ai-bot.cn/daily-ai-news/",
          publishTime: "2024-01-06T11:00:00.000Z",
          crawlTime: new Date().toISOString(),
          category: "投融资",
          tags: ["投融资", "AIGC"],
          dateText: "1月6·周六"
        }
      ],
      stats: {
        todayCount: 2,
        totalCount: 5,
        categories: ["开源项目", "投融资", "产品发布", "行业动态", "技术研究", "综合资讯"],
        sources: ["阿里云", "TRAE.ai", "北京星动纪元科技有限公司", "通义大模型", "36氪"]
      }
    };
  }
}

// 默认导出
export default {
  LocalStorage,
  NewsService
};