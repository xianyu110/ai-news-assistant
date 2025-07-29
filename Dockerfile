# AI新闻助手 Docker镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    tzdata \
    && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 复制package.json文件
COPY package*.json ./

# 安装Node.js依赖
RUN npm install --production

# 确保安装nodemailer
RUN npm install nodemailer

# 复制项目文件
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY public/ ./public/

# 复制前端项目
COPY frontend-src/package*.json ./frontend/
COPY frontend-src/src/ ./frontend/src/
COPY frontend-src/public/ ./frontend/public/
COPY frontend-src/*.json ./frontend/
COPY frontend-src/*.js ./frontend/
COPY frontend-src/*.ts ./frontend/
COPY frontend-src/index.html ./frontend/

# 安装前端依赖并构建
WORKDIR /app/frontend
RUN npm install && npm run build

# 回到主目录
WORKDIR /app

# 创建日志目录
RUN mkdir -p logs

# 设置脚本权限
RUN chmod +x scripts/*.js

# 安装全局工具
RUN npm install -g serve pm2

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8888/ || exit 1

# 暴露端口
EXPOSE 8888

# 启动脚本
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]