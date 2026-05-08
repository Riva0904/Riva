import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps { isOpen: boolean; }

const NAV_LINKS = [
  { label: 'Home',      href: '/' },
  { label: 'Templates', href: '#templates' },
  { label: 'Features',  href: '#features' },
  { label: 'Pricing',   href: '#pricing' },
];

const menuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.25, ease: 'easeOut', staggerChildren: 0.06, delayChildren: 0.05 } },
  exit:   { opacity: 0, height: 0,     transition: { duration: 0.2,  ease: 'easeIn' } },
};

const linkVariants = {
  hidden:  { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22 } },
};

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="overflow-hidden md:hidden">
        <div className="border-b border-green-100 bg-white px-6 py-4 shadow-sm">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <motion.a
                key={label}
                href={href}
                variants={linkVariants}
                whileHover={{ x: 6, backgroundColor: '#f0fdf4' }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="navbar-link block rounded-xl px-4 py-3">
                {label}
              </motion.a>
            ))}

            <motion.div
              variants={linkVariants}
              className="mt-2 flex flex-col gap-2 border-t border-green-100 pt-3">
              <motion.a
                href="/login"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="btn-green-outline text-center">
                Login
              </motion.a>
              <motion.a
                href="/register"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="btn-green text-center">
                Get Started
              </motion.a>
            </motion.div>
          </nav>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MobileMenu;
