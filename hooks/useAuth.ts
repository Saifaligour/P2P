
import { FETCH_USER_DETAILS, REGISTER_USER, RPC_LOG } from '@/constants/command.mjs';
import { rpcService } from '@/hooks/RPC';
import { formatLogs } from '@/utils/helpter';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    name: '',
    username: ''
  });

  const handleChange = (field: 'name' | 'username', value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user types
  };

  const login = async () => {
    // Simple validation
    if (!credentials.name.trim() || !credentials.username.trim()) {
      setError('Both fields are required');
      return false;
    }

    if (credentials.username.length < 4) {
      setError('Username must be at least 4 characters');
      return false;
    }

    setLoading(true);

    try {
      const res = await rpcService.send(REGISTER_USER, credentials).reply();
      if (res?.status) {
        router.replace('/home/UserScreen/groupList');
      }
      return true;
    } catch (error) {
      setError('Login failed');
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    rpcService.onRequest(RPC_LOG, (data: any) => formatLogs(data));

  }, [])
  return {
    credentials,
    loading,
    error,
    handleChange,
    login
  };
};

export const checkAuth = async (): Promise<boolean> => {
  const res = await rpcService.send(FETCH_USER_DETAILS, {}).reply();
  return res?.data?.name;
};

