#!/bin/bash

# 简化部署脚本 - 手动步骤指南
# 服务器: 154.12.24.179 (密码: 0eEygeHogL)

echo "🚀 AI新闻助手 - 部署指南"
echo "========================="
echo ""
echo "📋 请按照以下步骤手动部署："
echo ""

echo "1️⃣ 创建部署包..."
cd "/Users/chinamanor/Downloads/cursor编程"

# 创建部署目录
mkdir -p ai-news-deploy/original
mkdir -p ai-news-deploy/react

# 复制原始项目文件（排除node_modules）
echo "📂 复制原始项目文件..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.log' ai-news-assistant/ ai-news-deploy/original/

# 复制React项目文件
echo "📂 复制React项目文件..."
rsync -av --exclude='node_modules' --exclude='dist' --exclude='.git' ai-news-assistant-react/ ai-news-deploy/react/

# 创建tar包
tar -czf ai-news-deploy.tar.gz ai-news-deploy/

echo "✅ 部署包已创建: ai-news-deploy.tar.gz"
echo ""

echo "2️⃣ 上传到服务器..."
echo "执行以下命令（会提示输入密码 0eEygeHogL）："
echo ""
echo "scp ai-news-deploy.tar.gz root@154.12.24.179:/tmp/"
echo ""

echo "3️⃣ 连接服务器并部署..."
echo "执行以下命令连接服务器："
echo ""
echo "ssh root@154.12.24.179"
echo ""

echo "4️⃣ 在服务器上执行以下命令："
cat << 'EOF'

# 解压部署包
cd /tmp
tar -xzf ai-news-deploy.tar.gz

# 创建项目目录
mkdir -p /opt/ai-news-assistant
cd /opt/ai-news-assistant

# 复制文件
cp -r /tmp/ai-news-deploy/original/* ./
mkdir -p frontend
cp -r /tmp/ai-news-deploy/react/* frontend/

# 安装Node.js (如果没有)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 安装依赖
npm install --production

# 安装前端依赖并构建
cd frontend
npm install
npm run build
cd ..

# 安装全局工具
npm install -g pm2 serve

# 启动前端服务
pm2 stop ai-news-frontend || true
pm2 start "serve -s frontend/dist -l 3000" --name ai-news-frontend
pm2 save
pm2 startup

# 设置文件权限
chmod +x scripts/*.js

# 添加定时任务
(crontab -l 2>/dev/null | grep -v daily-email-scheduler; echo "30 8 * * * cd /opt/ai-news-assistant && node scripts/daily-email-scheduler.js") | crontab -

# 测试邮件功能
node scripts/daily-email-scheduler.js --test

# 开放端口
ufw allow 3000 || iptables -A INPUT -p tcp --dport 3000 -j ACCEPT

echo "🎉 部署完成！"
echo "🌐 访问: http://154.12.24.179:3000"

EOF

echo ""
echo "5️⃣ 验证部署..."
echo "✅ 访问 http://154.12.24.179:3000 检查前端"
echo "✅ 检查PM2进程: pm2 list"
echo "✅ 查看日志: pm2 logs ai-news-frontend"
echo "✅ 检查定时任务: crontab -l"
echo ""

echo "📁 部署包位置: $(pwd)/ai-news-deploy.tar.gz"
echo "📋 部署包大小: $(du -h ai-news-deploy.tar.gz | cut -f1)"

# 清理
rm -rf ai-news-deploy/