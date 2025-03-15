/**
 * Servicio para compartir videos por email
 */

// Función para validar un email básico
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
  // Validar el email
  if (!isValidEmail(to)) {
    throw new Error("Email inválido");
  }

  try {
    // Aquí se implementaría la lógica real de envío de emails
    // usando alguna API o servicio como SendGrid, Mailgun, etc.
    
    // Por ahora solo registramos en consola (simulando envío)
    console.log("[EMAIL SERVICE] Enviando email:");
    console.log(`- Destinatario: ${to}`);
    console.log(`- Asunto: ¡Mira este video del Real Madrid en Hub Madridista!`);
    console.log(`- Título del video: ${videoTitle}`);
    console.log(`- Enlace: ${shareLink}`);
    console.log(`- Mensaje personalizado: ${message || "(Sin mensaje personalizado)"}`);
    
    // Simulamos un envío exitoso
    return true;
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw new Error("No se pudo enviar el email");
  }
}