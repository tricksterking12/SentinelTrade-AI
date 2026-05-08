# SentinelTrade UI V2: Design Specification

## 1. Visual Language & Aesthetics
*   **Theme - Sentinel Mode:** "Obsidian & Emerald"
    *   Primary BG: `#0a0a0a`
    *   Accent: `#10b981` (Emerald)
*   **Theme - Admin Mode:** "Carbon & Cobalt"
    *   Primary BG: `#0f172a`
    *   Accent: `#3b82f6` (Cobalt)
*   **Typography:**
    *   Headings/UI: **Inter**
    *   Financial/System Data: **JetBrains Mono**
*   **Effects:** Glassmorphism (`backdrop-blur`), subtle border glows, and Framer Motion transitions.

## 2. Global Utility Shell (Top Bar)
A persistent navigation layer:
*   **Intelligence Notifications:** Bell icon with a dynamic "Pulse" dot for unread AI thesis updates.
*   **User Identity:** Shows current role (Sentinel/Admin) and provides a "Logout" button.
*   **System Settings:** Slide-out right drawer for chart density and API connection toggles.

## 3. Integrated Login Portal
*   **Feature:** Sleek landing page with a blurred background ticker tape.
*   **Security:** JWT-based entry point (Mocked logic in V2).

## 4. Sentinel Dashboard (User Mode)
*   **Portfolio Pulse Chart:** High-performance Area Chart using `recharts` for tracking value trends.
*   **AI Thesis Feed:** Vertical timeline view with confidence meters from S1-CEREBRO.
*   **Active Strategies:** Real-time status cards for Mean Reversion and Sentiment algorithms.

## 5. Command Center (Admin Mode)
*   **Node Vitality Grid:** Real-time gauges for CPU/RAM/Thermals for BEACON, CEREBRO (Tesla P100), and KINETIC.
*   **Active Task Orchestrator:** Queue system for monitoring internal API operations and order fills.
*   **Emergency Stop:** Global kill-switch for all active strategies.

## 6. Technical Stack
*   **Framework:** React 18 (TypeScript)
*   **Build Tool:** Vite
*   **Charts:** Recharts
*   **Icons:** Lucide React
*   **Animations:** Framer Motion
*   **Styling:** CSS Variables + Glassmorphism

---
*Specified by SentinelTrade Systems Architect - 2026-05-08*
