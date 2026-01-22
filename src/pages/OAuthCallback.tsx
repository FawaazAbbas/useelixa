import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Generate a short unique correlation ID for tracking OAuth attempts
function generateCorrelationId(): string {
  return `oauth-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Track which authorization codes have already been processed to prevent duplicate exchanges
const processedCodes = new Set<string>();

interface DebugInfo {
  correlationId: string;
  timestamp: string;
  request: {
    credentialType: string;
    bundleType?: string;
    scopes: string;
  };
  response: {
    status?: number;
    data?: unknown;
    error?: string;
  };
}

function extractOAuthProviderError(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  const providerBody = p.provider_body as any;
  const providerStatus = p.provider_status;
  const stage = p.stage;

  const providerError =
    providerBody && typeof providerBody === 'object'
      ? [providerBody.error, providerBody.error_description].filter(Boolean).join(': ')
      : null;

  if (providerError) {
    return `${providerError}${providerStatus ? ` (status ${providerStatus})` : ''}${stage ? ` [${stage}]` : ''}`;
  }

  if (typeof p.error === 'string' && p.error.trim().length > 0) {
    return `${p.error}${stage ? ` [${stage}]` : ''}`;
  }

  return null;
}

// Helper to get scopes for credential storage
function getScopesForProvider(provider: string, bundleType?: string): string {
  if (provider === 'slack') return 'channels:read,chat:write,users:read';
  if (provider === 'microsoft') return 'openid profile email offline_access https://graph.microsoft.com/.default';
  if (provider === 'google') {
    const baseScopes = 'openid email profile';
    switch (bundleType) {
      case 'gmail_only':
        return `${baseScopes} https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send`;
      case 'calendar_only':
        return `${baseScopes} https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events`;
      case 'gmail_calendar':
      default:
        return `${baseScopes} https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events`;
    }
  }
  return '';
}

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing authentication...');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Guard against duplicate exchanges (React strict mode, user hydration, param changes)
    if (user && !hasStartedRef.current) {
      hasStartedRef.current = true;
      handleCallback();
    }
  }, [searchParams, user]);

  const handleCallback = async () => {
    // Generate a unique correlation ID for this OAuth attempt
    const correlationId = generateCorrelationId();
    
    console.log(`[OAuth:${correlationId}] Starting callback handler`);

    if (!user) {
      console.error(`[OAuth:${correlationId}] No user found - aborting`);
      setStatus('error');
      setMessage('You must be logged in to connect integrations');
      return;
    }

    try {
      const code = searchParams.get('code');
      const stateParam = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log(`[OAuth:${correlationId}] Params received`, { 
        hasCode: !!code, 
        codePrefix: code?.slice(0, 10),
        hasState: !!stateParam, 
        error 
      });

      if (error) {
        throw new Error(`OAuth error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`);
      }

      if (!code) {
        throw new Error('Missing authorization code');
      }

      // Dedupe: Check if this code has already been processed
      if (processedCodes.has(code)) {
        console.warn(`[OAuth:${correlationId}] Code already processed - ignoring duplicate`);
        return;
      }
      
      // Mark code as processed immediately to prevent race conditions
      processedCodes.add(code);
      console.log(`[OAuth:${correlationId}] Code marked as processing (first attempt)`);

      // Decode state
      let state: { provider?: string; bundleType?: string; returnTo?: string } = {};
      if (stateParam) {
        try {
          state = JSON.parse(atob(decodeURIComponent(stateParam)));
        } catch (e) {
          console.warn(`[OAuth:${correlationId}] Failed to parse state:`, e);
        }
      }

      const { provider, bundleType, returnTo } = state;

      if (!provider) {
        throw new Error('Missing provider in state');
      }

      console.log(`[OAuth:${correlationId}] Provider: ${provider}, BundleType: ${bundleType || 'none'}`);

      // Map provider to credential type
      const credentialTypeMap: Record<string, string> = {
        google: 'googleOAuth2Api',
        notion: 'notionApi',
        slack: 'slackOAuth2Api',
        microsoft: 'microsoftOAuth2Api',
        calendly: 'calendlyApi',
        mailchimp: 'mailchimpOAuth2Api',
        shopify: 'shopifyOAuth2Api',
      };

      const credentialType = credentialTypeMap[provider];
      if (!credentialType) {
        throw new Error(`Unknown provider: ${provider}`);
      }

      setMessage('Exchanging authorization code for access token...');

      // Get scopes from OAuth config for proper credential storage
      const scopesForProvider = getScopesForProvider(provider, bundleType);
      
      console.log(`[OAuth:${correlationId}] Invoking exchange-oauth-token`, { 
        credentialType, 
        bundleType, 
        scopeCount: scopesForProvider.split(' ').length 
      });

      // Initialize debug info
      const debugRequest = {
        credentialType,
        bundleType,
        scopes: scopesForProvider,
      };

      // Exchange code for token via edge function
      const { data, error: exchangeError } = await supabase.functions.invoke('exchange-oauth-token', {
        body: { 
          code, 
          credentialType, 
          userId: user.id,
          bundleType: bundleType || undefined,
          scopes: scopesForProvider,
          correlationId, // Pass correlation ID to backend for end-to-end tracing
        }
      });

      console.log(`[OAuth:${correlationId}] Exchange response received`, { 
        success: data?.success, 
        hasError: !!exchangeError 
      });

      // Capture debug info
      setDebugInfo({
        correlationId,
        timestamp: new Date().toISOString(),
        request: debugRequest,
        response: {
          data,
          error: exchangeError?.message,
        },
      });

      if (exchangeError) {
        throw exchangeError;
      }

      // Our backend function returns 200 even on failure for better debugging.
      // Treat `{ success: false }` as an error and surface provider payload.
      const typedData = data as any;
      if (typedData?.success === false) {
        console.error(`[OAuth:${correlationId}] Exchange failed:`, typedData);
        throw new Error(extractOAuthProviderError(typedData) || 'OAuth token exchange failed');
      }

      if (typedData?.error) {
        throw new Error(typedData.error);
      }

      console.log(`[OAuth:${correlationId}] ✅ Exchange successful`);
      setStatus('success');
      setMessage('Connection successful! Redirecting...');

      // Redirect back to connections page after 2 seconds
      setTimeout(() => {
        navigate(returnTo || '/connections');
      }, 2000);

    } catch (error) {
      console.error(`[OAuth:${correlationId}] Callback error:`, error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Authentication failed');
      // Auto-open debug panel on error
      setDebugOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8 text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold mb-2">Processing...</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-semibold mb-2 text-green-600">Success!</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-semibold mb-2 text-destructive">Connection Failed</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <Button onClick={() => navigate('/connections')}>
              Return to Connections
            </Button>
          </>
        )}

        {/* Debug Panel */}
        {debugInfo && (
          <Collapsible open={debugOpen} onOpenChange={setDebugOpen} className="mt-6">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full flex items-center justify-center gap-2 text-muted-foreground">
                <Bug className="h-4 w-4" />
                Debug Info
                {debugOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/50 rounded-lg p-4 text-left text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                <div className="mb-2">
                  <span className="text-muted-foreground">Correlation ID:</span>{' '}
                  <span className="text-primary font-semibold">{debugInfo.correlationId}</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted-foreground">Timestamp:</span>{' '}
                  <span>{debugInfo.timestamp}</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted-foreground">Request:</span>
                  <pre className="mt-1 whitespace-pre-wrap break-all">
                    {JSON.stringify(debugInfo.request, null, 2)}
                  </pre>
                </div>
                <div>
                  <span className="text-muted-foreground">Response:</span>
                  <pre className="mt-1 whitespace-pre-wrap break-all">
                    {JSON.stringify(debugInfo.response, null, 2)}
                  </pre>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </Card>
    </div>
  );
}