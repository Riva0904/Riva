import React, { useEffect, useRef, useState } from 'react';
import { login, register, logout, getStoredRole } from '../../api/auth';
import { getUserSession, type UserSession } from '../../api/analysis';
import { getUserProfile, updateProfile, uploadProfileImage, type UserProfile } from '../../api/user';
import { getMyInvitations, type InvitationSummary } from '../../api/invitation';
import { getRsvpSummary, type RsvpSummary, type RsvpDto } from '../../api/rsvp';
import { getTemplates } from '../../api/templates';
import { motion, AnimatePresence } from 'framer-motion';
import UserTemplateGallery, { type WishlistItem } from './components/UserTemplateGallery';
import ShareModal from '../../components/ShareModal';
import { getStoredAuthToken } from '../../api/client';

const WISHLIST_KEY = 'riva_wishlist';
const getWishlist = (): WishlistItem[] => {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); }
  catch { return []; }
};

type Tab = 'profile' | 'templates';
type ProfileSubTab = 'work' | 'wishlist';
type AuthMode = 'login' | 'register';

const lbl = "block text-xs font-black text-slate-700 mb-1";

const statusColor = (s: string) =>
  s === 'Accepted' ? 'bg-green-100 text-green-700' :
  s === 'Declined' ? 'bg-red-100 text-red-700' :
                     'bg-amber-100 text-amber-700';
const statusIcon = (s: string) => s === 'Accepted' ? '✅' : s === 'Declined' ? '❌' : '🤔';

const UserDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getStoredAuthToken());
  const [session,    setSession]    = useState<UserSession | null>(null);
  const [tab,        setTab]        = useState<Tab>('profile');
  const [mode,       setMode]       = useState<AuthMode>('login');

  // Auth form
  const [eu, setEu] = useState('');
  const [pw, setPw] = useState('');
  const [un, setUn] = useState('');
  const [em, setEm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info,  setInfo]  = useState<string | null>(null);
  const [busy,  setBusy]  = useState(false);

  // Profile
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [editing,      setEditing]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [pDisplayName, setPDisplayName] = useState('');
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);

  // Profile sub-tabs
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('work');

  // Invitations
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [invLoading,  setInvLoading]  = useState(false);
  const [rsvpData,    setRsvpData]    = useState<Record<number, RsvpSummary>>({});
  const [expandedId,  setExpandedId]  = useState<number | null>(null);
  const [shareInv,    setShareInv]    = useState<InvitationSummary | null>(null);
  const [rsvpModal,   setRsvpModal]   = useState<{ inv: InvitationSummary; rsvp: RsvpSummary } | null>(null);

  // Template paid/free map for Platform Overview
  const [tplPaidMap, setTplPaidMap] = useState<Map<number, boolean>>(new Map());

  // Wishlist
  const [wishlist, setWishlist] = useState<WishlistItem[]>(getWishlist);

  useEffect(() => {
    if (isLoggedIn) {
      getUserSession().then(setSession).catch(() => { setIsLoggedIn(false); logout(); });
      getUserProfile().then(p => { setProfile(p); setPDisplayName(p.displayName ?? ''); }).catch(() => {});
      setInvLoading(true);
      getMyInvitations().then(setInvitations).finally(() => setInvLoading(false));
      getTemplates().then(res => {
        const m = new Map<number, boolean>();
        res.templates.forEach(t => m.set(t.templateId, t.isPaid));
        setTplPaidMap(m);
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (profileSubTab === 'wishlist') setWishlist(getWishlist());
  }, [profileSubTab]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const openEdit  = () => { if (profile) setPDisplayName(profile.displayName ?? ''); setEditing(true); };
  const cancelEdit = () => { if (profile) setPDisplayName(profile.displayName ?? ''); setEditing(false); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setBusy(true);
    try { await login({ emailOrUsername: eu, password: pw }); setIsLoggedIn(true); }
    catch (x: unknown) { setError(x instanceof Error ? x.message : 'Login failed'); }
    finally { setBusy(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setBusy(true);
    try {
      const res = await register({ username: un, email: em, password: pw });
      setInfo(res.message + ' — Please login.');
      setMode('login'); setUn(''); setEm(''); setPw('');
    } catch (x: unknown) { setError(x instanceof Error ? x.message : 'Registration failed'); }
    finally { setBusy(false); }
  };

  const handleLogout = () => { logout(); setIsLoggedIn(false); setSession(null); setProfile(null); setInvitations([]); };

  const handleImageUpload = async (file: File) => {
    setUploading(true); showToast('Uploading photo…');
    try {
      const res = await uploadProfileImage(file);
      const url = res.imageUrl + (res.imageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
      setProfile(prev => prev ? { ...prev, profileImageUrl: url } : prev);
      showToast('Profile photo updated!');
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Upload failed', false); }
    finally { setUploading(false); }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const dname = pDisplayName.trim();
      await updateProfile({ username: profile!.username, email: profile!.email, displayName: dname || undefined });
      setProfile(prev => prev ? { ...prev, displayName: dname || undefined } : prev);
      setEditing(false); showToast('Profile saved!');
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Save failed', false); }
    finally { setSaving(false); }
  };

  const loadRsvp = async (inv: InvitationSummary) => {
    if (inv.status !== 'Published') return;
    const id = inv.invitationId;
    if (rsvpData[id]) { setExpandedId(expandedId === id ? null : id); return; }
    try {
      const data = await getRsvpSummary(id);
      setRsvpData(prev => ({ ...prev, [id]: data }));
      setExpandedId(id);
    } catch { /* ignore */ }
  };

  const openRsvpModal = (inv: InvitationSummary) => {
    const rsvp = rsvpData[inv.invitationId];
    if (rsvp) { setRsvpModal({ inv, rsvp }); return; }
    getRsvpSummary(inv.invitationId).then(data => {
      setRsvpData(prev => ({ ...prev, [inv.invitationId]: data }));
      setRsvpModal({ inv, rsvp: data });
    }).catch(() => {});
  };

  const removeFromWishlist = (templateId: number) => {
    const next = wishlist.filter(t => t.templateId !== templateId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    setWishlist(next);
  };

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    const al = "block text-sm font-black text-slate-700 mb-1.5";
    return (
      <div className="bg-page flex min-h-screen items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card-green w-full max-w-md">
          <div className="bg-green-primary px-8 pt-8 pb-6 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-lg">🎉</div>
            <h1 className="text-2xl font-black text-white">Welcome to Riva</h1>
            <p className="text-sm text-green-100 mt-1">Create beautiful digital invitations</p>
          </div>
          <div className="p-8">
            <div className="tab-switcher">
              {(['login', 'register'] as AuthMode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(null); setInfo(null); }}
                  className={`tab-btn ${mode === m ? 'active' : ''}`}>
                  {m === 'login' ? '🔐 Login' : '✨ Register'}
                </button>
              ))}
            </div>
            {error && <div className="alert-error"><span>⚠️</span><span>{error}</span></div>}
            {info  && <div className="alert-success"><span>✅</span><span>{info}</span></div>}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div><label className={al}>Email or Username</label>
                  <input className="input-green" value={eu} onChange={e=>setEu(e.target.value)} required placeholder="Enter email or username" /></div>
                <div><label className={al}>Password</label>
                  <input type="password" className="input-green" value={pw} onChange={e=>setPw(e.target.value)} required placeholder="Enter password" /></div>
                <div className="flex items-center justify-between text-xs"><span />
                  <a href="/forgot-password" className="font-black text-green hover:underline">Forgot password?</a></div>
                <button type="submit" disabled={busy} className="btn-green mt-1">{busy ? '⏳ Signing in…' : 'Sign In →'}</button>
                <p className="text-center text-xs text-slate-400">Admin? <a href="/admin" className="font-black text-green hover:underline">Admin Portal</a></p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div><label className={al}>Username</label>
                  <input className="input-green" value={un} onChange={e=>setUn(e.target.value)} required placeholder="Choose a username" /></div>
                <div><label className={al}>Email</label>
                  <input type="email" className="input-green" value={em} onChange={e=>setEm(e.target.value)} required placeholder="your@email.com" /></div>
                <div><label className={al}>Password</label>
                  <input type="password" className="input-green" value={pw} onChange={e=>setPw(e.target.value)} required placeholder="Min 6 characters" /></div>
                <button type="submit" disabled={busy} className="btn-green mt-1">{busy ? '⏳ Creating account…' : 'Create Account →'}</button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Derived
  const profileJoined    = new Date((profile?.createdAt || session?.createdAt)!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const profileLastLogin = (profile?.lastLoginAt || session?.lastLoginAt)
    ? new Date((profile?.lastLoginAt || session?.lastLoginAt)!).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'First session';
  const avatarInitials = (profile?.displayName || profile?.username || session?.username || '?').charAt(0).toUpperCase();

  const published = invitations.filter(i => i.status === 'Published');
  const freePublished = published.filter(i => !tplPaidMap.get(i.templateId)).length;
  const paidPublished = published.filter(i =>  tplPaidMap.get(i.templateId)).length;

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-light-green min-h-screen">

      {/* Share modal */}
      {shareInv && (
        <ShareModal url={`${window.location.origin}/invite/${shareInv.slug}`}
          title={shareInv.title} onClose={() => setShareInv(null)} />
      )}

      {/* RSVP Messages Modal */}
      <AnimatePresence>
        {rsvpModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setRsvpModal(null)}>
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 24 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="card-green w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }} className="p-5 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-lg font-black text-white">📊 RSVP Responses</h3>
                  <p className="text-sm text-green-200 mt-0.5 truncate">{rsvpModal.inv.title}</p>
                </div>
                <button onClick={() => setRsvpModal(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition font-black">✕</button>
              </div>

              {/* Summary bar */}
              <div className="grid grid-cols-3 gap-2 p-4 border-b border-green-100 flex-shrink-0">
                {[
                  { label: 'Accept',  value: rsvpModal.rsvp.accepted, color: 'bg-green-100 text-green-700' },
                  { label: 'Decline', value: rsvpModal.rsvp.declined, color: 'bg-red-100 text-red-700' },
                  { label: 'Maybe',   value: rsvpModal.rsvp.maybe,    color: 'bg-amber-100 text-amber-700' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-xs font-bold">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Response list */}
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {rsvpModal.rsvp.responses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm text-slate-400 font-semibold">No responses yet</p>
                  </div>
                ) : (
                  rsvpModal.rsvp.responses.map((r: RsvpDto) => (
                    <motion.div key={r.rsvpId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="rounded-2xl border-2 border-green-50 bg-white p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar initial */}
                        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-base font-black text-white"
                          style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }}>
                          {r.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-sm">{r.guestName}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-black ${statusColor(r.status)}`}>
                              {statusIcon(r.status)} {r.status}
                            </span>
                            {r.guestCount > 1 && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                                👥 {r.guestCount} guests
                              </span>
                            )}
                          </div>
                          {r.guestEmail && (
                            <p className="text-xs text-slate-400 mt-0.5">{r.guestEmail}</p>
                          )}
                          {r.message && (
                            <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3 leading-relaxed italic">
                              "{r.message}"
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            {new Date(r.respondedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className={`fixed top-5 right-5 z-50 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-2xl ${
              toast.ok ? 'bg-green-600' : 'bg-red-500'}`}>
            {toast.ok ? '✅' : '⚠️'} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="dashboard-header shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-icon text-base">R</div>
            <div>
              <span className="font-black text-slate-900">Riva <span className="text-green">Dashboard</span></span>
              {session && (
                <span className="ml-2 text-sm text-slate-400 hidden sm:inline">
                  Welcome, {profile?.displayName || profile?.username || session.username} 👋
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStoredRole() === 'Admin' && <a href="/admin" className="navbar-btn-primary">Admin</a>}
            <button onClick={handleLogout} className="navbar-btn-outline text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">

        {/* Main tabs */}
        <div className="mb-6 flex gap-2 border-b-2 border-green-100">
          {([
            { key: 'profile'   as Tab, label: '👤 Profile' },
            { key: 'templates' as Tab, label: '🎨 Browse Templates' },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`page-tab ${tab === t.key ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {tab === 'profile' && (
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Left — Profile card + Platform Overview */}
            <div className="lg:col-span-1 space-y-4">
              {session ? (
                <>
                  <motion.div whileHover={{ y: -2 }} className="rounded-2xl overflow-hidden border-2 border-green-200">

                    {/* Green header with avatar */}
                    <div style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }} className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 text-2xl font-black text-white shadow overflow-hidden">
                            {profile?.profileImageUrl ? (
                              <img src={profile.profileImageUrl} alt={avatarInitials} className="w-full h-full object-cover"
                                onError={() => setProfile(prev => prev ? { ...prev, profileImageUrl: undefined } : prev)} />
                            ) : avatarInitials}
                          </div>
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                            onClick={() => fileRef.current?.click()} disabled={uploading}
                            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white shadow text-[10px]"
                            style={{ background: uploading ? '#86efac' : '#15803d' }}>
                            {uploading ? '⏳' : '📷'}
                          </motion.button>
                          <input ref={fileRef} type="file" className="hidden" accept="image/*"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-black text-white leading-tight truncate">
                            {profile?.displayName || session.username}
                          </h2>
                          <p className="text-sm text-green-200 truncate">{session.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Info + edit */}
                    <div className="bg-green-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${session.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {session.role}
                          </span>
                          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-black text-green-700">🟢 Active</span>
                          {session.subscriptionPlan && session.subscriptionPlan !== 'Starter' && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-700">
                              ⭐ {session.subscriptionPlan}
                            </span>
                          )}
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={editing ? cancelEdit : openEdit}
                          className="rounded-xl border-2 border-green-300 bg-white px-3 py-1 text-xs font-black text-green-700 hover:bg-white/70 transition">
                          {editing ? '✕' : '✏️ Edit'}
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {editing && (
                          <motion.form onSubmit={handleProfileSave}
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 overflow-hidden pt-1">
                            <div>
                              <label className={lbl}>Username</label>
                              <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-500">
                                <span className="flex-1 truncate">{profile?.username}</span>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-200 rounded px-1.5 py-0.5">LOCKED</span>
                              </div>
                            </div>
                            <div>
                              <label className={lbl}>Display Name</label>
                              <input className="input-green" value={pDisplayName}
                                onChange={e => setPDisplayName(e.target.value)} placeholder="How you appear to others" />
                            </div>
                            <div>
                              <label className={lbl}>Email</label>
                              <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-500">
                                <span className="flex-1 truncate">{profile?.email}</span>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-200 rounded px-1.5 py-0.5">LOCKED</span>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <motion.button type="submit" disabled={saving}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                className="btn-green flex-1 py-2 text-sm">
                                {saving ? '⏳ Saving…' : '💾 Save'}
                              </motion.button>
                              <button type="button" onClick={cancelEdit} className="btn-green-outline px-3 text-sm">Cancel</button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-white p-2.5">
                          <p className="text-slate-400 font-bold">Member Since</p>
                          <p className="font-black text-slate-700 mt-0.5 leading-tight">{profileJoined}</p>
                        </div>
                        <div className="rounded-xl bg-white p-2.5">
                          <p className="text-slate-400 font-bold">Last Login</p>
                          <p className="font-black text-slate-700 mt-0.5 leading-tight">{profileLastLogin}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Platform Overview — published invitations by free/paid */}
                  <div>
                    <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">Published Invitations</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Free',  value: invLoading ? '…' : freePublished, cls: 'bg-white border-2 border-green-100 text-green-700' },
                        { label: 'Paid',  value: invLoading ? '…' : paidPublished, cls: 'bg-white border-2 border-amber-100 text-amber-700' },
                        { label: 'Total', value: invLoading ? '…' : published.length, cls: 'bg-white border-2 border-slate-100 text-slate-700' },
                      ].map(s => (
                        <div key={s.label} className={`rounded-2xl p-3 text-center ${s.cls}`}>
                          <p className="text-xl font-black">{s.value}</p>
                          <p className="text-xs font-bold mt-0.5 opacity-70">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
              )}
            </div>

            {/* Right — Quick Actions + Sub-tabs + Content */}
            <div className="lg:col-span-2 space-y-5">

              {/* Quick Actions — top */}
              <div className="card-green p-5">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: '🎨', label: 'New Invitation',  action: () => setTab('templates') },
                    { icon: '⭐', label: session?.subscriptionPlan === 'Starter' ? 'Upgrade Plan' : session?.subscriptionPlan ?? 'Plan', href: '/subscription' },
                    { icon: '⚙️', label: 'Settings',        href: '/settings' },
                    { icon: '❤️', label: 'My Wishlist',     action: () => setProfileSubTab('wishlist') },
                  ].map(a => (
                    <motion.button key={a.label}
                      onClick={a.action ?? (() => { if (a.href) window.location.href = a.href; })}
                      whileHover={{ y: -4 }}
                      className="flex flex-col items-center gap-2 rounded-2xl border-2 border-green-100 bg-green-50 p-4 text-center hover:border-green-300 hover:bg-green-100 transition">
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-xs font-black text-slate-700">{a.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-2 border-b-2 border-green-100">
                {([
                  { key: 'work'     as ProfileSubTab, label: '🎨 Our Work' },
                  { key: 'wishlist' as ProfileSubTab, label: '❤️ Wishlist' },
                ]).map(t => (
                  <button key={t.key} onClick={() => setProfileSubTab(t.key)}
                    className={`page-tab ${profileSubTab === t.key ? 'active' : ''}`}>
                    {t.label}
                    {t.key === 'work'     && !invLoading && ` (${published.length})`}
                    {t.key === 'wishlist' && ` (${wishlist.length})`}
                  </button>
                ))}
              </div>

              {/* ── Our Work ── */}
              {profileSubTab === 'work' && (
                <>
                  {invLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[1,2,3,4].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
                    </div>
                  ) : published.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="card-green p-12 text-center">
                      <p className="text-5xl mb-4">🎉</p>
                      <h3 className="text-lg font-black text-slate-900 mb-2">No published invitations yet</h3>
                      <p className="text-sm text-slate-500 mb-5">Browse templates and create your first digital invitation.</p>
                      <button onClick={() => setTab('templates')} className="btn-green w-auto px-8 mx-auto">Browse Templates →</button>
                    </motion.div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AnimatePresence>
                        {published.map((inv, idx) => {
                          const rsvp = rsvpData[inv.invitationId];
                          const isExpanded = expandedId === inv.invitationId;
                          const msgCount = rsvp?.responses.filter(r => r.message?.trim()).length ?? 0;

                          return (
                            <motion.div key={inv.invitationId}
                              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                              className="card-green rounded-2xl overflow-hidden group">

                              {/* Thumbnail */}
                              <div className="relative bg-light-green overflow-hidden" style={{ height: 120 }}>
                                {inv.thumbnailUrl ? (
                                  <img src={inv.thumbnailUrl} alt={inv.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-4xl">🎉</div>
                                )}
                                <span className="absolute top-2 right-2 rounded-full bg-green-600 text-white px-2 py-0.5 text-xs font-black">
                                  Published
                                </span>
                                <span className="absolute top-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white">
                                  👁 {inv.viewCount}
                                </span>
                                {/* Message badge on thumbnail */}
                                {msgCount > 0 && (
                                  <motion.button whileHover={{ scale: 1.1 }}
                                    onClick={() => openRsvpModal(inv)}
                                    className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-black text-green-700 shadow">
                                    💬 {msgCount}
                                  </motion.button>
                                )}
                              </div>

                              <div className="p-3 space-y-2">
                                <div>
                                  <h3 className="font-black text-slate-900 truncate text-sm">{inv.title}</h3>
                                  <p className="text-xs text-slate-400">{inv.templateName}</p>
                                </div>

                                {/* RSVP section */}
                                <div>
                                  <button onClick={() => loadRsvp(inv)}
                                    className="w-full rounded-xl bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-black text-green-700 hover:bg-green-100 transition text-left flex items-center justify-between">
                                    <span>📊 RSVP Responses {rsvp ? `(${rsvp.totalResponses})` : ''}</span>
                                    <span>{isExpanded ? '▲' : '▼'}</span>
                                  </button>

                                  <AnimatePresence>
                                    {isExpanded && rsvp && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden">
                                        {/* Count row */}
                                        <div className="grid grid-cols-3 gap-1 mt-2">
                                          {[
                                            { label: '✅ Accept',  value: rsvp.accepted, color: 'bg-green-100 text-green-700' },
                                            { label: '❌ Decline', value: rsvp.declined, color: 'bg-red-100 text-red-700' },
                                            { label: '🤔 Maybe',   value: rsvp.maybe,    color: 'bg-amber-100 text-amber-700' },
                                          ].map(s => (
                                            <div key={s.label} className={`rounded-lg p-1.5 text-center ${s.color}`}>
                                              <p className="text-lg font-black">{s.value}</p>
                                              <p className="text-xs">{s.label}</p>
                                            </div>
                                          ))}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 text-center">{rsvp.totalGuests} total guests attending</p>

                                        {/* Message previews */}
                                        {rsvp.responses.filter(r => r.message?.trim()).slice(0, 2).map(r => (
                                          <div key={r.rsvpId} className="mt-2 rounded-xl bg-slate-50 p-2.5 flex items-start gap-2">
                                            <div className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                                              style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }}>
                                              {r.guestName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs font-black text-slate-800">{r.guestName}</span>
                                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${statusColor(r.status)}`}>
                                                  {statusIcon(r.status)}
                                                </span>
                                              </div>
                                              <p className="text-xs text-slate-500 mt-0.5 truncate italic">"{r.message}"</p>
                                            </div>
                                          </div>
                                        ))}

                                        {/* View all button */}
                                        {rsvp.totalResponses > 0 && (
                                          <button onClick={() => openRsvpModal(inv)}
                                            className="mt-2 w-full rounded-xl border-2 border-green-200 bg-white py-1.5 text-xs font-black text-green-700 hover:bg-green-50 transition">
                                            📩 View All Responses →
                                          </button>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                <div className="flex gap-2">
                                  <a href={`/invitation/${inv.invitationId}/edit`}
                                    className="flex-1 btn-green-outline text-xs py-1.5 text-center">✏️ Edit</a>
                                  <button onClick={() => setShareInv(inv)}
                                    className="flex-1 btn-green text-xs py-1.5">🔗 Share</button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              )}

              {/* ── Wishlist ── */}
              {profileSubTab === 'wishlist' && (
                <>
                  {wishlist.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="card-green p-12 text-center">
                      <p className="text-5xl mb-4">❤️</p>
                      <h3 className="text-lg font-black text-slate-900 mb-2">No saved templates</h3>
                      <p className="text-sm text-slate-500 mb-5">Tap ❤️ on any template while browsing to save it here.</p>
                      <button onClick={() => setTab('templates')} className="btn-green w-auto px-8 mx-auto">Browse Templates →</button>
                    </motion.div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {wishlist.map((t, idx) => (
                        <motion.div key={t.templateId}
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }} whileHover={{ y: -3 }}
                          className="card-green rounded-2xl overflow-hidden group">
                          <div className="relative bg-light-green overflow-hidden" style={{ height: 120 }}>
                            {(t.previewImageUrl || t.thumbnailUrl) ? (
                              <img src={t.previewImageUrl || t.thumbnailUrl || ''} alt={t.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-4xl">🎉</div>
                            )}
                            <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-black ${t.isPaid ? 'bg-amber-400 text-amber-900' : 'bg-green-500 text-white'}`}>
                              {t.isPaid ? `$${t.price ?? ''}` : 'Free'}
                            </span>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromWishlist(t.templateId)}
                              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-base shadow hover:bg-red-50 transition">
                              ❤️
                            </motion.button>
                          </div>
                          <div className="p-3">
                            <h3 className="font-black text-slate-900 text-sm truncate">{t.name}</h3>
                            <p className="text-xs text-slate-400 mb-2">{t.categoryName}</p>
                            <a href={`/invitation/new/${t.templateId}`}
                              className="btn-green w-full text-xs py-1.5 text-center block">✨ Use Template</a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Browse Templates tab ── */}
        {tab === 'templates' && (
          <div className="card-green p-6">
            <div className="mb-5">
              <h3 className="text-lg font-black text-slate-900">Browse Invitation Templates</h3>
              <p className="text-sm text-slate-500 mt-0.5">Tap ❤️ on any template to save it to your Wishlist</p>
            </div>
            <UserTemplateGallery subscriptionPlan={session?.subscriptionPlan ?? 'Starter'} />
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
