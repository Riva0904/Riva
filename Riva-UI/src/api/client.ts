const API_BASE = import.meta.env.VITE_API_BASE ?? '/postapi';

function getAuthToken(): string | null {
  return localStorage.getItem('riva_token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = normalizedPath.startsWith('http') ? normalizedPath : `${API_BASE}${normalizedPath}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || response.statusText || 'API request failed';
    throw new Error(errorMessage);
  }

  return data as T;
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('riva_token', token);
  } else {
    localStorage.removeItem('riva_token');
  }
}

export function getStoredAuthToken(): string | null {
  return getAuthToken();
}
