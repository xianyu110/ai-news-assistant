#!/bin/bash

# AI新闻助手服务器部署脚本
# 目标服务器: 154.12.24.179

set -e

# 配置变量
SERVER_HOST="154.12.24.179"
SERVER_USER="root"
SERVER_PATH="/opt/ai-news-assistant"
LOCAL_PROJECT_PATH="/Users/chinamanor/Downloads/cursor编程/ai-news-assistant"
LOCAL_REACT_PATH="/Users/chinamanor/Downloads/cursor编程/ai-news-assistant-react"

echo "🚀 AI新闻助手 - 服务器部署"
echo "================================"
echo "🖥️  目标服务器: $SERVER_HOST"
echo "📁 部署路径: $SERVER_PATH"
echo ""

# 函数：执行远程命令
remote_exec() {
    echo "🔄 执行: $1"
    ssh "$SERVER_USER@$SERVER_HOST" "$1"
}

# 函数：上传文件
upload_files() {
    local src="$1"
    local dest="$2"
    echo "📤 上传: $src -> $dest"
    rsync -avz --progress --delete "$src" "$SERVER_USER@$SERVER_HOST:$dest"
}

echo "1️⃣ 检查服务器连接..."
if ! ssh "$SERVER_USER@$SERVER_HOST" "echo '服务器连接成功'"; then
    echo "❌ 无法连接到服务器，请检查SSH配置"
    exit 1
fi

echo "2️⃣ 检查服务器环境..."
remote_exec "node --version && npm --version" || {
    echo "📦 安装 Node.js 和 npm..."
    remote_exec "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    remote_exec "apt-get install -y nodejs"
}

echo "3️⃣ 创建部署目录..."
remote_exec "mkdir -p $SERVER_PATH"
remote_exec "mkdir -p $SERVER_PATH/logs"
remote_exec "mkdir -p $SERVER_PATH/public/data"

echo "4️⃣ 上传项目文件..."

# 上传原始项目（AI新闻数据和邮件脚本）
upload_files "$LOCAL_PROJECT_PATH/src/" "$SERVER_PATH/src/"
upload_files "$LOCAL_PROJECT_PATH/scripts/" "$SERVER_PATH/scripts/"
upload_files "$LOCAL_PROJECT_PATH/public/" "$SERVER_PATH/public/"
upload_files "$LOCAL_PROJECT_PATH/package.json" "$SERVER_PATH/"

# 上传React项目
upload_files "$LOCAL_REACT_PATH/src/" "$SERVER_PATH/frontend/src/"
upload_files "$LOCAL_REACT_PATH/public/" "$SERVER_PATH/frontend/public/"
upload_files "$LOCAL_REACT_PATH/package.json" "$SERVER_PATH/frontend/"
upload_files "$LOCAL_REACT_PATH/vite.config.ts" "$SERVER_PATH/frontend/"
upload_files "$LOCAL_REACT_PATH/tailwind.config.js" "$SERVER_PATH/frontend/"
upload_files "$LOCAL_REACT_PATH/tsconfig.json" "$SERVER_PATH/frontend/"
upload_files "$LOCAL_REACT_PATH/index.html" "$SERVER_PATH/frontend/"

echo "5️⃣ 安装依赖..."
remote_exec "cd $SERVER_PATH && npm install"
remote_exec "cd $SERVER_PATH/frontend && npm install"

echo "6️⃣ 构建前端项目..."
remote_exec "cd $SERVER_PATH/frontend && npm run build"

echo "7️⃣ 设置文件权限..."
remote_exec "chmod +x $SERVER_PATH/scripts/*.js"
remote_exec "chmod +x $SERVER_PATH/scripts/*.sh"

echo "8️⃣ 安装 PM2 进程管理器..."
remote_exec "npm install -g pm2" || echo "PM2 可能已安装"

echo "9️⃣ 创建 PM2 配置文件..."
ssh "$SERVER_USER@$SERVER_HOST" "cat > $SERVER_PATH/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'ai-news-frontend',
      script: 'npx',
      args: 'serve -s frontend/dist -l 3000',
      cwd: '$SERVER_PATH',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF"

echo "🔟 部署前端应用..."
remote_exec "cd $SERVER_PATH && pm2 start ecosystem.config.js"
remote_exec "pm2 save"
remote_exec "pm2 startup" || echo "PM2 startup 已配置"

echo "1️⃣1️⃣ 设置定时任务..."
remote_exec "cd $SERVER_PATH && node scripts/daily-email-scheduler.js --test" || echo "邮件测试失败，请检查配置"

# 添加cron任务
ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
# 检查是否已有相关cron任务
if ! crontab -l 2>/dev/null | grep -q "daily-email-scheduler.js"; then
    echo "添加每日邮件定时任务..."
    (crontab -l 2>/dev/null; echo "30 8 * * * cd /opt/ai-news-assistant && /usr/bin/node scripts/daily-email-scheduler.js") | crontab -
    echo "定时任务已添加"
else
    echo "定时任务已存在"
fi
EOF

echo "1️⃣2️⃣ 配置防火墙..."
remote_exec "ufw allow 3000 || iptables -A INPUT -p tcp --dport 3000 -j ACCEPT || echo '防火墙配置可能需要手动处理'"

echo ""
echo "🎉 部署完成！"
echo "================================"
echo "🌐 前端访问地址: http://$SERVER_HOST:3000"
echo "📧 邮件服务: 每日8:30自动发送"
echo "📋 进程管理: pm2 list"
echo "📊 查看日志: pm2 logs ai-news-frontend"
echo "🔄 重启应用: pm2 restart ai-news-frontend"
echo ""
echo "📝 重要文件位置:"
echo "   项目目录: $SERVER_PATH"
echo "   日志文件: $SERVER_PATH/logs/"
echo "   配置文件: $SERVER_PATH/ecosystem.config.js"
echo ""
echo "🔧 后续操作:"
echo "1. 访问 http://$SERVER_HOST:3000 检查前端是否正常"
echo "2. 检查邮件定时任务: ssh $SERVER_USER@$SERVER_HOST 'crontab -l'"
echo "3. 测试邮件发送: ssh $SERVER_USER@$SERVER_HOST 'cd $SERVER_PATH && node scripts/daily-email-scheduler.js --test'"