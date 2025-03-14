import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  // Estado para almacenar el idioma actual
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'es');
  
  // Efecto para actualizar el estado cuando cambia el idioma
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);
  
  // Función para cambiar el idioma
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    // Almacenar el idioma seleccionado en localStorage
    localStorage.setItem('hubmadridista-language', language);
  };
  
  return {
    t,                 // Función de traducción
    currentLanguage,   // Idioma actual
    changeLanguage,    // Función para cambiar el idioma
    i18n               // Instancia de i18n (por si se necesita acceso directo)
  };
};

export default useLanguage;