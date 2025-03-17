import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gestionar búsquedas con debounce.
 * Evita hacer demasiadas peticiones mientras el usuario está escribiendo.
 * 
 * @param initialValue Valor inicial de la búsqueda
 * @param delay Retraso para el debounce en milisegundos
 * @returns Objeto con el query actual, función para actualizarlo y query procesado con debounce
 */
export function useSearch(initialValue: string = '', delay: number = 300) {
  // Estado para el valor de búsqueda
  const [query, setQuery] = useState<string>(initialValue);
  // Estado para el valor después del debounce
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialValue);

  // Efecto para implementar el debounce
  useEffect(() => {
    // Crear un temporizador para retrasar la actualización del valor con debounce
    const timer = setTimeout(() => {
      setDebouncedSearch(query);
    }, delay);

    // Limpiar el temporizador si el query cambia antes de que se complete el tiempo
    return () => {
      clearTimeout(timer);
    };
  }, [query, delay]);

  return { query, setQuery, debouncedSearch };
}