# [S-2] KINETIC: The Executioner

## Technical Specifications
| Specification | Value |
| :--- | :--- |
| **Type** | Virtual Machine |
| **OS** | Debian 12 "Bookworm" |
| **BIOS** | SeaBIOS |
| **CPU** | 2 Cores (Type: Host) |
| **RAM** | 4GB |
| **Storage** | 40GB (local-lvm) |
| **Role** | API interaction, Data Fetching, Trade Execution |

## Networking Logic
KINETIC acts as the bridge between the external financial markets and the internal AI brain.

- **External Interface (`vmbr1`):** Used for Alpaca API, news feeds, and system updates via DHCP.
- **Internal Fabric (`vmbr4`):** Private link to S1-CEREBRO for sending analysis requests.
- **Static IP (Internal):** `10.0.0.1`

## Hardware Dependencies (Dell R540)
- **Standard Storage:** Operating on local-lvm. Ensure the PERC controller is healthy and no predictive failures are reported on the physical disks.

## Living TODO List
- [ ] Install Python 3.12+ and pip:
    ```bash
    sudo apt update && sudo apt install -y python3-pip python3-venv
    ```
- [ ] Configure PostgreSQL/TimescaleDB for trade history.
- [ ] Assign Static IP `10.0.0.1` on `vmbr4`.
- [ ] Test connectivity to S1-CEREBRO:
    ```bash
    ping 10.0.0.2
    ```
- [ ] Deploy the SentinelTrade Data Fetcher script.

## Audit Trail
- **2024-05-05:** Document initialized by Systems Architect.
- **2024-05-05:** S2-KINETIC shell created and Debian 12 netinst completed.
