import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaFilter, FaTimes, FaBars } from 'react-icons/fa';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Only show sidebar on organization and charities list pages, not on detail pages
  const showSidebar = (location.pathname === '/organizations' || location.pathname === '/charities') && 
                     !location.pathname.match(/\/organizations\/\d+$/) && 
                     !location.pathname.match(/\/charities\/\d+$/);

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col">
      <Navbar />
      <div className="flex-grow pt-16">
        <div className="flex">
          {/* Sidebar - Only show on specific pages */}
          {showSidebar && (
            <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64'} overflow-y-auto z-40`}>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaFilter className="mr-2" />
                  Filters
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
              </div>
              {/* Render the current page's filters */}
              <div className="p-4">
                <Outlet context={{ isSidebarOpen, setIsSidebarOpen, showSidebar, location: 'sidebar' }} />
              </div>
            </aside>
          )}

          {/* Toggle button when sidebar is closed */}
          {showSidebar && !isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="fixed left-4 top-20 z-50 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
            >
              <FaBars className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Main Content */}
          <main className={`flex-1 transition-all duration-300 ${showSidebar && isSidebarOpen ? 'ml-64' : 'ml-0'} p-6`}>
            <Outlet context={{ isSidebarOpen, setIsSidebarOpen, showSidebar, location: 'main' }} />
          </main>
        </div>
      </div>
      <Footer isSidebarOpen={showSidebar && isSidebarOpen} />
    </div>
  );
}