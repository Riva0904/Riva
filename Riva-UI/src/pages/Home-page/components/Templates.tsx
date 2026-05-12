import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getTemplates, type TemplateListItem } from '../../../api/templates';
import TemplatePreviewModal from '../../../components/TemplatePreviewModal';
import TemplatePaymentModal from '../../../components/TemplatePaymentModal';
import { handleUseTemplate } from '../../../utils/templateAccess';
import { useWishlist } from '../../../hooks/useWishlist';

const API_ORIGIN = (import.meta.env.VITE_API_BASE ?? 'http://localhost:5236/api').replace(/\/api$/, '');
const imgSrc = (u: string | null | undefined) => u ? (u.startsWith('/') ? `${API_ORIGIN}${u}` : u) : '';

const CAT_BG: Record<string, string> = {
  Birthday:        'linear-gradient(135deg,#ff6b9d,#ff8c42)',
  Wedding:         'linear-gradient(135deg,#c9a84c,#8b4513)',
  'House warming': 'linear-gradient(135deg,#ff8c00,#e65c00)',
};
const CAT_EMOJI: Record<string, string> = { Birthday:'🎂', Wedding:'💍', 'House warming':'🏡' };
const catBg    = (c: string) => CAT_BG[c]    ?? 'linear-gradient(135deg,#16a34a,#15803d)';
const catEmoji = (c: string) => CAT_EMOJI[c] ?? '🎉';

