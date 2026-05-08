#!/bin/bash
# SentinelTrade-AI: Master Node-Centric Installer (V3.0)
# Codified by Systems Architect - 2026-05-08
# Target: Alpine Linux 3.20 (LXC) for S0-Beacon

set -e

REPO_URL="https://github.com/tricksterking12/SentinelTrade-AI.git"
INSTALL_PATH="/opt/sentinel"

echo "--------------------------------------------------------"
echo "SENTINELTRADE MASTER INSTALLER V3.0"
echo "--------------------------------------------------------"

# --- 1. Pre-flight Checks ---
echo "[1/6] Running Pre-flight Checks..."

if [[ $EUID -ne 0 ]]; then
   echo "Error: This script must be run as root."
   exit 1
fi

TOTAL_RAM=$(free -m | awk '/Mem:/ {print $2}')
if [ "$TOTAL_RAM" -lt 950 ]; then
    echo "Warning: RAM is below 1GB. Vite builds may fail."
fi

# --- 2. Dependency Management ---
echo "[2/6] Installing System Dependencies..."
apk update && apk upgrade
apk add git nodejs npm openresty tailscale grafana curl htop sqlite openrc

# --- 3. Repository Synchronization ---
echo "[3/6] Synchronizing Repository..."
if [ ! -d "$INSTALL_PATH/.git" ]; then
    echo "Cloning SentinelTrade-AI..."
    mkdir -p $INSTALL_PATH
    git clone $REPO_URL $INSTALL_PATH
else
    echo "Updating SentinelTrade-AI..."
    cd $INSTALL_PATH
    git pull
fi

# --- 4. Node-Specific Scaffolding (S0-Beacon) ---
echo "[4/6] Configuring S0-Beacon Node..."
cd $INSTALL_PATH/S0-Beacon/frontend

# Ensure assets are symlinked correctly if external
if [ -d "../public/assets" ]; then
    mkdir -p public
    ln -sfn ../../public/assets public/assets
fi

# --- 5. Frontend Build (Optimized) ---
echo "[5/6] Building Production UI..."
npm install
export NODE_OPTIONS=--max-old-space-size=800
npx vite build --emptyOutDir

# Post-build cleanup to save disk
rm -rf node_modules

# --- 6. Service Orchestration ---
echo "[6/6] Aligning Nginx and Services..."

# Configure OpenResty
if ! grep -q "include /etc/nginx/conf.d/\*.conf;" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \    include /etc/nginx/conf.d/*.conf;' /etc/nginx/nginx.conf
fi

printf 'server {
    listen 81;
    server_name _;
    root %s/S0-Beacon/frontend/dist;
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
}\n' "$INSTALL_PATH" > /etc/nginx/conf.d/sentinel-dashboard.conf

# Restart Services
rc-service openresty restart
rc-service grafana restart

echo "--------------------------------------------------------"
echo "V3.0 INSTALLATION COMPLETE"
echo "Access Dashboard: http://<NODE_IP>:81"
echo "--------------------------------------------------------"
