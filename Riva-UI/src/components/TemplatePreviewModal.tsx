import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTemplateById, type TemplateDetail } from '../api/templates';
import { getStoredAuthToken } from '../api/client';

// ── Sample placeholder data ───────────────────────────────────────────────────
const SAMPLE: Record<string, string> = {
  title:          "Arjun & Priya's Wedding",
  subtitle:       'Together with their families',
  name:           'Arjun & Priya',
  brideName:      'Priya Sharma', groomName: 'Arjun Patel',
  hostName:       'The Sharma & Patel Families',
  date:           'December 25, 2026',
  time:           '7:00 PM onwards',
  venue:          'Grand Ballroom, The Taj Hotel',
  address:        '123 Marine Drive, Mumbai',
  city:           'Mumbai',
  message:        'We joyfully invite you to celebrate our special day.',
  welcomeMessage: 'Welcome! We are so glad you could join us.',
  quote:          '"Two hearts, one beautiful love story."',
  eventName:      "Arjun & Priya's Wedding Celebration",
  phone:          '+91 98765 43210',
  rsvpDate:       'December 15, 2026',
  guestName:      'Valued Guest',
  age:            '25', birthdayPerson: 'Sarah', partyTheme: 'Neon Glow Night',
  host:           'The Johnson Family', occasion: 'Special Celebration',
  year:           '2026', color: '#16a34a',
  mapLocation:    'https://maps.google.com',
};

