# 星河图脉 — 部署文档

## 服务器信息

| 属性 | 值 |
|------|-----|
| IP | 119.29.178.222 |
| 域名 | tuteng3.site |
| 子路径 | /xinghe-tumai/ |
| 访问地址 | https://tuteng3.site/xinghe-tumai/ |
| 操作系统 | OpenCloudOS |
| Node.js | v22.22.1 |
| 进程管理 | PM2 |
| Web 服务器 | Nginx 1.24.0 |

## 服务器端口总览

### 公共入口

| 端口 | 服务 | 管理方式 | 说明 |
|------|------|----------|------|
| 80 | Nginx HTTP | systemd | 主入口，所有 HTTP 请求 |
| 443 | Nginx HTTPS | systemd | 主入口，SSL 终端 |

### API/后端服务

| 端口 | 服务 | 进程 | 管理方式 | Nginx 路由 |
|------|------|------|----------|------------|
| 3000 | vocab-duo API | Node.js | PM2 (vocab-duo-backend) | `/vocab-duo/api/` → `http://127.0.0.1:3000/api/` |
| **3001** | **xinghe-tumai API** | **Node.js** | **PM2 (xinghe-tumai)** | **`/xinghe-tumai/api/` → `http://127.0.0.1:3001/api/`** |
| 5000 | music_gen API | Python Gunicorn | systemd (site_total) | `/music/api/` → `http://127.0.0.1:5000/api/` |
| 8080 | id-photo + 通用 API | Go (photo-service) | systemd | `/claw/api/` → `http://127.0.0.1:8080/api/`<br>`/api/` → `http://127.0.0.1:8080` |
| 8082 | codenames-game | Go binary | systemd | — (直连或内部调用) |
| 8090 | HivisionIDPhotos | Python3 | systemd (hivision) | — (内部调用) |

### 基础设施

| 端口 | 服务 | 说明 |
|------|------|------|
| 22 | SSH (sshd) | 远程管理 |
| 25 | Postfix SMTP | 仅 127.0.0.1，本地邮件 |
| 3306 | MySQL | 数据库 |
| 33060 | MySQL X Protocol | — |
| 8081 | Nginx (music_gen) | 独立 nginx 配置监听 |
| 8088 | Nginx (music) | 独立 nginx 配置监听 |
| 8888 | BT Panel (宝塔) | 服务器管理面板 |
| 18789 | OpenClaw Gateway | Node.js，API 网关 |
| 18791 | OpenClaw Internal | 仅 127.0.0.1 |

## Nginx 路由完整表

### HTTP Server Block (80) 和 HTTPS Server Block (443) 配置相同

| 路径 | 目标 | 端口 | 类型 |
|------|------|------|------|
| `/` | landing page 主页 | — | 静态 `/var/www/landingpage` |
| `/video-feed/*.php` | PHP-FPM | — | fastcgi `/var/www/videos-feed/` |
| `/video-feed/` | 视频流前端 | — | alias `/var/www/videos-feed/` |
| `/vocab-duo/` | vocab-duo 前端 | — | alias `/var/www/vocab-duo/frontend/dist/` |
| `/vocab-duo/api/` | vocab-duo API | 3000 | proxy |
| `/vocab-duo/uploads/` | vocab-duo 上传文件 | — | alias `/var/www/vocab-duo/backend/uploads/` |
| `/music_gen/` | music_gen 前端 | — | alias `/var/www/music_gen/` |
| `/music/api/` | music_gen API | 5000 | proxy |
| `/finlearn/` | 金融学习平台 | — | alias `/var/www/finlearn/` |
| `/claw/management/` | claw 管理后台 | — | alias `/var/www/claw-mgmt/` |
| `/claw/photo/` | 证件照前端 | — | alias `/var/www/id-photo/` |
| `/claw/api/` | 证件照 API | 8080 | proxy |
| `/claw/api/data/results/` | 证件照结果图片 | — | alias `/var/www/html/claw/api/data/results/` |
| `/api/` | 通用 API (Go) | 8080 | proxy |
| `/game.html` | codenames 游戏 | — | alias `/var/www/codenames-game/game.html` |
| `/hand-gesture/` | 手势识别 | — | alias `/var/www/hand-gesture/` |
| **`/xinghe-tumai/`** | **星河图脉 前端** | — | **alias `/var/www/landingpage/xinghe-tumai/`** |
| **`/xinghe-tumai/api/`** | **星河图脉 API** | **3001** | **proxy** |

### Nginx 配置文件位置

```
/etc/nginx/conf.d/tuteng3.site.conf   ← 主配置（所有子项目路由）
/etc/nginx/conf.d/tuteng3.site.conf.bak ← 备份（修改前自动创建）
```

