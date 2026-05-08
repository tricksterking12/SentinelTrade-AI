import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  Shield, Brain, Activity, LayoutDashboard, Settings, Power, 
  Bell, User, ChevronRight, LogOut, Terminal, Cpu, Gauge 
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

// --- Context & State ---
const AppContext = createContext<{
  user: any;
  isAdmin: boolean;
  login: (credentials: any) => void;
  logout: () => void;
  toggleRole: () => void;
  notifications: Notification[];
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
} | null>(null);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('sentinel_user') || 'null'));
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [notifications] = useState<Notification[]>([
    { id: '1', message: 'S1-CEREBRO: NVDA Sentiment High (0.89)', type: 'info', time: '2m ago' },
    { id: '2', message: 'S2-KINETIC: Connection Stabilized', type: 'success', time: '15m ago' },
    { id: '3', message: 'System: 1GB RAM Limit Approach (82%)', type: 'alert', time: '1h ago' },
  ]);

  const isAdmin = user?.role === 'admin';

  const login = (credentials: any) => {
    const newUser = { name: 'James', role: 'sentinel', avatar: 'JV' };
    setUser(newUser);
    localStorage.setItem('sentinel_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sentinel_user');
  };

  const toggleRole = () => {
    setUser((prev: any) => {
      const updated = { ...prev, role: prev.role === 'admin' ? 'sentinel' : 'admin' };
      localStorage.setItem('sentinel_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{ 
      user, isAdmin, login, logout, toggleRole, 
      notifications, isSettingsOpen, setSettingsOpen 
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Sub-Components ---

const TopBar = () => {
  const ctx = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 border-b border-[var(--border-color)] glass px-6 flex items-center justify-between z-50 sticky top-0">
      <div className="flex items-center gap-3">
        <Shield className="text-[var(--brand-primary)]" />
        <span className="font-bold text-xl tracking-tight hidden md:block">SentinelTrade <span className="text-[var(--text-secondary)] font-normal text-sm">V2.0</span></span>
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
        <div className="flex items-center gap-3 border-l border-[var(--border-color)] pl-6">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold">{ctx?.user.name}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{ctx?.user.role}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--bg-accent)] border border-[var(--brand-primary)] flex items-center justify-center font-bold text-[var(--brand-primary)]">
            {ctx?.user.avatar}
          </div>
          <button onClick={ctx?.logout} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-full transition">
            <LogOut size={18} />
          </button>
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
            className="fixed right-0 top-0 h-full w-80 glass border-l border-[var(--border-color)] z-[101] p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">System Settings</h2>
              <button onClick={() => ctx.setSettingsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                < ChevronRight />
              </button>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-4 tracking-widest">Display</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chart Density</span>
                    <select className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-1 text-xs">
                      <option>Detailed</option>
                      <option>Compact</option>
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-4 tracking-widest">API Connectivity</h3>
                <div className="space-y-4">
                  {['Alpaca', 'Tailscale', 'Grafana'].map(api => (
                    <div key={api} className="flex items-center justify-between text-sm">
                      <span>{api} Relay</span>
                      <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-auto pt-8 border-t border-[var(--border-color)]">
                <button 
                  onClick={ctx.toggleRole}
                  className="w-full p-3 rounded-lg border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition font-semibold text-sm"
                >
                  Switch to {ctx.isAdmin ? 'Sentinel' : 'Admin'} View
                </button>
              </section>
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
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="var(--text-secondary)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => `$${v/1000}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--brand-primary)' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="var(--brand-primary)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const SentinelDashboard = () => (
  <div className="p-8 space-y-8 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Portfolio Pulse</h1>
      <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-color)]">
        {['24H', '7D', '1M'].map(t => (
          <button key={t} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${t === '24H' ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'hover:bg-white/5'}`}>
            {t}
          </button>
        ))}
      </div>
    </div>

    <div className="glass rounded-2xl p-6 border border-[var(--border-color)] shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 flex gap-8">
         <div className="text-right">
            <div className="text-[var(--text-secondary)] text-xs uppercase font-bold">Current Balance</div>
            <div className="text-2xl font-mono">$124,562.89</div>
         </div>
         <div className="text-right">
            <div className="text-[var(--text-secondary)] text-xs uppercase font-bold">24h Change</div>
            <div className="text-2xl font-mono text-emerald-400">+$1,230.45</div>
         </div>
      </div>
      <PortfolioChart />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Brain className="text-[var(--brand-primary)]" /> Intelligence Feed</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 rounded-xl border-l-4 border-l-[var(--brand-primary)] hover:border-glow transition"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase text-[var(--brand-primary)] mono">Thesis #{342 + i}</span>
                <span className="text-xs text-[var(--text-secondary)]">09:42 AM</span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                <span className="font-bold text-[var(--brand-primary)]">S1-CEREBRO:</span> "Correlation spike in semiconductor sector detected. AI suggests 78% confidence in upward trend for NVDA/AMD pair. Execution logic primed on S2-KINETIC."
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--brand-primary)]" style={{ width: '78%' }}></div>
                </div>
                <span className="text-[10px] font-bold mono">78% CONFIDENCE</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="text-[var(--brand-primary)]" /> Active Strategies</h2>
        <div className="space-y-4">
          {['Mean Reversion', 'Sentiment Alpha', 'Breakout Sentry'].map((s, i) => (
            <div key={s} className="glass p-4 rounded-xl border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{s}</div>
                <div className="text-xs text-[var(--text-secondary)]">Uptime: 4d 12h</div>
              </div>
              <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold mono border border-emerald-500/20">LIVE</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CommandCenter = () => (
  <div className="p-8 space-y-8 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-blue-400">System Command Center</h1>
      <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition transform active:scale-95">
        <Power size={18} /> EMERGENCY STOP
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {['BEACON', 'CEREBRO', 'KINETIC'].map((node, i) => (
        <div key={node} className="glass p-6 rounded-2xl border border-[var(--border-color)] space-y-6">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <Terminal size={20} className="text-blue-400" />
                <h3 className="font-bold">{node}</h3>
             </div>
             <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">CPU Load</span>
                <span className="mono">24%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '24%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Memory (1GB Limit)</span>
                <span className="mono">642MB</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '64%' }}></div>
              </div>
            </div>
            {node === 'CEREBRO' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)]">GPU (Tesla P100)</span>
                  <span className="mono">42°C</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '42%' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="glass rounded-2xl border border-[var(--border-color)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border-color)] bg-white/5 font-bold flex items-center gap-2">
        <Cpu size={18} /> Active Task Orchestrator
      </div>
      <div className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-[var(--text-secondary)] bg-black/20">
            <tr>
              <th className="px-6 py-3">Task ID</th>
              <th className="px-6 py-3">Origin</th>
              <th className="px-6 py-3">Operation</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {[104, 105, 106].map(id => (
              <tr key={id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4 mono font-bold">#SENT-{id}</td>
                <td className="px-6 py-4 text-xs font-semibold">S2-KINETIC</td>
                <td className="px-6 py-4">Alpaca Order Fill (AMD)</td>
                <td className="px-6 py-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                   <span className="text-[10px] font-bold uppercase text-blue-400">Processing</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const LoginPortal = () => {
  const [password, setPassword] = useState('');
  const ctx = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    ctx?.login({ password });
    navigate('/dashboard');
  };

  const tickerItems = [
    'NVDA +2.45%', 'TSLA -1.12%', 'AMD +0.89%', 'BTC $64,231', 'ETH $3,452',
    'SENTINEL NODE-0 ONLINE', 'CEREBRO INFERENCE READY', 'KINETIC API STABLE'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505] sentinel-theme">
      {/* Background Ticker */}
      <div className="ticker-wrap opacity-20">
        <div className="ticker">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-3xl border border-white/10 w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-accent)] flex items-center justify-center mb-4 border border-[var(--brand-primary)]">
            <Shield className="text-[var(--brand-primary)]" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SentinelTrade</h1>
          <p className="text-[var(--text-secondary)] text-sm">Secure Intelligence Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Master Passkey</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[var(--brand-primary)] focus:outline-none transition font-mono"
              placeholder="••••••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-[var(--brand-primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_var(--brand-glow)] transition transform active:scale-95"
          >
            INITIALIZE SESSION
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">
          System Status: <span className="text-emerald-400 font-bold">Operational</span>
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
    <div className={`min-h-screen ${ctx.isAdmin ? 'admin-theme' : 'sentinel-theme'}`}>
      <TopBar />
      <SettingsDrawer />
      <main className="transition-all">
        <Routes>
          <Route path="/dashboard" element={<SentinelDashboard />} />
          <Route path="/admin" element={ctx.isAdmin ? <CommandCenter /> : <Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
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
