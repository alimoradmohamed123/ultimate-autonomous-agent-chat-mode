/**
 * Workflow Example: Autonomous Code Review and Improvement
 * 
 * This workflow demonstrates an autonomous code review process
 * that analyzes code, identifies issues, suggests improvements,
 * and implements fixes automatically.
 */

import { AutonomousAgent } from '../../src/core/AutonomousAgent';
import { ConfigManager } from '../../src/core/ConfigManager';
import { AgentContext } from '../../src/core/AutonomousAgent';

interface CodeReviewResult {
  issues: Issue[];
  improvements: Improvement[];
  metrics: CodeMetrics;
  securityFindings: SecurityFinding[];
  recommendations: string[];
}

interface Issue {
  type: 'bug' | 'performance' | 'maintainability' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  suggestedFix: string;
}

interface Improvement {
  category: string;
  description: string;
  impact: string;
  implementation: string;
}

interface CodeMetrics {
  complexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  testCoverage: number;
  performance: number;
}

interface SecurityFinding {
  vulnerability: string;
  riskLevel: string;
  description: string;
  mitigation: string;
}

class AutonomousCodeReviewWorkflow {
  private agent: AutonomousAgent;
  private context: AgentContext;

  constructor(agent: AutonomousAgent) {
    this.agent = agent;
    this.context = {
      sessionId: `code_review_${Date.now()}`,
      userId: 'autonomous-reviewer',
      timestamp: new Date(),
      metadata: {
        source: 'code-review-workflow',
        priority: 'high',
        type: 'comprehensive-review'
      }
    };
  }

  async executeWorkflow(codeToReview: string, filePath: string): Promise<CodeReviewResult> {
    console.log(`🔍 Starting Autonomous Code Review Workflow for: ${filePath}\n`);

    try {
      // Phase 1: Initial Code Analysis
      const analysisResults = await this.performCodeAnalysis(codeToReview);
      
      // Phase 2: Security Assessment
      const securityResults = await this.performSecurityAssessment(codeToReview);
      
      // Phase 3: Performance Analysis
      const performanceResults = await this.performPerformanceAnalysis(codeToReview);
      
      // Phase 4: Best Practices Check
      const bestPracticesResults = await this.checkBestPractices(codeToReview);
      
      // Phase 5: Generate Improvements
      const improvements = await this.generateImprovements(codeToReview, {
        analysis: analysisResults,
        security: securityResults,
        performance: performanceResults,
        bestPractices: bestPracticesResults
      });
      
      // Phase 6: Create Final Report
      const finalReport = this.createComprehensiveReport({
        analysis: analysisResults,
        security: securityResults,
        performance: performanceResults,
        bestPractices: bestPracticesResults,
        improvements
      });

      console.log('✅ Autonomous code review completed successfully!\n');
      return finalReport;

    } catch (error) {
      console.error('❌ Code review workflow failed:', error);
      throw error;
    }
  }

  private async performCodeAnalysis(code: string): Promise<any> {
    console.log('1. 📊 Performing Code Analysis...');

    const analysisRequest = `
      Perform comprehensive code analysis on the following code:
      
      \`\`\`typescript
      ${code}
      \`\`\`
      
      Analyze for:
      - Cyclomatic complexity
      - Code duplication
      - Naming conventions
      - Function/class size
      - Coupling and cohesion
      - SOLID principles adherence
      - Design pattern usage
      - Error handling quality
      
      Provide specific recommendations for improvement.
    `;

    const response = await this.agent.processMessage(analysisRequest, this.context);
    
    // Use tool orchestrator for detailed analysis
    const toolOrchestrator = await this.agent.getToolOrchestrator();
    const detailedAnalysis = await toolOrchestrator.executeTool('code-analysis', {
      code,
      analysisType: 'comprehensive'
    }, this.context);

    console.log('   ✅ Code analysis completed');
    return { response, detailedAnalysis };
  }

  private async performSecurityAssessment(code: string): Promise<any> {
    console.log('2. 🔒 Performing Security Assessment...');

    const securityRequest = `
      Perform security assessment on this code:
      
      \`\`\`typescript
      ${code}
      \`\`\`
      
      Check for:
      - Input validation vulnerabilities
      - SQL injection possibilities
      - XSS vulnerabilities
      - Authentication/authorization issues
      - Sensitive data exposure
      - Insecure dependencies
      - Cryptographic issues
      - Access control problems
      
      Rate each finding by CVSS score and provide mitigation strategies.
    `;

    const response = await this.agent.processMessage(securityRequest, this.context);
    
    // Validate with security validator
    const securityValidator = await this.agent.getSecurityValidator();
    const validationResult = await securityValidator.validateInput(code, this.context);
    
    // Use security scanner tool
    const toolOrchestrator = await this.agent.getToolOrchestrator();
    const securityScan = await toolOrchestrator.executeTool('security-scanner', {
      target: 'code-snippet',
      code,
      scanType: 'detailed'
    }, this.context);

    console.log('   ✅ Security assessment completed');
    return { response, validationResult, securityScan };
  }

