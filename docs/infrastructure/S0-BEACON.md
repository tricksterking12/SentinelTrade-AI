# [S-0] BEACON: Gateway & Management

## Technical Specifications
| Specification | Value |
| :--- | :--- |
| **Type** | LXC Container (Privileged) |
| **OS** | Alpine Linux 3.20 |
| **CPU** | 1 Core |
| **RAM** | 1 GB (Upgraded from 512 MiB) |
| **Storage** | 16 GB (local-lvm) |
| **Role** | Primary entry point, Nginx Proxy Manager, Grafana dashboards |

## Networking Logic
BEACON operates on the primary external bridge to manage incoming traffic and provide a central management interface.

- **Bridge:** `vmbr1` (External / WAN)
- **Protocol:** DHCP (Reservation Required)
- **Port 81:** SentinelTrade UI V2.5 (`/dashboard`, `/admin`, `/admin/users`, `/login`)
- **UI Stack:** React 18, Vite, Tailwind CSS, Recharts, Framer Motion
- **RBAC:** Role-Based Access Control (Sentinel / Admin)
- **Assets Map:**
    - `login-bg.png`: Portal background
    - `logo.png`: Core identity asset
    - `admin-hero.png`: Command Center header
- **Tailscale:** Blocked: Pending Host Action (See `docs/PENDING_HOST_ACTIONS.md`)

## Hardware Dependencies (Dell R540)
- **Cooling:** Standard Dell PowerEdge R540 thermal profile. Ensure the chassis lid is closed to maintain proper airflow over the CPU heatsinks.

## Master Provisioning Guide (Production Build)

### Phase 1: Dependencies & Baseline
```bash
apk update && apk upgrade
apk add curl wget bash openresty nodejs npm python3 py3-pip sqlite htop nano net-tools git openrc tailscale
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

### Phase 3: Nginx Proxy Manager & Sentinel Dashboard (V2 Build)
With 1GB RAM, full production builds are optimized using a memory-capped Vite process.

```bash
# 1. Repository Sync
mkdir -p /opt/sentinel && cd /opt/sentinel
git pull origin main

# 2. Asset Scaffolding
mkdir -p src/web/public/assets/branding src/web/public/assets/icons

# 3. Clean UI V2 Build
cd src/web
rm -rf dist node_modules package-lock.json
npm install
export NODE_OPTIONS=--max-old-space-size=800
./node_modules/.bin/vite build --emptyOutDir

# 4. Nginx Routing Alignment
# Web root: /opt/sentinel/src/web/dist
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

### Phase 4: Tailscale Integration
*Pending /dev/net/tun device passthrough from Proxmox host.*

## Command History & Debug Log
| Command | Reason / Result |
| :--- | :--- |
| `vite build` | Success: Completed in 33s with 1GB RAM allocated. |
| `sed -i ... nginx.conf` | Fix: Enabled `conf.d` inclusion for modular virtual hosts. |
| `tailscale up` | Error: `/dev/net/tun` does not exist. Requires host-side configuration. |

## Troubleshooting & Verification
| Check | Command | Expected Output |
| :--- | :--- | :--- |
| **NPM Admin UI** | `curl -Is http://localhost:81` | `HTTP/1.1 200 OK` |
| **Tailscale Status** | `tailscale status` | Should list the mesh network once authenticated. |

## Living TODO List
- [x] Upgrade RAM to 1GB.
- [x] Perform full production build of NPM.
- [x] Configure OpenResty to serve NPM Admin UI on Port 81.
- [ ] Fix Tailscale `/dev/net/tun` issue via Proxmox host.
- [ ] Authenticate Tailscale and configure `serve` mappings.

## Audit Trail
- **2026-05-08:** Upgraded S0-BEACON to Production Mode. Completed full NPM frontend build and decommissioned Rescue UI.
- **2026-05-08:** Provisioned NPM Backend as a managed OpenRC service.
- **2026-05-08:** Installed Tailscale; awaiting TUN device resolution.
