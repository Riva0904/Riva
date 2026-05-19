import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredAuthToken, API_ORIGIN } from '../../api/client';
import { logout, getStoredRole, setStoredDisplayName, getStoredDisplayName } from '../../api/auth';
import { getUserSession, type UserSession } from '../../api/analysis';
import { getUserProfile, updateProfile, uploadProfileImage, type UserProfile } from '../../api/user';
import { getMyInvitations, getPublicInvitationHtml, type InvitationSummary } from '../../api/invitation';
import { getRsvpSummary, exportRsvpCsv, type RsvpSummary, type RsvpDto } from '../../api/rsvp';
import { getTemplates, type TemplateListItem } from '../../api/templates';
import { getMyPlan, type MyPlan } from '../../api/subscriptions';
import ShareModal from '../../components/ShareModal';
import TemplatePaymentModal from '../../components/TemplatePaymentModal';
import { handleUseTemplate } from '../../utils/templateAccess';
import { useWishlist } from '../../hooks/useWishlist';

const withBase = (html: string) => html.replace('<head>', `<head><base href="${API_ORIGIN}/">`);

type ProfileTab  = 'work' | 'wishlist';

const statusColor = (s: string) =>
  s === 'Accepted' ? 'bg-green-100 text-green-700' :
  s === 'Declined' ? 'bg-red-100 text-red-700'     : 'bg-amber-100 text-amber-700';
const statusIcon  = (s: string) =>
  s === 'Accepted' ? '✅' : s === 'Declined' ? '❌' : '🤔';

