import React, { useEffect, useState, useCallback } from 'react';
import { getAdminTemplates, updateTemplateStatus, type TemplateListItem } from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';

const TemplateList: React.FC = () => {
  const [templates,  setTemplates]  = useState<TemplateListItem[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [filterCat,  setFilterCat]  = useState<number | undefined>();
  const [filterPaid, setFilterPaid] = useState<boolean | undefined>();
  const [loading,    setLoading]    = useState(true);
  const [toggling,   setToggling]   = useState<number | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, cats] = await Promise.all([
        getAdminTemplates(filterCat, filterPaid),
        getCategories()
      ]);
      setTemplates(tRes.templates);
      setCategories(cats);
    } finally { setLoading(false); }
  }, [filterCat, filterPaid]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (t: TemplateListItem) => {
    const next = t.status === 'Published' ? 'Draft' : 'Published';
    setToggling(t.templateId);
    try {
      await updateTemplateStatus(t.templateId, next);
      setTemplates(prev => prev.map(x =>
        x.templateId === t.templateId ? { ...x, status: next } : x));
      showToast(`"${t.name}" is now ${next === 'Published' ? '✅ Published' : '📝 Draft'}`);
    } catch { showToast('Failed to update status'); }
    finally { setToggling(null); }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Published: 'bg-green-100 text-green-700',
      Draft:     'bg-amber-100 text-amber-700',
      Archived:  'bg-slate-100 text-slate-500',
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${styles[status] ?? styles.Draft}`}>
        {status}
      </span>
    );
  };

  const stats = {
    total:     templates.length,
    published: templates.filter(t => t.status === 'Published').length,
    draft:     templates.filter(t => t.status === 'Draft').length,
  };

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total',     value: stats.total,     color: 'bg-slate-50  text-slate-700' },
          { label: 'Published', value: stats.published, color: 'bg-green-50  text-green-700' },
          { label: 'Draft',     value: stats.draft,     color: 'bg-amber-50  text-amber-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-4 py-3 text-center ${s.color}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-semibold opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select className="rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm outline-none focus:border-green-400"
          value={filterCat ?? ''}
          onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
        </select>
        <select className="rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm outline-none focus:border-green-400"
          value={filterPaid === undefined ? '' : String(filterPaid)}
          onChange={e => setFilterPaid(e.target.value === '' ? undefined : e.target.value === 'true')}>
          <option value="">Free & Paid</option>
          <option value="false">Free only</option>
          <option value="true">Paid only</option>
        </select>
        <button onClick={load} className="ml-auto rounded-xl border-2 border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-100 transition">
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-400">
          <p className="text-3xl mb-2">🎨</p>
          <p className="font-semibold">No templates yet — add your first one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-green-50">
          <table className="min-w-full text-sm">
            <thead className="bg-green-50 text-xs uppercase text-green-700">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {templates.map(t => (
                <tr key={t.templateId} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{t.templateId}</td>
                  <td className="px-4 py-3 font-black text-slate-800">{t.name}</td>
                  <td className="px-4 py-3 text-slate-600">{t.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${t.isPaid ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {t.isPaid ? `$${t.price}` : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{statusBadge(t.status)}</td>
                  <td className="px-4 py-3 text-slate-500">{t.isPaid && t.price ? `$${t.price}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(t.createdDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      disabled={toggling === t.templateId}
                      onClick={() => toggleStatus(t)}
                      className={`rounded-full px-3 py-1.5 text-xs font-black transition disabled:opacity-40 ${
                        t.status === 'Published'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}>
                      {toggling === t.templateId ? '⏳' : t.status === 'Published' ? 'Unpublish' : '🚀 Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TemplateList;
