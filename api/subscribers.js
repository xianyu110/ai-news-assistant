import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 简单的认证检查（可选）
    const authHeader = req.headers.authorization;
    const adminSecret = process.env.ADMIN_SECRET;
    
    if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 获取订阅者列表
    const subscribers = await kv.get('subscribers') || [];
    
    return res.status(200).json({ 
      success: true, 
      subscribers: subscribers,
      total: subscribers.length
    });
    
  } catch (error) {
    console.error('❌ 获取订阅者列表失败:', error);
    return res.status(500).json({ 
      error: '获取订阅者列表失败',
      details: error.message 
    });
  }
}
