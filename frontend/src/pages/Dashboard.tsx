import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, today } from '../api';
import { DashboardData, GOALS } from '../types';

export default function Dashboard() {
  const [d, setD] = useState<DashboardData>();
  const [error, setError] = useState('');

  useEffect(() => {
    api<DashboardData>(`/dashboard?date=${today()}`).then(setD).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!d) return <p>Loading...</p>;

  const todays = d.workouts.find((w) => w.dayOfWeek === new Date().getDay());

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Welcome{d.profile ? `, ${d.profile.name}` : ''}</h1>
      <p className="text-slate-500 mb-6">Your daily snapshot.</p>
      {!d.plan && (
        <div className="card mb-5">
          Complete your <Link className="text-blue-600" to="/profile">profile</Link> to generate a personalized plan.
        </div>
      )}
      <div className="grid2 mb-5">
        <Stat label="BMI" value={d.plan?.bmi ?? '—'} />
        <Stat label="Target calories" value={d.plan?.targetCalories ?? '—'} />
        <Stat label="Water today" value={`${d.water?.glasses ?? 0} glasses`} />
        <Stat label="Sleep" value={`${d.sleep?.hours ?? 0} h`} />
      </div>
      <div className="card">
        <h2 className="font-bold text-lg mb-3">Today’s plan</h2>
        <p>{todays?.title || 'Generate a plan from your profile'}</p>
        <p className="text-slate-500 mt-2">Goal: {d.plan ? GOALS[d.plan.goal] : 'Not set'}</p>
        {d.plan && (
          <p className="text-slate-500 mt-1">
            Macros: P {d.plan.proteinG}g · C {d.plan.carbsG}g · F {d.plan.fatG}g
          </p>
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-slate-500">{label}</p>
      <b className="text-3xl">{value}</b>
    </div>
  );
}
