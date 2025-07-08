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
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const HISTORY_INDEX_FILE = path.join(HISTORY_DIR, 'index.json');

// 创建目录结构
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(HISTORY_DIR, { recursive: true });
    console.log('✅ 目录结构创建成功');
  } catch (error) {
    console.error('❌ 创建目录失败:', error);
  }
}

// 生成新闻ID
function generateNewsId(title) {
  return crypto.createHash('md5').update(title).digest('hex').substring(0, 8);
}

// 从标题中提取日期
function extractDateFromTitle(title) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  // 匹配各种日期格式
  const patterns = [
    // AI快讯：7月第3期（7月21日到7月31日的AI行业新闻）
    /(\d{1,2})月第\d+期.*?(\d{1,2})月(\d{1,2})日到(\d{1,2})月(\d{1,2})日/,
    // AI周刊丨本周不可错过的AI行业动态（6.2-6.8）
    /(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})/,
    // 12月25日·周一
    /(\d{1,2})月(\d{1,2})日?[·•]?周[一二三四五六日]/,
    // 7月25日
    /(\d{1,2})月(\d{1,2})日/,
    // 6.25 格式，但限制在合理的月份和日期范围内
    /\b(1[0-2]|[1-9])\.(3[01]|[12]\d|[1-9])\b/
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      let month, day;
      
      if (pattern.source.includes('第.*期')) {
        // 期刊格式：取结束日期
        month = parseInt(match[4]);
        day = parseInt(match[5]);
      } else if (pattern.source.includes('-')) {
        // 周刊格式：取结束日期
        month = parseInt(match[3]);
        day = parseInt(match[4]);
      } else {
        // 单日格式
        month = parseInt(match[1]);
        day = parseInt(match[2]);
      }
      
             // 验证月份和日期范围
       if (month < 1 || month > 12 || day < 1 || day > 31) {
         console.log(`⚠️  无效的日期: ${month}月${day}日，跳过`);
         continue; // 跳过无效日期，继续尝试下一个模式
       }
       
       // 判断年份：修复逻辑
       let year = currentYear; // 2025
       
       // 现在是2025年7月（currentMonth = 6）
       // 8月到12月的数据应该是2024年（去年）
       // 1月到7月的数据应该是2025年（今年）
       if (month > currentMonth + 1) {
         year = currentYear - 1; // 2024
       }
      
       const date = new Date(year, month - 1, day);
       
       // 验证日期是否有效
       if (isNaN(date.getTime())) {
         console.log(`⚠️  无效的日期对象: ${year}-${month}-${day}，跳过`);
         continue;
       }
       
      return date;
    }
  }
  
  return null;
}

