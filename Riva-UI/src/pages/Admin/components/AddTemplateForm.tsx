import React, { useEffect, useRef, useState } from 'react';
import { addTemplate, uploadTemplateImage, type AddTemplatePayload } from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';

interface Props { onSuccess: () => void; }

const SAMPLE_HTML = `<div class="invite-card">
  <div class="invite-header">
    <h1 class="invite-title">{{title}}</h1>
    <p class="invite-subtitle">You're Invited!</p>
  </div>
  <div class="invite-body">
    <p class="invite-message">{{message}}</p>
    <div class="invite-details">
      <div class="detail-row">📅 <strong>Date:</strong> {{date}}</div>
      <div class="detail-row">📍 <strong>Venue:</strong> {{venue}}</div>
    </div>
  </div>
  <div class="invite-footer">
    <p>We look forward to celebrating with you!</p>
  </div>
</div>`;

const SAMPLE_CSS = `.invite-card {
  max-width: 560px; margin: 32px auto;
  font-family: 'Georgia', serif;
  background: linear-gradient(135deg, #faf5ff, #fff);
  border: 2px solid #7c3aed;
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(124,58,237,0.12);
}
.invite-header {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  padding: 32px; text-align: center;
}
.invite-title { color: #fff; font-size: 2rem; margin: 0; }
.invite-subtitle { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 1rem; }
.invite-body { padding: 28px 32px; }
.invite-message { color: #555; line-height: 1.8; font-size: 1.05rem; margin-bottom: 24px; }
.invite-details { background: #f5f3ff; border-radius: 12px; padding: 16px; }
.detail-row { padding: 6px 0; color: #4c1d95; font-size: 0.95rem; }
.invite-footer { text-align: center; padding: 16px; background: #f9f5ff; color: #6d28d9; font-size: 0.9rem; }`;

const SAMPLE_SCHEMA = `[
  {"key":"title","label":"Event Title","type":"text","required":true,"placeholder":"e.g. Sarah's Birthday Bash"},
  {"key":"message","label":"Personal Message","type":"textarea","required":true},
  {"key":"date","label":"Event Date","type":"date","required":true},
  {"key":"venue","label":"Venue","type":"text","required":true,"placeholder":"e.g. Grand Ballroom, New York"}
]`;

