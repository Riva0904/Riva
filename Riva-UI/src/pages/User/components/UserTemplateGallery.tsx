import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTemplates, type TemplateListItem } from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';
import { getStoredAuthToken } from '../../../api/client';
import TemplatePaymentModal from '../../../components/TemplatePaymentModal';
import TemplatePreviewModal from '../../../components/TemplatePreviewModal';
import { handleUseTemplate } from '../../../utils/templateAccess';
import { useWishlist } from '../../../hooks/useWishlist';

// ── Animated card background (shown when no thumbnail uploaded) ───────────────
const TIER_BG: Record<string, string> = {
  Free:    'linear-gradient(135deg,#e8f5e9 0%,#f0fdf4 50%,#dcfce7 100%)',
  Premium: 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#1d4ed8 100%)',
  Pro:     'linear-gradient(135deg,#2d1b69 0%,#7c3aed 50%,#4c1d95 100%)',
};
const CAT_PALETTE: Record<string, string[]> = {
  Birthday:            ['#ff6b9d','#ff8c42','#ffd93d','#ff6b9d'],
  Wedding:             ['#d4af37','#f0d080','#c9a84c','#d4af37'],
  'House warming':     ['#ff8c00','#ff4500','#ffd700','#ff8c00'],
  Anniversary:         ['#e91e8c','#9c27b0','#e91e8c','#ff4081'],
  Engagement:          ['#e91e8c','#ff6090','#d81b60','#e91e8c'],
  'Save The Date':     ['#00bcd4','#0097a7','#26c6da','#00bcd4'],
  'Baby Shower':       ['#f48fb1','#f06292','#ec407a','#f48fb1'],
  Baptism:             ['#80deea','#00acc1','#4dd0e1','#80deea'],
  Corporate:           ['#455a64','#546e7a','#78909c','#455a64'],
  Graduation:          ['#1565c0','#0d47a1','#42a5f5','#1565c0'],
};
const getCatColors = (cat: string) => CAT_PALETTE[cat] ?? ['#16a34a','#15803d','#22c55e','#16a34a'];

