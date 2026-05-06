import React, { useEffect, useState } from 'react';
import { getTemplates, type TemplateListItem } from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';

const TemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [filterCat, setFilterCat] = useState<number | undefined>();
  const [filterPaid, setFilterPaid] = useState<boolean | undefined>();
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, cats] = await Promise.all([
        getTemplates(filterCat, filterPaid),
        getCategories()
      ]);
      setTemplates(tRes.templates);
      setCategories(cats);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterCat, filterPaid]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400"
          value={filterCat ?? ''}
          onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
        </select>
        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400"
          value={filterPaid === undefined ? '' : String(filterPaid)}
          onChange={e => setFilterPaid(e.target.value === '' ? undefined : e.target.value === 'true')}>
          <option value="">Free & Paid</option>
          <option value="false">Free only</option>
          <option value="true">Paid only</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading…</div>
      ) : templates.length === 0 ? (
        <div className="py-12 text-center text-slate-400">No templates found. Add your first template!</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {templates.map(t => (
                <tr key={t.templateId} className="bg-white hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-400">#{t.templateId}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                  <td className="px-4 py-3 text-slate-600">{t.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.isPaid ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {t.isPaid ? 'Paid' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.isPaid && t.price ? `₹${t.price}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(t.createdDate).toLocaleDateString()}
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
