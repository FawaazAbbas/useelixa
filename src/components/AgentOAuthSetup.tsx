import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AgentOAuthSetupProps {
  agentId: string;
  installationId: string;
  requiredCredentials: string[];
  onCredentialsUpdated?: () => void;
}

const CREDENTIAL_LABELS: Record<string, string> = {
  notionApi: 'Notion',
  slackOAuth2Api: 'Slack',
  googleOAuth2Api: 'Google',
  httpBasicAuth: 'HTTP Basic Auth',
  httpHeaderAuth: 'HTTP Header Auth',
};

const CREDENTIAL_DESCRIPTIONS: Record<string, string> = {
  notionApi: 'Connect your Notion workspace to read and write databases',
  slackOAuth2Api: 'Send messages and interact with Slack channels',
  googleOAuth2Api: 'Access Gmail, Google Sheets, and other Google services',
  httpBasicAuth: 'Authenticate with external APIs',
  httpHeaderAuth: 'Authenticate with external APIs',
};

export function AgentOAuthSetup({ 
  agentId, 
  installationId, 
  requiredCredentials,
  onCredentialsUpdated 
}: AgentOAuthSetupProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedCredentials, setConnectedCredentials] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnectedCredentials();
  }, [installationId]);

  const fetchConnectedCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_configurations')
        .select('configuration')
        .eq('agent_installation_id', installationId)
        .maybeSingle();

      if (error) throw error;

      const config = data?.configuration as any;
      const credentials = config?.credentials || {};
      const connected = new Set<string>();
      
      Object.keys(credentials).forEach(credType => {
        if (credentials[credType]?.access_token) {
          connected.add(credType);
        }
      });

      setConnectedCredentials(connected);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (credentialType: string) => {
    setConnecting(credentialType);
    
    try {
      // For now, show a toast that OAuth setup is coming soon
      // In production, this would trigger the actual OAuth flow
      toast.info('OAuth Setup Coming Soon', {
        description: `The ${CREDENTIAL_LABELS[credentialType] || credentialType} OAuth flow will be available in the next update. For now, you can manually configure credentials in the agent settings.`
      });
      
      // TODO: Implement actual OAuth flow
      // const redirectUrl = `${window.location.origin}/oauth/callback`;
      // const state = btoa(JSON.stringify({ installationId, credentialType }));
      // const authUrl = getOAuthUrl(credentialType, redirectUrl, state);
      // window.location.href = authUrl;
      
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      toast.error('Failed to start connection');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (credentialType: string) => {
    try {
      const { data: currentConfig } = await supabase
        .from('agent_configurations')
        .select('configuration')
        .eq('agent_installation_id', installationId)
        .single();

      const config = currentConfig?.configuration as any;
      const credentials = { ...(config?.credentials || {}) };
      delete credentials[credentialType];

      await supabase
        .from('agent_configurations')
        .update({
          configuration: {
            ...(config || {}),
            credentials
          }
        })
        .eq('agent_installation_id', installationId);

      setConnectedCredentials(prev => {
        const next = new Set(prev);
        next.delete(credentialType);
        return next;
      });

      toast.success('Disconnected successfully');
      onCredentialsUpdated?.();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (requiredCredentials.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
          <p>This agent doesn't require any external service connections.</p>
        </div>
      </Card>
    );
  }

  const allConnected = requiredCredentials.every(cred => connectedCredentials.has(cred));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Service Connections</h3>
        <p className="text-sm text-muted-foreground">
          This agent needs access to the following services to function properly:
        </p>
        {allConnected && (
          <Badge className="mt-2" variant="default">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            All services connected
          </Badge>
        )}
        {!allConnected && (
          <Badge className="mt-2" variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Setup required
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {requiredCredentials.map(credType => {
          const isConnected = connectedCredentials.has(credType);
          const label = CREDENTIAL_LABELS[credType] || credType;
          const description = CREDENTIAL_DESCRIPTIONS[credType] || 'Connect to external service';

          return (
            <div
              key={credType}
              className="flex items-start justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{label}</span>
                  {isConnected && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              <div className="ml-4">
                {isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(credType)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(credType)}
                    disabled={connecting !== null}
                  >
                    {connecting === credType ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
