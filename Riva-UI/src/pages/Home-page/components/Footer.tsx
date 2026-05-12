import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ── Data ──────────────────────────────────────────────────────────────────────
const LINKS = {
  Product: [
    { label: 'Templates',    href: '/templates' },
    { label: 'Features',     href: '/#features' },
    { label: 'Pricing',      href: '/#pricing' },
    { label: 'How It Works', href: '/#how-it-works' },
  ],
  Account: [
    { label: 'Login',     href: '/login' },
    { label: 'Register',  href: '/register' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Support: [
    { label: 'Help Center',       href: '/#how-it-works' },
    { label: 'Privacy Policy',    href: '/privacy' },
    { label: 'Terms of Service',  href: '/terms' },
    { label: 'Contact Us',        href: 'mailto:rivainvitation@gmail.com' },
  ],
} as const;

const SOCIALS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.121 1.524 5.855L.057 23.976l6.294-1.645A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
    label: 'WhatsApp',
    href: 'https://wa.me/919876543210',
    color: '#25D366',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    label: 'Instagram',
    href: 'https://instagram.com/rivainvitation',
    color: '#E1306C',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.847L1.25 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    label: 'X / Twitter',
    href: 'https://x.com/rivainvitation',
    color: '#000000',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/rivainvitation',
    color: '#0A66C2',
  },
];

const TIERS = [
  { tier:'Free',    icon:'🆓', price:'₹0',       color:'#16a34a' },
  { tier:'Premium', icon:'💎', price:'₹799/mo',  color:'#3b82f6' },
  { tier:'Pro',     icon:'🚀', price:'₹1,499/mo',color:'#8b5cf6' },
];

// ── Helper: handle hash-based nav ─────────────────────────────────────────────
const useFooterNav = () => {
  const navigate = useNavigate();
  return (href: string) => {
    if (href.startsWith('mailto:')) { window.location.href = href; return; }
    if (href.startsWith('http'))    { window.open(href, '_blank', 'noopener noreferrer'); return; }
    if (href.includes('#') && href.startsWith('/#')) {
      const id = href.split('#')[1];
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 200);
      return;
    }
    navigate(href);
  };
};

