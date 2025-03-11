import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import GuestLayout from './layouts/GuestLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './components/Home';
import Login from './components/Login';
import UserRegistration from './components/UserRegistration';
import OrganizationRegistration from './components/OrganizationRegistration';
import UserDashboard from './components/UserDashboard';
import OrganizationDashboard from './components/OrganizationDashboard';
import OrganizationList from './components/OrganizationList';
import OrganizationDetails from './components/OrganizationDetails';
import OrganizationEdit from './components/OrganizationEdit';
import CharityList from './components/CharityList';
import CharityDetails from './components/CharityDetails';
import CharityForm from './components/CharityForm';
import TaskForm from './components/TaskForm';
import TaskPictureManager from './components/TaskPictureManager';
import ImageTest from './components/ImageTest';
import UserEdit from './components/UserEdit';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/organizations',
        element: <OrganizationList />
      },
      {
        path: '/organizations/:id',
        element: <OrganizationDetails />
      },
      {
        path: '/charities',
        element: <CharityList />
      },
      {
        path: '/charities/:id',
        element: <CharityDetails />
      },
      {
        path: '/image-test',
        element: <ImageTest />,
      },
    ]
  },
  {
    element: <AuthLayout />,
    children: [
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
      }
    ]
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: '/user/dashboard',
        element: <UserDashboard />
      },
      {
        path: '/user/edit',
        element: <UserEdit />
      },
      {
        path: '/organization/dashboard',
        element: <OrganizationDashboard />
      },
      {
        path: '/organization/edit',
        element: <OrganizationEdit />
      },
      {
        path: '/organizations/:id/edit',
        element: <OrganizationEdit />
      },
      {
        path: '/charities/create',
        element: <CharityForm />
      },
      {
        path: '/charities/:id/edit',
        element: <CharityForm />
      },
      {
        path: '/charities/:id/tasks/create',
        element: <TaskForm />
      },
      {
        path: 'tasks/:taskId/edit',
        element: <TaskForm />
      },
      {
        path: 'tasks/:taskId/pictures',
        element: <TaskPictureManager />
      }
    ]
  }
]);

export default router;
