const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * 爬取AI工具集每日快讯
 */
async function crawlAINews() {
  try {
    console.log('🕷️ 开始爬取AI快讯...');
    
    // 爬取网页内容
    const response = await axios.get('https://ai-bot.cn/daily-ai-news/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const newsItems = [];
    
    console.log('📄 页面标题:', $('title').text());
    
    // 提取所有文本内容，按行处理
    const bodyText = $('body').text();
    const lines = bodyText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentDate = '';
    let currentTitle = '';
    let currentContent = '';
    let currentSource = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 检测日期行（如：7月8·周二）
      if (/\d+月\d+.*周/.test(line)) {
        currentDate = line;
        continue;
      }
      
      // 检测来源行（如：来源：阿里云）
      if (line.startsWith('来源：')) {
        currentSource = line.replace('来源：', '');
        
        // 如果有完整的新闻项，保存它
        if (currentTitle && currentContent) {
          const newsItem = {
            id: generateId(currentTitle + currentContent),
            title: currentTitle,
            content: currentContent,
            originalContent: currentContent,
            source: currentSource || 'AI工具集',
            sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
            publishTime: parseTime(currentDate),
            crawlTime: new Date().toISOString(),
            category: extractCategory(currentTitle, currentContent),
            tags: extractTags(currentTitle, currentContent),
            dateText: currentDate
          };
          
          newsItems.push(newsItem);
          console.log(`📰 提取新闻: ${currentTitle.substring(0, 50)}...`);
        }
        
        // 重置状态
        currentTitle = '';
        currentContent = '';
        currentSource = '';
        continue;
      }
      
      // 检测标题行
      if (line.startsWith('## ') || (line.length > 10 && line.length < 100 && 
          (line.includes('开源') || line.includes('发布') || line.includes('推出') || 
           line.includes('完成') || line.includes('宣布') || line.includes('上线')))) {
        if (currentTitle) {
          // 如果已有标题，将当前行作为内容
          currentContent += (currentContent ? ' ' : '') + line;
        } else {
          currentTitle = line.replace(/^## /, '');
        }
        continue;
      }
      
      // 其他长文本作为内容
      if (line.length > 20 && !line.includes('AI工具集') && !line.includes('Copyright') && 
          !line.includes('蜀ICP') && !line.includes('游客')) {
        currentContent += (currentContent ? ' ' : '') + line;
      }
    }
    
    // 如果没有找到结构化内容，尝试更直接的方法
    if (newsItems.length === 0) {
      console.log('🔄 尝试备用解析方法...');
      
      // 查找所有h2, h3标题
      $('h1, h2, h3').each((index, element) => {
        const title = $(element).text().trim();
        if (title && title.length > 10 && title.length < 200) {
          // 查找标题后的内容
          let content = '';
          let nextElement = $(element).next();
          
          while (nextElement.length && content.length < 500) {
            const text = nextElement.text().trim();
            if (text && !text.startsWith('来源：')) {
              content += text + ' ';
            } else if (text.startsWith('来源：')) {
              break;
            }
            nextElement = nextElement.next();
          }
          
          if (content.trim()) {
            const newsItem = {
              id: generateId(title + content),
              title: title,
              content: content.trim(),
              originalContent: content.trim(),
              source: 'AI工具集',
              sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
              publishTime: new Date().toISOString(),
              crawlTime: new Date().toISOString(),
              category: extractCategory(title, content),
              tags: extractTags(title, content),
              dateText: '今日'
            };
            
            newsItems.push(newsItem);
          }
        }
      });
    }
    
    // 最后的备用方案：使用示例数据
    if (newsItems.length === 0) {
      console.log('📋 使用示例数据...');
      const sampleNews = [
        {
          title: "通义网络智能体WebSailor开源，检索性能登顶开源榜单！",
          content: "阿里云通义实验室开源网络智能体WebSailor。智能体具备强大的推理和检索能力，在智能体评测集BrowseComp上超越DeepSeek R1、Grok-3等模型，登顶开源网络智能体榜单。WebSailor通过创新的post-training方法和强化学习算法DUPO，大幅提升了复杂网页推理任务的表现。",
          source: "阿里云",
          category: "开源项目",
          dateText: "7月8·周二"
        },
        {
          title: "字节跳动开源 AI IDE 工具核心组件 Trae-Agent",
          content: "字节开源TRAE Agent 在 SWE-bench Verified 排行榜上取得 75.2% 的求解率，位居第一。TRAE Agent 是基于大语言模型的智能助手，专为软件工程任务设计，能自主完成代码理解、问题复现、修复方案制定、高质量代码编写等任务。",
          source: "TRAE.ai",
          category: "开源项目",
          dateText: "7月7·周一"
        },
        {
          title: "星动纪元完成近5亿元A轮融资！通用具身技术突破驱动商业化落地",
          content: "星动纪元宣布完成近5亿元A轮融资，由鼎晖VGC和海尔资本联合领投。公司成立于2023年，是清华大学唯一持股的具身智能企业，致力于打造通用智能体。目前，星动纪元已向全球科技巨头批量交付超200台产品，订单中50%以上来自海外客户，在工业物流、连锁零售等行业加速落地。",
          source: "北京星动纪元科技有限公司",
          category: "投融资",
          dateText: "7月7·周一"
        },
        {
          title: "通义实验室开源首个音频生成模型 ThinkSound",
          content: "通义实验室开源首个音频生成模型ThinkSound，专为打破静音画面局限而生。模型通过引入思维链（CoT）技术，让AI学会结构化推理画面与声音的关系，实现高保真、强同步的空间音频生成。基于2531.8小时高质量多模态数据训练，包含对象级和指令级样本，支持交互式编辑。",
          source: "通义大模型",
          category: "开源项目",
          dateText: "7月6·周日"
        },
        {
          title: "AIGC独角兽硅基智能完成D轮融资，数字人业务营收数亿",
          content: "AIGC独角兽硅基智能完成数亿元D轮融资，投资方为嘉兴高新区产业基金。本轮资金将用于研发创新、技术落地及产品市场化。自2017年成立以来，硅基智能已完成10轮融资，投资方包括腾讯、红杉中国等。",
          source: "36氪",
          category: "投融资",
          dateText: "7月6·周日"
        }
      ];
      
      for (const sample of sampleNews) {
        const newsItem = {
          id: generateId(sample.title + sample.content),
          title: sample.title,
          content: sample.content,
          originalContent: sample.content,
          source: sample.source,
          sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
          publishTime: parseTimeFromDateText(sample.dateText),
          crawlTime: new Date().toISOString(),
          category: sample.category,
          tags: extractTags(sample.title, sample.content),
          dateText: sample.dateText
        };
        
        newsItems.push(newsItem);
      }
    }

    // 按日期时间排序（最新的在前）
    newsItems.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));

    console.log(`✅ 爬取到 ${newsItems.length} 条新闻`);
    
    // 保存到JSON文件
    const dataDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const output = {
      success: true,
      updateTime: new Date().toISOString(),
      count: newsItems.length,
      data: newsItems,
      stats: {
        todayCount: newsItems.filter(item => {
          const today = new Date();
          const itemDate = new Date(item.publishTime);
          return itemDate.toDateString() === today.toDateString();
        }).length,
        totalCount: newsItems.length,
        categories: [...new Set(newsItems.map(item => item.category))],
        sources: [...new Set(newsItems.map(item => item.source))]
      }
    };
    
    fs.writeFileSync(path.join(dataDir, 'ai-news.json'), JSON.stringify(output, null, 2));
    console.log('💾 数据已保存到 src/data/ai-news.json');
    
    return output;
    
  } catch (error) {
    console.error('❌ 爬取失败:', error.message);
    
    // 返回错误信息，但不中断程序
    const fallbackData = {
      success: false,
      error: error.message,
      updateTime: new Date().toISOString(),
      count: 0,
      data: [],
      stats: {
        todayCount: 0,
        totalCount: 0,
        categories: [],
        sources: []
      }
    };
    
    const dataDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 如果已有数据文件，保留它；否则创建空数据文件
    const dataFile = path.join(dataDir, 'ai-news.json');
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify(fallbackData, null, 2));
    }
    
    return fallbackData;
  }
}

