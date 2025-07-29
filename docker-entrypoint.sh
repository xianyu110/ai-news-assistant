#!/bin/sh

echo "🚀 启动AI新闻助手容器..."

# 设置时区
export TZ=Asia/Shanghai

# 创建日志目录
mkdir -p /app/logs

# 测试邮件功能
echo "📧 测试邮件功能..."
cd /app
node scripts/daily-email-scheduler.js --test

# 启动前端服务
echo "🌐 启动前端服务..."
cd /app/frontend/dist
serve -s . -l 8888 &

# 设置定时任务（每天8:30发送邮件）
echo "⏰ 设置定时任务..."
echo "30 8 * * * cd /app && node scripts/daily-email-scheduler.js" > /tmp/crontab.txt
crontab /tmp/crontab.txt

# 启动cron服务
crond -f &

# 保持容器运行
echo "✅ 容器启动完成"
echo "🌐 前端访问: http://localhost:8888"
echo "📧 邮件服务: 每日8:30自动发送"

# 等待前台进程
wait