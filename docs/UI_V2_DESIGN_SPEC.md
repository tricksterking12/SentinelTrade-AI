# SentinelTrade UI V2.5: Design Specification

## 1. Visual Language & Aesthetics
*   **Theme - Sentinel Mode:** "Obsidian & Emerald"
    *   Primary BG: `#0a0a0a` (Obsidian)
    *   Accent: `#10b981` (Emerald)
*   **Theme - Admin Mode:** "Carbon & Cobalt"
    *   Primary BG: `#0f172a` (Carbon)
    *   Accent: `#3b82f6` (Cobalt)
*   **Typography:**
    *   Headings/UI: **Inter**
    *   Financial/System Data: **JetBrains Mono**
*   **Effects:** Glassmorphism (`backdrop-blur`), dynamic border glows, and Framer Motion spring transitions.

## 2. Structural Layout: Persistent Sidebar
The navigation has evolved from a TopBar to a stateful, collapsible **Sidebar**.
*   **Identity Header:** Displays the `logo.png` and version signature (V2.5).
*   **Contextual Tabs:**
    *   **Sentinel View:** Dashboard, Market Intel, Active Trades.
    *   **Admin View (RBAC Protected):** Node Health, User Management, Global Kill-Switch.
*   **State:** Collapsible to icon-only mode to maximize workspace for charts.

## 3. Global Utility Shell (Top Bar)
A streamlined layer for global status and identity:
*   **Cluster Vitality:** Real-time indicator of system-wide operational status.
*   **Intelligence Notifications:** Bell icon with a dynamic "Pulse" for S1-CEREBRO updates.
*   **Identity Signature:** User avatar with a dropdown menu for mode-switching and session termination.

## 4. Secure Intelligence Portal (Login)
*   **Visuals:** Low-opacity, blurred `login-bg.png` background with a glassmorphism central portal.
*   **Features:** Moving ticker tape for live market sentiment and a "Persist Session" (Remember Me) capability using `localStorage`.

## 5. View Specifications
### A. Sentinel Dashboard (User Mode)
*   **Portfolio Pulse:** High-density Area Chart (`recharts`) with animated gradients.
*   **Intelligence Feed:** Timeline of AI theses with confidence meters.
*   **Active Strategies:** Strategy status cards with ROI and Allocation metrics.

### B. Command Center (Admin Mode)
*   **Hero Banner:** Utilizes `admin-hero.png` as a wide operational header.
*   **Node Vitality Grid:** Real-time gauges for CPU, RAM, and GPU (Tesla P100) thermals.
*   **User Management:** Administrative table for authorization and access group auditing.

## 6. Technical Stack
*   **Framework:** React 18 (TypeScript)
*   **Build Tool:** Vite
*   **Utility Layer:** Tailwind CSS
*   **Charts:** Recharts
*   **Icons:** Lucide React
*   **Animations:** Framer Motion

---
*Specified by SentinelTrade Systems Architect - 2026-05-08*
