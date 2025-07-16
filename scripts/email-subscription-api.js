const fs = require('fs');
const path = require('path');

// 邮箱订阅配置文件路径
const SUBSCRIBERS_FILE = path.join(__dirname, '../public/data/email-subscribers.json');

// 确保目录存在
function ensureDirectoryExists() {
  const dir = path.dirname(SUBSCRIBERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 读取订阅者配置
function readSubscribers() {
  ensureDirectoryExists();
  
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取订阅者配置失败:', error.message);
  }
  
  return { subscribers: [], lastUpdate: new Date().toISOString() };
}

// 保存订阅者配置
function saveSubscribers(config) {
  ensureDirectoryExists();
  
  try {
    const data = {
      ...config,
      lastUpdate: new Date().toISOString()
    };
    
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(data, null, 2));
    console.log('✅ 邮箱订阅配置已保存');
    return true;
  } catch (error) {
    console.error('❌ 保存订阅者配置失败:', error.message);
    return false;
  }
}

// 添加订阅者
function addSubscriber(email, name = '') {
  const config = readSubscribers();
  
  // 检查邮箱是否已存在
  if (config.subscribers.includes(email)) {
    console.log('⚠️ 邮箱已存在:', email);
    return false;
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ 无效的邮箱格式:', email);
    return false;
  }
  
  config.subscribers.push(email);
  
  if (saveSubscribers(config)) {
    console.log('✅ 已添加邮箱订阅:', email);
    return true;
  }
  
  return false;
}

// 删除订阅者
function removeSubscriber(email) {
  const config = readSubscribers();
  const index = config.subscribers.indexOf(email);
  
  if (index === -1) {
    console.log('⚠️ 邮箱不存在:', email);
    return false;
  }
  
  config.subscribers.splice(index, 1);
  
  if (saveSubscribers(config)) {
    console.log('✅ 已删除邮箱订阅:', email);
    return true;
  }
  
  return false;
}

// 获取订阅者列表
function getSubscribers() {
  const config = readSubscribers();
  return config.subscribers || [];
}

// 清空所有订阅者
function clearAllSubscribers() {
  const config = {
    subscribers: [],
    lastUpdate: new Date().toISOString()
  };
  
  if (saveSubscribers(config)) {
    console.log('✅ 已清空所有邮箱订阅');
    return true;
  }
  
  return false;
}

// 从环境变量或命令行参数设置初始订阅者
function initializeFromEnv() {
  const envEmails = process.env.INITIAL_EMAIL_SUBSCRIBERS;
  
  if (envEmails) {
    const emails = envEmails.split(',').map(email => email.trim()).filter(email => email);
    
    console.log('📧 从环境变量初始化邮箱订阅:', emails);
    
    emails.forEach(email => {
      addSubscriber(email);
    });
  }
}

// 命令行操作处理
function handleCommand() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'add':
      if (args[1]) {
        const success = addSubscriber(args[1], args[2]);
        process.exit(success ? 0 : 1);
      } else {
        console.log('❌ 请提供邮箱地址');
        process.exit(1);
      }
      break;
      
    case 'remove':
      if (args[1]) {
        const success = removeSubscriber(args[1]);
        process.exit(success ? 0 : 1);
      } else {
        console.log('❌ 请提供邮箱地址');
        process.exit(1);
      }
      break;
      
    case 'list':
      const subscribers = getSubscribers();
      console.log('📧 当前邮箱订阅者:');
      subscribers.forEach((email, index) => {
        console.log(`${index + 1}. ${email}`);
      });
      console.log(`\n总计: ${subscribers.length} 个订阅者`);
      break;
      
    case 'clear':
      const success = clearAllSubscribers();
      process.exit(success ? 0 : 1);
      break;
      
    case 'init':
      initializeFromEnv();
      break;
      
    default:
      console.log(`
📧 邮箱订阅管理工具

使用方法:
  node email-subscription-api.js add <email> [name]     添加订阅者
  node email-subscription-api.js remove <email>        删除订阅者
  node email-subscription-api.js list                  显示所有订阅者
  node email-subscription-api.js clear                 清空所有订阅者
  node email-subscription-api.js init                  从环境变量初始化

环境变量:
  INITIAL_EMAIL_SUBSCRIBERS="email1@example.com,email2@example.com"
      `);
      break;
  }
}

// 导出函数供其他模块使用
module.exports = {
  readSubscribers,
  saveSubscribers,
  addSubscriber,
  removeSubscriber,
  getSubscribers,
  clearAllSubscribers,
  initializeFromEnv
};

// 如果直接运行此脚本，处理命令行参数
if (require.main === module) {
  handleCommand();
} 