import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SCREENS = [
  { label: '🎂 Birthday', icon: '🎂', bg: 'linear-gradient(135deg,#ff6b9d,#ff8c42)', text: 'Confetti Birthday Blast', sub: 'Animated · Free' },
  { label: '💍 Wedding',  icon: '💍', bg: 'linear-gradient(135deg,#c9a84c,#8b4513)',  text: 'Golden Shimmer Wedding', sub: 'Sparkles · Premium' },
  { label: '🏡 Home',     icon: '🏡', bg: 'linear-gradient(135deg,#ff8c00,#e65c00)',  text: 'Grand Housewarming',    sub: 'Countdown + Map · Pro' },
];

const STATS = [
  { value: '15+', label: 'Animated Templates', icon: '🎨' },
  { value: '3', label: 'Tier Plans', icon: '💎' },
  { value: '∞', label: 'RSVP Tracking', icon: '📊' },
  { value: '< 2s', label: 'Load Time', icon: '⚡' },
];

const VideoSection: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 overflow-hidden"
      style={{ background: 'var(--bg-page)' }}>
      <div className="mx-auto max-w-7xl">

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

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Phone mockup */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="flex justify-center">
            <div className="relative" style={{ width: 280 }}>
              {/* Phone frame */}
              <div className="relative rounded-[44px] overflow-hidden shadow-2xl"
                style={{ border: '10px solid #1c1c2e', boxShadow: '0 0 0 2px #333, 0 40px 80px rgba(0,0,0,0.5)' }}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 rounded-b-2xl"
                  style={{ width: 100, height: 24, background: '#1c1c2e' }} />

                {/* Screen */}
                <AnimatePresence mode="wait">
                  <motion.div key={active}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center text-center"
                    style={{ height: 500, background: SCREENS[active].bg, padding: '48px 24px 32px' }}>

                    <motion.div
                      animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-7xl mb-4">
                      {SCREENS[active].icon}
                    </motion.div>

                    <h3 className="text-white font-black text-lg leading-tight mb-2">
                      {SCREENS[active].text}
                    </h3>
                    <p className="text-white/70 text-xs font-semibold mb-6">
                      {SCREENS[active].sub}
                    </p>

                    {/* Fake countdown */}
                    <div className="flex gap-2 mb-6">
                      {['14', '08', '32'].map((n, i) => (
                        <div key={i} className="rounded-lg px-3 py-2 bg-black/25 text-center">
                          <div className="text-white font-black text-lg font-mono">{n}</div>
                          <div className="text-white/60 text-[9px]">{['Days','Hrs','Min'][i]}</div>
                        </div>
                      ))}
                    </div>

                    {/* Fake RSVP button */}
                    <div className="w-full bg-white/20 backdrop-blur rounded-2xl px-4 py-3 text-white text-sm font-black cursor-pointer hover:bg-white/30 transition">
                      ✓ RSVP — Count me in!
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-10 right-0 translate-x-6 bg-white rounded-2xl px-3 py-2 shadow-xl"
                  style={{ border: '2px solid #dcfce7' }}>
                  <p className="text-xs text-slate-400">RSVPs</p>
                  <p className="text-lg font-black text-green-600">127 ✓</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right side */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }} className="space-y-6">

            <h3 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>
              Beautiful invitations in <span className="gradient-text">every category</span>
            </h3>
            <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              Switch between templates below to see how each category looks as a live animated mini-website — complete with countdown timers, photo galleries, and RSVP buttons.
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

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {STATS.map(s => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="font-black text-xl" style={{ color: 'var(--color-primary)' }}>{s.value}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button onClick={() => navigate('/templates')}
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-black text-white"
              style={{ background: 'var(--color-gradient)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}>
              🎨 Browse All Templates
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
