const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// 邮箱配置
const EMAIL_CONFIG = {
  host: 'smtp.qq.com',
  port: 587,
  secure: false,
  auth: {
    user: '3497181457@qq.com',
    pass: process.env.EMAIL_PASSWORD || 'bddxuogmqjinciha'
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

  const totalCount = newsData.length;
  const todayCount = todayNews.length;
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
        .stats ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .stats li {
          margin: 8px 0;
          font-size: 16px;
        }
        .news-item {
          background: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 0 8px 8px 0;
        }
        .news-title {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .news-meta {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 10px;
        }
        .news-content {
          font-size: 16px;
          line-height: 1.6;
          color: #495057;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        .no-news {
          text-align: center;
          color: #6c757d;
          font-style: italic;
          padding: 40px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 AI资讯助手 - 今日资讯</h1>
        </div>
        
        <div class="stats">
          <h2>📊 数据统计</h2>
          <ul>
            <li>• 总资讯：${totalCount}篇</li>
            <li>• 今日新增：${todayCount}篇</li>
            <li>• 更新时间：${updateTime}</li>
          </ul>
        </div>
  `;

  if (todayCount > 0) {
    emailContent += `
      <h2 style="color: #2c3e50; margin-bottom: 20px;">🔥 今日资讯 (${todayCount}篇)</h2>
    `;
    
    todayNews.forEach(item => {
      const publishTime = new Date(item.publishTime).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      emailContent += `
        <div class="news-item">
          <div class="news-title">📰 ${item.title}</div>
          <div class="news-meta">
            📅 ${publishTime} | 🏷️ ${item.category || '资讯'}
          </div>
          <div class="news-content">
            💬 ${item.content ? item.content.substring(0, 150) : item.summary || ''}...
          </div>
        </div>
      `;
    });
  } else {
    emailContent += `
      <div class="no-news">
        <p>📭 今日暂无新资讯</p>
        <p>请关注后续更新</p>
      </div>
    `;
  }

  emailContent += `
        <div class="footer">
          <p>🔗 <a href="https://xianyu110.github.io/ai-news-assistant/">访问完整内容</a></p>
          <p>📱 AI资讯助手 - 让您不错过任何重要的AI动态</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return emailContent;
}

// 发送邮件通知
async function sendEmailNotification(targetEmail, newsData) {
  try {
    console.log('📧 开始发送邮件通知...');
    console.log('📮 目标邮箱:', targetEmail);
    
    const emailContent = formatEmailContent(newsData);
    const today = new Date().toLocaleDateString('zh-CN');
    
    const mailOptions = {
      from: {
        name: 'AI资讯助手',
        address: EMAIL_CONFIG.auth.user
      },
      to: targetEmail,
      subject: `🤖 AI资讯助手 - 今日资讯 (${today})`,
      html: emailContent
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ 邮件发送成功!');
    console.log('📧 邮件ID:', result.messageId);
    console.log('📮 发送到:', targetEmail);
    
    return {
      success: true,
      messageId: result.messageId,
      targetEmail: targetEmail
    };
    
  } catch (error) {
    console.error('❌ 邮件发送失败:', error.message);
    return {
      success: false,
      error: error.message,
      targetEmail: targetEmail
    };
  }
}

// 从用户配置文件读取邮箱列表
function getSubscriberEmails() {
  try {
    const configPath = path.join(__dirname, '../public/data/email-subscribers.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.subscribers || [];
    }
  } catch (error) {
    console.log('⚠️ 读取邮箱配置失败，使用默认配置:', error.message);
  }
  return [];
}

// 批量发送邮件
async function sendBatchEmails(newsData) {
  const subscribers = getSubscriberEmails();
  
  if (subscribers.length === 0) {
    console.log('📭 无邮箱订阅者，跳过邮件发送');
    return { success: true, message: '无邮箱订阅者' };
  }

  console.log(`📧 开始向 ${subscribers.length} 个邮箱发送通知...`);
  
  const results = [];
  
  for (const email of subscribers) {
    const result = await sendEmailNotification(email, newsData);
    results.push(result);
    
    // 发送间隔，避免被限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log(`📊 邮件发送完成: 成功 ${successCount}，失败 ${failCount}`);
  
  return {
    success: successCount > 0,
    total: results.length,
    success_count: successCount,
    fail_count: failCount,
    details: results
  };
}

// 主函数
async function main() {
  try {
    // 读取新闻数据
    const dataPath = path.join(__dirname, '../public/data/news.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error('新闻数据文件不存在');
    }
    
    const newsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // 检查是否启用邮件通知
    const enableEmail = process.env.ENABLE_EMAIL_NOTIFICATION !== 'false';
    
    if (!enableEmail) {
      console.log('📭 邮件通知已禁用');
      return;
    }
    
    // 发送邮件
    const result = await sendBatchEmails(newsData);
    
    if (result.success) {
      console.log('🎉 邮件通知发送完成!');
    } else {
      console.log('⚠️ 邮件通知发送失败');
    }
    
  } catch (error) {
    console.error('❌ 邮件通知执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  sendEmailNotification,
  sendBatchEmails,
  getSubscriberEmails
}; 