const AddTemplateForm: React.FC<Props> = ({ onSuccess }) => {
  const imgRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [form, setForm] = useState<AddTemplatePayload & { description: string; tags: string }>({
    name: '', description: '', categoryId: 0, isPaid: false, price: undefined,
    templateHtml: SAMPLE_HTML, templateCss: SAMPLE_CSS,
    templateJs: '', schemaJson: SAMPLE_SCHEMA,
    previewImageUrl: '', thumbnailUrl: '', tags: ''
  });
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab,       setTab]       = useState<'basic' | 'code' | 'schema'>('basic');

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadTemplateImage(file);
      set('thumbnailUrl', res.imageUrl);
      set('previewImageUrl', res.imageUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Image upload failed');
    } finally { setUploading(false); }
  };

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      const res = await addTemplate({
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        isPaid: form.isPaid,
        price: form.isPaid ? Number(form.price) : undefined,
        templateHtml: form.templateHtml,
        templateCss: form.templateCss,
        templateJs: form.templateJs,
        schemaJson: form.schemaJson,
        previewImageUrl: form.previewImageUrl,
        thumbnailUrl: form.thumbnailUrl,
        tags: form.tags,
      });
      setSuccess(`✅ Template #${res.templateId} published! Users can now use it.`);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add template');
    } finally { setLoading(false); }
  };

  const inp = "w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all";
  const lbl = "block text-sm font-black text-slate-700 mb-1.5";
  const tabCls = (t: string) => `px-4 py-2 text-sm font-black rounded-t-xl border-b-2 transition ${
    tab === t ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-slate-500 hover:text-slate-700'
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error   && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex gap-2"><span>⚠️</span>{error}</div>}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800 flex gap-2 font-semibold">
          <span>🎉</span>{success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-slate-100">
        <button type="button" className={tabCls('basic')}  onClick={() => setTab('basic')}>📋 Basic Info</button>
        <button type="button" className={tabCls('code')}   onClick={() => setTab('code')}>💻 HTML / CSS / JS</button>
        <button type="button" className={tabCls('schema')} onClick={() => setTab('schema')}>📐 Schema (Fields)</button>
      </div>

      {/* ── Basic Info ── */}
      {tab === 'basic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={lbl}>Template Name *</label>
              <input className={inp} value={form.name}
                onChange={e => set('name', e.target.value)} required placeholder="e.g. Classic Birthday Card" />
            </div>
            <div>
              <label className={lbl}>Category *</label>
              <select className={inp} value={form.categoryId}
                onChange={e => set('categoryId', Number(e.target.value))} required>
                <option value={0}>Select category…</option>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={lbl}>Description</label>
            <textarea rows={2} className={inp} value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief description shown in the gallery…" />
          </div>

          <div>
            <label className={lbl}>Template Image</label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="h-24 w-24 flex-shrink-0 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center bg-slate-50">
                {form.thumbnailUrl ? (
                  <img src={form.thumbnailUrl} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">🖼️</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button type="button" disabled={uploading}
                  onClick={() => imgRef.current?.click()}
                  className="btn-green w-auto px-4 py-2 text-sm" style={{ width: 'auto' }}>
                  {uploading ? '⏳ Uploading…' : '📷 Upload Image'}
                </button>
                <p className="text-xs text-slate-400">JPG, PNG, WebP or GIF — max 10 MB</p>
                {form.thumbnailUrl && (
                  <button type="button" onClick={() => { set('thumbnailUrl', ''); set('previewImageUrl', ''); }}
                    className="text-xs text-red-500 hover:underline">Remove image</button>
                )}
              </div>
            </div>
            <input ref={imgRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
          </div>

          <div>
            <label className={lbl}>Tags <span className="font-normal text-slate-400">(comma-separated)</span></label>
            <input className={inp} value={form.tags}
              onChange={e => set('tags', e.target.value)} placeholder="birthday, celebration, fun" />
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.isPaid}
                onChange={e => set('isPaid', e.target.checked)}
                className="h-4 w-4 rounded accent-green-600" />
              <span className="text-sm font-black text-slate-700">Paid Template</span>
            </label>
            {form.isPaid && (
              <div className="flex-1">
                <input type="number" min={1} step={0.01} placeholder="Price ($)"
                  value={form.price ?? ''} onChange={e => set('price', e.target.value)}
                  className={inp} required />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Code ── */}
      {tab === 'code' && (
        <div className="space-y-4">
          <div>
            <label className={lbl}>HTML * <span className="font-normal text-slate-400">Use {"{{fieldKey}}"} placeholders</span></label>
            <textarea rows={12} className={`${inp} font-mono text-xs`}
              value={form.templateHtml} onChange={e => set('templateHtml', e.target.value)} required />
          </div>
          <div>
            <label className={lbl}>CSS <span className="font-normal text-slate-400">(styles for your template)</span></label>
            <textarea rows={10} className={`${inp} font-mono text-xs`}
              value={form.templateCss} onChange={e => set('templateCss', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>JavaScript <span className="font-normal text-slate-400">(optional, e.g. countdown timers)</span></label>
            <textarea rows={4} className={`${inp} font-mono text-xs`}
              value={form.templateJs} onChange={e => set('templateJs', e.target.value)}
              placeholder="// Optional — animations, countdown, etc." />
          </div>
        </div>
      )}

      {/* ── Schema ── */}
      {tab === 'schema' && (
        <div className="space-y-3">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
            <strong>Schema JSON</strong> defines which fields users fill in. Each field needs: <code>key</code>, <code>label</code>, <code>type</code> (text/textarea/date/image/color), and optional <code>required</code>.
          </div>
          <textarea rows={14} className={`${inp} font-mono text-xs`}
            value={form.schemaJson} onChange={e => set('schemaJson', e.target.value)} required />
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700">
        <span>🚀</span>
        <span>Templates are <strong>immediately published</strong> and visible to all users when you submit.</span>
      </div>

      <button type="submit" disabled={loading}
        className="btn-green w-full py-4 text-base">
        {loading ? '⏳ Publishing template…' : '🚀 Publish Template'}
      </button>
    </form>
  );
};

export default AddTemplateForm;
