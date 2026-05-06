import React, { useEffect, useState } from 'react';
import { login, register, logout, getStoredRole } from '../../api/auth';
import { getUserSession, type UserSession } from '../../api/analysis';
import SessionPanel from './components/SessionPanel';
import UserTemplateGallery from './components/UserTemplateGallery';
import { getStoredAuthToken } from '../../api/client';

type Tab = 'session' | 'templates';
type AuthMode = 'login' | 'register';

const inp = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100";
const lbl = "block text-sm font-medium text-slate-700 mb-1";

const UserDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getStoredAuthToken());
  const [session, setSession] = useState<UserSession | null>(null);
  const [tab, setTab] = useState<Tab>('session');
  const [mode, setMode] = useState<AuthMode>('login');

  // Auth form state
  const [eu, setEu] = useState('');
  const [pw, setPw] = useState('');
  const [un, setUn] = useState('');
  const [em, setEm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isLoggedIn) loadSession();
  }, [isLoggedIn]);

  const loadSession = async () => {
    try {
      const s = await getUserSession();
      setSession(s);
    } catch {
      setIsLoggedIn(false);
      logout();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setBusy(true);
    try {
      await login({ emailOrUsername: eu, password: pw });
      setIsLoggedIn(true);
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Login failed');
    } finally { setBusy(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setBusy(true);
    try {
      const res = await register({ username: un, email: em, password: pw });
      setInfo(res.message + ' — Please login.');
      setMode('login');
      setUn(''); setEm(''); setPw('');
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Registration failed');
    } finally { setBusy(false); }
  };

  const handleLogout = () => { logout(); setIsLoggedIn(false); setSession(null); };

  // ── Auth Gate ──────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-2xl text-white">🎉</div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome to Riva</h1>
            <p className="text-sm text-slate-500 mt-1">Create beautiful digital invitations</p>
          </div>

          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl border border-slate-200 p-1">
            {(['login', 'register'] as AuthMode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); setInfo(null); }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === m ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}>
                {m === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {info && <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{info}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div><label className={lbl}>Email or Username</label>
                <input className={inp} value={eu} onChange={e => setEu(e.target.value)} required placeholder="Enter email or username" /></div>
              <div><label className={lbl}>Password</label>
                <input type="password" className={inp} value={pw} onChange={e => setPw(e.target.value)} required placeholder="Enter password" /></div>
              <button type="submit" disabled={busy}
                className="w-full rounded-full bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition">
                {busy ? 'Logging in...' : 'Login'}
              </button>
              <p className="text-center text-xs text-slate-400">
                Admin? <a href="/admin" className="text-purple-600 hover:underline">Go to Admin Portal</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div><label className={lbl}>Username</label>
                <input className={inp} value={un} onChange={e => setUn(e.target.value)} required placeholder="Choose a username" /></div>
              <div><label className={lbl}>Email</label>
                <input type="email" className={inp} value={em} onChange={e => setEm(e.target.value)} required placeholder="your@email.com" /></div>
              <div><label className={lbl}>Password</label>
                <input type="password" className={inp} value={pw} onChange={e => setPw(e.target.value)} required placeholder="Min 6 characters" /></div>
              <button type="submit" disabled={busy}
                className="w-full rounded-full bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition">
                {busy ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── User Dashboard ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">R</div>
            <div>
              <span className="font-bold text-slate-900">Riva Invitations</span>
              {session && <span className="ml-2 text-sm text-slate-400">Welcome, {session.username}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStoredRole() === 'Admin' && (
              <a href="/admin"
                className="rounded-full bg-purple-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-purple-700">
                Admin Panel
              </a>
            )}
            <button onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          {([
            { key: 'session' as Tab, label: '👤 My Session' },
            { key: 'templates' as Tab, label: '🎨 Browse Templates' },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${tab === t.key ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'session' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              {session ? <SessionPanel session={session} /> : (
                <div className="animate-pulse space-y-4">
                  <div className="h-40 rounded-2xl bg-slate-200" />
                  <div className="h-24 rounded-2xl bg-slate-200" />
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Session Analysis</h3>
                {session ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-slate-400">Session Status</p>
                        <p className="mt-1 flex items-center gap-1 font-semibold text-green-600">
                          <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                          Active
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-slate-400">Account Role</p>
                        <p className="mt-1 font-semibold text-slate-800">{session.role}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-slate-400">Available Templates</p>
                        <p className="mt-1 font-semibold text-slate-800">{session.templates.total} total</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-slate-400">Free Access</p>
                        <p className="mt-1 font-semibold text-green-700">{session.templates.free} templates</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-purple-50 p-4 text-sm text-purple-700">
                      <strong>🎯 Your Access:</strong> You have free access to {session.templates.free} templates.
                      {session.templates.paid > 0 && ` ${session.templates.paid} premium templates available for purchase.`}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'templates' && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900">Browse Invitation Templates</h3>
              <p className="text-sm text-slate-500">Choose a template to create your digital invitation</p>
            </div>
            <UserTemplateGallery />
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
