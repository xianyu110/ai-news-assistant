# 快速修复指南

## 🚨 前端显示旧数据？

### 方法 1：使用清除缓存页面（最简单）

直接访问：**https://nav.chatgpt-plus.top/clear-cache.html**

点击"清除缓存并刷新"按钮即可。

### 方法 2：浏览器控制台

1. 按 **F12** 打开开发者工具
2. 切换到 **Console** 标签
3. 输入以下代码并回车：
   ```javascript
   localStorage.clear(); location.reload()
   ```

### 方法 3：强制刷新

按 **Ctrl + Shift + R** (Windows) 或 **Cmd + Shift + R** (Mac)

---

## 🔄 手动触发爬虫

如果想立即获取最新数据，访问：

```
https://nav.chatgpt-plus.top/api/crawl
```

或使用命令行：
```bash
curl https://nav.chatgpt-plus.top/api/crawl
```

---

## ⏰ 自动更新时间

Cloudflare Worker 会在每天 **北京时间 09:00** 自动爬取最新新闻。

---

## 📊 检查数据是否最新

### 1. 检查 API 数据
访问：https://nav.chatgpt-plus.top/api/local-news

查看返回的 `publishTime` 字段，应该是最近的日期。

### 2. 检查前端显示
- 打开网站首页
- 查看左侧"今日新闻"数量
- 查看新闻列表的日期标题

### 3. 检查缓存状态
访问：https://nav.chatgpt-plus.top/clear-cache.html

查看缓存信息。

---

## 🐛 常见问题

### Q: 为什么前端显示的是旧数据？

**A:** 浏览器缓存了旧数据。解决方法：
1. 访问 `/clear-cache.html` 清除缓存
2. 或按 Ctrl+Shift+R 强制刷新

### Q: 清除缓存后还是旧数据？

**A:** 可能是以下原因：
1. Vercel 部署还未完成（等待 1-2 分钟）
2. 浏览器缓存了 HTML 文件（按 Ctrl+Shift+R）
3. CDN 缓存（等待几分钟自动更新）

### Q: 今天没有新闻？

**A:** 正常情况：
- 定时任务在每天 09:00 执行
- 如果现在是凌晨，还没有今天的数据
- 可以手动访问 `/api/crawl` 触发爬虫

### Q: 如何验证 Cloudflare Worker 是否正常？

**A:** 访问：https://ai-news-cron.chatgpt-plus.workers.dev/health

应该返回：
```json
{
  "status": "ok",
  "timestamp": "...",
  "vercelDomain": "nav.chatgpt-plus.top"
}
```

---

## 📱 快捷链接

- **清除缓存页面**: https://nav.chatgpt-plus.top/clear-cache.html
- **手动爬虫**: https://nav.chatgpt-plus.top/api/crawl
- **查看数据**: https://nav.chatgpt-plus.top/api/local-news
- **Worker 健康检查**: https://ai-news-cron.chatgpt-plus.workers.dev/health
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🎯 每日检查清单

- [ ] 访问网站，确认有今天的新闻
- [ ] 查看左侧"今日新闻"数量是否正常
- [ ] 如果数据不对，访问 `/clear-cache.html` 清除缓存
- [ ] 查看 Cloudflare Worker 日志确认定时任务执行

---

**提示**：建议将 `/clear-cache.html` 添加到浏览器书签，方便快速访问。
