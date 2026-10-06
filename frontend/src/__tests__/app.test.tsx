import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Auth, Dashboard } from '../main';

// Replaces the browser's fetch with a fake server response.
function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(async (..._args: unknown[]) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: new Headers(),
  }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

const renderAuth = (mode: 'login' | 'register') =>
  render(
    <MemoryRouter>
      <Auth mode={mode} />
    </MemoryRouter>,
  );

describe('Login and register form', () => {
  it('sends the typed credentials to the login endpoint', async () => {
    const fetchMock = mockFetch(200, { token: 'test-token', onboarded: true });
    renderAuth('login');

    fireEvent.change(screen.getByDisplayValue('demo@fittrack.local'), { target: { value: 'new@test.local' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as [unknown, RequestInit];
    expect(String(url)).toContain('/auth/login');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ email: 'new@test.local', password: 'demo12345' });
  });

  it('shows an error message when the server rejects the login', async () => {
    mockFetch(401, { error: 'Invalid email or password' });
    const { container } = renderAuth('login');

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(container.querySelector('.text-red-600')).not.toBeNull());
  });

  it('register mode posts to the register endpoint', async () => {
    const fetchMock = mockFetch(201, { token: 'test-token', onboarded: false });
    renderAuth('register');

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toContain('/auth/register');
  });
});

describe('Dashboard', () => {
  const dashboardData = {
    profile: { name: 'Alex' },
    plan: { bmi: 24.7, targetCalories: 2000, goal: 'weight_loss' },
    water: { glasses: 5 },
    sleep: { hours: 7.5 },
    workouts: [],
  };

  it('shows a loading message first, then the data from the API', async () => {
    mockFetch(200, dashboardData);
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(await screen.findByText('Welcome, Alex')).toBeTruthy();
    expect(screen.getByText('24.7')).toBeTruthy();
    expect(screen.getByText('2000')).toBeTruthy();
    expect(screen.getByText('5 glasses')).toBeTruthy();
    expect(screen.getByText('7.5 h')).toBeTruthy();
  });

  it('shows an error message when the API fails', async () => {
    mockFetch(500, { error: 'Something went wrong on the server' });
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await waitFor(() => expect(container.querySelector('.text-red-600')).not.toBeNull());
  });
});