  private async performPerformanceAnalysis(code: string): Promise<any> {
    console.log('3. ⚡ Performing Performance Analysis...');

    const performanceRequest = `
      Analyze performance characteristics of this code:
      
      \`\`\`typescript
      ${code}
      \`\`\`
      
      Evaluate:
      - Algorithm complexity (Big O notation)
      - Memory usage patterns
      - Potential memory leaks
      - Database query efficiency
      - Caching opportunities
      - Async/await usage
      - Bottleneck identification
      - Scalability considerations
      
      Provide optimization recommendations with expected impact.
    `;

    const response = await this.agent.processMessage(performanceRequest, this.context);
    
    // Use performance profiler tool
    const toolOrchestrator = await this.agent.getToolOrchestrator();
    const performanceProfile = await toolOrchestrator.executeTool('performance-profiler', {
      application: 'code-snippet',
      code,
      analysisDepth: 'detailed'
    }, this.context);

    console.log('   ✅ Performance analysis completed');
    return { response, performanceProfile };
  }

  private async checkBestPractices(code: string): Promise<any> {
    console.log('4. 📋 Checking Best Practices...');

    const bestPracticesRequest = `
      Evaluate adherence to best practices in this code:
      
      \`\`\`typescript
      ${code}
      \`\`\`
      
      Check for:
      - TypeScript best practices
      - Clean code principles
      - Error handling patterns
      - Logging and monitoring
      - Testing considerations
      - Documentation quality
      - Code organization
      - Dependency management
      - Configuration management
      - Internationalization readiness
      
      Provide actionable recommendations for improvement.
    `;

    const response = await this.agent.processMessage(bestPracticesRequest, this.context);
    console.log('   ✅ Best practices check completed');
    return response;
  }

  private async generateImprovements(code: string, analysisResults: any): Promise<any> {
    console.log('5. 🔧 Generating Improvements...');

    const improvementRequest = `
      Based on the analysis results, generate specific code improvements:
      
      Original Code:
      \`\`\`typescript
      ${code}
      \`\`\`
      
      Analysis Results Summary:
      - Security issues found: ${analysisResults.security.securityScan.success ? 'Yes' : 'No'}
      - Performance concerns: ${analysisResults.performance.performanceProfile.success ? 'Yes' : 'No'}
      - Code quality issues: ${analysisResults.analysis.detailedAnalysis.success ? 'Yes' : 'No'}
      
      Generate:
      1. Refactored code with improvements
      2. Step-by-step improvement plan
      3. Risk assessment for each change
      4. Testing recommendations
      5. Migration strategy (if needed)
      
      Prioritize improvements by impact and implementation difficulty.
    `;

    const response = await this.agent.processMessage(improvementRequest, this.context);
    console.log('   ✅ Improvements generated');
    return response;
  }

  private createComprehensiveReport(results: any): CodeReviewResult {
    console.log('6. 📄 Creating Comprehensive Report...');

    // Mock data structure - in real implementation, parse actual results
    const report: CodeReviewResult = {
      issues: [
        {
          type: 'security',
          severity: 'high',
          description: 'Potential SQL injection vulnerability',
          location: 'line 45, getUserById function',
          suggestedFix: 'Use parameterized queries instead of string concatenation'
        },
        {
          type: 'performance',
          severity: 'medium',
          description: 'Inefficient database query in loop',
          location: 'line 78, processUsers function',
          suggestedFix: 'Batch database queries or use joins'
        }
      ],
      improvements: [
        {
          category: 'Code Quality',
          description: 'Extract complex business logic into separate service classes',
          impact: 'Improved maintainability and testability',
          implementation: 'Create UserService and ValidationService classes'
        }
      ],
      metrics: {
        complexity: 8.5,
        maintainabilityIndex: 72,
        technicalDebt: 2.3,
        testCoverage: 65,
        performance: 78
      },
      securityFindings: [
        {
          vulnerability: 'SQL Injection',
          riskLevel: 'High',
          description: 'User input directly concatenated in SQL query',
          mitigation: 'Implement parameterized queries with input validation'
        }
      ],
      recommendations: [
        'Implement comprehensive input validation',
        'Add database query optimization',
        'Increase test coverage to 80%+',
        'Refactor complex functions into smaller units',
        'Add proper error handling and logging'
      ]
    };

    console.log('   ✅ Comprehensive report created');
    return report;
  }

