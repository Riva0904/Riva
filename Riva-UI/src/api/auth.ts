import { apiFetch } from './client';
export { setAuthToken, getStoredAuthToken } from './client';

export interface LoginRequest { emailOrUsername: string; password: string; }
export interface LoginResponse { token: string; username: string; email: string; role: string; }
export interface RegisterRequest { username: string; email: string; password: string; }
export interface RegisterResponse { message: string; email: string; otpSent: boolean; }
export interface AdminRegisterRequest { username: string; email: string; password: string; secretKey: string; }
export interface VerifyOtpRequest { email: string; otpCode: string; }
export interface UserDto { id: number; username: string; email: string; role: string; isActive: boolean; createdAt: string; }

import { setAuthToken } from './client';

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>('auth/login', { method: 'POST', body: JSON.stringify(req) });
  setAuthToken(res.token);
  localStorage.setItem('riva_username', res.username);
  localStorage.setItem('riva_email', res.email);
  return res;
}

export async function register(req: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('auth/register', { method: 'POST', body: JSON.stringify(req) });
}

export async function verifyOtp(req: VerifyOtpRequest): Promise<{ message: string }> {
  return apiFetch('auth/verify-otp', { method: 'POST', body: JSON.stringify(req) });
}

export async function resendOtp(email: string): Promise<{ message: string }> {
  return apiFetch('auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function adminRegister(req: AdminRegisterRequest): Promise<{ message: string; email: string }> {
  return apiFetch('auth/admin/register', { method: 'POST', body: JSON.stringify(req) });
}

export async function adminVerifyOtp(req: VerifyOtpRequest): Promise<{ message: string }> {
  return apiFetch('auth/admin/verify-otp', { method: 'POST', body: JSON.stringify(req) });
}

export async function adminResendOtp(email: string): Promise<{ message: string }> {
  return apiFetch('auth/admin/resend-otp', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch('auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPassword(email: string, otpCode: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch('auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otpCode, newPassword }) });
}

export async function getCurrentUser(): Promise<UserDto> {
  return apiFetch<UserDto>('users/me', { method: 'POST' });
}

export function logout() {
  setAuthToken(null);
  localStorage.removeItem('riva_username');
  localStorage.removeItem('riva_email');
}

export function getStoredUsername(): string | null {
  // Try localStorage first (set on login)
  const stored = localStorage.getItem('riva_username');
  if (stored) return stored;
  // Fall back to JWT claims (for sessions that pre-date the localStorage save)
  const token = localStorage.getItem('riva_token');
  if (!token) return null;
  try {
    const p = JSON.parse(atob(token.split('.')[1]));
    return (
      p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      p['unique_name'] ||
      p.name ||
      p.sub ||
      null
    );
  } catch { return null; }
}

export function getStoredEmail(): string | null {
  return localStorage.getItem('riva_email');
}

export function getStoredRole(): string | null {
  const token = localStorage.getItem('riva_token');
  if (!token) return null;
  try {
    const p = JSON.parse(atob(token.split('.')[1]));
    return p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || p.role || null;
  } catch { return null; }
}
