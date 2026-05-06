import { apiFetch } from './client';

export interface CategoryDto { categoryId: number; name: string; templateCount: number; }

export async function getCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>('category');
}