  async generateImprovementPlan(report: CodeReviewResult): Promise<string[]> {
    console.log('\n📋 Generating Improvement Plan...');

    const planRequest = `
      Create a prioritized improvement plan based on this code review:
      
      Issues Found: ${report.issues.length}
      Security Findings: ${report.securityFindings.length}
      Current Metrics:
      - Complexity: ${report.metrics.complexity}
      - Maintainability: ${report.metrics.maintainabilityIndex}
      - Test Coverage: ${report.metrics.testCoverage}%
      
      Create a plan with:
      1. Priority ranking (Critical, High, Medium, Low)
      2. Estimated effort for each improvement
      3. Dependencies between improvements
      4. Risk assessment
      5. Success metrics
      6. Timeline recommendations
    `;

    const response = await this.agent.processMessage(planRequest, this.context);
    
    const plan = [
      '🚨 CRITICAL (Week 1)',
      '- Fix SQL injection vulnerability (2 days)',
      '- Implement input validation (1 day)',
      '',
      '🔴 HIGH (Week 2)',
      '- Optimize database queries (3 days)',
      '- Add comprehensive error handling (2 days)',
      '',
      '🟡 MEDIUM (Week 3-4)',
      '- Refactor complex functions (1 week)',
      '- Increase test coverage to 80% (1 week)',
      '',
      '🟢 LOW (Ongoing)',
      '- Improve documentation',
      '- Add performance monitoring'
    ];

    console.log('✅ Improvement plan generated');
    return plan;
  }
}

// Example usage and test data
const sampleCodeForReview = `
class UserService {
  constructor(private db: Database) {}

  async getUserById(id: string) {
    // Security issue: SQL injection vulnerability
    const query = "SELECT * FROM users WHERE id = " + id;
    return await this.db.query(query);
  }

  async processUsers(userIds: string[]) {
    const results = [];
    // Performance issue: N+1 query problem
    for (const id of userIds) {
      const user = await this.getUserById(id);
      results.push(user);
    }
    return results;
  }

  // Maintainability issue: function too long and complex
  async validateAndCreateUser(userData: any) {
    if (!userData.email || !userData.name || !userData.password) {
      throw new Error("Missing required fields");
    }
    
    if (userData.email.indexOf('@') === -1) {
      throw new Error("Invalid email");
    }
    
    if (userData.password.length < 8) {
      throw new Error("Password too short");
    }
    
    const hashedPassword = userData.password; // Security issue: no hashing
    
    const user = {
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    const query = "INSERT INTO users (email, name, password, created_at) VALUES ('" 
      + user.email + "', '" + user.name + "', '" + user.password + "', '" + user.createdAt + "')";
    
    return await this.db.query(query);
  }
}
`;

async function autonomousCodeReviewExample() {
  console.log('🤖 Starting Autonomous Code Review Workflow Example...\n');

  try {
    // Initialize the system
    const config = ConfigManager.getInstance();
    await config.initialize();
    
    const agent = new AutonomousAgent(config);
    await agent.initialize();

    // Create workflow instance
    const workflow = new AutonomousCodeReviewWorkflow(agent);
    
    // Execute the workflow
    const reviewResult = await workflow.executeWorkflow(
      sampleCodeForReview, 
      'src/services/UserService.ts'
    );

    // Display results
    console.log('📊 REVIEW RESULTS SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Issues Found: ${reviewResult.issues.length}`);
    console.log(`Security Findings: ${reviewResult.securityFindings.length}`);
    console.log(`Improvements Suggested: ${reviewResult.improvements.length}`);
    console.log('');

    console.log('🚨 CRITICAL ISSUES:');
    reviewResult.issues
      .filter(issue => issue.severity === 'high' || issue.severity === 'critical')
      .forEach(issue => {
        console.log(`- ${issue.description} (${issue.location})`);
        console.log(`  Fix: ${issue.suggestedFix}`);
      });

    console.log('\n📈 METRICS:');
    console.log(`Complexity: ${reviewResult.metrics.complexity}/10`);
    console.log(`Maintainability: ${reviewResult.metrics.maintainabilityIndex}/100`);
    console.log(`Test Coverage: ${reviewResult.metrics.testCoverage}%`);

    // Generate improvement plan
    const improvementPlan = await workflow.generateImprovementPlan(reviewResult);
    console.log('\n📋 IMPROVEMENT PLAN:');
    improvementPlan.forEach(item => console.log(item));

    // Provide learning feedback
    const learningEngine = await agent.getLearningEngine();
    await learningEngine.provideFeedback(workflow['context'].sessionId, {
      rating: 4,
      comments: 'Comprehensive code review with actionable insights',
      improvements: ['Faster analysis', 'More detailed security recommendations']
    });

    console.log('\n🎯 Code review workflow completed successfully!');

  } catch (error) {
    console.error('❌ Code review workflow failed:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  autonomousCodeReviewExample().catch(console.error);
}

export { AutonomousCodeReviewWorkflow, autonomousCodeReviewExample };