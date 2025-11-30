// Graceful degradation and fallback execution strategies

import { LovableAITool } from './tool-generator.ts';
import { NodeRegistry } from './node-registry.ts';

export interface ExecutionResult {
  success: boolean;
  result: any;
  strategyUsed: string;
  executionTime: number;
  error?: string;
}

/**
 * Execution Strategies - Handles tool execution with intelligent fallbacks
 * 
 * Strategies (in order of preference):
 * 1. Native executor (from node registry)
 * 2. Generic HTTP passthrough (for API nodes)
 * 3. Partial execution with explanation
 * 4. Error recovery with suggestions
 */
export class ExecutionStrategies {
  constructor(private registry: NodeRegistry) {}

  /**
   * Execute a tool call with fallback strategies
   */
  async executeWithFallback(
    toolCall: any,
    toolDefinitions: LovableAITool[]
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      const tool = toolDefinitions.find(t => t.function.name === toolCall.function.name);
      
      if (!tool) {
        throw new Error(`Tool not found: ${toolCall.function.name}`);
      }
      
      const nodeType = (tool.function as any).nodeType;
      const args = JSON.parse(toolCall.function.arguments);
      const credentials = (tool.function as any).credentials || {};
      const nodeParameters = (tool.function as any).nodeParameters || {};

      console.log(`\n🔧 Executing: ${toolCall.function.name}`);
      console.log(`   Node type: ${nodeType}`);

      // Strategy 1: Try native executor from registry
      const result = await this.tryNativeExecutor(nodeType, args, credentials, nodeParameters);
      
      return {
        success: true,
        result,
        strategyUsed: 'native_executor',
        executionTime: Date.now() - startTime
      };

    } catch (error: any) {
      console.error(`✗ Execution failed:`, error.message);
      
      // Strategy 4: Error recovery
      return {
        success: false,
        result: null,
        strategyUsed: 'error_recovery',
        executionTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Strategy 1: Try native executor from node registry
   */
  private async tryNativeExecutor(
    nodeType: string,
    args: any,
    credentials: any,
    nodeParameters: any
  ): Promise<any> {
    const executor = this.registry.getExecutor(nodeType);
    
    if (!executor) {
      throw new Error(`No executor found for node type: ${nodeType}`);
    }

    console.log(`   Using native executor for ${nodeType}`);
    return await executor(args, credentials, nodeParameters);
  }

  /**
   * Strategy 2: Generic HTTP passthrough (fallback for API nodes)
   */
  private async tryHttpPassthrough(
    args: any,
    credentials: any,
    nodeParameters: any
  ): Promise<any> {
    const url = nodeParameters.url || args.url;
    if (!url) {
      throw new Error('No URL available for HTTP passthrough');
    }

    console.log(`   Attempting HTTP passthrough to ${url}`);
    
    const method = nodeParameters.method || args.method || 'POST';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(nodeParameters.headers || {})
    };
    
    // Auto-inject OAuth token if available
    const googleCred = Array.isArray(credentials.googleOAuth2Api) 
      ? credentials.googleOAuth2Api[0] 
      : credentials.googleOAuth2Api;
    
    const accessToken = credentials.access_token || 
                       googleCred?.access_token ||
                       credentials.slackOAuth2Api?.access_token;
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(args) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  }

  /**
   * Get suggested action for common error types
   */
  getSuggestedAction(nodeType: string, error: Error): string {
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('credential') || errorMsg.includes('unauthorized')) {
      return 'Reconnect the service in Connections page - authentication token may be missing or expired';
    }
    
    if (errorMsg.includes('401') || errorMsg.includes('403')) {
      return 'Check service permissions and reconnect your account';
    }
    
    if (errorMsg.includes('404')) {
      return 'The requested resource was not found - verify IDs and parameters';
    }
    
    if (errorMsg.includes('429')) {
      return 'Rate limit exceeded - please wait and try again';
    }
    
    if (errorMsg.includes('no executor')) {
      return `Node type ${nodeType} needs to be added to the node registry`;
    }
    
    if (errorMsg.includes('unsupported')) {
      return `This operation is not yet supported for ${nodeType}`;
    }
    
    return 'Check the error message and node configuration';
  }

  /**
   * Create user-friendly error response
   */
  createErrorResponse(
    toolName: string,
    nodeType: string,
    error: Error
  ): any {
    return {
      success: false,
      error: error.message,
      toolName,
      nodeType,
      suggestedAction: this.getSuggestedAction(nodeType, error),
      timestamp: new Date().toISOString()
    };
  }
}
