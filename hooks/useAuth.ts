import { FETCH_USER_DETAILS, REGISTER_USER } from '@/constants/command.mjs';
import { rpcService } from '@/hooks/RPC';
import {
  setAuthDetails,
  setAuthError,
  setAuthField,
  setAuthLoading
} from '@/Redux/authReducer';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { credentials, loading, error } = useSelector((state: any) => state.auth);

  const handleChange = (field: 'name' | 'username', value: string) => {
    dispatch(setAuthField(field, value));
    dispatch(setAuthError(null)); // Clear error when user types
  };

  const login = async () => {
    // Simple validation
    if (!credentials.name.trim() || !credentials.username.trim()) {
      dispatch(setAuthError('Both fields are required'));
      return false;
    }

    if (credentials.username.length < 4) {
      dispatch(setAuthError('Username must be at least 4 characters'));
      return false;
    }

    dispatch(setAuthLoading(true));
    try {
      const res = await rpcService.send(REGISTER_USER, credentials).reply();
      if (res?.status) {
        router.replace('/home/UserScreen/groupList');
      }
      return true;
    } catch (error) {
      dispatch(setAuthError('Login failed'));
      console.error('Login error:', error);
      return false;
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    const res = await rpcService.send(FETCH_USER_DETAILS, {}).reply();
    if (res?.data) {
      dispatch(setAuthDetails(res.data));
      return !!res.data.name;
    }
    return false;
  };

  return {
    credentials,
    loading,
    error,
    handleChange,
    login,
    checkAuth
  };
};

