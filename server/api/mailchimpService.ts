/**
 * Servicio para integración con Mailchimp
 * Maneja la suscripción de usuarios a la newsletter
 */

import mailchimp from '@mailchimp/mailchimp_marketing';
import { Request, Response } from 'express';

// Configuración de cliente Mailchimp
const initMailchimp = () => {
  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX
  });
  
  return mailchimp;
};

/**
 * Verifica si el email ya está registrado en la lista
 * @param email Email a verificar
 * @returns true si ya está suscrito, false si no
 */
export async function isEmailSubscribed(email: string): Promise<boolean> {
  try {
    const client = initMailchimp();
    
    // Crear un hash MD5 del email en minúsculas para identificar al suscriptor
    const emailHash = require('crypto')
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');
    
    // Intenta obtener el suscriptor por su hash
    await client.lists.getListMember(
      process.env.MAILCHIMP_AUDIENCE_ID!,
      emailHash
    );
    
    // Si no hay error, el email ya está suscrito
    return true;
  } catch (error: any) {
    // Si el código de error es 404, el email no está suscrito
    if (error.status === 404) {
      return false;
    }
    
    // Para cualquier otro error, lo consideramos como un problema técnico
    console.error('Error verificando suscripción en Mailchimp:', error);
    throw new Error('Error al verificar la suscripción');
  }
}

/**
 * Suscribe a un usuario a la newsletter de Mailchimp
 * @param email Email del usuario
 * @param name Nombre del usuario (opcional)
 * @returns Resultado de la operación
 */
export async function subscribeToNewsletter(email: string, name?: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Verificar si el email ya está suscrito
    const isSubscribed = await isEmailSubscribed(email);
    
    if (isSubscribed) {
      return {
        success: true,
        message: 'Email ya registrado en nuestra newsletter'
      };
    }
    
    const client = initMailchimp();
    
    // Dividir el nombre completo en nombre y apellido si es posible
    let firstName = name || '';
    let lastName = '';
    
    if (name && name.includes(' ')) {
      const nameParts = name.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }
    
    // Suscribir al usuario
    await client.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID!, {
      email_address: email,
      status: 'subscribed', // o 'pending' para doble opt-in
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    });
    
    return {
      success: true,
      message: '¡Gracias por suscribirte a nuestra newsletter!'
    };
  } catch (error: any) {
    console.error('Error suscribiendo a Mailchimp:', error);
    
    // Manejar diferentes tipos de errores de Mailchimp
    if (error.response && error.response.body && error.response.body.title) {
      return {
        success: false,
        message: `Error: ${error.response.body.title}`
      };
    }
    
    return {
      success: false,
      message: 'Ha ocurrido un error al procesar tu suscripción. Por favor, inténtalo más tarde.'
    };
  }
}

/**
 * Endpoint para manejar suscripciones a la newsletter
 */
export function handleNewsletterSubscription(req: Request, res: Response) {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'El email es obligatorio'
    });
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de email inválido'
    });
  }
  
  // Procesar la suscripción
  subscribeToNewsletter(email, name)
    .then(result => {
      return res.status(result.success ? 200 : 400).json(result);
    })
    .catch(error => {
      console.error('Error en suscripción a newsletter:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    });
}