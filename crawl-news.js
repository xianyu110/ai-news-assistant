#!/usr/bin/env node

// 入口文件：调用 scripts/crawl-news.js 中的爬虫功能
import { crawlAIToolNews } from './scripts/crawl-news.js';

async function main() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 开始更新AI新闻数据...');
    await crawlAIToolNews();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`⏱️  总耗时: ${duration} 秒`);
    
  } catch (error) {
    console.error('❌ 程序执行失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();