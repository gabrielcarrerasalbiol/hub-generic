import { Video, Category } from "../../shared/schema";
import { storage } from "../storage";

// Importamos los diferentes servicios de IA
import { classifyContent, enhanceSearch } from "../api/openai";
import { classifyContentWithAnthropicClaude, enhanceSearchWithAnthropicClaude } from "../api/anthropic";
import { classifyContentWithGemini, generateVideoSummary } from "../api/gemini";
import { classifyContentWithDeepSeek, enhanceSearchWithDeepSeek, generateVideoSummaryWithDeepSeek } from "../api/deepseek";

/**
 * Resultado de la clasificación de contenido
 */
export interface ClassificationResult {
  categories: number[];
  relevance: number;
  confidence: number;
}

/**
 * Resultado de generación de resumen
 */
export interface SummaryResult {
  summary: string;
  language: string;
  success: boolean;
}

/**
 * Servicio unificado de IA que prioriza DeepSeek y usa Anthropic y Gemini como respaldo
 * Implementa la lógica de fallback para asegurar que siempre se obtenga un resultado
 */
export class AIService {
  /**
   * Clasifica contenido utilizando los servicios de IA disponibles
   * Prioridad: 1. DeepSeek, 2. Anthropic, 3. OpenAI, 4. Gemini
   */
  static async classifyContent(
    title: string,
    description: string,
    categories: { id: number; name: string; description: string | null }[]
  ): Promise<ClassificationResult> {
    try {
      // Intentar primero con DeepSeek
      console.log("Intentando clasificar con DeepSeek...");
      return await classifyContentWithDeepSeek(title, description, categories);
    } catch (deepseekError) {
      console.error("Error clasificando con DeepSeek, intentando con Anthropic:", deepseekError);
      try {
        // Intentar con Anthropic Claude
        console.log("Intentando clasificar con Anthropic Claude...");
        return await classifyContentWithAnthropicClaude(title, description, categories);
      } catch (anthropicError) {
        console.error("Error clasificando con Anthropic, intentando con OpenAI:", anthropicError);
        try {
          // Intentar con OpenAI
          console.log("Intentando clasificar con OpenAI...");
          return await classifyContent(title, description, categories);
        } catch (openaiError) {
          console.error("Error clasificando con OpenAI, intentando con Gemini:", openaiError);
          try {
            // Intentar con Gemini
            console.log("Intentando clasificar con Gemini...");
            return await classifyContentWithGemini(title, description, categories);
          } catch (geminiError) {
            console.error("Todos los servicios de IA fallaron para la clasificación:", geminiError);
            
            // Fallback a clasificación básica basada en palabras clave
            return this.performBasicKeywordClassification(title, description, categories);
          }
        }
      }
    }
  }

  /**
   * Mejora una consulta de búsqueda utilizando IA
   * Prioridad: 1. DeepSeek, 2. Anthropic, 3. OpenAI
   */
  static async enhanceSearch(query: string): Promise<string> {
    try {
      // Intentar primero con DeepSeek
      return await enhanceSearchWithDeepSeek(query);
    } catch (deepseekError) {
      console.error("Error mejorando búsqueda con DeepSeek, intentando con Anthropic:", deepseekError);
      try {
        // Intentar con Anthropic Claude
        return await enhanceSearchWithAnthropicClaude(query);
      } catch (anthropicError) {
        console.error("Error mejorando búsqueda con Anthropic, intentando con OpenAI:", anthropicError);
        try {
          // Intentar con OpenAI
          return await enhanceSearch(query);
        } catch (openaiError) {
          console.error("Todos los servicios de IA fallaron para mejorar la búsqueda:", openaiError);
          return query; // Devolver consulta original
        }
      }
    }
  }

  /**
   * Genera un resumen para un video utilizando IA
   * Solo genera resúmenes para videos que no tengan ya uno
   * Prioridad: 1. DeepSeek, 2. Gemini
   */
  static async generateVideoSummary(videoId: number): Promise<SummaryResult> {
    try {
      // Obtener el video
      const video = await storage.getVideoById(videoId);
      if (!video) {
        return { summary: "", language: "en", success: false };
      }
      
      // Verificar si ya tiene un resumen
      if (video.summary) {
        console.log(`El video ${videoId} ya tiene un resumen, no se genera uno nuevo.`);
        return { 
          summary: video.summary, 
          language: video.language || "es", 
          success: true 
        };
      }
      
      // Intentar generar resumen con DeepSeek
      try {
        console.log(`Generando resumen para video ${videoId} con DeepSeek...`);
        const result = await generateVideoSummaryWithDeepSeek(video.title, video.description || "");
        
        // Actualizar el video en la base de datos
        await storage.updateVideo(videoId, {
          summary: result.summary,
          language: result.language
        });
        
        return { ...result, success: true };
      } catch (deepseekError) {
        console.error("Error generando resumen con DeepSeek, intentando con Gemini:", deepseekError);
        
        // Fallback a Gemini
        const result = await generateVideoSummary(video.title, video.description || "");
        
        // Actualizar el video en la base de datos
        await storage.updateVideo(videoId, {
          summary: result.summary,
          language: result.language
        });
        
        return { ...result, success: true };
      }
    } catch (error) {
      console.error(`Error generando resumen para video ${videoId}:`, error);
      return { summary: "", language: "en", success: false };
    }
  }