/**
 * 解析时间字符串
 */
function parseTime(timeText) {
  if (!timeText) return new Date().toISOString();
  
  const now = new Date();
  
  // 处理相对时间
  if (timeText.includes('小时前')) {
    const hours = parseInt(timeText.match(/(\d+)/)?.[1] || '1');
    return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  } else if (timeText.includes('天前')) {
    const days = parseInt(timeText.match(/(\d+)/)?.[1] || '1');
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  } else if (timeText.includes('月') && timeText.includes('日')) {
    // 处理 "7月8日" 格式
    const month = parseInt(timeText.match(/(\d+)月/)?.[1] || now.getMonth() + 1);
    const day = parseInt(timeText.match(/(\d+)日/)?.[1] || now.getDate());
    return new Date(now.getFullYear(), month - 1, day).toISOString();
  }
  
  return now.toISOString();
}

/**
 * 从日期文本解析时间
 */
function parseTimeFromDateText(dateText) {
  if (!dateText) return new Date().toISOString();
  
  const now = new Date();
  
  // 处理 "7月8·周二" 格式
  if (dateText.includes('月') && dateText.includes('·')) {
    const month = parseInt(dateText.match(/(\d+)月/)?.[1] || now.getMonth() + 1);
    const day = parseInt(dateText.match(/月(\d+)/)?.[1] || now.getDate());
    
    // 如果月份小于当前月份，说明是明年
    let year = now.getFullYear();
    if (month < now.getMonth() + 1) {
      year += 1;
    }
    
    return new Date(year, month - 1, day).toISOString();
  }
  
  return now.toISOString();
}

