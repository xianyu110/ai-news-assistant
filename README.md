# 🤖 AI快讯助手

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=flat-square&logo=github)](https://xianyu110.github.io/ai-news-assistant/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/xianyu110/ai-news-assistant/deploy.yml?branch=main&style=flat-square)](https://github.com/xianyu110/ai-news-assistant/actions)
[![License](https://img.shields.io/github/license/xianyu110/ai-news-assistant?style=flat-square)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![UniApp](https://img.shields.io/badge/UniApp-Latest-2B2B2B?style=flat-square)](https://uniapp.dcloud.io/)
[![CloudBase](https://img.shields.io/badge/CloudBase-Powered-0066FF?style=flat-square)](https://cloudbase.net/)

基于 CloudBase + UniApp 开发的AI资讯聚合应用，实时获取和展示AI领域的最新动态。

## 🌐 在线访问

**✨ 立即体验：[https://xianyu110.github.io/ai-news-assistant/](https://xianyu110.github.io/ai-news-assistant/)**

> 📱 支持手机、平板、电脑全平台访问，无需下载安装！

## 🎯 项目特色

- **📱 跨平台支持** - 一套代码支持H5、微信小程序、App
- **🔍 智能搜索** - 支持标题、内容、标签多维度搜索
- **📊 数据分类** - 按投融资、开源项目、产品发布等分类展示
- **💾 云端存储** - 基于腾讯云开发，数据安全可靠
- **⚡ 实时更新** - 支持一键爬取最新AI快讯
- **❤️ 收藏功能** - 个人收藏夹，重要资讯不错过

## 🏗️ 技术架构

```
前端应用 (UniApp + Vue3 + TypeScript)
    ↓
云开发服务 (腾讯CloudBase)
    ├── 云数据库 (存储快讯和收藏)
    ├── 云函数 (数据爬取和处理)
    └── 静态托管 (H5应用部署)
```

## 📁 项目结构

```
cloudbase-uniapp-template/
├── src/                          # 前端源码
│   ├── pages/                    # 页面文件
│   │   ├── ai-news/             # AI快讯相关页面
│   │   │   ├── news-list.vue    # 快讯列表页
│   │   │   ├── news-detail.vue  # 快讯详情页
│   │   │   └── search.vue       # 搜索页面
│   │   └── index/               # 首页
│   ├── utils/                   # 工具函数
│   │   └── cloudbase.ts        # 云开发配置
│   └── static/                  # 静态资源
├── cloudfunctions/              # 云函数
│   └── ai-news-crawler/         # AI快讯爬虫
│       ├── index.js            # 爬虫主逻辑
│       └── package.json        # 依赖配置
└── cloudbaserc.json            # 云开发配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置云开发环境

在 `src/utils/cloudbase.ts` 中配置你的云开发环境ID：

```typescript
const ENV_ID: string = 'your-env-id';
```

### 3. 启动开发服务器

```bash
# H5版本
npm run dev:h5

# 微信小程序版本
npm run dev:mp-weixin
```

### 4. 访问应用

- **H5版本**: http://localhost:5173
- **小程序**: 在微信开发者工具中打开 `dist/dev/mp-weixin` 目录

## 🔧 云开发配置

### 数据库集合

应用使用以下数据库集合：

1. **ai_news** - AI快讯数据
   ```javascript
   {
     _id: "文档ID",
     title: "快讯标题",
     content: "快讯内容",
     category: "分类",
     tags: ["标签1", "标签2"],
     source: "来源",
     sourceUrl: "原文链接",
     publishTime: "发布时间",
     createTime: "创建时间"
   }
   ```

2. **user_favorites** - 用户收藏
   ```javascript
   {
     _id: "文档ID",
     newsId: "快讯ID",
     title: "快讯标题",
     category: "分类",
     createTime: "收藏时间"
   }
   ```

### 云函数

- **ai-news-crawler** - AI快讯爬虫（已部署 ✅）
  - 支持爬取AI工具集等网站的最新快讯
  - 自动分类和标签提取
  - 数据去重和清洗
  - 支持统计查询和数据管理
  - 当前已爬取681条AI快讯数据

## 📱 功能介绍

### 1. 快讯列表页
- **分类筛选**: 支持按投融资、开源项目、产品发布等分类查看
- **下拉刷新**: 获取最新快讯数据
- **上拉加载**: 无限滚动加载更多内容
- **实时统计**: 显示今日新增和总计数量

### 2. 快讯详情页
- **完整内容**: 展示快讯的详细信息
- **相关推荐**: 基于标签和分类的智能推荐
- **操作功能**: 收藏、分享、查看原文

### 3. 搜索功能
- **多维搜索**: 支持标题、内容、标签搜索
- **关键词高亮**: 搜索结果中关键词高亮显示
- **搜索历史**: 保存最近10次搜索记录
- **热门标签**: 快速搜索常用关键词

## 🎨 界面特色

- **现代化设计**: 简洁美观的Material Design风格
- **响应式布局**: 完美适配各种屏幕尺寸
- **流畅动画**: 丰富的交互动效
- **暗色主题**: 护眼的夜间模式（计划中）

## 📊 数据来源

目前支持爬取以下网站的AI快讯：

- [AI工具集](https://ai-bot.cn/daily-ai-news/) - 每日AI快讯
- 更多数据源正在添加中...

## 🔄 部署指南

### 1. 部署云函数

```bash
# 使用CloudBase CLI部署
tcb functions:deploy ai-news-crawler
```

### 2. 部署静态网站

```bash
# 构建生产版本
npm run build:h5

# 部署到静态托管
tcb hosting:deploy dist/build/h5 -e your-env-id
```

## 🛠️ 开发计划

- [x] 基础架构搭建
- [x] 前端页面开发
- [x] 云数据库设计
- [x] 爬虫功能开发
- [x] 云函数部署优化
- [x] 数据爬取和存储功能
- [ ] 推送通知功能
- [ ] 用户个性化推荐
- [ ] 数据分析统计
- [ ] 多语言支持

## 🤝 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目！

## 📄 开源协议

本项目基于 MIT 协议开源。

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至开发者

---

## 🎯 关键配置信息

### 云开发环境
- **环境ID**: `test-9gfe9noc86c78276`
- **环境类型**: 免费体验版
- **数据库**: MongoDB兼容

### 技术栈版本
- **Vue**: 3.x
- **TypeScript**: 4.x
- **UniApp**: 最新版
- **CloudBase SDK**: 2.x

### 构建信息
- **开发服务器**: http://localhost:5173
- **构建工具**: Vite + ESBuild
- **样式框架**: 原生CSS + UnoCSS

## 🏆 项目亮点

1. **技术先进**: 采用最新的Vue3 + TypeScript技术栈
2. **架构清晰**: 前后端分离，云原生架构
3. **用户体验**: 流畅的交互和优雅的界面设计
4. **扩展性强**: 模块化设计，易于功能扩展
5. **性能优化**: 懒加载、虚拟滚动等性能优化措施

立即体验：[http://localhost:5173](http://localhost:5173) 🚀