const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// 爬虫配置
const CRAWL_CONFIG = {
  baseUrl: 'https://ai-bot.cn/daily-ai-news/',
  timeout: 30000,
  retryTimes: 3,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../src/data');
const AI_NEWS_FILE = path.join(DATA_DIR, 'ai-news.json');
const ALL_NEWS_FILE = path.join(DATA_DIR, 'all-news.json');

// 创建目录结构
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('✅ 目录结构创建成功');
  } catch (error) {
    console.error('❌ 创建目录失败:', error);
  }
}

// 生成新闻ID（基于标题）
function generateNewsId(title) {
  return crypto.createHash('md5').update(title.trim()).digest('hex').substring(0, 8);
}

// 检查是否为有效新闻 - 放宽过滤条件
function isValidNews(title, content) {
  if (!title || title.length < 10 || title.length > 300) {
    return false;
  }

  // 过滤明显的导航和页面元素
  const invalidPatterns = [
    /^AI工具集.*社群$/,
    /^.*游客.*回复$/,
    /^每日AI快讯.*更新$/,
    /版权所有|ICP|备案/,
    /加入.*群|联系.*客服/,
    /^首页[•·]/,
    /随时了解.*最新趋势/,
    /实时更新.*行业.*资讯/,
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(title.trim())) {
      return false;
    }
  }
  
  // 放宽AI关键词要求 - 只要包含一些科技词汇即可
  const techKeywords = [
    'AI', '人工智能', 'GPT', '大模型', '机器学习', '深度学习', '智能', 
    'OpenAI', 'ChatGPT', '语言模型', '算法', '科技', '技术', '研发', 
    '发布', '投资', '融资', '开源', '升级', '推出', '宣布', '完成',
    '模型', '数据', '平台', '工具', '系统', '应用', '产品', '服务'
  ];
  
  const text = `${title} ${content}`;
  const hasKeyword = techKeywords.some(keyword => text.includes(keyword));
  
  return hasKeyword;
}

// 提取标签
function extractTags(title, content = '') {
  const text = `${title} ${content}`;
  const tags = [];
  const keywords = {
    'GPT': ['GPT', 'ChatGPT', 'GPT-4', 'GPT-3'],
    '开源': ['开源', 'Open Source', '开放'],
    '融资': ['融资', '投资', '资金', '轮融资', '天使', 'A轮', 'B轮'],
    '发布': ['发布', '推出', '上线', '发表'],
    '合作': ['合作', '联合', '合并', '收购'],
    '研究': ['研究', '论文', '实验', '测试'],
    '大模型': ['大模型', '语言模型', 'LLM', '模型'],
    '技术': ['技术', '算法', '框架', '平台'],
    'AI工具': ['工具', 'AI', '人工智能'],
    '3D': ['3D', '三维', '立体'],
    '智能体': ['智能体', 'Agent', '助手'],
    '机器人': ['机器人', '具身智能', 'Robot']
  };

  Object.entries(keywords).forEach(([tag, words]) => {
    if (words.some(word => text.includes(word))) {
      tags.push(tag);
    }
  });

  return tags.slice(0, 5);
}

