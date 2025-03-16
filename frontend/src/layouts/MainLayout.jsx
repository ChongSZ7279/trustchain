import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
          <Outlet />
      </main>
      <Footer />
    </div>
  );
}
