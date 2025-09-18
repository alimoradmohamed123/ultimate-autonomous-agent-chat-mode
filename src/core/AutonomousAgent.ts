/**
 * Core Autonomous Agent for GitHub Copilot Chat Mode
 */

import { ConfigManager } from './ConfigManager';
import { Logger } from './Logger';
import { ProtocolManager } from '../protocols/ProtocolManager';
import { SecurityValidator } from '../security/SecurityValidator';
import { ToolOrchestrator } from '../tools/ToolOrchestrator';
import { LearningEngine } from '../learning/LearningEngine';
import { ChatModeInterface } from './ChatModeInterface';

export interface AgentContext {
  sessionId: string;
  userId: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: unknown;
  suggestions?: string[];
  nextActions?: string[];
}

export class AutonomousAgent {
  // @ts-expect-error - config will be used in future implementations
  private readonly config: ConfigManager;
  private readonly logger: Logger;
  private readonly protocolManager: ProtocolManager;
  private readonly securityValidator: SecurityValidator;
  private readonly toolOrchestrator: ToolOrchestrator;
  private readonly learningEngine: LearningEngine;
  private readonly chatInterface: ChatModeInterface;
  private isInitialized = false;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = Logger.getInstance();
    this.protocolManager = new ProtocolManager(config);
    this.securityValidator = new SecurityValidator(config);
    this.toolOrchestrator = new ToolOrchestrator(config);
    this.learningEngine = new LearningEngine(config);
    this.chatInterface = new ChatModeInterface(this);
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.logger.info('Initializing Autonomous Agent...');

    try {
      // Initialize all components
      await this.protocolManager.initialize();
      await this.securityValidator.initialize();
      await this.toolOrchestrator.initialize();
      await this.learningEngine.initialize();
      await this.chatInterface.initialize();

      this.isInitialized = true;
      this.logger.info('Autonomous Agent initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Autonomous Agent:', error);
      throw error;
    }
  }

  public async startChatMode(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    this.logger.info('Starting Chat Mode interface...');
    await this.chatInterface.start();
  }

  public async processMessage(
    message: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    if (!this.isInitialized) {
      throw new Error('Agent not initialized');
    }

    this.logger.info('Processing message', { sessionId: context.sessionId });

    try {
      // Security validation
      const securityResult = await this.securityValidator.validateInput(message, context);
      if (!securityResult.isValid) {
        return {
          success: false,
          message: 'Security validation failed: ' + securityResult.reason,
        };
      }

      // Protocol selection and execution
      const protocol = await this.protocolManager.selectProtocol(message, context);
      const response = await protocol.execute(message, context);

      // Learning from interaction
      await this.learningEngine.learn(message, response, context);

      // Audit logging
      this.logger.audit('message_processed', {
        sessionId: context.sessionId,
        messageLength: message.length,
        protocolUsed: protocol.getName(),
        success: response.success,
      });

      return response;
    } catch (error) {
      this.logger.error('Error processing message:', error);
      return {
        success: false,
        message: 'An error occurred while processing your message',
      };
    }
  }

  public async getToolOrchestrator(): Promise<ToolOrchestrator> {
    return this.toolOrchestrator;
  }

  public async getSecurityValidator(): Promise<SecurityValidator> {
    return this.securityValidator;
  }

  public async getLearningEngine(): Promise<LearningEngine> {
    return this.learningEngine;
  }
}