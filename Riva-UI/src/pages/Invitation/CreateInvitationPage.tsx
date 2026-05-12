import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import {
  createInvitation, updateInvitation, publishInvitation,
  uploadMedia, getInvitationById,
  type SchemaField, type InvitationMedia,
} from '../../api/invitation';
import DynamicFormBuilder from '../../components/DynamicFormBuilder';
import ShareModal from '../../components/ShareModal';

interface TemplateDetail {
  templateId: number;
  name: string;
  schemaJson: string;
  templateHtml: string;
  templateCss?: string;
  templateJs?: string;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function safeJson<T>(s: string, fallback: T): T {
  try { return JSON.parse(s); } catch { return fallback; }
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Component ─────────────────────────────────────────────────────────────────

const CreateInvitationPage: React.FC = () => {
  const { templateId, invitationId } = useParams<{ templateId?: string; invitationId?: string }>();
  const navigate = useNavigate();

  // ── Template content — must be in STATE so useMemo reacts when they load ──
  const [templateHtml, setTemplateHtml] = useState('');
  const [templateCss,  setTemplateCss]  = useState('');
  const [templateJs,   setTemplateJs]   = useState('');
  const [templateName, setTemplateName] = useState('');

  // ── Form state ────────────────────────────────────────────────────────────
  const [fields,    setFields]    = useState<SchemaField[]>([]);
  const [values,    setValues]    = useState<Record<string, string>>({});
  const [media,     setMedia]     = useState<InvitationMedia[]>([]);
  const [title,     setTitle]     = useState('My Invitation');
  const [resetKey,  setResetKey]  = useState(0);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [publishing,   setPublishing]   = useState(false);
  const [uploading,    setUploading]    = useState<string | null>(null);
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [activeTab,    setActiveTab]    = useState<'form' | 'preview'>('form');
  const [showShare,    setShowShare]    = useState(false);
  const [currentInvId, setCurrentInvId] = useState<number | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);

    if (invitationId) {
      getInvitationById(Number(invitationId))
        .then(inv => {
          const saved = safeJson<Record<string, string>>(inv.fieldValuesJson, {});
          setTitle(inv.title);
          setCurrentInvId(inv.invitationId);
          setMedia(inv.media);
          setFields(safeJson<SchemaField[]>(inv.schemaJson, []));
          setValues(saved);
          setResetKey(k => k + 1);          // remount all FieldItems with saved values
          setTemplateHtml(inv.templateHtml);
          setTemplateCss(inv.templateCss ?? '');
          setTemplateJs(inv.templateJs  ?? '');
          setTemplateName(inv.templateName);
          if (inv.status === 'Published') setPublishedUrl(`/invite/${inv.slug}`);
        })
        .catch(() => setError('Invitation not found.'))
        .finally(() => setLoading(false));

    } else if (templateId) {
      apiFetch<TemplateDetail>(`template/${templateId}`)
        .then(t => {
          setFields(safeJson<SchemaField[]>(t.schemaJson, []));
          setTemplateHtml(t.templateHtml);        // ← state, not ref → triggers useMemo
          setTemplateCss(t.templateCss ?? '');
          setTemplateJs(t.templateJs  ?? '');
          setTemplateName(t.name);
        })
        .catch(() => setError('Template not found.'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [templateId, invitationId]);

  // ── Live preview ───────────────────────────────────────────────────────────
  // All deps are real state → useMemo recalculates correctly every time
  const previewSrcDoc = useMemo(() => {
    if (!templateHtml) return '';

    // Media URL map
    const mediaMap: Record<string, string> = {};
    media.forEach(m => { mediaMap[m.fieldName] = m.fileUrl; });

    // Replace {{token}} — keep token visible if not yet filled
    const body = templateHtml.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (mediaMap[key])                              return mediaMap[key];
      if (values[key] !== undefined && values[key] !== '') return escHtml(values[key]);
      return match;   // keep {{token}} so user sees what still needs filling
    });

    return [
      '<!DOCTYPE html><html><head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}',
      'html,body{width:100%;min-height:100%}img,video{max-width:100%;display:block}</style>',
      `<style>${templateCss}</style>`,
      '</head><body>',
      body,
      `<script>${templateJs}</script>`,
      '</body></html>',
    ].join('\n');
  }, [templateHtml, templateCss, templateJs, values, media]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Stable — updates only the changed field in values
  const handleChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleMediaUpload = useCallback(async (fieldName: string, file: File) => {
    setUploading(fieldName);
    try {
      let invId = currentInvId;
      if (!invId) {
        const r = await createInvitation({
          templateId: Number(templateId), title,
          fieldValuesJson: JSON.stringify(values),
        });
        invId = r.invitationId;
        setCurrentInvId(invId);
      }
      const r = await uploadMedia(invId, fieldName, file);
      setMedia(prev => [
        ...prev.filter(m => m.fieldName !== fieldName),
        { mediaId: r.mediaId, fieldName, originalName: file.name,
          fileUrl: r.fileUrl,
          mediaType: file.type.startsWith('video/') ? 'video'
                   : file.type.startsWith('audio/') ? 'audio' : 'image',
          fileSizeBytes: file.size, uploadedAt: new Date().toISOString() },
      ]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally { setUploading(null); }
  }, [currentInvId, templateId, title, values]);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleSave = useCallback(async () => {
    setError(null); setSaving(true);
    try {
      const p = { title, fieldValuesJson: JSON.stringify(values) };
      if (currentInvId) {
        await updateInvitation(currentInvId, p);
        flash('Saved ✓');
      } else {
        const r = await createInvitation({ templateId: Number(templateId), ...p });
        setCurrentInvId(r.invitationId);
        flash('Saved ✓');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally { setSaving(false); }
  }, [currentInvId, templateId, title, values]);

  const handlePublish = useCallback(async () => {
    setError(null); setPublishing(true);
    try {
      const p = { title, fieldValuesJson: JSON.stringify(values) };
      let invId = currentInvId;
      if (!invId) {
        const r = await createInvitation({ templateId: Number(templateId), ...p });
        invId = r.invitationId;
        setCurrentInvId(invId);
      } else {
        await updateInvitation(invId, p);
      }
      const r = await publishInvitation(invId, { isPublic: true });
      setPublishedUrl(r.publicUrl);
      flash('Published! 🎉');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Publish failed.');
    } finally { setPublishing(false); }
  }, [currentInvId, templateId, title, values]);

  const copyLink = useCallback(() => {
    if (publishedUrl)
      navigator.clipboard.writeText(window.location.origin + publishedUrl)
        .then(() => flash('Link copied!'));
  }, [publishedUrl]);

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="bg-page min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl animate-bounce mb-3">🌿</div>
        <p className="text-green font-black text-lg animate-pulse">Loading template…</p>
      </div>
    </div>
  );

  if (error && !templateHtml) return (
    <div className="bg-page min-h-screen flex items-center justify-center">
      <div className="card-green p-8 text-center max-w-md">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-red-600 font-bold mb-5">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-green w-auto px-8">← Go Back</button>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-light-green min-h-screen flex flex-col">

      {/* Header */}
      <header className="dashboard-header flex-shrink-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/dashboard')}
              className="navbar-btn-outline text-sm flex-shrink-0">
              ← Dashboard
            </button>
            <span className="text-slate-300 hidden sm:block">|</span>
            <span className="font-black text-slate-700 text-sm truncate hidden sm:block">
              {invitationId ? 'Edit Invitation' : `Create — ${templateName}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {successMsg && (
              <span className="text-xs font-black text-green-600 animate-pulse">{successMsg}</span>
            )}
            <button onClick={handleSave} disabled={saving} className="navbar-btn-outline text-sm">
              {saving ? '⏳' : '💾 Save'}
            </button>
            {!publishedUrl ? (
              <button onClick={handlePublish} disabled={publishing}
                className="btn-green w-auto px-5 py-2 text-sm">
                {publishing ? '⏳ Publishing…' : '🚀 Publish'}
              </button>
            ) : (
              <button onClick={copyLink} className="btn-green w-auto px-5 py-2 text-sm">
                🔗 Copy Link
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Published banner */}
      {publishedUrl && (
        <div className="bg-green-600 text-white px-4 py-2.5 text-sm font-bold flex-shrink-0 flex items-center justify-center gap-3">
          <span>🎉 Published!</span>
          <a href={publishedUrl} target="_blank" rel="noreferrer"
            className="underline hover:no-underline truncate max-w-xs hidden sm:block">
            {window.location.origin + publishedUrl}
          </a>
          <button onClick={copyLink} className="underline">Copy</button>
          <button
            onClick={() => setShowShare(true)}
            className="rounded-full bg-white/20 px-3 py-1 text-xs hover:bg-white/30 transition">
            🔗 Share
          </button>
        </div>
      )}

      {showShare && publishedUrl && (
        <ShareModal
          url={window.location.origin + publishedUrl}
          title={title}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 text-center flex-shrink-0">
          ⚠️ {error}
        </div>
      )}

      {/* Body — split panel */}
      <div className="flex-1 mx-auto w-full max-w-7xl p-4 grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Left — Form */}
        <div className="flex flex-col gap-4">
          {/* Mobile tabs */}
          <div className="flex gap-1 border-b-2 border-green-100 lg:hidden">
            {(['form', 'preview'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`page-tab ${activeTab === t ? 'active' : ''}`}>
                {t === 'form' ? '✏️ Edit' : '👁 Preview'}
              </button>
            ))}
          </div>

          <div className={`card-green p-6 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
            <h2 className="text-lg font-black text-slate-900 mb-5">Invitation Details</h2>

            {/* Internal record name */}
            <div className="mb-5 pb-5 border-b-2 border-green-50">
              <label className="block text-sm font-black text-slate-700 mb-1">
                Invitation Title <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Internal name shown in "My Invitations" list only.
              </p>
              <input
                className="input-green"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Sarah & John Wedding 2025"
              />
            </div>

            {/* Template fields — isolated, uncontrolled */}
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
              Template Content
            </p>
            <DynamicFormBuilder
              fields={fields}
              values={values}
              media={media}
              resetKey={resetKey}
              onChange={handleChange}
              onMediaUpload={handleMediaUpload}
              uploading={uploading}
            />
          </div>
        </div>

        {/* Right — Live preview */}
        <div className={activeTab === 'form' ? 'hidden lg:block' : ''}>
          <div className="card-green overflow-hidden lg:sticky lg:top-20">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-green-100">
              <span className="text-sm font-black text-slate-700">👁 Live Preview</span>
              <span className="text-xs text-slate-400">Updates as you type</span>
            </div>
            <div className="bg-white" style={{ height: '74vh' }}>
              {previewSrcDoc ? (
                <iframe
                  srcDoc={previewSrcDoc}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  title="Live Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                  <span className="text-4xl">🖼️</span>
                  <span className="text-sm font-semibold">Fill in the fields to see your preview</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvitationPage;
