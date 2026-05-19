import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredAuthToken } from '../../../api/client';
import { getStoredRole, getStoredUsername } from '../../../api/auth';
import { getUserProfile, type UserProfile } from '../../../api/user';

interface NavbarProps { onMenuToggle: () => void; menuOpen: boolean; }

const NAV_LINKS = [
  { label: 'Home',      href: '/' },
  { label: 'Templates', href: '/templates' },
  { label: 'Features',  href: '/#features' },
  { label: 'Pricing',   href: '/#pricing' },
];

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, menuOpen }) => {
  const isLoggedIn     = !!getStoredAuthToken();
  const role           = getStoredRole();
  const storedUsername = getStoredUsername();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isLoggedIn) getUserProfile().then(setProfile).catch(() => {});
  }, [isLoggedIn]);

  const displayName = profile?.displayName || profile?.username || storedUsername || '';
  const initials    = displayName.charAt(0).toUpperCase() || '?';

  return (
    <header className="navbar-green">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-3">

        {/* ── Logo ── */}
        <motion.a href="/" whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <div className="logo-icon flex-shrink-0" style={{ width: 32, height: 32, fontSize: 14 }}>R</div>
          <span className="text-base sm:text-lg font-black text-slate-900 whitespace-nowrap">
            Digital<span className="text-green">Invitation</span>
          </span>
        </motion.a>

        {/* ── Desktop nav links — hidden below md ── */}
        {/* Plain <nav> with no CSS class that sets display, so hidden/md:flex works */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(({ label, href }) => (
            <motion.a key={label} href={href}
              whileHover={{ y: -2, color: 'var(--color-primary)' }}
              className="navbar-link nav-link px-3 py-2 rounded-xl text-sm whitespace-nowrap">
              {label}
            </motion.a>
          ))}
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {isLoggedIn ? (
            /* Profile badge — always visible on all sizes */
            <motion.a href={role === 'Admin' ? '/admin' : '/dashboard'}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-sm"
              style={{ border: '2px solid rgba(var(--color-primary-rgb),0.30)' }}>
              <div className="relative h-7 w-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: 'var(--color-gradient)', minWidth: 28 }}>
                {profile?.profileImageUrl && (
                  <img src={profile.profileImageUrl} alt={initials}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                )}
                <span className="z-0">{initials}</span>
              </div>
              <span className="text-sm font-black text-slate-700 hidden sm:block max-w-[100px] truncate">
                {displayName}
              </span>
            </motion.a>
          ) : (
            /*
             * Auth wrapper — plain <div> with no CSS class that sets display.
             * This means Tailwind's hidden/md:flex works without CSS specificity conflicts.
             * (navbar-btn-* SCSS sets display:flex which would override hidden on the buttons
             *  directly — wrapping in a plain div avoids that entirely)
             */
            <div className="hidden md:flex items-center gap-2">
              <motion.a href="/login"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="navbar-btn-outline">
                Login
              </motion.a>
              <motion.a href="/register"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="navbar-btn-primary">
                Get Started
              </motion.a>
            </div>
          )}

          {/* Mobile-only compact Login link — in the header next to hamburger */}
          {!isLoggedIn && (
            <div className="flex md:hidden">
              <a href="/login"
                className="text-xs font-black rounded-full px-3 py-1.5 whitespace-nowrap"
                style={{ border: '1.5px solid var(--border-base)', color: 'var(--text-body)', background: 'var(--bg-surface)' }}>
                Login
              </a>
            </div>
          )}

          {/*
           * Hamburger — plain <div> wrapper so md:hidden works correctly.
           * Visible below md, hidden at md+.
           */}
          <div className="flex md:hidden">
            <motion.button onClick={onMenuToggle} whileTap={{ scale: 0.88 }}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex items-center justify-center rounded-xl"
              style={{ width: 36, height: 36, background: menuOpen ? 'rgba(var(--color-primary-rgb),0.10)' : 'transparent' }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={menuOpen ? 'x' : 'm'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ fontSize: 18, color: 'var(--text-body)', lineHeight: 1, display: 'block' }}>
                  {menuOpen ? '✕' : '☰'}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
