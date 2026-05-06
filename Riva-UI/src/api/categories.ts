import { apiFetch } from './client'

export interface CategoryDto {
  categoryId: number
  name: string
  isActive: boolean
  templateCount: number
}

export interface CreateCategoryRequest {
  name: string
}

export interface UpdateCategoryRequest {
  name: string
  isActive: boolean
}

export interface CreateCategoryResponse {
  categoryId: number
  message: string
}

// Get all active categories
export async function getCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>('/postapi/template/categories', {
    method: 'GET',
  })
}

// Create new category (Admin only)
export async function createCategory(request: CreateCategoryRequest): Promise<CreateCategoryResponse> {
  return apiFetch<CreateCategoryResponse>('/postapi/categories', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// Update category (Admin only)
export async function updateCategory(categoryId: number, request: UpdateCategoryRequest): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/postapi/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

// Delete category (Admin only)
export async function deleteCategory(categoryId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/postapi/categories/${categoryId}`, {
    method: 'DELETE',
  })
}
