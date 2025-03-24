// Nota: Mover la carga de dotenv al principio para que esté disponible para todos los módulos
// Esto debe ejecutarse antes de importar otros módulos
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Determinar el entorno y cargar el archivo .env correspondiente
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`Modo de la aplicación: ${nodeEnv === 'production' ? 'PRODUCCIÓN' : 'DESARROLLO'}`);

let dotenvPath = '.env';
if (nodeEnv === 'production' && fs.existsSync('.env.production')) {
  dotenvPath = '.env.production';
}

try {
  const dotenvResult = dotenv.config({ path: dotenvPath });
  if (dotenvResult.parsed) {
    console.log(`Variables de entorno cargadas correctamente desde ${dotenvPath}`);
    console.log('Variables cargadas:', Object.keys(dotenvResult.parsed).join(', '));
    console.log('JWT_SECRET está definido:', dotenvResult.parsed.JWT_SECRET ? 'Sí (valor oculto)' : 'No');
  } else {
    console.error(`Error al cargar las variables de entorno: No se encontró el archivo ${dotenvPath} o está vacío`);
  }
} catch (error) {
  console.error('Error al cargar dotenv:', error);
}

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { registerAuthRoutes } from "./authRoutes";
import { setupPassport } from "./auth";
import { setupVite, serveStatic, log } from "./vite";
import { initDb, isReadOnlyMode } from "./db";
import { pgStorage } from "./pgStorage";
import { preventWritesMiddleware } from "./middlewares/readOnlyMode";
import { setupScheduledTasks } from "./scheduledTasks";

const app = express();

// Configurar Express para confiar en el proxy de Replit
// Esto es necesario para que express-rate-limit funcione correctamente con X-Forwarded-For
app.set('trust proxy', 1);

// Aplicar Helmet para mejorar la seguridad con encabezados HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'", 
        "https://ui-avatars.com",
        "https://plausible.io",
        "https://*.googletagmanager.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'", 
        "https://api.openai.com", 
        "https://claude-api.anthropic.com",
        "https://plausible.io",
        "https://*.google-analytics.com"
      ],
      frameSrc: ["'self'", "https://www.youtube.com", "https://player.vimeo.com", "https://www.tiktok.com"]
    }
  },
  crossOriginEmbedderPolicy: false, // Necesario para cargar recursos de terceros
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite el uso de recursos cross-origin
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Limitar tamaño de payloads JSON para prevenir ataques DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());

// Añadir identificadores de respuesta
app.use((req, res, next) => {
  res.setHeader('X-Hub-Madridista', 'v1.0');
  next();
});

// Servir archivos estáticos desde la carpeta public
// En ES modules necesitamos usar import.meta.url para obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configurar limitadores de tasa (rate limiting)
// Limitador general para todas las solicitudes API
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'), // límite de 200 solicitudes por ventana por IP por defecto
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, por favor intente más tarde' }
});

// Limitador más estricto para intentos de autenticación
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // límite de 10 intentos por hora por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión, por favor intente más tarde' }
});

// Limitador para endpoint de recuperación de contraseña
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // límite de 3 solicitudes por hora por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de recuperación de contraseña, por favor intente más tarde' }
});

// Aplicar limitador general a todas las rutas API
app.use('/api', apiLimiter);

// Limitadores específicos se aplicarán directamente en las rutas de autenticación
// El contador se resetea cada 24 horas
setInterval(() => {
  console.log('Reseteando contadores de solicitudes');
}, 24 * 60 * 60 * 1000);

// Session configuration
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'hubmadridistasessionsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
setupPassport();

// Aplicar middleware de solo lectura si estamos en modo de solo lectura
if (isReadOnlyMode()) {
  console.log('🔒 Activando middleware de modo solo lectura - Las operaciones de escritura serán bloqueadas');
  app.use(preventWritesMiddleware);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Inicializar la conexión a la base de datos
    await initDb();
    console.log('Conexión a la base de datos PostgreSQL establecida');
    
    // Inicializar datos predeterminados en la base de datos
    await pgStorage.initializeDefaultData();
    
    // Inicializar y configurar tareas programadas
    setupScheduledTasks();
    
    // Register authentication routes
    registerAuthRoutes(app);
    
    // Register regular API routes
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Server error:', err);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error: any) {
    console.error('Error al inicializar la aplicación:', error.message);
    process.exit(1);
  }
})();
