import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function PrivateRoute({ accountType }) {
  const { currentUser, accountType: userAccountType, loading, authChecked } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading || !authChecked) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If account type is specified and doesn't match, redirect to appropriate dashboard
  if (accountType && userAccountType !== accountType) {
    const redirectPath = userAccountType === 'user' 
      ? '/user/dashboard' 
      : '/organization/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and account type matches (or no specific account type required), render outlet
  return <Outlet />;
} 