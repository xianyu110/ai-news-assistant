#!/usr/bin/env node

import { sendEmailNotification } from './send-email-notification.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES模块中替代__dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const DAILY_EMAIL_CONFIG = {
  targetEmail: '1002569303@qq.com',
  sendTime: '08:30', // 每天8:30发送
  timezone: 'Asia/Shanghai'
};

// 日志文件路径
const LOG_FILE = path.join(__dirname, '../logs/daily-email.log');

// 确保日志目录存在
function ensureLogDir() {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// 写入日志
function writeLog(message) {
  const timestamp = new Date().toLocaleString('zh-CN', {
    timeZone: DAILY_EMAIL_CONFIG.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  
  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('写入日志失败:', error.message);
  }
}

// 读取新闻数据
function loadNewsData() {
  try {
    const dataPath = path.join(__dirname, '../src/data/ai-news.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error('新闻数据文件不存在');
    }
    
    const newsDataFile = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const newsData = newsDataFile.data || [];
    
    writeLog(`📂 成功读取 ${newsData.length} 条新闻数据`);
    return newsData;
  } catch (error) {
    writeLog(`❌ 读取新闻数据失败: ${error.message}`);
    throw error;
  }
}

// 检查是否在发送时间窗口内
function isTimeToSend() {
  const now = new Date();
  const chinaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
  
  const currentHour = chinaTime.getHours();
  const currentMinute = chinaTime.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  // 允许在8:30-8:35之间发送，避免错过发送时间
  const targetHour = 8;
  const targetMinute = 30;
  const endMinute = 35;
  
  const shouldSend = (currentHour === targetHour && currentMinute >= targetMinute && currentMinute <= endMinute);
  
  writeLog(`⏰ 当前时间: ${currentTime}, 目标时间: ${DAILY_EMAIL_CONFIG.sendTime}, 是否发送: ${shouldSend ? '是' : '否'}`);
  
  return shouldSend;
}

// 检查今天是否已经发送过
function hasSentToday() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sentRecordFile = path.join(__dirname, '../logs/sent-record.json');
    
    if (!fs.existsSync(sentRecordFile)) {
      return false;
    }
    
    const sentRecord = JSON.parse(fs.readFileSync(sentRecordFile, 'utf8'));
    const hasSent = sentRecord.lastSentDate === today;
    
    writeLog(`📅 今天(${today})是否已发送: ${hasSent ? '是' : '否'}`);
    return hasSent;
  } catch (error) {
    writeLog(`❌ 检查发送记录失败: ${error.message}`);
    return false;
  }
}

// 记录发送状态
function recordSentStatus(success, messageId = null, error = null) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sentRecordFile = path.join(__dirname, '../logs/sent-record.json');
    
    const record = {
      lastSentDate: today,
      lastSentTime: new Date().toISOString(),
      success: success,
      messageId: messageId,
      error: error ? error.message : null
    };
    
    ensureLogDir();
    fs.writeFileSync(sentRecordFile, JSON.stringify(record, null, 2));
    
    writeLog(`📝 发送状态已记录: ${success ? '成功' : '失败'}`);
  } catch (error) {
    writeLog(`❌ 记录发送状态失败: ${error.message}`);
  }
}

// 发送每日邮件
async function sendDailyEmail() {
  try {
    writeLog('📧 开始发送每日AI新闻邮件...');
    
    // 检查是否在发送时间
    if (!isTimeToSend()) {
      writeLog('⏰ 不在发送时间窗口内，跳过发送');
      return;
    }
    
    // 检查今天是否已经发送过
    if (hasSentToday()) {
      writeLog('📅 今天已经发送过邮件，跳过发送');
      return;
    }
    
    // 读取新闻数据
    const newsData = loadNewsData();
    
    if (newsData.length === 0) {
      writeLog('⚠️  没有新闻数据可发送');
      recordSentStatus(false, null, new Error('没有新闻数据'));
      return;
    }
    
    // 获取最新的10条新闻
    const latestNews = newsData.slice(0, 10);
    
    // 构建邮件内容
    const emailContent = buildEmailContent(latestNews);
    
    // 发送邮件
    const result = await sendEmailNotification(
      DAILY_EMAIL_CONFIG.targetEmail,
      '每日AI新闻快讯',
      emailContent
    );
    
    if (result.success) {
      writeLog(`✅ 邮件发送成功，消息ID: ${result.messageId}`);
      recordSentStatus(true, result.messageId);
    } else {
      writeLog(`❌ 邮件发送失败: ${result.error}`);
      recordSentStatus(false, null, new Error(result.error));
    }
    
  } catch (error) {
    writeLog(`❌ 发送每日邮件过程中出现错误: ${error.message}`);
    recordSentStatus(false, null, error);
  }
}

// 构建邮件内容
function buildEmailContent(newsList) {
  const today = new Date().toLocaleDateString('zh-CN', {
    timeZone: DAILY_EMAIL_CONFIG.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let content = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">🤖 每日AI新闻快讯 - ${today}</h2>
      <p style="color: #666;">为您精选最新的AI行业动态，助您把握科技前沿趋势。</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  `;
  
  newsList.forEach((news, index) => {
    const publishDate = new Date(news.publishTime).toLocaleDateString('zh-CN');
    const tags = news.tags && news.tags.length > 0 ? news.tags.join(' | ') : '';
    
    content += `
      <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #007bff; background-color: #f8f9fa;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${index + 1}. ${news.title}</h3>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">${news.content}</p>
        <div style="margin-top: 10px; font-size: 12px; color: #999;">
          <span>📅 ${publishDate}</span>
          ${tags ? `<span style="margin-left: 15px;">🏷️ ${tags}</span>` : ''}
          <span style="margin-left: 15px;">📰 ${news.source}</span>
        </div>
      </div>
    `;
  });
  
  content += `
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        此邮件由AI新闻助手自动生成，感谢您的关注！<br>
        如需退订，请回复"退订"。
      </p>
    </div>
  `;
  
  return content;
}

// 主函数
async function main() {
  try {
    writeLog('🚀 每日邮件调度器启动');
    await sendDailyEmail();
    writeLog('✅ 每日邮件调度器执行完成');
  } catch (error) {
    writeLog(`❌ 每日邮件调度器执行失败: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  sendDailyEmail,
  isTimeToSend,
  hasSentToday,
  loadNewsData
};