# 测试指南

## 🔍 验证整个数据流程

### 1. 测试 Vercel API（爬虫）

```bash
curl https://nav.chatgpt-plus.top/api/crawl
```

**预期结果：**
```json
{
  "success": true,
  "message": "成功爬取 XXX 条新闻",
  "data": [...],
  "total": XXX,
  "lastUpdate": "2026-01-13T..."
}
```

### 2. 测试前端 API（数据接口）

```bash
curl https://nav.chatgpt-plus.top/api/local-news
```

**预期结果：** 与上面相同，返回最新爬取的新闻数据

### 3. 测试 Cloudflare Worker

#### 健康检查
```bash
curl https://ai-news-cron.chatgpt-plus.workers.dev/health
```

**预期结果：**
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T...",
  "vercelDomain": "nav.chatgpt-plus.top"
}
```

#### 手动触发（如果配置了 TRIGGER_SECRET）
```bash
curl -H "Authorization: Bearer your-secret" \
  https://ai-news-cron.chatgpt-plus.workers.dev/trigger
```

### 4. 测试前端页面

1. 访问：https://nav.chatgpt-plus.top
2. 打开浏览器开发者工具（F12）
3. 查看 Console 标签，应该看到：
   ```
   🌐 Fetching latest data from API...
   📡 调用 Vercel API 获取最新数据...
   ✅ 成功获取 API 数据 XXX 条
   ```
4. 查看 Network 标签，应该看到对 `/api/local-news` 的请求

### 5. 清除缓存测试

在浏览器 Console 中执行：
```javascript
localStorage.clear()
location.reload()
```

这会清除缓存，强制重新从 API 获取数据。

## 📊 数据流程图

```
Cloudflare Worker (定时触发)
    ↓
    调用 /api/crawl
    ↓
爬取 ai-bot.cn 网站
    ↓
返回最新新闻数据
    ↓
前端调用 /api/local-news
    ↓
返回相同的爬取数据
    ↓
前端显示最新新闻
```

## 🐛 故障排查

### 问题 1：前端显示旧数据

**解决方案：**
1. 清除浏览器缓存：`localStorage.clear()`
2. 强制刷新：Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
3. 检查 API 是否返回最新数据

### 问题 2：API 返回空数据

**检查项：**
1. 访问 https://ai-bot.cn/daily-ai-news/ 确认源网站可访问
2. 查看 Vercel 日志是否有错误
3. 手动调用 `/api/crawl` 测试

### 问题 3：Cloudflare Worker 未执行

**检查项：**
1. 登录 Cloudflare Dashboard
2. 查看 Worker 的 "Triggers" 标签
3. 确认 Cron 触发器已添加
4. 查看 "Logs" 标签的执行记录

### 问题 4：前端调用 API 失败

**检查项：**
1. 打开浏览器开发者工具
2. 查看 Console 的错误信息
3. 查看 Network 标签的请求状态
4. 确认 Vercel 部署成功

## ⏰ 定时任务验证

### 查看下次执行时间

1. 访问 Cloudflare Dashboard
2. 进入 Worker：`ai-news-cron`
3. 点击 "Triggers" 标签
4. 查看 "Next scheduled run" 时间

### 查看执行历史

1. 在 Worker 页面点击 "Logs" 标签
2. 点击 "Begin log stream"
3. 等待下次定时执行（或手动触发）
4. 查看日志输出

**预期日志：**
```
🚀 定时任务触发: 2026-01-13T01:00:00.000Z
📡 调用 API: https://nav.chatgpt-plus.top/api/crawl
✅ API 调用成功: 200
📄 响应内容: {"success":true,...}
```

## 🎯 完整测试流程

### 步骤 1：手动触发爬虫
```bash
curl https://nav.chatgpt-plus.top/api/crawl
```
记录返回的新闻数量和最新新闻标题。

### 步骤 2：清除前端缓存
在浏览器 Console 执行：
```javascript
localStorage.clear()
```

### 步骤 3：刷新前端页面
按 F5 刷新页面，查看是否显示最新数据。

### 步骤 4：验证数据一致性
对比步骤 1 的数据和前端显示的数据是否一致。

### 步骤 5：测试自动刷新
等待 5 分钟（缓存过期时间），页面应该自动刷新数据。

## 📱 移动端测试

1. 在手机浏览器访问：https://nav.chatgpt-plus.top
2. 下拉刷新页面
3. 查看是否显示最新数据
4. 测试响应式布局

## 🔄 持续监控

### 每日检查清单

- [ ] 访问前端页面，确认有今天的新闻
- [ ] 查看 Cloudflare Worker 日志，确认定时任务执行
- [ ] 查看 Vercel 日志，确认 API 调用成功
- [ ] 检查新闻数量是否合理（通常 50-300 条）

### 监控指标

- **新闻更新频率**：每天至少一次
- **API 响应时间**：< 5 秒
- **爬虫成功率**：> 95%
- **前端加载时间**：< 3 秒

## 📞 获取帮助

如果遇到问题：

1. 查看本文档的故障排查部分
2. 检查 Cloudflare Worker 日志
3. 检查 Vercel 部署日志
4. 查看浏览器开发者工具的 Console 和 Network

---

**提示**：建议每天检查一次前端页面，确保数据正常更新。
