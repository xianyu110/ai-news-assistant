# 邮件订阅功能设置指南

## 📧 功能说明

邮件订阅功能允许用户订阅每日 AI 新闻快讯，系统会自动发送最新资讯到订阅者的邮箱。

## 🎯 已实现的功能

✅ **订阅管理 API**
- `/api/subscribe` - 用户订阅
- `/api/unsubscribe` - 取消订阅
- `/api/subscribers` - 查看订阅者列表（需要管理员权限）

✅ **邮件发送 API**
- `/api/send-newsletter` - 发送每日新闻邮件

✅ **前端界面**
- 设置页面的订阅表单
- 邮箱验证
- 订阅状态提示

## 🚀 快速开始

### 1. 注册 Resend 账号

Resend 是一个现代化的邮件发送服务，提供免费额度。

1. 访问 [Resend](https://resend.com)
2. 注册账号（可以使用 GitHub 登录）
3. 免费计划包括：
   - 每月 3,000 封邮件
   - 每天 100 封邮件
   - 完全够用！

### 2. 获取 API Key

1. 登录 Resend Dashboard
2. 进入 **"API Keys"** 页面
3. 点击 **"Create API Key"**
4. 名称输入：`ai-news-newsletter`
5. 权限选择：**"Sending access"**
6. 点击 **"Create"**
7. 复制生成的 API Key（只显示一次）

### 3. 配置域名（可选但推荐）

#### 使用 Resend 提供的测试域名（快速开始）

Resend 提供测试域名 `onboarding@resend.dev`，可以直接使用，但只能发送到你自己的邮箱。

#### 配置自己的域名（推荐）

1. 在 Resend Dashboard 点击 **"Domains"**
2. 点击 **"Add Domain"**
3. 输入你的域名（例如：`chatgpt-plus.top`）
4. 按照提示添加 DNS 记录：
   - SPF 记录
   - DKIM 记录
   - DMARC 记录（可选）
5. 等待 DNS 验证通过（通常几分钟到几小时）

### 4. 在 Vercel 配置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **"Settings"** → **"Environment Variables"**
4. 添加以下变量：

#### 必需变量：

**RESEND_API_KEY**
- Value: 你的 Resend API Key
- Environment: `Production`, `Preview`, `Development`

#### 可选变量：

**ADMIN_SECRET**（用于保护订阅者列表 API）
- Value: 设置一个随机密钥（例如：`admin-secret-123`）
- Environment: `Production`

**CRON_SECRET**（用于保护邮件发送 API）
- Value: 与 Cloudflare Worker 中相同的密钥
- Environment: `Production`

5. 点击 **"Save"**
6. 重新部署项目

### 5. 修改发件人地址

编辑 `api/send-newsletter.js` 文件，修改第 68 行：

```javascript
from: 'AI新闻助手 <newsletter@yourdomain.com>',
```

改为你的域名：

```javascript
from: 'AI新闻助手 <newsletter@chatgpt-plus.top>',
```

或使用 Resend 测试域名：

```javascript
from: 'AI新闻助手 <onboarding@resend.dev>',
```

## 🧪 测试订阅功能

### 1. 测试订阅

在浏览器访问你的网站：
1. 进入 **"设置"** 页面
2. 在 **"邮件订阅"** 部分输入邮箱
3. 点击 **"订阅"**
4. 应该看到 "订阅成功！" 提示

### 2. 测试发送邮件

使用命令行测试：

```bash
# 如果配置了 CRON_SECRET
curl -X POST "https://nav.chatgpt-plus.top/api/send-newsletter" \
  -H "Authorization: Bearer your-cron-secret"

# 如果没有配置 CRON_SECRET
curl -X POST "https://nav.chatgpt-plus.top/api/send-newsletter"
```

### 3. 查看订阅者列表

```bash
# 如果配置了 ADMIN_SECRET
curl "https://nav.chatgpt-plus.top/api/subscribers" \
  -H "Authorization: Bearer your-admin-secret"

# 如果没有配置 ADMIN_SECRET
curl "https://nav.chatgpt-plus.top/api/subscribers"
```

## ⏰ 配置自动发送

### 方法 1：使用 Cloudflare Workers（推荐）

修改 `workers/index.js`，在定时任务中添加发送邮件的逻辑：

```javascript
async scheduled(event, env, ctx) {
  console.log('🚀 定时任务触发:', new Date().toISOString());
  
  try {
    const vercelDomain = env.VERCEL_DOMAIN;
    const cronSecret = env.CRON_SECRET;
    
    // 1. 爬取新闻
    console.log('📡 爬取新闻...');
    const crawlResponse = await fetch(`https://${vercelDomain}/api/crawl`, {
      headers: cronSecret ? { 'Authorization': `Bearer ${cronSecret}` } : {}
    });
    
    if (crawlResponse.ok) {
      console.log('✅ 新闻爬取成功');
      
      // 2. 发送邮件
      console.log('📧 发送邮件...');
      const emailResponse = await fetch(`https://${vercelDomain}/api/send-newsletter`, {
        method: 'POST',
        headers: cronSecret ? { 'Authorization': `Bearer ${cronSecret}` } : {}
      });
      
      if (emailResponse.ok) {
        const result = await emailResponse.json();
        console.log('✅ 邮件发送成功:', result.message);
      } else {
        console.error('❌ 邮件发送失败:', emailResponse.status);
      }
    }
    
  } catch (error) {
    console.error('❌ 定时任务执行失败:', error.message);
  }
}
```

### 方法 2：使用 GitHub Actions

在 `.github/workflows/daily-crawl.yml` 中添加发送邮件步骤：

```yaml
- name: Send Newsletter
  run: |
    curl -X POST "${{ secrets.VERCEL_DOMAIN }}/api/send-newsletter" \
      -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## 📊 监控和管理

