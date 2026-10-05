import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '../api';

const links: [string, string][] = [
  ['/dashboard', 'Dashboard'],
  ['/profile', 'Profile'],
  ['/workout', 'Workout'],
  ['/diet', 'Diet'],
  ['/progress', 'Progress'],
  ['/reminders', 'Reminders'],
];

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
          <b className="text-xl text-blue-600">FitTrack</b>
          <button className="btn secondary" onClick={logout} aria-label="Log out" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-5 py-6">
        <nav className="flex flex-wrap gap-2 mb-6">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg border ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-blue-50'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
