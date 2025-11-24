import { SAVE_THEME } from '@/constants/command.mjs';
import { rpcService } from '@/hooks/RPC';
import { setTheme, setThemeMode } from '@/Redux/authReducer';
import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export function useThemeColor() {
  const { width } = useWindowDimensions();
  const s = useCallback((size) => Math.round(size + (width / 390 - 1) * size * 0.4), [width]);

  // Get theme and dark mode from Redux
  const { themes, mode, activeTheme } = useSelector((state: any) => state.auth || {});
  const dispatch = useDispatch();

  const nextTheme = async () => {
    const keys = Object.keys(themes);
    const current = keys.indexOf(activeTheme);
    const next = (current + 1) % keys.length;
    console.log('Switching theme from', activeTheme, 'to', keys[next]);
    await rpcService.send(SAVE_THEME, { activeTheme: keys[next] }).reply();
    dispatch(setTheme(keys[next]));
  };

  const setIsDark = async () => {
    const value = mode === 'dark' ? 'light' : 'dark';
    await rpcService.send(SAVE_THEME, { mode: value }).reply();
    dispatch(setThemeMode(value));
  };

  return {
    s,
    theme: themes[activeTheme][mode],
    nextTheme,
    setIsDark
  };
}