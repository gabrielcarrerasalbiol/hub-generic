import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  
  // Inicializar con el idioma almacenado en localStorage o detectado del navegador
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Intentar obtener el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('hubmadridista-language');
    
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Si no hay idioma guardado, detectar el del navegador
    const browserLanguage = navigator.language.split('-')[0];
    // Solo aceptamos español e inglés (por defecto español)
    return browserLanguage === 'en' ? 'en' : 'es';
  });
  
  // Establecer el idioma al inicio
  useEffect(() => {
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
      localStorage.setItem('hubmadridista-language', currentLanguage);
    }
  }, [currentLanguage, i18n]);
  
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