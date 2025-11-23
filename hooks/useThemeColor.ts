import { setTheme, setThemeMode } from '@/Redux/themeReducer';
import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export function useThemeColor() {
  const { width } = useWindowDimensions();
  const s = useCallback((size) => Math.round(size + (width / 390 - 1) * size * 0.4), [width]);

  // Get theme and dark mode from Redux
  const { themes, mode, activeTheme, ...rest } = useSelector((state: any) => state.theme || {});
  const dispatch = useDispatch();

  const nextTheme = () => {
    const keys = Object.keys(themes);
    const current = keys.indexOf(activeTheme);
    const next = (current + 1) % keys.length;
    console.log('Switching theme from', activeTheme, 'to', keys[next]);

    dispatch(setTheme(keys[next]));
  };

  const setIsDark = () => {
    const value = mode === 'dark' ? 'light' : 'dark';
    dispatch(setThemeMode(value));
  };
  console.log('theme in useThemeColor:', activeTheme, mode, themes, rest);

  return {
    s,
    theme: themes[activeTheme][mode],
    nextTheme,
    setIsDark
  };
}