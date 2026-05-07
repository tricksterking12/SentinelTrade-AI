# [S-0] BEACON: Gateway & Management

## Technical Specifications
| Specification | Value |
| :--- | :--- |
| **Type** | LXC Container (Privileged) |
| **OS** | Alpine Linux 3.20 |
| **CPU** | 1 Core |
| **RAM** | 512 MiB |
| **Storage** | 8GB (local-lvm) |
| **Role** | Primary entry point, Nginx Proxy Manager, Grafana dashboards |

## Networking Logic
BEACON operates on the primary external bridge to manage incoming traffic and provide a central management interface.

- **Bridge:** `vmbr1` (External / WAN)
- **Protocol:** DHCP (Reservation Required)

## Hardware Dependencies (Dell R540)
As a lightweight LXC, BEACON has minimal physical hardware requirements but relies on the host's overall stability.
- **Cooling:** Standard Dell PowerEdge R540 thermal profile. Ensure the chassis lid is closed to maintain proper airflow over the CPU heatsinks.

## Living TODO List
- [ ] Configure DHCP Reservation in Router for MAC address.
- [ ] Run initial system update:
    ```bash
    apk update && apk add curl htop
    ```
- [ ] Install Nginx Proxy Manager (Docker recommended within LXC or native).
- [ ] Setup SSL Certificates for remote monitoring.
- [ ] Install Grafana for data visualization.

## Audit Trail
- **2026-05-05:** Document initialized by Systems Architect.
- **2026-05-05:** S0-BEACON shell created on Proxmox.
