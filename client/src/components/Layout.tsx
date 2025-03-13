import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed bottom-5 right-5 bg-[#1E3A8A] text-white rounded-full p-3 shadow-lg z-40"
          aria-label="Toggle Sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
        
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />
        
        {/* Main Content */}
        {children}
      </div>
      
      <Footer />
    </div>
  );
}
