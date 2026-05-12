import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { changePassword } from '../../../api/user';
import { logout, forgotPassword, resetPassword, getStoredEmail } from '../../../api/auth';

type Section = 'password' | 'account' | 'notifications';

const SettingsPage: React.FC = () => {
  const navigate  = useNavigate();
  const [active,  setActive]  = useState<Section>('password');
  const [toast,   setToast]   = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Change password form
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [pwLoading,  setPwLoading]  = useState(false);
  const [showPw,     setShowPw]     = useState(false);

  // Forgot password inline flow
  type ForgotStep = 'idle' | 'email' | 'otp';
  const [forgotStep,    setForgotStep]    = useState<ForgotStep>('idle');
  const [forgotEmail,   setForgotEmail]   = useState(getStoredEmail() ?? '');
  const [forgotOtp,     setForgotOtp]     = useState('');
  const [forgotNewPw,   setForgotNewPw]   = useState('');
  const [forgotConfirm, setForgotConfirm] = useState('');
  const [forgotBusy,    setForgotBusy]    = useState(false);

  // Notification preferences (persisted in localStorage)
  const NOTIF_KEY = 'riva_notif_prefs';
  const NOTIF_ITEMS = [
    { key: 'rsvp',     label: 'RSVP responses',         desc: 'Get notified when guests RSVP to your invitations' },
    { key: 'views',    label: 'Invitation views',        desc: 'Know when someone opens your invitation' },
    { key: 'security', label: 'Account security alerts', desc: 'Important alerts about your account security' },
  ];
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(NOTIF_KEY) ?? '{}');
      return { rsvp: true, views: true, security: true, ...saved };
    } catch { return { rsvp: true, views: true, security: true }; }
  });
  const saveNotifPrefs = () => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifPrefs));
    flash('Notification preferences saved!');
  };

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { flash('New passwords do not match.', 'error'); return; }
    if (newPw.length < 6)   { flash('New password must be at least 6 characters.', 'error'); return; }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw });
      flash('Password changed successfully! Please log in again.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Failed to change password.', 'error');
    } finally { setPwLoading(false); }
  };

  const resetForgot = () => {
    setForgotStep('idle'); setForgotOtp('');
    setForgotNewPw(''); setForgotConfirm('');
  };

  const handleSendOtp = async (e: React.SyntheticEvent) => {
    e.preventDefault(); setForgotBusy(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotStep('otp');
      flash('OTP sent to your email!');
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Failed to send OTP', 'error');
    } finally { setForgotBusy(false); }
  };

  const handleForgotReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (forgotNewPw !== forgotConfirm) { flash('Passwords do not match.', 'error'); return; }
    if (forgotNewPw.length < 6)        { flash('Password must be at least 6 characters.', 'error'); return; }
    setForgotBusy(true);
    try {
      await resetPassword(forgotEmail, forgotOtp, forgotNewPw);
      flash('Password reset! Logging out…');
      resetForgot();
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Reset failed', 'error');
    } finally { setForgotBusy(false); }
  };

  const handleLogoutAll = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems: { id: Section; icon: string; label: string }[] = [
    { id: 'password',      icon: '🔑', label: 'Change Password' },
    { id: 'account',       icon: '👤', label: 'Account' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
  ];

  const inputCls = "input-green";
  const lbl      = "block text-sm font-black text-slate-700 mb-1.5";

  return (
    <div className="bg-light-green min-h-screen">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className={`fixed top-5 right-5 z-50 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-2xl ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
            {toast.type === 'success' ? '✅' : '⚠️'} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="dashboard-header">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="navbar-btn-outline text-sm">← Dashboard</button>
            <span className="font-black text-slate-900">Account <span className="text-green">Settings</span></span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <div className="grid gap-6 md:grid-cols-4">

          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="card-green p-3 space-y-1">
              {sidebarItems.map(item => (
                <button key={item.id} onClick={() => setActive(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition ${
                    active === item.id
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-green-50'
                  }`}
                  style={active === item.id ? { background: 'var(--color-gradient)' } : {}}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content panel */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">

              {/* ── Change Password ── */}
              {active === 'password' && (
                <motion.div key="password"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="card-green p-6">

                  {/* Normal change-password form */}
                  {forgotStep === 'idle' && (
                    <>
                      <h2 className="text-xl font-black text-slate-900 mb-1">Change Password</h2>
                      <p className="text-sm text-slate-500 mb-6">You'll be logged out after a successful password change.</p>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label className={lbl}>Current Password *</label>
                          <div className="relative">
                            <input type={showPw ? 'text' : 'password'} className={inputCls}
                              value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                              placeholder="Enter current password" required />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                              {showPw ? '🙈' : '👁'}
                            </button>
                          </div>
                          <button type="button" onClick={() => setForgotStep('email')}
                            className="mt-1.5 text-xs font-black text-green-700 hover:underline">
                            Forgot current password?
                          </button>
                        </div>
                        <div className="border-t-2 border-green-50 pt-4">
                          <div>
                            <label className={lbl}>New Password *</label>
                            <input type="password" className={inputCls} value={newPw}
                              onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" required />
                            {newPw.length > 0 && (
                              <div className="mt-2 flex gap-1">
                                {[1,2,3,4].map(i => (
                                  <div key={i} className={`h-1.5 flex-1 rounded-full transition ${
                                    newPw.length >= i * 3
                                      ? i <= 2 ? 'bg-red-400' : i === 3 ? 'bg-amber-400' : 'bg-green-500'
                                      : 'bg-slate-200'}`} />
                                ))}
                                <span className="text-xs text-slate-400 ml-1">
                                  {newPw.length < 6 ? 'Weak' : newPw.length < 9 ? 'Fair' : newPw.length < 12 ? 'Good' : 'Strong'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-4">
                            <label className={lbl}>Confirm New Password *</label>
                            <input type="password" className={inputCls} value={confirmPw}
                              onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter new password" required />
                            {confirmPw && newPw !== confirmPw && (
                              <p className="mt-1 text-xs text-red-500 font-semibold">Passwords don't match</p>
                            )}
                            {confirmPw && newPw === confirmPw && newPw.length >= 6 && (
                              <p className="mt-1 text-xs text-green-600 font-semibold">✓ Passwords match</p>
                            )}
                          </div>
                        </div>
                        <motion.button type="submit" disabled={pwLoading || newPw !== confirmPw || newPw.length < 6}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="btn-green mt-2">
                          {pwLoading ? '⏳ Changing password…' : '🔑 Change Password'}
                        </motion.button>
                      </form>
                    </>
                  )}

                  {/* Forgot: enter email */}
                  {forgotStep === 'email' && (
                    <>
                      <button onClick={resetForgot} className="mb-4 text-xs font-black text-slate-400 hover:text-slate-700 transition">
                        ← Back
                      </button>
                      <h2 className="text-xl font-black text-slate-900 mb-1">Forgot Password</h2>
                      <p className="text-sm text-slate-500 mb-6">Enter your registered email and we'll send a reset OTP.</p>
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                          <label className={lbl}>Registered Email *</label>
                          <input type="email" className={inputCls} value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            placeholder="your@email.com" required />
                        </div>
                        <motion.button type="submit" disabled={forgotBusy}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="btn-green disabled:opacity-50">
                          {forgotBusy ? '⏳ Sending…' : '📧 Send OTP'}
                        </motion.button>
                      </form>
                    </>
                  )}

                  {/* Forgot: enter OTP + new password */}
                  {forgotStep === 'otp' && (
                    <>
                      <button onClick={resetForgot} className="mb-4 text-xs font-black text-slate-400 hover:text-slate-700 transition">
                        ← Back
                      </button>
                      <h2 className="text-xl font-black text-slate-900 mb-1">Reset Password</h2>
                      <p className="text-sm text-slate-500 mb-6">
                        OTP sent to <strong className="text-slate-700">{forgotEmail}</strong>. Enter it below with your new password.
                      </p>
                      <form onSubmit={handleForgotReset} className="space-y-4">
                        <div>
                          <label className={lbl}>OTP Code *</label>
                          <input type="text" maxLength={6} className={`${inputCls} tracking-widest text-center text-lg font-black`}
                            value={forgotOtp}
                            onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000" required />
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-xs text-slate-400">⏱ Expires in 10 minutes</p>
                            <button type="button"
                              onClick={async () => { try { await forgotPassword(forgotEmail); flash('OTP resent!'); } catch { flash('Failed to resend OTP', 'error'); } }}
                              className="text-xs font-black text-green-700 hover:underline">
                              Resend OTP
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className={lbl}>New Password *</label>
                          <input type="password" className={inputCls} value={forgotNewPw}
                            onChange={e => setForgotNewPw(e.target.value)} placeholder="Min 6 characters" required />
                        </div>
                        <div>
                          <label className={lbl}>Confirm New Password *</label>
                          <input type="password" className={inputCls} value={forgotConfirm}
                            onChange={e => setForgotConfirm(e.target.value)} placeholder="Re-enter new password" required />
                          {forgotConfirm && forgotNewPw !== forgotConfirm && (
                            <p className="mt-1 text-xs text-red-500 font-semibold">Passwords don't match</p>
                          )}
                        </div>
                        <motion.button type="submit"
                          disabled={forgotBusy || forgotOtp.length !== 6 || forgotNewPw !== forgotConfirm || forgotNewPw.length < 6}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="btn-green disabled:opacity-50 disabled:cursor-not-allowed">
                          {forgotBusy ? '⏳ Resetting…' : '🔑 Reset Password'}
                        </motion.button>
                      </form>
                    </>
                  )}

                </motion.div>
              )}

              {/* ── Account ── */}
              {active === 'account' && (
                <motion.div key="account"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="card-green p-6 space-y-5">
                  <h2 className="text-xl font-black text-slate-900">Account Management</h2>

                  <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
                    <h4 className="font-black text-green-800 mb-1">Edit Profile</h4>
                    <p className="text-sm text-green-700 mb-3">Update your username, email, and display name.</p>
                    <a href="/dashboard" className="btn-green w-auto inline-flex px-5 py-2 text-sm">Go to Dashboard →</a>
                  </div>

                  <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
                    <h4 className="font-black text-amber-800 mb-1">🔓 Sign Out All Devices</h4>
                    <p className="text-sm text-amber-700 mb-3">This will log you out from the current session.</p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleLogoutAll}
                      className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-black text-white hover:bg-amber-600 transition">
                      Logout Now
                    </motion.button>
                  </div>

                  <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-4">
                    <h4 className="font-black text-red-700 mb-1">⚠️ Delete Account</h4>
                    <p className="text-sm text-red-600 mb-3">
                      This will permanently delete your account and all invitations. This cannot be undone.
                    </p>
                    <button disabled className="rounded-xl bg-red-200 px-5 py-2 text-sm font-black text-red-400 cursor-not-allowed">
                      Contact Support
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Notifications ── */}
              {active === 'notifications' && (
                <motion.div key="notifications"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="card-green p-6">
                  <h2 className="text-xl font-black text-slate-900 mb-5">Notification Preferences</h2>
                  <div className="space-y-4">
                    {NOTIF_ITEMS.map(n => (
                      <label key={n.key} className="flex items-center justify-between gap-4 rounded-2xl border-2 border-green-100 bg-green-50 p-4 cursor-pointer hover:border-green-300 transition">
                        <div>
                          <p className="font-black text-slate-800">{n.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                        </div>
                        <input type="checkbox"
                          checked={!!notifPrefs[n.key]}
                          onChange={e => setNotifPrefs(p => ({ ...p, [n.key]: e.target.checked }))}
                          className="h-5 w-5 accent-green-600 cursor-pointer" />
                      </label>
                    ))}
                  </div>
                  <motion.button onClick={saveNotifPrefs}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="btn-green mt-5">
                    Save Preferences
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
