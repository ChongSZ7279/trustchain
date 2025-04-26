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
import UserEdit from './components/UserEdit';
import TransactionList from './components/TransactionList';
import TransactionDetails from './components/TransactionDetails';
import DonationForm from './components/DonationForm';
import DonationDetails from './components/DonationDetails';
import TermsAndConditions from './pages/TermsAndConditions';
import Guidelines from './pages/Guidelines';
import FAQ from './pages/FAQ';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ApiTest from './components/ApiTest';
import Invoice from './components/Invoice';
import BlockchainTester from './components/BlockchainTester';
import SponsorshipPartners from './components/SponsorshipPartners';
import BlockchainBasics from './pages/BlockchainBasics';
import AdminVerificationPanel from './components/admin/AdminVerificationPanel';
import OrganizationVerificationPanel from './components/admin/OrganizationVerificationPanel';
import UserVerificationPanel from './components/admin/UserVerificationPanel';
import CharityVerificationPanel from './components/admin/CharityVerificationPanel';
import AdminDashboard from './components/admin/AdminDashboard';
import CarbonMarket from './components/CarbonMarket';
import ErrorBoundary from './components/ErrorBoundary';
import SubscriptionsPage from './pages/SubscriptionsPage';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/organizations',
        element: <OrganizationList />,
        handle: {
          title: "Organizations",
          subtitle: "Browse through our list of organizations"
        }
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
        path: '/carbonmarket',
        element: <CarbonMarket />,
        handle: {
          title: "Carbon Market",
          subtitle: "Explore and trade carbon credits"
        }
      },
      {
        path: '/terms',
        element: <TermsAndConditions />
      },
      {
        path: '/guidelines',
        element: <Guidelines />,
        handle: {
          title: "Website Guidelines",
          subtitle: "How to use TrustChain effectively"
        }
      },
      {
        path: '/faq',
        element: <FAQ />,
        handle: {
          title: "Frequently Asked Questions",
          subtitle: "Find answers to common questions about TrustChain"
        }
      },
      {
        path: '/partners',
        element: <SponsorshipPartners />,
        handle: {
          title: "Sponsorship Partners",
          subtitle: "The organizations that make our work possible"
        }
      },
      {
        path: '/api-test',
        element: <ApiTest />,
        handle: {
          title: "API Connection Test",
          subtitle: "Test the connection to the backend API"
        }
      },
      {
        path: '/blockchain-basics',
        element: <BlockchainBasics />,
        handle: {
          title: "Blockchain Basics",
          subtitle: "Learn the basics of blockchain technology"
        }
      },
      {
        path: '/transactions',
        element: <TransactionList />
      },
      {
        path: '/transactions/:id',
        element: <TransactionDetails />
      },
      {
        path: '/charities/:id/donate',
        element: <DonationForm />
      },
      {
        path: '/donations/:id',
        element: <DonationDetails />
      },
      {
        path: '/donations',
        element: <TransactionList dataSource="donations" />
      },
      {
        path: '/financial-activities',
        element: <TransactionList dataSource="combined" />
      },
      {
        path: '/charities/:charityId/transactions',
        element: <TransactionList />
      },
      {
        path: '/charities/:charityId/donations',
        element: <TransactionList dataSource="donations" />
      },
      {
        path: '/charities/:charityId/financial-activities',
        element: <TransactionList dataSource="combined" />
      },
    ]
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/login',
        element: <Login />,
        handle: {
          title: "Welcome Back!",
          subtitle: "Please sign in to your account"
        }
      },
      {
        path: '/register',
        element: <Register />,
        handle: {
          title: "Create Your Account",
          subtitle: "Join our community and start making a difference"
        }
      },
      {
        path: '/register/user',
        element: <UserRegistration />,
        handle: {
          title: "Create Your Account",
          subtitle: "Join our community and start making a difference"
        }
      },
      {
        path: '/register/organization',
        element: <OrganizationRegistration />,
        handle: {
          title: "Register Your Organization",
          subtitle: "Join our platform and make a positive impact in the community"
        }
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
        handle: {
          title: "Forgot Password",
          subtitle: "Please enter your email to reset your password"
        }
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
        handle: {
          title: "Reset Password",
          subtitle: "Please enter your new password"
        }
      }
    ]
  },
  {
    element: <ProtectedLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/user/dashboard',
        element: <UserDashboard />,
        errorElement: <ErrorBoundary />
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
        path: '/charities/:charityId/tasks/create',
        element: <TaskForm />
      },
      {
        path: '/charities/:charityId/tasks/:taskId/edit',
        element: <TaskForm />
      },
      {
        path: '/donations/:donationId/invoice',
        element: <Invoice />
      },
      {
        path: '/admin/dashboard',
        element: <AdminDashboard />
      },
      {
        path: '/admin/verification/tasks',
        element: <AdminVerificationPanel />
      },
      {
        path: '/admin/verification/organizations',
        element: <OrganizationVerificationPanel />
      },
      {
        path: '/admin/verification/charities',
        element: <CharityVerificationPanel />
      },
      {
        path: '/admin/verification/users',
        element: <UserVerificationPanel />
      },
      {
        path: '/subscriptions',
        element: <SubscriptionsPage />,
        handle: {
          title: "My Subscriptions",
          subtitle: "Manage your active subscriptions"
        }
      }
    ]
  },
  {
    path: '/blockchain-test',
    element: <BlockchainTester />
  }
]);

export default router;
