import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email } = req.body;
    
    // 验证邮箱格式
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: '请输入有效的邮箱地址' });
    }
    
    // 获取现有订阅者列表
    let subscribers = await kv.get('subscribers') || [];
    
    // 检查是否已订阅
    if (subscribers.includes(email)) {
      return res.status(200).json({ 
        success: true, 
        message: '该邮箱已订阅',
        alreadySubscribed: true
      });
    }
    
    // 添加新订阅者
    subscribers.push(email);
    await kv.set('subscribers', subscribers);
    
    console.log(`✅ 新订阅者: ${email}, 总订阅数: ${subscribers.length}`);
    
    return res.status(200).json({ 
      success: true, 
      message: '订阅成功！',
      totalSubscribers: subscribers.length
    });
    
  } catch (error) {
    console.error('❌ 订阅失败:', error);
    return res.status(500).json({ 
      error: '订阅失败，请稍后再试',
      details: error.message 
    });
  }
}