const PER_PAGE   = 4;
const ROTATE_MS  = 6000;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Single card ───────────────────────────────────────────────────────────────
const TemplateCard: React.FC<{
  t: TemplateListItem; idx: number;
  onPreview: (t: TemplateListItem) => void;
  wishlisted: boolean;
  onWishlist: (t: TemplateListItem, e: React.MouseEvent) => void;
}> = ({ t, idx, onPreview, wishlisted, onWishlist }) => {
  const bg     = imgSrc(t.thumbnailUrl || t.previewImageUrl);
  const isPaid = t.tierType !== 'Free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1, duration: 0.45 }}
      whileHover={{ y: -10, transition: { type: 'spring', stiffness: 300, damping: 18 } }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-shadow duration-500"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ paddingTop: '75%' }}>
        {bg ? (
          <motion.img src={bg} alt={t.name} loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: catBg(t.categoryName ?? '') }}>
            <motion.span animate={{ y: [0,-8,0] }} transition={{ duration: 2.5, repeat: Infinity }}
              className="text-5xl" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
              {catEmoji(t.categoryName ?? '')}
            </motion.span>
            <span className="text-white/90 text-xs font-black px-3 text-center">{t.name}</span>
          </div>
        )}

        {/* Hover overlay */}
        <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onPreview(t)}
            className="flex items-center gap-2 rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm font-black shadow-lg">
            ▶ Live Preview
          </motion.button>
        </motion.div>

        {/* Tier badge */}
        <span className={`absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-black text-white shadow-lg ${
          t.tierType === 'Pro' ? 'bg-purple-500' : t.tierType === 'Premium' ? 'bg-blue-500' : 'bg-green-500'}`}>
          {t.tierType === 'Free' ? '🆓 Free' : t.tierType === 'Pro' ? `🚀 ₹${t.price}` : `💎 ₹${t.price}`}
        </span>

        {/* Category badge */}
        <span className="absolute top-3 right-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-black text-white bg-black/40 backdrop-blur-sm">
          {t.categoryName}
        </span>

        {/* Wishlist heart */}
        <motion.button
          whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
          onClick={e => onWishlist(t, e)}
          className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition"
          style={{ background: wishlisted ? '#ef4444' : 'rgba(255,255,255,0.9)' }}>
          <motion.span
            key={wishlisted ? 'on' : 'off'}
            initial={{ scale: 0.6 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className="text-sm leading-none">
            {wishlisted ? '❤️' : '🤍'}
          </motion.span>
        </motion.button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t"
        style={{ borderColor: 'var(--border-base)' }}>
        <div className="min-w-0 mr-3">
          <p className="font-black text-sm truncate" style={{ color: 'var(--text-heading)' }}>{t.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {isPaid ? `₹${t.price} one-time · or subscribe` : 'Free forever'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          onClick={() => onPreview(t)}
          className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-black text-white transition"
          style={{ background: 'var(--color-gradient)' }}>
          Preview →
        </motion.button>
      </div>
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [allTemplates, setAllTemplates] = useState<TemplateListItem[]>([]);
  const [page,         setPage]         = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [paused,       setPaused]       = useState(false);
  const [previewItem,  setPreviewItem]  = useState<TemplateListItem | null>(null);
  const [payTemplate,  setPayTemplate]  = useState<TemplateListItem | null>(null);
  const progressRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    getTemplates()
      .then(({ templates: list }) => setAllTemplates(shuffle(list)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pageCount  = Math.max(1, Math.ceil(allTemplates.length / PER_PAGE));
  const displayed  = allTemplates.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  // Auto-rotate with progress bar
  useEffect(() => {
    if (paused || pageCount <= 1) { setProgress(0); return; }
    setProgress(0);
    const start = performance.now();
    const raf = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min((elapsed / ROTATE_MS) * 100, 100);
      setProgress(pct);
      if (pct < 100) { progressRef.current = requestAnimationFrame(raf); }
    };
    progressRef.current = requestAnimationFrame(raf);
    const timer = setTimeout(() => setPage(p => (p + 1) % pageCount), ROTATE_MS);
    return () => { clearTimeout(timer); cancelAnimationFrame(progressRef.current); };
  }, [page, paused, pageCount]);

  const doUse = (t: TemplateListItem) => handleUseTemplate(t, navigate, setPayTemplate);

  return (
    <>
      {/* Live Preview Modal */}
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

      {/* Payment Modal */}
      {payTemplate && (
        <TemplatePaymentModal
          template={payTemplate}
          onClose={() => setPayTemplate(null)}
          onSuccess={tid => { setPayTemplate(null); navigate(`/invitation/new/${tid}`); }}
        />
      )}

      <section id="templates" className="px-4 py-20 sm:px-6 lg:px-8"
        style={{ background: 'var(--bg-page)' }}>
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-10">
            <span className="section-label">Live Templates</span>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl"
              style={{ color: 'var(--text-heading)' }}>
              Designed for <span className="gradient-text">celebration moments</span>
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
              Real templates from our gallery — click <strong>Preview</strong> to see the full animated mini-website before using.
            </p>
          </motion.div>

          {/* Grid — rotating 4 */}
          <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
                    <div className="bg-slate-200 dark:bg-slate-700" style={{ height: 180 }} />
                    <div className="p-4 space-y-2">
                      <div className="h-4 rounded-full w-3/4 bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 rounded-full w-1/2 bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={page}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {displayed.map((t, i) => (
                    <TemplateCard key={t.templateId} t={t} idx={i} onPreview={setPreviewItem}
                      wishlisted={wishlistIds.has(t.templateId)}
                      onWishlist={(tpl, e) => toggleWishlist(tpl.templateId, e)} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Progress bar + dots */}
            {!loading && pageCount > 1 && (
              <div className="mt-8 flex flex-col items-center gap-3">
                {/* Progress bar */}
                <div className="w-48 h-1 rounded-full overflow-hidden"
                  style={{ background: 'var(--border-base)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ width: `${paused ? progress : progress}%`, background: 'var(--color-gradient)' }}
                    transition={{ ease: 'linear' }} />
                </div>
                {/* Dot indicators */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button key={i}
                      onClick={() => { setPage(i); setProgress(0); }}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width:  i === page ? 24 : 8,
                        height: 8,
                        background: i === page ? 'var(--color-primary)' : 'var(--border-base)',
                      }} />
                  ))}
                  <span className="ml-2 text-xs" style={{ color: 'var(--text-subtle)' }}>
                    {paused ? '⏸' : '▶'} {page + 1}/{pageCount}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* CTA row */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/templates')}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-black text-white"
              style={{ background: 'var(--color-gradient)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}>
              🎨 Browse All Templates →
            </motion.button>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              15+ templates · Free, Premium & Pro
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Templates;
