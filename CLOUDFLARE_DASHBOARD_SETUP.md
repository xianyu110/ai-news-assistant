# Cloudflare Dashboard 网页配置指南

本指南将教你如何在 Cloudflare 网页界面中直接创建和配置定时任务，无需使用命令行工具。

## 📋 前提条件

- 一个 Cloudflare 账号（免费）
- 你的 Vercel 项目域名

## 🚀 步骤 1：注册/登录 Cloudflare

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 如果没有账号，点击 "Sign Up" 注册
3. 登录你的账号

## 📝 步骤 2：创建 Worker

### 2.1 进入 Workers 页面

1. 在左侧菜单中，点击 **"Workers & Pages"**
2. 点击右上角的 **"Create application"** 按钮
3. 选择 **"Create Worker"** 标签

### 2.2 创建新 Worker

1. Worker 名称输入：`ai-news-cron`（或其他你喜欢的名称）
2. 点击 **"Deploy"** 按钮
3. 系统会创建一个默认的 Worker

### 2.3 编辑 Worker 代码

1. 部署完成后，点击 **"Edit code"** 按钮
2. 删除默认代码
3. 复制以下代码并粘贴：

```javascript
/**
 * Cloudflare Workers 定时任务
 * 用于定时触发 Vercel API 爬取新闻
 */

export default {
  /**
   * 定时任务处理器
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
    }
  },
  
  /**
   * HTTP 请求处理器（用于手动测试）
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
      const authHeader = request.headers.get('Authorization');
      const expectedAuth = env.TRIGGER_SECRET;
      
      if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
        return new Response('Unauthorized', { status: 401 });
      }
      
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
```

4. 点击右上角的 **"Save and Deploy"** 按钮

## ⚙️ 步骤 3：配置环境变量

### 3.1 进入设置页面

1. 点击顶部的 **"Settings"** 标签
2. 在左侧菜单中找到 **"Variables and Secrets"**

### 3.2 添加环境变量

点击 **"Add variable"** 按钮，添加以下变量：

#### 必需变量：

**变量 1：VERCEL_DOMAIN**
- Type: `Text`（选择 "Plaintext"）
- Variable name: `VERCEL_DOMAIN`
- Value: 你的 Vercel 域名（例如：`your-project.vercel.app`）
- 点击 **"Save"**

#### 可选变量（如果你的 API 需要认证）：

**变量 2：CRON_SECRET**
- Type: `Secret`（选择 "Encrypt"）
- Variable name: `CRON_SECRET`
- Value: 设置一个随机密钥（例如：`your-secret-key-123`）
- 点击 **"Save"**

**变量 3：TRIGGER_SECRET**（用于手动触发）
- Type: `Secret`
- Variable name: `TRIGGER_SECRET`
- Value: 设置一个随机密钥（例如：`trigger-secret-456`）
- 点击 **"Save"**

### 3.3 部署更改

添加完环境变量后，Worker 会自动重新部署。

## ⏰ 步骤 4：配置 Cron 触发器

### 4.1 进入 Triggers 页面

1. 点击顶部的 **"Triggers"** 标签
2. 找到 **"Cron Triggers"** 部分

### 4.2 添加 Cron 触发器

1. 点击 **"Add Cron Trigger"** 按钮
2. 在 Cron 表达式输入框中输入：`0 1 * * *`
   - 这表示每天 UTC 01:00 执行（北京时间 09:00）
3. 点击 **"Add Trigger"** 按钮

### 4.3 常用 Cron 表达式

| 表达式 | 说明 | 北京时间 |
|--------|------|----------|
| `0 1 * * *` | 每天 01:00 UTC | 09:00 |
| `0 0 * * *` | 每天 00:00 UTC | 08:00 |
| `0 2 * * *` | 每天 02:00 UTC | 10:00 |
| `0 */6 * * *` | 每 6 小时 | - |
| `0 0,12 * * *` | 每天 00:00 和 12:00 UTC | 08:00 和 20:00 |
| `0 9 * * 1-5` | 工作日 09:00 UTC | 17:00 |

**提示**：Cloudflare 使用 UTC 时区，北京时间 = UTC + 8 小时

## 🧪 步骤 5：测试 Worker

### 5.1 获取 Worker URL

1. 回到 Worker 的主页面
2. 你会看到 Worker 的 URL，例如：
   ```
   https://ai-news-cron.your-subdomain.workers.dev
   ```

