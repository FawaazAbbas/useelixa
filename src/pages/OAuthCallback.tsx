import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Helper to get scopes for credential storage
function getScopesForProvider(provider: string, bundleType?: string): string {
  if (provider === 'google') {
    const baseScopes = 'openid email profile';
    switch (bundleType) {
      case 'email_workspace':
        return `${baseScopes} https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive`;
      case 'ads_marketing':
        return `${baseScopes} https://www.googleapis.com/auth/adwords`;
      case 'analytics_reporting':
        return `${baseScopes} https://www.googleapis.com/auth/analytics.readonly`;
      case 'cloud_data':
        return `${baseScopes} https://www.googleapis.com/auth/bigquery`;
      case 'firebase_infra':
        return `${baseScopes} https://www.googleapis.com/auth/firebase`;
      case 'android_play':
        return `${baseScopes} https://www.googleapis.com/auth/androidpublisher`;
      default:
        return baseScopes;
    }
  }
  if (provider === 'slack') return 'channels:read,chat:write,users:read';
  if (provider === 'microsoft') return 'openid profile email offline_access https://graph.microsoft.com/.default';
  return '';
}

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    if (user) {
      handleCallback();
    }
  }, [searchParams, user]);

  const handleCallback = async () => {
    if (!user) {
      setStatus('error');
      setMessage('You must be logged in to connect integrations');
      return;
    }

    try {
      const code = searchParams.get('code');
      const stateParam = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        throw new Error(`OAuth error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`);
      }

      if (!code) {
        throw new Error('Missing authorization code');
      }

      // Decode state
      let state: { provider?: string; bundleType?: string; returnTo?: string } = {};
      if (stateParam) {
        try {
          state = JSON.parse(atob(decodeURIComponent(stateParam)));
        } catch (e) {
          console.warn('Failed to parse state:', e);
        }
      }

      const { provider, bundleType, returnTo } = state;

      if (!provider) {
        throw new Error('Missing provider in state');
      }

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
      
      console.log(`[OAuth] Exchanging code for ${credentialType}`, { bundleType, scopesForProvider });

      // Exchange code for token via edge function
      const { data, error: exchangeError } = await supabase.functions.invoke('exchange-oauth-token', {
        body: { 
          code, 
          credentialType, 
          userId: user.id,
          bundleType: bundleType || undefined,
          scopes: scopesForProvider,
        }
      });

      if (exchangeError) {
        throw exchangeError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setStatus('success');
      setMessage('Connection successful! Redirecting...');

      // Redirect back to connections page after 2 seconds
      setTimeout(() => {
        navigate(returnTo || '/connections');
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Authentication failed');
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
      </Card>
    </div>
  );
}
