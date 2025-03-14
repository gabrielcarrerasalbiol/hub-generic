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
      <div className="w-1/4 bg-white text-[#001C58] p-8 hidden lg:flex lg:flex-col border-r-2 border-[#FDBE11]">
        <div className="mb-8">
          <img src="/images/hub-madridista-logo.jpg" alt="Hub Madridista" className="h-24 mb-4" />
          <p className="text-[#001C58] font-medium">La plataforma definitiva para los fans del Real Madrid</p>
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