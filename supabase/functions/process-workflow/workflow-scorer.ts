import { ParsedWorkflow } from './workflow-parser.ts';
import { NodeRegistry } from './node-registry.ts';

export interface ValidationScore {
  overall: number;           // 0-100
  security: number;          // 0-100
  compatibility: number;     // 0-100
  quality: number;           // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  canPublish: boolean;
  blockers: string[];
  warnings: string[];
  suggestions: string[];
  details: {
    totalNodes: number;
    supportedNodes: number;
    executableNodes: number;
    orchestrationNodes: number;
    unknownNodes: number;
    dataProcessingNodes: number;
    requiredCredentials: string[];
    nodeBreakdown: {
      supported: Array<{ name: string; type: string; category: string }>;
      unsupported: Array<{ name: string; type: string }>;
      orchestration: Array<{ name: string; type: string }>;
      dataProcessing: Array<{ name: string; type: string }>;
    };
  };
}

export class WorkflowScorer {
  private registry: NodeRegistry;

  constructor(registry: NodeRegistry) {
    this.registry = registry;
  }

  /**
   * Comprehensive workflow scoring and validation
   */
  scoreWorkflow(workflow: ParsedWorkflow): ValidationScore {
    const score: ValidationScore = {
      overall: 0,
      security: 0,
      compatibility: 0,
      quality: 0,
      grade: 'F',
      canPublish: false,
      blockers: [],
      warnings: [],
      suggestions: [],
      details: {
        totalNodes: workflow.nodes.length,
        supportedNodes: 0,
        executableNodes: 0,
        orchestrationNodes: 0,
        unknownNodes: 0,
        dataProcessingNodes: 0,
        requiredCredentials: [],
        nodeBreakdown: {
          supported: [],
          unsupported: [],
          orchestration: [],
          dataProcessing: []
        }
      }
    };

    // Tier 1: Critical Security Validation
    this.validateSecurity(workflow, score);

    // Tier 2: Compatibility Scoring
    this.scoreCompatibility(workflow, score);

    // Tier 3: Quality Scoring
    this.scoreQuality(workflow, score);

    // Calculate overall score and grade
    this.calculateOverallScore(score);

    return score;
  }

  /**
   * Tier 1: Security validation - MUST PASS
   */
  private validateSecurity(workflow: ParsedWorkflow, score: ValidationScore): void {
    let securityScore = 100;
    const blockers: string[] = [];

    // Check for hardcoded API keys
    const workflowStr = JSON.stringify(workflow);
    const apiKeyPatterns = [
      /sk-[a-zA-Z0-9]{32,}/,  // OpenAI style
      /AIza[0-9A-Za-z-_]{35}/, // Google API
      /[0-9a-f]{32,}/,         // Generic hex keys
    ];

    for (const pattern of apiKeyPatterns) {
      if (pattern.test(workflowStr)) {
        blockers.push('SECURITY VIOLATION: Hardcoded API keys detected in workflow');
        securityScore = 0;
        break;
      }
    }

    // Check for code execution nodes (security risk)
    for (const node of workflow.nodes) {
      if (node.type.includes('code') || node.type.includes('function')) {
        blockers.push(`SECURITY VIOLATION: Code execution node detected: ${node.name} (${node.type})`);
        securityScore = 0;
      }

      // Check for raw SQL/database operations
      if (node.type.includes('sql') || node.type.includes('postgres') || node.type.includes('mysql')) {
        blockers.push(`SECURITY VIOLATION: Direct database access node detected: ${node.name} (${node.type})`);
        securityScore = 0;
      }
    }

    // Validate workflow structure
    if (!workflow.nodes || workflow.nodes.length === 0) {
      blockers.push('CRITICAL: Workflow contains no nodes');
      securityScore = 0;
    }

    score.security = securityScore;
    score.blockers.push(...blockers);
  }

