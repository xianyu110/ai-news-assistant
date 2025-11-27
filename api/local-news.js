import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // 直接调用爬虫 API 获取最新数据
    const crawlUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/crawl`;
    const response = await axios.get(crawlUrl, { timeout: 30000 });
    
    console.log(`✅ Serving ${response.data.data?.length || 0} news items`);
    return res.status(200).json(response.data);
    
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error fetching news', 
      message: error.message 
    });
  }
}
