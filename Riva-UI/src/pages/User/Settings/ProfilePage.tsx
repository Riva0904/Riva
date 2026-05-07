import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserProfile, updateProfile, uploadProfileImage, type UserProfile } from '../../../api/user';
import { getStoredAuthToken } from '../../../api/client';

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: string; label: string; value: number | string; color: string }> = ({ icon, label, value, color }) => (
  <motion.div whileHover={{ y: -3 }} className={`rounded-2xl p-4 text-center ${color}`}>
    <p className="text-3xl mb-1">{icon}</p>
    <p className="text-2xl font-black">{value}</p>
    <p className="text-xs font-bold opacity-70 mt-0.5">{label}</p>
  </motion.div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ profile: UserProfile; onUpload: (f: File) => void; uploading: boolean }> = ({ profile, onUpload, uploading }) => {
  const ref = useRef<HTMLInputElement>(null);
  const initials = (profile.displayName || profile.username).charAt(0).toUpperCase();

  return (
    <div className="relative w-24 h-24 mx-auto">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg"
        style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }}>
        {profile.profileImageUrl ? (
          <img src={profile.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white">{initials}</div>
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full text-white text-sm shadow-md transition"
        style={{ background: uploading ? '#86efac' : 'linear-gradient(135deg,#16a34a,#059669)' }}>
        {uploading ? '⏳' : '📷'}
      </motion.button>
      <input ref={ref} type="file" className="hidden" accept="image/*"
        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }} />
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const navigate  = useNavigate();
  const [profile,   setProfile]   = useState<UserProfile | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Edit form state
  const [username,    setUsername]    = useState('');
  const [email,       setEmail]       = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!getStoredAuthToken()) { navigate('/login'); return; }
    getUserProfile()
      .then(p => {
        setProfile(p);
        setUsername(p.username);
        setEmail(p.email);
        setDisplayName(p.displayName ?? '');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadProfileImage(file);
      setProfile(prev => prev ? { ...prev, profileImageUrl: res.imageUrl } : prev);
      showToast('Profile photo updated!');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Upload failed', 'error');
    } finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ username: username.trim(), email: email.trim(), displayName: displayName.trim() || undefined });
      setProfile(prev => prev ? { ...prev, username: username.trim(), email: email.trim(), displayName: displayName.trim() || undefined } : prev);
      setEditing(false);
      showToast('Profile saved successfully!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="bg-page min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl animate-bounce mb-3">🌿</div>
        <p className="text-green font-black animate-pulse">Loading profile…</p>
      </div>
    </div>
  );

  if (!profile) return null;

  const joined    = new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const lastLogin = profile.lastLoginAt
    ? new Date(profile.lastLoginAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'First session';

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
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="navbar-btn-outline text-sm">← Dashboard</button>
            <span className="font-black text-slate-900">My <span className="text-green">Profile</span></span>
          </div>
          <a href="/settings" className="navbar-btn-outline text-sm">⚙️ Settings</a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6 space-y-6">

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-green p-6">

          {/* Avatar + name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar profile={profile} onUpload={handleImageUpload} uploading={uploading} />

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-black text-slate-900">
                {profile.displayName || profile.username}
              </h2>
              {profile.displayName && (
                <p className="text-sm text-slate-500 font-semibold">@{profile.username}</p>
              )}
              <p className="text-sm text-slate-500">{profile.email}</p>
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className={`rounded-full px-3 py-0.5 text-xs font-black ${
                  profile.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {profile.role}
                </span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-black ${
                  profile.sessionStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {profile.sessionStatus === 'Active' ? '🟢 Active' : '⚫ Expired'}
                </span>
                {!profile.isActive && (
                  <span className="rounded-full px-3 py-0.5 text-xs font-black bg-red-100 text-red-600">⛔ Suspended</span>
                )}
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(!editing)}
              className="flex-shrink-0 rounded-xl border-2 border-green-200 bg-green-50 px-4 py-2 text-sm font-black text-green-700 hover:bg-green-100 transition">
              {editing ? '✕ Cancel' : '✏️ Edit Profile'}
            </motion.button>
          </div>

          {/* Edit form */}
          <AnimatePresence>
            {editing && (
              <motion.form onSubmit={handleSave}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t-2 border-green-50 space-y-4 overflow-hidden">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Username *</label>
                    <input className="input-green" value={username}
                      onChange={e => setUsername(e.target.value)} required placeholder="Your username" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Display Name</label>
                    <input className="input-green" value={displayName}
                      onChange={e => setDisplayName(e.target.value)} placeholder="How you appear to others" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-1.5">Email *</label>
                  <input type="email" className="input-green" value={email}
                    onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
                </div>
                <div className="flex gap-3">
                  <motion.button type="submit" disabled={saving}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="btn-green flex-1 py-3">
                    {saving ? '⏳ Saving…' : '💾 Save Changes'}
                  </motion.button>
                  <button type="button" onClick={() => setEditing(false)}
                    className="btn-green-outline flex-none px-6">Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Member info */}
          <div className="mt-5 pt-5 border-t-2 border-green-50 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Member Since</p>
              <p className="font-black text-slate-800 mt-0.5">📅 {joined}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Last Login</p>
              <p className="font-black text-slate-800 mt-0.5">🕐 {lastLogin}</p>
            </div>
          </div>
        </motion.div>

        {/* Usage stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Template Usage</h3>
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon="🆓" label="Free Templates Used" value={profile.freeTemplatesUsed}  color="bg-white border-2 border-green-100 text-green-700" />
            <StatCard icon="💎" label="Paid Templates Used" value={profile.paidTemplatesUsed}  color="bg-white border-2 border-amber-100 text-amber-700" />
            <StatCard icon="🎉" label="Invitations Created" value={profile.totalInvitationsCreated} color="bg-white border-2 border-blue-100 text-blue-700" />
          </div>
          <p className="mt-2 text-xs text-slate-400 text-center">
            Counted only when an invitation link is successfully created — not for previews or drafts
          </p>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card-green p-5">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: '🎉', label: 'My Invitations', href: '/my-invitations' },
              { icon: '🎨', label: 'Browse Templates', href: '/dashboard' },
              { icon: '🔒', label: 'Change Password', href: '/settings' },
              { icon: '📊', label: 'RSVP Analytics', href: '/my-invitations' },
            ].map(a => (
              <motion.a key={a.label} href={a.href}
                whileHover={{ y: -3 }}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-green-100 bg-green-50 p-3 text-center hover:border-green-300 hover:bg-green-100 transition">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-black text-slate-700">{a.label}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
