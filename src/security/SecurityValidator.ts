/**
 * Security Validation System for Autonomous Agent
 */

import { ConfigManager } from '../core/ConfigManager';
import { Logger } from '../core/Logger';
import { AgentContext } from '../core/AutonomousAgent';

export interface SecurityValidationResult {
  isValid: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
}

export interface SecurityRule {
  name: string;
  description: string;
  validate(input: string, context: AgentContext): Promise<SecurityValidationResult>;
}

export class SecurityValidator {
  // @ts-expect-error - config will be used in future implementations
  private readonly config: ConfigManager;
  private readonly logger: Logger;
  private rules: SecurityRule[] = [];

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = Logger.getInstance();
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing Security Validator...');
    
    // Register security rules
    this.rules.push(
      new InputSanitizationRule(),
      new InjectionAttackRule(),
      new PrivilegeEscalationRule(),
      new DataExfiltrationRule(),
      new ComplianceRule()
    );
    
    this.logger.info(`Registered ${this.rules.length} security rules`);
  }

  public async validateInput(input: string, context: AgentContext): Promise<SecurityValidationResult> {
    this.logger.debug('Validating input', { sessionId: context.sessionId });

    let highestRiskLevel: SecurityValidationResult['riskLevel'] = 'low';
    const allRecommendations: string[] = [];
    
    for (const rule of this.rules) {
      try {
        const result = await rule.validate(input, context);
        
        if (!result.isValid) {
          this.logger.warn(`Security rule failed: ${rule.name}`, {
            reason: result.reason,
            riskLevel: result.riskLevel
          });
          
          return result; // Fail fast on any security rule failure
        }
        
        // Track highest risk level and accumulate recommendations
        if (this.getRiskLevelOrder(result.riskLevel) > this.getRiskLevelOrder(highestRiskLevel)) {
          highestRiskLevel = result.riskLevel;
        }
        
        if (result.recommendations) {
          allRecommendations.push(...result.recommendations);
        }
        
      } catch (error) {
        this.logger.error(`Error in security rule ${rule.name}:`, error);
        return {
          isValid: false,
          reason: `Security validation error in ${rule.name}`,
          riskLevel: 'critical'
        };
      }
    }

    const result: SecurityValidationResult = {
      isValid: true,
      riskLevel: highestRiskLevel
    };
    
    if (allRecommendations.length > 0) {
      result.recommendations = allRecommendations;
    }
    
    return result;
  }

  private getRiskLevelOrder(level: SecurityValidationResult['riskLevel']): number {
    const order = { low: 1, medium: 2, high: 3, critical: 4 };
    return order[level];
  }

  public getSecurityRules(): SecurityRule[] {
    return this.rules;
  }
}

// Security Rule Implementations

class InputSanitizationRule implements SecurityRule {
  name = 'input-sanitization';
  description = 'Validates input for potentially harmful content';

  async validate(input: string): Promise<SecurityValidationResult> {
    // Check for common injection patterns
    const dangerousPatterns = [
      /script\s*:/i,
      /javascript\s*:/i,
      /vbscript\s*:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /<\s*script/i,
      /eval\s*\(/i,
      /exec\s*\(/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          reason: 'Input contains potentially dangerous script content',
          riskLevel: 'high',
          recommendations: ['Sanitize input before processing', 'Use content security policies']
        };
      }
    }

    return {
      isValid: true,
      riskLevel: 'low'
    };
  }
}

class InjectionAttackRule implements SecurityRule {
  name = 'injection-attack-prevention';
  description = 'Prevents SQL injection and command injection attacks';

  async validate(input: string): Promise<SecurityValidationResult> {
    const injectionPatterns = [
      /['"][\s]*;[\s]*drop/i,
      /union[\s]+select/i,
      /;[\s]*shutdown/i,
      /;[\s]*xp_cmdshell/i,
      /rm[\s]+-rf/i,
      /&&[\s]*rm/i,
      /\|[\s]*rm/i
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          reason: 'Input contains potential injection attack patterns',
          riskLevel: 'critical',
          recommendations: ['Use parameterized queries', 'Validate all user input']
        };
      }
    }

    return {
      isValid: true,
      riskLevel: 'low'
    };
  }
}

class PrivilegeEscalationRule implements SecurityRule {
  name = 'privilege-escalation-prevention';
  description = 'Prevents privilege escalation attempts';

  async validate(input: string): Promise<SecurityValidationResult> {
    const privilegePatterns = [
      /sudo[\s]+/i,
      /su[\s]+root/i,
      /chmod[\s]+777/i,
      /setuid/i,
      /setgid/i
    ];

    for (const pattern of privilegePatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          reason: 'Input contains potential privilege escalation commands',
          riskLevel: 'high',
          recommendations: ['Review privilege requirements', 'Use least privilege principle']
        };
      }
    }

    return {
      isValid: true,
      riskLevel: 'low'
    };
  }
}

class DataExfiltrationRule implements SecurityRule {
  name = 'data-exfiltration-prevention';
  description = 'Prevents unauthorized data access and exfiltration';

  async validate(input: string): Promise<SecurityValidationResult> {
    const exfiltrationPatterns = [
      /curl[\s]+.*http/i,
      /wget[\s]+.*http/i,
      /nc[\s]+.*\d+/i,
      /netcat[\s]+.*\d+/i,
      /base64[\s]+.*\|/i
    ];

    for (const pattern of exfiltrationPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          reason: 'Input contains potential data exfiltration commands',
          riskLevel: 'high',
          recommendations: ['Monitor network traffic', 'Implement data loss prevention']
        };
      }
    }

    return {
      isValid: true,
      riskLevel: 'low'
    };
  }
}

class ComplianceRule implements SecurityRule {
  name = 'compliance-validation';
  description = 'Ensures compliance with enterprise security policies';

  async validate(input: string, _context: AgentContext): Promise<SecurityValidationResult> {
    // Check for compliance requirements
    const recommendations: string[] = [];
    
    // Example compliance checks
    if (input.toLowerCase().includes('password')) {
      recommendations.push('Ensure password handling follows security policies');
    }
    
    if (input.toLowerCase().includes('api key')) {
      recommendations.push('Use secure key management practices');
    }

    const result: SecurityValidationResult = {
      isValid: true,
      riskLevel: 'low'
    };
    
    if (recommendations.length > 0) {
      result.recommendations = recommendations;
    }
    
    return result;
  }
}