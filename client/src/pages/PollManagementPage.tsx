import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import PollManagement from '@/components/polls/PollManagement';

export default function PollManagementPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      setLocation('/');
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  // Mostrar pantalla de carga mientras verificamos la autenticación
  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[500px]">
        <span>Cargando...</span>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no mostrar nada (la redirección se encargará)
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Si es admin, mostrar la interfaz de gestión de encuestas
  return <PollManagement />;
}