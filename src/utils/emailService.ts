import { NewsItem } from '@/types'

// Email configuration
const EMAIL_CONFIG = {
  host: 'smtp.qq.com',
  port: 587,
  secure: false,
  auth: {
    user: '3497181457@qq.com',
    pass: 'regtopndvdricidf'
  }
}

// Email API endpoint (would need a backend service)
const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001/api'

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Format email content
export function formatEmailContent(newsData: NewsItem[]): string {
  const today = new Date().toISOString().split('T')[0]
  const todayNews = newsData.filter(item => {
    const itemDate = new Date(item.publishTime).toISOString().split('T')[0]
    return itemDate === today
  })

  const totalCount = newsData.length
  const todayCount = todayNews.length
  const updateTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

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
  `

  if (todayCount > 0) {
    emailContent += `
      <h2 style="color: #2c3e50; margin-bottom: 20px;">🔥 今日资讯 (${todayCount}篇)</h2>
    `
    
    todayNews.slice(0, 10).forEach(item => { // Limit to 10 items to avoid email size issues
      const publishTime = new Date(item.publishTime).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      emailContent += `
        <div class="news-item">
          <div class="news-title">📰 ${item.title}</div>
          <div class="news-meta">
            📅 ${publishTime} | 🏷️ ${item.category || '资讯'} | 📝 ${item.source || 'AI资讯助手'}
          </div>
          <div class="news-content">
            💬 ${item.content ? item.content.substring(0, 200) : item.summary || ''}${item.content && item.content.length > 200 ? '...' : ''}
          </div>
        </div>
      `
    })
  } else {
    emailContent += `
      <div class="no-news">
        <p>📭 今日暂无新资讯</p>
        <p>请关注后续更新</p>
      </div>
    `
  }

  emailContent += `
        <div class="footer">
          <p>🔗 <a href="http://localhost:3000/">访问完整内容</a></p>
          <p>📱 AI资讯助手 - 让您不错过任何重要的AI动态</p>
          <p style="font-size: 12px; color: #aaa;">此邮件由 AI资讯助手 React版本自动发送</p>
        </div>
      </div>
    </body>
    </html>
  `

  return emailContent
}

// Send email notification (client-side trigger)
export async function sendEmailNotification(email: string, newsData: NewsItem[]): Promise<EmailResult> {
  try {
    console.log('📧 准备发送邮件通知...')
    console.log('📮 目标邮箱:', email)
    
    const emailContent = formatEmailContent(newsData)
    const today = new Date().toLocaleDateString('zh-CN')
    
    // This would typically call a backend API
    // For demo purposes, we'll simulate the request
    const response = await fetch(`${EMAIL_API_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: `🤖 AI资讯助手 - 今日资讯 (${today})`,
        html: emailContent,
        config: EMAIL_CONFIG
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ 邮件发送成功!')
      return {
        success: true,
        messageId: result.messageId
      }
    } else {
      const error = await response.text()
      console.error('❌ 邮件发送失败:', error)
      return {
        success: false,
        error: `HTTP ${response.status}: ${error}`
      }
    }
    
  } catch (error) {
    console.error('❌ 邮件发送异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Subscribe to email notifications
export async function subscribeToEmails(email: string): Promise<EmailResult> {
  try {
    const response = await fetch(`${EMAIL_API_URL}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })

    if (response.ok) {
      return { success: true }
    } else {
      const error = await response.text()
      return { success: false, error }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Subscription failed'
    }
  }
}

// Preview email content
export function previewEmail(newsData: NewsItem[]): string {
  return formatEmailContent(newsData)
}