function buildDoc(t: TemplateDetail): string {
  const html = t.templateHtml.replace(/\{\{(\w+)\}\}/g, (_, k) => SAMPLE[k] ?? `[${k}]`);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{width:100%;overflow-x:hidden}
${t.templateCss ?? ''}</style></head><body>${html}
${t.templateJs ? `<script>${t.templateJs}<\/script>` : ''}</body></html>`;
}

const CAT_EMOJI: Record<string, string> = {
  Birthday:'🎂', Wedding:'💍', Anniversary:'💐', Engagement:'💍',
  'House warming':'🏡', Baptism:'✝️', 'First Holy Communion':'✝️',
  'Save The Date':'📅', 'Baby Shower':'🍼', Corporate:'🏢',
};
const catEmoji = (name = '') =>
  CAT_EMOJI[name] ?? (name.includes('Birth') ? '🎂' : name.includes('Wed') ? '💍' : '🎉');

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  templateId:   number;
  templateName: string;
  categoryName?: string;
  tierType:     string;
  price:        number | null;
  isFree:       boolean;
  onClose:      () => void;
  onUseTemplate: () => void;   // caller provides full access logic
}

const TemplatePreviewModal: React.FC<Props> = ({
  templateId, templateName, categoryName, tierType, price,
  isFree, onClose, onUseTemplate,
}) => {
  const [detail,  setDetail]  = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [srcDoc,  setSrcDoc]  = useState('');
  const [device,  setDevice]  = useState<'mobile' | 'desktop'>('mobile');
  const isLoggedIn = !!getStoredAuthToken();

  useEffect(() => {
    setLoading(true); setDetail(null); setSrcDoc('');
    getTemplateById(templateId)
      .then(t => { setDetail(t); setSrcDoc(buildDoc(t)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [templateId]);

  const tierColor = { Pro:'bg-purple-500', Premium:'bg-blue-500', Free:'bg-green-500' }[tierType] ?? 'bg-slate-400';
  const tierIcon  = { Pro:'🚀', Premium:'💎', Free:'🆓' }[tierType] ?? '🎨';
  const priceTxt  = tierType === 'Free' ? '🆓 Free to use — start instantly' :
    `${tierIcon} ${tierType} · ₹${price} one-time  or  subscribe from ₹${tierType === 'Pro' ? '1,499' : '799'}/month`;

  const ctaLabel = !isLoggedIn
    ? '🔒 Login to Use'
    : isFree
    ? '✨ Use Template Free'
    : `${tierIcon} Get Access — ₹${price}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(16px)' }}
        onClick={onClose}
      >
        {/* ── Top bar ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/10"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 min-w-0">
            <span className={`rounded-full px-3 py-1 text-xs font-black text-white flex-shrink-0 ${tierColor}`}>
              {tierIcon} {tierType}{!isFree && price ? ` · ₹${price}` : ''}
            </span>
            <div className="min-w-0">
              <p className="text-white font-black text-sm truncate">{templateName}</p>
              <p className="text-white/40 text-xs">{categoryName} · Live Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-1 gap-1">
              {(['mobile','desktop'] as const).map(d => (
                <button key={d} onClick={() => setDevice(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition ${device === d ? 'bg-white text-slate-900' : 'text-white/50 hover:text-white'}`}>
                  {d === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
                </button>
              ))}
            </div>
            <button onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition font-black text-sm">
              ✕
            </button>
          </div>
        </div>

        {/* ── Preview ── */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4"
          onClick={e => e.stopPropagation()}>
          {loading ? (
            <div className="text-center text-white/60 space-y-4">
              <motion.p animate={{ scale: [1,1.15,1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl">{catEmoji(categoryName)}</motion.p>
              <p className="font-semibold text-sm">Loading live preview…</p>
              <div className="flex justify-center gap-1">
                {[0,1,2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-white/40" />
                ))}
              </div>
            </div>
          ) : !detail ? (
            <div className="text-center text-white/60">
              <p className="text-5xl mb-3">{catEmoji(categoryName)}</p>
              <p className="font-semibold">Preview not available</p>
            </div>
          ) : (
            <motion.div key={device}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              style={device === 'mobile'
                ? { width: 380, maxHeight: '78vh' }
                : { width: '88vw', maxWidth: 1100, height: '74vh' }}>

              {device === 'mobile' ? (
                <div style={{
                  width: 380, borderRadius: 48,
                  border: '12px solid #1a1a2e',
                  boxShadow: '0 0 0 2px #333, 0 0 0 6px #1a1a2e, 0 50px 100px rgba(0,0,0,0.9)',
                  overflow: 'hidden', background: '#000',
                }}>
                  <div className="flex justify-center items-center"
                    style={{ height: 26, background: '#1a1a2e' }}>
                    <div className="rounded-full bg-black/60" style={{ width: 90, height: 14 }} />
                  </div>
                  <iframe srcDoc={srcDoc} sandbox="allow-scripts allow-same-origin"
                    style={{ width: '100%', height: '70vh', border: 'none', display: 'block' }}
                    title="Template Preview" />
                </div>
              ) : (
                <div className="w-full h-full rounded-2xl overflow-hidden"
                  style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 40px 80px rgba(0,0,0,0.7)' }}>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border-b border-white/10">
                    {['#ff5f57','#ffbd2e','#28c840'].map((c,i) => (
                      <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                    ))}
                    <div className="flex-1 bg-white/10 rounded-md px-3 py-1 text-xs text-white/40 font-mono ml-2">
                      riva.app/invite/preview
                    </div>
                  </div>
                  <iframe srcDoc={srcDoc} sandbox="allow-scripts allow-same-origin"
                    style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none', display: 'block' }}
                    title="Template Preview" />
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ── Bottom action bar ── */}
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', bounce: 0.3 }}
          className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-t border-white/10"
          style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)' }}
          onClick={e => e.stopPropagation()}>

          <div className="min-w-0">
            <p className="text-white font-black truncate">{templateName}</p>
            <p className="text-white/40 text-xs mt-0.5">{priceTxt}</p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button onClick={onClose}
              className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-black text-white/60 hover:bg-white/10 transition">
              Close
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              onClick={() => { onClose(); onUseTemplate(); }}
              className="rounded-xl px-6 py-2.5 text-sm font-black text-white transition"
              style={{ background: 'var(--color-gradient, linear-gradient(135deg,#16a34a,#15803d))', boxShadow: '0 4px 16px rgba(22,163,74,0.4)' }}>
              {ctaLabel}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TemplatePreviewModal;
