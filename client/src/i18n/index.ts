import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importamos las traducciones
import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';

// Configuración de i18next
i18n
  // Detecta el idioma del navegador
  .use(LanguageDetector)
  // Permite usar hooks/componentes de react
  .use(initReactI18next)
  // Inicializa i18next
  .init({
    resources: {
      es: {
        translation: esTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    fallbackLng: 'es', // Idioma por defecto
    debug: false,
    
    interpolation: {
      escapeValue: false, // No es necesario con React
    },
    
    // Opciones de detección
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'hubmadridista-language',
      caches: ['localStorage']
    }
  });

export default i18n;