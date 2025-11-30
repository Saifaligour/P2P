import { FETCH_USER_DETAILS, REGISTER_USER } from '@/constants/command.mjs';
import { rpcService } from '@/hooks/RPC';
import {
  setAuthDetails,
  setAuthError,
  setAuthField,
  setAuthLoading
} from '@/Redux/authReducer';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from "react-native";
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
        router.replace('/home/ChatListScreen/userList');
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

  const checkAuth = async () => {
    const res = await rpcService.send(FETCH_USER_DETAILS, {}).reply();
    if (res?.data) {
      dispatch(setAuthDetails(res.data));
      router.replace("/home/ChatListScreen/userList");
    }
    else {
      router.replace("/login");
    }
  };

  const register = () => {

  }
  const [form, setForm] = useState({ name: '', username: '', password: '' })

  const handleFormChange = (name, value) => {
    setForm((pre => ({ ...pre, [name]: value })))
  }
  // === SHIMMER + GLOW ANIMATION ===
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // LOOP: pulse glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

  }, []);

  // interpolated glow scale
  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });


  return {
    credentials,
    loading,
    error,
    handleChange,
    login,
    checkAuth,
    glowScale,
    register,
    form,
    handleFormChange
  };
};

