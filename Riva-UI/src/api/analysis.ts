import { apiFetch } from './client';

export interface UserSession {
  userId: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  templates: { free: number; paid: number; total: number };
  categories: { categoryId: number; name: string; freeCount: number; paidCount: number; total: number }[];
}

export async function getUserSession(): Promise<UserSession> {
  return apiFetch<UserSession>('users/session');
}
