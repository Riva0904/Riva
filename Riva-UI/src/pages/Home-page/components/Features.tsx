import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '🎉',
    title: 'Animated RSVP Cards',
    description: 'Guests respond with a single tap — Accept, Decline, or Maybe. Beautiful animations, real-time tracking.',
    color: 'from-green-400 to-emerald-600',
    stat: '127+ avg RSVPs',
    href: '/#templates',
    action: 'Browse Templates →',
  },
  {
    icon: '💌',
    title: 'Personalized Messaging',
    description: 'Add custom messages, guest names, and auto-greetings. Share via WhatsApp, Email, or a single link.',
    color: 'from-blue-400 to-indigo-600',
    stat: 'WhatsApp · Email · QR',
    href: '/register',
    action: 'Get Started →',
  },
  {
    icon: '✨',
    title: 'Premium Animated Themes',
    description: 'Wedding, Birthday, Corporate, Baby Shower — each theme has animations, countdown timers, and galleries.',
    color: 'from-purple-400 to-pink-600',
    stat: '50+ premium themes',
    href: '/#templates',
    action: 'View Themes →',
  },
  {
    icon: '🌍',
    title: 'Global Reach',
    description: 'Share worldwide with multi-timezone support. Your invitation mini-website loads instantly on any device.',
    color: 'from-amber-400 to-orange-600',
    stat: '190+ countries',
    href: '/register',
    action: 'Try for Free →',
  },
  {
    icon: '⚡',
    title: 'Instant Delivery',
    description: 'One-click sharing, QR codes, and direct links. Recipients see your invitation in under 2 seconds.',
    color: 'from-cyan-400 to-blue-600',
    stat: '< 2s load time',
    href: '/register',
    action: 'Create Invitation →',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Tokenized URLs, optional password protection, and private guest access — your invitation stays safe.',
    color: 'from-slate-500 to-slate-700',
    stat: 'End-to-end secure',
    href: '/register',
    action: 'Learn More →',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const Features: React.FC = () => (
  <section id="features" className="py-24 px-4 sm:px-6 lg:px-8"
    style={{ background: 'var(--color-gradient)' }}>
    <div className="mx-auto max-w-7xl">

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
        <span className="inline-block rounded-full px-4 py-1 text-sm font-black mb-4"
          style={{ background: 'rgba(var(--color-primary-rgb),0.20)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary-rgb),0.30)' }}>
          Why Riva?
        </span>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          Everything you need for a{' '}
          <span style={{ color: 'var(--color-primary)' }}>perfect invite</span>
        </h2>
        <p className="mt-4 text-lg text-green-200 max-w-2xl mx-auto">
          From animated themes to real-time RSVP tracking — we've thought of everything.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants} initial="hidden"
        whileInView="visible" viewport={{ once: true, margin: '-100px' }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <motion.a key={f.title} href={f.href} variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="feature-card group relative overflow-hidden rounded-3xl p-6 cursor-pointer block"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(74,222,128,0.15)',
              backdropFilter: 'blur(12px)',
              textDecoration: 'none',
            }}>

            {/* Gradient accent */}
            <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${f.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`} />

            <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-2xl shadow-lg`}>
              {f.icon}
            </div>

            <h3 className="text-lg font-black text-white mb-2">{f.title}</h3>
            <p className="text-sm leading-6 text-green-200/80">{f.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(var(--color-primary-rgb),0.20)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="text-xs font-black text-green-300">{f.stat}</span>
              </div>
              <span className="text-xs font-black text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {f.action}
              </span>
            </div>
          </motion.a>
        ))}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 text-center">
        <a href="/register"
          className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-sm font-black text-slate-900 transition hover:scale-105 active:scale-95"
          style={{ background: 'var(--color-gradient)', boxShadow: '0 12px 32px rgba(var(--color-primary-rgb),0.40)' }}>
          Get Started Free — No Credit Card 🎉
        </a>
      </motion.div>
    </div>
  </section>
);

export default Features;
