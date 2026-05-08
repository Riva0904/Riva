import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserProfile, updateProfile, uploadProfileImage, type UserProfile } from '../../../api/user';

const AdminProfilePanel: React.FC<{ onNameChange?: (name: string) => void }> = ({ onNameChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [editing,      setEditing]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [pDisplayName, setPDisplayName] = useState('');
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    getUserProfile()
      .then(p => {
        setProfile(p);
        setPDisplayName(p.displayName ?? '');
        onNameChange?.(p.displayName || p.username);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const openEdit  = () => { if (profile) setPDisplayName(profile.displayName ?? ''); setEditing(true); };
  const cancelEdit = () => { if (profile) setPDisplayName(profile.displayName ?? ''); setEditing(false); };

  const handleImageUpload = async (file: File) => {
    setUploading(true); flash('Uploading photo…');
    try {
      const res = await uploadProfileImage(file);
      const url = res.imageUrl + (res.imageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
      setProfile(prev => prev ? { ...prev, profileImageUrl: url } : prev);
      flash('Profile photo updated!');
    } catch (e: unknown) { flash(e instanceof Error ? e.message : 'Upload failed', false); }
    finally { setUploading(false); }
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const dname = pDisplayName.trim();
      await updateProfile({ username: profile!.username, email: profile!.email, displayName: dname || undefined });
      setProfile(prev => prev ? { ...prev, displayName: dname || undefined } : prev);
      setEditing(false); flash('Profile saved!');
      onNameChange?.(pDisplayName.trim() || profile!.username);
    } catch (err: unknown) { flash(err instanceof Error ? err.message : 'Save failed', false); }
    finally { setSaving(false); }
  };

  const joined    = profile ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const lastLogin = profile?.lastLoginAt
    ? new Date(profile.lastLoginAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'First session';
  const initials  = (profile?.displayName || profile?.username || '?').charAt(0).toUpperCase();
  const lbl = "block text-sm font-black text-slate-700 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">

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
        <h1 className="text-2xl font-black text-slate-900">Profile</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your admin profile information.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : profile ? (
        <>
          {/* Profile card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-green p-6">

            {/* Avatar + info row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-white"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }}>
                  {profile.profileImageUrl ? (
                    <img src={profile.profileImageUrl} alt={initials} className="w-full h-full object-cover"
                      onError={() => setProfile(prev => prev ? { ...prev, profileImageUrl: undefined } : prev)} />
                  ) : initials}
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full text-white text-sm shadow"
                  style={{ background: uploading ? '#86efac' : 'linear-gradient(135deg,#16a34a,#059669)' }}>
                  {uploading ? '⏳' : '📷'}
                </motion.button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
              </div>

              {/* Name + badges */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-black text-slate-900">
                  {profile.displayName || profile.username}
                </h2>
                {profile.displayName && (
                  <p className="text-sm text-slate-500">@{profile.username}</p>
                )}
                <p className="text-sm text-slate-500">{profile.email}</p>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-black text-amber-700">
                    ⚡ {profile.role}
                  </span>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-black ${
                    profile.sessionStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {profile.sessionStatus === 'Active' ? '🟢 Active' : '⚫ Expired'}
                  </span>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={editing ? cancelEdit : openEdit}
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
                      <label className={lbl}>Username</label>
                      <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2.5 text-sm text-slate-500">
                        <span className="flex-1 truncate">{profile.username}</span>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-200 rounded px-1.5 py-0.5">LOCKED</span>
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Display Name</label>
                      <input className="input-green" value={pDisplayName}
                        onChange={e => setPDisplayName(e.target.value)} placeholder="How you appear to others" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Email</label>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2.5 text-sm text-slate-500">
                      <span className="flex-1 truncate">{profile.email}</span>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-200 rounded px-1.5 py-0.5">LOCKED</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button type="submit" disabled={saving}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="btn-green flex-1 py-3">
                      {saving ? '⏳ Saving…' : '💾 Save Changes'}
                    </motion.button>
                    <button type="button" onClick={cancelEdit} className="btn-green-outline flex-none px-6">Cancel</button>
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

        </>
      ) : (
        <div className="card-green p-8 text-center text-slate-400">
          <p className="text-3xl mb-2">😕</p>
          <p className="font-semibold">Could not load profile</p>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePanel;
