#!/bin/bash

# AI新闻助手快速部署脚本
# 服务器: 154.12.24.179 (密码: 0eEygeHogL)

set -e

SERVER_HOST="154.12.24.179"
SERVER_USER="root"
SERVER_PASS="0eEygeHogL"
SERVER_PATH="/opt/ai-news-assistant"

echo "🚀 AI新闻助手 - 快速部署到 $SERVER_HOST"
echo "=========================================="

# 创建期望脚本来自动输入密码
expect_script() {
    cat << 'EOF'
#!/usr/bin/expect -f
set timeout 30
set host [lindex $argv 0]
set user [lindex $argv 1]
set pass [lindex $argv 2]
set cmd [lindex $argv 3]

spawn ssh $user@$host $cmd
expect {
    "password:" {
        send "$pass\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF
}

# 创建临时expect脚本
EXPECT_SCRIPT="/tmp/ssh_expect.exp"
expect_script > "$EXPECT_SCRIPT"
chmod +x "$EXPECT_SCRIPT"

# 函数：执行远程命令
remote_exec() {
    echo "🔄 执行: $1"
    "$EXPECT_SCRIPT" "$SERVER_HOST" "$SERVER_USER" "$SERVER_PASS" "$1"
}

echo "1️⃣ 测试服务器连接..."
remote_exec "echo '连接成功' && hostname && whoami"

echo "2️⃣ 创建项目目录..."
remote_exec "mkdir -p $SERVER_PATH && mkdir -p $SERVER_PATH/logs"

echo "3️⃣ 检查Node.js环境..."
remote_exec "node --version && npm --version" || {
    echo "📦 安装Node.js..."
    remote_exec "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
    remote_exec "apt-get install -y nodejs"
}

echo "4️⃣ 准备上传文件..."
# 创建部署压缩包
cd "/Users/chinamanor/Downloads/cursor编程"
tar -czf ai-news-assistant-deploy.tar.gz \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="dist" \
    ai-news-assistant/ ai-news-assistant-react/

echo "5️⃣ 上传项目文件..."
# 使用expect脚本上传文件
cat << 'EOF' > /tmp/scp_expect.exp
#!/usr/bin/expect -f
set timeout 60
set file [lindex $argv 0]
set host [lindex $argv 1]
set user [lindex $argv 2]
set pass [lindex $argv 3]
set dest [lindex $argv 4]

spawn scp $file $user@$host:$dest
expect {
    "password:" {
        send "$pass\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF

chmod +x /tmp/scp_expect.exp
/tmp/scp_expect.exp "ai-news-assistant-deploy.tar.gz" "$SERVER_HOST" "$SERVER_USER" "$SERVER_PASS" "/tmp/"

echo "6️⃣ 解压和部署..."
remote_exec "cd /tmp && tar -xzf ai-news-assistant-deploy.tar.gz"
remote_exec "cp -r /tmp/ai-news-assistant/* $SERVER_PATH/"
remote_exec "mkdir -p $SERVER_PATH/frontend && cp -r /tmp/ai-news-assistant-react/* $SERVER_PATH/frontend/"

echo "7️⃣ 安装依赖..."
remote_exec "cd $SERVER_PATH && npm install --production"
remote_exec "cd $SERVER_PATH/frontend && npm install"

echo "8️⃣ 构建前端..."
remote_exec "cd $SERVER_PATH/frontend && npm run build"

echo "9️⃣ 安装全局依赖..."
remote_exec "npm install -g pm2 serve"

echo "🔟 启动前端服务..."
remote_exec "cd $SERVER_PATH && pm2 stop ai-news-frontend || true"
remote_exec "cd $SERVER_PATH && pm2 start 'serve -s frontend/dist -l 3000' --name ai-news-frontend"
remote_exec "pm2 save"

echo "1️⃣1️⃣ 设置定时任务..."
remote_exec "chmod +x $SERVER_PATH/scripts/*.js"
remote_exec "(crontab -l 2>/dev/null | grep -v daily-email-scheduler; echo '30 8 * * * cd $SERVER_PATH && node scripts/daily-email-scheduler.js') | crontab -"

echo "1️⃣2️⃣ 测试邮件功能..."
remote_exec "cd $SERVER_PATH && node scripts/daily-email-scheduler.js --test"

echo "1️⃣3️⃣ 配置防火墙..."
remote_exec "ufw allow 3000 || iptables -A INPUT -p tcp --dport 3000 -j ACCEPT || echo '防火墙已配置或需要手动配置'"

# 清理临时文件
rm -f "$EXPECT_SCRIPT" /tmp/scp_expect.exp ai-news-assistant-deploy.tar.gz

echo ""
echo "🎉 部署完成！"
echo "================================"
echo "🌐 访问地址: http://$SERVER_HOST:3000"
echo "📧 邮件服务: 每天8:30自动发送到 1002569303@qq.com"
echo "📊 进程状态: pm2 list"
echo "📝 查看日志: pm2 logs ai-news-frontend"
echo ""
echo "🔧 管理命令 (在服务器上执行):"
echo "   重启前端: pm2 restart ai-news-frontend"
echo "   查看定时任务: crontab -l"
echo "   测试邮件: cd $SERVER_PATH && node scripts/daily-email-scheduler.js --test"