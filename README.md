### 🛰️ SentinelTrade AI #

Secure. Self-Hosted. Human-Validated. > Next-generation autonomous long-term asset management for the private cloud.

🎯 The Mission

SentinelTrade AI is a professional-grade, self-hosted autonomous trading system designed to outperform traditional High-Yield Savings Accounts (HYSA) through low-volume, high-conviction long-term investing.

Unlike black-box commercial bots, SentinelTrade runs entirely on your hardware, using your local AI models, and requires your explicit approval for high-impact decisions.

🧠 System Architecture

1. The Intelligence Layer (The Brain)

Running on dedicated Proxmox VMs with GPU passthrough, our local LLM (Mistral/Llama) performs:

Contextual Sentiment: Real-time analysis of SEC filings and financial news.

Trade Reasoning: Every trade intent is accompanied by a natural language "Thesis" explaining why.

2. The Execution Layer (The Core)

Broker: Integrated via Alpaca Markets API.

Strategy: Swing-trading and trend-following (multi-day/week holds).

Risk Engine: Hardcoded mathematical guardrails to prevent "flash-crash" logic errors.

3. The Safety Layer (Human-In-The-Loop)

SentinelTrade implements a Zero-Trust execution policy for trades exceeding specific thresholds:

Email/SMS Alerts: Instant notifications via SMTP and Twilio.

MFA Dashboard: Secure approval portal with 2FA requirement.

🏗️ Hardware Stack

Hypervisor: Proxmox VE

Compute: 2x Dedicated GPU Nodes (6x NVIDIA GPUs total)

Network: Gigabit Uplink (Fiber-Ready)

Storage: PostgreSQL for high-fidelity trade journaling.

🗺️ Strategic Roadmap

Phase 1: Foundation 🧱

[ ] Proxmox VM Environment Setup

[ ] Alpaca Paper Trading Integration

[ ] Basic Technical Analysis (RSI/Moving Averages) logic

Phase 2: Cognitive Integration 🧠

[ ] GPU Passthrough & vLLM Deployment

[ ] Sentiment Analysis Pipeline (RSS/Twitter/News)

[ ] Automated Trade Thesis Generation

Phase 3: The Sentinel 🛡️

[ ] HITL Notification System (Email/SMS)

[ ] React Management Dashboard

[ ] Read-only Home Assistant Data Bridge

🔒 Security & Privacy

Self-Hosted: No financial data ever leaves your local network except to the broker.

Read-Only HA: Home Assistant integration uses a scoped REST API to ensure your smart home cannot execute trades.

Encrypted: All web traffic is forced through TLS 1.3 via Nginx Proxy Manager.

📈 Goals

Metric

Target

Annualized Return

> 4.0% (Outperform HYSA)

Max Drawdown

< 10%

Human Intervention

Required for trades > 2% Portfolio

Developed with ❤️ for the Private Cloud.
