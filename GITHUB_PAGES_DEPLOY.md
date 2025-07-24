# 🚀 GitHub Pages 部署指南

## 📋 部署步骤

### 1. 推送代码到GitHub

```bash
cd /Users/chinamanor/Downloads/cursor编程/ai-news-assistant-react

# 初始化Git仓库（如果还没有）
git init
git add .
git commit -m "Initial commit: AI News Assistant React App"

# 添加远程仓库并推送
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-news-assistant-react.git
git push -u origin main
```

### 2. 启用GitHub Pages

1. 打开GitHub仓库页面
2. 点击 **Settings** 选项卡
3. 滚动到 **Pages** 部分
4. 在 **Source** 下选择 **GitHub Actions**
5. 保存设置

### 3. 自动部署

推送代码后，GitHub Actions会自动：
- 🔧 安装依赖
- 🏗️ 构建React应用
- 🚀 部署到GitHub Pages

## 🌐 访问地址

部署完成后，您的网站将在以下地址访问：
```
https://YOUR_USERNAME.github.io/ai-news-assistant-react/
```

## 📧 邮件服务配置

由于GitHub Pages是静态托管，无法直接运行Node.js邮件服务。建议使用以下方案：

### 方案1: GitHub Actions定时任务
创建定时的GitHub Actions来发送邮件：

```yaml
# .github/workflows/send-email.yml
name: Send Daily Email

on:
  schedule:
    - cron: '30 0 * * *'  # 每天8:30 (UTC+8)
  workflow_dispatch:

jobs:
  send-email:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - run: npm install nodemailer
    - run: node scripts/send-email.js
      env:
        EMAIL_PASSWORD: ${{ secrets.EMAIL_PASSWORD }}
```

### 方案2: 第三方邮件服务
- **EmailJS**: 前端直接发送邮件
- **Netlify Functions**: 如果迁移到Netlify
- **Vercel Functions**: 如果迁移到Vercel

## 🔧 项目特性

### ✅ 已配置的功能
- 📱 响应式设计
- 🎨 现代化UI界面
- 📰 AI新闻展示
- 🔍 搜索和筛选
- ❤️ 收藏功能
- 🌙 暗色模式
- 📊 PWA支持

### 📊 实时数据
- 包含57条真实AI新闻
- 数据来源：ai-news.json
- 支持分类和时间筛选

## 📝 自定义配置

### 修改基础路径
如果仓库名不是 `ai-news-assistant-react`，请修改 `vite.config.ts`：

```typescript
base: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '/',
```

### 添加自定义域名
1. 在仓库根目录创建 `CNAME` 文件
2. 内容为您的域名，如：`ai-news.example.com`
3. 在域名DNS设置中添加CNAME记录指向 `YOUR_USERNAME.github.io`

## 🐛 故障排除

### 构建失败
```bash
# 本地测试构建
npm run build
npm run preview
```

### 路径问题
确保所有资源路径使用相对路径，避免绝对路径导致的404错误。

### 数据更新
要更新新闻数据：
1. 替换 `public/mock-data/ai-news.json`
2. 提交并推送代码
3. GitHub Actions会自动重新部署

## 🎯 优势

- ✅ **免费托管**: GitHub Pages完全免费
- ✅ **自动部署**: 推送代码即自动部署
- ✅ **HTTPS支持**: 自动启用HTTPS
- ✅ **CDN加速**: 全球CDN分发
- ✅ **版本控制**: Git版本管理
- ✅ **易于维护**: 静态网站，稳定可靠

## 📈 后续优化

1. **SEO优化**: 添加meta标签和sitemap
2. **性能优化**: 图片压缩和懒加载
3. **监控分析**: Google Analytics集成
4. **PWA增强**: 离线缓存和推送通知