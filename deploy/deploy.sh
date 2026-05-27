#!/bin/bash

# 星河图脉 部署脚本
# 部署到 tuteng3.site/xinghe-tumai/
#
# 使用前设置环境变量：
#   export REMOTE_HOST=root@your_server_ip
#   export MINIMAX_API_KEY=sk-your-key
#
# 首次需配置 SSH：
#   ssh-copy-id $REMOTE_HOST

set -e

echo "🚀 开始部署 星河图脉..."

REMOTE_HOST="${REMOTE_HOST:-root@your_server_ip}"
REMOTE_PORT="${REMOTE_PORT:-22}"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_SERVER_DIR="/www/server/xinghe-tumai"
REMOTE_WWW_DIR="/var/www/landingpage/xinghe-tumai"

echo "📦 构建项目..."
cd "$LOCAL_DIR"
npm run build

echo "📦 同步服务端代码..."
ssh -o StrictHostKeyChecking=no -p $REMOTE_PORT $REMOTE_HOST "mkdir -p $REMOTE_SERVER_DIR"
scp -o StrictHostKeyChecking=no -P $REMOTE_PORT \
  "$LOCAL_DIR/server.js" \
  "$LOCAL_DIR/package.json" \
  "$LOCAL_DIR/package-lock.json" \
  $REMOTE_HOST:$REMOTE_SERVER_DIR/

echo "📦 同步前端静态文件..."
ssh -o StrictHostKeyChecking=no -p $REMOTE_PORT $REMOTE_HOST "mkdir -p $REMOTE_WWW_DIR"
scp -o StrictHostKeyChecking=no -P $REMOTE_PORT -r "$LOCAL_DIR/dist/"* $REMOTE_HOST:$REMOTE_WWW_DIR/

echo "📦 更新Nginx配置..."
# 先上传配置片段
scp -o StrictHostKeyChecking=no -P $REMOTE_PORT "$LOCAL_DIR/deploy/nginx.conf" $REMOTE_HOST:/tmp/xinghe-tumai-nginx.conf

echo "⚙️ 配置服务..."
ssh -o StrictHostKeyChecking=no -p $REMOTE_PORT $REMOTE_HOST << ENDSSH
    set -e

    # 安装Node依赖 (production only)
    cd $REMOTE_SERVER_DIR
    npm install --omit=dev --silent

    # 使用 PM2 重启/启动服务
    export MINIMAX_API_KEY="${MINIMAX_API_KEY:-}"
    if pm2 list 2>/dev/null | grep -q "xinghe-tumai"; then
        echo "重启现有 xinghe-tumai 服务..."
        MINIMAX_API_KEY="${MINIMAX_API_KEY}" PORT=3001 pm2 restart xinghe-tumai
    else
        echo "启动 xinghe-tumai 服务..."
        cd $REMOTE_SERVER_DIR
        MINIMAX_API_KEY="${MINIMAX_API_KEY}" PORT=3001 pm2 start server.js --name xinghe-tumai
    fi
    pm2 save
    echo "✅ PM2 服务已就绪"

    sleep 2

    # 检查API服务
    if curl -s http://localhost:3001/api/interpret -X POST -H "Content-Type: application/json" -d '{"runeAnalysis":[]}' > /dev/null 2>&1; then
        echo "✅ API服务可达（/api/interpret）"
    else
        echo "⚠️  API服务端口可达，等待就绪..."
    fi

    # 合并Nginx配置
    NGINX_CONF="/etc/nginx/conf.d/tuteng3.site.conf"
    if [ -f "\$NGINX_CONF" ]; then
        # 检查是否已存在 xinghe-tumai 配置
        if grep -q "xinghe-tumai" "\$NGINX_CONF"; then
            echo "Nginx已包含xinghe-tumai配置，跳过添加"
        else
            echo "添加xinghe-tumai配置到Nginx..."
            # 在最后一个 } 之前插入新配置
            sed -i '/^}/i \
    # === 星河图脉 ===\
    location /xinghe-tumai/api/ {\
        proxy_pass http://127.0.0.1:3001/api/;\
        proxy_http_version 1.1;\
        proxy_set_header Host \$host;\
        proxy_set_header X-Real-IP \$remote_addr;\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto \$scheme;\
        proxy_read_timeout 120s;\
        proxy_connect_timeout 10s;\
    }\
    location /xinghe-tumai/ {\
        alias /var/www/landingpage/xinghe-tumai/;\
        index index.html;\
        try_files \$uri \$uri/ /xinghe-tumai/index.html;\
    }' "\$NGINX_CONF"
        fi
    else
        echo "⚠️  未找到Nginx配置文件 \$NGINX_CONF"
    fi

    # 测试并重载Nginx
    nginx -t && nginx -s reload
    echo "✅ Nginx已重载"

    # 验证部署
    sleep 1
    if curl -s http://localhost/xinghe-tumai/ | head -1 | grep -q .; then
        echo "✅ 前端页面可访问"
    else
        echo "⚠️  前端页面验证失败，请检查Nginx配置"
    fi
ENDSSH

echo ""
echo "🎉 部署完成!"
echo "访问地址: https://tuteng3.site/xinghe-tumai/"
echo "API日志: tail -f /var/log/xinghe-tumai.log"
echo ""
echo "⚠️  确保本地设置了 MINIMAX_API_KEY 环境变量"
