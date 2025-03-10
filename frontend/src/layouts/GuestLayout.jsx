import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GuestLayout() {
  const { user, organization } = useAuth();

  // Redirect if already authenticated
  if (user || organization) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
} 