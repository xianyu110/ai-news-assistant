# 📧 服务器邮件功能测试指南

## 🎯 测试目标
验证服务器上的AI新闻邮件发送功能是否正常工作

## 📋 测试步骤

### 1️⃣ 连接服务器
```bash
ssh root@154.12.24.179
# 密码: 0eEygeHogL
```

### 2️⃣ 进入项目目录
```bash
cd /opt/ai-news-assistant
```

### 3️⃣ 检查必要文件
```bash
# 检查邮件脚本是否存在
ls -la scripts/daily-email-scheduler.js
ls -la scripts/send-email-notification.js
ls -la scripts/test-email-notification.js

# 检查数据文件
ls -la src/data/ai-news.json

# 检查依赖包
npm list nodemailer
```

### 4️⃣ 执行邮件测试

#### 方法1: 使用测试脚本
```bash
node scripts/test-email-notification.js 1002569303@qq.com
```

#### 方法2: 使用调度器测试模式
```bash
node scripts/daily-email-scheduler.js --test
```

#### 方法3: 直接发送邮件给订阅者
```bash
node scripts/send-email-notification.js
```

### 5️⃣ 检查测试结果

#### 查看控制台输出
正常输出应该包含：
```
📧 开始发送邮件通知...
📮 目标邮箱: 1002569303@qq.com
✅ 邮件发送成功!
📧 邮件ID: <邮件ID>
📮 发送到: 1002569303@qq.com
```

#### 查看日志文件
```bash
# 查看邮件日志
cat logs/daily-email.log

# 查看发送记录
cat logs/sent-record.json
```

### 6️⃣ 验证定时任务
```bash
# 查看定时任务列表
crontab -l

# 应该看到类似这样的任务:
# 30 8 * * * cd /opt/ai-news-assistant && node scripts/daily-email-scheduler.js
```

### 7️⃣ 检查邮箱
在 **1002569303@qq.com** 邮箱中查看：
- 收件箱
- 垃圾邮件文件夹
- 邮件主题格式: `🤖 AI资讯助手 - 今日资讯 (2025/07/24)`

## 🔍 故障排除

### 常见问题1: nodemailer模块未找到
```bash
npm install nodemailer
```

### 常见问题2: 邮件发送失败
检查网络连接：
```bash
# 测试SMTP连接
telnet smtp.qq.com 587
```

### 常见问题3: 数据文件不存在
```bash
# 检查数据完整性
ls -la src/data/
cat src/data/ai-news.json | head -20
```

### 常见问题4: 权限问题
```bash
# 设置脚本执行权限
chmod +x scripts/*.js
```

## ✅ 成功标准

邮件测试成功的标志：
1. ✅ 控制台显示 "邮件发送成功!"
2. ✅ 返回有效的邮件ID
3. ✅ 日志文件记录发送时间和状态
4. ✅ 目标邮箱收到邮件（5-10分钟内）

## 📱 测试命令速查

```bash
# 快速测试命令集合
cd /opt/ai-news-assistant

# 测试1: 基础测试
node scripts/daily-email-scheduler.js --test

# 测试2: 检查日志
tail -10 logs/daily-email.log

# 测试3: 查看定时任务
crontab -l

# 测试4: 检查进程
ps aux | grep node

# 测试5: 网络测试
ping smtp.qq.com
```

## 🎉 预期结果

成功测试后，您应该能看到：
- 📧 控制台确认邮件发送成功
- 📝 日志文件记录详细信息
- 📱 邮箱收到包含AI新闻的HTML格式邮件
- ⏰ 定时任务准备在每天8:30执行