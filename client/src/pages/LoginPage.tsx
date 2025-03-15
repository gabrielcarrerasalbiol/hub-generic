import { useEffect } from 'react';
import { useLocation } from 'wouter';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { useTokenHandler } from '@/hooks/useAuth';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  // Usar selectores específicos para optimizar
  const user = useAuth((state) => state.user);
  const token = useAuth((state) => state.token);
  const { handleTokenFromUrl } = useTokenHandler();
  
  // Verificar si hay un token en la URL (por ejemplo, después de login con Google/Apple)
  // Este useEffect solo se ejecuta una vez
  useEffect(() => {
    handleTokenFromUrl();
  }, []);
  
  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (user || token) {
      setLocation('/');
    }
  }, [user, token, setLocation]);

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-1/3 bg-white text-[#001C58] p-8 hidden lg:flex lg:flex-col border-r-2 border-[#FDBE11]">
        <div className="mb-8">
          <div className="relative mb-8 overflow-hidden rounded-lg shadow-md">
            <img 
              src="images/real-madrid-fans.jpg" 
              alt="Aficionados del Real Madrid" 
              className="w-full object-cover h-64"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#001C58]/80 to-transparent p-4">
              <p className="text-white text-lg font-medium">La plataforma definitiva para los fans del Real Madrid</p>
            </div>
          </div>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-[#001C58]">Todo el contenido en un lugar</h3>
            <p className="text-[#001C58]">Videos, noticias y contenido de todas las plataformas</p>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-[#001C58]">Contenido personalizado</h3>
            <p className="text-[#001C58]">Descubre contenido relevante para ti</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-[#001C58]">Mantente al día</h3>
            <p className="text-[#001C58]">No te pierdas ninguna actualización de tu equipo favorito</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-2/3 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-1">
              <span className="text-[#001C58]">Hub</span>
              <span className="text-[#FDBE11]">Madridista</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#001C58] to-[#FDBE11] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Iniciar sesión</h2>
            <p className="text-gray-600">Accede a todo el contenido de tu equipo favorito</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}