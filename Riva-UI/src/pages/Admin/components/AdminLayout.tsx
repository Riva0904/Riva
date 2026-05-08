import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AdminTab = 'dashboard' | 'profile' | 'templates' | 'add-template' | 'categories' | 'settings';

interface NavItem {
  id: AdminTab;
  icon: string;
  label: string;
  children?: { id: AdminTab; label: string }[];
}

const NAV: NavItem[] = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'profile',   icon: '👤', label: 'Profile' },
  {
    id: 'templates', icon: '🎨', label: 'Templates',
    children: [
      { id: 'templates',    label: 'All Templates' },
      { id: 'add-template', label: '+ Add Template' },
      { id: 'categories',   label: '🏷 Categories' },
    ],
  },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

const TEMPLATE_IDS: AdminTab[] = ['templates', 'add-template', 'categories'];

interface Props {
  tab: AdminTab;
  setTab: (t: AdminTab) => void;
  adminName: string;
  onLogout: () => void;
  children: React.ReactNode;
}

const AdminLayout: React.FC<Props> = ({ tab, setTab, adminName, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(TEMPLATE_IDS.includes(tab));

  const handleNav = (item: NavItem) => {
    if (item.children) {
      setTemplatesOpen(o => !o);
      if (!TEMPLATE_IDS.includes(tab)) setTab('templates');
    } else {
      setTab(item.id);
      setSidebarOpen(false);
    }
  };

  const handleChild = (id: AdminTab) => {
    setTab(id);
    setSidebarOpen(false);
  };

  const isTemplateActive = TEMPLATE_IDS.includes(tab);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-green-800/30">
        <div className="flex items-center gap-3">
          <div className="logo-icon text-sm" style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)', color: '#052e16' }}>R</div>
          <div>
            <span className="font-black text-white text-base">Riva <span style={{ color: '#4ade80' }}>Admin</span></span>
            <p className="text-xs mt-0.5" style={{ color: '#86efac' }}>⚡ {adminName}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const isActive = item.children ? isTemplateActive : tab === item.id;
          return (
            <div key={item.id}>
              <motion.button
                whileHover={{ x: 3 }}
                onClick={() => handleNav(item)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition ${
                  isActive ? 'text-slate-900 shadow' : 'text-green-100 hover:bg-white/10'
                }`}
                style={isActive ? { background: 'linear-gradient(135deg,#4ade80,#22c55e)' } : {}}>
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.children && (
                  <span className="text-xs opacity-70">{templatesOpen ? '▲' : '▼'}</span>
                )}
              </motion.button>

              {/* Sub-items */}
              <AnimatePresence>
                {item.children && templatesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden ml-4 mt-1 space-y-0.5">
                    {item.children.map(c => (
                      <motion.button
                        key={c.id}
                        whileHover={{ x: 3 }}
                        onClick={() => handleChild(c.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                          tab === c.id ? 'bg-white/20 text-white' : 'text-green-200 hover:bg-white/10'
                        }`}>
                        <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                        {c.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-green-800/30">
        <motion.button
          whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-red-300 hover:bg-red-500/20 transition">
          <span>🚪</span>
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-light-green">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col"
        style={{ background: 'linear-gradient(180deg,#14532d,#166534)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-60 flex flex-col md:hidden"
              style={{ background: 'linear-gradient(180deg,#14532d,#166534)' }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-green-100 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="navbar-btn-outline p-2 text-lg">☰</button>
          <span className="font-black text-slate-900 text-sm">Riva <span className="text-green">Admin</span></span>
          <div className="w-10" />
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
