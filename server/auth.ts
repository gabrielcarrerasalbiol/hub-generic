// Asegurar que las variables de entorno estén cargadas
import 'dotenv/config';

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// @ts-ignore - No hay tipos disponibles para passport-apple
import { Strategy as AppleStrategy } from 'passport-apple';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User, InsertUser } from '../shared/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Importar crypto para generar una clave segura temporal si no existe JWT_SECRET
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// JWT Secret for signing tokens
// Implementación mejorada para mantener un secreto consistente entre reinicios
const JWT_SECRET_FILE = path.join(process.cwd(), '.jwt_secret');

// Función para generar un secreto seguro
const generateSecureSecret = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

// Función para obtener o crear un secreto persistente
const getPersistentSecret = (): string => {
  try {
    if (fs.existsSync(JWT_SECRET_FILE)) {
      return fs.readFileSync(JWT_SECRET_FILE, 'utf8');
    } else {
      const newSecret = generateSecureSecret();
      fs.writeFileSync(JWT_SECRET_FILE, newSecret, 'utf8');
      return newSecret;
    }
  } catch (error) {
    console.error('Error accediendo al archivo de secreto JWT:', error);
    return generateSecureSecret(); // Fallback a secreto temporal en memoria
  }
};

// Verificar y mostrar información sobre la configuración de JWT_SECRET
// Usamos el vaor directo para depuración
console.log('Valor de la variable JWT_SECRET en process.env:', process.env.JWT_SECRET ? 'Definido (valor oculto)' : 'No definido');

// Establecer el JWT_SECRET con prioridad al valor de la variable de entorno
const JWT_SECRET: string = process.env.JWT_SECRET || getPersistentSecret();

// Registrar la fuente del secreto
if (process.env.JWT_SECRET) {
  console.log('JWT_SECRET configurado correctamente desde variables de entorno.');
} else {
  console.error('¡ADVERTENCIA! JWT_SECRET no está configurado en variables de entorno. Utilizando un secreto persistente en archivo.');
  console.error('En producción, establezca JWT_SECRET como variable de entorno para mayor seguridad.');
}

// Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// Apple Sign In credentials
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || '';
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || '';
const APPLE_KEY_ID = process.env.APPLE_KEY_ID || '';
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY || '';

// Callback URLs
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5000';