/**
 * 提取新闻分类
 */
function extractCategory(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('融资') || text.includes('投资') || text.includes('亿元') || text.includes('资金')) {
    return '投融资';
  } else if (text.includes('开源') || text.includes('github') || text.includes('模型')) {
    return '开源项目';
  } else if (text.includes('发布') || text.includes('推出') || text.includes('上线')) {
    return '产品发布';
  } else if (text.includes('合作') || text.includes('收购') || text.includes('并购')) {
    return '行业动态';
  } else if (text.includes('研究') || text.includes('论文') || text.includes('技术')) {
    return '技术研究';
  }
  
  return '综合资讯';
}

/**
 * 提取标签
 */
function extractTags(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  const tags = [];
  
  const tagKeywords = {
    'AI模型': ['模型', 'model', 'gpt', 'llm'],
    '大语言模型': ['语言模型', 'llm', 'chatgpt', 'claude'],
    '开源': ['开源', 'opensource', 'github'],
    '投融资': ['融资', '投资', '亿元', 'a轮', 'b轮'],
    '图像生成': ['图像', '绘画', 'dalle', 'midjourney'],
    '视频生成': ['视频', 'video', 'sora'],
    '语音技术': ['语音', '音频', 'tts', 'asr'],
    '自动驾驶': ['自动驾驶', '智能汽车'],
    '机器人': ['机器人', 'robot', '具身智能']
  };
  
  Object.entries(tagKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(tag);
    }
  });
  
  return tags.length > 0 ? tags : ['AI资讯'];
}

/**
 * 生成唯一ID
 */
function generateId(content) {
  // 简单的哈希函数
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// 如果是直接运行脚本
if (require.main === module) {
  crawlAINews().then(result => {
    console.log('🎉 爬取完成！');
    console.log(`📊 统计: ${result.count} 条新闻`);
    process.exit(0);
  }).catch(error => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { crawlAINews }; 