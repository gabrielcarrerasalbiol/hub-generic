import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Comprobar si el usuario ya ha aceptado las cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    // Si no hay registro de aceptación, mostrar el banner
    if (!cookiesAccepted) {
      // Pequeño retraso para no mostrar inmediatamente al cargar la página
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    // Guardar la aceptación en localStorage
    localStorage.setItem('cookiesAccepted', 'true');
    // Ocultar el banner
    setIsVisible(false);
  };

  const declineCookies = () => {
    // Guardar la negación en localStorage (sólo para no volver a mostrar el banner)
    localStorage.setItem('cookiesAccepted', 'false');
    // Ocultar el banner
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#2A2040] shadow-lg border-t border-gray-200 dark:border-gray-700 z-50 px-4 py-3 transition-all duration-300 ease-in-out">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex-1 pr-4 mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tu privacidad es importante</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
              Al hacer clic en "Aceptar", consientes el uso de todas nuestras cookies. También puedes 
              visitar nuestra <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">política de cookies</Link> para 
              más información.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-gray-300 dark:border-gray-600"
              onClick={declineCookies}
            >
              Rechazar
            </Button>
            <Button 
              className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white"
              onClick={acceptCookies}
            >
              Aceptar cookies
            </Button>
            <button 
              onClick={declineCookies}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 md:hidden"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}