import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProtectedLayout() {
  const { currentUser, accountType, authChecked, loading } = useAuth();
  
  console.log('ProtectedLayout - Auth state:', { 
    currentUser: currentUser ? 'exists' : 'null', 
    accountType, 
    authChecked, 
    loading 
  });

  // Show loading state while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    console.log('ProtectedLayout - Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  console.log('ProtectedLayout - Authenticated, rendering protected content');
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
} 