  /**
   * Genera resúmenes para todos los videos que no tengan uno
   * Optimizado para procesar solo videos sin resumen
   */
  static async generateSummariesForVideosWithoutSummary(limit = 200): Promise<{
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    try {
      // Obtener todos los videos sin resumen
      // Nota: Suponemos que storage tiene un método getVideosWithoutSummary, si no existe, hay que filtrarlo manualmente
      const videos = await storage.getVideos(limit);
      const videosWithoutSummary = videos.filter(video => !video.summary);
      const total = videosWithoutSummary.length;
      
      console.log(`Encontrados ${total} videos sin resumen. Procesando...`);
      
      let succeeded = 0;
      let failed = 0;
      
      for (const video of videosWithoutSummary) {
        try {
          const result = await this.generateVideoSummary(video.id);
          if (result.success) {
            succeeded++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Error procesando resumen para video ${video.id}:`, error);
          failed++;
        }
      }
      
      return {
        total,
        processed: videosWithoutSummary.length,
        succeeded,
        failed
      };
    } catch (error) {
      console.error("Error generando resúmenes para videos:", error);
      return {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0
      };
    }
  }

  /**
   * Recategoriza un video utilizando IA
   */
  static async recategorizeVideo(videoId: number): Promise<boolean> {
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
      
      // Clasificar con IA utilizando nuestro método unificado
      const classification = await this.classifyContent(
        video.title,
        video.description || "",
        categoriesForAI
      );
      
      // Actualizar las categorías del video
      if (classification.categories.length > 0) {
        // Convertir los IDs de categoría a strings
        const categoryIds = classification.categories.map(id => id.toString());
        
        await storage.updateVideo(videoId, {
          categoryIds: categoryIds
          // Nota: Removido relevanceScore ya que no está en el modelo
        });
        
        console.log(`Video ${videoId} recategorizado con categorías: ${categoryIds.join(", ")}`);
        console.log(`Relevancia calculada (no almacenada): ${classification.relevance}`);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error recategorizando video ${videoId}:`, error);
      return false;
    }
  }

  /**
   * Clasificación básica basada en palabras clave como fallback
   * Utilizado cuando todos los servicios de IA fallan
   */
  private static performBasicKeywordClassification(
    title: string, 
    description: string, 
    categories: { id: number; name: string; description: string | null }[]
  ): ClassificationResult {
    const categoryIds: number[] = [];
    const fullText = (title + " " + (description || "")).toLowerCase();
    
    // Palabras clave por categoría (mantén esto sincronizado con las categorías en la base de datos)
    const keywordMap: { [key: string]: string[] } = {
      "Partidos": ["partido", "vs", "victoria", "derrota", "empate", "gol", "resultado"],
      "Entrenamiento": ["entrenamiento", "práctica", "preparación", "ejercicio", "sesión"],
      "Rueda de prensa": ["rueda de prensa", "conferencia", "declaraciones", "entrevista"],
      "Entrevistas": ["entrevista", "habla", "conversación", "charla"],
      "Análisis": ["análisis", "táctico", "estadísticas", "desempeño", "evaluación"],
      "Noticias": ["noticia", "actualidad", "último momento", "información", "comunicado"],
      "Highlights": ["highlights", "mejores momentos", "resumen", "jugadas", "goles"],
      "Fichajes": ["fichaje", "transferencia", "mercado", "contrato", "firma", "nuevo jugador"],
      "Leyendas": ["leyenda", "histórico", "clásico", "retirado", "pasado", "homenaje"],
      "Afición": ["afición", "hinchas", "fans", "madridistas", "grada", "celebración"]
    };
    
    // Buscar coincidencias de palabras clave en el texto
    for (const category of categories) {
      const categoryName = category.name;
      const keywords = keywordMap[categoryName] || [];
      
      for (const keyword of keywords) {
        if (fullText.includes(keyword.toLowerCase())) {
          categoryIds.push(category.id);
          break; // Una vez que encuentre una coincidencia, no necesitamos comprobar más palabras clave para esta categoría
        }
      }
    }
    
    // Si no se encontraron categorías, asignar a "Noticias" por defecto (asumiendo que existe)
    if (categoryIds.length === 0) {
      const newsCategory = categories.find(c => c.name === "Noticias");
      if (newsCategory) {
        categoryIds.push(newsCategory.id);
      } else if (categories.length > 0) {
        // Si no hay categoría "Noticias", usar la primera disponible
        categoryIds.push(categories[0].id);
      }
    }
    
    return {
      categories: categoryIds,
      relevance: 50, // Relevancia media por defecto
      confidence: 0.5 // Confianza media por defecto
    };
  }
}

export default AIService;