// 检查是否为有效新闻
function isValidNews(title, content) {
  // 过滤条件
  const invalidPatterns = [
    /^AI小集.*管理员$/,
    /^.*游客$/,
    /^.*回复$/,
    /^(目前正在考虑|太棒了|后悔没有)/,
    /^热门工具.*最新文章$/,
    /版权所有|ICP|备案/,
    /加入.*群|联系.*客服/,
    /^\s*$|^.{1,5}$/,  // 空内容或太短
    /^首页[•·]/,      // 导航信息
    /^每日AI快讯热闻.*AI快讯.*小时前更新/,  // 页面描述
    /^AI工具集每日实时更新.*领域最新趋势/,  // 网站介绍
    /^.*(小集|AI快讯).*(\d+)$/,  // 带数字的描述性文字
    /AI工具集.*社群/,  // 社群推广
    /随时了解.*最新趋势/,  // 网站说明
    /实时更新.*行业.*资讯/,  // 网站功能说明
  ];
  
  // 检查标题
  for (const pattern of invalidPatterns) {
    if (pattern.test(title.trim())) {
      return false;
    }
  }
  
  // 检查内容长度和质量
  if (title.length < 15 || title.length > 200) {  // 提高最小长度要求
    return false;
  }
  
  // 如果标题包含特定的导航或描述性词汇，直接排除
  const navigationWords = ['首页', '快讯', '更新', '小集', '社群', '官方'];
  const navWordCount = navigationWords.filter(word => title.includes(word)).length;
  if (navWordCount >= 2) {  // 如果包含2个或以上导航词汇，可能是导航信息
    return false;
  }
  
  // 必须包含AI相关关键词
  const aiKeywords = ['AI', '人工智能', 'GPT', '大模型', '机器学习', '深度学习', '智能', 'OpenAI', 'ChatGPT', '语言模型', '算法', '科技', '技术', '研发', '发布', '投资', '融资'];
  const hasAIKeyword = aiKeywords.some(keyword => 
    title.includes(keyword) || content.includes(keyword)
  );
  
  return hasAIKeyword;
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

  return tags.slice(0, 5); // 最多5个标签
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

// 解析AI工具集新闻页面 - 重新设计的精确解析版本
async function parseAIBotNews(html) {
  const $ = cheerio.load(html);
  const newsItems = [];
  
  console.log('📄 开始解析AI工具集新闻页面（精确HTML结构解析）...');
  
  // 查找主新闻列表容器
  const newsListContainer = $('.news-list');
  
  if (newsListContainer.length === 0) {
    console.log('⚠️  未找到新闻列表容器，尝试通用解析...');
    return parseAIBotNewsText(html);
  }
  
  console.log(`📋 找到 ${newsListContainer.length} 个新闻列表容器`);
  
  // 解析每个新闻列表容器
  newsListContainer.each((containerIndex, container) => {
    const $container = $(container);
    let currentDate = '';
    let currentDateText = '';
    
    // 按顺序处理容器中的所有子元素
    $container.children().each((index, element) => {
      const $el = $(element);
      
      // 检查是否是日期元素
      if ($el.hasClass('news-date')) {
        currentDate = $el.text().trim();
        currentDateText = currentDate;
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
            console.log('⚠️  新闻项缺少标题，跳过');
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
              dateText: currentDateText
            };
            
            newsItems.push(newsItem);
            
            if (newsItems.length % 5 === 0) {
              console.log(`📝 已解析 ${newsItems.length} 条新闻... (当前日期: ${currentDateText})`);
            }
          } else {
            console.log(`⚠️  跳过无效新闻: ${title.substring(0, 50)}...`);
          }
        }
      }
    });
  });
  
  // 如果还是没有找到数据，尝试备用方法
  if (newsItems.length === 0) {
    console.log('⚠️  HTML结构解析未找到数据，使用备用文本解析...');
    return parseAIBotNewsText(html);
  }
  
  console.log(`✅ HTML结构解析完成，共提取 ${newsItems.length} 条有效新闻`);
  return newsItems;
}

// 备用文本解析方法（保留原有逻辑）
async function parseAIBotNewsText(html) {
  const $ = cheerio.load(html);
  const newsItems = [];
  
  console.log('📄 使用文本解析方法...');
  
  // 提取所有文本内容
  const bodyText = $('body').text();
  const lines = bodyText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  let currentDate = '';
  let pendingNews = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 更新日期匹配模式，包括最新的格式
    const datePatterns = [
      /(\d{1,2})月(\d{1,2})[·•]\s*周[一二三四五六日]/,  // 7月8·周二
      /(\d{1,2})月(\d{1,2})日[·•]\s*周[一二三四五六日]/, // 7月8日·周二
      /(\d{1,2})月(\d{1,2})/  // 7月8
    ];
    
    let dateMatch = null;
    for (const pattern of datePatterns) {
      dateMatch = line.match(pattern);
      if (dateMatch) break;
    }
    
    if (dateMatch) {
      // 保存之前待处理的新闻
      if (pendingNews.length > 0 && currentDate) {
        for (const news of pendingNews) {
          if (isValidNews(news.title, news.content)) {
            const publishTime = parseDate(currentDate);
            const newsItem = {
              id: generateNewsId(news.title),
              title: news.title,
              content: news.content,
              originalContent: news.title + ' ' + news.content,
              source: news.source || 'AI工具集',
              sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
              publishTime: publishTime,
              crawlTime: new Date(),
              category: categorizeNews(news.title, news.content),
              tags: extractTags(news.title, news.content),
              dateText: currentDate
            };
            newsItems.push(newsItem);
          }
        }
      }
      
      currentDate = line;
      pendingNews = [];
      console.log(`📅 发现日期分组: ${currentDate}`);
      continue;
    }
    
    // 检查来源行
    if (line.startsWith('来源：') || line.includes('来源：')) {
      const source = line.replace(/.*来源[：:]\s*/, '').trim();
      if (pendingNews.length > 0) {
        pendingNews[pendingNews.length - 1].source = source;
      }
      continue;
    }
    
    // 过滤无效内容
    if (line.length < 15 || line.length > 200 || 
        /^(AI工具集|游客|回复|目前正在考虑|热门工具)/.test(line) ||
        /版权所有|ICP|备案|社群|官方/.test(line)) {
      continue;
    }
    
    // 检查是否是新闻标题或内容
    if (currentDate && line.length >= 15) {
      // 智能判断是标题还是内容
      const isTitle = line.length < 100 && 
        (line.includes('发布') || line.includes('推出') || line.includes('完成') || 
         line.includes('开源') || line.includes('宣布') || line.includes('升级'));
      
      if (isTitle || pendingNews.length === 0) {
        // 作为新标题
        pendingNews.push({
          title: line,
          content: '',
          source: 'AI工具集'
        });
      } else if (pendingNews.length > 0) {
        // 作为内容补充到最后一条新闻
        if (pendingNews[pendingNews.length - 1].content) {
          pendingNews[pendingNews.length - 1].content += ' ' + line;
        } else {
          pendingNews[pendingNews.length - 1].content = line;
        }
      }
    }
  }
  
  // 处理最后一组待处理的新闻
  if (pendingNews.length > 0 && currentDate) {
    for (const news of pendingNews) {
      if (isValidNews(news.title, news.content)) {
        const publishTime = parseDate(currentDate);
        const newsItem = {
          id: generateNewsId(news.title),
          title: news.title,
          content: news.content || news.title,
          originalContent: news.title + ' ' + news.content,
          source: news.source || 'AI工具集',
          sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
          publishTime: publishTime,
          crawlTime: new Date(),
          category: categorizeNews(news.title, news.content),
          tags: extractTags(news.title, news.content),
          dateText: currentDate
        };
        newsItems.push(newsItem);
      }
    }
  }
  
  console.log(`✅ 文本解析完成，共提取 ${newsItems.length} 条有效新闻`);
  return newsItems;
}

