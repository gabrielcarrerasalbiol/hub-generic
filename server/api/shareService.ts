/**
 * Servicio para compartir videos de Hub Madridista
 * Proporciona funcionalidades para compartir videos por email y generar enlaces cortos
 */

import { isValidEmail, sendEmail } from './emailService';

/**
 * Envía un email con el enlace al video
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
    const subject = `¡Mira este video de Real Madrid! - ${videoTitle}`;
    
    // Crear contenido HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #001C58; margin: 0;">Hub<span style="color: #FDBE11;">Madridista</span></h1>
          <div style="height: 4px; width: 100px; background: linear-gradient(to right, #001C58, #FDBE11); margin: 10px auto;"></div>
        </div>
        
        <h2 style="color: #333; margin-top: 0;">¡Alguien ha compartido un video contigo!</h2>
        
        <p>Te han compartido este video de Real Madrid que podría gustarte:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #001C58; margin-top: 0;">${videoTitle}</h3>
          
          ${message ? `
            <div style="border-left: 3px solid #FDBE11; padding-left: 10px; margin: 15px 0;">
              <p style="font-style: italic; color: #555;">${message}</p>
            </div>
          ` : ''}
          
          <p style="margin: 20px 0;">
            <a href="${shareLink}" target="_blank" rel="noopener noreferrer" style="background-color: #001C58; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; display: inline-block;">
              Ver Video
            </a>
          </p>
        </div>
        
        <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #0066cc;">${shareLink}</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px;">Hub Madridista - La plataforma para los fans del Real Madrid</p>
          <p style="color: #666; font-size: 12px;">¡Hala Madrid!</p>
        </div>
      </div>
    `;

    return await sendEmail(to, subject, html);
  } catch (error) {
    console.error("Error al enviar el email:", error);
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
  // Asegurarnos de que la URL base no tenga una barra al final
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // En un entorno de desarrollo, usamos rutas absolutas con el puerto
  if (process.env.NODE_ENV !== 'production') {
    // Obtenemos la URL de frontend de las variables de entorno o usamos un valor por defecto
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    return `${frontendUrl}/video/${videoId}`;
  }
  
  // En producción, usamos la URL completa
  return `${cleanBaseUrl}/video/${videoId}`;
}