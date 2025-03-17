import { CategoryType } from '@shared/schema';

/**
 * Mapeo entre los tipos de categoría (enum del frontend) y los IDs de categoría en la base de datos
 */
export const categoryTypeToIdMap: Record<CategoryType, number> = {
  "all": 0, // Valor especial para "todas las categorías"
  "matches": 1, // Partidos
  "tactics": 6, // Análisis
  "history": 6, // Historia
  "news": 5, // Noticias
  "interviews": 3, // Entrevistas
  "fan_content": 9, // Afición
  "transfers": 7, // Fichajes
};

/**
 * Mapeo inverso de ID de categoría a tipo de categoría
 */
export const categoryIdToTypeMap: Record<number, CategoryType> = {
  0: "all",
  1: "matches",
  2: "matches", // Entrenamientos - por ahora los mapeamos a matches
  3: "interviews",
  4: "tactics", // Análisis
  5: "news",
  6: "history",
  7: "transfers",
  8: "tactics", // Cantera - por ahora los mapeamos a tactics
  9: "fan_content",
  10: "matches" // Highlights - por ahora los mapeamos a matches
};

/**
 * Convierte un tipo de categoría del frontend en un ID de categoría para el backend
 */
export function getCategoryIdFromType(categoryType: CategoryType): number {
  return categoryTypeToIdMap[categoryType] || 0;
}

/**
 * Convierte un ID de categoría del backend en un tipo de categoría para el frontend
 */
export function getCategoryTypeFromId(categoryId: number): CategoryType {
  return categoryIdToTypeMap[categoryId] || "all";
}

/**
 * Mapea un nombre de categoría en texto (puede ser en diferentes idiomas) a un tipo de categoría
 */
export function mapCategoryNameToType(categoryName: string | null): CategoryType {
  if (!categoryName) return "all";
  
  // Normaliza el texto (minúsculas, sin acentos)
  const normalizedName = categoryName.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  // Mapa de nombres a tipos de categoría
  const nameToTypeMap: Record<string, CategoryType> = {
    // Español
    'partidos': 'matches',
    'tacticas': 'tactics',
    'tactica': 'tactics',
    'analisis': 'tactics',
    'análisis': 'tactics',
    'historia': 'history',
    'historico': 'history',
    'histórico': 'history',
    'noticias': 'news',
    'entrevistas': 'interviews',
    'afición': 'fan_content',
    'aficion': 'fan_content',
    'fichajes': 'transfers',
    'traspasos': 'transfers',
    
    // Inglés
    'matches': 'matches',
    'games': 'matches',
    'tactics': 'tactics',
    'analysis': 'tactics',
    'history': 'history',
    'news': 'news',
    'interviews': 'interviews',
    'fans': 'fan_content',
    'fan content': 'fan_content',
    'transfers': 'transfers',
    
    // Valores especiales
    'all': 'all',
    'todo': 'all',
    'todos': 'all',
    'todas': 'all'
  };
  
  return nameToTypeMap[normalizedName] || "all";
}