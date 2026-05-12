import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitRsvp, type SubmitRsvpRequest } from '../api/rsvp';

interface Props {
  slug: string;
  hostName?: string;
}

type RsvpStatus = 'Accepted' | 'Declined' | 'Maybe';

const statusConfig: Record<RsvpStatus, { emoji: string; label: string; color: string; bg: string; glow: string }> = {
  Accepted: { emoji: '🎉', label: 'Joyfully Accept', color: 'text-green-700',  bg: 'bg-green-500',  glow: 'shadow-green-300' },
  Maybe:    { emoji: '🤔', label: 'Maybe',           color: 'text-amber-700',  bg: 'bg-amber-400',  glow: 'shadow-amber-300' },
  Declined: { emoji: '😢', label: 'Decline',         color: 'text-red-700',    bg: 'bg-red-400',    glow: 'shadow-red-300'   },
};

const RsvpCard: React.FC<Props> = ({ slug, hostName }) => {
  const [step,       setStep]       = useState<'choose' | 'form' | 'done'>('choose');
  const [status,     setStatus]     = useState<RsvpStatus>('Accepted');
  const [guestName,  setGuestName]  = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [message,    setMessage]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const handleChoose = (s: RsvpStatus) => {
    setStatus(s);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setError(null); setLoading(true);
    try {
      await submitRsvp(slug, {
        guestName: guestName.trim(),
        status,
        guestCount,
        message: message.trim() || undefined,
      });
      setStep('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="my-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-md overflow-hidden rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        }}
      >
        <div className="px-6 py-5">
          <h3 className="text-center text-lg font-black text-white mb-1">
            Will you be joining us?
          </h3>
          {hostName && (
            <p className="text-center text-sm text-white/70 mb-4">RSVP to {hostName}</p>
          )}

          <AnimatePresence mode="wait">

            {/* Step 1: Choose status */}
            {step === 'choose' && (
              <motion.div key="choose"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-2">
                {(Object.entries(statusConfig) as [RsvpStatus, typeof statusConfig[RsvpStatus]][]).map(([s, cfg]) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChoose(s)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 text-left font-black text-white transition shadow-lg ${cfg.glow}`}
                    style={{ background: s === 'Accepted' ? 'var(--color-gradient)'
                           : s === 'Maybe' ? 'linear-gradient(135deg,#d97706,#b45309)'
                           : 'linear-gradient(135deg,#dc2626,#b91c1c)' }}
                  >
                    <span className="text-2xl">{cfg.emoji}</span>
                    <span>{cfg.label}</span>
                    <span className="ml-auto opacity-70">→</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Form */}
            {step === 'form' && (
              <motion.form key="form" onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-3">

                <div className="flex items-center gap-2 mb-4">
                  <button type="button" onClick={() => setStep('choose')}
                    className="text-white/60 hover:text-white text-sm transition">← Back</button>
                  <span className="rounded-full px-3 py-1 text-xs font-black text-white"
                    style={{ background: status === 'Accepted' ? 'var(--color-primary)' : status === 'Maybe' ? '#d97706' : '#dc2626' }}>
                    {statusConfig[status].emoji} {status}
                  </span>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/20 border border-red-400/40 p-3 text-sm text-red-200">{error}</div>
                )}

                <input required placeholder="Your Name *"
                  value={guestName} onChange={e => setGuestName(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20 transition" />

                {status === 'Accepted' && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-white/70 flex-shrink-0">Guests attending:</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 font-bold transition">−</button>
                      <span className="text-white font-black text-lg w-6 text-center">{guestCount}</span>
                      <button type="button" onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 font-bold transition">+</button>
                    </div>
                  </div>
                )}

                <textarea placeholder="Leave a message for the host (optional)" rows={2}
                  value={message} onChange={e => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/50 transition resize-none" />

                <motion.button type="submit" disabled={loading || !guestName.trim()}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full rounded-2xl py-3.5 font-black text-white disabled:opacity-50 transition"
                  style={{ background: 'var(--color-gradient)' }}>
                  {loading ? '⏳ Submitting…' : `${statusConfig[status].emoji} Confirm RSVP`}
                </motion.button>
              </motion.form>
            )}

            {/* Step 3: Done */}
            {step === 'done' && (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="py-6 text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-6xl mb-4">
                  {statusConfig[status].emoji}
                </motion.div>
                <h4 className="text-xl font-black text-white mb-2">
                  {status === 'Accepted' ? 'See you there!' : status === 'Maybe' ? 'Hope to see you!' : "We'll miss you!"}
                </h4>
                <p className="text-sm text-white/70">
                  Thanks, <strong className="text-white">{guestName}</strong>! Your RSVP has been recorded.
                </p>
                {status === 'Accepted' && guestCount > 1 && (
                  <p className="mt-1 text-xs text-white/50">
                    Attending with {guestCount - 1} guest{guestCount > 2 ? 's' : ''}
                  </p>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default RsvpCard;
