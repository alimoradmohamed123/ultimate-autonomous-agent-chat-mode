/**
 * Basic Example: Security Analysis
 * 
 * This example demonstrates how to use the Autonomous Agent
 * for security analysis and vulnerability detection.
 */

import { AutonomousAgent } from '../../src/core/AutonomousAgent';
import { ConfigManager } from '../../src/core/ConfigManager';
import { AgentContext } from '../../src/core/AutonomousAgent';

async function securityAnalysisExample() {
  console.log('🔒 Starting Security Analysis Example...\n');

  try {
    // Initialize the system
    const config = ConfigManager.getInstance();
    await config.initialize();
    
    const agent = new AutonomousAgent(config);
    await agent.initialize();

    const context: AgentContext = {
      sessionId: `security_${Date.now()}`,
      userId: 'security-analyst',
      timestamp: new Date(),
      metadata: {
        source: 'security-analysis',
        priority: 'high',
        type: 'security-scan'
      }
    };

    // Example 1: Analyze potentially unsafe code
    console.log('1. Analyzing potentially unsafe code...');
    const unsafeCode = `
      function processUserInput(userInput) {
        // Potential security issue: eval usage
        return eval(userInput);
      }
      
      function buildQuery(userId) {
        // Potential SQL injection
        return "SELECT * FROM users WHERE id = " + userId;
      }
      
      function authenticateUser(username, password) {
        // Weak authentication
        if (username === "admin" && password === "password123") {
          return true;
        }
        return false;
      }
    `;

    const securityRequest = `
      Analyze this code for security vulnerabilities:
      ${unsafeCode}
      
      Please identify:
      - Security vulnerabilities
      - Risk levels
      - Recommended fixes
      - Best practices to implement
    `;

    const securityResponse = await agent.processMessage(securityRequest, context);
    
    if (securityResponse.success) {
      console.log('✅ Security analysis completed');
      console.log('🔍 Analysis result:', securityResponse.message);
      
      if (securityResponse.suggestions) {
        console.log('\n🚨 Security recommendations:');
        securityResponse.suggestions.forEach(suggestion => {
          console.log(`   - ${suggestion}`);
        });
      }
    }

    // Example 2: Test input validation
    console.log('\n2. Testing input validation...');
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      "'; DROP TABLE users; --",
      'javascript:alert(1)',
      '../../etc/passwd',
      'rm -rf /'
    ];

    const securityValidator = await agent.getSecurityValidator();
    
    for (const input of maliciousInputs) {
      console.log(`\n   Testing input: "${input}"`);
      const validationResult = await securityValidator.validateInput(input, context);
      
      if (validationResult.isValid) {
        console.log('   ✅ Input passed validation');
      } else {
        console.log(`   ❌ Input blocked - ${validationResult.reason}`);
        console.log(`   🚨 Risk level: ${validationResult.riskLevel}`);
        
        if (validationResult.recommendations) {
          console.log('   💡 Recommendations:');
          validationResult.recommendations.forEach(rec => {
            console.log(`      - ${rec}`);
          });
        }
      }
    }

    // Example 3: Security tool execution
    console.log('\n3. Running security tools...');
    const toolOrchestrator = await agent.getToolOrchestrator();
    
    const securityScanResult = await toolOrchestrator.executeTool(
      'security-scanner',
      {
        target: 'src/api/',
        scanType: 'comprehensive',
        includeStaticAnalysis: true,
        includeDependencyCheck: true
      },
      context
    );

    if (securityScanResult.success) {
      console.log('✅ Security scan completed');
      console.log('📊 Scan results:', securityScanResult.data);
    } else {
      console.log('❌ Security scan failed:', securityScanResult.message);
    }

    console.log('\n🔒 Security analysis example completed!');

  } catch (error) {
    console.error('❌ Error in security analysis:', error);
    process.exit(1);
  }
}

// Example of secure code patterns
function demonstrateSecurePatterns() {
  console.log('\n📚 Secure Code Patterns:\n');

  // Secure input validation
  console.log('1. Secure Input Validation:');
  console.log(`
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim()
    .substring(0, 1000); // Limit length
}
  `);

  // Secure database queries
  console.log('2. Secure Database Queries:');
  console.log(`
// Using parameterized queries
async function getUserById(userId: number) {
  const query = 'SELECT * FROM users WHERE id = $1';
  return await db.query(query, [userId]);
}

// Using ORM with built-in protection
async function getUserByEmail(email: string) {
  return await User.findOne({ 
    where: { email: sanitizeInput(email) }
  });
}
  `);

  // Secure authentication
  console.log('3. Secure Authentication:');
  console.log(`
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function authenticateUser(username: string, password: string) {
  const user = await User.findOne({ username });
  if (!user) return null;
  
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) return null;
  
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  
  return { user, token };
}
  `);
}

// Run the example
if (require.main === module) {
  securityAnalysisExample()
    .then(() => demonstrateSecurePatterns())
    .catch(console.error);
}

export { securityAnalysisExample };