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

## Repository Architecture (V3.0)
The node source is now organized within the node-centric directory schema:
- **Web Source:** `S0-Beacon/frontend/`
- **Branding Assets:** `S0-Beacon/public/assets/`
- **Nginx Configs:** `S0-Beacon/services/` (Source for `/etc/nginx/conf.d/`)

## Networking Logic
BEACON operates as the primary gateway, handling both internal node orchestration and external web traffic.

- **Bridge:** `vmbr1` (External / WAN)
- **Protocol:** DHCP (Reservation Required)
- **Port 81:** SentinelTrade UI V2.5 (`/dashboard`, `/admin`, `/admin/users`, `/login`)
- **Port 3000:** NPM Backend & Grafana (Conflict Managed)
- **Tailscale:** Blocked: Pending Host Action (See `docs/PENDING_HOST_ACTIONS.md`)

## Master V3.0 Suite
This node is maintained via the automated master installer and updater.

### 1. One-Tap Installation
Deploy or recover the entire gateway node using:
```bash
curl -sSL https://raw.githubusercontent.com/tricksterking12/SentinelTrade-AI/main/scripts/install.sh | bash
```

### 2. Auto-Update Cycle
The node checks for updates hourly via `scripts/update_sentinel.sh`. It automatically handles:
- Code pulls and asset syncing.
- Memory-optimized production rebuilds.
- Documentation-only update skipping (build-gate logic).

## Audit Trail
- **2026-05-08:** Restructured repo to V3.0 Node-Centric schema. Implemented Master Installer and Auto-Updater.
- **2026-05-08:** Evolved GUI to V2.5. Implemented RBAC and Collapsible Sidebar.
- **2026-05-08:** Upgraded S0-BEACON to Production Mode.
- **2026-05-05:** Document initialized by Systems Architect.
