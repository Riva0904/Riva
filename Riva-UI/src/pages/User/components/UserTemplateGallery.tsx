import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTemplates, type TemplateListItem } from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';
import { getStoredAuthToken } from '../../../api/client';

const CATEGORY_EMOJI: Record<string, string> = {
  Birthday: '🎂', Marriage: '💍', Wedding: '💍',
  'First Holy Communion': '✝️', Anniversary: '💐',
  Engagement: '💍', Party: '🎉', Baby: '🍼', Event: '📅'
};
const emojiFor = (name: string) =>
  CATEGORY_EMOJI[name] ?? (name.includes('Birth') ? '🎂' : name.includes('Wed') ? '💍' : '🎉');

const UserTemplateGallery: React.FC = () => {
  const navigate  = useNavigate();
  const [templates,  setTemplates]  = useState<TemplateListItem[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [activeCat,  setActiveCat]  = useState<number | undefined>();
  const [filter,     setFilter]     = useState<'all' | 'free' | 'paid'>('all');
  const [loading,    setLoading]    = useState(true);
  const [preview,    setPreview]    = useState<TemplateListItem | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTemplates(activeCat, filter === 'all' ? undefined : filter === 'paid'),
      getCategories()
    ]).then(([tRes, cats]) => {
      setTemplates(tRes.templates);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [activeCat, filter]);

  const handleUseTemplate = (templateId: number) => {
    if (!getStoredAuthToken()) { navigate('/login'); return; }
    navigate(`/invitation/new/${templateId}`);
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button onClick={() => setActiveCat(undefined)}
          className={`rounded-full px-4 py-1.5 text-sm font-black transition ${
            !activeCat ? 'bg-green-primary text-white' : 'btn-green-outline px-4 py-1.5'}`}>
          All
        </button>
        {categories.map(c => (
          <button key={c.categoryId} onClick={() => setActiveCat(c.categoryId)}
            className={`rounded-full px-4 py-1.5 text-sm font-black transition ${
              activeCat === c.categoryId
                ? 'bg-green-primary text-white'
                : 'border-2 border-slate-200 text-slate-600 hover:border-green-300 hover:text-green-700'}`}>
            {emojiFor(c.name)} {c.name}
          </button>
        ))}

        <div className="ml-auto tab-switcher" style={{ marginBottom: 0, width: 'auto', padding: '2px' }}>
          {(['all', 'free', 'paid'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`tab-btn capitalize text-xs px-3 ${filter === f ? 'active' : ''}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-green-50" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-green-100 py-16 text-center bg-green-50">
          <p className="text-slate-400">No templates found. Admin will add some soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {templates.map(t => (
            <div key={t.templateId}
              className="group card-green rounded-2xl overflow-hidden cursor-pointer transition hover:-translate-y-1 duration-300"
              onClick={() => setPreview(t)}>

              <div className="relative bg-light-green flex h-36 items-center justify-center text-5xl">
                {t.previewImageUrl
                  ? <img src={t.previewImageUrl} alt={t.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  : <span className="relative z-10">{emojiFor(t.categoryName ?? '')}</span>
                }
                <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-black z-10 ${
                  t.isPaid ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {t.isPaid ? `$${t.price}` : 'Free'}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-black text-slate-800 group-hover:text-green-700 transition">{t.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{t.categoryName}</p>
                <button
                  onClick={e => { e.stopPropagation(); handleUseTemplate(t.templateId); }}
                  className="btn-green text-xs py-2">
                  {t.isPaid ? '🔒 Buy & Use' : '✨ Use Template'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreview(null)}>
          <div className="card-green w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>

            <div className="accent-bar" />
            <div className="bg-light-green flex h-40 items-center justify-center text-6xl">
              {preview.previewImageUrl
                ? <img src={preview.previewImageUrl} alt={preview.name}
                    className="w-full h-full object-cover" />
                : emojiFor(preview.categoryName ?? '')}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-black text-slate-900">{preview.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{preview.categoryName}</p>

              <div className="my-4 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-sm font-black ${
                  preview.isPaid ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {preview.isPaid ? `$${preview.price}` : '🆓 Free'}
                </span>
                <span className="text-xs text-slate-400">
                  Added {new Date(preview.createdDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUseTemplate(preview.templateId)}
                  className="btn-green flex-1">
                  {preview.isPaid ? '🔒 Buy & Use' : '✨ Use Template'}
                </button>
                <button onClick={() => setPreview(null)}
                  className="btn-green-outline flex-none px-4">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTemplateGallery;
