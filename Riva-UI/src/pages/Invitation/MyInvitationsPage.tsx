import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyInvitations, type InvitationSummary } from '../../api/invitation';
import { getRsvpSummary, type RsvpSummary } from '../../api/rsvp';
import { getStoredAuthToken } from '../../api/client';
import ShareModal from '../../components/ShareModal';

const MyInvitationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState<'all' | 'draft' | 'published'>('all');
  const [shareInv,    setShareInv]    = useState<InvitationSummary | null>(null);
  const [rsvpData,    setRsvpData]    = useState<Record<number, RsvpSummary>>({});
  const [expandedId,  setExpandedId]  = useState<number | null>(null);

  useEffect(() => {
    if (!getStoredAuthToken()) { navigate('/login'); return; }
    getMyInvitations().then(setInvitations).finally(() => setLoading(false));
  }, [navigate]);

  const loadRsvp = async (inv: InvitationSummary) => {
    if (inv.status !== 'Published') return;
    const id = inv.invitationId;
    if (rsvpData[id]) {
      setExpandedId(expandedId === id ? null : id);
      return;
    }
    try {
      const data = await getRsvpSummary(id);
      setRsvpData(prev => ({ ...prev, [id]: data }));
      setExpandedId(id);
    } catch { /* ignore */ }
  };

  const filtered = invitations.filter(i =>
    filter === 'all' ? true : i.status.toLowerCase() === filter);

  const stats = {
    total:     invitations.length,
    published: invitations.filter(i => i.status === 'Published').length,
    draft:     invitations.filter(i => i.status === 'Draft').length,
    views:     invitations.reduce((s, i) => s + i.viewCount, 0),
  };

  return (
    <div className="bg-light-green min-h-screen">

      {shareInv && (
        <ShareModal
          url={`${window.location.origin}/invite/${shareInv.slug}`}
          title={shareInv.title}
          onClose={() => setShareInv(null)}
        />
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-icon text-base">R</div>
            <span className="font-black text-slate-900">My <span className="text-green">Invitations</span></span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="navbar-btn-outline text-sm">
            + New Invitation
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 space-y-6">

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total',     value: stats.total,     icon: '🎉', color: 'bg-white' },
            { label: 'Published', value: stats.published, icon: '🌐', color: 'bg-green-50' },
            { label: 'Draft',     value: stats.draft,     icon: '📝', color: 'bg-amber-50' },
            { label: 'Views',     value: stats.views,     icon: '👁', color: 'bg-blue-50' },
          ].map(s => (
            <motion.div key={s.label} whileHover={{ y: -2 }}
              className={`rounded-2xl p-4 shadow-sm border-2 border-green-50 ${s.color}`}>
              <p className="text-2xl">{s.icon}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
              <p className="text-xs font-bold text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b-2 border-green-100">
          {(['all', 'draft', 'published'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`page-tab capitalize ${filter === f ? 'active' : ''}`}>
              {f} ({f === 'all' ? invitations.length : invitations.filter(i => i.status.toLowerCase() === f).length})
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="card-green rounded-2xl overflow-hidden animate-pulse">
                <div className="h-36 bg-green-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded-full w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card-green p-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No invitations yet</h3>
            <p className="text-slate-500 mb-6">Browse templates and create your first digital invitation.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-green w-auto px-8 mx-auto">
              Browse Templates →
            </button>
          </motion.div>
        )}

        {/* Invitation cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((inv, idx) => {
                const rsvp = rsvpData[inv.invitationId];
                const isExpanded = expandedId === inv.invitationId;

                return (
                  <motion.div key={inv.invitationId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.06 }}
                    className="card-green rounded-2xl overflow-hidden group">

                    {/* Thumbnail */}
                    <div className="relative bg-light-green overflow-hidden" style={{ height: 140 }}>
                      {inv.thumbnailUrl ? (
                        <img src={inv.thumbnailUrl} alt={inv.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-5xl">🎉</div>
                      )}
                      <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-black ${
                        inv.status === 'Published' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>{inv.status}</span>
                      {inv.status === 'Published' && (
                        <span className="absolute top-3 left-3 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white font-bold">
                          👁 {inv.viewCount}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-black text-slate-900 truncate">{inv.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{inv.templateName}</p>
                      </div>

                      {/* RSVP expand */}
                      {inv.status === 'Published' && (
                        <div>
                          <button onClick={() => loadRsvp(inv)}
                            className="w-full rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-xs font-black text-green-700 hover:bg-green-100 transition text-left flex items-center justify-between">
                            <span>📊 RSVP Responses</span>
                            <span>{isExpanded ? '▲' : '▼'}</span>
                          </button>

                          <AnimatePresence>
                            {isExpanded && rsvp && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden">
                                <div className="grid grid-cols-3 gap-1 mt-2">
                                  {[
                                    { label: '✅ Accept', value: rsvp.accepted,  color: 'bg-green-100 text-green-700' },
                                    { label: '❌ Decline', value: rsvp.declined, color: 'bg-red-100 text-red-700' },
                                    { label: '🤔 Maybe',  value: rsvp.maybe,    color: 'bg-amber-100 text-amber-700' },
                                  ].map(s => (
                                    <div key={s.label} className={`rounded-lg p-1.5 text-center ${s.color}`}>
                                      <p className="text-lg font-black">{s.value}</p>
                                      <p className="text-xs">{s.label}</p>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-1 text-center">
                                  {rsvp.totalGuests} total guests attending
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/invitation/${inv.invitationId}/edit`)}
                          className="flex-1 btn-green-outline text-xs py-2">
                          ✏️ Edit
                        </button>
                        {inv.status === 'Published' && (
                          <button onClick={() => setShareInv(inv)}
                            className="flex-1 btn-green text-xs py-2">
                            🔗 Share
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyInvitationsPage;
