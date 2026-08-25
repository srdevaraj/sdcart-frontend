// src/theme/ThemeContext.js
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, radius, layout } from './spacing';
import { shadows } from './shadows';
import { springPresets, timingPresets } from './motion';

const THEME_PREFERENCE_KEY = '@sdcart_theme_mode';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light' | 'dark' | 'system'

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREFERENCE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeMode(saved);
      }
    }).catch(() => {});
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const setTheme = (mode) => {
    setThemeMode(mode);
    AsyncStorage.setItem(THEME_PREFERENCE_KEY, mode).catch(() => {});
  };

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  const value = useMemo(
    () => ({
      colors,
      isDark,
      themeMode,
      setTheme,
      toggleTheme,
      typography,
      spacing,
      radius,
      layout,
      shadows,
      motion: {
        spring: springPresets,
        timing: timingPresets,
      },
    }),
    [colors, isDark, themeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if accessed outside ThemeProvider
    return {
      colors: lightColors,
      isDark: false,
      themeMode: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
      typography,
      spacing,
      radius,
      layout,
      shadows,
      motion: {
        spring: springPresets,
        timing: timingPresets,
      },
    };
  }
  return context;
};
