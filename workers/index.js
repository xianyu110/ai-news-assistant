/**
 * Cloudflare Workers 定时任务
 * 用于定时触发 Vercel API 爬取新闻
 */

export default {
  /**
   * 定时任务处理器
   * @param {ScheduledEvent} event - Cloudflare 定时事件
   * @param {Object} env - 环境变量
   * @param {Object} ctx - 执行上下文
   */
  async scheduled(event, env, ctx) {
    console.log('🚀 定时任务触发:', new Date().toISOString());
    
    try {
      // 从环境变量获取配置
      const vercelDomain = env.VERCEL_DOMAIN;
      const cronSecret = env.CRON_SECRET;
      
      if (!vercelDomain) {
        throw new Error('未配置 VERCEL_DOMAIN 环境变量');
      }
      
      // 构建 API URL
      const apiUrl = `https://${vercelDomain}/api/crawl`;
      
      // 准备请求头
      const headers = {
        'User-Agent': 'Cloudflare-Workers-Cron/1.0'
      };
      
      // 如果配置了密钥，添加认证头
      if (cronSecret) {
        headers['Authorization'] = `Bearer ${cronSecret}`;
      }
      
      console.log('📡 调用 API:', apiUrl);
      
      // 调用 Vercel API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        // 设置超时时间（Cloudflare Workers 默认最多 30 秒）
        signal: AbortSignal.timeout(25000)
      });
      
      const responseText = await response.text();
      
      if (response.ok) {
        console.log('✅ API 调用成功:', response.status);
        console.log('📄 响应内容:', responseText);
      } else {
        console.error('❌ API 调用失败:', response.status);
        console.error('📄 错误内容:', responseText);
        throw new Error(`API 返回错误状态: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ 定时任务执行失败:', error.message);
      // 不抛出错误，避免 Cloudflare 标记任务失败
    }
  },
  
  /**
   * HTTP 请求处理器（用于手动测试）
   * @param {Request} request - HTTP 请求
   * @param {Object} env - 环境变量
   * @param {Object} ctx - 执行上下文
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 健康检查端点
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        vercelDomain: env.VERCEL_DOMAIN || 'not configured'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 手动触发端点
    if (url.pathname === '/trigger') {
      // 简单的认证检查
      const authHeader = request.headers.get('Authorization');
      const expectedAuth = env.TRIGGER_SECRET;
      
      if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
        return new Response('Unauthorized', { status: 401 });
      }
      
      // 手动触发定时任务逻辑
      try {
        await this.scheduled(null, env, ctx);
        return new Response(JSON.stringify({
          success: true,
          message: '定时任务已手动触发',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 默认响应
    return new Response(JSON.stringify({
      message: 'AI News Cron Worker',
      endpoints: {
        health: '/health',
        trigger: '/trigger (需要认证)'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
