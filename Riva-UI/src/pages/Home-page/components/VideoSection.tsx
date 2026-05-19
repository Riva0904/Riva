import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SCREENS = [
  { label: '🎂 Birthday', icon: '🎂', bg: 'linear-gradient(135deg,#ff6b9d,#ff8c42)', text: 'Confetti Birthday Blast', sub: 'Animated · Free',    date: new Date('2026-08-10T18:00:00') },
  { label: '💍 Wedding',  icon: '💍', bg: 'linear-gradient(135deg,#c9a84c,#8b4513)', text: 'Golden Shimmer Wedding', sub: 'Sparkles · Premium', date: new Date('2026-09-15T10:00:00') },
  { label: '🏡 Home',     icon: '🏡', bg: 'linear-gradient(135deg,#ff8c00,#e65c00)', text: 'Grand Housewarming',    sub: 'Countdown + Map · Pro', date: new Date('2026-07-20T11:00:00') },
];

const STATS = [
  { value: '100+',  label: 'Animated Templates', icon: '🎨' },
  { value: '3',     label: 'Tier Plans',          icon: '💎' },
  { value: '∞',     label: 'RSVP Tracking',       icon: '📊' },
  { value: '< 2s',  label: 'Load Time',           icon: '⚡' },
];

// ── Live countdown hook (frontend only, no API) ────────────────────────────────
function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      d: String(Math.floor(diff / 86400000)).padStart(2, '0'),
      h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
      m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
      s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);  // eslint-disable-line react-hooks/exhaustive-deps
  return time;
}

// ── Phone screen content ───────────────────────────────────────────────────────
const PhoneScreen: React.FC<{ screen: typeof SCREENS[0] }> = ({ screen }) => {
  const { d, h, m, s } = useCountdown(screen.date);
  return (
    <motion.div
      key={screen.text}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center text-center"
      style={{ height: 420, background: screen.bg, padding: '40px 20px 28px' }}>

      <motion.div
        animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl mb-3">
        {screen.icon}
      </motion.div>

      <h3 className="text-white font-black text-base leading-tight mb-1">{screen.text}</h3>
      <p className="text-white/70 text-[11px] font-semibold mb-5">{screen.sub}</p>

      {/* Live countdown */}
      <div className="flex gap-2 mb-5">
        {[{ v: d, l: 'Days' }, { v: h, l: 'Hrs' }, { v: m, l: 'Min' }, { v: s, l: 'Sec' }].map(({ v, l }) => (
          <div key={l} className="rounded-lg px-2 py-2 bg-black/25 text-center min-w-[38px]">
            <motion.div
              key={v}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0,  opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-white font-black text-base font-mono leading-none">
              {v}
            </motion.div>
            <div className="text-white/60 text-[8px] mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <div className="w-full bg-white/20 backdrop-blur rounded-xl px-3 py-2.5 text-white text-xs font-black">
        ✓ RSVP — Count me in!
      </div>
    </motion.div>
  );
};

// ── Main section ──────────────────────────────────────────────────────────────
const VideoSection: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 overflow-hidden"
      style={{ background: 'var(--bg-page)' }}>
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <span className="section-label">Live Demo</span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{ color: 'var(--text-heading)' }}>
            See it in <span className="gradient-text">action</span>
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
            Each template is a full animated mini-website — not just a static card.
          </p>
        </motion.div>

        {/*
         * Layout:
         *  Mobile  (flex-col): 1-Title+buttons  2-Phone  3-Stats+browse
         *  Desktop (2-col grid): Phone LEFT,  Title+buttons+stats RIGHT
         *
         * Achieved with: flex-col on mobile + lg:grid-cols-[1fr_1fr]
         * and CSS col-start / row-start on desktop.
         */}
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">

          {/* ① Title + desc + category buttons
              Mobile: order-1 (top)
              Desktop: right column, row 1   */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="order-1 lg:col-start-2 lg:row-start-1 space-y-4">

            <h3 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>
              Beautiful invitations in <span className="gradient-text">every category</span>
            </h3>
            <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              Tap a category to see the live animated mini-website — countdown timers, photo galleries, and RSVP buttons.
            </p>

            {/* Category switcher */}
            <div className="flex flex-wrap gap-3">
              {SCREENS.map((s, i) => (
                <motion.button key={i} whileTap={{ scale: 0.95 }}
                  onClick={() => setActive(i)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-black transition-all ${active === i ? 'text-white shadow-lg' : ''}`}
                  style={active === i
                    ? { background: s.bg, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }
                    : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-base)' }}>
                  {s.label}
                </motion.button>
              ))}
            </div>

            {/* Mobile-only hint */}
            <motion.p key={active}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold lg:hidden flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}>
              <span>👇</span> Preview updates below
            </motion.p>
          </motion.div>

          {/* ② Phone mockup
              Mobile: order-2 (middle — right below buttons)
              Desktop: left column, spans both rows   */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="order-2 lg:col-start-1 lg:row-start-1 lg:row-span-2 flex justify-center">

            <div className="relative" style={{ width: 240 }}>
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl"
                style={{ border: '8px solid #1c1c2e', boxShadow: '0 0 0 2px #333, 0 32px 64px rgba(0,0,0,0.45)' }}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 rounded-b-xl"
                  style={{ width: 80, height: 20, background: '#1c1c2e' }} />
                <AnimatePresence mode="wait">
                  <PhoneScreen key={active} screen={SCREENS[active]} />
                </AnimatePresence>
                {/* RSVP floating badge */}
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-8 right-0 translate-x-5 bg-white rounded-xl px-2.5 py-2 shadow-xl"
                  style={{ border: '2px solid #dcfce7' }}>
                  <p className="text-[10px] text-slate-400">RSVPs</p>
                  <p className="text-base font-black" style={{ color: 'var(--color-primary)' }}>127 ✓</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ③ Stats grid + browse button
              Mobile: order-3 (bottom — below phone)
              Desktop: right column, row 2   */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="order-3 lg:col-start-2 lg:row-start-2 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              {STATS.map(s => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl p-3 sm:p-4 flex items-center gap-3"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
                  <span className="text-xl sm:text-2xl">{s.icon}</span>
                  <div>
                    <p className="font-black text-lg sm:text-xl" style={{ color: 'var(--color-primary)' }}>{s.value}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button onClick={() => navigate('/templates')}
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-black text-white"
              style={{ background: 'var(--color-gradient)', boxShadow: '0 8px 24px rgba(var(--color-primary-rgb),0.35)' }}>
              🎨 Browse All Templates
            </motion.button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default VideoSection;
