/**
 * Servicio para enviar notificaciones a usuarios
 * Centraliza la lógica de notificaciones para diferentes eventos
 */

import { storage } from '../storage';
import { sendNewVideoNotificationEmail } from './emailService';
import { Video, Channel, InsertNotification } from '@shared/schema';

/**
 * Envía notificaciones a los suscriptores de un canal cuando se publica un nuevo video
 * Crea notificaciones en la base de datos y envía emails a usuarios con notificaciones activadas
 * 
 * @param video Video que se ha publicado
 * @param channel Canal del video (opcional, si no se proporciona se buscará por el ID del video)
 * @returns Estadísticas de las notificaciones enviadas
 */
export async function sendNewVideoNotifications(
  video: Video,
  channel?: Channel
): Promise<{ total: number, emailsSent: number, errors: number }> {
  const result = {
    total: 0,
    emailsSent: 0,
    errors: 0
  };
  
  try {
    // Si no se proporciona el canal, buscarlo por el ID del video
    if (!channel) {
      const channelFromDb = await storage.getChannelByExternalId(video.channelId);
      if (!channelFromDb) {
        console.error(`No se encontró canal con ID externo ${video.channelId}`);
        return result;
      }
      channel = channelFromDb;
    }
    
    // Buscar suscripciones al canal
    const subscriptions = await storage.getSubscriptionsByChannelId(channel.id);
    console.log(`Enviando notificaciones a ${subscriptions.length} suscriptores del canal ${channel.title}`);
    result.total = subscriptions.length;
    
    // Para cada suscripción, crear notificación en la base de datos y enviar email si tienen notificaciones activadas
    for (const subscription of subscriptions) {
      try {
        // Crear notificación en el sistema
        const notification: InsertNotification = {
          userId: subscription.userId,
          channelId: channel.id,
          videoId: video.id,
          type: 'new_video',
          message: `Nuevo video de ${channel.title}: ${video.title}`,
          isRead: false
        };
        
        await storage.createNotification(notification);
        
        // Si el usuario tiene notificaciones activadas, enviar email
        if (subscription.notificationsEnabled) {
          // Obtener usuario
          const user = await storage.getUser(subscription.userId);
          if (user && user.email) {
            // Enviar email
            const emailSent = await sendNewVideoNotificationEmail(
              user.email,
              video.title,
              video.id,
              channel.title,
              video.thumbnailUrl
            );
            
            if (emailSent) {
              result.emailsSent++;
              console.log(`Email enviado a ${user.email} para el video ${video.title}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error enviando notificación a usuario ${subscription.userId}:`, error);
        result.errors++;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error en sendNewVideoNotifications:', error);
    return result;
  }
}

/**
 * Verifica si hay suscripciones a un canal y envía notificaciones
 * para un nuevo video
 * 
 * @param videoId ID interno del video en la base de datos
 * @returns Estadísticas de las notificaciones enviadas
 */
export async function processVideoNotifications(
  videoId: number
): Promise<{ total: number, emailsSent: number, errors: number, success: boolean }> {
  try {
    // Obtener información del video
    const video = await storage.getVideoById(videoId);
    if (!video) {
      console.error(`No se encontró video con ID ${videoId}`);
      return { total: 0, emailsSent: 0, errors: 0, success: false };
    }
    
    // Obtener información del canal
    const channel = await storage.getChannelByExternalId(video.channelId);
    if (!channel) {
      console.error(`No se encontró canal con ID externo ${video.channelId}`);
      return { total: 0, emailsSent: 0, errors: 0, success: false };
    }
    
    // Enviar notificaciones
    const result = await sendNewVideoNotifications(video, channel);
    
    return {
      ...result,
      success: true
    };
  } catch (error) {
    console.error('Error en processVideoNotifications:', error);
    return { total: 0, emailsSent: 0, errors: 0, success: false };
  }
}