# AI新闻助手 - CloudBase UniApp 模板

一个基于 UniApp + GitHub Actions 的零成本AI新闻聚合应用，模仿AI工具集的界面设计，提供每日AI行业资讯。

## ✨ 最新更新

### 2025年7月8日 - UI重新设计 & 数据优化
- 🎨 **全新UI设计**：模仿[AI工具集](https://ai-bot.cn/daily-ai-news/)的界面风格
  - 蓝色渐变横幅设计，突出品牌形象
  - 优化搜索框和按日期分组的新闻布局
  - 移除首页和演示页面，专注新闻功能
- 📰 **增强爬虫功能**：
  - 优化解析算法，正确识别AI工具集主页面结构
  - 支持按日期自动分组，覆盖近一个月历史数据
  - 改进数据去重和分类标记机制
- 🔧 **技术优化**：
  - 修复H5版本兼容性问题（移除不支持的UniApp API）
  - 新增SCSS样式支持
  - 优化数据存储格式兼容性

## 🚀 项目特色

### 核心功能
- **AI资讯聚合**：自动爬取AI工具集的每日快讯
- **智能分类**：自动识别投融资、开源项目、产品发布等类别
- **日期分组**：按发布日期自动分组，方便浏览历史资讯
- **本地收藏**：支持本地收藏功能，无需登录
- **搜索功能**：支持标题和内容全文搜索

### 技术架构
- **零成本部署**：GitHub Pages + GitHub Actions
- **数据持久化**：Git仓库作为数据库
- **自动更新**：每2小时自动爬取最新资讯
- **跨平台支持**：支持H5、小程序、App多端

## 📱 界面预览

### 新版UI设计
- **横幅区域**：蓝色渐变背景，包含项目介绍和社群链接
- **搜索功能**：顶部搜索框，支持实时搜索
- **新闻列表**：按日期分组，每条新闻显示标题、内容、来源、分类标签
- **交互优化**：收藏、分享、详情查看等功能完善

## 🛠️ 本地开发

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖
```bash
npm install
npm install -D sass  # SCSS样式支持
```

### 开发运行
```bash
# H5版本开发
npm run dev:h5

# 小程序版本开发  
npm run dev:mp-weixin

# 构建H5版本
npm run build:h5

# 本地预览构建结果
cd dist/build/h5 && npx live-server --port=8080
```

### 数据爬取
```bash
# 手动爬取最新数据
node scripts/crawl-news.js

# 更新历史记录
node scripts/update-history.js
```

## 📊 数据来源

### 主要来源
- [AI工具集每日快讯](https://ai-bot.cn/daily-ai-news/) - 主要数据源
- 涵盖AI行业最新资讯、融资动态、产品发布、技术突破等

### 数据结构
```
src/data/
├── ai-news.json          # 最新100条用于前端展示
├── all-news.json         # 完整历史数据
└── history/              # 按日期归档
    ├── index.json        # 历史索引
    └── YYYY-MM-DD.json   # 每日数据快照
```

## 🔄 自动化工作流

### GitHub Actions
- **定时任务**：每2小时自动执行（UTC 0,2,4,6,8,10,12,14,16,18,20,22）
- **数据爬取**：自动获取最新AI资讯
- **数据处理**：去重、分类、格式化
- **自动提交**：更新数据并推送到仓库
- **部署更新**：自动部署到GitHub Pages

### 工作流程
1. 爬取AI工具集最新资讯
2. 数据清洗和分类处理
3. 与现有数据去重合并
4. 生成历史记录和统计信息
5. 提交代码并触发页面更新

## 📂 项目结构

```
├── src/
│   ├── pages/
│   │   └── ai-news/           # AI快讯相关页面
│   │       ├── news-list.vue  # 新闻列表（主页）
│   │       ├── news-detail.vue # 新闻详情
│   │       └── search.vue     # 搜索页面
│   ├── data/                  # 数据文件
│   ├── utils/
│   │   └── cloudbase.ts       # 数据服务接口
│   └── static/                # 静态资源
├── scripts/
│   ├── crawl-news.js          # 爬虫脚本
│   └── update-history.js      # 历史数据管理
├── .github/workflows/
│   └── update-news.yml        # 自动化工作流
└── dist/build/h5/             # H5构建产物
```

## 🎯 设计理念

### UI设计
- **简洁专业**：采用AI工具集的设计风格，专业简洁
- **信息密度**：合理的信息布局，不拥挤不稀疏
- **视觉层次**：通过颜色、字体、间距建立清晰的视觉层次
- **交互友好**：流畅的交互动画和反馈

### 技术选型
- **前端框架**：UniApp（支持多端）
- **构建工具**：Vite + TypeScript
- **样式处理**：SCSS + Tailwind CSS概念
- **状态管理**：Vue3 Composition API
- **数据持久**：LocalStorage + Git仓库

## 📈 数据统计

- **数据量**：累计收录800+条AI资讯
- **更新频率**：每2小时自动更新
- **覆盖范围**：近一个月完整数据
- **分类数量**：6大类别（投融资、开源项目、产品发布、行业动态、技术研究、综合资讯）

## 🌐 在线访问

- **GitHub Pages**：[https://xianyu110.github.io/ai-news-assistant/](https://xianyu110.github.io/ai-news-assistant/)
- **GitHub仓库**：[https://github.com/xianyu110/ai-news-assistant](https://github.com/xianyu110/ai-news-assistant)

## 📝 更新日志

### v2.0.0 (2025-07-08)
- 🎨 重新设计UI，模仿AI工具集风格
- 📰 优化爬虫算法，支持完整页面解析
- 🔧 修复H5版本兼容性问题
- ➖ 移除首页和演示页面，专注核心功能

### v1.0.0 (2025-07-07)
- 🚀 项目初始化
- 📰 基础爬虫功能
- 🤖 GitHub Actions自动化
- 💾 数据持久化方案

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📞 联系我们

如有问题或建议，请通过 GitHub Issues 联系我们。

---

**免责声明**：本项目仅用于学习和研究目的，所有新闻内容均来自公开渠道，版权归原作者所有。