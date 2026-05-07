import { apiFetch } from './client';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5236/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  username: string;
  displayName?: string;
  email: string;
  role: string;
  isActive: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  // Usage stats (only invited, not previewed)
  freeTemplatesUsed: number;
  paidTemplatesUsed: number;
  totalInvitationsCreated: number;
  sessionStatus: 'Active' | 'Expired';
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
  displayName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('users/profile');
}

export async function updateProfile(req: UpdateProfileRequest): Promise<{ message: string }> {
  return apiFetch('users/profile', {
    method: 'PATCH',
    body: JSON.stringify(req),
  });
}

export async function changePassword(req: ChangePasswordRequest): Promise<{ message: string }> {
  return apiFetch('users/change-password', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function uploadProfileImage(file: File): Promise<{ imageUrl: string; message: string }> {
  const form  = new FormData();
  form.append('file', file);
  const token = localStorage.getItem('riva_token');
  const res   = await fetch(`${API_BASE}/users/profile-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}
