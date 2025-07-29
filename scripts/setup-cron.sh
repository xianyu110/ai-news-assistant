#!/bin/bash

# AI新闻助手 - 每日邮件定时任务设置脚本
# 每天8:30发送AI新闻到指定邮箱

# 获取脚本绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCHEDULER_SCRIPT="$SCRIPT_DIR/daily-email-scheduler.js"

# 检查调度脚本是否存在
if [ ! -f "$SCHEDULER_SCRIPT" ]; then
    echo "❌ 错误: 调度脚本不存在: $SCHEDULER_SCRIPT"
    exit 1
fi

# cron 任务内容 (每天8:30执行)
CRON_JOB="30 8 * * * cd $PROJECT_DIR && /usr/bin/node $SCHEDULER_SCRIPT"

echo "🚀 AI新闻助手 - 定时任务设置"
echo "=================================="
echo "📍 项目目录: $PROJECT_DIR"
echo "📋 调度脚本: $SCHEDULER_SCRIPT"
echo "⏰ 执行时间: 每天 8:30"
echo "📧 发送邮箱: 1002569303@qq.com"
echo ""

# 检查当前是否已有相关的 cron 任务
echo "🔍 检查现有的 cron 任务..."
EXISTING_CRON=$(crontab -l 2>/dev/null | grep "daily-email-scheduler.js" || true)

if [ -n "$EXISTING_CRON" ]; then
    echo "⚠️  发现已存在的相关任务:"
    echo "$EXISTING_CRON"
    echo ""
    read -p "是否要替换现有任务? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 取消设置"
        exit 0
    fi
    
    # 删除现有任务
    echo "🗑️  删除现有任务..."
    crontab -l 2>/dev/null | grep -v "daily-email-scheduler.js" | crontab -
fi

# 添加新的 cron 任务
echo "➕ 添加新的 cron 任务..."
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

# 验证任务是否添加成功
echo "✅ 验证 cron 任务..."
ADDED_CRON=$(crontab -l 2>/dev/null | grep "daily-email-scheduler.js" || true)

if [ -n "$ADDED_CRON" ]; then
    echo "🎉 定时任务设置成功!"
    echo "📋 任务内容: $ADDED_CRON"
    echo ""
    echo "📌 重要说明:"
    echo "1. 系统将在每天 8:30 自动发送AI新闻邮件"
    echo "2. 日志文件: $PROJECT_DIR/logs/daily-email.log"
    echo "3. 发送记录: $PROJECT_DIR/logs/sent-record.json"
    echo "4. 如需停止定时任务，请运行: crontab -e 然后删除相关行"
    echo ""
    echo "🧪 测试命令:"
    echo "   node $SCHEDULER_SCRIPT --test"
    echo ""
    echo "📋 查看当前所有定时任务:"
    echo "   crontab -l"
else
    echo "❌ 定时任务设置失败"
    exit 1
fi

# 创建日志目录
LOG_DIR="$PROJECT_DIR/logs"
if [ ! -d "$LOG_DIR" ]; then
    echo "📁 创建日志目录: $LOG_DIR"
    mkdir -p "$LOG_DIR"
fi

# 确保脚本有执行权限
chmod +x "$SCHEDULER_SCRIPT"

echo "🔔 提示: 如果需要立即测试发送，请运行:"
echo "   node $SCHEDULER_SCRIPT --test"