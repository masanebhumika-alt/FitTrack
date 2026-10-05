import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Auth from '../pages/Auth';
import App from '../App';

describe('Auth page', () => {
  it('renders the login form', () => {
    render(<MemoryRouter><Auth mode="login" /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders the register form', () => {
    render(<MemoryRouter><Auth mode="register" /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows the server error on failed login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 401, statusText: 'Unauthorized',
      json: async () => ({ error: 'Invalid email or password' }),
    }));
    render(<MemoryRouter><Auth mode="login" /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password'));
  });
});

describe('routing', () => {
  it('redirects anonymous users to the login page', () => {
    render(<MemoryRouter initialEntries={['/dashboard']}><App /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });
});
