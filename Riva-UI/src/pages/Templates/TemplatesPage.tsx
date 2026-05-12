import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getTemplates, type TemplateListItem, type TemplateTier } from '../../api/templates';
import { getCategories, type CategoryDto } from '../../api/categories';
import TemplatePreviewModal from '../../components/TemplatePreviewModal';
import TemplatePaymentModal from '../../components/TemplatePaymentModal';
import { handleUseTemplate } from '../../utils/templateAccess';
import { getStoredAuthToken } from '../../api/client';
import { getStoredRole, getStoredUsername } from '../../api/auth';
import { useWishlist } from '../../hooks/useWishlist';

const API_ORIGIN = (import.meta.env.VITE_API_BASE ?? 'http://localhost:5236/api').replace(/\/api$/, '');
const imgSrc = (u: string | null | undefined) => u ? (u.startsWith('/') ? `${API_ORIGIN}${u}` : u) : '';

const CAT_BG: Record<string, string> = {
  Birthday:        'linear-gradient(135deg,#ff6b9d,#ff8c42)',
  Wedding:         'linear-gradient(135deg,#c9a84c,#8b4513)',
  'House warming': 'linear-gradient(135deg,#ff8c00,#e65c00)',
  Anniversary:     'linear-gradient(135deg,#e91e8c,#9c27b0)',
  Engagement:      'linear-gradient(135deg,#e91e8c,#ff6090)',
  Corporate:       'linear-gradient(135deg,#455a64,#546e7a)',
};
const CAT_EMOJI: Record<string, string> = {
  Birthday:'🎂', Wedding:'💍', 'House warming':'🏡',
  Anniversary:'💐', Engagement:'💍', Corporate:'🏢',
};
const catBg    = (c: string) => CAT_BG[c]    ?? 'linear-gradient(135deg,#16a34a,#15803d)';
const catEmoji = (c: string) => CAT_EMOJI[c] ?? '🎉';

const TIER_FILTERS: { key: TemplateTier | 'all'; label: string; icon: string }[] = [
  { key: 'all',     label: 'All',     icon: '✨' },
  { key: 'Free',    label: 'Free',    icon: '🆓' },
  { key: 'Premium', label: 'Premium', icon: '💎' },
  { key: 'Pro',     label: 'Pro',     icon: '🚀' },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="rounded-2xl overflow-hidden animate-pulse"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
    <div style={{ height: 200, background: 'rgba(var(--color-primary-rgb),0.06)' }} />
    <div className="p-4 space-y-2">
      <div className="h-4 rounded-full w-3/4 bg-slate-200" />
      <div className="h-3 rounded-full w-1/2 bg-slate-100" />
      <div className="h-9 rounded-xl bg-slate-100 mt-3" />
    </div>
  </div>
);

