import React, { useEffect, useState } from 'react';
import { getTemplates, type TemplateListItem } from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';

const UserTemplateGallery: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [activeCat, setActiveCat] = useState<number | undefined>();
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<TemplateListItem | null>(null);

  useEffect(() => {
    Promise.all([
      getTemplates(activeCat, filter === 'all' ? undefined : filter === 'paid'),
      getCategories()
    ]).then(([tRes, cats]) => {
      setTemplates(tRes.templates);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [activeCat, filter]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Category pills */}
        <button onClick={() => setActiveCat(undefined)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${!activeCat ? 'bg-purple-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-purple-300'}`}>
          All
        </button>
        {categories.map(c => (
          <button key={c.categoryId} onClick={() => setActiveCat(c.categoryId)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${activeCat === c.categoryId ? 'bg-purple-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-purple-300'}`}>
            {c.name} <span className="opacity-60">({c.templateCount})</span>
          </button>
        ))}

        {/* Free/Paid toggle */}
        <div className="ml-auto flex rounded-xl border border-slate-200 p-0.5">
          {(['all', 'free', 'paid'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${filter === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-400">No templates found. Admin will add some soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {templates.map(t => (
            <div key={t.templateId}
              onClick={() => setPreview(t)}
              className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md">
              {/* Preview image or placeholder */}
              <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-slate-50 text-4xl">
                {t.categoryName === 'Birthday' ? '🎂' : t.categoryName === 'Marriage' ? '💍' : '✝️'}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-purple-700">{t.name}</h3>
                  <p className="text-xs text-slate-400">{t.categoryName}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${t.isPaid ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {t.isPaid ? `₹${t.price}` : 'Free'}
                </span>
              </div>
              <button className="mt-3 w-full rounded-full border border-purple-200 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50">
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPreview(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-slate-50 text-5xl">
              {preview.categoryName === 'Birthday' ? '🎂' : preview.categoryName === 'Marriage' ? '💍' : '✝️'}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{preview.name}</h3>
            <p className="text-sm text-slate-500">{preview.categoryName}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${preview.isPaid ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                {preview.isPaid ? `₹${preview.price}` : 'Free'}
              </span>
              <span className="text-xs text-slate-400">{new Date(preview.createdDate).toLocaleDateString()}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-full bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700">
                {preview.isPaid ? 'Buy & Use' : 'Use Free'}
              </button>
              <button onClick={() => setPreview(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTemplateGallery;
