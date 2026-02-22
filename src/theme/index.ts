import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper'

const colors = {
  navy: '#0f1b2d',
  navyLight: '#1a2d47',
  secondary: '#d69e2e',
  secondaryDark: '#b7841f',
  white: '#ffffff',
  error: '#ef4444',
  success: '#22c55e',
  textPrimary: '#1a1a2e',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
  card: '#ffffff',
}

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.navy,
    secondary: colors.secondary,
    error: colors.error,
    background: colors.background,
    surface: colors.card,
    onPrimary: colors.white,
    onSecondary: colors.white,
    outline: colors.border,
  },
  custom: colors,
}

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.navyLight,
    secondary: colors.secondary,
    error: colors.error,
    background: '#0a0a0a',
    surface: '#1a1a1a',
    onPrimary: colors.white,
    onSecondary: colors.white,
  },
  custom: colors,
}

export type AppTheme = typeof theme
