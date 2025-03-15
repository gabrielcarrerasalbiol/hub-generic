import { Express, Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { storage } from './storage';
import { generateToken, isAuthenticated, isAdmin } from './auth';
import { insertUserSchema, UserRole } from '../shared/schema';
import { z } from 'zod';
import * as fs from 'fs';
import { sendNewUserNotification, sendWelcomeEmail, sendPasswordResetEmail } from './api/emailService';

// Schema for login validation
const loginSchema = z.object({
  username: z.string().min(3, 'Nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

// Schema for registration validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Export function to register all auth routes
// Generar un token único para el reseteo de contraseña
function generateResetToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

// Almacenamiento temporal de tokens de reseteo (en producción debería guardarse en la base de datos)
const passwordResetTokens: Record<string, {userId: number, expiresAt: Date}> = {};

export function registerAuthRoutes(app: Express) {
  // Limitador de registro - previene múltiples intentos de registro
  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // limitar a 5 intentos de registro por IP por hora
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de registro, por favor intente más tarde' }
  });

  // Limitador de login - previene ataques de fuerza bruta
  const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // limitar a 10 intentos de login por IP por hora
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de inicio de sesión, por favor intente más tarde' }
  });

  // Limitador para endpoint de recuperación de contraseña
  const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // limitar a 3 solicitudes por hora por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes de recuperación de contraseña, por favor intente más tarde' }
  });

  // Register a new user
  app.post('/api/auth/register', registerLimiter, async (req: Request, res: Response) => {
    try {
      // Validate registration data
      const validation = registerSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Datos de registro inválidos', 
          details: validation.error.format() 
        });
      }
      
      const { username, password, email, name, profilePicture } = validation.data;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Nombre de usuario ya está en uso' });
      }
      
      // Check if email already exists (if provided)
      if (email) {
        const userWithEmail = await storage.getUserByEmail(email);
        if (userWithEmail) {
          return res.status(400).json({ error: 'Correo electrónico ya está en uso' });
        }
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create the user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: email || null,
        name: name || null,
        profilePicture: profilePicture || null,
        role: 'free' // Usuario gratuito por defecto
      });
      
      // Generate auth token
      const token = generateToken(user);
      
      // Enviar email de bienvenida al usuario si proporcionó correo
      if (email) {
        try {
          // Enviar email de bienvenida al usuario
          await sendWelcomeEmail(email, username, name || undefined);
          
          // Notificar al administrador sobre el nuevo registro
          await sendNewUserNotification(username, email, name || undefined);
        } catch (emailError) {
          console.error('Error enviando emails de registro:', emailError);
          // No detener el registro si falla el email
        }
      }
      
      // Return user data and token
      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Error en el registro, por favor intenta nuevamente' });
    }
  });
  
  // Login with username/password
  app.post('/api/auth/login', loginLimiter, async (req: Request, res: Response) => {
    try {
      // Validate login data
      const validation = loginSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Datos de inicio de sesión inválidos', 
          details: validation.error.format() 
        });
      }
      
      passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
        if (err) {
          console.error('Error during login:', err);
          return res.status(500).json({ error: 'Error interno, por favor intenta nuevamente' });
        }
        
        if (!user) {
          return res.status(401).json({ error: info?.message || 'Credenciales inválidas' });
        }
        
        // Generate auth token
        const token = generateToken(user);
        
        // Return user data and token
        res.json({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            profilePicture: user.profilePicture,
            role: user.role
          },
          token
        });
      })(req, res);
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Error en el inicio de sesión, por favor intenta nuevamente' });
    }
  });
  
  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      session: false
    })
  );
  
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { 
      failureRedirect: '/login', 
      session: false 
    }),
    (req: Request, res: Response) => {
      const user = req.user as any;
      const token = generateToken(user);
      
      // Redirect with token to frontend
      res.redirect(`/?token=${token}`);
    }
  );
  
  // Apple Sign In routes
  app.get('/api/auth/apple',
    passport.authenticate('apple', {
      scope: ['name', 'email'],
      session: false
    })
  );
  
  app.post('/api/auth/apple/callback',
    passport.authenticate('apple', {
      failureRedirect: '/login',
      session: false
    }),
    (req: Request, res: Response) => {
      const user = req.user as any;
      const token = generateToken(user);
      
      // Redirect with token to frontend
      res.redirect(`/?token=${token}`);
    }
  );
  
  // Cache para limitar peticiones excesivas de /api/auth/me
  const authRequestCache: Map<string, {
    timestamp: number, 
    response: any,
    etagCache: string
  }> = new Map();
  
  // Sistema de emergencia para bloqueo total de solicitudes - desactivado inicialmente
  let GLOBAL_BLOCK_UNTIL = 0; // Desactivado por defecto
  let GLOBAL_REQUEST_COUNT = 0;
  
  // Si hay más de 5000 solicitudes en 10 segundos, bloquear por 30 segundos
  // El umbral de emergencia se ha incrementado considerablemente para evitar bloqueos innecesarios
  setInterval(() => {
    if (GLOBAL_REQUEST_COUNT > 5000) {
      console.log(`ACTIVANDO BLOQUEO DE EMERGENCIA - ${GLOBAL_REQUEST_COUNT} solicitudes detectadas`);
      GLOBAL_BLOCK_UNTIL = Date.now() + 30000; // 30 segundos de bloqueo
    }
    GLOBAL_REQUEST_COUNT = 0;
  }, 10000);
  
  // Programa limpieza del bloqueo cada 5 minutos
  setInterval(() => {
    console.log('LIMPIEZA PROGRAMADA - Reseteando contadores y caché');
    GLOBAL_BLOCK_UNTIL = 0;
    requestCounters.clear();
    authRequestCache.clear();
  }, 300000); // 5 minutos
  
  // Tiempo mínimo entre solicitudes (250ms = 0.25 segundos) - Reducido para permitir más solicitudes rápidas
  const THROTTLE_TIME_MS = 250;
  
  // Contador para limitar número total de solicitudes por sesión
  const requestCounters: Map<string, number> = new Map();
  const MAX_REQUESTS_PER_MINUTE = 1800; // 30 solicitudes por segundo (aumentado significativamente)
  
  // Resetear contadores cada 2 minutos
  setInterval(() => {
    console.log("Reseteando contadores de solicitudes");
    requestCounters.clear();
  }, 120000);
  
  // Get current user with STRICT rate limiting
  app.get('/api/auth/me', isAuthenticated, (req: Request, res: Response) => {
    // Incrementar contador global
    GLOBAL_REQUEST_COUNT++;
    
    // Bloqueo global de emergencia
    if (Date.now() < GLOBAL_BLOCK_UNTIL) {
      console.log(`Bloqueo global activo: ${Math.floor((GLOBAL_BLOCK_UNTIL - Date.now()) / 1000)}s restantes`);
      return res.status(429).json({
        error: 'Sistema en mantenimiento, por favor intente más tarde',
        retryAfter: 60
      });
    }
    const user = req.user as any;
    
    // Generar una clave única para cada usuario
    const cacheKey = `user_${user.id}`;
    const now = Date.now();
    
    // Incrementar contador de solicitudes
    const currentCount = requestCounters.get(cacheKey) || 0;
    requestCounters.set(cacheKey, currentCount + 1);
    
    // Si se excede el límite de solicitudes, responder con un 429
    if (currentCount > MAX_REQUESTS_PER_MINUTE) {
      return res.status(429).json({ 
        error: 'Too many requests, please try again later',
        retryAfter: 60 // segundos
      });
    }
    
    // Cada minuto, resetear contadores
    if (!authRequestCache.has('counterResetScheduled')) {
      authRequestCache.set('counterResetScheduled', { timestamp: now, response: null, etagCache: '' });
      setTimeout(() => {
        requestCounters.clear();
        authRequestCache.delete('counterResetScheduled');
      }, 60000); // 1 minuto
    }
    
    // Verificar si hay una respuesta en caché reciente
    const cachedResponse = authRequestCache.get(cacheKey);
    if (cachedResponse && (now - cachedResponse.timestamp) < THROTTLE_TIME_MS) {
      // Log para depuración
      console.log(`Using cached response for user ${user.id}`);
      
      // Verificar si el cliente tiene la versión actual con ETag
      const clientEtag = req.headers['if-none-match'];
      if (clientEtag && clientEtag === cachedResponse.etagCache) {
        return res.status(304).end();
      }
      
      // Establecer ETag para futuras solicitudes
      res.setHeader('ETag', cachedResponse.etagCache);
      res.setHeader('Cache-Control', 'private, max-age=2');
      
      // Usar la respuesta en caché si la solicitud es demasiado frecuente
      return res.json(cachedResponse.response);
    }
    
    // Preparar respuesta
    const response = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      role: user.role
    };
    
    // Generar ETag para esta respuesta
    const etag = `"user-${user.id}-${now}"`;
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'private, max-age=2');
    
    // Actualizar la caché con esta respuesta
    authRequestCache.set(cacheKey, {
      timestamp: now,
      response,
      etagCache: etag
    });
    
    res.json(response);
  });
  
  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ error: 'Error al cerrar sesión' });
      }
      res.json({ message: 'Sesión cerrada con éxito' });
    });
  });
  
  // Ruta especial para regenerar tokens (uso temporal durante desarrollo)
  // Esta ruta solo debe existir en ambiente de desarrollo
  app.post('/api/auth/refresh-admin-token', async (req: Request, res: Response) => {
    try {
      // Buscar usuario admin (para pruebas/desarrollo)
      const adminUser = await storage.getUserByUsername('testadmin');
      
      if (!adminUser) {
        return res.status(404).json({ error: 'Usuario administrador no encontrado' });
      }
      
      // Generar nuevo token
      const token = generateToken(adminUser);
      
      // Guardar token en archivo para pruebas
      fs.writeFileSync('./admin_token.txt', token);
      
      res.json({ 
        message: 'Token de administrador regenerado correctamente',
        token
      });
    } catch (error) {
      console.error('Error al regenerar token admin:', error);
      res.status(500).json({ error: 'Error al regenerar token' });
    }
  });
  
  app.post('/api/auth/refresh-user-token', async (req: Request, res: Response) => {
    try {
      // Buscar usuario regular (para pruebas/desarrollo)
      const normalUser = await storage.getUserByUsername('normaluser');
      
      if (!normalUser) {
        return res.status(404).json({ error: 'Usuario normal no encontrado' });
      }
      
      // Generar nuevo token
      const token = generateToken(normalUser);
      
      // Guardar token en archivo para pruebas
      fs.writeFileSync('./normal_token.txt', token);
      
      res.json({ 
        message: 'Token de usuario normal regenerado correctamente',
        token
      });
    } catch (error) {
      console.error('Error al regenerar token de usuario:', error);
      res.status(500).json({ error: 'Error al regenerar token' });
    }
  });
  
  // Update user profile
  app.put('/api/auth/profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { name, email, profilePicture } = req.body;
      
      // Update allowed fields
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;
      if (profilePicture !== undefined) updates.profilePicture = profilePicture;
      
      // Check if email already exists
      if (email && email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ error: 'Correo electrónico ya está en uso' });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(user.id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePicture: updatedUser.profilePicture
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  });
  
  // Change password
  app.put('/api/auth/password', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Se requiere contraseña actual y nueva' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }
      
      // Get the full user record
      const userRecord = await storage.getUser(user.id);
      
      if (!userRecord || !userRecord.password) {
        return res.status(400).json({ error: 'Usuario no puede cambiar contraseña (inicio de sesión social)' });
      }
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, userRecord.password);
      
      if (!isValid) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUser(user.id, { password: hashedPassword });
      
      res.json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  });
  
  // Cambiar el rol de un usuario (solo para administradores)
  app.put('/api/auth/role/:userId', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      // Validar el rol
      if (!role || !['free', 'premium', 'admin'].includes(role)) {
        return res.status(400).json({
          error: 'Rol inválido',
          validRoles: ['free', 'premium', 'admin']
        });
      }
      
      // Comprobar que el usuario existe
      const userToUpdate = await storage.getUser(parseInt(userId));
      if (!userToUpdate) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      // Actualizar el rol del usuario
      const updatedUser = await storage.updateUser(parseInt(userId), { role });
      
      if (!updatedUser) {
        return res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
      }
      
      res.json({
        message: 'Rol actualizado con éxito',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
    }
  });

  // Solicitar reseteo de contraseña
  app.post('/api/auth/forgot-password', passwordResetLimiter, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Se requiere un correo electrónico' });
      }
      
      // Buscar usuario por email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Por seguridad, no revelar si el correo existe o no
        return res.status(200).json({ 
          message: 'Si el correo existe en nuestra base de datos, recibirás instrucciones para restablecer tu contraseña.' 
        });
      }
      
      // Generar token de reseteo
      const resetToken = generateResetToken();
      
      // Almacenar token con expiración (24 horas)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      passwordResetTokens[resetToken] = {
        userId: user.id,
        expiresAt
      };
      
      // En producción, aquí enviaríamos un correo con el link de reseteo
      // Por ahora, solo devolvemos el token para testing
      console.log(`Token de reseteo para ${email}: ${resetToken}`);
      console.log(`Link de reseteo: http://localhost:5000/reset-password?token=${resetToken}`);
      
      res.status(200).json({ 
        message: 'Si el correo existe en nuestra base de datos, recibirás instrucciones para restablecer tu contraseña.',
        // Solo en desarrollo:
        resetToken,
        resetLink: `http://localhost:5000/reset-password?token=${resetToken}`
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      res.status(500).json({ error: 'Error al solicitar reseteo de contraseña' });
    }
  });
  
  // Validar token de reseteo
  app.get('/api/auth/reset-password/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      // Verificar si el token existe y no ha expirado
      const resetData = passwordResetTokens[token];
      
      if (!resetData || new Date() > resetData.expiresAt) {
        return res.status(400).json({ error: 'Token inválido o expirado' });
      }
      
      res.status(200).json({ valid: true });
    } catch (error) {
      console.error('Error validating reset token:', error);
      res.status(500).json({ error: 'Error al validar token de reseteo' });
    }
  });
  
  // Resetear contraseña con token
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      
      // Validar datos
      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }
      
      // Verificar si el token existe y no ha expirado
      const resetData = passwordResetTokens[token];
      
      if (!resetData || new Date() > resetData.expiresAt) {
        return res.status(400).json({ error: 'Token inválido o expirado' });
      }
      
      // Buscar usuario
      const user = await storage.getUser(resetData.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      // Hash nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Actualizar contraseña
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Eliminar token usado
      delete passwordResetTokens[token];
      
      res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'Error al resetear contraseña' });
    }
  });
}