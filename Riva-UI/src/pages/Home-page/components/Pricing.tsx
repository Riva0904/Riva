import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getStoredAuthToken } from '../../../api/client';

const isLoggedIn = () => !!getStoredAuthToken();

const plans = [
  {
    id: 1, name: 'Free', badge: null,
    monthly: '₹0', yearly: '₹0', period: '/month',
    desc: 'Perfect for personal celebrations',
    premium: false,
    features: [
      'Free invitation templates',
      'Basic text & quotes design',
      'Unlimited RSVPs',
      'WhatsApp & email sharing',
      'QR code generation',
      'Mobile-friendly invite pages',
    ],
    cta: 'Start Free',
    ctaStyle: 'gradient',
    href: () => isLoggedIn() ? '/templates' : '/register',
  },
  {
    id: 2, name: 'Premium', badge: '⭐ Most Popular',
    monthly: '₹799', yearly: '₹2,499', period: '/month',
    desc: 'For unforgettable events with images & animations',
    premium: true,
    features: [
      'Everything in Free',
      'Premium animated templates',
      'Background images & GIF effects',
      'Photo gallery section',
      'RSVP analytics dashboard',
      'Remove Riva branding',
      '30 templates/month pool',
    ],
    cta: 'Choose Premium',
    ctaStyle: 'white',
    href: () => isLoggedIn() ? '/subscription' : '/register',
  },
  {
    id: 3, name: 'Pro', badge: null,
    monthly: '₹1,499', yearly: '₹3,499', period: '/month',
    desc: 'Full mini-websites with maps, videos & more',
    premium: false,
    features: [
      'Everything in Premium',
      'Google Maps integration',
      'Video embed (30-40 sec)',
      'Countdown timer',
      'Full RSVP forms',
      'Guest management',
      'Unlimited Pro templates/year',
    ],
    cta: 'Go Pro',
    ctaStyle: 'gradient',
    href: () => isLoggedIn() ? '/subscription' : '/register',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' as const } }),
};

const Pricing: React.FC = () => {
  const navigate   = useNavigate();
  const isLoggedIn = !!getStoredAuthToken();
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: 'var(--bg-page)' }}>
      <div className="mx-auto max-w-7xl">

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <span className="section-label">Pricing Plans</span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: 'var(--text-heading)' }}>
            Simple pricing, <span className="gradient-text">transparent value</span>
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            No hidden fees. Cancel any time. Start free — upgrade when you're ready.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full p-1"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
            <button onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-black transition ${!yearly ? 'text-white' : ''}`}
              style={!yearly ? { background: 'var(--color-gradient)' } : { color: 'var(--text-muted)' }}>
              Monthly
            </button>
            <button onClick={() => setYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-black transition flex items-center gap-2 ${yearly ? 'text-white' : ''}`}
              style={yearly ? { background: 'var(--color-gradient)' } : { color: 'var(--text-muted)' }}>
              Yearly
              <span className="rounded-full bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5">Save 30%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {plans.map((p, i) => (
            <motion.div key={p.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`rounded-3xl p-7 shadow-xl relative overflow-hidden flex flex-col ${p.premium ? '' : ''}`}
              style={p.premium
                ? { background: 'var(--color-gradient)', boxShadow: '0 0 50px rgba(var(--color-primary-rgb),0.4)' }
                : { background: 'var(--bg-card)', border: '2px solid var(--border-base)' }}>

              {/* Glow blob */}
              {p.premium && (
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              )}

              {p.badge && (
                <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-black w-fit"
                  style={p.premium
                    ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
                    : { background: 'rgba(var(--color-primary-rgb),0.12)', color: 'var(--color-primary-text)' }}>
                  {p.badge}
                </div>
              )}

              <h3 className="text-2xl font-black mb-1"
                style={{ color: p.premium ? 'white' : 'var(--text-heading)' }}>{p.name}</h3>
              <p className="text-sm mb-5"
                style={{ color: p.premium ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>{p.desc}</p>

              {/* Price */}
              <div className="flex items-end gap-1 mb-6">
                <motion.span
                  key={yearly ? 'yearly' : 'monthly'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-black"
                  style={{ color: p.premium ? 'white' : 'var(--text-heading)' }}>
                  {yearly ? p.yearly : p.monthly}
                </motion.span>
                <span className="mb-1 text-sm font-bold"
                  style={{ color: p.premium ? 'rgba(255,255,255,0.65)' : 'var(--text-subtle)' }}>
                  {yearly ? '/year' : '/month'}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm font-medium"
                    style={{ color: p.premium ? 'rgba(255,255,255,0.9)' : 'var(--text-body)' }}>
                    <span className="mt-0.5 flex-shrink-0 font-black text-base"
                      style={{ color: p.premium ? 'white' : 'var(--color-primary)' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                onClick={() => navigate(p.href())}
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-black transition mt-auto relative overflow-hidden"
                style={p.ctaStyle === 'white'
                  ? { background: 'white', color: 'var(--color-primary-text)' }
                  : { background: 'var(--color-gradient)', color: 'white' }}>
                {p.premium && (
                  <motion.span className="absolute inset-0 rounded-full"
                    animate={{ boxShadow: ['0 0 0 0 rgba(22,163,74,0.4)','0 0 0 10px rgba(22,163,74,0)','0 0 0 0 rgba(22,163,74,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }} />
                )}
                <span className="relative z-10">
                  {isLoggedIn && p.id === 1 ? '🆓 Browse Free Templates' : p.cta}
                </span>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Per-template note */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.4 }}
          className="mt-10 rounded-2xl p-5 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
          <p className="text-sm font-black mb-2" style={{ color: 'var(--text-heading)' }}>
            💡 Prefer one-time purchases?
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Premium templates from <strong style={{ color: 'var(--color-primary)' }}>₹49</strong> ·
            Pro templates from <strong style={{ color: 'var(--color-primary)' }}>₹149</strong> ·
            Pay once, use forever. No subscription needed.
          </p>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.5 }} className="mt-6 text-center text-sm"
          style={{ color: 'var(--text-subtle)' }}>
          All plans include free RSVP tracking, QR codes, and WhatsApp sharing. No credit card required to start.
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
