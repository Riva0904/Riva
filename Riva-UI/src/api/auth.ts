import { apiFetch, setAuthToken } from './client';

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  subscriptionTier: string;
  subscriptionExpiryDate: string | null;
  expiresAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AdminRegisterRequest {
  username: string;
  email: string;
  password: string;
  secretKey: string;
}

export interface AdminRegisterResponse {
  message: string;
  email: string;
  otpExpiryMinutes: number;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface VerifyOtpResponse {
  isVerified: boolean;
  message: string;
  token?: string;
  email?: string;
  username?: string;
  role?: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  otpExpiryMinutes: number;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  subscriptionTier: string;
  subscriptionExpiryDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
}

// Regular user authentication
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>('/postapi/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  setAuthToken(response.token);
  return response;
}

export async function register(request: RegisterRequest): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/postapi/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Admin authentication with OTP
export async function adminRegister(request: AdminRegisterRequest): Promise<AdminRegisterResponse> {
  return apiFetch<AdminRegisterResponse>('/postapi/auth/admin/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const response = await apiFetch<VerifyOtpResponse>('/postapi/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
}

export async function resendOtp(request: ResendOtpRequest): Promise<ResendOtpResponse> {
  return apiFetch<ResendOtpResponse>('/postapi/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// User profile
export async function getCurrentUser(): Promise<UserDto> {
  return apiFetch<UserDto>('/postapi/users/me', {
    method: 'GET',
  });
}

export function logout() {
  setAuthToken(null);
}
