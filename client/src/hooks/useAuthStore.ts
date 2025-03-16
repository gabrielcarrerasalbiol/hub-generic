import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definición del tipo de usuario
export interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  role: 'free' | 'premium' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Definición del estado de autenticación
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

// Crear el store con persistencia
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isPremium: false,
      
      // Establecer el token de autenticación
      setToken: (token: string) => {
        localStorage.setItem('token', token);
        set({ 
          token,
          isAuthenticated: !!token,
        });
      },
      
      // Establecer la información del usuario
      setUser: (user: User) => {
        set({ 
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isPremium: user.role === 'premium' || user.role === 'admin',
        });
      },
      
      // Cerrar sesión
      logout: () => {
        localStorage.removeItem('token');
        set({ 
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isPremium: false,
        });
      },
    }),
    {
      name: 'auth-storage', // nombre para el almacenamiento persistente
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isPremium: state.isPremium,
      }),
    }
  )
);