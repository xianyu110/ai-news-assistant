#!/bin/bash

# AI新闻助手 Docker部署脚本
# 服务器: 154.12.24.179

set -e

echo "🐳 AI新闻助手 - Docker部署"
echo "=========================="

SERVER_HOST="154.12.24.179"
SERVER_USER="root"
SERVER_PASS="0eEygeHogL"
PROJECT_NAME="ai-news-assistant"

# 创建本地部署包
echo "📦 创建Docker部署包..."
cd "/Users/chinamanor/Downloads/cursor编程"

# 创建临时目录
mkdir -p docker-deploy
cd docker-deploy

# 复制AI新闻助手项目
cp -r ../ai-news-assistant ./
cp -r ../ai-news-assistant-react ./ai-news-assistant/frontend-src

# 修复Dockerfile中的路径
cd ai-news-assistant
sed -i '' 's|../ai-news-assistant-react/|./frontend-src/|g' Dockerfile

# 创建部署tar包
cd ..
tar -czf ai-news-docker-deploy.tar.gz ai-news-assistant/

echo "✅ 部署包创建完成: ai-news-docker-deploy.tar.gz"

# 上传到服务器的函数
upload_and_deploy() {
    cat << 'EOF' > /tmp/docker_deploy.exp
#!/usr/bin/expect -f
set timeout 120
set password "0eEygeHogL"

# 上传部署包
puts "📤 上传Docker部署包..."
spawn scp ai-news-docker-deploy.tar.gz root@154.12.24.179:/tmp/
expect {
    "Enter passphrase for key" {
        send "\r"
        exp_continue
    }
    "password:" {
        send "$password\r"
        exp_continue
    }
    eof
}

# 连接服务器并部署
puts "🔗 连接服务器开始Docker部署..."
spawn ssh root@154.12.24.179
expect {
    "Enter passphrase for key" {
        send "\r"
        exp_continue
    }
    "password:" {
        send "$password\r"
        exp_continue
    }
    "$" {
        # 安装Docker（如果需要）
        send "which docker || curl -fsSL https://get.docker.com | sh\r"
        expect "$"
        
        send "which docker-compose || curl -L \"https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose\r"
        expect "$"
        
        # 启动Docker服务
        send "systemctl start docker\r"
        expect "$"
        
        send "systemctl enable docker\r"
        expect "$"
        
        # 解压项目
        send "cd /tmp && tar -xzf ai-news-docker-deploy.tar.gz\r"
        expect "$"
        
        # 移动到部署目录
        send "rm -rf /opt/ai-news-assistant\r"
        expect "$"
        
        send "mv ai-news-assistant /opt/\r"
        expect "$"
        
        send "cd /opt/ai-news-assistant\r"
        expect "$"
        
        # 停止现有容器
        send "docker-compose down || true\r"
        expect "$"
        
        # 构建并启动
        send "docker-compose build\r"
        expect "$"
        
        send "docker-compose up -d\r"
        expect "$"
        
        # 检查状态
        send "docker-compose ps\r"
        expect "$"
        
        send "docker-compose logs --tail=20\r"
        expect "$"
        
        # 测试访问
        send "sleep 10\r"
        expect "$"
        
        send "curl -I http://localhost:8888\r"
        expect "$"
        
        send "echo '🎉 Docker部署完成！'\r"
        expect "$"
        
        send "echo '🌐 访问地址: http://154.12.24.179:8888'\r"
        expect "$"
        
        send "echo '📧 邮件服务: 每日8:30自动发送'\r"
        expect "$"
        
        send "exit\r"
    }
}

puts "✅ Docker部署完成"
EOF

    chmod +x /tmp/docker_deploy.exp
    /tmp/docker_deploy.exp
}

# 执行部署
upload_and_deploy

echo ""
echo "🎉 Docker部署完成！"
echo "================================"
echo "🌐 访问地址: http://154.12.24.179:8888"
echo "📧 邮件服务: 每日8:30自动发送到 1002569303@qq.com"
echo ""
echo "🔧 管理命令:"
echo "  查看容器状态: docker-compose ps"
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo ""
echo "📝 如需手动连接服务器:"
echo "  ssh root@154.12.24.179"
echo "  cd /opt/ai-news-assistant"