// ── Navbar (mini, reused) ─────────────────────────────────────────────────────
const PageNav: React.FC = () => {
  const navigate   = useNavigate();
  const isLoggedIn = !!getStoredAuthToken();
  const role       = getStoredRole();
  const name       = getStoredUsername() ?? '';

  const navLinks = [
    { label: 'Home',      action: () => navigate('/') },
    { label: 'Templates', action: () => navigate('/templates') },
    { label: 'Features',  action: () => { navigate('/'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior:'smooth' }), 200); } },
    { label: 'Pricing',   action: () => { navigate('/'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior:'smooth' }), 200); } },
  ];

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{ background: 'rgba(255,255,255,0.92)', borderColor: 'var(--border-base)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <motion.button onClick={() => navigate('/')} whileHover={{ scale: 1.03 }}
          className="flex items-center gap-2.5 font-black text-lg cursor-pointer">
          <div className="logo-icon text-base">R</div>
          <span>Digital<span className="text-green">Invitation</span></span>
        </motion.button>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, action }) => (
            <button key={label} onClick={action}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition hover:text-green-700 cursor-pointer ${label === 'Templates' ? 'text-green-700 font-black bg-green-50' : 'text-slate-600'}`}>
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <motion.a href={role === 'Admin' ? '/admin' : '/dashboard'}
              whileHover={{ scale: 1.04 }}
              className="flex items-center gap-2 rounded-full border-2 border-green-300 bg-white px-3 py-1.5 text-sm font-black hover:bg-green-50 transition">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background: 'var(--color-gradient)' }}>
                {name.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="hidden sm:block max-w-[100px] truncate text-slate-700">{name}</span>
            </motion.a>
          ) : (
            <>
              <a href="/login" className="hidden md:block rounded-full px-4 py-2 text-sm font-black border border-slate-200 hover:border-green-400 transition text-slate-700">Login</a>
              <a href="/register" className="rounded-full px-4 py-2 text-sm font-black text-white transition"
                style={{ background: 'var(--color-gradient)' }}>Get Started</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// ── Template card ─────────────────────────────────────────────────────────────
const TemplateCard: React.FC<{
  t: TemplateListItem; idx: number;
  onPreview:   (t: TemplateListItem) => void;
  onUse:       (t: TemplateListItem) => void;
  wishlisted:  boolean;
  onWishlist:  (t: TemplateListItem, e: React.MouseEvent) => void;
}> = ({ t, idx, onPreview, onUse, wishlisted, onWishlist }) => {
  const bg     = imgSrc(t.thumbnailUrl || t.previewImageUrl);
  const isPaid = t.tierType !== 'Free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.05, duration: 0.4 }}
      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 280, damping: 18 } }}
      className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-400 cursor-pointer"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        {bg ? (
          <img src={bg} alt={t.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: catBg(t.categoryName ?? '') }}>
            <motion.span
              animate={{ y: [0,-8,0], scale: [1,1.1,1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
              {catEmoji(t.categoryName ?? '')}
            </motion.span>
            <span className="text-white/90 text-xs font-black px-3 text-center leading-tight">{t.name}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
            onClick={e => { e.stopPropagation(); onPreview(t); }}
            className="rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm font-black shadow-xl">
            ▶ Live Preview
          </motion.button>
        </div>

        {/* Tier */}
        <span className={`absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-black text-white shadow ${
          t.tierType === 'Pro' ? 'bg-purple-500' : t.tierType === 'Premium' ? 'bg-blue-500' : 'bg-green-500'}`}>
          {t.tierType === 'Free' ? '🆓 Free' : t.tierType === 'Pro' ? `🚀 ₹${t.price}` : `💎 ₹${t.price}`}
        </span>
        <span className="absolute top-3 right-3 z-10 rounded-full px-2 py-0.5 text-[10px] font-black text-white bg-black/40 backdrop-blur-sm">
          {t.categoryName}
        </span>

        {/* Wishlist heart */}
        <motion.button
          whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
          onClick={e => onWishlist(t, e)}
          className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-lg"
          style={{ background: wishlisted ? '#ef4444' : 'rgba(255,255,255,0.92)' }}>
          <motion.span key={wishlisted ? 'on' : 'off'}
            initial={{ scale: 0.5 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className="text-sm leading-none">
            {wishlisted ? '❤️' : '🤍'}
          </motion.span>
        </motion.button>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="font-black text-sm truncate mb-1" style={{ color: 'var(--text-heading)' }}>{t.name}</p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          {isPaid ? `₹${t.price} one-time · or subscribe` : 'Free forever'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(t)}
            className="flex-1 rounded-xl border py-2 text-xs font-black transition hover:border-green-400 hover:text-green-700"
            style={{ borderColor: 'var(--border-base)', color: 'var(--text-body)' }}>
            Preview →
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => onUse(t)}
            className="flex-1 rounded-xl py-2 text-xs font-black text-white transition"
            style={{ background: 'var(--color-gradient)' }}>
            {isPaid ? '🔒 Get Access' : '✨ Use Free'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [allTpls,     setAllTpls]     = useState<TemplateListItem[]>([]);
  const [categories,  setCategories]  = useState<CategoryDto[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [tierFilter,  setTierFilter]  = useState<TemplateTier | 'all'>('all');
  const [catFilter,   setCatFilter]   = useState<number | 'all'>('all');
  const [search,      setSearch]      = useState('');
  const [previewItem, setPreviewItem] = useState<TemplateListItem | null>(null);
  const [payTemplate, setPayTemplate] = useState<TemplateListItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, cats] = await Promise.all([
        getTemplates(
          catFilter === 'all' ? undefined : catFilter,
          undefined,
          tierFilter === 'all' ? undefined : tierFilter,
        ),
        getCategories(),
      ]);
      setAllTpls(tRes.templates);
      setCategories(cats);
    } catch { setAllTpls([]); }
    finally { setLoading(false); }
  }, [catFilter, tierFilter]);

  useEffect(() => { load(); }, [load]);

  const displayed = useMemo(() => {
    if (!search.trim()) return allTpls;
    const q = search.toLowerCase();
    return allTpls.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.categoryName?.toLowerCase().includes(q)
    );
  }, [allTpls, search]);

  const doUse = (t: TemplateListItem) => handleUseTemplate(t, navigate, setPayTemplate);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <PageNav />

      {/* Hero */}
      <div className="px-4 py-14 text-center" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-base)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="section-label mb-3 inline-block">All Templates</span>
          <h1 className="text-3xl font-black sm:text-4xl mb-3" style={{ color: 'var(--text-heading)' }}>
            Browse <span className="gradient-text">Invitation Templates</span>
          </h1>
          <p className="text-sm max-w-lg mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
            Click <strong>Preview</strong> to see the full animated mini-website.
            Free templates are instantly usable — Premium & Pro require a plan or one-time purchase.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search templates by name or category…"
              className="w-full rounded-2xl border-2 pl-10 pr-4 py-3 text-sm outline-none transition-all"
              style={{ borderColor: 'var(--border-base)', background: 'var(--bg-page)', color: 'var(--text-heading)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-base)'} />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="sticky top-[65px] z-30 px-4 py-3 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-base)' }}>
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-2">
          {/* Tier */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
            {TIER_FILTERS.map(f => (
              <button key={f.key} onClick={() => setTierFilter(f.key as TemplateTier | 'all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${tierFilter === f.key ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                style={tierFilter === f.key ? { background: 'var(--color-gradient)' } : {}}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* Category */}
          <select value={catFilter === 'all' ? '' : catFilter}
            onChange={e => setCatFilter(e.target.value ? Number(e.target.value) : 'all')}
            className="rounded-xl border px-3 py-2 text-xs font-bold outline-none"
            style={{ borderColor: 'var(--border-base)', background: 'var(--bg-card)', color: 'var(--text-body)' }}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>

          <span className="ml-auto text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${displayed.length} template${displayed.length !== 1 ? 's' : ''} found`}
          </span>
        </div>
      </div>

      {/* Grid */}
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
              </motion.div>
            ) : displayed.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-24">
                <p className="text-5xl mb-4">🎨</p>
                <p className="font-black text-lg mb-2" style={{ color: 'var(--text-heading)' }}>No templates found</p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Try a different filter or search term</p>
                <button onClick={() => { setTierFilter('all'); setCatFilter('all'); setSearch(''); }}
                  className="rounded-full px-6 py-2.5 text-sm font-black text-white"
                  style={{ background: 'var(--color-gradient)' }}>
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div key={`${tierFilter}-${catFilter}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {displayed.map((t, i) => (
                  <TemplateCard key={t.templateId} t={t} idx={i}
                    onPreview={setPreviewItem} onUse={doUse}
                    wishlisted={wishlistIds.has(t.templateId)}
                    onWishlist={(tpl, e) => toggleWishlist(tpl.templateId, e)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      {previewItem && (
        <TemplatePreviewModal
          templateId={previewItem.templateId}
          templateName={previewItem.name}
          categoryName={previewItem.categoryName}
          tierType={previewItem.tierType ?? 'Free'}
          price={previewItem.price}
          isFree={previewItem.tierType === 'Free' || !previewItem.isPaid}
          onClose={() => setPreviewItem(null)}
          onUseTemplate={() => doUse(previewItem)}
        />
      )}
      {payTemplate && (
        <TemplatePaymentModal
          template={payTemplate}
          onClose={() => setPayTemplate(null)}
          onSuccess={tid => { setPayTemplate(null); navigate(`/invitation/new/${tid}`); }}
        />
      )}

      {/* Footer */}
      <footer className="px-4 py-8 text-center border-t"
        style={{ borderColor: 'var(--border-base)', color: 'var(--text-muted)' }}>
        <p className="text-sm">© {new Date().getFullYear()} Riva Digital Invitation Platform ·
          <a href="/" className="ml-1 hover:text-green-600 transition">Back to Home →</a>
        </p>
      </footer>
    </div>
  );
};

export default TemplatesPage;
