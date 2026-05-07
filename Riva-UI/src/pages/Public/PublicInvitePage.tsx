import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicInvitationHtml } from '../../api/invitation';

/**
 * Renders a published invitation as a full-screen iframe.
 * Uses srcdoc (not blob URL) so the inline CSS loads correctly without
 * any cross-origin or Content-Security-Policy issues.
 */
const PublicInvitePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [srcDoc,  setSrcDoc]  = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPublicInvitationHtml(slug)
      .then(html => setSrcDoc(html))
      .catch(() => setError('This invitation was not found or is no longer available.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}
      className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-5xl animate-bounce mb-4">🌿</div>
        <p className="text-green-700 font-black text-lg">Loading your invitation…</p>
      </div>
    </div>
  );

  if (error || !srcDoc) return (
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

  return (
    <iframe
      srcDoc={srcDoc}
      className="w-full border-0"
      style={{ height: '100vh', display: 'block' }}
      title="Digital Invitation"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
};

export default PublicInvitePage;
