import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, saveToken } from '../api';

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const r = await api<{ token: string; onboarded: boolean }>(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveToken(r.token);
      navigate(r.onboarded ? '/dashboard' : '/profile');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <form className="card w-full max-w-md" onSubmit={submit}>
        <h1 className="text-3xl font-bold mb-2">FitTrack</h1>
        <p className="text-slate-500 mb-6">
          {mode === 'login' ? 'Log in to your account.' : 'Create your account.'}
        </p>
        {error && <p role="alert" className="text-red-600 mb-3">{error}</p>}
        <label className="label" htmlFor="email">Email</label>
        <input id="email" className="field mb-4" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <label className="label" htmlFor="password">Password</label>
        <input id="password" className="field mb-5" type="password" required minLength={6} value={password}
          onChange={(e) => setPassword(e.target.value)} />
        <button className="btn w-full" disabled={busy}>
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
        <p className="text-sm mt-4">
          {mode === 'login' ? (
            <>New here? <Link className="text-blue-600" to="/register">Register</Link></>
          ) : (
            <>Already registered? <Link className="text-blue-600" to="/login">Login</Link></>
          )}
        </p>
        {mode === 'login' && (
          <p className="text-xs text-slate-400 mt-3">Demo (after seeding): demo@fittrack.local / demo12345</p>
        )}
      </form>
    </div>
  );
}