### 5.2 测试健康检查

在浏览器中访问：
```
https://ai-news-cron.your-subdomain.workers.dev/health
```

你应该看到类似这样的响应：
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T10:30:00.000Z",
  "vercelDomain": "your-project.vercel.app"
}
```

### 5.3 手动触发测试

使用浏览器扩展（如 Postman）或命令行：

```bash
curl -X GET "https://ai-news-cron.your-subdomain.workers.dev/trigger" \
  -H "Authorization: Bearer your-trigger-secret"
```

## 📊 步骤 6：查看日志和监控

### 6.1 实时日志

1. 在 Worker 页面，点击 **"Logs"** 标签
2. 选择 **"Begin log stream"**
3. 你会看到实时的执行日志

### 6.2 查看 Cron 执行历史

1. 点击 **"Triggers"** 标签
2. 在 **"Cron Triggers"** 部分，你可以看到：
   - 下次执行时间
   - 最近执行记录
   - 成功/失败状态

### 6.3 查看分析数据

1. 点击 **"Metrics"** 标签
2. 查看：
   - 请求数量
   - 错误率
   - CPU 使用时间
   - 执行时长

## 🔒 步骤 7：（可选）为 Vercel API 添加认证

如果你配置了 `CRON_SECRET`，需要在 Vercel API 中添加验证：

### 7.1 修改 Vercel API

编辑 `api/crawl.js` 文件：

```javascript
export default async function handler(req, res) {
  // 验证请求来源
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... 原有的爬虫逻辑
}
```

### 7.2 在 Vercel 设置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **"Settings"** → **"Environment Variables"**
4. 添加变量：
   - Name: `CRON_SECRET`
   - Value: 与 Cloudflare Worker 中相同的密钥
   - Environment: 选择 `Production`
5. 点击 **"Save"**
6. 重新部署项目

## 🎯 完成检查清单

- [ ] 创建了 Cloudflare Worker
- [ ] 粘贴并部署了 Worker 代码
- [ ] 配置了 `VERCEL_DOMAIN` 环境变量
- [ ] 添加了 Cron 触发器（`0 1 * * *`）
- [ ] 测试了 `/health` 端点
- [ ] 测试了 `/trigger` 端点（可选）
- [ ] 查看了日志确认配置正确
- [ ] （可选）在 Vercel API 中添加了认证

## 🔧 常见问题

### Q1: Worker 没有执行怎么办？

**检查项：**
1. 确认 Cron 触发器已添加
2. 查看 "Triggers" 页面的下次执行时间
3. 检查 "Logs" 是否有错误信息
4. 确认环境变量配置正确

### Q2: API 调用失败

**检查项：**
1. 确认 `VERCEL_DOMAIN` 配置正确（不要包含 `https://`）
2. 在浏览器中直接访问 Vercel API 确认可访问
3. 检查是否需要认证但未配置密钥
4. 查看 Worker 日志中的错误信息

### Q3: 如何修改执行时间？

1. 进入 Worker 的 **"Triggers"** 页面
2. 点击现有 Cron 触发器旁的 **"..."** 菜单
3. 选择 **"Edit"**
4. 修改 Cron 表达式
5. 点击 **"Save"**

### Q4: 如何暂停定时任务？

1. 进入 Worker 的 **"Triggers"** 页面
2. 点击 Cron 触发器旁的 **"..."** 菜单
3. 选择 **"Delete"**
4. 需要时可以重新添加

### Q5: 免费计划有什么限制？

Cloudflare Workers 免费计划：
- 每天 100,000 次请求
- 每次请求最多 10ms CPU 时间
- 每次请求最多 128MB 内存

对于每天一次的定时任务，完全够用！

## 📱 移动端配置

Cloudflare Dashboard 也支持移动端浏览器，所有操作步骤相同，只是界面布局会自适应。

## 🎉 完成！

配置完成后，Worker 会在下一个整点自动执行。你可以：

1. 在 "Logs" 页面查看实时执行情况
2. 使用 `/trigger` 端点手动测试
3. 在 "Metrics" 页面查看统计数据

如有问题，可以查看 Worker 的日志获取详细错误信息。

---

**提示**：首次配置后，建议使用 `/trigger` 端点手动测试一次，确保一切正常工作。
