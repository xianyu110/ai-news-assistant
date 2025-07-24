#!/bin/bash

# AI新闻助手 - GitHub Pages部署脚本

set -e

echo "🚀 AI新闻助手 - GitHub Pages部署"
echo "================================="

PROJECT_DIR="/Users/chinamanor/Downloads/cursor编程/ai-news-assistant-react"
REPO_NAME="ai-news-assistant-react"

cd "$PROJECT_DIR"

echo "📋 检查项目状态..."
echo "当前目录: $(pwd)"
echo "项目文件:"
ls -la

echo ""
echo "🔧 构建测试..."
# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 构建项目
echo "🏗️ 构建项目..."
npm run build

echo "✅ 构建成功！"
echo ""

# 检查构建产物
echo "📁 构建产物:"
ls -la dist/

echo ""
echo "🔗 Git配置..."

# 初始化Git（如果还没有）
if [ ! -d ".git" ]; then
    echo "初始化Git仓库..."
    git init
    git branch -M main
fi

# 添加所有文件
git add .

# 检查是否有更改
if git diff --staged --quiet; then
    echo "⚠️ 没有文件更改，跳过提交"
else
    echo "📝 提交更改..."
    git commit -m "Deploy: Update AI News Assistant for GitHub Pages

    - 添加GitHub Actions自动部署
    - 配置Vite.js生产环境路径
    - 集成每日邮件发送功能
    - 更新真实AI新闻数据
    
    Features:
    ✅ 响应式React应用
    ✅ AI新闻展示和筛选
    ✅ PWA支持
    ✅ 暗色模式
    ✅ 自动化邮件推送
    "
fi

echo ""
echo "📋 部署指南:"
echo "============"
echo ""
echo "1️⃣ 创建GitHub仓库:"
echo "   - 访问 https://github.com/new"
echo "   - 仓库名: $REPO_NAME"
echo "   - 设为公开仓库"
echo ""
echo "2️⃣ 推送代码:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
echo "   git push -u origin main"
echo ""
echo "3️⃣ 启用GitHub Pages:"
echo "   - 仓库 Settings → Pages"
echo "   - Source: GitHub Actions"
echo ""
echo "4️⃣ 配置邮件密钥 (可选):"
echo "   - 仓库 Settings → Secrets and variables → Actions"
echo "   - 添加 EMAIL_PASSWORD: regtopndvdricidf"
echo ""
echo "5️⃣ 访问网站:"
echo "   https://YOUR_USERNAME.github.io/$REPO_NAME/"
echo ""

# 如果用户想要立即推送
read -p "🔄 是否现在推送到GitHub? (需要先创建仓库) [y/N]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "请输入您的GitHub用户名: " GITHUB_USERNAME
    
    if [ -n "$GITHUB_USERNAME" ]; then
        echo "🚀 推送到GitHub..."
        
        # 添加远程仓库
        git remote remove origin 2>/dev/null || true
        git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        
        # 推送代码
        echo "📤 推送代码..."
        git push -u origin main
        
        echo ""
        echo "🎉 部署完成！"
        echo "================================="
        echo "🌐 网站地址: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
        echo "📧 邮件服务: 每日8:30自动发送"
        echo "🔧 管理地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
        echo ""
        echo "⏰ 请等待2-3分钟让GitHub Pages构建完成"
        echo "📱 如需配置邮件服务，请在仓库设置中添加EMAIL_PASSWORD密钥"
    else
        echo "❌ 用户名不能为空"
    fi
else
    echo "📝 请手动按照上述指南完成部署"
fi

echo ""
echo "✅ 脚本执行完成！"