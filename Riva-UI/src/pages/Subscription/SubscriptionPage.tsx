import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getStoredAuthToken } from '../../api/client';
import { getUserSession } from '../../api/analysis';

const PLANS = [
  {
    id: 1, name: 'Starter', priceUsd: 0, priceInr: 0, period: '/mo',
    desc: 'Perfect for personal celebrations',
    features: ['3 free templates', 'Up to 10 invitations', 'Unlimited RSVPs', 'WhatsApp & email sharing', 'QR code generation'],
    cta: 'Current Plan', premium: false, badge: null, current: true,
  },
  {
    id: 2, name: 'Premium', priceUsd: 19, priceInr: 1590, period: '/mo',
    desc: 'For unforgettable events',
    features: ['All templates unlocked', 'Unlimited invitations', 'Full animations & themes', 'RSVP analytics', 'Custom domain support', 'Remove Riva branding'],
    cta: 'Upgrade to Premium', premium: true, badge: '⭐ Most Popular', current: false,
  },
  {
    id: 3, name: 'Business', priceUsd: 45, priceInr: 3750, period: '/mo',
    desc: 'For agencies and large events',
    features: ['Everything in Premium', 'White-label branding', 'API access', 'Bulk invitations (1000+)', 'Dedicated support', 'SLA guarantee'],
    cta: 'Upgrade to Business', premium: false, badge: null, current: false,
  },
];

const cardVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string>('Starter');
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!getStoredAuthToken()) { navigate('/login'); return; }
    getUserSession()
      .then(s => setCurrentPlan(s.subscriptionPlan ?? 'Starter'))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleUpgrade = (plan: typeof PLANS[0]) => {
    if (plan.priceInr === 0 || plan.name === currentPlan) return;
    navigate(`/payment?planId=${plan.id}&amount=${plan.priceInr}&name=${encodeURIComponent(plan.name + ' Plan')}`);
  };

  return (
    <div className="bg-light-green min-h-screen">
      <header className="dashboard-header shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="navbar-btn-outline text-sm">← Dashboard</button>
            <span className="font-black text-slate-900">Choose a <span className="text-green">Plan</span></span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="section-label">Subscription Plans</span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl mt-2">
            Simple pricing, <span className="gradient-text">transparent value</span>
          </h2>
          {!loading && (
            <p className="mt-3 text-slate-500">
              Current plan: <span className="font-black text-green-700">{currentPlan}</span>
            </p>
          )}
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 items-start">
          {PLANS.map((plan, i) => {
            const isCurrent = plan.name === currentPlan;
            return (
              <motion.div key={plan.id}
                custom={i} variants={cardVariants} initial="hidden" animate="visible"
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="rounded-3xl p-8 shadow-xl transition duration-300"
                style={plan.premium
                  ? { background: 'var(--color-gradient)', boxShadow: isCurrent ? '0 0 0 4px var(--color-primary), 0 20px 40px rgba(var(--color-primary-rgb),0.35)' : '0 20px 40px rgba(var(--color-primary-rgb),0.30)' }
                  : { background: 'var(--bg-card)', border: `2px solid ${isCurrent ? 'var(--color-primary)' : 'var(--border-base)'}`, boxShadow: 'var(--shadow-card)' }}>

                {plan.badge && (
                  <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-black"
                    style={plan.premium
                      ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
                      : { background: 'rgba(var(--color-primary-rgb),0.12)', color: 'var(--color-primary-text)' }}>
                    {plan.badge}
                  </div>
                )}
                {isCurrent && (
                  <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-black"
                    style={{ background: 'rgba(var(--color-primary-rgb),0.15)', color: 'var(--color-primary-text)' }}>
                    ✓ Active Plan
                  </div>
                )}

                <h3 className="text-2xl font-black"
                  style={{ color: plan.premium ? 'white' : 'var(--text-heading)' }}>{plan.name}</h3>
                <p className="text-sm mt-1 mb-4"
                  style={{ color: plan.premium ? 'rgba(255,255,255,0.80)' : 'var(--text-muted)' }}>{plan.desc}</p>

                <div className="flex items-end gap-1 mb-6">
                  {plan.priceInr === 0 ? (
                    <span className="text-5xl font-black"
                      style={{ color: plan.premium ? 'white' : 'var(--text-heading)' }}>Free</span>
                  ) : (
                    <>
                      <span className="text-5xl font-black"
                        style={{ color: plan.premium ? 'white' : 'var(--text-heading)' }}>
                        ₹{plan.priceInr.toLocaleString()}
                      </span>
                      <span className="mb-1.5 text-sm font-bold"
                        style={{ color: plan.premium ? 'rgba(255,255,255,0.70)' : 'var(--text-subtle)' }}>
                        {plan.period}
                      </span>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm font-medium"
                      style={{ color: plan.premium ? 'rgba(255,255,255,0.90)' : 'var(--text-body)' }}>
                      <span className="mt-0.5 flex-shrink-0 font-black"
                        style={{ color: plan.premium ? 'white' : 'var(--color-primary)' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: isCurrent ? 1 : 1.02 }}
                  whileTap={{ scale: isCurrent ? 1 : 0.97 }}
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrent || loading}
                  className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-black transition disabled:opacity-60 disabled:cursor-default"
                  style={plan.premium
                    ? { background: 'white', color: 'var(--color-primary-text)' }
                    : { background: 'var(--color-gradient)', color: 'white' }}>
                  {isCurrent ? '✓ Current Plan' : plan.cta}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-10 text-center text-sm text-slate-400">
          All plans include free RSVP tracking, QR codes, and WhatsApp sharing. Cancel anytime.
        </motion.p>
      </main>
    </div>
  );
};

export default SubscriptionPage;
