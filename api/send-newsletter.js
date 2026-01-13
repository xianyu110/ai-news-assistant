import { kv } from '@vercel/kv';
import axios from 'axios';

// 构建邮件 HTML 内容
function buildEmailHTML(newsList) {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>每日AI新闻快讯</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .news-item { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
    .news-item h3 { margin: 0 0 10px; color: #333; font-size: 16px; }
    .news-item p { margin: 5px 0; color: #666; font-size: 14px; }
    .news-meta { font-size: 12px; color: #999; margin-top: 10px; }
    .news-meta span { margin-right: 15px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 每日AI新闻快讯</h1>
    <p>${today}</p>
  </div>
  
  <p style="color: #666; margin-bottom: 20px;">为您精选最新的AI行业动态，助您把握科技前沿趋势。</p>
`;

  newsList.forEach((news, index) => {
    const publishDate = new Date(news.publishTime).toLocaleDateString('zh-CN');
    const tags = news.tags && news.tags.length > 0 ? news.tags.join(' | ') : '';
    
    html += `
  <div class="news-item">
    <h3>${index + 1}. ${news.title}</h3>
    <p>${news.content || news.summary || ''}</p>
    <div class="news-meta">
      <span>📅 ${publishDate}</span>
      ${tags ? `<span>🏷️ ${tags}</span>` : ''}
      <span>📰 ${news.source}</span>
    </div>
  </div>
`;
  });

  html += `
  <div class="footer">
    <p>此邮件由 AI 新闻助手自动生成</p>
    <p>访问网站查看更多：<a href="https://nav.chatgpt-plus.top">nav.chatgpt-plus.top</a></p>
    <p><a href="https://nav.chatgpt-plus.top/unsubscribe">取消订阅</a></p>
  </div>
</body>
</html>
`;

  return html;
}

// 发送邮件（使用 Resend API）
async function sendEmail(to, subject, html) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    throw new Error('未配置 RESEND_API_KEY 环境变量');
  }
  
  try {
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: 'AI新闻助手 <newsletter@yourdomain.com>', // 需要配置你的域名
        to: [to],
        subject: subject,
        html: html,
      },
      {
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error(`发送邮件失败 (${to}):`, error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 简单的认证检查
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log('📧 开始发送每日新闻邮件...');
    
    // 获取订阅者列表
    const subscribers = await kv.get('subscribers') || [];
    
    if (subscribers.length === 0) {
      console.log('📭 没有订阅者');
      return res.status(200).json({ 
        success: true, 
        message: '没有订阅者',
        sentCount: 0
      });
    }
    
    console.log(`📬 找到 ${subscribers.length} 个订阅者`);
    
    // 获取最新新闻（调用爬虫 API）
    const crawlUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/crawl`;
    const newsResponse = await axios.get(crawlUrl, { timeout: 30000 });
    
    if (!newsResponse.data.success || !newsResponse.data.data) {
      throw new Error('获取新闻数据失败');
    }
    
    const newsList = newsResponse.data.data.slice(0, 10); // 只发送前10条
    console.log(`📰 准备发送 ${newsList.length} 条新闻`);
    
    // 构建邮件内容
    const emailHTML = buildEmailHTML(newsList);
    const subject = `每日AI新闻快讯 - ${new Date().toLocaleDateString('zh-CN')}`;
    
    // 批量发送邮件
    const results = [];
    let successCount = 0;
    
    for (const email of subscribers) {
      const result = await sendEmail(email, subject, emailHTML);
      results.push({ email, ...result });
      
      if (result.success) {
        successCount++;
      }
      
      // 避免发送过快，每封邮件间隔 100ms
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ 邮件发送完成: ${successCount}/${subscribers.length} 成功`);
    
    return res.status(200).json({
      success: true,
      message: `成功发送 ${successCount}/${subscribers.length} 封邮件`,
      sentCount: successCount,
      totalSubscribers: subscribers.length,
      results: results
    });
    
  } catch (error) {
    console.error('❌ 发送新闻邮件失败:', error);
    return res.status(500).json({
      error: '发送新闻邮件失败',
      details: error.message
    });
  }
}
