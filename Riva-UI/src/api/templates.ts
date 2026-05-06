import { apiFetch } from './client';

export interface TemplateListItem {
  templateId: number; name: string; categoryId: number; categoryName: string;
  isPaid: boolean; price: number | null; previewImageUrl: string | null; createdDate: string;
}
export interface TemplateDetail extends TemplateListItem {
  templateHtml: string; templateCss: string | null; templateJs: string | null; schemaJson: string;
}
export interface AddTemplatePayload {
  name: string; categoryId: number; isPaid: boolean; price?: number;
  templateHtml: string; templateCss?: string; templateJs?: string;
  schemaJson: string; previewImageUrl?: string;
}

export async function getTemplates(categoryId?: number, isPaid?: boolean): Promise<{ templates: TemplateListItem[]; total: number }> {
  const p = new URLSearchParams();
  if (categoryId != null) p.set('categoryId', String(categoryId));
  if (isPaid != null) p.set('isPaid', String(isPaid));
  return apiFetch(`template?${p.toString()}`);
}

export async function getTemplateById(id: number): Promise<TemplateDetail> {
  return apiFetch(`template/${id}`);
}

export async function addTemplate(payload: AddTemplatePayload): Promise<{ templateId: number; message: string }> {
  return apiFetch('template', { method: 'POST', body: JSON.stringify(payload) });
}
