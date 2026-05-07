import { apiFetch } from './client';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5236/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SchemaField {
  /** Field identifier used in {{placeholder}} tokens.
   *  Existing templates use "key"; new ones may use "name". Both are supported. */
  key?: string;
  name?: string;
  type: 'text' | 'textarea' | 'date' | 'image' | 'video' | 'audio' | 'color' | 'select' | 'checkbox' | 'url';
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: string[];
  maxLength?: number;
  helpText?: string;
}

/** Returns the actual field identifier regardless of whether the template uses "key" or "name". */
export function fieldId(f: SchemaField): string {
  return (f.key || f.name || '').trim();
}

export interface InvitationSummary {
  invitationId: number;
  templateId: number;
  templateName: string;
  thumbnailUrl?: string;
  title: string;
  slug: string;
  status: 'Draft' | 'Published';
  isPublic: boolean;
  publishedAt?: string;
  createdAt: string;
  viewCount: number;
  publicUrl: string;
}

export interface InvitationMedia {
  mediaId: number;
  fieldName: string;
  originalName: string;
  fileUrl: string;
  mediaType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface InvitationDetail extends InvitationSummary {
  fieldValuesJson: string;
  seoTitle?: string;
  seoDescription?: string;
  expiresAt?: string;
  templateHtml: string;
  templateCss?: string;
  templateJs?: string;
  schemaJson: string;
  media: InvitationMedia[];
}

export interface CreateInvitationRequest {
  templateId: number;
  title: string;
  fieldValuesJson: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateInvitationRequest {
  title: string;
  fieldValuesJson: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PublishInvitationRequest {
  expiresAt?: string;
  isPublic: boolean;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function createInvitation(req: CreateInvitationRequest) {
  return apiFetch<{ invitationId: number; slug: string; message: string }>(
    'invitation', { method: 'POST', body: JSON.stringify(req) });
}

export async function getMyInvitations(): Promise<InvitationSummary[]> {
  return apiFetch<InvitationSummary[]>('invitation/my');
}

export async function getInvitationById(id: number): Promise<InvitationDetail> {
  return apiFetch<InvitationDetail>(`invitation/${id}`);
}

export async function updateInvitation(id: number, req: UpdateInvitationRequest) {
  return apiFetch<{ message: string }>(`invitation/${id}`,
    { method: 'PUT', body: JSON.stringify(req) });
}

export async function publishInvitation(id: number, req: PublishInvitationRequest) {
  return apiFetch<{ slug: string; publicUrl: string; message: string }>(
    `invitation/${id}/publish`, { method: 'POST', body: JSON.stringify(req) });
}

export async function uploadMedia(invitationId: number, fieldName: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  form.append('fieldName', fieldName);

  const token = localStorage.getItem('riva_token');
  const res = await fetch(`${API_BASE}/invitation/${invitationId}/media`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data as { mediaId: number; fileUrl: string; fieldName: string; message: string };
}

export async function getPublicInvitationMeta(slug: string): Promise<InvitationDetail> {
  return apiFetch<InvitationDetail>(`public/invite/${slug}/meta`);
}

/** Returns the fully-rendered HTML string of a published invitation. */
export async function getPublicInvitationHtml(slug: string): Promise<string> {
  const res = await fetch(`${API_BASE}/public/invite/${slug}`);
  if (!res.ok) throw new Error('Invitation not found or not published yet.');
  return res.text();
}
