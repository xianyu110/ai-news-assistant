# 🐳 Docker部署指南

## 📋 准备工作

Docker部署包已创建：`docker-deploy/ai-news-docker-deploy.tar.gz`

## 🚀 手动部署步骤

### 1. 上传部署包到服务器

```bash
# 本地执行（如果需要）
scp docker-deploy/ai-news-docker-deploy.tar.gz root@154.12.24.179:/tmp/
```

### 2. 连接服务器

```bash
ssh root@154.12.24.179
# 密码: 0eEygeHogL
```

### 3. 安装Docker和Docker Compose（如果未安装）

```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 启动Docker服务
systemctl start docker
systemctl enable docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 4. 部署项目

```bash
# 解压部署包
cd /tmp
tar -xzf ai-news-docker-deploy.tar.gz

# 移动到部署目录
rm -rf /opt/ai-news-assistant
mv ai-news-assistant /opt/
cd /opt/ai-news-assistant

# 查看项目结构
ls -la
```

### 5. 构建并启动容器

```bash
# 构建Docker镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 6. 验证部署

```bash
# 检查容器状态
docker ps

# 测试前端访问
curl -I http://localhost:8888

# 测试邮件功能（进入容器）
docker-compose exec ai-news-assistant node scripts/daily-email-scheduler.js --test
```

## 🔧 管理命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f ai-news-assistant

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新服务
docker-compose down
docker-compose build
docker-compose up -d
```

## 📊 预期结果

### 成功运行的容器
```bash
$ docker-compose ps
       Name                     Command               State           Ports         
-----------------------------------------------------------------------------------
ai-news-assistant   docker-entrypoint.sh             Up      0.0.0.0:8888->8888/tcp
```

### 成功的健康检查
```bash
$ docker-compose logs ai-news-assistant
✅ 容器启动完成
🌐 前端访问: http://localhost:8888
📧 邮件服务: 每日8:30自动发送
```

### 成功的前端访问
```bash
$ curl -I http://localhost:8888
HTTP/1.1 200 OK
```

## 🌐 访问地址

- **前端应用**: http://154.12.24.179:8888
- **邮件服务**: 每日8:30自动发送到 1002569303@qq.com

## 🐛 故障排除

### 容器无法启动
```bash
# 查看详细日志
docker-compose logs ai-news-assistant

# 检查端口占用
netstat -tlnp | grep 8888

# 重新构建
docker-compose build --no-cache
```

### 邮件发送失败
```bash
# 进入容器测试
docker-compose exec ai-news-assistant sh
cd /app
node scripts/daily-email-scheduler.js --test
```

### 前端无法访问
```bash
# 检查容器网络
docker network ls
docker network inspect ai-news-assistant_ai-news-network

# 检查防火墙
ufw status
iptables -L
```

## 📝 Docker文件说明

- **Dockerfile**: 定义容器构建过程
- **docker-compose.yml**: 定义服务配置
- **docker-entrypoint.sh**: 容器启动脚本
- **.dockerignore**: 忽略不必要的文件

## 🔄 数据持久化

容器使用数据卷来持久化重要数据：
- `./logs:/app/logs` - 日志文件
- `./src/data:/app/src/data` - 新闻数据

即使容器重启，这些数据也会保留。