## 星河图脉项目详情

### 目录结构

```
远端服务器:
  /www/server/xinghe-tumai/           ← API 服务代码
  ├── server.js                       ← Express API 服务
  ├── package.json
  ├── package-lock.json
  └── node_modules/

  /var/www/landingpage/xinghe-tumai/  ← 前端静态文件
  ├── index.html
  └── assets/

本地开发:
  ~/progs/xinghe-tumai/               ← 项目根目录
  ├── src/                            ← React 源代码
  ├── dist/                           ← Vite 构建产物
  ├── server.js                       ← API 服务
  ├── .env                            ← 环境变量（不提交到 Git）
  ├── deploy/                         ← 部署脚本和配置
  └── DEPLOY.md                       ← 本文档
```

### 本地环境变量 (.env)

```
MINIMAX_API_KEY=sk-your-minimax-key-here
MINIMAX_BASE_URL=https://api.minimax.chat/v1
MINIMAX_MODEL=MiniMax-M2.7
PORT=3001
```

### PM2 启动命令（远端实际使用）

```bash
cd /www/server/xinghe-tumai
MINIMAX_API_KEY=sk-your-minimax-key-here PORT=3001 pm2 start server.js --name xinghe-tumai
pm2 save
```

### PM2 常用命令

```bash
pm2 status                  # 查看所有服务状态
pm2 logs xinghe-tumai       # 查看日志
pm2 restart xinghe-tumai    # 重启服务
pm2 stop xinghe-tumai       # 停止服务
pm2 delete xinghe-tumai     # 删除服务（然后需重新 start + save）
```

## 部署流程

### 首次部署

```bash
# 1. 本地构建
npm run build

# 2. 上传静态文件到服务器
scp -r dist/* root@119.29.178.222:/var/www/landingpage/xinghe-tumai/

# 3. 上传服务端代码
scp server.js package.json package-lock.json root@119.29.178.222:/www/server/xinghe-tumai/

# 4. SSH 到服务器安装依赖
ssh root@119.29.178.222
cd /www/server/xinghe-tumai
npm install --omit=dev

# 5. 启动服务 (PM2)
MINIMAX_API_KEY=sk-your-minimax-key-here PORT=3001 pm2 start server.js --name xinghe-tumai
pm2 save

# 6. 配置 Nginx (仅首次，已配置则跳过)
# 添加 location 块到 /etc/nginx/conf.d/tuteng3.site.conf
# 在 HTTP (80) 和 HTTPS (443) 两个 server 块中各加一份
nginx -t && nginx -s reload
```

### 日常更新

```bash
# 1. 本地构建
npm run build

# 2. 上传静态文件
scp -r dist/* root@119.29.178.222:/var/www/landingpage/xinghe-tumai/

# 3. 如果 server.js 有改动
scp server.js root@119.29.178.222:/www/server/xinghe-tumai/
ssh root@119.29.178.222 "pm2 restart xinghe-tumai"

# 4. 验证
curl -s -o /dev/null -w "%{http_code}" https://tuteng3.site/xinghe-tumai/
curl -s https://tuteng3.site/xinghe-tumai/api/interpret -X POST -H "Content-Type: application/json" -d '{"runeAnalysis":[{}]}'
```

## 静态资源

所有图片、音频、视频等静态资源托管在腾讯云 COS：
```
https://single-az-1251416377.cos.ap-guangzhou.myqcloud.com/xinghe-tumai/
```

本地 `public/` 目录已清空，所有资源引用使用 COS URL。

## Landing Page

入口位于 tools.html（创想世界 → 工具页）：
```
https://tuteng3.site/tools.html
```

文件路径：`/var/www/landingpage/tools.html`

## 其他子项目参考

| 项目 | 前端路径 | API 端口 | Nginx 路由 |
|------|----------|----------|------------|
| video-feed | `/var/www/videos-feed/` | PHP-FPM | `/video-feed/` |
| vocab-duo | `/var/www/vocab-duo/frontend/dist/` | 3000 | `/vocab-duo/` |
| music_gen | `/var/www/music_gen/` | 5000 | `/music_gen/`, `/music/api/` |
| finlearn | `/var/www/finlearn/` | — | `/finlearn/` |
| claw (id-photo) | `/var/www/id-photo/` | 8080 | `/claw/photo/`, `/claw/api/` |
| claw-mgmt | `/var/www/claw-mgmt/` | — | `/claw/management/` |
| codenames | `/var/www/codenames-game/` | 8082 | `/game.html` |
| hand-gesture | `/var/www/hand-gesture/` | — | `/hand-gesture/` |
| xinghe-tumai | `/var/www/landingpage/xinghe-tumai/` | 3001 | `/xinghe-tumai/` |
