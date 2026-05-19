import { apiFetch } from './client';

export interface UserDto {
  id: number;
  username: string;
  displayName?: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface PaymentAdminRecord {
  id: number;
  userId: number;
  username: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  razorpayPaymentId?: string;
  transactionDate: string;
  completionDate?: string;
}

export interface AdminPaymentStats {
  totalAmount: number;
  totalPayments: number;
  completedPayments: number;
  payments: PaymentAdminRecord[];
}

export const getAllUsers = async (): Promise<UserDto[]> =>
  apiFetch('/users/getall', { method: 'POST' });

export const getAdminPaymentStats = async (): Promise<AdminPaymentStats> =>
  apiFetch('/payment/admin/stats', { method: 'GET' });

export interface AdminNotification {
  id: number;
  type: 'registration' | 'payment' | 'security';
  icon: string;
  title: string;
  message: string;
  time: string;
}

export const getAdminNotifications = (hours = 24): Promise<{ notifications: AdminNotification[]; total: number }> =>
  apiFetch(`admin/notifications?hours=${hours}`);
