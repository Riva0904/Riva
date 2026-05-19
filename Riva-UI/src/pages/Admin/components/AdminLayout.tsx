import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminNotifications, type AdminNotification } from '../../../api/admin';

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
      { id: 'categories',   label: '🏷 Categories' },
      { id: 'templates',    label: 'All Templates' },
      { id: 'add-template', label: '+ Add Template' },
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

const NOTIF_PREFS_KEY = 'riva_admin_notif_prefs';
const NOTIF_READ_KEY  = 'riva_admin_notif_last_read';

const getPrefs = () => {
  try { return JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) ?? '{}'); }
  catch { return {}; }
};

const AdminLayout: React.FC<Props> = ({ tab, setTab, adminName, onLogout, children }) => {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(TEMPLATE_IDS.includes(tab));

  // ── Notification bell ──────────────────────────────────────────────────────
  const [notifs,      setNotifs]      = useState<AdminNotification[]>([]);
  const [bellOpen,    setBellOpen]    = useState(false);
  const [lastReadAt,  setLastReadAt]  = useState<number>(() =>
    parseInt(localStorage.getItem(NOTIF_READ_KEY) ?? '0', 10)
  );
  const bellRef = useRef<HTMLDivElement>(null);

  const loadNotifs = useCallback(async () => {
    try {
      const prefs = { registrations: true, payments: true, security: true, ...getPrefs() };
      const { notifications } = await getAdminNotifications(24);
      setNotifs(notifications.filter(n =>
        (n.type === 'registration' && prefs.registrations) ||
        (n.type === 'payment'      && prefs.payments) ||
        (n.type === 'security'     && prefs.security)
      ));
    } catch { /* silent — bell shows empty on error */ }
  }, []);

  useEffect(() => {
    loadNotifs();
    const id = setInterval(loadNotifs, 60_000);
    return () => clearInterval(id);
  }, [loadNotifs]);

  // Re-filter immediately when admin changes notification preferences
  useEffect(() => {
    window.addEventListener('riva-notif-prefs-changed', loadNotifs);
    return () => window.removeEventListener('riva-notif-prefs-changed', loadNotifs);
  }, [loadNotifs]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // A notification is unread if its time is newer than the persisted lastReadAt timestamp
  const unread = notifs.filter(n => new Date(n.time).getTime() > lastReadAt).length;
  const markAllRead = () => {
    const now = Date.now();
    localStorage.setItem(NOTIF_READ_KEY, String(now));
    setLastReadAt(now);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const TYPE_COLOR: Record<string, string> = {
    registration: 'bg-blue-100 text-blue-700',
    payment:      'bg-green-100 text-green-700',
    security:     'bg-amber-100 text-amber-700',
  };

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
          <div className="logo-icon text-sm" style={{ background: 'var(--color-gradient)', color: 'white' }}>R</div>
          <div>
            <span className="font-black text-white text-base">Riva <span style={{ color: 'var(--color-primary)' }}>Admin</span></span>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(var(--color-primary-rgb),0.45)' }}>⚡ {adminName}</p>
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
                style={isActive ? { background: 'var(--color-gradient)' } : {}}>
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

      {/* Bell + Logout */}
      <div className="px-3 py-4 border-t border-green-800/30 space-y-1">
        <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
          onClick={() => { if (!bellOpen) markAllRead(); setBellOpen(o => !o); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-green-100 hover:bg-white/10 transition relative">
          <span>🔔</span>
          <span>Notifications</span>
          {unread > 0 && (
            <span className="ml-auto rounded-full bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 min-w-[18px] text-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </motion.button>
        <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
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
        style={{ background: 'var(--color-gradient)' }}>
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
              style={{ background: 'var(--color-gradient)' }}>
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
          <div ref={bellRef} className="relative">
            <button onClick={() => { if (!bellOpen) markAllRead(); setBellOpen(o => !o); }}
              className="relative p-2 rounded-xl hover:bg-green-50 transition">
              🔔
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-[9px] font-black px-1 py-0.5 min-w-[16px] text-center leading-none">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notification dropdown — fixed below topbar on mobile, absolute on desktop */}
        <AnimatePresence>
          {bellOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: -8,  scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="fixed top-16 right-4 md:top-4 md:right-4 z-50 w-80 rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
              style={{ maxHeight: '70vh' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div>
                  <p className="font-black text-slate-900 text-sm">🔔 Notifications</p>
                  <p className="text-[10px] text-slate-400">Last 24 hours</p>
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead}
                      className="text-[10px] font-black text-green-600 hover:text-green-800 transition">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setBellOpen(false)}
                    className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-black">
                    ✕
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
                {notifs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-3xl mb-2">🔕</p>
                    <p className="text-sm font-semibold">No notifications in the last 24 hours</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifs.map(n => {
                      const isUnread = new Date(n.time).getTime() > lastReadAt;
                      return (
                        <div key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 transition ${isUnread ? 'bg-blue-50/50' : 'bg-white'}`}>
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm ${TYPE_COLOR[n.type] ?? 'bg-slate-100 text-slate-600'}`}>
                            {n.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">{n.title}</p>
                            <p className="text-[11px] text-slate-500 truncate">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(n.time)}</p>
                          </div>
                          {isUnread && (
                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-[10px] text-slate-400">{notifs.length} events · refreshes every 60s</p>
                <button onClick={loadNotifs}
                  className="text-[10px] font-black text-green-600 hover:text-green-800 transition">
                  ↻ Refresh
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
