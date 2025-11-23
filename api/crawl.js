
import { crawlAIToolNews } from '../scripts/crawl-news.js';

export default async function handler(request, response) {
  // Optional: Add a secret to prevent unauthorized access
  // if (request.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return response.status(401).end('Unauthorized');
  // }

  try {
    console.log('🚀 Starting scheduled news crawl...');
    const result = await crawlAIToolNews();
    console.log('✅ News crawl finished successfully.');
    return response.status(200).json({ 
      message: 'Crawl completed successfully.',
      ...result 
    });
  } catch (error) {
    console.error('❌ News crawl failed:', error);
    return response.status(500).json({ 
      message: 'Crawl failed.',
      error: error.message 
    });
  }
}
