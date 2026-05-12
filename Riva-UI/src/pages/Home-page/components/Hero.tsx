import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getStoredAuthToken } from '../../../api/client';

const floatVariants = {
  animate: { y: [0, -16, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const } }
};


// ── Animated number counter ───────────────────────────────────────────────────
const Counter: React.FC<{ to: string; label: string; delay: number }> = ({ to, label, delay }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}>
    <motion.p
      initial={{ scale: 0.8 }} animate={{ scale: 1 }}
      transition={{ delay: delay + 0.1, type: 'spring', bounce: 0.5 }}
      className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>{to}</motion.p>
    <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
  </motion.div>
);

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const isLoggedIn = !!getStoredAuthToken();
  const startDest  = isLoggedIn ? '/templates' : '/register';

  return (
    <section style={{ background: 'rgba(var(--color-primary-rgb),0.06)' }}
      className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">

      {/* Animated blobs */}
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full"
        style={{ background: 'rgba(var(--color-primary-rgb),0.20)', filter: 'blur(80px)' }} />
      <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 9, repeat: Infinity }}
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full"
        style={{ background: 'rgba(5,150,105,0.15)', filter: 'blur(80px)' }} />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i}
          className="pointer-events-none absolute rounded-full opacity-20"
          style={{ width: 6 + i * 2, height: 6 + i * 2, background: 'var(--color-primary)', left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}
          animate={{ y: [0, -20, 0], x: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }} />
      ))}

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16 lg:py-16">

        {/* Left */}
        <div className="flex flex-col justify-center space-y-7">

          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-black"
            style={{ background: 'rgba(var(--color-primary-rgb),0.15)', color: 'var(--text-heading)', border: '1px solid rgba(var(--color-primary-rgb),0.40)' }}>
            <motion.span animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 4 }}>🌿</motion.span>
            Premium Digital Invitations
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: 'var(--text-heading)' }}>
            Create{' '}
            <motion.span className="gradient-text"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity }}>
              Stunning
            </motion.span>
            <br />
            Invitations That{' '}
            <span className="gradient-text">Wow</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-lg text-lg leading-8" style={{ color: 'var(--text-body)' }}>
            Design beautiful, personalized digital invitations with animated mini-websites.
            Get RSVPs instantly, share with one link, and{' '}
            <motion.span
              animate={{ color: ['var(--color-primary)', '#059669', 'var(--color-primary)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}>
              track every response
            </motion.span>
            {' '}— all for free.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center">

            {/* START FREE — pulsing glow CTA */}
            <motion.button
              onClick={() => navigate(startDest)}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-black text-white overflow-hidden"
              style={{ background: 'var(--color-gradient)' }}>
              {/* Glow pulse */}
              <motion.span
                className="absolute inset-0 rounded-full"
                animate={{ boxShadow: ['0 0 0 0 rgba(22,163,74,0.6)', '0 0 0 16px rgba(22,163,74,0)', '0 0 0 0 rgba(22,163,74,0)'] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              {/* Shimmer sweep */}
              <motion.span
                className="absolute inset-0 rounded-full opacity-40"
                style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.5) 50%,transparent 60%)', backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative z-10">✨</span>
              <span className="relative z-10">{isLoggedIn ? '🎨 Browse Templates →' : '✨ Get Started Free →'}</span>
            </motion.button>

            {/* Second CTA — only shown when NOT logged in */}
            {!isLoggedIn && (
              <motion.button
                onClick={() => navigate('/templates')}
                whileHover={{ scale: 1.03, borderColor: 'var(--color-primary)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-black transition-colors duration-200"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-heading)', border: '2px solid var(--border-base)' }}>
                🎨 Browse Templates
              </motion.button>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="flex gap-8 pt-2">
            <Counter to="10k+" label="Invitations Sent" delay={0.6} />
            <Counter to="98%"  label="Happy Hosts"      delay={0.7} />
            <Counter to="Free" label="To Get Started"   delay={0.8} />
          </motion.div>
        </div>

        {/* Right — floating mockup */}
        <div className="relative flex items-center justify-center">
          <motion.div variants={floatVariants} animate="animate" className="relative">

            {/* Main card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: 'spring', bounce: 0.35 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl"
              style={{ boxShadow: '0 32px 80px rgba(var(--color-primary-rgb),0.25), 0 8px 24px rgba(0,0,0,0.1)', border: '3px solid rgba(255,255,255,0.9)' }}>
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&q=80&fm=jpg"
                alt="Sample invitation" loading="lazy"
                className="w-full object-cover" style={{ height: 360 }} />
              <div style={{ background: 'linear-gradient(to top, rgba(20,83,45,0.95), transparent)' }}
                className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white font-black text-lg">🎉 Sarah & John's Wedding</p>
                <p className="text-green-200 text-sm">September 15, 2026 · Grand Ballroom</p>
              </div>
            </motion.div>

            {/* RSVP badge */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.08 }}
              style={{ background: 'white', boxShadow: '0 12px 32px rgba(var(--color-primary-rgb),0.25)', border: '2px solid #dcfce7' }}
              className="absolute -right-4 top-8 rounded-2xl px-4 py-3 cursor-default">
              <p className="text-xs font-bold text-slate-500">RSVPs received</p>
              <motion.p
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>127 ✓</motion.p>
            </motion.div>

            {/* Share badge */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.05 }}
              style={{ background: 'white', boxShadow: '0 12px 32px rgba(var(--color-primary-rgb),0.20)', border: '2px solid #dcfce7' }}
              className="absolute -left-4 bottom-12 rounded-2xl px-4 py-3 flex items-center gap-3 cursor-default">
              <div className="flex -space-x-2">
                {['🟢','🔵','🟡'].map((c, i) => (
                  <motion.div key={i}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    className="h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-xs"
                    style={{ background: ['rgba(var(--color-primary-rgb),0.10)','#dbeafe','#fef9c3'][i] }}>{c}</motion.div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Shared via</p>
                <p className="text-sm font-black text-slate-800">WhatsApp · Email</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