// 新闻分类
function categorizeNews(title, content = '') {
  const text = `${title} ${content}`;
  const categories = {
    '投融资': ['融资', '投资', '资金', '轮融资', '估值', 'A轮', 'B轮', 'C轮', '天使'],
    '开源项目': ['开源', 'GitHub', 'Open Source', '代码', '项目'],
    '产品发布': ['发布', '推出', '上线', '发表', '更新', '版本', '升级'],
    '行业动态': ['合作', '联合', '合并', '收购', '战略', '政策'],
    '技术研究': ['研究', '论文', '实验', '测试', '突破', '算法'],
    '综合资讯': ['资讯', '新闻', '消息', '通知', '公告']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return '综合资讯';
}

// 解析日期字符串为Date对象
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  // 支持多种日期格式
  const patterns = [
    {
      regex: /(\d{1,2})月(\d{1,2})[·•]\s*周[一二三四五六日]/,
      handler: (match) => {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        return createValidDate(month, day);
      }
    },
    {
      regex: /(\d{1,2})月(\d{1,2})日[·•]\s*周[一二三四五六日]/,
      handler: (match) => {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        return createValidDate(month, day);
      }
    },
    {
      regex: /(\d{1,2})月(\d{1,2})$/,
      handler: (match) => {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        return createValidDate(month, day);
      }
    }
  ];
  
  function createValidDate(month, day) {
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    
    let year = currentYear;
    
    // 当前是2025年7月，如果月份大于当前月份，很可能是去年的数据
    if (month > currentMonth + 1) {
      year = currentYear - 1;
    }
    
    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime()) || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      return null;
    }
    
    return date;
  }
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern.regex);
    if (match) {
      const result = pattern.handler(match);
      if (result) {
        return result;
      }
    }
  }
  
  console.log(`⚠️  无法解析日期: ${dateStr}，使用当前日期`);
  return currentDate;
}

// 解析AI工具集新闻页面 - 改进版本
async function parseAIBotNews(html) {
  const $ = cheerio.load(html);
  const newsItems = [];
  
  console.log('📄 开始解析AI工具集新闻页面...');
  
  // 查找主新闻列表容器
  const newsListContainer = $('.news-list');
  
  if (newsListContainer.length === 0) {
    console.log('⚠️  未找到新闻列表容器');
    return newsItems;
  }
  
  console.log(`📋 找到 ${newsListContainer.length} 个新闻列表容器`);
  
  // 解析每个新闻列表容器
  newsListContainer.each((containerIndex, container) => {
    const $container = $(container);
    let currentDate = '';
    
    // 按顺序处理容器中的所有子元素
    $container.children().each((index, element) => {
      const $el = $(element);
      
      // 检查是否是日期元素
      if ($el.hasClass('news-date')) {
        currentDate = $el.text().trim();
        console.log(`📅 发现日期分组: ${currentDate}`);
        return;
      }
      
      // 检查是否是新闻项
      if ($el.hasClass('news-item')) {
        const $content = $el.find('.news-content');
        
        if ($content.length > 0) {
          // 提取标题
          const $titleEl = $content.find('h1, h2, h3').find('a').first();
          const title = $titleEl.length ? $titleEl.text().trim() : '';
          
          if (!title) {
            return;
          }
          
          // 提取内容和来源
          const $textEl = $content.find('p.text-muted');
          let content = '';
          let source = 'AI工具集';
          
          if ($textEl.length > 0) {
            // 克隆元素并移除来源标签以获取纯内容
            const $contentClone = $textEl.clone();
            $contentClone.find('.news-time').remove();
            content = $contentClone.text().trim();
            
            // 提取来源
            const $sourceEl = $textEl.find('.news-time');
            if ($sourceEl.length > 0) {
              const sourceText = $sourceEl.text().trim();
              const sourceMatch = sourceText.match(/来源[：:]\s*(.+)/);
              if (sourceMatch) {
                source = sourceMatch[1].trim();
              }
            }
          }
          
          // 验证数据有效性
          if (isValidNews(title, content)) {
            const publishTime = parseDate(currentDate);
            const newsItem = {
              id: generateNewsId(title),
              title: title,
              content: content || title,
              originalContent: title + (content ? ' ' + content : ''),
              source: source,
              sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
              publishTime: publishTime,
              crawlTime: new Date(),
              category: categorizeNews(title, content),
              tags: extractTags(title, content),
              dateText: currentDate
            };
            
            newsItems.push(newsItem);
            
            if (newsItems.length % 10 === 0) {
              console.log(`📝 已解析 ${newsItems.length} 条新闻...`);
            }
          } else {
            console.log(`⚠️  跳过无效新闻: ${title.substring(0, 30)}...`);
          }
        }
      }
    });
  });
  
  console.log(`✅ 解析完成，共提取 ${newsItems.length} 条有效新闻`);
  return newsItems;
}

