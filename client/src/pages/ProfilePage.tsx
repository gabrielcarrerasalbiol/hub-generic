import { useEffect } from 'react';
import { useLocation } from 'wouter';
import UserProfile from '@/components/auth/UserProfile';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, checkAuth } = useAuth();
  
  // Redirigir si el usuario no está autenticado
  useEffect(() => {
    if (!user && !checkAuth()) {
      setLocation('/login');
    }
  }, [user, checkAuth, setLocation]);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-screen-md mx-auto pt-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Mi Perfil</h1>
        <UserProfile />
      </div>
    </div>
  );
}