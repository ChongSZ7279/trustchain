import React from 'react';
import { Helmet } from 'react-helmet-async';
import SubscriptionList from '../components/SubscriptionList';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const SubscriptionsPage = () => {
  const { currentUser } = useAuth();

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Your Subscriptions | TrustChain</title>
        <meta name="description" content="Manage your recurring donations and subscriptions" />
      </Helmet>
      
      <SubscriptionList />
    </>
  );
};

export default SubscriptionsPage;