import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface UserCredential {
  id: string;
  credential_type: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  account_email: string | null;
  account_label: string | null;
  bundle_type: string | null;
  scopes: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectionStatus {
  type: string;
  connected: boolean;
  lastConnected?: string;
  expiresAt?: string;
  isExpired?: boolean;
  bundleType?: string;
  accountEmail?: string;
  accountLabel?: string;
  id?: string;
}

export function useConnections() {
  const [credentials, setCredentials] = useState<UserCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCredentials = useCallback(async () => {
    if (!user) {
      setCredentials([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load connections',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const getConnectionStatus = useCallback((credentialType: string, bundleType?: string): ConnectionStatus => {
    const credential = credentials.find(c => {
      if (bundleType) {
        return c.credential_type === credentialType && c.bundle_type === bundleType;
      }
      return c.credential_type === credentialType && !c.bundle_type;
    });

    if (!credential) {
      return { type: credentialType, connected: false };
    }

    const isExpired = credential.expires_at ? new Date(credential.expires_at) < new Date() : false;

    return {
      type: credentialType,
      connected: true,
      lastConnected: credential.updated_at,
      expiresAt: credential.expires_at || undefined,
      isExpired,
      bundleType: credential.bundle_type || undefined,
      accountEmail: credential.account_email || undefined,
      accountLabel: credential.account_label || undefined,
      id: credential.id,
    };
  }, [credentials]);

  const disconnect = useCallback(async (credentialId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_credentials')
        .delete()
        .eq('id', credentialId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCredentials(prev => prev.filter(c => c.id !== credentialId));
      
      toast({
        title: 'Disconnected',
        description: 'Connection removed successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to disconnect',
      });
      return false;
    }
  }, [user, toast]);

  return {
    credentials,
    loading,
    getConnectionStatus,
    disconnect,
    refetch: fetchCredentials,
  };
}
