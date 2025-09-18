# Basic Usage Guide

This guide covers the basic usage of the Ultimate Autonomous Agent Chat Mode system.

## Getting Started

### 1. Environment Setup

First, ensure you have the required environment variables configured:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration:

```bash
# Required
GITHUB_TOKEN=ghp_your_token_here
COPILOT_API_KEY=your_copilot_key_here

# Security (generate secure keys)
ENCRYPTION_KEY=your_32_character_encryption_key
JWT_SECRET=your_jwt_secret_key

# Optional (defaults provided)
LOG_LEVEL=info
MAX_CONCURRENT_TOOLS=5
```

### 2. Basic Agent Initialization

```typescript
import { AutonomousAgent } from '../src/core/AutonomousAgent';
import { ConfigManager } from '../src/core/ConfigManager';

async function initializeAgent() {
  try {
    // Initialize configuration
    const config = ConfigManager.getInstance();
    await config.initialize();

    // Create and initialize the agent
    const agent = new AutonomousAgent(config);
    await agent.initialize();

    console.log('Agent initialized successfully!');
    return agent;
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    throw error;
  }
}
```

### 3. Processing User Messages

```typescript
import { AgentContext } from '../src/core/AutonomousAgent';

async function processUserRequest(agent, userMessage) {
  const context: AgentContext = {
    sessionId: `session_${Date.now()}`,
    userId: 'user123',
    timestamp: new Date(),
    metadata: {
      source: 'chat',
      priority: 'normal'
    }
  };

  try {
    const response = await agent.processMessage(userMessage, context);
    
    if (response.success) {
      console.log('✅ Success:', response.message);
      
      if (response.suggestions) {
        console.log('💡 Suggestions:', response.suggestions);
      }
      
      if (response.nextActions) {
        console.log('🔄 Next Actions:', response.nextActions);
      }
    } else {
      console.log('❌ Error:', response.message);
    }
    
    return response;
  } catch (error) {
    console.error('Failed to process message:', error);
    throw error;
  }
}
```

## Common Use Cases

### 1. Code Generation

```typescript
const codeRequest = "Create a secure REST API endpoint for user authentication";
const response = await processUserRequest(agent, codeRequest);
```

### 2. Security Analysis

```typescript
const securityRequest = "Analyze this code for security vulnerabilities: [paste code here]";
const response = await processUserRequest(agent, securityRequest);
```

### 3. Code Refactoring

```typescript
const refactorRequest = "Refactor this function to improve performance and readability";
const response = await processUserRequest(agent, refactorRequest);
```

### 4. Test Generation

```typescript
const testRequest = "Generate comprehensive tests for the UserService class";
const response = await processUserRequest(agent, testRequest);
```

## Working with Tools

### Tool Execution

```typescript
async function useTools(agent) {
  const toolOrchestrator = await agent.getToolOrchestrator();
  
  // Code analysis
  const analysisResult = await toolOrchestrator.executeTool(
    'code-analysis',
    { code: 'function example() { return "hello"; }' },
    context
  );
  
  // Security scan
  const securityResult = await toolOrchestrator.executeTool(
    'security-scanner',
    { target: 'src/api/auth.ts' },
    context
  );
  
  console.log('Analysis:', analysisResult);
  console.log('Security:', securityResult);
}
```

### Available Tools

- `code-analysis` - Analyze code quality and complexity
- `github-integration` - GitHub repository operations
- `documentation-generator` - Generate documentation
- `test-runner` - Execute automated tests
- `security-scanner` - Security vulnerability scanning
- `performance-profiler` - Performance analysis

## Learning and Feedback

### Providing Feedback

```typescript
async function provideFeedback(agent, sessionId, rating, comments) {
  const learningEngine = await agent.getLearningEngine();
  
  await learningEngine.provideFeedback(sessionId, {
    rating: rating, // 1-5 scale
    comments: comments,
    improvements: ['Faster response time', 'Better code quality']
  });
  
  console.log('Feedback recorded successfully');
}
```

### Getting Recommendations

```typescript
async function getRecommendations(agent, userInput, context) {
  const learningEngine = await agent.getLearningEngine();
  
  const recommendations = await learningEngine.getRecommendations(userInput, context);
  
  console.log('AI Recommendations:');
  recommendations.forEach(rec => console.log(`- ${rec}`));
}
```

## Error Handling

### Basic Error Handling

```typescript
async function robustAgentUsage() {
  try {
    const agent = await initializeAgent();
    
    const response = await processUserRequest(
      agent, 
      "Create a Node.js microservice"
    );
    
    // Handle response
    if (response.success) {
      console.log('Success!', response.data);
    } else {
      console.error('Agent error:', response.message);
    }
    
  } catch (error) {
    if (error.message.includes('Configuration not initialized')) {
      console.error('Please check your environment variables');
    } else if (error.message.includes('Security validation failed')) {
      console.error('Security error - request blocked');
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

### Handling Security Failures

```typescript
async function handleSecurityValidation(agent, userInput, context) {
  try {
    const securityValidator = await agent.getSecurityValidator();
    const validationResult = await securityValidator.validateInput(userInput, context);
    
    if (!validationResult.isValid) {
      console.error('Security validation failed:', validationResult.reason);
      console.log('Risk level:', validationResult.riskLevel);
      
      if (validationResult.recommendations) {
        console.log('Security recommendations:');
        validationResult.recommendations.forEach(rec => console.log(`- ${rec}`));
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Security validation error:', error);
    return false;
  }
}
```

## Performance Optimization

### Concurrent Tool Execution

```typescript
async function optimizedToolExecution(agent) {
  const toolOrchestrator = await agent.getToolOrchestrator();
  
  // Execute multiple tools concurrently
  const promises = [
    toolOrchestrator.executeTool('code-analysis', { code: sourceCode }, context),
    toolOrchestrator.executeTool('security-scanner', { target: 'src/' }, context),
    toolOrchestrator.executeTool('test-runner', { testSuite: 'unit' }, context)
  ];
  
  try {
    const results = await Promise.all(promises);
    console.log('All tools completed:', results);
  } catch (error) {
    console.error('Tool execution failed:', error);
  }
}
```

### Memory Management

```typescript
// Monitor memory usage
const config = ConfigManager.getInstance();
console.log('Max memory:', config.performance.maxMemoryMb, 'MB');

// Check current memory usage
if (process.memoryUsage().heapUsed > config.performance.maxMemoryMb * 1024 * 1024) {
  console.warn('Memory usage high - consider optimization');
}
```

## Next Steps

- [Enterprise Deployment Guide](enterprise-deployment.md)
- [Security Configuration Guide](security-configuration.md)  
- [Tool Development Guide](tool-development.md)
- [API Documentation](../api/)

## Troubleshooting

### Common Issues

1. **Configuration errors**: Check environment variables in `.env`
2. **Build failures**: Ensure TypeScript version compatibility
3. **Memory issues**: Adjust `MAX_MEMORY_MB` setting
4. **Tool timeouts**: Increase `TOOL_TIMEOUT_MS` setting

### Getting Help

- Check the [GitHub Issues](https://github.com/alimoradmohamed123/ultimate-autonomous-agent-chat-mode/issues)
- Review the error logs in `logs/` directory
- Enable debug logging with `LOG_LEVEL=debug`