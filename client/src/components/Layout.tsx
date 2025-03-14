import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { error } = useAuth();
  
  // Verificar si hay bloqueo permanente activo
  const [isServiceBlocked, setIsServiceBlocked] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authErrorFlag = window.localStorage.getItem('auth_service_blocked');
      const apiRateLimitFlag = window.localStorage.getItem('hubmadridista_rate_limited');
      
      setIsServiceBlocked(!!authErrorFlag || !!apiRateLimitFlag);
    }
  }, []);

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
        <div className="flex-1 px-4 py-4 md:px-6">
          {isServiceBlocked && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Servicio temporalmente no disponible</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>
                  El servicio de autenticación está temporalmente limitado debido a actividad inusual.
                  Por favor, intente nuevamente en unos minutos o contacte al soporte.
                </p>
                <button 
                  onClick={() => {
                    // Limpiar flags de bloqueo
                    if (typeof window !== 'undefined') {
                      window.localStorage.removeItem('auth_service_blocked');
                      window.localStorage.removeItem('hubmadridista_rate_limited');
                      // Recargar la página para aplicar cambios
                      window.location.reload();
                    }
                  }}
                  className="bg-primary hover:bg-primary/90 text-white py-1 px-3 rounded text-sm w-fit"
                >
                  Intentar desbloquear
                </button>
              </AlertDescription>
            </Alert>
          )}
          
          {error && !isServiceBlocked && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
