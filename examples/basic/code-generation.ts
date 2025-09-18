/**
 * Basic Example: Simple Code Generation
 * 
 * This example demonstrates basic usage of the Autonomous Agent
 * for generating code from natural language descriptions.
 */

import { AutonomousAgent } from '../../src/core/AutonomousAgent';
import { ConfigManager } from '../../src/core/ConfigManager';
import { AgentContext } from '../../src/core/AutonomousAgent';

async function basicCodeGeneration() {
  console.log('🚀 Starting Basic Code Generation Example...\n');

  try {
    // Step 1: Initialize the configuration
    console.log('1. Initializing configuration...');
    const config = ConfigManager.getInstance();
    await config.initialize();
    console.log('✅ Configuration initialized\n');

    // Step 2: Create and initialize the autonomous agent
    console.log('2. Creating autonomous agent...');
    const agent = new AutonomousAgent(config);
    await agent.initialize();
    console.log('✅ Autonomous agent ready\n');

    // Step 3: Create context for the request
    const context: AgentContext = {
      sessionId: `demo_${Date.now()}`,
      userId: 'demo-user',
      timestamp: new Date(),
      metadata: {
        source: 'basic-example',
        priority: 'normal',
        type: 'code-generation'
      }
    };

    // Step 4: Request code generation
    console.log('3. Requesting code generation...');
    const codeRequest = `
      Create a TypeScript function that validates email addresses.
      The function should:
      - Accept an email string as parameter
      - Return true if valid, false if invalid
      - Handle edge cases like empty strings
      - Include JSDoc documentation
    `;

    const response = await agent.processMessage(codeRequest, context);
    
    // Step 5: Handle the response
    console.log('4. Processing response...');
    if (response.success) {
      console.log('✅ Code generation successful!');
      console.log('📝 Response:', response.message);
      
      if (response.data) {
        console.log('💾 Generated data:', response.data);
      }
      
      if (response.suggestions) {
        console.log('\n💡 AI Suggestions:');
        response.suggestions.forEach(suggestion => {
          console.log(`   - ${suggestion}`);
        });
      }
      
      if (response.nextActions) {
        console.log('\n🔄 Recommended next actions:');
        response.nextActions.forEach(action => {
          console.log(`   - ${action}`);
        });
      }
    } else {
      console.log('❌ Code generation failed:', response.message);
    }

    console.log('\n🎉 Basic example completed successfully!');

  } catch (error) {
    console.error('❌ Error in basic example:', error);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicCodeGeneration().catch(console.error);
}

export { basicCodeGeneration };