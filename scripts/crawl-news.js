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

// 解析AI工具集新闻 - 重新设计
async function parseAIBotNews(html) {
  const $ = cheerio.load(html);
  const newsList = [];
  
  console.log('📄 开始按日期分组解析AI工具集新闻页面...');
  
  // 策略：识别日期分组，为后续新闻分配日期
  const bodyText = $('body').text();
  const lines = bodyText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 5);
  
  let currentDate = new Date(); // 默认当前日期
  let currentDateText = '今日';
  let validNewsCount = 0;
  const processedTitles = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 跳过明显的无关内容
    if (line.includes('版权所有') || line.includes('ICP') || 
        line.includes('游客') || line.includes('回复') ||
        (line.includes('工具集') && line.length < 20)) {
      continue;
    }
    
    // 检查是否为日期分组标题
    const dateGroupMatch = line.match(/(\d{1,2})月(\d{1,2})日[·•]?周[一二三四五六日]/);
    if (dateGroupMatch) {
      const parsedDate = parseDate(dateGroupMatch[0]);
      if (parsedDate) {
        currentDate = parsedDate;
        currentDateText = formatDate(parsedDate);
        console.log(`📅 发现日期分组: ${line} -> ${currentDateText}`);
        continue;
      }
    }
    
    // 检查其他日期格式
    const otherDateMatch = line.match(/(\d{1,2})\.(\d{1,2})/);
    if (otherDateMatch && line.length < 20) { // 短行可能是纯日期
      const month = parseInt(otherDateMatch[1]);
      const day = parseInt(otherDateMatch[2]);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const parsedDate = createDateFromMonthDay(month, day);
        if (parsedDate) {
          currentDate = parsedDate;
          currentDateText = formatDate(parsedDate);
          console.log(`📅 发现日期标记: ${line} -> ${currentDateText}`);
          continue;
        }
      }
    }
    
    // 先进行基本清理
    const cleanLine = line.trim();
    
    // 检查是否为有效新闻
    if (!isValidNews(cleanLine, '')) {
      continue;
    }
    
    // 防重复
    if (processedTitles.has(line)) {
      continue;
    }
    processedTitles.add(line);
    
    // 尝试获取更多内容（下一行）
    let content = line;
    if (i + 1 < lines.length && lines[i + 1].length > 10) {
      content += ' ' + lines[i + 1];
    }
    
    const newsItem = {
      id: generateNewsId(line),
      title: line,
      content: content.length > line.length ? content.substring(line.length).trim() : line,
      originalContent: content,
      source: 'AI工具集',
      sourceUrl: CRAWL_CONFIG.baseUrl,
      publishTime: currentDate.toISOString(),
      crawlTime: new Date().toISOString(),
      category: categorizeNews(line, content),
      tags: extractTags(line, content),
      dateText: currentDateText
    };
    
    newsList.push(newsItem);
    validNewsCount++;
    
    if (validNewsCount % 10 === 0) {
      console.log(`📝 已解析 ${validNewsCount} 条新闻... (当前日期: ${currentDateText})`);
    }
  }
  
  console.log(`✅ 解析完成，共提取 ${validNewsCount} 条有效新闻`);
  return newsList;
}

// 解析日期字符串
function parseDate(dateStr) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  // 匹配月日格式
  const match = dateStr.match(/(\d{1,2})月(\d{1,2})日/);
  if (match) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    
    // 验证日期范围
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    
    // 判断年份
    let year = currentYear;
    if (month > currentMonth + 1) {
      year = currentYear - 1;
    }
    
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
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