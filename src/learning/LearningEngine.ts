/**
 * Adaptive Learning Engine for Autonomous Agent
 */

import { ConfigManager } from '../core/ConfigManager';
import { Logger } from '../core/Logger';
import { AgentContext, AgentResponse } from '../core/AutonomousAgent';

export interface LearningData {
  input: string;
  output: AgentResponse;
  context: AgentContext;
  timestamp: Date;
  feedback?: LearningFeedback;
}

export interface LearningFeedback {
  rating: number; // 1-5 scale
  comments?: string;
  improvements?: string[];
}

export interface LearningPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  averageRating: number;
  lastUsed: Date;
}

export interface ModelMetrics {
  totalInteractions: number;
  averageRating: number;
  successRate: number;
  improvementAreas: string[];
  topPatterns: LearningPattern[];
}

export class LearningEngine {
  private readonly config: ConfigManager;
  private readonly logger: Logger;
  private learningData: LearningData[] = [];
  private patterns: Map<string, LearningPattern> = new Map();
  private lastModelUpdate: Date = new Date();

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = Logger.getInstance();
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing Learning Engine...');
    
    // Load existing learning data
    await this.loadLearningData();
    
    // Analyze patterns
    await this.analyzePatterns();
    
    // Schedule periodic model updates
    this.scheduleModelUpdates();
    
