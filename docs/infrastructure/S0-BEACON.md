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
- **Port 81:** NPM Admin UI (Production Build)
- **Port 3000:** NPM Backend & Grafana (Conflict Managed)
- **Tailscale:** Integration in progress (Targeting `beacon-admin` and `beacon-metrics` DNS names)

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

### Phase 3: Nginx Proxy Manager (Production Build)
With 1GB RAM, a full frontend build is now possible.

```bash
mkdir -p /var/www/npm && cd /var/www/npm
git clone https://github.com/NginxProxyManager/nginx-proxy-manager.git .

# Frontend Build
cd /var/www/npm/frontend
npm install
# Bypass tsc if type errors persist
./node_modules/.bin/vite build

# Backend Build
cd /var/www/npm/backend
npm install --omit=dev

# Nginx Configuration (OpenResty)
# Ensure /etc/nginx/nginx.conf includes /etc/nginx/conf.d/*.conf
cat <<'EOF' > /etc/nginx/conf.d/npm-admin.conf
server {
    listen 81;
    server_name _;
    root /var/www/npm/frontend/dist;
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
