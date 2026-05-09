import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, Brain, Activity, LayoutDashboard, Settings, Power, 
  Bell, User, ChevronRight, LogOut, Terminal, Cpu, Gauge,
  Menu, X, Users, Zap, AlertTriangle, Search, Plus, Trash2, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- Types & Interfaces ---
interface Notification {
  id: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  time: string;
}

interface SentinelUser {
  name: string;
  role: 'sentinel' | 'admin';
  avatar: string;
}

interface UserRecord {
  id: string;
  name: string;
  group: 'Admin' | 'Sentinel';
  lastLogin: string;
  status: 'Active' | 'Locked' | 'Pending';
}

// --- Context & State ---
const AppContext = createContext<{
  user: SentinelUser | null;
  isAdmin: boolean;
  login: (name: string, role: 'sentinel' | 'admin', remember: boolean) => void;
  logout: () => void;
  toggleRole: () => void;
  notifications: Notification[];
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
} | null>(null);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SentinelUser | null>(() => {
    const saved = localStorage.getItem('sentinel_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [notifications] = useState<Notification[]>([
    { id: '1', message: 'S1-CEREBRO: NVDA Sentiment High (0.89)', type: 'info', time: '2m ago' },
    { id: '2', message: 'S2-KINETIC: Connection Stabilized', type: 'success', time: '15m ago' },
    { id: '3', message: 'System: 1GB RAM Limit Approach (82%)', type: 'alert', time: '1h ago' },
  ]);

  const isAdmin = user?.role === 'admin';

  const login = (name: string, role: 'sentinel' | 'admin', remember: boolean) => {
    const newUser: SentinelUser = { name, role, avatar: name.substring(0, 2).toUpperCase() };
    setUser(newUser);
    if (remember) {
      localStorage.setItem('sentinel_session', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sentinel_session');
  };

  const toggleRole = () => {
    setUser((prev: any) => {
      if (!prev) return null;
      const updated: SentinelUser = { ...prev, role: prev.role === 'admin' ? 'sentinel' : 'admin' };
      if (localStorage.getItem('sentinel_session')) {
        localStorage.setItem('sentinel_session', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{ 
      user, isAdmin, login, logout, toggleRole, 
      notifications, isSettingsOpen, setSettingsOpen,
      isSidebarOpen, setSidebarOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Sub-Components ---

const BrandedLogo = ({ size = 48, className = "", isIcon = false }) => {
  // We are forcing the source to v1.4 to kill the cache
  const assetPath = isIcon 
    ? "/assets/branding/logo_icon_rmbg.png?v=1.4" 
    : "/assets/branding/logo_square-rmbg.png?v=1.4";

  return (
    <div 
      style={{ width: size, height: size, minWidth: size, minHeight: size }} 
      className={`relative flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
    >
      <img 
        src={assetPath}
        alt="Sentinel Branding"
        className="w-full h-full object-contain pointer-events-none"
        style={{ 
          imageRendering: 'auto',
          aspectRatio: '1/1'
        }}
        // If it really fails, we just log it instead of hiding it
        onError={(e) => console.error("Asset failed to load:", e.currentTarget.src)}
      />
    </div>
  );
};

const Sidebar = () => {
  const ctx = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', mode: 'sentinel' },
    { label: 'Market Intel', icon: Brain, path: '/intel', mode: 'sentinel' },
    { label: 'Active Trades', icon: Zap, path: '/trades', mode: 'sentinel' },
    { label: 'Node Health', icon: Activity, path: '/admin', mode: 'admin' },
    { label: 'User Mgmt', icon: Users, path: '/admin/users', mode: 'admin' },
    { label: 'Global Kill-Switch', icon: Power, path: '/admin/kill-switch', mode: 'admin' },
  ];

  const filteredItems = navItems.filter(item => 
    item.mode === 'sentinel' || (item.mode === 'admin' && ctx?.isAdmin)
  );

  return (
    <motion.aside 
      initial={false}
      animate={{ width: ctx?.isSidebarOpen ? 280 : 80 }}
      className={`h-screen sticky top-0 flex flex-col border-r border-[var(--border-color)] glass z-[60] transition-colors duration-500 ${ctx?.isAdmin ? 'bg-slate-950/50' : 'bg-black/50'}`}
    >
      {/* Sidebar Header / Logo */}
      <div className="p-6 flex flex-col items-center">
        <BrandedLogo size={48} className="mb-8 mx-auto drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
        <AnimatePresence>
          {ctx?.isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-lg tracking-tight whitespace-nowrap"
            >
              SentinelTrade <span className="text-[var(--brand-primary)] text-xs ml-1">V2.5</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative
                ${isActive ? 'bg-[var(--bg-accent)] text-[var(--brand-primary)] border-glow' : 'hover:bg-white/5 text-[var(--text-secondary)]'}
              `}
            >
              <item.icon size={22} className={isActive ? 'text-[var(--brand-primary)]' : 'group-hover:text-[var(--text-primary)]'} />
              {ctx?.isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {item.mode === 'admin' && ctx?.isSidebarOpen && (
                <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30 text-blue-400 uppercase">Admin</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[var(--border-color)]">
        <button 
          onClick={() => ctx?.setSidebarOpen(!ctx?.isSidebarOpen)}
          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 text-[var(--text-secondary)] transition-all"
        >
          {ctx?.isSidebarOpen ? <ChevronRight className="rotate-180" /> : <ChevronRight />}
          {ctx?.isSidebarOpen && <span className="text-sm">Collapse Sidebar</span>}
        </button>
      </div>
    </motion.aside>
  );
};

const TopBar = () => {
  const ctx = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 border-b border-[var(--border-color)] glass px-6 flex items-center justify-between z-50 sticky top-0">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest hidden lg:block">
          Cluster Status: <span className="text-emerald-400">Operational</span>
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-white/5 transition relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 pulse-dot"></span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-3 w-80 glass rounded-xl border border-[var(--border-color)] overflow-hidden shadow-2xl"
              >
                <div className="p-4 border-b border-[var(--border-color)] font-semibold text-sm">Intelligence Feed</div>
                <div className="max-h-64 overflow-y-auto">
                  {ctx?.notifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-white/5 border-b border-[var(--border-color)] last:border-0 transition cursor-pointer">
                      <div className="text-xs text-[var(--text-secondary)] mb-1">{n.time}</div>
                      <div className="text-sm">{n.message}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Identity */}
        <div className="flex items-center gap-3 border-l border-[var(--border-color)] pl-6 relative group">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold">{ctx?.user?.name}</div>
            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{ctx?.user?.role} Mode</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[var(--bg-accent)] border border-[var(--brand-primary)] flex items-center justify-center font-bold text-[var(--brand-primary)] text-sm">
            {ctx?.user?.avatar}
          </div>
          
          {/* Dropdown on hover */}
          <div className="absolute right-0 top-full mt-2 w-48 glass border border-[var(--border-color)] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 shadow-xl">
             <button onClick={ctx?.toggleRole} className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-sm text-[var(--text-secondary)]">
                <Settings size={16} /> Switch Mode
             </button>
             <button onClick={ctx?.logout} className="w-full flex items-center gap-3 p-2 hover:bg-red-500/10 text-red-400 rounded-lg text-sm">
                <LogOut size={16} /> Logout
             </button>
          </div>
        </div>

        {/* Settings Toggle */}
        <button 
          onClick={() => ctx?.setSettingsOpen(true)}
          className="p-2 hover:bg-white/5 rounded-full transition"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

const SettingsDrawer = () => {
  const ctx = useContext(AppContext);

  return (
    <AnimatePresence>
      {ctx?.isSettingsOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => ctx.setSettingsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 glass border-l border-[var(--border-color)] z-[101] p-6 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">System Settings</h2>
              <button onClick={() => ctx.setSettingsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8 flex-1">
              <section>
                <h3 className="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-4 tracking-widest flex items-center gap-2">
                  <LayoutDashboard size={14} /> Interface
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compact View</span>
                    <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-3 h-3 bg-gray-400 rounded-full transition-all"></div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-4 tracking-widest flex items-center gap-2">
                  <Activity size={14} /> Connectivity
                </h3>
                <div className="space-y-4">
                  {['Alpaca', 'Tailscale', 'Grafana'].map(api => (
                    <div key={api} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">{api} Link</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-emerald-400 font-bold uppercase">Linked</span>
                         <div className="w-2 h-2 rounded-full bg-emerald-500 pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="pt-8 border-t border-[var(--border-color)]">
              <button 
                onClick={ctx.logout}
                className="w-full p-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition font-bold flex items-center justify-center gap-3"
              >
                <LogOut size={20} /> TERMINATE SESSION
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const PortfolioChart = () => {
  const data = [
    { time: '00:00', value: 121000 },
    { time: '04:00', value: 122500 },
    { time: '08:00', value: 122000 },
    { time: '12:00', value: 124000 },
    { time: '16:00', value: 123500 },
    { time: '20:00', value: 125000 },
    { time: '23:59', value: 124562 },
  ];

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} strokeOpacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="var(--text-secondary)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => `$${v/1000}k`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
            itemStyle={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}
            cursor={{ stroke: 'var(--brand-primary)', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="var(--brand-primary)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const SentinelDashboard = () => (
  <div className="p-8 space-y-8 max-w-7xl mx-auto">
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Overview</h1>
        <p className="text-[var(--text-secondary)] text-sm">Real-time assets and execution status</p>
      </div>
      <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
        {['24H', '7D', '1M', 'YTD'].map(t => (
          <button key={t} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${t === '24H' ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'hover:bg-white/5 text-[var(--text-secondary)]'}`}>
            {t}
          </button>
        ))}
      </div>
    </header>

    <div className="glass rounded-3xl p-8 border border-[var(--border-color)] shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 flex gap-12 z-10">
         <div className="text-right">
            <div className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-[0.2em]">Net Liquidity</div>
            <div className="text-3xl font-mono mt-1">$124,562.89</div>
         </div>
         <div className="text-right">
            <div className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-[0.2em]">P&L Day</div>
            <div className="text-3xl font-mono mt-1 text-emerald-400">+$1,230.45</div>
         </div>
      </div>
      <PortfolioChart />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Brain className="text-[var(--brand-primary)]" /> Intelligence Feed</h2>
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
          {[1, 2, 3, 4, 5].map(i => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-2xl border-l-4 border-l-[var(--brand-primary)] hover:bg-white/[0.05] transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black px-2 py-0.5 bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] rounded uppercase mono tracking-widest">Thesis #{821 + i}</span>
                   <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">NVDA/SOXX</span>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] mono font-bold">09:42:1{i} AM</span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                <span className="font-bold text-[var(--brand-primary)]">S1-CEREBRO:</span> "Semiconductor sector volatility index is compressing. Statistical reversion model indicates a high probability buy signal for NVDA at $892.40. Target: $915.00."
              </p>
              <div className="mt-5 flex items-center gap-6">
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-emerald-400"
                    ></motion.div>
                  </div>
                  <span className="text-[10px] font-black mono text-[var(--brand-primary)]">82% CONFIDENCE</span>
                </div>
                <button className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-white flex items-center gap-1 transition">
                   DETAILS <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Zap className="text-[var(--brand-primary)]" /> Active Strategies</h2>
          <div className="space-y-4">
            {['Mean Reversion V4', 'Sentiment Alpha', 'Breakout Sentry'].map((s, i) => (
              <div key={s} className="glass p-5 rounded-2xl border border-[var(--border-color)] hover:border-[var(--brand-primary)]/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                     <span className="text-sm font-bold">{s}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] mono">ID: 0x2A{i}</span>
                </div>
                <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                   <span>Alloc: $25k</span>
                   <span>ROI: +4.2%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-accent)] to-transparent">
           <div className="flex items-center gap-3 mb-4">
              <Shield className="text-[var(--brand-primary)]" size={20} />
              <h3 className="font-bold">Execution Safety</h3>
           </div>
           <p className="text-xs text-[var(--text-secondary)] leading-loose">
              Risk Guard is active. Maximum drawdown limit set to <span className="text-red-400 font-bold">12%</span>. Portfolio diversification index: <span className="text-emerald-400 font-bold">0.82</span>.
           </p>
        </div>
      </div>
    </div>
  </div>
);

const CommandCenter = () => {
  const ctx = useContext(AppContext);
  
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Admin Hero Banner */}
      <div className="w-full h-48 rounded-3xl overflow-hidden relative border border-blue-500/30 shadow-2xl">
         <img src="/assets/branding/admin_hero.png" alt="Admin Dashboard Header" className="admin-hero-banner w-full opacity-60" />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent flex flex-col justify-end p-8">
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">Command Center</h1>
            <p className="text-blue-400 font-bold tracking-[0.3em] text-xs uppercase">System Administrative Operations</p>
         </div>
         <div className="absolute top-8 right-8">
            <button className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-3 transition-all transform active:scale-95 border border-red-500/50">
              <Power size={20} strokeWidth={3} /> EMERGENCY KILL-SWITCH
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {['BEACON', 'CEREBRO', 'KINETIC'].map((node, i) => (
          <div key={node} className="glass p-8 rounded-3xl border border-[var(--border-color)] space-y-8 relative overflow-hidden group hover:bg-white/[0.02] transition-all">
            <div className="flex justify-between items-center relative z-10">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <Terminal size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight">{node}</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold tracking-widest uppercase">Node-{i}</p>
                  </div>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-emerald-400 mb-1">ONLINE</span>
                 <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>
               </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 text-[var(--text-secondary)]">
                  <span>CPU Load</span>
                  <span className="mono">24.5%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '24.5%' }}
                    className="h-full bg-blue-500"
                  ></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 text-[var(--text-secondary)]">
                  <span>Memory Usage</span>
                  <span className="mono">642 MB</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '64.2%' }}
                    className="h-full bg-blue-500"
                  ></motion.div>
                </div>
              </div>
              {node === 'CEREBRO' && (
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 text-[var(--text-secondary)]">
                    <span>Tesla P100 Temp</span>
                    <span className="mono">42°C</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '42%' }}
                      className="h-full bg-emerald-500"
                    ></motion.div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[var(--border-color)] bg-white/5 font-black flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Cpu size={22} className="text-blue-400" />
             <span className="tracking-tight">ACTIVE TASK ORCHESTRATOR</span>
          </div>
          <button className="text-[10px] font-black uppercase text-blue-400 hover:underline">View All Logs</button>
        </div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black uppercase text-[var(--text-secondary)] bg-black/20 tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Task Signature</th>
                <th className="px-8 py-5">Origin</th>
                <th className="px-8 py-5">Operation Vector</th>
                <th className="px-8 py-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {[104, 105, 106].map(id => (
                <tr key={id} className="hover:bg-white/[0.03] transition-all group">
                  <td className="px-8 py-6 mono font-bold text-blue-400 tracking-tighter">#SENT-TX-{id}-B8</td>
                  <td className="px-8 py-6">
                     <span className="text-[10px] font-black px-2 py-1 bg-slate-800 rounded border border-slate-700">KINETIC-NODE-2</span>
                  </td>
                  <td className="px-8 py-6 font-medium">Alpaca Limit Order (AMD @ $162.40)</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                       <span className="text-[10px] font-black uppercase text-blue-400 animate-pulse">Processing</span>
                       <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [users] = useState<UserRecord[]>([
    { id: '1', name: 'James', group: 'Admin', lastLogin: '2026-05-08 14:21', status: 'Active' },
    { id: '2', name: 'Sentinel-Alpha', group: 'Sentinel', lastLogin: '2026-05-07 09:12', status: 'Active' },
    { id: '3', name: 'Dev-Relay', group: 'Sentinel', lastLogin: 'N/A', status: 'Pending' },
    { id: '4', name: 'System-Bot', group: 'Admin', lastLogin: '2026-05-08 00:05', status: 'Active' },
  ]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-blue-400">User Management</h1>
           <p className="text-[var(--text-secondary)] text-sm">Manage cluster access and security groups</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg flex items-center gap-3 transition-all transform active:scale-95"
        >
          <Plus size={20} /> CREATE USER
        </button>
      </header>

      <div className="glass rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl">
        <div className="p-6 bg-white/5 flex items-center gap-4">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input 
                type="text" 
                placeholder="Search by identity or group..."
                className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 focus:border-blue-500/50 outline-none transition text-sm"
              />
           </div>
           <button className="p-3 bg-white/5 rounded-xl border border-[var(--border-color)] hover:bg-white/10 transition">
              <Users size={20} className="text-[var(--text-secondary)]" />
           </button>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-black uppercase text-[var(--text-secondary)] bg-black/20 tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">Identity</th>
              <th className="px-8 py-5">Access Group</th>
              <th className="px-8 py-5">Last Handshake</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.03] transition-all">
                <td className="px-8 py-6">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs uppercase tracking-tighter">
                        {u.name.substring(0, 2)}
                      </div>
                      <span className="font-bold tracking-tight">{u.name}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <span className={`text-[10px] font-black px-2 py-1 rounded border ${u.group === 'Admin' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'}`}>
                      {u.group}
                   </span>
                </td>
                <td className="px-8 py-6 mono text-[var(--text-secondary)]">{u.lastLogin}</td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-[10px] font-bold uppercase">{u.status}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-white/5 rounded-lg transition text-[var(--text-secondary)] hover:text-white"><Key size={16} /></button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg transition text-red-400/60 hover:text-red-400"><Trash2 size={16} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mock Create User Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="glass w-full max-w-lg rounded-3xl border border-white/10 p-10 shadow-2xl overflow-hidden relative"
              >
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                      <Plus className="text-blue-400" /> NEW NODE ACCESS
                   </h2>
                   <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-white transition"><X /></button>
                </div>
                
                <form className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Username / Identity</label>
                      <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none transition" placeholder="e.g. Sentinel-Ops-01" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Access Group</label>
                      <select className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none transition appearance-none">
                         <option>Sentinel (Read-Only Data)</option>
                         <option>Admin (Full Terminal Access)</option>
                      </select>
                   </div>
                   <button className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl transition transform active:scale-95 uppercase tracking-widest mt-4">
                      Authorize Identity
                   </button>
                </form>

                {/* Grid Background Effect in Modal */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoginPortal = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const ctx = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified logic: name 'admin' = admin role, else sentinel
    const role = name.toLowerCase() === 'admin' ? 'admin' : 'sentinel';
    ctx?.login(name || 'James', role, remember);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505] sentinel-theme">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
         <img src="/assets/branding/login_bg.png" alt="Login Background" className="w-full h-full object-cover opacity-20 blur-sm scale-105" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass p-12 rounded-[2rem] border border-white/10 w-full max-w-md relative z-10 shadow-[0_0_80px_rgba(16,185,129,0.05)] mx-6"
      >
        <div className="flex flex-col items-center mb-12">
          <BrandedLogo size={120} className="mb-6 mx-auto" />
          <h1 className="text-4xl font-black tracking-tighter uppercase">Sentinel<span className="text-[var(--brand-primary)]">Trade</span></h1>
          <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.4em] uppercase mt-2">Secure Intelligence Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest ml-1">Identity Signature</label>
              <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                 <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-[var(--brand-primary)] focus:bg-white/[0.05] outline-none transition font-semibold"
                    placeholder="Username"
                    required
                  />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest ml-1">Master Passkey</label>
              <div className="relative">
                 <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                 <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-[var(--brand-primary)] focus:bg-white/[0.05] outline-none transition font-mono tracking-tighter"
                    placeholder="••••••••••••"
                    required
                  />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                   <input 
                      type="checkbox" 
                      checked={remember} 
                      onChange={() => setRemember(!remember)}
                      className="sr-only" 
                   />
                   <div className={`w-5 h-5 border-2 rounded-md transition-all ${remember ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-white/20 hover:border-white/40'}`}>
                      {remember && <Zap size={12} className="text-white fill-white" />}
                   </div>
                </div>
                <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] group-hover:text-white transition">Persist Session</span>
             </label>
             <button type="button" className="text-[10px] font-black uppercase text-[var(--brand-primary)] hover:underline tracking-widest">Protocol Recovery</button>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-[var(--brand-primary)] text-white font-black rounded-2xl shadow-[0_15px_30px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] transition-all transform active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
          >
            INITIALIZE SESSION
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-3 opacity-50">
           <AlertTriangle size={14} className="text-yellow-500" />
           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Encrypted Endpoint: <span className="text-white">SSL/TLS 1.3</span></span>
        </div>
      </motion.div>
    </div>
  );
};

// --- App Layout Shell ---
const AppShell = () => {
  const ctx = useContext(AppContext);
  if (!ctx?.user) return <Navigate to="/login" />;

  return (
    <div className={`flex min-h-screen ${ctx.isAdmin ? 'admin-theme' : 'sentinel-theme'} transition-colors duration-1000`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] overflow-hidden">
        <TopBar />
        <SettingsDrawer />
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-white/[0.02] to-transparent">
          <Routes>
            <Route path="/dashboard" element={<SentinelDashboard />} />
            <Route path="/intel" element={<div className="p-8 text-center text-[var(--text-secondary)] uppercase font-black tracking-widest mt-20">Market Intel Module: Under Construction</div>} />
            <Route path="/trades" element={<div className="p-8 text-center text-[var(--text-secondary)] uppercase font-black tracking-widest mt-20">Active Trades Module: Ready for S2-KINETIC link</div>} />
            <Route path="/admin" element={ctx.isAdmin ? <CommandCenter /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/users" element={ctx.isAdmin ? <UserManagement /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/kill-switch" element={ctx.isAdmin ? <div className="p-8 text-center text-red-500 uppercase font-black tracking-widest mt-20 text-3xl">Global Kill-Switch Primed</div> : <Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <AppProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPortal />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </Router>
  </AppProvider>
);

export default App;
