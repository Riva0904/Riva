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

export const getAllUsers = async (): Promise<UserDto[]> => {
  return apiFetch('/users/getall', { method: 'POST' });
};

export const searchUsers = async (params: {
  searchTerm?: string;
  role?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}): Promise<UserDto[]> => {
  return apiFetch('/users/search', {
    method: 'POST',
    body: JSON.stringify(params)
  });
};

export const updateUserStatus = async (id: number, isActive: boolean): Promise<void> => {
  return apiFetch('/users/updatestatus', {
    method: 'POST',
    body: JSON.stringify({ id, isActive })
  });
};

export const updateUserRole = async (id: number, role: string): Promise<void> => {
  return apiFetch('/users/updaterole', {
    method: 'POST',
    body: JSON.stringify({ id, role })
  });
};

export const getAdminPaymentStats = async (): Promise<AdminPaymentStats> => {
  return apiFetch('/payment/admin/stats', { method: 'GET' });
};