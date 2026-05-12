import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  url: string;
  title: string;
  onClose: () => void;
}

const ShareModal: React.FC<Props> = ({ url, title, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`🎉 You're invited!\n\n${title}\n\n${url}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`You're invited: ${title}`);
    const body    = encodeURIComponent(`Hi there!\n\nYou are cordially invited.\n\nOpen your invitation here:\n${url}\n\nLooking forward to seeing you! 🎉`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`You're invited! ${title} 🎉`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareSms = () => {
    const msg = encodeURIComponent(`🎉 You're invited to ${title}! Open here: ${url}`);
    window.open(`sms:?body=${msg}`);
  };

  const shareTelegram = () => {
    const msg = encodeURIComponent(`🎉 You're invited: ${title}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${msg}`, '_blank');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `You're invited: ${title}`, url });
      } catch { /* user cancelled */ }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}>

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', bounce: 0.35 }}
          className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ background: 'var(--color-gradient)' }} className="px-6 py-5 text-center">
            <p className="text-sm font-bold text-green-100 mb-1">Share this invitation</p>
            <h3 className="text-lg font-black text-white truncate">{title}</h3>
          </div>

          <div className="p-6 space-y-5">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-2xl border-4 border-green-100 p-3 bg-white shadow-sm">
                <QRCodeSVG
                  value={url}
                  size={160}
                  level="H"
                  fgColor="var(--color-primary-text)"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: '',
                    height: 0,
                    width: 0,
                    excavate: false,
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 font-medium">Scan to open on mobile</p>
            </div>

            {/* Copy link */}
            <div className="flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-slate-50 p-3">
              <p className="flex-1 truncate text-xs text-slate-500 font-mono">{url}</p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={copyLink}
                className="flex-shrink-0 rounded-xl px-3 py-2 text-xs font-black text-white transition"
                style={{ background: copied ? 'var(--color-primary)' : 'var(--color-gradient)' }}>
                {copied ? '✓ Copied!' : '🔗 Copy'}
              </motion.button>
            </div>

            {/* Share buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'WhatsApp', icon: '📱', color: '#25D366',                          fn: shareWhatsApp },
                { label: 'Telegram', icon: '✈️',  color: '#229ED9',                          fn: shareTelegram },
                { label: 'SMS',      icon: '💬',  color: '#6366f1',                          fn: shareSms      },
                { label: 'Email',    icon: '📧',  color: 'linear-gradient(135deg,#3b82f6,#2563eb)', fn: shareEmail },
                { label: 'Twitter',  icon: '🐦',  color: '#1DA1F2',                          fn: shareTwitter  },
                { label: 'Facebook', icon: '📘',  color: '#1877F2',                          fn: shareFacebook },
              ].map(s => (
                <motion.button key={s.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={s.fn}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-xs font-black text-white transition"
                  style={{ background: s.color }}>
                  <span className="text-lg">{s.icon}</span>
                  {s.label}
                </motion.button>
              ))}
            </div>

            {/* Native share (mobile) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={nativeShare}
                className="w-full rounded-2xl border-2 border-slate-200 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition">
                📤 Share via…
              </motion.button>
            )}

            <button onClick={onClose}
              className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition pt-1">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal;
