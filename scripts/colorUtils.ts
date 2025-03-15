/**
 * Utilidades para colorear texto en la terminal
 * Código ANSI para formatear y colorear texto en la consola
 */

/**
 * Convierte el texto a negrita
 */
export function bold(text: string): string {
  return `\x1b[1m${text}\x1b[0m`;
}

/**
 * Colorea el texto en rojo (para errores)
 */
export function red(text: string): string {
  return `\x1b[31m${text}\x1b[0m`;
}

/**
 * Colorea el texto en verde (para éxito)
 */
export function green(text: string): string {
  return `\x1b[32m${text}\x1b[0m`;
}

/**
 * Colorea el texto en amarillo (para advertencias)
 */
export function yellow(text: string): string {
  return `\x1b[33m${text}\x1b[0m`;
}

/**
 * Colorea el texto en azul (para información)
 */
export function blue(text: string): string {
  return `\x1b[34m${text}\x1b[0m`;
}

/**
 * Colorea el texto en magenta
 */
export function magenta(text: string): string {
  return `\x1b[35m${text}\x1b[0m`;
}

/**
 * Colorea el texto en cyan
 */
export function cyan(text: string): string {
  return `\x1b[36m${text}\x1b[0m`;
}