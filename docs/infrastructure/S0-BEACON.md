# [S-0] BEACON: Gateway & Management

## Technical Specifications
| Specification | Value |
| :--- | :--- |
| **Type** | LXC Container (Privileged) |
| **OS** | Alpine Linux 3.20 |
| **CPU** | 1 Core |
| **RAM** | 512 MiB |
| **Storage** | 16GB (local-lvm) |
| **Role** | Primary entry point, Nginx Proxy Manager, Grafana dashboards |

## Networking Logic
BEACON operates on the primary external bridge to manage incoming traffic and provide a central management interface.

- **Bridge:** `vmbr1` (External / WAN)
- **Protocol:** DHCP (Reservation Required)
- **Port 81:** Rescue Status UI (Operational)
- **Port 3000:** NPM Backend & Grafana (Conflict Managed)

## Hardware Dependencies (Dell R540)
- **Cooling:** Standard Dell PowerEdge R540 thermal profile. Ensure the chassis lid is closed to maintain proper airflow over the CPU heatsinks.

## Master Provisioning Guide (Final Build)

### Phase 1: Dependencies & Baseline
```bash
apk update && apk upgrade
apk add curl wget bash openresty nodejs npm python3 py3-pip sqlite htop nano net-tools git openrc
rc-update add devfs boot
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

### Phase 3: Nginx Proxy Manager (Rescue Mode)
The NPM frontend build fails on 512MB RAM. The backend is provisioned on port 3000, and a rescue UI is served on port 81.

```bash
mkdir -p /var/www/npm && cd /var/www/npm
git clone https://github.com/NginxProxyManager/nginx-proxy-manager.git .

# Backend Build
cd /var/www/npm/backend
npm install --omit=dev

# Nginx Config Dirs
mkdir -p /etc/nginx/conf.d/include && touch /etc/nginx/conf.d/include/ip_ranges.conf
mkdir -p /data/nginx /data/custom_ssl /data/logs /data/access /data/nginx/default_host /data/nginx/default_www /data/nginx/proxy_host /data/nginx/redirection_host /data/nginx/stream_host /data/nginx/dead_host /data/nginx/temp /data/letsencrypt-acme-challenge
chmod -R 777 /data

# Run Backend
export NODE_ENV=production
nohup node index.js > /var/log/npm-admin.log 2>&1 &

# Rescue UI (Port 81)
echo '<h1>S0-BEACON: Operational</h1><p>NPM Backend Active on Port 3000.</p>' > /var/www/npm/index.html
nohup python3 -m http.server 81 --directory /var/www/npm > /var/log/rescue_server.log 2>&1 &
```

## Command History & Debug Log
| Command | Reason / Result |
| :--- | :--- |
| `npm run build` | Error: JavaScript heap out of memory (512MB LXC limit). |
| `ln -s src lang` | Fix: Resolved TypeScript import errors in frontend build attempts. |
| `mkdir -p /etc/nginx...` | Fix: Prevented NPM backend fatal error due to missing `ip_ranges.conf`. |
| `rm /data/keys.json` | Fix: Resolved `Unexpected end of JSON input` error by allowing fresh JWT key generation. |

## Troubleshooting & Verification
| Check | Command | Expected Output |
| :--- | :--- | :--- |
| **Rescue UI** | `curl -Is http://localhost:81` | `HTTP/1.0 200 OK` |
| **NPM Backend** | `netstat -tulpn \| grep 3000` | `:::3000 LISTEN` |
| **Processes** | `ps aux \| grep node` | `node index.js` active |

## Living TODO List
- [x] Configure DHCP Reservation in Router for MAC address.
- [x] Run initial system update.
- [x] Install Nginx Proxy Manager (Backend active, Frontend deferred).
- [x] Deploy Port 81 Rescue Status Page.
- [x] Install Grafana for data visualization (Fixed loopback bind).

## Audit Trail
- **2026-05-08:** Provisioned NPM Backend and resolved JWT/Nginx config dependencies.
- **2026-05-08:** Deployed Python Rescue UI on Port 81 to bypass memory-limited frontend build.
- **2026-05-07:** Port 80 Verified (OpenResty Landing Page via browser).
- **2026-05-05:** Document initialized by Systems Architect.
