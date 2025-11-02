
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// PetProgress Color Palette - Bright-Trust (Dark) theme
export const colors = {
  // Light mode (keeping for compatibility, but app is primarily dark)
  light: {
    background: '#F8F7FC',
    card: '#FFFFFF',
    text: '#2D2D3A',
    textSecondary: '#6B6B7B',
    primary: '#60A5FA',
    primaryDark: '#3B82F6',
    secondary: '#22D3EE',
    accent: '#A78BFA',
    success: '#22C55E',
    warning: '#FBBF24',
    error: '#F87171',
    border: '#E5E5EA',
    shadow: 'rgba(96, 165, 250, 0.15)',
    reward: '#34D399',
  },
  // Dark mode - Bright-Trust (Dark) palette
  dark: {
    background: '#0B1220',
    card: '#121826',
    text: '#FFFFFF',
    textSecondary: '#A8B1C7',
    primary: '#60A5FA',
    primaryDark: '#3B82F6',
    secondary: '#22D3EE',
    accent: '#A78BFA',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    border: '#1F2937',
    shadow: 'rgba(0, 0, 0, 0.3)',
    reward: '#22C55E',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
