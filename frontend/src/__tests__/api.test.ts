import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, saveToken, token } from '../api';

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'x',
    json: async () => body,
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('api client', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('stores and reads the token', () => {
    saveToken('abc');
    expect(token()).toBe('abc');
  });

  it('sends the bearer token and returns JSON', async () => {
    saveToken('abc');
    const fetchFn = mockFetch(200, { ok: true });
    const data = await api('/dashboard');
    expect(data).toEqual({ ok: true });
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe('/api/dashboard');
    expect(init.headers.Authorization).toBe('Bearer abc');
  });

  it('throws the server error message', async () => {
    mockFetch(409, { error: 'Email already registered' });
    await expect(api('/auth/register', { method: 'POST' })).rejects.toThrow('Email already registered');
  });

  it('returns null for 204 responses', async () => {
    mockFetch(204, null);
    expect(await api('/reminders/1', { method: 'DELETE' })).toBeNull();
  });
});
