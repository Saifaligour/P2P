
import { REGISTER_USER } from '@/constants/command.mjs';
import { rpcService } from '@/hooks/RPC';
import { router } from 'expo-router';
import { useState } from 'react';

let isLoggedIn = false;

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
      const res = await rpcService.send(REGISTER_USER, credentials).reply()
      if (res.status) {
        router.navigate('/home/chat');
      }
      return true;
    } catch {
      setError('Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    credentials,
    loading,
    error,
    handleChange,
    login
  };
};

export const checkAuth = (): boolean => {
  return isLoggedIn;
};

