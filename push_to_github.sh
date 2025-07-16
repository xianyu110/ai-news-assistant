#!/bin/bash

echo "🚀 推送AI新闻助手优化代码到GitHub..."
echo "📝 提交记录:"
git log --oneline -3

echo ""
echo "🔄 开始推送..."

# 尝试推送
if git push origin main; then
    echo "✅ 推送成功！"
    echo "🌐 访问链接: https://github.com/xianyu110/ai-news-assistant"
    echo "📱 在线预览: https://xianyu110.github.io/ai-news-assistant/"
else
    echo "❌ 推送失败，请检查网络连接"
    echo "💡 可以尝试："
    echo "   1. 检查网络连接"
    echo "   2. 使用VPN或代理"
    echo "   3. 使用GitHub Desktop"
    echo "   4. 稍后重试"
fi

echo ""
echo "📊 当前代码状态:"
git status --porcelain
echo "🏠 本地分支: $(git branch --show-current)"
echo "🌐 远程分支: $(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo '未同步')" 