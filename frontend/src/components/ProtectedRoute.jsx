import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiresUser, requiresOrganization }) {
    const { user, organization, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (requiresUser && !user) {
        return <Navigate to="/login" />;
    }

    if (requiresOrganization && !organization) {
        return <Navigate to="/login" />;
    }

    if (!requiresUser && !requiresOrganization && !(user || organization)) {
        return <Navigate to="/login" />;
    }

    return children;
} 