import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow pt-16">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}