import React, { useState } from 'react';
import { login, adminRegister, logout, getStoredRole } from '../../api/auth';
import AdminOtpModal from './components/AdminOtpModal';
import AddTemplateForm from './components/AddTemplateForm';
import TemplateList from './components/TemplateList';
import CategoryManager from './components/CategoryManager';

type AuthStep = 'login' | 'register' | 'otp';
type AdminTab = 'templates' | 'add-template' | 'categories';

const lbl = "block text-sm font-black text-slate-700 mb-1.5";

const AdminPage: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(() => getStoredRole() === 'Admin');
  const [step, setStep] = useState<AuthStep>('login');
  const [otpEmail, setOtpEmail] = useState('');
  const [tab, setTab] = useState<AdminTab>('templates');
  const [refresh, setRefresh] = useState(0);
  const [eu, setEu] = useState('');
  const [pw, setPw] = useState('');
  const [un, setUn] = useState('');
  const [sk, setSk] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [info, setInfo] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      const r = await login({ emailOrUsername: eu, password: pw });
      if (r.role !== 'Admin') { setErr('Admin accounts only.'); logout(); return; }
      setLoggedIn(true);
    } catch (x: unknown) { setErr(x instanceof Error ? x.message : 'Failed'); }
    finally { setBusy(false); }
  };

  const doReg = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      const r = await adminRegister({ username: un, email: eu, password: pw, secretKey: sk });
      setOtpEmail(eu); setInfo(r.message); setStep('otp');
    } catch (x: unknown) { setErr(x instanceof Error ? x.message : 'Failed'); }
    finally { setBusy(false); }
  };

  if (step === 'otp') return (
    <AdminOtpModal email={otpEmail}
      onVerified={() => { setStep('login'); setInfo('Verified! Please log in.'); }}
      onBack={() => setStep('register')} />
  );

  if (!loggedIn) return (
    <div className="bg-dark-green flex min-h-screen items-center justify-center p-4">
      <div className="card-green w-full max-w-md">
        <div className="bg-green-primary px-8 pt-8 pb-6 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black text-white shadow-lg">⚡</div>
          <h1 className="text-2xl font-black text-white">Admin Portal</h1>
          <p className="text-sm text-green-100 mt-1">Riva Invitation Platform</p>
        </div>
        <div className="p-8">
          <div className="tab-switcher">
            {(['login','register'] as const).map(s => (
              <button key={s} onClick={() => { setStep(s); setErr(null); setInfo(null); }}
                className={`tab-btn ${step===s ? 'active' : ''}`}>
                {s === 'login' ? '🔐 Login' : '📝 Register'}
              </button>
            ))}
          </div>
          {err  && <div className="alert-error" ><span>⚠️</span><span>{err}</span></div>}
          {info && <div className="alert-info"  ><span>ℹ️</span><span>{info}</span></div>}
          {step === 'login' ? (
            <form onSubmit={doLogin} className="space-y-4">
              <div><label className={lbl}>Email or Username</label><input className="input-green" value={eu} onChange={e=>setEu(e.target.value)} placeholder="Enter email or username" required /></div>
              <div><label className={lbl}>Password</label><input type="password" className="input-green" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Enter password" required /></div>
              <button type="submit" disabled={busy} className="btn-green mt-2">
                {busy ? '⏳ Logging in...' : '🔐 Login to Admin'}
              </button>
            </form>
          ) : (
            <form onSubmit={doReg} className="space-y-4">
              <div><label className={lbl}>Username</label><input className="input-green" value={un} onChange={e=>setUn(e.target.value)} placeholder="Admin username" required /></div>
              <div><label className={lbl}>Email</label><input type="email" className="input-green" value={eu} onChange={e=>setEu(e.target.value)} placeholder="admin@example.com" required /></div>
              <div><label className={lbl}>Password</label><input type="password" className="input-green" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Min 6 characters" required /></div>
              <div><label className={lbl}>Admin Secret Key</label><input type="password" className="input-green" value={sk} onChange={e=>setSk(e.target.value)} placeholder="Ask your system admin" required /></div>
              <button type="submit" disabled={busy} className="btn-green mt-2">
                {busy ? '⏳ Registering...' : '📝 Register & Send OTP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-light-green min-h-screen">
      <header className="dashboard-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-icon text-base">R</div>
            <span className="font-black text-slate-900">Riva <span className="text-green">Admin</span></span>
          </div>
          <button onClick={() => { logout(); setLoggedIn(false); }} className="navbar-btn-outline">Logout</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex gap-2 border-b-2 border-green-100">
          {([
            ['templates',    'All Templates'],
            ['add-template', '+ Add Template'],
            ['categories',   '🏷 Categories'],
          ] as [AdminTab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`page-tab ${tab === k ? 'active' : ''}`}>{l}</button>
          ))}
        </div>
        <div className="card-green rounded-2xl p-6">
          {tab === 'templates'    && <TemplateList key={refresh} />}
          {tab === 'add-template' && <AddTemplateForm onSuccess={() => { setRefresh(n=>n+1); setTab('templates'); }} />}
          {tab === 'categories'   && <CategoryManager />}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
