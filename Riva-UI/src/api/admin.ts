import { apiFetch } from './client';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
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