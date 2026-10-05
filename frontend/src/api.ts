const API = '/api';
const TOKEN_KEY = 'fittrack_token';

export const token = () => localStorage.getItem(TOKEN_KEY) || '';
export const saveToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/login';
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token()) headers.Authorization = `Bearer ${token()}`;

  const res = await fetch(API + path, { ...options, headers: { ...headers, ...(options.headers as object) } });

  if (!res.ok) {
    // An expired/invalid token on a protected call sends the user back to login.
    if (res.status === 401 && token() && !path.startsWith('/auth/')) logout();
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Request failed');
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

/** Today's date as YYYY-MM-DD in the user's local time zone. */
export const today = () => new Date().toLocaleDateString('en-CA');
