import React, { useEffect, useState } from 'react';
import { login, adminRegister, logout, getStoredRole, getStoredUsername } from '../../api/auth';
import { getUserProfile } from '../../api/user';
import AdminOtpModal from './components/AdminOtpModal';
import AdminLayout, { type AdminTab } from './components/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import AdminProfilePanel from './components/AdminProfilePanel';
import AdminSettingsPanel from './components/AdminSettingsPanel';
import AddTemplateForm from './components/AddTemplateForm';
import TemplateList from './components/TemplateList';
import CategoryManager from './components/CategoryManager';

type AuthStep = 'login' | 'register' | 'otp';

const lbl = "block text-sm font-black text-slate-700 mb-1.5";

const AdminPage: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(() => getStoredRole() === 'Admin');
  const [step,     setStep]     = useState<AuthStep>('login');
  const [otpEmail, setOtpEmail] = useState('');
  const [tab,      setTab]      = useState<AdminTab>('dashboard');
  const [refresh,  setRefresh]  = useState(0);

  const [eu,  setEu]  = useState('');
  const [pw,  setPw]  = useState('');
  const [un,  setUn]  = useState('');
  const [sk,  setSk]  = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [info,setInfo]= useState<string | null>(null);
  const [busy,setBusy]= useState(false);

  const [adminName, setAdminName] = useState(getStoredUsername() ?? 'Admin');

  useEffect(() => {
    if (!loggedIn) return;
    getUserProfile()
      .then(p => setAdminName(p.displayName || p.username))
      .catch(() => {});
  }, [loggedIn]);

  const doLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      const r = await login({ emailOrUsername: eu, password: pw });
      if (r.role !== 'Admin') { setErr('Admin accounts only.'); logout(); return; }
      setLoggedIn(true);
    } catch (x: unknown) { setErr(x instanceof Error ? x.message : 'Login failed'); }
    finally { setBusy(false); }
  };

  const doReg = async (e: React.SyntheticEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      const r = await adminRegister({ username: un, email: eu, password: pw, secretKey: sk });
      setOtpEmail(eu); setInfo(r.message); setStep('otp');
    } catch (x: unknown) { setErr(x instanceof Error ? x.message : 'Registration failed'); }
    finally { setBusy(false); }
  };

  const handleLogout = () => { logout(); setLoggedIn(false); setTab('dashboard'); };

  // ── OTP screen ───────────────────────────────────────────────────────────────
  if (step === 'otp') return (
    <AdminOtpModal email={otpEmail}
      onVerified={() => { setStep('login'); setInfo('Verified! Please log in.'); }}
      onBack={() => setStep('register')} />
  );

  // ── Auth gate ─────────────────────────────────────────────────────────────────
  if (!loggedIn) return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#14532d,#166534)' }}>
      <div className="card-green w-full max-w-md overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }}>
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black text-white shadow-lg">⚡</div>
          <h1 className="text-2xl font-black text-white">Admin Portal</h1>
          <p className="text-sm text-green-100 mt-1">Riva Invitation Platform</p>
        </div>
        <div className="p-8">
          <div className="tab-switcher">
            {(['login','register'] as const).map(s => (
              <button key={s} onClick={() => { setStep(s); setErr(null); setInfo(null); }}
                className={`tab-btn ${step === s ? 'active' : ''}`}>
                {s === 'login' ? '🔐 Login' : '📝 Register'}
              </button>
            ))}
          </div>
          {err  && <div className="alert-error" ><span>⚠️</span><span>{err}</span></div>}
          {info && <div className="alert-info"  ><span>ℹ️</span><span>{info}</span></div>}
          {step === 'login' ? (
            <form onSubmit={doLogin} className="space-y-4">
              <div>
                <label className={lbl}>Email or Username</label>
                <input className="input-green" value={eu} onChange={e => setEu(e.target.value)} placeholder="Enter email or username" required />
              </div>
              <div>
                <label className={lbl}>Password</label>
                <input type="password" className="input-green" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter password" required />
              </div>
              <button type="submit" disabled={busy} className="btn-green mt-2">
                {busy ? '⏳ Logging in…' : '🔐 Login to Admin'}
              </button>
            </form>
          ) : (
            <form onSubmit={doReg} className="space-y-4">
              <div>
                <label className={lbl}>Username</label>
                <input className="input-green" value={un} onChange={e => setUn(e.target.value)} placeholder="Admin username" required />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" className="input-green" value={eu} onChange={e => setEu(e.target.value)} placeholder="admin@example.com" required />
              </div>
              <div>
                <label className={lbl}>Password</label>
                <input type="password" className="input-green" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min 6 characters" required />
              </div>
              <div>
                <label className={lbl}>Admin Secret Key</label>
                <input type="password" className="input-green" value={sk} onChange={e => setSk(e.target.value)} placeholder="Ask your system admin" required />
              </div>
              <button type="submit" disabled={busy} className="btn-green mt-2">
                {busy ? '⏳ Registering…' : '📝 Register & Send OTP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout tab={tab} setTab={setTab} adminName={adminName} onLogout={handleLogout}>
      {tab === 'dashboard'    && <AdminDashboard />}
      {tab === 'profile'      && <AdminProfilePanel onNameChange={setAdminName} />}
      {tab === 'settings'     && <AdminSettingsPanel onLogout={handleLogout} />}
      {tab === 'templates'    && (
        <div className="space-y-4">
          <h1 className="text-2xl font-black text-slate-900">Templates</h1>
          <div className="card-green rounded-2xl p-6">
            <TemplateList key={refresh} />
          </div>
        </div>
      )}
      {tab === 'add-template' && (
        <div className="space-y-4">
          <h1 className="text-2xl font-black text-slate-900">Add Template</h1>
          <div className="card-green rounded-2xl p-6">
            <AddTemplateForm onSuccess={() => { setRefresh(n => n + 1); setTab('templates'); }} />
          </div>
        </div>
      )}
      {tab === 'categories'   && (
        <div className="space-y-4">
          <h1 className="text-2xl font-black text-slate-900">Categories</h1>
          <div className="card-green rounded-2xl p-6">
            <CategoryManager />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPage;
