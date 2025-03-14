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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hub Madridista</h1>
          <p className="text-gray-600">Únete para acceder a todo el contenido exclusivo</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}