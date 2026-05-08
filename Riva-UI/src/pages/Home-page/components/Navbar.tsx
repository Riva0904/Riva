import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getStoredAuthToken } from '../../../api/client';
import { getStoredRole, getStoredUsername } from '../../../api/auth';
import { getUserProfile, type UserProfile } from '../../../api/user';

interface NavbarProps { onMenuToggle: () => void; }

const NAV_LINKS = [
  { label: 'Home',      href: '/' },
  { label: 'Templates', href: '#templates' },
  { label: 'Features',  href: '#features' },
  { label: 'Pricing',   href: '#pricing' },
];

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const isLoggedIn     = !!getStoredAuthToken();
  const role           = getStoredRole();
  const storedUsername = getStoredUsername();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      getUserProfile().then(setProfile).catch(() => {});
    }
  }, [isLoggedIn]);

  const displayName = profile?.displayName || profile?.username || storedUsername || '';
  const initials    = displayName.charAt(0).toUpperCase() || '?';

  return (
    <header className="navbar-green">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        <motion.a
          href="/"
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex items-center gap-2.5">
          <div className="logo-icon text-base">R</div>
          <span className="text-xl font-black text-slate-900">
            Digital<span className="text-green">Invitation</span>
          </span>
        </motion.a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              whileHover={{ y: -2, color: '#16a34a' }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="navbar-link nav-link px-4 py-2 rounded-xl">
              {label}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {role === 'Admin' && (
                <motion.a
                  href="/admin"
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="navbar-btn-outline hidden md:inline-flex">
                  ⚡ Admin
                </motion.a>
              )}

              <motion.a
                href="/dashboard"
                whileHover={{ scale: 1.04, borderColor: '#16a34a' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                className="flex items-center gap-2.5 rounded-full border-2 border-green-300 bg-white px-3 py-1.5 shadow-sm hover:bg-green-50">
                <div className="relative h-8 w-8 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center text-sm font-black text-white"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }}>
                  {profile?.profileImageUrl ? (
                    <img src={profile.profileImageUrl} alt={initials}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : null}
                  <span className="z-0">{initials}</span>
                </div>
                <span className="text-sm font-black text-slate-700 hidden sm:block max-w-[130px] truncate">
                  {displayName}
                </span>
              </motion.a>
            </>
          ) : (
            <>
              <motion.a
                href="/login"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="navbar-btn-outline hidden md:inline-flex">
                Login
              </motion.a>
              <motion.a
                href="/register"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="navbar-btn-primary">
                Get Started
              </motion.a>
            </>
          )}

          <motion.button
            onClick={onMenuToggle}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="navbar-btn-outline md:hidden p-2">
            ☰
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
