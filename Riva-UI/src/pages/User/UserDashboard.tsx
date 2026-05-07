import React, { useEffect, useState } from 'react';
import { login, register, logout, getStoredRole } from '../../api/auth';
import { getUserSession, type UserSession } from '../../api/analysis';
import { motion } from 'framer-motion';
import SessionPanel from './components/SessionPanel';
import UserTemplateGallery from './components/UserTemplateGallery';
import { getStoredAuthToken } from '../../api/client';

type Tab = 'overview' | 'templates';
type AuthMode = 'login' | 'register';

const lbl = "block text-sm font-black text-slate-700 mb-1.5";

const UserDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getStoredAuthToken());
  const [session,    setSession]    = useState<UserSession | null>(null);
  const [tab,        setTab]        = useState<Tab>('overview');
  const [mode,       setMode]       = useState<AuthMode>('login');

  const [eu, setEu] = useState('');
  const [pw, setPw] = useState('');
  const [un, setUn] = useState('');
  const [em, setEm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info,  setInfo]  = useState<string | null>(null);
  const [busy,  setBusy]  = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      getUserSession()
        .then(setSession)
        .catch(() => { setIsLoggedIn(false); logout(); });
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setBusy(true);
    try { await login({ emailOrUsername: eu, password: pw }); setIsLoggedIn(true); }
    catch (x: unknown) { setError(x instanceof Error ? x.message : 'Login failed'); }
    finally { setBusy(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setBusy(true);
    try {
      const res = await register({ username: un, email: em, password: pw });
      setInfo(res.message + ' — Please login.');
      setMode('login'); setUn(''); setEm(''); setPw('');
    } catch (x: unknown) { setError(x instanceof Error ? x.message : 'Registration failed'); }
    finally { setBusy(false); }
  };

  const handleLogout = () => { logout(); setIsLoggedIn(false); setSession(null); };

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="bg-page flex min-h-screen items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="card-green w-full max-w-md">
          <div className="bg-green-primary px-8 pt-8 pb-6 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-lg">🎉</div>
            <h1 className="text-2xl font-black text-white">Welcome to Riva</h1>
            <p className="text-sm text-green-100 mt-1">Create beautiful digital invitations</p>
          </div>
          <div className="p-8">
            <div className="tab-switcher">
              {(['login', 'register'] as AuthMode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(null); setInfo(null); }}
                  className={`tab-btn ${mode === m ? 'active' : ''}`}>
                  {m === 'login' ? '🔐 Login' : '✨ Register'}
                </button>
              ))}
            </div>

            {error && <div className="alert-error"><span>⚠️</span><span>{error}</span></div>}
            {info  && <div className="alert-success"><span>✅</span><span>{info}</span></div>}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div><label className={lbl}>Email or Username</label>
                  <input className="input-green" value={eu} onChange={e=>setEu(e.target.value)} required placeholder="Enter email or username" /></div>
                <div><label className={lbl}>Password</label>
                  <input type="password" className="input-green" value={pw} onChange={e=>setPw(e.target.value)} required placeholder="Enter password" /></div>
                <div className="flex items-center justify-between text-xs">
                  <span />
                  <a href="/forgot-password" className="font-black text-green hover:underline">Forgot password?</a>
                </div>
                <button type="submit" disabled={busy} className="btn-green mt-1">
                  {busy ? '⏳ Signing in…' : 'Sign In →'}
                </button>
                <p className="text-center text-xs text-slate-400">
                  Admin? <a href="/admin" className="font-black text-green hover:underline">Admin Portal</a>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div><label className={lbl}>Username</label>
                  <input className="input-green" value={un} onChange={e=>setUn(e.target.value)} required placeholder="Choose a username" /></div>
                <div><label className={lbl}>Email</label>
                  <input type="email" className="input-green" value={em} onChange={e=>setEm(e.target.value)} required placeholder="your@email.com" /></div>
                <div><label className={lbl}>Password</label>
                  <input type="password" className="input-green" value={pw} onChange={e=>setPw(e.target.value)} required placeholder="Min 6 characters" /></div>
                <button type="submit" disabled={busy} className="btn-green mt-1">
                  {busy ? '⏳ Creating account…' : 'Create Account →'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-light-green min-h-screen">

      {/* Header */}
      <header className="dashboard-header shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-icon text-base">R</div>
            <div>
              <span className="font-black text-slate-900">Riva <span className="text-green">Dashboard</span></span>
              {session && (
                <span className="ml-2 text-sm text-slate-400 hidden sm:inline">
                  Welcome, {session.username} 👋
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/my-invitations" className="navbar-btn-outline text-sm hidden sm:inline-flex">🎉 My Invitations</a>
            <a href="/profile"        className="navbar-btn-outline text-sm hidden sm:inline-flex">👤 Profile</a>
            {getStoredRole() === 'Admin' && (
              <a href="/admin" className="navbar-btn-primary">Admin</a>
            )}
            <button onClick={handleLogout} className="navbar-btn-outline text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b-2 border-green-100">
          {([
            { key: 'overview'   as Tab, label: '📊 Overview' },
            { key: 'templates'  as Tab, label: '🎨 Browse Templates' },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`page-tab ${tab === t.key ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Left — Session Panel */}
            <div className="lg:col-span-1">
              {session ? (
                <SessionPanel session={session} />
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton h-28 rounded-2xl" />
                  ))}
                </div>
              )}
            </div>

            {/* Right — Analytics + Quick Actions */}
            <div className="lg:col-span-2 space-y-5">

              {/* Session info card */}
              <div className="card-green p-5">
                <h3 className="text-lg font-black text-slate-900 mb-4">Session Information</h3>
                {session ? (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Session Status', value: '🟢 Active',        cls: 'text-green-600 font-black' },
                      { label: 'Account Role',   value: session.role,       cls: 'text-slate-800 font-black' },
                      { label: 'Free Templates', value: `${session.templates.free} available`, cls: 'text-green-700 font-semibold' },
                      { label: 'Premium Templates', value: `${session.templates.paid} available`, cls: 'text-amber-700 font-semibold' },
                    ].map(item => (
                      <motion.div key={item.label} whileHover={{ y: -1 }}
                        className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-400 font-bold mb-1">{item.label}</p>
                        <p className={item.cls}>{item.value}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="card-green p-5">
                <h3 className="text-lg font-black text-slate-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: '🎉', label: 'My Invitations',   href: '/my-invitations' },
                    { icon: '🎨', label: 'New Invitation',   href: '/dashboard', action: () => setTab('templates') },
                    { icon: '👤', label: 'My Profile',       href: '/profile' },
                    { icon: '⚙️', label: 'Settings',         href: '/settings' },
                  ].map(a => (
                    <motion.a key={a.label}
                      href={a.href}
                      onClick={a.action ? (e) => { e.preventDefault(); a.action!(); } : undefined}
                      whileHover={{ y: -4 }}
                      className="flex flex-col items-center gap-2 rounded-2xl border-2 border-green-100 bg-green-50 p-4 text-center hover:border-green-300 hover:bg-green-100 transition cursor-pointer">
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-xs font-black text-slate-700">{a.label}</span>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Access info */}
              {session && (
                <div className="rounded-2xl bg-light-green p-4 text-sm text-green-dark border-2 border-green-100">
                  <strong>🎯 Your Access:</strong> You have access to {session.templates.free} free templates.
                  {session.templates.paid > 0 && ` ${session.templates.paid} premium templates are also available.`}
                  {' '}<a href="/my-invitations" className="font-black text-green hover:underline">View your invitations →</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates */}
        {tab === 'templates' && (
          <div className="card-green p-6">
            <div className="mb-5">
              <h3 className="text-lg font-black text-slate-900">Browse Invitation Templates</h3>
              <p className="text-sm text-slate-500 mt-0.5">Choose a template to start creating your digital invitation</p>
            </div>
            <UserTemplateGallery />
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
