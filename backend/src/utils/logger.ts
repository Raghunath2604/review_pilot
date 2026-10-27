import { env } from '../config/env.js';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  context?: Record<string, any>;
  durationMs?: number;
  error?: string;
  stack?: string;
}

// Sensitive keys that must NEVER appear in logs
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'jwt',
  'authorization',
  'cookie',
  'secret',
  'diff',
  'anthropic_api_key',
  'database_url',
]);

export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

class Logger {
  private formatLog(entry: LogEntry): string {
    if (env.NODE_ENV === 'production') {
      return JSON.stringify(entry);
    }

    const colorMap: Record<LogLevel, string> = {
      info: '\x1b[36m', // Cyan
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      debug: '\x1b[90m', // Gray
    };
    const reset = '\x1b[0m';
    const color = colorMap[entry.level] || '';
    const prefix = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp}`;
    const reqStr = entry.requestId ? ` (${entry.requestId})` : '';
    const ctxStr = entry.context && Object.keys(entry.context).length > 0
      ? ` ${JSON.stringify(sanitizeLogData(entry.context))}`
      : '';
    const duration = entry.durationMs !== undefined ? ` +${entry.durationMs}ms` : '';
    return `${prefix}${reqStr}: ${entry.message}${duration}${ctxStr}`;
  }

  log(level: LogLevel, message: string, meta: { requestId?: string; context?: Record<string, any>; error?: Error; durationMs?: number } = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: meta.requestId,
      context: meta.context ? sanitizeLogData(meta.context) : undefined,
      durationMs: meta.durationMs,
      error: meta.error?.message,
      stack: env.NODE_ENV === 'development' ? meta.error?.stack : undefined,
    };

    const formatted = this.formatLog(entry);

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  info(message: string, meta?: { requestId?: string; context?: Record<string, any>; durationMs?: number }) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: { requestId?: string; context?: Record<string, any> }) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: { requestId?: string; context?: Record<string, any> }) {
    this.log('error', message, { ...meta, error });
  }

  debug(message: string, meta?: { requestId?: string; context?: Record<string, any> }) {
    if (env.NODE_ENV !== 'production') {
      this.log('debug', message, meta);
    }
  }
}

export const logger = new Logger();