// 解析日期字符串为Date对象 - 支持最新格式
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  // 支持多种日期格式
  const patterns = [
    // 最新格式：7月8·周二
    {
      regex: /(\d{1,2})月(\d{1,2})[·•]\s*周[一二三四五六日]/,
      handler: (match) => {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        return createValidDate(month, day);
      }
    },
    // 标准格式：7月8日·周二  
    {
      regex: /(\d{1,2})月(\d{1,2})日[·•]\s*周[一二三四五六日]/,
      handler: (match) => {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        return createValidDate(month, day);
      }
    },
    // 简单格式：7月8
    {
      regex: /(\d{1,2})月(\d{1,2})$/,
      handler: (match) => {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        return createValidDate(month, day);
      }
    },
    // 数字格式：7.8
    {
      regex: /(\d{1,2})\.(\d{1,2})$/,
      handler: (match) => {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return createValidDate(month, day);
        }
        return null;
      }
    }
  ];
  
  // 创建有效日期的辅助函数
  function createValidDate(month, day) {
    // 验证月份和日期范围
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      console.log(`⚠️  无效的日期: ${month}月${day}日`);
      return null;
    }
    
    // 智能判断年份
    let year = currentYear;
    
    // 当前是2025年7月，如果月份大于当前月份+1，很可能是去年的数据
    if (month > currentMonth + 2) { // +2给一些缓冲
      year = currentYear - 1;
    }
    
    const date = new Date(year, month - 1, day);
    
    // 验证日期是否有效（处理2月30日这种情况）
    if (isNaN(date.getTime()) || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      console.log(`⚠️  无效的日期对象: ${year}-${month}-${day}`);
      return null;
    }
    
    return date;
  }
  
  // 尝试所有模式
  for (const pattern of patterns) {
    const match = dateStr.match(pattern.regex);
    if (match) {
      const result = pattern.handler(match);
      if (result) {
        return result;
      }
    }
  }
  
  // 如果都无法解析，返回当前日期
  console.log(`⚠️  无法解析日期: ${dateStr}，使用当前日期`);
  return currentDate;
}

// 从月日创建日期
function createDateFromMonthDay(month, day) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  // 判断年份
  let year = currentYear;
  if (month > currentMonth + 1) {
    year = currentYear - 1;
  }
  
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? null : date;
}