// 主爬虫函数
async function crawlAIToolNews() {
  try {
    console.log('🚀 开始爬取AI工具集新闻...');
    console.log(`📋 目标URL: ${CRAWL_CONFIG.baseUrl}`);
    
    await ensureDirectories();
    
    const response = await axios.get(CRAWL_CONFIG.baseUrl, {
      timeout: CRAWL_CONFIG.timeout,
      headers: {
        'User-Agent': CRAWL_CONFIG.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    console.log(`✅ 页面请求成功，状态码: ${response.status}`);
    console.log(`📄 页面大小: ${(response.data.length / 1024).toFixed(2)} KB`);
    
    const newsList = await parseAIBotNews(response.data);
    
    if (newsList.length > 0) {
      await saveNewsData(newsList);
      console.log(`🎉 爬取完成！共获取 ${newsList.length} 条新闻`);
    } else {
      console.log('⚠️  未获取到任何新闻数据');
    }
    
    return newsList;
    
  } catch (error) {
    console.error('❌ 爬取过程中出现错误:', error.message);
    throw error;
  }
}

// 保存新闻数据 - 改进去重逻辑
async function saveNewsData(newsList) {
  try {
    // 读取现有数据
    let existingNews = [];
    try {
      const existingData = await fs.readFile(ALL_NEWS_FILE, 'utf8');
      const parsedData = JSON.parse(existingData);
      
      if (Array.isArray(parsedData)) {
        existingNews = parsedData;
      } else if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        existingNews = parsedData.data;
      }
    } catch (error) {
      console.log('📝 创建新的数据文件');
    }

    // 创建基于标题的去重集合
    const existingTitles = new Set();
    const uniqueExistingNews = [];
    
    // 先去除现有数据中的重复
    for (const news of existingNews) {
      if (news.title && !existingTitles.has(news.title.trim())) {
        existingTitles.add(news.title.trim());
        uniqueExistingNews.push(news);
      }
    }
    
    console.log(`📊 清理重复数据: ${existingNews.length} -> ${uniqueExistingNews.length}`);

    // 过滤有效的新新闻并去重
    const validNewNews = newsList.filter(news => isValidNews(news.title, news.content));
    const uniqueNewNews = validNewNews.filter(news => !existingTitles.has(news.title.trim()));
    
    // 合并并排序
    const allNews = [...uniqueExistingNews, ...uniqueNewNews]
      .sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());

    // 保存完整数据
    await fs.writeFile(ALL_NEWS_FILE, JSON.stringify(allNews, null, 2));

    // 保存最新数据（用于前端展示）
    const latestData = {
      success: true,
      data: allNews.slice(0, 500),
      total: allNews.length,
      lastUpdate: new Date().toISOString()
    };
    
    await fs.writeFile(AI_NEWS_FILE, JSON.stringify(latestData, null, 2));

    console.log(`💾 数据保存成功:`);
    console.log(`   - 新增新闻: ${uniqueNewNews.length} 条`);
    console.log(`   - 总计新闻: ${allNews.length} 条`);
    console.log(`   - 前端展示: ${Math.min(allNews.length, 500)} 条`);

    return {
      newCount: uniqueNewNews.length,
      totalCount: allNews.length
    };
    
  } catch (error) {
    console.error('❌ 保存数据失败:', error);
    throw error;
  }
}

// 主函数
async function main() {
  const startTime = Date.now();
  
  try {
    await crawlAIToolNews();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`⏱️  总耗时: ${duration} 秒`);
    
  } catch (error) {
    console.error('❌ 程序执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  crawlAIToolNews,
  parseAIBotNews,
  isValidNews,
  generateNewsId
}; 