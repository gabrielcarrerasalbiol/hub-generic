/**
 * Servicio para el mini-juego interactivo de estadísticas de jugadores
 * Utiliza DeepSeek para mejorar la experiencia de juego
 */

import { Player, PlayerStats, StatType } from "../../shared/schema";
import { storage } from "../storage";
import OpenAI from 'openai';

// Importamos el cliente DeepSeek ya configurado en deepseek.ts
import { deepseek } from "./deepseek";

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

    // Preparamos el contexto para DeepSeek
    const context = {
      player1: {
        name: player1.name,
        position: player1.position,
        stats: p1Stats ? {
          [statType]: p1Value,
          season: p1Stats.season
        } : "No hay estadísticas disponibles"
      },
      player2: {
        name: player2.name,
        position: player2.position,
        stats: p2Stats ? {
          [statType]: p2Value,
          season: p2Stats.season
        } : "No hay estadísticas disponibles"
      },
      statType: statType
    };

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
        hint: "Analiza el rendimiento de ambos jugadores en esta temporada."
      };
    }

    try {
      // Preparamos un prompt para DeepSeek
      const prompt = `
        Genera una pregunta para comparar a ${player1.name} y ${player2.name} basada en su estadística de "${translatedStatType}". 
        Devuelve un objeto JSON con estos atributos exactos: {question: string, hint: string, explanation: string}. 
        La pregunta debe ser interesante y debe preguntar quién tiene mejor rendimiento en esa estadística. 
        La explicación debe incluir los valores actuales (${p1Value} vs ${p2Value}).
      `;

      // Utilizamos DeepSeek para generar una pregunta más natural e interesante
      const response = await deepseek.chat.completions.create({
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
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error("No se recibió respuesta de DeepSeek");
      }

      // Parseamos la respuesta de JSON a objeto
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Respuesta vacía de DeepSeek");
      }
      
      const parsedContent = JSON.parse(content);
      
      return {
        question: parsedContent.question || `¿Quién tiene más ${translatedStatType}?`,
        hint: parsedContent.hint || "Analiza sus estadísticas recientes.",
        explanation: parsedContent.explanation || `${player1.name}: ${p1Value}, ${player2.name}: ${p2Value}`
      };
    } catch (parseError) {
      console.error("Error parsing DeepSeek response:", parseError);
      
      // Fallback a pregunta básica si no podemos parsear la respuesta
      return {
        question: `¿Qué jugador tiene más ${translatedStatType}? ¿${player1.name} o ${player2.name}?`,
        hint: "Analiza el rendimiento de ambos jugadores."
      };
    }
  } catch (error) {
    console.error("Error generating stats question:", error);
    
    // Fallback a pregunta básica en caso de error
    return {
      question: `¿Qué jugador tiene mejor estadística de ${statType}?`,
      hint: "Compara a los dos jugadores."
    };
  }
}

/**
 * Genera un conjunto de preguntas para una ronda del mini-juego
 * @param difficulty Dificultad del juego (easy, medium, hard)
 * @param count Número de preguntas a generar
 * @returns Array de preguntas generadas
 */
export async function generateGameQuestions(
  difficulty: string = "medium",
  count: number = 5
): Promise<any[]> {
  try {
    // Obtenemos jugadores activos
    const players = await storage.getActivePlayers(30);
    
    if (players.length < 2) {
      throw new Error("No hay suficientes jugadores para generar preguntas");
    }

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

    // Generamos preguntas
    const questions = [];
    for (let i = 0; i < count; i++) {
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
      
      questions.push({
        player1,
        player2,
        statType,
        question: questionData.question,
        hint: questionData.hint,
        explanation: questionData.explanation,
        correctAnswer: comparisonStats.winnerId
      });
    }
    
    return questions;
  } catch (error) {
    console.error("Error generating game questions:", error);
    return [];
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