#!/bin/bash
# SentinelTrade-AI: S0-BEACON Services Installation Script
# This script automates the successful provisioning of Grafana and NPM Backend.
# Target: Alpine Linux 3.20 (LXC)

set -e

echo "[1/4] Installing Dependencies..."
apk update && apk upgrade
apk add curl wget bash openresty nodejs npm python3 py3-pip sqlite htop nano net-tools git openrc
rc-update add devfs boot

echo "[2/4] Provisioning Grafana..."
apk add grafana
rc-update add grafana default
echo 'export GF_SERVER_HTTP_ADDR=0.0.0.0' > /etc/conf.d/grafana
echo 'export GF_SERVER_HTTP_PORT=3000' >> /etc/conf.d/grafana
sed -i 's/^;http_addr =.*/http_addr = 0.0.0.0/' /etc/grafana.ini
rc-service grafana restart

echo "[3/4] Provisioning Nginx Proxy Manager (Backend)..."
mkdir -p /var/www/npm && cd /var/www/npm
if [ ! -d ".git" ]; then
    git clone https://github.com/NginxProxyManager/nginx-proxy-manager.git .
fi

cd backend
npm install --omit=dev

# Nginx Configuration Structure
mkdir -p /etc/nginx/conf.d/include && touch /etc/nginx/conf.d/include/ip_ranges.conf
mkdir -p /data/nginx /data/custom_ssl /data/logs /data/access /data/nginx/default_host /data/nginx/default_www /data/nginx/proxy_host /data/nginx/redirection_host /data/nginx/stream_host /data/nginx/dead_host /data/nginx/temp /data/letsencrypt-acme-challenge
chmod -R 777 /data

# Start Backend
export NODE_ENV=production
nohup node index.js > /var/log/npm-admin.log 2>&1 &

echo "[4/4] Deploying Rescue UI (Port 81)..."
echo '<h1>S0-BEACON: Operational</h1><p>NPM Backend Active on Port 3000. Frontend build deferred due to memory limits.</p>' > /var/www/npm/index.html
nohup python3 -m http.server 81 --directory /var/www/npm > /var/log/rescue_server.log 2>&1 &

echo "Installation Complete."
echo "Verify Port 81 (Rescue UI) and Port 3000 (NPM Backend/Grafana)."
