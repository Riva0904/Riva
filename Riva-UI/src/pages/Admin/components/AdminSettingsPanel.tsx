import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { changePassword } from '../../../api/user';
import { logout, forgotPassword, resetPassword, getStoredEmail } from '../../../api/auth';

type Section = 'password' | 'account' | 'notifications';

interface Props { onLogout: () => void; }

const AdminSettingsPanel: React.FC<Props> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [active,     setActive]    = useState<Section>('password');
  const [toast,      setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [currentPw,  setCurrentPw] = useState('');
  const [newPw,      setNewPw]     = useState('');
  const [confirmPw,  setConfirmPw] = useState('');
  const [pwLoading,  setPwLoading] = useState(false);
  const [showPw,     setShowPw]    = useState(false);

  // Forgot password inline flow
  type ForgotStep = 'idle' | 'email' | 'otp';
  const [forgotStep,    setForgotStep]    = useState<ForgotStep>('idle');
  const [forgotEmail,   setForgotEmail]   = useState(getStoredEmail() ?? '');
  const [forgotOtp,     setForgotOtp]     = useState('');
  const [forgotNewPw,   setForgotNewPw]   = useState('');
  const [forgotConfirm, setForgotConfirm] = useState('');
  const [forgotBusy,    setForgotBusy]    = useState(false);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChangePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { flash('New passwords do not match.', false); return; }
    if (newPw.length < 6)   { flash('New password must be at least 6 characters.', false); return; }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw });
      flash('Password changed! Logging out…');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => { logout(); onLogout(); navigate('/admin'); }, 2000);
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Failed to change password.', false);
    } finally { setPwLoading(false); }
  };

  const resetForgot = () => {
    setForgotStep('idle'); setForgotEmail(''); setForgotOtp('');
    setForgotNewPw(''); setForgotConfirm('');
  };

  const handleSendOtp = async (e: React.SyntheticEvent) => {
    e.preventDefault(); setForgotBusy(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotStep('otp');
      flash('OTP sent to your email!');
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Failed to send OTP', false);
    } finally { setForgotBusy(false); }
  };

  const handleForgotReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (forgotNewPw !== forgotConfirm) { flash('Passwords do not match.', false); return; }
    if (forgotNewPw.length < 6)        { flash('Password must be at least 6 characters.', false); return; }
    setForgotBusy(true);
    try {
      await resetPassword(forgotEmail, forgotOtp, forgotNewPw);
      flash('Password reset! Logging out…');
      resetForgot();
      setTimeout(() => { logout(); onLogout(); navigate('/admin'); }, 2000);
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Reset failed', false);
    } finally { setForgotBusy(false); }
  };

  // Notification preferences (persisted in localStorage)
  const ADMIN_NOTIF_KEY = 'riva_admin_notif_prefs';
  const ADMIN_NOTIF_ITEMS = [
    { key: 'registrations', label: 'New user registrations', desc: 'Get notified when new users sign up' },
    { key: 'payments',      label: 'Payment alerts',          desc: 'Notifications for completed payments' },
    { key: 'security',      label: 'System security alerts',  desc: 'Important alerts about admin security' },
  ];
  const [adminNotifPrefs, setAdminNotifPrefs] = useState<Record<string, boolean>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ADMIN_NOTIF_KEY) ?? '{}');
      return { registrations: true, payments: true, security: true, ...saved };
    } catch { return { registrations: true, payments: true, security: true }; }
  });
  const saveAdminNotifPrefs = () => {
    localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(adminNotifPrefs));
    flash('Notification preferences saved!');
  };

  const lbl = "block text-sm font-black text-slate-700 mb-1.5";

  const SECTIONS: { id: Section; icon: string; label: string }[] = [
    { id: 'password',      icon: '🔑', label: 'Change Password' },
    { id: 'account',       icon: '👤', label: 'Account' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
  ];

  return (
    <div className="space-y-6">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className={`fixed top-5 right-5 z-50 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-2xl ${
              toast.ok ? 'bg-green-600' : 'bg-red-500'}`}>
            {toast.ok ? '✅' : '⚠️'} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-black text-slate-900">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your admin account preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">

        {/* Sidebar */}
        <div className="md:col-span-1">
          <nav className="card-green p-3 space-y-1">
            {SECTIONS.map(item => (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition ${
                  active === item.id ? 'text-white' : 'text-slate-600 hover:bg-green-50'
                }`}
                style={active === item.id ? { background: 'linear-gradient(135deg,#16a34a,#059669)' } : {}}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">

            {active === 'password' && (
              <motion.div key="pw"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="card-green p-6">

                {/* ── Normal change-password form ── */}
                {forgotStep === 'idle' && (
                  <>
                    <h2 className="text-xl font-black text-slate-900 mb-1">Change Password</h2>
                    <p className="text-sm text-slate-500 mb-6">You'll be logged out after a successful password change.</p>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className={lbl}>Current Password *</label>
                        <div className="relative">
                          <input type={showPw ? 'text' : 'password'} className="input-green"
                            value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                            placeholder="Enter current password" required />
                          <button type="button" onClick={() => setShowPw(s => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPw ? '🙈' : '👁'}
                          </button>
                        </div>
                        <button type="button" onClick={() => setForgotStep('email')}
                          className="mt-1.5 text-xs font-black text-green-700 hover:underline">
                          Forgot current password?
                        </button>
                      </div>
                      <div className="border-t-2 border-green-50 pt-4 space-y-4">
                        <div>
                          <label className={lbl}>New Password *</label>
                          <input type="password" className="input-green" value={newPw}
                            onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" required />
                          {newPw.length > 0 && (
                            <div className="mt-2 flex gap-1 items-center">
                              {[1,2,3,4].map(i => (
                                <div key={i} className={`h-1.5 flex-1 rounded-full transition ${
                                  newPw.length >= i * 3 ? i <= 2 ? 'bg-red-400' : i === 3 ? 'bg-amber-400' : 'bg-green-500' : 'bg-slate-200'}`} />
                              ))}
                              <span className="text-xs text-slate-400 ml-1">
                                {newPw.length < 6 ? 'Weak' : newPw.length < 9 ? 'Fair' : newPw.length < 12 ? 'Good' : 'Strong'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className={lbl}>Confirm New Password *</label>
                          <input type="password" className="input-green" value={confirmPw}
                            onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter new password" required />
                          {confirmPw && newPw !== confirmPw && (
                            <p className="mt-1 text-xs text-red-500 font-semibold">Passwords don't match</p>
                          )}
                          {confirmPw && newPw === confirmPw && newPw.length >= 6 && (
                            <p className="mt-1 text-xs text-green-600 font-semibold">✓ Passwords match</p>
                          )}
                        </div>
                      </div>
                      <motion.button type="submit"
                        disabled={pwLoading || newPw !== confirmPw || newPw.length < 6}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="btn-green disabled:opacity-50 disabled:cursor-not-allowed">
                        {pwLoading ? '⏳ Changing…' : '🔑 Change Password'}
                      </motion.button>
                    </form>
                  </>
                )}

                {/* ── Forgot: enter email ── */}
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
                        <input type="email" className="input-green" value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="admin@example.com" required />
                      </div>
                      <motion.button type="submit" disabled={forgotBusy}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="btn-green disabled:opacity-50">
                        {forgotBusy ? '⏳ Sending…' : '📧 Send OTP'}
                      </motion.button>
                    </form>
                  </>
                )}

                {/* ── Forgot: enter OTP + new password ── */}
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
                        <input type="text" maxLength={6} className="input-green tracking-widest text-center text-lg font-black"
                          value={forgotOtp}
                          onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000" required />
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-slate-400">⏱ Expires in 10 minutes</p>
                          <button type="button"
                            onClick={async () => { try { await forgotPassword(forgotEmail); flash('OTP resent!'); } catch { flash('Failed to resend OTP', false); } }}
                            className="text-xs font-black text-green-700 hover:underline">
                            Resend OTP
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={lbl}>New Password *</label>
                        <input type="password" className="input-green" value={forgotNewPw}
                          onChange={e => setForgotNewPw(e.target.value)} placeholder="Min 6 characters" required />
                      </div>
                      <div>
                        <label className={lbl}>Confirm New Password *</label>
                        <input type="password" className="input-green" value={forgotConfirm}
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

            {active === 'account' && (
              <motion.div key="acc"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="card-green p-6 space-y-5">
                <h2 className="text-xl font-black text-slate-900">Account Management</h2>
                <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
                  <h4 className="font-black text-green-800 mb-1">Edit Profile</h4>
                  <p className="text-sm text-green-700 mb-3">Update your display name and profile photo from the Profile section.</p>
                  <span className="text-xs text-green-600 font-semibold">Use the Profile tab in the sidebar →</span>
                </div>
                <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
                  <h4 className="font-black text-amber-800 mb-1">🔓 Sign Out</h4>
                  <p className="text-sm text-amber-700 mb-3">This will log you out of the admin portal.</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { logout(); onLogout(); }}
                    className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-black text-white hover:bg-amber-600 transition">
                    Logout Now
                  </motion.button>
                </div>
                <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-4">
                  <h4 className="font-black text-red-700 mb-1">⚠️ Delete Account</h4>
                  <p className="text-sm text-red-600 mb-3">Contact system administrator to delete an admin account.</p>
                  <button disabled className="rounded-xl bg-red-200 px-5 py-2 text-sm font-black text-red-400 cursor-not-allowed">
                    Contact Support
                  </button>
                </div>
              </motion.div>
            )}

            {active === 'notifications' && (
              <motion.div key="notif"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="card-green p-6">
                <h2 className="text-xl font-black text-slate-900 mb-5">Notification Preferences</h2>
                <div className="space-y-4">
                  {ADMIN_NOTIF_ITEMS.map(n => (
                    <label key={n.key}
                      className="flex items-center justify-between gap-4 rounded-2xl border-2 border-green-100 bg-green-50 p-4 cursor-pointer hover:border-green-300 transition">
                      <div>
                        <p className="font-black text-slate-800">{n.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                      </div>
                      <input type="checkbox"
                        checked={!!adminNotifPrefs[n.key]}
                        onChange={e => setAdminNotifPrefs(p => ({ ...p, [n.key]: e.target.checked }))}
                        className="h-5 w-5 accent-green-600 cursor-pointer" />
                    </label>
                  ))}
                </div>
                <motion.button onClick={saveAdminNotifPrefs}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-green mt-5">
                  Save Preferences
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPanel;
