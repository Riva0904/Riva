import { apiFetch } from './client'

export interface TemplateDefinition {
  templateId: number
  name: string
  description: string
  imageUrl: string
  tier: string
  maxPhotos: number
  sortOrder: number
}

export interface TemplateRequest {
  templateId: number
  title: string
  recipientName: string
  greeting: string
  location: string
  eventDate: string
  personalMessage: string
  includeGoogleMaps: boolean
}

export interface TemplatePreviewResponse {
  templateId: number
  previewHtml: string
  message: string
}

export interface SharedTemplate {
  id: number
  templateId: number
  title: string
  recipientName: string
  greeting: string
  location: string
  eventDate: string | null
  personalMessage: string
  includeGoogleMaps: boolean
  viewCount: number
  createdAt: string
  creatorName: string
}

export interface ShareTemplateResponse {
  shareToken: string
  shareUrl: string
  message: string
}

export async function getTemplates(): Promise<TemplateDefinition[]> {
  return apiFetch<TemplateDefinition[]>('templates', {
    method: 'GET',
  })
}

export async function getTemplateCategories(): Promise<TemplateDefinition[]> {
  return apiFetch<TemplateDefinition[]>('templates/categories', {
    method: 'GET',
  })
}

export async function getSharedTemplate(shareToken: string): Promise<SharedTemplate> {
  return apiFetch<SharedTemplate>(`templates/shared/${shareToken}`, {
    method: 'GET',
  })
}

export async function generateTemplatePreview(request: TemplateRequest): Promise<TemplatePreviewResponse> {
  return apiFetch<TemplatePreviewResponse>('templates/preview', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function submitTemplate(request: TemplateRequest): Promise<TemplatePreviewResponse> {
  return apiFetch<TemplatePreviewResponse>('templates/submit', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function shareTemplate(templateId: number): Promise<ShareTemplateResponse> {
  return apiFetch<ShareTemplateResponse>(`templates/${templateId}/share`, {
    method: 'POST',
  })
}
