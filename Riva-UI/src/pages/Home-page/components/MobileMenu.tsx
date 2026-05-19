import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredAuthToken } from '../../../api/client';
import { getStoredRole } from '../../../api/auth';

interface MobileMenuProps { isOpen: boolean; onClose: () => void; }

const NAV_LINKS = [
  { label: '🏠 Home',      href: '/' },
  { label: '🎨 Templates', href: '/templates' },
  { label: '✨ Features',  href: '/#features' },
  { label: '💰 Pricing',   href: '/#pricing' },
];

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const isLoggedIn = !!getStoredAuthToken();
  const role       = getStoredRole();
  const dashHref   = role === 'Admin' ? '/admin' : '/dashboard';

  const handleNav = (href: string) => {
    onClose();
    if (href.includes('#')) {
      const id = href.split('#')[1];
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="md:hidden"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-base)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>

          <nav className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <motion.a
                key={label}
                href={href.startsWith('/#') ? '#' + href.split('#')[1] : href}
                onClick={() => handleNav(href)}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition-colors"
                style={{ color: 'var(--text-body)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--color-primary-rgb),0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                {label}
              </motion.a>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t"
            style={{ borderColor: 'var(--border-base)' }}>
            {isLoggedIn ? (
              <motion.a href={dashHref} onClick={onClose} whileTap={{ scale: 0.97 }}
                className="btn-green text-center">
                Go to Dashboard →
              </motion.a>
            ) : (
              /* Login is shown in the navbar header on mobile — only show Get Started here */
              <motion.a href="/register" onClick={onClose} whileTap={{ scale: 0.97 }}
                className="btn-green text-center">
                Get Started Free →
              </motion.a>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
