import React from 'react';
import { motion } from 'framer-motion';
import { getStoredAuthToken } from '../../../api/client';

const isLoggedIn = () => !!getStoredAuthToken();

const plans = [
  {
    id: 1, name: 'Starter', price: '$0', period: '/mo',
    desc: 'Perfect for personal celebrations',
    features: ['3 invitation templates','Unlimited RSVPs','WhatsApp & email sharing','Custom fields','QR code generation'],
    cta: 'Start Free', ctaHref: () => isLoggedIn() ? '/dashboard' : '/register',
    premium: false, badge: null,
  },
  {
    id: 2, name: 'Premium', price: '$19', period: '/mo',
    desc: 'For unforgettable events',
    features: ['Unlimited templates','Full animations & themes','Password-protected invites','RSVP analytics dashboard','Custom domain support','Priority delivery','Remove Riva branding'],
    cta: 'Choose Premium', ctaHref: () => isLoggedIn() ? '/subscription' : '/register',
    premium: true, badge: '⭐ Most Popular',
  },
  {
    id: 3, name: 'Business', price: '$45', period: '/mo',
    desc: 'For agencies and large events',
    features: ['Everything in Premium','White-label branding','API access','Bulk invitations (1000+)','Dedicated support','SLA guarantee','Team collaboration'],
    cta: 'Contact Sales', ctaHref: () => isLoggedIn() ? '/subscription' : '/register',
    premium: false, badge: null,
  },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const Pricing: React.FC = () => (
  <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8"
    style={{ background: 'var(--bg-page)' }}>
    <div className="mx-auto max-w-7xl">

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
        <span className="section-label">Pricing Plans</span>
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
          style={{ color: 'var(--text-heading)' }}>
          Simple pricing, <span className="gradient-text">transparent value</span>
        </h2>
        <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          No hidden fees. Cancel any time. Start free — upgrade when you're ready.
        </p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" whileInView="visible"
        viewport={{ once: true }} className="grid gap-6 md:grid-cols-3 items-start">
        {plans.map(p => (
          <motion.div key={p.id} variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="price-card rounded-3xl p-8 shadow-xl transition duration-500"
            style={p.premium
              ? { background: 'var(--color-gradient)', boxShadow: '0 0 40px rgba(var(--color-primary-rgb),0.35)' }
              : { background: 'var(--bg-card)', border: '2px solid var(--border-base)' }}>

            {p.badge && (
              <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-black"
                style={p.premium
                  ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
                  : { background: 'rgba(var(--color-primary-rgb),0.12)', color: 'var(--color-primary-text)' }}>
                {p.badge}
              </div>
            )}

            <h3 className="text-2xl font-black"
              style={{ color: p.premium ? 'white' : 'var(--text-heading)' }}>{p.name}</h3>
            <p className="text-sm mt-1 mb-4"
              style={{ color: p.premium ? 'rgba(255,255,255,0.80)' : 'var(--text-muted)' }}>{p.desc}</p>

            <div className="flex items-end gap-1 mb-6">
              <span className="text-5xl font-black"
                style={{ color: p.premium ? 'white' : 'var(--text-heading)' }}>{p.price}</span>
              <span className="mb-1.5 text-sm font-bold"
                style={{ color: p.premium ? 'rgba(255,255,255,0.70)' : 'var(--text-subtle)' }}>{p.period}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {p.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm font-medium"
                  style={{ color: p.premium ? 'rgba(255,255,255,0.90)' : 'var(--text-body)' }}>
                  <span className="mt-0.5 flex-shrink-0 text-base font-black"
                    style={{ color: p.premium ? 'white' : 'var(--color-primary)' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <motion.a href={p.ctaHref()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-black transition"
              style={p.premium
                ? { background: 'white', color: 'var(--color-primary-text)' }
                : { background: 'var(--color-gradient)', color: 'white' }}>
              {p.cta}
            </motion.a>
          </motion.div>
        ))}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ delay: 0.5 }} className="mt-10 text-center text-sm"
        style={{ color: 'var(--text-subtle)' }}>
        All plans include free RSVP tracking, QR codes, and WhatsApp sharing. No credit card required to start.
      </motion.p>
    </div>
  </section>
);

export default Pricing;
