import React from 'react';
import { Link, Outlet, useMatches } from 'react-router-dom';

export default function AuthLayout() {
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <Link to="/" className="flex justify-center">
          <span className="text-3xl font-bold text-indigo-600">TrustChain</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {handle?.title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {handle?.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 