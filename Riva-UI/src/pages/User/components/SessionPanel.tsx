import React from 'react';
import { motion } from 'framer-motion';
import type { UserSession } from '../../../api/analysis';

interface Props { session: UserSession; }

const SessionPanel: React.FC<Props> = ({ session }) => {
  const joined    = new Date(session.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const lastLogin = session.lastLoginAt
    ? new Date(session.lastLoginAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'First session';
  const initials = session.username.charAt(0).toUpperCase();

  return (
    <div className="space-y-5">

      {/* Profile card */}
      <motion.div whileHover={{ y: -2 }}
        className="rounded-2xl overflow-hidden border-2 border-green-200">

        <div style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }} className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/25 text-2xl font-black text-white shadow">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-white leading-tight truncate">{session.username}</h2>
              <p className="text-sm text-green-200 truncate">{session.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
              session.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {session.role}
            </span>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-black text-green-700">
              🟢 Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white p-2.5">
              <p className="text-slate-400 font-bold">Member Since</p>
              <p className="font-black text-slate-700 mt-0.5 leading-tight">{joined}</p>
            </div>
            <div className="rounded-xl bg-white p-2.5">
              <p className="text-slate-400 font-bold">Last Login</p>
              <p className="font-black text-slate-700 mt-0.5 leading-tight">{lastLogin}</p>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Template library */}
      <div>
        <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">Platform Overview</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Free',  value: session.templates.free,  cls: 'bg-white border-2 border-green-100 text-green-700' },
            { label: 'Paid',  value: session.templates.paid,  cls: 'bg-white border-2 border-amber-100 text-amber-700' },
            { label: 'Total', value: session.templates.total, cls: 'bg-white border-2 border-slate-100 text-slate-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-3 text-center ${s.cls}`}>
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-xs font-bold mt-0.5 opacity-70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionPanel;

