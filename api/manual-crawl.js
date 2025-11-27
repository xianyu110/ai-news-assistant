import { crawlAIToolNews } from '../scripts/crawl-news.js';

export default async function handler(request, response) {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🚀 Manual news crawl triggered...');
    const result = await crawlAIToolNews();
    console.log('✅ Manual crawl finished successfully.');
    
    return response.status(200).json({ 
      success: true,
      message: '新闻更新成功',
      ...result 
    });
  } catch (error) {
    console.error('❌ Manual crawl failed:', error);
    return response.status(500).json({ 
      success: false,
      message: '新闻更新失败',
      error: error.message 
    });
  }
}
