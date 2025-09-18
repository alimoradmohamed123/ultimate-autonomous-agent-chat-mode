/**
 * Enterprise Logger for Ultimate Autonomous Agent
 */

import winston from 'winston';
import { ConfigManager } from './ConfigManager';

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    const config = ConfigManager.getInstance();
    
    const format = config.logging.format === 'json' 
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.simple()
        );

    this.logger = winston.createLogger({
      level: config.logging.level,
      format,
      defaultMeta: { service: 'autonomous-agent-chat-mode' },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        }),
      ],
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public debug(message: string, meta?: unknown): void {
    this.logger.debug(message, meta);
  }

  public info(message: string, meta?: unknown): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: unknown): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, error?: unknown): void {
    this.logger.error(message, { error });
  }

  public audit(action: string, details: Record<string, unknown>): void {
    this.logger.info('AUDIT', {
      action,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }
}