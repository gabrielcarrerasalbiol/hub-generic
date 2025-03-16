/**
 * Servicio para el mini-juego interactivo de estadísticas de jugadores
 * Utiliza DeepSeek para mejorar la experiencia de juego y preguntas precargadas
 * como fallback o complemento para una respuesta rápida
 */

import { Player, PlayerStats, StatType } from "../../shared/schema";
import { storage } from "../storage";
import OpenAI from 'openai';

// Importamos el cliente DeepSeek ya configurado en deepseek.ts
import { deepseek } from "./deepseek";

// Importamos las preguntas precargadas
import { getRandomPreloadedQuestions, convertPreloadedQuestions } from "./preloadedQuestions";

// Tiempo máximo de espera para las llamadas a la API (5 segundos)
const API_TIMEOUT_MS = 5000;

/**
 * Genera una pregunta para el mini-juego basada en las estadísticas de los jugadores
 * @param player1 Primer jugador para comparar
 * @param player2 Segundo jugador para comparar
 * @param statType Tipo de estadística a comparar
 * @param season Temporada (opcional)
 * @returns Un objeto con la pregunta generada y estadísticas relevantes
 */
export async function generateStatsQuestion(
  player1: Player,
  player2: Player,
  statType: string,
  season?: string
): Promise<{
  question: string;
  hint?: string;
  explanation?: string;
}> {
  try {
    // Obtenemos las estadísticas de los jugadores
    const player1Stats = await storage.getPlayerStats(player1.id, season);
    const player2Stats = await storage.getPlayerStats(player2.id, season);

    // Seleccionamos las estadísticas más recientes si hay varias
    const p1Stats = player1Stats[0] || null;
    const p2Stats = player2Stats[0] || null;

    // Generamos el valor de la estadística a comparar
    const p1Value = p1Stats ? p1Stats[statType as keyof PlayerStats] : null;
    const p2Value = p2Stats ? p2Stats[statType as keyof PlayerStats] : null;

    // Traducimos el tipo de estadística para la interfaz
    const statTypeTranslation: Record<string, string> = {
      goals: "goles",
      assists: "asistencias",
      appearances: "apariciones",
      yellowCards: "tarjetas amarillas",
      redCards: "tarjetas rojas",
      minutesPlayed: "minutos jugados",
      passAccuracy: "precisión de pases",
      aerialDuelsWon: "duelos aéreos ganados",
      rating: "calificación general"
    };

    const translatedStatType = statTypeTranslation[statType] || statType;

    // Si no hay DeepSeek API disponible, generamos una pregunta básica
    if (!deepseek) {
      return {
        question: `¿Qué jugador tiene más ${translatedStatType} en la temporada? ¿${player1.name} o ${player2.name}?`,
        hint: "Analiza el rendimiento de ambos jugadores en esta temporada.",
        explanation: `${player1.name}: ${p1Value}, ${player2.name}: ${p2Value}`
      };
    }

    try {
      // Implementamos un timeout para la llamada a la API
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), API_TIMEOUT_MS);
      });

      // Preparamos un prompt para DeepSeek
      const prompt = `
        Genera una pregunta para comparar a ${player1.name} y ${player2.name} basada en su estadística de "${translatedStatType}". 
        Devuelve un objeto JSON con estos atributos exactos: {question: string, hint: string, explanation: string}. 
        La pregunta debe ser interesante y debe preguntar quién tiene mejor rendimiento en esa estadística. 
        La explicación debe incluir los valores actuales (${p1Value} vs ${p2Value}).
      `;

      // Función que realiza la llamada a la API
      const apiCallPromise = deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Eres un asistente especializado en estadísticas del Real Madrid que genera preguntas interesantes para un mini-juego. Genera preguntas en español. Las preguntas deben ser claras, concisas y enfocadas en la comparación de dos jugadores según una estadística específica. También incluye una pista sutil y una explicación que se mostrará después de responder."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      // Esperamos a que se complete la API o se alcance el timeout
      const response = await Promise.race([apiCallPromise, timeoutPromise]);

      // Si tenemos una respuesta válida de la API
      if (response && 'choices' in response && response.choices && response.choices.length > 0) {
        const content = response.choices[0].message.content;
        if (content) {
          const parsedContent = JSON.parse(content);
          return {
            question: parsedContent.question || `¿Quién tiene más ${translatedStatType}?`,
            hint: parsedContent.hint || "Analiza sus estadísticas recientes.",
            explanation: parsedContent.explanation || `${player1.name}: ${p1Value}, ${player2.name}: ${p2Value}`
          };
        }
      }

      // Si llegamos aquí, es porque se alcanzó el timeout o hubo un error
      console.log("Usando pregunta predefinida debido a timeout o error en la API");
      
      // Fallback a pregunta básica
      return {
        question: `¿Qué jugador tiene más ${translatedStatType}? ¿${player1.name} o ${player2.name}?`,
        hint: "Analiza el rendimiento de ambos jugadores en la temporada actual.",
        explanation: `${player1.name}: ${p1Value}, ${player2.name}: ${p2Value}`
      };
    } catch (parseError) {
      console.error("Error parsing DeepSeek response:", parseError);
      
      // Fallback a pregunta básica si no podemos parsear la respuesta
      return {
        question: `¿Qué jugador tiene más ${translatedStatType}? ¿${player1.name} o ${player2.name}?`,
        hint: "Analiza el rendimiento de ambos jugadores.",
        explanation: `${player1.name}: ${p1Value}, ${player2.name}: ${p2Value}`
      };
    }
  } catch (error) {
    console.error("Error generating stats question:", error);
    
    // Fallback a pregunta básica en caso de error
    return {
      question: `¿Qué jugador tiene mejor estadística de ${statType}?`,
      hint: "Compara a los dos jugadores.",
      explanation: "Compara las estadísticas de ambos jugadores."
    };
  }
}

