import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recordPurchase, recordSubscription } from '../api/subscriptions';
import type { TemplateListItem } from '../api/templates';

// Load Razorpay script dynamically
function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Pricing constants ─────────────────────────────────────────────────────────
export const PLANS = {
  Paid: {
    monthly: { amount: 799,  label: '30 Paid templates / month', cycle: 'Monthly' },
    yearly:  { amount: 2499, label: 'Unlimited Paid templates / year', cycle: 'Yearly' },
  },
  Pro: {
    monthly: { amount: 1499, label: '30 Pro templates / month', cycle: 'Monthly' },
    yearly:  { amount: 3499, label: 'Unlimited Pro templates / year', cycle: 'Yearly' },
  },
};

interface Props {
  template: TemplateListItem;
  onClose: () => void;
  onSuccess: (templateId: number) => void;
  razorpayKey?: string;
}

type OptionType = 'single' | 'monthly' | 'yearly';

const TemplatePaymentModal: React.FC<Props> = ({ template, onClose, onSuccess, razorpayKey = '' }) => {
  const [selected, setSelected] = useState<OptionType>('single');
  const [paying,   setPaying]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const tier     = template.tierType as 'Paid' | 'Pro';
  const price    = template.price ?? (tier === 'Pro' ? 149 : 79);
  const planSet  = PLANS[tier] ?? PLANS.Paid;

  const options: { key: OptionType; icon: string; title: string; amount: number; desc: string; badge?: string }[] = [
    { key: 'single',  icon: '🎯', title: 'This template only',   amount: price,               desc: `Pay once, use forever — only this template`, badge: 'One-time' },
    { key: 'monthly', icon: '📅', title: `${tier} Monthly Plan`, amount: planSet.monthly.amount, desc: planSet.monthly.label,                     badge: '30 templates' },
    { key: 'yearly',  icon: '⭐', title: `${tier} Yearly Plan`,  amount: planSet.yearly.amount,  desc: planSet.yearly.label,                      badge: 'Best value' },
  ];

  const handlePay = async () => {
    setError(null);
    const loaded = await loadRazorpay();
    if (!loaded) { setError('Payment gateway unavailable. Please try again.'); return; }

    const opt   = options.find(o => o.key === selected)!;
    const amtPaise = opt.amount * 100;

    setPaying(true);
    try {
      // Open Razorpay checkout (key-only mode — no server order needed for demo)
      const rzp = new (window as any).Razorpay({
        key:         razorpayKey || 'rzp_test_placeholder',
        amount:      amtPaise,
        currency:    'INR',
        name:        'Riva Invitations',
        description: opt.title,
        prefill:     {},
        theme:       { color: '#16a34a' },
        handler: async (response: any) => {
          try {
            const pid = response.razorpay_payment_id;
            if (selected === 'single') {
              await recordPurchase(template.templateId, opt.amount, pid);
            } else {
              await recordSubscription(tier, selected === 'monthly' ? 'Monthly' : 'Yearly', pid);
            }
            onSuccess(template.templateId);
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to record payment');
          } finally { setPaying(false); }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch {
      setPaying(false);
      setError('Could not open payment window. Check Razorpay key.');
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);
  const tierColor = tier === 'Pro'
    ? 'bg-purple-100 text-purple-700'
    : 'bg-blue-100 text-blue-700';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1,   opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${tierColor}`}>
                    {tier === 'Pro' ? '🚀 Pro' : '💎 Premium'}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 truncate">{template.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{template.categoryName}</p>
              </div>
              <button onClick={onClose}
                className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition font-black text-sm">
                ✕
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            <p className="text-sm font-black text-slate-600 mb-4">Choose your access plan:</p>

            {options.map(opt => (
              <button key={opt.key} type="button"
                onClick={() => setSelected(opt.key)}
                className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                  selected === opt.key
                    ? 'border-green-500 bg-green-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{opt.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-black text-slate-900">₹{fmt(opt.amount)}</p>
                    <span className={`text-[10px] font-black rounded-full px-2 py-0.5 ${
                      opt.key === 'yearly' ? 'bg-amber-100 text-amber-700' :
                      opt.key === 'monthly' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{opt.badge}</span>
                  </div>
                </div>
                {opt.key === 'yearly' && (
                  <p className="mt-2 text-[11px] text-green-700 font-black">
                    💡 Save ₹{fmt(planSet.monthly.amount * 12 - planSet.yearly.amount)} vs monthly
                  </p>
                )}
              </button>
            ))}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handlePay}
              disabled={paying}
              className="btn-green w-full py-4 text-base mt-2"
            >
              {paying ? '⏳ Opening payment…' : `Pay ₹${fmt(options.find(o => o.key === selected)!.amount)} →`}
            </motion.button>

            <p className="text-center text-xs text-slate-400">
              🔒 Secured by Razorpay · Instant activation
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TemplatePaymentModal;