// Set up passport
export function setupPassport() {
  // Serialize user to session
  passport.serializeUser((user: Express.User, done) => {
    // @ts-ignore - Passport typings are problematic
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local strategy (username/password)
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Nombre de usuario incorrecto.' });
        }
        
        if (!user.password) {
          return done(null, false, { message: 'Esta cuenta está configurada para inicio de sesión social.' });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: 'Contraseña incorrecta.' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Google Strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: `${CALLBACK_URL}/auth/google/callback`,
          passReqToCallback: true,
        },
        // @ts-ignore - Type definitions for passport strategies aren't perfect
        async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            // Check if user already exists with this Google ID
            let user = await storage.getUserByGoogleId(profile.id);
            
            if (!user) {
              // Check if user exists with this email
              const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
              
              if (email) {
                user = await storage.getUserByEmail(email);
                
                if (user) {
                  // Update existing user with Google ID
                  user = await storage.updateUser(user.id, { googleId: profile.id });
                }
              }
              
              // Create a new user if no matching user found
              if (!user) {
                const newUser: InsertUser = {
                  username: profile.displayName.replace(/\s+/g, '') + Date.now().toString().substring(9),
                  email: email || null,
                  name: profile.displayName,
                  profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                  googleId: profile.id,
                  role: 'free', // Asignamos por defecto el rol free
                };
                
                user = await storage.createUser(newUser);
              }
            }
            
            // Save the token if user exists
            if (user) {
              await storage.createOAuthToken({
                userId: user.id,
                provider: 'google',
                accessToken,
                refreshToken: refreshToken || null,
                expiresAt: null
              });
              
              done(null, user);
            } else {
              done(new Error('Failed to create or retrieve user'), null);
            }
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  }

  // Apple Strategy
  if (APPLE_CLIENT_ID && APPLE_TEAM_ID && APPLE_KEY_ID && APPLE_PRIVATE_KEY) {
    passport.use(
      new AppleStrategy(
        {
          clientID: APPLE_CLIENT_ID,
          teamID: APPLE_TEAM_ID,
          keyID: APPLE_KEY_ID,
          privateKeyLocation: APPLE_PRIVATE_KEY,
          callbackURL: `${CALLBACK_URL}/auth/apple/callback`,
          passReqToCallback: true,
        },
        // @ts-ignore - Type definitions for passport-apple aren't perfect
        async (req: any, accessToken: string, refreshToken: string, idToken: string, profile: any, done: any) => {
          try {
            // Parse the idToken to get user information
            let email = null;
            let name = null;
            
            if (idToken) {
              try {
                const decodedToken: any = jwt.decode(idToken);
                email = decodedToken.email;
                
                // Apple doesn't always provide the name
                if (req.body && req.body.user) {
                  const userJson = JSON.parse(req.body.user);
                  name = userJson.name ? `${userJson.name.firstName} ${userJson.name.lastName}` : null;
                }
              } catch (e) {
                console.error('Error decoding Apple ID token:', e);
              }
            }
            
            // Check if user already exists with this Apple ID
            let user = await storage.getUserByAppleId(profile.id);
            
            if (!user && email) {
              // Check if user exists with this email
              user = await storage.getUserByEmail(email);
              
              if (user) {
                // Update existing user with Apple ID
                user = await storage.updateUser(user.id, { appleId: profile.id });
              }
            }
            
            // Create a new user if no matching user found
            if (!user) {
              const newUser: InsertUser = {
                username: `apple_user_${Date.now().toString().substring(9)}`,
                email: email || null,
                name: name || `Usuario de Apple ${Date.now().toString().substring(9)}`,
                profilePicture: null,
                appleId: profile.id,
                role: 'free', // Asignamos por defecto el rol free
              };
              
              user = await storage.createUser(newUser);
            }
            
            // Save the token if user exists
            if (user) {
              await storage.createOAuthToken({
                userId: user.id,
                provider: 'apple',
                accessToken,
                refreshToken: refreshToken || null,
                expiresAt: null
              });
              
              done(null, user);
            } else {
              done(new Error('Failed to create or retrieve user'), null);
            }
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  }
}

// Generate a JWT token for the user
export function generateToken(user: User): string {
  try {
    // Payload del token
    const payload = { 
      id: user.id,
      username: user.username,
      role: user.role,
    };
    
    // El secreto debe ser buffer o string, aseguramos que sea string
    const secret = String(JWT_SECRET);
    
    // Evitando usar TypeScript para esta llamada por problemas de definición de tipos
    // @ts-ignore
    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      algorithm: 'HS256',
      issuer: 'hub-madridista',
      audience: 'hub-madridista-users',
      notBefore: 0
    });
  } catch (error) {
    console.error('Error al generar token JWT:', error);
    throw new Error('Error en la autenticación');
  }
}

// Authentication middleware for protected routes
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Si el usuario ya está autenticado a través de sesión
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Extraer token de los headers o cookies
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ error: 'No estás autenticado' });
  }
  
  try {
    // Asegurar que JWT_SECRET sea un string
    const secret = String(JWT_SECRET);
    
    // Verificar el token con opciones específicas para mayor seguridad
    // @ts-ignore - Evitar problemas con los tipos de JWT
    const decoded = jwt.verify(token, secret, {
      issuer: 'hub-madridista',
      audience: 'hub-madridista-users',
      algorithms: ['HS256'] // Restringe a un solo algoritmo
    }) as any;
    
    // Verificar que el token contiene la información esperada
    if (!decoded || !decoded.id || typeof decoded.id !== 'number') {
      return res.status(401).json({ error: 'Token inválido (formato incorrecto)' });
    }
    
    // Obtener el usuario de la base de datos
    storage.getUser(decoded.id)
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        
        // Verificar si el usuario ha sido desactivado o su rol ha cambiado
        if (user.role !== decoded.role) {
          return res.status(403).json({ 
            error: 'La información de tu cuenta ha cambiado. Por favor, inicia sesión nuevamente.' 
          });
        }
        
        // Adjuntar usuario a la solicitud
        req.user = user;
        next();
      })
      .catch(error => {
        console.error('Error al obtener usuario durante verificación de token:', error);
        return res.status(500).json({ error: 'Error de autenticación. Inténtalo de nuevo más tarde.' });
      });
  } catch (error: any) {
    // Manejar errores específicos de JWT para proporcionar información útil
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido. Por favor, inicia sesión nuevamente.' });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Token aún no válido. Por favor, intenta más tarde.' });
    }
    
    console.error('Error verificando token JWT:', error);
    return res.status(401).json({ error: 'Error de autenticación. Por favor, inicia sesión nuevamente.' });
  }
}

// Middleware para verificar roles de usuario
export function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No estás autenticado' });
    }

    const user = req.user as User;
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({
        error: 'No tienes permiso para acceder a este recurso',
        requiredRoles: roles,
        currentRole: user.role
      });
    }

    next();
  };
}

// Middleware para verificar si el usuario es administrador
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'No estás autenticado' });
  }

  const user = req.user as User;
  
  if (user.role !== 'admin') {
    return res.status(403).json({
      error: 'Necesitas ser administrador para acceder a este recurso'
    });
  }

  next();
}

// Middleware para verificar si el usuario es premium
export function isPremium(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'No estás autenticado' });
  }

  const user = req.user as User;
  
  if (user.role !== 'premium' && user.role !== 'admin') {
    return res.status(403).json({
      error: 'Necesitas ser usuario premium para acceder a este recurso'
    });
  }

  next();
}

// Function to extract JWT token from request
function extractToken(req: Request): string | null {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.substring(7);
  }
  
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
}