/**
 * Genera un conjunto de preguntas para una ronda del mini-juego
 * Combina preguntas precargadas con preguntas generadas por DeepSeek
 * 
 * @param difficulty Dificultad del juego (easy, medium, hard)
 * @param count Número de preguntas a generar
 * @param usePreloaded Si es true, incluye preguntas precargadas (por defecto true)
 * @param preloadedRatio Proporción de preguntas precargadas (0-1, por defecto 0.4 = 40%)
 * @returns Array de preguntas generadas
 */
export async function generateGameQuestions(
  difficulty: string = "medium",
  count: number = 5,
  usePreloaded: boolean = true,
  preloadedRatio: number = 0.4
): Promise<any[]> {
  try {
    // Obtenemos jugadores activos
    const players = await storage.getActivePlayers(30);
    
    if (players.length < 2) {
      throw new Error("No hay suficientes jugadores para generar preguntas");
    }

    // Creamos un mapa de jugadores por ID para usarlo con preguntas precargadas
    const playersMap: Record<number, Player> = {};
    players.forEach(player => {
      playersMap[player.id] = player;
    });

    // Ajustamos la dificultad
    let statTypes: string[] = [];
    switch (difficulty) {
      case "easy":
        statTypes = ["goals", "appearances", "rating"];
        break;
      case "hard":
        statTypes = ["assists", "yellowCards", "redCards", "minutesPlayed", "passAccuracy", "aerialDuelsWon"];
        break;
      case "medium":
      default:
        statTypes = ["goals", "assists", "appearances", "rating", "yellowCards"];
        break;
    }

    // Definimos cuántas preguntas serán precargadas vs. generadas dinámicamente
    let preloadedCount = usePreloaded ? Math.ceil(count * preloadedRatio) : 0;
    let dynamicCount = count - preloadedCount;

    // Aseguramos que haya al menos una pregunta dinámica si hay suficientes para generar
    if (dynamicCount === 0 && players.length >= 2) {
      dynamicCount = 1;
      preloadedCount = count - 1;
    }

    // Resultados de preguntas (combinará preguntas precargadas y dinámicas)
    const questions = [];

    // 1. PRIMERO: Agregamos preguntas precargadas (si corresponde)
    if (preloadedCount > 0) {
      // Obtenemos preguntas precargadas
      const preloaded = getRandomPreloadedQuestions(difficulty, preloadedCount);
      
      // Precalculamos todas las comparaciones necesarias para preguntas precargadas
      const comparisons: Record<string, { winnerId: number }> = {};
      
      // Obtenemos las comparaciones para las preguntas precargadas
      for (const question of preloaded) {
        try {
          const comparison = await storage.getPlayerComparisonStats(
            question.player1Id, 
            question.player2Id, 
            question.statType
          );
          
          const key = `${question.player1Id}-${question.player2Id}-${question.statType}`;
          comparisons[key] = comparison;
        } catch (error) {
          console.error(`Error obteniendo comparación para ${question.player1Id} vs ${question.player2Id}:`, error);
        }
      }
      
      // Convertimos las preguntas precargadas al formato esperado
      const convertedQuestions = convertPreloadedQuestions(preloaded, playersMap, comparisons);
      questions.push(...convertedQuestions);
    }

    // 2. SEGUNDO: Generamos preguntas dinámicas con DeepSeek
    if (dynamicCount > 0) {
      const dynamicQuestions = [];
      
      for (let i = 0; i < dynamicCount; i++) {
        // Seleccionamos dos jugadores aleatorios diferentes
        let player1Index = Math.floor(Math.random() * players.length);
        let player2Index = Math.floor(Math.random() * players.length);
        
        // Aseguramos que sean diferentes
        while (player2Index === player1Index) {
          player2Index = Math.floor(Math.random() * players.length);
        }
        
        const player1 = players[player1Index];
        const player2 = players[player2Index];
        
        // Seleccionamos un tipo de estadística aleatorio
        const statTypeIndex = Math.floor(Math.random() * statTypes.length);
        const statType = statTypes[statTypeIndex];
        
        // Generamos la pregunta
        const questionData = await generateStatsQuestion(player1, player2, statType);
        
        // Obtenemos la comparación real de estadísticas
        const comparisonStats = await storage.getPlayerComparisonStats(player1.id, player2.id, statType);
        
        dynamicQuestions.push({
          player1,
          player2,
          statType,
          question: questionData.question,
          hint: questionData.hint,
          explanation: questionData.explanation,
          correctAnswer: comparisonStats.winnerId
        });
      }
      
      questions.push(...dynamicQuestions);
    }
    
    // Mezclamos las preguntas para que no aparezcan primero todas las precargadas
    return questions.sort(() => 0.5 - Math.random());
  } catch (error) {
    console.error("Error generating game questions:", error);
    
    // Si hay algún error, intentamos devolver preguntas precargadas como último recurso
    try {
      const preloaded = getRandomPreloadedQuestions(difficulty, count);
      const playersMap: Record<number, Player> = {};
      
      // Intentamos obtener jugadores de la base de datos
      const players = await storage.getActivePlayers(20);
      players.forEach(player => {
        playersMap[player.id] = player;
      });
      
      // Si no pudimos obtener jugadores, usamos un mapa vacío
      return convertPreloadedQuestions(preloaded, playersMap, {});
    } catch (fallbackError) {
      console.error("Error fatal generando preguntas:", fallbackError);
      return [];
    }
  }
}

/**
 * Evalúa la respuesta del usuario a una pregunta
 * @param userSelection ID del jugador seleccionado por el usuario
 * @param correctAnswer ID del jugador que es la respuesta correcta
 * @returns true si la respuesta es correcta, false en caso contrario
 */
export function evaluateAnswer(
  userSelection: number,
  correctAnswer: number
): boolean {
  return userSelection === correctAnswer;
}

/**
 * Calcula la puntuación final del juego
 * @param correctAnswers Número de respuestas correctas
 * @param totalQuestions Número total de preguntas
 * @param difficulty Dificultad del juego
 * @returns Puntuación calculada
 */
export function calculateScore(
  correctAnswers: number,
  totalQuestions: number,
  difficulty: string = "medium"
): number {
  // Factor de dificultad
  const difficultyFactor = difficulty === "easy" ? 1 :
                          difficulty === "medium" ? 1.5 :
                          difficulty === "hard" ? 2 : 1;

  // Cálculo básico de puntuación
  const baseScore = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Puntuación ajustada por dificultad
  return Math.round(baseScore * difficultyFactor);
}