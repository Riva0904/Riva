import { apiFetch } from './client';
export { setAuthToken, getStoredAuthToken } from './client';

export interface LoginRequest { emailOrUsername: string; password: string; }
export interface LoginResponse { token: string; username: string; email: string; role: string; }
export interface RegisterRequest { username: string; email: string; password: string; }
export interface RegisterResponse { message: string; email: string; otpSent: boolean; }
export interface AdminRegisterRequest { username: string; email: string; password: string; secretKey: string; }
export interface VerifyOtpRequest { email: string; otpCode: string; }
export interface UserDto { id: number; username: string; email: string; role: string; isActive: boolean; createdAt: string; }

import { setAuthToken as _set } from './client';

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>('auth/login', { method: 'POST', body: JSON.stringify(req) });
  _set(res.token);
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

export async function getCurrentUser(): Promise<UserDto> {
  return apiFetch<UserDto>('users/me', { method: 'POST' });
}

export function logout() { _set(null); }

export function getStoredRole(): string | null {
  const token = localStorage.getItem('riva_token');
  if (!token) return null;
  try {
    const p = JSON.parse(atob(token.split('.')[1]));
    return p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || p.role || null;
  } catch { return null; }
}
