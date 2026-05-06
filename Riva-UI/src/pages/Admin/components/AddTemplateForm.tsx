import React, { useEffect, useState } from 'react';
import { addTemplate, type AddTemplatePayload } from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';

interface Props {
  onSuccess: () => void;
}

const SAMPLE_HTML = `<div class="invite-card">
  <h1>{{title}}</h1>
  <p class="message">{{message}}</p>
  <p><strong>Date:</strong> {{date}}</p>
  <p><strong>Venue:</strong> {{venue}}</p>
</div>`;

const SAMPLE_CSS = `.invite-card {
  max-width: 600px;
  margin: 40px auto;
  font-family: Georgia, serif;
  padding: 32px;
  border: 2px solid #6d28d9;
  border-radius: 16px;
  background: #faf5ff;
}
h1 { color: #6d28d9; }
.message { color: #555; line-height: 1.7; }`;

const SAMPLE_SCHEMA = `[
  {"key":"title","label":"Event Title","type":"text","required":true},
  {"key":"message","label":"Personal Message","type":"textarea","required":true},
  {"key":"date","label":"Event Date","type":"date","required":true},
  {"key":"venue","label":"Venue","type":"text","required":true}
]`;

const AddTemplateForm: React.FC<Props> = ({ onSuccess }) => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [form, setForm] = useState<AddTemplatePayload>({
    name: '', categoryId: 0, isPaid: false, price: undefined,
    templateHtml: SAMPLE_HTML, templateCss: SAMPLE_CSS,
    templateJs: '', schemaJson: SAMPLE_SCHEMA, previewImageUrl: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const set = (k: keyof AddTemplatePayload, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      const res = await addTemplate({
        ...form,
        price: form.isPaid ? Number(form.price) : undefined
      });
      setSuccess(`Template created! ID: ${res.templateId}`);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add template');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelCls}>Template Name *</label>
          <input className={inputCls} value={form.name}
            onChange={e => set('name', e.target.value)} required placeholder="e.g. Classic Birthday Card" />
        </div>
        <div>
          <label className={labelCls}>Category *</label>
          <select className={inputCls} value={form.categoryId}
            onChange={e => set('categoryId', Number(e.target.value))} required>
            <option value={0}>Select category</option>
            {categories.map(c => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isPaid}
            onChange={e => set('isPaid', e.target.checked)}
            className="h-4 w-4 rounded accent-purple-600" />
          <span className="text-sm font-medium text-slate-700">Paid Template</span>
        </label>
        {form.isPaid && (
          <div className="flex-1">
            <input type="number" min={1} step={0.01} placeholder="Price (₹)"
              value={form.price ?? ''} onChange={e => set('price', e.target.value)}
              className={inputCls} required />
          </div>
        )}
      </div>

      <div>
        <label className={labelCls}>Template HTML * <span className="text-slate-400 font-normal">(use {"{{field}}"} placeholders)</span></label>
        <textarea rows={8} className={`${inputCls} font-mono text-xs`}
          value={form.templateHtml} onChange={e => set('templateHtml', e.target.value)} required />
      </div>

      <div>
        <label className={labelCls}>Template CSS</label>
        <textarea rows={6} className={`${inputCls} font-mono text-xs`}
          value={form.templateCss} onChange={e => set('templateCss', e.target.value)} />
      </div>

      <div>
        <label className={labelCls}>Template JS <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea rows={3} className={`${inputCls} font-mono text-xs`}
          value={form.templateJs} onChange={e => set('templateJs', e.target.value)}
          placeholder="// Optional JavaScript" />
      </div>

      <div>
        <label className={labelCls}>Schema JSON * <span className="text-slate-400 font-normal">(defines the invitation form fields)</span></label>
        <textarea rows={6} className={`${inputCls} font-mono text-xs`}
          value={form.schemaJson} onChange={e => set('schemaJson', e.target.value)} required />
      </div>

      <div>
        <label className={labelCls}>Preview Image URL <span className="text-slate-400 font-normal">(optional)</span></label>
        <input className={inputCls} value={form.previewImageUrl}
          onChange={e => set('previewImageUrl', e.target.value)} placeholder="https://..." />
      </div>

      <button type="submit" disabled={loading}
        className="w-full rounded-full bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition">
        {loading ? 'Publishing…' : 'Publish Template'}
      </button>
    </form>
  );
};

export default AddTemplateForm;