/* ── locked field ─────────────────────────────────────────── */
const LockedField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-xs font-black text-slate-600 mb-1">{label}</label>
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
      <span className="truncate">{value}</span>
      <span className="ml-2 flex-shrink-0 rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-500 tracking-wide">
        LOCKED
      </span>
    </div>
  </div>
);

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getStoredAuthToken()) window.location.href = '/login';
  }, []);

  const [session,     setSession]     = useState<UserSession | null>(null);
  const [payTemplate, setPayTemplate] = useState<TemplateListItem | null>(null);
  const [profTab,   setProfTab]   = useState<ProfileTab>('work');
  const fileRef         = useRef<HTMLInputElement>(null);
  const fetchedRsvpIds  = useRef(new Set<number>());

  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [editing,      setEditing]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [pDisplayName, setPDisplayName] = useState('');
  const [showFields,   setShowFields]   = useState(false);
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);

  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [invLoading,  setInvLoading]  = useState(false);
  const [rsvpData,    setRsvpData]    = useState<Record<number, RsvpSummary>>({});
  const [expandedId,  setExpandedId]  = useState<number | null>(null);
  const [shareInv,    setShareInv]    = useState<InvitationSummary | null>(null);
  const [rsvpModal,   setRsvpModal]   = useState<{ inv: InvitationSummary; rsvp: RsvpSummary } | null>(null);
  const [tplPaidMap,  setTplPaidMap]  = useState<Map<number, boolean>>(new Map());
  const [allTpls,     setAllTpls]     = useState<TemplateListItem[]>([]);
  const { wishlistIds, toggleWishlist } = useWishlist();

  const [myPlan,        setMyPlan]        = useState<MyPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [previewInv,    setPreviewInv]    = useState<InvitationSummary | null>(null);
  const [previewHtml,   setPreviewHtml]   = useState<string | null>(null);
  const [previewLoading,setPreviewLoading]= useState(false);

  useEffect(() => {
    if (!getStoredAuthToken()) return;
    getUserSession().then(setSession).catch(() => { logout(); window.location.href = '/login'; });
    getUserProfile().then(p => { setProfile(p); setPDisplayName(p.displayName ?? ''); }).catch(() => {});
    setInvLoading(true);
    getMyInvitations().then(setInvitations).finally(() => setInvLoading(false));
    getTemplates().then(res => {
      const m = new Map<number, boolean>();
      res.templates.forEach(t => m.set(t.templateId, t.isPaid));
      setTplPaidMap(m);
      setAllTpls(res.templates);
    }).catch(() => {});
    getMyPlan().then(setMyPlan).catch(() => {});
  }, []);

  useEffect(() => {
    // Only fetch RSVPs for invitations not yet cached — prevents redundant API calls
    invitations
      .filter(i => i.status === 'Published' && !fetchedRsvpIds.current.has(i.invitationId))
      .forEach(inv => {
        fetchedRsvpIds.current.add(inv.invitationId);
        getRsvpSummary(inv.invitationId)
          .then(d => setRsvpData(p => ({ ...p, [inv.invitationId]: d })))
          .catch(() => { fetchedRsvpIds.current.delete(inv.invitationId); });
      });
  }, [invitations]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout      = () => { logout(); window.location.href = '/'; };
  const openEdit          = () => { setPDisplayName(profile?.displayName ?? ''); setEditing(true); };
  const cancelEdit        = () => { setPDisplayName(profile?.displayName ?? ''); setEditing(false); };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadProfileImage(file);
      const url = res.imageUrl + (res.imageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
      setProfile(p => p ? { ...p, profileImageUrl: url } : p);
      showToast('Profile photo updated!');
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Upload failed', false); }
    finally { setUploading(false); }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const dname = pDisplayName.trim();
      await updateProfile({ username: profile!.username, email: profile!.email, displayName: dname || undefined });
      setProfile(p => p ? { ...p, displayName: dname || undefined } : p);
      setStoredDisplayName(dname || null);
      setEditing(false); showToast('Profile saved!');
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Save failed', false); }
    finally { setSaving(false); }
  };

  const loadRsvp = async (inv: InvitationSummary) => {
    if (inv.status !== 'Published') return;
    const id = inv.invitationId;
    if (rsvpData[id]) { setExpandedId(expandedId === id ? null : id); return; }
    try {
      const d = await getRsvpSummary(id);
      setRsvpData(p => ({ ...p, [id]: d }));
      setExpandedId(id);
    } catch { /* ignore */ }
  };

  const openRsvpModal = (inv: InvitationSummary) => {
    // Close any open invitation preview so it doesn't show behind the RSVP modal
    setPreviewInv(null);
    setPreviewHtml(null);
    const rsvp = rsvpData[inv.invitationId];
    if (rsvp) { setRsvpModal({ inv, rsvp }); return; }
    getRsvpSummary(inv.invitationId)
      .then(d => { setRsvpData(p => ({ ...p, [inv.invitationId]: d })); setRsvpModal({ inv, rsvp: d }); })
      .catch(() => {});
  };

  const wishlist = useMemo(
    () => allTpls.filter(t => wishlistIds.has(t.templateId)),
    [allTpls, wishlistIds]
  );

  const published     = useMemo(() => invitations.filter(i => i.status === 'Published'), [invitations]);
  const freePublished = useMemo(() => published.filter(i => !tplPaidMap.get(i.templateId)).length, [published, tplPaidMap]);
  const paidPublished = useMemo(() => published.filter(i =>  tplPaidMap.get(i.templateId)).length, [published, tplPaidMap]);
  const displayName   = profile?.displayName || profile?.username || session?.username || getStoredDisplayName() || '';
  const avatarInitial = displayName.charAt(0).toUpperCase() || '?';

  const profileJoined    = (profile?.createdAt || session?.createdAt)
    ? new Date((profile?.createdAt || session?.createdAt)!).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';
  const profileLastLogin = (profile?.lastLoginAt || session?.lastLoginAt)
    ? new Date((profile?.lastLoginAt || session?.lastLoginAt)!).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'First session';

  if (!getStoredAuthToken()) return null;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Template payment modal — triggered from wishlist */}
      {payTemplate && (
        <TemplatePaymentModal
          template={payTemplate}
          onClose={() => setPayTemplate(null)}
          onSuccess={id => { setPayTemplate(null); navigate(`/invitation/new/${id}`); }}
        />
      )}

      {/* Share modal */}
      {shareInv && (
        <ShareModal url={`${window.location.origin}/invite/${shareInv.slug}`}
          title={shareInv.title} onClose={() => setShareInv(null)} />
      )}

      {/* Invitation preview modal */}
      <AnimatePresence>
        {previewInv && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
            onClick={() => { setPreviewInv(null); setPreviewHtml(null); }}>
            <motion.div
              initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }} transition={{ type: 'spring', bounce: 0.22 }}
              className="relative flex flex-col w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{ maxHeight: '92vh', background: '#0f172a' }}
              onClick={e => e.stopPropagation()}>

              {/* Top action bar */}
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="min-w-0">
                  <p className="text-white font-black text-sm truncate">{previewInv.title}</p>
                  <p className="text-white/40 text-xs truncate">{previewInv.templateName}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {previewInv.status === 'Published' && (
                    <button onClick={() => setShareInv(previewInv)}
                      className="rounded-xl px-3 py-1.5 text-xs font-black text-white/80 border border-white/20 hover:bg-white/10 transition">
                      🔗 Share
                    </button>
                  )}
                  <button onClick={() => { setPreviewInv(null); setPreviewHtml(null); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-sm transition">
                    ✕
                  </button>
                </div>
              </div>

              {/* Invitation content */}
              <div className="flex-1 overflow-hidden">
                {previewInv.status === 'Published' ? (
                  previewLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/50">
                      <motion.div animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full" />
                      <p className="text-xs">Loading invitation…</p>
                    </div>
                  ) : previewHtml ? (
                    <iframe srcDoc={previewHtml} className="w-full border-0"
                      style={{ height: '72vh' }} title={previewInv.title}
                      sandbox="allow-scripts allow-same-origin" />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-white/40 text-sm">
                      Could not load invitation
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 gap-4 p-6 text-white/50">
                    <p className="text-4xl">📝</p>
                    <p className="text-sm font-semibold">Draft — not published yet</p>
                  </div>
                )}
              </div>

              {/* Bottom action — Use This Template */}
              <div className="flex-shrink-0 p-3 border-t border-white/10">
                <a href={`/invitation/new/${previewInv.templateId}`}
                  className="flex items-center justify-center gap-2 w-full rounded-2xl py-3 text-sm font-black text-white transition"
                  style={{ background: 'var(--color-gradient)' }}>
                  🎨 Use This Template for New Invitation
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Plan modal */}
      <AnimatePresence>
        {showPlanModal && (() => {
          const sub       = myPlan?.subscription;
          const active    = sub?.status === 'Active';
          const planName  = active ? sub!.planType : 'Free';
          const endDate   = active && sub?.endDate
            ? new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : null;

          const PLAN_INFO: Record<string, { color: string; gradient: string; icon: string; price: string; features: string[] }> = {
            Free:    { color: '#16a34a', gradient: 'linear-gradient(135deg,#16a34a,#059669)', icon: '🆓', price: '₹0/month',
              features: ['Free invitation templates','Basic text & quotes design','Unlimited RSVPs','WhatsApp & email sharing','QR code generation','Includes Riva branding'] },
            Pro:     { color: '#7c3aed', gradient: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', icon: '🚀', price: '₹1,499/month',
              features: ['Everything in Free','Pro animated templates','Google Maps integration','Video embed (30-40 sec)','Countdown timer','Full RSVP forms','Includes Riva branding'] },
            Premium: { color: '#db2777', gradient: 'linear-gradient(135deg,#7c3aed,#db2777)', icon: '💎', price: '₹799/month',
              features: ['Everything in Pro','Unlimited ALL templates','Premium animated themes','Background images & GIFs','Photo gallery section','RSVP analytics dashboard','Remove Riva branding'] },
          };
          const info = PLAN_INFO[planName] ?? PLAN_INFO['Free'];

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
              onClick={() => setShowPlanModal(false)}>
              <motion.div
                initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 24 }} transition={{ type: 'spring', bounce: 0.3 }}
                className="w-full max-w-sm rounded-3xl overflow-hidden bg-white shadow-2xl"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 text-white text-center" style={{ background: info.gradient }}>
                  <div className="text-4xl mb-2">{info.icon}</div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                    {active ? 'Your Current Plan' : 'No Active Plan'}
                  </p>
                  <h2 className="text-2xl font-black">{planName}</h2>
                  <p className="text-lg font-bold opacity-90 mt-0.5">{info.price}</p>
                  {endDate && (
                    <p className="text-xs opacity-70 mt-2">Renews {endDate}</p>
                  )}
                  {active && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                      Active
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="p-5">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Plan Includes</p>
                  <ul className="space-y-2 mb-5">
                    {info.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="font-black flex-shrink-0" style={{ color: info.color }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {planName !== 'Free' && (
                      <button onClick={() => { setShowPlanModal(false); window.location.href = `/templates?tier=${planName}`; }}
                        className="w-full rounded-xl py-3 text-sm font-black text-white"
                        style={{ background: info.gradient }}>
                        Browse {planName} Templates →
                      </button>
                    )}
                    {planName === 'Free' && (
                      <button onClick={() => { setShowPlanModal(false); window.location.href = '/payment?plan=Premium&cycle=monthly'; }}
                        className="w-full rounded-xl py-3 text-sm font-black text-white"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                        Upgrade to Premium →
                      </button>
                    )}
                    {planName === 'Pro' && (
                      <button onClick={() => { setShowPlanModal(false); window.location.href = '/payment?plan=Premium&cycle=monthly'; }}
                        className="w-full rounded-xl py-2.5 text-sm font-black text-slate-600 border border-slate-200 hover:border-purple-300 transition">
                        Upgrade to Premium 💎
                      </button>
                    )}
                    <button onClick={() => setShowPlanModal(false)}
                      className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition">
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* RSVP modal */}
      <AnimatePresence>
        {rsvpModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setRsvpModal(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', bounce: 0.3 }}
              className="w-full max-w-lg rounded-3xl overflow-hidden bg-white shadow-2xl max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}>
              <div style={{ background: 'var(--color-gradient)' }} className="p-5 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-lg font-black text-white">RSVP Responses</h3>
                  <p className="text-sm text-white/70 truncate mt-0.5">{rsvpModal.inv.title}</p>
                </div>
                <button onClick={() => setRsvpModal(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition font-black">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-100 flex-shrink-0">
                {[
                  { label: 'Accepted', value: rsvpModal.rsvp.accepted, cls: 'bg-green-50 text-green-700' },
                  { label: 'Declined', value: rsvpModal.rsvp.declined, cls: 'bg-red-50 text-red-700' },
                  { label: 'Maybe',    value: rsvpModal.rsvp.maybe,    cls: 'bg-amber-50 text-amber-700' },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl p-3 text-center ${s.cls}`}>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-xs font-semibold mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {rsvpModal.rsvp.responses.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-slate-400 font-semibold">No responses yet</p>
                  </div>
                ) : rsvpModal.rsvp.responses.map((r: RsvpDto) => (
                  <div key={r.rsvpId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-sm font-black text-white"
                        style={{ background: 'var(--color-gradient)' }}>
                        {r.guestName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-900 text-sm">{r.guestName}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-black ${statusColor(r.status)}`}>
                            {statusIcon(r.status)} {r.status}
                          </span>
                          {r.guestCount > 1 && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">+{r.guestCount - 1} guests</span>
                          )}
                        </div>
                        {r.message && <p className="mt-1.5 text-sm text-slate-600 italic">"{r.message}"</p>}
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(r.respondedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className={`fixed top-5 right-5 z-50 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-2xl ${toast.ok ? 'bg-green-600' : 'bg-red-500'}`}>
            {toast.ok ? '✅' : '⚠️'} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="logo-icon text-sm">R</div>
              <span className="font-black text-slate-800 hidden sm:block">
                Riva <span className="text-green">Dashboard</span>
              </span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            {getStoredRole() === 'Admin' && (
              <a href="/admin" className="hidden sm:inline-flex rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-700 hover:bg-amber-200 transition">
                Admin Panel
              </a>
            )}
            <a href="/settings" className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:border-green-400 hover:text-green-700 transition">
              ⚙️ <span className="hidden sm:inline">Settings</span>
            </a>
            <button onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:border-red-300 hover:text-red-600 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">

        {/* ── Tab bar ── */}
        <div className="flex gap-1 mb-6 border-b-2 border-slate-200">
          <span className="px-5 py-2.5 text-sm font-black rounded-t-xl border-b-2 -mb-0.5 text-green-700 border-green-500 bg-white">
            👤 My Profile
          </span>
        </div>

        {/* ── Profile ── */}
        <div className="grid gap-6 lg:grid-cols-3">

            {/* Left — Profile card */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">

                {/* Gradient header */}
                <div style={{ background: 'var(--color-gradient)' }} className="px-5 pt-6 pb-10 relative">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white overflow-hidden bg-white/25 shadow-lg">
                        {profile?.profileImageUrl ? (
                          <img src={profile.profileImageUrl} alt={avatarInitial} className="w-full h-full object-cover"
                            onError={() => setProfile(p => p ? { ...p, profileImageUrl: undefined } : p)} />
                        ) : avatarInitial}
                      </div>
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={() => fileRef.current?.click()} disabled={uploading}
                        title="Change photo"
                        className="absolute -bottom-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full bg-white shadow-md text-sm border border-slate-200">
                        {uploading ? '⏳' : '📷'}
                      </motion.button>
                      <input ref={fileRef} type="file" className="hidden" accept="image/*"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white leading-tight">{displayName}</h2>
                      <p className="text-white/70 text-sm mt-0.5 truncate">{session?.email ?? profile?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Profile details card - overlaps header */}
                <div className="mx-4 -mt-5 rounded-2xl bg-white border border-slate-200 shadow-md p-4 space-y-3">

                  {/* Badges row */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        session?.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {session?.role ?? 'User'}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                        Active
                      </span>
                      {session?.subscriptionPlan && session.subscriptionPlan !== 'Starter' && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                          ⭐ {session.subscriptionPlan}
                        </span>
                      )}
                    </div>
                    {showFields ? (
                      <button onClick={() => { setShowFields(false); setEditing(false); }} title="Hide details"
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 hover:border-red-300 hover:bg-red-50 transition text-slate-400 hover:text-red-500 font-black text-sm">
                        ✕
                      </button>
                    ) : (
                      <button onClick={() => setShowFields(true)} title="Show details"
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 hover:border-green-400 hover:bg-green-50 transition text-slate-400 hover:text-green-600 font-black text-xs">
                        ▼
                      </button>
                    )}
                  </div>

                  {/* Collapsible fields section */}
                  <AnimatePresence initial={false}>
                    {showFields && (
                      <motion.div
                        key="fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden space-y-3">
                        {editing ? (
                          <form onSubmit={handleProfileSave} className="space-y-3">
                            <LockedField label="Username" value={profile?.username ?? ''} />
                            <div>
                              <label className="block text-xs font-black text-slate-600 mb-1">Display Name</label>
                              <input className="input-green text-sm" value={pDisplayName}
                                onChange={e => setPDisplayName(e.target.value)}
                                placeholder="How you appear to others" />
                            </div>
                            <LockedField label="Email" value={profile?.email ?? ''} />
                            <div className="flex gap-2 pt-1">
                              <motion.button type="submit" disabled={saving}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                className="flex-1 rounded-xl py-2.5 text-sm font-black text-white transition"
                                style={{ background: saving ? '#86efac' : 'var(--color-gradient)' }}>
                                {saving ? '⏳ Saving…' : '💾 Save'}
                              </motion.button>
                              <button type="button" onClick={cancelEdit}
                                className="flex-1 rounded-xl border-2 border-slate-200 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50 transition">
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-3">
                            <LockedField label="Username" value={profile?.username ?? '—'} />
                            <div>
                              <label className="block text-xs font-black text-slate-600 mb-1">Display Name</label>
                              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
                                {profile?.displayName || <span className="text-slate-400 italic">Not set</span>}
                              </div>
                            </div>
                            <LockedField label="Email" value={profile?.email ?? '—'} />
                            <button onClick={openEdit}
                              className="w-full rounded-xl border-2 border-dashed border-slate-200 py-2 text-xs font-black text-slate-400 hover:border-green-400 hover:text-green-600 transition">
                              Edit Profile
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Member since / last login */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Member Since</p>
                      <p className="text-xs font-black text-slate-700 mt-0.5 leading-tight">{profileJoined}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Last Login</p>
                      <p className="text-xs font-black text-slate-700 mt-0.5 leading-tight">{profileLastLogin}</p>
                    </div>
                  </div>
                </div>

                {/* Published Invitations stats */}
                <div className="px-4 pt-3 pb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Published Invitations</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Free',  value: invLoading ? '…' : freePublished, cls: 'text-green-700 bg-green-50 border-green-100' },
                      { label: 'Paid',  value: invLoading ? '…' : paidPublished, cls: 'text-amber-700 bg-amber-50 border-amber-100' },
                      { label: 'Total', value: invLoading ? '…' : published.length, cls: 'text-slate-700 bg-slate-50 border-slate-100' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-xl border p-2.5 text-center ${s.cls}`}>
                        <p className="text-xl font-black">{s.value}</p>
                        <p className="text-[10px] font-semibold mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Quick Actions + Work/Wishlist */}
            <div className="lg:col-span-2 space-y-5">

              {/* Quick Actions grid */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: '🎨', label: 'New Invitation', href: '/templates', action: undefined as (() => void) | undefined },
                    { icon: '⭐', label: 'My Plan', action: () => setShowPlanModal(true) },
                    { icon: '⚙️', label: 'Settings',        href: '/settings' },
                    { icon: '❤️', label: 'My Wishlist',    action: () => setProfTab('wishlist') },
                  ].map(a => (
                    <motion.button key={a.label}
                      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={a.action ?? (() => { if (a.href) window.location.href = a.href; })}
                      className="flex flex-col items-center gap-2.5 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-center hover:border-green-300 hover:bg-green-50 transition cursor-pointer">
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-xs font-black text-slate-700 leading-tight">{a.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Our Work / Wishlist sub-tabs */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100 px-4 pt-1">
                  {([
                    { key: 'work'     as ProfileTab, label: '🎨 Our Work',  count: invitations.length },
                    { key: 'wishlist' as ProfileTab, label: '❤️ Wishlist', count: wishlist.length },
                  ]).map(t => (
                    <button key={t.key} onClick={() => setProfTab(t.key)}
                      className={`px-4 py-3 text-sm font-black border-b-2 -mb-px transition ${
                        profTab === t.key
                          ? 'text-green-700 border-green-500'
                          : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                      {t.label}
                      {!invLoading && (
                        <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                          profTab === t.key ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-5">

                  {/* ── Our Work ── */}
                  {profTab === 'work' && (
                    invLoading ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[1,2,3,4].map(i => <div key={i} className="animate-pulse rounded-2xl bg-slate-100 h-48" />)}
                      </div>
                    ) : invitations.length === 0 ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="py-14 text-center">
                        <p className="text-5xl mb-3">🎉</p>
                        <h3 className="text-base font-black text-slate-800 mb-1">No invitations yet</h3>
                        <p className="text-sm text-slate-400 mb-5">Browse templates and create your first digital invitation.</p>
                        <a href="/templates" className="btn-green mx-auto w-auto px-8 text-center block">
                          Browse Templates →
                        </a>
                      </motion.div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <AnimatePresence>
                          {invitations.map((inv, idx) => {
                            const rsvp       = rsvpData[inv.invitationId];
                            const isExpanded = expandedId === inv.invitationId;
                            const rsvpCount  = rsvp?.totalResponses ?? 0;
                            return (
                              <motion.div key={inv.invitationId}
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                                className="rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-md transition bg-white">

                                {/* Thumbnail — click to open invitation preview */}
                                <div className="relative bg-slate-100 overflow-hidden cursor-pointer" style={{ height: 130 }}
                                  onClick={() => {
                                    setPreviewInv(inv);
                                    if (inv.status === 'Published' && inv.slug) {
                                      setPreviewHtml(null); setPreviewLoading(true);
                                      getPublicInvitationHtml(inv.slug)
                                        .then(h => setPreviewHtml(withBase(h))).catch(() => setPreviewHtml(null))
                                        .finally(() => setPreviewLoading(false));
                                    }
                                  }}>
                                  {inv.thumbnailUrl ? (
                                    <img src={inv.thumbnailUrl} alt={inv.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-4xl bg-green-50">🎉</div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                                  <span className={`absolute top-2 right-2 rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                                    inv.status === 'Published' ? 'bg-green-600 text-white' : 'bg-slate-600 text-white'
                                  }`}>
                                    {inv.status === 'Published' ? 'Published' : 'Saved'}
                                  </span>
                                  <span className="absolute top-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white">
                                    👁 {inv.viewCount}
                                  </span>
                                  {rsvpCount > 0 && (
                                    <motion.button whileHover={{ scale: 1.1 }}
                                      onClick={e => { e.stopPropagation(); openRsvpModal(inv); }}
                                      className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-black text-green-700 shadow">
                                      💬 {rsvpCount}
                                    </motion.button>
                                  )}
                                </div>

                                <div className="p-3 space-y-2.5">
                                  <div>
                                    <h3 className="font-black text-slate-900 truncate cursor-pointer hover:underline"
                                      onClick={() => {
                                        setPreviewInv(inv);
                                        if (inv.status === 'Published' && inv.slug) {
                                          setPreviewHtml(null); setPreviewLoading(true);
                                          getPublicInvitationHtml(inv.slug)
                                            .then(h => setPreviewHtml(withBase(h))).catch(() => setPreviewHtml(null))
                                            .finally(() => setPreviewLoading(false));
                                        }
                                      }}>
                                      {inv.title}
                                    </h3>
                                    <p className="text-xs text-slate-400">{inv.templateName}</p>
                                  </div>

                                  {/* RSVP accordion — only for Published */}
                                  {inv.status !== 'Published' && (
                                    <a href={`/invitation/${inv.invitationId}/edit`}
                                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition text-center">
                                      ✏️ Continue Editing →
                                    </a>
                                  )}
                                  <div className={inv.status !== 'Published' ? 'hidden' : ''}>
                                    <button onClick={() => loadRsvp(inv)}
                                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition flex items-center justify-between">
                                      <span>📊 RSVP Responses {rsvp ? `(${rsvp.totalResponses})` : ''}</span>
                                      <span className="text-slate-400">{isExpanded ? '▲' : '▼'}</span>
                                    </button>
                                    <AnimatePresence>
                                      {isExpanded && rsvp && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden">
                                          <div className="grid grid-cols-3 gap-1.5 mt-2">
                                            {[
                                              { label: 'Accept',  v: rsvp.accepted, cls: 'bg-green-50 text-green-700' },
                                              { label: 'Decline', v: rsvp.declined, cls: 'bg-red-50 text-red-700' },
                                              { label: 'Maybe',   v: rsvp.maybe,    cls: 'bg-amber-50 text-amber-700' },
                                            ].map(s => (
                                              <div key={s.label} className={`rounded-lg p-1.5 text-center ${s.cls}`}>
                                                <p className="text-base font-black">{s.v}</p>
                                                <p className="text-[10px]">{s.label}</p>
                                              </div>
                                            ))}
                                          </div>
                                          <p className="text-xs text-slate-400 text-center mt-1">{rsvp.totalGuests} guests attending</p>
                                          {rsvp.responses.filter(r => r.message?.trim()).slice(0, 2).map(r => (
                                            <div key={r.rsvpId} className="mt-2 rounded-xl bg-slate-50 p-2.5 flex items-start gap-2">
                                              <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                                                style={{ background: 'var(--color-gradient)' }}>
                                                {r.guestName.charAt(0).toUpperCase()}
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                <span className="text-xs font-black text-slate-800">{r.guestName}</span>
                                                <p className="text-xs text-slate-400 truncate italic">"{r.message}"</p>
                                              </div>
                                            </div>
                                          ))}
                                          {rsvp.totalResponses > 0 && (
                                            <div className="mt-2 flex gap-1.5">
                                              <button onClick={() => openRsvpModal(inv)}
                                                className="flex-1 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-black text-slate-600 hover:border-green-300 hover:text-green-700 transition">
                                                View All →
                                              </button>
                                              <button onClick={() => exportRsvpCsv(inv.invitationId, inv.title).catch(() => {})}
                                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-500 hover:border-green-300 hover:text-green-700 transition"
                                                title="Export CSV">⬇ CSV</button>
                                            </div>
                                          )}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>{/* end RSVP accordion */}

                                  {/* Share button — only for Published */}
                                  {inv.status === 'Published' && (
                                    <button onClick={() => setShareInv(inv)}
                                      className="w-full rounded-xl py-2 text-xs font-black text-white transition text-center"
                                      style={{ background: 'var(--color-gradient)' }}>
                                      🔗 Share
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )
                  )}

                  {/* ── Wishlist ── */}
                  {profTab === 'wishlist' && (
                    wishlist.length === 0 ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-14 text-center">
                        <p className="text-5xl mb-3">❤️</p>
                        <h3 className="text-base font-black text-slate-800 mb-1">No saved templates</h3>
                        <p className="text-sm text-slate-400 mb-5">Tap ❤️ on any template to save it here.</p>
                        <a href="/templates" className="btn-green mx-auto w-auto px-8 text-center block">Browse Templates →</a>
                      </motion.div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {wishlist.map((t, idx) => (
                          <motion.div key={t.templateId}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }} whileHover={{ y: -4 }}
                            className="rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-md transition bg-white">
                            <div className="relative bg-slate-100 overflow-hidden" style={{ height: 110 }}>
                              {(t.previewImageUrl || t.thumbnailUrl) ? (
                                <img src={t.previewImageUrl || t.thumbnailUrl || ''} alt={t.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-3xl bg-green-50">🎉</div>
                              )}
                              <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-black ${
                                t.tierType === 'Pro' ? 'bg-purple-500 text-white' :
                                t.tierType === 'Premium' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                                {t.tierType === 'Free' ? 'Free' : `₹${t.price ?? ''}`}
                              </span>
                              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                onClick={e => toggleWishlist(t.templateId, e)}
                                className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-white/90 shadow hover:bg-red-50 transition">
                                ❤️
                              </motion.button>
                            </div>
                            <div className="p-3">
                              <h3 className="font-black text-slate-900 text-sm truncate">{t.name}</h3>
                              <p className="text-xs text-slate-400 mb-2">{t.categoryName}</p>
                              <button
                                onClick={() => handleUseTemplate(t, navigate, setPayTemplate)}
                                className="btn-green w-full text-xs py-1.5 text-center block">✨ Use Template</button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

      </main>
    </div>
  );
};

export default UserDashboard;
