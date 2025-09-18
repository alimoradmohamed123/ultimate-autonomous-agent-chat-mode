/**
 * Ultimate Autonomous Agent Chat Mode
 * Main entry point for the enterprise-grade GitHub Copilot chat mode system
 */

import dotenv from 'dotenv';
import { AutonomousAgent } from './core/AutonomousAgent';
import { Logger } from './core/Logger';
import { ConfigManager } from './core/ConfigManager';

// Load environment variables
dotenv.config();

const logger = Logger.getInstance();

async function main(): Promise<void> {
  try {
    logger.info('Starting Ultimate Autonomous Agent Chat Mode...');

    // Initialize configuration
    const config = ConfigManager.getInstance();
    await config.initialize();

    // Create and start the autonomous agent
    const agent = new AutonomousAgent(config);
    await agent.initialize();

    logger.info('Autonomous Agent Chat Mode initialized successfully');

    // Start the chat mode interface
    await agent.startChatMode();

  } catch (error) {
    logger.error('Failed to start Autonomous Agent Chat Mode:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the application
if (require.main === module) {
  void main();
}

export { main };