    this.logger.info('Learning Engine initialized');
  }

  public async learn(
    input: string,
    output: AgentResponse,
    context: AgentContext,
    feedback?: LearningFeedback
  ): Promise<void> {
    const learningData: LearningData = {
      input,
      output,
      context,
      timestamp: new Date(),
      ...(feedback && { feedback })
    };

    this.learningData.push(learningData);
    
    // Update patterns in real-time
    await this.updatePatterns(learningData);
    
    this.logger.debug('Learning data recorded', {
      sessionId: context.sessionId,
      inputLength: input.length,
      success: output.success,
      rating: feedback?.rating
    });

    // Trigger model update if needed
    if (this.shouldUpdateModel()) {
      await this.updateModel();
    }
  }

  public async provideFeedback(
    sessionId: string,
    feedback: LearningFeedback
  ): Promise<void> {
    // Find the most recent learning data for this session
    const recentData = this.learningData
      .filter(data => data.context.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (recentData) {
      recentData.feedback = feedback;
      await this.updatePatterns(recentData);
      
      this.logger.info('Feedback recorded', {
        sessionId,
        rating: feedback.rating,
        hasComments: !!feedback.comments
      });
    }
  }

  public async getRecommendations(input: string, context: AgentContext): Promise<string[]> {
    const matchingPatterns = await this.findMatchingPatterns(input);
    const recommendations: string[] = [];

    // Generate recommendations based on successful patterns
    for (const pattern of matchingPatterns) {
      if (pattern.successRate > 0.8 && pattern.averageRating > 4.0) {
        recommendations.push(`Consider using successful pattern: ${pattern.pattern}`);
      }
    }

    // Add context-specific recommendations
    if (context.metadata.urgency === 'high') {
      recommendations.push('Use fast-track protocols for urgent requests');
    }

    return recommendations;
  }

  public async getModelMetrics(): Promise<ModelMetrics> {
    const totalInteractions = this.learningData.length;
    const ratingsData = this.learningData
      .filter(data => data.feedback?.rating)
      .map(data => data.feedback!.rating);
    
    const averageRating = ratingsData.length > 0
      ? ratingsData.reduce((sum, rating) => sum + rating, 0) / ratingsData.length
      : 0;

    const successfulInteractions = this.learningData.filter(data => data.output.success).length;
    const successRate = totalInteractions > 0 ? successfulInteractions / totalInteractions : 0;

    const improvementAreas = this.identifyImprovementAreas();
    const topPatterns = Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return {
      totalInteractions,
      averageRating,
      successRate,
      improvementAreas,
      topPatterns
    };
  }

  private async loadLearningData(): Promise<void> {
    // In a real implementation, load from persistent storage
    this.logger.debug('Loading learning data from storage...');
    
    // Simulate loading data
    this.learningData = [];
  }

  private async analyzePatterns(): Promise<void> {
    this.logger.debug('Analyzing learning patterns...');
    
    // Group similar inputs and analyze their outcomes
    for (const data of this.learningData) {
      const patternKey = this.extractPattern(data.input);
      const existing = this.patterns.get(patternKey);
      
      if (existing) {
        existing.frequency++;
        existing.lastUsed = data.timestamp;
        if (data.output.success) {
          existing.successRate = (existing.successRate * (existing.frequency - 1) + 1) / existing.frequency;
        }
        if (data.feedback?.rating) {
          existing.averageRating = (existing.averageRating * (existing.frequency - 1) + data.feedback.rating) / existing.frequency;
        }
      } else {
        this.patterns.set(patternKey, {
          pattern: patternKey,
          frequency: 1,
          successRate: data.output.success ? 1 : 0,
          averageRating: data.feedback?.rating || 0,
          lastUsed: data.timestamp
        });
      }
    }
  }

  private extractPattern(input: string): string {
    // Simple pattern extraction - in real implementation, use NLP
    const words = input.toLowerCase().split(' ');
    const keywords = words.filter(word => 
      ['create', 'generate', 'build', 'test', 'analyze', 'secure', 'optimize'].includes(word)
    );
    return keywords.join('-') || 'general';
  }

  private async updatePatterns(data: LearningData): Promise<void> {
    const patternKey = this.extractPattern(data.input);
    const existing = this.patterns.get(patternKey);
    
    if (existing) {
      existing.frequency++;
      existing.lastUsed = data.timestamp;
      
      // Update success rate
      const newSuccessCount = existing.successRate * (existing.frequency - 1) + (data.output.success ? 1 : 0);
      existing.successRate = newSuccessCount / existing.frequency;
      
      // Update average rating if feedback provided
      if (data.feedback?.rating) {
        const newRatingSum = existing.averageRating * (existing.frequency - 1) + data.feedback.rating;
        existing.averageRating = newRatingSum / existing.frequency;
      }
    } else {
      this.patterns.set(patternKey, {
        pattern: patternKey,
        frequency: 1,
        successRate: data.output.success ? 1 : 0,
        averageRating: data.feedback?.rating || 0,
        lastUsed: data.timestamp
      });
    }
  }

  private async findMatchingPatterns(input: string): Promise<LearningPattern[]> {
    const inputPattern = this.extractPattern(input);
    const matchingPatterns: LearningPattern[] = [];
    
    for (const pattern of this.patterns.values()) {
      if (pattern.pattern === inputPattern || this.calculateSimilarity(pattern.pattern, inputPattern) > 0.7) {
        matchingPatterns.push(pattern);
      }
    }
    
    return matchingPatterns.sort((a, b) => b.frequency - a.frequency);
  }

  private calculateSimilarity(pattern1: string, pattern2: string): number {
    // Simple similarity calculation - in real implementation, use more sophisticated algorithms
    const words1 = pattern1.split('-');
    const words2 = pattern2.split('-');
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private shouldUpdateModel(): boolean {
    const timeSinceLastUpdate = Date.now() - this.lastModelUpdate.getTime();
    const updateInterval = this.config.learning.modelUpdateInterval;
    
    return timeSinceLastUpdate > updateInterval || this.learningData.length % 100 === 0;
  }

  private async updateModel(): Promise<void> {
    this.logger.info('Updating learning model...');
    
    // Re-analyze all patterns
    await this.analyzePatterns();
    
    // Update timestamp
    this.lastModelUpdate = new Date();
    
    // In real implementation, retrain ML models here
    
    this.logger.info('Learning model updated');
  }

  private identifyImprovementAreas(): string[] {
    const areas: string[] = [];
    
    // Analyze low-rated interactions
    const lowRatedData = this.learningData.filter(data => 
      data.feedback?.rating && data.feedback.rating < 3
    );
    
    if (lowRatedData.length > this.learningData.length * 0.1) {
      areas.push('Overall user satisfaction');
    }
    
    // Analyze failed executions
    const failedData = this.learningData.filter(data => !data.output.success);
    if (failedData.length > this.learningData.length * 0.1) {
      areas.push('Execution reliability');
    }
    
    // Analyze patterns with low success rates
    const lowSuccessPatterns = Array.from(this.patterns.values())
      .filter(pattern => pattern.successRate < 0.7 && pattern.frequency > 5);
    
    if (lowSuccessPatterns.length > 0) {
      areas.push('Pattern recognition accuracy');
    }
    
    return areas;
  }

  private scheduleModelUpdates(): void {
    const interval = this.config.learning.modelUpdateInterval;
    
    setInterval(() => {
      void this.updateModel();
    }, interval);
  }
}