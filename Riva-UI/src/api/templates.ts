import { apiFetch } from './client';

export interface TemplateListItem {
  templateId: number;
  name: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  isPaid: boolean;
  price: number | null;
  previewImageUrl: string | null;
  thumbnailUrl?: string | null;
  status: string;
  createdDate: string;
}

export interface TemplateDetail extends TemplateListItem {
  templateHtml: string;
  templateCss: string | null;
  templateJs: string | null;
  schemaJson: string;
}

export interface AddTemplatePayload {
  name: string;
  description?: string;
  categoryId: number;
  isPaid: boolean;
  price?: number;
  templateHtml: string;
  templateCss?: string;
  templateJs?: string;
  schemaJson: string;
  previewImageUrl?: string;
  thumbnailUrl?: string;
  tags?: string;
}

export async function getTemplates(categoryId?: number, isPaid?: boolean): Promise<{ templates: TemplateListItem[]; total: number }> {
  const p = new URLSearchParams();
  if (categoryId != null) p.set('categoryId', String(categoryId));
  if (isPaid != null)     p.set('isPaid', String(isPaid));
  return apiFetch(`template?${p.toString()}`);
}

/** Admin-only: returns ALL templates regardless of status */
export async function getAdminTemplates(categoryId?: number, isPaid?: boolean): Promise<{ templates: TemplateListItem[]; total: number }> {
  const p = new URLSearchParams();
  if (categoryId != null) p.set('categoryId', String(categoryId));
  if (isPaid != null)     p.set('isPaid', String(isPaid));
  return apiFetch(`template/admin?${p.toString()}`);
}

export async function getTemplateById(id: number): Promise<TemplateDetail> {
  return apiFetch(`template/${id}`);
}

export async function addTemplate(payload: AddTemplatePayload): Promise<{ templateId: number; message: string }> {
  return apiFetch('template', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateTemplateStatus(id: number, status: 'Published' | 'Draft' | 'Archived'): Promise<{ message: string }> {
  return apiFetch(`template/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function uploadTemplateImage(file: File): Promise<{ imageUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  const token = localStorage.getItem('riva_token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE ?? 'http://localhost:5236/api'}/template/upload-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Upload failed');
  return { imageUrl: data.imageUrl };
}
