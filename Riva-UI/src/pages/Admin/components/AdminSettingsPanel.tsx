import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { changePassword } from '../../../api/user';
import { logout, forgotPassword, resetPassword, getStoredEmail } from '../../../api/auth';
import { getTheme, saveTheme, applyTheme, hexToRgbShades } from '../../../api/settings';

type Section = 'password' | 'account' | 'notifications' | 'branding';

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
    window.dispatchEvent(new CustomEvent('riva-notif-prefs-changed'));
    flash('Notification preferences saved!');
  };

  // Curated professional palettes for a digital invitation platform
  const PRESETS = [
    // ── Wedding & Romance ─────────────────────────────────────────────────
    { name: 'Gold Elegance',    start: '#7b5400', end: '#d4af37', dir: '135deg'          },
    { name: 'Rose Gold',        start: '#9d4b5e', end: '#d4a0a8', dir: '135deg'          },
    { name: 'Midnight Rose',    start: '#1a0a14', end: '#8b1a4a', dir: '135deg'          },
    { name: 'Navy & Gold',      start: '#0f2044', end: '#c9a440', dir: '135deg'          },
    { name: 'Blush Ivory',      start: '#b56576', end: '#f2c4ce', dir: 'to right'        },
    { name: 'Dusty Mauve',      start: '#704060', end: '#c49baa', dir: '135deg'          },
    { name: 'Champagne Glow',   start: '#9a7232', end: '#eedfa0', dir: 'to right'        },
    { name: 'Garden Rose',      start: '#8b1a4a', end: '#e879a0', dir: '135deg'          },
    // ── Birthday & Celebration ───────────────────────────────────────────
    { name: 'Confetti Joy',     start: '#e11d48', end: '#f97316', dir: 'to right'        },
    { name: 'Party Purple',     start: '#6d28d9', end: '#ec4899', dir: '135deg'          },
    { name: 'Golden Birthday',  start: '#b45309', end: '#fbbf24', dir: 'to right'        },
    { name: 'Tropical Fiesta',  start: '#0e7490', end: '#059669', dir: 'to right'        },
    { name: 'Berry Burst',      start: '#5b21b6', end: '#be185d', dir: '135deg'          },
    { name: 'Peach Sorbet',     start: '#c2410c', end: '#f472b6', dir: 'to right'        },
    // ── Luxury & Premium ─────────────────────────────────────────────────
    { name: 'Black Gold',       start: '#18181b', end: '#b8860b', dir: '135deg'          },
    { name: 'Royal Burgundy',   start: '#4c0519', end: '#9f1239', dir: '135deg'          },
    { name: 'Deep Emerald',     start: '#022c22', end: '#059669', dir: '135deg'          },
    { name: 'Sapphire Night',   start: '#0f1e5e', end: '#4338ca', dir: '135deg'          },
    { name: 'Amethyst',         start: '#2e1065', end: '#7c3aed', dir: '135deg'          },
    { name: 'Crimson Velvet',   start: '#450a0a', end: '#b91c1c', dir: '135deg'          },
    // ── Modern Elegance ──────────────────────────────────────────────────
    { name: 'Tiffany Blue',     start: '#0d6e6e', end: '#2dd4bf', dir: 'to right'        },
    { name: 'Lavender Dream',   start: '#3b0764', end: '#a78bfa', dir: '135deg'          },
    { name: 'Marigold',         start: '#92400e', end: '#f59e0b', dir: 'to right'        },
    { name: 'Coral Blossom',    start: '#9f1239', end: '#fb923c', dir: 'to bottom right' },
    { name: 'Slate & Sky',      start: '#1e293b', end: '#38bdf8', dir: '135deg'          },
    { name: 'Plum & Gold',      start: '#4a044e', end: '#c9a440', dir: '135deg'          },
    // ── Seasonal ─────────────────────────────────────────────────────────
    { name: 'Winter Frost',     start: '#1e3a5f', end: '#93c5fd', dir: '135deg'          },
    { name: 'Spring Bloom',     start: '#831843', end: '#f9a8d4', dir: '135deg'          },
    { name: 'Summer Sunset',    start: '#7c2d12', end: '#fbbf24', dir: 'to bottom right' },
    { name: 'Autumn Harvest',   start: '#451a03', end: '#d97706', dir: '135deg'          },
    { name: 'Monsoon Teal',     start: '#134e4a', end: '#0ea5e9', dir: '135deg'          },
  ];
  const DIRECTIONS = [
    { label: '↘ Diagonal',  value: '135deg'          },
    { label: '→ Right',     value: 'to right'        },
    { label: '↓ Down',      value: 'to bottom'       },
    { label: '↗ Diagonal',  value: 'to top right'    },
    { label: '↙ Diagonal',  value: 'to bottom right' },
  ];
  const [colorStart,   setColorStart]  = useState(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : '#7b5400';
  });
  const [colorEnd,     setColorEnd]    = useState(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim();
    return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : '#d4af37';
  });
  const [gradientDir,  setGradientDir]  = useState('135deg');
  const [gradientText, setGradientText] = useState<'auto' | 'light' | 'dark'>('auto');
  const [brandSaving,  setBrandSaving]  = useState(false);
  const [brandLoaded,  setBrandLoaded]  = useState(false);

  const liveGradient = `linear-gradient(${gradientDir}, ${colorStart}, ${colorEnd})`;

  const loadBranding = () => {
    if (brandLoaded) return;
    getTheme().then(t => {
      setColorStart(t.colorStart);
      setColorEnd(t.colorEnd);
      setGradientDir(t.gradientDir);
      setGradientText(t.gradientText ?? 'auto');
      setBrandLoaded(true);
    }).catch(() => {});
  };

  const handleSaveTheme = async () => {
    if (!colorStart || !colorEnd) { flash('Please select both start and end colors.', false); return; }
    setBrandSaving(true);
    try {
      await saveTheme({ colorStart, colorEnd, gradientDir, gradientText });
      applyTheme(colorStart, colorEnd, gradientDir, undefined, gradientText);
      flash(`Theme applied to all users!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save theme';
      flash(msg.includes('401') || msg.toLowerCase().includes('unauthorized')
        ? 'Not authorized. Make sure you are logged in as Admin.'
        : msg, false);
    } finally { setBrandSaving(false); }
  };

  const lbl = "block text-sm font-black text-slate-700 mb-1.5";

  const SECTIONS: { id: Section; icon: string; label: string }[] = [
    { id: 'password',      icon: '🔑', label: 'Change Password' },
    { id: 'account',       icon: '👤', label: 'Account' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'branding',      icon: '🎨', label: 'Branding' },
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
              <button key={item.id} onClick={() => { setActive(item.id); if (item.id === 'branding') loadBranding(); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition ${
                  active === item.id ? 'text-white' : 'text-slate-600 hover:bg-green-50'
                }`}
                style={active === item.id ? { background: 'var(--color-gradient)' } : {}}>
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
                className="card-green p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-0.5">Notification Preferences</h2>
                  <p className="text-sm text-slate-400">
                    Control which events appear in the 🔔 bell in the sidebar. Changes take effect immediately.
                  </p>
                </div>

                {/* Info box */}
                <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-2.5">
                  <span className="text-base mt-0.5">ℹ️</span>
                  <div className="text-xs text-blue-800">
                    <p className="font-black mb-1">How notifications work</p>
                    <p>The bell (🔔) in the sidebar shows live events from the last 24 hours. Unread events have a <strong>blue dot</strong> and a red badge count. Click the bell to view all events.</p>
                  </div>
                </div>

                {/* Toggle rows */}
                <div className="space-y-3">
                  {ADMIN_NOTIF_ITEMS.map(n => {
                    const colorMap: Record<string, string> = {
                      registrations: 'border-blue-200   bg-blue-50   hover:border-blue-300',
                      payments:      'border-green-200  bg-green-50  hover:border-green-300',
                      security:      'border-amber-200  bg-amber-50  hover:border-amber-300',
                    };
                    const iconMap: Record<string, string> = {
                      registrations: '👤', payments: '💰', security: '🔒',
                    };
                    return (
                      <label key={n.key}
                        className={`flex items-center justify-between gap-4 rounded-2xl border-2 p-4 cursor-pointer transition ${colorMap[n.key]}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{iconMap[n.key]}</span>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{n.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-black ${adminNotifPrefs[n.key] ? 'text-green-600' : 'text-slate-400'}`}>
                            {adminNotifPrefs[n.key] ? 'ON' : 'OFF'}
                          </span>
                          <div
                            onClick={() => setAdminNotifPrefs(p => ({ ...p, [n.key]: !p[n.key] }))}
                            className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${adminNotifPrefs[n.key] ? 'bg-green-500' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${adminNotifPrefs[n.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <motion.button onClick={saveAdminNotifPrefs}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-green">
                  💾 Save Preferences
                </motion.button>
              </motion.div>
            )}
            {active === 'branding' && (
              <motion.div key="branding"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="card-green p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Branding & Gradient</h2>
                  <p className="text-sm text-slate-500">Set the gradient used across all buttons, headers, and highlights for every user.</p>
                </div>

                {/* Preset swatches — scrollable */}
                <div>
                  <label className={lbl}>Professional Invitation Palettes</label>
                  <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-100 p-2">
                    <div className="grid grid-cols-4 gap-1.5">
                      {PRESETS.map(p => {
                        const isSelected = colorStart === p.start && colorEnd === p.end;
                        return (
                          <motion.button key={p.name} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                            onClick={() => { setColorStart(p.start); setColorEnd(p.end); setGradientDir(p.dir); }}
                            title={p.name}
                            className={`relative rounded-lg p-0.5 border-2 transition ${isSelected ? 'border-slate-800 shadow-md' : 'border-transparent hover:border-slate-300'}`}>
                            <div className="h-8 w-full rounded-md shadow-sm"
                              style={{ background: `linear-gradient(${p.dir},${p.start},${p.end})` }} />
                            <p className="text-[9px] font-black text-slate-600 text-center mt-0.5 truncate leading-tight px-0.5">{p.name}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Custom two-stop picker */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Start Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={colorStart} onChange={e => setColorStart(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border-2 border-slate-200 p-0.5 flex-shrink-0" />
                      <input type="text" value={colorStart} maxLength={7}
                        onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setColorStart(e.target.value); }}
                        className="input-green font-mono text-sm" placeholder="#1e3c72" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>End Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={colorEnd} onChange={e => setColorEnd(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border-2 border-slate-200 p-0.5 flex-shrink-0" />
                      <input type="text" value={colorEnd} maxLength={7}
                        onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setColorEnd(e.target.value); }}
                        className="input-green font-mono text-sm" placeholder="#2a5298" />
                    </div>
                  </div>
                </div>

                {/* Direction */}
                <div>
                  <label className={lbl}>Gradient Direction</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {DIRECTIONS.map(d => (
                      <button key={d.value} onClick={() => setGradientDir(d.value)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-black border-2 transition ${gradientDir === d.value ? 'text-white border-transparent' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                        style={gradientDir === d.value ? { background: liveGradient } : {}}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text on Gradient */}
                <div>
                  <label className={lbl}>Text on Gradient Background</label>
                  <p className="text-xs text-slate-400 mb-2">Controls text color on sections with gradient backgrounds (like the features section).</p>
                  <div className="flex gap-2">
                    {([
                      { val: 'auto',  label: '🤖 Auto',       desc: 'Detects best contrast automatically' },
                      { val: 'light', label: '⬜ Light Text',  desc: 'Force white text (for dark gradients)' },
                      { val: 'dark',  label: '⬛ Dark Text',   desc: 'Force dark text (for light gradients)' },
                    ] as const).map(opt => (
                      <motion.button key={opt.val} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setGradientText(opt.val)}
                        title={opt.desc}
                        className={`flex-1 rounded-xl py-2.5 text-xs font-black border-2 transition ${gradientText === opt.val ? 'text-white border-transparent' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                        style={gradientText === opt.val ? { background: liveGradient } : {}}>
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Live preview */}
                <div className="rounded-2xl border-2 border-slate-100 p-4 space-y-3 bg-white">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Preview</p>
                  <button style={{ background: liveGradient }}
                    className="w-full rounded-xl py-3 text-sm font-black text-white shadow-lg">
                    Primary Button
                  </button>
                  <div className="h-10 rounded-xl w-full" style={{ background: liveGradient }} />
                  <div className="flex gap-2">
                    <span style={{ background: hexToRgbShades(colorStart).light, color: colorStart }}
                      className="rounded-full px-3 py-1 text-xs font-black">Badge</span>
                    <span style={{ borderColor: colorStart, color: colorStart }}
                      className="rounded-full border-2 px-3 py-1 text-xs font-black">Outline</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono break-all">
                    {liveGradient}
                  </p>
                </div>

                <motion.button onClick={handleSaveTheme} disabled={brandSaving}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-green disabled:opacity-50">
                  {brandSaving ? '⏳ Saving…' : '🎨 Apply Gradient to All Users'}
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
