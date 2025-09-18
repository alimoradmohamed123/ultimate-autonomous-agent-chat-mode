/**
 * Configuration Management for Ultimate Autonomous Agent
 */

import { z } from 'zod';

const ConfigSchema = z.object({
  github: z.object({
    token: z.string(),
    copilotApiKey: z.string(),
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    format: z.enum(['json', 'text']).default('json'),
  }),
  security: z.object({
    encryptionKey: z.string(),
    jwtSecret: z.string(),
    auditLogging: z.boolean().default(true),
    complianceMode: z.boolean().default(true),
  }),
  tools: z.object({
    maxConcurrent: z.number().default(5),
    timeoutMs: z.number().default(30000),
  }),
  learning: z.object({
    dataPath: z.string().default('./data/learning'),
    modelUpdateInterval: z.number().default(3600000),
  }),
  performance: z.object({
    cacheTtl: z.number().default(300000),
    maxMemoryMb: z.number().default(1024),
    rateLimiting: z.boolean().default(true),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export class ConfigManager {
  private static instance: ConfigManager;
  private config?: Config;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public async initialize(): Promise<void> {
    const rawConfig = {
      github: {
        token: process.env.GITHUB_TOKEN || '',
        copilotApiKey: process.env.COPILOT_API_KEY || '',
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json',
      },
      security: {
        encryptionKey: process.env.ENCRYPTION_KEY || '',
        jwtSecret: process.env.JWT_SECRET || '',
        auditLogging: process.env.AUDIT_LOGGING === 'true',
        complianceMode: process.env.COMPLIANCE_MODE === 'true',
      },
      tools: {
        maxConcurrent: parseInt(process.env.MAX_CONCURRENT_TOOLS || '5'),
        timeoutMs: parseInt(process.env.TOOL_TIMEOUT_MS || '30000'),
      },
      learning: {
        dataPath: process.env.LEARNING_DATA_PATH || './data/learning',
        modelUpdateInterval: parseInt(process.env.MODEL_UPDATE_INTERVAL || '3600000'),
      },
      performance: {
        cacheTtl: parseInt(process.env.CACHE_TTL || '300000'),
        maxMemoryMb: parseInt(process.env.MAX_MEMORY_MB || '1024'),
        rateLimiting: process.env.RATE_LIMITING === 'true',
      },
    };

    this.config = ConfigSchema.parse(rawConfig);
  }

  public getConfig(): Config {
    if (!this.config) {
      throw new Error('Configuration not initialized. Call initialize() first.');
    }
    return this.config;
  }

  public get github(): Config['github'] {
    return this.getConfig().github;
  }

  public get logging(): Config['logging'] {
    return this.getConfig().logging;
  }

  public get security(): Config['security'] {
    return this.getConfig().security;
  }

  public get tools(): Config['tools'] {
    return this.getConfig().tools;
  }

  public get learning(): Config['learning'] {
    return this.getConfig().learning;
  }

  public get performance(): Config['performance'] {
    return this.getConfig().performance;
  }
}