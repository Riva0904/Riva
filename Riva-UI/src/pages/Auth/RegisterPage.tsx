import React, { useState } from 'react';
import { register, verifyOtp, resendOtp } from '../../api/auth';

type Step = 'form' | 'otp' | 'success';

const inp = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [otp, setOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      const res = await register({ username, email, password });
      setOtpMessage(res.message);
      setStep('otp');
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Registration failed');
    } finally { setBusy(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await verifyOtp({ email, otpCode: otp });
      setStep('success');
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Verification failed');
    } finally { setBusy(false); }
  };

  const handleResend = async () => {
    setError(null);
    try {
      await resendOtp(email);
      setOtpMessage('New OTP sent! Check your email.');
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Failed to resend');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg">R</div>
            <span className="text-xl font-bold text-slate-900">Digital<span className="text-purple-600">Invitation</span></span>
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-purple-900/10 p-8">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {(['form', 'otp', 'success'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step === s ? 'bg-purple-600 text-white scale-110' :
                  ['form','otp','success'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {['form','otp','success'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                {i < 2 && <div className={`h-0.5 w-10 rounded transition-all ${['form','otp','success'].indexOf(step) > i ? 'bg-green-500' : 'bg-slate-100'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* ── Step 1: Form ── */}
          {step === 'form' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
                <p className="text-sm text-slate-500 mt-1">Join Riva and start creating invitations</p>
              </div>

              {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">{error}</div>}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className={lbl}>Username</label>
                  <input className={inp} value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="johndoe" required />
                </div>
                <div>
                  <label className={lbl}>Email address</label>
                  <input type="email" className={inp} value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com" required />
                </div>
                <div>
                  <label className={lbl}>Password</label>
                  <input type="password" className={inp} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters" required />
                </div>
                <div>
                  <label className={lbl}>Confirm Password</label>
                  <input type="password" className={inp} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Re-enter password" required />
                </div>
                <button type="submit" disabled={busy}
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 disabled:opacity-50 transition mt-2">
                  {busy ? 'Creating Account...' : 'Create Account →'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Already have an account?{' '}
                <a href="/login" className="font-semibold text-purple-600 hover:underline">Login</a>
              </p>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-3xl">📧</div>
                <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
                <p className="text-sm text-slate-500 mt-2">{otpMessage}</p>
                <p className="text-xs text-slate-400 mt-1">Sent to <strong>{email}</strong></p>
              </div>

              {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className={lbl}>Enter 6-digit OTP</label>
                  <input
                    type="text" maxLength={6}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000" required
                  />
                  <p className="text-xs text-slate-400 mt-1.5 text-center">OTP expires in 10 minutes</p>
                </div>
                <button type="submit" disabled={busy || otp.length !== 6}
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 disabled:opacity-50 transition">
                  {busy ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button onClick={() => setStep('form')} className="text-slate-400 hover:text-slate-600">← Change email</button>
                <button onClick={handleResend} className="font-medium text-purple-600 hover:underline">Resend OTP</button>
              </div>
            </>
          )}

          {/* ── Step 3: Success ── */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-5xl">🎉</div>
              <h1 className="text-2xl font-bold text-slate-900">You're verified!</h1>
              <p className="text-slate-500 mt-2 mb-8">Your account has been created and verified.<br />You can now login and start creating invitations.</p>
              <a href="/login"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-semibold text-white shadow-lg hover:opacity-95 transition">
                Go to Login →
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 Riva Digital Invitation Platform
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
