import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAdminTemplates, type TemplateListItem } from '../../../api/templates';
import { getAllUsers, getAdminPaymentStats, type PaymentAdminRecord, type AdminPaymentStats } from '../../../api/admin';

interface Stats {
  totalUsers: number;
  totalTemplates: number;
  freeTemplates: number;
  premiumTemplates: number;
  proTemplates: number;
  publishedTemplates: number;
}

const StatCard: React.FC<{ icon: string; label: string; value: number | string; color: string; delay?: number }> = ({
  icon, label, value, color, delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`rounded-2xl p-5 shadow-sm ${color}`}>
    <p className="text-3xl mb-2">{icon}</p>
    <p className="text-3xl font-black text-slate-900">{value}</p>
    <p className="text-sm font-bold text-slate-500 mt-0.5">{label}</p>
  </motion.div>
);

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

// ── Monthly bar chart (SVG, no external library) ─────────────────────────────
const PaymentChart: React.FC<{ payments: PaymentAdminRecord[] }> = ({ payments }) => {
  const completed = payments.filter(p => p.status === 'Completed');

  // Build last-6-months buckets
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
      total: 0,
    };
  });

  completed.forEach(p => {
    const d = new Date(p.transactionDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = months.find(m => m.key === key);
    if (bucket) bucket.total += p.amount;
  });

  const maxVal = Math.max(...months.map(m => m.total), 1);
  const W = 480, H = 160, BAR_W = 48, GAP = 32;
  const totalWidth = months.length * (BAR_W + GAP);
  const offsetX = (W - totalWidth) / 2;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 40}`} className="w-full max-w-lg mx-auto">
        {months.map((m, i) => {
          const barH = Math.max(4, (m.total / maxVal) * H);
          const x = offsetX + i * (BAR_W + GAP);
          const y = H - barH;
          return (
            <g key={m.key}>
              <rect x={x} y={y} width={BAR_W} height={barH}
                rx={6} fill={m.total > 0 ? '#16a34a' : '#e2e8f0'} opacity={0.85} />
              {m.total > 0 && (
                <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle"
                  fontSize="9" fontWeight="bold" fill="#15803d">
                  ₹{m.total >= 1000 ? `${(m.total / 1000).toFixed(1)}k` : m.total}
                </text>
              )}
              <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle"
                fontSize="10" fill="#64748b" fontWeight="600">
                {m.label}
              </text>
            </g>
          );
        })}
        <line x1={offsetX - 8} y1={H} x2={offsetX + totalWidth + 8} y2={H}
          stroke="#e2e8f0" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    Completed: 'bg-green-100 text-green-700',
    Pending:   'bg-amber-100 text-amber-700',
    Failed:    'bg-red-100 text-red-700',
    Cancelled: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${colors[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const [stats,       setStats]       = useState<Stats | null>(null);
  const [templates,   setTemplates]   = useState<TemplateListItem[]>([]);
  const [payStats,    setPayStats]    = useState<AdminPaymentStats | null>(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getAdminTemplates(),
      getAllUsers(),
      getAdminPaymentStats(),
    ]).then(([tRes, uRes, pRes]) => {
      const tList = tRes.status === 'fulfilled' ? tRes.value.templates : [];
      const uList = uRes.status === 'fulfilled' ? uRes.value : [];

      // Only count verified, active, non-admin users
      const validUsers = uList.filter(u => u.isVerified && u.isActive && u.role !== 'Admin');

      setTemplates(tList.slice(0, 6));
      setStats({
        totalUsers:         validUsers.length,
        totalTemplates:     tList.length,
        freeTemplates:      tList.filter(t => t.tierType === 'Free').length,
        premiumTemplates:   tList.filter(t => t.tierType === 'Premium').length,
        proTemplates:       tList.filter(t => t.tierType === 'Pro').length,
        publishedTemplates: tList.filter(t => t.status === 'Published').length,
      });

      if (pRes.status === 'fulfilled') setPayStats(pRes.value);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-28 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Welcome back, here's what's happening.</p>
      </div>

      {/* User + template stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon="👥" label="Active Users"    value={stats?.totalUsers ?? 0}          color="bg-white border-2 border-blue-100"   delay={0} />
        <StatCard icon="🎨" label="Total Templates" value={stats?.totalTemplates ?? 0}      color="bg-white border-2 border-slate-100"  delay={0.05} />
        <StatCard icon="🆓" label="Free"            value={stats?.freeTemplates ?? 0}       color="bg-white border-2 border-green-100"  delay={0.10} />
        <StatCard icon="💎" label="Premium"         value={stats?.premiumTemplates ?? 0}    color="bg-white border-2 border-blue-100"   delay={0.15} />
        <StatCard icon="🚀" label="Pro"             value={stats?.proTemplates ?? 0}        color="bg-white border-2 border-purple-100" delay={0.20} />
        <StatCard icon="🌐" label="Published"       value={stats?.publishedTemplates ?? 0}  color="bg-white border-2 border-amber-100"  delay={0.25} />
      </div>

      {/* Payment stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon="💰" label="Total Revenue (₹)"   value={`₹${fmt(payStats?.totalAmount ?? 0)}`}       color="bg-white border-2 border-emerald-200" delay={0.3} />
        <StatCard icon="🧾" label="Total Payments"      value={payStats?.totalPayments ?? 0}                color="bg-white border-2 border-sky-100"     delay={0.36} />
        <StatCard icon="✅" label="Completed Payments"  value={payStats?.completedPayments ?? 0}            color="bg-white border-2 border-green-100"   delay={0.42} />
      </div>

      {/* Category breakdown */}
      {templates.length > 0 && (() => {
        const catMap: Record<string, { free: number; premium: number; pro: number; total: number }> = {};
        templates.forEach(t => {
          const c = t.categoryName || 'Uncategorised';
          if (!catMap[c]) catMap[c] = { free: 0, premium: 0, pro: 0, total: 0 };
          catMap[c].total++;
          if (t.tierType === 'Premium') catMap[c].premium++;
          else if (t.tierType === 'Pro') catMap[c].pro++;
          else catMap[c].free++;
        });
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
            className="card-green p-5">
            <h2 className="text-lg font-black text-slate-900 mb-4">Templates by Category</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-green-100">
                    {['Category', 'Total', '🆓 Free', '💎 Premium', '🚀 Pro'].map(h => (
                      <th key={h} className="pb-3 text-left text-xs font-black text-slate-400 uppercase tracking-wide pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-50">
                  {Object.entries(catMap).map(([cat, counts]) => (
                    <tr key={cat} className="hover:bg-green-50/50 transition">
                      <td className="py-2.5 pr-4 font-black text-slate-800">{cat}</td>
                      <td className="py-2.5 pr-4 font-bold text-slate-600">{counts.total}</td>
                      <td className="py-2.5 pr-4"><span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-black">{counts.free}</span></td>
                      <td className="py-2.5 pr-4"><span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-black">{counts.premium}</span></td>
                      <td className="py-2.5 pr-4"><span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-xs font-black">{counts.pro}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      })()}

      {/* Payment chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
        className="card-green p-5">
        <h2 className="text-lg font-black text-slate-900 mb-4">Monthly Revenue (₹)</h2>
        {payStats && payStats.payments.length > 0 ? (
          <PaymentChart payments={payStats.payments} />
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">💰</p>
            <p className="font-semibold">No payment data yet</p>
          </div>
        )}
      </motion.div>

      {/* Payment details table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}
        className="card-green p-5">
        <h2 className="text-lg font-black text-slate-900 mb-4">Payment Details</h2>
        {!payStats || payStats.payments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">🧾</p>
            <p className="font-semibold">No payments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-green-100">
                  {['#', 'User', 'Email', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-black text-slate-400 uppercase tracking-wide pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {payStats.payments.map((p, i) => (
                  <motion.tr key={p.id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                    className="hover:bg-green-50/50 transition">
                    <td className="py-3 pr-4 text-slate-400 font-bold">#{p.id}</td>
                    <td className="py-3 pr-4 font-black text-slate-800">{p.username}</td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{p.email}</td>
                    <td className="py-3 pr-4 font-black text-emerald-700">
                      ₹{fmt(p.amount)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(p.transactionDate).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Recent templates */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="card-green p-5">
        <h2 className="text-lg font-black text-slate-900 mb-4">Recent Templates</h2>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">🎨</p>
            <p className="font-semibold">No templates yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-green-100">
                  {['ID', 'Name', 'Category', 'Type', 'Status', 'Created'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-black text-slate-400 uppercase tracking-wide pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {templates.map((t, i) => (
                  <motion.tr key={t.templateId} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                    className="hover:bg-green-50/50 transition">
                    <td className="py-3 pr-4 text-slate-400 font-bold">#{t.templateId}</td>
                    <td className="py-3 pr-4 font-black text-slate-800">{t.name}</td>
                    <td className="py-3 pr-4 text-slate-500">{t.categoryName}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${t.isPaid ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {t.isPaid ? `₹${t.price}` : 'Free'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${t.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(t.createdDate).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default AdminDashboard;
