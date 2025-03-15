import { useEffect } from 'react';
import { useLocation } from 'wouter';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  // Usar selectores específicos para mejorar el rendimiento
  const user = useAuth((state) => state.user);
  const token = useAuth((state) => state.token);
  
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
          <div className="relative mb-8 overflow-hidden rounded-lg shadow-md h-64 bg-[#001C58]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#001C58]/60 to-[#001C58]/90 flex items-end p-4">
              <p className="text-white text-lg font-medium">La plataforma definitiva para los fans del Real Madrid</p>
            </div>
          </div>
        </div>
        
        <div className="flex-grow flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-[#001C58]">Contenido exclusivo</h3>
            <p className="text-[#001C58]">Accede a contenido premium y guarda tus favoritos</p>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-[#001C58]">Comunidad madridista</h3>
            <p className="text-[#001C58]">Únete a la comunidad de aficionados</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-[#001C58]">Beneficios premium</h3>
            <p className="text-[#001C58]">Disfruta de todos los beneficios como miembro</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-2/3 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-1">
              <span className="text-[#001C58]">Hub</span>
              <span className="text-[#FDBE11]">Madridista</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#001C58] to-[#FDBE11] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Crear cuenta</h2>
            <p className="text-gray-600">Únete para acceder a todo el contenido exclusivo</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}