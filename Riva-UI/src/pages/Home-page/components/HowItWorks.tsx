import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getStoredAuthToken } from '../../../api/client';

const steps = [
  { step:'01', icon:'🎨', title:'Pick a Template',
    desc:'Browse 15+ animated templates across Birthday, Wedding, House Warming and more. Filter by Free, Premium or Pro.',
    color:'#16a34a' },
  { step:'02', icon:'✏️', title:'Customize It',
    desc:'Fill in your event details — name, date, venue, message. Premium & Pro templates support photos, videos and maps.',
    color:'#2563eb' },
  { step:'03', icon:'🔗', title:'Share Instantly',
    desc:'Get a unique link. Share via WhatsApp, Email, or QR code. Your invitation loads as a beautiful mini-website.',
    color:'#7c3aed' },
  { step:'04', icon:'📊', title:'Track RSVPs',
    desc:"See who accepted, declined, or hasn't responded. Download CSV, view guest messages, get real-time notifications.",
    color:'#dc2626' },
];

const HowItWorks: React.FC = () => {
  const navigate   = useNavigate();
  const isLoggedIn = !!getStoredAuthToken();
  const dest       = isLoggedIn ? '/templates' : '/register';

  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8"
      style={{ background: 'var(--bg-card)' }}>
      <div className="mx-auto max-w-7xl">

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <span className="section-label">Simple Steps</span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{ color: 'var(--text-heading)' }}>
            Up and running in <span className="gradient-text">under 5 minutes</span>
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
            No design skills needed. No app download. Just pick, customize, and share.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          {/* Connecting arrows (desktop) */}
          {[0,1,2].map(i => (
            <div key={i} className="absolute hidden lg:flex items-center justify-center"
              style={{ left: `${25 + i * 25}%`, top: 48, transform: 'translateX(-50%)' }}>
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                style={{ color: 'var(--color-primary)', opacity: 0.4, fontSize: 20 }}>→</motion.span>
            </div>
          ))}

          {steps.map((s, i) => (
            <motion.div key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -8, boxShadow: `0 12px 32px ${s.color}22`, transition: { duration: 0.2 } }}
              className="relative rounded-2xl p-6 text-center cursor-default"
              style={{ background: 'var(--bg-page)', border: '1px solid var(--border-base)' }}>

              <div className="absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-black text-white"
                style={{ background: s.color }}>{s.step}</div>

              <motion.div
                whileInView={{ rotate: [0, -10, 10, 0] }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 + 0.3, duration: 0.6 }}
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-3xl mb-4 mx-auto mt-2"
                style={{ background: `${s.color}18`, border: `2px solid ${s.color}30` }}>
                {s.icon}
              </motion.div>

              <h3 className="font-black text-base mb-2" style={{ color: 'var(--text-heading)' }}>{s.title}</h3>
              <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.4 }}
          className="mt-10 text-center">
          <motion.button
            onClick={() => navigate(dest)}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.96 }}
            className="relative inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-black text-white overflow-hidden"
            style={{ background: 'var(--color-gradient)' }}>
            <motion.span className="absolute inset-0 rounded-full"
              animate={{ boxShadow: ['0 0 0 0 rgba(22,163,74,0.5)','0 0 0 14px rgba(22,163,74,0)','0 0 0 0 rgba(22,163,74,0)'] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <span className="relative z-10">✨</span>
            <span className="relative z-10">{isLoggedIn ? '🎨 Browse Templates →' : "✨ Start Creating — It's Free"}</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
