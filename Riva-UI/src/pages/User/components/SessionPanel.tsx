import React from 'react';
import type { UserSession } from '../../../api/analysis';

interface Props {
  session: UserSession;
}

const SessionPanel: React.FC<Props> = ({ session }) => {
  const joined = new Date(session.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const lastLogin = session.lastLoginAt
    ? new Date(session.lastLoginAt).toLocaleString('en-IN')
    : 'First session';

  const stats = [
    { label: 'Free Templates', value: session.templates.free, color: 'bg-green-50 text-green-700' },
    { label: 'Paid Templates', value: session.templates.paid, color: 'bg-amber-50 text-amber-700' },
    { label: 'Total Templates', value: session.templates.total, color: 'bg-purple-50 text-purple-700' },
    { label: 'Categories', value: session.categories.length, color: 'bg-blue-50 text-blue-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-purple-50 to-slate-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 text-2xl font-bold text-white">
            {session.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{session.username}</h2>
            <p className="text-sm text-slate-500">{session.email}</p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
              session.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {session.role}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-sm">
          <div>
            <p className="text-slate-400">Member since</p>
            <p className="font-medium text-slate-700">{joined}</p>
          </div>
          <div>
            <p className="text-slate-400">Last login</p>
            <p className="font-medium text-slate-700">{lastLogin}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Platform Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories breakdown */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Templates by Category</h3>
        <div className="space-y-2">
          {session.categories.map(cat => (
            <div key={cat.categoryId} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3">
              <span className="font-medium text-slate-700">{cat.name}</span>
              <div className="flex gap-2 text-xs">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">{cat.freeCount} Free</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">{cat.paidCount} Paid</span>
              </div>
            </div>
          ))}
          {session.categories.length === 0 && (
            <p className="text-sm text-slate-400">No categories yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionPanel;
