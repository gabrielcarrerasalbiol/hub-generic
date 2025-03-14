import { useEffect } from 'react';
import { useLocation } from 'wouter';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { user, checkAuth } = useAuth();
  
  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (user || checkAuth()) {
      setLocation('/');
    }
  }, [user, checkAuth, setLocation]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-1/4 bg-blue-900 text-white p-8 hidden lg:flex lg:flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Hub Madridista</h2>
          <p className="text-gray-200">La plataforma definitiva para los fans del Real Madrid</p>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Contenido exclusivo</h3>
            <p className="text-gray-200">Accede a contenido premium y guarda tus favoritos</p>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Comunidad madridista</h3>
            <p className="text-gray-200">Únete a la comunidad de aficionados</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Beneficios premium</h3>
            <p className="text-gray-200">Disfruta de todos los beneficios como miembro</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-3/4 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
            <p className="text-gray-600">Únete para acceder a todo el contenido exclusivo</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}