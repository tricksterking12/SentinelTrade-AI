import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Shield, Brain, Activity, LayoutDashboard, Settings, Power } from 'lucide-react';

// --- Auth Context & RBAC ---
const UserContext = createContext({
  user: null,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  toggleRole: () => {}
});

const AppProvider = ({ children }) => {
  const [user, setUser] = useState({ name: 'James', role: 'sentinel' });
  const isAdmin = user.role === 'admin';

  const login = () => setUser({ name: 'James', role: 'sentinel' });
  const logout = () => setUser(null);
  const toggleRole = () => setUser(prev => ({ 
    ...prev, 
    role: prev.role === 'admin' ? 'sentinel' : 'admin' 
  }));

  return (
    <UserContext.Provider value={{ user, isAdmin, login, logout, toggleRole }}>
      {children}
    </UserContext.Provider>
  );
};

// --- Components ---
const Sidebar = () => {
  const { isAdmin, toggleRole } = useContext(UserContext);
  return (
    <div className={`w-64 h-screen p-4 flex flex-col gap-4 border-r ${isAdmin ? 'bg-slate-900 border-slate-700' : 'bg-zinc-900 border-zinc-800'}`}>
      <div className="flex items-center gap-2 mb-8">
        <Shield className="text-emerald-500" />
        <span className="font-bold text-xl tracking-tight">SentinelTrade</span>
      </div>
      
      <nav className="flex-1 flex flex-col gap-2">
        <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/thesis" className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition">
          <Brain size={20} /> AI Thesis
        </Link>
        
        {isAdmin && (
          <>
            <div className="mt-8 mb-2 px-2 text-xs font-semibold uppercase text-slate-500">System</div>
            <Link to="/admin" className="flex items-center gap-3 p-2 rounded bg-slate-800 text-blue-400 hover:bg-slate-700 transition">
              <Activity size={20} /> Admin Panel
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <button onClick={toggleRole} className="w-full flex items-center gap-3 p-2 rounded hover:bg-white/5 transition text-sm text-gray-400">
          <Settings size={18} /> Switch to {isAdmin ? 'Sentinel' : 'Admin'} View
        </button>
      </div>
    </div>
  );
};

const SentinelView = () => (
  <div className="p-8 space-y-6">
    <h1 className="text-3xl font-bold">Trading Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
        <div className="text-zinc-400 text-sm">Portfolio Value (Mock)</div>
        <div className="text-2xl font-mono mt-1">$124,562.89</div>
      </div>
      <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
        <div className="text-zinc-400 text-sm">Daily P&L</div>
        <div className="text-2xl font-mono mt-1 text-emerald-400">+$1,230.45</div>
      </div>
      <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
        <div className="text-zinc-400 text-sm">Active Strategies</div>
        <div className="text-2xl font-mono mt-1">4</div>
      </div>
    </div>

    <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Brain size={18} /> AI Thesis Feed</h3>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-3 bg-zinc-900/50 rounded border border-zinc-700 text-sm italic text-zinc-300">
            "S1-CEREBRO: Volatility in NVDA suggests a 65% probability of mean reversion within 4 hours. Recommend scaling into long position."
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminView = () => (
  <div className="p-8 space-y-6">
    <h1 className="text-3xl font-bold text-blue-400">System Admin Panel</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="font-semibold mb-4">Cluster Health</h3>
        <div className="space-y-3">
          {['BEACON', 'CEREBRO', 'KINETIC'].map(node => (
            <div key={node} className="flex justify-between items-center text-sm">
              <span>{node}</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs uppercase font-bold">Online</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="font-semibold mb-4">Service Control</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm flex items-center gap-2">
            <Power size={14} /> Restart NPM
          </button>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm flex items-center gap-2">
            <Power size={14} /> Restart Grafana
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- Main App ---
const AppContent = () => {
  const { isAdmin } = useContext(UserContext);
  return (
    <div className={`flex min-h-screen ${isAdmin ? 'admin-theme' : 'sentinel-theme'}`}>
      <Router>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<SentinelView />} />
            <Route path="/admin" element={isAdmin ? <AdminView /> : <Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
