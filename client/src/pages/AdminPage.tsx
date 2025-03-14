import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import UserManagement from '@/components/admin/UserManagement';

export default function AdminPage() {
  const { isAdmin, checkAuth } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirigir si el usuario no está autenticado o no es administrador
    if (!checkAuth()) {
      setLocation('/login');
    } else if (!isAdmin()) {
      setLocation('/');
    }
  }, [checkAuth, isAdmin, setLocation]);

  return (
    <div className="container max-w-6xl py-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      
      <div className="grid gap-6">
        <UserManagement />
      </div>
    </div>
  );
}