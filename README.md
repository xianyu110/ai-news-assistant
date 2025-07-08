# 🤖 AI快讯助手 - 无服务器架构版

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?style=for-the-badge&logo=github)](https://xianyu110.github.io/ai-news-assistant/)
[![Auto Update](https://img.shields.io/badge/Auto%20Update-Every%202H-blue?style=for-the-badge&logo=github-actions)](https://github.com/xianyu110/ai-news-assistant/actions)
[![Vue 3](https://img.shields.io/badge/Vue-3.0-green?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![UniApp](https://img.shields.io/badge/UniApp-Cross%20Platform-orange?style=for-the-badge&logo=unity)](https://uniapp.dcloud.io/)
[![No Server](https://img.shields.io/badge/No%20Server-Zero%20Cost-red?style=for-the-badge&logo=serverless)](https://pages.github.com/)

> 🚀 **重大更新**：已从云开发架构重构为完全无服务器架构，实现零成本永久运行！

## ✨ 项目特色

### 🏗️ 无服务器架构
- **零服务器成本** - 完全基于GitHub Pages + GitHub Actions
- **永久免费部署** - 无需任何云服务费用
- **自动化运维** - GitHub Actions自动爬取和部署
- **数据永久保存** - Git仓库作为数据历史存储

### 🤖 智能数据聚合
- **实时爬取** - 每2小时自动爬取[AI工具集](https://ai-bot.cn/daily-ai-news/)最新资讯
- **历史存档** - 按日期归档，支持历史数据查询
- **智能去重** - 自动识别和合并重复内容
- **时间排序** - 按发布时间智能排序

### 🎯 功能特性
- **📱 跨平台支持** - H5、微信小程序、App多端运行
- **🔍 智能搜索** - 标题、内容、标签全文搜索
- **❤️ 本地收藏** - 基于LocalStorage的收藏功能
- **📊 实时统计** - 自动统计各类数据指标
- **🏷️ 标签分类** - 智能分类和标签管理
- **📖 相关推荐** - 基于内容的智能推荐

## 🔗 在线访问

### 🌐 GitHub Pages（推荐）
- **主站**: https://xianyu110.github.io/ai-news-assistant/
- **特点**: 自动更新、永久稳定、访问速度快

## 📊 数据架构

### 🗂️ 数据存储结构
```
src/data/
├── ai-news.json          # 最新数据（前端读取）
├── all-news.json         # 全量历史数据
└── history/
    ├── 2025-01-08.json   # 按日期存档
    ├── 2025-01-07.json
    └── index.json        # 历史索引
```

### 🔄 自动化流程
1. **GitHub Actions** 每2小时触发
2. **爬虫脚本** 获取最新AI资讯
3. **数据处理** 去重、排序、分类
4. **Git提交** 存储为历史版本
5. **自动部署** 更新GitHub Pages

## 🚀 快速开始

### 📋 环境要求
- Node.js 16+
- npm 或 yarn
- Git

### 🔧 本地开发

```bash
# 克隆项目
git clone https://github.com/xianyu110/ai-news-assistant.git
cd ai-news-assistant

# 安装依赖
npm install

# 爬取最新数据
npm run update-history

# 启动开发服务器
npm run dev:h5          # H5版本
npm run dev:mp-weixin   # 微信小程序

# 构建生产版本
npm run build:h5        # H5构建
npm run build:mp-weixin # 小程序构建
```

### 📱 本地预览

```bash
# 构建并预览H5版本
npm run build:h5
cd dist/build/h5
npx live-server
```

## 🤖 GitHub Actions

### ⚙️ 自动化工作流

#### 📊 数据更新流程
- **触发方式**: 每2小时 + 手动触发
- **执行步骤**:
  1. 爬取AI工具集最新数据
  2. 数据清洗和去重处理
  3. 按日期归档历史数据
  4. 更新全量数据文件
  5. 提交到Git仓库

#### 🚀 部署流程
- **触发方式**: Push到main分支
- **执行步骤**:
  1. 检出代码
  2. 安装依赖
  3. 构建H5版本
  4. 部署到GitHub Pages

### 🔧 配置说明

所有配置文件位于 `.github/workflows/`：
- `update-news.yml` - 数据更新工作流
- `deploy-pages.yml` - 页面部署工作流

## 📁 项目结构

```
ai-news-assistant/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── index/         # 首页
│   │   └── ai-news/       # AI资讯相关页面
│   ├── utils/             # 工具函数
│   │   └── cloudbase.ts   # 数据服务（已重构为静态服务）
│   └── data/              # 数据文件
│       ├── ai-news.json   # 最新数据
│       ├── all-news.json  # 全量数据
│       └── history/       # 历史归档
├── scripts/               # 自动化脚本
│   ├── crawl-news.js     # 爬虫脚本
│   └── update-history.js # 历史管理
├── .github/workflows/     # GitHub Actions
└── dist/build/h5/        # H5构建产物
```

## 🔍 API 接口

### 📡 数据服务 API

```typescript
// 获取最新新闻数据
const result = await NewsService.getNews()

// 返回数据结构
interface NewsData {
  success: boolean
  updateTime: string
  count: number
  data: NewsItem[]
  stats: {
    todayCount: number
    totalCount: number
    categories: string[]
    sources: string[]
  }
}
```

### 💾 本地存储 API

```typescript
// 收藏管理
LocalStorage.saveFavorite(newsItem)    // 保存收藏
LocalStorage.removeFavorite(newsId)    // 移除收藏
LocalStorage.getFavorites()            // 获取收藏列表
LocalStorage.isFavorited(newsId)       // 检查收藏状态

// 搜索历史
LocalStorage.saveSearchHistory(keyword)  // 保存搜索历史
LocalStorage.getSearchHistory()          // 获取搜索历史
LocalStorage.clearSearchHistory()        // 清空搜索历史
```

## 📈 数据统计

### 🔢 实时统计
- **总数据量**: 自动统计全量新闻数据
- **今日新增**: 统计当日新增的新闻数量
- **分类分布**: 各个分类的数据分布
- **数据源统计**: 不同来源的数据占比

### �� 历史趋势
- **按日期归档**: 每日数据变化趋势
- **增长曲线**: 数据累积增长情况
- **热门标签**: 高频标签统计

## 🛠️ 技术栈

### 🎨 前端技术
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript
- **UniApp** - 跨平台开发框架
- **Vite** - 现代前端构建工具
- **SCSS** - CSS预处理器

### 🔧 构建工具
- **Node.js** - JavaScript运行环境
- **GitHub Actions** - CI/CD自动化
- **GitHub Pages** - 静态网站托管
- **Cheerio** - 服务端jQuery实现
- **Axios** - HTTP客户端

### 📦 核心依赖

```json
{
  "@dcloudio/uni-app": "3.0.0-4020920240930001",
  "vue": "^3.4.21",
  "typescript": "^5.4.5",
  "vite": "5.2.8",
  "axios": "^1.6.0",
  "cheerio": "^1.0.0-rc.12"
}
```

## 🔄 数据更新机制

### ⏰ 自动更新
- **频率**: 每2小时执行一次
- **时间**: 北京时间 02:00, 04:00, 06:00, ..., 00:00
- **数据源**: [AI工具集每日快讯](https://ai-bot.cn/daily-ai-news/)

### 🔍 数据处理
1. **网页抓取**: 使用Cheerio解析HTML
2. **内容提取**: 提取标题、内容、时间等信息
3. **数据清洗**: 去除重复和无效数据
4. **格式统一**: 标准化数据格式
5. **历史归档**: 按日期存储历史版本

### 📝 数据格式

```typescript
interface NewsItem {
  id: string              // 唯一标识
  title: string           // 新闻标题
  content: string         // 新闻内容
  originalContent: string // 原始内容
  source: string          // 数据源
  sourceUrl: string       // 原文链接
  publishTime: string     // 发布时间
  crawlTime: string       // 爬取时间
  category: string        // 分类
  tags: string[]          // 标签
  dateText: string        // 日期文本
}
```

## 🤝 贡献指南

### 🎯 如何贡献
1. **Fork** 本仓库
2. **创建** 功能分支: `git checkout -b feature/AmazingFeature`
3. **提交** 更改: `git commit -m 'Add some AmazingFeature'`
4. **推送** 分支: `git push origin feature/AmazingFeature`
5. **创建** Pull Request

### 🐛 问题反馈
- [GitHub Issues](https://github.com/xianyu110/ai-news-assistant/issues)
- 请详细描述问题和复现步骤

### 💡 功能建议
- 欢迎提交新功能建议
- 请先搜索现有Issue避免重复

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [AI工具集](https://ai-bot.cn/) - 提供优质的AI资讯数据源
- [UniApp](https://uniapp.dcloud.io/) - 优秀的跨平台开发框架
- [GitHub](https://github.com/) - 免费的代码托管和CI/CD服务
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给个 Star 支持一下！**

[⭐ Star](https://github.com/xianyu110/ai-news-assistant) |
[🍴 Fork](https://github.com/xianyu110/ai-news-assistant/fork) |
[🐛 Issues](https://github.com/xianyu110/ai-news-assistant/issues) |
[📖 Docs](https://xianyu110.github.io/ai-news-assistant/)

</div>

## 📞 联系方式

- **GitHub**: [@xianyu110](https://github.com/xianyu110)
- **项目地址**: https://github.com/xianyu110/ai-news-assistant
- **在线演示**: https://xianyu110.github.io/ai-news-assistant/

---

*最后更新: 2025-01-08*