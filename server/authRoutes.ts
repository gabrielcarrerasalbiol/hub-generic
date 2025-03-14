import { Express, Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { generateToken, isAuthenticated, isAdmin } from './auth';
import { insertUserSchema, UserRole } from '../shared/schema';
import { z } from 'zod';

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
export function registerAuthRoutes(app: Express) {
  // Register a new user
  app.post('/api/auth/register', async (req: Request, res: Response) => {
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
  app.post('/api/auth/login', async (req: Request, res: Response) => {
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
  
  // Get current user
  app.get('/api/auth/me', isAuthenticated, (req: Request, res: Response) => {
    const user = req.user as any;
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      role: user.role // Incluimos el rol del usuario en la respuesta
    });
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
}