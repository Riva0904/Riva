import React, { useState } from 'react';
import { register, verifyOtp, resendOtp } from '../../api/auth';

type Step = 'form' | 'otp';

// Verification status for pending-account UX
type PendingState = { email: string } | null;

const RegisterPage: React.FC = () => {
  const [step,      setStep]    = useState<Step>('form');
  const [email,     setEmail]   = useState('');
  const [username,  setUsername] = useState('');
  const [password,  setPassword] = useState('');
  const [confirmPw, setConfirm] = useState('');
  const [otp,       setOtp]     = useState('');
  const [otpMsg,    setOtpMsg]  = useState('');
  const [error,     setError]   = useState<string | null>(null);
  const [info,      setInfo]    = useState<string | null>(null);
  const [busy,      setBusy]    = useState(false);

  // Set when API indicates user has an unverified pending account
  const [pending,   setPending] = useState<PendingState>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null); setPending(null);
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (password.length < 6)    { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      const res = await register({ username, email, password });
      setOtpMsg(res.message);
      setStep('otp');
    } catch (x: unknown) {
      const msg = x instanceof Error ? x.message : 'Registration failed';
      // Backend returns "pending_verification" hint when an unverified account
      // exists — surface the recovery panel instead of a plain error.
      if (msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('not completed')) {
        setPending({ email });
      } else {
        setError(msg);
      }
    } finally { setBusy(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null); setBusy(true);
    try {
      const res = await verifyOtp({ email, otpCode: otp });
      window.location.href = res.token ? '/' : '/login';
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Verification failed');
    } finally { setBusy(false); }
  };

  const handleResend = async (targetEmail = email) => {
    setError(null); setInfo(null);
    try {
      await resendOtp(targetEmail);
      setInfo('New OTP sent! Check your email.');
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Failed to resend OTP');
    }
  };

  const handleContinueVerification = () => {
    if (pending) setEmail(pending.email);
    setPending(null);
    setError(null);
    setOtpMsg('Enter the OTP previously sent to your email, or request a new one.');
    setStep('otp');
  };

  const handleResendAndContinue = async () => {
    if (!pending) return;
    await handleResend(pending.email);
    setEmail(pending.email);
    setPending(null);
    setOtpMsg('A new OTP has been sent. Please verify to complete registration.');
    setStep('otp');
  };

  const stepState = (s: Step): 'active' | 'done' | 'pending' =>
    s === step ? 'active' : (step === 'otp' && s === 'form') ? 'done' : 'pending';

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

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {(['form', 'otp'] as Step[]).map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2">
                    <div className={`step-dot ${stepState(s)}`}>
                      {stepState(s) === 'done' ? '✓' : i + 1}
                    </div>
                    <span className="hidden text-xs font-bold text-slate-400 sm:block">
                      {s === 'form' ? 'Details' : 'Verify OTP'}
                    </span>
                  </div>
                  {i < 1 && <div className={`step-line ${stepState(s) === 'done' ? 'done' : 'pending'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* ── Registration form ── */}
            {step === 'form' && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-slate-900">Create account ✨</h1>
                  <p className="text-slate-500 mt-1 text-sm">Join Riva and start creating invitations</p>
                </div>

                {error && <div className="alert-error mb-4"><span>⚠️</span><span>{error}</span></div>}

                {/* Pending-verification recovery panel */}
                {pending && (
                  <div className="mb-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl">⏳</span>
                      <div>
                        <p className="font-black text-amber-800 text-sm">Registration not completed</p>
                        <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                          An unverified account already exists for{' '}
                          <strong className="text-amber-900">{pending.email}</strong>.
                          Choose an option below to proceed.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <button onClick={handleContinueVerification}
                        className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-black text-white hover:bg-amber-600 transition">
                        Continue Verification →
                      </button>
                      <button onClick={handleResendAndContinue}
                        className="w-full rounded-xl border-2 border-amber-300 bg-white py-2.5 text-sm font-black text-amber-700 hover:bg-amber-50 transition">
                        Resend OTP &amp; Verify
                      </button>
                      <button onClick={() => setPending(null)}
                        className="w-full rounded-xl border-2 border-slate-200 py-2.5 text-sm font-black text-slate-500 hover:bg-slate-50 transition">
                        Use Different Email
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Username</label>
                    <input className="input-green" value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="johndoe" required minLength={3} />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Email address</label>
                    <input type="email" className="input-green" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Password</label>
                    <input type="password" className="input-green" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters" required />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Confirm Password</label>
                    <input type="password" className="input-green" value={confirmPw} onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter password" required />
                  </div>
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

            {/* ── OTP verification step ── */}
            {step === 'otp' && (
              <>
                <div className="mb-6 text-center">
                  <div className="otp-icon">📧</div>
                  <h1 className="text-2xl font-black text-slate-900">Check your email</h1>
                  <p className="text-sm text-slate-500 mt-2">{otpMsg}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Sent to <strong className="text-slate-600">{email}</strong>
                  </p>
                </div>

                {error && <div className="alert-error mb-4"><span>⚠️</span><span>{error}</span></div>}
                {info  && <div className="alert-success mb-4"><span>✅</span><span>{info}</span></div>}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Enter 6-digit OTP</label>
                    <input type="text" maxLength={6} className="input-otp"
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000" required autoFocus />
                    <p className="mt-2 text-center text-xs text-slate-400">⏱ OTP expires in 10 minutes</p>
                  </div>
                  <button type="submit" disabled={busy || otp.length !== 6} className="btn-green">
                    {busy ? '⏳ Verifying...' : '✓ Verify &amp; Continue →'}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <button onClick={() => { setStep('form'); setError(null); setInfo(null); setOtp(''); }}
                    className="font-medium text-slate-400 hover:text-slate-700 transition">
                    ← Change email
                  </button>
                  <button onClick={() => handleResend()}
                    className="font-black text-green hover:underline">
                    Resend OTP
                  </button>
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