  /**
   * Tier 2: Compatibility scoring
   */
  private scoreCompatibility(workflow: ParsedWorkflow, score: ValidationScore): void {
    let compatibilityScore = 0;
    const warnings: string[] = [];
    const credentialsSet = new Set<string>();

    for (const node of workflow.nodes) {
      const definition = this.registry.findDefinition(node.type);

      if (definition) {
        score.details.supportedNodes++;

        if (definition.isExecutable) {
          score.details.executableNodes++;
          score.details.nodeBreakdown.supported.push({
            name: node.name,
            type: node.type,
            category: definition.category
          });
        } else {
          // Orchestration or data processing
          if (definition.category === 'utility' && 
              ['filter', 'set', 'merge', 'aggregate', 'limit'].some(t => node.type.includes(t))) {
            score.details.dataProcessingNodes++;
            score.details.nodeBreakdown.dataProcessing.push({
              name: node.name,
              type: node.type
            });
          } else {
            score.details.orchestrationNodes++;
            score.details.nodeBreakdown.orchestration.push({
              name: node.name,
              type: node.type
            });
          }
        }

        // Collect required credentials
        if (definition.credentialPatterns.length > 0) {
          definition.credentialPatterns.forEach(pattern => {
            if (!pattern.includes('*') && pattern !== '') {
              credentialsSet.add(pattern);
            }
          });
        }
      } else {
        score.details.unknownNodes++;
        score.details.nodeBreakdown.unsupported.push({
          name: node.name,
          type: node.type
        });
        warnings.push(`Unsupported node: ${node.name} (${node.type}) - may not execute`);
      }
    }

    score.details.requiredCredentials = Array.from(credentialsSet);

    // Calculate compatibility percentage
    const totalNodes = workflow.nodes.length;
    const supportedPercentage = (score.details.supportedNodes / totalNodes) * 100;
    const executablePercentage = (score.details.executableNodes / totalNodes) * 100;

    // Weighted score: 70% supported, 30% executable
    compatibilityScore = (supportedPercentage * 0.7) + (executablePercentage * 0.3);

    score.compatibility = Math.round(compatibilityScore);
    score.warnings.push(...warnings);

    // Add warnings for specific scenarios
    if (score.details.unknownNodes > 0) {
      score.warnings.push(`${score.details.unknownNodes} node(s) not yet supported on platform`);
    }

    if (score.details.dataProcessingNodes > 0) {
      score.warnings.push(`${score.details.dataProcessingNodes} data processing node(s) will be handled by AI`);
    }

    if (score.details.executableNodes === 0) {
      score.blockers.push('CRITICAL: No executable nodes found - workflow cannot perform actions');
    }
  }

  /**
   * Tier 3: Quality scoring
   */
  private scoreQuality(workflow: ParsedWorkflow, score: ValidationScore): void {
    let qualityScore = 100;
    const suggestions: string[] = [];

    let nodesWithDescription = 0;
    let nodesWithClearNames = 0;

    for (const node of workflow.nodes) {
      // Check for node descriptions
      if (node.parameters?.description) {
        nodesWithDescription++;
      }

      // Check for clear, non-default names
      if (node.name && !node.name.match(/^(Node|Untitled|New)/i)) {
        nodesWithClearNames++;
      }
    }

    const descriptionPercentage = (nodesWithDescription / workflow.nodes.length) * 100;
    const namingPercentage = (nodesWithClearNames / workflow.nodes.length) * 100;

    // Quality based on metadata completeness
    qualityScore = (descriptionPercentage * 0.3) + (namingPercentage * 0.4) + 30; // Base 30

    score.quality = Math.round(qualityScore);

    // Generate suggestions
    if (descriptionPercentage < 50) {
      suggestions.push(`Add descriptions to ${workflow.nodes.length - nodesWithDescription} nodes for better AI understanding`);
    }

    if (namingPercentage < 70) {
      suggestions.push(`Rename ${workflow.nodes.length - nodesWithClearNames} nodes to be more descriptive`);
    }

    // Check for credential types - suggest OAuth where available
    const hasApiKeyNodes = workflow.nodes.some(n => 
      n.credentials && Object.keys(n.credentials).some(k => k.toLowerCase().includes('api'))
    );

    if (hasApiKeyNodes) {
      suggestions.push('Consider using OAuth authentication instead of API keys for better security');
    }

    // Check for efficiency
    const filterNodes = workflow.nodes.filter(n => n.type.includes('filter'));
    if (filterNodes.length > 2) {
      suggestions.push(`Consider combining ${filterNodes.length} filter nodes for better efficiency`);
    }

    score.suggestions.push(...suggestions);
  }

