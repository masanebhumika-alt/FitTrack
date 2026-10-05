import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';
import { FitnessPlan, GOALS, Goal, Profile } from '../types';

const ACTIVITY = ['sedentary', 'light', 'moderate', 'very_active', 'athlete'];
const NUMBER_FIELDS: [keyof Profile, string][] = [
  ['age', 'Age'],
  ['heightCm', 'Height (cm)'],
  ['weightKg', 'Current weight (kg)'],
  ['targetWeightKg', 'Target weight (kg)'],
];

// Form values are kept as strings so the inputs can be edited freely.
type Form = Record<keyof Profile, string>;
const empty: Form = {
  name: '', age: '21', gender: 'other', heightCm: '170',
  weightKg: '70', targetWeightKg: '65', activityLevel: 'moderate',
};

export default function ProfilePage() {
  const [form, setForm] = useState<Form>(empty);
  const [goal, setGoal] = useState<Goal>('weight_loss');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<Profile | null>('/profile').then((p) => {
      if (p) setForm({ ...empty, ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) });
    }).catch((e) => setError(e.message));
    api<FitnessPlan | null>('/plans').then((p) => p && setGoal(p.goal)).catch(() => undefined);
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name.trim(),
          age: Number(form.age),
          gender: form.gender,
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
          targetWeightKg: Number(form.targetWeightKg),
          activityLevel: form.activityLevel,
        }),
      });
      await api('/profile/generate-plan', { method: 'POST', body: JSON.stringify({ goal }) });
      setMessage('Profile saved and plan generated!');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const set = (k: keyof Profile, v: string) => setForm({ ...form, [k]: v });

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Profile & Goal</h1>
      <form className="card" onSubmit={save}>
        <div className="grid2">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" className="field" required minLength={2} value={form.name}
              onChange={(e) => set('name', e.target.value)} />
          </div>
          {NUMBER_FIELDS.map(([k, label]) => (
            <div key={k}>
              <label className="label" htmlFor={k}>{label}</label>
              <input id={k} className="field" type="number" step="any" required value={form[k]}
                onChange={(e) => set(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="label" htmlFor="gender">Gender</label>
            <select id="gender" className="field" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="activity">Activity</label>
            <select id="activity" className="field" value={form.activityLevel}
              onChange={(e) => set('activityLevel', e.target.value)}>
              {ACTIVITY.map((a) => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="goal">Goal</label>
            <select id="goal" className="field" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
              {(Object.keys(GOALS) as Goal[]).map((g) => <option key={g} value={g}>{GOALS[g]}</option>)}
            </select>
          </div>
        </div>
        <button className="btn mt-5">Save & Generate Plan</button>
        {message && <p className="text-green-600 mt-3">{message}</p>}
        {error && <p role="alert" className="text-red-600 mt-3">{error}</p>}
      </form>
    </>
  );
}
