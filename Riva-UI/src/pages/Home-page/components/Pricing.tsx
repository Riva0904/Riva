import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getStoredAuthToken } from '../../../api/client';
import { getMyPlan, type MyPlan } from '../../../api/subscriptions';

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
      'Includes Riva branding',
    ],
    cta: 'Start Free',
    ctaStyle: 'gradient',
    href: () => isLoggedIn() ? '/templates' : '/register',
  },
  {
    id: 2, name: 'Pro', badge: null,
    monthly: '₹1,499', yearly: '₹3,499', period: '/month',
    desc: 'Animated Pro templates — maps, videos & more',
    premium: false,
    features: [
      'Everything in Free',
      'Pro animated templates',
      'Google Maps integration',
      'Video embed (30-40 sec)',
      'Countdown timer',
      'Full RSVP forms',
      'Up to 29 Pro templates/month',
      '5 Premium templates/year (yearly plan)',
      'Includes Riva branding',
    ],
    cta: 'Go Pro',
    ctaStyle: 'gradient',
  },
  {
    id: 3, name: 'Premium', badge: '⭐ Top Plan',
    monthly: '₹799', yearly: '₹2,499', period: '/month',
    desc: 'Unlimited access to ALL templates',
    premium: true,
    features: [
      'Everything in Pro',
      'Unlimited access to ALL templates',
      'Premium animated templates',
      'Background images & GIF effects',
      'Photo gallery section',
      'RSVP analytics dashboard',
      'Remove Riva branding',
    ],
    cta: 'Choose Premium',
    ctaStyle: 'white',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' as const } }),
};

const Pricing: React.FC = () => {
  const navigate    = useNavigate();
  const loggedIn    = !!getStoredAuthToken();
  const [yearly, setYearly] = useState(false);
  const [myPlan, setMyPlan] = useState<MyPlan | null>(null);

  useEffect(() => {
    if (loggedIn) {
      getMyPlan().then(setMyPlan).catch(() => {});
    }
  }, [loggedIn]);

  const activePlan = myPlan?.subscription?.status === 'Active'
    ? myPlan.subscription.planType   // "Premium" | "Pro"
    : null;

  /** Smart navigation based on plan ownership + selected billing cycle */
  const handlePlanClick = (planName: string) => {
    if (!loggedIn) { navigate('/register'); return; }
    if (planName === 'Free') { navigate('/templates?tier=Free'); return; }
    const cycle = yearly ? 'yearly' : 'monthly';
    // Pro
    if (planName === 'Pro') {
      activePlan === 'Pro' || activePlan === 'Premium'
        ? navigate('/templates?tier=Pro')
        : navigate(`/payment?plan=Pro&cycle=${cycle}`);
      return;
    }
    // Premium
    if (planName === 'Premium') {
      activePlan === 'Premium'
        ? navigate('/templates?tier=Premium')
        : navigate(`/payment?plan=Premium&cycle=${cycle}`);
      return;
    }
  };

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

              {/* Active plan indicator */}
              {loggedIn && (
                (p.name === 'Pro'     && activePlan === 'Pro') ||
                (p.name === 'Premium' && activePlan === 'Premium')
              ) && (
                <div className="mb-2 text-center">
                  <span className="rounded-full px-3 py-1 text-[11px] font-black"
                    style={{ background: p.premium ? 'rgba(255,255,255,0.25)' : 'rgba(var(--color-primary-rgb),0.12)',
                             color: p.premium ? 'white' : 'var(--color-primary)' }}>
                    ✓ Your Active Plan
                  </span>
                </div>
              )}

              {/* CTA */}
              <motion.button
                onClick={() => handlePlanClick(p.name)}
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-black transition mt-auto relative overflow-hidden"
                style={p.ctaStyle === 'white'
                  ? { background: 'white', color: 'var(--color-primary-text)' }
                  : { background: 'var(--color-gradient)', color: 'white' }}>
                {p.premium && (
                  <motion.span className="absolute inset-0 rounded-full"
                    animate={{ boxShadow: ['0 0 0 0 rgba(var(--color-primary-rgb),0.4)','0 0 0 10px rgba(var(--color-primary-rgb),0)','0 0 0 0 rgba(var(--color-primary-rgb),0)'] }}
                    transition={{ duration: 2, repeat: Infinity }} />
                )}
                <span className="relative z-10">
                  {/* Smart label based on active plan */}
                  {p.name === 'Free'    && '🆓 Browse Free Templates'}
                  {p.name === 'Pro'     && (activePlan === 'Pro' || activePlan === 'Premium' ? '🚀 Browse Pro Templates' : 'Go Pro')}
                  {p.name === 'Premium' && (activePlan === 'Premium' ? '💎 Browse Premium Templates' : 'Choose Premium')}
                </span>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Curiosity hook */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.4 }}
          className="mt-10 rounded-2xl p-6 text-center relative overflow-hidden"
          style={{ background: 'var(--color-gradient)' }}>
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.5) 50%,transparent 60%)', backgroundSize: '200% 100%' }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
          <motion.p
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}
            className="text-base font-black relative z-10"
            style={{ color: 'var(--text-on-gradient)' }}>
            🎉 Over 5,000 invitations sent — and counting.
          </motion.p>
          <p className="text-sm mt-1 relative z-10" style={{ color: 'var(--text-on-gradient-muted)' }}>
            Join hosts who created unforgettable moments. <span className="font-black">Your celebration deserves the best.</span>
          </p>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.5 }} className="mt-6 text-center text-sm"
          style={{ color: 'var(--text-subtle)' }}>
          All plans include free RSVP tracking, QR codes, and WhatsApp sharing.
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
