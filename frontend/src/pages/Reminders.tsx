import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';
import { Reminder } from '../types';

export default function Reminders() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [label, setLabel] = useState('Drink water');
  const [time, setTime] = useState('10:00');
  const [error, setError] = useState('');

  const load = () => api<Reminder[]>('/reminders').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/reminders', { method: 'POST', body: JSON.stringify({ type: 'general', label, time, enabled: true }) });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(id: number) {
    await api(`/reminders/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Reminders</h1>
      <form className="card mb-5" onSubmit={add}>
        <div className="grid2">
          <input className="field" aria-label="Reminder label" required minLength={2} value={label}
            onChange={(e) => setLabel(e.target.value)} />
          <input className="field" aria-label="Reminder time" type="time" required value={time}
            onChange={(e) => setTime(e.target.value)} />
        </div>
        <button className="btn mt-3">Add reminder</button>
        {error && <p role="alert" className="text-red-600 mt-3">{error}</p>}
      </form>
      <div className="card">
        {items.length === 0 && <p className="text-slate-500">No reminders yet.</p>}
        {items.map((x) => (
          <div className="flex justify-between border-b py-3" key={x.id}>
            <span>{x.time} — {x.label}</span>
            <button className="btn danger" onClick={() => remove(x.id)}>Delete</button>
          </div>
        ))}
      </div>
    </>
  );
}
