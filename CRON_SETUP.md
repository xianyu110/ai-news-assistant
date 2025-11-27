# 定时任务设置指南

## 方案 1：GitHub Actions（推荐）

已创建 `.github/workflows/daily-crawl.yml` 文件。

### 设置步骤：
1. 将代码推送到 GitHub
2. 修改 `.github/workflows/daily-crawl.yml` 中的域名为你的 Vercel 域名
3. GitHub Actions 会自动每天执行

### 手动触发：
- 进入 GitHub 仓库
- 点击 "Actions" 标签
- 选择 "Daily News Crawl"
- 点击 "Run workflow"

---

## 方案 2：Vercel Cron（需要 Pro 计划）

### 要求：
- Vercel Pro 或更高计划（$20/月）
- 已配置 Vercel KV 数据库

### 检查步骤：
1. 登录 Vercel Dashboard
2. 进入项目设置
3. 查看 "Cron Jobs" 标签
4. 确认 cron 任务已启用

### 环境变量：
确保在 Vercel 项目设置中配置了：
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

---

## 方案 3：免费 Cron 服务

### 使用 cron-job.org：

1. 访问 https://cron-job.org
2. 注册免费账号
3. 创建新任务：
   - URL: `https://你的域名.vercel.app/api/crawl`
   - 时间: 每天 01:00 UTC (北京时间 09:00)
   - 方法: GET

### 使用 EasyCron：

1. 访问 https://www.easycron.com
2. 注册免费账号（每月 100 次执行）
3. 创建新任务：
   - URL: `https://你的域名.vercel.app/api/crawl`
   - Cron 表达式: `0 1 * * *`

---

## 方案 4：添加认证保护（可选）

为了防止 API 被滥用，可以添加简单的认证：

### 1. 在 Vercel 添加环境变量：
- `CRON_SECRET`: 设置一个随机字符串

### 2. 修改 API 代码（已注释）：
取消 `api/crawl.js` 中的认证代码注释

### 3. 调用时添加 Header：
```bash
curl -X GET "https://你的域名.vercel.app/api/crawl" \
  -H "Authorization: Bearer 你的密钥"
```

---

## 测试 API

手动测试爬虫 API：

```bash
# 直接访问
curl https://你的域名.vercel.app/api/crawl

# 或在浏览器中打开
https://你的域名.vercel.app/api/crawl
```

---

## 监控和日志

### 查看 Vercel 日志：
1. 进入 Vercel Dashboard
2. 选择项目
3. 点击 "Logs" 标签
4. 查看 API 调用记录

### 查看 GitHub Actions 日志：
1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择执行记录查看详细日志
