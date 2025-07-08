const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

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

// 发送HTTP请求（带重试机制）
async function fetchWithRetry(url, options = {}, retries = CRAWL_CONFIG.retryTimes) {
  const config = {
    timeout: CRAWL_CONFIG.timeout,
    headers: {
      'User-Agent': CRAWL_CONFIG.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
    ...options
  };

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🌐 请求 ${url} (第${i + 1}次尝试)`);
      const response = await axios.get(url, config);
      
      if (response.status === 200) {
        console.log(`✅ 成功获取 ${url}`);
        return response;
      }
    } catch (error) {
      console.warn(`⚠️  请求失败 (${i + 1}/${retries}):`, error.message);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
    }
  }
}

// 解析日期文本为标准日期
function parseDateText(dateText) {
  if (!dateText) return new Date();
  
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // 匹配 "7月8·周二" 格式
  const match = dateText.match(/(\d+)月(\d+)/);
  if (match) {
    const month = parseInt(match[1]) - 1; // JavaScript月份从0开始
    const day = parseInt(match[2]);
    
    // 判断年份：如果月份小于当前月份，可能是下一年
    let year = currentYear;
    if (month < now.getMonth() || (month === now.getMonth() && day < now.getDate())) {
      // 如果是过去的日期，保持当前年份
      year = currentYear;
    }
    
    return new Date(year, month, day);
  }
  
  return now;
}

// 解析新闻页面
function parseNewsPage(html) {
  const $ = cheerio.load(html);
  const newsList = [];
  let currentDate = null;
  let currentDateText = '';

  try {
    console.log('📄 开始解析AI工具集新闻页面...');
    
    // 查找所有文本内容，按行处理
    const bodyText = $('body').text();
    const lines = bodyText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentTitle = '';
    let currentContent = '';
    let currentSource = '';
    let newsItemCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 跳过无关内容
      if (line.includes('AI工具集') || line.includes('Copyright') || 
          line.includes('蜀ICP') || line.includes('游客') ||
          line.includes('回复') || line.includes('个月前') ||
          line.length < 5) {
        continue;
      }
      
      // 检测日期行（如：7月8·周二）
      if (/^\d+月\d+.*周/.test(line)) {
        currentDateText = line;
        currentDate = parseDateText(line);
        console.log(`📅 找到日期: ${line} -> ${currentDate.toDateString()}`);
        continue;
      }
      
      // 检测来源行（如：来源：阿里云）
      if (line.startsWith('来源：')) {
        currentSource = line.replace('来源：', '').trim();
        
        // 如果有完整的新闻项，保存它
        if (currentTitle && currentContent && currentDate) {
          const publishTime = new Date(currentDate);
          // 为同一天的新闻设置不同的时间
          publishTime.setHours(9 + (newsItemCount % 12), (newsItemCount * 17) % 60);
          
          const newsItem = {
            id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: currentTitle.trim(),
            content: currentContent.trim(),
            source: currentSource || 'AI工具集',
            sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
            publishTime: publishTime.toISOString(),
            crawlTime: new Date().toISOString(),
            category: categorizeNews(currentTitle + ' ' + currentContent),
            tags: extractTags(currentTitle + ' ' + currentContent),
            dateText: currentDateText
          };
          
          newsList.push(newsItem);
          newsItemCount++;
          console.log(`📰 提取新闻 ${newsItemCount}: ${currentTitle.substring(0, 50)}...`);
        }
        
        // 重置状态
        currentTitle = '';
        currentContent = '';
        continue;
      }
      
      // 检测标题行（通常是##开头或者是较短的描述性文本）
      if (line.startsWith('## ') || 
          (line.length > 15 && line.length < 150 && 
           (line.includes('开源') || line.includes('发布') || line.includes('推出') || 
            line.includes('完成') || line.includes('宣布') || line.includes('上线') ||
            line.includes('升级') || line.includes('融资') || line.includes('投资')))) {
        
        if (currentTitle && currentContent) {
          // 如果已有标题和内容，当前行作为新内容
          currentContent += (currentContent ? ' ' : '') + line.replace(/^## /, '');
        } else if (!currentTitle) {
          currentTitle = line.replace(/^## /, '');
        } else {
          currentContent += (currentContent ? ' ' : '') + line.replace(/^## /, '');
        }
        continue;
      }
      
      // 其他长文本作为内容
      if (line.length > 20 && line.length < 1000) {
        currentContent += (currentContent ? ' ' : '') + line;
      }
    }
    
    // 处理最后一条新闻（可能没有"来源："结尾）
    if (currentTitle && currentContent && currentDate) {
      const publishTime = new Date(currentDate);
      publishTime.setHours(9 + (newsItemCount % 12), (newsItemCount * 17) % 60);
      
      const newsItem = {
        id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: currentTitle.trim(),
        content: currentContent.trim(),
        source: currentSource || 'AI工具集',
        sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
        publishTime: publishTime.toISOString(),
        crawlTime: new Date().toISOString(),
        category: categorizeNews(currentTitle + ' ' + currentContent),
        tags: extractTags(currentTitle + ' ' + currentContent),
        dateText: currentDateText
      };
      
      newsList.push(newsItem);
      newsItemCount++;
      console.log(`📰 提取新闻 ${newsItemCount}: ${currentTitle.substring(0, 50)}...`);
    }

    // 如果没有找到新闻，使用备用解析方法
    if (newsList.length === 0) {
      console.log('🔄 尝试备用解析方法...');
      return parseNewsPageAlternative($);
    }

    // 按发布时间排序
    newsList.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());

    console.log(`✅ 成功解析 ${newsList.length} 条新闻`);
    return newsList;

  } catch (error) {
    console.error('❌ 解析页面失败:', error);
    return [];
  }
}

// 备用解析方法
function parseNewsPageAlternative($) {
  console.log('🔍 使用备用解析方法...');
  const newsList = [];
  
  // 查找所有标题元素
  $('h1, h2, h3, h4').each((index, element) => {
    const title = $(element).text().trim();
    if (title && title.length > 10 && title.length < 200) {
      // 查找标题后的内容
      let content = '';
      let source = 'AI工具集';
      let nextElement = $(element).next();
      
      while (nextElement.length && content.length < 500) {
        const text = nextElement.text().trim();
        if (text && !text.startsWith('来源：') && text.length > 10) {
          content += text + ' ';
        } else if (text.startsWith('来源：')) {
          source = text.replace('来源：', '').trim();
          break;
        }
        nextElement = nextElement.next();
      }
      
      if (content.trim()) {
        const publishTime = new Date();
        publishTime.setHours(publishTime.getHours() - index);
        
        const newsItem = {
          id: `news_alt_${Date.now()}_${index}`,
          title: title,
          content: content.trim().substring(0, 300),
          source: source,
          sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
          publishTime: publishTime.toISOString(),
          crawlTime: new Date().toISOString(),
          category: categorizeNews(title + ' ' + content),
          tags: extractTags(title + ' ' + content),
          dateText: '今日'
        };
        
        newsList.push(newsItem);
      }
    }
  });
  
  console.log(`✅ 备用方法解析到 ${newsList.length} 条新闻`);
  return newsList;
}

// 提取标签
function extractTags(text) {
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
function categorizeNews(text) {
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

// 爬取AI工具集新闻
async function crawlAIToolNews() {
  try {
    console.log('📰 开始爬取AI工具集新闻...');
    
    const response = await fetchWithRetry(CRAWL_CONFIG.baseUrl);
    const newsList = parseNewsPage(response.data);
    
    console.log(`✅ 爬取完成，获得 ${newsList.length} 条新闻`);
    return newsList;
    
  } catch (error) {
    console.error('❌ 爬取失败:', error.message);
    return [];
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
      } else if (parsedData.data && Array.isArray(parsedData.data)) {
        existingNews = parsedData.data;
      } else {
        existingNews = [];
      }
    } catch (error) {
      console.log('📝 创建新的数据文件');
    }

    // 去重合并（基于标题）
    const existingTitles = new Set(existingNews.map(news => news.title));
    const uniqueNewNews = newsList.filter(news => !existingTitles.has(news.title));
    
    const allNews = [...existingNews, ...uniqueNewNews]
      .sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());

    // 统计信息
    const today = new Date().toISOString().split('T')[0];
    const todayNews = allNews.filter(news => 
      news.publishTime.startsWith(today)
    );

    const categories = [...new Set(allNews.map(news => news.category))];
    const sources = [...new Set(allNews.map(news => news.source))];

    const stats = {
      totalCount: allNews.length,
      todayCount: todayNews.length,
      newCount: uniqueNewNews.length,
      categories,
      sources,
      lastUpdate: new Date().toISOString()
    };

    // 保存最新数据（用于前端展示）
    const latestNews = allNews.slice(0, 100); // 取最新100条
    const aiNewsData = {
      success: true,
      data: latestNews,
      stats,
      updateTime: new Date().toISOString(),
      count: latestNews.length
    };

    await fs.writeFile(AI_NEWS_FILE, JSON.stringify(aiNewsData, null, 2), 'utf8');

    // 保存完整历史数据
    await fs.writeFile(ALL_NEWS_FILE, JSON.stringify(allNews, null, 2), 'utf8');

    console.log(`💾 数据保存完成:`);
    console.log(`   - 新增: ${uniqueNewNews.length} 条`);
    console.log(`   - 总计: ${allNews.length} 条`);
    console.log(`   - 今日: ${todayNews.length} 条`);

    return stats;

  } catch (error) {
    console.error('❌ 保存数据失败:', error);
    throw error;
  }
}

// 保存历史记录
async function saveHistoryRecord(stats) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const historyFile = path.join(HISTORY_DIR, `${today}.json`);
    
    const historyRecord = {
      date: today,
      stats,
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(historyFile, JSON.stringify(historyRecord, null, 2), 'utf8');

    // 更新历史索引
    let historyIndex = [];
    try {
      const indexData = await fs.readFile(HISTORY_INDEX_FILE, 'utf8');
      historyIndex = JSON.parse(indexData);
    } catch (error) {
      console.log('📝 创建新的历史索引');
    }

    // 添加或更新今日记录
    const existingIndex = historyIndex.findIndex(record => record.date === today);
    if (existingIndex >= 0) {
      historyIndex[existingIndex] = { date: today, ...stats };
    } else {
      historyIndex.push({ date: today, ...stats });
    }

    // 按日期降序排序，保留最近30天
    historyIndex = historyIndex
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    await fs.writeFile(HISTORY_INDEX_FILE, JSON.stringify(historyIndex, null, 2), 'utf8');

    console.log(`📚 历史记录已保存: ${historyFile}`);

  } catch (error) {
    console.error('❌ 保存历史记录失败:', error);
  }
}

// 主函数
async function main() {
  const startTime = Date.now();
  console.log('🚀 AI新闻爬虫启动...\n');

  try {
    // 创建目录结构
    await ensureDirectories();

    // 爬取新闻
    const newsList = await crawlAIToolNews();

    if (newsList.length === 0) {
      console.log('⚠️  未获取到任何新闻数据，使用示例数据');
      
      // 创建示例数据
      const sampleNews = [
        {
          id: 'sample_1',
          title: '混元3D再升级，推出业界首个美术级3D生成大模型Hunyuan3D-PolyGen',
          content: '腾讯混元3D宣布升级，推出业界首个美术级3D生成大模型Hunyuan3D-PolyGen。模型结合自研高压缩率表征BPT技术，可生成上万面复杂几何模型，布线精度高，细节丰富，支持三边面和四边面，满足不同专业需求。',
          source: '腾讯混元',
          sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
          publishTime: new Date().toISOString(),
          crawlTime: new Date().toISOString(),
          category: '产品发布',
          tags: ['3D', '大模型', '腾讯', '技术'],
          dateText: '今日'
        }
      ];
      
      const stats = await saveNewsData(sampleNews);
      await saveHistoryRecord(stats);
      
      console.log(`\n✅ 使用示例数据完成初始化`);
      return;
    }

    // 保存数据
    const stats = await saveNewsData(newsList);
    
    // 保存历史记录
    await saveHistoryRecord(stats);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n🎉 爬取任务完成！`);
    console.log(`   - 耗时: ${duration}s`);
    console.log(`   - 新增: ${stats.newCount} 条新闻`);
    console.log(`   - 总计: ${stats.totalCount} 条新闻`);
    console.log(`   - 文件: ${AI_NEWS_FILE}`);
    
  } catch (error) {
    console.error('\n❌ 爬取任务失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  crawlAIToolNews,
  saveNewsData,
  parseNewsPage
}; 