// ── Animated link ─────────────────────────────────────────────────────────────
const FooterLink: React.FC<{ label: string; href: string; onClick: () => void }> = ({ label, href, onClick }) => (
  <motion.li>
    <motion.button
      onClick={onClick}
      whileHover={{ x: 5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex items-center gap-1.5 text-sm text-left transition-colors group"
      style={{ color: 'rgba(255,255,255,0.5)' }}
      onMouseEnter={e => (e.currentTarget.style.color = '#4ade80')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
      <motion.span
        initial={{ opacity: 0, x: -4 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="text-green-400 text-xs">›</motion.span>
      {label}
    </motion.button>
  </motion.li>
);

// ── Column variants ───────────────────────────────────────────────────────────
const colVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' } }),
};

// ── NewsletterStrip ───────────────────────────────────────────────────────────
const NewsletterStrip: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmail('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="mb-10 rounded-2xl p-6"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-black text-white text-sm mb-0.5">Stay updated ✉️</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            New templates, offers, and tips — no spam, ever.
          </p>
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="email" required value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 sm:w-52 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
            onFocus={e => e.currentTarget.style.borderColor = '#4ade80'}
            onBlur={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
          />
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.span key="sent"
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl px-4 py-2.5 text-sm font-black text-white"
                style={{ background: 'var(--color-gradient)' }}>
                ✓ Sent!
              </motion.span>
            ) : (
              <motion.button key="btn" type="submit"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="rounded-xl px-4 py-2.5 text-sm font-black text-white whitespace-nowrap"
                style={{ background: 'var(--color-gradient)' }}>
                Subscribe
              </motion.button>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.div>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const go = useFooterNav();

  return (
    <footer className="relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#0a1628 0%,#0d1f3c 40%,#0a1628 100%)' }}>

      {/* Animated blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 h-80 w-80 rounded-full"
          style={{ background: 'var(--color-primary)', filter: 'blur(80px)' }} />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.07, 0.12, 0.07] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full"
          style={{ background: '#7c3aed', filter: 'blur(60px)' }} />
        <motion.div
          animate={{ opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(22,163,74,0.08) 0%,transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.06) 0%,transparent 50%)' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-8">

        {/* Newsletter */}
        <NewsletterStrip />

        {/* Top grid */}
        <div className="mb-12 grid gap-10 lg:grid-cols-5">

          {/* Brand */}
          <motion.div className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>

            <motion.button
              onClick={() => go('/')}
              className="flex items-center gap-3 mb-5 cursor-pointer"
              whileHover={{ scale: 1.03 }}>
              <motion.div whileHover={{ rotate: 10, scale: 1.1 }}
                className="logo-icon text-lg flex-shrink-0"
                style={{ background: 'var(--color-gradient)', color: 'white' }}>R</motion.div>
              <span className="text-xl font-black text-white">
                Digital<span style={{ color: 'var(--color-primary)' }}>Invitation</span>
              </span>
            </motion.button>

            <p className="text-sm leading-7 mb-6 max-w-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Create beautiful animated digital invitations for every celebration —
              Birthday, Wedding, House Warming and more.
            </p>

            {/* Socials */}
            <div className="flex gap-3 flex-wrap">
              {SOCIALS.map((s, i) => (
                <motion.button key={s.label}
                  onClick={() => go(s.href)}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ scale: 1.18, y: -4 }} whileTap={{ scale: 0.9 }}
                  title={s.label}
                  className="h-10 w-10 flex items-center justify-center rounded-xl text-white transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = s.color + '33'; (e.currentTarget as HTMLButtonElement).style.borderColor = s.color + '66'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}>
                  {s.icon}
                </motion.button>
              ))}
            </div>

            {/* Contact quick */}
            <motion.button
              onClick={() => go('mailto:rivainvitation@gmail.com')}
              whileHover={{ x: 4 }}
              className="mt-5 flex items-center gap-2 text-xs transition"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              ✉️ rivainvitation@gmail.com
            </motion.button>
          </motion.div>

          {/* Link columns */}
          <div className="lg:col-span-3 grid grid-cols-3 gap-8">
            {(Object.entries(LINKS) as [string, readonly { label: string; href: string }[]][]).map(([title, links], i) => (
              <motion.div key={title}
                custom={i + 1} variants={colVariants}
                initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <span>{title === 'Product' ? '🚀' : title === 'Account' ? '👤' : '💬'}</span>
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map(({ label, href }) => (
                    <FooterLink key={label} label={label} href={href} onClick={() => go(href)} />
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tier strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm font-black text-white">Start with Free. Upgrade whenever you're ready.</p>
          <div className="flex items-center gap-3 flex-wrap">
            {TIERS.map((t, i) => (
              <motion.button key={t.tier}
                onClick={() => go(t.tier === 'Free' ? '/templates' : '/#pricing')}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white cursor-pointer"
                style={{ background: t.color }}>
                {t.icon} {t.tier} · {t.price}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row"
          style={{ borderColor: 'rgba(255,255,255,0.10)' }}>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} Riva Digital Invitation Platform · All rights reserved.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <motion.span whileHover={{ scale: 1.06 }}
              className="rounded-full px-3 py-1 text-xs font-black cursor-default select-none"
              style={{ background: 'rgba(var(--color-primary-rgb),0.15)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary-rgb),0.25)' }}>
              🌱 Green by design
            </motion.span>
            <motion.button onClick={() => go('/privacy')}
              whileHover={{ x: 2 }}
              className="text-xs transition"
              style={{ color: 'rgba(255,255,255,0.30)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.30)'}>
              Privacy
            </motion.button>
            <motion.button onClick={() => go('/terms')}
              whileHover={{ x: 2 }}
              className="text-xs transition"
              style={{ color: 'rgba(255,255,255,0.30)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.30)'}>
              Terms
            </motion.button>
            <motion.button onClick={() => go('/templates')}
              whileHover={{ scale: 1.04, color: '#4ade80' }}
              className="text-xs font-semibold transition"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
              Browse Templates →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
