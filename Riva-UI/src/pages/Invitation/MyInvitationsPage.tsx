import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInvitations, type InvitationSummary } from '../../api/invitation';
import { getStoredAuthToken } from '../../api/client';

const MyInvitationsPage: React.FC = () => {
  const navigate  = useNavigate();
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    if (!getStoredAuthToken()) { navigate('/login'); return; }
    getMyInvitations()
      .then(setInvitations)
      .finally(() => setLoading(false));
  }, [navigate]);

  const filtered = invitations.filter(i =>
    filter === 'all' ? true : i.status.toLowerCase() === filter);

  const copyLink = (slug: string) =>
    navigator.clipboard.writeText(`${window.location.origin}/invite/${slug}`);

  return (
    <div className="bg-light-green min-h-screen">

      {/* Header */}
      <header className="dashboard-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-icon text-base">R</div>
            <span className="font-black text-slate-900">
              My <span className="text-green">Invitations</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="navbar-btn-outline text-sm">
              Browse Templates
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">

        {/* Filter tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2 border-b-2 border-green-100">
            {(['all', 'draft', 'published'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`page-tab capitalize ${filter === f ? 'active' : ''}`}>
                {f} {f === 'all' ? `(${invitations.length})` :
                     `(${invitations.filter(i => i.status.toLowerCase() === f).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="card-green rounded-2xl animate-pulse" style={{ height: 220 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="card-green p-12 text-center">
            <div className="otp-icon mx-auto mb-4" style={{ fontSize: '2.5rem' }}>🎉</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No invitations yet</h3>
            <p className="text-slate-500 mb-6">Browse templates and create your first digital invitation.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-green w-auto px-8 mx-auto">
              Browse Templates →
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(inv => (
              <div key={inv.invitationId} className="card-green rounded-2xl overflow-hidden group">

                {/* Thumbnail */}
                <div className="relative bg-green-50 overflow-hidden"
                  style={{ height: 140 }}>
                  {inv.thumbnailUrl ? (
                    <img src={inv.thumbnailUrl} alt={inv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl">🎉</div>
                  )}
                  <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-black ${
                    inv.status === 'Published'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-black text-slate-900 truncate">{inv.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-3">{inv.templateName}</p>

                  {inv.status === 'Published' && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                      <span>👁</span>
                      <span>{inv.viewCount} views</span>
                      <span className="mx-1">·</span>
                      <a href={`/invite/${inv.slug}`} target="_blank" rel="noreferrer"
                        className="text-green font-bold hover:underline truncate">
                        View live
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/invitation/${inv.invitationId}/edit`)}
                      className="flex-1 btn-green-outline text-xs py-2">
                      ✏️ Edit
                    </button>
                    {inv.status === 'Published' && (
                      <button onClick={() => copyLink(inv.slug)}
                        className="flex-1 btn-green text-xs py-2">
                        🔗 Copy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyInvitationsPage;
