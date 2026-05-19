import React, { useCallback, useRef } from 'react';
import { fieldId, type SchemaField, type InvitationMedia } from '../api/invitation';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BuilderProps {
  fields: SchemaField[];
  values: Record<string, string>;
  media: InvitationMedia[];
  resetKey: number;
  onChange: (name: string, value: string) => void;
  onMediaUpload: (fieldName: string, file: File) => void;
  uploading?: string | null;
}

interface FieldProps {
  field: SchemaField;
  fid: string;           // resolved field id (field.key || field.name)
  defaultVal: string;
  mediaItem?: InvitationMedia;
  onChange: (name: string, value: string) => void;
  onMediaUpload: (fieldName: string, file: File) => void;
  isUploading: boolean;
}

const inp = "input-green";
const lbl = "block text-sm font-black text-slate-700 mb-1.5";

// ── FieldItem — fully uncontrolled after mount ─────────────────────────────
const FieldItem = React.memo(function FieldItem({
  field, fid, defaultVal, mediaItem, onChange, onMediaUpload, isUploading,
}: FieldProps) {
  const valueRef = useRef(defaultVal);

  const notify = useCallback((v: string) => {
    valueRef.current = v;
    onChange(fid, v);            // use resolved fid, never undefined
  }, [fid, onChange]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { onMediaUpload(fid, file); e.target.value = ''; }
  }, [fid, onMediaUpload]);

  const mediaUrl = mediaItem?.fileUrl ?? '';

  return (
    <div>
      <label className={lbl}>
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {field.helpText && <p className="text-xs text-slate-400 mb-1">{field.helpText}</p>}

      {field.type === 'text' && (
        <input type="text" className={inp} defaultValue={defaultVal}
          onChange={e => notify(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          maxLength={field.maxLength} />
      )}

      {field.type === 'textarea' && (
        <textarea className={`${inp} resize-none`} rows={4} defaultValue={defaultVal}
          onChange={e => notify(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          maxLength={field.maxLength} />
      )}

      {field.type === 'date' && (
        <input type="date" className={inp} defaultValue={defaultVal}
          onChange={e => notify(e.target.value)} />
      )}

      {field.type === 'time' && (
        <input type="time" className={inp} defaultValue={defaultVal}
          onChange={e => notify(e.target.value)} />
      )}

      {field.type === 'color' && (
        <div className="flex items-center gap-3">
          <input type="color" className="h-10 w-16 rounded-lg border-2 border-slate-200 cursor-pointer"
            defaultValue={defaultVal || 'var(--color-primary)'} onChange={e => notify(e.target.value)} />
          <span className="text-sm text-slate-500 font-mono">{defaultVal || 'var(--color-primary)'}</span>
        </div>
      )}

      {field.type === 'url' && (
        <div className="space-y-1">
          <input type="text" className={inp} defaultValue={defaultVal}
            onChange={e => notify(e.target.value)}
            onPaste={e => {
              const pasted = e.clipboardData.getData('text');
              const match = pasted.match(/src=["']([^"']+)["']/);
              if (match) {
                e.preventDefault();
                (e.target as HTMLInputElement).value = match[1];
                notify(match[1]);
              }
            }}
            placeholder={field.placeholder || 'Paste Google Maps embed code or URL'} />
          <p className="text-xs text-slate-400 mt-1">💡 Paste the full embed code — URL is extracted automatically.</p>
        </div>
      )}

      {field.type === 'select' && (
        <select className={inp} defaultValue={defaultVal}
          onChange={e => notify(e.target.value)}>
          <option value="">-- Select {field.label} --</option>
          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )}

      {field.type === 'checkbox' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 accent-green-600"
            defaultChecked={defaultVal === 'true'}
            onChange={e => notify(e.target.checked ? 'true' : 'false')} />
          <span className="text-sm text-slate-600">{field.placeholder || field.label}</span>
        </label>
      )}

      {(field.type === 'image' || field.type === 'video' || field.type === 'audio') && (
        <div className="space-y-3">
          <label className={[
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition',
            isUploading
              ? 'border-green-300 bg-green-50 opacity-60 cursor-not-allowed'
              : 'border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 cursor-pointer',
          ].join(' ')}>
            <span className="text-2xl">
              {field.type === 'image' ? '🖼️' : field.type === 'video' ? '🎥' : '🎵'}
            </span>
            <span className="text-sm font-black text-green-700">
              {isUploading ? '⏳ Uploading…' : mediaUrl ? 'Replace file' : `Upload ${field.type}`}
            </span>
            <span className="text-xs text-slate-400">
              Max 50 MB · {field.type === 'image' ? 'JPG, PNG, WebP' : field.type === 'video' ? 'MP4, WebM' : 'MP3, WAV'}
            </span>
            <input type="file" className="hidden"
              accept={field.type === 'image' ? 'image/*' : field.type === 'video' ? 'video/*' : 'audio/*'}
              disabled={isUploading} onChange={handleFile} />
          </label>

          {mediaUrl && (
            <div className="rounded-xl overflow-hidden border-2 border-green-100">
              {field.type === 'image' && <img src={mediaUrl} alt={field.label} className="w-full max-h-48 object-cover" />}
              {field.type === 'video' && <video src={mediaUrl} controls className="w-full max-h-48" />}
              {field.type === 'audio' && <audio src={mediaUrl} controls className="w-full p-2" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ── DynamicFormBuilder ────────────────────────────────────────────────────────

export default function DynamicFormBuilder({
  fields, values, media, resetKey, onChange, onMediaUpload, uploading,
}: BuilderProps) {
  if (!fields.length) return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-slate-400 text-sm">
      No customisable fields defined for this template.
    </div>
  );

  return (
    <div className="space-y-5">
      {fields.map((field, idx) => {
        const fid = fieldId(field);           // "title", "message", etc.
        return (
          <FieldItem
            key={`${fid || idx}-${resetKey}`}
            field={field}
            fid={fid}
            defaultVal={values[fid] ?? field.defaultValue ?? ''}
            mediaItem={media.find(m => m.fieldName === fid)}
            onChange={onChange}
            onMediaUpload={onMediaUpload}
            isUploading={uploading === fid}
          />
        );
      })}
    </div>
  );
}
