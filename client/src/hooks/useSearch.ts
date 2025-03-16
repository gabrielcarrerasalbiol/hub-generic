import { useState, useEffect } from "react";

// Hook personalizado para implementar una búsqueda debounced
export const useSearch = (initialValue = "", delay = 500) => {
  const [query, setQuery] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

  useEffect(() => {
    // Establecer un temporizador para actualizar el valor debounced después del retardo
    const timer = setTimeout(() => {
      setDebouncedSearch(query);
    }, delay);

    // Limpiar el temporizador si el query cambia antes del retardo
    return () => {
      clearTimeout(timer);
    };
  }, [query, delay]);

  return {
    query,
    setQuery,
    debouncedSearch,
  };
};