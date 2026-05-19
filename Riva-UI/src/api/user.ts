import { apiFetch, API_BASE, API_ORIGIN } from './client';

const toAbsoluteUrl = (url: string): string =>
  url.startsWith('http') ? url : API_ORIGIN + (url.startsWith('/') ? '' : '/') + url;

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

export async function getUserProfile(): Promise<UserProfile> {
  const profile = await apiFetch<UserProfile>('users/profile');
  if (profile.profileImageUrl) {
    profile.profileImageUrl = toAbsoluteUrl(profile.profileImageUrl);
  }
  return profile;
}

export async function updateProfile(req: UpdateProfileRequest): Promise<{ message: string }> {
  return apiFetch('users/profile', { method: 'PATCH', body: JSON.stringify(req) });
}

export async function changePassword(req: ChangePasswordRequest): Promise<{ message: string }> {
  return apiFetch('users/change-password', { method: 'POST', body: JSON.stringify(req) });
}

export async function uploadProfileImage(file: File): Promise<{ imageUrl: string; message: string }> {
  const form  = new FormData();
  form.append('file', file);
  const token = localStorage.getItem('riva_token');
  const res   = await fetch(`${API_BASE}/users/profile-image`, {
    method:  'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body:    form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  if (data.imageUrl) data.imageUrl = toAbsoluteUrl(data.imageUrl);
  return data;
}
