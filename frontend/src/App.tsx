import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { token } from './api';
import Shell from './components/Shell';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/Profile';
import Workout from './pages/Workout';
import Diet from './pages/Diet';
import Progress from './pages/Progress';
import Reminders from './pages/Reminders';

function RequireAuth() {
  if (!token()) return <Navigate to="/login" replace />;
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/reminders" element={<Reminders />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
