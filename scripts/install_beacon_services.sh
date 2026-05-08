#!/bin/bash
# SentinelTrade-AI: S0-BEACON Master Production Installation Script (UI V2 Optimized)
# Codified by Infrastructure Provisioning Agent - 2026-05-08
# Target: Alpine Linux 3.20 (LXC) with 1GB+ RAM

set -e

# --- 1. Environment Validation ---
echo "[1/7] Validating Environment..."

if [[ $EUID -ne 0 ]]; then
   echo "Error: This script must be run as root."
   exit 1
fi

if ! grep -q "Alpine" /etc/os-release; then
    echo "Error: This script is designed for Alpine Linux."
    exit 1
fi

TOTAL_RAM=$(free -m | awk '/Mem:/ {print $2}')
if [ "$TOTAL_RAM" -lt 950 ]; then
    echo "Error: S0-BEACON requires at least 1GB of RAM for production builds. Current: ${TOTAL_RAM}MB"
    exit 1
fi

# --- 2. Dependency Installation ---
echo "[2/7] Installing Production Dependencies..."
apk update && apk upgrade
apk add curl wget bash openresty nodejs npm python3 py3-pip sqlite htop nano net-tools git openrc tailscale grafana
rc-update add devfs boot
rc-update add tailscale default
rc-update add openresty default
rc-update add grafana default

# --- 3. Grafana Configuration ---
echo "[3/7] Configuring Grafana..."
echo 'export GF_SERVER_HTTP_ADDR=0.0.0.0' > /etc/conf.d/grafana
echo 'export GF_SERVER_HTTP_PORT=3000' >> /etc/conf.d/grafana
sed -i 's/^;http_addr =.*/http_addr = 0.0.0.0/' /etc/grafana.ini
rc-service grafana restart

# --- 4. NPM Backend & Frontend Provisioning ---
echo "[4/7] Provisioning Nginx Proxy Manager (Full Build)..."
mkdir -p /var/www/npm
if [ ! -d "/var/www/npm/.git" ]; then
    git clone https://github.com/NginxProxyManager/nginx-proxy-manager.git /var/www/npm
fi

# Frontend Build
echo "Building NPM Frontend..."
cd /var/www/npm/frontend
npm install
# Fix known type errors in NPM source
cd src/locale && if [ ! -L "lang" ]; then ln -s src lang; fi
cd ../..
./node_modules/.bin/vite build
rm -rf node_modules

# Backend Setup
echo "Building NPM Backend..."
cd /var/www/npm/backend
npm install --omit=dev

# Directory Structure for NPM persistence
mkdir -p /etc/nginx/conf.d/include && touch /etc/nginx/conf.d/include/ip_ranges.conf
mkdir -p /data/nginx /data/custom_ssl /data/logs /data/access /data/nginx/default_host /data/nginx/default_www /data/nginx/proxy_host /data/nginx/redirection_host /data/nginx/stream_host /data/nginx/dead_host /data/nginx/temp /data/letsencrypt-acme-challenge
chmod -R 777 /data

# OpenRC Service for NPM Backend
cat <<'EOF' > /etc/init.d/npm-admin
#!/sbin/openrc-run
description='Nginx Proxy Manager Backend'
command='/usr/bin/node'
command_args='index.js'
directory='/var/www/npm/backend'
pidfile='/run/npm-admin.pid'
command_background='yes'
output_log='/var/log/npm-admin.log'
error_log='/var/log/npm-admin.log'

depend() {
    need net
}

start_pre() {
    checkpath -d -m 0777 /data
    mkdir -p /etc/nginx/conf.d/include
}
EOF
chmod +x /etc/init.d/npm-admin
rc-update add npm-admin default
rc-service npm-admin restart

# --- 5. Sentinel Dashboard Build (V2) ---
echo "[5/7] Building SentinelTrade V2 Dual-Mode Dashboard..."
mkdir -p /opt/sentinel
if [ ! -d "/opt/sentinel/.git" ]; then
    git clone https://github.com/tricksterking12/SentinelTrade-AI.git /opt/sentinel
else
    cd /opt/sentinel && git pull origin main
fi

# Asset Scaffolding
mkdir -p src/web/public/assets/branding src/web/public/assets/icons

cd src/web
# Ensure V2 dependencies (recharts, framer-motion) are present
npm install
export NODE_OPTIONS=--max-old-space-size=800
# Vite build with potential tsc bypass for production speed
./node_modules/.bin/vite build --emptyOutDir

# Cleanup build artifacts to save space on 16GB disk
rm -rf node_modules

# --- 6. OpenResty Configuration ---
echo "[6/7] Orchestrating Nginx Routing..."

# Ensure conf.d inclusion
if ! grep -q "include /etc/nginx/conf.d/\*.conf;" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \    include /etc/nginx/conf.d/*.conf;' /etc/nginx/nginx.conf
fi
mkdir -p /etc/nginx/conf.d

# Dashboard V2 and API Proxying (V2 Optimized)
printf 'server {
    listen 81;
    server_name _;
    root /opt/sentinel/src/web/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host \044host;
        proxy_set_header X-Real-IP \044remote_addr;
        proxy_set_header X-Forwarded-For \044proxy_add_x_forwarded_for;
    }

    location / {
        try_files \044uri \044uri/ /index.html;
    }
}\n' > /etc/nginx/conf.d/sentinel-dashboard.conf

# Legacy config cleanup
rm -f /etc/nginx/conf.d/npm-admin.conf

rc-service openresty restart

# --- 7. Tailscale Preparation ---
echo "[7/7] Preparing Tailscale Network..."
if [ ! -e /dev/net/tun ]; then
    echo "!!! WARNING: /dev/net/tun not found. Tailscale will NOT start."
    echo "!!! Run 'pct set <ID> --device-passthrough /dev/net/tun' on Proxmox host."
else
    echo "TUN device detected. Tailscale is ready."
fi

echo "--------------------------------------------------------"
echo "INSTALLATION COMPLETE (UI V2)"
echo "Dashboard: http://<BEACON_IP>:81"
echo "Routes:    /login, /dashboard, /admin"
echo "Grafana:   http://<BEACON_IP>:3000"
echo "--------------------------------------------------------"
