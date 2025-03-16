import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children, showSidebar = false }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar (if enabled) */}
            {showSidebar && (
              <aside className="w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {/* Sidebar content will be passed as children */}
                  <div className="space-y-6">
                    {children.sidebar}
                  </div>
                </div>
              </aside>
            )}

            {/* Main Content Area */}
            <div className={`flex-grow ${showSidebar ? 'max-w-[calc(100%-16rem)]' : ''}`}>
              {showSidebar ? children.content : children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
} 