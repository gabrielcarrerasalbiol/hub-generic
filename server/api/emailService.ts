/**
 * Servicio de correo electrónico para Hub Madridista
 * Proporciona funcionalidades para enviar correos electrónicos utilizando nodemailer
 */

import nodemailer from 'nodemailer';

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Servidor SMTP de Hostinger
  port: 465,
  secure: true, // true para puerto 465, false para otros puertos
  auth: {
    user: 'contacto@hubmadridista.com',
    pass: 'Oldbury2022@'
  }
});

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
 * Envía un email genérico utilizando el transportador configurado
 * @param to Destinatario del correo
 * @param subject Asunto del correo
 * @param html Contenido HTML del correo
 * @param text Contenido de texto plano opcional
 * @returns Promise<boolean> Resultado del envío
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    // Verificar que el email es válido
    if (!isValidEmail(to)) {
      console.error("Formato de email inválido:", to);
      return false;
    }

    // Definir opciones del correo
    const mailOptions = {
      from: '"Hub Madridista" <contacto@hubmadridista.com>',
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Eliminar etiquetas HTML si no se proporciona texto plano
      html
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error("Error al enviar el email:", error);
    return false;
  }
}

/**
 * Envía una notificación cuando un nuevo usuario se registra
 * @param username Nombre de usuario registrado
 * @param email Email del usuario (si proporcionó)
 * @param name Nombre completo del usuario (si proporcionó)
 * @returns Promise<boolean> Resultado del envío
 */
export async function sendNewUserNotification(
  username: string,
  email?: string | null,
  name?: string | null
): Promise<boolean> {
  const subject = '📣 Nuevo usuario registrado en Hub Madridista';
  
  // Crear contenido HTML
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #001C58; margin: 0;">Hub<span style="color: #FDBE11;">Madridista</span></h1>
        <div style="height: 4px; width: 100px; background: linear-gradient(to right, #001C58, #FDBE11); margin: 10px auto;"></div>
      </div>
      
      <h2 style="color: #333; margin-top: 0;">¡Nuevo usuario registrado!</h2>
      
      <p>Un nuevo usuario se ha registrado en la plataforma con los siguientes datos:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Usuario:</strong> ${username}</p>
        ${email ? `<p><strong>Email:</strong> ${email}</p>` : '<p><strong>Email:</strong> No proporcionado</p>'}
        ${name ? `<p><strong>Nombre:</strong> ${name}</p>` : '<p><strong>Nombre:</strong> No proporcionado</p>'}
        <p><strong>Fecha de registro:</strong> ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' })}</p>
      </div>
      
      <p>Puedes acceder al panel de administración para ver más detalles.</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 12px;">Hub Madridista - La plataforma para los fans del Real Madrid</p>
        <p style="color: #666; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
      </div>
    </div>
  `;

  return await sendEmail('contacto@hubmadridista.com', subject, html);
}

/**
 * Envía un email de bienvenida al nuevo usuario
 * @param to Email del usuario
 * @param username Nombre de usuario
 * @param name Nombre completo del usuario (opcional)
 * @returns Promise<boolean> Resultado del envío
 */
export async function sendWelcomeEmail(
  to: string,
  username: string,
  name?: string | null
): Promise<boolean> {
  const subject = '¡Bienvenido a Hub Madridista!';
  
  const greeting = name ? `Hola ${name}` : `Hola ${username}`;
  
  // Crear contenido HTML
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #001C58; margin: 0;">Hub<span style="color: #FDBE11;">Madridista</span></h1>
        <div style="height: 4px; width: 100px; background: linear-gradient(to right, #001C58, #FDBE11); margin: 10px auto;"></div>
      </div>
      
      <h2 style="color: #333; margin-top: 0;">¡Bienvenido a Hub Madridista!</h2>
      
      <p>${greeting},</p>
      
      <p>¡Gracias por registrarte en Hub Madridista! Estamos emocionados de tenerte con nosotros.</p>
      
      <p>En nuestra plataforma encontrarás:</p>
      
      <ul style="padding-left: 20px; line-height: 1.6;">
        <li>Videos exclusivos del Real Madrid</li>
        <li>Contenido de todas las plataformas en un solo lugar</li>
        <li>Funciones de favoritos y suscripciones</li>
        <li>Y mucho más</li>
      </ul>
      
      <p style="margin: 20px 0; text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'https://hubmadridista.com'}" style="background-color: #001C58; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block;">
          Explorar contenido
        </a>
      </p>
      
      <p>Si tienes alguna pregunta o sugerencia, no dudes en contactarnos a <a href="mailto:contacto@hubmadridista.com">contacto@hubmadridista.com</a>.</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 12px;">Hub Madridista - La plataforma para los fans del Real Madrid</p>
        <p style="color: #666; font-size: 12px;">¡Hala Madrid!</p>
      </div>
    </div>
  `;

  return await sendEmail(to, subject, html);
}