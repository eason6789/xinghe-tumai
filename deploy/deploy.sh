#!/bin/bash

# 星河图脉 部署脚本
# 使用前请确保已配置 SSH 密钥认证：
#   export REMOTE_HOST=root@your_server_ip
#   ssh-copy-id $REMOTE_HOST
#
# 需要设置环境变量 DEEPSEEK_API_KEY 用于大模型解读

set -e

echo "🚀 开始部署 星河图脉..."

REMOTE_HOST="${REMOTE_HOST:-root@your_server_ip}"
REMOTE_PORT="${REMOTE_PORT:-22}"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_DIR="/www/server/xinghe-tumai"
REMOTE_WWW_DIR="/www/wwwroot/xinghe-tumai"

echo "📦 构建项目..."
cd "$LOCAL_DIR"
npm run build

echo "📦 同步服务端代码..."
ssh -o StrictHostKeyChecking=no -p $REMOTE_PORT $REMOTE_HOST "mkdir -p $REMOTE_DIR"
scp -o StrictHostKeyChecking=no -P $REMOTE_PORT \
  "$LOCAL_DIR/server.js" \
  "$LOCAL_DIR/package.json" \
  "$LOCAL_DIR/package-lock.json" \
  $REMOTE_HOST:$REMOTE_DIR/

echo "📦 同步前端静态文件..."
ssh -o StrictHostKeyChecking=no -p $REMOTE_PORT $REMOTE_HOST "mkdir -p $REMOTE_WWW_DIR"
scp -o StrictHostKeyChecking=no -P $REMOTE_PORT -r "$LOCAL_DIR/dist/"* $REMOTE_HOST:$REMOTE_WWW_DIR/

echo "📦 上传Nginx配置..."
scp -o StrictHostKeyChecking=no -P $REMOTE_PORT "$LOCAL_DIR/deploy/nginx.conf" $REMOTE_HOST:/tmp/xinghe-tumai.conf

echo "⚙️ 配置服务..."
ssh -o StrictHostKeyChecking=no -p $REMOTE_PORT $REMOTE_HOST << ENDSSH
    set -e

    # 复制nginx配置
    cp /tmp/xinghe-tumai.conf /etc/nginx/conf.d/xinghe-tumai.conf

    # 安装Node依赖 (production only)
    cd $REMOTE_DIR
    npm install --omit=dev --silent

    # 停止旧进程
    if [ -f /tmp/xinghe-tumai.pid ]; then
        kill \$(cat /tmp/xinghe-tumai.pid) 2>/dev/null || true
        sleep 1
    fi

    # 检查端口
    if lsof -i:3000 > /dev/null 2>&1; then
        echo "端口3000已被占用，停止旧进程..."
        kill \$(lsof -t -i:3000) 2>/dev/null || true
        sleep 1
    fi

    # 设置环境变量并启动服务
    export DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-}"
    export PORT=3000
    nohup node $REMOTE_DIR/server.js > /var/log/xinghe-tumai.log 2>&1 &
    echo \$! > /tmp/xinghe-tumai.pid
    echo "服务已启动，PID: \$!"

    sleep 2

    # 检查服务状态
    if curl -s http://localhost:3000/ > /dev/null; then
        echo "✅ 服务运行正常"
    else
        echo "❌ 服务启动失败，查看日志: tail -f /var/log/xinghe-tumai.log"
    fi

    # 重载nginx
    nginx -t && nginx -s reload
    echo "✅ Nginx配置已重载"
ENDSSH

echo ""
echo "🎉 部署完成!"
echo "访问地址: http://${REMOTE_HOST#*@}"
echo "日志: tail -f /var/log/xinghe-tumai.log"
echo ""
echo "⚠️  请确保在服务器上设置了 DEEPSEEK_API_KEY 环境变量"
echo "   export DEEPSEEK_API_KEY=sk-your-key"
