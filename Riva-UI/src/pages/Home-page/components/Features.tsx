import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getStoredAuthToken } from '../../../api/client';

const features = [
  {
    icon: '🎉', title: 'Animated RSVP Cards',
    color: 'from-green-400 to-emerald-600',
    stat: '127+ avg RSVPs',
    front: 'Guests respond with a single tap — Accept, Decline, or Maybe.',
    back: 'Real-time RSVP dashboard shows who\'s coming, who declined, and who hasn\'t responded yet. Export to CSV, get instant WhatsApp notifications on every RSVP.',
    demo: '🎊 → Accept\n😔 → Decline\n🤔 → Maybe',
  },
  {
    icon: '💌', title: 'Personalized Messaging',
    color: 'from-blue-400 to-indigo-600',
    stat: 'WhatsApp · Email · QR',
    front: 'Add custom messages, guest names, and auto-greetings.',
    back: 'Dynamic placeholders fill in each guest\'s name automatically. Share via WhatsApp, Email, QR code, or a single shareable link. Works on all devices instantly.',
    demo: '👋 "Hi Sarah, you\'re invited!"',
  },
  {
    icon: '✨', title: 'Premium Animated Themes',
    color: 'from-purple-400 to-pink-600',
    stat: '15+ premium themes',
    front: 'Wedding, Birthday, House Warming — each with animations, countdown timers, and galleries.',
    back: 'Free templates for text-based cards. Premium adds images & animations. Pro adds Google Maps, video embeds, and full mini-website experience with RSVP forms.',
    demo: '🆓 Free · 💎 Premium · 🚀 Pro',
  },
  {
    icon: '📍', title: 'Google Maps Integration',
    color: 'from-amber-400 to-orange-600',
    stat: 'Pro feature',
    front: 'Embed your venue location directly in the invitation.',
    back: 'Guests tap the map to get instant directions. Works with any Google Maps link. Includes venue name, address, and one-tap navigation — no copy-pasting needed.',
    demo: '🗺️ Tap to get directions →',
  },
  {
    icon: '⚡', title: 'Instant Delivery',
    color: 'from-cyan-400 to-blue-600',
    stat: '< 2s load time',
    front: 'One-click sharing. Recipients see your invitation in under 2 seconds.',
    back: 'Your invitation mini-website is hosted instantly. Share the link anywhere — WhatsApp, Instagram, Email. No app download needed. Works on any phone browser worldwide.',
    demo: '🔗 riva.app/invite/abc123',
  },
  {
    icon: '🔒', title: 'Secure & Private',
    color: 'from-slate-500 to-slate-700',
    stat: 'End-to-end secure',
    front: 'Tokenized URLs and private guest access — your invitation stays safe.',
    back: 'Each invitation gets a unique encrypted URL. Optional password protection prevents uninvited guests. All data is stored securely and never shared with third parties.',
    demo: '🛡️ AES-256 encrypted links',
  },
];

const FlipCard: React.FC<{ f: typeof features[0]; idx: number }> = ({ f, idx }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1, duration: 0.6 }}
      className="cursor-pointer"
      style={{ perspective: 1000, height: 260 }}
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 80 }}
        style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
          className="rounded-3xl p-6 flex flex-col group relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,222,128,0.15)', backdropFilter: 'blur(12px)' }}>
          <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${f.color} opacity-20 blur-xl`} />
          <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-2xl shadow-lg flex-shrink-0`}>
            {f.icon}
          </div>
          <h3 className="text-lg font-black text-white mb-2">{f.title}</h3>
          <p className="text-sm leading-6 text-green-200/80 flex-1">{f.front}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.20)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-xs font-black text-green-300">{f.stat}</span>
            </div>
            <span className="text-xs text-green-400/60 font-semibold">Tap for details →</span>
          </div>
        </div>

        {/* Back */}
        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
          className={`rounded-3xl p-6 flex flex-col bg-gradient-to-br ${f.color} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="text-base font-black text-white">{f.title}</h3>
            </div>
            <p className="text-sm text-white/90 leading-6 flex-1">{f.back}</p>
            <div className="mt-3 bg-black/20 rounded-xl px-3 py-2">
              <p className="text-xs font-mono text-white/80 whitespace-pre-line">{f.demo}</p>
            </div>
            <p className="text-xs text-white/50 mt-2 text-right">Tap to flip back ←</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Features: React.FC = () => {
  const navigate   = useNavigate();
  const isLoggedIn = !!getStoredAuthToken();
  const dest       = isLoggedIn ? '/templates' : '/register';

  return (
  <section id="features" className="py-24 px-4 sm:px-6 lg:px-8"
    style={{ background: 'var(--color-gradient)' }}>
    <div className="mx-auto max-w-7xl">

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-6">
        <span className="inline-block rounded-full px-4 py-1 text-sm font-black mb-4"
          style={{ background: 'rgba(var(--color-primary-rgb),0.20)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary-rgb),0.30)' }}>
          Why Riva?
        </span>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          Everything you need for a{' '}
          <motion.span
            animate={{ color: ['#4ade80', '#86efac', '#4ade80'] }}
            transition={{ duration: 2.5, repeat: Infinity }}>
            perfect invite
          </motion.span>
        </h2>
        <p className="mt-4 text-lg text-green-200 max-w-2xl mx-auto">
          From animated themes to real-time RSVP tracking — we've thought of everything.
        </p>
        <p className="mt-2 text-sm text-green-300/60">💡 Tap any card to see more details</p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-12">
        {features.map((f, i) => <FlipCard key={f.title} f={f} idx={i} />)}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 text-center">
        <motion.button
          onClick={() => navigate(dest)}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="relative inline-flex items-center gap-2 rounded-full px-10 py-4 text-sm font-black text-white overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
          <motion.span className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.3)','0 0 0 14px rgba(255,255,255,0)','0 0 0 0 rgba(255,255,255,0)'] }}
            transition={{ duration: 2, repeat: Infinity }} />
          <span className="relative z-10">
            {isLoggedIn ? '🎨 Browse Templates →' : 'Get Started Free — No Credit Card 🎉'}
          </span>
        </motion.button>
      </motion.div>
    </div>
  </section>
  );
};

export default Features;
