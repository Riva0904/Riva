import React from 'react';
import { motion } from 'framer-motion';

const COLS = [
  { title: 'Product', links: [['Templates','#templates'],['Features','#features'],['Pricing','#pricing']] },
  { title: 'Account', links: [['Login','/login'],['Register','/register'],['Dashboard','/dashboard']] },
  { title: 'Legal',   links: [['Terms','#'],['Privacy','#'],['Support','#']] },
] as const;

const colVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Footer: React.FC = () => (
  <footer className="px-4 py-14 sm:px-6 lg:px-8"
    style={{ background: 'var(--color-gradient)' }}>
    <div className="mx-auto max-w-7xl">

      <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="logo-icon text-base"
              style={{ background: 'rgba(255,255,255,0.20)', color: 'white' }}>R</div>
            <span className="text-lg font-black text-white">
              Digital<span style={{ color: 'rgba(255,255,255,0.75)' }}>Invitation</span>
            </span>
          </div>
          <p className="text-sm leading-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Create beautiful digital invitations for every celebration.
          </p>
        </motion.div>

        {/* Link columns */}
        {COLS.map((col, i) => (
          <motion.div key={col.title}
            custom={i + 1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={colVariants}>
            <h4 className="text-sm font-black text-white mb-4">{col.title}</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <motion.a href={href}
                    whileHover={{ x: 4, color: '#ffffff' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="inline-block transition-colors cursor-pointer">
                    {label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
        style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          © {new Date().getFullYear()} Riva Digital Invitation Platform. All rights reserved.
        </p>
        <motion.span
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="rounded-full px-3 py-1 text-xs font-black border cursor-default"
          style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.25)' }}>
          🌱 Green by design
        </motion.span>
      </motion.div>
    </div>
  </footer>
);

export default Footer;
