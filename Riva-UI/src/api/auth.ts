import { apiFetch, setAuthToken } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  subscriptionTier: string;
  subscriptionExpiry: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>('auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  setAuthToken(response.token);
  return response;
}

export async function register(request: RegisterRequest): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getCurrentUser(): Promise<UserDto> {
  return apiFetch<UserDto>('users/me', {
    method: 'POST',
  });
}

export function logout() {
  setAuthToken(null);
}
