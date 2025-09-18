/**
 * Tests for ConfigManager
 */

import { ConfigManager } from '../../src/core/ConfigManager';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = ConfigManager.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = ConfigManager.getInstance();
    const instance2 = ConfigManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize with environment variables', async () => {
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.LOG_LEVEL = 'debug';
    
    await configManager.initialize();
    
    const config = configManager.getConfig();
    expect(config.github.token).toBe('test-token');
    expect(config.logging.level).toBe('debug');
  });

  it('should use default values when env vars are not set', async () => {
    delete process.env.LOG_LEVEL;
    delete process.env.MAX_CONCURRENT_TOOLS;
    
    await configManager.initialize();
    
    const config = configManager.getConfig();
    expect(config.logging.level).toBe('info');
    expect(config.tools.maxConcurrent).toBe(5);
  });

  it('should throw error when accessing config before initialization', () => {
    const freshInstance = Object.create(ConfigManager.prototype);
    expect(() => freshInstance.getConfig()).toThrow('Configuration not initialized');
  });
});