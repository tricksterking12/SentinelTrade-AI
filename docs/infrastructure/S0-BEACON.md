# [S-0] BEACON: Gateway & Management

## Technical Specifications
| Specification | Value |
| :--- | :--- |
| **Type** | LXC Container (Privileged) |
| **OS** | Alpine Linux 3.20 |
| **CPU** | 1 Core |
| **RAM** | 1 GB (Upgraded from 512 MiB) |
| **Storage** | 16 GB (local-lvm) |
| **Role** | Primary entry point, Nginx Proxy Manager, Unified Dashboard |

## Networking Logic
BEACON operates as the primary gateway, handling both internal node orchestration and external web traffic.

- **Bridge:** `vmbr1` (External / WAN)
- **Protocol:** DHCP (Reservation Required)
- **Port 81:** SentinelTrade UI V2.5 (`/dashboard`, `/admin`, `/admin/users`, `/login`)
- **Port 3000:** NPM Backend & Grafana (Conflict Managed)
- **Tailscale:** Blocked: Pending Host Action (See `docs/PENDING_HOST_ACTIONS.md`)

## Role-Based Access Control (RBAC)
- **Sentinel Mode:** Default access for trading data and portfolio tracking.
- **Admin Mode:** Restricted access to system health, user management, and kill-switches.
- **Identity Assets:**
    - `login-bg.png`: Portal background.
    - `logo.png`: Core identity/sidebar logo.
    - `admin-hero.png`: Command Center header.

## Master Provisioning Guide (Production Build)

### Phase 1: Dependencies & Baseline
```bash
apk update && apk upgrade
apk add curl wget bash openresty nodejs npm python3 py3-pip sqlite htop nano net-tools git openrc tailscale grafana
rc-update add devfs boot
rc-update add tailscale default
```

### Phase 2: Grafana Network Exposure
```bash
apk add grafana
rc-update add grafana default
echo 'export GF_SERVER_HTTP_ADDR=0.0.0.0' > /etc/conf.d/grafana
echo 'export GF_SERVER_HTTP_PORT=3000' >> /etc/conf.d/grafana
sed -i 's/^;http_addr =.*/http_addr = 0.0.0.0/' /etc/grafana.ini
rc-service grafana restart
```

### Phase 3: Unified V2.5 Dashboard Build
Build optimization for the 1GB RAM LXC environment.

```bash
# 1. Repository & Asset Sync
mkdir -p /opt/sentinel && cd /opt/sentinel
git pull origin main
mkdir -p src/web/public/assets/branding src/web/public/assets/icons

# 2. Production Build
cd src/web
rm -rf dist node_modules package-lock.json
npm install
export NODE_OPTIONS=--max-old-space-size=800
./node_modules/.bin/vite build --emptyOutDir

# 3. Nginx Routing Alignment
cat <<'EOF' > /etc/nginx/conf.d/sentinel-dashboard.conf
server {
    listen 81;
    server_name _;
    root /opt/sentinel/src/web/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
rc-service openresty restart
```

## Command History & Debug Log
| Command | Reason / Result |
| :--- | :--- |
| `vite build` | Success: Completed in 15.7s (V2.5 with Tailwind/RBAC). |
| `identity-signature` | Fix: Verified UI text in bundle to confirm V2.5 deployment. |
| `npm run build` | Error: JavaScript heap out of memory (Resolved via `--max-old-space-size=800`). |

## Audit Trail
- **2026-05-08:** Evolved GUI to V2.5. Implemented RBAC, Collapsible Sidebar, and session persistence.
- **2026-05-08:** Upgraded S0-BEACON to Production Mode. Completed full NPM frontend build.
- **2026-05-05:** Document initialized by Systems Architect.
