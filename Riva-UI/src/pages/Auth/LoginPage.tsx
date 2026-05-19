import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, verifyOtp, resendOtp } from '../../api/auth';

type Step = 'login' | 'verify-otp';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('login');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(s => (s <= 1 ? (clearInterval(t), 0) : s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const res = await login({ emailOrUsername, password });
      if (res.role === 'Admin') {
        setError('Admin accounts must sign in via the Admin Portal below.');
        return;
      }
      navigate('/dashboard');
    } catch (x: unknown) {
      const msg = x instanceof Error ? x.message : 'Login failed';
      if (msg.startsWith('TOO_MANY_REQUESTS:')) {
        setCooldown(parseInt(msg.split(':')[1]) || 900);
      } else if (msg.toLowerCase().includes('not verified')) {
        setPendingEmail(emailOrUsername.includes('@') ? emailOrUsername : '');
        setStep('verify-otp');
        setInfo('Your account is not verified. Enter the OTP sent to your email.');
      } else {
        setError(msg);
      }
    } finally { setBusy(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const email = pendingEmail || emailOrUsername;
      await verifyOtp({ email, otpCode: otp });
      setInfo('Account verified! Logging you in...');
      const res = await login({ emailOrUsername, password });
      if (res.role === 'Admin') { setError('Admin accounts must sign in via the Admin Portal.'); return; }
      navigate('/dashboard');
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Verification failed');
    } finally { setBusy(false); }
  };

  const handleResend = async () => {
    setError(null);
    try {
      await resendOtp(pendingEmail || emailOrUsername);
      setInfo('New OTP sent! Check your email.');
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Failed to resend OTP');
    }
  };

  return (
    <div className="bg-page min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">

        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5">
            <div className="logo-icon text-xl">R</div>
            <span className="text-2xl font-black text-slate-900">
              Digital<span className="text-green">Invitation</span>
            </span>
          </a>
        </div>

        <div className="card-green">
          <div className="accent-bar" />
          <div className="p-8">

            {/* Login Step */}
            {step === 'login' && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-slate-900">Welcome back 👋</h1>
                  <p className="text-slate-500 mt-1 text-sm">Sign in to your account to continue</p>
                </div>

                {error && <div className="alert-error"><span>⚠️</span><span>{error}</span></div>}

                {cooldown > 0 && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 flex items-center gap-3">
                    <span className="text-xl">⏱️</span>
                    <div>
                      <p className="font-black">Too many attempts</p>
                      <p className="text-xs mt-0.5">
                        Please wait{' '}
                        <span className="font-black text-amber-900 tabular-nums">
                          {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}
                        </span>
                        {' '}before trying again.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Email or Username</label>
                    <input className="input-green" value={emailOrUsername} onChange={e => setEmailOrUsername(e.target.value)} placeholder="Enter email or username" required />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-black text-slate-700">Password</label>
                      <a href="/forgot-password" className="text-xs font-black text-green hover:underline">Forgot Password?</a>
                    </div>
                    <input type="password" className="input-green" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                  </div>
                  <button type="submit" disabled={busy || cooldown > 0} className="btn-green mt-2">
                    {cooldown > 0
                      ? `⏱ Wait ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}`
                      : busy ? '⏳ Signing in...' : 'Sign In →'}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs font-black text-slate-400">OR</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="space-y-3">
                  <a href="/register" className="btn-green-outline">🎉 Create new account</a>
                  <a href="/admin"    className="btn-green-soft">⚡ Admin Portal</a>
                </div>
              </>
            )}

            {/* OTP Step */}
            {step === 'verify-otp' && (
              <>
                <div className="mb-7 text-center">
                  <div className="otp-icon">📧</div>
                  <h1 className="text-2xl font-black text-slate-900">Verify your account</h1>
                  <p className="text-sm text-slate-500 mt-2">Enter the 6-digit OTP sent to your email</p>
                </div>

                {error && <div className="alert-error"><span>⚠️</span><span>{error}</span></div>}
                {info  && <div className="alert-info" ><span>ℹ️</span><span>{info}</span></div>}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Your Email</label>
                    <input type="email" className="input-green" value={pendingEmail} onChange={e => setPendingEmail(e.target.value)} placeholder="Enter your registered email" required />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">OTP Code</label>
                    <input type="text" maxLength={6} className="input-otp" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} placeholder="000000" required />
                    <p className="mt-2 text-center text-xs text-slate-400">⏱ OTP expires in 10 minutes</p>
                  </div>
                  <button type="submit" disabled={busy || otp.length !== 6} className="btn-green">
                    {busy ? '⏳ Verifying...' : '✓ Verify & Login'}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <button onClick={() => { setStep('login'); setError(null); setInfo(null); setOtp(''); }} className="font-medium text-slate-400 hover:text-slate-700 transition">← Back to Login</button>
                  <button onClick={handleResend} className="font-black text-green hover:underline">Resend OTP</button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">© 2025 Riva Digital Invitation Platform</p>
      </div>
    </div>
  );
};

export default LoginPage;
