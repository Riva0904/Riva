import React, { useState } from 'react';
import { login, adminRegister, logout, getStoredRole } from '../../api/auth';
import AdminOtpModal from './components/AdminOtpModal';
import AddTemplateForm from './components/AddTemplateForm';
import TemplateList from './components/TemplateList';

type AuthStep = 'login' | 'register' | 'otp';
type AdminTab = 'templates' | 'add-template';

const inp = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-purple-50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-2xl text-white">R</div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Riva Invitation Platform</p>
        </div>
        <div className="mb-6 flex rounded-xl border border-slate-200 p-1">
          {(['login','register'] as const).map(s => (
            <button key={s} onClick={() => { setStep(s); setErr(null); setInfo(null); }}
              className={"flex-1 rounded-lg py-2 text-sm font-semibold transition " + (step===s ? 'bg-purple-600 text-white' : 'text-slate-600')}>
              {s === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>
        {err && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>}
        {info && <div className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{info}</div>}
        {step === 'login' ? (
          <form onSubmit={doLogin} className="space-y-4">
            <div><label className={lbl}>Email or Username</label><input className={inp} value={eu} onChange={e=>setEu(e.target.value)} required /></div>
            <div><label className={lbl}>Password</label><input type="password" className={inp} value={pw} onChange={e=>setPw(e.target.value)} required /></div>
            <button type="submit" disabled={busy} className="w-full rounded-full bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              {busy ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={doReg} className="space-y-4">
            <div><label className={lbl}>Username</label><input className={inp} value={un} onChange={e=>setUn(e.target.value)} required /></div>
            <div><label className={lbl}>Email</label><input type="email" className={inp} value={eu} onChange={e=>setEu(e.target.value)} required /></div>
            <div><label className={lbl}>Password</label><input type="password" className={inp} value={pw} onChange={e=>setPw(e.target.value)} required /></div>
            <div><label className={lbl}>Admin Secret Key</label><input type="password" className={inp} value={sk} onChange={e=>setSk(e.target.value)} placeholder="Ask your system admin" required /></div>
            <button type="submit" disabled={busy} className="w-full rounded-full bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              {busy ? 'Registering...' : 'Register & Send OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">R</div>
            <span className="font-bold text-slate-900">Riva Admin</span>
          </div>
          <button onClick={() => { logout(); setLoggedIn(false); }}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Logout</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          {([['templates','All Templates'],['add-template','Add Template']] as [AdminTab,string][]).map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={"px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition " + (tab===k ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500')}>
              {l}
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          {tab === 'templates' && <TemplateList key={refresh} />}
          {tab === 'add-template' && <AddTemplateForm onSuccess={() => { setRefresh(n=>n+1); setTab('templates'); }} />}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
