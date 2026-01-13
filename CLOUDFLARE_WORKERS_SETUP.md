# Cloudflare Workers 定时任务设置指南

## 📋 方案优势

- ✅ **完全免费**：每天 100,000 次请求（免费计划）
- ✅ **全球分布**：边缘计算，速度快
- ✅ **可靠稳定**：Cloudflare 基础设施
- ✅ **简单配置**：无需服务器维护

## 🚀 快速开始

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，让你授权 Wrangler 访问你的 Cloudflare 账号。

### 3. 配置环境变量

在 Cloudflare Dashboard 中配置，或使用命令行：

```bash
# 设置 Vercel 域名（必需）
wrangler secret put VERCEL_DOMAIN
# 输入: your-project.vercel.app

# 设置 API 认证密钥（可选，如果你的 API 需要认证）
wrangler secret put CRON_SECRET
# 输入: 你的密钥

# 设置手动触发密钥（可选）
wrangler secret put TRIGGER_SECRET
# 输入: 你的触发密钥
```

### 4. 部署到 Cloudflare

```bash
wrangler deploy
```

部署成功后，你会看到 Worker 的 URL，例如：
```
https://ai-news-cron.your-subdomain.workers.dev
```

## ⚙️ 配置说明

### wrangler.toml 配置

```toml
name = "ai-news-cron"
main = "workers/index.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 1 * * *"]  # 每天 UTC 01:00 (北京时间 09:00)
```

### Cron 表达式示例

- `0 1 * * *` - 每天 01:00 UTC (北京时间 09:00)
- `0 */6 * * *` - 每 6 小时一次
- `0 0,12 * * *` - 每天 00:00 和 12:00
- `0 9 * * 1-5` - 工作日 09:00

## 🧪 测试

### 1. 健康检查

```bash
curl https://ai-news-cron.your-subdomain.workers.dev/health
```

### 2. 手动触发（需要配置 TRIGGER_SECRET）

```bash
curl -X GET "https://ai-news-cron.your-subdomain.workers.dev/trigger" \
  -H "Authorization: Bearer 你的触发密钥"
```

### 3. 本地测试

```bash
# 本地开发模式
wrangler dev

# 测试定时任务（需要 Wrangler 3.0+）
wrangler dev --test-scheduled
```

## 📊 监控和日志

### 查看实时日志

```bash
wrangler tail
```

### 在 Cloudflare Dashboard 查看

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 "Workers & Pages"
3. 选择你的 Worker
4. 查看 "Logs" 标签

### 查看 Cron 触发历史

在 Worker 详情页面的 "Triggers" 标签中可以看到：
- 下次执行时间
- 历史执行记录
- 成功/失败状态

## 🔒 安全建议

### 1. 为 Vercel API 添加认证

修改 `api/crawl.js`，添加认证检查：

```javascript
export default async function handler(req, res) {
  // 验证请求来源
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... 原有逻辑
}
```

### 2. 在 Vercel 设置环境变量

在 Vercel Dashboard 中添加：
- `CRON_SECRET`: 设置一个随机字符串

### 3. 限制请求来源（可选）

在 Vercel API 中检查 User-Agent：

```javascript
const userAgent = req.headers['user-agent'];
if (!userAgent?.includes('Cloudflare-Workers-Cron')) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

## 🔄 更新和维护

### 更新 Worker 代码

```bash
# 修改 workers/index.js 后
wrangler deploy
```

### 更新环境变量

```bash
wrangler secret put VARIABLE_NAME
```

### 删除 Worker

```bash
wrangler delete
```

## 💰 费用说明

### 免费计划限制

- 每天 100,000 次请求
- 每次请求最多 10ms CPU 时间
- 每次请求最多 128MB 内存

对于每天一次的定时任务，完全够用！

### 付费计划（可选）

如果需要更高频率：
- Workers Paid: $5/月
- 每月 1000 万次请求
- 每次请求最多 50ms CPU 时间

## 🆚 对比其他方案

| 方案 | 费用 | 可靠性 | 配置难度 |
|------|------|--------|----------|
| Cloudflare Workers | 免费 | ⭐⭐⭐⭐⭐ | 简单 |
| GitHub Actions | 免费 | ⭐⭐⭐⭐ | 简单 |
| Vercel Cron | $20/月 | ⭐⭐⭐⭐⭐ | 最简单 |
| cron-job.org | 免费 | ⭐⭐⭐ | 最简单 |

## 🐛 故障排查

### Worker 没有执行

1. 检查 Cron 触发器是否正确配置
2. 查看 Cloudflare Dashboard 的日志
3. 确认环境变量已正确设置

### API 调用失败

1. 检查 VERCEL_DOMAIN 是否正确
2. 确认 Vercel API 可以公开访问
3. 检查认证配置是否匹配

### 查看详细日志

```bash
# 实时查看日志
wrangler tail

# 查看最近的日志
wrangler tail --format pretty
```

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cron 触发器文档](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

## ✅ 完成检查清单

- [ ] 安装 Wrangler CLI
- [ ] 登录 Cloudflare 账号
- [ ] 配置 VERCEL_DOMAIN 环境变量
- [ ] 部署 Worker
- [ ] 测试健康检查端点
- [ ] 手动触发测试
- [ ] 等待定时任务自动执行
- [ ] 查看执行日志确认成功

---

**提示**：部署后，第一次 Cron 任务会在下一个整点执行。你可以使用 `/trigger` 端点手动测试，无需等待。