// 格式化日期显示
function formatDate(date) {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays <= 7) return `${diffDays}天前`;
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
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
    if (error.response) {
      console.error(`HTTP状态码: ${error.response.status}`);
      console.error(`响应头: ${JSON.stringify(error.response.headers, null, 2)}`);
    }
    throw error;
  }
}

// 保存新闻数据
async function saveNewsData(newsList) {
  try {
    // 读取现有数据
    let existingNews = [];
    try {
      const existingData = await fs.readFile(ALL_NEWS_FILE, 'utf8');
      const parsedData = JSON.parse(existingData);
      // 处理不同的数据格式
      if (Array.isArray(parsedData)) {
        existingNews = parsedData;
      } else if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        existingNews = parsedData.data;
      } else {
        existingNews = [];
      }
    } catch (error) {
      console.log('📝 创建新的数据文件');
    }

    // 再次过滤无效新闻并去重合并（基于标题）
    const validNewNews = newsList.filter(news => isValidNews(news.title, news.content));
    const existingTitles = new Set(existingNews.map(news => news.title));
    const uniqueNewNews = validNewNews.filter(news => !existingTitles.has(news.title));
    
    const allNews = [...existingNews, ...uniqueNewNews]
      .sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());

    // 保存最新数据（用于前端展示）
    const latestData = {
      success: true,
      data: allNews.slice(0, 500), // 前端只需要最新500条
      total: allNews.length,
      updateTime: new Date().toISOString()
    };

    // 保存完整数据（用于历史记录）
    const allData = {
      success: true,
      data: allNews,
      total: allNews.length,
      updateTime: new Date().toISOString()
    };

    await Promise.all([
      fs.writeFile(AI_NEWS_FILE, JSON.stringify(latestData, null, 2)),
      fs.writeFile(ALL_NEWS_FILE, JSON.stringify(allData, null, 2))
    ]);

    console.log(`💾 数据保存成功:`);
    console.log(`   - 新增新闻: ${uniqueNewNews.length} 条`);
    console.log(`   - 总计新闻: ${allNews.length} 条`);
    console.log(`   - 前端展示: ${latestData.data.length} 条`);

    // 保存历史记录
    await saveHistoryData(allNews);

  } catch (error) {
    console.error('❌ 保存数据失败:', error);
    throw error;
  }
}

// 保存历史数据
async function saveHistoryData(newsList) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayFile = path.join(HISTORY_DIR, `${today}.json`);
    
    // 保存今日数据
    const todayData = {
      date: today,
      data: newsList.slice(0, 100), // 每日文件只保存100条最新
      total: newsList.length,
      updateTime: new Date().toISOString()
    };
    
    await fs.writeFile(todayFile, JSON.stringify(todayData, null, 2));

    // 更新历史索引
    let historyIndex = [];
    try {
      const indexData = await fs.readFile(HISTORY_INDEX_FILE, 'utf8');
      const parsedIndex = JSON.parse(indexData);
      // 确保是数组格式
      if (Array.isArray(parsedIndex)) {
        historyIndex = parsedIndex;
      } else if (parsedIndex && parsedIndex.data && Array.isArray(parsedIndex.data)) {
        historyIndex = parsedIndex.data;
      } else {
        historyIndex = [];
      }
    } catch (error) {
      console.log('📝 创建新的历史索引');
    }

    // 添加或更新今日记录
    const existingIndex = historyIndex.findIndex(record => record && record.date === today);
    if (existingIndex >= 0) {
      historyIndex[existingIndex] = {
        date: today,
        count: newsList.length,
        updateTime: new Date().toISOString()
      };
    } else {
      historyIndex.push({
        date: today,
        count: newsList.length,
        updateTime: new Date().toISOString()
      });
    }

    // 按日期排序
    historyIndex.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await fs.writeFile(HISTORY_INDEX_FILE, JSON.stringify(historyIndex, null, 2));
    
    console.log(`📚 历史数据保存成功: ${today}.json`);

  } catch (error) {
    console.error('❌ 保存历史数据失败:', error);
  }
}

// 主函数
async function main() {
  try {
    const startTime = Date.now();
    await crawlAIToolNews();
    const endTime = Date.now();
    console.log(`⏱️  总耗时: ${((endTime - startTime) / 1000).toFixed(2)} 秒`);
  } catch (error) {
    console.error('❌ 程序执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  crawlAIToolNews,
  saveNewsData,
  parseAIBotNews
}; 