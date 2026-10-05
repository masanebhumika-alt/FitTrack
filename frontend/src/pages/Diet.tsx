import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Meal } from '../types';

export default function Diet() {
  const [meals, setMeals] = useState<Meal[]>();

  useEffect(() => { api<Meal[]>('/plans/diet').then(setMeals); }, []);

  if (!meals) return <p>Loading...</p>;
  if (meals.length === 0)
    return <p className="card">No plan yet. Save your <Link className="text-blue-600" to="/profile">profile</Link> to generate one.</p>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Diet Plan</h1>
      <div className="grid2">
        {meals.map((m) => (
          <div className="card" key={m.mealType}>
            <b className="capitalize">{m.mealType}</b>
            <p className="text-blue-600 font-semibold my-2">{m.calories} kcal</p>
            {m.items.map((i) => (
              <div className="border-t py-2" key={i.food}>
                {i.food} — {i.portion}
                <div className="text-xs text-slate-500">P {i.proteinG}g · C {i.carbsG}g · F {i.fatG}g</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
