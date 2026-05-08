import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTemplates, type TemplateListItem } from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';
import { getStoredAuthToken } from '../../../api/client';

const WISHLIST_KEY = 'riva_wishlist';

export interface WishlistItem {
  templateId: number;
  name: string;
  categoryName?: string;
  previewImageUrl?: string;
  thumbnailUrl?: string;
  isPaid: boolean;
  price?: number;
}

const getWishlist = (): WishlistItem[] => {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); }
  catch { return []; }
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
  const [filter,      setFilter]      = useState<'all' | 'free' | 'paid'>('all');
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [preview,     setPreview]     = useState<TemplateListItem | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(
    () => new Set(getWishlist().map(w => w.templateId))
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTemplates(activeCat, filter === 'all' ? undefined : filter === 'paid'),
      getCategories(),
    ]).then(([tRes, cats]) => {
      setTemplates(tRes.templates);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [activeCat, filter]);

  const displayed = useMemo(() =>
    search.trim()
      ? templates.filter(t =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.categoryName?.toLowerCase().includes(search.toLowerCase()))
      : templates,
    [templates, search]);

  const hasFullAccess = subscriptionPlan === 'Premium' || subscriptionPlan === 'Business';

  const handleUseTemplate = (t: TemplateListItem) => {
    if (!getStoredAuthToken()) { navigate('/login'); return; }
    if (t.isPaid && !hasFullAccess) {
      // Gate: redirect to payment for this template
      navigate(`/payment?templateId=${t.templateId}&amount=${Math.round((t.price ?? 0) * 83)}&name=${encodeURIComponent(t.name)}`);
      return;
    }
    navigate(`/invitation/new/${t.templateId}`);
  };

  const toggleWishlist = (t: TemplateListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getWishlist();
    let next: WishlistItem[];
    if (wishlistIds.has(t.templateId)) {
      next = current.filter(w => w.templateId !== t.templateId);
    } else {
      next = [...current, {
        templateId: t.templateId,
        name: t.name,
        categoryName: t.categoryName,
        previewImageUrl: t.previewImageUrl,
        thumbnailUrl: t.thumbnailUrl,
        isPaid: t.isPaid,
        price: t.price,
      }];
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    setWishlistIds(new Set(next.map(w => w.templateId)));
  };

  return (
    <div>
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
            style={!activeCat ? { background: 'linear-gradient(135deg,#16a34a,#059669)' } : {}}>
            All
          </button>
          {categories.map(c => (
            <button key={c.categoryId} onClick={() => setActiveCat(c.categoryId)}
              className={`rounded-full px-4 py-1.5 text-sm font-black transition ${activeCat === c.categoryId
                ? 'text-white shadow-sm' : 'border-2 border-slate-200 text-slate-600 hover:border-green-300'}`}
              style={activeCat === c.categoryId ? { background: 'linear-gradient(135deg,#16a34a,#059669)' } : {}}>
              {emojiFor(c.name)} {c.name}
            </button>
          ))}
          <div className="ml-auto tab-switcher" style={{ marginBottom: 0, width: 'auto', padding: '2px' }}>
            {(['all', 'free', 'paid'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`tab-btn capitalize text-xs px-3 ${filter === f ? 'active' : ''}`}>
                {f}
              </button>
            ))}
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
                  <div className="flex items-center justify-center h-full text-5xl"
                    style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                    {emojiFor(t.categoryName)}
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(22,163,74,0.6), transparent)' }} />
                <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-black z-10 ${
                  t.isPaid ? 'bg-amber-400 text-amber-900' : 'bg-green-500 text-white'}`}>
                  {t.isPaid ? `$${t.price}` : 'Free'}
                </span>
                {/* Wishlist heart */}
                <motion.button
                  whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={e => toggleWishlist(t, e)}
                  className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow text-base transition hover:bg-white">
                  {wishlistIds.has(t.templateId) ? '❤️' : '🤍'}
                </motion.button>
              </div>

              <div className="p-4">
                <h3 className="font-black text-slate-800 group-hover:text-green-700 transition truncate">{t.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">{t.categoryName}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setPreview(t)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-2 text-xs font-black text-slate-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition">
                  Preview →
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPreview(null)}>

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', bounce: 0.35 }}
              className="card-green w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>

              <div className="accent-bar" />
              <div className="relative bg-light-green" style={{ height: 180 }}>
                {preview.previewImageUrl || preview.thumbnailUrl ? (
                  <img src={preview.previewImageUrl || preview.thumbnailUrl || ''}
                    alt={preview.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-7xl"
                    style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                    {emojiFor(preview.categoryName)}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900">{preview.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{preview.categoryName}</p>
                {preview.description && (
                  <p className="text-sm text-slate-600 mt-2 leading-5">{preview.description}</p>
                )}
                <div className="my-4 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-sm font-black ${
                    preview.isPaid ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {preview.isPaid ? `$${preview.price}` : '🆓 Free'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Added {new Date(preview.createdDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleUseTemplate(preview)}
                    className="btn-green flex-1 py-3">
                    {preview.isPaid ? '🔒 Buy & Use' : '✨ Use Template'}
                  </motion.button>
                  <button onClick={() => setPreview(null)} className="btn-green-outline flex-none px-4">✕</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserTemplateGallery;
