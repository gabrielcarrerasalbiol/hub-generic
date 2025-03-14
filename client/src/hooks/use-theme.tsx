import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Inicializar tema desde localStorage o usar light como predeterminado
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('hubmadridista-theme');
      return (savedTheme as Theme) || 'light';
    }
    return 'light';
  });

  // Aplicar el tema al documento
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Eliminar clases antiguas
    root.classList.remove('light', 'dark');
    
    // Agregar nueva clase
    root.classList.add(theme);
    
    // Guardar en localStorage
    localStorage.setItem('hubmadridista-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}