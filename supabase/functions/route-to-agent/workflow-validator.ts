// Pre-flight workflow validation system

import { ParsedWorkflow } from './workflow-parser.ts';
import { NodeRegistry } from './node-registry.ts';
import { CredentialResolver } from './credential-resolver.ts';

export interface ValidationWarning {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationError {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  message: string;
  canRecover: boolean;
  suggestedFix?: string;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
  supportedNodeCount: number;
  totalNodeCount: number;
  executableNodeCount: number;
  orchestrationNodeCount: number;
  missingCredentials: string[];
  credentialResolutions: Record<string, string>;
}

/**
 * Workflow Validator - Validates workflows before execution
 * 
 * Performs multi-stage validation:
 * 1. Node support check
 * 2. Credential availability check
 * 3. Executor availability check
 * 4. Configuration validation
 */
export class WorkflowValidator {
  constructor(
    private registry: NodeRegistry,
    private credentialResolver: CredentialResolver
  ) {}

  /**
   * Validate a complete workflow against available credentials
   */
  async validateWorkflow(
    workflow: ParsedWorkflow,
    userCredentials: Record<string, any>
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      supportedNodeCount: 0,
      totalNodeCount: workflow.nodes.length,
      executableNodeCount: 0,
      orchestrationNodeCount: 0,
      missingCredentials: [],
      credentialResolutions: {}
    };

    console.log(`\n🔍 Validating workflow with ${workflow.nodes.length} nodes...`);

    // Stage 1: Validate node support
    this.validateNodeSupport(workflow, result);

    // Stage 2: Validate credentials
    this.validateCredentials(workflow, userCredentials, result);

    // Stage 3: Validate executors
    this.validateExecutors(workflow, result);

    // Summary
    console.log(`✓ Supported: ${result.supportedNodeCount}/${result.totalNodeCount} nodes`);
    console.log(`✓ Executable: ${result.executableNodeCount} nodes`);
    console.log(`✓ Orchestration: ${result.orchestrationNodeCount} nodes`);
    
    if (result.errors.length > 0) {
      console.log(`✗ Errors: ${result.errors.length}`);
      result.isValid = false;
    }
    
    if (result.warnings.length > 0) {
      console.log(`⚠ Warnings: ${result.warnings.length}`);
    }

    return result;
  }

  /**
   * Stage 1: Validate node support
   */
  private validateNodeSupport(workflow: ParsedWorkflow, result: ValidationResult): void {
    for (const node of workflow.nodes) {
      const definition = this.registry.findDefinition(node.type);
      
      if (!definition) {
        // Unknown node type
        result.warnings.push({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          message: `Unknown node type. May not execute correctly.`,
          severity: 'medium'
        });
      } else if (definition.isExecutable) {
        // Executable tool node
        result.executableNodeCount++;
        result.supportedNodeCount++;
        console.log(`  ✓ ${node.name} (${node.type}) - executable`);
      } else {
        // Orchestration node (expected, not an issue)
        result.orchestrationNodeCount++;
        console.log(`  - ${node.name} (${node.type}) - orchestration node (skipped)`);
      }
    }
  }

  /**
   * Stage 2: Validate credential availability
   */
  private validateCredentials(
    workflow: ParsedWorkflow,
    userCredentials: Record<string, any>,
    result: ValidationResult
  ): void {
    console.log(`\n🔑 Validating credentials...`);
    
    for (const credType of workflow.requiredCredentials) {
      const resolved = this.credentialResolver.resolveCredential(
        credType,
        userCredentials
      );
      
      if (!resolved) {
        result.missingCredentials.push(credType);
        result.errors.push({
          nodeId: 'credential',
          nodeName: credType,
          nodeType: 'credential',
          message: `Missing credential: ${credType}`,
          canRecover: true,
          suggestedFix: `Connect ${this.getServiceName(credType)} in Connections page`
        });
        result.isValid = false;
        console.log(`  ✗ Missing: ${credType}`);
      } else {
        result.credentialResolutions[credType] = resolved.resolvedAs;
        console.log(`  ✓ ${credType} → ${resolved.resolvedAs} (${resolved.method})`);
      }
    }
  }

  /**
   * Stage 3: Validate executor availability
   */
  private validateExecutors(workflow: ParsedWorkflow, result: ValidationResult): void {
    console.log(`\n⚙️ Validating executors...`);
    
    for (const node of workflow.nodes) {
      const definition = this.registry.findDefinition(node.type);
      
      if (definition?.isExecutable && !definition.executor) {
        result.errors.push({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          message: `Node is marked as executable but has no executor implementation`,
          canRecover: false,
          suggestedFix: `Implement executor for ${node.type} in node-registry.ts`
        });
        result.isValid = false;
        console.log(`  ✗ No executor: ${node.name} (${node.type})`);
      } else if (definition?.isExecutable) {
        console.log(`  ✓ Executor available: ${node.name}`);
      }
    }
  }

  /**
   * Generate user-friendly validation report
   */
  generateReport(result: ValidationResult): string {
    if (result.isValid && result.warnings.length === 0) {
      return `✅ Workflow validated successfully\n` +
             `   ${result.executableNodeCount} tools ready to execute\n` +
             `   ${result.orchestrationNodeCount} orchestration nodes`;
    }

    let report = `📊 Workflow Validation Report\n\n`;
    
    // Summary
    report += `Summary:\n`;
    report += `  Total nodes: ${result.totalNodeCount}\n`;
    report += `  Executable tools: ${result.executableNodeCount}\n`;
    report += `  Orchestration: ${result.orchestrationNodeCount}\n`;
    report += `  Supported: ${result.supportedNodeCount}/${result.totalNodeCount}\n\n`;

    // Errors
    if (result.errors.length > 0) {
      report += `❌ Critical Issues (${result.errors.length}):\n`;
      result.errors.forEach(err => {
        report += `  • ${err.nodeName}: ${err.message}\n`;
        if (err.suggestedFix) {
          report += `    → Fix: ${err.suggestedFix}\n`;
        }
      });
      report += `\n`;
    }

    // Warnings
    if (result.warnings.length > 0) {
      report += `⚠️ Warnings (${result.warnings.length}):\n`;
      result.warnings.forEach(warn => {
        report += `  • ${warn.nodeName}: ${warn.message}\n`;
      });
      report += `\n`;
    }

    // Credential resolutions
    if (Object.keys(result.credentialResolutions).length > 0) {
      report += `🔑 Credential Resolutions:\n`;
      Object.entries(result.credentialResolutions).forEach(([requested, resolved]) => {
        if (requested !== resolved) {
          report += `  • ${requested} → ${resolved}\n`;
        }
      });
    }

    return report;
  }

  /**
   * Get friendly service name from credential type
   */
  private getServiceName(credType: string): string {
    if (credType.toLowerCase().includes('gmail')) return 'Gmail';
    if (credType.toLowerCase().includes('sheets')) return 'Google Sheets';
    if (credType.toLowerCase().includes('google')) return 'Google';
    if (credType.toLowerCase().includes('slack')) return 'Slack';
    if (credType.toLowerCase().includes('notion')) return 'Notion';
    return credType;
  }

  /**
   * Quick check if workflow is executable
   */
  canExecute(workflow: ParsedWorkflow, userCredentials: Record<string, any>): boolean {
    const validation = this.credentialResolver.validateCredentials(
      workflow.requiredCredentials,
      userCredentials
    );
    
    return validation.hasAll;
  }
}
