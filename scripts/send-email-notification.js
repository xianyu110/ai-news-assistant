import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES模块中替代__dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 邮箱配置
const EMAIL_CONFIG = {
  host: 'smtp.qq.com',
  port: 587,
  secure: false,
  auth: {
    user: '3497181457@qq.com',
    pass: process.env.EMAIL_PASSWORD || 'regtopndvdricidf'
  }
};

// 创建邮件传输器
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// 格式化邮件内容
function formatEmailContent(newsData) {
  const today = new Date().toISOString().split('T')[0];
  const todayNews = newsData.filter(item => {
    const itemDate = new Date(item.publishTime).toISOString().split('T')[0];
    return itemDate === today;
  });

  // 如果今天没有新闻，获取最新一天的新闻
  let targetNews = todayNews;
  let targetDate = today;
  let isToday = true;

  if (todayNews.length === 0 && newsData.length > 0) {
    // 按发布时间排序，获取最新的新闻
    const sortedNews = newsData.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
    const latestDate = new Date(sortedNews[0].publishTime).toISOString().split('T')[0];
    
    targetNews = newsData.filter(item => {
      const itemDate = new Date(item.publishTime).toISOString().split('T')[0];
      return itemDate === latestDate;
    });
    
    targetDate = latestDate;
    isToday = false;
  }

  const totalCount = newsData.length;
  const todayCount = todayNews.length;
  const targetCount = targetNews.length;
  const updateTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  let emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>AI资讯助手 - 今日资讯</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e9ecef;
        }
        .header h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 24px;
        }
        .stats {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .stats h2 {
          margin: 0 0 15px 0;
          font-size: 18px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          display: block;
        }
        .stat-label {
          font-size: 12px;
          opacity: 0.9;
        }
        .news-item {
          margin-bottom: 25px;
          padding: 20px;
          border-left: 4px solid #007bff;
          background-color: #f8f9fa;
          border-radius: 0 8px 8px 0;
        }
        .news-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 10px 0;
          line-height: 1.4;
        }
        .news-content {
          color: #666;
          margin: 0 0 10px 0;
          line-height: 1.5;
        }
        .news-meta {
          font-size: 12px;
          color: #999;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .news-tags {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }
        .tag {
          background-color: #e9ecef;
          color: #495057;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #999;
          font-size: 12px;
        }
        .date-badge {
          background-color: #28a745;
          color: white;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
        }
        .date-badge.old {
          background-color: #ffc107;
          color: #212529;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 AI资讯助手</h1>
          <p>为您精选最新的AI行业动态</p>
        </div>
        
        <div class="stats">
          <h2>📊 数据统计</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">${totalCount}</span>
              <span class="stat-label">总新闻数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${todayCount}</span>
              <span class="stat-label">今日新闻</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${targetCount}</span>
              <span class="stat-label">本次展示</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${updateTime}</span>
              <span class="stat-label">更新时间</span>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <span class="date-badge ${isToday ? '' : 'old'}">
            ${isToday ? '📅 今日资讯' : `📅 ${targetDate} 资讯`}
          </span>
        </div>
  `;

  // 添加新闻内容
  targetNews.forEach((news, index) => {
    const publishDate = new Date(news.publishTime).toLocaleDateString('zh-CN');
    const tags = news.tags && news.tags.length > 0 
      ? news.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
      : '';

    emailContent += `
        <div class="news-item">
          <h3 class="news-title">${index + 1}. ${news.title}</h3>
          <p class="news-content">${news.content}</p>
          <div class="news-meta">
            <div class="news-tags">
              ${tags}
            </div>
            <div>
              <span>📅 ${publishDate}</span>
              <span style="margin-left: 10px;">📰 ${news.source}</span>
            </div>
          </div>
        </div>
    `;
  });

  emailContent += `
        <div class="footer">
          <p>此邮件由AI资讯助手自动生成</p>
          <p>感谢您的关注！如需退订，请回复"退订"</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return emailContent;
}

// 发送邮件通知
async function sendEmailNotification(targetEmail, subject = 'AI资讯助手 - 今日资讯', customContent = null) {
  try {
    console.log(`📧 准备发送邮件到: ${targetEmail}`);
    
    let emailContent;
    let emailSubject = subject;
    
    if (customContent) {
      // 使用自定义内容
      emailContent = customContent;
    } else {
      // 读取新闻数据并格式化
      const dataPath = path.join(__dirname, '../src/data/ai-news.json');
      if (!fs.existsSync(dataPath)) {
        throw new Error('新闻数据文件不存在');
      }
      
      const newsDataFile = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const newsData = newsDataFile.data || [];
      
      if (newsData.length === 0) {
        throw new Error('没有新闻数据可发送');
      }
      
      emailContent = formatEmailContent(newsData);
    }

    const mailOptions = {
      from: EMAIL_CONFIG.auth.user,
      to: targetEmail,
      subject: emailSubject,
      html: emailContent
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✅ 邮件发送成功! 消息ID: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId,
      to: targetEmail
    };
    
  } catch (error) {
    console.error(`❌ 邮件发送失败: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      to: targetEmail
    };
  }
}

// 获取订阅者邮箱列表
function getSubscriberEmails() {
  try {
    const subscribersPath = path.join(__dirname, '../src/data/subscribers.json');
    if (!fs.existsSync(subscribersPath)) {
      console.log('📝 订阅者文件不存在，创建空列表');
      return [];
    }
    
    const subscribersData = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
    return subscribersData.subscribers || [];
  } catch (error) {
    console.error(`❌ 读取订阅者列表失败: ${error.message}`);
    return [];
  }
}

// 批量发送邮件
async function sendBatchEmails(newsData) {
  try {
    const subscribers = getSubscriberEmails();
    
    if (subscribers.length === 0) {
      console.log('📭 没有订阅者，跳过批量发送');
      return {
        success: true,
        sentCount: 0,
        totalCount: 0
      };
    }
    
    console.log(`📧 开始批量发送邮件给 ${subscribers.length} 个订阅者`);
    
    const results = [];
    let successCount = 0;
    
    for (const email of subscribers) {
      try {
        const result = await sendEmailNotification(email, 'AI资讯助手 - 今日资讯', formatEmailContent(newsData));
        results.push(result);
        
        if (result.success) {
          successCount++;
        }
        
        // 添加延迟避免被邮件服务器限制
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ 发送邮件到 ${email} 失败: ${error.message}`);
        results.push({
          success: false,
          error: error.message,
          to: email
        });
      }
    }
    
    console.log(`✅ 批量发送完成: ${successCount}/${subscribers.length} 成功`);
    
    return {
      success: true,
      sentCount: successCount,
      totalCount: subscribers.length,
      results: results
    };
    
  } catch (error) {
    console.error(`❌ 批量发送邮件失败: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// 主函数
async function main() {
  try {
    // 检查命令行参数
    const args = process.argv.slice(2);
    const targetEmail = args[0];
    
    if (!targetEmail) {
      console.log('❌ 请提供目标邮箱地址');
      console.log('用法: node send-email-notification.js <email>');
      process.exit(1);
    }
    
    console.log(`🚀 开始发送邮件到: ${targetEmail}`);
    
    const result = await sendEmailNotification(targetEmail);
    
    if (result.success) {
      console.log(`✅ 邮件发送成功!`);
      console.log(`   收件人: ${result.to}`);
      console.log(`   消息ID: ${result.messageId}`);
    } else {
      console.log(`❌ 邮件发送失败: ${result.error}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ 程序执行失败: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  sendEmailNotification,
  sendBatchEmails,
  formatEmailContent,
  getSubscriberEmails
}; 