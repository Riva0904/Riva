import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAdminTemplates, type TemplateListItem } from '../../../api/templates';
import { getAllUsers } from '../../../api/admin';

interface Stats {
  totalUsers: number;
  totalTemplates: number;
  freeTemplates: number;
  paidTemplates: number;
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

const AdminDashboard: React.FC = () => {
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getAdminTemplates(),
      getAllUsers(),
    ]).then(([tRes, uRes]) => {
      const tList = tRes.status === 'fulfilled' ? tRes.value.templates : [];
      const uList = uRes.status === 'fulfilled' ? uRes.value : [];
      setTemplates(tList.slice(0, 6));
      setStats({
        totalUsers:        uList.length,
        totalTemplates:    tList.length,
        freeTemplates:     tList.filter(t => !t.isPaid).length,
        paidTemplates:     tList.filter(t => t.isPaid).length,
        publishedTemplates: tList.filter(t => t.status === 'Published').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Welcome back, here's what's happening.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon="👥" label="Total Users"      value={stats?.totalUsers ?? 0}        color="bg-white border-2 border-blue-100"   delay={0} />
        <StatCard icon="🎨" label="Total Templates"  value={stats?.totalTemplates ?? 0}    color="bg-white border-2 border-green-100"  delay={0.06} />
        <StatCard icon="🆓" label="Free Templates"   value={stats?.freeTemplates ?? 0}     color="bg-white border-2 border-green-100"  delay={0.12} />
        <StatCard icon="💎" label="Paid Templates"   value={stats?.paidTemplates ?? 0}     color="bg-white border-2 border-amber-100"  delay={0.18} />
        <StatCard icon="🌐" label="Published"        value={stats?.publishedTemplates ?? 0} color="bg-white border-2 border-purple-100" delay={0.24} />
      </div>

      {/* Recent templates */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
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
                        {t.isPaid ? `$${t.price}` : 'Free'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${t.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(t.createdDate).toLocaleDateString('en-GB')}
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
