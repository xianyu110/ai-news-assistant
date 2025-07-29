# 🔍 服务器部署验证指南

## ❗ 重要提醒
由于自动化脚本可能存在问题，请手动执行以下步骤来验证部署状态。

## 📋 手动验证步骤

### 1. 连接服务器
```bash
ssh root@154.12.24.179
```
**密码**: `0eEygeHogL`

### 2. 检查基本信息
```bash
# 确认登录成功
whoami && hostname && pwd

# 检查系统环境
node --version
npm --version
```

### 3. 检查项目目录
```bash
# 检查 /opt 目录
ls -la /opt/

# 尝试进入项目目录
cd /opt/ai-news-assistant
```

**如果提示目录不存在**，执行以下命令查找文件：
```bash
# 查找所有相关文件
find / -name "*ai-news*" 2>/dev/null

# 检查临时目录
ls -la /tmp/ | grep ai-news

# 检查是否在其他位置
find /root -name "*ai-news*" 2>/dev/null
find /home -name "*ai-news*" 2>/dev/null
```

### 4. 如果目录存在，检查内容
```bash
cd /opt/ai-news-assistant

# 检查项目结构
ls -la

# 检查关键文件
ls -la scripts/
ls -la src/data/
ls -la frontend/

# 检查数据文件
head -10 src/data/ai-news.json 2>/dev/null || echo "数据文件不存在"
```

### 5. 测试邮件功能（如果文件存在）
```bash
# 测试邮件脚本
node scripts/daily-email-scheduler.js --test

# 或者使用测试脚本
node scripts/test-email-notification.js 1002569303@qq.com
```

### 6. 检查定时任务
```bash
crontab -l
```

### 7. 检查运行的服务
```bash
ps aux | grep -E "(python|node|serve)" | grep -v grep
netstat -tlnp | grep :8888
```

## 🚨 如果项目目录不存在

这意味着部署失败，需要重新手动部署：

### 重新部署步骤

1. **创建目录**：
```bash
mkdir -p /opt/ai-news-assistant
cd /opt/ai-news-assistant
```

2. **检查部署包**：
```bash
ls -la /tmp/ | grep ai-news-deploy
```

3. **如果部署包存在，解压**：
```bash
cd /tmp
tar -xzf ai-news-deploy.tar.gz
cp -r ai-news-deploy/original/* /opt/ai-news-assistant/
mkdir -p /opt/ai-news-assistant/frontend
cp -r ai-news-deploy/react/* /opt/ai-news-assistant/frontend/
```

4. **安装依赖**：
```bash
cd /opt/ai-news-assistant
npm install
cd frontend
npm install
npm run build
cd ..
```

5. **设置权限**：
```bash
chmod +x scripts/*.js
```

6. **测试邮件**：
```bash
node scripts/daily-email-scheduler.js --test
```

## 📊 预期结果

### 成功的目录结构应该是：
```
/opt/ai-news-assistant/
├── src/
│   └── data/
│       └── ai-news.json
├── scripts/
│   ├── daily-email-scheduler.js
│   ├── send-email-notification.js
│   └── test-email-notification.js
├── frontend/
│   ├── dist/
│   └── package.json
├── package.json
└── logs/
```

### 成功的邮件测试输出：
```
🧪 测试模式: 强制发送邮件
📂 成功读取 XX 条新闻数据
📧 开始发送邮件通知...
📮 目标邮箱: 1002569303@qq.com
✅ 邮件发送成功!
📧 邮件ID: <邮件ID>
```

## 💡 故障排除

如果遇到问题：

1. **Node.js 未安装**：
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

2. **依赖缺失**：
```bash
npm install nodemailer
```

3. **权限问题**：
```bash
chmod +x scripts/*.js
chown -R root:root /opt/ai-news-assistant
```

请按照以上步骤逐一验证，并告诉我实际的执行结果！