### 查看发送日志

1. 登录 Vercel Dashboard
2. 进入项目的 **"Logs"** 页面
3. 搜索 "send-newsletter" 查看发送记录

### 查看 Resend 统计

1. 登录 Resend Dashboard
2. 查看 **"Analytics"** 页面
3. 可以看到：
   - 发送数量
   - 打开率
   - 点击率
   - 退信率

### 管理订阅者

使用 API 查看和管理订阅者：

```bash
# 查看所有订阅者
curl "https://nav.chatgpt-plus.top/api/subscribers" \
  -H "Authorization: Bearer your-admin-secret"

# 手动取消订阅
curl -X POST "https://nav.chatgpt-plus.top/api/unsubscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

## 🎨 自定义邮件模板

编辑 `api/send-newsletter.js` 中的 `buildEmailHTML` 函数来自定义邮件样式：

- 修改颜色主题
- 调整布局
- 添加图片
- 修改字体

## 💰 费用说明

### Resend 免费计划

- 每月 3,000 封邮件
- 每天 100 封邮件
- 无限域名
- 完整的 API 访问

### 付费计划（可选）

如果订阅者超过 100 人：
- Pro: $20/月，50,000 封邮件
- Business: $80/月，100,000 封邮件

## 🔒 安全建议

1. **保护 API Key**
   - 不要在代码中硬编码
   - 使用环境变量
   - 定期更换

2. **添加认证**
   - 配置 `CRON_SECRET` 保护发送 API
   - 配置 `ADMIN_SECRET` 保护订阅者列表

3. **防止滥用**
   - 添加邮箱验证
   - 限制订阅频率
   - 添加验证码（可选）

## 🐛 故障排查

### 问题 1：订阅失败

**检查项：**
- Vercel KV 是否已配置
- 网络连接是否正常
- 查看浏览器 Console 的错误信息

### 问题 2：邮件发送失败

**检查项：**
- `RESEND_API_KEY` 是否正确配置
- 发件人地址是否正确
- 域名 DNS 是否验证通过
- 查看 Vercel Logs 的错误信息

### 问题 3：收不到邮件

**检查项：**
- 检查垃圾邮件文件夹
- 确认邮箱地址正确
- 查看 Resend Dashboard 的发送状态
- 检查域名 SPF/DKIM 配置

## 📚 相关资源

- [Resend 文档](https://resend.com/docs)
- [Resend API 参考](https://resend.com/docs/api-reference)
- [Vercel KV 文档](https://vercel.com/docs/storage/vercel-kv)

## ✅ 完成检查清单

- [ ] 注册 Resend 账号
- [ ] 获取 API Key
- [ ] 在 Vercel 配置 `RESEND_API_KEY`
- [ ] 修改发件人地址
- [ ] 测试订阅功能
- [ ] 测试发送邮件
- [ ] 配置自动发送（Cloudflare Workers 或 GitHub Actions）
- [ ] 验证邮件能正常接收

---

**提示**：建议先使用 Resend 测试域名测试功能，确认正常后再配置自己的域名。
