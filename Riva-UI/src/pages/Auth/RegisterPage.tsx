import React, { useState } from 'react';
import { register, verifyOtp, resendOtp } from '../../api/auth';

type Step = 'form' | 'otp';

const RegisterPage: React.FC = () => {
  const [step, setStep]         = useState<Step>('form');
  const [email, setEmail]       = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirm] = useState('');
  const [otp, setOtp]           = useState('');
  const [otpMsg, setOtpMsg]     = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [busy, setBusy]         = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (password.length < 6)    { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      const res = await register({ username, email, password });
      setOtpMsg(res.message);
      setStep('otp');
    } catch (x: unknown) { setError(x instanceof Error ? x.message : 'Registration failed'); }
    finally { setBusy(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await verifyOtp({ email, otpCode: otp });
      window.location.href = '/login';
    } catch (x: unknown) { setError(x instanceof Error ? x.message : 'Verification failed'); }
    finally { setBusy(false); }
  };

  const handleResend = async () => {
    setError(null);
    try { await resendOtp(email); setOtpMsg('New OTP sent! Check your email.'); }
    catch (x: unknown) { setError(x instanceof Error ? x.message : 'Failed to resend'); }
  };

  const stepStates: Record<Step, 'active' | 'done' | 'pending'> = {
    form: step === 'form' ? 'active' : 'done',
    otp:  step === 'otp'  ? 'active' : 'pending',
  };

  return (
    <div className="bg-page min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">

        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5">
            <div className="logo-icon text-xl">R</div>
            <span className="text-2xl font-black text-slate-900">Digital<span className="text-green">Invitation</span></span>
          </a>
        </div>

        <div className="card-green">
          <div className="accent-bar" />
          <div className="p-8">

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {(['form','otp'] as Step[]).map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2">
                    <div className={`step-dot ${stepStates[s]}`}>
                      {stepStates[s] === 'done' ? '✓' : i + 1}
                    </div>
                    <span className="hidden text-xs font-bold text-slate-400 sm:block">
                      {s === 'form' ? 'Details' : 'Verify OTP'}
                    </span>
                  </div>
                  {i < 1 && <div className={`step-line ${stepStates[s] === 'done' ? 'done' : 'pending'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Form step */}
            {step === 'form' && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-slate-900">Create account ✨</h1>
                  <p className="text-slate-500 mt-1 text-sm">Join Riva and start creating invitations</p>
                </div>

                {error && <div className="alert-error"><span>⚠️</span><span>{error}</span></div>}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div><label className="block text-sm font-black text-slate-700 mb-1.5">Username</label><input className="input-green" value={username} onChange={e=>setUsername(e.target.value)} placeholder="johndoe" required /></div>
                  <div><label className="block text-sm font-black text-slate-700 mb-1.5">Email address</label><input type="email" className="input-green" value={email} onChange={e=>setEmail(e.target.value)} placeholder="john@example.com" required /></div>
                  <div><label className="block text-sm font-black text-slate-700 mb-1.5">Password</label><input type="password" className="input-green" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 6 characters" required /></div>
                  <div><label className="block text-sm font-black text-slate-700 mb-1.5">Confirm Password</label><input type="password" className="input-green" value={confirmPw} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter password" required /></div>
                  <button type="submit" disabled={busy} className="btn-green mt-2">
                    {busy ? '⏳ Creating Account...' : 'Create Account →'}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Already have an account?{' '}
                  <a href="/login" className="font-black text-green hover:underline">Sign In</a>
                </p>
              </>
            )}

            {/* OTP step */}
            {step === 'otp' && (
              <>
                <div className="mb-6 text-center">
                  <div className="otp-icon">📧</div>
                  <h1 className="text-2xl font-black text-slate-900">Check your email</h1>
                  <p className="text-sm text-slate-500 mt-2">{otpMsg}</p>
                  <p className="text-xs text-slate-400 mt-1">Sent to <strong className="text-slate-600">{email}</strong></p>
                </div>

                {error && <div className="alert-error"><span>⚠️</span><span>{error}</span></div>}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Enter 6-digit OTP</label>
                    <input type="text" maxLength={6} className="input-otp" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} placeholder="000000" required />
                    <p className="mt-2 text-center text-xs text-slate-400">⏱ OTP expires in 10 minutes</p>
                  </div>
                  <button type="submit" disabled={busy || otp.length !== 6} className="btn-green">
                    {busy ? '⏳ Verifying...' : '✓ Verify & Go to Login →'}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <button onClick={() => setStep('form')} className="font-medium text-slate-400 hover:text-slate-700 transition">← Change email</button>
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

export default RegisterPage;
