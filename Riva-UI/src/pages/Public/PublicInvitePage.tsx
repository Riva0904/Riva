import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPublicInvitationHtml, getPublicInvitationMeta } from '../../api/invitation';
import { API_ORIGIN } from '../../api/client';
import RsvpCard from '../../components/RsvpCard';
import ShareModal from '../../components/ShareModal';

const PublicInvitePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [srcDoc,       setSrcDoc]       = useState<string | null>(null);
  const [blobUrl,      setBlobUrl]      = useState('');
  const blobRef = useRef('');
  const [title,        setTitle]        = useState<string>('Digital Invitation');
  const [error,        setError]        = useState<string | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [showShare,    setShowShare]    = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      getPublicInvitationHtml(slug),
      getPublicInvitationMeta(slug).catch(() => null),
    ]).then(([html, meta]) => {
      const htmlWithBase = html.replace('<head>', `<head><base href="${API_ORIGIN}/">`);
      setSrcDoc(htmlWithBase);
      if (meta?.title) setTitle(meta.title);

      const t = meta?.title ?? 'Digital Invitation';
      document.title = `${t} — Riva Invitations`;
      const setMeta = (prop: string, content: string, attr = 'property') => {
        let el = document.querySelector(`meta[${attr}="${prop}"]`) as HTMLMetaElement | null;
        if (!el) { el = document.createElement('meta'); el.setAttribute(attr, prop); document.head.appendChild(el); }
        el.content = content;
      };
      const url = window.location.href;
      setMeta('og:type',        'website');
      setMeta('og:url',         url);
      setMeta('og:title',       t);
      setMeta('og:description', `You're invited! Open and RSVP to ${t} on Riva.`);
      setMeta('og:site_name',   'Riva Invitations');
      setMeta('twitter:card',   'summary', 'name');
      setMeta('twitter:title',  t,         'name');
      setMeta('twitter:description', `You're invited! RSVP to ${t}`, 'name');
    }).catch(() => setError('This invitation was not found or is no longer available.'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Blob URL gives the iframe a real origin so Google Maps / third-party embeds work
  useEffect(() => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    if (!srcDoc) { setBlobUrl(''); blobRef.current = ''; return; }
    const url = URL.createObjectURL(new Blob([srcDoc], { type: 'text/html' }));
    blobRef.current = url;
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [srcDoc]);

  if (loading) return (
    <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)' }}
      className="flex min-h-screen items-center justify-center">
      <motion.div className="text-center"
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-white/80 font-black text-xl">Loading your invitation…</p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="h-2 w-2 rounded-full bg-green-400"
              animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (error || !blobUrl) return (
    <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}
      className="flex min-h-screen items-center justify-center p-4">
      <div className="card-green p-10 text-center max-w-md">
        <div className="text-5xl mb-6">🌿</div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">Invitation Not Found</h1>
        <p className="text-slate-500 mb-6">{error}</p>
        <a href="/" className="btn-green">Back to Home →</a>
      </div>
    </div>
  );

  const publicUrl = window.location.href;

  return (
    <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)' }}
      className="min-h-screen">

      {/* Share + floating action bar */}
      <motion.div
        initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(16px)' }}>
        <span className="text-sm font-black text-white/80 truncate max-w-xs">{title}</span>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowShare(true)}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white transition"
            style={{ background: 'var(--color-gradient)' }}>
            🔗 Share
          </motion.button>
        </div>
      </motion.div>

      {/* Invitation iframe */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}>
        <iframe
          src={blobUrl}
          className="w-full border-0"
          style={{ minHeight: '80vh', display: 'block' }}
          title="Digital Invitation"
        />
      </motion.div>

      {/* RSVP card */}
      {slug && (
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a)' }} className="pb-12">
          <div className="text-center pt-8 pb-2">
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Respond to this invitation</p>
          </div>
          <RsvpCard slug={slug} hostName={title} />
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <ShareModal url={publicUrl} title={title} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
};

export default PublicInvitePage;
