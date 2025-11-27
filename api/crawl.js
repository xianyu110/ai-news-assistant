import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

// 生成新闻ID
function generateNewsId(title) {
  return crypto.createHash('md5').update(title.trim()).digest('hex').substring(0, 8);
}

// 检查是否为有效新闻
function isValidNews(title, content) {
  if (!title || title.length < 10 || title.length > 300) return false;
  
  const invalidPatterns = [
    /^AI工具集.*社群$/, /^.*游客.*回复$/, /^每日AI快讯.*更新$/,
    /版权所有|ICP|备案/, /加入.*群|联系.*客服/, /^首页[•·]/
  ];
  
  if (invalidPatterns.some(p => p.test(title.trim()))) return false;
  
  const techKeywords = [
    'AI', '人工智能', 'GPT', '大模型', '机器学习', '深度学习', '智能', 
    'OpenAI', 'ChatGPT', '语言模型', '算法', '科技', '技术', '研发', 
    '发布', '投资', '融资', '开源', '升级', '推出', '宣布', '完成',
    '模型', '数据', '平台', '工具', '系统', '应用', '产品', '服务'
  ];
  
  return techKeywords.some(k => `${title} ${content}`.includes(k));
}

// 提取标签
function extractTags(title, content = '') {
  const text = `${title} ${content}`;
  const tags = [];
  const keywords = {
    'GPT': ['GPT', 'ChatGPT'], '开源': ['开源'], '融资': ['融资', '投资'],
    '发布': ['发布', '推出'], '合作': ['合作', '联合'], '研究': ['研究', '论文'],
    '大模型': ['大模型', '语言模型'], '技术': ['技术', '算法']
  };
  
  Object.entries(keywords).forEach(([tag, words]) => {
    if (words.some(w => text.includes(w))) tags.push(tag);
  });
  
  return tags.slice(0, 5);
}

// 新闻分类
function categorizeNews(title, content = '') {
  const text = `${title} ${content}`;
  const categories = {
    '投融资': ['融资', '投资'], '开源项目': ['开源', 'GitHub'],
    '产品发布': ['发布', '推出'], '行业动态': ['合作', '联合'],
    '技术研究': ['研究', '论文']
  };
  
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return '综合资讯';
}

// 解析日期
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  
  const match = dateStr.match(/(\d{1,2})月(\d{1,2})/);
  if (match) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    const now = new Date();
    let year = now.getFullYear();
    
    if (month > now.getMonth() + 1) year--;
    
    return new Date(year, month - 1, day);
  }
  
  return new Date();
}

// 解析新闻
async function parseNews(html) {
  const $ = cheerio.load(html);
  const newsItems = [];
  
  $('.news-list').each((_, container) => {
    const $container = $(container);
    let currentDate = '';
    
    $container.children().each((_, element) => {
      const $el = $(element);
      
      if ($el.hasClass('news-date')) {
        currentDate = $el.text().trim();
        return;
      }
      
      if ($el.hasClass('news-item')) {
        const $content = $el.find('.news-content');
        const $titleEl = $content.find('h1, h2, h3').find('a').first();
        const title = $titleEl.text().trim();
        
        if (!title) return;
        
        const $textEl = $content.find('p.text-muted');
        const $contentClone = $textEl.clone();
        $contentClone.find('.news-time').remove();
        const content = $contentClone.text().trim();
        
        const $sourceEl = $textEl.find('.news-time');
        let source = 'AI工具集';
        if ($sourceEl.length > 0) {
          const sourceMatch = $sourceEl.text().match(/来源[：:]\s*(.+)/);
          if (sourceMatch) source = sourceMatch[1].trim();
        }
        
        if (isValidNews(title, content)) {
          newsItems.push({
            id: generateNewsId(title),
            title,
            content: content || title,
            source,
            sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
            publishTime: parseDate(currentDate),
            crawlTime: new Date(),
            category: categorizeNews(title, content),
            tags: extractTags(title, content)
          });
        }
      }
    });
  });
  
  return newsItems;
}

// 主处理函数
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('🚀 Starting news crawl...');
    
    const response = await axios.get('https://ai-bot.cn/daily-ai-news/', {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const newsList = await parseNews(response.data);
    
    console.log(`✅ Crawled ${newsList.length} news items`);
    
    return res.status(200).json({
      success: true,
      message: `成功爬取 ${newsList.length} 条新闻`,
      data: newsList.slice(0, 100),
      total: newsList.length,
      lastUpdate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Crawl failed:', error);
    return res.status(500).json({
      success: false,
      message: '爬取失败',
      error: error.message
    });
  }
}
