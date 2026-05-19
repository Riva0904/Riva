import React, { useEffect, useRef, useState, useMemo } from 'react';
import { addTemplate, uploadTemplateImage, type AddTemplatePayload } from '../../../api/templates';
import { getCategories, type CategoryDto } from '../../../api/categories';

// Sample data used to fill {{tokens}} in the preview
const SAMPLE: Record<string, string> = {
  title: "Arjun & Priya's Wedding",
  subtitle: 'Together with their families',
  name: 'Arjun & Priya',
  brideName: 'Priya Sharma', groomName: 'Arjun Patel',
  hostName: 'The Sharma & Patel Families',
  date: 'December 25, 2026', time: '7:00 PM onwards',
  venue: 'Grand Ballroom, The Taj Hotel',
  address: '123 Marine Drive, Mumbai', city: 'Mumbai',
  message: 'We joyfully invite you to celebrate our special day.',
  welcomeMessage: 'Welcome! We are so glad you could join us.',
  quote: '"Two hearts, one beautiful love story."',
  eventName: "Arjun & Priya's Wedding Celebration",
  phone: '+91 98765 43210', rsvpDate: 'December 15, 2026',
  guestName: 'Valued Guest', age: '25',
  birthdayPerson: 'Sarah', partyTheme: 'Neon Glow Night',
  host: 'The Johnson Family', occasion: 'Special Celebration',
  year: '2026', color: '#7c3aed',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.5946!3d12.9716',
  mapRedirectUrl: 'https://maps.google.com',
  mapLocation: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.5946!3d12.9716',
  birthdayImage: '', birthdayPersonName: 'Sarah',
};

