# <p align="center">🛡️ SentinelTrade AI</p>

---

### 🌐 Project Vision
SentinelTrade AI is a sophisticated, self-hosted autonomous trading cluster designed for institutional-grade reliability. By distributing intelligence, execution, and management across specialized nodes, the system achieves a robust, scalable architecture for automated market analysis and trade fulfillment.

---

### 📊 System Status

| Node | Name | Role | OS / Platform | Status |
| :--- | :--- | :--- | :--- | :--- |
| **S-0** | **BEACON** | Gateway & UI | Alpine 3.20 (LXC) | 🟢 Production |
| **S-1** | **CEREBRO** | AI Intelligence | Ubuntu 24.04 (VM) | 🟡 Initializing |
| **S-2** | **KINETIC** | Executioner | Debian 12 (VM) | ⚪ Planned |

---

### 🏗️ Distributed Architecture Map

The cluster is organized into a node-centric schema to isolate concerns and optimize performance:

#### 📡 [S0-Beacon] Gateway Node
The traffic controller of the cluster.
- **Components:** Nginx Proxy Manager (NPM), Unified React Dashboard, Grafana Metrics.
- **Responsibility:** External ingress, authentication (RBAC), and cluster-wide telemetry.

#### 🧠 [S1-Cerebro] Intelligence Node
The brain of the operation.
- **Hardware:** Dedicated **NVIDIA Tesla P100** (PCI Passthrough).
- **Responsibility:** Running LLM inference (Ollama/vLLM) to generate market theses and sentiment analysis.

#### ⚡ [S2-Kinetic] Execution Node
The action layer.
- **Components:** Python Trade Agents, Alpaca API Bridge, TimescaleDB.
- **Responsibility:** Order management, risk-guard oversight, and trade history persistence.

---

### 📂 Repository Structure

```text
/
├── .github/workflows/   # CI/CD pipelines
├── docs/                # Project-wide documentation & specs
├── scripts/             # V3 Master Suite (Install/Update)
│
├── S0-Beacon/           # Gateway Node Source
│   ├── frontend/        # React 18 + Vite (Obsidian UI)
│   ├── services/        # Nginx & OpenRC configs
│   └── public/assets/   # Brand Identity Assets
│
├── S1-Cerebro/          # AI Inference Node Source
│   ├── brain/           # Inference orchestration scripts
│   └── drivers/         # GPU / Tesla P100 setup tools
│
└── S2-Kinetic/          # Execution Node Source
    ├── backend/         # Python Execution Agents
    └── database/        # PostgreSQL/TimescaleDB schemas
```

---

### 🚀 "One-Tap" Installation Guide

Deploy or recover the **S0-Beacon** node using our master automation suite.

**Pre-requisites:**
- Proxmox LXC (Alpine Linux 3.20 template)
- Minimum 1GB RAM (Allocated for Vite builds)
- Git access

**Execute from the Node Terminal:**
```bash
curl -sSL https://raw.githubusercontent.com/tricksterking12/SentinelTrade-AI/main/scripts/install.sh | bash
```

---

### 🎨 Visual Asset Registry & Design System
SentinelTrade utilizes a high-fidelity visual system built with **Tailwind CSS**, **Framer Motion**, and **Recharts**.

- **Themes:**
    - `Obsidian & Emerald`: Default **Sentinel Mode** for performance tracking.
    - `Carbon & Cobalt`: Secure **Admin Mode** for node management.
- **Location:** All branding assets (Logo, Backgrounds, Hero Banners) are housed in `/S0-Beacon/public/assets/`.

---

### 🔄 Maintenance & Auto-Updates
The cluster stays synchronized via the node-centric update cycle.

**Manual Update:**
```bash
bash scripts/update_sentinel.sh
```
The update script automatically:
1. Fetches metadata from GitHub.
2. Identifies if code changes exist (ignoring `/docs`).
3. Performs a memory-optimized rebuild only when necessary.

---

### 📜 Technical Stack
- **UI:** React 18, Vite, Tailwind CSS, Recharts, Framer Motion.
- **Backend:** Python 3.12+, Node.js 20+ (ESM).
- **Services:** OpenResty, Grafana, Tailscale.
- **Infrastructure:** Proxmox VE, Dell PowerEdge R540.

---
*Specified by SentinelTrade Systems Architect - 2026-05-08*
