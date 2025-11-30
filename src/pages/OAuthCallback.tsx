import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    handleCallback();
  }, [searchParams]);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code || !state) {
        throw new Error('Missing OAuth parameters');
      }

      // Decode state to get user ID, credential type, and bundle type
      const { userId, credentialType, bundleType, returnTo } = JSON.parse(atob(state));

      setMessage('Exchanging authorization code for access token...');

      // Exchange code for token via edge function
      const { data, error: exchangeError } = await supabase.functions.invoke('exchange-oauth-token', {
        body: { 
          code, 
          credentialType, 
          userId,
          bundleType: bundleType || undefined,
          scopes: window.location.href.includes('scope=') 
            ? decodeURIComponent(new URL(window.location.href).searchParams.get('scope') || '')
            : undefined
        }
      });

      if (exchangeError) {
        throw exchangeError;
      }

      setStatus('success');
      setMessage('Authentication successful! Redirecting...');

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
            <h2 className="text-2xl font-semibold mb-2 text-destructive">Authentication Failed</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <Button onClick={() => navigate('/marketplace')}>
              Return to Marketplace
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
