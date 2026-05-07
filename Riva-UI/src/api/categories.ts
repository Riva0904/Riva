import { apiFetch } from './client';

export interface CategoryDto {
  categoryId: number;
  name: string;
  isActive?: boolean;
  templateCount?: number;
}

export async function getCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>('category');
}

/** Admin — returns all categories including inactive ones */
export async function getAdminCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>('category/admin');
}

export async function createCategory(name: string): Promise<{ categoryId: number; name: string; message: string }> {
  return apiFetch('category', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function updateCategory(id: number, name: string): Promise<{ message: string }> {
  return apiFetch(`category/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
}

export async function toggleCategory(id: number): Promise<{ categoryId: number; name: string; isActive: boolean; message: string }> {
  return apiFetch(`category/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({}) });
}
