import { create } from 'zustand';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: UserAuth | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  register: (username: string, password: string, email?: string, name?: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<{name: string, email: string, profilePicture: string}>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  checkAuth: () => boolean;
  isAdmin: () => boolean;
  isPremium: () => boolean;
  isFree: () => boolean;
  getUserRole: () => string | null;
  processToken: (token: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface UserAuth {
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  profilePicture: string | null;
  role: 'free' | 'premium' | 'admin';
}

interface AuthResponse {
  user: UserAuth;
  token: string;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('hubmadridista_token'),
  isLoading: false,
  error: null,
  
  register: async (username: string, password: string, email?: string, name?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const confirmPassword = password;
      const result = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, confirmPassword, email, name }),
      });
      
      localStorage.setItem('hubmadridista_token', result.token);
      set({ user: result.user, token: result.token, isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Error en el registro:', error);
      
      // Comprobar si el error tiene un mensaje específico del servidor
      let errorMessage = 'Error en el registro';
      
      try {
        // Intentar parsear el mensaje de error para obtener detalles específicos
        if (error.message && error.message.includes(':')) {
          const parts = error.message.split(':');
          if (parts.length > 1) {
            const errorBody = JSON.parse(parts[1].trim());
            errorMessage = errorBody.error || errorMessage;
          }
        }
      } catch (e) {
        // Si hay algún error al parsear, usamos el mensaje original
        errorMessage = error.message || errorMessage;
      }
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      
      // Lanzar el error para que pueda ser capturado por el componente
      throw new Error(errorMessage);
    }
  },
  
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Primero, asegurarse de que no hay tokens antiguos que puedan causar problemas
      localStorage.removeItem('hubmadridista_token');
      
      const result = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      // Guardar el nuevo token
      localStorage.setItem('hubmadridista_token', result.token);
      
      // Actualizar el estado
      set({ user: result.user, token: result.token, isLoading: false });
      
      // Usar setTimeout para asegurar que el estado se actualice antes de redireccionar
      setTimeout(() => {
        // Usar window.location.replace en lugar de window.location.href
        window.location.replace('/');
      }, 500);
      
      return true;
    } catch (error: any) {
      console.error('Error en el inicio de sesión:', error);
      
      // Obtener un mensaje de error claro para mostrar al usuario
      let errorMessage = error.message || 'Usuario o contraseña incorrectos';
      
      // Establecer el error en el estado para que esté disponible en cualquier lugar
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      
      return false;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    } finally {
      localStorage.removeItem('hubmadridista_token');
      set({ user: null, token: null, isLoading: false });
      
      // Usar setTimeout para asegurar que el estado se actualice antes de redireccionar
      setTimeout(() => {
        window.location.replace('/login');
      }, 300);
    }
  },
  
  fetchUser: async () => {
    const { token, user } = get();
    
    // Si ya tenemos un usuario, no necesitamos volver a cargarlo
    if (!token || user) {
      set({ isLoading: false });
      return;
    }
    
    // Usamos una variable para evitar actualizaciones de estado después de desmontar
    let isCancelled = false;
    set({ isLoading: true });
    
    try {
      const fetchedUser = await apiRequest<UserAuth>('/api/auth/me');
      
      // Solo actualizamos el estado si la operación no fue cancelada
      if (!isCancelled) {
        set({ user: fetchedUser, isLoading: false });
        // Establecemos la marca de cancelación para evitar actualizaciones adicionales
        isCancelled = true;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if (!isCancelled) {
        localStorage.removeItem('hubmadridista_token');
        set({ user: null, token: null, isLoading: false });
        isCancelled = true;
      }
    }
  },
  
  updateProfile: async (data: Partial<{name: string, email: string, profilePicture: string}>) => {
    set({ isLoading: true, error: null });
    
    try {
      const user = await apiRequest<UserAuth>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      set({ user, isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al actualizar perfil', 
        isLoading: false 
      });
      return false;
    }
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiRequest('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al cambiar contraseña', 
        isLoading: false 
      });
      return false;
    }
  },
  
  checkAuth: () => {
    const { token } = get();
    return !!token;
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin';
  },

  isPremium: () => {
    const { user } = get();
    return user?.role === 'premium' || user?.role === 'admin';
  },

  isFree: () => {
    const { user } = get();
    return user?.role === 'free';
  },

  getUserRole: () => {
    const { user } = get();
    return user?.role || null;
  },
  
  processToken: async (token: string) => {
    localStorage.setItem('hubmadridista_token', token);
    set({ token });
    await get().fetchUser();
  },
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
}));

// Hook para manejar la redirección automática del token de URL
export function useTokenHandler() {
  const { toast } = useToast();
  const { processToken } = useAuth();

  const handleTokenFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      try {
        await processToken(token);
        
        // Limpia el token de la URL
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.toString());
        
        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión correctamente.",
        });
      } catch (error) {
        console.error('Error procesando token de URL:', error);
        toast({
          title: "Error de autenticación",
          description: "No se pudo procesar el token de autenticación.",
          variant: "destructive",
        });
      }
    }
  };
  
  return { handleTokenFromUrl };
}