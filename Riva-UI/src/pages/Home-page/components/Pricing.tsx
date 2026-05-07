import React from 'react';
import { motion } from 'framer-motion';

const plans = [
  {
    id: 1, name: 'Starter', price: '$0', period: '/mo',
    desc: 'Perfect for personal celebrations',
    features: ['3 invitation templates','Unlimited RSVPs','WhatsApp & email sharing','Custom fields','QR code generation'],
    cta: 'Start Free', premium: false, badge: null,
  },
  {
    id: 2, name: 'Premium', price: '$19', period: '/mo',
    desc: 'For unforgettable events',
    features: ['Unlimited templates','Full animations & themes','Password-protected invites','RSVP analytics dashboard','Custom domain support','Priority delivery','Remove Riva branding'],
    cta: 'Choose Premium', premium: true, badge: '⭐ Most Popular',
  },
  {
    id: 3, name: 'Business', price: '$45', period: '/mo',
    desc: 'For agencies and large events',
    features: ['Everything in Premium','White-label branding','API access','Bulk invitations (1000+)','Dedicated support','SLA guarantee','Team collaboration'],
    cta: 'Contact Sales', premium: false, badge: null,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const Pricing: React.FC = () => (
  <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8"
    style={{ background: 'linear-gradient(180deg,#ffffff,#f0fdf4)' }}>
    <div className="mx-auto max-w-7xl">

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
        <span className="section-label">Pricing Plans</span>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Simple pricing, <span className="gradient-text">transparent value</span>
        </h2>
        <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
          No hidden fees. Cancel any time. Start free — upgrade when you're ready.
        </p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" whileInView="visible"
        viewport={{ once: true }} className="grid gap-6 md:grid-cols-3 items-start">
        {plans.map(p => (
          <motion.div key={p.id} variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={`price-card rounded-3xl p-8 shadow-xl transition duration-500 ${p.premium ? 'pulse-glow bg-dark-green' : 'bg-white border-2 border-green-100'}`}>

            {p.badge && (
              <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-black"
                style={{ background: 'rgba(74,222,128,0.25)', color: '#4ade80' }}>
                {p.badge}
              </div>
            )}

            <h3 className={`text-2xl font-black ${p.premium ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
            <p className={`text-sm mt-1 mb-4 ${p.premium ? 'text-green-300' : 'text-slate-500'}`}>{p.desc}</p>

            <div className="flex items-end gap-1 mb-6">
              <span className={`text-5xl font-black ${p.premium ? 'text-white' : 'text-slate-900'}`}>{p.price}</span>
              <span className={`mb-1.5 text-sm font-bold ${p.premium ? 'text-green-300' : 'text-slate-400'}`}>{p.period}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {p.features.map(f => (
                <li key={f} className={`flex items-start gap-2 text-sm font-medium ${p.premium ? 'text-green-100' : 'text-slate-700'}`}>
                  <span className="mt-0.5 flex-shrink-0 text-base" style={{ color: p.premium ? '#4ade80' : '#16a34a' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <motion.a href="/register" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-black transition"
              style={p.premium
                ? { background: 'linear-gradient(135deg,#4ade80,#22c55e)', color: '#052e16' }
                : { background: 'linear-gradient(135deg,#16a34a,#059669)', color: 'white' }}>
              {p.cta}
            </motion.a>
          </motion.div>
        ))}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ delay: 0.5 }} className="mt-10 text-center text-sm text-slate-400">
        All plans include free RSVP tracking, QR codes, and WhatsApp sharing. No credit card required to start.
      </motion.p>
    </div>
  </section>
);

export default Pricing;
