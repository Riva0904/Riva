import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  getAdminTemplates, getTemplateById, updateTemplateStatus, updateTemplate,
  uploadTemplateImage, type TemplateListItem, type TemplateDetail, type TemplateTier,
} from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';
import MonthlyPoolModal from './MonthlyPoolModal';

import { API_ORIGIN } from '../../../api/client';

function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url.startsWith('/') ? `${API_ORIGIN}${url}` : url;
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal: React.FC<{
  templateId: number;
  categories: CategoryDto[];
  onSaved: () => void;
  onClose: () => void;
}> = ({ templateId, categories, onSaved, onClose }) => {
  const imgRef   = useRef<HTMLInputElement>(null);
  const [tab,    setTab]    = useState<'basic' | 'code' | 'schema'>('basic');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Separate state per field — explicit handlers, React Compiler safe
  const [name,          setName]          = useState('');
  const [description,   setDescription]   = useState('');
  const [categoryId,    setCategoryId]    = useState(0);
  const [tierType,      setTierType]      = useState<TemplateTier>('Free');
  const [price,         setPrice]         = useState('');
  const [templateHtml,  setTemplateHtml]  = useState('');
  const [templateCss,   setTemplateCss]   = useState('');
  const [templateJs,    setTemplateJs]    = useState('');
  const [schemaJson,    setSchemaJson]    = useState('[]');
  const [thumbnailUrl,  setThumbnailUrl]  = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  useEffect(() => {
    getTemplateById(templateId)
      .then((t: TemplateDetail) => {
        setName(t.name);
        setDescription(t.description ?? '');
        setCategoryId(t.categoryId);
        setTierType((t.tierType as TemplateTier) || 'Free');
        setPrice(t.price != null ? String(t.price) : '');
        setTemplateHtml(t.templateHtml ?? '');
        setTemplateCss(t.templateCss ?? '');
        setTemplateJs(t.templateJs ?? '');
        setSchemaJson(t.schemaJson ?? '[]');
        setThumbnailUrl(toAbsoluteUrl(t.thumbnailUrl));
        setPreviewImageUrl(toAbsoluteUrl(t.previewImageUrl));
      })
      .catch(() => setError('Failed to load template data'))
      .finally(() => setLoading(false));
  }, [templateId]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const res = await uploadTemplateImage(file);
      setThumbnailUrl(res.imageUrl);
      setPreviewImageUrl(res.imageUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Image upload failed');
    } finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const isPaid = tierType !== 'Free';
      await updateTemplate(templateId, {
        name,
        description: description || undefined,
        categoryId,
        isPaid,
        tierType,
        price: isPaid && price !== '' ? Number(price) : undefined,
        templateHtml,
        templateCss: templateCss || undefined,
        templateJs:  templateJs  || undefined,
        schemaJson,
        previewImageUrl: previewImageUrl || undefined,
        thumbnailUrl:    thumbnailUrl    || undefined,
      });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally { setSaving(false); }
  };

  const inp = 'w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all';
  const lbl = 'block text-sm font-black text-slate-700 mb-1.5';
  const tabCls = (t: string) =>
    `px-4 py-2 text-sm font-black rounded-t-xl border-b-2 transition ${
      tab === t
        ? 'border-green-600 text-green-700 bg-green-50'
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      {/* Modal — stop click propagation so backdrop click doesn't close while interacting */}
      <div
        className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-black text-slate-900">Edit Template #{templateId}</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 hover:bg-red-50 hover:border-red-300 text-slate-400 hover:text-red-500 transition font-black text-sm"
          >✕</button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-slate-400 font-semibold animate-pulse">Loading template…</p>
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="flex-1 overflow-y-auto"
            style={{ minHeight: 0 }}
          >
            <div className="p-6 space-y-5">

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex gap-2">
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 border-b-2 border-slate-100">
                <button type="button" className={tabCls('basic')}  onClick={() => setTab('basic')}>📋 Basic Info</button>
                <button type="button" className={tabCls('code')}   onClick={() => setTab('code')}>💻 HTML / CSS / JS</button>
                <button type="button" className={tabCls('schema')} onClick={() => setTab('schema')}>📐 Schema</button>
              </div>

              {/* ── Basic Info ── */}
              {tab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={lbl}>Template Name *</label>
                      <input
                        className={inp}
                        value={name}
                        required
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={lbl}>Category *</label>
                      <select
                        className={inp}
                        value={categoryId}
                        required
                        onChange={e => setCategoryId(Number(e.target.value))}
                      >
                        <option value={0}>Select category…</option>
                        {categories.map(c => (
                          <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={lbl}>Description</label>
                    <textarea
                      rows={2}
                      className={inp}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label className={lbl}>Template Image</label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 flex-shrink-0 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center bg-slate-50">
                        {thumbnailUrl
                          ? <img src={thumbnailUrl} alt="preview" className="h-full w-full object-cover" />
                          : <span className="text-2xl">🖼️</span>}
                      </div>
                      <div className="flex-1 space-y-2">
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => imgRef.current?.click()}
                          className="btn-green w-auto px-4 py-2 text-sm"
                          style={{ width: 'auto' }}
                        >
                          {uploading ? '⏳ Uploading…' : '📷 Upload Image'}
                        </button>
                        <p className="text-xs text-slate-400">JPG, PNG, WebP or GIF — max 10 MB</p>
                        {thumbnailUrl && (
                          <button
                            type="button"
                            onClick={() => { setThumbnailUrl(''); setPreviewImageUrl(''); }}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove image
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      ref={imgRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f);
                        e.target.value = '';
                      }}
                    />
                  </div>

                  {/* Tier selector */}
                  <div>
                    <label className={lbl}>Template Tier *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Free', 'Premium', 'Pro'] as TemplateTier[]).map(tier => {
                        const meta = {
                          Free:    { icon: '🆓', cls: 'border-green-400 bg-green-50 text-green-700',    desc: 'Text & quotes' },
                          Premium: { icon: '💎', cls: 'border-blue-400 bg-blue-50 text-blue-700',       desc: 'Images & animations' },
                          Pro:     { icon: '🚀', cls: 'border-purple-400 bg-purple-50 text-purple-700', desc: 'Map + all features' },
                        }[tier];
                        return (
                          <button key={tier} type="button"
                            onClick={() => setTierType(tier)}
                            className={`rounded-xl border-2 p-3 text-center transition ${
                              tierType === tier ? meta.cls + ' shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                            <p className="text-xl mb-1">{meta.icon}</p>
                            <p className="text-xs font-black">{tier}</p>
                            <p className="text-[10px] mt-0.5 opacity-70">{meta.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {tierType !== 'Free' && (
                    <div>
                      <label className={lbl}>Price (₹) *</label>
                      <input type="number" min={1} step={1}
                        placeholder={tierType === 'Pro' ? 'e.g. 299' : 'e.g. 149'}
                        value={price} onChange={e => setPrice(e.target.value)}
                        className={inp} required />
                    </div>
                  )}
                </div>
              )}

              {/* ── Code ── */}
              {tab === 'code' && (
                <div className="space-y-4">
                  <div>
                    <label className={lbl}>HTML *</label>
                    <textarea
                      rows={14}
                      className={`${inp} font-mono text-xs`}
                      value={templateHtml}
                      onChange={e => setTemplateHtml(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={lbl}>CSS</label>
                    <textarea
                      rows={10}
                      className={`${inp} font-mono text-xs`}
                      value={templateCss}
                      onChange={e => setTemplateCss(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={lbl}>JavaScript <span className="font-normal text-slate-400">(optional)</span></label>
                    <textarea
                      rows={4}
                      className={`${inp} font-mono text-xs`}
                      value={templateJs}
                      onChange={e => setTemplateJs(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* ── Schema ── */}
              {tab === 'schema' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                    <strong>Schema JSON</strong> — each field needs:&nbsp;
                    <code>key</code>, <code>label</code>, <code>type</code>&nbsp;
                    (text / textarea / date / image / color).
                  </div>
                  <textarea
                    rows={16}
                    className={`${inp} font-mono text-xs`}
                    value={schemaJson}
                    onChange={e => setSchemaJson(e.target.value)}
                    required
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Footer */}
              <div className="flex gap-3 pt-2 pb-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-green flex-1 py-3"
                >
                  {saving ? '⏳ Saving…' : '💾 Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>

            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Main TemplateList ─────────────────────────────────────────────────────────
const TemplateList: React.FC = () => {
  const [templates,  setTemplates]  = useState<TemplateListItem[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [filterCat,  setFilterCat]  = useState<number | undefined>();
  const [filterPaid, setFilterPaid] = useState<boolean | undefined>();
  const [loading,    setLoading]    = useState(true);
  const [toggling,   setToggling]   = useState<number | null>(null);
  const [editId,     setEditId]     = useState<number | null>(null);
  const [showPool,   setShowPool]   = useState(false);
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
        getCategories(),
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
      setTemplates(prev =>
        prev.map(x => x.templateId === t.templateId ? { ...x, status: next } : x)
      );
      showToast(`"${t.name}" is now ${next === 'Published' ? '✅ Published' : '📝 Draft'}`);
    } catch { showToast('Failed to update status'); }
    finally { setToggling(null); }
  };

  const stats = {
    total:     templates.length,
    published: templates.filter(t => t.status === 'Published').length,
    draft:     templates.filter(t => t.status === 'Draft').length,
    free:      templates.filter(t => t.tierType === 'Free').length,
    premium:   templates.filter(t => t.tierType === 'Premium').length,
    pro:       templates.filter(t => t.tierType === 'Pro').length,
  };

  return (
    <div className="relative">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}

      {/* Monthly pool modal */}
      {showPool && <MonthlyPoolModal onClose={() => setShowPool(false)} />}

      {/* Edit modal */}
      {editId !== null && (
        <EditModal
          templateId={editId}
          categories={categories}
          onSaved={() => { setEditId(null); load(); showToast('✅ Template saved!'); }}
          onClose={() => setEditId(null)}
        />
      )}

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[
          { label: 'Total',     value: stats.total,     color: 'bg-slate-50 text-slate-700' },
          { label: 'Published', value: stats.published, color: 'bg-green-50 text-green-700' },
          { label: 'Draft',     value: stats.draft,     color: 'bg-amber-50 text-amber-700' },
          { label: '🆓 Free',   value: stats.free,      color: 'bg-green-50 text-green-700' },
          { label: '💎 Premium',value: stats.premium,   color: 'bg-blue-50 text-blue-700' },
          { label: '🚀 Pro',    value: stats.pro,       color: 'bg-purple-50 text-purple-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-4 py-3 text-center ${s.color}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-semibold opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm outline-none focus:border-green-400"
          value={filterCat ?? ''}
          onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
        </select>
        <select
          className="rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm outline-none focus:border-green-400"
          value={filterPaid === undefined ? '' : String(filterPaid)}
          onChange={e => setFilterPaid(e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">Free & Paid</option>
          <option value="false">Free only</option>
          <option value="true">Paid only</option>
        </select>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowPool(true)}
            className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5"
          >
            🎯 Plan Manager
          </button>
          <button
            onClick={load}
            className="rounded-xl border-2 border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-100 transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
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
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {templates.map(t => (
                <tr key={t.templateId} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{t.templateId}</td>
                  <td className="px-4 py-3 font-black text-slate-800">{t.name}</td>
                  <td className="px-4 py-3 text-slate-600">{t.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                      t.tierType === 'Pro'     ? 'bg-purple-100 text-purple-700' :
                      t.tierType === 'Premium' ? 'bg-blue-100 text-blue-700'    :
                                                 'bg-green-100 text-green-700'}`}>
                      {t.tierType === 'Free' ? '🆓 Free' : t.tierType === 'Pro' ? `🚀 Pro ₹${t.price}` : `💎 Premium ₹${t.price}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                      t.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(t.createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditId(t.templateId)}
                        className="rounded-full px-3 py-1.5 text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        disabled={toggling === t.templateId}
                        onClick={() => toggleStatus(t)}
                        className={`rounded-full px-3 py-1.5 text-xs font-black transition disabled:opacity-40 ${
                          t.status === 'Published'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {toggling === t.templateId ? '⏳' : t.status === 'Published' ? 'Unpublish' : '🚀 Publish'}
                      </button>
                    </div>
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
