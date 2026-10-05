import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { WorkoutDay } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Workout() {
  const [plan, setPlan] = useState<WorkoutDay[]>();

  useEffect(() => { api<WorkoutDay[]>('/plans/workout').then(setPlan); }, []);

  if (!plan) return <p>Loading...</p>;
  if (plan.length === 0)
    return <p className="card">No plan yet. Save your <Link className="text-blue-600" to="/profile">profile</Link> to generate one.</p>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Weekly Workout</h1>
      <div className="grid2">
        {plan.map((x) => (
          <div className="card" key={x.dayOfWeek}>
            <b>{DAYS[x.dayOfWeek]} — {x.title}</b>
            <p className="text-sm text-slate-500 mb-3">{x.difficulty}</p>
            {x.exercises.map((e) => (
              <div className="border-t py-2" key={e.name}>
                {e.name} · {e.sets ? `${e.sets} × ${e.reps}` : e.reps ? `${e.reps} reps` : `${e.durationMin} min`}{' '}
                <span className="text-slate-400">({e.equipment})</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
