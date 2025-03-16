/**
 * Preguntas precargadas para el mini-juego de estadísticas de jugadores
 * Estas preguntas se utilizarán como fallback cuando la API de DeepSeek tarde demasiado
 * o como complemento para garantizar una respuesta rápida al usuario
 */

import { StatType } from "../../shared/schema";

/**
 * Tipo para preguntas precargadas
 */
export interface PreloadedQuestion {
  player1Id: number;
  player2Id: number;
  statType: StatType;
  question: string;
  hint: string;
  explanation: string;
}

/**
 * Conjunto de preguntas precargadas organizadas por dificultad
 */
export const preloadedQuestions = {
  easy: [
    {
      player1Id: 14, // Vinícius Júnior
      player2Id: 16, // Kylian Mbappé
      statType: "goals" as StatType,
      question: "¿Quién ha marcado más goles esta temporada: Vinícius Júnior o Kylian Mbappé?",
      hint: "Ambos son delanteros estrella, pero uno ha sido especialmente prolífico frente a la portería.",
      explanation: "Kylian Mbappé ha marcado 16 goles esta temporada, mientras que Vinícius Júnior ha anotado 14."
    },
    {
      player1Id: 13, // Jude Bellingham
      player2Id: 15, // Rodrygo
      statType: "goals" as StatType,
      question: "Entre Jude Bellingham y Rodrygo, ¿quién ha marcado más goles en la temporada actual?",
      hint: "Uno de estos mediocampistas ha sido sorprendentemente eficaz frente al gol.",
      explanation: "Jude Bellingham ha marcado 12 goles esta temporada, mientras que Rodrygo ha anotado 11."
    },
    {
      player1Id: 1, // Thibaut Courtois
      player2Id: 2, // Andriy Lunin
      statType: "rating" as StatType,
      question: "¿Qué portero tiene mejor valoración general: Courtois o Lunin?",
      hint: "Ambos son excelentes porteros, pero uno tiene una ligera ventaja en su valoración.",
      explanation: "Thibaut Courtois tiene una valoración de 89, mientras que Andriy Lunin tiene 85."
    },
  ],
  medium: [
    {
      player1Id: 11, // Luka Modrić
      player2Id: 9, // Eduardo Camavinga
      statType: "assists" as StatType,
      question: "¿Quién ha dado más asistencias esta temporada: el veterano Luka Modrić o el joven Eduardo Camavinga?",
      hint: "La experiencia puede ser importante para crear oportunidades de gol.",
      explanation: "Luka Modrić ha dado 9 asistencias, superando las 8 de Eduardo Camavinga."
    },
    {
      player1Id: 10, // Federico Valverde
      player2Id: 12, // Toni Kroos
      statType: "assists" as StatType,
      question: "Entre Federico Valverde y Toni Kroos, ¿quién ha proporcionado más asistencias?",
      hint: "Los pases precisos son una especialidad de ambos jugadores.",
      explanation: "Federico Valverde ha conseguido 8 asistencias mientras que Toni Kroos ha logrado 6."
    },
    {
      player1Id: 14, // Vinícius Júnior
      player2Id: 13, // Jude Bellingham
      statType: "appearances" as StatType,
      question: "¿Quién ha tenido más apariciones con el Real Madrid esta temporada: Vinícius o Bellingham?",
      hint: "La disponibilidad es clave para los jugadores importantes del equipo.",
      explanation: "Jude Bellingham ha jugado 35 partidos esta temporada, mientras que Vinícius ha disputado 31."
    },
  ],
  hard: [
    {
      player1Id: 3, // Antonio Rüdiger
      player2Id: 5, // David Alaba
      statType: "aerialDuelsWon" as StatType,
      question: "¿Qué defensa central gana más duelos aéreos: Rüdiger o Alaba?",
      hint: "La altura y el posicionamiento son factores importantes en esta estadística.",
      explanation: "David Alaba ha ganado 67 duelos aéreos, muy por encima de los 25 de Antonio Rüdiger."
    },
    {
      player1Id: 9, // Eduardo Camavinga
      player2Id: 8, // Aurélien Tchouaméni
      statType: "passAccuracy" as StatType,
      question: "¿Cuál de los centrocampistas franceses tiene mejor precisión de pase: Camavinga o Tchouaméni?",
      hint: "La precisión de pase es vital para mantener la posesión en el centro del campo.",
      explanation: "Eduardo Camavinga tiene una precisión de pase del 89%, ligeramente superior al 88% de Aurélien Tchouaméni."
    },
    {
      player1Id: 4, // Éder Militão
      player2Id: 7, // Ferland Mendy
      statType: "minutesPlayed" as StatType,
      question: "¿Quién ha acumulado más minutos en el campo esta temporada: Militão o Mendy?",
      hint: "Las lesiones y la rotación pueden afectar significativamente esta estadística.",
      explanation: "Ferland Mendy ha jugado 3060 minutos, considerablemente más que los 2125 minutos de Éder Militão."
    },
  ]
};

/**
 * Obtiene un conjunto de preguntas precargadas según la dificultad
 * @param difficulty Dificultad del juego (easy, medium, hard)
 * @param count Número de preguntas a obtener
 * @returns Array de preguntas precargadas aleatorias
 */
export function getRandomPreloadedQuestions(
  difficulty: string = "medium",
  count: number = 5
): PreloadedQuestion[] {
  const questions = preloadedQuestions[difficulty as keyof typeof preloadedQuestions] || preloadedQuestions.medium;
  
  // Mezclamos las preguntas para que sean aleatorias
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  
  // Limitamos al número solicitado
  return shuffled.slice(0, count);
}

/**
 * Convierte las preguntas precargadas al formato esperado por el juego
 * @param preloadedQuestions Preguntas precargadas a convertir
 * @param players Mapa de jugadores por ID para obtener la información completa
 * @param comparisons Resultado de las comparaciones de estadísticas (para establecer el ganador)
 * @returns Preguntas en el formato esperado por el juego
 */
export function convertPreloadedQuestions(
  preloadedQuestions: PreloadedQuestion[],
  players: Record<number, any>,
  comparisons: Record<string, { winnerId: number }>
): any[] {
  return preloadedQuestions.map(q => {
    const player1 = players[q.player1Id];
    const player2 = players[q.player2Id];
    const comparisonKey = `${q.player1Id}-${q.player2Id}-${q.statType}`;
    
    return {
      player1,
      player2,
      statType: q.statType,
      question: q.question,
      hint: q.hint,
      explanation: q.explanation,
      correctAnswer: comparisons[comparisonKey]?.winnerId || 
                    (q.statType === "goals" && q.player1Id === 16 ? 16 : q.player2Id) // Fallback
    };
  });
}