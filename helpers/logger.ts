/**
 * Sistema de logging para la aplicación
 * En producción, solo muestra errores y warnings
 * En desarrollo, muestra todos los logs
 */

const isDevelopment = __DEV__;

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isDevelopment) {
      return true; // En desarrollo, mostrar todo
    }
    // En producción, solo errores y warnings
    return level === 'error' || level === 'warn';
  }

  log(message: string, ...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: any, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // Método para logs de API específicos
  api(endpoint: string, method: string, data?: any): void {
    if (isDevelopment) {
      this.debug(`[API] ${method.toUpperCase()} ${endpoint}`, data);
    }
  }

  // Método para logs de componentes
  component(componentName: string, message: string, ...args: any[]): void {
    if (isDevelopment) {
      this.debug(`[${componentName}] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
export default logger;