function buildPreviewDoc(html: string, css: string, js: string): string {
  // Replace {{tokens}} in HTML
  const body = html.replace(/\{\{(\w+)\}\}/g, (m, k) => SAMPLE[k] ?? `[${k}]`);

  // Replace {{tokens}} in JS, then auto-replace const templateData = {...}
  let jsOut = js.replace(/\{\{(\w+)\}\}/g, (m, k) => {
    const v = SAMPLE[k] ?? '';
    return v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
  });
  const tdIdx = jsOut.indexOf('const templateData');
  if (tdIdx !== -1) {
    const ob = jsOut.indexOf('{', tdIdx);
    if (ob !== -1) {
      let depth = 1, i = ob + 1;
      while (i < jsOut.length && depth > 0) { if (jsOut[i]==='{') depth++; else if (jsOut[i]==='}') depth--; i++; }
      const entries = Object.entries(SAMPLE).filter(([,v])=>v!=='').map(([k,v])=>`  ${k}: ${JSON.stringify(v)}`).join(',\n');
      jsOut = jsOut.slice(0, tdIdx) + `const templateData = {\n${entries}\n}` + jsOut.slice(i);
    }
  }

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body{width:100%;min-height:100%}img,video{max-width:100%;display:block}</style>
<style>${css}</style>
</head><body>${body}
<script>${jsOut}<\/script>
</body></html>`;
}

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
    tierType: 'Free',
    templateHtml: SAMPLE_HTML, templateCss: SAMPLE_CSS,
    templateJs: '', schemaJson: SAMPLE_SCHEMA,
    previewImageUrl: '', thumbnailUrl: '', tags: ''
  });
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab,       setTab]       = useState<'basic' | 'code' | 'schema' | 'preview'>('basic');
  const [device,    setDevice]    = useState<'mobile' | 'desktop'>('mobile');
  const [previewed, setPreviewed] = useState(false);

  const previewDoc = useMemo(() =>
    tab === 'preview' ? buildPreviewDoc(form.templateHtml, form.templateCss ?? '', form.templateJs ?? '') : '',
  [tab, form.templateHtml, form.templateCss, form.templateJs]);

  const [blobUrl, setBlobUrl] = useState('');
  const blobRef = useRef('');
  useEffect(() => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    if (!previewDoc) { setBlobUrl(''); blobRef.current = ''; return; }
    const url = URL.createObjectURL(new Blob([previewDoc], { type: 'text/html' }));
    blobRef.current = url; setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewDoc]);

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
      const isPaid = form.tierType !== 'Free';
      const res = await addTemplate({
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        isPaid,
        price: isPaid ? Number(form.price) : undefined,
        tierType: form.tierType,
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
      <div className="flex gap-1 border-b-2 border-slate-100 flex-wrap">
        <button type="button" className={tabCls('basic')}   onClick={() => setTab('basic')}>📋 Basic Info</button>
        <button type="button" className={tabCls('code')}    onClick={() => setTab('code')}>💻 HTML / CSS / JS</button>
        <button type="button" className={tabCls('schema')}  onClick={() => setTab('schema')}>📐 Schema (Fields)</button>
        <button type="button"
          className={`px-4 py-2 text-sm font-black rounded-t-xl border-b-2 transition flex items-center gap-1.5 ${
            tab === 'preview'
              ? 'border-purple-600 text-purple-700 bg-purple-50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => { setTab('preview'); setPreviewed(true); }}>
          👁 Preview {previewed && <span className="rounded-full bg-green-500 text-white text-[9px] px-1.5 py-0.5">✓</span>}
        </button>
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
            <label className={lbl}>
              Template Image
              <span className="ml-2 text-[10px] font-normal text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                Gallery card thumbnail — optional
              </span>
            </label>
            <p className="text-xs text-slate-400 mb-2">
              This image appears as the card thumbnail in the gallery. Users see the live animated preview (from your HTML/CSS) when they click <strong>▶ Live Preview</strong>.
            </p>
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

          {/* Tier selector */}
          <div>
            <label className={lbl}>Template Tier *</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Free', 'Premium', 'Pro'] as const).map(tier => {
                const meta = {
                  Free:    { icon: '🆓', color: 'border-green-400 bg-green-50 text-green-700',   desc: 'Text & quotes' },
                  Premium: { icon: '💎', color: 'border-blue-400 bg-blue-50 text-blue-700',      desc: 'Images & animations' },
                  Pro:     { icon: '🚀', color: 'border-purple-400 bg-purple-50 text-purple-700', desc: 'Map + all features' },
                }[tier];
                const active = form.tierType === tier;
                return (
                  <button key={tier} type="button"
                    onClick={() => set('tierType', tier)}
                    className={`rounded-xl border-2 p-3 text-center transition ${
                      active ? meta.color + ' shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}>
                    <p className="text-xl mb-1">{meta.icon}</p>
                    <p className="text-xs font-black">{tier}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{meta.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
          {form.tierType !== 'Free' && (
            <div>
              <label className={lbl}>Price (₹) *</label>
              <input type="number" min={1} step={1} placeholder={form.tierType === 'Pro' ? 'e.g. 299' : 'e.g. 149'}
                value={form.price ?? ''} onChange={e => set('price', e.target.value)}
                className={inp} required />
            </div>
          )}
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

      {/* ── Preview ── */}
      {tab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Live preview with sample data. Verify your template looks correct before publishing.</p>
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
              {(['mobile', 'desktop'] as const).map(d => (
                <button key={d} type="button" onClick={() => setDevice(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition ${device === d ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-slate-600'}`}>
                  {d === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center bg-slate-900 rounded-2xl p-6 min-h-[500px] items-start">
            {blobUrl ? (
              device === 'mobile' ? (
                <div style={{ width: 375, borderRadius: 40, border: '10px solid #1a1a2e', boxShadow: '0 0 0 2px #333, 0 40px 80px rgba(0,0,0,0.8)', overflow: 'hidden', background: '#000' }}>
                  <div style={{ height: 24, background: '#1a1a2e', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: 80, height: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 6 }} />
                  </div>
                  <iframe src={blobUrl} style={{ width: '100%', height: '72vh', border: 'none', display: 'block' }} title="Template Preview" />
                </div>
              ) : (
                <div style={{ width: '100%', maxWidth: 1000, borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}>
                  <div style={{ background: '#1e293b', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {['#ff5f57','#ffbd2e','#28c840'].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                      riva.app/invite/preview
                    </div>
                  </div>
                  <iframe src={blobUrl} style={{ width: '100%', height: '70vh', border: 'none', display: 'block' }} title="Template Preview" />
                </div>
              )
            ) : (
              <div className="text-white/40 text-sm flex flex-col items-center gap-3 py-20">
                <span className="text-5xl">👁</span>
                <p>Building preview…</p>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 flex gap-2">
            <span>💡</span>
            <span>Preview uses <strong>sample data</strong> for placeholders. Go back to fix any layout issues before publishing.</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700">
        <span>🚀</span>
        <span>Templates are <strong>immediately published</strong> and visible to all users when you submit.</span>
      </div>

      {!previewed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 flex gap-2">
          <span>⚠️</span>
          <span>Please click <strong>👁 Preview</strong> tab to verify the template before publishing.</span>
        </div>
      )}

      <button type="submit" disabled={loading || !previewed}
        className={`btn-green w-full py-4 text-base transition ${!previewed ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {loading ? '⏳ Publishing template…' : previewed ? '🚀 Publish Template' : '👁 Preview first, then publish'}
      </button>
    </form>
  );
};

export default AddTemplateForm;
