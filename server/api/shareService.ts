/**
 * Servicio para compartir videos de Hub Madridista
 * Proporciona funcionalidades para compartir videos por email y generar enlaces cortos
 */

/**
 * Valida que el formato de un email sea correcto
 * @param email Email a validar
 * @returns true si es válido, false en caso contrario
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Envía un email con el enlace al video
 * 
 * En un entorno de producción, esto se conectaría con un servicio 
 * de email como SendGrid, Mailgun, AWS SES, etc.
 * 
 * @param to Email del destinatario
 * @param videoTitle Título del video
 * @param shareLink Enlace para compartir
 * @param message Mensaje personalizado opcional
 * @returns Promise<boolean> Resultado del envío
 */
export async function sendShareEmail(
  to: string,
  videoTitle: string,
  shareLink: string,
  message?: string
): Promise<boolean> {
  try {
    // En un entorno real, aquí se conectaría con un servicio de envío de emails
    console.log("Enviando email a:", to);
    console.log("Asunto:", `¡Mira este video de Real Madrid! - ${videoTitle}`);
    console.log("Contenido:");
    console.log("----------------------------------------");
    console.log("Hola,");
    console.log("");
    console.log("Te comparto este video de Real Madrid que creo que te gustará:");
    console.log(`"${videoTitle}"`);
    console.log("");
    
    if (message) {
      console.log("Mensaje personalizado:");
      console.log(message);
      console.log("");
    }
    
    console.log("Puedes verlo aquí:");
    console.log(shareLink);
    console.log("");
    console.log("¡Hala Madrid!");
    console.log("----------------------------------------");
    
    // Simulamos un pequeño retraso para simular el envío del email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error("Error al enviar email:", error);
    return false;
  }
}

/**
 * Genera un enlace corto para compartir el video
 * 
 * En un entorno real, esto podría usar un servicio de acortamiento de URLs
 * como Bitly, TinyURL, etc. o implementar un sistema propio.
 * 
 * @param videoId ID del video
 * @param baseUrl URL base del sitio
 * @returns Enlace corto para compartir
 */
export function generateShareLink(videoId: number, baseUrl: string): string {
  // En un entorno real, aquí se generaría un enlace corto real
  // Para este ejemplo, simplemente usamos la URL completa
  return `${baseUrl}/video/${videoId}`;
}