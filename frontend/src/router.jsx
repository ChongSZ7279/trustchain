import { createBrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import UserRegistration from './components/UserRegistration';
import OrganizationRegistration from './components/OrganizationRegistration';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboard from './components/UserDashboard';
import OrganizationDashboard from './components/OrganizationDashboard';
import OrganizationList from './components/OrganizationList';
import OrganizationDetails from './components/OrganizationDetails';
import OrganizationEdit from './components/OrganizationEdit';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register/user',
    element: <UserRegistration />
  },
  {
    path: '/register/organization',
    element: <OrganizationRegistration />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiresUser>
        <UserDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/organization/dashboard',
    element: (
      <ProtectedRoute requiresOrganization>
        <OrganizationDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/organizations',
    element: (
      <ProtectedRoute>
        <OrganizationList />
      </ProtectedRoute>
    )
  },
  {
    path: '/organizations/:id',
    element: (
      <ProtectedRoute>
        <OrganizationDetails />
      </ProtectedRoute>
    )
  },
  {
    path: '/organizations/:id/edit',
    element: (
      <ProtectedRoute>
        <OrganizationEdit />
      </ProtectedRoute>
    )
  }
]);

export default router;
