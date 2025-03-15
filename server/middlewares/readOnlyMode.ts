import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para prevenir escrituras en modo de sólo lectura
 * Se activa cuando la variable de entorno DB_READONLY está establecida como 'true'
 */
export function preventWritesMiddleware(req: Request, res: Response, next: NextFunction) {
  // Solo afecta a métodos que modifican datos
  const isReadOnly = process.env.DB_READONLY === 'true';
  const isWriteMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  
  // Permitir ciertos endpoints de lectura que usan POST
  const isAllowedReadEndpoint = 
    req.path === '/api/auth/login' ||
    req.path === '/api/auth/refresh-token';
  
  if (isReadOnly && isWriteMethod && !isAllowedReadEndpoint) {
    console.warn(`🔒 Operación bloqueada (modo solo lectura): ${req.method} ${req.path}`);
    return res.status(403).json({
      error: 'Servidor en modo de solo lectura. No se permiten modificaciones durante la fase de pruebas.'
    });
  }
  
  next();
}