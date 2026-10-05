import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, today } from '../api';
import { SleepLog, WaterLog, WeightLog } from '../types';

const day = (iso: string) => iso.slice(0, 10);

export default function Progress() {
  const date = today();
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [weight, setWeight] = useState('');
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<WeightLog[]>('/weight').then(setWeights).catch((e) => setError(e.message));
    // The API returns the last 7 days; pick today's row explicitly.
    api<WaterLog[]>(`/water?date=${date}`).then((rows) =>
      setWater(rows.find((r) => day(r.date) === date)?.glasses ?? 0)).catch(() => undefined);
    api<SleepLog[]>(`/sleep?date=${date}`).then((rows) =>
      setSleep(rows.find((r) => day(r.date) === date)?.hours ?? 0)).catch(() => undefined);
  }, [date]);

  async function save() {
    setMessage('');
    setError('');
    try {
      if (weight) await api('/weight', { method: 'POST', body: JSON.stringify({ date, weightKg: Number(weight) }) });
      await api('/water', { method: 'POST', body: JSON.stringify({ date, glasses: water }) });
      await api('/sleep', { method: 'POST', body: JSON.stringify({ date, hours: sleep }) });
      setWeights(await api<WeightLog[]>('/weight'));
      setWeight('');
      setMessage('Saved!');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const chartData = weights.map((w) => ({ date: day(w.date).slice(5), kg: w.weightKg }));

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Progress Tracking</h1>
      <div className="grid2">
        <div className="card">
          <h2 className="font-bold mb-3">Today</h2>
          <label className="label" htmlFor="weight">Weight (kg)</label>
          <input id="weight" className="field mb-3" type="number" step="0.1" value={weight}
            onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 68.5" />
          <label className="label" htmlFor="water">Water glasses</label>
          <input id="water" className="field mb-3" type="number" min={0} max={30} value={water}
            onChange={(e) => setWater(Number(e.target.value))} />
          <label className="label" htmlFor="sleep">Sleep hours</label>
          <input id="sleep" className="field mb-3" type="number" min={0} max={24} step="0.5" value={sleep}
            onChange={(e) => setSleep(Number(e.target.value))} />
          <button className="btn" onClick={save}>Save tracking</button>
          {message && <p className="text-green-600 mt-3">{message}</p>}
          {error && <p role="alert" className="text-red-600 mt-3">{error}</p>}
        </div>
        <div className="card">
          <h2 className="font-bold mb-3">Weight history</h2>
          {chartData.length ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="kg" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500">No weight logs yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
