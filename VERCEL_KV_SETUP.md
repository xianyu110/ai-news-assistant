# Vercel KV 配置指南

## 步骤 1：创建 Vercel KV 数据库

1. 登录 Vercel Dashboard：https://vercel.com/dashboard
2. 进入你的项目（ai-news-assistant）
3. 点击顶部导航栏的 **Storage** 标签
4. 点击 **Create Database** 按钮
5. 选择 **KV (Redis)**
6. 填写数据库信息：
   - Database Name: `ai-news-kv`（或任意名称）
   - Region: 选择 **Hong Kong (hkg1)** 或 **Singapore (sin1)**（离中国最近）
7. 点击 **Create** 按钮

## 步骤 2：连接数据库到项目

创建完成后，Vercel 会自动询问是否连接到项目：

1. 在弹出的对话框中，选择你的项目 **ai-news-assistant**
2. 点击 **Connect** 按钮
3. Vercel 会自动添加环境变量到你的项目

## 步骤 3：验证环境变量

1. 进入项目设置：**Settings** → **Environment Variables**
2. 确认以下环境变量已自动添加：
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `KV_URL`

这些变量应该对所有环境（Production, Preview, Development）都可用。

## 步骤 4：重新部署

环境变量配置完成后，需要重新部署：

### 方法 1：通过 Git 推送触发部署
```bash
git add .
git commit -m "Configure Vercel KV"
git push
```

### 方法 2：在 Vercel Dashboard 手动部署
1. 进入项目的 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的三个点 **···**
4. 选择 **Redeploy**
5. 勾选 **Use existing Build Cache**
6. 点击 **Redeploy** 按钮

## 步骤 5：测试 API

部署成功后，测试 API 是否正常工作：

```bash
# 测试爬虫 API
curl https://nav.chatgpt-plus.top/api/crawl

# 测试新闻 API
curl https://nav.chatgpt-plus.top/api/local-news
```

## 步骤 6：查看 KV 数据

1. 回到 Vercel Dashboard 的 **Storage** 标签
2. 点击你创建的 KV 数据库
3. 在 **Data** 标签中可以看到存储的数据：
   - `news:all` - 所有新闻数据
   - `news:latest` - 最新新闻数据（用于前端）

## 常见问题

### Q1: 如果没有看到 Storage 标签怎么办？
A: Storage 功能在所有 Vercel 计划中都可用（包括免费的 Hobby 计划）。如果看不到，尝试刷新页面或切换到项目视图。

### Q2: KV 数据库是免费的吗？
A: Vercel KV 免费额度：
- 存储：256 MB
- 每月请求：3,000 次
- 每日带宽：100 MB

对于你的新闻网站，这个额度完全够用。

### Q3: 如何查看 KV 使用情况？
A: 在 Storage → 你的 KV 数据库 → Usage 标签中查看。

### Q4: 部署仍然失败怎么办？
A: 检查以下几点：
1. 确认 KV 数据库已创建
2. 确认数据库已连接到项目
3. 确认环境变量存在
4. 尝试清除构建缓存重新部署

### Q5: 本地开发如何使用 KV？
A: 
1. 安装 Vercel CLI：`npm i -g vercel`
2. 在项目目录运行：`vercel env pull .env.local`
3. 这会下载环境变量到本地
4. 运行 `npm run dev` 即可

## 下一步

配置完成后：
1. GitHub Actions 会每天自动调用 `/api/crawl` 更新新闻
2. 新闻数据会存储在 Vercel KV 中
3. 前端会从 KV 读取最新数据展示

## 需要帮助？

如果遇到问题，可以：
1. 查看 Vercel 部署日志
2. 查看 GitHub Actions 执行日志
3. 检查浏览器控制台错误
