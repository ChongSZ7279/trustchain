import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiresUser, requiresOrganization }) {
    const { currentUser, accountType, loading, authChecked } = useAuth();
    
    console.log('ProtectedRoute - Auth state:', { 
        currentUser: currentUser ? 'exists' : 'null', 
        accountType, 
        loading,
        authChecked,
        requiresUser,
        requiresOrganization
    });

    if (loading || !authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (requiresUser && (accountType !== 'user' || !currentUser)) {
        console.log('ProtectedRoute - User required but not authenticated as user, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (requiresOrganization && (accountType !== 'organization' || !currentUser)) {
        console.log('ProtectedRoute - Organization required but not authenticated as organization, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (!requiresUser && !requiresOrganization && !currentUser) {
        console.log('ProtectedRoute - Authentication required but not authenticated, redirecting to login');
        return <Navigate to="/login" />;
    }

    console.log('ProtectedRoute - Authentication requirements met, rendering protected content');
    return children;
} 