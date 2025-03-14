import { storage } from "../storage";
import { classifyContent } from "./openai";
import { classifyContentWithAnthropicClaude } from "./anthropic";
import { Video, Category } from "../../shared/schema";

/**
 * Recategoriza un video existente usando IA
 */
export async function recategorizeVideo(videoId: number): Promise<boolean> {
  try {
    // Obtener el video
    const video = await storage.getVideoById(videoId);
    if (!video) return false;
    
    // Obtener las categorías disponibles
    const categories = await storage.getCategories();
    if (!categories || categories.length === 0) return false;
    
    const categoriesForAI = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || ''
    }));
    
    // Intentar clasificar con IA
    let categoryIds: number[] = [];
    try {
      // Primero intentar con Claude
      try {
        const classification = await classifyContentWithAnthropicClaude(
          video.title,
          video.description || "",
          categoriesForAI
        );
        categoryIds = classification.categories;
      } catch (claudeError) {
        console.warn("Claude classification failed, falling back to Gemini:", claudeError);
        // Fallback a Gemini/OpenAI
        const classification = await classifyContent(
          video.title,
          video.description || "",
          categoriesForAI
        );
        categoryIds = classification.categories;
      }
    } catch (error) {
      console.warn(`Could not classify video ${videoId} with any AI service:`, error);
      // Intentar una clasificación básica basada en palabras clave
      categoryIds = performBasicKeywordClassification(video, categories);
    }
    
    // Actualizar el video con las nuevas categorías
    if (categoryIds.length > 0) {
      await storage.updateVideo(videoId, {
        categoryIds: categoryIds.map(id => id.toString())
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error recategorizing video ${videoId}:`, error);
    return false;
  }
}

/**
 * Clasificación básica basada en palabras clave como fallback
 */
function performBasicKeywordClassification(video: Video, categories: Category[]): number[] {
  const categoryIds: number[] = [];
  const matchPatterns: Record<string, string[]> = {
    'partidos': ['vs', 'gol', 'resumen', 'highlights', 'final', 'semifinal', 'partido'],
    'análisis': ['análisis', 'táctica', 'opinión', 'review', 'comentario'],
    'ruedas de prensa': ['rueda de prensa', 'conferencia', 'entrevista', 'declaraciones'],
    'entrenamientos': ['entrenamiento', 'preparación', 'ejercicio'],
    'jugadores': ['jugador', 'fichaje', 'traspaso', 'carrera', 'perfil']
  };
  
  // Texto combinado para búsqueda
  const searchText = `${video.title} ${video.description || ''}`.toLowerCase();
  
  // Buscar coincidencias por cada categoría
  categories.forEach(category => {
    const categoryName = category.name.toLowerCase();
    if (matchPatterns[categoryName]) {
      for (const pattern of matchPatterns[categoryName]) {
        if (searchText.includes(pattern.toLowerCase())) {
          categoryIds.push(category.id);
          break;
        }
      }
    }
  });
  
  return categoryIds;
}

/**
 * Recategoriza todos los videos existentes
 */
export async function recategorizeAllVideos(): Promise<{total: number, success: number}> {
  const videos = await storage.getVideos(1000); // Asumimos un máximo de 1000 videos
  let successCount = 0;
  
  for (const video of videos) {
    const success = await recategorizeVideo(video.id);
    if (success) successCount++;
  }
  
  return {
    total: videos.length,
    success: successCount
  };
}