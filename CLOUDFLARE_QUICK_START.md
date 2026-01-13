# Cloudflare Workers 快速开始（5分钟配置）

## 🎯 目标

在 Cloudflare 网页界面中创建定时任务，每天自动触发 Vercel API 爬取新闻。

## 📝 准备工作

你需要：
- Cloudflare 账号（免费注册：https://dash.cloudflare.com）
- 你的 Vercel 项目域名（例如：`your-project.vercel.app`）

---

## 🚀 5 步完成配置

### 第 1 步：创建 Worker（1分钟）

1. 访问 https://dash.cloudflare.com
2. 点击左侧 **"Workers & Pages"**
3. 点击 **"Create application"** → **"Create Worker"**
4. 名称输入：`ai-news-cron`
5. 点击 **"Deploy"**

### 第 2 步：粘贴代码（1分钟）

1. 点击 **"Edit code"** 按钮
2. 删除所有默认代码
3. 打开项目中的 `workers/index.js` 文件
4. 复制全部内容并粘贴到 Cloudflare 编辑器
5. 点击 **"Save and Deploy"**

### 第 3 步：配置域名（1分钟）

1. 点击顶部 **"Settings"** 标签
2. 点击左侧 **"Variables and Secrets"**
3. 点击 **"Add variable"** 按钮
4. 填写：
   - Variable name: `VERCEL_DOMAIN`
   - Value: 你的域名（例如：`your-project.vercel.app`）
   - 不要勾选 "Encrypt"
5. 点击 **"Save"**

### 第 4 步：设置定时任务（1分钟）

1. 点击顶部 **"Triggers"** 标签
2. 找到 **"Cron Triggers"** 部分
3. 点击 **"Add Cron Trigger"**
4. 输入：`0 1 * * *`（每天北京时间 09:00）
5. 点击 **"Add Trigger"**

### 第 5 步：测试（1分钟）

1. 回到 Worker 主页，复制 Worker URL
2. 在浏览器访问：`你的Worker URL/health`
3. 看到 `"status": "ok"` 表示配置成功！

---

## ✅ 完成！

配置完成后：
- Worker 会在每天北京时间 09:00 自动执行
- 可以在 **"Logs"** 标签查看执行日志
- 可以在 **"Triggers"** 标签查看下次执行时间

## 🔧 常用时间设置

想改变执行时间？修改 Cron 表达式：

| 北京时间 | Cron 表达式 |
|---------|------------|
| 每天 08:00 | `0 0 * * *` |
| 每天 09:00 | `0 1 * * *` |
| 每天 10:00 | `0 2 * * *` |
| 每天 12:00 | `0 4 * * *` |
| 每天 20:00 | `0 12 * * *` |

**提示**：Cloudflare 使用 UTC 时间，北京时间需要减 8 小时

## 📚 详细文档

- 完整配置指南：查看 `CLOUDFLARE_DASHBOARD_SETUP.md`
- 命令行工具：查看 `CLOUDFLARE_WORKERS_SETUP.md`

## 🆘 遇到问题？

1. 检查 Worker 的 **"Logs"** 标签查看错误
2. 确认 `VERCEL_DOMAIN` 配置正确（不要包含 `https://`）
3. 确认 Vercel API 可以公开访问

---

**就这么简单！** 🎉