  /**
   * Calculate overall score and determine grade
   */
  private calculateOverallScore(score: ValidationScore): void {
    // Security failures block publication
    if (score.security === 0) {
      score.overall = 0;
      score.grade = 'F';
      score.canPublish = false;
      return;
    }

    // No executable nodes blocks publication
    if (score.details.executableNodes === 0) {
      score.overall = 0;
      score.grade = 'F';
      score.canPublish = false;
      return;
    }

    // Weighted overall score: Security 40%, Compatibility 40%, Quality 20%
    score.overall = Math.round(
      (score.security * 0.4) + 
      (score.compatibility * 0.4) + 
      (score.quality * 0.2)
    );

    // Determine grade
    if (score.overall >= 90) {
      score.grade = 'A';
      score.canPublish = true;
    } else if (score.overall >= 70) {
      score.grade = 'B';
      score.canPublish = true;
    } else if (score.overall >= 50) {
      score.grade = 'C';
      score.canPublish = true;
      score.warnings.unshift('⚠️ Grade C: This agent will work but has significant limitations');
    } else if (score.overall >= 30) {
      score.grade = 'D';
      score.canPublish = true;
      score.warnings.unshift('⚠️ Grade D: This agent has major compatibility issues and may not work as expected');
    } else {
      score.grade = 'F';
      score.canPublish = false;
    }
  }

  /**
   * Generate a human-readable report
   */
  generateReport(score: ValidationScore): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(60));
    lines.push(`AGENT VALIDATION REPORT - Grade ${score.grade} (${score.overall}%)`);
    lines.push('='.repeat(60));
    lines.push('');

    // Overall status
    if (score.canPublish) {
      lines.push('✅ PUBLISHABLE - This agent can be published');
    } else {
      lines.push('❌ BLOCKED - This agent cannot be published');
    }
    lines.push('');

    // Blockers (critical)
    if (score.blockers.length > 0) {
      lines.push('🚫 CRITICAL ISSUES (Must Fix):');
      score.blockers.forEach(b => lines.push(`   - ${b}`));
      lines.push('');
    }

    // Scores
    lines.push('📊 Scores:');
    lines.push(`   Security:       ${score.security}%`);
    lines.push(`   Compatibility:  ${score.compatibility}%`);
    lines.push(`   Quality:        ${score.quality}%`);
    lines.push(`   Overall:        ${score.overall}%`);
    lines.push('');

    // Node breakdown
    lines.push('📦 Node Analysis:');
    lines.push(`   Total nodes:          ${score.details.totalNodes}`);
    lines.push(`   Supported:            ${score.details.supportedNodes}`);
    lines.push(`   Executable:           ${score.details.executableNodes}`);
    lines.push(`   Orchestration:        ${score.details.orchestrationNodes}`);
    lines.push(`   Data Processing:      ${score.details.dataProcessingNodes}`);
    lines.push(`   Unsupported:          ${score.details.unknownNodes}`);
    lines.push('');

    // What works
    if (score.details.nodeBreakdown.supported.length > 0) {
      lines.push('✅ What Will Work:');
      score.details.nodeBreakdown.supported.forEach(n => {
        lines.push(`   - ${n.name} (${n.type})`);
      });
      lines.push('');
    }

    // What won't work
    if (score.details.nodeBreakdown.unsupported.length > 0) {
      lines.push('⚠️  What May Not Work:');
      score.details.nodeBreakdown.unsupported.forEach(n => {
        lines.push(`   - ${n.name} (${n.type})`);
      });
      lines.push('');
    }

    // Warnings
    if (score.warnings.length > 0) {
      lines.push('⚠️  Warnings:');
      score.warnings.forEach(w => lines.push(`   - ${w}`));
      lines.push('');
    }

    // Suggestions
    if (score.suggestions.length > 0) {
      lines.push('💡 Suggestions to Improve:');
      score.suggestions.forEach(s => lines.push(`   - ${s}`));
      lines.push('');
    }

    lines.push('='.repeat(60));

    return lines.join('\n');
  }
}
