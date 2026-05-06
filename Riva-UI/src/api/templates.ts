import { apiFetch } from './client'

// Template List Item (summary view)
export interface TemplateListItemDto {
  templateId: number
  name: string
  categoryId: number
  categoryName: string
  isPaid: boolean
  price: number | null
  previewImageUrl: string | null
  createdDate: string
  createdByUsername: string
}

// Template Detail (full view)
export interface TemplateDetailDto {
  templateId: number
  name: string
  categoryId: number
  categoryName: string
  isPaid: boolean
  price: number | null
  templateHtml: string
  templateCss: string | null
  templateJs: string | null
  schemaJson: string
  previewImageUrl: string | null
  createdDate: string
  createdBy: number
  createdByUsername: string
}

// Request to add a new template (Admin only)
export interface AddTemplateRequest {
  name: string
  categoryId: number
  isPaid: boolean
  price: number | null
  templateHtml: string
  templateCss?: string
  templateJs?: string
  schemaJson: string
  previewImageUrl?: string
}

export interface AddTemplateResponse {
  templateId: number
  message: string
  createdDate: string
}

// Request to update a template
export interface UpdateTemplateRequest {
  name: string
  categoryId: number
  isPaid: boolean
  price: number | null
  templateHtml: string
  templateCss?: string
  templateJs?: string
  schemaJson: string
  previewImageUrl?: string
}

// Query filters
export interface GetTemplatesRequest {
  categoryId?: number
  isPaid?: boolean
}

export interface TemplatesListResponse {
  templates: TemplateListItemDto[]
  total: number
}

// Get all templates (filters optional)
export async function getTemplates(filters?: GetTemplatesRequest): Promise<TemplatesListResponse> {
  const params = new URLSearchParams()
  if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString())
  if (filters?.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString())
  
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<TemplatesListResponse>(`/postapi/template${query}`, {
    method: 'GET',
  })
}

// Get template by ID
export async function getTemplateById(templateId: number): Promise<TemplateDetailDto> {
  return apiFetch<TemplateDetailDto>(`/postapi/template/${templateId}`, {
    method: 'GET',
  })
}

// Create new template (Admin only)
export async function addTemplate(request: AddTemplateRequest): Promise<AddTemplateResponse> {
  return apiFetch<AddTemplateResponse>('/postapi/template', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// Update template (Admin only)
export async function updateTemplate(templateId: number, request: UpdateTemplateRequest): Promise<AddTemplateResponse> {
  return apiFetch<AddTemplateResponse>(`/postapi/template/${templateId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

// Delete template (Admin only)
export async function deleteTemplate(templateId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/postapi/template/${templateId}`, {
    method: 'DELETE',
  })
}

}

export async function shareTemplate(templateId: number): Promise<ShareTemplateResponse> {
  return apiFetch<ShareTemplateResponse>(`templates/${templateId}/share`, {
    method: 'POST',
  })
}
