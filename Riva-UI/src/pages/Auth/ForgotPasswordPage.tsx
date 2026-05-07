import React, { useState } from 'react';
import { forgotPassword, resetPassword } from '../../api/auth';

type Step = 'email' | 'reset' | 'done';

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep]               = useState<Step>('email');
  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [newPassword, setNewPw]       = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [error, setError]             = useState<string | null>(null);
  const [busy, setBusy]               = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try { await forgotPassword(email); setStep('reset'); }
    catch (x: unknown) { setError(x instanceof Error ? x.message : 'Failed to send OTP'); }
    finally { setBusy(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6)          { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try { await resetPassword(email, otp, newPassword); setStep('done'); }
    catch (x: unknown) { setError(x instanceof Error ? x.message : 'Reset failed'); }
    finally { setBusy(false); }
  };

  const handleResend = async () => {
    setError(null);
    try { await forgotPassword(email); }
    catch (x: unknown) { setError(x instanceof Error ? x.message : 'Failed to resend OTP'); }
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
            {step !== 'done' && (
              <div className="flex items-center justify-center gap-3 mb-8">
                {['email','reset'].map((s, i) => (
                  <React.Fragment key={s}>
                    <div className="flex items-center gap-2">
                      <div className={`step-dot ${step === s ? 'active' : step === 'reset' && i === 0 ? 'done' : 'pending'}`}>
                        {step === 'reset' && i === 0 ? '✓' : i + 1}
                      </div>
                      <span className="hidden text-xs font-bold text-slate-400 sm:block">
                        {s === 'email' ? 'Your Email' : 'New Password'}
                      </span>
                    </div>
                    {i < 1 && <div className={`step-line ${step === 'reset' ? 'done' : 'pending'}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Step 1 */}
            {step === 'email' && (
              <>
                <div className="mb-6 text-center">
                  <div className="otp-icon">🔑</div>
                  <h1 className="text-2xl font-black text-slate-900">Forgot Password?</h1>
                  <p className="text-slate-500 mt-1 text-sm">Enter your email and we'll send you a reset OTP</p>
                </div>

                {error && <div className="alert-error"><span>⚠️</span><span>{error}</span></div>}

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Email address</label>
                    <input type="email" className="input-green" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your registered email" required />
                  </div>
                  <button type="submit" disabled={busy} className="btn-green mt-2">
                    {busy ? '⏳ Sending OTP...' : 'Send Reset OTP →'}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Remember your password?{' '}
                  <a href="/login" className="font-black text-green hover:underline">Sign In</a>
                </p>
              </>
            )}

            {/* Step 2 */}
            {step === 'reset' && (
              <>
                <div className="mb-6 text-center">
                  <div className="otp-icon">📧</div>
                  <h1 className="text-2xl font-black text-slate-900">Reset Password</h1>
                  <p className="text-sm text-slate-500 mt-2">
                    Enter the OTP sent to <strong className="text-slate-700">{email}</strong>
                  </p>
                </div>

                {error && <div className="alert-error"><span>⚠️</span><span>{error}</span></div>}

                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">OTP Code</label>
                    <input type="text" maxLength={6} className="input-otp" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} placeholder="000000" required />
                    <p className="mt-2 text-center text-xs text-slate-400">⏱ OTP expires in 10 minutes</p>
                  </div>
                  <div><label className="block text-sm font-black text-slate-700 mb-1.5">New Password</label><input type="password" className="input-green" value={newPassword} onChange={e=>setNewPw(e.target.value)} placeholder="Min 6 characters" required /></div>
                  <div><label className="block text-sm font-black text-slate-700 mb-1.5">Confirm New Password</label><input type="password" className="input-green" value={confirmPassword} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter new password" required /></div>
                  <button type="submit" disabled={busy || otp.length !== 6} className="btn-green mt-2">
                    {busy ? '⏳ Resetting...' : '✓ Reset Password'}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <button onClick={() => { setStep('email'); setOtp(''); setError(null); }} className="font-medium text-slate-400 hover:text-slate-700 transition">← Change email</button>
                  <button onClick={handleResend} className="font-black text-green hover:underline">Resend OTP</button>
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 'done' && (
              <div className="text-center py-4">
                <div className="bg-green-soft otp-icon mx-auto mb-6 h-20 w-20 rounded-3xl text-5xl">✅</div>
                <h1 className="text-2xl font-black text-slate-900">Password Reset!</h1>
                <p className="text-slate-500 mt-2 mb-8">Your password has been updated.<br />Sign in with your new password.</p>
                <a href="/login" className="btn-green">Go to Login →</a>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">© 2025 Riva Digital Invitation Platform</p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