const AnimatedCardBg: React.FC<{ tier: string; category: string; name: string }> = ({ tier, category, name }) => {
  const colors = getCatColors(category);
  const isPremium = tier === 'Premium';
  const isPro     = tier === 'Pro';
  const emoji     = emojiFor(category);

  return (
    <div className="absolute inset-0 overflow-hidden flex flex-col items-center justify-center"
      style={{ background: isPro || isPremium ? TIER_BG[tier] : `linear-gradient(135deg,${colors[0]}22,${colors[1]}33,${colors[2]}22)` }}>

      {/* Animated blobs */}
      {(isPremium || isPro) && (
        <>
          <div className="absolute rounded-full opacity-20 animate-pulse"
            style={{ width:120,height:120,background:colors[0],top:-20,right:-20,animationDuration:'2s' }} />
          <div className="absolute rounded-full opacity-15"
            style={{ width:80,height:80,background:colors[1],bottom:-10,left:-10,
              animation:'pulse 3s ease-in-out infinite' }} />
        </>
      )}

      {/* Floating emoji */}
      <div className="text-5xl mb-2 select-none"
        style={{ animation:'float-card 2.5s ease-in-out infinite', filter: isPro ? 'drop-shadow(0 0 12px rgba(167,139,250,0.8))' : isPremium ? 'drop-shadow(0 0 8px rgba(96,165,250,0.7))' : 'none' }}>
        {emoji}
      </div>

      {/* Template name */}
      <div className="px-3 text-center">
        <p className={`text-xs font-black leading-tight line-clamp-2 ${isPro || isPremium ? 'text-white/90' : 'text-slate-700'}`}
          style={{ textShadow: (isPro || isPremium) ? '0 1px 4px rgba(0,0,0,0.4)' : 'none' }}>
          {name}
        </p>
      </div>

      {/* Tier glow ring */}
      {isPro && (
        <div className="absolute inset-0 rounded-2xl"
          style={{ boxShadow:'inset 0 0 30px rgba(167,139,250,0.15)' }} />
      )}

      {/* Shimmer overlay for premium/pro */}
      {(isPremium || isPro) && (
        <div className="absolute inset-0 opacity-10"
          style={{ background:'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)',
            backgroundSize:'200% 100%', animation:'shimmer-card 3s ease-in-out infinite' }} />
      )}

      <style>{`
        @keyframes float-card { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.05)} }
        @keyframes shimmer-card { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
};


const CATEGORY_EMOJI: Record<string, string> = {
  Birthday: '🎂', Marriage: '💍', Wedding: '💍', 'First Holy Communion': '✝️',
  Anniversary: '💐', Engagement: '💍', Party: '🎉', Baby: '🍼', Event: '📅',
  Corporate: '🏢', Graduation: '🎓', Festival: '🎆',
};
const emojiFor = (name = '') =>
  CATEGORY_EMOJI[name] ?? (name.includes('Birth') ? '🎂' : name.includes('Wed') ? '💍' : '🎉');

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl overflow-hidden border-2 border-green-50 bg-white">
    <div className="bg-green-100" style={{ height: 160 }} />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-slate-200 rounded-full w-3/4" />
      <div className="h-3 bg-slate-100 rounded-full w-1/2" />
      <div className="h-8 bg-slate-100 rounded-xl mt-3" />
    </div>
  </div>
);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface Props { subscriptionPlan?: string; }

const UserTemplateGallery: React.FC<Props> = ({ subscriptionPlan = 'Starter' }) => {
  const navigate = useNavigate();
  const [templates,   setTemplates]   = useState<TemplateListItem[]>([]);
  const [categories,  setCategories]  = useState<CategoryDto[]>([]);
  const [activeCat,   setActiveCat]   = useState<number | undefined>();
  const [filter,      setFilter]      = useState<'all' | 'free' | 'premium' | 'pro'>('all');
  const [sort,        setSort]        = useState<'newest' | 'free-first' | 'paid-first'>('newest');
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [preview,     setPreview]     = useState<TemplateListItem | null>(null);
  const [payTemplate, setPayTemplate] = useState<TemplateListItem | null>(null);
  const { wishlistIds, toggleWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTemplates(
        activeCat,
        undefined,
        filter === 'all' ? undefined : filter === 'free' ? 'Free' : filter === 'premium' ? 'Premium' : 'Pro',
      ),
      getCategories(),
    ]).then(([tRes, cats]) => {
      setTemplates(tRes.templates);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [activeCat, filter]);

  const displayed = useMemo(() => {
    let list = search.trim()
      ? templates.filter(t =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.categoryName?.toLowerCase().includes(search.toLowerCase()))
      : [...templates];

    if (sort === 'newest')     list.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    if (sort === 'free-first') list.sort((a, b) => Number(a.isPaid) - Number(b.isPaid));
    if (sort === 'paid-first') list.sort((a, b) => Number(b.isPaid) - Number(a.isPaid));
    return list;
  }, [templates, search, sort]);

  const doUse = (t: TemplateListItem) => handleUseTemplate(t, navigate, setPayTemplate);


  return (
    <div>
      {/* Live HTML preview modal */}
      {preview && (
        <TemplatePreviewModal
          templateId={preview.templateId}
          templateName={preview.name}
          categoryName={preview.categoryName ?? ''}
          tierType={preview.tierType ?? 'Free'}
          price={preview.price}
          isFree={preview.tierType === 'Free' || !preview.isPaid}
          onClose={() => setPreview(null)}
          onUseTemplate={() => doUse(preview)}
        />
      )}

      {/* Payment modal */}
      {payTemplate && (
        <TemplatePaymentModal
          template={payTemplate}
          onClose={() => setPayTemplate(null)}
          onSuccess={tid => { setPayTemplate(null); navigate(`/invitation/new/${tid}`); }}
        />
      )}
      {/* Search + filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full rounded-2xl border-2 border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCat(undefined)}
            className={`rounded-full px-4 py-1.5 text-sm font-black transition ${!activeCat
              ? 'text-white shadow-sm' : 'border-2 border-slate-200 text-slate-600 hover:border-green-300'}`}
            style={!activeCat ? { background: 'var(--color-gradient)' } : {}}>
            All
          </button>
          {categories.map(c => (
            <button key={c.categoryId} onClick={() => setActiveCat(c.categoryId)}
              className={`rounded-full px-4 py-1.5 text-sm font-black transition ${activeCat === c.categoryId
                ? 'text-white shadow-sm' : 'border-2 border-slate-200 text-slate-600 hover:border-green-300'}`}
              style={activeCat === c.categoryId ? { background: 'var(--color-gradient)' } : {}}>
              {emojiFor(c.name)} {c.name}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
              {([
                { key: 'all'     as const, label: 'All',      icon: '' },
                { key: 'free'    as const, label: 'Free',     icon: '🆓' },
                { key: 'premium' as const, label: 'Premium',  icon: '💎' },
                { key: 'pro'     as const, label: 'Pro',      icon: '🚀' },
              ]).map(f => (
                <button key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                    filter === f.key
                      ? f.key === 'pro'     ? 'bg-purple-500 text-white shadow-sm'
                      : f.key === 'premium' ? 'bg-blue-500 text-white shadow-sm'
                      : f.key === 'free'    ? 'bg-green-500 text-white shadow-sm'
                      :                       'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 outline-none focus:border-green-400 transition cursor-pointer">
              <option value="newest">Newest</option>
              <option value="free-first">Free First</option>
              <option value="paid-first">Paid First</option>
            </select>
          </div>
        </div>
      </div>

      {!loading && (
        <p className="mb-4 text-sm text-slate-400 font-semibold">
          {displayed.length} template{displayed.length !== 1 ? 's' : ''} found
          {search && <span> for "<strong className="text-slate-600">{search}</strong>"</span>}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl border-2 border-dashed border-green-100 py-16 text-center bg-green-50">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-black text-slate-700">No templates found</p>
          <p className="text-sm text-slate-400 mt-1">Try a different search or category</p>
        </motion.div>
      ) : (
        <motion.div
          key={`${activeCat}-${filter}-${search}`}
          variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {displayed.map(t => (
            <motion.div key={t.templateId} variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group card-green rounded-2xl overflow-hidden cursor-pointer">

              <div className="relative bg-light-green overflow-hidden" style={{ height: 160 }}>
                {t.previewImageUrl || t.thumbnailUrl ? (
                  <img src={t.previewImageUrl || t.thumbnailUrl || ''}
                    alt={t.name} loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition duration-700" />
                ) : (
                  <AnimatedCardBg tier={t.tierType ?? 'Free'} category={t.categoryName ?? ''} name={t.name} />
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(22,163,74,0.6), transparent)' }} />
                <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-black z-10 flex items-center gap-1 ${
                  t.tierType === 'Pro'     ? 'bg-purple-500 text-white' :
                  t.tierType === 'Premium' ? 'bg-blue-500 text-white'  :
                                             'bg-green-500 text-white'}`}>
                  {t.tierType === 'Pro'
                    ? <>🚀 Pro · ₹{t.price}</>
                    : t.tierType === 'Premium'
                    ? <>💎 Premium · ₹{t.price}</>
                    : <>🆓 Free</>}
                </span>
                {/* Wishlist heart */}
                <motion.button
                  whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
                  onClick={e => toggleWishlist(t.templateId, e)}
                  className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-lg"
                  style={{ background: wishlistIds.has(t.templateId) ? '#ef4444' : 'rgba(255,255,255,0.92)' }}>
                  <motion.span key={wishlistIds.has(t.templateId) ? 'on' : 'off'}
                    initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    className="text-sm leading-none">
                    {wishlistIds.has(t.templateId) ? '❤️' : '🤍'}
                  </motion.span>
                </motion.button>
              </div>

              <div className="p-4">
                <h3 className="font-black text-slate-800 group-hover:text-green-700 transition truncate">{t.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">{t.categoryName}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setPreview(t)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-2 text-xs font-black text-slate-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition flex items-center justify-center gap-1.5">
                  <>▶ Live Preview</>

                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

    </div>
  );
};

export default UserTemplateGallery;
