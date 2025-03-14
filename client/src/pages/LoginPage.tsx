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
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-1/4 bg-blue-900 text-white p-8 hidden lg:flex lg:flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Hub Madridista</h2>
          <p className="text-gray-200">La plataforma definitiva para los fans del Real Madrid</p>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Todo el contenido en un lugar</h3>
            <p className="text-gray-200">Videos, noticias y contenido de todas las plataformas</p>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Contenido personalizado</h3>
            <p className="text-gray-200">Descubre contenido relevante para ti</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Mantente al día</h3>
            <p className="text-gray-200">No te pierdas ninguna actualización de tu equipo favorito</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-3/4 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Iniciar sesión</h1>
            <p className="text-gray-600">Accede a todo el contenido de tu equipo favorito</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}