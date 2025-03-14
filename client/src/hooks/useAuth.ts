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

// Variables globales para control estricto de solicitudes
let isUserFetching = false;
let lastFetchTime = 0;
let requestFailCount = 0;
let authServiceBlocked = false;
const FETCH_COOLDOWN_MS = 10000; // 10 segundos entre solicitudes
const MAX_FAILURES = 2; // Después de 2 fallos, detenemos por completo
const GLOBAL_AUTH_FLAG = 'auth_fetch_in_progress';
const AUTH_ERROR_FLAG = 'auth_service_blocked';

// Verificar si el servicio ya fue bloqueado previamente
if (typeof window !== 'undefined') {
  const blockedFlag = window.localStorage.getItem(AUTH_ERROR_FLAG);
  if (blockedFlag) {
    console.log('Servicio de autenticación bloqueado permanentemente por errores previos');
    authServiceBlocked = true;
    
    // Eliminar cualquier token para forzar el estado no autenticado
    window.localStorage.removeItem('hubmadridista_token');
    window.sessionStorage.removeItem('hubmadridista_user');
  }
}

// Función para detectar y detener bucles de autenticación
function setupAuthGuard() {
  if (typeof window === 'undefined') return;
  
  // Si ya hay un indicador global de autenticación en progreso
  if (window.sessionStorage.getItem(GLOBAL_AUTH_FLAG)) {
    console.log('Evitando ciclo de autenticación redundante');
    return false;
  }
  
  // Establecer el indicador de bloqueo
  window.sessionStorage.setItem(GLOBAL_AUTH_FLAG, Date.now().toString());
  
  // Limpieza programada
  setTimeout(() => {
    window.sessionStorage.removeItem(GLOBAL_AUTH_FLAG);
  }, 5000);
  
  return true;
}

export const useAuth = create<AuthState>((set, get) => {
  // Obtenemos token de localStorage, pero con seguridad para SSR
  const safeGetToken = () => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('hubmadridista_token');
    }
    return null;
  };

  // Intentar recuperar el usuario del sessionStorage (caché)
  const getUserFromCache = () => {
    if (typeof window !== 'undefined') {
      const cachedUser = window.sessionStorage.getItem('hubmadridista_user');
      if (cachedUser) {
        try {
          return JSON.parse(cachedUser);
        } catch (e) {
          console.error('Error parsing cached user:', e);
        }
      }
    }
    return null;
  };

  return {
    // Estado inicial con caché de usuario
    user: getUserFromCache(),
    token: safeGetToken(),
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
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hubmadridista_token', result.token);
          console.log('Token guardado en localStorage', result.token.substring(0, 10) + '...');
        } else {
          console.error('No se pudo guardar el token: localStorage no disponible');
        }
        
        // Actualizar el estado sin redireccionamiento forzado
        set({ user: result.user, token: result.token, isLoading: false });
        
        // Guardar en caché de sesión para persistencia
        if (typeof window !== 'undefined' && result.user) {
          try {
            window.sessionStorage.setItem('hubmadridista_user', JSON.stringify(result.user));
          } catch (e) {
            console.error('Error caching user:', e);
          }
        }
        
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
        // Limpiar datos de autenticación
        localStorage.removeItem('hubmadridista_token');
        sessionStorage.removeItem('hubmadridista_user');
        
        // Actualizar estado sin redireccionamiento forzado
        set({ user: null, token: null, isLoading: false });
      }
    },
    
    fetchUser: async () => {
      const { token, user } = get();
      const now = Date.now();
      
      // *** VERIFICACIÓN DE SERVICIO BLOQUEADO ***
      if (authServiceBlocked) {
        console.log('Servicio de autenticación bloqueado permanentemente - cancelando solicitud');
        set({ user: null, token: null, isLoading: false });
        return;
      }
      
      // 0. Protección contra bucles de autenticación
      if (!setupAuthGuard()) {
        console.log('Auth fetch bloqueado por guardia de bucle');
        return;
      }
      
      // 1. Verificar si hay un token y no hay solicitud en progreso
      if (isUserFetching || !token) {
        return;
      }
      
      // 2. Si el usuario ya está en el estado, no hacer la solicitud
      if (user) {
        // Guardar en caché de sesión para futuras cargas
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem('hubmadridista_user', JSON.stringify(user));
          } catch (e) {
            console.error('Error caching user:', e);
          }
        }
        return;
      }
      
      // 3. Verificar si ha pasado tiempo suficiente desde la última solicitud
      if ((now - lastFetchTime) < FETCH_COOLDOWN_MS) {
        console.log('Solicitud bloqueada por enfriamiento:', now - lastFetchTime, 'ms desde la última solicitud');
        return;
      }
      
      // 4. Verificar si hemos tenido demasiados fallos consecutivos
      if (requestFailCount >= MAX_FAILURES) {
        console.log('BLOQUEANDO PERMANENTEMENTE las solicitudes de autenticación después de múltiples fallos');
        
        // Marcar servicio como bloqueado permanentemente
        authServiceBlocked = true;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_ERROR_FLAG, 'true');
        }
        
        // Limpiar estado para un posible reinicio manual
        localStorage.removeItem('hubmadridista_token');
        sessionStorage.removeItem('hubmadridista_user');
        sessionStorage.removeItem(GLOBAL_AUTH_FLAG);
        set({ 
          user: null, 
          token: null, 
          isLoading: false,
          error: 'Servicio de autenticación temporalmente no disponible. Por favor, intente más tarde.'
        });
        return;
      }
      
      // Actualizar tiempos y flags
      isUserFetching = true;
      lastFetchTime = now;
      set({ isLoading: true });
      
      try {
        const fetchedUser = await apiRequest<UserAuth>('/api/auth/me');
        // Resetear contador de fallos en caso de éxito
        requestFailCount = 0;
        set({ user: fetchedUser, isLoading: false });
        
        // Guardar en caché de sesión
        if (typeof window !== 'undefined' && fetchedUser) {
          try {
            window.sessionStorage.setItem('hubmadridista_user', JSON.stringify(fetchedUser));
            // Limpiar bandera de autenticación en progreso
            sessionStorage.removeItem(GLOBAL_AUTH_FLAG);
          } catch (e) {
            console.error('Error caching user:', e);
          }
        }
      } catch (error: any) {
        console.error('Error fetching user:', error);
        // Incrementar contador de fallos
        requestFailCount++;
        
        // Detectar error 429 y marcar como bloqueo permanente
        if (error.message && error.message.includes('429')) {
          console.log('DETECTADO ERROR 429 - BLOQUEANDO SERVICIO');
          authServiceBlocked = true;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(AUTH_ERROR_FLAG, 'true');
          }
          localStorage.removeItem('hubmadridista_token');
          sessionStorage.removeItem('hubmadridista_user');
          set({ 
            user: null, 
            token: null, 
            isLoading: false,
            error: 'Servicio temporalmente no disponible. Por favor, intente más tarde.'
          });
        } 
        // Solo limpiar tokens después de varios intentos fallidos
        else if (requestFailCount >= MAX_FAILURES) {
          localStorage.removeItem('hubmadridista_token');
          sessionStorage.removeItem('hubmadridista_user');
          set({ user: null, token: null, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } finally {
        isUserFetching = false;
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
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hubmadridista_token', token);
        console.log('Token procesado y guardado en localStorage', token.substring(0, 10) + '...');
      } else {
        console.error('No se pudo procesar token: localStorage no disponible');
      }
      set({ token });
      await get().fetchUser();
    },
    
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
  };
});

// Hook para manejar la redirección automática del token de URL
export function useTokenHandler() {
  const { toast } = useToast();
  const processToken = useAuth((state) => state.processToken);

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